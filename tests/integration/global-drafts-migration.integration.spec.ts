import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createLocalReq, getPayload, type Payload, type PayloadRequest } from 'payload'

import config from '@/payload.config'
import {
  down as downGlobalDrafts,
  up as upGlobalDrafts,
} from '../../migrations/20261026_192840_global_drafts_and_content_trash'
import {
  down as downListingConditions,
  up as upListingConditions,
} from '../../migrations/20261030_031527_listing_conditions'
import {
  down as downListingConsolidation,
  up as upListingConsolidation,
} from '../../migrations/20261031_111620_listing_sources_and_block_consolidation'
import {
  down as downLegacyBlockRemoval,
  up as upLegacyBlockRemoval,
} from '../../migrations/20261031_112000_remove_legacy_carousel_and_member_profiles_blocks'

const globalTables = [
  'site_settings',
  'navigation',
  'homepage_hero',
  'homepage_sections',
  'footer',
] as const

let payload: Payload
let migrationRequest: PayloadRequest

function migrationArguments(): MigrateDownArgs & MigrateUpArgs {
  return {
    db: payload.db.drizzle,
    payload,
    req: migrationRequest,
  } as MigrateDownArgs & MigrateUpArgs
}

async function statusColumnExists(): Promise<boolean> {
  const result = await payload.db.drizzle.execute(sql`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'site_settings'
        AND column_name = '_status'
    ) AS "exists"
  `)
  return result.rows[0]?.exists === true
}

async function listingConditionsSchemaExists(): Promise<boolean> {
  const result = await payload.db.drizzle.execute(
    sql`SELECT to_regclass('public.homepage_sections_blocks_listing_conditions') IS NOT NULL AS "exists"`,
  )
  return result.rows[0]?.exists === true
}

async function tableExists(table: string): Promise<boolean> {
  const result = await payload.db.drizzle.execute(
    sql`SELECT to_regclass(${`public.${table}`}) IS NOT NULL AS "exists"`,
  )
  return result.rows[0]?.exists === true
}

async function moveToBeforeGlobalDrafts(): Promise<void> {
  if (!(await tableExists('pages_blocks_carousel'))) {
    await downLegacyBlockRemoval(migrationArguments())
  }
  if (await tableExists('_listing_block_migration_provenance')) {
    await downListingConsolidation(migrationArguments())
  }
  if (await listingConditionsSchemaExists()) {
    await downListingConditions(migrationArguments())
  }
}

async function restoreCurrentSchema(): Promise<void> {
  if (!(await statusColumnExists())) await upGlobalDrafts(migrationArguments())
  if (!(await listingConditionsSchemaExists())) await upListingConditions(migrationArguments())
  if (!(await tableExists('_listing_block_migration_provenance'))) {
    await upListingConsolidation(migrationArguments())
  }
  if (await tableExists('pages_blocks_carousel')) {
    await upLegacyBlockRemoval(migrationArguments())
  }
}

async function readGlobalRows(table: (typeof globalTables)[number]): Promise<unknown[]> {
  const result = await payload.db.drizzle.execute(
    sql.raw(
      `SELECT to_jsonb("global_row") - '_status' AS "data" FROM "${table}" AS "global_row" ORDER BY "id"`,
    ),
  )
  return result.rows.map((row) => row.data)
}

beforeAll(async () => {
  payload = await getPayload({ config })
  migrationRequest = await createLocalReq(
    { context: { skipContentListingSync: true, skipPublicCacheInvalidation: true } },
    payload,
  )
})

afterAll(async () => {
  if (!payload) return
  await restoreCurrentSchema()
})

describe('global drafts migration', () => {
  it('preserves current global content and marks every row as published', async () => {
    await moveToBeforeGlobalDrafts()
    await downGlobalDrafts(migrationArguments())

    const contentBeforeMigration = new Map<string, unknown[]>()
    for (const table of globalTables) {
      contentBeforeMigration.set(table, await readGlobalRows(table))
    }

    await upGlobalDrafts(migrationArguments())
    await upListingConditions(migrationArguments())
    await upListingConsolidation(migrationArguments())
    await upLegacyBlockRemoval(migrationArguments())

    for (const table of globalTables) {
      expect(await readGlobalRows(table)).toEqual(contentBeforeMigration.get(table))

      const statuses = await payload.db.drizzle.execute(
        sql.raw(`SELECT "_status"::text AS "status" FROM "${table}" ORDER BY "id"`),
      )
      expect(statuses.rows.every((row) => row.status === 'published')).toBe(true)
    }
  })
})
