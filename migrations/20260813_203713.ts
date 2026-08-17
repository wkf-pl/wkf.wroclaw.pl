import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DO $$
  BEGIN
    IF EXISTS (SELECT 1 FROM "pages") AND NOT EXISTS (
      SELECT 1
      FROM "users_rels"
      INNER JOIN "roles" ON "roles"."id" = "users_rels"."roles_id"
      WHERE "roles"."key" IN ('administrator', 'editor')
    ) THEN
      RAISE EXCEPTION 'Cannot create the system Blog page without an administrator or editor';
    END IF;
  END $$;

  INSERT INTO "payload_kv" ("key", "data")
  SELECT
    'migration:20260813_203713',
    jsonb_build_object('blogPageId', "id", 'blogWasCreated', false)
  FROM "pages"
  WHERE "slug" = 'blog'
  LIMIT 1;

  INSERT INTO "payload_kv" ("key", "data")
  SELECT
    'migration:20260813_203713',
    jsonb_build_object(
      'blogPageId',
      NULL,
      'blogWasCreated',
      EXISTS (
        SELECT 1
        FROM "users_rels"
        INNER JOIN "roles" ON "roles"."id" = "users_rels"."roles_id"
        WHERE "roles"."key" IN ('administrator', 'editor')
      )
    )
  WHERE NOT EXISTS (
    SELECT 1 FROM "payload_kv" WHERE "key" = 'migration:20260813_203713'
  );

  CREATE TYPE "public"."enum_pages_blocks_listing_sources" AS ENUM('pages', 'posts');
  CREATE TYPE "public"."enum_pages_blocks_listing_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TYPE "public"."enum_pages_blocks_listing_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum_pages_blocks_listing_view" AS ENUM('cards', 'compact', 'grid');
  CREATE TYPE "public"."enum__pages_v_blocks_listing_sources" AS ENUM('pages', 'posts');
  CREATE TYPE "public"."enum__pages_v_blocks_listing_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TYPE "public"."enum__pages_v_blocks_listing_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum__pages_v_blocks_listing_view" AS ENUM('cards', 'compact', 'grid');
  CREATE TYPE "public"."enum_club_sections_menu_items_custom_scheme" AS ENUM('https', 'http', 'mailto', 'tel', 'path', 'anchor');
  CREATE TYPE "public"."enum__club_sections_v_version_menu_items_custom_scheme" AS ENUM('https', 'http', 'mailto', 'tel', 'path', 'anchor');
  CREATE TYPE "public"."enum_navigation_header_items_custom_scheme" AS ENUM('https', 'http', 'mailto', 'tel', 'path', 'anchor');
  CREATE TYPE "public"."enum_navigation_hero_items_custom_scheme" AS ENUM('https', 'http', 'mailto', 'tel', 'path', 'anchor');
  CREATE TYPE "public"."enum_navigation_social_items_custom_scheme" AS ENUM('https', 'http', 'mailto', 'tel', 'path', 'anchor');
  CREATE TYPE "public"."enum_navigation_footer_columns_items_custom_scheme" AS ENUM('https', 'http', 'mailto', 'tel', 'path', 'anchor');
  ALTER TABLE "club_sections_menu_items" ALTER COLUMN "target_type" DROP DEFAULT;
  ALTER TABLE "club_sections_menu_items" ALTER COLUMN "target_type" SET DATA TYPE text;
  DROP TYPE "public"."enum_club_sections_menu_items_target_type";
  CREATE TYPE "public"."enum_club_sections_menu_items_target_type" AS ENUM('page', 'category', 'tag', 'custom');
  ALTER TABLE "club_sections_menu_items" ALTER COLUMN "target_type" SET DATA TYPE "public"."enum_club_sections_menu_items_target_type" USING "target_type"::"public"."enum_club_sections_menu_items_target_type";
  ALTER TABLE "club_sections_menu_items" ALTER COLUMN "target_type" SET DEFAULT 'custom';

  ALTER TABLE "_club_sections_v_version_menu_items" ALTER COLUMN "target_type" DROP DEFAULT;
  ALTER TABLE "_club_sections_v_version_menu_items" ALTER COLUMN "target_type" SET DATA TYPE text;
  DROP TYPE "public"."enum__club_sections_v_version_menu_items_target_type";
  CREATE TYPE "public"."enum__club_sections_v_version_menu_items_target_type" AS ENUM('page', 'category', 'tag', 'custom');
  ALTER TABLE "_club_sections_v_version_menu_items" ALTER COLUMN "target_type" SET DATA TYPE "public"."enum__club_sections_v_version_menu_items_target_type" USING "target_type"::"public"."enum__club_sections_v_version_menu_items_target_type";
  ALTER TABLE "_club_sections_v_version_menu_items" ALTER COLUMN "target_type" SET DEFAULT 'custom';

  ALTER TABLE "navigation_header_items" ALTER COLUMN "target_type" DROP DEFAULT;
  ALTER TABLE "navigation_header_items" ALTER COLUMN "target_type" SET DATA TYPE text;
  DROP TYPE "public"."enum_navigation_header_items_target_type";
  CREATE TYPE "public"."enum_navigation_header_items_target_type" AS ENUM('page', 'category', 'tag', 'custom');
  ALTER TABLE "navigation_header_items" ALTER COLUMN "target_type" SET DATA TYPE "public"."enum_navigation_header_items_target_type" USING "target_type"::"public"."enum_navigation_header_items_target_type";
  ALTER TABLE "navigation_header_items" ALTER COLUMN "target_type" SET DEFAULT 'custom';

  ALTER TABLE "navigation_hero_items" ALTER COLUMN "target_type" DROP DEFAULT;
  ALTER TABLE "navigation_hero_items" ALTER COLUMN "target_type" SET DATA TYPE text;
  DROP TYPE "public"."enum_navigation_hero_items_target_type";
  CREATE TYPE "public"."enum_navigation_hero_items_target_type" AS ENUM('page', 'category', 'tag', 'custom');
  ALTER TABLE "navigation_hero_items" ALTER COLUMN "target_type" SET DATA TYPE "public"."enum_navigation_hero_items_target_type" USING "target_type"::"public"."enum_navigation_hero_items_target_type";
  ALTER TABLE "navigation_hero_items" ALTER COLUMN "target_type" SET DEFAULT 'custom';

  ALTER TABLE "navigation_social_items" ALTER COLUMN "target_type" DROP DEFAULT;
  ALTER TABLE "navigation_social_items" ALTER COLUMN "target_type" SET DATA TYPE text;
  DROP TYPE "public"."enum_navigation_social_items_target_type";
  CREATE TYPE "public"."enum_navigation_social_items_target_type" AS ENUM('page', 'category', 'tag', 'custom');
  ALTER TABLE "navigation_social_items" ALTER COLUMN "target_type" SET DATA TYPE "public"."enum_navigation_social_items_target_type" USING "target_type"::"public"."enum_navigation_social_items_target_type";
  ALTER TABLE "navigation_social_items" ALTER COLUMN "target_type" SET DEFAULT 'custom';

  ALTER TABLE "navigation_footer_columns_items" ALTER COLUMN "target_type" DROP DEFAULT;
  ALTER TABLE "navigation_footer_columns_items" ALTER COLUMN "target_type" SET DATA TYPE text;
  DROP TYPE "public"."enum_navigation_footer_columns_items_target_type";
  CREATE TYPE "public"."enum_navigation_footer_columns_items_target_type" AS ENUM('page', 'category', 'tag', 'custom');
  ALTER TABLE "navigation_footer_columns_items" ALTER COLUMN "target_type" SET DATA TYPE "public"."enum_navigation_footer_columns_items_target_type" USING "target_type"::"public"."enum_navigation_footer_columns_items_target_type";
  ALTER TABLE "navigation_footer_columns_items" ALTER COLUMN "target_type" SET DEFAULT 'custom';
  CREATE TABLE "pages_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_listing_sources" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_pages_blocks_listing_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_listing" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"category_id" integer,
  	"tag_id" integer,
  	"parent_filter" "enum_pages_blocks_listing_parent_filter" DEFAULT 'none',
  	"parent_page_id" integer,
  	"sort" "enum_pages_blocks_listing_sort" DEFAULT 'newest',
  	"view" "enum_pages_blocks_listing_view" DEFAULT 'cards',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_listing_sources" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__pages_v_blocks_listing_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_listing" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"category_id" integer,
  	"tag_id" integer,
  	"parent_filter" "enum__pages_v_blocks_listing_parent_filter" DEFAULT 'none',
  	"parent_page_id" integer,
  	"sort" "enum__pages_v_blocks_listing_sort" DEFAULT 'newest',
  	"view" "enum__pages_v_blocks_listing_view" DEFAULT 'cards',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages" ADD COLUMN "listing_excerpt" varchar;
  ALTER TABLE "pages" ADD COLUMN "parent_id" integer;
  ALTER TABLE "pages" ADD COLUMN "system_key" varchar;
  ALTER TABLE "pages_rels" ADD COLUMN "categories_id" integer;
  ALTER TABLE "pages_rels" ADD COLUMN "tags_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_listing_excerpt" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_parent_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_system_key" varchar;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "categories_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "tags_id" integer;
  ALTER TABLE "club_sections_menu_items" ADD COLUMN "category_id" integer;
  ALTER TABLE "club_sections_menu_items" ADD COLUMN "tag_id" integer;
  ALTER TABLE "club_sections_menu_items" ADD COLUMN "custom_scheme" "enum_club_sections_menu_items_custom_scheme" DEFAULT 'https';
  ALTER TABLE "club_sections_menu_items" ADD COLUMN "custom_address" varchar;
  ALTER TABLE "_club_sections_v_version_menu_items" ADD COLUMN "category_id" integer;
  ALTER TABLE "_club_sections_v_version_menu_items" ADD COLUMN "tag_id" integer;
  ALTER TABLE "_club_sections_v_version_menu_items" ADD COLUMN "custom_scheme" "enum__club_sections_v_version_menu_items_custom_scheme" DEFAULT 'https';
  ALTER TABLE "_club_sections_v_version_menu_items" ADD COLUMN "custom_address" varchar;
  ALTER TABLE "navigation_header_items" ADD COLUMN "category_id" integer;
  ALTER TABLE "navigation_header_items" ADD COLUMN "tag_id" integer;
  ALTER TABLE "navigation_header_items" ADD COLUMN "custom_scheme" "enum_navigation_header_items_custom_scheme" DEFAULT 'https';
  ALTER TABLE "navigation_header_items" ADD COLUMN "custom_address" varchar;
  ALTER TABLE "navigation_hero_items" ADD COLUMN "category_id" integer;
  ALTER TABLE "navigation_hero_items" ADD COLUMN "tag_id" integer;
  ALTER TABLE "navigation_hero_items" ADD COLUMN "custom_scheme" "enum_navigation_hero_items_custom_scheme" DEFAULT 'https';
  ALTER TABLE "navigation_hero_items" ADD COLUMN "custom_address" varchar;
  ALTER TABLE "navigation_social_items" ADD COLUMN "category_id" integer;
  ALTER TABLE "navigation_social_items" ADD COLUMN "tag_id" integer;
  ALTER TABLE "navigation_social_items" ADD COLUMN "custom_scheme" "enum_navigation_social_items_custom_scheme" DEFAULT 'https';
  ALTER TABLE "navigation_social_items" ADD COLUMN "custom_address" varchar;
  ALTER TABLE "navigation_footer_columns_items" ADD COLUMN "category_id" integer;
  ALTER TABLE "navigation_footer_columns_items" ADD COLUMN "tag_id" integer;
  ALTER TABLE "navigation_footer_columns_items" ADD COLUMN "custom_scheme" "enum_navigation_footer_columns_items_custom_scheme" DEFAULT 'https';
  ALTER TABLE "navigation_footer_columns_items" ADD COLUMN "custom_address" varchar;
  ALTER TABLE "pages_blocks_rich_text" ADD CONSTRAINT "pages_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_listing_sources" ADD CONSTRAINT "pages_blocks_listing_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_listing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_listing" ADD CONSTRAINT "pages_blocks_listing_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_listing" ADD CONSTRAINT "pages_blocks_listing_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_listing" ADD CONSTRAINT "pages_blocks_listing_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_listing" ADD CONSTRAINT "pages_blocks_listing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_rich_text" ADD CONSTRAINT "_pages_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_listing_sources" ADD CONSTRAINT "_pages_v_blocks_listing_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_listing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_listing" ADD CONSTRAINT "_pages_v_blocks_listing_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_listing" ADD CONSTRAINT "_pages_v_blocks_listing_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_listing" ADD CONSTRAINT "_pages_v_blocks_listing_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_listing" ADD CONSTRAINT "_pages_v_blocks_listing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_rich_text_order_idx" ON "pages_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_rich_text_parent_id_idx" ON "pages_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_rich_text_path_idx" ON "pages_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "pages_blocks_listing_sources_order_idx" ON "pages_blocks_listing_sources" USING btree ("order");
  CREATE INDEX "pages_blocks_listing_sources_parent_idx" ON "pages_blocks_listing_sources" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_listing_order_idx" ON "pages_blocks_listing" USING btree ("_order");
  CREATE INDEX "pages_blocks_listing_parent_id_idx" ON "pages_blocks_listing" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_listing_path_idx" ON "pages_blocks_listing" USING btree ("_path");
  CREATE INDEX "pages_blocks_listing_category_idx" ON "pages_blocks_listing" USING btree ("category_id");
  CREATE INDEX "pages_blocks_listing_tag_idx" ON "pages_blocks_listing" USING btree ("tag_id");
  CREATE INDEX "pages_blocks_listing_parent_page_idx" ON "pages_blocks_listing" USING btree ("parent_page_id");
  CREATE INDEX "_pages_v_blocks_rich_text_order_idx" ON "_pages_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_rich_text_parent_id_idx" ON "_pages_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_rich_text_path_idx" ON "_pages_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_listing_sources_order_idx" ON "_pages_v_blocks_listing_sources" USING btree ("order");
  CREATE INDEX "_pages_v_blocks_listing_sources_parent_idx" ON "_pages_v_blocks_listing_sources" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_listing_order_idx" ON "_pages_v_blocks_listing" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_listing_parent_id_idx" ON "_pages_v_blocks_listing" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_listing_path_idx" ON "_pages_v_blocks_listing" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_listing_category_idx" ON "_pages_v_blocks_listing" USING btree ("category_id");
  CREATE INDEX "_pages_v_blocks_listing_tag_idx" ON "_pages_v_blocks_listing" USING btree ("tag_id");
  CREATE INDEX "_pages_v_blocks_listing_parent_page_idx" ON "_pages_v_blocks_listing" USING btree ("parent_page_id");
  ALTER TABLE "pages" ADD CONSTRAINT "pages_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_parent_id_pages_id_fk" FOREIGN KEY ("version_parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "club_sections_menu_items" ADD CONSTRAINT "club_sections_menu_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "club_sections_menu_items" ADD CONSTRAINT "club_sections_menu_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_club_sections_v_version_menu_items" ADD CONSTRAINT "_club_sections_v_version_menu_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_club_sections_v_version_menu_items" ADD CONSTRAINT "_club_sections_v_version_menu_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_header_items" ADD CONSTRAINT "navigation_header_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_header_items" ADD CONSTRAINT "navigation_header_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_hero_items" ADD CONSTRAINT "navigation_hero_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_hero_items" ADD CONSTRAINT "navigation_hero_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_social_items" ADD CONSTRAINT "navigation_social_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_social_items" ADD CONSTRAINT "navigation_social_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns_items" ADD CONSTRAINT "navigation_footer_columns_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns_items" ADD CONSTRAINT "navigation_footer_columns_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_parent_idx" ON "pages" USING btree ("parent_id");
  CREATE UNIQUE INDEX "pages_system_key_idx" ON "pages" USING btree ("system_key");
  CREATE INDEX "pages_rels_categories_id_idx" ON "pages_rels" USING btree ("categories_id");
  CREATE INDEX "pages_rels_tags_id_idx" ON "pages_rels" USING btree ("tags_id");
  CREATE INDEX "_pages_v_version_version_parent_idx" ON "_pages_v" USING btree ("version_parent_id");
  CREATE INDEX "_pages_v_version_version_system_key_idx" ON "_pages_v" USING btree ("version_system_key");
  CREATE INDEX "_pages_v_rels_categories_id_idx" ON "_pages_v_rels" USING btree ("categories_id");
  CREATE INDEX "_pages_v_rels_tags_id_idx" ON "_pages_v_rels" USING btree ("tags_id");
  CREATE INDEX "club_sections_menu_items_category_idx" ON "club_sections_menu_items" USING btree ("category_id");
  CREATE INDEX "club_sections_menu_items_tag_idx" ON "club_sections_menu_items" USING btree ("tag_id");
  CREATE INDEX "_club_sections_v_version_menu_items_category_idx" ON "_club_sections_v_version_menu_items" USING btree ("category_id");
  CREATE INDEX "_club_sections_v_version_menu_items_tag_idx" ON "_club_sections_v_version_menu_items" USING btree ("tag_id");
  CREATE INDEX "navigation_header_items_category_idx" ON "navigation_header_items" USING btree ("category_id");
  CREATE INDEX "navigation_header_items_tag_idx" ON "navigation_header_items" USING btree ("tag_id");
  CREATE INDEX "navigation_hero_items_category_idx" ON "navigation_hero_items" USING btree ("category_id");
  CREATE INDEX "navigation_hero_items_tag_idx" ON "navigation_hero_items" USING btree ("tag_id");
  CREATE INDEX "navigation_social_items_category_idx" ON "navigation_social_items" USING btree ("category_id");
  CREATE INDEX "navigation_social_items_tag_idx" ON "navigation_social_items" USING btree ("tag_id");
  CREATE INDEX "navigation_footer_columns_items_category_idx" ON "navigation_footer_columns_items" USING btree ("category_id");
  CREATE INDEX "navigation_footer_columns_items_tag_idx" ON "navigation_footer_columns_items" USING btree ("tag_id");

  WITH "preferred_author" AS (
    SELECT "users_rels"."parent_id" AS "user_id"
    FROM "users_rels"
    INNER JOIN "roles" ON "roles"."id" = "users_rels"."roles_id"
    WHERE "roles"."key" IN ('administrator', 'editor')
    ORDER BY CASE "roles"."key" WHEN 'administrator' THEN 0 ELSE 1 END, "users_rels"."parent_id"
    LIMIT 1
  ), "inserted_blog" AS (
    INSERT INTO "pages" (
      "title", "slug", "content", "author_id", "published_at", "system_key",
      "updated_at", "created_at", "_status"
    )
    SELECT
      'Blog',
      'blog',
      '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Artykuły, aktualności i relacje z życia Wrocławskiego Klubu Fantastyki.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"textFormat":0,"textStyle":"","type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}'::jsonb,
      "preferred_author"."user_id",
      now(),
      'blog',
      now(),
      now(),
      'published'
    FROM "preferred_author"
    WHERE (
      SELECT ("data"->>'blogWasCreated')::boolean
      FROM "payload_kv"
      WHERE "key" = 'migration:20260813_203713'
    )
    RETURNING "id"
  )
  UPDATE "payload_kv"
  SET "data" = jsonb_set("data", '{blogPageId}', to_jsonb((SELECT "id" FROM "inserted_blog")))
  WHERE "key" = 'migration:20260813_203713'
    AND ("data"->>'blogWasCreated')::boolean
    AND EXISTS (SELECT 1 FROM "inserted_blog");

  UPDATE "pages"
  SET "slug" = 'blog', "system_key" = 'blog'
  WHERE "id" = (
    SELECT ("data"->>'blogPageId')::integer
    FROM "payload_kv"
    WHERE "key" = 'migration:20260813_203713'
  );

  INSERT INTO "_pages_v" (
    "parent_id", "version_title", "version_slug", "version_content", "version_author_id",
    "version_published_at", "version_system_key", "version_updated_at", "version_created_at",
    "version__status", "latest"
  )
  SELECT
    "id", "title", "slug", "content", "author_id", "published_at", "system_key",
    "updated_at", "created_at", 'published', true
  FROM "pages"
  WHERE "id" = (
      SELECT ("data"->>'blogPageId')::integer
      FROM "payload_kv"
      WHERE "key" = 'migration:20260813_203713'
    )
    AND (
      SELECT ("data"->>'blogWasCreated')::boolean
      FROM "payload_kv"
      WHERE "key" = 'migration:20260813_203713'
    );

  INSERT INTO "pages_blocks_rich_text" (
    "_order", "_parent_id", "_path", "id", "content"
  )
  SELECT 0, "id", 'layout', 'migrated-rich-text-' || "id", "content"
  FROM "pages"
  WHERE "content" IS NOT NULL;

  INSERT INTO "_pages_v_blocks_rich_text" (
    "_order", "_parent_id", "_path", "content", "_uuid"
  )
  SELECT 0, "id", 'layout', "version_content", 'migrated-rich-text-' || "id"
  FROM "_pages_v"
  WHERE "version_content" IS NOT NULL;

  INSERT INTO "pages_blocks_listing" (
    "_order", "_parent_id", "_path", "id", "parent_filter", "sort", "view",
    "page_size", "pagination"
  )
  SELECT
    1,
    ("data"->>'blogPageId')::integer,
    'layout',
    'system-blog-listing',
    'none',
    'newest',
    'cards',
    12,
    true
  FROM "payload_kv"
  WHERE "key" = 'migration:20260813_203713'
    AND "data"->>'blogPageId' IS NOT NULL;

  INSERT INTO "pages_blocks_listing_sources" ("order", "parent_id", "value")
  SELECT 1, 'system-blog-listing', 'posts'
  WHERE EXISTS (
    SELECT 1 FROM "pages_blocks_listing" WHERE "id" = 'system-blog-listing'
  );

  INSERT INTO "_pages_v_blocks_listing" (
    "_order", "_parent_id", "_path", "parent_filter", "sort", "view", "page_size",
    "pagination", "_uuid"
  )
  SELECT 1, "id", 'layout', 'none', 'newest', 'cards', 12, true, 'system-blog-listing'
  FROM "_pages_v"
  WHERE "parent_id" = (
      SELECT ("data"->>'blogPageId')::integer
      FROM "payload_kv"
      WHERE "key" = 'migration:20260813_203713'
    )
    AND "latest" = true;

  INSERT INTO "_pages_v_blocks_listing_sources" ("order", "parent_id", "value")
  SELECT 1, "id", 'posts'
  FROM "_pages_v_blocks_listing"
  WHERE "_uuid" = 'system-blog-listing';

  DO $$
  DECLARE
    "link_table" text;
    "unsafe_link_exists" boolean;
  BEGIN
    FOREACH "link_table" IN ARRAY ARRAY[
      'club_sections_menu_items',
      '_club_sections_v_version_menu_items',
      'navigation_header_items',
      'navigation_hero_items',
      'navigation_social_items',
      'navigation_footer_columns_items'
    ] LOOP
      EXECUTE format(
        'SELECT EXISTS (SELECT 1 FROM %I WHERE target_type = ''custom'' AND url IS NOT NULL AND (url LIKE ''//%%'' OR (url ~* ''^[a-z][a-z0-9+.-]*:'' AND url !~* ''^(https?://|mailto:|tel:)'')))',
        "link_table"
      ) INTO "unsafe_link_exists";

      IF "unsafe_link_exists" THEN
        RAISE EXCEPTION 'Unsupported or unsafe URL found in %', "link_table";
      END IF;

      EXECUTE format(
        'UPDATE %I SET target_type = ''page'', page_id = $1, custom_scheme = NULL, custom_address = NULL WHERE target_type = ''custom'' AND url = ''/blog''',
        "link_table"
      ) USING (
        SELECT ("data"->>'blogPageId')::integer
        FROM "payload_kv"
        WHERE "key" = 'migration:20260813_203713'
      );

      EXECUTE format(
        'UPDATE %I AS items SET target_type = ''category'', category_id = categories.id, custom_scheme = NULL, custom_address = NULL FROM categories WHERE items.target_type = ''custom'' AND items.url = ''/category/'' || categories.slug',
        "link_table"
      );

      EXECUTE format(
        'UPDATE %I AS items SET target_type = ''tag'', tag_id = tags.id, custom_scheme = NULL, custom_address = NULL FROM tags WHERE items.target_type = ''custom'' AND items.url = ''/tag/'' || tags.slug',
        "link_table"
      );

      EXECUTE format(
        'UPDATE %I SET custom_address = CASE WHEN lower(url) LIKE ''https://%%'' THEN substring(url FROM 9) WHEN lower(url) LIKE ''http://%%'' THEN substring(url FROM 8) WHEN lower(url) LIKE ''mailto:%%'' THEN substring(url FROM 8) WHEN lower(url) LIKE ''tel:%%'' THEN substring(url FROM 5) WHEN url = ''#'' THEN ''top'' WHEN url LIKE ''/%%'' OR url LIKE ''#%%'' THEN substring(url FROM 2) ELSE url END WHERE target_type = ''custom'' AND url IS NOT NULL',
        "link_table"
      );

      EXECUTE format('UPDATE %I SET custom_scheme = ''https'' WHERE target_type = ''custom'' AND (lower(url) LIKE ''https://%%'' OR url !~ ''^([A-Za-z][A-Za-z0-9+.-]*:|/|#)'')', "link_table");
      EXECUTE format('UPDATE %I SET custom_scheme = ''http'' WHERE target_type = ''custom'' AND lower(url) LIKE ''http://%%''', "link_table");
      EXECUTE format('UPDATE %I SET custom_scheme = ''mailto'' WHERE target_type = ''custom'' AND lower(url) LIKE ''mailto:%%''', "link_table");
      EXECUTE format('UPDATE %I SET custom_scheme = ''tel'' WHERE target_type = ''custom'' AND lower(url) LIKE ''tel:%%''', "link_table");
      EXECUTE format('UPDATE %I SET custom_scheme = ''path'' WHERE target_type = ''custom'' AND url LIKE ''/%%''', "link_table");
      EXECUTE format('UPDATE %I SET custom_scheme = ''anchor'' WHERE target_type = ''custom'' AND url LIKE ''#%%''', "link_table");
    END LOOP;
  END $$;

  ALTER TABLE "pages" DROP COLUMN "content";
  ALTER TABLE "_pages_v" DROP COLUMN "version_content";
  ALTER TABLE "club_sections_menu_items" DROP COLUMN "url";
  ALTER TABLE "_club_sections_v_version_menu_items" DROP COLUMN "url";
  ALTER TABLE "navigation_header_items" DROP COLUMN "url";
  ALTER TABLE "navigation_hero_items" DROP COLUMN "url";
  ALTER TABLE "navigation_social_items" DROP COLUMN "url";
  ALTER TABLE "navigation_footer_columns_items" DROP COLUMN "url";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" ADD COLUMN "content" jsonb;
  ALTER TABLE "_pages_v" ADD COLUMN "version_content" jsonb;
  ALTER TABLE "club_sections_menu_items" ADD COLUMN "url" varchar;
  ALTER TABLE "_club_sections_v_version_menu_items" ADD COLUMN "url" varchar;
  ALTER TABLE "navigation_header_items" ADD COLUMN "url" varchar;
  ALTER TABLE "navigation_hero_items" ADD COLUMN "url" varchar;
  ALTER TABLE "navigation_social_items" ADD COLUMN "url" varchar;
  ALTER TABLE "navigation_footer_columns_items" ADD COLUMN "url" varchar;

  UPDATE "pages" AS "page"
  SET "content" = (
    SELECT "content" FROM "pages_blocks_rich_text"
    WHERE "_parent_id" = "page"."id"
    ORDER BY "_order" LIMIT 1
  );

  UPDATE "_pages_v" AS "version"
  SET "version_content" = (
    SELECT "content" FROM "_pages_v_blocks_rich_text"
    WHERE "_parent_id" = "version"."id"
    ORDER BY "_order" LIMIT 1
  );

  DO $$
  DECLARE
    "link_table" text;
  BEGIN
    FOREACH "link_table" IN ARRAY ARRAY[
      'club_sections_menu_items',
      '_club_sections_v_version_menu_items',
      'navigation_header_items',
      'navigation_hero_items',
      'navigation_social_items',
      'navigation_footer_columns_items'
    ] LOOP
      EXECUTE format(
        'UPDATE %I AS items SET url = CASE WHEN items.target_type = ''page'' THEN ''/'' || (SELECT slug FROM pages WHERE id = items.page_id) WHEN items.target_type = ''category'' THEN ''/category/'' || (SELECT slug FROM categories WHERE id = items.category_id) WHEN items.target_type = ''tag'' THEN ''/tag/'' || (SELECT slug FROM tags WHERE id = items.tag_id) WHEN items.custom_scheme = ''anchor'' AND items.custom_address = ''top'' THEN ''#'' ELSE CASE items.custom_scheme WHEN ''https'' THEN ''https://'' WHEN ''http'' THEN ''http://'' WHEN ''mailto'' THEN ''mailto:'' WHEN ''tel'' THEN ''tel:'' WHEN ''path'' THEN ''/'' WHEN ''anchor'' THEN ''#'' ELSE '''' END || COALESCE(items.custom_address, '''') END',
        "link_table"
      );

      EXECUTE format(
        'UPDATE %I SET target_type = ''custom'', category_id = NULL, tag_id = NULL WHERE target_type IN (''category'', ''tag'')',
        "link_table"
      );

      IF (
        SELECT ("data"->>'blogWasCreated')::boolean
        FROM "payload_kv"
        WHERE "key" = 'migration:20260813_203713'
      ) THEN
        EXECUTE format(
          'UPDATE %I SET target_type = ''custom'', page_id = NULL WHERE target_type = ''page'' AND page_id = $1',
          "link_table"
        ) USING (
          SELECT ("data"->>'blogPageId')::integer
          FROM "payload_kv"
          WHERE "key" = 'migration:20260813_203713'
        );
      END IF;
    END LOOP;
  END $$;

  DELETE FROM "_pages_v"
  WHERE "parent_id" = (
      SELECT ("data"->>'blogPageId')::integer
      FROM "payload_kv"
      WHERE "key" = 'migration:20260813_203713'
    )
    AND (
      SELECT ("data"->>'blogWasCreated')::boolean
      FROM "payload_kv"
      WHERE "key" = 'migration:20260813_203713'
    );

  DELETE FROM "pages"
  WHERE "id" = (
      SELECT ("data"->>'blogPageId')::integer
      FROM "payload_kv"
      WHERE "key" = 'migration:20260813_203713'
    )
    AND (
      SELECT ("data"->>'blogWasCreated')::boolean
      FROM "payload_kv"
      WHERE "key" = 'migration:20260813_203713'
    );

  DELETE FROM "payload_kv" WHERE "key" = 'migration:20260813_203713';

  ALTER TABLE "pages_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_listing_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_listing" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_listing_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_listing" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_rich_text" CASCADE;
  DROP TABLE "pages_blocks_listing_sources" CASCADE;
  DROP TABLE "pages_blocks_listing" CASCADE;
  DROP TABLE "_pages_v_blocks_rich_text" CASCADE;
  DROP TABLE "_pages_v_blocks_listing_sources" CASCADE;
  DROP TABLE "_pages_v_blocks_listing" CASCADE;
  ALTER TABLE "pages" DROP CONSTRAINT "pages_parent_id_pages_id_fk";
  
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_categories_fk";
  
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_tags_fk";
  
  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_parent_id_pages_id_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_categories_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_tags_fk";
  
  ALTER TABLE "club_sections_menu_items" DROP CONSTRAINT "club_sections_menu_items_category_id_categories_id_fk";
  
  ALTER TABLE "club_sections_menu_items" DROP CONSTRAINT "club_sections_menu_items_tag_id_tags_id_fk";
  
  ALTER TABLE "_club_sections_v_version_menu_items" DROP CONSTRAINT "_club_sections_v_version_menu_items_category_id_categories_id_fk";
  
  ALTER TABLE "_club_sections_v_version_menu_items" DROP CONSTRAINT "_club_sections_v_version_menu_items_tag_id_tags_id_fk";
  
  ALTER TABLE "navigation_header_items" DROP CONSTRAINT "navigation_header_items_category_id_categories_id_fk";
  
  ALTER TABLE "navigation_header_items" DROP CONSTRAINT "navigation_header_items_tag_id_tags_id_fk";
  
  ALTER TABLE "navigation_hero_items" DROP CONSTRAINT "navigation_hero_items_category_id_categories_id_fk";
  
  ALTER TABLE "navigation_hero_items" DROP CONSTRAINT "navigation_hero_items_tag_id_tags_id_fk";
  
  ALTER TABLE "navigation_social_items" DROP CONSTRAINT "navigation_social_items_category_id_categories_id_fk";
  
  ALTER TABLE "navigation_social_items" DROP CONSTRAINT "navigation_social_items_tag_id_tags_id_fk";
  
  ALTER TABLE "navigation_footer_columns_items" DROP CONSTRAINT "navigation_footer_columns_items_category_id_categories_id_fk";
  
  ALTER TABLE "navigation_footer_columns_items" DROP CONSTRAINT "navigation_footer_columns_items_tag_id_tags_id_fk";
  
  ALTER TABLE "club_sections_menu_items" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "club_sections_menu_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  DROP TYPE "public"."enum_club_sections_menu_items_target_type";
  CREATE TYPE "public"."enum_club_sections_menu_items_target_type" AS ENUM('page', 'custom');
  ALTER TABLE "club_sections_menu_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::"public"."enum_club_sections_menu_items_target_type";
  ALTER TABLE "club_sections_menu_items" ALTER COLUMN "target_type" SET DATA TYPE "public"."enum_club_sections_menu_items_target_type" USING "target_type"::"public"."enum_club_sections_menu_items_target_type";
  ALTER TABLE "_club_sections_v_version_menu_items" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "_club_sections_v_version_menu_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  DROP TYPE "public"."enum__club_sections_v_version_menu_items_target_type";
  CREATE TYPE "public"."enum__club_sections_v_version_menu_items_target_type" AS ENUM('page', 'custom');
  ALTER TABLE "_club_sections_v_version_menu_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::"public"."enum__club_sections_v_version_menu_items_target_type";
  ALTER TABLE "_club_sections_v_version_menu_items" ALTER COLUMN "target_type" SET DATA TYPE "public"."enum__club_sections_v_version_menu_items_target_type" USING "target_type"::"public"."enum__club_sections_v_version_menu_items_target_type";
  ALTER TABLE "navigation_header_items" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "navigation_header_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  DROP TYPE "public"."enum_navigation_header_items_target_type";
  CREATE TYPE "public"."enum_navigation_header_items_target_type" AS ENUM('page', 'custom');
  ALTER TABLE "navigation_header_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::"public"."enum_navigation_header_items_target_type";
  ALTER TABLE "navigation_header_items" ALTER COLUMN "target_type" SET DATA TYPE "public"."enum_navigation_header_items_target_type" USING "target_type"::"public"."enum_navigation_header_items_target_type";
  ALTER TABLE "navigation_hero_items" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "navigation_hero_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  DROP TYPE "public"."enum_navigation_hero_items_target_type";
  CREATE TYPE "public"."enum_navigation_hero_items_target_type" AS ENUM('page', 'custom');
  ALTER TABLE "navigation_hero_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::"public"."enum_navigation_hero_items_target_type";
  ALTER TABLE "navigation_hero_items" ALTER COLUMN "target_type" SET DATA TYPE "public"."enum_navigation_hero_items_target_type" USING "target_type"::"public"."enum_navigation_hero_items_target_type";
  ALTER TABLE "navigation_social_items" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "navigation_social_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  DROP TYPE "public"."enum_navigation_social_items_target_type";
  CREATE TYPE "public"."enum_navigation_social_items_target_type" AS ENUM('page', 'custom');
  ALTER TABLE "navigation_social_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::"public"."enum_navigation_social_items_target_type";
  ALTER TABLE "navigation_social_items" ALTER COLUMN "target_type" SET DATA TYPE "public"."enum_navigation_social_items_target_type" USING "target_type"::"public"."enum_navigation_social_items_target_type";
  ALTER TABLE "navigation_footer_columns_items" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "navigation_footer_columns_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  DROP TYPE "public"."enum_navigation_footer_columns_items_target_type";
  CREATE TYPE "public"."enum_navigation_footer_columns_items_target_type" AS ENUM('page', 'custom');
  ALTER TABLE "navigation_footer_columns_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::"public"."enum_navigation_footer_columns_items_target_type";
  ALTER TABLE "navigation_footer_columns_items" ALTER COLUMN "target_type" SET DATA TYPE "public"."enum_navigation_footer_columns_items_target_type" USING "target_type"::"public"."enum_navigation_footer_columns_items_target_type";
  DROP INDEX "pages_parent_idx";
  DROP INDEX "pages_system_key_idx";
  DROP INDEX "pages_rels_categories_id_idx";
  DROP INDEX "pages_rels_tags_id_idx";
  DROP INDEX "_pages_v_version_version_parent_idx";
  DROP INDEX "_pages_v_version_version_system_key_idx";
  DROP INDEX "_pages_v_rels_categories_id_idx";
  DROP INDEX "_pages_v_rels_tags_id_idx";
  DROP INDEX "club_sections_menu_items_category_idx";
  DROP INDEX "club_sections_menu_items_tag_idx";
  DROP INDEX "_club_sections_v_version_menu_items_category_idx";
  DROP INDEX "_club_sections_v_version_menu_items_tag_idx";
  DROP INDEX "navigation_header_items_category_idx";
  DROP INDEX "navigation_header_items_tag_idx";
  DROP INDEX "navigation_hero_items_category_idx";
  DROP INDEX "navigation_hero_items_tag_idx";
  DROP INDEX "navigation_social_items_category_idx";
  DROP INDEX "navigation_social_items_tag_idx";
  DROP INDEX "navigation_footer_columns_items_category_idx";
  DROP INDEX "navigation_footer_columns_items_tag_idx";
  ALTER TABLE "pages" DROP COLUMN "listing_excerpt";
  ALTER TABLE "pages" DROP COLUMN "parent_id";
  ALTER TABLE "pages" DROP COLUMN "system_key";
  ALTER TABLE "pages_rels" DROP COLUMN "categories_id";
  ALTER TABLE "pages_rels" DROP COLUMN "tags_id";
  ALTER TABLE "_pages_v" DROP COLUMN "version_listing_excerpt";
  ALTER TABLE "_pages_v" DROP COLUMN "version_parent_id";
  ALTER TABLE "_pages_v" DROP COLUMN "version_system_key";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "categories_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "tags_id";
  ALTER TABLE "club_sections_menu_items" DROP COLUMN "category_id";
  ALTER TABLE "club_sections_menu_items" DROP COLUMN "tag_id";
  ALTER TABLE "club_sections_menu_items" DROP COLUMN "custom_scheme";
  ALTER TABLE "club_sections_menu_items" DROP COLUMN "custom_address";
  ALTER TABLE "_club_sections_v_version_menu_items" DROP COLUMN "category_id";
  ALTER TABLE "_club_sections_v_version_menu_items" DROP COLUMN "tag_id";
  ALTER TABLE "_club_sections_v_version_menu_items" DROP COLUMN "custom_scheme";
  ALTER TABLE "_club_sections_v_version_menu_items" DROP COLUMN "custom_address";
  ALTER TABLE "navigation_header_items" DROP COLUMN "category_id";
  ALTER TABLE "navigation_header_items" DROP COLUMN "tag_id";
  ALTER TABLE "navigation_header_items" DROP COLUMN "custom_scheme";
  ALTER TABLE "navigation_header_items" DROP COLUMN "custom_address";
  ALTER TABLE "navigation_hero_items" DROP COLUMN "category_id";
  ALTER TABLE "navigation_hero_items" DROP COLUMN "tag_id";
  ALTER TABLE "navigation_hero_items" DROP COLUMN "custom_scheme";
  ALTER TABLE "navigation_hero_items" DROP COLUMN "custom_address";
  ALTER TABLE "navigation_social_items" DROP COLUMN "category_id";
  ALTER TABLE "navigation_social_items" DROP COLUMN "tag_id";
  ALTER TABLE "navigation_social_items" DROP COLUMN "custom_scheme";
  ALTER TABLE "navigation_social_items" DROP COLUMN "custom_address";
  ALTER TABLE "navigation_footer_columns_items" DROP COLUMN "category_id";
  ALTER TABLE "navigation_footer_columns_items" DROP COLUMN "tag_id";
  ALTER TABLE "navigation_footer_columns_items" DROP COLUMN "custom_scheme";
  ALTER TABLE "navigation_footer_columns_items" DROP COLUMN "custom_address";
  DROP TYPE "public"."enum_pages_blocks_listing_sources";
  DROP TYPE "public"."enum_pages_blocks_listing_parent_filter";
  DROP TYPE "public"."enum_pages_blocks_listing_sort";
  DROP TYPE "public"."enum_pages_blocks_listing_view";
  DROP TYPE "public"."enum__pages_v_blocks_listing_sources";
  DROP TYPE "public"."enum__pages_v_blocks_listing_parent_filter";
  DROP TYPE "public"."enum__pages_v_blocks_listing_sort";
  DROP TYPE "public"."enum__pages_v_blocks_listing_view";
  DROP TYPE "public"."enum_club_sections_menu_items_custom_scheme";
  DROP TYPE "public"."enum__club_sections_v_version_menu_items_custom_scheme";
  DROP TYPE "public"."enum_navigation_header_items_custom_scheme";
  DROP TYPE "public"."enum_navigation_hero_items_custom_scheme";
  DROP TYPE "public"."enum_navigation_social_items_custom_scheme";
  DROP TYPE "public"."enum_navigation_footer_columns_items_custom_scheme";`)
}
