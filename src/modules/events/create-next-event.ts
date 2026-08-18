import type { Endpoint, PayloadRequest } from 'payload'

import type { Event } from '@/payload-types'

function parseStartAt(value: unknown): Date | null {
  if (typeof value !== 'string' || !value.trim()) return null
  const normalized = value.includes('T') ? value : value.replace(' ', 'T')
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? null : date
}

function relationshipID(value: Event['cycle']): number | null {
  if (typeof value === 'number') return value
  return value && typeof value === 'object' ? value.id : null
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

  const source = await req.payload.findByID({ collection: 'events', depth: 0, id, req })
  const cycleID = relationshipID(source.cycle)
  const cycle = cycleID
    ? await req.payload.findByID({ collection: 'event-cycles', depth: 0, id: cycleID, req })
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
        categories: source.categories?.map((item) => (typeof item === 'object' ? item.id : item)),
        endAt,
        eventStatus: 'scheduled' as const,
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
        tagline: source.tagline,
        tags: source.tags?.map((item) => (typeof item === 'object' ? item.id : item)),
        timeMode: source.timeMode,
        title: source.title,
        visibility: source.visibility,
      }

  const doc = await req.payload.create({ collection: 'events', data, draft: true, req })
  return Response.json({ doc: { id: doc.id } }, { status: 201 })
}

export const createNextEventEndpoint: Endpoint = {
  handler,
  method: 'post',
  path: '/:id/next',
}
