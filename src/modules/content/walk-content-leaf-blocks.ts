import type { ContentPresentationData } from './content-presentation'

export type ContentLeafBlockReference = {
  block: Record<string, unknown>
  path: string
}

export type ContentPresentationReference = {
  path: string
  presentation: ContentPresentationData
}

const presentedLeafBlockTypes = new Set([
  'attachments',
  'contentCalendar',
  'documents',
  'listing',
  'mediaGallery',
  'memberProfiles',
  'richText',
])

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function isPresentedBlock(candidate: Record<string, unknown>): boolean {
  return (
    candidate.blockType === 'columnLayout' ||
    candidate.blockType === 'sectionGroup' ||
    (typeof candidate.blockType === 'string' && presentedLeafBlockTypes.has(candidate.blockType))
  )
}

function createPresentationReference(
  presentation: Record<string, unknown>,
  path: string,
): ContentPresentationReference {
  return {
    path,
    presentation,
  }
}

function* walkColumnLeafBlocks(
  candidate: Record<string, unknown>,
  path: string,
): Generator<ContentLeafBlockReference> {
  if (!Array.isArray(candidate.columns)) {
    return
  }

  for (const [columnIndex, columnCandidate] of candidate.columns.entries()) {
    if (!isRecord(columnCandidate) || !Array.isArray(columnCandidate.blocks)) {
      continue
    }

    for (const [blockIndex, nestedCandidate] of columnCandidate.blocks.entries()) {
      if (
        !isRecord(nestedCandidate) ||
        nestedCandidate.blockType === 'columnLayout' ||
        nestedCandidate.blockType === 'sectionGroup'
      ) {
        continue
      }

      yield {
        block: nestedCandidate,
        path: `${path}.columns.${columnIndex}.blocks.${blockIndex}`,
      }
    }
  }
}

function* walkSectionGroupLeafBlocks(
  candidate: Record<string, unknown>,
  path: string,
): Generator<ContentLeafBlockReference> {
  if (!Array.isArray(candidate.sections)) {
    return
  }

  for (const [sectionIndex, sectionCandidate] of candidate.sections.entries()) {
    if (!isRecord(sectionCandidate) || !Array.isArray(sectionCandidate.blocks)) {
      continue
    }

    const sectionPath = `${path}.sections.${sectionIndex}`
    for (const [blockIndex, nestedCandidate] of sectionCandidate.blocks.entries()) {
      if (!isRecord(nestedCandidate)) {
        continue
      }

      const nestedPath = `${sectionPath}.blocks.${blockIndex}`
      if (nestedCandidate.blockType === 'columnLayout') {
        yield* walkColumnLeafBlocks(nestedCandidate, nestedPath)
      } else if (nestedCandidate.blockType !== 'sectionGroup') {
        yield { block: nestedCandidate, path: nestedPath }
      }
    }
  }
}

function* walkTabbedContentLeafBlocks(
  candidate: Record<string, unknown>,
  path: string,
): Generator<ContentLeafBlockReference> {
  if (!Array.isArray(candidate.tabs)) {
    return
  }

  for (const [tabIndex, tabCandidate] of candidate.tabs.entries()) {
    if (!isRecord(tabCandidate) || !Array.isArray(tabCandidate.blocks)) {
      continue
    }

    const tabPath = `${path}.tabs.${tabIndex}`
    for (const [blockIndex, nestedCandidate] of tabCandidate.blocks.entries()) {
      if (!isRecord(nestedCandidate)) {
        continue
      }

      const nestedPath = `${tabPath}.blocks.${blockIndex}`
      if (nestedCandidate.blockType === 'columnLayout') {
        yield* walkColumnLeafBlocks(nestedCandidate, nestedPath)
      } else if (
        nestedCandidate.blockType !== 'sectionGroup' &&
        nestedCandidate.blockType !== 'tabs'
      ) {
        yield { block: nestedCandidate, path: nestedPath }
      }
    }
  }
}

