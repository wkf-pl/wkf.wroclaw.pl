'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { CmsRichText } from '@/components/CmsRichText'
import { RasterIcon } from '@/components/RasterIcon'
import {
  getCalendarContentDate,
  type ContentCalendarItem,
  type ContentCalendarItemType,
  type ContentCalendarMonthPayload,
} from '@/modules/content/content-calendar-presentation'
import type { CalendarMonthPayload } from '@/modules/events/calendar-presentation'

const weekdays = ['PN', 'WT', 'ŚR', 'CZ', 'PT', 'SB', 'ND'] as const

type CalendarCopy = {
  countNoun: string
  emptyDay: string
  error: string
  legendLabel: string
  monthFallback: string
  prompt: string
  sectionLabel: string
  truncated: string
}

const contentCalendarCopy: CalendarCopy = {
  countNoun: 'treści',
  emptyDay: 'Brak treści w wybranym dniu.',
  error: 'Nie udało się pobrać kalendarza. Odśwież stronę albo spróbuj ponownie później.',
  legendLabel: 'Typy treści',
  monthFallback: 'Treści w miesiącu',
  prompt: 'Wybierz dzień, aby zobaczyć treści.',
  sectionLabel: 'Kalendarz treści',
  truncated: 'Zbyt wiele treści w tym miesiącu.',
}

const eventCalendarCopy: CalendarCopy = {
  countNoun: 'wydarzenia',
  emptyDay: 'Brak wydarzeń w wybranym dniu.',
  error: 'Nie udało się pobrać kalendarza. Zobacz pełną listę wydarzeń.',
  legendLabel: 'Rodzaje wydarzeń',
  monthFallback: 'Wydarzenia w miesiącu',
  prompt: 'Wybierz dzień, aby zobaczyć wydarzenia.',
  sectionLabel: 'Kalendarz wydarzeń',
  truncated: 'Zbyt wiele wydarzeń. Zobacz pełną listę wydarzeń.',
}

function CalendarItemTypeIcon({ itemType }: { itemType: ContentCalendarItemType }) {
  return (
    <span className="calendarEventTypeIcon" data-event-type-color={itemType.iconColor}>
      <RasterIcon name={itemType.iconName} size="small" />
    </span>
  )
}

export function ContentCalendar({
  endpoint,
  fallbackURL,
  initialData,
  initialMonth,
}: {
  endpoint: string
  fallbackURL?: string
  initialData: ContentCalendarMonthPayload
  initialMonth: string
}) {
  return (
    <InteractiveCalendar
      copy={contentCalendarCopy}
      endpoint={endpoint}
      fallbackURL={fallbackURL}
      initialData={initialData}
      initialMonth={initialMonth}
      responseFormat="content"
    />
  )
}

export function EventCalendar({
  initialData,
  initialMonth,
}: {
  initialData: CalendarMonthPayload
  initialMonth: string
}) {
  return (
    <InteractiveCalendar
      copy={eventCalendarCopy}
      endpoint="/events/calendar.json"
      fallbackURL="/events"
      initialData={convertEventCalendarPayload(initialData)}
      initialMonth={initialMonth}
      responseFormat="events"
      subscriptionURL="/events/calendar.ics"
    />
  )
}

