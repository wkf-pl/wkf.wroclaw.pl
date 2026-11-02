import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

const contentOwnerPrefixes = [
  'pages',
  'posts',
  'events',
  'event_cycles',
  'partners',
  'homepage_sections',
] as const

type MigrationDatabase = MigrateDownArgs['db'] | MigrateUpArgs['db']

function quoteIdentifier(identifier: string): string {
  return `"${identifier.replaceAll('"', '""')}"`
}

function enumName(prefix: string, block: string, field: string): string {
  return quoteIdentifier(`enum_${prefix}_blocks_${block}_${field}`)
}

function tableName(prefix: string, suffix: string): string {
  return quoteIdentifier(`${prefix}_${suffix}`)
}

function unsupportedListingSourcesStatement(prefix: string): string {
  const listingSources = tableName(prefix, 'blocks_listing_sources')

  return `
    DO $migration$
    DECLARE
      unsupported_source text;
    BEGIN
      SELECT value::text INTO unsupported_source
      FROM ${listingSources}
      WHERE value::text IN ('partners', 'member-profiles')
      LIMIT 1;

      IF unsupported_source IS NOT NULL THEN
        RAISE EXCEPTION
          'Cannot roll back Listing consolidation: native Listing in ${listingSources} uses unsupported source %',
          unsupported_source;
      END IF;
    END
    $migration$;
  `
}

async function execute(database: MigrationDatabase, statement: string): Promise<void> {
  await database.execute(sql.raw(statement))
}

async function createProvenanceTable(database: MigrationDatabase): Promise<void> {
  await execute(
    database,
    `
      CREATE TABLE "_listing_block_migration_provenance" (
        "owner_prefix" varchar NOT NULL,
        "versioned" boolean NOT NULL,
        "legacy_type" varchar NOT NULL,
        "legacy_id" varchar NOT NULL,
        "listing_id" varchar NOT NULL,
        PRIMARY KEY ("owner_prefix", "versioned", "legacy_type", "legacy_id"),
        CONSTRAINT "_listing_block_migration_provenance_type_check"
          CHECK ("legacy_type" IN ('carousel', 'memberProfiles'))
      );
    `,
  )
}

function livePreflightStatement(prefix: string): string {
  const listing = tableName(prefix, 'blocks_listing')
  const listingItems = tableName(prefix, 'blocks_listing_items')
  const listingConditions = tableName(prefix, 'blocks_listing_conditions')
  const carousel = tableName(prefix, 'blocks_carousel')
  const carouselItems = tableName(prefix, 'blocks_carousel_items')
  const carouselConditions = tableName(prefix, 'blocks_carousel_conditions')
  const memberProfiles = tableName(prefix, 'blocks_member_profiles')
  const memberProfileEntries = tableName(prefix, 'blocks_member_profiles_entries')

  return `
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM ${carousel} legacy JOIN ${listing} target ON target.id = legacy.id
        UNION ALL
        SELECT 1 FROM ${memberProfiles} legacy JOIN ${listing} target ON target.id = legacy.id
        UNION ALL
        SELECT 1 FROM ${carousel} carousel_block
        JOIN ${memberProfiles} profile_block ON profile_block.id = carousel_block.id
      ) THEN
        RAISE EXCEPTION 'Cannot consolidate ${prefix} blocks: a target Listing block ID already exists';
      END IF;

      IF EXISTS (
        SELECT 1 FROM ${carouselItems} legacy JOIN ${listingItems} target ON target.id = legacy.id
        UNION ALL
        SELECT 1 FROM ${memberProfileEntries} legacy JOIN ${listingItems} target ON target.id = legacy.id
        UNION ALL
        SELECT 1
        FROM ${carouselItems} carousel_item
        JOIN ${memberProfileEntries} profile_item ON profile_item.id = carousel_item.id
      ) THEN
        RAISE EXCEPTION 'Cannot consolidate ${prefix} blocks: a target Listing item ID already exists';
      END IF;

      IF EXISTS (
        SELECT 1 FROM ${carouselConditions} legacy JOIN ${listingConditions} target ON target.id = legacy.id
      ) THEN
        RAISE EXCEPTION 'Cannot consolidate ${prefix} blocks: a target Listing condition ID already exists';
      END IF;

      IF EXISTS (
        SELECT 1
        FROM ${memberProfileEntries}
        GROUP BY _parent_id
        HAVING count(*) > 100
      ) THEN
        RAISE EXCEPTION 'Cannot consolidate ${prefix} MemberProfiles block: more than 100 entries';
      END IF;
    END
    $$;
  `
}

