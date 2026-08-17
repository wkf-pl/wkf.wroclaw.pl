import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_posts_blocks_listing_sources" AS ENUM('pages', 'posts');
  CREATE TYPE "public"."enum_posts_blocks_listing_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum_posts_blocks_listing_view" AS ENUM('cards', 'compact', 'grid');
  CREATE TYPE "public"."enum_posts_blocks_listing_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TYPE "public"."enum__posts_v_blocks_listing_sources" AS ENUM('pages', 'posts');
  CREATE TYPE "public"."enum__posts_v_blocks_listing_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum__posts_v_blocks_listing_view" AS ENUM('cards', 'compact', 'grid');
  CREATE TYPE "public"."enum__posts_v_blocks_listing_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TABLE "posts_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_listing_sources" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_posts_blocks_listing_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "posts_blocks_listing" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"parent_page_id" integer,
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum_posts_blocks_listing_sort" DEFAULT 'newest',
  	"view" "enum_posts_blocks_listing_view" DEFAULT 'cards',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"parent_filter" "enum_posts_blocks_listing_parent_filter" DEFAULT 'none',
  	"empty_message" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_member_profiles_entries" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"profile_id" integer,
  	"context_label" varchar
  );
  
  CREATE TABLE "posts_blocks_member_profiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_listing_sources" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__posts_v_blocks_listing_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_posts_v_blocks_listing" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"parent_page_id" integer,
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum__posts_v_blocks_listing_sort" DEFAULT 'newest',
  	"view" "enum__posts_v_blocks_listing_view" DEFAULT 'cards',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"parent_filter" "enum__posts_v_blocks_listing_parent_filter" DEFAULT 'none',
  	"empty_message" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_member_profiles_entries" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"profile_id" integer,
  	"context_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_member_profiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "posts_blocks_rich_text" ADD CONSTRAINT "posts_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_listing_sources" ADD CONSTRAINT "posts_blocks_listing_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts_blocks_listing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_listing" ADD CONSTRAINT "posts_blocks_listing_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_listing" ADD CONSTRAINT "posts_blocks_listing_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_listing" ADD CONSTRAINT "posts_blocks_listing_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_listing" ADD CONSTRAINT "posts_blocks_listing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_member_profiles_entries" ADD CONSTRAINT "posts_blocks_member_profiles_entries_profile_id_member_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."member_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_member_profiles_entries" ADD CONSTRAINT "posts_blocks_member_profiles_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_member_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_member_profiles" ADD CONSTRAINT "posts_blocks_member_profiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_rich_text" ADD CONSTRAINT "_posts_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_listing_sources" ADD CONSTRAINT "_posts_v_blocks_listing_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v_blocks_listing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_listing" ADD CONSTRAINT "_posts_v_blocks_listing_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_listing" ADD CONSTRAINT "_posts_v_blocks_listing_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_listing" ADD CONSTRAINT "_posts_v_blocks_listing_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_listing" ADD CONSTRAINT "_posts_v_blocks_listing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_member_profiles_entries" ADD CONSTRAINT "_posts_v_blocks_member_profiles_entries_profile_id_member_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."member_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_member_profiles_entries" ADD CONSTRAINT "_posts_v_blocks_member_profiles_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_member_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_member_profiles" ADD CONSTRAINT "_posts_v_blocks_member_profiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "posts_blocks_rich_text_order_idx" ON "posts_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "posts_blocks_rich_text_parent_id_idx" ON "posts_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_rich_text_path_idx" ON "posts_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "posts_blocks_listing_sources_order_idx" ON "posts_blocks_listing_sources" USING btree ("order");
  CREATE INDEX "posts_blocks_listing_sources_parent_idx" ON "posts_blocks_listing_sources" USING btree ("parent_id");
  CREATE INDEX "posts_blocks_listing_order_idx" ON "posts_blocks_listing" USING btree ("_order");
  CREATE INDEX "posts_blocks_listing_parent_id_idx" ON "posts_blocks_listing" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_listing_path_idx" ON "posts_blocks_listing" USING btree ("_path");
  CREATE INDEX "posts_blocks_listing_parent_page_idx" ON "posts_blocks_listing" USING btree ("parent_page_id");
  CREATE INDEX "posts_blocks_listing_category_idx" ON "posts_blocks_listing" USING btree ("category_id");
  CREATE INDEX "posts_blocks_listing_tag_idx" ON "posts_blocks_listing" USING btree ("tag_id");
  CREATE INDEX "posts_blocks_member_profiles_entries_order_idx" ON "posts_blocks_member_profiles_entries" USING btree ("_order");
  CREATE INDEX "posts_blocks_member_profiles_entries_parent_id_idx" ON "posts_blocks_member_profiles_entries" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_member_profiles_entries_profile_idx" ON "posts_blocks_member_profiles_entries" USING btree ("profile_id");
  CREATE INDEX "posts_blocks_member_profiles_order_idx" ON "posts_blocks_member_profiles" USING btree ("_order");
  CREATE INDEX "posts_blocks_member_profiles_parent_id_idx" ON "posts_blocks_member_profiles" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_member_profiles_path_idx" ON "posts_blocks_member_profiles" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_rich_text_order_idx" ON "_posts_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_rich_text_parent_id_idx" ON "_posts_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_rich_text_path_idx" ON "_posts_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_listing_sources_order_idx" ON "_posts_v_blocks_listing_sources" USING btree ("order");
  CREATE INDEX "_posts_v_blocks_listing_sources_parent_idx" ON "_posts_v_blocks_listing_sources" USING btree ("parent_id");
  CREATE INDEX "_posts_v_blocks_listing_order_idx" ON "_posts_v_blocks_listing" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_listing_parent_id_idx" ON "_posts_v_blocks_listing" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_listing_path_idx" ON "_posts_v_blocks_listing" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_listing_parent_page_idx" ON "_posts_v_blocks_listing" USING btree ("parent_page_id");
  CREATE INDEX "_posts_v_blocks_listing_category_idx" ON "_posts_v_blocks_listing" USING btree ("category_id");
  CREATE INDEX "_posts_v_blocks_listing_tag_idx" ON "_posts_v_blocks_listing" USING btree ("tag_id");
  CREATE INDEX "_posts_v_blocks_member_profiles_entries_order_idx" ON "_posts_v_blocks_member_profiles_entries" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_member_profiles_entries_parent_id_idx" ON "_posts_v_blocks_member_profiles_entries" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_member_profiles_entries_profile_idx" ON "_posts_v_blocks_member_profiles_entries" USING btree ("profile_id");
  CREATE INDEX "_posts_v_blocks_member_profiles_order_idx" ON "_posts_v_blocks_member_profiles" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_member_profiles_parent_id_idx" ON "_posts_v_blocks_member_profiles" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_member_profiles_path_idx" ON "_posts_v_blocks_member_profiles" USING btree ("_path");
  INSERT INTO "posts_blocks_rich_text" ("_order", "_parent_id", "_path", "id", "content")
  SELECT 1, "id", 'layout', concat('migrated-post-rich-text-', "id"), "content"
  FROM "posts"
  WHERE "content" IS NOT NULL;

  INSERT INTO "_posts_v_blocks_rich_text" ("_order", "_parent_id", "_path", "_uuid", "content")
  SELECT 1, "id", 'version.layout', concat('migrated-post-rich-text-', "id"), "version_content"
  FROM "_posts_v"
  WHERE "version_content" IS NOT NULL;

  ALTER TABLE "posts" DROP COLUMN "content";
  ALTER TABLE "_posts_v" DROP COLUMN "version_content";`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" ADD COLUMN "content" jsonb;
  ALTER TABLE "_posts_v" ADD COLUMN "version_content" jsonb;

  UPDATE "posts" AS post
  SET "content" = (
    SELECT "content"
    FROM "posts_blocks_rich_text"
    WHERE "_parent_id" = post."id"
    ORDER BY "_order", "id"
    LIMIT 1
  );

  UPDATE "_posts_v" AS post_version
  SET "version_content" = (
    SELECT "content"
    FROM "_posts_v_blocks_rich_text"
    WHERE "_parent_id" = post_version."id"
    ORDER BY "_order", "id"
    LIMIT 1
  );

  DROP TABLE "posts_blocks_rich_text" CASCADE;
  DROP TABLE "posts_blocks_listing_sources" CASCADE;
  DROP TABLE "posts_blocks_listing" CASCADE;
  DROP TABLE "posts_blocks_member_profiles_entries" CASCADE;
  DROP TABLE "posts_blocks_member_profiles" CASCADE;
  DROP TABLE "_posts_v_blocks_rich_text" CASCADE;
  DROP TABLE "_posts_v_blocks_listing_sources" CASCADE;
  DROP TABLE "_posts_v_blocks_listing" CASCADE;
  DROP TABLE "_posts_v_blocks_member_profiles_entries" CASCADE;
  DROP TABLE "_posts_v_blocks_member_profiles" CASCADE;
  DROP TYPE "public"."enum_posts_blocks_listing_sources";
  DROP TYPE "public"."enum_posts_blocks_listing_sort";
  DROP TYPE "public"."enum_posts_blocks_listing_view";
  DROP TYPE "public"."enum_posts_blocks_listing_parent_filter";
  DROP TYPE "public"."enum__posts_v_blocks_listing_sources";
  DROP TYPE "public"."enum__posts_v_blocks_listing_sort";
  DROP TYPE "public"."enum__posts_v_blocks_listing_view";
  DROP TYPE "public"."enum__posts_v_blocks_listing_parent_filter";`)
}
