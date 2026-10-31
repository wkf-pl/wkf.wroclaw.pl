import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createLocalReq, getPayload, type Payload, type PayloadRequest } from 'payload'

import config from '@/payload.config'
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

const fixtureId = 9_300_001
const fixtureVersionId = 9_300_002
const listingBlockId = 'listing-conditions-migration-listing'
const carouselBlockId = 'listing-conditions-migration-carousel'

let payload: Payload
let migrationRequest: PayloadRequest

function migrationArguments(): MigrateDownArgs & MigrateUpArgs {
  return {
    db: payload.db.drizzle,
    payload,
    req: migrationRequest,
  } as MigrateDownArgs & MigrateUpArgs
}

async function conditionsSchemaExists(): Promise<boolean> {
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

async function removeLegacyFixtures(): Promise<void> {
  await payload.db.drizzle.execute(
    sql.raw(`
      DELETE FROM "homepage_sections" WHERE "id" = ${fixtureId};
      DELETE FROM "_homepage_sections_v" WHERE "id" = ${fixtureVersionId};
      DELETE FROM "pages" WHERE "id" = ${fixtureId};
      DELETE FROM "event_cycles" WHERE "id" = ${fixtureId};
      DELETE FROM "categories" WHERE "id" = ${fixtureId};
      DELETE FROM "tags" WHERE "id" = ${fixtureId};
      DELETE FROM "content_listing_items" WHERE "source_document_id" = ${fixtureId};
    `),
  )
}

async function moveToBeforeListingConditions(): Promise<void> {
  if (!(await tableExists('pages_blocks_carousel'))) {
    await downLegacyBlockRemoval(migrationArguments())
  }
  if (await tableExists('_listing_block_migration_provenance')) {
    await downListingConsolidation(migrationArguments())
  }
  if (await conditionsSchemaExists()) {
    await payload.db.drizzle.execute(
      sql.raw(`
      DELETE FROM "homepage_sections_blocks_listing_conditions"
      WHERE "text_value" = 'rollback guard';
    `),
    )
    await downListingConditions(migrationArguments())
  }
}

async function restoreCurrentSchema(): Promise<void> {
  await moveToBeforeListingConditions()
  await removeLegacyFixtures()
  await upListingConditions(migrationArguments())
  await upListingConsolidation(migrationArguments())
  await upLegacyBlockRemoval(migrationArguments())
}

beforeAll(async () => {
  payload = await getPayload({ config })
  migrationRequest = await createLocalReq(
    { context: { skipContentListingSync: true, skipPublicCacheInvalidation: true } },
    payload,
  )
})

afterAll(async () => {
  if (payload) await restoreCurrentSchema()
})

describe('listing conditions migration', () => {
  it('backfills live, versioned, Listing, Carousel, and homepage data and rejects lossy rollback', async () => {
    await moveToBeforeListingConditions()

    await payload.db.drizzle.execute(
      sql.raw(`
      INSERT INTO "categories" ("id", "name", "slug")
      VALUES (${fixtureId}, 'Migration category', 'migration-category');
      INSERT INTO "tags" ("id", "name", "slug")
      VALUES (${fixtureId}, 'Migration tag', 'migration-tag');
      INSERT INTO "pages" ("id", "title", "slug", "_status")
      VALUES (${fixtureId}, 'Migration page', 'migration-page', 'published');
      INSERT INTO "_pages_v" ("id", "parent_id", "version_title", "version_slug", "version__status")
      VALUES (${fixtureVersionId}, ${fixtureId}, 'Migration page version', 'migration-page', 'draft');
      INSERT INTO "event_cycles" ("id", "title", "slug", "_status")
      VALUES (${fixtureId}, 'Migration cycle', 'migration-cycle', 'published');
      INSERT INTO "_event_cycles_v" ("id", "parent_id", "version_title", "version_slug", "version__status")
      VALUES (${fixtureVersionId}, ${fixtureId}, 'Migration cycle version', 'migration-cycle', 'draft');
      INSERT INTO "homepage_sections" ("id") VALUES (${fixtureId});
      INSERT INTO "_homepage_sections_v" ("id") VALUES (${fixtureVersionId});

      INSERT INTO "pages_blocks_listing"
        ("_order", "_parent_id", "_path", "id", "selection_mode", "parent_filter")
      VALUES (0, ${fixtureId}, 'layout', '${listingBlockId}', 'filters', 'current');
      INSERT INTO "pages_blocks_listing_sources" ("order", "parent_id", "value")
      VALUES (0, '${listingBlockId}', 'pages');

      INSERT INTO "_pages_v_blocks_carousel"
        ("_order", "_parent_id", "_path", "id", "_uuid", "selection_mode", "parent_filter")
      VALUES (0, ${fixtureVersionId}, 'version_layout', ${fixtureVersionId}, '${carouselBlockId}', 'filters', 'current');
      INSERT INTO "_pages_v_blocks_carousel_sources" ("order", "parent_id", "value")
      VALUES (0, ${fixtureVersionId}, 'pages');

      INSERT INTO "event_cycles_blocks_listing"
        ("_order", "_parent_id", "_path", "id", "selection_mode")
      VALUES (0, ${fixtureId}, 'layout', '${listingBlockId}', 'filters');
      INSERT INTO "event_cycles_blocks_listing_sources" ("order", "parent_id", "value")
      VALUES (0, '${listingBlockId}', 'events');

      INSERT INTO "_event_cycles_v_blocks_carousel"
        ("_order", "_parent_id", "_path", "id", "_uuid", "selection_mode")
      VALUES (0, ${fixtureVersionId}, 'version_layout', ${fixtureVersionId}, '${carouselBlockId}', 'filters');
      INSERT INTO "_event_cycles_v_blocks_carousel_sources" ("order", "parent_id", "value")
      VALUES (0, ${fixtureVersionId}, 'events');

      INSERT INTO "homepage_sections_blocks_listing"
        ("_order", "_parent_id", "_path", "id", "selection_mode", "category_id", "tag_id",
          "event_cycle_id", "event_time_filter", "max_age_days")
      VALUES (0, ${fixtureId}, 'layout', '${listingBlockId}', 'filters', ${fixtureId}, ${fixtureId},
        ${fixtureId}, 'upcoming', 30);
      INSERT INTO "homepage_sections_blocks_listing_sources" ("order", "parent_id", "value")
      VALUES
        (0, '${listingBlockId}', 'pages'),
        (1, '${listingBlockId}', 'posts'),
        (2, '${listingBlockId}', 'events');

      INSERT INTO "_homepage_sections_v_blocks_carousel"
        ("_order", "_parent_id", "_path", "id", "_uuid", "selection_mode", "category_id", "tag_id")
      VALUES (0, ${fixtureVersionId}, 'version_layout', ${fixtureVersionId}, '${carouselBlockId}',
        'filters', ${fixtureId}, ${fixtureId});
      INSERT INTO "_homepage_sections_v_blocks_carousel_sources" ("order", "parent_id", "value")
      VALUES (0, ${fixtureVersionId}, 'posts');

      INSERT INTO "content_listing_items"
        ("source", "source_document_id", "source_updated_at", "title", "url", "has_significant_date")
      VALUES ('pages', ${fixtureId}, now(), '  ZAŻÓŁĆ ＧĘŚLĄ  ', '/migration-page', false);
    `),
    )

    await upListingConditions(migrationArguments())

    const homepageConditions = await payload.db.drizzle.execute(sql`
      SELECT "field"::text AS "field", "operator"::text AS "operator",
        "number_value"::int AS "numberValue", "event_time_value"::text AS "eventTimeValue"
      FROM "homepage_sections_blocks_listing_conditions"
      WHERE "_parent_id" = ${listingBlockId}
      ORDER BY "_order"
    `)
    expect(homepageConditions.rows).toEqual([
      { eventTimeValue: null, field: 'category', numberValue: null, operator: 'inSubtree' },
      { eventTimeValue: null, field: 'tag', numberValue: null, operator: 'contains' },
      { eventTimeValue: null, field: 'eventCycle', numberValue: null, operator: 'equals' },
      { eventTimeValue: 'upcoming', field: 'eventTime', numberValue: null, operator: 'equals' },
      {
        eventTimeValue: null,
        field: 'significantDate',
        numberValue: 30,
        operator: 'notOlderThan',
      },
    ])

    const concretizedRelationships = await payload.db.drizzle.execute(sql`
      SELECT 'page-live' AS "fixture", "pages_id" AS "relationshipId"
      FROM "pages_rels"
      WHERE "path" LIKE 'layout.0.conditions.%.relationshipValue'
      UNION ALL
      SELECT 'page-version', "pages_id" FROM "_pages_v_rels"
      WHERE "path" LIKE 'version_layout.0.conditions.%.relationshipValue'
      UNION ALL
      SELECT 'cycle-live', "event_cycles_id" FROM "event_cycles_rels"
      WHERE "path" LIKE 'layout.0.conditions.%.relationshipValue'
      UNION ALL
      SELECT 'cycle-version', "event_cycles_id" FROM "_event_cycles_v_rels"
      WHERE "path" LIKE 'version_layout.0.conditions.%.relationshipValue'
      ORDER BY "fixture"
    `)
    expect(concretizedRelationships.rows).toEqual([
      { fixture: 'cycle-live', relationshipId: fixtureId },
      { fixture: 'cycle-version', relationshipId: fixtureId },
      { fixture: 'page-live', relationshipId: fixtureId },
      { fixture: 'page-version', relationshipId: fixtureId },
    ])

    const normalizedTitle = await payload.db.drizzle.execute(sql`
      SELECT "normalized_title" AS "normalizedTitle"
      FROM "content_listing_items" WHERE "source_document_id" = ${fixtureId}
    `)
    expect(normalizedTitle.rows[0]?.normalizedTitle).toBe('zażółć gęślą')

    await downListingConditions(migrationArguments())

    const restoredLegacyValues = await payload.db.drizzle.execute(sql`
      SELECT "category_id" AS "categoryId", "tag_id" AS "tagId",
        "event_cycle_id" AS "eventCycleId", "event_time_filter"::text AS "eventTimeFilter",
        "max_age_days"::int AS "maxAgeDays"
      FROM "homepage_sections_blocks_listing" WHERE "id" = ${listingBlockId}
    `)
    expect(restoredLegacyValues.rows).toEqual([
      {
        categoryId: fixtureId,
        eventCycleId: fixtureId,
        eventTimeFilter: 'upcoming',
        maxAgeDays: 30,
        tagId: fixtureId,
      },
    ])

    const restoredCurrentPage = await payload.db.drizzle.execute(sql`
      SELECT "parent_filter"::text AS "parentFilter", "parent_page_id" AS "parentPageId"
      FROM "pages_blocks_listing" WHERE "id" = ${listingBlockId}
    `)
    expect(restoredCurrentPage.rows).toEqual([
      { parentFilter: 'specific', parentPageId: fixtureId },
    ])

    await upListingConditions(migrationArguments())
    await payload.db.drizzle.execute(sql`
      INSERT INTO "homepage_sections_blocks_listing_conditions"
        ("_order", "_parent_id", "id", "field", "operator", "text_value")
      VALUES (9, ${listingBlockId}, 'non-representable-title-condition', 'title', 'contains', 'rollback guard')
    `)

    await expect(downListingConditions(migrationArguments())).rejects.toThrow(
      /no lossless legacy representation/,
    )
  })
})