function versionPreflightStatement(prefix: string): string {
  const memberProfileEntries = tableName(prefix, 'blocks_member_profiles_entries')

  return `
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM ${memberProfileEntries}
        GROUP BY _parent_id
        HAVING count(*) > 100
      ) THEN
        RAISE EXCEPTION 'Cannot consolidate ${prefix} MemberProfiles block: more than 100 entries';
      END IF;
    END
    $$;
  `
}

function insertLiveCarouselStatement(prefix: string): string {
  const listing = tableName(prefix, 'blocks_listing')
  const listingItems = tableName(prefix, 'blocks_listing_items')
  const listingSources = tableName(prefix, 'blocks_listing_sources')
  const listingConditions = tableName(prefix, 'blocks_listing_conditions')
  const carousel = tableName(prefix, 'blocks_carousel')
  const carouselItems = tableName(prefix, 'blocks_carousel_items')
  const carouselSources = tableName(prefix, 'blocks_carousel_sources')
  const carouselConditions = tableName(prefix, 'blocks_carousel_conditions')

  return `
    INSERT INTO "_listing_block_migration_provenance"
      (owner_prefix, versioned, legacy_type, legacy_id, listing_id)
    SELECT '${prefix}', false, 'carousel', id, id FROM ${carousel};

    INSERT INTO ${listing} (
      _order, _parent_id, _path, id, sort, view, page_size, pagination,
      empty_message, block_name, frame, surface, surface_image_id,
      surface_horizontal_position, surface_vertical_position, selection_mode,
      hide_when_empty
    )
    SELECT
      _order, _parent_id, _path, id,
      sort::text::${enumName(prefix, 'listing', 'sort')},
      'carousel'::${enumName(prefix, 'listing', 'view')},
      slide_limit, false, empty_message, block_name, frame, surface,
      surface_image_id, surface_horizontal_position, surface_vertical_position,
      selection_mode::text::${enumName(prefix, 'listing', 'selection_mode')},
      false
    FROM ${carousel};

    INSERT INTO ${listingItems} (_order, _parent_id, id, context_label)
    SELECT _order, _parent_id, id, NULL FROM ${carouselItems};

    INSERT INTO ${listingSources} ("order", parent_id, value)
    SELECT "order", parent_id, value::text::${enumName(prefix, 'listing', 'sources')}
    FROM ${carouselSources};

    INSERT INTO ${listingConditions} (
      _order, _parent_id, id, field, operator, text_value, number_value,
      event_time_value, date_value, end_date_value
    )
    SELECT
      _order, _parent_id, id,
      field::text::${enumName(prefix, 'listing_conditions', 'field')},
      operator::text::${enumName(prefix, 'listing_conditions', 'operator')},
      text_value, number_value, event_time_value, date_value, end_date_value
    FROM ${carouselConditions};

    DELETE FROM ${carousel};
  `
}

function insertLiveMemberProfilesStatement(prefix: string): string {
  const listing = tableName(prefix, 'blocks_listing')
  const listingItems = tableName(prefix, 'blocks_listing_items')
  const memberProfiles = tableName(prefix, 'blocks_member_profiles')
  const memberProfileEntries = tableName(prefix, 'blocks_member_profiles_entries')
  const relations = tableName(prefix, 'rels')

  return `
    INSERT INTO "_listing_block_migration_provenance"
      (owner_prefix, versioned, legacy_type, legacy_id, listing_id)
    SELECT '${prefix}', false, 'memberProfiles', id, id FROM ${memberProfiles};

    INSERT INTO ${listing} (
      _order, _parent_id, _path, id, sort, view, page_size, pagination,
      empty_message, block_name, frame, surface, surface_image_id,
      surface_horizontal_position, surface_vertical_position, selection_mode,
      hide_when_empty
    )
    SELECT
      _order, _parent_id, _path, id,
      'titleAscending'::${enumName(prefix, 'listing', 'sort')},
      CASE view::text
        WHEN 'card' THEN 'cards'
        WHEN 'list' THEN 'compact'
        ELSE 'grid'
      END::${enumName(prefix, 'listing', 'view')},
      100, false, NULL, block_name, frame, surface, surface_image_id,
      surface_horizontal_position, surface_vertical_position,
      'manual'::${enumName(prefix, 'listing', 'selection_mode')},
      true
    FROM ${memberProfiles};

    INSERT INTO ${listingItems} (_order, _parent_id, id, context_label)
    SELECT _order, _parent_id, id, context_label FROM ${memberProfileEntries};

    INSERT INTO ${relations} (parent_id, path, member_profiles_id)
    SELECT
      block._parent_id,
      block._path || '.' || (block._order - 1) || '.items.' || (entry._order - 1) || '.item',
      entry.profile_id
    FROM ${memberProfiles} block
    JOIN ${memberProfileEntries} entry ON entry._parent_id = block.id
    WHERE entry.profile_id IS NOT NULL;

    DELETE FROM ${memberProfiles};
  `
}

