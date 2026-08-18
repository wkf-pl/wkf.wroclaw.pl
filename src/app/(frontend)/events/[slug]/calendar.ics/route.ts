import { findPublishedEventBySlug } from '@/modules/events/public-events'
import { calendarResponse, createEventsCalendar } from '@/modules/events/ics'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params
  const event = await findPublishedEventBySlug(slug)
  if (!event) return new Response('Nie znaleziono wydarzenia.', { status: 404 })
  return calendarResponse(createEventsCalendar([event], event.title), `${event.slug}.ics`)
}
