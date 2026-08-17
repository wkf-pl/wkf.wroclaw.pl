import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_media_gallery_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum_pages_blocks_media_gallery_sort" AS ENUM('newest', 'oldest', 'nameAscending', 'nameDescending');
  CREATE TYPE "public"."enum_pages_blocks_media_gallery_view" AS ENUM('cards', 'list', 'grid');
  CREATE TYPE "public"."enum_pages_blocks_attachments_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum_pages_blocks_attachments_sort" AS ENUM('newest', 'oldest', 'nameAscending', 'nameDescending');
  CREATE TYPE "public"."enum_pages_blocks_attachments_view" AS ENUM('cards', 'list', 'grid');
  CREATE TYPE "public"."enum__pages_v_blocks_media_gallery_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum__pages_v_blocks_media_gallery_sort" AS ENUM('newest', 'oldest', 'nameAscending', 'nameDescending');
  CREATE TYPE "public"."enum__pages_v_blocks_media_gallery_view" AS ENUM('cards', 'list', 'grid');
  CREATE TYPE "public"."enum__pages_v_blocks_attachments_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum__pages_v_blocks_attachments_sort" AS ENUM('newest', 'oldest', 'nameAscending', 'nameDescending');
  CREATE TYPE "public"."enum__pages_v_blocks_attachments_view" AS ENUM('cards', 'list', 'grid');
  CREATE TYPE "public"."enum_posts_blocks_media_gallery_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum_posts_blocks_media_gallery_sort" AS ENUM('newest', 'oldest', 'nameAscending', 'nameDescending');
  CREATE TYPE "public"."enum_posts_blocks_media_gallery_view" AS ENUM('cards', 'list', 'grid');
  CREATE TYPE "public"."enum_posts_blocks_attachments_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum_posts_blocks_attachments_sort" AS ENUM('newest', 'oldest', 'nameAscending', 'nameDescending');
  CREATE TYPE "public"."enum_posts_blocks_attachments_view" AS ENUM('cards', 'list', 'grid');
  CREATE TYPE "public"."enum__posts_v_blocks_media_gallery_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum__posts_v_blocks_media_gallery_sort" AS ENUM('newest', 'oldest', 'nameAscending', 'nameDescending');
  CREATE TYPE "public"."enum__posts_v_blocks_media_gallery_view" AS ENUM('cards', 'list', 'grid');
  CREATE TYPE "public"."enum__posts_v_blocks_attachments_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum__posts_v_blocks_attachments_sort" AS ENUM('newest', 'oldest', 'nameAscending', 'nameDescending');
  CREATE TYPE "public"."enum__posts_v_blocks_attachments_view" AS ENUM('cards', 'list', 'grid');
  CREATE TABLE "pages_blocks_media_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "pages_blocks_media_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"selection_mode" "enum_pages_blocks_media_gallery_selection_mode" DEFAULT 'filters',
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum_pages_blocks_media_gallery_sort" DEFAULT 'newest',
  	"view" "enum_pages_blocks_media_gallery_view" DEFAULT 'grid',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_attachments_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "pages_blocks_attachments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"selection_mode" "enum_pages_blocks_attachments_selection_mode" DEFAULT 'filters',
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum_pages_blocks_attachments_sort" DEFAULT 'newest',
  	"view" "enum_pages_blocks_attachments_view" DEFAULT 'list',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_media_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_media_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"selection_mode" "enum__pages_v_blocks_media_gallery_selection_mode" DEFAULT 'filters',
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum__pages_v_blocks_media_gallery_sort" DEFAULT 'newest',
  	"view" "enum__pages_v_blocks_media_gallery_view" DEFAULT 'grid',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_attachments_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_attachments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"selection_mode" "enum__pages_v_blocks_attachments_selection_mode" DEFAULT 'filters',
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum__pages_v_blocks_attachments_sort" DEFAULT 'newest',
  	"view" "enum__pages_v_blocks_attachments_view" DEFAULT 'list',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_media_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "posts_blocks_media_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"selection_mode" "enum_posts_blocks_media_gallery_selection_mode" DEFAULT 'filters',
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum_posts_blocks_media_gallery_sort" DEFAULT 'newest',
  	"view" "enum_posts_blocks_media_gallery_view" DEFAULT 'grid',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_attachments_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "posts_blocks_attachments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"selection_mode" "enum_posts_blocks_attachments_selection_mode" DEFAULT 'filters',
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum_posts_blocks_attachments_sort" DEFAULT 'newest',
  	"view" "enum_posts_blocks_attachments_view" DEFAULT 'list',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_media_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_media_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"selection_mode" "enum__posts_v_blocks_media_gallery_selection_mode" DEFAULT 'filters',
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum__posts_v_blocks_media_gallery_sort" DEFAULT 'newest',
  	"view" "enum__posts_v_blocks_media_gallery_view" DEFAULT 'grid',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_attachments_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_attachments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"selection_mode" "enum__posts_v_blocks_attachments_selection_mode" DEFAULT 'filters',
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum__posts_v_blocks_attachments_sort" DEFAULT 'newest',
  	"view" "enum__posts_v_blocks_attachments_view" DEFAULT 'list',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "media_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer,
  	"tags_id" integer
  );
  
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_media_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_media_fk";
  
  ALTER TABLE "posts_rels" DROP CONSTRAINT "posts_rels_media_fk";
  
  ALTER TABLE "_posts_v_rels" DROP CONSTRAINT "_posts_v_rels_media_fk";
  
  DROP INDEX "pages_rels_media_id_idx";
  DROP INDEX "_pages_v_rels_media_id_idx";
  DROP INDEX "posts_rels_media_id_idx";
  DROP INDEX "_posts_v_rels_media_id_idx";
  ALTER TABLE "media" ADD COLUMN "description" varchar;
  ALTER TABLE "pages_blocks_media_gallery_items" ADD CONSTRAINT "pages_blocks_media_gallery_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_media_gallery_items" ADD CONSTRAINT "pages_blocks_media_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_media_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_media_gallery" ADD CONSTRAINT "pages_blocks_media_gallery_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_media_gallery" ADD CONSTRAINT "pages_blocks_media_gallery_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_media_gallery" ADD CONSTRAINT "pages_blocks_media_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_attachments_items" ADD CONSTRAINT "pages_blocks_attachments_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_attachments_items" ADD CONSTRAINT "pages_blocks_attachments_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_attachments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_attachments" ADD CONSTRAINT "pages_blocks_attachments_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_attachments" ADD CONSTRAINT "pages_blocks_attachments_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_attachments" ADD CONSTRAINT "pages_blocks_attachments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_media_gallery_items" ADD CONSTRAINT "_pages_v_blocks_media_gallery_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_media_gallery_items" ADD CONSTRAINT "_pages_v_blocks_media_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_media_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_media_gallery" ADD CONSTRAINT "_pages_v_blocks_media_gallery_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_media_gallery" ADD CONSTRAINT "_pages_v_blocks_media_gallery_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_media_gallery" ADD CONSTRAINT "_pages_v_blocks_media_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_attachments_items" ADD CONSTRAINT "_pages_v_blocks_attachments_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_attachments_items" ADD CONSTRAINT "_pages_v_blocks_attachments_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_attachments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_attachments" ADD CONSTRAINT "_pages_v_blocks_attachments_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_attachments" ADD CONSTRAINT "_pages_v_blocks_attachments_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_attachments" ADD CONSTRAINT "_pages_v_blocks_attachments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_media_gallery_items" ADD CONSTRAINT "posts_blocks_media_gallery_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_media_gallery_items" ADD CONSTRAINT "posts_blocks_media_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_media_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_media_gallery" ADD CONSTRAINT "posts_blocks_media_gallery_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_media_gallery" ADD CONSTRAINT "posts_blocks_media_gallery_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_media_gallery" ADD CONSTRAINT "posts_blocks_media_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_attachments_items" ADD CONSTRAINT "posts_blocks_attachments_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_attachments_items" ADD CONSTRAINT "posts_blocks_attachments_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_attachments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_attachments" ADD CONSTRAINT "posts_blocks_attachments_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_attachments" ADD CONSTRAINT "posts_blocks_attachments_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_attachments" ADD CONSTRAINT "posts_blocks_attachments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_media_gallery_items" ADD CONSTRAINT "_posts_v_blocks_media_gallery_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_media_gallery_items" ADD CONSTRAINT "_posts_v_blocks_media_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_media_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_media_gallery" ADD CONSTRAINT "_posts_v_blocks_media_gallery_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_media_gallery" ADD CONSTRAINT "_posts_v_blocks_media_gallery_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_media_gallery" ADD CONSTRAINT "_posts_v_blocks_media_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_attachments_items" ADD CONSTRAINT "_posts_v_blocks_attachments_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_attachments_items" ADD CONSTRAINT "_posts_v_blocks_attachments_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_attachments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_attachments" ADD CONSTRAINT "_posts_v_blocks_attachments_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_attachments" ADD CONSTRAINT "_posts_v_blocks_attachments_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_attachments" ADD CONSTRAINT "_posts_v_blocks_attachments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_media_gallery_items_order_idx" ON "pages_blocks_media_gallery_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_media_gallery_items_parent_id_idx" ON "pages_blocks_media_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_media_gallery_items_media_idx" ON "pages_blocks_media_gallery_items" USING btree ("media_id");
  CREATE INDEX "pages_blocks_media_gallery_order_idx" ON "pages_blocks_media_gallery" USING btree ("_order");
  CREATE INDEX "pages_blocks_media_gallery_parent_id_idx" ON "pages_blocks_media_gallery" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_media_gallery_path_idx" ON "pages_blocks_media_gallery" USING btree ("_path");
  CREATE INDEX "pages_blocks_media_gallery_category_idx" ON "pages_blocks_media_gallery" USING btree ("category_id");
  CREATE INDEX "pages_blocks_media_gallery_tag_idx" ON "pages_blocks_media_gallery" USING btree ("tag_id");
  CREATE INDEX "pages_blocks_attachments_items_order_idx" ON "pages_blocks_attachments_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_attachments_items_parent_id_idx" ON "pages_blocks_attachments_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_attachments_items_media_idx" ON "pages_blocks_attachments_items" USING btree ("media_id");
  CREATE INDEX "pages_blocks_attachments_order_idx" ON "pages_blocks_attachments" USING btree ("_order");
  CREATE INDEX "pages_blocks_attachments_parent_id_idx" ON "pages_blocks_attachments" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_attachments_path_idx" ON "pages_blocks_attachments" USING btree ("_path");
  CREATE INDEX "pages_blocks_attachments_category_idx" ON "pages_blocks_attachments" USING btree ("category_id");
  CREATE INDEX "pages_blocks_attachments_tag_idx" ON "pages_blocks_attachments" USING btree ("tag_id");
  CREATE INDEX "_pages_v_blocks_media_gallery_items_order_idx" ON "_pages_v_blocks_media_gallery_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_media_gallery_items_parent_id_idx" ON "_pages_v_blocks_media_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_media_gallery_items_media_idx" ON "_pages_v_blocks_media_gallery_items" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_media_gallery_order_idx" ON "_pages_v_blocks_media_gallery" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_media_gallery_parent_id_idx" ON "_pages_v_blocks_media_gallery" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_media_gallery_path_idx" ON "_pages_v_blocks_media_gallery" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_media_gallery_category_idx" ON "_pages_v_blocks_media_gallery" USING btree ("category_id");
  CREATE INDEX "_pages_v_blocks_media_gallery_tag_idx" ON "_pages_v_blocks_media_gallery" USING btree ("tag_id");
  CREATE INDEX "_pages_v_blocks_attachments_items_order_idx" ON "_pages_v_blocks_attachments_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_attachments_items_parent_id_idx" ON "_pages_v_blocks_attachments_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_attachments_items_media_idx" ON "_pages_v_blocks_attachments_items" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_attachments_order_idx" ON "_pages_v_blocks_attachments" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_attachments_parent_id_idx" ON "_pages_v_blocks_attachments" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_attachments_path_idx" ON "_pages_v_blocks_attachments" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_attachments_category_idx" ON "_pages_v_blocks_attachments" USING btree ("category_id");
  CREATE INDEX "_pages_v_blocks_attachments_tag_idx" ON "_pages_v_blocks_attachments" USING btree ("tag_id");
  CREATE INDEX "posts_blocks_media_gallery_items_order_idx" ON "posts_blocks_media_gallery_items" USING btree ("_order");
  CREATE INDEX "posts_blocks_media_gallery_items_parent_id_idx" ON "posts_blocks_media_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_media_gallery_items_media_idx" ON "posts_blocks_media_gallery_items" USING btree ("media_id");
  CREATE INDEX "posts_blocks_media_gallery_order_idx" ON "posts_blocks_media_gallery" USING btree ("_order");
  CREATE INDEX "posts_blocks_media_gallery_parent_id_idx" ON "posts_blocks_media_gallery" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_media_gallery_path_idx" ON "posts_blocks_media_gallery" USING btree ("_path");
  CREATE INDEX "posts_blocks_media_gallery_category_idx" ON "posts_blocks_media_gallery" USING btree ("category_id");
  CREATE INDEX "posts_blocks_media_gallery_tag_idx" ON "posts_blocks_media_gallery" USING btree ("tag_id");
  CREATE INDEX "posts_blocks_attachments_items_order_idx" ON "posts_blocks_attachments_items" USING btree ("_order");
  CREATE INDEX "posts_blocks_attachments_items_parent_id_idx" ON "posts_blocks_attachments_items" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_attachments_items_media_idx" ON "posts_blocks_attachments_items" USING btree ("media_id");
  CREATE INDEX "posts_blocks_attachments_order_idx" ON "posts_blocks_attachments" USING btree ("_order");
  CREATE INDEX "posts_blocks_attachments_parent_id_idx" ON "posts_blocks_attachments" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_attachments_path_idx" ON "posts_blocks_attachments" USING btree ("_path");
  CREATE INDEX "posts_blocks_attachments_category_idx" ON "posts_blocks_attachments" USING btree ("category_id");
  CREATE INDEX "posts_blocks_attachments_tag_idx" ON "posts_blocks_attachments" USING btree ("tag_id");
  CREATE INDEX "_posts_v_blocks_media_gallery_items_order_idx" ON "_posts_v_blocks_media_gallery_items" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_media_gallery_items_parent_id_idx" ON "_posts_v_blocks_media_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_media_gallery_items_media_idx" ON "_posts_v_blocks_media_gallery_items" USING btree ("media_id");
  CREATE INDEX "_posts_v_blocks_media_gallery_order_idx" ON "_posts_v_blocks_media_gallery" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_media_gallery_parent_id_idx" ON "_posts_v_blocks_media_gallery" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_media_gallery_path_idx" ON "_posts_v_blocks_media_gallery" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_media_gallery_category_idx" ON "_posts_v_blocks_media_gallery" USING btree ("category_id");
  CREATE INDEX "_posts_v_blocks_media_gallery_tag_idx" ON "_posts_v_blocks_media_gallery" USING btree ("tag_id");
  CREATE INDEX "_posts_v_blocks_attachments_items_order_idx" ON "_posts_v_blocks_attachments_items" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_attachments_items_parent_id_idx" ON "_posts_v_blocks_attachments_items" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_attachments_items_media_idx" ON "_posts_v_blocks_attachments_items" USING btree ("media_id");
  CREATE INDEX "_posts_v_blocks_attachments_order_idx" ON "_posts_v_blocks_attachments" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_attachments_parent_id_idx" ON "_posts_v_blocks_attachments" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_attachments_path_idx" ON "_posts_v_blocks_attachments" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_attachments_category_idx" ON "_posts_v_blocks_attachments" USING btree ("category_id");
  CREATE INDEX "_posts_v_blocks_attachments_tag_idx" ON "_posts_v_blocks_attachments" USING btree ("tag_id");
  CREATE INDEX "media_rels_order_idx" ON "media_rels" USING btree ("order");
  CREATE INDEX "media_rels_parent_idx" ON "media_rels" USING btree ("parent_id");
  CREATE INDEX "media_rels_path_idx" ON "media_rels" USING btree ("path");
  CREATE INDEX "media_rels_categories_id_idx" ON "media_rels" USING btree ("categories_id");
  CREATE INDEX "media_rels_tags_id_idx" ON "media_rels" USING btree ("tags_id");
  ALTER TABLE "pages_rels" DROP COLUMN "media_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "media_id";
  ALTER TABLE "posts_rels" DROP COLUMN "media_id";
  ALTER TABLE "_posts_v_rels" DROP COLUMN "media_id";`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_media_gallery_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_media_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_attachments_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_attachments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_media_gallery_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_media_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_attachments_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_attachments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_media_gallery_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_media_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_attachments_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_attachments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_media_gallery_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_media_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_attachments_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_attachments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "media_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_media_gallery_items" CASCADE;
  DROP TABLE "pages_blocks_media_gallery" CASCADE;
  DROP TABLE "pages_blocks_attachments_items" CASCADE;
  DROP TABLE "pages_blocks_attachments" CASCADE;
  DROP TABLE "_pages_v_blocks_media_gallery_items" CASCADE;
  DROP TABLE "_pages_v_blocks_media_gallery" CASCADE;
  DROP TABLE "_pages_v_blocks_attachments_items" CASCADE;
  DROP TABLE "_pages_v_blocks_attachments" CASCADE;
  DROP TABLE "posts_blocks_media_gallery_items" CASCADE;
  DROP TABLE "posts_blocks_media_gallery" CASCADE;
  DROP TABLE "posts_blocks_attachments_items" CASCADE;
  DROP TABLE "posts_blocks_attachments" CASCADE;
  DROP TABLE "_posts_v_blocks_media_gallery_items" CASCADE;
  DROP TABLE "_posts_v_blocks_media_gallery" CASCADE;
  DROP TABLE "_posts_v_blocks_attachments_items" CASCADE;
  DROP TABLE "_posts_v_blocks_attachments" CASCADE;
  DROP TABLE "media_rels" CASCADE;
  ALTER TABLE "pages_rels" ADD COLUMN "media_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "media_id" integer;
  ALTER TABLE "posts_rels" ADD COLUMN "media_id" integer;
  ALTER TABLE "_posts_v_rels" ADD COLUMN "media_id" integer;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_rels_media_id_idx" ON "pages_rels" USING btree ("media_id");
  CREATE INDEX "_pages_v_rels_media_id_idx" ON "_pages_v_rels" USING btree ("media_id");
  CREATE INDEX "posts_rels_media_id_idx" ON "posts_rels" USING btree ("media_id");
  CREATE INDEX "_posts_v_rels_media_id_idx" ON "_posts_v_rels" USING btree ("media_id");
  ALTER TABLE "media" DROP COLUMN "description";
  DROP TYPE "public"."enum_pages_blocks_media_gallery_selection_mode";
  DROP TYPE "public"."enum_pages_blocks_media_gallery_sort";
  DROP TYPE "public"."enum_pages_blocks_media_gallery_view";
  DROP TYPE "public"."enum_pages_blocks_attachments_selection_mode";
  DROP TYPE "public"."enum_pages_blocks_attachments_sort";
  DROP TYPE "public"."enum_pages_blocks_attachments_view";
  DROP TYPE "public"."enum__pages_v_blocks_media_gallery_selection_mode";
  DROP TYPE "public"."enum__pages_v_blocks_media_gallery_sort";
  DROP TYPE "public"."enum__pages_v_blocks_media_gallery_view";
  DROP TYPE "public"."enum__pages_v_blocks_attachments_selection_mode";
  DROP TYPE "public"."enum__pages_v_blocks_attachments_sort";
  DROP TYPE "public"."enum__pages_v_blocks_attachments_view";
  DROP TYPE "public"."enum_posts_blocks_media_gallery_selection_mode";
  DROP TYPE "public"."enum_posts_blocks_media_gallery_sort";
  DROP TYPE "public"."enum_posts_blocks_media_gallery_view";
  DROP TYPE "public"."enum_posts_blocks_attachments_selection_mode";
  DROP TYPE "public"."enum_posts_blocks_attachments_sort";
  DROP TYPE "public"."enum_posts_blocks_attachments_view";
  DROP TYPE "public"."enum__posts_v_blocks_media_gallery_selection_mode";
  DROP TYPE "public"."enum__posts_v_blocks_media_gallery_sort";
  DROP TYPE "public"."enum__posts_v_blocks_media_gallery_view";
  DROP TYPE "public"."enum__posts_v_blocks_attachments_selection_mode";
  DROP TYPE "public"."enum__posts_v_blocks_attachments_sort";
  DROP TYPE "public"."enum__posts_v_blocks_attachments_view";`)
}
