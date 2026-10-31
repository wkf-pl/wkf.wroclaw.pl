import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  commitTransaction,
  createLocalReq,
  getPayload,
  initTransaction,
  killTransaction,
  type Payload,
  type PayloadRequest,
} from 'payload'

import config from '@/payload.config'
import {
  down as downConsolidation,
  up as upConsolidation,
} from '../../migrations/20261031_111620_listing_sources_and_block_consolidation'
import {
  down as downRemoval,
  up as upRemoval,
} from '../../migrations/20261031_112000_remove_legacy_carousel_and_member_profiles_blocks'

const pageID = 9_400_001
const pageVersionID = 9_400_002
const memberProfileID = 9_400_003
const liveCarouselID = 'listing-consolidation-live-carousel'
const liveMemberProfilesID = 'listing-consolidation-live-member-profiles'
const versionCarouselUUID = 'listing-consolidation-version-carousel'
const versionMemberProfilesUUID = 'listing-consolidation-version-member-profiles'

let payload: Payload
let migrationRequest: PayloadRequest

function migrationArguments(
  database: MigrateUpArgs['db'] = payload.db.drizzle as MigrateUpArgs['db'],
): MigrateDownArgs & MigrateUpArgs {
  return {
    db: database,
    payload,
    req: migrationRequest,
  } as MigrateDownArgs & MigrateUpArgs
}

async function runMigrationInTransaction(
  migration: (args: MigrateDownArgs & MigrateUpArgs) => Promise<void>,
): Promise<void> {
  try {
    await initTransaction(migrationRequest)
    const transactionID = await migrationRequest.transactionID
    const session = transactionID ? payload.db.sessions?.[transactionID] : undefined
    if (!session) throw new Error('Payload migration transaction was not initialized')

    await migration(migrationArguments(session.db as MigrateUpArgs['db']))
    await commitTransaction(migrationRequest)
  } catch (err) {
    await killTransaction(migrationRequest)
    throw err
  }
}

async function tableExists(table: string): Promise<boolean> {
  const result = await payload.db.drizzle.execute(
    sql`SELECT to_regclass(${`public.${table}`}) IS NOT NULL AS "exists"`,
  )
  return result.rows[0]?.exists === true
}

async function moveToLegacySchema(): Promise<void> {
  if (!(await tableExists('pages_blocks_carousel'))) await downRemoval(migrationArguments())
  if (await tableExists('_listing_block_migration_provenance')) {
    await downConsolidation(migrationArguments())
  }
}

async function moveToCurrentSchema(): Promise<void> {
  if (!(await tableExists('_listing_block_migration_provenance'))) {
    await upConsolidation(migrationArguments())
  }
  if (await tableExists('pages_blocks_carousel')) await upRemoval(migrationArguments())
}

async function removeFixtures(): Promise<void> {
  await payload.db.drizzle.execute(
    sql.raw(`
      DELETE FROM "pages" WHERE "id" = ${pageID};
      DELETE FROM "_pages_v" WHERE "id" = ${pageVersionID};
      DELETE FROM "member_profiles" WHERE "id" = ${memberProfileID};
      DELETE FROM "content_listing_items"
      WHERE "source_document_id" IN (${pageID}, ${memberProfileID});
    `),
  )
}

