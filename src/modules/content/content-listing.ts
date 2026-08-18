import { getPayload, type Where } from 'payload'

import config from '@payload-config'

import type { Category, Event, EventCycle, Media, Page, Post, Tag, User } from '@/payload-types'
import { websiteRequestContext } from '@/modules/membership/role-permissions'

export const taxonomizableCollectionSlugs = ['pages', 'posts', 'events', 'event-cycles'] as const

export type TaxonomizableCollectionSlug = (typeof taxonomizableCollectionSlugs)[number]
export type TaxonomizableDocument = Event | EventCycle | Page | Post
export type ContentListingSort =
  'eventDateAscending' | 'newest' | 'oldest' | 'titleAscending' | 'titleDescending'

export type PublicContentListItem = {
  categories: Category[]
  date: null | string
  excerpt: null | string
  id: number
  image: Media | null
  kind: TaxonomizableCollectionSlug
  tags: Tag[]
  title: string
  url: string
}

export type TaxonomizableCollectionAdapter<TDocument extends TaxonomizableDocument> = {
  buildPublicURL: (document: TDocument) => string
  collection: TaxonomizableCollectionSlug
  fields: {
    date: keyof TDocument
    excerpt: keyof TDocument
    image: keyof TDocument
    title: keyof TDocument
  }
  mapDocument: (document: TDocument) => PublicContentListItem
}

type TaxonomizableCollectionRegistry = {
  'event-cycles': TaxonomizableCollectionAdapter<EventCycle>
  events: TaxonomizableCollectionAdapter<Event>
  pages: TaxonomizableCollectionAdapter<Page>
  posts: TaxonomizableCollectionAdapter<Post>
}

function buildPagePublicURL(page: Page): string {
  return `/${page.slug}`
}

function buildPostPublicURL(post: Post): string {
  return `/blog/${post.slug}`
}

const pageAdapter = {
  buildPublicURL: buildPagePublicURL,
  collection: 'pages',
  fields: {
    date: 'publishedAt',
    excerpt: 'listingExcerpt',
    image: 'heroImage',
    title: 'title',
  },
  mapDocument: (page: Page): PublicContentListItem => ({
    categories: getPopulatedRelationships(page.categories),
    date: page.publishedAt ?? page.createdAt,
    excerpt: page.listingExcerpt?.trim() || extractPageExcerpt(page),
    id: page.id,
    image: getMedia(page.heroImage),
    kind: 'pages',
    tags: getPopulatedRelationships(page.tags),
    title: page.title,
    url: buildPagePublicURL(page),
  }),
} satisfies TaxonomizableCollectionAdapter<Page>

const postAdapter = {
  buildPublicURL: buildPostPublicURL,
  collection: 'posts',
  fields: {
    date: 'publishedAt',
    excerpt: 'excerpt',
    image: 'heroImage',
    title: 'title',
  },
  mapDocument: (post: Post): PublicContentListItem => ({
    categories: getPopulatedRelationships(post.categories),
    date: post.publishedAt ?? post.createdAt,
    excerpt: post.excerpt,
    id: post.id,
    image: getMedia(post.heroImage),
    kind: 'posts',
    tags: getPopulatedRelationships(post.tags),
    title: post.title,
    url: buildPostPublicURL(post),
  }),
} satisfies TaxonomizableCollectionAdapter<Post>

const eventAdapter = {
  buildPublicURL: (event: Event) => `/events/${event.slug}`,
  collection: 'events',
  fields: { date: 'startAt', excerpt: 'excerpt', image: 'heroImage', title: 'title' },
  mapDocument: (event: Event): PublicContentListItem => ({
    categories: getPopulatedRelationships(event.categories),
    date: event.startAt,
    excerpt: event.excerpt,
    id: event.id,
    image: getMedia(event.heroImage),
    kind: 'events',
    tags: getPopulatedRelationships(event.tags),
    title: event.title,
    url: `/events/${event.slug}`,
  }),
} satisfies TaxonomizableCollectionAdapter<Event>