function insertVersionCarouselStatement(prefix: string): string {
  const listing = tableName(prefix, 'blocks_listing')
  const listingItems = tableName(prefix, 'blocks_listing_items')
  const listingSources = tableName(prefix, 'blocks_listing_sources')
  const listingConditions = tableName(prefix, 'blocks_listing_conditions')
  const carousel = tableName(prefix, 'blocks_carousel')
  const carouselItems = tableName(prefix, 'blocks_carousel_items')
  const carouselSources = tableName(prefix, 'blocks_carousel_sources')
  const carouselConditions = tableName(prefix, 'blocks_carousel_conditions')

  return `
    INSERT INTO ${listing} (
      _order, _parent_id, _path, sort, view, page_size, pagination,
      empty_message, _uuid, block_name, frame, surface, surface_image_id,
      surface_horizontal_position, surface_vertical_position, selection_mode,
      hide_when_empty
    )
    SELECT
      _order, _parent_id, _path,
      sort::text::${enumName(prefix, 'listing', 'sort')},
      'carousel'::${enumName(prefix, 'listing', 'view')},
      slide_limit, false, empty_message, _uuid, block_name, frame, surface,
      surface_image_id, surface_horizontal_position, surface_vertical_position,
      selection_mode::text::${enumName(prefix, 'listing', 'selection_mode')},
      false
    FROM ${carousel};

    INSERT INTO "_listing_block_migration_provenance"
      (owner_prefix, versioned, legacy_type, legacy_id, listing_id)
    SELECT '${prefix}', true, 'carousel', legacy.id::text, target.id::text
    FROM ${carousel} legacy
    JOIN ${listing} target
      ON target._parent_id = legacy._parent_id
      AND target._path = legacy._path
      AND target._order = legacy._order
      AND target._uuid IS NOT DISTINCT FROM legacy._uuid;

    INSERT INTO ${listingItems} (_order, _parent_id, _uuid, context_label)
    SELECT item._order, provenance.listing_id::integer, item._uuid, NULL
    FROM ${carouselItems} item
    JOIN "_listing_block_migration_provenance" provenance
      ON provenance.owner_prefix = '${prefix}'
      AND provenance.versioned = true
      AND provenance.legacy_type = 'carousel'
      AND provenance.legacy_id = item._parent_id::text;

    INSERT INTO ${listingSources} ("order", parent_id, value)
    SELECT
      source."order", provenance.listing_id::integer,
      source.value::text::${enumName(prefix, 'listing', 'sources')}
    FROM ${carouselSources} source
    JOIN "_listing_block_migration_provenance" provenance
      ON provenance.owner_prefix = '${prefix}'
      AND provenance.versioned = true
      AND provenance.legacy_type = 'carousel'
      AND provenance.legacy_id = source.parent_id::text;

    INSERT INTO ${listingConditions} (
      _order, _parent_id, field, operator, text_value, number_value,
      event_time_value, date_value, end_date_value, _uuid
    )
    SELECT
      condition._order, provenance.listing_id::integer,
      condition.field::text::${enumName(prefix, 'listing_conditions', 'field')},
      condition.operator::text::${enumName(prefix, 'listing_conditions', 'operator')},
      condition.text_value, condition.number_value, condition.event_time_value,
      condition.date_value, condition.end_date_value, condition._uuid
    FROM ${carouselConditions} condition
    JOIN "_listing_block_migration_provenance" provenance
      ON provenance.owner_prefix = '${prefix}'
      AND provenance.versioned = true
      AND provenance.legacy_type = 'carousel'
      AND provenance.legacy_id = condition._parent_id::text;

    DELETE FROM ${carousel};
  `
}

