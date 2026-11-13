import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

const previousResources = sql.raw(
  "'users', 'media', 'member-profiles', 'member-profile-images', 'pages', 'posts', 'events', 'event-cycles', 'event-types', 'partners', 'documents', 'url-aliases', 'club-sections', 'categories', 'tags', 'page-templates', 'navigation', 'site-settings'",
)

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TYPE "public"."enum_content_audit_log_action" AS ENUM('create', 'update', 'trash', 'restore', 'restore-version', 'delete');
  CREATE TYPE "public"."enum_content_audit_log_target" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'event-types', 'categories', 'tags', 'media', 'partners', 'member-profiles', 'site-settings', 'navigation', 'homepage-hero', 'homepage-sections', 'footer');
  ALTER TABLE "roles_permissions" ALTER COLUMN "resource" SET DATA TYPE text;
  DROP TYPE "public"."enum_roles_permissions_resource";
  CREATE TYPE "public"."enum_roles_permissions_resource" AS ENUM(${previousResources}, 'content-audit-log');
  ALTER TABLE "roles_permissions" ALTER COLUMN "resource" SET DATA TYPE "public"."enum_roles_permissions_resource" USING "resource"::"public"."enum_roles_permissions_resource";

  INSERT INTO "roles_permissions" ("_order", "_parent_id", "id", "resource", "read_allowed")
  SELECT
    COALESCE((
      SELECT MAX("sibling"."_order") + 1
      FROM "roles_permissions" AS "sibling"
      WHERE "sibling"."_parent_id" = "roles"."id"
    ), 1),
    "roles"."id",
    "roles"."key" || '-content-audit-log',
    'content-audit-log',
    true
  FROM "roles"
  WHERE "roles"."key" = 'moderator';
  CREATE TYPE "public"."enum_content_audit_log_save_mode" AS ENUM('draft', 'publish');
  CREATE TABLE "content_audit_log" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"occurred_at" timestamp(3) with time zone NOT NULL,
  	"actor" varchar NOT NULL,
  	"actor_id" varchar,
  	"action" "enum_content_audit_log_action" NOT NULL,
  	"save_mode" "enum_content_audit_log_save_mode",
  	"target" "enum_content_audit_log_target" NOT NULL,
  	"target_id" varchar,
  	"title" varchar NOT NULL
  );
  
  CREATE INDEX "content_audit_log_occurred_at_idx" ON "content_audit_log" USING btree ("occurred_at");
  CREATE INDEX "content_audit_log_actor_id_idx" ON "content_audit_log" USING btree ("actor_id");

  ALTER TABLE "_page_templates_v" ADD COLUMN "autosave" boolean;
  ALTER TABLE "_pages_v" ADD COLUMN "autosave" boolean;
  ALTER TABLE "_posts_v" ADD COLUMN "autosave" boolean;
  ALTER TABLE "_navigation_v" ADD COLUMN "autosave" boolean;
  ALTER TABLE "_homepage_hero_v" ADD COLUMN "autosave" boolean;
  ALTER TABLE "_homepage_sections_v" ADD COLUMN "autosave" boolean;
  ALTER TABLE "_footer_v" ADD COLUMN "autosave" boolean;
  CREATE INDEX "_page_templates_v_autosave_idx" ON "_page_templates_v" USING btree ("autosave");
  CREATE INDEX "_pages_v_autosave_idx" ON "_pages_v" USING btree ("autosave");
  CREATE INDEX "_posts_v_autosave_idx" ON "_posts_v" USING btree ("autosave");
  CREATE INDEX "_navigation_v_autosave_idx" ON "_navigation_v" USING btree ("autosave");
  CREATE INDEX "_homepage_hero_v_autosave_idx" ON "_homepage_hero_v" USING btree ("autosave");
  CREATE INDEX "_homepage_sections_v_autosave_idx" ON "_homepage_sections_v" USING btree ("autosave");
  CREATE INDEX "_footer_v_autosave_idx" ON "_footer_v" USING btree ("autosave");

  DROP TABLE "_site_settings_v";
  DROP INDEX "site_settings__status_idx";
  UPDATE "site_settings" SET "site_name" = DEFAULT WHERE "site_name" IS NULL;
  ALTER TABLE "site_settings" ALTER COLUMN "site_name" SET NOT NULL;
  ALTER TABLE "site_settings" DROP COLUMN "_status";
  DROP TYPE "public"."enum_site_settings_status";
  DROP TYPE "public"."enum__site_settings_v_version_status";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  CREATE TYPE "public"."enum_site_settings_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__site_settings_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "_site_settings_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_site_name" varchar DEFAULT 'Wrocławski Klub Fantastyki',
  	"version_site_description" varchar,
  	"version_contact_email" varchar,
  	"version__status" "enum__site_settings_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "site_settings" ALTER COLUMN "site_name" DROP NOT NULL;
  ALTER TABLE "site_settings" ADD COLUMN "_status" "enum_site_settings_status" DEFAULT 'draft';
  CREATE INDEX "_site_settings_v_version_version__status_idx" ON "_site_settings_v" USING btree ("version__status");
  CREATE INDEX "_site_settings_v_created_at_idx" ON "_site_settings_v" USING btree ("created_at");
  CREATE INDEX "_site_settings_v_updated_at_idx" ON "_site_settings_v" USING btree ("updated_at");
  CREATE INDEX "_site_settings_v_latest_idx" ON "_site_settings_v" USING btree ("latest");
  UPDATE "site_settings" SET "_status" = 'published';
  INSERT INTO "_site_settings_v" (
    "version_site_name", "version_site_description", "version_contact_email",
    "version__status", "version_updated_at", "version_created_at", "latest"
  )
  SELECT "site_name", "site_description", "contact_email", 'published', "updated_at", "created_at", true
  FROM "site_settings";
  CREATE INDEX "site_settings__status_idx" ON "site_settings" USING btree ("_status");

  ALTER TABLE "_page_templates_v" DROP COLUMN "autosave";
  ALTER TABLE "_pages_v" DROP COLUMN "autosave";
  ALTER TABLE "_posts_v" DROP COLUMN "autosave";
  ALTER TABLE "_navigation_v" DROP COLUMN "autosave";
  ALTER TABLE "_homepage_hero_v" DROP COLUMN "autosave";
  ALTER TABLE "_homepage_sections_v" DROP COLUMN "autosave";
  ALTER TABLE "_footer_v" DROP COLUMN "autosave";

  DROP TABLE "content_audit_log";
  DELETE FROM "roles_permissions" WHERE "resource" = 'content-audit-log';
  ALTER TABLE "roles_permissions" ALTER COLUMN "resource" SET DATA TYPE text;
  DROP TYPE "public"."enum_roles_permissions_resource";
  CREATE TYPE "public"."enum_roles_permissions_resource" AS ENUM(${previousResources});
  ALTER TABLE "roles_permissions" ALTER COLUMN "resource" SET DATA TYPE "public"."enum_roles_permissions_resource" USING "resource"::"public"."enum_roles_permissions_resource";
  DROP TYPE "public"."enum_content_audit_log_action";
  DROP TYPE "public"."enum_content_audit_log_target";
  DROP TYPE "public"."enum_content_audit_log_save_mode";`)
}
