'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { RasterIcon } from '@/components/RasterIcon'
import {
  getCalendarEventDate,
  type CalendarEvent,
  type CalendarEventType,
  type CalendarMonthPayload,
} from '@/modules/events/calendar-presentation'

const weekdays = ['PN', 'WT', 'ŚR', 'CZ', 'PT', 'SB', 'ND'] as const
const truncatedCalendarMessage = 'Zbyt wiele wydarzeń. Zobacz pełną listę wydarzeń.'

function EventTypeIcon({ eventType }: { eventType: CalendarEventType }) {
  return (
    <span className="calendarEventTypeIcon" data-event-type-color={eventType.iconColor}>
      <RasterIcon name={eventType.iconName} size="small" />
    </span>
  )
}

export function EventCalendar({
  initialData,
  initialMonth,
}: {
  initialData: CalendarMonthPayload
  initialMonth: string
}) {
  const [month, setMonth] = useState(() => new Date(`${initialMonth}-01T12:00:00Z`))
  const [calendarData, setCalendarData] = useState(initialData)
  const [calendarError, setCalendarError] = useState<string | null>(() =>
    initialData.truncated ? truncatedCalendarMessage : null,
  )
  const [selectedDay, setSelectedDay] = useState<string | null>(() =>
    initialData.events[0] ? getCalendarEventDate(initialData.events[0]) : null,
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
    void fetch(`/events/calendar.json?month=${monthPrefix}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Calendar request failed')
        return response.json() as Promise<CalendarMonthPayload>
      })
      .then((data) => {
        if (controller.signal.aborted) return
        setCalendarData(data)
        setCalendarError(data.truncated ? truncatedCalendarMessage : null)
        setSelectedDay(data.events[0] ? getCalendarEventDate(data.events[0]) : null)
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setCalendarError('Nie udało się pobrać kalendarza. Zobacz pełną listę wydarzeń.')
        }
      })

    return () => controller.abort()
  }, [monthPrefix])

  const selectedEvents = selectedDay
    ? calendarData.events.filter((event) => getCalendarEventDate(event) === selectedDay)
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
    : 'Wydarzenia w miesiącu'

  return (
    <section aria-label="Kalendarz wydarzeń" className="eventCalendar">
      <div className="calendarLayout">
        <aside aria-live="polite" className="calendarDetails">
          <h4>{selectedDayLabel}</h4>
          <div className="calendarSelection">
            {selectedDay ? (
              selectedEvents.length ? (
                selectedEvents.map((event: CalendarEvent) => (
                  <article className="calendarSelectionItem" key={event.id}>
                    <h5>
                      <EventTypeIcon eventType={event.eventType} />
                      <Link href={`/events/${event.slug}`}>{event.title}</Link>
                    </h5>
                    <p>{event.excerpt}</p>
                    <Link className="calendarEventLink" href={`/events/${event.slug}`}>
                      <span>Zobacz wydarzenie</span>
                      <RasterIcon name="arrow-right" size="small" />
                    </Link>
                  </article>
                ))
              ) : (
                <p>Brak wydarzeń w wybranym dniu.</p>
              )
            ) : (
              <p>Wybierz dzień, aby zobaczyć wydarzenia.</p>
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
              const dayEvents = calendarData.events.filter(
                (event) => getCalendarEventDate(event) === date,
              )
              const eventTypes = [
                ...new Map(
                  dayEvents.map((event) => [event.eventType.id, event.eventType] as const),
                ).values(),
              ]
              const eventTitles = dayEvents.map((event) => event.title).join(', ')

              return (
                <button
                  aria-label={`${index + 1}, wydarzenia: ${dayEvents.length}${eventTitles ? `: ${eventTitles}` : ''}`}
                  aria-pressed={selectedDay === date}
                  className={dayEvents.length ? 'calendarHasEvents' : undefined}
                  key={date}
                  onClick={() => setSelectedDay(date)}
                  type="button"
                >
                  <span className="calendarDayNumber">{index + 1}</span>
                  {eventTypes.length ? (
                    <span aria-hidden="true" className="calendarEventIcons">
                      {eventTypes.slice(0, 2).map((eventType) => (
                        <EventTypeIcon eventType={eventType} key={eventType.id} />
                      ))}
                      {eventTypes.length > 2 ? <span>+{eventTypes.length - 2}</span> : null}
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
          <Link href="/events">{calendarError}</Link>
        </p>
      ) : null}

      <footer className="calendarFooter">
        <ul aria-label="Rodzaje wydarzeń" className="calendarLegend">
          {calendarData.eventTypes.map((eventType) => (
            <li key={eventType.id}>
              <EventTypeIcon eventType={eventType} />
              {eventType.name}
            </li>
          ))}
        </ul>
        <Link className="eventCalendarSubscription" href="/events/calendar.ics">
          <RasterIcon name="calendar" size="small" />
          <span>Subskrybuj kalendarz WKF</span>
        </Link>
      </footer>
    </section>
  )
}
