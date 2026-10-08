import { findContentCalendarMonth } from '@/modules/content/content-calendar-data'
import { parseContentCalendarSearchParams } from '@/modules/content/content-calendar-presentation'

export async function GET(request: Request): Promise<Response> {
  const parsedRequest = parseContentCalendarSearchParams(new URL(request.url).searchParams)
  if (!parsedRequest) {
    return Response.json({ error: 'Nieprawidłowe filtry kalendarza.' }, { status: 400 })
  }

  return Response.json(await findContentCalendarMonth(parsedRequest.month, parsedRequest.filters), {
    headers: { 'Cache-Control': 'no-store' },
  })
}
