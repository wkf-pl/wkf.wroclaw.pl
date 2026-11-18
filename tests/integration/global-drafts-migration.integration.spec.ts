import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'
import { beforeAll, describe, expect, it } from 'vitest'
import { createLocalReq, getPayload, initTransaction, killTransaction, type Payload } from 'payload'

import config from '@/payload.config'
import {
  down as downGlobalDrafts,
  up as upGlobalDrafts,
} from '../../migrations/20261026_192840_global_drafts_and_content_trash'
import { down as downListingConditions } from '../../migrations/20261030_031527_listing_conditions'
import { down as downListingConsolidation } from '../../migrations/20261031_111620_listing_sources_and_block_consolidation'
import { down as downLegacyBlockRemoval } from '../../migrations/20261031_112000_remove_legacy_carousel_and_member_profiles_blocks'
import { down as downRelatedContent } from '../../migrations/20261102_114056_related_content_listing'
import { down as downPageTemplates } from '../../migrations/20261104_020601_page_templates_collection'
import { down as downContentAudit } from '../../migrations/20261113_112823_content_audit_log'
import { down as downSpacer } from '../../migrations/20261111_150257_spacer_block'
import { down as downUserGroups } from '../../migrations/20261114_015429_user_groups'
import { down as restoreClubSections } from '../../migrations/20261113_220423_remove_club_sections'
import { setPageTemplateCompositionSchema } from '../helpers/page-template-composition-migration'

import { down as downLocations } from '../../migrations/20261115_212154_locations'
import { down as downLocationIndex } from '../../migrations/20261115_212155_index_locations'

import { down as downAuditVersionLinks } from '../../migrations/20261118_095451_content_audit_version_links'

const globalTables = [
  'site_settings',
  'navigation',
  'homepage_hero',
  'homepage_sections',
  'footer',
] as const

let payload: Payload
async function listingConditionsSchemaExists(db: MigrateUpArgs['db']): Promise<boolean> {
  const result = await db.execute(
    sql`SELECT to_regclass('public.homepage_sections_blocks_listing_conditions') IS NOT NULL AS "exists"`,
  )
  return result.rows[0]?.exists === true
}

async function tableExists(db: MigrateUpArgs['db'], table: string): Promise<boolean> {
  const result = await db.execute(
    sql`SELECT to_regclass(${`public.${table}`}) IS NOT NULL AS "exists"`,
  )
  return result.rows[0]?.exists === true
}

async function relatedContentSchemaExists(db: MigrateUpArgs['db']): Promise<boolean> {
  const result = await db.execute(sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'content_listing_items'
        AND column_name = 'related_target_search_index'
    ) AS "exists"
  `)
  return result.rows[0]?.exists === true
}

async function moveToBeforeGlobalDrafts(args: MigrateUpArgs & MigrateDownArgs): Promise<void> {
  const { db } = args
  await downAuditVersionLinks(args)
  await downLocationIndex(args)
  await downLocations(args)
  await downUserGroups(args)
  await restoreClubSections(args)
  await downContentAudit(args)
  if (await tableExists(db, 'page_templates_blocks_spacer')) await downSpacer(args)
  await setPageTemplateCompositionSchema(args, false)
  if (await tableExists(db, 'page_templates')) await downPageTemplates(args)
  if (await relatedContentSchemaExists(db)) await downRelatedContent(args)
  if (!(await tableExists(db, 'pages_blocks_carousel'))) await downLegacyBlockRemoval(args)
  if (await tableExists(db, '_listing_block_migration_provenance')) {
    await downListingConsolidation(args)
  }
  if (await listingConditionsSchemaExists(db)) await downListingConditions(args)
}

async function readGlobalRows(
  db: MigrateUpArgs['db'],
  table: (typeof globalTables)[number],
): Promise<unknown[]> {
  const result = await db.execute(
    sql.raw(
      `SELECT to_jsonb("global_row") - '_status' AS "data" FROM "${table}" AS "global_row" ORDER BY "id"`,
    ),
  )
  return result.rows.map((row) => row.data)
}

beforeAll(async () => {
  payload = await getPayload({ config })
})

describe('global drafts migration', () => {
  it('preserves current global content and marks every row as published', async () => {
    const req = await createLocalReq(
      { context: { skipContentListingSync: true, skipPublicCacheInvalidation: true } },
      payload,
    )
    await initTransaction(req)
    try {
      const transactionId = await req.transactionID
      const db = transactionId == null ? undefined : payload.db.sessions?.[transactionId]?.db
      if (!db) throw new Error('Payload migration transaction was not initialized')
      const args = { db, payload, req } as MigrateUpArgs & MigrateDownArgs

      await moveToBeforeGlobalDrafts(args)
      await downGlobalDrafts(args)
      const contentBeforeMigration = new Map<string, unknown[]>()
      for (const table of globalTables) {
        contentBeforeMigration.set(table, await readGlobalRows(args.db, table))
      }

      await upGlobalDrafts(args)
      for (const table of globalTables) {
        expect(await readGlobalRows(args.db, table)).toEqual(contentBeforeMigration.get(table))

        const statuses = await args.db.execute(
          sql.raw(`SELECT "_status"::text AS "status" FROM "${table}" ORDER BY "id"`),
        )
        expect(statuses.rows.every((row) => row.status === 'published')).toBe(true)
      }
    } finally {
      await killTransaction(req)
    }
  }, 20_000)
})
