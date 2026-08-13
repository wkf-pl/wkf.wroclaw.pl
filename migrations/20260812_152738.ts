import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_club_sections_menu_items_target_type" AS ENUM('page', 'custom');
  CREATE TYPE "public"."enum_club_sections_menu_items_icon_source" AS ENUM('system', 'media');
  CREATE TYPE "public"."enum_club_sections_menu_items_system_icon" AS ENUM('book', 'calendar', 'collection', 'dice', 'discord', 'facebook', 'instagram', 'location', 'mail', 'pawn', 'review', 'star', 'time', 'users');
  CREATE TYPE "public"."enum_club_sections_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__club_sections_v_version_menu_items_target_type" AS ENUM('page', 'custom');
  CREATE TYPE "public"."enum__club_sections_v_version_menu_items_icon_source" AS ENUM('system', 'media');
  CREATE TYPE "public"."enum__club_sections_v_version_menu_items_system_icon" AS ENUM('book', 'calendar', 'collection', 'dice', 'discord', 'facebook', 'instagram', 'location', 'mail', 'pawn', 'review', 'star', 'time', 'users');
  CREATE TYPE "public"."enum__club_sections_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_navigation_header_items_appearance" AS ENUM('link', 'icon', 'button');
  CREATE TYPE "public"."enum_navigation_header_items_target_type" AS ENUM('page', 'custom');
  CREATE TYPE "public"."enum_navigation_header_items_icon_source" AS ENUM('system', 'media');
  CREATE TYPE "public"."enum_navigation_header_items_system_icon" AS ENUM('book', 'calendar', 'collection', 'dice', 'discord', 'facebook', 'instagram', 'location', 'mail', 'pawn', 'review', 'star', 'time', 'users');
  CREATE TYPE "public"."enum_navigation_hero_items_target_type" AS ENUM('page', 'custom');
  CREATE TYPE "public"."enum_navigation_social_items_target_type" AS ENUM('page', 'custom');
  CREATE TYPE "public"."enum_navigation_social_items_icon_source" AS ENUM('system', 'media');
  CREATE TYPE "public"."enum_navigation_social_items_system_icon" AS ENUM('book', 'calendar', 'collection', 'dice', 'discord', 'facebook', 'instagram', 'location', 'mail', 'pawn', 'review', 'star', 'time', 'users');
  CREATE TYPE "public"."enum_navigation_footer_columns_items_target_type" AS ENUM('page', 'custom');
  ALTER TABLE "roles_permissions" ALTER COLUMN "resource" SET DATA TYPE text;
  DROP TYPE "public"."enum_roles_permissions_resource";
  CREATE TYPE "public"."enum_roles_permissions_resource" AS ENUM('users', 'media', 'pages', 'posts', 'club-sections', 'categories', 'tags', 'navigation', 'footer', 'site-settings');
  ALTER TABLE "roles_permissions" ALTER COLUMN "resource" SET DATA TYPE "public"."enum_roles_permissions_resource" USING "resource"::"public"."enum_roles_permissions_resource";
  CREATE TABLE "club_sections_menu_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"target_type" "enum_club_sections_menu_items_target_type" DEFAULT 'custom',
  	"page_id" integer,
  	"url" varchar,
  	"open_in_new_tab" boolean DEFAULT false,
  	"icon_source" "enum_club_sections_menu_items_icon_source" DEFAULT 'system',
  	"system_icon" "enum_club_sections_menu_items_system_icon",
  	"custom_icon_id" integer
  );
  
  CREATE TABLE "club_sections" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"background_image_id" integer,
  	"display_order" numeric DEFAULT 0,
  	"destination_page_id" integer,
  	"slug" varchar,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_club_sections_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_club_sections_v_version_menu_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"target_type" "enum__club_sections_v_version_menu_items_target_type" DEFAULT 'custom',
  	"page_id" integer,
  	"url" varchar,
  	"open_in_new_tab" boolean DEFAULT false,
  	"icon_source" "enum__club_sections_v_version_menu_items_icon_source" DEFAULT 'system',
  	"system_icon" "enum__club_sections_v_version_menu_items_system_icon",
  	"custom_icon_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_club_sections_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_background_image_id" integer,
  	"version_display_order" numeric DEFAULT 0,
  	"version_destination_page_id" integer,
  	"version_slug" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__club_sections_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "navigation_hero_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"target_type" "enum_navigation_hero_items_target_type" DEFAULT 'custom' NOT NULL,
  	"page_id" integer,
  	"url" varchar,
  	"open_in_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "navigation_social_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"target_type" "enum_navigation_social_items_target_type" DEFAULT 'custom' NOT NULL,
  	"page_id" integer,
  	"url" varchar,
  	"open_in_new_tab" boolean DEFAULT false,
  	"icon_source" "enum_navigation_social_items_icon_source" DEFAULT 'system',
  	"system_icon" "enum_navigation_social_items_system_icon",
  	"custom_icon_id" integer
  );
  
  CREATE TABLE "navigation_footer_columns_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"target_type" "enum_navigation_footer_columns_items_target_type" DEFAULT 'custom' NOT NULL,
  	"page_id" integer,
  	"url" varchar,
  	"open_in_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "navigation_footer_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL
  );

  INSERT INTO "navigation_footer_columns" ("_order", "_parent_id", "id", "title")
  SELECT 0, "navigation"."id", 'migrated-footer-navigation', 'Nawigacja'
  FROM "navigation"
  WHERE EXISTS (SELECT 1 FROM "footer_links");

  INSERT INTO "navigation_footer_columns_items" (
    "_order", "_parent_id", "id", "label", "target_type", "url", "open_in_new_tab"
  )
  SELECT "_order", 'migrated-footer-navigation', "id", "label", 'custom', "href", false
  FROM "footer_links";
  
  ALTER TABLE "footer_links" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "footer_links" CASCADE;
  ALTER TABLE "navigation_items" RENAME TO "navigation_header_items";
  ALTER TABLE "navigation_header_items" RENAME COLUMN "href" TO "url";
  ALTER TABLE "navigation_header_items" ALTER COLUMN "url" DROP NOT NULL;
  ALTER TABLE "navigation_header_items" DROP CONSTRAINT "navigation_items_parent_id_fk";
  
  DROP INDEX "navigation_items_order_idx";
  DROP INDEX "navigation_items_parent_id_idx";
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "club_sections_id" integer;
  ALTER TABLE "navigation_header_items" ADD COLUMN "appearance" "enum_navigation_header_items_appearance" DEFAULT 'link' NOT NULL;
  ALTER TABLE "navigation_header_items" ADD COLUMN "target_type" "enum_navigation_header_items_target_type" DEFAULT 'custom' NOT NULL;
  ALTER TABLE "navigation_header_items" ADD COLUMN "page_id" integer;
  ALTER TABLE "navigation_header_items" ADD COLUMN "icon_source" "enum_navigation_header_items_icon_source" DEFAULT 'system';
  ALTER TABLE "navigation_header_items" ADD COLUMN "system_icon" "enum_navigation_header_items_system_icon";
  ALTER TABLE "navigation_header_items" ADD COLUMN "custom_icon_id" integer;
  UPDATE "roles_permissions"
  SET "_order" = "_order" + 1
  WHERE "_parent_id" IN (SELECT "id" FROM "roles" WHERE "key" = 'editor')
    AND "_order" >= 6;
  INSERT INTO "roles_permissions" (
    "_order", "_parent_id", "id", "resource", "can_create", "read_allowed",
    "update_allowed", "delete_allowed"
  )
  SELECT 6, "id", 'editor-club-sections', 'club-sections', true, true, true, true
  FROM "roles"
  WHERE "key" = 'editor';
  ALTER TABLE "club_sections_menu_items" ADD CONSTRAINT "club_sections_menu_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "club_sections_menu_items" ADD CONSTRAINT "club_sections_menu_items_custom_icon_id_media_id_fk" FOREIGN KEY ("custom_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "club_sections_menu_items" ADD CONSTRAINT "club_sections_menu_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."club_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "club_sections" ADD CONSTRAINT "club_sections_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "club_sections" ADD CONSTRAINT "club_sections_destination_page_id_pages_id_fk" FOREIGN KEY ("destination_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_club_sections_v_version_menu_items" ADD CONSTRAINT "_club_sections_v_version_menu_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_club_sections_v_version_menu_items" ADD CONSTRAINT "_club_sections_v_version_menu_items_custom_icon_id_media_id_fk" FOREIGN KEY ("custom_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_club_sections_v_version_menu_items" ADD CONSTRAINT "_club_sections_v_version_menu_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_club_sections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_club_sections_v" ADD CONSTRAINT "_club_sections_v_parent_id_club_sections_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."club_sections"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_club_sections_v" ADD CONSTRAINT "_club_sections_v_version_background_image_id_media_id_fk" FOREIGN KEY ("version_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_club_sections_v" ADD CONSTRAINT "_club_sections_v_version_destination_page_id_pages_id_fk" FOREIGN KEY ("version_destination_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_hero_items" ADD CONSTRAINT "navigation_hero_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_hero_items" ADD CONSTRAINT "navigation_hero_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_social_items" ADD CONSTRAINT "navigation_social_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_social_items" ADD CONSTRAINT "navigation_social_items_custom_icon_id_media_id_fk" FOREIGN KEY ("custom_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_social_items" ADD CONSTRAINT "navigation_social_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns_items" ADD CONSTRAINT "navigation_footer_columns_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns_items" ADD CONSTRAINT "navigation_footer_columns_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns" ADD CONSTRAINT "navigation_footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "club_sections_menu_items_order_idx" ON "club_sections_menu_items" USING btree ("_order");
  CREATE INDEX "club_sections_menu_items_parent_id_idx" ON "club_sections_menu_items" USING btree ("_parent_id");
  CREATE INDEX "club_sections_menu_items_page_idx" ON "club_sections_menu_items" USING btree ("page_id");
  CREATE INDEX "club_sections_menu_items_custom_icon_idx" ON "club_sections_menu_items" USING btree ("custom_icon_id");
  CREATE INDEX "club_sections_background_image_idx" ON "club_sections" USING btree ("background_image_id");
  CREATE INDEX "club_sections_destination_page_idx" ON "club_sections" USING btree ("destination_page_id");
  CREATE UNIQUE INDEX "club_sections_slug_idx" ON "club_sections" USING btree ("slug");
  CREATE INDEX "club_sections_updated_at_idx" ON "club_sections" USING btree ("updated_at");
  CREATE INDEX "club_sections_created_at_idx" ON "club_sections" USING btree ("created_at");
  CREATE INDEX "club_sections__status_idx" ON "club_sections" USING btree ("_status");
  CREATE INDEX "_club_sections_v_version_menu_items_order_idx" ON "_club_sections_v_version_menu_items" USING btree ("_order");
  CREATE INDEX "_club_sections_v_version_menu_items_parent_id_idx" ON "_club_sections_v_version_menu_items" USING btree ("_parent_id");
  CREATE INDEX "_club_sections_v_version_menu_items_page_idx" ON "_club_sections_v_version_menu_items" USING btree ("page_id");
  CREATE INDEX "_club_sections_v_version_menu_items_custom_icon_idx" ON "_club_sections_v_version_menu_items" USING btree ("custom_icon_id");
  CREATE INDEX "_club_sections_v_parent_idx" ON "_club_sections_v" USING btree ("parent_id");
  CREATE INDEX "_club_sections_v_version_version_background_image_idx" ON "_club_sections_v" USING btree ("version_background_image_id");
  CREATE INDEX "_club_sections_v_version_version_destination_page_idx" ON "_club_sections_v" USING btree ("version_destination_page_id");
  CREATE INDEX "_club_sections_v_version_version_slug_idx" ON "_club_sections_v" USING btree ("version_slug");
  CREATE INDEX "_club_sections_v_version_version_updated_at_idx" ON "_club_sections_v" USING btree ("version_updated_at");
  CREATE INDEX "_club_sections_v_version_version_created_at_idx" ON "_club_sections_v" USING btree ("version_created_at");
  CREATE INDEX "_club_sections_v_version_version__status_idx" ON "_club_sections_v" USING btree ("version__status");
  CREATE INDEX "_club_sections_v_created_at_idx" ON "_club_sections_v" USING btree ("created_at");
  CREATE INDEX "_club_sections_v_updated_at_idx" ON "_club_sections_v" USING btree ("updated_at");
  CREATE INDEX "_club_sections_v_latest_idx" ON "_club_sections_v" USING btree ("latest");
  CREATE INDEX "navigation_hero_items_order_idx" ON "navigation_hero_items" USING btree ("_order");
  CREATE INDEX "navigation_hero_items_parent_id_idx" ON "navigation_hero_items" USING btree ("_parent_id");
  CREATE INDEX "navigation_hero_items_page_idx" ON "navigation_hero_items" USING btree ("page_id");
  CREATE INDEX "navigation_social_items_order_idx" ON "navigation_social_items" USING btree ("_order");
  CREATE INDEX "navigation_social_items_parent_id_idx" ON "navigation_social_items" USING btree ("_parent_id");
  CREATE INDEX "navigation_social_items_page_idx" ON "navigation_social_items" USING btree ("page_id");
  CREATE INDEX "navigation_social_items_custom_icon_idx" ON "navigation_social_items" USING btree ("custom_icon_id");
  CREATE INDEX "navigation_footer_columns_items_order_idx" ON "navigation_footer_columns_items" USING btree ("_order");
  CREATE INDEX "navigation_footer_columns_items_parent_id_idx" ON "navigation_footer_columns_items" USING btree ("_parent_id");
  CREATE INDEX "navigation_footer_columns_items_page_idx" ON "navigation_footer_columns_items" USING btree ("page_id");
  CREATE INDEX "navigation_footer_columns_order_idx" ON "navigation_footer_columns" USING btree ("_order");
  CREATE INDEX "navigation_footer_columns_parent_id_idx" ON "navigation_footer_columns" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_club_sections_fk" FOREIGN KEY ("club_sections_id") REFERENCES "public"."club_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_header_items" ADD CONSTRAINT "navigation_header_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_header_items" ADD CONSTRAINT "navigation_header_items_custom_icon_id_media_id_fk" FOREIGN KEY ("custom_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_header_items" ADD CONSTRAINT "navigation_header_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_club_sections_id_idx" ON "payload_locked_documents_rels" USING btree ("club_sections_id");
  CREATE INDEX "navigation_header_items_order_idx" ON "navigation_header_items" USING btree ("_order");
  CREATE INDEX "navigation_header_items_parent_id_idx" ON "navigation_header_items" USING btree ("_parent_id");
  CREATE INDEX "navigation_header_items_page_idx" ON "navigation_header_items" USING btree ("page_id");
  CREATE INDEX "navigation_header_items_custom_icon_idx" ON "navigation_header_items" USING btree ("custom_icon_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "footer_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL
  );

  INSERT INTO "footer_links" ("_order", "_parent_id", "id", "label", "href")
  SELECT
    ROW_NUMBER() OVER (
      PARTITION BY "footer"."id"
      ORDER BY "columns"."_order", "items"."_order"
    ) - 1,
    "footer"."id",
    "items"."id",
    "items"."label",
    COALESCE("items"."url", '/' || "pages"."slug")
  FROM "navigation_footer_columns" AS "columns"
  INNER JOIN "navigation_footer_columns_items" AS "items"
    ON "items"."_parent_id" = "columns"."id"
  CROSS JOIN "footer"
  LEFT JOIN "pages" ON "pages"."id" = "items"."page_id"
  WHERE COALESCE("items"."url", "pages"."slug") IS NOT NULL;

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_club_sections_fk";
  
  ALTER TABLE "club_sections_menu_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "club_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_club_sections_v_version_menu_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_club_sections_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_hero_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_social_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_footer_columns_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_footer_columns" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "club_sections_menu_items" CASCADE;
  DROP TABLE "club_sections" CASCADE;
  DROP TABLE "_club_sections_v_version_menu_items" CASCADE;
  DROP TABLE "_club_sections_v" CASCADE;
  DROP TABLE "navigation_hero_items" CASCADE;
  DROP TABLE "navigation_social_items" CASCADE;
  DROP TABLE "navigation_footer_columns_items" CASCADE;
  DROP TABLE "navigation_footer_columns" CASCADE;
  UPDATE "navigation_header_items" AS "items"
  SET "url" = COALESCE("items"."url", '/' || "pages"."slug", '#')
  FROM "pages"
  WHERE "items"."page_id" = "pages"."id" AND "items"."url" IS NULL;
  UPDATE "navigation_header_items" SET "url" = '#' WHERE "url" IS NULL;
  ALTER TABLE "navigation_header_items" ALTER COLUMN "url" SET NOT NULL;
  ALTER TABLE "navigation_header_items" RENAME TO "navigation_items";
  ALTER TABLE "navigation_items" RENAME COLUMN "url" TO "href";
  ALTER TABLE "navigation_items" DROP CONSTRAINT "navigation_header_items_page_id_pages_id_fk";
  
  ALTER TABLE "navigation_items" DROP CONSTRAINT "navigation_header_items_custom_icon_id_media_id_fk";
  
  ALTER TABLE "navigation_items" DROP CONSTRAINT "navigation_header_items_parent_id_fk";
  
  DELETE FROM "roles_permissions" WHERE "resource" = 'club-sections';
  UPDATE "roles_permissions"
  SET "_order" = "_order" - 1
  WHERE "_parent_id" IN (SELECT "id" FROM "roles" WHERE "key" = 'editor')
    AND "_order" > 6;
  ALTER TABLE "roles_permissions" ALTER COLUMN "resource" SET DATA TYPE text;
  DROP TYPE "public"."enum_roles_permissions_resource";
  CREATE TYPE "public"."enum_roles_permissions_resource" AS ENUM('users', 'media', 'pages', 'posts', 'categories', 'tags', 'navigation', 'footer', 'site-settings');
  ALTER TABLE "roles_permissions" ALTER COLUMN "resource" SET DATA TYPE "public"."enum_roles_permissions_resource" USING "resource"::"public"."enum_roles_permissions_resource";
  DROP INDEX "payload_locked_documents_rels_club_sections_id_idx";
  DROP INDEX "navigation_header_items_order_idx";
  DROP INDEX "navigation_header_items_parent_id_idx";
  DROP INDEX "navigation_header_items_page_idx";
  DROP INDEX "navigation_header_items_custom_icon_idx";
  ALTER TABLE "footer_links" ADD CONSTRAINT "footer_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "footer_links_order_idx" ON "footer_links" USING btree ("_order");
  CREATE INDEX "footer_links_parent_id_idx" ON "footer_links" USING btree ("_parent_id");
  ALTER TABLE "navigation_items" ADD CONSTRAINT "navigation_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "navigation_items_order_idx" ON "navigation_items" USING btree ("_order");
  CREATE INDEX "navigation_items_parent_id_idx" ON "navigation_items" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "club_sections_id";
  ALTER TABLE "navigation_items" DROP COLUMN "appearance";
  ALTER TABLE "navigation_items" DROP COLUMN "target_type";
  ALTER TABLE "navigation_items" DROP COLUMN "page_id";
  ALTER TABLE "navigation_items" DROP COLUMN "icon_source";
  ALTER TABLE "navigation_items" DROP COLUMN "system_icon";
  ALTER TABLE "navigation_items" DROP COLUMN "custom_icon_id";
  DROP TYPE "public"."enum_club_sections_menu_items_target_type";
  DROP TYPE "public"."enum_club_sections_menu_items_icon_source";
  DROP TYPE "public"."enum_club_sections_menu_items_system_icon";
  DROP TYPE "public"."enum_club_sections_status";
  DROP TYPE "public"."enum__club_sections_v_version_menu_items_target_type";
  DROP TYPE "public"."enum__club_sections_v_version_menu_items_icon_source";
  DROP TYPE "public"."enum__club_sections_v_version_menu_items_system_icon";
  DROP TYPE "public"."enum__club_sections_v_version_status";
  DROP TYPE "public"."enum_navigation_header_items_appearance";
  DROP TYPE "public"."enum_navigation_header_items_target_type";
  DROP TYPE "public"."enum_navigation_header_items_icon_source";
  DROP TYPE "public"."enum_navigation_header_items_system_icon";
  DROP TYPE "public"."enum_navigation_hero_items_target_type";
  DROP TYPE "public"."enum_navigation_social_items_target_type";
  DROP TYPE "public"."enum_navigation_social_items_icon_source";
  DROP TYPE "public"."enum_navigation_social_items_system_icon";
  DROP TYPE "public"."enum_navigation_footer_columns_items_target_type";`)
}