const eventCycleAdapter = {
  buildPublicURL: (cycle: EventCycle) => `/events/series/${cycle.slug}`,
  collection: 'event-cycles',
  fields: { date: 'publishedAt', excerpt: 'excerpt', image: 'heroImage', title: 'title' },
  mapDocument: (cycle: EventCycle): PublicContentListItem => ({
    categories: getPopulatedRelationships(cycle.categories),
    date: cycle.publishedAt ?? cycle.createdAt,
    excerpt: cycle.excerpt,
    id: cycle.id,
    image: getMedia(cycle.heroImage),
    kind: 'event-cycles',
    tags: getPopulatedRelationships(cycle.tags),
    title: cycle.title,
    url: `/events/series/${cycle.slug}`,
  }),
} satisfies TaxonomizableCollectionAdapter<EventCycle>

export const taxonomizableCollections = {
  'event-cycles': eventCycleAdapter,
  events: eventAdapter,
  pages: pageAdapter,
  posts: postAdapter,
} satisfies TaxonomizableCollectionRegistry

export type FindPublicContentOptions = {
  categoryId?: number
  eventCycleId?: number
  eventTimeFilter?: 'all' | 'past' | 'upcoming'
  page: number
  pageSize: number
  pagination: boolean
  parentId?: number
  sort: ContentListingSort
  sources: TaxonomizableCollectionSlug[]
  tagId?: number
}

export type PublicContentResult = {
  items: PublicContentListItem[]
  page: number
  pageSize: number
  totalDocs: number
  totalPages: number
}

export async function findPublicContent(
  options: FindPublicContentOptions,
  user: null | User = null,
): Promise<PublicContentResult> {
  const payload = await getPayload({ config })
  const requestedPage = Math.max(1, Math.floor(options.page))
  const pageSize = Math.min(100, Math.max(1, Math.floor(options.pageSize)))
  const fetchLimit = options.pagination ? requestedPage * pageSize : pageSize
  const where = createListingWhere(options)
  const payloadSort = getPayloadSort(options.sort)

  const results = await Promise.all(
    options.sources.map(async (source) => {
      if (source === 'pages') {
        const result = await payload.find({
          collection: 'pages',
          context: websiteRequestContext,
          depth: 2,
          draft: false,
          limit: fetchLimit,
          overrideAccess: false,
          page: 1,
          sort: payloadSort,
          user,
          where,
        })

        return {
          items: result.docs.map(pageAdapter.mapDocument),
          totalDocs: result.totalDocs,
        }
      }

      if (source === 'events') {
        const result = await payload.find({
          collection: 'events',
          context: websiteRequestContext,
          depth: 2,
          draft: false,
          limit: fetchLimit,
          overrideAccess: false,
          page: 1,
          sort: options.sort === 'eventDateAscending' ? ['startAt', 'title'] : payloadSort,
          user,
          where: createEventListingWhere(options),
        })
        return { items: result.docs.map(eventAdapter.mapDocument), totalDocs: result.totalDocs }
      }

      if (source === 'event-cycles') {
        const result = await payload.find({
          collection: 'event-cycles',
          context: websiteRequestContext,
          depth: 2,
          draft: false,
          limit: fetchLimit,
          overrideAccess: false,
          page: 1,
          sort: payloadSort,
          user,
          where,
        })
        return {
          items: result.docs.map(eventCycleAdapter.mapDocument),
          totalDocs: result.totalDocs,
        }
      }

      const result = await payload.find({
        collection: 'posts',
        context: websiteRequestContext,
        depth: 2,
        draft: false,
        limit: fetchLimit,
        overrideAccess: false,
        page: 1,
        sort: payloadSort,
        user,
        where,
      })

      return {
        items: result.docs.map(postAdapter.mapDocument),
        totalDocs: result.totalDocs,
      }
    }),
  )

  const totalDocs = results.reduce((sum, result) => sum + result.totalDocs, 0)
  const totalPages = options.pagination ? Math.max(1, Math.ceil(totalDocs / pageSize)) : 1
  const sortedItems = results
    .flatMap((result) => result.items)
    .sort(createContentComparator(options.sort))
  const offset = options.pagination ? (requestedPage - 1) * pageSize : 0

  return {
    items: sortedItems.slice(offset, offset + pageSize),
    page: requestedPage,
    pageSize,
    totalDocs,
    totalPages,
  }
}

