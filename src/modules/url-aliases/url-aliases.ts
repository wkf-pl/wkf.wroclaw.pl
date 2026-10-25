import { APIError, type CollectionBeforeValidateHook, type FieldHook, type Validate } from 'payload'

import { getRelationshipId } from '@/lib/relationships'
import { formatSlug, validatePageSlug } from '@/modules/content/slug'

export const urlAliasTargetCollections = [
  'pages',
  'posts',
  'events',
  'event-cycles',
  'partners',
  'categories',
  'tags',
  'documents',
] as const

export type UrlAliasTargetCollection = (typeof urlAliasTargetCollections)[number]
export type DocumentDestination = 'page' | 'primaryFile'

const versionedTargetCollections = new Set<UrlAliasTargetCollection>([
  'pages',
  'posts',
  'events',
  'event-cycles',
  'partners',
  'documents',
])

const reservedUrlAliasSlugs = new Set([
  'admin',
  'api',
  'assets',
  'blog',
  'category',
  'content',
  'dokumenty',
  'events',
  'members',
  'partners',
  'preview',
  'tag',
])

type UrlAliasTarget = {
  relationTo: UrlAliasTargetCollection
  value: unknown
}

type UrlAliasData = {
  documentDestination?: DocumentDestination | null
  target?: UrlAliasTarget | null
}

type ResolvedTargetDocument = {
  _status?: null | string
  id?: number | string
  primaryFile?: unknown
  slug?: null | string
}

export const normalizeUrlAliasSlug: FieldHook = ({ value }) =>
  typeof value === 'string' ? formatSlug(value) : value

export function validateUrlAliasSlugFormat(value: null | string | undefined): string | true {
  if (!value) return true

  if (reservedUrlAliasSlugs.has(value) || validatePageSlug(value) !== true) {
    return 'Ten adres jest zarezerwowany przez aplikację.'
  }

  return true
}

export const validateUrlAliasSlug: Validate<string> = async (value, { req }) => {
  const formatResult = validateUrlAliasSlugFormat(value)
  if (formatResult !== true || !value) return formatResult

  const pages = await req.payload.find({
    collection: 'pages',
    depth: 0,
    draft: true,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    req,
    where: { slug: { equals: value } },
  })

  return pages.docs.length === 0 ? true : 'Ten adres jest już używany przez stronę w serwisie.'
}

export const validatePageAliasCollision: CollectionBeforeValidateHook = async ({
  data,
  originalDoc,
  req,
}) => {
  if (!data) return data

  const slugSource = data.slug ?? originalDoc?.slug ?? data.title
  if (typeof slugSource !== 'string') return data
  const slug = formatSlug(slugSource)

  const aliases = await req.payload.find({
    collection: 'url-aliases',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    req,
    where: { slug: { equals: slug } },
  })

  if (aliases.docs.length > 0) {
    throw new APIError('Ten adres jest już używany przez alias adresu.', 400)
  }

  return data
}

export function targetCollectionRequiresPublishedStatus(
  collection: string,
): collection is UrlAliasTargetCollection {
  return versionedTargetCollections.has(collection as UrlAliasTargetCollection)
}

export function resolveUrlAliasTarget(alias: UrlAliasData): null | string {
  const target = alias.target
  if (!target || !urlAliasTargetCollections.includes(target.relationTo)) return null

  const document = getResolvedTargetDocument(target.value)
  if (!document?.slug) return null
  if (
    targetCollectionRequiresPublishedStatus(target.relationTo) &&
    document._status !== 'published'
  ) {
    return null
  }

  switch (target.relationTo) {
    case 'pages':
      return `/${document.slug}`
    case 'posts':
      return `/blog/${document.slug}`
    case 'events':
      return `/events/${document.slug}`
    case 'event-cycles':
      return `/events/series/${document.slug}`
    case 'partners':
      return `/partners/${document.slug}`
    case 'categories':
      return `/category/${document.slug}`
    case 'tags':
      return `/tag/${document.slug}`
    case 'documents': {
      if (alias.documentDestination !== 'primaryFile') {
        return `/dokumenty/${document.slug}`
      }

      const primaryFileId = getRelationshipId(document.primaryFile)
      return primaryFileId === undefined
        ? null
        : `/dokumenty/${document.slug}/plik/${primaryFileId}`
    }
  }
}

export function appendSearchParameters(
  destination: string,
  searchParameters: Record<string, string | string[] | undefined>,
): string {
  const url = new URL(destination, 'https://wkf.invalid')

  for (const [name, value] of Object.entries(searchParameters)) {
    if (Array.isArray(value)) {
      for (const item of value) url.searchParams.append(name, item)
    } else if (value !== undefined) {
      url.searchParams.append(name, value)
    }
  }

  return `${url.pathname}${url.search}${url.hash}`
}

function getResolvedTargetDocument(value: unknown): null | ResolvedTargetDocument {
  if (!value || typeof value !== 'object') return null
  return value as ResolvedTargetDocument
}
