import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "website_permissions_permissions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "website_permissions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "website_permissions_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "website_permissions_permissions" CASCADE;
  DROP TABLE "website_permissions" CASCADE;
  DROP TABLE "website_permissions_rels" CASCADE;

  ALTER TABLE "roles_permissions" ALTER COLUMN "resource" SET DATA TYPE text;

  INSERT INTO "roles_permissions" (
    "_order", "_parent_id", "id", "resource", "can_create",
    "read_allowed", "read_own", "read_published", "update_allowed",
    "update_own", "update_published", "delete_allowed", "delete_own",
    "delete_published"
  )
  SELECT
    min("_order"),
    "_parent_id",
    'documents-merged-' || "_parent_id",
    'documents',
    bool_or(COALESCE("can_create", false)),
    bool_or(COALESCE("read_allowed", false)),
    bool_or(COALESCE("read_allowed", false)) AND
      bool_and(CASE WHEN "read_allowed" THEN COALESCE("read_own", false) ELSE true END),
    bool_or(COALESCE("read_allowed", false)) AND
      bool_and(CASE WHEN "read_allowed" THEN COALESCE("read_published", false) ELSE true END),
    bool_or(COALESCE("update_allowed", false)),
    bool_or(COALESCE("update_allowed", false)) AND
      bool_and(CASE WHEN "update_allowed" THEN COALESCE("update_own", false) ELSE true END),
    bool_or(COALESCE("update_allowed", false)) AND
      bool_and(CASE WHEN "update_allowed" THEN COALESCE("update_published", false) ELSE true END),
    bool_or(COALESCE("delete_allowed", false)),
    bool_or(COALESCE("delete_allowed", false)) AND
      bool_and(CASE WHEN "delete_allowed" THEN COALESCE("delete_own", false) ELSE true END),
    bool_or(COALESCE("delete_allowed", false)) AND
      bool_and(CASE WHEN "delete_allowed" THEN COALESCE("delete_published", false) ELSE true END)
  FROM "roles_permissions"
  WHERE "resource" IN (
    'documents-resolution', 'documents-statute', 'documents-regulations',
    'documents-minutes', 'documents-report', 'documents-agreement',
    'documents-license', 'documents-other', 'document-files'
  )
  GROUP BY "_parent_id";

  DELETE FROM "roles_permissions"
  WHERE "resource" IN (
    'documents-resolution', 'documents-statute', 'documents-regulations',
    'documents-minutes', 'documents-report', 'documents-agreement',
    'documents-license', 'documents-other', 'document-files'
  );

  DROP TYPE "public"."enum_roles_permissions_resource";
  CREATE TYPE "public"."enum_roles_permissions_resource" AS ENUM('users', 'media', 'member-profiles', 'member-profile-images', 'pages', 'posts', 'events', 'event-cycles', 'partners', 'documents', 'club-sections', 'categories', 'tags', 'navigation', 'site-settings');
  ALTER TABLE "roles_permissions" ALTER COLUMN "resource" SET DATA TYPE "public"."enum_roles_permissions_resource" USING "resource"::"public"."enum_roles_permissions_resource";
  DROP INDEX "content_listing_items_visibility_idx";
  ALTER TABLE "content_listing_items" DROP COLUMN "visibility";
  ALTER TABLE "events" DROP COLUMN "visibility";
  ALTER TABLE "_events_v" DROP COLUMN "version_visibility";
  ALTER TABLE "event_cycles" DROP COLUMN "visibility";
  ALTER TABLE "event_cycles" DROP COLUMN "event_defaults_visibility";
  ALTER TABLE "_event_cycles_v" DROP COLUMN "version_visibility";
  ALTER TABLE "_event_cycles_v" DROP COLUMN "version_event_defaults_visibility";
  DROP TYPE "public"."enum_content_listing_items_visibility";
  DROP TYPE "public"."enum_events_visibility";
  DROP TYPE "public"."enum__events_v_version_visibility";
  DROP TYPE "public"."enum_event_cycles_visibility";
  DROP TYPE "public"."enum_event_cycles_event_defaults_visibility";
  DROP TYPE "public"."enum__event_cycles_v_version_visibility";
  DROP TYPE "public"."enum__event_cycles_v_version_event_defaults_visibility";
  DROP TYPE "public"."enum_website_permissions_permissions_resource";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_content_listing_items_visibility" AS ENUM('public', 'members');
  CREATE TYPE "public"."enum_events_visibility" AS ENUM('public', 'members');
  CREATE TYPE "public"."enum__events_v_version_visibility" AS ENUM('public', 'members');
  CREATE TYPE "public"."enum_event_cycles_visibility" AS ENUM('public', 'members');
  CREATE TYPE "public"."enum_event_cycles_event_defaults_visibility" AS ENUM('public', 'members');
  CREATE TYPE "public"."enum__event_cycles_v_version_visibility" AS ENUM('public', 'members');
  CREATE TYPE "public"."enum__event_cycles_v_version_event_defaults_visibility" AS ENUM('public', 'members');
  CREATE TYPE "public"."enum_website_permissions_permissions_resource" AS ENUM('media', 'pages', 'posts', 'events', 'event-cycles', 'partners', 'documents-resolution', 'documents-statute', 'documents-regulations', 'documents-minutes', 'documents-report', 'documents-agreement', 'documents-license', 'documents-other', 'club-sections');
  CREATE TABLE "website_permissions_permissions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"resource" "enum_website_permissions_permissions_resource" NOT NULL,
  	"anonymous_allowed" boolean DEFAULT false
  );
  
  CREATE TABLE "website_permissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "website_permissions_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"roles_id" integer
  );
  
  ALTER TABLE "roles_permissions" ALTER COLUMN "resource" SET DATA TYPE text;

  INSERT INTO "roles_permissions" (
    "_order", "_parent_id", "id", "resource", "can_create",
    "read_allowed", "read_own", "read_published", "update_allowed",
    "update_own", "update_published", "delete_allowed", "delete_own",
    "delete_published"
  )
  SELECT
    source."_order" + restored.resource_order - 1,
    source."_parent_id",
    'documents-restored-' || source."_parent_id" || '-' || restored.resource_order,
    restored.resource,
    source."can_create", source."read_allowed", source."read_own",
    source."read_published", source."update_allowed", source."update_own",
    source."update_published", source."delete_allowed", source."delete_own",
    source."delete_published"
  FROM "roles_permissions" AS source
  CROSS JOIN (VALUES
    (1, 'documents-resolution'), (2, 'documents-statute'),
    (3, 'documents-regulations'), (4, 'documents-minutes'),
    (5, 'documents-report'), (6, 'documents-agreement'),
    (7, 'documents-license'), (8, 'documents-other'), (9, 'document-files')
  ) AS restored(resource_order, resource)
  WHERE source."resource" = 'documents';

  DELETE FROM "roles_permissions" WHERE "resource" = 'documents';

  DROP TYPE "public"."enum_roles_permissions_resource";
  CREATE TYPE "public"."enum_roles_permissions_resource" AS ENUM('users', 'media', 'member-profiles', 'member-profile-images', 'pages', 'posts', 'events', 'event-cycles', 'partners', 'documents-resolution', 'documents-statute', 'documents-regulations', 'documents-minutes', 'documents-report', 'documents-agreement', 'documents-license', 'documents-other', 'document-files', 'club-sections', 'categories', 'tags', 'navigation', 'site-settings');
  ALTER TABLE "roles_permissions" ALTER COLUMN "resource" SET DATA TYPE "public"."enum_roles_permissions_resource" USING "resource"::"public"."enum_roles_permissions_resource";
  ALTER TABLE "content_listing_items" ADD COLUMN "visibility" "enum_content_listing_items_visibility";
  ALTER TABLE "events" ADD COLUMN "visibility" "enum_events_visibility" DEFAULT 'public';
  ALTER TABLE "_events_v" ADD COLUMN "version_visibility" "enum__events_v_version_visibility" DEFAULT 'public';
  ALTER TABLE "event_cycles" ADD COLUMN "visibility" "enum_event_cycles_visibility" DEFAULT 'public';
  ALTER TABLE "event_cycles" ADD COLUMN "event_defaults_visibility" "enum_event_cycles_event_defaults_visibility" DEFAULT 'public';
  ALTER TABLE "_event_cycles_v" ADD COLUMN "version_visibility" "enum__event_cycles_v_version_visibility" DEFAULT 'public';
  ALTER TABLE "_event_cycles_v" ADD COLUMN "version_event_defaults_visibility" "enum__event_cycles_v_version_event_defaults_visibility" DEFAULT 'public';

  UPDATE "content_listing_items" SET "visibility" = 'public';

  INSERT INTO "website_permissions" ("id", "updated_at", "created_at")
  VALUES (1, now(), now());
  SELECT setval(pg_get_serial_sequence('website_permissions', 'id'), 1, true);

  INSERT INTO "website_permissions_permissions" (
    "_order", "_parent_id", "id", "resource", "anonymous_allowed"
  )
  SELECT resource_order, 1, 'website-restored-' || resource_order,
    resource::"enum_website_permissions_permissions_resource", true
  FROM (VALUES
    (1, 'media'), (2, 'pages'), (3, 'posts'), (4, 'events'),
    (5, 'event-cycles'), (6, 'partners'), (7, 'documents-resolution'),
    (8, 'documents-statute'), (9, 'documents-regulations'),
    (10, 'documents-minutes'), (11, 'documents-report'),
    (12, 'documents-agreement'), (13, 'documents-license'),
    (14, 'documents-other'), (15, 'club-sections')
  ) AS restored(resource_order, resource);

  ALTER TABLE "website_permissions_permissions" ADD CONSTRAINT "website_permissions_permissions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."website_permissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "website_permissions_rels" ADD CONSTRAINT "website_permissions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."website_permissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "website_permissions_rels" ADD CONSTRAINT "website_permissions_rels_roles_fk" FOREIGN KEY ("roles_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "website_permissions_permissions_order_idx" ON "website_permissions_permissions" USING btree ("_order");
  CREATE INDEX "website_permissions_permissions_parent_id_idx" ON "website_permissions_permissions" USING btree ("_parent_id");
  CREATE INDEX "website_permissions_rels_order_idx" ON "website_permissions_rels" USING btree ("order");
  CREATE INDEX "website_permissions_rels_parent_idx" ON "website_permissions_rels" USING btree ("parent_id");
  CREATE INDEX "website_permissions_rels_path_idx" ON "website_permissions_rels" USING btree ("path");
  CREATE INDEX "website_permissions_rels_roles_id_idx" ON "website_permissions_rels" USING btree ("roles_id");
  CREATE INDEX "content_listing_items_visibility_idx" ON "content_listing_items" USING btree ("visibility");`)
}
