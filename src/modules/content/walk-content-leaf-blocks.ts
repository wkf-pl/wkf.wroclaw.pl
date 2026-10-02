import type { ContentSurfaceData } from './content-surface'

export type ContentLeafBlockReference = {
  block: Record<string, unknown>
  path: string
}

export type ContentSurfaceReference = {
  path: string
  surface: ContentSurfaceData
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
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
    } else {
      yield { block: candidate, path: blockPath }
    }
  }
}

function* walkColumnSurfaces(
  candidate: Record<string, unknown>,
  path: string,
): Generator<ContentSurfaceReference> {
  if (!Array.isArray(candidate.columns)) {
    return
  }

  for (const [columnIndex, columnCandidate] of candidate.columns.entries()) {
    if (!isRecord(columnCandidate)) {
      continue
    }

    yield {
      path: `${path}.columns.${columnIndex}`,
      surface: columnCandidate,
    }
  }
}

export function* walkContentSurfaces(layout: unknown): Generator<ContentSurfaceReference> {
  if (!Array.isArray(layout)) {
    return
  }

  for (const [blockIndex, candidate] of layout.entries()) {
    if (!isRecord(candidate)) {
      continue
    }

    const blockPath = `layout.${blockIndex}`
    if (candidate.blockType === 'columnLayout') {
      yield* walkColumnSurfaces(candidate, blockPath)
      continue
    }

    if (candidate.blockType !== 'sectionGroup' || !Array.isArray(candidate.sections)) {
      continue
    }

    for (const [sectionIndex, sectionCandidate] of candidate.sections.entries()) {
      if (!isRecord(sectionCandidate)) {
        continue
      }

      const sectionPath = `${blockPath}.sections.${sectionIndex}`
      yield { path: sectionPath, surface: sectionCandidate }

      if (!Array.isArray(sectionCandidate.blocks)) {
        continue
      }

      for (const [nestedBlockIndex, nestedCandidate] of sectionCandidate.blocks.entries()) {
        if (isRecord(nestedCandidate) && nestedCandidate.blockType === 'columnLayout') {
          yield* walkColumnSurfaces(nestedCandidate, `${sectionPath}.blocks.${nestedBlockIndex}`)
        }
      }
    }
  }
}
