import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_navigation_hero_items_target_type" RENAME TO "enum_homepage_hero_items_target_type";
  ALTER TYPE "public"."enum_navigation_hero_items_custom_scheme" RENAME TO "enum_homepage_hero_items_custom_scheme";
  ALTER TYPE "public"."enum_site_settings_homepage_post_count" RENAME TO "enum_homepage_sections_post_count";
  ALTER TYPE "public"."enum_navigation_social_items_target_type" RENAME TO "enum_footer_social_items_target_type";
  ALTER TYPE "public"."enum_navigation_social_items_custom_scheme" RENAME TO "enum_footer_social_items_custom_scheme";
  ALTER TYPE "public"."enum_navigation_social_items_icon_source" RENAME TO "enum_footer_social_items_icon_source";
  ALTER TYPE "public"."enum_navigation_social_items_system_icon" RENAME TO "enum_footer_social_items_system_icon";
  ALTER TYPE "public"."enum_navigation_footer_columns_items_target_type" RENAME TO "enum_footer_columns_items_target_type";
  ALTER TYPE "public"."enum_navigation_footer_columns_items_custom_scheme" RENAME TO "enum_footer_columns_items_custom_scheme";
  CREATE TABLE "homepage_hero" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"title" jsonb DEFAULT '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Witaj w klubie","type":"text","version":1},{"type":"linebreak","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":"ludzi z ","type":"text","version":1},{"detail":0,"format":2,"mode":"normal","style":"","text":"wyobraźnią","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"textFormat":0,"textStyle":"","type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}'::jsonb NOT NULL,
  	"content" jsonb,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "homepage_sections" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"events_title" varchar DEFAULT 'Wydarzenia' NOT NULL,
  	"events_content" jsonb,
  	"event_window_weeks" numeric DEFAULT 4,
  	"event_slide_limit" numeric DEFAULT 6,
  	"news_title" varchar DEFAULT 'Aktualności' NOT NULL,
  	"post_count" "enum_homepage_sections_post_count" DEFAULT '2',
  	"sections_title" varchar DEFAULT 'Sekcje',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "homepage_sections_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"club_sections_id" integer
  );
  
  CREATE TABLE "footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"copyright" jsonb,
  	"content" jsonb,
  	"contact_heading" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "navigation_hero_items" RENAME TO "homepage_hero_items";
  ALTER TABLE "navigation_social_items" RENAME TO "footer_social_items";
  ALTER TABLE "navigation_footer_columns_items" RENAME TO "footer_columns_items";
  ALTER TABLE "navigation_footer_columns" RENAME TO "footer_columns";
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_hero_image_id_media_id_fk";
  
  ALTER TABLE "homepage_hero_items" DROP CONSTRAINT "navigation_hero_items_event_cycle_id_event_cycles_id_fk";
  
  ALTER TABLE "homepage_hero_items" DROP CONSTRAINT "navigation_hero_items_document_id_documents_id_fk";
  
  ALTER TABLE "homepage_hero_items" DROP CONSTRAINT "navigation_hero_items_category_id_categories_id_fk";
  
  ALTER TABLE "homepage_hero_items" DROP CONSTRAINT "navigation_hero_items_partner_id_partners_id_fk";
  
  ALTER TABLE "homepage_hero_items" DROP CONSTRAINT "navigation_hero_items_page_id_pages_id_fk";
  
  ALTER TABLE "homepage_hero_items" DROP CONSTRAINT "navigation_hero_items_tag_id_tags_id_fk";
  
  ALTER TABLE "homepage_hero_items" DROP CONSTRAINT "navigation_hero_items_post_id_posts_id_fk";
  
  ALTER TABLE "homepage_hero_items" DROP CONSTRAINT "navigation_hero_items_event_id_events_id_fk";
  
  ALTER TABLE "homepage_hero_items" DROP CONSTRAINT "navigation_hero_items_parent_id_fk";
  
  ALTER TABLE "footer_social_items" DROP CONSTRAINT "navigation_social_items_event_cycle_id_event_cycles_id_fk";
  
  ALTER TABLE "footer_social_items" DROP CONSTRAINT "navigation_social_items_document_id_documents_id_fk";
  
  ALTER TABLE "footer_social_items" DROP CONSTRAINT "navigation_social_items_category_id_categories_id_fk";
  
  ALTER TABLE "footer_social_items" DROP CONSTRAINT "navigation_social_items_partner_id_partners_id_fk";
  
  ALTER TABLE "footer_social_items" DROP CONSTRAINT "navigation_social_items_page_id_pages_id_fk";
  
  ALTER TABLE "footer_social_items" DROP CONSTRAINT "navigation_social_items_tag_id_tags_id_fk";
  
  ALTER TABLE "footer_social_items" DROP CONSTRAINT "navigation_social_items_post_id_posts_id_fk";
  
  ALTER TABLE "footer_social_items" DROP CONSTRAINT "navigation_social_items_event_id_events_id_fk";
  
  ALTER TABLE "footer_social_items" DROP CONSTRAINT "navigation_social_items_custom_icon_id_media_id_fk";
  
  ALTER TABLE "footer_social_items" DROP CONSTRAINT "navigation_social_items_parent_id_fk";
  
  ALTER TABLE "footer_columns_items" DROP CONSTRAINT "navigation_footer_columns_items_event_cycle_id_event_cycles_id_fk";
  
  ALTER TABLE "footer_columns_items" DROP CONSTRAINT "navigation_footer_columns_items_document_id_documents_id_fk";
  
  ALTER TABLE "footer_columns_items" DROP CONSTRAINT "navigation_footer_columns_items_category_id_categories_id_fk";
  
  ALTER TABLE "footer_columns_items" DROP CONSTRAINT "navigation_footer_columns_items_partner_id_partners_id_fk";
  
  ALTER TABLE "footer_columns_items" DROP CONSTRAINT "navigation_footer_columns_items_page_id_pages_id_fk";
  
  ALTER TABLE "footer_columns_items" DROP CONSTRAINT "navigation_footer_columns_items_tag_id_tags_id_fk";
  
  ALTER TABLE "footer_columns_items" DROP CONSTRAINT "navigation_footer_columns_items_post_id_posts_id_fk";
  
  ALTER TABLE "footer_columns_items" DROP CONSTRAINT "navigation_footer_columns_items_event_id_events_id_fk";
  
  ALTER TABLE "footer_columns_items" DROP CONSTRAINT "navigation_footer_columns_items_parent_id_fk";
  
  ALTER TABLE "footer_columns" DROP CONSTRAINT "navigation_footer_columns_parent_id_fk";

  INSERT INTO "homepage_hero" ("id", "image_id", "updated_at", "created_at")
  SELECT COALESCE(navigation."id", settings."id"), settings."hero_image_id",
    COALESCE(navigation."updated_at", settings."updated_at", now()),
    COALESCE(navigation."created_at", settings."created_at", now())
  FROM (SELECT * FROM "navigation" ORDER BY "id" LIMIT 1) AS navigation
  FULL JOIN (SELECT * FROM "site_settings" ORDER BY "id" LIMIT 1) AS settings ON true
  WHERE navigation."id" IS NOT NULL OR settings."id" IS NOT NULL;

  INSERT INTO "homepage_sections" (
    "id", "event_window_weeks", "event_slide_limit", "post_count", "updated_at", "created_at"
  )
  SELECT COALESCE(navigation."id", settings."id"),
    COALESCE(settings."homepage_event_window_weeks", 4),
    COALESCE(settings."homepage_event_slide_limit", 6),
    COALESCE(settings."homepage_post_count", '2'::"public"."enum_homepage_sections_post_count"),
    COALESCE(settings."updated_at", navigation."updated_at", now()),
    COALESCE(settings."created_at", navigation."created_at", now())
  FROM (SELECT * FROM "navigation" ORDER BY "id" LIMIT 1) AS navigation
  FULL JOIN (SELECT * FROM "site_settings" ORDER BY "id" LIMIT 1) AS settings ON true
  WHERE navigation."id" IS NOT NULL OR settings."id" IS NOT NULL;

  INSERT INTO "homepage_sections_rels" ("order", "parent_id", "path", "club_sections_id")
  SELECT row_number() OVER (PARTITION BY sections."id" ORDER BY cards."display_order", cards."name"),
    sections."id", 'cards', cards."id"
  FROM "homepage_sections" AS sections
  CROSS JOIN "club_sections" AS cards
  WHERE cards."_status" = 'published';

  INSERT INTO "footer" ("id", "copyright", "content", "updated_at", "created_at")
  SELECT COALESCE(navigation."id", settings."id"),
    CASE
      WHEN jsonb_typeof(settings."copyright_text" #> '{root,children}') = 'array'
        AND jsonb_array_length(settings."copyright_text" #> '{root,children}') > 0
      THEN jsonb_set(
        settings."copyright_text",
        '{root,children}',
        jsonb_build_array(settings."copyright_text" #> '{root,children,0}')
      )
      ELSE settings."copyright_text"
    END,
    CASE
      WHEN jsonb_typeof(settings."copyright_text" #> '{root,children}') = 'array'
        AND jsonb_array_length(settings."copyright_text" #> '{root,children}') > 1
      THEN jsonb_set(
        settings."copyright_text",
        '{root,children}',
        (settings."copyright_text" #> '{root,children}') - 0
      )
      ELSE NULL
    END,
    COALESCE(navigation."updated_at", settings."updated_at", now()),
    COALESCE(navigation."created_at", settings."created_at", now())
  FROM (SELECT * FROM "navigation" ORDER BY "id" LIMIT 1) AS navigation
  FULL JOIN (SELECT * FROM "site_settings" ORDER BY "id" LIMIT 1) AS settings ON true
  WHERE navigation."id" IS NOT NULL OR settings."id" IS NOT NULL;

  SELECT setval(
    pg_get_serial_sequence('homepage_hero', 'id'),
    COALESCE((SELECT max("id") FROM "homepage_hero"), 1),
    EXISTS (SELECT 1 FROM "homepage_hero")
  );
  SELECT setval(
    pg_get_serial_sequence('homepage_sections', 'id'),
    COALESCE((SELECT max("id") FROM "homepage_sections"), 1),
    EXISTS (SELECT 1 FROM "homepage_sections")
  );
  SELECT setval(
    pg_get_serial_sequence('footer', 'id'),
    COALESCE((SELECT max("id") FROM "footer"), 1),
    EXISTS (SELECT 1 FROM "footer")
  );
  
  ALTER TABLE "events_external_links" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "events_external_links" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  ALTER TABLE "_events_v_version_external_links" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "_events_v_version_external_links" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  ALTER TABLE "event_cycles_event_defaults_external_links" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "event_cycles_event_defaults_external_links" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  DROP TYPE "public"."target";
  CREATE TYPE "public"."target" AS ENUM('custom', 'eventCycle', 'document', 'category', 'partner', 'page', 'tag', 'post', 'event');
  ALTER TABLE "events_external_links" ALTER COLUMN "target_type" SET DEFAULT 'custom'::"public"."target";
  ALTER TABLE "events_external_links" ALTER COLUMN "target_type" SET DATA TYPE "public"."target" USING "target_type"::"public"."target";
  ALTER TABLE "_events_v_version_external_links" ALTER COLUMN "target_type" SET DEFAULT 'custom'::"public"."target";
  ALTER TABLE "_events_v_version_external_links" ALTER COLUMN "target_type" SET DATA TYPE "public"."target" USING "target_type"::"public"."target";
  ALTER TABLE "event_cycles_event_defaults_external_links" ALTER COLUMN "target_type" SET DEFAULT 'custom'::"public"."target";
  ALTER TABLE "event_cycles_event_defaults_external_links" ALTER COLUMN "target_type" SET DATA TYPE "public"."target" USING "target_type"::"public"."target";
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" ALTER COLUMN "target_type" SET DEFAULT 'custom'::"public"."target";
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" ALTER COLUMN "target_type" SET DATA TYPE "public"."target" USING "target_type"::"public"."target";
  ALTER TABLE "club_sections_menu_items" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "club_sections_menu_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  DROP TYPE "public"."enum_club_sections_menu_items_target_type";
  CREATE TYPE "public"."enum_club_sections_menu_items_target_type" AS ENUM('custom', 'eventCycle', 'document', 'category', 'partner', 'page', 'tag', 'post', 'event');
  ALTER TABLE "club_sections_menu_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::"public"."enum_club_sections_menu_items_target_type";
  ALTER TABLE "club_sections_menu_items" ALTER COLUMN "target_type" SET DATA TYPE "public"."enum_club_sections_menu_items_target_type" USING "target_type"::"public"."enum_club_sections_menu_items_target_type";
  ALTER TABLE "_club_sections_v_version_menu_items" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "_club_sections_v_version_menu_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  DROP TYPE "public"."enum__club_sections_v_version_menu_items_target_type";
  CREATE TYPE "public"."enum__club_sections_v_version_menu_items_target_type" AS ENUM('custom', 'eventCycle', 'document', 'category', 'partner', 'page', 'tag', 'post', 'event');
  ALTER TABLE "_club_sections_v_version_menu_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::"public"."enum__club_sections_v_version_menu_items_target_type";
  ALTER TABLE "_club_sections_v_version_menu_items" ALTER COLUMN "target_type" SET DATA TYPE "public"."enum__club_sections_v_version_menu_items_target_type" USING "target_type"::"public"."enum__club_sections_v_version_menu_items_target_type";
  ALTER TABLE "navigation_header_items" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "navigation_header_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  DROP TYPE "public"."enum_navigation_header_items_target_type";
  CREATE TYPE "public"."enum_navigation_header_items_target_type" AS ENUM('custom', 'eventCycle', 'document', 'category', 'partner', 'page', 'tag', 'post', 'event');
  ALTER TABLE "navigation_header_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::"public"."enum_navigation_header_items_target_type";
  ALTER TABLE "navigation_header_items" ALTER COLUMN "target_type" SET DATA TYPE "public"."enum_navigation_header_items_target_type" USING "target_type"::"public"."enum_navigation_header_items_target_type";
  ALTER TABLE "homepage_hero_items" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "homepage_hero_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  DROP TYPE "public"."enum_homepage_hero_items_target_type";
  CREATE TYPE "public"."enum_homepage_hero_items_target_type" AS ENUM('custom', 'eventCycle', 'document', 'category', 'partner', 'page', 'tag', 'post', 'event');
  ALTER TABLE "homepage_hero_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::"public"."enum_homepage_hero_items_target_type";
  ALTER TABLE "homepage_hero_items" ALTER COLUMN "target_type" SET DATA TYPE "public"."enum_homepage_hero_items_target_type" USING "target_type"::"public"."enum_homepage_hero_items_target_type";
  ALTER TABLE "footer_social_items" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "footer_social_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  DROP TYPE "public"."enum_footer_social_items_target_type";
  CREATE TYPE "public"."enum_footer_social_items_target_type" AS ENUM('custom', 'eventCycle', 'document', 'category', 'partner', 'page', 'tag', 'post', 'event');
  ALTER TABLE "footer_social_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::"public"."enum_footer_social_items_target_type";
  ALTER TABLE "footer_social_items" ALTER COLUMN "target_type" SET DATA TYPE "public"."enum_footer_social_items_target_type" USING "target_type"::"public"."enum_footer_social_items_target_type";
  ALTER TABLE "footer_columns_items" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "footer_columns_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  DROP TYPE "public"."enum_footer_columns_items_target_type";
  CREATE TYPE "public"."enum_footer_columns_items_target_type" AS ENUM('custom', 'eventCycle', 'document', 'category', 'partner', 'page', 'tag', 'post', 'event');
  ALTER TABLE "footer_columns_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::"public"."enum_footer_columns_items_target_type";
  ALTER TABLE "footer_columns_items" ALTER COLUMN "target_type" SET DATA TYPE "public"."enum_footer_columns_items_target_type" USING "target_type"::"public"."enum_footer_columns_items_target_type";
  DROP INDEX "site_settings_hero_image_idx";
  DROP INDEX "navigation_hero_items_order_idx";
  DROP INDEX "navigation_hero_items_parent_id_idx";
  DROP INDEX "navigation_hero_items_event_cycle_idx";
  DROP INDEX "navigation_hero_items_document_idx";
  DROP INDEX "navigation_hero_items_category_idx";
  DROP INDEX "navigation_hero_items_partner_idx";
  DROP INDEX "navigation_hero_items_page_idx";
  DROP INDEX "navigation_hero_items_tag_idx";
  DROP INDEX "navigation_hero_items_post_idx";
  DROP INDEX "navigation_hero_items_event_idx";
  DROP INDEX "navigation_social_items_order_idx";
  DROP INDEX "navigation_social_items_parent_id_idx";
  DROP INDEX "navigation_social_items_event_cycle_idx";
  DROP INDEX "navigation_social_items_document_idx";
  DROP INDEX "navigation_social_items_category_idx";
  DROP INDEX "navigation_social_items_partner_idx";
  DROP INDEX "navigation_social_items_page_idx";
  DROP INDEX "navigation_social_items_tag_idx";
  DROP INDEX "navigation_social_items_post_idx";
  DROP INDEX "navigation_social_items_event_idx";
  DROP INDEX "navigation_social_items_custom_icon_idx";
  DROP INDEX "navigation_footer_columns_items_order_idx";
  DROP INDEX "navigation_footer_columns_items_parent_id_idx";
  DROP INDEX "navigation_footer_columns_items_event_cycle_idx";
  DROP INDEX "navigation_footer_columns_items_document_idx";
  DROP INDEX "navigation_footer_columns_items_category_idx";
  DROP INDEX "navigation_footer_columns_items_partner_idx";
  DROP INDEX "navigation_footer_columns_items_page_idx";
  DROP INDEX "navigation_footer_columns_items_tag_idx";
  DROP INDEX "navigation_footer_columns_items_post_idx";
  DROP INDEX "navigation_footer_columns_items_event_idx";
  DROP INDEX "navigation_footer_columns_order_idx";
  DROP INDEX "navigation_footer_columns_parent_id_idx";
  ALTER TABLE "navigation" ADD COLUMN "logo_id" integer;
  ALTER TABLE "homepage_hero" ADD CONSTRAINT "homepage_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_rels" ADD CONSTRAINT "homepage_sections_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_rels" ADD CONSTRAINT "homepage_sections_rels_club_sections_fk" FOREIGN KEY ("club_sections_id") REFERENCES "public"."club_sections"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "homepage_hero_image_idx" ON "homepage_hero" USING btree ("image_id");
  CREATE INDEX "homepage_sections_rels_order_idx" ON "homepage_sections_rels" USING btree ("order");
  CREATE INDEX "homepage_sections_rels_parent_idx" ON "homepage_sections_rels" USING btree ("parent_id");
  CREATE INDEX "homepage_sections_rels_path_idx" ON "homepage_sections_rels" USING btree ("path");
  CREATE INDEX "homepage_sections_rels_club_sections_id_idx" ON "homepage_sections_rels" USING btree ("club_sections_id");
  ALTER TABLE "homepage_hero_items" ADD CONSTRAINT "homepage_hero_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_hero_items" ADD CONSTRAINT "homepage_hero_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_hero_items" ADD CONSTRAINT "homepage_hero_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_hero_items" ADD CONSTRAINT "homepage_hero_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_hero_items" ADD CONSTRAINT "homepage_hero_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_hero_items" ADD CONSTRAINT "homepage_hero_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_hero_items" ADD CONSTRAINT "homepage_hero_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_hero_items" ADD CONSTRAINT "homepage_hero_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_hero_items" ADD CONSTRAINT "homepage_hero_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_social_items" ADD CONSTRAINT "footer_social_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_social_items" ADD CONSTRAINT "footer_social_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_social_items" ADD CONSTRAINT "footer_social_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_social_items" ADD CONSTRAINT "footer_social_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_social_items" ADD CONSTRAINT "footer_social_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_social_items" ADD CONSTRAINT "footer_social_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_social_items" ADD CONSTRAINT "footer_social_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_social_items" ADD CONSTRAINT "footer_social_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_social_items" ADD CONSTRAINT "footer_social_items_custom_icon_id_media_id_fk" FOREIGN KEY ("custom_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_social_items" ADD CONSTRAINT "footer_social_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns_items" ADD CONSTRAINT "footer_columns_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_columns_items" ADD CONSTRAINT "footer_columns_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_columns_items" ADD CONSTRAINT "footer_columns_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_columns_items" ADD CONSTRAINT "footer_columns_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_columns_items" ADD CONSTRAINT "footer_columns_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_columns_items" ADD CONSTRAINT "footer_columns_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_columns_items" ADD CONSTRAINT "footer_columns_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_columns_items" ADD CONSTRAINT "footer_columns_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_columns_items" ADD CONSTRAINT "footer_columns_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns" ADD CONSTRAINT "footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation" ADD CONSTRAINT "navigation_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "homepage_hero_items_order_idx" ON "homepage_hero_items" USING btree ("_order");
  CREATE INDEX "homepage_hero_items_parent_id_idx" ON "homepage_hero_items" USING btree ("_parent_id");
  CREATE INDEX "homepage_hero_items_event_cycle_idx" ON "homepage_hero_items" USING btree ("event_cycle_id");
  CREATE INDEX "homepage_hero_items_document_idx" ON "homepage_hero_items" USING btree ("document_id");
  CREATE INDEX "homepage_hero_items_category_idx" ON "homepage_hero_items" USING btree ("category_id");
  CREATE INDEX "homepage_hero_items_partner_idx" ON "homepage_hero_items" USING btree ("partner_id");
  CREATE INDEX "homepage_hero_items_page_idx" ON "homepage_hero_items" USING btree ("page_id");
  CREATE INDEX "homepage_hero_items_tag_idx" ON "homepage_hero_items" USING btree ("tag_id");
  CREATE INDEX "homepage_hero_items_post_idx" ON "homepage_hero_items" USING btree ("post_id");
  CREATE INDEX "homepage_hero_items_event_idx" ON "homepage_hero_items" USING btree ("event_id");
  CREATE INDEX "footer_social_items_order_idx" ON "footer_social_items" USING btree ("_order");
  CREATE INDEX "footer_social_items_parent_id_idx" ON "footer_social_items" USING btree ("_parent_id");
  CREATE INDEX "footer_social_items_event_cycle_idx" ON "footer_social_items" USING btree ("event_cycle_id");
  CREATE INDEX "footer_social_items_document_idx" ON "footer_social_items" USING btree ("document_id");
  CREATE INDEX "footer_social_items_category_idx" ON "footer_social_items" USING btree ("category_id");
  CREATE INDEX "footer_social_items_partner_idx" ON "footer_social_items" USING btree ("partner_id");
  CREATE INDEX "footer_social_items_page_idx" ON "footer_social_items" USING btree ("page_id");
  CREATE INDEX "footer_social_items_tag_idx" ON "footer_social_items" USING btree ("tag_id");
  CREATE INDEX "footer_social_items_post_idx" ON "footer_social_items" USING btree ("post_id");
  CREATE INDEX "footer_social_items_event_idx" ON "footer_social_items" USING btree ("event_id");
  CREATE INDEX "footer_social_items_custom_icon_idx" ON "footer_social_items" USING btree ("custom_icon_id");
  CREATE INDEX "footer_columns_items_order_idx" ON "footer_columns_items" USING btree ("_order");
  CREATE INDEX "footer_columns_items_parent_id_idx" ON "footer_columns_items" USING btree ("_parent_id");
  CREATE INDEX "footer_columns_items_event_cycle_idx" ON "footer_columns_items" USING btree ("event_cycle_id");
  CREATE INDEX "footer_columns_items_document_idx" ON "footer_columns_items" USING btree ("document_id");
  CREATE INDEX "footer_columns_items_category_idx" ON "footer_columns_items" USING btree ("category_id");
  CREATE INDEX "footer_columns_items_partner_idx" ON "footer_columns_items" USING btree ("partner_id");
  CREATE INDEX "footer_columns_items_page_idx" ON "footer_columns_items" USING btree ("page_id");
  CREATE INDEX "footer_columns_items_tag_idx" ON "footer_columns_items" USING btree ("tag_id");
  CREATE INDEX "footer_columns_items_post_idx" ON "footer_columns_items" USING btree ("post_id");
  CREATE INDEX "footer_columns_items_event_idx" ON "footer_columns_items" USING btree ("event_id");
  CREATE INDEX "footer_columns_order_idx" ON "footer_columns" USING btree ("_order");
  CREATE INDEX "footer_columns_parent_id_idx" ON "footer_columns" USING btree ("_parent_id");
  CREATE INDEX "navigation_logo_idx" ON "navigation" USING btree ("logo_id");
  ALTER TABLE "site_settings" DROP COLUMN "hero_image_id";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_event_window_weeks";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_event_slide_limit";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_post_count";
  ALTER TABLE "site_settings" DROP COLUMN "copyright_text";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_homepage_sections_post_count" RENAME TO "enum_site_settings_homepage_post_count";
  ALTER TYPE "public"."enum_homepage_hero_items_target_type" RENAME TO "enum_navigation_hero_items_target_type";
  ALTER TYPE "public"."enum_homepage_hero_items_custom_scheme" RENAME TO "enum_navigation_hero_items_custom_scheme";
  ALTER TYPE "public"."enum_footer_social_items_target_type" RENAME TO "enum_navigation_social_items_target_type";
  ALTER TYPE "public"."enum_footer_social_items_custom_scheme" RENAME TO "enum_navigation_social_items_custom_scheme";
  ALTER TYPE "public"."enum_footer_social_items_icon_source" RENAME TO "enum_navigation_social_items_icon_source";
  ALTER TYPE "public"."enum_footer_social_items_system_icon" RENAME TO "enum_navigation_social_items_system_icon";
  ALTER TYPE "public"."enum_footer_columns_items_target_type" RENAME TO "enum_navigation_footer_columns_items_target_type";
  ALTER TYPE "public"."enum_footer_columns_items_custom_scheme" RENAME TO "enum_navigation_footer_columns_items_custom_scheme";
  ALTER TABLE "site_settings" ADD COLUMN "hero_image_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_event_window_weeks" numeric DEFAULT 4;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_event_slide_limit" numeric DEFAULT 6;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_post_count" "enum_site_settings_homepage_post_count" DEFAULT '2';
  ALTER TABLE "site_settings" ADD COLUMN "copyright_text" jsonb;

  UPDATE "site_settings" AS settings
  SET "hero_image_id" = (SELECT "image_id" FROM "homepage_hero" ORDER BY "id" LIMIT 1),
      "homepage_event_window_weeks" = (
        SELECT "event_window_weeks" FROM "homepage_sections" ORDER BY "id" LIMIT 1
      ),
      "homepage_event_slide_limit" = (
        SELECT "event_slide_limit" FROM "homepage_sections" ORDER BY "id" LIMIT 1
      ),
      "homepage_post_count" = (
        SELECT "post_count" FROM "homepage_sections" ORDER BY "id" LIMIT 1
      ),
      "copyright_text" = CASE
        WHEN footer."copyright" IS NULL THEN footer."content"
        WHEN footer."content" IS NULL THEN footer."copyright"
        ELSE jsonb_set(
          footer."copyright",
          '{root,children}',
          COALESCE(footer."copyright" #> '{root,children}', '[]'::jsonb)
            || COALESCE(footer."content" #> '{root,children}', '[]'::jsonb)
        )
      END,
      "updated_at" = now()
  FROM (SELECT * FROM "footer" ORDER BY "id" LIMIT 1) AS footer;

  ALTER TABLE "homepage_hero_items" RENAME TO "navigation_hero_items";
  ALTER TABLE "footer_social_items" RENAME TO "navigation_social_items";
  ALTER TABLE "footer_columns_items" RENAME TO "navigation_footer_columns_items";
  ALTER TABLE "footer_columns" RENAME TO "navigation_footer_columns";
  ALTER TABLE "navigation" DROP CONSTRAINT "navigation_logo_id_media_id_fk";
  
  ALTER TABLE "navigation_hero_items" DROP CONSTRAINT "homepage_hero_items_event_cycle_id_event_cycles_id_fk";
  
  ALTER TABLE "navigation_hero_items" DROP CONSTRAINT "homepage_hero_items_document_id_documents_id_fk";
  
  ALTER TABLE "navigation_hero_items" DROP CONSTRAINT "homepage_hero_items_category_id_categories_id_fk";
  
  ALTER TABLE "navigation_hero_items" DROP CONSTRAINT "homepage_hero_items_partner_id_partners_id_fk";
  
  ALTER TABLE "navigation_hero_items" DROP CONSTRAINT "homepage_hero_items_page_id_pages_id_fk";
  
  ALTER TABLE "navigation_hero_items" DROP CONSTRAINT "homepage_hero_items_tag_id_tags_id_fk";
  
  ALTER TABLE "navigation_hero_items" DROP CONSTRAINT "homepage_hero_items_post_id_posts_id_fk";
  
  ALTER TABLE "navigation_hero_items" DROP CONSTRAINT "homepage_hero_items_event_id_events_id_fk";
  
  ALTER TABLE "navigation_hero_items" DROP CONSTRAINT "homepage_hero_items_parent_id_fk";
  
  ALTER TABLE "navigation_social_items" DROP CONSTRAINT "footer_social_items_event_cycle_id_event_cycles_id_fk";
  
  ALTER TABLE "navigation_social_items" DROP CONSTRAINT "footer_social_items_document_id_documents_id_fk";
  
  ALTER TABLE "navigation_social_items" DROP CONSTRAINT "footer_social_items_category_id_categories_id_fk";
  
  ALTER TABLE "navigation_social_items" DROP CONSTRAINT "footer_social_items_partner_id_partners_id_fk";
  
  ALTER TABLE "navigation_social_items" DROP CONSTRAINT "footer_social_items_page_id_pages_id_fk";
  
  ALTER TABLE "navigation_social_items" DROP CONSTRAINT "footer_social_items_tag_id_tags_id_fk";
  
  ALTER TABLE "navigation_social_items" DROP CONSTRAINT "footer_social_items_post_id_posts_id_fk";
  
  ALTER TABLE "navigation_social_items" DROP CONSTRAINT "footer_social_items_event_id_events_id_fk";
  
  ALTER TABLE "navigation_social_items" DROP CONSTRAINT "footer_social_items_custom_icon_id_media_id_fk";
  
  ALTER TABLE "navigation_social_items" DROP CONSTRAINT "footer_social_items_parent_id_fk";
  
  ALTER TABLE "navigation_footer_columns_items" DROP CONSTRAINT "footer_columns_items_event_cycle_id_event_cycles_id_fk";
  
  ALTER TABLE "navigation_footer_columns_items" DROP CONSTRAINT "footer_columns_items_document_id_documents_id_fk";
  
  ALTER TABLE "navigation_footer_columns_items" DROP CONSTRAINT "footer_columns_items_category_id_categories_id_fk";
  
  ALTER TABLE "navigation_footer_columns_items" DROP CONSTRAINT "footer_columns_items_partner_id_partners_id_fk";
  
  ALTER TABLE "navigation_footer_columns_items" DROP CONSTRAINT "footer_columns_items_page_id_pages_id_fk";
  
  ALTER TABLE "navigation_footer_columns_items" DROP CONSTRAINT "footer_columns_items_tag_id_tags_id_fk";
  
  ALTER TABLE "navigation_footer_columns_items" DROP CONSTRAINT "footer_columns_items_post_id_posts_id_fk";
  
  ALTER TABLE "navigation_footer_columns_items" DROP CONSTRAINT "footer_columns_items_event_id_events_id_fk";
  
  ALTER TABLE "navigation_footer_columns_items" DROP CONSTRAINT "footer_columns_items_parent_id_fk";
  
  ALTER TABLE "navigation_footer_columns" DROP CONSTRAINT "footer_columns_parent_id_fk";

  ALTER TABLE "homepage_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage_sections_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "homepage_hero" CASCADE;
  DROP TABLE "homepage_sections_rels" CASCADE;
  DROP TABLE "homepage_sections" CASCADE;
  DROP TABLE "footer" CASCADE;
  
  ALTER TABLE "events_external_links" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "events_external_links" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  ALTER TABLE "_events_v_version_external_links" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "_events_v_version_external_links" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  ALTER TABLE "event_cycles_event_defaults_external_links" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "event_cycles_event_defaults_external_links" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  DROP TYPE "public"."target";
  CREATE TYPE "public"."target" AS ENUM('eventCycle', 'document', 'category', 'partner', 'page', 'tag', 'custom', 'post', 'event');
  ALTER TABLE "events_external_links" ALTER COLUMN "target_type" SET DEFAULT 'custom'::"public"."target";
  ALTER TABLE "events_external_links" ALTER COLUMN "target_type" SET DATA TYPE "public"."target" USING "target_type"::"public"."target";
  ALTER TABLE "_events_v_version_external_links" ALTER COLUMN "target_type" SET DEFAULT 'custom'::"public"."target";
  ALTER TABLE "_events_v_version_external_links" ALTER COLUMN "target_type" SET DATA TYPE "public"."target" USING "target_type"::"public"."target";
  ALTER TABLE "event_cycles_event_defaults_external_links" ALTER COLUMN "target_type" SET DEFAULT 'custom'::"public"."target";
  ALTER TABLE "event_cycles_event_defaults_external_links" ALTER COLUMN "target_type" SET DATA TYPE "public"."target" USING "target_type"::"public"."target";
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" ALTER COLUMN "target_type" SET DEFAULT 'custom'::"public"."target";
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" ALTER COLUMN "target_type" SET DATA TYPE "public"."target" USING "target_type"::"public"."target";
  ALTER TABLE "club_sections_menu_items" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "club_sections_menu_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  DROP TYPE "public"."enum_club_sections_menu_items_target_type";
  CREATE TYPE "public"."enum_club_sections_menu_items_target_type" AS ENUM('eventCycle', 'document', 'category', 'partner', 'page', 'tag', 'custom', 'post', 'event');
  ALTER TABLE "club_sections_menu_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::"public"."enum_club_sections_menu_items_target_type";
  ALTER TABLE "club_sections_menu_items" ALTER COLUMN "target_type" SET DATA TYPE "public"."enum_club_sections_menu_items_target_type" USING "target_type"::"public"."enum_club_sections_menu_items_target_type";
  ALTER TABLE "_club_sections_v_version_menu_items" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "_club_sections_v_version_menu_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  DROP TYPE "public"."enum__club_sections_v_version_menu_items_target_type";
  CREATE TYPE "public"."enum__club_sections_v_version_menu_items_target_type" AS ENUM('eventCycle', 'document', 'category', 'partner', 'page', 'tag', 'custom', 'post', 'event');
  ALTER TABLE "_club_sections_v_version_menu_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::"public"."enum__club_sections_v_version_menu_items_target_type";
  ALTER TABLE "_club_sections_v_version_menu_items" ALTER COLUMN "target_type" SET DATA TYPE "public"."enum__club_sections_v_version_menu_items_target_type" USING "target_type"::"public"."enum__club_sections_v_version_menu_items_target_type";
  ALTER TABLE "navigation_header_items" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "navigation_header_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  DROP TYPE "public"."enum_navigation_header_items_target_type";
  CREATE TYPE "public"."enum_navigation_header_items_target_type" AS ENUM('eventCycle', 'document', 'category', 'partner', 'page', 'tag', 'custom', 'post', 'event');
  ALTER TABLE "navigation_header_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::"public"."enum_navigation_header_items_target_type";
  ALTER TABLE "navigation_header_items" ALTER COLUMN "target_type" SET DATA TYPE "public"."enum_navigation_header_items_target_type" USING "target_type"::"public"."enum_navigation_header_items_target_type";
  ALTER TABLE "navigation_hero_items" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "navigation_hero_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  DROP TYPE "public"."enum_navigation_hero_items_target_type";
  CREATE TYPE "public"."enum_navigation_hero_items_target_type" AS ENUM('eventCycle', 'document', 'category', 'partner', 'page', 'tag', 'custom', 'post', 'event');
  ALTER TABLE "navigation_hero_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::"public"."enum_navigation_hero_items_target_type";
  ALTER TABLE "navigation_hero_items" ALTER COLUMN "target_type" SET DATA TYPE "public"."enum_navigation_hero_items_target_type" USING "target_type"::"public"."enum_navigation_hero_items_target_type";
  ALTER TABLE "navigation_social_items" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "navigation_social_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  DROP TYPE "public"."enum_navigation_social_items_target_type";
  CREATE TYPE "public"."enum_navigation_social_items_target_type" AS ENUM('eventCycle', 'document', 'category', 'partner', 'page', 'tag', 'custom', 'post', 'event');
  ALTER TABLE "navigation_social_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::"public"."enum_navigation_social_items_target_type";
  ALTER TABLE "navigation_social_items" ALTER COLUMN "target_type" SET DATA TYPE "public"."enum_navigation_social_items_target_type" USING "target_type"::"public"."enum_navigation_social_items_target_type";
  ALTER TABLE "navigation_footer_columns_items" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "navigation_footer_columns_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  DROP TYPE "public"."enum_navigation_footer_columns_items_target_type";
  CREATE TYPE "public"."enum_navigation_footer_columns_items_target_type" AS ENUM('eventCycle', 'document', 'category', 'partner', 'page', 'tag', 'custom', 'post', 'event');
  ALTER TABLE "navigation_footer_columns_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::"public"."enum_navigation_footer_columns_items_target_type";
  ALTER TABLE "navigation_footer_columns_items" ALTER COLUMN "target_type" SET DATA TYPE "public"."enum_navigation_footer_columns_items_target_type" USING "target_type"::"public"."enum_navigation_footer_columns_items_target_type";
  DROP INDEX "navigation_logo_idx";
  DROP INDEX "homepage_hero_items_order_idx";
  DROP INDEX "homepage_hero_items_parent_id_idx";
  DROP INDEX "homepage_hero_items_event_cycle_idx";
  DROP INDEX "homepage_hero_items_document_idx";
  DROP INDEX "homepage_hero_items_category_idx";
  DROP INDEX "homepage_hero_items_partner_idx";
  DROP INDEX "homepage_hero_items_page_idx";
  DROP INDEX "homepage_hero_items_tag_idx";
  DROP INDEX "homepage_hero_items_post_idx";
  DROP INDEX "homepage_hero_items_event_idx";
  DROP INDEX "footer_social_items_order_idx";
  DROP INDEX "footer_social_items_parent_id_idx";
  DROP INDEX "footer_social_items_event_cycle_idx";
  DROP INDEX "footer_social_items_document_idx";
  DROP INDEX "footer_social_items_category_idx";
  DROP INDEX "footer_social_items_partner_idx";
  DROP INDEX "footer_social_items_page_idx";
  DROP INDEX "footer_social_items_tag_idx";
  DROP INDEX "footer_social_items_post_idx";
  DROP INDEX "footer_social_items_event_idx";
  DROP INDEX "footer_social_items_custom_icon_idx";
  DROP INDEX "footer_columns_items_order_idx";
  DROP INDEX "footer_columns_items_parent_id_idx";
  DROP INDEX "footer_columns_items_event_cycle_idx";
  DROP INDEX "footer_columns_items_document_idx";
  DROP INDEX "footer_columns_items_category_idx";
  DROP INDEX "footer_columns_items_partner_idx";
  DROP INDEX "footer_columns_items_page_idx";
  DROP INDEX "footer_columns_items_tag_idx";
  DROP INDEX "footer_columns_items_post_idx";
  DROP INDEX "footer_columns_items_event_idx";
  DROP INDEX "footer_columns_order_idx";
  DROP INDEX "footer_columns_parent_id_idx";
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_hero_items" ADD CONSTRAINT "navigation_hero_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_hero_items" ADD CONSTRAINT "navigation_hero_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_hero_items" ADD CONSTRAINT "navigation_hero_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_hero_items" ADD CONSTRAINT "navigation_hero_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_hero_items" ADD CONSTRAINT "navigation_hero_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_hero_items" ADD CONSTRAINT "navigation_hero_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_hero_items" ADD CONSTRAINT "navigation_hero_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_hero_items" ADD CONSTRAINT "navigation_hero_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_hero_items" ADD CONSTRAINT "navigation_hero_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_social_items" ADD CONSTRAINT "navigation_social_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_social_items" ADD CONSTRAINT "navigation_social_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_social_items" ADD CONSTRAINT "navigation_social_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_social_items" ADD CONSTRAINT "navigation_social_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_social_items" ADD CONSTRAINT "navigation_social_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_social_items" ADD CONSTRAINT "navigation_social_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_social_items" ADD CONSTRAINT "navigation_social_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_social_items" ADD CONSTRAINT "navigation_social_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_social_items" ADD CONSTRAINT "navigation_social_items_custom_icon_id_media_id_fk" FOREIGN KEY ("custom_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_social_items" ADD CONSTRAINT "navigation_social_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns_items" ADD CONSTRAINT "navigation_footer_columns_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns_items" ADD CONSTRAINT "navigation_footer_columns_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns_items" ADD CONSTRAINT "navigation_footer_columns_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns_items" ADD CONSTRAINT "navigation_footer_columns_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns_items" ADD CONSTRAINT "navigation_footer_columns_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns_items" ADD CONSTRAINT "navigation_footer_columns_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns_items" ADD CONSTRAINT "navigation_footer_columns_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns_items" ADD CONSTRAINT "navigation_footer_columns_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns_items" ADD CONSTRAINT "navigation_footer_columns_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns" ADD CONSTRAINT "navigation_footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_settings_hero_image_idx" ON "site_settings" USING btree ("hero_image_id");
  CREATE INDEX "navigation_hero_items_order_idx" ON "navigation_hero_items" USING btree ("_order");
  CREATE INDEX "navigation_hero_items_parent_id_idx" ON "navigation_hero_items" USING btree ("_parent_id");
  CREATE INDEX "navigation_hero_items_event_cycle_idx" ON "navigation_hero_items" USING btree ("event_cycle_id");
  CREATE INDEX "navigation_hero_items_document_idx" ON "navigation_hero_items" USING btree ("document_id");
  CREATE INDEX "navigation_hero_items_category_idx" ON "navigation_hero_items" USING btree ("category_id");
  CREATE INDEX "navigation_hero_items_partner_idx" ON "navigation_hero_items" USING btree ("partner_id");
  CREATE INDEX "navigation_hero_items_page_idx" ON "navigation_hero_items" USING btree ("page_id");
  CREATE INDEX "navigation_hero_items_tag_idx" ON "navigation_hero_items" USING btree ("tag_id");
  CREATE INDEX "navigation_hero_items_post_idx" ON "navigation_hero_items" USING btree ("post_id");
  CREATE INDEX "navigation_hero_items_event_idx" ON "navigation_hero_items" USING btree ("event_id");
  CREATE INDEX "navigation_social_items_order_idx" ON "navigation_social_items" USING btree ("_order");
  CREATE INDEX "navigation_social_items_parent_id_idx" ON "navigation_social_items" USING btree ("_parent_id");
  CREATE INDEX "navigation_social_items_event_cycle_idx" ON "navigation_social_items" USING btree ("event_cycle_id");
  CREATE INDEX "navigation_social_items_document_idx" ON "navigation_social_items" USING btree ("document_id");
  CREATE INDEX "navigation_social_items_category_idx" ON "navigation_social_items" USING btree ("category_id");
  CREATE INDEX "navigation_social_items_partner_idx" ON "navigation_social_items" USING btree ("partner_id");
  CREATE INDEX "navigation_social_items_page_idx" ON "navigation_social_items" USING btree ("page_id");
  CREATE INDEX "navigation_social_items_tag_idx" ON "navigation_social_items" USING btree ("tag_id");
  CREATE INDEX "navigation_social_items_post_idx" ON "navigation_social_items" USING btree ("post_id");
  CREATE INDEX "navigation_social_items_event_idx" ON "navigation_social_items" USING btree ("event_id");
  CREATE INDEX "navigation_social_items_custom_icon_idx" ON "navigation_social_items" USING btree ("custom_icon_id");
  CREATE INDEX "navigation_footer_columns_items_order_idx" ON "navigation_footer_columns_items" USING btree ("_order");
  CREATE INDEX "navigation_footer_columns_items_parent_id_idx" ON "navigation_footer_columns_items" USING btree ("_parent_id");
  CREATE INDEX "navigation_footer_columns_items_event_cycle_idx" ON "navigation_footer_columns_items" USING btree ("event_cycle_id");
  CREATE INDEX "navigation_footer_columns_items_document_idx" ON "navigation_footer_columns_items" USING btree ("document_id");
  CREATE INDEX "navigation_footer_columns_items_category_idx" ON "navigation_footer_columns_items" USING btree ("category_id");
  CREATE INDEX "navigation_footer_columns_items_partner_idx" ON "navigation_footer_columns_items" USING btree ("partner_id");
  CREATE INDEX "navigation_footer_columns_items_page_idx" ON "navigation_footer_columns_items" USING btree ("page_id");
  CREATE INDEX "navigation_footer_columns_items_tag_idx" ON "navigation_footer_columns_items" USING btree ("tag_id");
  CREATE INDEX "navigation_footer_columns_items_post_idx" ON "navigation_footer_columns_items" USING btree ("post_id");
  CREATE INDEX "navigation_footer_columns_items_event_idx" ON "navigation_footer_columns_items" USING btree ("event_id");
  CREATE INDEX "navigation_footer_columns_order_idx" ON "navigation_footer_columns" USING btree ("_order");
  CREATE INDEX "navigation_footer_columns_parent_id_idx" ON "navigation_footer_columns" USING btree ("_parent_id");
  ALTER TABLE "navigation" DROP COLUMN "logo_id";`)
}
