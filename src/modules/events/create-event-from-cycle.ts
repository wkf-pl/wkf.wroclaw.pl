import type { Endpoint, PayloadRequest } from 'payload'

import { findActiveLocationID } from '@/modules/locations/relationship'
import { getContentOwners } from '@/modules/content/content-owners'

import { eventEndpointErrorResponse } from './endpoint-response'
import { calculateNextEventDates } from './event-cycle-schedule'

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
    const previousEvents = await req.payload.find({
      collection: 'events',
      depth: 0,
      draft: true,
      limit: 1,
      overrideAccess: false,
      pagination: false,
      req,
      sort: '-startAt',
      user: req.user,
      where: {
        and: [{ cycle: { equals: cycle.id } }, { startAt: { exists: true } }],
      },
    })
    const dates = calculateNextEventDates(previousEvents.docs[0]?.startAt, cycle.eventDefaults)
    const location = await findActiveLocationID(req, cycle.eventDefaults.location)
    const owners = getContentOwners(cycle.eventDefaults.owners)
    const doc = await req.payload.create({
      collection: 'events',
      context: { skipSlugGeneration: true },
      data: {
        _status: 'draft',
        ...(owners.length ? { owners } : {}),
        cycle: cycle.id,
        location,
        ...dates,
        title: cycle.eventDefaults.title || cycle.title,
      },
      draft: true,
      overrideAccess: false,
      req,
      user: req.user,
    })

    return Response.json(
      { doc: { id: doc.id }, skippedLocation: Boolean(cycle.eventDefaults.location && !location) },
      { status: 201 },
    )
  } catch (error) {
    return eventEndpointErrorResponse(req, error)
  }
}

export const createEventFromCycleEndpoint: Endpoint = {
  handler,
  method: 'post',
  path: '/:id/create-event',
}
