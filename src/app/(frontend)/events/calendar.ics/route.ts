import { findPublicCalendarEvents } from '@/modules/events/calendar-feed'
import { calendarResponse, createEventsCalendar } from '@/modules/events/ics'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const seriesKey = new URL(request.url).searchParams.get('series')
  const { events, series } = await findPublicCalendarEvents(seriesKey)
  if (seriesKey && !series) return new Response('Nie znaleziono cyklu.', { status: 404 })
  const name = series ? `${series.title} — WKF` : 'Wydarzenia WKF'
  return calendarResponse(createEventsCalendar(events, name), series ? 'wkf-series.ics' : 'wkf.ics')
}
