import type { Endpoint, PayloadRequest } from 'payload'

async function handler(req: PayloadRequest): Promise<Response> {
  if (!req.user) return Response.json({ message: 'Zaloguj się w panelu.' }, { status: 401 })

  const id = req.routeParams?.id
  if (typeof id !== 'number' && typeof id !== 'string') {
    return Response.json({ message: 'Nieprawidłowy Cykl wydarzeń.' }, { status: 400 })
  }

  const cycle = await req.payload.findByID({ collection: 'event-cycles', depth: 0, id, req })
  const doc = await req.payload.create({
    collection: 'events',
    context: { skipSlugGeneration: true },
    data: {
      _status: 'draft',
      cycle: cycle.id,
      title: cycle.eventDefaults.title || cycle.title,
    },
    draft: true,
    req,
  })

  return Response.json({ doc: { id: doc.id } }, { status: 201 })
}

export const createEventFromCycleEndpoint: Endpoint = {
  handler,
  method: 'post',
  path: '/:id/create-event',
}