function insertVersionMemberProfilesStatement(prefix: string): string {
  const listing = tableName(prefix, 'blocks_listing')
  const listingItems = tableName(prefix, 'blocks_listing_items')
  const memberProfiles = tableName(prefix, 'blocks_member_profiles')
  const memberProfileEntries = tableName(prefix, 'blocks_member_profiles_entries')
  const relations = tableName(prefix, 'rels')

  return `
    INSERT INTO ${listing} (
      _order, _parent_id, _path, sort, view, page_size, pagination,
      empty_message, _uuid, block_name, frame, surface, surface_image_id,
      surface_horizontal_position, surface_vertical_position, selection_mode,
      hide_when_empty
    )
    SELECT
      _order, _parent_id, _path,
      'titleAscending'::${enumName(prefix, 'listing', 'sort')},
      CASE view::text
        WHEN 'card' THEN 'cards'
        WHEN 'list' THEN 'compact'
        ELSE 'grid'
      END::${enumName(prefix, 'listing', 'view')},
      100, false, NULL, _uuid, block_name, frame, surface, surface_image_id,
      surface_horizontal_position, surface_vertical_position,
      'manual'::${enumName(prefix, 'listing', 'selection_mode')},
      true
    FROM ${memberProfiles};

    INSERT INTO "_listing_block_migration_provenance"
      (owner_prefix, versioned, legacy_type, legacy_id, listing_id)
    SELECT '${prefix}', true, 'memberProfiles', legacy.id::text, target.id::text
    FROM ${memberProfiles} legacy
    JOIN ${listing} target
      ON target._parent_id = legacy._parent_id
      AND target._path = legacy._path
      AND target._order = legacy._order
      AND target._uuid IS NOT DISTINCT FROM legacy._uuid;

    INSERT INTO ${listingItems} (_order, _parent_id, _uuid, context_label)
    SELECT
      entry._order, provenance.listing_id::integer, entry._uuid, entry.context_label
    FROM ${memberProfileEntries} entry
    JOIN "_listing_block_migration_provenance" provenance
      ON provenance.owner_prefix = '${prefix}'
      AND provenance.versioned = true
      AND provenance.legacy_type = 'memberProfiles'
      AND provenance.legacy_id = entry._parent_id::text;

    INSERT INTO ${relations} (parent_id, path, member_profiles_id)
    SELECT
      block._parent_id,
      block._path || '.' || (block._order - 1) || '.items.' || (entry._order - 1) || '.item',
      entry.profile_id
    FROM ${memberProfiles} block
    JOIN ${memberProfileEntries} entry ON entry._parent_id = block.id
    WHERE entry.profile_id IS NOT NULL;

    DELETE FROM ${memberProfiles};
  `
}

export async function consolidateLegacyContentBlocks(database: MigrationDatabase): Promise<void> {
  await createProvenanceTable(database)

  for (const owner of contentOwnerPrefixes) {
    await execute(database, livePreflightStatement(owner))
    await execute(database, insertLiveCarouselStatement(owner))
    await execute(database, insertLiveMemberProfilesStatement(owner))

    const versionPrefix = `_${owner}_v`
    await execute(database, versionPreflightStatement(versionPrefix))
    await execute(database, insertVersionCarouselStatement(versionPrefix))
    await execute(database, insertVersionMemberProfilesStatement(versionPrefix))
  }
}

