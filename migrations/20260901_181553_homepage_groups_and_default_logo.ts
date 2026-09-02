import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_homepage_sections_groups_menu_items_target_type" AS ENUM('custom', 'eventCycle', 'document', 'category', 'partner', 'page', 'tag', 'post', 'event');
  CREATE TYPE "public"."enum_homepage_sections_groups_menu_items_custom_scheme" AS ENUM('https', 'http', 'mailto', 'tel', 'path', 'anchor');
  CREATE TYPE "public"."enum_homepage_sections_groups_menu_items_icon_source" AS ENUM('system', 'media');
  CREATE TYPE "public"."enum_homepage_sections_groups_menu_items_system_icon" AS ENUM('time', 'discord', 'mail', 'facebook', 'star', 'instagram', 'calendar', 'collection', 'dice', 'book', 'location', 'pawn', 'review', 'slack', 'users');
  CREATE TABLE "homepage_sections_groups_menu_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"target_type" "enum_homepage_sections_groups_menu_items_target_type" DEFAULT 'custom' NOT NULL,
  	"event_cycle_id" integer,
  	"document_id" integer,
  	"category_id" integer,
  	"partner_id" integer,
  	"page_id" integer,
  	"tag_id" integer,
  	"post_id" integer,
  	"event_id" integer,
  	"custom_scheme" "enum_homepage_sections_groups_menu_items_custom_scheme" DEFAULT 'https',
  	"custom_address" varchar,
  	"open_in_new_tab" boolean DEFAULT false,
  	"icon_source" "enum_homepage_sections_groups_menu_items_icon_source" DEFAULT 'system',
  	"system_icon" "enum_homepage_sections_groups_menu_items_system_icon",
  	"custom_icon_id" integer
  );
  
  CREATE TABLE "homepage_sections_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"background_image_id" integer,
   "destination_page_id" integer
  );

  INSERT INTO "homepage_sections_groups" (
    "_order", "_parent_id", "id", "name", "background_image_id", "destination_page_id"
  )
  SELECT relations."order", relations."parent_id",
    'club-section-' || relations."parent_id" || '-' || sections."id",
    sections."name", sections."background_image_id", sections."destination_page_id"
  FROM "homepage_sections_rels" AS relations
  JOIN "club_sections" AS sections ON sections."id" = relations."club_sections_id"
  WHERE relations."path" = 'cards' AND sections."_status" = 'published';

  INSERT INTO "homepage_sections_groups_menu_items" (
    "_order", "_parent_id", "id", "label", "target_type", "event_cycle_id",
    "document_id", "category_id", "partner_id", "page_id", "tag_id", "post_id",
    "event_id", "custom_scheme", "custom_address", "open_in_new_tab", "icon_source",
    "system_icon", "custom_icon_id"
  )
  SELECT items."_order",
    'club-section-' || relations."parent_id" || '-' || sections."id",
    items."id", items."label",
    items."target_type"::text::"public"."enum_homepage_sections_groups_menu_items_target_type",
    items."event_cycle_id", items."document_id", items."category_id", items."partner_id",
    items."page_id", items."tag_id", items."post_id", items."event_id",
    items."custom_scheme"::text::"public"."enum_homepage_sections_groups_menu_items_custom_scheme",
    items."custom_address", items."open_in_new_tab",
    items."icon_source"::text::"public"."enum_homepage_sections_groups_menu_items_icon_source",
    items."system_icon"::text::"public"."enum_homepage_sections_groups_menu_items_system_icon",
    items."custom_icon_id"
  FROM "homepage_sections_rels" AS relations
  JOIN "club_sections" AS sections ON sections."id" = relations."club_sections_id"
  JOIN "club_sections_menu_items" AS items ON items."_parent_id" = sections."id"
  WHERE relations."path" = 'cards' AND sections."_status" = 'published';

  INSERT INTO "media" ("alt", "url", "filename", "mime_type", "filesize", "width", "height")
  SELECT 'Logo Wrocławskiego Klubu Fantastyki', '/assets/logo-color.webp',
    'logo-color.webp', 'image/webp', 92600, 320, 300
  WHERE NOT EXISTS (SELECT 1 FROM "media" WHERE "filename" = 'logo-color.webp');

  UPDATE "navigation"
  SET "logo_id" = (
    SELECT "id" FROM "media" WHERE "filename" = 'logo-color.webp' ORDER BY "id" LIMIT 1
  )
  WHERE "logo_id" IS NULL;

  SELECT setval(
    pg_get_serial_sequence('media', 'id'),
    COALESCE((SELECT max("id") FROM "media"), 1),
    EXISTS (SELECT 1 FROM "media")
  );
  
  DROP TABLE "homepage_sections_rels" CASCADE;
  ALTER TABLE "homepage_sections_groups_menu_items" ADD CONSTRAINT "homepage_sections_groups_menu_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_groups_menu_items" ADD CONSTRAINT "homepage_sections_groups_menu_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_groups_menu_items" ADD CONSTRAINT "homepage_sections_groups_menu_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_groups_menu_items" ADD CONSTRAINT "homepage_sections_groups_menu_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_groups_menu_items" ADD CONSTRAINT "homepage_sections_groups_menu_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_groups_menu_items" ADD CONSTRAINT "homepage_sections_groups_menu_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_groups_menu_items" ADD CONSTRAINT "homepage_sections_groups_menu_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_groups_menu_items" ADD CONSTRAINT "homepage_sections_groups_menu_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_groups_menu_items" ADD CONSTRAINT "homepage_sections_groups_menu_items_custom_icon_id_media_id_fk" FOREIGN KEY ("custom_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_groups_menu_items" ADD CONSTRAINT "homepage_sections_groups_menu_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_groups" ADD CONSTRAINT "homepage_sections_groups_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_groups" ADD CONSTRAINT "homepage_sections_groups_destination_page_id_pages_id_fk" FOREIGN KEY ("destination_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_groups" ADD CONSTRAINT "homepage_sections_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "homepage_sections_groups_menu_items_order_idx" ON "homepage_sections_groups_menu_items" USING btree ("_order");
  CREATE INDEX "homepage_sections_groups_menu_items_parent_id_idx" ON "homepage_sections_groups_menu_items" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_groups_menu_items_event_cycle_idx" ON "homepage_sections_groups_menu_items" USING btree ("event_cycle_id");
  CREATE INDEX "homepage_sections_groups_menu_items_document_idx" ON "homepage_sections_groups_menu_items" USING btree ("document_id");
  CREATE INDEX "homepage_sections_groups_menu_items_category_idx" ON "homepage_sections_groups_menu_items" USING btree ("category_id");
  CREATE INDEX "homepage_sections_groups_menu_items_partner_idx" ON "homepage_sections_groups_menu_items" USING btree ("partner_id");
  CREATE INDEX "homepage_sections_groups_menu_items_page_idx" ON "homepage_sections_groups_menu_items" USING btree ("page_id");
  CREATE INDEX "homepage_sections_groups_menu_items_tag_idx" ON "homepage_sections_groups_menu_items" USING btree ("tag_id");
  CREATE INDEX "homepage_sections_groups_menu_items_post_idx" ON "homepage_sections_groups_menu_items" USING btree ("post_id");
  CREATE INDEX "homepage_sections_groups_menu_items_event_idx" ON "homepage_sections_groups_menu_items" USING btree ("event_id");
  CREATE INDEX "homepage_sections_groups_menu_items_custom_icon_idx" ON "homepage_sections_groups_menu_items" USING btree ("custom_icon_id");
  CREATE INDEX "homepage_sections_groups_order_idx" ON "homepage_sections_groups" USING btree ("_order");
  CREATE INDEX "homepage_sections_groups_parent_id_idx" ON "homepage_sections_groups" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_groups_background_image_idx" ON "homepage_sections_groups" USING btree ("background_image_id");
  CREATE INDEX "homepage_sections_groups_destination_page_idx" ON "homepage_sections_groups" USING btree ("destination_page_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "homepage_sections_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"club_sections_id" integer
  );

  INSERT INTO "homepage_sections_rels" ("order", "parent_id", "path", "club_sections_id")
  SELECT groups."_order", groups."_parent_id", 'cards', sections."id"
  FROM "homepage_sections_groups" AS groups
  JOIN "club_sections" AS sections
    ON groups."id" = 'club-section-' || groups."_parent_id" || '-' || sections."id";

  UPDATE "navigation"
  SET "logo_id" = NULL
  WHERE "logo_id" IN (
    SELECT "id" FROM "media"
    WHERE "filename" = 'logo-color.webp' AND "url" = '/assets/logo-color.webp'
  );
  
  DROP TABLE "homepage_sections_groups_menu_items" CASCADE;
  DROP TABLE "homepage_sections_groups" CASCADE;
  ALTER TABLE "homepage_sections_rels" ADD CONSTRAINT "homepage_sections_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_rels" ADD CONSTRAINT "homepage_sections_rels_club_sections_fk" FOREIGN KEY ("club_sections_id") REFERENCES "public"."club_sections"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "homepage_sections_rels_order_idx" ON "homepage_sections_rels" USING btree ("order");
  CREATE INDEX "homepage_sections_rels_parent_idx" ON "homepage_sections_rels" USING btree ("parent_id");
  CREATE INDEX "homepage_sections_rels_path_idx" ON "homepage_sections_rels" USING btree ("path");
  CREATE INDEX "homepage_sections_rels_club_sections_id_idx" ON "homepage_sections_rels" USING btree ("club_sections_id");
  DROP TYPE "public"."enum_homepage_sections_groups_menu_items_target_type";
  DROP TYPE "public"."enum_homepage_sections_groups_menu_items_custom_scheme";
  DROP TYPE "public"."enum_homepage_sections_groups_menu_items_icon_source";
  DROP TYPE "public"."enum_homepage_sections_groups_menu_items_system_icon";`)
}
