import { sql, type MigrateUpArgs } from '@payloadcms/db-postgres'
import { createLocalReq, getPayload, initTransaction, killTransaction } from 'payload'
import { expect, it } from 'vitest'

import config from '@/payload.config'

import {
  down as restoreLegacyColumns,
  up as migrateLocations,
} from '../../migrations/20261115_212154_locations'
import { down as removeLocationIndex } from '../../migrations/20261115_212155_index_locations'
import { reportLegacyLocationIssues } from '../../migrations/lib/legacy-locations'

import { restoreLegacyTopicPermissionName } from '../helpers/historical-topic-schema'

it('checks legacy data, deduplicates current locations and preserves incomplete historical versions', async () => {
  const payload = await getPayload({ config })
  const req = await createLocalReq({}, payload)
  await initTransaction(req)
  try {
    const transactionID = await req.transactionID
    const transaction = transactionID == null ? undefined : payload.db.sessions?.[transactionID]?.db
    if (!transaction) throw new Error('Payload migration transaction was not initialized')
    const args = { db: transaction, req, payload } as MigrateUpArgs
    const { db } = args
    await restoreLegacyTopicPermissionName(db)
    await removeLocationIndex(args)
    await restoreLegacyColumns(args)

    const event = await db.execute<{ id: number }>(sql`
      INSERT INTO events (title, location_venue_name) VALUES ('Location migration event', ' Common venue ')
      RETURNING id
    `)
    const eventID = event.rows[0]!.id
    expect(await reportLegacyLocationIssues(db)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          table: 'events',
          id: eventID,
          blocksMigration: true,
          fields: expect.arrayContaining(['streetAddress', 'mapEmbedURL']),
        }),
      ]),
    )
    await db.execute(sql`
      UPDATE events SET location_street_address = 'Example street', location_postal_code = '50-001',
        location_map_embed_u_r_l = '<iframe src="https://google.com/maps/embed?pb=test"></iframe>'
      WHERE id = ${eventID}
    `)
    const cycle = await db.execute<{ id: number }>(sql`
      INSERT INTO event_cycles (
        title, event_defaults_location_venue_name, event_defaults_location_street_address,
        event_defaults_location_postal_code, event_defaults_location_map_embed_u_r_l
      ) VALUES ('Location migration cycle', 'Common venue', 'Example street', '50-001',
        'https://google.com/maps/embed?pb=test')
      RETURNING id
    `)
    const cycleID = cycle.rows[0]!.id
    await db.execute(sql`
      INSERT INTO _events_v (parent_id, latest, version_location_venue_name) VALUES (${eventID}, false, 'Old venue')
    `)
    await migrateLocations(args)
    const relations = await db.execute(sql`
      SELECT event.location_id, cycle.event_defaults_location_id, location.venue_name
      FROM events AS event JOIN locations AS location ON location.id = event.location_id
      CROSS JOIN event_cycles AS cycle
      WHERE event.id = ${eventID} AND cycle.id = ${cycleID}
    `)
    expect(relations.rows[0]).toMatchObject({
      location_id: expect.any(Number),
      event_defaults_location_id: relations.rows[0]?.location_id,
      venue_name: 'Common venue',
    })
    const historical = await db.execute(sql`
      SELECT version_location_id, version_legacy_location
      FROM _events_v WHERE parent_id = ${eventID} AND NOT latest
    `)
    expect(historical.rows[0]).toMatchObject({
      version_location_id: null,
      version_legacy_location: { venueName: 'Old venue' },
    })
  } finally {
    await killTransaction(req)
  }
}, 20_000)
