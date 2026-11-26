import { sql } from '@payloadcms/db-postgres'
import {
  APIError,
  type CollectionBeforeChangeHook,
  type CollectionBeforeDeleteHook,
  type PayloadRequest,
} from 'payload'

import type { Location } from '@/payload-types'
import { getTransactionExecutor } from '@/modules/content/lock-content-owners'

const relationshipTables = [
  'page_templates',
  'pages',
  'posts',
  'events',
  'event_cycles',
  'partners',
  'homepage_sections',
] as const

async function assertLocationUnused(req: PayloadRequest, id: number | string) {
  const execute = await getTransactionExecutor(req)
  await execute(sql`SELECT id FROM locations WHERE id = ${id} FOR UPDATE`)
  const queries = [
    sql`SELECT 1 FROM events WHERE location_id = ${id}`,
    sql`SELECT 1 FROM _events_v WHERE latest AND version_location_id = ${id}`,
    sql`SELECT 1 FROM event_cycles WHERE event_defaults_location_id = ${id}`,
    sql`SELECT 1 FROM _event_cycles_v WHERE latest AND version_event_defaults_location_id = ${id}`,
    ...relationshipTables.flatMap((table) => [
      sql`SELECT 1 FROM ${sql.identifier(table + '_rels')} WHERE locations_id = ${id}`,
      sql`SELECT 1 FROM ${sql.identifier('_' + table + '_v_rels')} AS relation
        JOIN ${sql.identifier('_' + table + '_v')} AS version ON version.id = relation.parent_id
        WHERE version.latest AND relation.locations_id = ${id}`,
    ]),
  ]
  const result: { rows: { in_use: boolean }[] } = await execute(sql`
    SELECT EXISTS (${sql.join(queries, sql` UNION ALL `)}) AS in_use
  `)
  if (result.rows[0]?.in_use) {
    throw new APIError(
      'Miejsce jest używane. Usuń powiązania lub oznacz miejsce jako nieaktywne.',
      400,
    )
  }
}

const calendarAddressFields = [
  'venueName',
  'streetAddress',
  'postalCode',
  'city',
  'country',
] as const

export const beforeLocationChange: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  operation,
  req,
}) => {
  if (operation === 'create' || !originalDoc?.id) return data
  const savingDraft =
    req.context.savingLocationDraft || req.query?.draft === 'true' || req.query?.draft === true
  if (data.deletedAt || (data._status === 'draft' && !savingDraft)) {
    await assertLocationUnused(req, originalDoc.id)
  }
  if (data.deletedAt || data._status === 'draft' || (savingDraft && data._status !== 'published')) {
    return data
  }

  const execute = await getTransactionExecutor(req)
  await execute(sql`SELECT id FROM locations WHERE id = ${originalDoc.id} FOR UPDATE`)
  const published = await req.payload.db.findOne<Location>({
    collection: 'locations',
    req,
    where: { id: { equals: originalDoc.id }, _status: { equals: 'published' } },
  })
  if (
    published &&
    calendarAddressFields.some(
      (field) => (field in data ? data[field] : originalDoc[field]) !== published[field],
    )
  ) {
    await execute(sql`
      UPDATE events
      SET calendar_revision = coalesce(calendar_revision, 0) + 1, updated_at = now()
      WHERE location_id = ${originalDoc.id} AND _status = 'published'
    `)
    await execute(sql`
      UPDATE _events_v AS version
      SET version_calendar_revision = greatest(coalesce(version.version_calendar_revision, 0), events.calendar_revision)
      FROM events
      WHERE version.parent_id = events.id AND version.latest
        AND events.location_id = ${originalDoc.id} AND events._status = 'published';
    `)
  }
  return data
}

export const protectLocationDeletion: CollectionBeforeDeleteHook = ({ id, req }) =>
  assertLocationUnused(req, id)
