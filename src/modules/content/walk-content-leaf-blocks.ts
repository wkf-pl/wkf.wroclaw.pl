import type { ContentPresentationData } from './content-presentation'

type LayoutRecord = Record<string, unknown>
type ContainerLocation = 'layout' | 'columns' | 'sections' | 'tabs'

type ContentBlockReference = {
  block: LayoutRecord
  path: string
}

type ContentPresentationReference = {
  path: string
  presentation: ContentPresentationData
}

type LayoutEntry = ContentBlockReference & {
  leaf?: boolean
  presented?: boolean
}

const presentedLeafBlockTypes = new Set([
  'attachments',
  'contentCalendar',
  'documents',
  'listing',
  'mediaGallery',
  'richText',
])

function* walkRecords(value: unknown, path: string): Generator<ContentBlockReference> {
  if (!Array.isArray(value)) return

  const records: unknown[] = value
  for (const [index, block] of records.entries()) {
    if (!isLayoutRecord(block)) continue
    yield { block, path: `${path}.${index}` }
  }
}

function isLayoutRecord(value: unknown): value is LayoutRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function getContainer(
  blockType: unknown,
  location: ContainerLocation,
): Exclude<ContainerLocation, 'layout'> | undefined {
  if (blockType === 'columnLayout' && location !== 'columns') return 'columns'
  if (blockType === 'sectionGroup' && location === 'layout') return 'sections'
  if (blockType === 'tabs' && (location === 'layout' || location === 'sections')) return 'tabs'
}

function* walkBlocks(
  value: unknown,
  path: string,
  location: ContainerLocation,
): Generator<LayoutEntry> {
  for (const reference of walkRecords(value, path)) {
    const { block, path: blockPath } = reference
    const blockType = block.blockType
    const container = getContainer(blockType, location)

    if (container) {
      const presented = container !== 'tabs'
      if (presented) yield { ...reference, presented }

      for (const row of walkRecords(block[container], `${blockPath}.${container}`)) {
        if (presented) yield { ...row, presented }
        yield* walkBlocks(row.block.blocks, `${row.path}.blocks`, container)
      }
      continue
    }

    const isNestedContainer = blockType === 'columnLayout' || blockType === 'sectionGroup'
    yield {
      ...reference,
      leaf: !isNestedContainer && (blockType !== 'tabs' || location !== 'tabs'),
      presented:
        isNestedContainer ||
        (typeof blockType === 'string' && presentedLeafBlockTypes.has(blockType)),
    }
  }
}

export function* walkContentLeafBlocks(layout: unknown): Generator<ContentBlockReference> {
  for (const { block, path, leaf } of walkBlocks(layout, 'layout', 'layout')) {
    if (leaf) yield { block, path }
  }
}

export function* walkContentPresentations(
  layout: unknown,
): Generator<ContentPresentationReference> {
  for (const { block, path, presented } of walkBlocks(layout, 'layout', 'layout')) {
    if (presented) yield { path, presentation: block }
  }
}