async function insertLegacyFixtures(): Promise<void> {
  await payload.db.drizzle.execute(
    sql.raw(`
      INSERT INTO "pages" ("id", "title", "slug", "_status")
      VALUES (${pageID}, 'Migration owner', 'migration-owner', 'published');
      INSERT INTO "_pages_v" (
        "id", "parent_id", "version_title", "version_slug", "version__status"
      ) VALUES (
        ${pageVersionID}, ${pageID}, 'Migration owner version', 'migration-owner', 'draft'
      );
      INSERT INTO "member_profiles" (
        "id", "public_name", "slug", "moderator_hidden", "_status"
      ) VALUES (
        ${memberProfileID}, 'Alicja Migracyjna', 'alicja-migracyjna', false, 'published'
      );

      INSERT INTO "pages_blocks_carousel" (
        "_order", "_parent_id", "_path", "id", "selection_mode", "sort",
        "slide_limit", "empty_message", "frame", "surface"
      ) VALUES (
        1, ${pageID}, 'layout.0.columns.0.blocks', '${liveCarouselID}', 'manual',
        'titleAscending', 7, 'Brak slajdów', 'outline', 'default'
      );
      INSERT INTO "pages_blocks_carousel_items" ("_order", "_parent_id", "id")
      VALUES (1, '${liveCarouselID}', 'listing-consolidation-live-carousel-item');
      INSERT INTO "pages_blocks_carousel_sources" ("order", "parent_id", "value")
      VALUES (1, '${liveCarouselID}', 'pages');
      INSERT INTO "pages_blocks_carousel_conditions" (
        "_order", "_parent_id", "id", "field", "operator", "text_value"
      ) VALUES (
        1, '${liveCarouselID}', 'listing-consolidation-live-condition',
        'title', 'contains', 'Migracyjna'
      );
      INSERT INTO "pages_rels" ("parent_id", "path", "pages_id")
      VALUES (
        ${pageID}, 'layout.0.columns.0.blocks.0.items.0.item', ${pageID}
      );

      INSERT INTO "pages_blocks_member_profiles" (
        "_order", "_parent_id", "_path", "id", "view", "frame", "surface"
      ) VALUES (
        2, ${pageID}, 'layout.0.columns.0.blocks', '${liveMemberProfilesID}',
        'grid', 'none', 'transparent'
      );
      INSERT INTO "pages_blocks_member_profiles_entries" (
        "_order", "_parent_id", "id", "profile_id", "context_label"
      ) VALUES
        (1, '${liveMemberProfilesID}', 'listing-consolidation-live-profile-one',
          ${memberProfileID}, 'Prezes Zarządu'),
        (2, '${liveMemberProfilesID}', 'listing-consolidation-live-profile-two',
          ${memberProfileID}, 'Koordynator programu');

      INSERT INTO "_pages_v_blocks_carousel" (
        "_order", "_parent_id", "_path", "_uuid", "selection_mode", "sort",
        "slide_limit", "empty_message", "frame", "surface"
      ) VALUES (
        1, ${pageVersionID}, 'version_layout.0.columns.0.blocks', '${versionCarouselUUID}',
        'manual', 'titleAscending', 6, 'Brak wersji slajdów', 'outline', 'default'
      );
      INSERT INTO "_pages_v_blocks_carousel_items" ("_order", "_parent_id", "_uuid")
      SELECT 1, "id", 'listing-consolidation-version-carousel-item'
      FROM "_pages_v_blocks_carousel" WHERE "_uuid" = '${versionCarouselUUID}';
      INSERT INTO "_pages_v_blocks_carousel_sources" ("order", "parent_id", "value")
      SELECT 1, "id", 'pages' FROM "_pages_v_blocks_carousel"
      WHERE "_uuid" = '${versionCarouselUUID}';
      INSERT INTO "_pages_v_blocks_carousel_conditions" (
        "_order", "_parent_id", "field", "operator", "text_value", "_uuid"
      )
      SELECT 1, "id", 'title', 'contains', 'Wersja',
        'listing-consolidation-version-condition'
      FROM "_pages_v_blocks_carousel" WHERE "_uuid" = '${versionCarouselUUID}';

      INSERT INTO "_pages_v_blocks_member_profiles" (
        "_order", "_parent_id", "_path", "_uuid", "view", "frame", "surface"
      ) VALUES (
        2, ${pageVersionID}, 'version_layout.0.columns.0.blocks',
        '${versionMemberProfilesUUID}', 'list', 'none', 'transparent'
      );
      INSERT INTO "_pages_v_blocks_member_profiles_entries" (
        "_order", "_parent_id", "profile_id", "context_label", "_uuid"
      )
      SELECT 1, "id", ${memberProfileID}, 'Funkcja historyczna',
        'listing-consolidation-version-profile-item'
      FROM "_pages_v_blocks_member_profiles"
      WHERE "_uuid" = '${versionMemberProfilesUUID}';
    `),
  )
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
  await moveToCurrentSchema()
  await removeFixtures()
})