export function* walkContentLeafBlocks(layout: unknown): Generator<ContentLeafBlockReference> {
  if (!Array.isArray(layout)) {
    return
  }

  for (const [blockIndex, candidate] of layout.entries()) {
    if (!isRecord(candidate)) {
      continue
    }

    const blockPath = `layout.${blockIndex}`
    if (candidate.blockType === 'columnLayout') {
      yield* walkColumnLeafBlocks(candidate, blockPath)
    } else if (candidate.blockType === 'sectionGroup') {
      yield* walkSectionGroupLeafBlocks(candidate, blockPath)
    } else if (candidate.blockType === 'tabs') {
      yield* walkTabbedContentLeafBlocks(candidate, blockPath)
    } else {
      yield { block: candidate, path: blockPath }
    }
  }
}

function* walkTabbedContentPresentations(
  candidate: Record<string, unknown>,
  path: string,
): Generator<ContentPresentationReference> {
  if (!Array.isArray(candidate.tabs)) {
    return
  }

  for (const [tabIndex, tabCandidate] of candidate.tabs.entries()) {
    if (!isRecord(tabCandidate) || !Array.isArray(tabCandidate.blocks)) {
      continue
    }

    const tabPath = `${path}.tabs.${tabIndex}`
    for (const [blockIndex, nestedCandidate] of tabCandidate.blocks.entries()) {
      if (!isRecord(nestedCandidate)) {
        continue
      }

      const nestedPath = `${tabPath}.blocks.${blockIndex}`
      if (nestedCandidate.blockType === 'columnLayout') {
        yield* walkColumnPresentations(nestedCandidate, nestedPath)
      } else if (isPresentedBlock(nestedCandidate)) {
        yield createPresentationReference(nestedCandidate, nestedPath)
      }
    }
  }
}

function* walkColumnPresentations(
  candidate: Record<string, unknown>,
  path: string,
): Generator<ContentPresentationReference> {
  yield createPresentationReference(candidate, path)

  if (!Array.isArray(candidate.columns)) {
    return
  }

  for (const [columnIndex, columnCandidate] of candidate.columns.entries()) {
    if (!isRecord(columnCandidate)) {
      continue
    }

    const columnPath = `${path}.columns.${columnIndex}`
    yield createPresentationReference(columnCandidate, columnPath)

    if (!Array.isArray(columnCandidate.blocks)) {
      continue
    }

    for (const [blockIndex, nestedCandidate] of columnCandidate.blocks.entries()) {
      if (isRecord(nestedCandidate) && isPresentedBlock(nestedCandidate)) {
        yield createPresentationReference(nestedCandidate, `${columnPath}.blocks.${blockIndex}`)
      }
    }
  }
}

function* walkSectionGroupPresentations(
  candidate: Record<string, unknown>,
  path: string,
): Generator<ContentPresentationReference> {
  yield createPresentationReference(candidate, path)

  if (!Array.isArray(candidate.sections)) {
    return
  }

  for (const [sectionIndex, sectionCandidate] of candidate.sections.entries()) {
    if (!isRecord(sectionCandidate)) {
      continue
    }

    const sectionPath = `${path}.sections.${sectionIndex}`
    yield createPresentationReference(sectionCandidate, sectionPath)

    if (!Array.isArray(sectionCandidate.blocks)) {
      continue
    }

    for (const [blockIndex, nestedCandidate] of sectionCandidate.blocks.entries()) {
      if (!isRecord(nestedCandidate)) {
        continue
      }

      const nestedPath = `${sectionPath}.blocks.${blockIndex}`
      if (nestedCandidate.blockType === 'columnLayout') {
        yield* walkColumnPresentations(nestedCandidate, nestedPath)
      } else if (isPresentedBlock(nestedCandidate)) {
        yield createPresentationReference(nestedCandidate, nestedPath)
      }
    }
  }
}

export function* walkContentPresentations(
  layout: unknown,
): Generator<ContentPresentationReference> {
  if (!Array.isArray(layout)) {
    return
  }

  for (const [blockIndex, candidate] of layout.entries()) {
    if (!isRecord(candidate)) {
      continue
    }

    const blockPath = `layout.${blockIndex}`
    if (candidate.blockType === 'columnLayout') {
      yield* walkColumnPresentations(candidate, blockPath)
    } else if (candidate.blockType === 'sectionGroup') {
      yield* walkSectionGroupPresentations(candidate, blockPath)
    } else if (candidate.blockType === 'tabs') {
      yield* walkTabbedContentPresentations(candidate, blockPath)
    } else if (isPresentedBlock(candidate)) {
      yield createPresentationReference(candidate, blockPath)
    }
  }
}