function restoreLiveCarouselStatement(prefix: string): string {
  const listing = tableName(prefix, 'blocks_listing')
  const listingItems = tableName(prefix, 'blocks_listing_items')
  const listingSources = tableName(prefix, 'blocks_listing_sources')
  const listingConditions = tableName(prefix, 'blocks_listing_conditions')
  const carousel = tableName(prefix, 'blocks_carousel')
  const carouselItems = tableName(prefix, 'blocks_carousel_items')
  const carouselSources = tableName(prefix, 'blocks_carousel_sources')
  const carouselConditions = tableName(prefix, 'blocks_carousel_conditions')

  return `
    INSERT INTO ${carousel} (
      _order, _parent_id, _path, id, frame, surface, surface_image_id,
      surface_horizontal_position, surface_vertical_position, selection_mode,
      sort, slide_limit, empty_message, block_name
    )
    SELECT
      listing._order, listing._parent_id, listing._path, provenance.legacy_id,
      listing.frame, listing.surface, listing.surface_image_id,
      listing.surface_horizontal_position, listing.surface_vertical_position,
      listing.selection_mode::text::${enumName(prefix, 'carousel', 'selection_mode')},
      listing.sort::text::${enumName(prefix, 'carousel', 'sort')},
      LEAST(listing.page_size, 20), listing.empty_message, listing.block_name
    FROM "_listing_block_migration_provenance" provenance
    JOIN ${listing} listing ON listing.id = provenance.listing_id
    WHERE provenance.owner_prefix = '${prefix}'
      AND provenance.versioned = false
      AND provenance.legacy_type = 'carousel';

    INSERT INTO ${carouselItems} (_order, _parent_id, id)
    SELECT item._order, provenance.legacy_id, item.id
    FROM "_listing_block_migration_provenance" provenance
    JOIN ${listingItems} item ON item._parent_id = provenance.listing_id
    WHERE provenance.owner_prefix = '${prefix}'
      AND provenance.versioned = false
      AND provenance.legacy_type = 'carousel';

    INSERT INTO ${carouselSources} ("order", parent_id, value)
    SELECT
      source."order", provenance.legacy_id,
      source.value::text::${enumName(prefix, 'carousel', 'sources')}
    FROM "_listing_block_migration_provenance" provenance
    JOIN ${listingSources} source ON source.parent_id = provenance.listing_id
    WHERE provenance.owner_prefix = '${prefix}'
      AND provenance.versioned = false
      AND provenance.legacy_type = 'carousel';

    INSERT INTO ${carouselConditions} (
      _order, _parent_id, id, field, operator, text_value, number_value,
      event_time_value, date_value, end_date_value
    )
    SELECT
      condition._order, provenance.legacy_id, condition.id,
      condition.field::text::${enumName(prefix, 'carousel_conditions', 'field')},
      condition.operator::text::${enumName(prefix, 'carousel_conditions', 'operator')},
      condition.text_value, condition.number_value, condition.event_time_value,
      condition.date_value, condition.end_date_value
    FROM "_listing_block_migration_provenance" provenance
    JOIN ${listingConditions} condition ON condition._parent_id = provenance.listing_id
    WHERE provenance.owner_prefix = '${prefix}'
      AND provenance.versioned = false
      AND provenance.legacy_type = 'carousel';

    DELETE FROM ${listing}
    WHERE id IN (
      SELECT listing_id FROM "_listing_block_migration_provenance"
      WHERE owner_prefix = '${prefix}' AND versioned = false AND legacy_type = 'carousel'
    );
  `
}

function restoreLiveMemberProfilesStatement(prefix: string): string {
  const listing = tableName(prefix, 'blocks_listing')
  const listingItems = tableName(prefix, 'blocks_listing_items')
  const memberProfiles = tableName(prefix, 'blocks_member_profiles')
  const memberProfileEntries = tableName(prefix, 'blocks_member_profiles_entries')
  const relations = tableName(prefix, 'rels')

  return `
    INSERT INTO ${memberProfiles} (
      _order, _parent_id, _path, id, block_name, view, frame, surface,
      surface_image_id, surface_horizontal_position, surface_vertical_position
    )
    SELECT
      listing._order, listing._parent_id, listing._path, provenance.legacy_id,
      listing.block_name,
      CASE listing.view::text
        WHEN 'compact' THEN 'list'
        WHEN 'grid' THEN 'grid'
        ELSE 'card'
      END::${enumName(prefix, 'member_profiles', 'view')},
      listing.frame, listing.surface, listing.surface_image_id,
      listing.surface_horizontal_position, listing.surface_vertical_position
    FROM "_listing_block_migration_provenance" provenance
    JOIN ${listing} listing ON listing.id = provenance.listing_id
    WHERE provenance.owner_prefix = '${prefix}'
      AND provenance.versioned = false
      AND provenance.legacy_type = 'memberProfiles';

    INSERT INTO ${memberProfileEntries} (_order, _parent_id, id, profile_id, context_label)
    SELECT
      item._order, provenance.legacy_id, item.id, relation.member_profiles_id,
      item.context_label
    FROM "_listing_block_migration_provenance" provenance
    JOIN ${listing} listing ON listing.id = provenance.listing_id
    JOIN ${listingItems} item ON item._parent_id = provenance.listing_id
    LEFT JOIN ${relations} relation
      ON relation.parent_id = listing._parent_id
      AND relation.path = listing._path || '.' || (listing._order - 1)
        || '.items.' || (item._order - 1) || '.item'
    WHERE provenance.owner_prefix = '${prefix}'
      AND provenance.versioned = false
      AND provenance.legacy_type = 'memberProfiles';

    DELETE FROM ${relations} relation
    USING "_listing_block_migration_provenance" provenance, ${listing} listing
    WHERE provenance.owner_prefix = '${prefix}'
      AND provenance.versioned = false
      AND provenance.legacy_type = 'memberProfiles'
      AND listing.id = provenance.listing_id
      AND relation.parent_id = listing._parent_id
      AND relation.member_profiles_id IS NOT NULL
      AND relation.path LIKE listing._path || '.' || (listing._order - 1) || '.items.%';

    DELETE FROM ${listing}
    WHERE id IN (
      SELECT listing_id FROM "_listing_block_migration_provenance"
      WHERE owner_prefix = '${prefix}' AND versioned = false AND legacy_type = 'memberProfiles'
    );
  `
}

