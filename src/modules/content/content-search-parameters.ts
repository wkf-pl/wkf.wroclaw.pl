import type { ContentSearchOptions } from './content-listing'
import type { ContentSearchFilterName, ContentSearchFilters } from './content-search-filters'
import { isCalendarDate, isListingSource, type ContentListingSource } from './listing-conditions'

export type SearchParameters = Record<string, string | string[] | undefined>

export type EnabledContentSearchFilters = Record<
  Exclude<ContentSearchFilterName, 'branch'>,
  boolean
> & { branch?: boolean }

type SearchField =
  | 'phrase'
  | 'dateFrom'
  | 'dateTo'
  | 'tags'
  | 'topic'
  | 'author'
  | 'contentType'
  | 'branch'
  | 'tagGroups'
export type ContentSearchParameterNames = Record<SearchField, string>

export function getContentSearchParameterNames(
  prefix: string,
  legacy = false,
): ContentSearchParameterNames {
  return {
    phrase: `${prefix}_q`,
    dateFrom: `${prefix}_from`,
    dateTo: `${prefix}_to`,
    tags: `${prefix}_tag`,
    topic: `${prefix}_${legacy ? 'category' : 'topic'}`,
    branch: `${prefix}_branch`,
    tagGroups: `${prefix}_group_tag`,
    author: `${prefix}_author`,
    contentType: `${prefix}_type`,
  }
}

export function parseContentSearchFilters({
  enabled,
  names,
  options,
  parameters,
  sources,
}: {
  enabled: EnabledContentSearchFilters
  names: ContentSearchParameterNames
  options: ContentSearchOptions
  parameters: SearchParameters
  sources: readonly ContentListingSource[]
}) {
  const errors: Partial<Record<SearchField, string>> = {}
  let hasInput = false

  function read(field: SearchField, active: boolean): string[] {
    const raw = active ? parameters[names[field]] : undefined
    const values = (typeof raw === 'string' ? [raw] : (raw ?? []))
      .map((value) => value.trim())
      .filter(Boolean)
    if (values.length) hasInput = true
    return [...new Set(values)]
  }

  function readSingle(field: SearchField, active: boolean): string | undefined {
    const values = read(field, active)
    if (values.length <= 1) return values[0]
    errors[field] = 'Podaj jedną wartość.'
  }

  function readText(field: 'phrase' | 'author'): string | undefined {
    const value = readSingle(field, enabled[field])
    if (!value) return undefined
    if (value.length <= 160 && !value.includes('\0')) return value
    errors[field] = 'Podaj tekst o długości do 160 znaków bez niedozwolonych znaków.'
  }

  const phrase = readText('phrase')
  const author = readText('author')
  const dateFrom = readSingle('dateFrom', enabled.date)
  const dateTo = readSingle('dateTo', enabled.date)
  if (dateFrom && !isCalendarDate(dateFrom)) errors.dateFrom = 'Podaj poprawną datę.'
  if (dateTo && !isCalendarDate(dateTo)) errors.dateTo = 'Podaj poprawną datę.'
  if (dateFrom && dateTo && !errors.dateFrom && !errors.dateTo && dateFrom > dateTo) {
    errors.dateFrom = 'Data początkowa musi przypadać najpóźniej w dniu daty końcowej.'
    errors.dateTo = errors.dateFrom
  }

  const topicValues = read('topic', enabled.topic)
  const topicIds = topicValues
    .map(readIdentifier)
    .filter(
      (id): id is number => id !== undefined && options.topics.some((topic) => topic.id === id),
    )
  if (topicIds.length !== topicValues.length)
    errors.topic = 'Wybierz tematy dostępne w tym listingu.'

  const branch = readSingle('branch', Boolean(enabled.branch))
  if (branch && !options.branches?.some(({ value }) => value === branch)) {
    errors.branch = 'Wybierz dział dostępny w tym listingu.'
  }

  const groupedValues = read('tagGroups', Boolean(options.tagGroups?.length))
  const tagGroups = (options.tagGroups ?? []).flatMap(({ tags }) => {
    const matching = tags.filter(({ id }) => groupedValues.includes(String(id))).map(({ id }) => id)
    return matching.length ? [matching] : []
  })
  if (tagGroups.flat().length !== groupedValues.length) {
    errors.tagGroups = 'Część wybranych tagów jest niedostępna.'
  }

  const tagValues = read('tags', enabled.tags)
  const allowedTagIds = new Set(options.tags.map(({ id }) => id))
  const tagIds = tagValues
    .map(readIdentifier)
    .filter((id): id is number => id !== undefined && allowedTagIds.has(id))
  if (tagIds.length !== tagValues.length) errors.tags = 'Część wybranych tagów jest niedostępna.'

  const sourceValues = read('contentType', enabled.contentType)
  const selectedSources = sourceValues.filter(
    (source): source is ContentListingSource => isListingSource(source) && sources.includes(source),
  )
  if (selectedSources.length !== sourceValues.length) {
    errors.contentType = 'Część wybranych typów treści jest niedostępna.'
  }

  const filters: ContentSearchFilters = {
    ...(phrase ? { phrase } : {}),
    ...(author ? { author } : {}),
    ...(dateFrom && !errors.dateFrom ? { dateFrom } : {}),
    ...(dateTo && !errors.dateTo ? { dateTo } : {}),
    ...(topicIds.length ? { topicIds } : {}),
    ...(branch && !errors.branch ? { branch } : {}),
    ...(tagGroups.length ? { tagGroups } : {}),
    ...(tagIds.length ? { tagIds } : {}),
    ...(selectedSources.length ? { sources: selectedSources } : {}),
  }

  return {
    errors,
    filters,
    hasInput,
    dateFrom: isCalendarDate(dateFrom) ? dateFrom : undefined,
    dateTo: isCalendarDate(dateTo) ? dateTo : undefined,
  }
}

export function getPreservedSearchParameters(
  parameters: SearchParameters,
  names: ContentSearchParameterNames,
  pageParameter: string,
): [string, string][] {
  const owned = new Set([pageParameter, ...Object.values(names)])
  return Object.entries(parameters).flatMap(([name, values]) =>
    owned.has(name) || values === undefined
      ? []
      : (Array.isArray(values) ? values : [values]).map((value): [string, string] => [name, value]),
  )
}

function readIdentifier(value: string): number | undefined {
  if (!/^[1-9]\d*$/.test(value)) return undefined
  const id = Number(value)
  return Number.isSafeInteger(id) ? id : undefined
}
