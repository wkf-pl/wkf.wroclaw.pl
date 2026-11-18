import { sql, type MigrateUpArgs } from '@payloadcms/db-postgres'

import { normalizeGoogleMapsEmbed } from '../../src/modules/events/map-embed'
import { validatePostalCode, validateVenueWebsite } from '../../src/modules/events/validation'

const sourceTables = [
  { table: 'events', prefix: '', version: false },
  { table: 'event_cycles', prefix: 'event_defaults_', version: false },
  { table: '_events_v', prefix: 'version_', version: true },
  { table: '_event_cycles_v', prefix: 'version_event_defaults_', version: true },
] as const

const columns = {
  venueName: 'venue_name',
  venueWebsite: 'venue_website',
  streetAddress: 'street_address',
  postalCode: 'postal_code',
  city: 'city',
  country: 'country',
  mapEmbedURL: 'map_embed_u_r_l',
} as const

type LocationFields = Record<keyof typeof columns, string | null>
type LegacyRow = LocationFields & { id: number; current: boolean; parentID: number }
type Database = Pick<MigrateUpArgs['db'], 'execute'>

function normalize(row: LegacyRow): LocationFields | null {
  const venueName = row.venueName?.trim() || null
  const venueWebsite = row.venueWebsite?.trim() || null
  const streetAddress = row.streetAddress?.trim() || null
  const postalCode = row.postalCode?.trim() || null
  const city = row.city?.trim() || null
  const country = row.country?.trim() || null
  const mapInput = row.mapEmbedURL?.trim() || null
  if (
    !venueName &&
    !venueWebsite &&
    !streetAddress &&
    !postalCode &&
    !mapInput &&
    (!city || city === 'Wrocław') &&
    (!country || country === 'Polska')
  )
    return null

  return {
    venueName,
    venueWebsite,
    streetAddress,
    postalCode,
    city,
    country,
    mapEmbedURL: normalizeGoogleMapsEmbed(mapInput),
  }
}

function invalidFields(location: LocationFields): string[] {
  const required = [
    'venueName',
    'streetAddress',
    'postalCode',
    'city',
    'country',
    'mapEmbedURL',
  ] as const
  return [
    ...required.filter((field) => !location[field]),
    ...(location.venueWebsite && validateVenueWebsite(location.venueWebsite) !== true
      ? ['venueWebsite']
      : []),
    ...(location.country?.toLowerCase() === 'polska' &&
    location.postalCode &&
    validatePostalCode(location.postalCode) !== true
      ? ['postalCode']
      : []),
  ]
}

async function scanLegacyLocations(db: Database) {
  const entries = []
  for (const source of sourceTables) {
    const fields = Object.entries(columns).map(
      ([key, column]) =>
        sql`${sql.identifier(source.prefix + 'location_' + column)} AS ${sql.identifier(key)}`,
    )
    const result = await db.execute<LegacyRow>(sql`
      SELECT id, ${source.version ? sql`parent_id` : sql`id`} AS "parentID",
        ${source.version ? sql`coalesce(latest, false)` : sql`true`} AS current,
        ${sql.join(fields, sql`, `)}
      FROM ${sql.identifier(source.table)}
      ORDER BY id
    `)
    for (const row of result.rows) {
      const location = normalize(row)
      if (!location) continue
      entries.push({ source, row, location, missingFields: invalidFields(location) })
    }
  }
  return entries
}

export async function reportLegacyLocationIssues(db: Database) {
  const entries = await scanLegacyLocations(db)
  return entries
    .filter(({ missingFields }) => missingFields.length)
    .map(({ source, row, missingFields }) => ({
      table: source.table,
      id: row.id,
      parentID: row.parentID,
      blocksMigration: row.current,
      fields: missingFields,
    }))
}

export async function migrateLegacyLocations(db: Database): Promise<void> {
  const entries = await scanLegacyLocations(db)
  const blockers = entries.filter(({ row, missingFields }) => row.current && missingFields.length)
  if (blockers.length) {
    const details = blockers
      .slice(0, 20)
      .map(
        ({ source, row, missingFields }) =>
          `${source.table} #${row.id} (document #${row.parentID}): ${missingFields.join(', ')}`,
      )
    throw new Error(
      `${blockers.length} current location records need correction. Run pnpm exec tsx scripts/report-legacy-locations.ts for the full list.\n${details.join('\n')}`,
    )
  }

  const locationIDs = new Map<string, number>()
  for (const { source, row, location, missingFields } of entries) {
    if (missingFields.length) {
      const { id: _id, current: _current, parentID: _parentID, ...originalLocation } = row
      await db.execute(sql`
        UPDATE ${sql.identifier(source.table)}
        SET ${sql.identifier(source.prefix + 'legacy_location')} = ${JSON.stringify(originalLocation)}::jsonb
        WHERE id = ${row.id}
      `)
      continue
    }
    const key = JSON.stringify(location)
    let locationID = locationIDs.get(key)
    if (locationID === undefined) {
      const result = await db.execute<{ id: number }>(sql`
        INSERT INTO locations (venue_name, venue_website, street_address, postal_code, city, country, map_embed_u_r_l, _status)
        VALUES (${location.venueName}, ${location.venueWebsite}, ${location.streetAddress}, ${location.postalCode},
          ${location.city}, ${location.country}, ${location.mapEmbedURL}, 'published')
        RETURNING id
      `)
      locationID = result.rows[0]!.id
      locationIDs.set(key, locationID)
      await db.execute(sql`
        INSERT INTO _locations_v (
          parent_id, version_venue_name, version_venue_website, version_street_address, version_postal_code,
          version_city, version_country, version_map_embed_u_r_l, version_created_at, version_updated_at,
          version__status, latest
        ) SELECT id, venue_name, venue_website, street_address, postal_code, city, country, map_embed_u_r_l,
          created_at, updated_at, 'published', true FROM locations WHERE id = ${locationID}
      `)
    }
    await db.execute(sql`
      UPDATE ${sql.identifier(source.table)} SET ${sql.identifier(source.prefix + 'location_id')} = ${locationID}
      WHERE id = ${row.id}
    `)
  }
}

export async function restoreLegacyLocationColumns(db: Database): Promise<void> {
  for (const source of sourceTables) {
    const locationID = sql.identifier(source.prefix + 'location_id')
    const archive = sql.identifier(source.prefix + 'legacy_location')
    const fields = Object.entries(columns).map(
      ([key, column]) => sql`
      ${sql.identifier(source.prefix + 'location_' + column)} = CASE
        WHEN target.${archive} IS NOT NULL THEN target.${archive}->>${key}
        ELSE (SELECT ${sql.identifier(column)} FROM locations WHERE id = target.${locationID})
      END
    `,
    )
    await db.execute(sql`
      UPDATE ${sql.identifier(source.table)} AS target SET ${sql.join(fields, sql`, `)}
      WHERE target.${archive} IS NOT NULL OR target.${locationID} IS NOT NULL
    `)
  }
}