function restoreVersionCarouselStatement(prefix: string): string {
  const listing = tableName(prefix, 'blocks_listing')
  const listingItems = tableName(prefix, 'blocks_listing_items')
  const listingSources = tableName(prefix, 'blocks_listing_sources')
  const listingConditions = tableName(prefix, 'blocks_listing_conditions')
  const carousel = tableName(prefix, 'blocks_carousel')
  const carouselItems = tableName(prefix, 'blocks_carousel_items')
  const carouselSources = tableName(prefix, 'blocks_carousel_sources')
  const carouselConditions = tableName(prefix, 'blocks_carousel_conditions')

  return `
    INSERT INTO ${carousel} (
      _order, _parent_id, _path, id, frame, surface, surface_image_id,
      surface_horizontal_position, surface_vertical_position, selection_mode,
      sort, slide_limit, empty_message, _uuid, block_name
    )
    SELECT
      listing._order, listing._parent_id, listing._path, provenance.legacy_id::integer,
      listing.frame, listing.surface, listing.surface_image_id,
      listing.surface_horizontal_position, listing.surface_vertical_position,
      listing.selection_mode::text::${enumName(prefix, 'carousel', 'selection_mode')},
      listing.sort::text::${enumName(prefix, 'carousel', 'sort')},
      LEAST(listing.page_size, 20), listing.empty_message, listing._uuid, listing.block_name
    FROM "_listing_block_migration_provenance" provenance
    JOIN ${listing} listing ON listing.id = provenance.listing_id::integer
    WHERE provenance.owner_prefix = '${prefix}'
      AND provenance.versioned = true
      AND provenance.legacy_type = 'carousel';

    INSERT INTO ${carouselItems} (_order, _parent_id, _uuid)
    SELECT item._order, provenance.legacy_id::integer, item._uuid
    FROM "_listing_block_migration_provenance" provenance
    JOIN ${listingItems} item ON item._parent_id = provenance.listing_id::integer
    WHERE provenance.owner_prefix = '${prefix}'
      AND provenance.versioned = true
      AND provenance.legacy_type = 'carousel';

    INSERT INTO ${carouselSources} ("order", parent_id, value)
    SELECT
      source."order", provenance.legacy_id::integer,
      source.value::text::${enumName(prefix, 'carousel', 'sources')}
    FROM "_listing_block_migration_provenance" provenance
    JOIN ${listingSources} source ON source.parent_id = provenance.listing_id::integer
    WHERE provenance.owner_prefix = '${prefix}'
      AND provenance.versioned = true
      AND provenance.legacy_type = 'carousel';

    INSERT INTO ${carouselConditions} (
      _order, _parent_id, field, operator, text_value, number_value,
      event_time_value, date_value, end_date_value, _uuid
    )
    SELECT
      condition._order, provenance.legacy_id::integer,
      condition.field::text::${enumName(prefix, 'carousel_conditions', 'field')},
      condition.operator::text::${enumName(prefix, 'carousel_conditions', 'operator')},
      condition.text_value, condition.number_value, condition.event_time_value,
      condition.date_value, condition.end_date_value, condition._uuid
    FROM "_listing_block_migration_provenance" provenance
    JOIN ${listingConditions} condition ON condition._parent_id = provenance.listing_id::integer
    WHERE provenance.owner_prefix = '${prefix}'
      AND provenance.versioned = true
      AND provenance.legacy_type = 'carousel';

    DELETE FROM ${listing}
    WHERE id IN (
      SELECT listing_id::integer FROM "_listing_block_migration_provenance"
      WHERE owner_prefix = '${prefix}' AND versioned = true AND legacy_type = 'carousel'
    );
  `
}