function InteractiveCalendar({
  copy,
  endpoint,
  fallbackURL,
  initialData,
  initialMonth,
  responseFormat,
  subscriptionURL,
}: {
  copy: CalendarCopy
  endpoint: string
  fallbackURL?: string
  initialData: ContentCalendarMonthPayload
  initialMonth: string
  responseFormat: 'content' | 'events'
  subscriptionURL?: string
}) {
  const [month, setMonth] = useState(() => new Date(`${initialMonth}-01T12:00:00Z`))
  const [calendarData, setCalendarData] = useState(initialData)
  const [calendarError, setCalendarError] = useState<string | null>(() =>
    initialData.truncated ? copy.truncated : null,
  )
  const [selectedDay, setSelectedDay] = useState<string | null>(() =>
    initialData.items[0] ? getCalendarContentDate(initialData.items[0]) : null,
  )
  const initialMonthRef = useRef(initialMonth)
  const year = month.getUTCFullYear()
  const monthIndex = month.getUTCMonth()
  const monthPrefix = `${year}-${String(monthIndex + 1).padStart(2, '0')}`
  const offset = (new Date(Date.UTC(year, monthIndex, 1)).getUTCDay() + 6) % 7
  const dayCount = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate()

  useEffect(() => {
    if (initialMonthRef.current === monthPrefix) {
      initialMonthRef.current = ''
      return
    }

    const controller = new AbortController()
    setCalendarError(null)
    const separator = endpoint.includes('?') ? '&' : '?'
    void fetch(`${endpoint}${separator}month=${monthPrefix}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Calendar request failed')
        const responseData = (await response.json()) as
          CalendarMonthPayload | ContentCalendarMonthPayload
        return responseFormat === 'events'
          ? convertEventCalendarPayload(responseData as CalendarMonthPayload)
          : (responseData as ContentCalendarMonthPayload)
      })
      .then((data) => {
        if (controller.signal.aborted) return
        setCalendarData(data)
        setCalendarError(data.truncated ? copy.truncated : null)
        setSelectedDay(data.items[0] ? getCalendarContentDate(data.items[0]) : null)
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setCalendarError(copy.error)
        }
      })

    return () => controller.abort()
  }, [copy.error, copy.truncated, endpoint, monthPrefix, responseFormat])

  const selectedItems = selectedDay
    ? calendarData.items.filter((item) => getCalendarContentDate(item) === selectedDay)
    : []

  function changeMonth(direction: number): void {
    setMonth(new Date(Date.UTC(year, monthIndex + direction, 1, 12)))
    setSelectedDay(null)
  }

  const selectedDayLabel = selectedDay
    ? new Intl.DateTimeFormat('pl-PL', {
        day: 'numeric',
        month: 'long',
        timeZone: 'UTC',
      }).format(new Date(`${selectedDay}T12:00:00Z`))
    : copy.monthFallback

  return (
    <section aria-label={copy.sectionLabel} className="eventCalendar contentCalendar">
      <div className="calendarLayout">
        <aside aria-live="polite" className="calendarDetails">
          <h4>{selectedDayLabel}</h4>
          <div className="calendarSelection">
            {selectedDay ? (
              selectedItems.length ? (
                selectedItems.map((item) => <CalendarSelectionItem item={item} key={item.id} />)
              ) : (
                <p>{copy.emptyDay}</p>
              )
            ) : (
              <p>{copy.prompt}</p>
            )}
          </div>
        </aside>

        <div className="calendarMonth">
          <div className="calendarNavigation">
            <button aria-label="Poprzedni miesiąc" onClick={() => changeMonth(-1)} type="button">
              <RasterIcon name="arrow-left" size="small" />
            </button>
            <h3 aria-live="polite">
              {new Intl.DateTimeFormat('pl-PL', {
                month: 'long',
                timeZone: 'UTC',
                year: 'numeric',
              }).format(month)}
            </h3>
            <button aria-label="Następny miesiąc" onClick={() => changeMonth(1)} type="button">
              <RasterIcon name="arrow-right" size="small" />
            </button>
          </div>

          <div className="calendarGrid">
            {weekdays.map((weekday) => (
              <span className="calendarWeekday" key={weekday}>
                {weekday}
              </span>
            ))}
            {Array.from({ length: offset }, (_, index) => (
              <span aria-hidden="true" key={`empty-${index}`} />
            ))}
            {Array.from({ length: dayCount }, (_, index) => {
              const date = `${monthPrefix}-${String(index + 1).padStart(2, '0')}`
              const dayItems = calendarData.items.filter(
                (item) => getCalendarContentDate(item) === date,
              )
              const itemTypes = [
                ...new Map(dayItems.map((item) => [item.type.id, item.type] as const)).values(),
              ]
              const itemTitles = dayItems.map((item) => item.title).join(', ')

              return (
                <button
                  aria-label={`${index + 1}, ${copy.countNoun}: ${dayItems.length}${itemTitles ? `: ${itemTitles}` : ''}`}
                  aria-pressed={selectedDay === date}
                  className={dayItems.length ? 'calendarHasEvents' : undefined}
                  key={date}
                  onClick={() => setSelectedDay(date)}
                  type="button"
                >
                  <span className="calendarDayNumber">{index + 1}</span>
                  {itemTypes.length ? (
                    <span aria-hidden="true" className="calendarEventIcons">
                      {itemTypes.slice(0, 2).map((itemType) => (
                        <CalendarItemTypeIcon itemType={itemType} key={itemType.id} />
                      ))}
                      {itemTypes.length > 2 ? <span>+{itemTypes.length - 2}</span> : null}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {calendarError ? (
        <p className="calendarStatus" role="status">
          {fallbackURL ? <Link href={fallbackURL}>{calendarError}</Link> : calendarError}
        </p>
      ) : null}

      <footer className="calendarFooter">
        <ul aria-label={copy.legendLabel} className="calendarLegend">
          {calendarData.itemTypes.map((itemType) => (
            <li key={itemType.id}>
              <CalendarItemTypeIcon itemType={itemType} />
              {itemType.name}
            </li>
          ))}
        </ul>
        {subscriptionURL ? (
          <Link className="eventCalendarSubscription" href={subscriptionURL}>
            <RasterIcon name="calendar" size="small" />
            <span>Subskrybuj kalendarz WKF</span>
          </Link>
        ) : null}
      </footer>
    </section>
  )
}

function CalendarSelectionItem({ item }: { item: ContentCalendarItem }) {
  return (
    <article className="calendarSelectionItem">
      <h5>
        <CalendarItemTypeIcon itemType={item.type} />
        <Link href={item.url}>{item.title}</Link>
      </h5>
      {item.summary.kind === 'richText' ? (
        <CmsRichText className="calendarEventSummary" data={item.summary.value} />
      ) : (
        <p className="calendarEventSummary">{item.summary.value}</p>
      )}
      <Link className="calendarEventLink" href={item.url}>
        <span>{item.kind === 'posts' ? 'Czytaj wpis' : 'Zobacz wydarzenie'}</span>
        <RasterIcon name="arrow-right" size="small" />
      </Link>
    </article>
  )
}

function convertEventCalendarPayload(data: CalendarMonthPayload): ContentCalendarMonthPayload {
  return {
    itemTypes: data.eventTypes.map((eventType) => ({
      ...eventType,
      id: `event-type:${eventType.id}`,
    })),
    items: data.events.map((event) => ({
      dateTime: event.startAt,
      id: `events:${event.id}`,
      kind: 'events',
      summary: { kind: 'richText', value: event.excerpt },
      title: event.title,
      type: { ...event.eventType, id: `event-type:${event.eventType.id}` },
      url: `/events/${event.slug}`,
    })),
    truncated: data.truncated,
  }
}
