import { findCalendarMonth } from '@/modules/events/calendar-data'
import { isValidCalendarMonth } from '@/modules/events/calendar-presentation'

export async function GET(request: Request): Promise<Response> {
  const month = new URL(request.url).searchParams.get('month') ?? ''

  if (!isValidCalendarMonth(month)) {
    return Response.json({ error: 'Nieprawidłowy miesiąc.' }, { status: 400 })
  }

  return Response.json(await findCalendarMonth(month), {
    headers: { 'Cache-Control': 'no-store' },
  })
}
