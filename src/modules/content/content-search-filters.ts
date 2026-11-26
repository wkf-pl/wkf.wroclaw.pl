import { taxonomizableListingSources, type ContentListingSource } from './listing-conditions'

export const contentSearchFilterLabels = {
  phrase: 'Fraza',
  date: 'Data',
  tags: 'Tagi',
  topic: 'Tematy',
  branch: 'Dział serwisu',
  author: 'Autor',
  contentType: 'Typ treści',
} as const

export type ContentSearchFilterName = keyof typeof contentSearchFilterLabels

export const contentSearchFilterNames = Object.keys(
  contentSearchFilterLabels,
) as ContentSearchFilterName[]

export const contentSearchAuthorSources: readonly ContentListingSource[] = [
  ...taxonomizableListingSources,
  'partners',
]

export function supportsContentSearchFilter(
  filter: ContentSearchFilterName,
  sources: readonly ContentListingSource[],
): boolean {
  switch (filter) {
    case 'author':
    case 'date':
      return sources.some((source) => contentSearchAuthorSources.includes(source))
    case 'branch':
      return sources.some((source) => ['pages', 'posts', 'events', 'event-cycles'].includes(source))
    case 'topic':
    case 'tags':
      return sources.some((source) =>
        (taxonomizableListingSources as readonly ContentListingSource[]).includes(source),
      )
    default:
      return sources.length > 0
  }
}

export type ContentSearchFilters = {
  phrase?: string
  dateFrom?: string
  dateTo?: string
  tagIds?: number[]
  topicIds?: number[]
  topicId?: number
  tagGroups?: number[][]
  branch?: string
  author?: string
  authorId?: number
  sources?: ContentListingSource[]
}