describe('Listing block consolidation migration', () => {
  it('preserves live and versioned Carousel and MemberProfiles data through up, down and up', async () => {
    await moveToLegacySchema()
    await removeFixtures()
    await insertLegacyFixtures()

    await runMigrationInTransaction(upConsolidation)
    await runMigrationInTransaction(upRemoval)

    const convertedLiveBlocks = await payload.db.drizzle.execute(sql`
      SELECT "id", "view"::text AS "view", "page_size"::int AS "pageSize",
        "pagination", "hide_when_empty" AS "hideWhenEmpty"
      FROM "pages_blocks_listing"
      WHERE "id" IN (${liveCarouselID}, ${liveMemberProfilesID})
      ORDER BY "id"
    `)
    expect(convertedLiveBlocks.rows).toEqual([
      {
        hideWhenEmpty: false,
        id: liveCarouselID,
        pageSize: 7,
        pagination: false,
        view: 'carousel',
      },
      {
        hideWhenEmpty: true,
        id: liveMemberProfilesID,
        pageSize: 100,
        pagination: false,
        view: 'grid',
      },
    ])

    const convertedProfileItems = await payload.db.drizzle.execute(sql`
      SELECT item."_order" AS "order", item."context_label" AS "contextLabel",
        relation."member_profiles_id" AS "profileId"
      FROM "pages_blocks_listing_items" item
      JOIN "pages_blocks_listing" block ON block."id" = item."_parent_id"
      LEFT JOIN "pages_rels" relation
        ON relation."parent_id" = block."_parent_id"
        AND relation."path" = block."_path" || '.' || (block."_order" - 1)
          || '.items.' || (item."_order" - 1) || '.item'
      WHERE item."_parent_id" = ${liveMemberProfilesID}
      ORDER BY item."_order"
    `)
    expect(convertedProfileItems.rows).toEqual([
      { contextLabel: 'Prezes Zarządu', order: 1, profileId: memberProfileID },
      { contextLabel: 'Koordynator programu', order: 2, profileId: memberProfileID },
    ])

    const convertedVersionBlocks = await payload.db.drizzle.execute(sql`
      SELECT "_uuid" AS "uuid", "view"::text AS "view",
        "hide_when_empty" AS "hideWhenEmpty"
      FROM "_pages_v_blocks_listing"
      WHERE "_uuid" IN (${versionCarouselUUID}, ${versionMemberProfilesUUID})
      ORDER BY "_uuid"
    `)
    expect(convertedVersionBlocks.rows).toEqual([
      { hideWhenEmpty: false, uuid: versionCarouselUUID, view: 'carousel' },
      { hideWhenEmpty: true, uuid: versionMemberProfilesUUID, view: 'compact' },
    ])
    expect(await tableExists('_listing_block_migration_provenance')).toBe(true)
    expect(await tableExists('pages_blocks_carousel')).toBe(false)

    await runMigrationInTransaction(downRemoval)
    await runMigrationInTransaction(downConsolidation)

    const restoredCarousel = await payload.db.drizzle.execute(sql`
      SELECT "id", "slide_limit"::int AS "slideLimit", "empty_message" AS "emptyMessage"
      FROM "pages_blocks_carousel" WHERE "id" = ${liveCarouselID}
    `)
    expect(restoredCarousel.rows).toEqual([
      { emptyMessage: 'Brak slajdów', id: liveCarouselID, slideLimit: 7 },
    ])

    const restoredProfiles = await payload.db.drizzle.execute(sql`
      SELECT entry."_order" AS "order", entry."context_label" AS "contextLabel",
        entry."profile_id" AS "profileId"
      FROM "pages_blocks_member_profiles_entries" entry
      WHERE entry."_parent_id" = ${liveMemberProfilesID}
      ORDER BY entry."_order"
    `)
    expect(restoredProfiles.rows).toEqual([
      { contextLabel: 'Prezes Zarządu', order: 1, profileId: memberProfileID },
      { contextLabel: 'Koordynator programu', order: 2, profileId: memberProfileID },
    ])
    expect(await tableExists('_listing_block_migration_provenance')).toBe(false)

    await runMigrationInTransaction(upConsolidation)
    await runMigrationInTransaction(upRemoval)

    expect(await tableExists('pages_blocks_carousel')).toBe(false)
    const repeatedConversion = await payload.db.drizzle.execute(sql`
      SELECT count(*)::int AS "count"
      FROM "pages_blocks_listing"
      WHERE "id" IN (${liveCarouselID}, ${liveMemberProfilesID})
    `)
    expect(repeatedConversion.rows).toEqual([{ count: 2 }])
  }, 20_000)
})
