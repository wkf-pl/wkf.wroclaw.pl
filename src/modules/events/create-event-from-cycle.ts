import type { Endpoint, PayloadRequest } from 'payload'

import { eventEndpointErrorResponse } from './endpoint-response'

async function handler(req: PayloadRequest): Promise<Response> {
  if (!req.user) return Response.json({ message: 'Zaloguj się w panelu.' }, { status: 401 })

  const id = req.routeParams?.id
  if (typeof id !== 'number' && typeof id !== 'string') {
    return Response.json({ message: 'Nieprawidłowy Cykl wydarzeń.' }, { status: 400 })
  }

  try {
    const cycle = await req.payload.findByID({
      collection: 'event-cycles',
      depth: 0,
      id,
      overrideAccess: false,
      req,
      user: req.user,
    })
    const doc = await req.payload.create({
      collection: 'events',
      context: { skipSlugGeneration: true },
      data: {
        _status: 'draft',
        cycle: cycle.id,
        title: cycle.eventDefaults.title || cycle.title,
      },
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

export const createEventFromCycleEndpoint: Endpoint = {
  handler,
  method: 'post',
  path: '/:id/create-event',
}
