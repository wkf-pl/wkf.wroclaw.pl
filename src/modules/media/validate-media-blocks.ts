import { APIError, type CollectionBeforeValidateHook } from 'payload'

type RelationshipValue = number | string | { id: number | string } | null | undefined

type ManualMediaItem = {
  media?: RelationshipValue
}

type MediaBlock = {
  blockType?: unknown
  items?: unknown
  selectionMode?: unknown
}

function getRelationshipId(value: RelationshipValue): number | string | null {
  if (typeof value === 'number' || typeof value === 'string') {
    return value
  }

  return value && typeof value === 'object' ? value.id : null
}

export const validateMediaBlocks: CollectionBeforeValidateHook = async ({ data, req }) => {
  if (!data || !Array.isArray(data.layout)) {
    return data
  }

  for (const candidate of data.layout) {
    if (!candidate || typeof candidate !== 'object') {
      continue
    }

    const block = candidate as MediaBlock
    if (
      (block.blockType !== 'mediaGallery' && block.blockType !== 'attachments') ||
      block.selectionMode !== 'manual'
    ) {
      continue
    }

    if (!Array.isArray(block.items) || block.items.length === 0) {
      throw new APIError('Ręczny wybór mediów wymaga co najmniej jednego pliku.', 400)
    }

    const mediaIds = block.items
      .map((item) =>
        item && typeof item === 'object'
          ? getRelationshipId((item as ManualMediaItem).media)
          : null,
      )
      .filter((id): id is number | string => id !== null)

    if (mediaIds.length !== block.items.length) {
      throw new APIError('Każdy ręcznie dodany element musi wskazywać plik.', 400)
    }

    if (new Set(mediaIds.map(String)).size !== mediaIds.length) {
      throw new APIError('Każdy plik może zostać wybrany tylko raz w bloku.', 400)
    }

    if (block.blockType !== 'mediaGallery') {
      continue
    }

    for (const mediaId of mediaIds) {
      const media = await req.payload.findByID({
        collection: 'media',
        depth: 0,
        id: mediaId,
        overrideAccess: true,
        req,
      })

      if (!media.mimeType?.startsWith('image/')) {
        throw new APIError('Galeria mediów może zawierać wyłącznie obrazy.', 400)
      }
    }
  }

  return data
}
