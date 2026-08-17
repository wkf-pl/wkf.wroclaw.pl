import { getPayload, type Where } from 'payload'

import config from '@payload-config'

import type { Media, User } from '@/payload-types'
import { websiteRequestContext } from '@/modules/membership/role-permissions'

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

export async function findPublicMedia(
  options: FindPublicMediaOptions,
  user: null | User = null,
): Promise<PublicMediaResult> {
  const requestedPage = Math.max(1, Math.floor(options.page))
  const pageSize = Math.min(100, Math.max(1, Math.floor(options.pageSize)))

  if (options.selectionMode === 'manual') {
    const media = await populateManualMedia(options.manualMedia ?? [], user)
    const eligibleMedia =
      options.kind === 'mediaGallery'
        ? media.filter((item) => item.mimeType?.startsWith('image/'))
        : media
    const totalDocs = eligibleMedia.length
    const totalPages = options.pagination ? Math.max(1, Math.ceil(totalDocs / pageSize)) : 1
    const offset = options.pagination ? (requestedPage - 1) * pageSize : 0

    return {
      items: eligibleMedia.slice(offset, offset + pageSize).map(mapMedia),
      page: requestedPage,
      pageSize,
      totalDocs,
      totalPages,
    }
  }

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'media',
    context: websiteRequestContext,
    depth: 0,
    limit: pageSize,
    overrideAccess: false,
    page: options.pagination ? requestedPage : 1,
    sort: getPayloadSort(options.sort),
    user,
    where: createMediaWhere(options),
  })

  return {
    items: result.docs.map(mapMedia),
    page: requestedPage,
    pageSize,
    totalDocs: result.totalDocs,
    totalPages: options.pagination ? Math.max(1, result.totalPages) : 1,
  }
}

async function populateManualMedia(
  values: (Media | number)[],
  user: null | User,
): Promise<Media[]> {
  const payload = await getPayload({ config })

  return (
    await Promise.all(
      values.map(async (value) => {
        if (typeof value === 'object') {
          return value
        }

        try {
          return await payload.findByID({
            collection: 'media',
            context: websiteRequestContext,
            depth: 0,
            id: value,
            overrideAccess: false,
            user,
          })
        } catch {
          return null
        }
      }),
    )
  ).filter((value): value is Media => value !== null)
}

function createMediaWhere(options: FindPublicMediaOptions): Where {
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

function mapMedia(media: Media): PublicMediaListItem {
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