function restoreVersionMemberProfilesStatement(prefix: string): string {
  const listing = tableName(prefix, 'blocks_listing')
  const listingItems = tableName(prefix, 'blocks_listing_items')
  const memberProfiles = tableName(prefix, 'blocks_member_profiles')
  const memberProfileEntries = tableName(prefix, 'blocks_member_profiles_entries')
  const relations = tableName(prefix, 'rels')

  return `
    INSERT INTO ${memberProfiles} (
      _order, _parent_id, _path, id, _uuid, block_name, view, frame, surface,
      surface_image_id, surface_horizontal_position, surface_vertical_position
    )
    SELECT
      listing._order, listing._parent_id, listing._path,
      provenance.legacy_id::integer, listing._uuid, listing.block_name,
      CASE listing.view::text
        WHEN 'compact' THEN 'list'
        WHEN 'grid' THEN 'grid'
        ELSE 'card'
      END::${enumName(prefix, 'member_profiles', 'view')},
      listing.frame, listing.surface, listing.surface_image_id,
      listing.surface_horizontal_position, listing.surface_vertical_position
    FROM "_listing_block_migration_provenance" provenance
    JOIN ${listing} listing ON listing.id = provenance.listing_id::integer
    WHERE provenance.owner_prefix = '${prefix}'
      AND provenance.versioned = true
      AND provenance.legacy_type = 'memberProfiles';

    INSERT INTO ${memberProfileEntries} (
      _order, _parent_id, profile_id, context_label, _uuid
    )
    SELECT
      item._order, provenance.legacy_id::integer, relation.member_profiles_id,
      item.context_label, item._uuid
    FROM "_listing_block_migration_provenance" provenance
    JOIN ${listing} listing ON listing.id = provenance.listing_id::integer
    JOIN ${listingItems} item ON item._parent_id = provenance.listing_id::integer
    LEFT JOIN ${relations} relation
      ON relation.parent_id = listing._parent_id
      AND relation.path = listing._path || '.' || (listing._order - 1)
        || '.items.' || (item._order - 1) || '.item'
    WHERE provenance.owner_prefix = '${prefix}'
      AND provenance.versioned = true
      AND provenance.legacy_type = 'memberProfiles';

    DELETE FROM ${relations} relation
    USING "_listing_block_migration_provenance" provenance, ${listing} listing
    WHERE provenance.owner_prefix = '${prefix}'
      AND provenance.versioned = true
      AND provenance.legacy_type = 'memberProfiles'
      AND listing.id = provenance.listing_id::integer
      AND relation.parent_id = listing._parent_id
      AND relation.member_profiles_id IS NOT NULL
      AND relation.path LIKE listing._path || '.' || (listing._order - 1) || '.items.%';

    DELETE FROM ${listing}
    WHERE id IN (
      SELECT listing_id::integer FROM "_listing_block_migration_provenance"
      WHERE owner_prefix = '${prefix}' AND versioned = true AND legacy_type = 'memberProfiles'
    );
  `
}

export async function restoreLegacyContentBlocks(database: MigrationDatabase): Promise<void> {
  for (const owner of contentOwnerPrefixes) {
    await execute(database, restoreLiveCarouselStatement(owner))
    await execute(database, restoreLiveMemberProfilesStatement(owner))

    const versionPrefix = `_${owner}_v`
    await execute(database, restoreVersionCarouselStatement(versionPrefix))
    await execute(database, restoreVersionMemberProfilesStatement(versionPrefix))
    await execute(database, unsupportedListingSourcesStatement(owner))
    await execute(database, unsupportedListingSourcesStatement(versionPrefix))
  }

  await execute(
    database,
    `
      DELETE FROM "content_listing_items"
      WHERE source::text IN ('partners', 'member-profiles');
      DROP TABLE "_listing_block_migration_provenance";
    `,
  )
}
