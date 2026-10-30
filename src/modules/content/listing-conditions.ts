import type { RelationshipID } from '@/lib/relationships'

export const listingSources = ['pages', 'posts', 'events', 'event-cycles', 'documents'] as const

export type ListingSource = (typeof listingSources)[number]

export const listingConditionFields = [
  'title',
  'category',
  'tag',
  'parentPage',
  'eventCycle',
  'eventTime',
  'significantDate',
] as const

export type ListingConditionField = (typeof listingConditionFields)[number]

export const listingConditionOperators = [
  'contains',
  'equals',
  'inSubtree',
  'notOlderThan',
  'before',
  'after',
  'between',
] as const

export type ListingConditionOperator = (typeof listingConditionOperators)[number]
export type ListingEventTimeValue = 'past' | 'upcoming'
export type ListingConditionRelationshipCollection =
  'categories' | 'event-cycles' | 'pages' | 'tags'

export type ListingConditionRelationshipValue = {
  relationTo: ListingConditionRelationshipCollection
  value: RelationshipID | Record<string, unknown>
}

export type ListingConditionInput = {
  dateValue?: null | string
  endDateValue?: null | string
  eventTimeValue?: ListingEventTimeValue | null
  field?: ListingConditionField | null
  id?: null | string
  numberValue?: null | number
  operator?: ListingConditionOperator | null
  relationshipValue?: ListingConditionRelationshipValue | null
  textValue?: null | string
}

export type NormalizedListingCondition = {
  dateValue?: string
  endDateValue?: string
  eventTimeValue?: ListingEventTimeValue
  field: ListingConditionField
  numberValue?: number
  operator: ListingConditionOperator
  relationshipId?: number
  textValue?: string
}

export const listingConditionFieldLabels: Record<ListingConditionField, string> = {
  category: 'Kategoria',
  eventCycle: 'Cykl wydarzeń',
  eventTime: 'Termin wydarzenia',
  parentPage: 'Strona nadrzędna',
  significantDate: 'Data treści',
  tag: 'Tag',
  title: 'Tytuł',
}

export const listingSourceLabels: Record<ListingSource, string> = {
  documents: 'Dokumenty',
  'event-cycles': 'Cykle wydarzeń',
  events: 'Wydarzenia',
  pages: 'Strony',
  posts: 'Wpisy',
}

export const listingConditionSupportedSources: Record<
  ListingConditionField,
  readonly ListingSource[]
> = {
  category: listingSources,
  eventCycle: ['events'],
  eventTime: ['events'],
  parentPage: ['pages'],
  significantDate: ['posts', 'events', 'documents'],
  tag: listingSources,
  title: listingSources,
}

export const listingConditionOperatorsByField: Record<
  ListingConditionField,
  readonly ListingConditionOperator[]
> = {
  category: ['inSubtree', 'equals'],
  eventCycle: ['equals'],
  eventTime: ['equals'],
  parentPage: ['equals'],
  significantDate: ['notOlderThan', 'before', 'after', 'between'],
  tag: ['contains'],
  title: ['contains', 'equals'],
}

export const listingConditionOperatorLabels: Record<ListingConditionOperator, string> = {
  after: 'jest po',
  before: 'jest przed',
  between: 'jest między',
  contains: 'zawiera',
  equals: 'to',
  inSubtree: 'to',
  notOlderThan: 'nie jest starsza niż',
}

export function getListingConditionOperatorLabel(
  field: ListingConditionField,
  operator: ListingConditionOperator,
): string {
  if (field === 'category' && operator === 'equals') return 'to dokładnie'
  return listingConditionOperatorLabels[operator]
}

export function getListingConditionRelationshipCollection(
  field: ListingConditionField,
): ListingConditionRelationshipCollection | undefined {
  switch (field) {
    case 'category':
      return 'categories'
    case 'eventCycle':
      return 'event-cycles'
    case 'parentPage':
      return 'pages'
    case 'tag':
      return 'tags'
    default:
      return undefined
  }
}

export function getApplicableListingSources(
  field: ListingConditionField,
  sources: readonly ListingSource[],
): ListingSource[] {
  const supportedSources = new Set(listingConditionSupportedSources[field])
  return sources.filter((source) => supportedSources.has(source))
}

