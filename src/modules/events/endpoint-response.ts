import { APIError, type PayloadRequest } from 'payload'

const exposedErrorStatuses = new Set([400, 401, 403, 404])

export function eventEndpointErrorResponse(req: PayloadRequest, error: unknown): Response {
  if (error instanceof APIError && exposedErrorStatuses.has(error.status)) {
    return Response.json({ message: error.message }, { status: error.status })
  }

  req.payload.logger.error({ err: error, msg: 'Event endpoint request failed.' })
  return Response.json({ message: 'Nie udało się utworzyć wydarzenia.' }, { status: 500 })
}
