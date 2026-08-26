import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_documents_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum_pages_blocks_documents_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum_pages_blocks_documents_view" AS ENUM('cards', 'list', 'grid');
  CREATE TYPE "public"."enum__pages_v_blocks_documents_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum__pages_v_blocks_documents_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum__pages_v_blocks_documents_view" AS ENUM('cards', 'list', 'grid');
  CREATE TYPE "public"."enum_posts_blocks_documents_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum_posts_blocks_documents_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum_posts_blocks_documents_view" AS ENUM('cards', 'list', 'grid');
  CREATE TYPE "public"."enum__posts_v_blocks_documents_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum__posts_v_blocks_documents_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum__posts_v_blocks_documents_view" AS ENUM('cards', 'list', 'grid');
  CREATE TYPE "public"."enum_events_blocks_documents_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum_events_blocks_documents_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum_events_blocks_documents_view" AS ENUM('cards', 'list', 'grid');
  CREATE TYPE "public"."enum__events_v_blocks_documents_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum__events_v_blocks_documents_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum__events_v_blocks_documents_view" AS ENUM('cards', 'list', 'grid');
  CREATE TYPE "public"."enum_event_cycles_blocks_documents_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum_event_cycles_blocks_documents_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum_event_cycles_blocks_documents_view" AS ENUM('cards', 'list', 'grid');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_documents_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_documents_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_documents_view" AS ENUM('cards', 'list', 'grid');
  CREATE TYPE "public"."enum_partners_blocks_documents_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum_partners_blocks_documents_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum_partners_blocks_documents_view" AS ENUM('cards', 'list', 'grid');
  CREATE TYPE "public"."enum__partners_v_blocks_documents_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum__partners_v_blocks_documents_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum__partners_v_blocks_documents_view" AS ENUM('cards', 'list', 'grid');
  CREATE TABLE "pages_blocks_documents_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"document_id" integer
  );
  
  CREATE TABLE "pages_blocks_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"selection_mode" "enum_pages_blocks_documents_selection_mode" DEFAULT 'filters',
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum_pages_blocks_documents_sort" DEFAULT 'newest',
  	"view" "enum_pages_blocks_documents_view" DEFAULT 'list',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_documents_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"document_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"selection_mode" "enum__pages_v_blocks_documents_selection_mode" DEFAULT 'filters',
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum__pages_v_blocks_documents_sort" DEFAULT 'newest',
  	"view" "enum__pages_v_blocks_documents_view" DEFAULT 'list',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_documents_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"document_id" integer
  );
  
  CREATE TABLE "posts_blocks_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"selection_mode" "enum_posts_blocks_documents_selection_mode" DEFAULT 'filters',
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum_posts_blocks_documents_sort" DEFAULT 'newest',
  	"view" "enum_posts_blocks_documents_view" DEFAULT 'list',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_documents_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"document_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"selection_mode" "enum__posts_v_blocks_documents_selection_mode" DEFAULT 'filters',
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum__posts_v_blocks_documents_sort" DEFAULT 'newest',
  	"view" "enum__posts_v_blocks_documents_view" DEFAULT 'list',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "events_blocks_documents_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"document_id" integer
  );
  
  CREATE TABLE "events_blocks_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"selection_mode" "enum_events_blocks_documents_selection_mode" DEFAULT 'filters',
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum_events_blocks_documents_sort" DEFAULT 'newest',
  	"view" "enum_events_blocks_documents_view" DEFAULT 'list',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_events_v_blocks_documents_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"document_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_events_v_blocks_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"selection_mode" "enum__events_v_blocks_documents_selection_mode" DEFAULT 'filters',
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum__events_v_blocks_documents_sort" DEFAULT 'newest',
  	"view" "enum__events_v_blocks_documents_view" DEFAULT 'list',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "event_cycles_blocks_documents_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"document_id" integer
  );
  
  CREATE TABLE "event_cycles_blocks_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"selection_mode" "enum_event_cycles_blocks_documents_selection_mode" DEFAULT 'filters',
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum_event_cycles_blocks_documents_sort" DEFAULT 'newest',
  	"view" "enum_event_cycles_blocks_documents_view" DEFAULT 'list',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_event_cycles_v_blocks_documents_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"document_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_event_cycles_v_blocks_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"selection_mode" "enum__event_cycles_v_blocks_documents_selection_mode" DEFAULT 'filters',
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum__event_cycles_v_blocks_documents_sort" DEFAULT 'newest',
  	"view" "enum__event_cycles_v_blocks_documents_view" DEFAULT 'list',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "partners_blocks_documents_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"document_id" integer
  );
  
  CREATE TABLE "partners_blocks_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"selection_mode" "enum_partners_blocks_documents_selection_mode" DEFAULT 'filters',
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum_partners_blocks_documents_sort" DEFAULT 'newest',
  	"view" "enum_partners_blocks_documents_view" DEFAULT 'list',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_partners_v_blocks_documents_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"document_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_partners_v_blocks_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"selection_mode" "enum__partners_v_blocks_documents_selection_mode" DEFAULT 'filters',
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum__partners_v_blocks_documents_sort" DEFAULT 'newest',
  	"view" "enum__partners_v_blocks_documents_view" DEFAULT 'list',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
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
  DROP INDEX "_event_cycles_v_version_event_defaults_external_links_ev_idx";
  DROP INDEX "_event_cycles_v_version_event_defaults_external_links__1_idx";
  DROP INDEX "_event_cycles_v_version_event_defaults_external_links__2_idx";
  ALTER TABLE "events_external_links" ADD COLUMN "document_id" integer;
  ALTER TABLE "events_external_links" ADD COLUMN "post_id" integer;
  ALTER TABLE "_events_v_version_external_links" ADD COLUMN "document_id" integer;
  ALTER TABLE "_events_v_version_external_links" ADD COLUMN "post_id" integer;
  ALTER TABLE "event_cycles_event_defaults_external_links" ADD COLUMN "document_id" integer;
  ALTER TABLE "event_cycles_event_defaults_external_links" ADD COLUMN "post_id" integer;
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" ADD COLUMN "document_id" integer;
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" ADD COLUMN "post_id" integer;
  ALTER TABLE "documents" ADD COLUMN "category_id" integer;
  ALTER TABLE "documents_rels" ADD COLUMN "tags_id" integer;
  ALTER TABLE "_documents_v" ADD COLUMN "version_category_id" integer;
  ALTER TABLE "_documents_v_rels" ADD COLUMN "tags_id" integer;
  ALTER TABLE "club_sections_menu_items" ADD COLUMN "document_id" integer;
  ALTER TABLE "club_sections_menu_items" ADD COLUMN "post_id" integer;
  ALTER TABLE "_club_sections_v_version_menu_items" ADD COLUMN "document_id" integer;
  ALTER TABLE "_club_sections_v_version_menu_items" ADD COLUMN "post_id" integer;
  ALTER TABLE "navigation_header_items" ADD COLUMN "document_id" integer;
  ALTER TABLE "navigation_header_items" ADD COLUMN "post_id" integer;
  ALTER TABLE "navigation_hero_items" ADD COLUMN "document_id" integer;
  ALTER TABLE "navigation_hero_items" ADD COLUMN "post_id" integer;
  ALTER TABLE "navigation_social_items" ADD COLUMN "document_id" integer;
  ALTER TABLE "navigation_social_items" ADD COLUMN "post_id" integer;
  ALTER TABLE "navigation_footer_columns_items" ADD COLUMN "document_id" integer;
  ALTER TABLE "navigation_footer_columns_items" ADD COLUMN "post_id" integer;
  ALTER TABLE "pages_blocks_documents_items" ADD CONSTRAINT "pages_blocks_documents_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_documents_items" ADD CONSTRAINT "pages_blocks_documents_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_documents" ADD CONSTRAINT "pages_blocks_documents_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_documents" ADD CONSTRAINT "pages_blocks_documents_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_documents" ADD CONSTRAINT "pages_blocks_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_documents_items" ADD CONSTRAINT "_pages_v_blocks_documents_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_documents_items" ADD CONSTRAINT "_pages_v_blocks_documents_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_documents" ADD CONSTRAINT "_pages_v_blocks_documents_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_documents" ADD CONSTRAINT "_pages_v_blocks_documents_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_documents" ADD CONSTRAINT "_pages_v_blocks_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_documents_items" ADD CONSTRAINT "posts_blocks_documents_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_documents_items" ADD CONSTRAINT "posts_blocks_documents_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_documents" ADD CONSTRAINT "posts_blocks_documents_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_documents" ADD CONSTRAINT "posts_blocks_documents_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_documents" ADD CONSTRAINT "posts_blocks_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_documents_items" ADD CONSTRAINT "_posts_v_blocks_documents_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_documents_items" ADD CONSTRAINT "_posts_v_blocks_documents_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_documents" ADD CONSTRAINT "_posts_v_blocks_documents_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_documents" ADD CONSTRAINT "_posts_v_blocks_documents_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_documents" ADD CONSTRAINT "_posts_v_blocks_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_blocks_documents_items" ADD CONSTRAINT "events_blocks_documents_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_documents_items" ADD CONSTRAINT "events_blocks_documents_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events_blocks_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_blocks_documents" ADD CONSTRAINT "events_blocks_documents_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_documents" ADD CONSTRAINT "events_blocks_documents_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_documents" ADD CONSTRAINT "events_blocks_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_documents_items" ADD CONSTRAINT "_events_v_blocks_documents_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_documents_items" ADD CONSTRAINT "_events_v_blocks_documents_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v_blocks_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_documents" ADD CONSTRAINT "_events_v_blocks_documents_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_documents" ADD CONSTRAINT "_events_v_blocks_documents_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_documents" ADD CONSTRAINT "_events_v_blocks_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_documents_items" ADD CONSTRAINT "event_cycles_blocks_documents_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_documents_items" ADD CONSTRAINT "event_cycles_blocks_documents_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_cycles_blocks_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_documents" ADD CONSTRAINT "event_cycles_blocks_documents_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_documents" ADD CONSTRAINT "event_cycles_blocks_documents_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_documents" ADD CONSTRAINT "event_cycles_blocks_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_cycles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_documents_items" ADD CONSTRAINT "_event_cycles_v_blocks_documents_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_documents_items" ADD CONSTRAINT "_event_cycles_v_blocks_documents_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_event_cycles_v_blocks_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_documents" ADD CONSTRAINT "_event_cycles_v_blocks_documents_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_documents" ADD CONSTRAINT "_event_cycles_v_blocks_documents_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_documents" ADD CONSTRAINT "_event_cycles_v_blocks_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_event_cycles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_blocks_documents_items" ADD CONSTRAINT "partners_blocks_documents_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_documents_items" ADD CONSTRAINT "partners_blocks_documents_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners_blocks_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_blocks_documents" ADD CONSTRAINT "partners_blocks_documents_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_documents" ADD CONSTRAINT "partners_blocks_documents_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_documents" ADD CONSTRAINT "partners_blocks_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_documents_items" ADD CONSTRAINT "_partners_v_blocks_documents_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_documents_items" ADD CONSTRAINT "_partners_v_blocks_documents_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partners_v_blocks_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_documents" ADD CONSTRAINT "_partners_v_blocks_documents_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_documents" ADD CONSTRAINT "_partners_v_blocks_documents_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_documents" ADD CONSTRAINT "_partners_v_blocks_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partners_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_documents_items_order_idx" ON "pages_blocks_documents_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_documents_items_parent_id_idx" ON "pages_blocks_documents_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_documents_items_document_idx" ON "pages_blocks_documents_items" USING btree ("document_id");
  CREATE INDEX "pages_blocks_documents_order_idx" ON "pages_blocks_documents" USING btree ("_order");
  CREATE INDEX "pages_blocks_documents_parent_id_idx" ON "pages_blocks_documents" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_documents_path_idx" ON "pages_blocks_documents" USING btree ("_path");
  CREATE INDEX "pages_blocks_documents_category_idx" ON "pages_blocks_documents" USING btree ("category_id");
  CREATE INDEX "pages_blocks_documents_tag_idx" ON "pages_blocks_documents" USING btree ("tag_id");
  CREATE INDEX "_pages_v_blocks_documents_items_order_idx" ON "_pages_v_blocks_documents_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_documents_items_parent_id_idx" ON "_pages_v_blocks_documents_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_documents_items_document_idx" ON "_pages_v_blocks_documents_items" USING btree ("document_id");
  CREATE INDEX "_pages_v_blocks_documents_order_idx" ON "_pages_v_blocks_documents" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_documents_parent_id_idx" ON "_pages_v_blocks_documents" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_documents_path_idx" ON "_pages_v_blocks_documents" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_documents_category_idx" ON "_pages_v_blocks_documents" USING btree ("category_id");
  CREATE INDEX "_pages_v_blocks_documents_tag_idx" ON "_pages_v_blocks_documents" USING btree ("tag_id");
  CREATE INDEX "posts_blocks_documents_items_order_idx" ON "posts_blocks_documents_items" USING btree ("_order");
  CREATE INDEX "posts_blocks_documents_items_parent_id_idx" ON "posts_blocks_documents_items" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_documents_items_document_idx" ON "posts_blocks_documents_items" USING btree ("document_id");
  CREATE INDEX "posts_blocks_documents_order_idx" ON "posts_blocks_documents" USING btree ("_order");
  CREATE INDEX "posts_blocks_documents_parent_id_idx" ON "posts_blocks_documents" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_documents_path_idx" ON "posts_blocks_documents" USING btree ("_path");
  CREATE INDEX "posts_blocks_documents_category_idx" ON "posts_blocks_documents" USING btree ("category_id");
  CREATE INDEX "posts_blocks_documents_tag_idx" ON "posts_blocks_documents" USING btree ("tag_id");
  CREATE INDEX "_posts_v_blocks_documents_items_order_idx" ON "_posts_v_blocks_documents_items" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_documents_items_parent_id_idx" ON "_posts_v_blocks_documents_items" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_documents_items_document_idx" ON "_posts_v_blocks_documents_items" USING btree ("document_id");
  CREATE INDEX "_posts_v_blocks_documents_order_idx" ON "_posts_v_blocks_documents" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_documents_parent_id_idx" ON "_posts_v_blocks_documents" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_documents_path_idx" ON "_posts_v_blocks_documents" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_documents_category_idx" ON "_posts_v_blocks_documents" USING btree ("category_id");
  CREATE INDEX "_posts_v_blocks_documents_tag_idx" ON "_posts_v_blocks_documents" USING btree ("tag_id");
  CREATE INDEX "events_blocks_documents_items_order_idx" ON "events_blocks_documents_items" USING btree ("_order");
  CREATE INDEX "events_blocks_documents_items_parent_id_idx" ON "events_blocks_documents_items" USING btree ("_parent_id");
  CREATE INDEX "events_blocks_documents_items_document_idx" ON "events_blocks_documents_items" USING btree ("document_id");
  CREATE INDEX "events_blocks_documents_order_idx" ON "events_blocks_documents" USING btree ("_order");
  CREATE INDEX "events_blocks_documents_parent_id_idx" ON "events_blocks_documents" USING btree ("_parent_id");
  CREATE INDEX "events_blocks_documents_path_idx" ON "events_blocks_documents" USING btree ("_path");
  CREATE INDEX "events_blocks_documents_category_idx" ON "events_blocks_documents" USING btree ("category_id");
  CREATE INDEX "events_blocks_documents_tag_idx" ON "events_blocks_documents" USING btree ("tag_id");
  CREATE INDEX "_events_v_blocks_documents_items_order_idx" ON "_events_v_blocks_documents_items" USING btree ("_order");
  CREATE INDEX "_events_v_blocks_documents_items_parent_id_idx" ON "_events_v_blocks_documents_items" USING btree ("_parent_id");
  CREATE INDEX "_events_v_blocks_documents_items_document_idx" ON "_events_v_blocks_documents_items" USING btree ("document_id");
  CREATE INDEX "_events_v_blocks_documents_order_idx" ON "_events_v_blocks_documents" USING btree ("_order");
  CREATE INDEX "_events_v_blocks_documents_parent_id_idx" ON "_events_v_blocks_documents" USING btree ("_parent_id");
  CREATE INDEX "_events_v_blocks_documents_path_idx" ON "_events_v_blocks_documents" USING btree ("_path");
  CREATE INDEX "_events_v_blocks_documents_category_idx" ON "_events_v_blocks_documents" USING btree ("category_id");
  CREATE INDEX "_events_v_blocks_documents_tag_idx" ON "_events_v_blocks_documents" USING btree ("tag_id");
  CREATE INDEX "event_cycles_blocks_documents_items_order_idx" ON "event_cycles_blocks_documents_items" USING btree ("_order");
  CREATE INDEX "event_cycles_blocks_documents_items_parent_id_idx" ON "event_cycles_blocks_documents_items" USING btree ("_parent_id");
  CREATE INDEX "event_cycles_blocks_documents_items_document_idx" ON "event_cycles_blocks_documents_items" USING btree ("document_id");
  CREATE INDEX "event_cycles_blocks_documents_order_idx" ON "event_cycles_blocks_documents" USING btree ("_order");
  CREATE INDEX "event_cycles_blocks_documents_parent_id_idx" ON "event_cycles_blocks_documents" USING btree ("_parent_id");
  CREATE INDEX "event_cycles_blocks_documents_path_idx" ON "event_cycles_blocks_documents" USING btree ("_path");
  CREATE INDEX "event_cycles_blocks_documents_category_idx" ON "event_cycles_blocks_documents" USING btree ("category_id");
  CREATE INDEX "event_cycles_blocks_documents_tag_idx" ON "event_cycles_blocks_documents" USING btree ("tag_id");
  CREATE INDEX "_event_cycles_v_blocks_documents_items_order_idx" ON "_event_cycles_v_blocks_documents_items" USING btree ("_order");
  CREATE INDEX "_event_cycles_v_blocks_documents_items_parent_id_idx" ON "_event_cycles_v_blocks_documents_items" USING btree ("_parent_id");
  CREATE INDEX "_event_cycles_v_blocks_documents_items_document_idx" ON "_event_cycles_v_blocks_documents_items" USING btree ("document_id");
  CREATE INDEX "_event_cycles_v_blocks_documents_order_idx" ON "_event_cycles_v_blocks_documents" USING btree ("_order");
  CREATE INDEX "_event_cycles_v_blocks_documents_parent_id_idx" ON "_event_cycles_v_blocks_documents" USING btree ("_parent_id");
  CREATE INDEX "_event_cycles_v_blocks_documents_path_idx" ON "_event_cycles_v_blocks_documents" USING btree ("_path");
  CREATE INDEX "_event_cycles_v_blocks_documents_category_idx" ON "_event_cycles_v_blocks_documents" USING btree ("category_id");
  CREATE INDEX "_event_cycles_v_blocks_documents_tag_idx" ON "_event_cycles_v_blocks_documents" USING btree ("tag_id");
  CREATE INDEX "partners_blocks_documents_items_order_idx" ON "partners_blocks_documents_items" USING btree ("_order");
  CREATE INDEX "partners_blocks_documents_items_parent_id_idx" ON "partners_blocks_documents_items" USING btree ("_parent_id");
  CREATE INDEX "partners_blocks_documents_items_document_idx" ON "partners_blocks_documents_items" USING btree ("document_id");
  CREATE INDEX "partners_blocks_documents_order_idx" ON "partners_blocks_documents" USING btree ("_order");
  CREATE INDEX "partners_blocks_documents_parent_id_idx" ON "partners_blocks_documents" USING btree ("_parent_id");
  CREATE INDEX "partners_blocks_documents_path_idx" ON "partners_blocks_documents" USING btree ("_path");
  CREATE INDEX "partners_blocks_documents_category_idx" ON "partners_blocks_documents" USING btree ("category_id");
  CREATE INDEX "partners_blocks_documents_tag_idx" ON "partners_blocks_documents" USING btree ("tag_id");
  CREATE INDEX "_partners_v_blocks_documents_items_order_idx" ON "_partners_v_blocks_documents_items" USING btree ("_order");
  CREATE INDEX "_partners_v_blocks_documents_items_parent_id_idx" ON "_partners_v_blocks_documents_items" USING btree ("_parent_id");
  CREATE INDEX "_partners_v_blocks_documents_items_document_idx" ON "_partners_v_blocks_documents_items" USING btree ("document_id");
  CREATE INDEX "_partners_v_blocks_documents_order_idx" ON "_partners_v_blocks_documents" USING btree ("_order");
  CREATE INDEX "_partners_v_blocks_documents_parent_id_idx" ON "_partners_v_blocks_documents" USING btree ("_parent_id");
  CREATE INDEX "_partners_v_blocks_documents_path_idx" ON "_partners_v_blocks_documents" USING btree ("_path");
  CREATE INDEX "_partners_v_blocks_documents_category_idx" ON "_partners_v_blocks_documents" USING btree ("category_id");
  CREATE INDEX "_partners_v_blocks_documents_tag_idx" ON "_partners_v_blocks_documents" USING btree ("tag_id");
  ALTER TABLE "events_external_links" ADD CONSTRAINT "events_external_links_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_external_links" ADD CONSTRAINT "events_external_links_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_version_external_links" ADD CONSTRAINT "_events_v_version_external_links_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_version_external_links" ADD CONSTRAINT "_events_v_version_external_links_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_event_defaults_external_links" ADD CONSTRAINT "event_cycles_event_defaults_external_links_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_event_defaults_external_links" ADD CONSTRAINT "event_cycles_event_defaults_external_links_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" ADD CONSTRAINT "_event_cycles_v_version_event_defaults_external_links_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" ADD CONSTRAINT "_event_cycles_v_version_event_defaults_external_links_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "documents" ADD CONSTRAINT "documents_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "documents_rels" ADD CONSTRAINT "documents_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_documents_v" ADD CONSTRAINT "_documents_v_version_category_id_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_documents_v_rels" ADD CONSTRAINT "_documents_v_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "club_sections_menu_items" ADD CONSTRAINT "club_sections_menu_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "club_sections_menu_items" ADD CONSTRAINT "club_sections_menu_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_club_sections_v_version_menu_items" ADD CONSTRAINT "_club_sections_v_version_menu_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_club_sections_v_version_menu_items" ADD CONSTRAINT "_club_sections_v_version_menu_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_header_items" ADD CONSTRAINT "navigation_header_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_header_items" ADD CONSTRAINT "navigation_header_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_hero_items" ADD CONSTRAINT "navigation_hero_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_hero_items" ADD CONSTRAINT "navigation_hero_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_social_items" ADD CONSTRAINT "navigation_social_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_social_items" ADD CONSTRAINT "navigation_social_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns_items" ADD CONSTRAINT "navigation_footer_columns_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns_items" ADD CONSTRAINT "navigation_footer_columns_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "events_external_links_document_idx" ON "events_external_links" USING btree ("document_id");
  CREATE INDEX "events_external_links_post_idx" ON "events_external_links" USING btree ("post_id");
  CREATE INDEX "_events_v_version_external_links_document_idx" ON "_events_v_version_external_links" USING btree ("document_id");
  CREATE INDEX "_events_v_version_external_links_post_idx" ON "_events_v_version_external_links" USING btree ("post_id");
  CREATE INDEX "event_cycles_event_defaults_external_links_document_idx" ON "event_cycles_event_defaults_external_links" USING btree ("document_id");
  CREATE INDEX "event_cycles_event_defaults_external_links_post_idx" ON "event_cycles_event_defaults_external_links" USING btree ("post_id");
  CREATE INDEX "_event_cycles_v_version_event_defaults_external_links_do_idx" ON "_event_cycles_v_version_event_defaults_external_links" USING btree ("document_id");
  CREATE INDEX "_event_cycles_v_version_event_defaults_external_links_po_idx" ON "_event_cycles_v_version_event_defaults_external_links" USING btree ("post_id");
  CREATE INDEX "documents_category_idx" ON "documents" USING btree ("category_id");
  CREATE INDEX "documents_rels_tags_id_idx" ON "documents_rels" USING btree ("tags_id");
  CREATE INDEX "_documents_v_version_version_category_idx" ON "_documents_v" USING btree ("version_category_id");
  CREATE INDEX "_documents_v_rels_tags_id_idx" ON "_documents_v_rels" USING btree ("tags_id");
  CREATE INDEX "club_sections_menu_items_document_idx" ON "club_sections_menu_items" USING btree ("document_id");
  CREATE INDEX "club_sections_menu_items_post_idx" ON "club_sections_menu_items" USING btree ("post_id");
  CREATE INDEX "_club_sections_v_version_menu_items_document_idx" ON "_club_sections_v_version_menu_items" USING btree ("document_id");
  CREATE INDEX "_club_sections_v_version_menu_items_post_idx" ON "_club_sections_v_version_menu_items" USING btree ("post_id");
  CREATE INDEX "navigation_header_items_document_idx" ON "navigation_header_items" USING btree ("document_id");
  CREATE INDEX "navigation_header_items_post_idx" ON "navigation_header_items" USING btree ("post_id");
  CREATE INDEX "navigation_hero_items_document_idx" ON "navigation_hero_items" USING btree ("document_id");
  CREATE INDEX "navigation_hero_items_post_idx" ON "navigation_hero_items" USING btree ("post_id");
  CREATE INDEX "navigation_social_items_document_idx" ON "navigation_social_items" USING btree ("document_id");
  CREATE INDEX "navigation_social_items_post_idx" ON "navigation_social_items" USING btree ("post_id");
  CREATE INDEX "navigation_footer_columns_items_document_idx" ON "navigation_footer_columns_items" USING btree ("document_id");
  CREATE INDEX "navigation_footer_columns_items_post_idx" ON "navigation_footer_columns_items" USING btree ("post_id");
  CREATE INDEX "_event_cycles_v_version_event_defaults_external_links_ev_idx" ON "_event_cycles_v_version_event_defaults_external_links" USING btree ("event_cycle_id");
  CREATE INDEX "_event_cycles_v_version_event_defaults_external_links__1_idx" ON "_event_cycles_v_version_event_defaults_external_links" USING btree ("page_id");
  CREATE INDEX "_event_cycles_v_version_event_defaults_external_links__2_idx" ON "_event_cycles_v_version_event_defaults_external_links" USING btree ("event_id");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_documents_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_documents_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_documents_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_documents_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_blocks_documents_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_blocks_documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_v_blocks_documents_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_v_blocks_documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "event_cycles_blocks_documents_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "event_cycles_blocks_documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_event_cycles_v_blocks_documents_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_event_cycles_v_blocks_documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "partners_blocks_documents_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "partners_blocks_documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_partners_v_blocks_documents_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_partners_v_blocks_documents" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_documents_items" CASCADE;
  DROP TABLE "pages_blocks_documents" CASCADE;
  DROP TABLE "_pages_v_blocks_documents_items" CASCADE;
  DROP TABLE "_pages_v_blocks_documents" CASCADE;
  DROP TABLE "posts_blocks_documents_items" CASCADE;
  DROP TABLE "posts_blocks_documents" CASCADE;
  DROP TABLE "_posts_v_blocks_documents_items" CASCADE;
  DROP TABLE "_posts_v_blocks_documents" CASCADE;
  DROP TABLE "events_blocks_documents_items" CASCADE;
  DROP TABLE "events_blocks_documents" CASCADE;
  DROP TABLE "_events_v_blocks_documents_items" CASCADE;
  DROP TABLE "_events_v_blocks_documents" CASCADE;
  DROP TABLE "event_cycles_blocks_documents_items" CASCADE;
  DROP TABLE "event_cycles_blocks_documents" CASCADE;
  DROP TABLE "_event_cycles_v_blocks_documents_items" CASCADE;
  DROP TABLE "_event_cycles_v_blocks_documents" CASCADE;
  DROP TABLE "partners_blocks_documents_items" CASCADE;
  DROP TABLE "partners_blocks_documents" CASCADE;
  DROP TABLE "_partners_v_blocks_documents_items" CASCADE;
  DROP TABLE "_partners_v_blocks_documents" CASCADE;
  ALTER TABLE "events_external_links" DROP CONSTRAINT "events_external_links_document_id_documents_id_fk";
  
  ALTER TABLE "events_external_links" DROP CONSTRAINT "events_external_links_post_id_posts_id_fk";
  
  ALTER TABLE "_events_v_version_external_links" DROP CONSTRAINT "_events_v_version_external_links_document_id_documents_id_fk";
  
  ALTER TABLE "_events_v_version_external_links" DROP CONSTRAINT "_events_v_version_external_links_post_id_posts_id_fk";
  
  ALTER TABLE "event_cycles_event_defaults_external_links" DROP CONSTRAINT "event_cycles_event_defaults_external_links_document_id_documents_id_fk";
  
  ALTER TABLE "event_cycles_event_defaults_external_links" DROP CONSTRAINT "event_cycles_event_defaults_external_links_post_id_posts_id_fk";
  
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" DROP CONSTRAINT "_event_cycles_v_version_event_defaults_external_links_document_id_documents_id_fk";
  
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" DROP CONSTRAINT "_event_cycles_v_version_event_defaults_external_links_post_id_posts_id_fk";
  
  ALTER TABLE "documents" DROP CONSTRAINT "documents_category_id_categories_id_fk";
  
  ALTER TABLE "documents_rels" DROP CONSTRAINT "documents_rels_tags_fk";
  
  ALTER TABLE "_documents_v" DROP CONSTRAINT "_documents_v_version_category_id_categories_id_fk";
  
  ALTER TABLE "_documents_v_rels" DROP CONSTRAINT "_documents_v_rels_tags_fk";
  
  ALTER TABLE "club_sections_menu_items" DROP CONSTRAINT "club_sections_menu_items_document_id_documents_id_fk";
  
  ALTER TABLE "club_sections_menu_items" DROP CONSTRAINT "club_sections_menu_items_post_id_posts_id_fk";
  
  ALTER TABLE "_club_sections_v_version_menu_items" DROP CONSTRAINT "_club_sections_v_version_menu_items_document_id_documents_id_fk";
  
  ALTER TABLE "_club_sections_v_version_menu_items" DROP CONSTRAINT "_club_sections_v_version_menu_items_post_id_posts_id_fk";
  
  ALTER TABLE "navigation_header_items" DROP CONSTRAINT "navigation_header_items_document_id_documents_id_fk";
  
  ALTER TABLE "navigation_header_items" DROP CONSTRAINT "navigation_header_items_post_id_posts_id_fk";
  
  ALTER TABLE "navigation_hero_items" DROP CONSTRAINT "navigation_hero_items_document_id_documents_id_fk";
  
  ALTER TABLE "navigation_hero_items" DROP CONSTRAINT "navigation_hero_items_post_id_posts_id_fk";
  
  ALTER TABLE "navigation_social_items" DROP CONSTRAINT "navigation_social_items_document_id_documents_id_fk";
  
  ALTER TABLE "navigation_social_items" DROP CONSTRAINT "navigation_social_items_post_id_posts_id_fk";
  
  ALTER TABLE "navigation_footer_columns_items" DROP CONSTRAINT "navigation_footer_columns_items_document_id_documents_id_fk";
  
  ALTER TABLE "navigation_footer_columns_items" DROP CONSTRAINT "navigation_footer_columns_items_post_id_posts_id_fk";
  
  ALTER TABLE "events_external_links" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "events_external_links" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  ALTER TABLE "_events_v_version_external_links" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "_events_v_version_external_links" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  ALTER TABLE "event_cycles_event_defaults_external_links" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "event_cycles_event_defaults_external_links" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  UPDATE "events_external_links" SET "target_type" = 'custom' WHERE "target_type" IN ('document', 'post');
  UPDATE "_events_v_version_external_links" SET "target_type" = 'custom' WHERE "target_type" IN ('document', 'post');
  UPDATE "event_cycles_event_defaults_external_links" SET "target_type" = 'custom' WHERE "target_type" IN ('document', 'post');
  UPDATE "_event_cycles_v_version_event_defaults_external_links" SET "target_type" = 'custom' WHERE "target_type" IN ('document', 'post');
  DROP TYPE "public"."target";
  CREATE TYPE "public"."target" AS ENUM('page', 'category', 'tag', 'event', 'eventCycle', 'partner', 'custom');
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
  UPDATE "club_sections_menu_items" SET "target_type" = 'custom' WHERE "target_type" IN ('document', 'post');
  DROP TYPE "public"."enum_club_sections_menu_items_target_type";
  CREATE TYPE "public"."enum_club_sections_menu_items_target_type" AS ENUM('page', 'category', 'tag', 'event', 'eventCycle', 'partner', 'custom');
  ALTER TABLE "club_sections_menu_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::"public"."enum_club_sections_menu_items_target_type";
  ALTER TABLE "club_sections_menu_items" ALTER COLUMN "target_type" SET DATA TYPE "public"."enum_club_sections_menu_items_target_type" USING "target_type"::"public"."enum_club_sections_menu_items_target_type";
  ALTER TABLE "_club_sections_v_version_menu_items" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "_club_sections_v_version_menu_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  UPDATE "_club_sections_v_version_menu_items" SET "target_type" = 'custom' WHERE "target_type" IN ('document', 'post');
  DROP TYPE "public"."enum__club_sections_v_version_menu_items_target_type";
  CREATE TYPE "public"."enum__club_sections_v_version_menu_items_target_type" AS ENUM('page', 'category', 'tag', 'event', 'eventCycle', 'partner', 'custom');
  ALTER TABLE "_club_sections_v_version_menu_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::"public"."enum__club_sections_v_version_menu_items_target_type";
  ALTER TABLE "_club_sections_v_version_menu_items" ALTER COLUMN "target_type" SET DATA TYPE "public"."enum__club_sections_v_version_menu_items_target_type" USING "target_type"::"public"."enum__club_sections_v_version_menu_items_target_type";
  ALTER TABLE "navigation_header_items" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "navigation_header_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  UPDATE "navigation_header_items" SET "target_type" = 'custom' WHERE "target_type" IN ('document', 'post');
  DROP TYPE "public"."enum_navigation_header_items_target_type";
  CREATE TYPE "public"."enum_navigation_header_items_target_type" AS ENUM('page', 'category', 'tag', 'event', 'eventCycle', 'partner', 'custom');
  ALTER TABLE "navigation_header_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::"public"."enum_navigation_header_items_target_type";
  ALTER TABLE "navigation_header_items" ALTER COLUMN "target_type" SET DATA TYPE "public"."enum_navigation_header_items_target_type" USING "target_type"::"public"."enum_navigation_header_items_target_type";
  ALTER TABLE "navigation_hero_items" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "navigation_hero_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  UPDATE "navigation_hero_items" SET "target_type" = 'custom' WHERE "target_type" IN ('document', 'post');
  DROP TYPE "public"."enum_navigation_hero_items_target_type";
  CREATE TYPE "public"."enum_navigation_hero_items_target_type" AS ENUM('page', 'category', 'tag', 'event', 'eventCycle', 'partner', 'custom');
  ALTER TABLE "navigation_hero_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::"public"."enum_navigation_hero_items_target_type";
  ALTER TABLE "navigation_hero_items" ALTER COLUMN "target_type" SET DATA TYPE "public"."enum_navigation_hero_items_target_type" USING "target_type"::"public"."enum_navigation_hero_items_target_type";
  ALTER TABLE "navigation_social_items" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "navigation_social_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  UPDATE "navigation_social_items" SET "target_type" = 'custom' WHERE "target_type" IN ('document', 'post');
  DROP TYPE "public"."enum_navigation_social_items_target_type";
  CREATE TYPE "public"."enum_navigation_social_items_target_type" AS ENUM('page', 'category', 'tag', 'event', 'eventCycle', 'partner', 'custom');
  ALTER TABLE "navigation_social_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::"public"."enum_navigation_social_items_target_type";
  ALTER TABLE "navigation_social_items" ALTER COLUMN "target_type" SET DATA TYPE "public"."enum_navigation_social_items_target_type" USING "target_type"::"public"."enum_navigation_social_items_target_type";
  ALTER TABLE "navigation_footer_columns_items" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "navigation_footer_columns_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  UPDATE "navigation_footer_columns_items" SET "target_type" = 'custom' WHERE "target_type" IN ('document', 'post');
  DROP TYPE "public"."enum_navigation_footer_columns_items_target_type";
  CREATE TYPE "public"."enum_navigation_footer_columns_items_target_type" AS ENUM('page', 'category', 'tag', 'event', 'eventCycle', 'partner', 'custom');
  ALTER TABLE "navigation_footer_columns_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::"public"."enum_navigation_footer_columns_items_target_type";
  ALTER TABLE "navigation_footer_columns_items" ALTER COLUMN "target_type" SET DATA TYPE "public"."enum_navigation_footer_columns_items_target_type" USING "target_type"::"public"."enum_navigation_footer_columns_items_target_type";
  DROP INDEX "events_external_links_document_idx";
  DROP INDEX "events_external_links_post_idx";
  DROP INDEX "_events_v_version_external_links_document_idx";
  DROP INDEX "_events_v_version_external_links_post_idx";
  DROP INDEX "event_cycles_event_defaults_external_links_document_idx";
  DROP INDEX "event_cycles_event_defaults_external_links_post_idx";
  DROP INDEX "_event_cycles_v_version_event_defaults_external_links_do_idx";
  DROP INDEX "_event_cycles_v_version_event_defaults_external_links_po_idx";
  DROP INDEX "documents_category_idx";
  DROP INDEX "documents_rels_tags_id_idx";
  DROP INDEX "_documents_v_version_version_category_idx";
  DROP INDEX "_documents_v_rels_tags_id_idx";
  DROP INDEX "club_sections_menu_items_document_idx";
  DROP INDEX "club_sections_menu_items_post_idx";
  DROP INDEX "_club_sections_v_version_menu_items_document_idx";
  DROP INDEX "_club_sections_v_version_menu_items_post_idx";
  DROP INDEX "navigation_header_items_document_idx";
  DROP INDEX "navigation_header_items_post_idx";
  DROP INDEX "navigation_hero_items_document_idx";
  DROP INDEX "navigation_hero_items_post_idx";
  DROP INDEX "navigation_social_items_document_idx";
  DROP INDEX "navigation_social_items_post_idx";
  DROP INDEX "navigation_footer_columns_items_document_idx";
  DROP INDEX "navigation_footer_columns_items_post_idx";
  DROP INDEX "_event_cycles_v_version_event_defaults_external_links_ev_idx";
  DROP INDEX "_event_cycles_v_version_event_defaults_external_links__1_idx";
  DROP INDEX "_event_cycles_v_version_event_defaults_external_links__2_idx";
  CREATE INDEX "_event_cycles_v_version_event_defaults_external_links_ev_idx" ON "_event_cycles_v_version_event_defaults_external_links" USING btree ("event_id");
  CREATE INDEX "_event_cycles_v_version_event_defaults_external_links__1_idx" ON "_event_cycles_v_version_event_defaults_external_links" USING btree ("event_cycle_id");
  CREATE INDEX "_event_cycles_v_version_event_defaults_external_links__2_idx" ON "_event_cycles_v_version_event_defaults_external_links" USING btree ("page_id");
  ALTER TABLE "events_external_links" DROP COLUMN "document_id";
  ALTER TABLE "events_external_links" DROP COLUMN "post_id";
  ALTER TABLE "_events_v_version_external_links" DROP COLUMN "document_id";
  ALTER TABLE "_events_v_version_external_links" DROP COLUMN "post_id";
  ALTER TABLE "event_cycles_event_defaults_external_links" DROP COLUMN "document_id";
  ALTER TABLE "event_cycles_event_defaults_external_links" DROP COLUMN "post_id";
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" DROP COLUMN "document_id";
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" DROP COLUMN "post_id";
  ALTER TABLE "documents" DROP COLUMN "category_id";
  ALTER TABLE "documents_rels" DROP COLUMN "tags_id";
  ALTER TABLE "_documents_v" DROP COLUMN "version_category_id";
  ALTER TABLE "_documents_v_rels" DROP COLUMN "tags_id";
  ALTER TABLE "club_sections_menu_items" DROP COLUMN "document_id";
  ALTER TABLE "club_sections_menu_items" DROP COLUMN "post_id";
  ALTER TABLE "_club_sections_v_version_menu_items" DROP COLUMN "document_id";
  ALTER TABLE "_club_sections_v_version_menu_items" DROP COLUMN "post_id";
  ALTER TABLE "navigation_header_items" DROP COLUMN "document_id";
  ALTER TABLE "navigation_header_items" DROP COLUMN "post_id";
  ALTER TABLE "navigation_hero_items" DROP COLUMN "document_id";
  ALTER TABLE "navigation_hero_items" DROP COLUMN "post_id";
  ALTER TABLE "navigation_social_items" DROP COLUMN "document_id";
  ALTER TABLE "navigation_social_items" DROP COLUMN "post_id";
  ALTER TABLE "navigation_footer_columns_items" DROP COLUMN "document_id";
  ALTER TABLE "navigation_footer_columns_items" DROP COLUMN "post_id";
  DROP TYPE "public"."enum_pages_blocks_documents_selection_mode";
  DROP TYPE "public"."enum_pages_blocks_documents_sort";
  DROP TYPE "public"."enum_pages_blocks_documents_view";
  DROP TYPE "public"."enum__pages_v_blocks_documents_selection_mode";
  DROP TYPE "public"."enum__pages_v_blocks_documents_sort";
  DROP TYPE "public"."enum__pages_v_blocks_documents_view";
  DROP TYPE "public"."enum_posts_blocks_documents_selection_mode";
  DROP TYPE "public"."enum_posts_blocks_documents_sort";
  DROP TYPE "public"."enum_posts_blocks_documents_view";
  DROP TYPE "public"."enum__posts_v_blocks_documents_selection_mode";
  DROP TYPE "public"."enum__posts_v_blocks_documents_sort";
  DROP TYPE "public"."enum__posts_v_blocks_documents_view";
  DROP TYPE "public"."enum_events_blocks_documents_selection_mode";
  DROP TYPE "public"."enum_events_blocks_documents_sort";
  DROP TYPE "public"."enum_events_blocks_documents_view";
  DROP TYPE "public"."enum__events_v_blocks_documents_selection_mode";
  DROP TYPE "public"."enum__events_v_blocks_documents_sort";
  DROP TYPE "public"."enum__events_v_blocks_documents_view";
  DROP TYPE "public"."enum_event_cycles_blocks_documents_selection_mode";
  DROP TYPE "public"."enum_event_cycles_blocks_documents_sort";
  DROP TYPE "public"."enum_event_cycles_blocks_documents_view";
  DROP TYPE "public"."enum__event_cycles_v_blocks_documents_selection_mode";
  DROP TYPE "public"."enum__event_cycles_v_blocks_documents_sort";
  DROP TYPE "public"."enum__event_cycles_v_blocks_documents_view";
  DROP TYPE "public"."enum_partners_blocks_documents_selection_mode";
  DROP TYPE "public"."enum_partners_blocks_documents_sort";
  DROP TYPE "public"."enum_partners_blocks_documents_view";
  DROP TYPE "public"."enum__partners_v_blocks_documents_selection_mode";
  DROP TYPE "public"."enum__partners_v_blocks_documents_sort";
  DROP TYPE "public"."enum__partners_v_blocks_documents_view";`)
}
