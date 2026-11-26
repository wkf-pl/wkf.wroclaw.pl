import { sql, type MigrateUpArgs } from '@payloadcms/db-postgres'

import { syncContentListingItem } from '../../src/modules/content/content-listing-index'
import { allListingSources } from '../../src/modules/content/listing-conditions'
import { refreshListingAncestry } from '../../src/modules/content/listing-ancestry-sql'

type MigrationDatabase = MigrateUpArgs['db']

const listingOwners = [
  'page_templates',
  'pages',
  'posts',
  'events',
  'event_cycles',
  'partners',
  'homepage_sections',
]

const topicAssignments = [
  ...[
    'pages',
    'posts',
    'events',
    'event_cycles',
    'documents',
    'media',
    'content_listing_items',
  ].map((table) => ({ table, column: 'category_id', path: 'topics' })),
  ...['pages', 'posts', 'events', 'event_cycles', 'documents'].map((collection) => ({
    table: `_${collection}_v`,
    column: 'version_category_id',
    path: 'version.topics',
  })),
  { table: 'event_cycles', column: 'event_defaults_category_id', path: 'eventDefaults.topics' },
  {
    table: '_event_cycles_v',
    column: 'version_event_defaults_category_id',
    path: 'version.eventDefaults.topics',
  },
]

export async function migrateTopicAssignments(db: MigrationDatabase): Promise<void> {
  for (const { table, column, path } of topicAssignments) {
    const source = sql.identifier(table)
    const relationship = sql.identifier(`${table}_rels`)
    const category = sql.identifier(column)
    await db.execute(sql`
      INSERT INTO ${relationship} ("order", parent_id, path, topics_id)
      SELECT 1, id, ${path}, ${category} FROM ${source} WHERE ${category} IS NOT NULL
    `)
    await db.execute(sql`ALTER TABLE ${source} DROP COLUMN ${category}`)
  }
  await db.execute(sql`
    ALTER INDEX "_event_cycles_v_version_event_defaults_version_event_d_4_idx"
      RENAME TO "_event_cycles_v_version_event_defaults_version_event_d_3_idx";
    UPDATE topics_breadcrumbs SET url = regexp_replace(url, '^/category/', '/topic/')
    WHERE url LIKE '/category/%';
    UPDATE tags SET display_name = name;
  `)
}

export async function consolidateContentSearchBlocks(db: MigrationDatabase): Promise<void> {
  for (const owner of listingOwners) {
    await consolidateSearchTable(db, owner, false)
    await consolidateSearchTable(db, owner, true)
  }
  await db.execute(sql`
    DO $migration$
    DECLARE legacy_type text;
    BEGIN
      FOR legacy_type IN
        SELECT typname FROM pg_type JOIN pg_namespace ON pg_namespace.oid = typnamespace
        WHERE nspname = 'public' AND typname ~ '^enum_.*_blocks_cs(_v)?_'
      LOOP
        EXECUTE format('DROP TYPE public.%I', legacy_type);
      END LOOP;
    END
    $migration$;
  `)
}

async function consolidateSearchTable(db: MigrationDatabase, owner: string, version: boolean) {
  const searchName = version ? `_${owner}_blocks_cs_v` : `${owner}_blocks_cs`
  const listingName = `${version ? `_${owner}_v` : owner}_blocks_listing`
  const search = sql.identifier(searchName)
  const listing = sql.identifier(listingName)
  const fromSources = sql.identifier(`${searchName}_sources`)
  const toSources = sql.identifier(`${listingName}_sources`)
  const fromConditions = sql.identifier(`${searchName}_conditions`)
  const toConditions = sql.identifier(`${listingName}_conditions`)
  const listingIndex = version ? sql`_uuid` : sql`id`
  const sort = sql.identifier(`enum_${listingName}_sort`)
  const view = sql.identifier(`enum_${listingName}_view`)
  const source = sql.identifier(`enum_${listingName}_sources`)
  const conditionField = sql.identifier(`enum_${listingName}_conditions_field`)
  const operator = sql.identifier(`enum_${listingName}_conditions_operator`)

  if (!version) {
    const collisions = await db.execute(sql`
      SELECT legacy.id FROM ${search} legacy JOIN ${listing} existing ON existing.id = legacy.id LIMIT 1
    `)
    if (collisions.rows.length)
      throw new Error(`Duplicate search and Listing block ID in ${owner}.`)
  }

  const result = await db.execute<{ id: number | string }>(
    sql`SELECT id FROM ${search} ORDER BY id`,
  )
  for (const { id } of result.rows) {
    const inserted = await db.execute<{ id: number | string }>(sql`
      INSERT INTO ${listing} (
        ${listingIndex}, _order, _parent_id, _path, selection_mode, include_inactive_locations,
        sort, page_size, pagination, hide_when_empty, empty_message, view, frame, surface,
        surface_image_id, surface_horizontal_position, surface_vertical_position, appearance,
        block_name, search_enabled, legacy_search_parameters, filter_phrase, filter_date, filter_tags,
        filter_topic, filter_author, filter_content_type
      )
      SELECT
        ${listingIndex}, _order, _parent_id, _path, 'filters', include_inactive_locations,
        sort::text::${sort}, page_size, pagination, hide_when_empty, empty_message, view::text::${view},
        frame, surface, surface_image_id, surface_horizontal_position, surface_vertical_position,
        appearance, block_name, true, true, filter_phrase, filter_date, filter_tags, filter_category,
        filter_author, filter_content_type
      FROM ${search} WHERE id = ${id}
      RETURNING id
    `)
    const listingID = inserted.rows[0].id
    await db.execute(sql`
      INSERT INTO ${toSources} ("order", parent_id, value)
      SELECT "order", ${listingID}, value::text::${source} FROM ${fromSources} WHERE parent_id = ${id}
    `)
    await db.execute(sql`
      INSERT INTO ${toConditions} (
        ${listingIndex}, _order, _parent_id, field, operator, related_target_mode,
        text_value, number_value, event_time_value, date_value, end_date_value
      )
      SELECT
        ${listingIndex}, _order, ${listingID},
        (CASE WHEN field::text = 'category' THEN 'topic' ELSE field::text END)::${conditionField},
        operator::text::${operator}, related_target_mode,
        text_value, number_value, event_time_value, date_value, end_date_value
      FROM ${fromConditions} WHERE _parent_id = ${id}
    `)
  }
  await db.execute(sql`DROP TABLE ${fromSources}, ${fromConditions}, ${search}`)
}