function createListingWhere(options: FindPublicContentOptions): Where {
  const conditions: Where[] = [{ _status: { equals: 'published' } }]

  if (options.categoryId !== undefined) {
    conditions.push({ categories: { equals: options.categoryId } })
  }

  if (options.tagId !== undefined) {
    conditions.push({ tags: { equals: options.tagId } })
  }

  if (options.parentId !== undefined) {
    conditions.push({ parent: { equals: options.parentId } })
  }

  return { and: conditions }
}

function createEventListingWhere(options: FindPublicContentOptions): Where {
  const base = createListingWhere({ ...options, parentId: undefined })
  const conditions = 'and' in base && Array.isArray(base.and) ? [...base.and] : [base]
  if (options.eventCycleId !== undefined)
    conditions.push({ cycle: { equals: options.eventCycleId } })
  if (options.eventTimeFilter === 'upcoming') {
    conditions.push({
      or: [
        { endAt: { greater_than_equal: new Date().toISOString() } },
        { startAt: { greater_than_equal: new Date().toISOString() } },
      ],
    })
  } else if (options.eventTimeFilter === 'past') {
    conditions.push({ startAt: { less_than: new Date().toISOString() } })
  }
  return { and: conditions }
}

function getPayloadSort(sort: ContentListingSort): string[] {
  switch (sort) {
    case 'oldest':
      return ['publishedAt', 'title', 'id']
    case 'titleAscending':
      return ['title', '-publishedAt', 'id']
    case 'titleDescending':
      return ['-title', '-publishedAt', 'id']
    case 'eventDateAscending':
      return ['publishedAt', 'title', 'id']
    default:
      return ['-publishedAt', 'title', 'id']
  }
}

export function createContentComparator(
  sort: ContentListingSort,
): (first: PublicContentListItem, second: PublicContentListItem) => number {
  return (first, second) => {
    const titleComparison = first.title.localeCompare(second.title, 'pl')
    const dateComparison = compareDates(first.date, second.date)
    let primaryComparison: number

    switch (sort) {
      case 'oldest':
        primaryComparison = dateComparison
        break
      case 'titleAscending':
        primaryComparison = titleComparison
        break
      case 'titleDescending':
        primaryComparison = -titleComparison
        break
      case 'eventDateAscending':
        primaryComparison = dateComparison
        break
      default:
        primaryComparison = -dateComparison
    }

    if (primaryComparison !== 0) {
      return primaryComparison
    }

    if ((sort === 'titleAscending' || sort === 'titleDescending') && dateComparison !== 0) {
      return -dateComparison
    }

    if (titleComparison !== 0) {
      return titleComparison
    }

    const kindComparison = first.kind.localeCompare(second.kind, 'en')
    return kindComparison !== 0 ? kindComparison : first.id - second.id
  }
}

function compareDates(first: null | string, second: null | string): number {
  return new Date(first ?? 0).getTime() - new Date(second ?? 0).getTime()
}

function getMedia(value: Media | null | number | undefined): Media | null {
  return value && typeof value === 'object' ? value : null
}

function getPopulatedRelationships<T>(values: (number | T)[] | null | undefined): T[] {
  return values?.filter((value): value is T => typeof value === 'object') ?? []
}

export function extractPageExcerpt(page: Page): string | null {
  const richTextBlock = page.layout.find((block) => block.blockType === 'richText')
  if (!richTextBlock) {
    return null
  }

  const text = collectText(richTextBlock.content).replace(/\s+/g, ' ').trim()
  return text ? truncateAtWord(text, 240) : null
}

function collectText(value: unknown): string {
  if (typeof value === 'string') {
    return value
  }

  if (Array.isArray(value)) {
    return value.map(collectText).filter(Boolean).join(' ')
  }

  if (!value || typeof value !== 'object') {
    return ''
  }

  const record = value as Record<string, unknown>
  if (record.type === 'text' && typeof record.text === 'string') {
    return record.text
  }

  if ('children' in record) {
    return collectText(record.children)
  }

  return 'root' in record ? collectText(record.root) : ''
}

function truncateAtWord(value: string, maximumLength: number): string {
  if (value.length <= maximumLength) {
    return value
  }

  const candidate = value.slice(0, maximumLength + 1)
  const lastSpace = candidate.lastIndexOf(' ')
  return `${candidate.slice(0, lastSpace > 0 ? lastSpace : maximumLength).trimEnd()}…`
}
