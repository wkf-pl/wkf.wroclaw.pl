import { sql, type MigrateUpArgs } from '@payloadcms/db-postgres'

export async function restoreLegacyTopicPermissionName(db: MigrateUpArgs['db']): Promise<void> {
  await db.execute(sql`
    ALTER TYPE enum_roles_permissions_resource RENAME VALUE 'topics' TO 'categories';
    DO $fixture$
    BEGIN
      IF to_regclass('public._event_cycles_v_version_event_defaults_version_event_d_4_idx') IS NULL THEN
        ALTER INDEX "_event_cycles_v_version_event_defaults_version_event_d_2_idx"
          RENAME TO "_event_cycles_v_version_event_defaults_version_event_d_4_idx";
      END IF;
    END
    $fixture$;
  `)
}

export async function restoreLegacyListingTopicReferences(db: MigrateUpArgs['db']): Promise<void> {
  await db.execute(sql`
    ALTER TABLE topics RENAME TO categories;
    DO $fixture$
    DECLARE owner text; relation text;
    BEGIN
      FOREACH owner IN ARRAY ARRAY['pages', 'posts', 'events', 'event_cycles', 'partners', 'homepage_sections']
      LOOP
        FOREACH relation IN ARRAY ARRAY[owner || '_rels', '_' || owner || '_v_rels']
        LOOP
          EXECUTE format('ALTER TABLE %I RENAME COLUMN topics_id TO categories_id', relation);
          EXECUTE format('ALTER TABLE %I RENAME CONSTRAINT %I TO %I', relation, relation || '_topics_fk', relation || '_categories_fk');
          EXECUTE format('ALTER INDEX %I RENAME TO %I', relation || '_topics_id_idx', relation || '_categories_id_idx');
        END LOOP;
        EXECUTE format('ALTER TYPE %I RENAME VALUE %L TO %L', 'enum_' || owner || '_blocks_listing_conditions_field', 'topic', 'category');
        EXECUTE format('ALTER TYPE %I RENAME VALUE %L TO %L', 'enum__' || owner || '_v_blocks_listing_conditions_field', 'topic', 'category');
      END LOOP;
    END
    $fixture$;
  `)
}
