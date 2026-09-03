import { APIError, type CollectionBeforeValidateHook } from 'payload'

import { getRelationshipId, type RelationshipReference } from '@/lib/relationships'
import { walkContentLeafBlocks } from '@/modules/content/walk-content-leaf-blocks'

type ManualMediaItem = {
  media?: RelationshipReference
}

type MediaBlock = {
  blockType?: unknown
  items?: unknown
  selectionMode?: unknown
}

function getContentLayouts(data: Record<string, unknown>): unknown[] {
  const layouts = [data.layout]
  const eventDefaults = data.eventDefaults

  if (eventDefaults && typeof eventDefaults === 'object' && !Array.isArray(eventDefaults)) {
    layouts.push((eventDefaults as Record<string, unknown>).layout)
  }

  return layouts
}

export const validateMediaBlocks: CollectionBeforeValidateHook = async ({ data, req }) => {
  if (!data) {
    return data
  }

  const galleryMediaByID = new Map<string, number | string>()

  for (const layout of getContentLayouts(data)) {
    for (const { block: candidate } of walkContentLeafBlocks(layout)) {
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
        .filter((id): id is number | string => id !== undefined)

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
        galleryMediaByID.set(String(mediaId), mediaId)
      }
    }
  }

  const galleryMediaIDs = [...galleryMediaByID.values()]
  if (galleryMediaIDs.length === 0) {
    return data
  }

  const mediaResult = await req.payload.find({
    collection: 'media',
    depth: 0,
    limit: galleryMediaIDs.length,
    overrideAccess: true,
    pagination: false,
    req,
    select: { id: true, mimeType: true },
    where: { id: { in: galleryMediaIDs } },
  })
  const mediaByID = new Map(mediaResult.docs.map((media) => [String(media.id), media]))

  for (const mediaId of galleryMediaIDs) {
    const media = mediaByID.get(String(mediaId))
    if (!media?.mimeType?.startsWith('image/')) {
      throw new APIError('Galeria mediów może zawierać wyłącznie obrazy.', 400)
    }
  }

  return data
}
