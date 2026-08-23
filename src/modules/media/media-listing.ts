import { getPayload, type Where } from 'payload'

import config from '@payload-config'

import type { Media } from '@/payload-types'
import { cachePublicData, publicCacheTags } from '@/modules/cache/public-data-cache'
import { publicRequestContext } from '@/modules/content/public-access'

export type MediaListingKind = 'attachments' | 'mediaGallery'
export type MediaListingSort = 'nameAscending' | 'nameDescending' | 'newest' | 'oldest'
export type MediaListingView = 'cards' | 'grid' | 'list'

export type PublicMediaListItem = {
  alt: string
  createdAt: string
  description: null | string
  filename: string
  filesize: null | number
  height: null | number
  id: number
  isImage: boolean
  mimeType: null | string
  url: null | string
  width: null | number
}

export type FindPublicMediaOptions = {
  categoryId?: number
  kind: MediaListingKind
  manualMedia?: (Media | number)[]
  page: number
  pageSize: number
  pagination: boolean
  selectionMode: 'filters' | 'manual'
  sort: MediaListingSort
  tagId?: number
}

export type PublicMediaResult = {
  items: PublicMediaListItem[]
  page: number
  pageSize: number
  totalDocs: number
  totalPages: number
}

type MediaListDocument = Pick<
  Media,
  | 'alt'
  | 'createdAt'
  | 'description'
  | 'filename'
  | 'filesize'
  | 'height'
  | 'id'
  | 'mimeType'
  | 'url'
  | 'width'
>

export type NormalizedPublicMediaOptions = Omit<FindPublicMediaOptions, 'manualMedia'>

const mediaSelect = {
  alt: true,
  createdAt: true,
  description: true,
  filename: true,
  filesize: true,
  height: true,
  id: true,
  mimeType: true,
  url: true,
  width: true,
} as const

const findFilteredPublicMediaCached = cachePublicData(
  'filtered-public-media',
  async (options: NormalizedPublicMediaOptions): Promise<PublicMediaResult> => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'media',
      context: publicRequestContext,
      depth: 0,
      limit: options.pageSize,
      overrideAccess: false,
      page: options.pagination ? options.page : 1,
      select: mediaSelect,
      sort: getPayloadSort(options.sort),
      user: null,
      where: createMediaWhere(options),
    })

    return {
      items: result.docs.map(mapMedia),
      page: options.page,
      pageSize: options.pageSize,
      totalDocs: result.totalDocs,
      totalPages: options.pagination ? Math.max(1, result.totalPages) : 1,
    }
  },
  { revalidate: 300, tags: [publicCacheTags.media] },
)

const findManualPublicMediaByIDsCached = cachePublicData(
  'manual-public-media-by-ids',
  async (
    options: NormalizedPublicMediaOptions,
    mediaIDs: number[],
  ): Promise<PublicMediaResult> => {
    let media: MediaListDocument[] = []
    if (mediaIDs.length > 0) {
      const payload = await getPayload({ config })
      const result = await payload.find({
        collection: 'media',
        context: publicRequestContext,
        depth: 0,
        limit: mediaIDs.length,
        overrideAccess: false,
        pagination: false,
        select: mediaSelect,
        user: null,
        where: { id: { in: [...new Set(mediaIDs)] } },
      })
      const mediaByID = new Map(result.docs.map((item) => [item.id, item]))
      media = mediaIDs.flatMap((mediaID) => {
        const item = mediaByID.get(mediaID)
        return item ? [item] : []
      })
    }

    const eligibleMedia =
      options.kind === 'mediaGallery'
        ? media.filter((item) => item.mimeType?.startsWith('image/'))
        : media
    const totalDocs = eligibleMedia.length
    const totalPages = options.pagination
      ? Math.max(1, Math.ceil(totalDocs / options.pageSize))
      : 1
    const offset = options.pagination ? (options.page - 1) * options.pageSize : 0

    return {
      items: eligibleMedia.slice(offset, offset + options.pageSize).map(mapMedia),
      page: options.page,
      pageSize: options.pageSize,
      totalDocs,
      totalPages,
    }
  },
  { revalidate: 300, tags: [publicCacheTags.media] },
)

export async function findPublicMedia(options: FindPublicMediaOptions): Promise<PublicMediaResult> {
  const normalizedOptions = normalizePublicMediaOptions(options)

  if (options.selectionMode === 'manual') {
    const mediaIDs = (options.manualMedia ?? []).map((media) =>
      typeof media === 'number' ? media : media.id,
    )
    return findManualPublicMediaByIDsCached(normalizedOptions, mediaIDs)
  }

  return findFilteredPublicMediaCached(normalizedOptions)
}

export function normalizePublicMediaOptions(
  options: FindPublicMediaOptions,
): NormalizedPublicMediaOptions {
  return {
    categoryId: options.categoryId,
    kind: options.kind,
    page: Math.max(1, Math.floor(options.page)),
    pageSize: Math.min(100, Math.max(1, Math.floor(options.pageSize))),
    pagination: options.pagination,
    selectionMode: options.selectionMode,
    sort: options.sort,
    tagId: options.tagId,
  }
}

function createMediaWhere(
  options: Pick<FindPublicMediaOptions, 'categoryId' | 'kind' | 'tagId'>,
): Where {
  const conditions: Where[] = []

  if (options.categoryId !== undefined) {
    conditions.push({ categories: { equals: options.categoryId } })
  }

  if (options.tagId !== undefined) {
    conditions.push({ tags: { equals: options.tagId } })
  }

  if (options.kind === 'mediaGallery') {
    conditions.push({ mimeType: { like: 'image/%' } })
  }

  return conditions.length ? { and: conditions } : {}
}

function getPayloadSort(sort: MediaListingSort): string[] {
  switch (sort) {
    case 'oldest':
      return ['createdAt', 'filename', 'id']
    case 'nameAscending':
      return ['filename', '-createdAt', 'id']
    case 'nameDescending':
      return ['-filename', '-createdAt', 'id']
    default:
      return ['-createdAt', 'filename', 'id']
  }
}

function mapMedia(media: MediaListDocument): PublicMediaListItem {
  return {
    alt: media.alt,
    createdAt: media.createdAt,
    description: media.description?.trim() || null,
    filename: media.filename || media.alt,
    filesize: media.filesize ?? null,
    height: media.height ?? null,
    id: media.id,
    isImage: Boolean(media.mimeType?.startsWith('image/')),
    mimeType: media.mimeType ?? null,
    url: media.url ?? null,
    width: media.width ?? null,
  }
}
