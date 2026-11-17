import type { Payload } from 'payload'

import type { Location } from '@/payload-types'

type LocationDetails = Partial<Location> & Pick<Location, 'venueName'>

export function locationFixture(details: LocationDetails): Location {
  return {
    id: 1,
    city: 'Wrocław',
    country: 'Polska',
    streetAddress: 'ul. Przykładowa 1',
    postalCode: '50-001',
    mapEmbedURL: 'https://www.google.com/maps/embed?pb=fixture',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    _status: 'published',
    ...details,
  }
}

export async function createLocationFixture(payload: Payload, details: LocationDetails) {
  const { id: _id, ...data } = locationFixture(details)
  return payload.create({ collection: 'locations', data, overrideAccess: true })
}

export async function deleteLocationFixture(payload: Payload, venueName: string) {
  await payload.delete({
    collection: 'locations',
    where: { venueName: { equals: venueName } },
    overrideAccess: true,
  })
}