export async function migrateTopicLinks(db: MigrationDatabase): Promise<void> {
  await db.execute(sql`
    CREATE FUNCTION pg_temp.rename_topic_links(node jsonb) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE AS $function$
    DECLARE converted jsonb;
    BEGIN
      CASE jsonb_typeof(node)
        WHEN 'array' THEN
          SELECT COALESCE(jsonb_agg(pg_temp.rename_topic_links(value) ORDER BY position), '[]'::jsonb)
          INTO converted FROM jsonb_array_elements(node) WITH ORDINALITY AS entries(value, position);
        WHEN 'object' THEN
          SELECT COALESCE(jsonb_object_agg(key, pg_temp.rename_topic_links(value)), '{}'::jsonb)
          INTO converted FROM jsonb_each(node);
          IF converted->>'relationTo' = 'categories' THEN
            converted := jsonb_set(converted, '{relationTo}', '"topics"');
          END IF;
          IF converted->>'targetType' = 'category' THEN
            converted := jsonb_set(converted, '{targetType}', '"topic"');
            IF converted ? 'category' THEN
              converted := (converted - 'category') || jsonb_build_object('topic', converted->'category');
            END IF;
          END IF;
          IF converted->>'url' LIKE '/category/%' THEN
            converted := jsonb_set(converted, '{url}', to_jsonb(regexp_replace(converted->>'url', '^/category/', '/topic/')));
          END IF;
        ELSE
          converted := node;
      END CASE;
      RETURN converted;
    END
    $function$;

    DO $migration$
    DECLARE field record;
    BEGIN
      FOR field IN
        SELECT table_name, column_name FROM information_schema.columns
        WHERE table_schema = 'public' AND data_type = 'jsonb'
      LOOP
        EXECUTE format(
          'UPDATE %I SET %I = pg_temp.rename_topic_links(%I) WHERE %I::text ~ ''"(categories|category|/category/[^"]*)"''',
          field.table_name, field.column_name, field.column_name, field.column_name
        );
      END LOOP;
    END
    $migration$;
    DROP FUNCTION pg_temp.rename_topic_links(jsonb);
  `)
}

export async function rebuildTopicListingIndex({
  db,
  req,
}: Pick<MigrateUpArgs, 'db' | 'req'>): Promise<void> {
  req.context = { ...req.context, skipContentListingSync: true, skipPublicCacheInvalidation: true }
  for (const source of allListingSources) {
    const table = sql.identifier(source.replaceAll('-', '_'))
    const records = await db.execute<{ id: number }>(sql`
      SELECT id FROM ${table} WHERE _status = 'published' AND deleted_at IS NULL
      UNION
      SELECT source_document_id AS id FROM content_listing_items WHERE source = ${source}
      ORDER BY id
    `)
    for (const { id } of records.rows) {
      await syncContentListingItem(req, source, id, { rebuild: true })
    }
  }
  await db.execute(refreshListingAncestry)
}

export async function logTopicMigrationInventory(
  db: MigrationDatabase,
  logger: MigrateUpArgs['payload']['logger'],
): Promise<void> {
  const assignments: Record<string, string> = {}
  for (const { table, column } of topicAssignments) {
    const count = await db.execute<{ total: string }>(sql`
      SELECT count(*) AS total FROM ${sql.identifier(table)} WHERE ${sql.identifier(column)} IS NOT NULL
    `)
    assignments[`${table}.${column}`] = count.rows[0].total
  }
  const blocks: Record<string, string> = {}
  for (const owner of listingOwners) {
    for (const table of [
      `${owner}_blocks_cs`,
      `_${owner}_blocks_cs_v`,
      `${owner}_blocks_listing`,
      `_${owner}_v_blocks_listing`,
    ]) {
      const count = await db.execute<{ total: string }>(
        sql`SELECT count(*) AS total FROM ${sql.identifier(table)}`,
      )
      blocks[table] = count.rows[0].total
    }
  }
  const parents = await db.execute(sql`
    SELECT
      (SELECT count(*) FROM pages WHERE parent_id IS NOT NULL) AS page_parents,
      (SELECT count(*) FROM events WHERE cycle_id IS NOT NULL) AS event_cycles,
      (SELECT count(*) FROM _pages_v WHERE version_parent_id IS NOT NULL) AS version_page_parents,
      (SELECT count(*) FROM _events_v WHERE version_cycle_id IS NOT NULL) AS version_event_cycles
  `)
  logger.info({
    msg: 'Inventory before the Topics and Listing migration',
    assignments,
    blocks,
    parents: parents.rows[0],
  })
}
