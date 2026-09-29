import type { Endpoint, PayloadRequest } from 'payload'

import { getRelationshipId } from '@/lib/relationships'

import { eventEndpointErrorResponse } from './endpoint-response'

function parseStartAt(value: unknown): Date | null {
  if (typeof value !== 'string' || !value.trim()) return null
  const normalized = value.includes('T') ? value : value.replace(' ', 'T')
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? null : date
}

async function handler(req: PayloadRequest): Promise<Response> {
  if (!req.user) return Response.json({ message: 'Zaloguj się w panelu.' }, { status: 401 })
  const id = req.routeParams?.id
  if (typeof id !== 'number' && typeof id !== 'string') {
    return Response.json({ message: 'Nieprawidłowe wydarzenie źródłowe.' }, { status: 400 })
  }
  const body = (await req.json?.()) as { startAt?: unknown }
  const startAt = parseStartAt(body?.startAt)
  if (!startAt)
    return Response.json({ message: 'Podaj poprawny początek wydarzenia.' }, { status: 400 })

  try {
    const source = await req.payload.findByID({
      collection: 'events',
      depth: 0,
      id,
      overrideAccess: false,
      req,
      user: req.user,
    })
    const cycleID = getRelationshipId(source.cycle)
    const cycle = cycleID
      ? await req.payload.findByID({
          collection: 'event-cycles',
          depth: 0,
          id: cycleID,
          overrideAccess: false,
          req,
          user: req.user,
        })
      : null
    const duration = source.endAt
      ? new Date(source.endAt).getTime() - new Date(source.startAt).getTime()
      : null
    const endAt =
      duration !== null && duration >= 0
        ? new Date(startAt.getTime() + duration).toISOString()
        : undefined
    const dateLabel = new Intl.DateTimeFormat('pl-PL', {
      dateStyle: 'long',
      timeZone: 'Europe/Warsaw',
    }).format(startAt)

    const data = cycleID
      ? {
          _status: 'draft' as const,
          cycle: cycleID,
          endAt,
          startAt: startAt.toISOString(),
          title: `${cycle?.title || source.title} — ${dateLabel}`,
        }
      : {
          _status: 'draft' as const,
          author: typeof source.author === 'object' ? source.author.id : source.author,
          capacity: source.capacity,
          capacityMode: source.capacityMode,
          category:
            source.category && typeof source.category === 'object'
              ? source.category.id
              : source.category,
          endAt,
          eventStatus: 'scheduled' as const,
          eventType:
            source.eventType && typeof source.eventType === 'object'
              ? source.eventType.id
              : source.eventType,
          excerpt: source.excerpt,
          externalLinks: source.externalLinks,
          heroImage:
            source.heroImage && typeof source.heroImage === 'object'
              ? source.heroImage.id
              : source.heroImage,
          layout: source.layout,
          location: source.location,
          organizers: source.organizers,
          participation: source.participation,
          partners: source.partners,
          startAt: startAt.toISOString(),
          tags: source.tags?.map((item) => (typeof item === 'object' ? item.id : item)),
          timeMode: source.timeMode,
          title: source.title,
        }

    const doc = await req.payload.create({
      collection: 'events',
      data,
      draft: true,
      overrideAccess: false,
      req,
      user: req.user,
    })
    return Response.json({ doc: { id: doc.id } }, { status: 201 })
  } catch (error) {
    return eventEndpointErrorResponse(req, error)
  }
}

export const createNextEventEndpoint: Endpoint = {
  handler,
  method: 'post',
  path: '/:id/next',
}
