import { WARSAW_TIME_ZONE } from './constants'

export const recurrenceWeekdays = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const

export const recurrenceTypeOptions = [
  { label: 'Codziennie', value: 'daily' },
  { label: 'Co określoną liczbę tygodni', value: 'weekly' },
  { label: 'Co miesiąc określonego dnia', value: 'monthlyDate' },
  { label: 'W określonym tygodniu miesiąca', value: 'monthlyWeekday' },
] as const

export const recurrenceWeekdayOptions = [
  { label: 'poniedziałek', value: 'monday' },
  { label: 'wtorek', value: 'tuesday' },
  { label: 'środa', value: 'wednesday' },
  { label: 'czwartek', value: 'thursday' },
  { label: 'piątek', value: 'friday' },
  { label: 'sobota', value: 'saturday' },
  { label: 'niedziela', value: 'sunday' },
] as const

export type RecurrenceWeekday = (typeof recurrenceWeekdays)[number]
export type EventCycleRecurrenceType = 'daily' | 'monthlyDate' | 'monthlyWeekday' | 'weekly'

export type EventCycleScheduleDefaults = {
  defaultDayCount?: null | number
  defaultEndTime?: null | string
  defaultStartTime?: null | string
  monthDay?: null | number
  recurrenceType?: EventCycleRecurrenceType | null
  recurrenceWeekday?: null | RecurrenceWeekday
  weekInterval?: null | number
  weekOfMonth?: null | number
}

type CalendarDate = {
  day: number
  month: number
  year: number
}

type ClockTime = {
  hour: number
  minute: number
}

const warsawDateFormatter = new Intl.DateTimeFormat('en-CA', {
  day: '2-digit',
  month: '2-digit',
  timeZone: WARSAW_TIME_ZONE,
  year: 'numeric',
})

const warsawOffsetFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: WARSAW_TIME_ZONE,
  timeZoneName: 'longOffset',
})

const weekdayIndexes: Record<RecurrenceWeekday, number> = {
  friday: 5,
  monday: 1,
  saturday: 6,
  sunday: 0,
  thursday: 4,
  tuesday: 2,
  wednesday: 3,
}

function getWarsawCalendarDate(date: Date): CalendarDate {
  const parts = Object.fromEntries(
    warsawDateFormatter.formatToParts(date).map((part) => [part.type, part.value]),
  )
  return {
    day: Number(parts.day),
    month: Number(parts.month),
    year: Number(parts.year),
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

function parseClockTime(value: null | string | undefined): ClockTime | null {
  const match = value?.match(/^([01]\d|2[0-3]):([0-5]\d)$/)
  return match ? { hour: Number(match[1]), minute: Number(match[2]) } : null
}

function createWarsawDateTime(date: CalendarDate, time: ClockTime): Date {
  const localTimestamp = Date.UTC(date.year, date.month - 1, date.day, time.hour, time.minute)
  let utcTimestamp = localTimestamp

  for (let i = 0; i < 3; i += 1) {
    const adjustedTimestamp =
      localTimestamp - getWarsawOffsetMinutes(new Date(utcTimestamp)) * 60_000
    if (adjustedTimestamp === utcTimestamp) break
    utcTimestamp = adjustedTimestamp
  }

  return new Date(utcTimestamp)
}

function addCalendarDays(date: CalendarDate, days: number): CalendarDate {
  const result = new Date(Date.UTC(date.year, date.month - 1, date.day + days))
  return {
    day: result.getUTCDate(),
    month: result.getUTCMonth() + 1,
    year: result.getUTCFullYear(),
  }
}

function getNextMonth(date: CalendarDate): Pick<CalendarDate, 'month' | 'year'> {
  return date.month === 12
    ? { month: 1, year: date.year + 1 }
    : { month: date.month + 1, year: date.year }
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

function getWeekdayIndex(date: CalendarDate): number {
  return new Date(Date.UTC(date.year, date.month - 1, date.day)).getUTCDay()
}

function isIntegerInRange(
  value: null | number | undefined,
  minimum: number,
  maximum: number,
): value is number {
  return (
    typeof value === 'number' && Number.isInteger(value) && value >= minimum && value <= maximum
  )
}

function isPositiveInteger(value: null | number | undefined): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1
}

function calculateNextCalendarDate(
  previousDate: CalendarDate,
  defaults: EventCycleScheduleDefaults,
): CalendarDate | null {
  switch (defaults.recurrenceType) {
    case 'daily':
      return addCalendarDays(previousDate, 1)
    case 'weekly': {
      if (!isIntegerInRange(defaults.weekInterval, 1, 4) || !defaults.recurrenceWeekday) {
        return null
      }
      const currentWeekday = getWeekdayIndex(previousDate)
      const targetWeekday = weekdayIndexes[defaults.recurrenceWeekday]
      const daysUntilNextTarget = (targetWeekday - currentWeekday + 7) % 7 || 7
      return addCalendarDays(previousDate, daysUntilNextTarget + (defaults.weekInterval - 1) * 7)
    }
    case 'monthlyDate': {
      if (!isIntegerInRange(defaults.monthDay, 1, 31)) return null
      const nextMonth = getNextMonth(previousDate)
      return {
        ...nextMonth,
        day: Math.min(defaults.monthDay, getDaysInMonth(nextMonth.year, nextMonth.month)),
      }
    }
    case 'monthlyWeekday': {
      if (!isIntegerInRange(defaults.weekOfMonth, 1, 4) || !defaults.recurrenceWeekday) {
        return null
      }
      const nextMonth = getNextMonth(previousDate)
      const firstDay = { ...nextMonth, day: 1 }
      const firstWeekday = getWeekdayIndex(firstDay)
      const targetWeekday = weekdayIndexes[defaults.recurrenceWeekday]
      return {
        ...nextMonth,
        day: 1 + ((targetWeekday - firstWeekday + 7) % 7) + (defaults.weekOfMonth - 1) * 7,
      }
    }
    default:
      return null
  }
}

export function calculateNextEventDates(
  previousStartAt: null | string | undefined,
  defaults: EventCycleScheduleDefaults,
): null | { endAt: string; startAt: string } {
  if (!previousStartAt) return null
  const previousStart = new Date(previousStartAt)
  if (Number.isNaN(previousStart.getTime())) return null

  const startTime = parseClockTime(defaults.defaultStartTime)
  const endTime = parseClockTime(defaults.defaultEndTime)
  if (!startTime || !endTime || !isPositiveInteger(defaults.defaultDayCount)) return null
  if (
    defaults.defaultDayCount === 1 &&
    endTime.hour * 60 + endTime.minute <= startTime.hour * 60 + startTime.minute
  ) {
    return null
  }

  const startDate = calculateNextCalendarDate(getWarsawCalendarDate(previousStart), defaults)
  if (!startDate) return null
  const endDate = addCalendarDays(startDate, defaults.defaultDayCount - 1)

  return {
    endAt: createWarsawDateTime(endDate, endTime).toISOString(),
    startAt: createWarsawDateTime(startDate, startTime).toISOString(),
  }
}
