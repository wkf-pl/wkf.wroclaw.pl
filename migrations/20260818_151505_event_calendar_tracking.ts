import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" ADD COLUMN "location_country" varchar DEFAULT 'Polska';
  ALTER TABLE "events" ADD COLUMN "published_start_at" timestamp(3) with time zone;
  ALTER TABLE "events" ADD COLUMN "calendar_fingerprint" varchar;
  ALTER TABLE "_events_v" ADD COLUMN "version_location_country" varchar DEFAULT 'Polska';
  ALTER TABLE "_events_v" ADD COLUMN "version_published_start_at" timestamp(3) with time zone;
  ALTER TABLE "_events_v" ADD COLUMN "version_calendar_fingerprint" varchar;
  ALTER TABLE "event_cycles" ADD COLUMN "event_defaults_default_start_time" varchar;
  ALTER TABLE "event_cycles" ADD COLUMN "event_defaults_location_country" varchar DEFAULT 'Polska';
  ALTER TABLE "_event_cycles_v" ADD COLUMN "version_event_defaults_default_start_time" varchar;
  ALTER TABLE "_event_cycles_v" ADD COLUMN "version_event_defaults_location_country" varchar DEFAULT 'Polska';`)
  await db.execute(sql`
  INSERT INTO "roles_permissions" (
    "_order", "_parent_id", "id", "resource", "can_create", "read_allowed",
    "read_own", "read_published", "update_allowed", "update_own",
    "update_published", "delete_allowed", "delete_own", "delete_published"
  )
  SELECT source."_order" + additions.resource_order, source."_parent_id",
    roles."key" || '-' || additions.resource,
    additions.resource::"enum_roles_permissions_resource",
    source."can_create", source."read_allowed", source."read_own", source."read_published",
    source."update_allowed", source."update_own", source."update_published",
    source."delete_allowed", source."delete_own", source."delete_published"
  FROM "roles_permissions" AS source
  INNER JOIN "roles" ON roles."id" = source."_parent_id"
  CROSS JOIN (VALUES (1, 'events'), (2, 'event-cycles'), (3, 'partners')) AS additions(resource_order, resource)
  WHERE source."resource"::text = 'pages' AND roles."key" IN ('administrator', 'editor')
  ON CONFLICT ("id") DO NOTHING;

  INSERT INTO "website_permissions_permissions" (
    "_order", "_parent_id", "id", "resource", "anonymous_allowed"
  )
  SELECT COALESCE((SELECT max(existing."_order") FROM "website_permissions_permissions" AS existing WHERE existing."_parent_id" = permissions."id"), 0) + additions.resource_order,
    permissions."id", 'website-' || additions.resource,
    additions.resource::"enum_website_permissions_permissions_resource", true
  FROM "website_permissions" AS permissions
  CROSS JOIN (VALUES (1, 'events'), (2, 'event-cycles'), (3, 'partners')) AS additions(resource_order, resource)
  ON CONFLICT ("id") DO NOTHING;

  INSERT INTO "payload_kv" ("key", "data")
  SELECT 'migration:20260818_events_page', jsonb_build_object('eventsPageId', "id", 'created', false)
  FROM "pages" WHERE "system_key" = 'events' OR "slug" = 'events' LIMIT 1
  ON CONFLICT ("key") DO NOTHING;

  WITH preferred_author AS (
    SELECT users_rels."parent_id" AS user_id FROM "users_rels"
    INNER JOIN "roles" ON roles."id" = users_rels."roles_id"
    WHERE roles."key" IN ('administrator', 'editor')
    ORDER BY CASE roles."key" WHEN 'administrator' THEN 0 ELSE 1 END, users_rels."parent_id" LIMIT 1
  ), inserted_page AS (
    INSERT INTO "pages" (
      "title", "slug", "listing_excerpt", "author_id", "published_at", "system_key",
      "updated_at", "created_at", "_status"
    )
    SELECT 'Wydarzenia', 'events',
      'Spotkania, konwenty i inne wydarzenia Wrocławskiego Klubu Fantastyki.',
      preferred_author.user_id, now(), 'events', now(), now(), 'published'
    FROM preferred_author
    WHERE NOT EXISTS (SELECT 1 FROM "payload_kv" WHERE "key" = 'migration:20260818_events_page')
    RETURNING "id"
  )
  INSERT INTO "payload_kv" ("key", "data")
  SELECT 'migration:20260818_events_page', jsonb_build_object('eventsPageId', "id", 'created', true)
  FROM inserted_page ON CONFLICT ("key") DO NOTHING;

  INSERT INTO "_pages_v" (
    "parent_id", "version_title", "version_slug", "version_listing_excerpt",
    "version_author_id", "version_published_at", "version_system_key",
    "version_updated_at", "version_created_at", "version__status", "latest"
  )
  SELECT pages."id", pages."title", pages."slug", pages."listing_excerpt", pages."author_id",
    pages."published_at", pages."system_key", pages."updated_at", pages."created_at", 'published', true
  FROM "pages" INNER JOIN "payload_kv" ON payload_kv."key" = 'migration:20260818_events_page'
    AND (payload_kv."data"->>'eventsPageId')::integer = pages."id"
  WHERE (payload_kv."data"->>'created')::boolean;
  `)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DELETE FROM "roles_permissions" WHERE "resource"::text IN ('events', 'event-cycles', 'partners');
  DELETE FROM "website_permissions_permissions" WHERE "resource"::text IN ('events', 'event-cycles', 'partners');
  DELETE FROM "_pages_v" WHERE "parent_id" = (
    SELECT ("data"->>'eventsPageId')::integer FROM "payload_kv"
    WHERE "key" = 'migration:20260818_events_page' AND ("data"->>'created')::boolean
  );
  DELETE FROM "pages" WHERE "id" = (
    SELECT ("data"->>'eventsPageId')::integer FROM "payload_kv"
    WHERE "key" = 'migration:20260818_events_page' AND ("data"->>'created')::boolean
  );
  DELETE FROM "payload_kv" WHERE "key" = 'migration:20260818_events_page';
  `)
  await db.execute(sql`
   ALTER TABLE "events" DROP COLUMN "location_country";
  ALTER TABLE "events" DROP COLUMN "published_start_at";
  ALTER TABLE "events" DROP COLUMN "calendar_fingerprint";
  ALTER TABLE "_events_v" DROP COLUMN "version_location_country";
  ALTER TABLE "_events_v" DROP COLUMN "version_published_start_at";
  ALTER TABLE "_events_v" DROP COLUMN "version_calendar_fingerprint";
  ALTER TABLE "event_cycles" DROP COLUMN "event_defaults_default_start_time";
  ALTER TABLE "event_cycles" DROP COLUMN "event_defaults_location_country";
  ALTER TABLE "_event_cycles_v" DROP COLUMN "version_event_defaults_default_start_time";
  ALTER TABLE "_event_cycles_v" DROP COLUMN "version_event_defaults_location_country";`)
}