export function isListingConditionField(value: unknown): value is ListingConditionField {
  return listingConditionFields.some((field) => field === value)
}

export function isListingConditionOperator(value: unknown): value is ListingConditionOperator {
  return listingConditionOperators.some((operator) => operator === value)
}

export function isListingSource(value: unknown): value is ListingSource {
  return listingSources.some((source) => source === value)
}

export function normalizeListingTitle(value: string): string {
  return value.trim().normalize('NFKC').toLocaleLowerCase('pl-PL')
}

export function formatPolishListingConditionCount(count: number): string {
  const lastDigit = count % 10
  const lastTwoDigits = count % 100
  const noun =
    count === 1
      ? 'warunek'
      : lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)
        ? 'warunki'
        : 'warunków'

  return `${count} ${noun}`
}

export function createListingTagSearchIndex(tagIds: readonly number[]): string {
  return `|${[...new Set(tagIds)].sort((left, right) => left - right).join('|')}|`
}

type CalendarDate = {
  day: number
  month: number
  year: number
}

const calendarDatePattern = /^(\d{4})-(\d{2})-(\d{2})$/
const warsawOffsetFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Warsaw',
  timeZoneName: 'longOffset',
})
const warsawCalendarDateFormatter = new Intl.DateTimeFormat('en-CA', {
  day: '2-digit',
  month: '2-digit',
  timeZone: 'Europe/Warsaw',
  year: 'numeric',
})

export function isCalendarDate(value: unknown): value is string {
  if (typeof value !== 'string') return false
  const match = calendarDatePattern.exec(value)
  if (!match) return false

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  )
}

export function getWarsawDayStartISOString(value: string): string {
  const calendarDate = parseCalendarDate(value)
  return createWarsawDateTime(calendarDate).toISOString()
}

export function getWarsawDayAfterISOString(value: string): string {
  const calendarDate = addCalendarDays(parseCalendarDate(value), 1)
  return createWarsawDateTime(calendarDate).toISOString()
}

export function getWarsawDaysAgoStartISOString(days: number, now = new Date()): string {
  const currentDate = getWarsawCalendarDate(now)
  return createWarsawDateTime(addCalendarDays(currentDate, -days)).toISOString()
}

function parseCalendarDate(value: string): CalendarDate {
  if (!isCalendarDate(value)) throw new Error(`Invalid calendar date: ${value}`)
  const match = calendarDatePattern.exec(value)!
  return { day: Number(match[3]), month: Number(match[2]), year: Number(match[1]) }
}

function getWarsawCalendarDate(date: Date): CalendarDate {
  const parts = Object.fromEntries(
    warsawCalendarDateFormatter.formatToParts(date).map((part) => [part.type, part.value]),
  )
  return { day: Number(parts.day), month: Number(parts.month), year: Number(parts.year) }
}

function addCalendarDays(value: CalendarDate, days: number): CalendarDate {
  const date = new Date(Date.UTC(value.year, value.month - 1, value.day + days))
  return {
    day: date.getUTCDate(),
    month: date.getUTCMonth() + 1,
    year: date.getUTCFullYear(),
  }
}

function getWarsawOffsetMinutes(date: Date): number {
  const offset = warsawOffsetFormatter
    .formatToParts(date)
    .find((part) => part.type === 'timeZoneName')?.value
  const match = offset?.match(/^GMT([+-])(\d{2}):(\d{2})$/)
  if (!match) throw new Error('Unable to determine the Europe/Warsaw time-zone offset.')
  const sign = match[1] === '+' ? 1 : -1
  return sign * (Number(match[2]) * 60 + Number(match[3]))
}

function createWarsawDateTime(value: CalendarDate): Date {
  const localTimestamp = Date.UTC(value.year, value.month - 1, value.day)
  let utcTimestamp = localTimestamp

  for (let i = 0; i < 3; i += 1) {
    const adjustedTimestamp =
      localTimestamp - getWarsawOffsetMinutes(new Date(utcTimestamp)) * 60_000
    if (adjustedTimestamp === utcTimestamp) break
    utcTimestamp = adjustedTimestamp
  }

  return new Date(utcTimestamp)
}
