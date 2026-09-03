export type ContentLeafBlockReference = {
  block: Record<string, unknown>
  path: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
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
    if (candidate.blockType !== 'columnLayout') {
      yield { block: candidate, path: blockPath }
      continue
    }

    if (!Array.isArray(candidate.columns)) {
      continue
    }

    for (const [columnIndex, columnCandidate] of candidate.columns.entries()) {
      if (!isRecord(columnCandidate) || !Array.isArray(columnCandidate.blocks)) {
        continue
      }

      for (const [nestedBlockIndex, nestedCandidate] of columnCandidate.blocks.entries()) {
        if (!isRecord(nestedCandidate) || nestedCandidate.blockType === 'columnLayout') {
          continue
        }

        yield {
          block: nestedCandidate,
          path: `${blockPath}.columns.${columnIndex}.blocks.${nestedBlockIndex}`,
        }
      }
    }
  }
}
