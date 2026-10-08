import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles');
  CREATE TYPE "public"."enum_pages_blocks_carousel_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum_pages_blocks_carousel_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum_pages_blocks_carousel_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending', 'eventDateAscending');
  CREATE TYPE "public"."enum_pages_blocks_carousel_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TYPE "public"."enum__pages_v_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles');
  CREATE TYPE "public"."enum__pages_v_blocks_carousel_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum__pages_v_blocks_carousel_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum__pages_v_blocks_carousel_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending', 'eventDateAscending');
  CREATE TYPE "public"."enum__pages_v_blocks_carousel_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TYPE "public"."enum_posts_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles');
  CREATE TYPE "public"."enum_posts_blocks_carousel_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum_posts_blocks_carousel_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum_posts_blocks_carousel_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending', 'eventDateAscending');
  CREATE TYPE "public"."enum_posts_blocks_carousel_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TYPE "public"."enum__posts_v_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles');
  CREATE TYPE "public"."enum__posts_v_blocks_carousel_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum__posts_v_blocks_carousel_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum__posts_v_blocks_carousel_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending', 'eventDateAscending');
  CREATE TYPE "public"."enum__posts_v_blocks_carousel_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TYPE "public"."enum_events_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles');
  CREATE TYPE "public"."enum_events_blocks_carousel_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum_events_blocks_carousel_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum_events_blocks_carousel_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending', 'eventDateAscending');
  CREATE TYPE "public"."enum_events_blocks_carousel_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TYPE "public"."enum__events_v_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles');
  CREATE TYPE "public"."enum__events_v_blocks_carousel_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum__events_v_blocks_carousel_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum__events_v_blocks_carousel_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending', 'eventDateAscending');
  CREATE TYPE "public"."enum__events_v_blocks_carousel_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TYPE "public"."enum_event_cycles_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles');
  CREATE TYPE "public"."enum_event_cycles_blocks_carousel_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum_event_cycles_blocks_carousel_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum_event_cycles_blocks_carousel_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending', 'eventDateAscending');
  CREATE TYPE "public"."enum_event_cycles_blocks_carousel_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_carousel_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_carousel_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_carousel_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending', 'eventDateAscending');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_carousel_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TYPE "public"."enum_partners_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles');
  CREATE TYPE "public"."enum_partners_blocks_carousel_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum_partners_blocks_carousel_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum_partners_blocks_carousel_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending', 'eventDateAscending');
  CREATE TYPE "public"."enum_partners_blocks_carousel_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TYPE "public"."enum__partners_v_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles');
  CREATE TYPE "public"."enum__partners_v_blocks_carousel_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum__partners_v_blocks_carousel_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum__partners_v_blocks_carousel_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending', 'eventDateAscending');
  CREATE TYPE "public"."enum__partners_v_blocks_carousel_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TYPE "public"."enum_homepage_sections_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles');
  CREATE TYPE "public"."enum_homepage_sections_blocks_carousel_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum_homepage_sections_blocks_carousel_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum_homepage_sections_blocks_carousel_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending', 'eventDateAscending');
  CREATE TYPE "public"."enum_homepage_sections_blocks_carousel_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TABLE "pages_blocks_carousel_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_carousel_sources" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_pages_blocks_carousel_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"selection_mode" "enum_pages_blocks_carousel_selection_mode" DEFAULT 'filters',
  	"parent_page_id" integer,
  	"category_id" integer,
  	"tag_id" integer,
  	"event_time_filter" "enum_pages_blocks_carousel_event_time_filter" DEFAULT 'all',
  	"event_cycle_id" integer,
  	"sort" "enum_pages_blocks_carousel_sort" DEFAULT 'newest',
  	"slide_limit" numeric DEFAULT 5,
  	"parent_filter" "enum_pages_blocks_carousel_parent_filter" DEFAULT 'none',
  	"empty_message" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_carousel_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_carousel_sources" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__pages_v_blocks_carousel_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"selection_mode" "enum__pages_v_blocks_carousel_selection_mode" DEFAULT 'filters',
  	"parent_page_id" integer,
  	"category_id" integer,
  	"tag_id" integer,
  	"event_time_filter" "enum__pages_v_blocks_carousel_event_time_filter" DEFAULT 'all',
  	"event_cycle_id" integer,
  	"sort" "enum__pages_v_blocks_carousel_sort" DEFAULT 'newest',
  	"slide_limit" numeric DEFAULT 5,
  	"parent_filter" "enum__pages_v_blocks_carousel_parent_filter" DEFAULT 'none',
  	"empty_message" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_carousel_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "posts_blocks_carousel_sources" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_posts_blocks_carousel_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "posts_blocks_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"selection_mode" "enum_posts_blocks_carousel_selection_mode" DEFAULT 'filters',
  	"parent_page_id" integer,
  	"category_id" integer,
  	"tag_id" integer,
  	"event_time_filter" "enum_posts_blocks_carousel_event_time_filter" DEFAULT 'all',
  	"event_cycle_id" integer,
  	"sort" "enum_posts_blocks_carousel_sort" DEFAULT 'newest',
  	"slide_limit" numeric DEFAULT 5,
  	"parent_filter" "enum_posts_blocks_carousel_parent_filter" DEFAULT 'none',
  	"empty_message" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_carousel_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_carousel_sources" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__posts_v_blocks_carousel_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_posts_v_blocks_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"selection_mode" "enum__posts_v_blocks_carousel_selection_mode" DEFAULT 'filters',
  	"parent_page_id" integer,
  	"category_id" integer,
  	"tag_id" integer,
  	"event_time_filter" "enum__posts_v_blocks_carousel_event_time_filter" DEFAULT 'all',
  	"event_cycle_id" integer,
  	"sort" "enum__posts_v_blocks_carousel_sort" DEFAULT 'newest',
  	"slide_limit" numeric DEFAULT 5,
  	"parent_filter" "enum__posts_v_blocks_carousel_parent_filter" DEFAULT 'none',
  	"empty_message" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "events_blocks_carousel_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "events_blocks_carousel_sources" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_events_blocks_carousel_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "events_blocks_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"selection_mode" "enum_events_blocks_carousel_selection_mode" DEFAULT 'filters',
  	"parent_page_id" integer,
  	"category_id" integer,
  	"tag_id" integer,
  	"event_time_filter" "enum_events_blocks_carousel_event_time_filter" DEFAULT 'all',
  	"event_cycle_id" integer,
  	"sort" "enum_events_blocks_carousel_sort" DEFAULT 'newest',
  	"slide_limit" numeric DEFAULT 5,
  	"parent_filter" "enum_events_blocks_carousel_parent_filter" DEFAULT 'none',
  	"empty_message" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_events_v_blocks_carousel_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_events_v_blocks_carousel_sources" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__events_v_blocks_carousel_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_events_v_blocks_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"selection_mode" "enum__events_v_blocks_carousel_selection_mode" DEFAULT 'filters',
  	"parent_page_id" integer,
  	"category_id" integer,
  	"tag_id" integer,
  	"event_time_filter" "enum__events_v_blocks_carousel_event_time_filter" DEFAULT 'all',
  	"event_cycle_id" integer,
  	"sort" "enum__events_v_blocks_carousel_sort" DEFAULT 'newest',
  	"slide_limit" numeric DEFAULT 5,
  	"parent_filter" "enum__events_v_blocks_carousel_parent_filter" DEFAULT 'none',
  	"empty_message" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "event_cycles_blocks_carousel_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "event_cycles_blocks_carousel_sources" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_event_cycles_blocks_carousel_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "event_cycles_blocks_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"selection_mode" "enum_event_cycles_blocks_carousel_selection_mode" DEFAULT 'filters',
  	"parent_page_id" integer,
  	"category_id" integer,
  	"tag_id" integer,
  	"event_time_filter" "enum_event_cycles_blocks_carousel_event_time_filter" DEFAULT 'all',
  	"event_cycle_id" integer,
  	"sort" "enum_event_cycles_blocks_carousel_sort" DEFAULT 'newest',
  	"slide_limit" numeric DEFAULT 5,
  	"parent_filter" "enum_event_cycles_blocks_carousel_parent_filter" DEFAULT 'none',
  	"empty_message" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_event_cycles_v_blocks_carousel_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_event_cycles_v_blocks_carousel_sources" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__event_cycles_v_blocks_carousel_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_event_cycles_v_blocks_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"selection_mode" "enum__event_cycles_v_blocks_carousel_selection_mode" DEFAULT 'filters',
  	"parent_page_id" integer,
  	"category_id" integer,
  	"tag_id" integer,
  	"event_time_filter" "enum__event_cycles_v_blocks_carousel_event_time_filter" DEFAULT 'all',
  	"event_cycle_id" integer,
  	"sort" "enum__event_cycles_v_blocks_carousel_sort" DEFAULT 'newest',
  	"slide_limit" numeric DEFAULT 5,
  	"parent_filter" "enum__event_cycles_v_blocks_carousel_parent_filter" DEFAULT 'none',
  	"empty_message" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "partners_blocks_carousel_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "partners_blocks_carousel_sources" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_partners_blocks_carousel_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "partners_blocks_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"selection_mode" "enum_partners_blocks_carousel_selection_mode" DEFAULT 'filters',
  	"parent_page_id" integer,
  	"category_id" integer,
  	"tag_id" integer,
  	"event_time_filter" "enum_partners_blocks_carousel_event_time_filter" DEFAULT 'all',
  	"event_cycle_id" integer,
  	"sort" "enum_partners_blocks_carousel_sort" DEFAULT 'newest',
  	"slide_limit" numeric DEFAULT 5,
  	"parent_filter" "enum_partners_blocks_carousel_parent_filter" DEFAULT 'none',
  	"empty_message" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_partners_v_blocks_carousel_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_partners_v_blocks_carousel_sources" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__partners_v_blocks_carousel_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_partners_v_blocks_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"selection_mode" "enum__partners_v_blocks_carousel_selection_mode" DEFAULT 'filters',
  	"parent_page_id" integer,
  	"category_id" integer,
  	"tag_id" integer,
  	"event_time_filter" "enum__partners_v_blocks_carousel_event_time_filter" DEFAULT 'all',
  	"event_cycle_id" integer,
  	"sort" "enum__partners_v_blocks_carousel_sort" DEFAULT 'newest',
  	"slide_limit" numeric DEFAULT 5,
  	"parent_filter" "enum__partners_v_blocks_carousel_parent_filter" DEFAULT 'none',
  	"empty_message" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_sections_blocks_carousel_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "homepage_sections_blocks_carousel_sources" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_homepage_sections_blocks_carousel_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "homepage_sections_blocks_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"selection_mode" "enum_homepage_sections_blocks_carousel_selection_mode" DEFAULT 'filters' NOT NULL,
  	"parent_page_id" integer,
  	"category_id" integer,
  	"tag_id" integer,
  	"event_time_filter" "enum_homepage_sections_blocks_carousel_event_time_filter" DEFAULT 'all',
  	"event_cycle_id" integer,
  	"sort" "enum_homepage_sections_blocks_carousel_sort" DEFAULT 'newest',
  	"slide_limit" numeric DEFAULT 5 NOT NULL,
  	"parent_filter" "enum_homepage_sections_blocks_carousel_parent_filter" DEFAULT 'none' NOT NULL,
  	"empty_message" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_carousel_items" ADD CONSTRAINT "pages_blocks_carousel_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_carousel_sources" ADD CONSTRAINT "pages_blocks_carousel_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_carousel" ADD CONSTRAINT "pages_blocks_carousel_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_carousel" ADD CONSTRAINT "pages_blocks_carousel_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_carousel" ADD CONSTRAINT "pages_blocks_carousel_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_carousel" ADD CONSTRAINT "pages_blocks_carousel_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_carousel" ADD CONSTRAINT "pages_blocks_carousel_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_carousel" ADD CONSTRAINT "pages_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_carousel_items" ADD CONSTRAINT "_pages_v_blocks_carousel_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_carousel_sources" ADD CONSTRAINT "_pages_v_blocks_carousel_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_carousel" ADD CONSTRAINT "_pages_v_blocks_carousel_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_carousel" ADD CONSTRAINT "_pages_v_blocks_carousel_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_carousel" ADD CONSTRAINT "_pages_v_blocks_carousel_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_carousel" ADD CONSTRAINT "_pages_v_blocks_carousel_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_carousel" ADD CONSTRAINT "_pages_v_blocks_carousel_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_carousel" ADD CONSTRAINT "_pages_v_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_carousel_items" ADD CONSTRAINT "posts_blocks_carousel_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_carousel_sources" ADD CONSTRAINT "posts_blocks_carousel_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_carousel" ADD CONSTRAINT "posts_blocks_carousel_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_carousel" ADD CONSTRAINT "posts_blocks_carousel_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_carousel" ADD CONSTRAINT "posts_blocks_carousel_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_carousel" ADD CONSTRAINT "posts_blocks_carousel_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_carousel" ADD CONSTRAINT "posts_blocks_carousel_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_carousel" ADD CONSTRAINT "posts_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_carousel_items" ADD CONSTRAINT "_posts_v_blocks_carousel_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_carousel_sources" ADD CONSTRAINT "_posts_v_blocks_carousel_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_carousel" ADD CONSTRAINT "_posts_v_blocks_carousel_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_carousel" ADD CONSTRAINT "_posts_v_blocks_carousel_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_carousel" ADD CONSTRAINT "_posts_v_blocks_carousel_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_carousel" ADD CONSTRAINT "_posts_v_blocks_carousel_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_carousel" ADD CONSTRAINT "_posts_v_blocks_carousel_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_carousel" ADD CONSTRAINT "_posts_v_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_blocks_carousel_items" ADD CONSTRAINT "events_blocks_carousel_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_blocks_carousel_sources" ADD CONSTRAINT "events_blocks_carousel_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_blocks_carousel" ADD CONSTRAINT "events_blocks_carousel_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_carousel" ADD CONSTRAINT "events_blocks_carousel_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_carousel" ADD CONSTRAINT "events_blocks_carousel_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_carousel" ADD CONSTRAINT "events_blocks_carousel_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_carousel" ADD CONSTRAINT "events_blocks_carousel_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_carousel" ADD CONSTRAINT "events_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_carousel_items" ADD CONSTRAINT "_events_v_blocks_carousel_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_carousel_sources" ADD CONSTRAINT "_events_v_blocks_carousel_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_events_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_carousel" ADD CONSTRAINT "_events_v_blocks_carousel_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_carousel" ADD CONSTRAINT "_events_v_blocks_carousel_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_carousel" ADD CONSTRAINT "_events_v_blocks_carousel_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_carousel" ADD CONSTRAINT "_events_v_blocks_carousel_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_carousel" ADD CONSTRAINT "_events_v_blocks_carousel_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_carousel" ADD CONSTRAINT "_events_v_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_carousel_items" ADD CONSTRAINT "event_cycles_blocks_carousel_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_cycles_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_carousel_sources" ADD CONSTRAINT "event_cycles_blocks_carousel_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."event_cycles_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_carousel" ADD CONSTRAINT "event_cycles_blocks_carousel_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_carousel" ADD CONSTRAINT "event_cycles_blocks_carousel_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_carousel" ADD CONSTRAINT "event_cycles_blocks_carousel_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_carousel" ADD CONSTRAINT "event_cycles_blocks_carousel_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_carousel" ADD CONSTRAINT "event_cycles_blocks_carousel_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_carousel" ADD CONSTRAINT "event_cycles_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_cycles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_carousel_items" ADD CONSTRAINT "_event_cycles_v_blocks_carousel_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_event_cycles_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_carousel_sources" ADD CONSTRAINT "_event_cycles_v_blocks_carousel_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_event_cycles_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_carousel" ADD CONSTRAINT "_event_cycles_v_blocks_carousel_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_carousel" ADD CONSTRAINT "_event_cycles_v_blocks_carousel_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_carousel" ADD CONSTRAINT "_event_cycles_v_blocks_carousel_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_carousel" ADD CONSTRAINT "_event_cycles_v_blocks_carousel_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_carousel" ADD CONSTRAINT "_event_cycles_v_blocks_carousel_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_carousel" ADD CONSTRAINT "_event_cycles_v_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_event_cycles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_blocks_carousel_items" ADD CONSTRAINT "partners_blocks_carousel_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_blocks_carousel_sources" ADD CONSTRAINT "partners_blocks_carousel_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."partners_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_blocks_carousel" ADD CONSTRAINT "partners_blocks_carousel_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_carousel" ADD CONSTRAINT "partners_blocks_carousel_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_carousel" ADD CONSTRAINT "partners_blocks_carousel_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_carousel" ADD CONSTRAINT "partners_blocks_carousel_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_carousel" ADD CONSTRAINT "partners_blocks_carousel_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_carousel" ADD CONSTRAINT "partners_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_carousel_items" ADD CONSTRAINT "_partners_v_blocks_carousel_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partners_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_carousel_sources" ADD CONSTRAINT "_partners_v_blocks_carousel_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_partners_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_carousel" ADD CONSTRAINT "_partners_v_blocks_carousel_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_carousel" ADD CONSTRAINT "_partners_v_blocks_carousel_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_carousel" ADD CONSTRAINT "_partners_v_blocks_carousel_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_carousel" ADD CONSTRAINT "_partners_v_blocks_carousel_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_carousel" ADD CONSTRAINT "_partners_v_blocks_carousel_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_carousel" ADD CONSTRAINT "_partners_v_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partners_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_carousel_items" ADD CONSTRAINT "homepage_sections_blocks_carousel_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_carousel_sources" ADD CONSTRAINT "homepage_sections_blocks_carousel_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage_sections_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_carousel" ADD CONSTRAINT "homepage_sections_blocks_carousel_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_carousel" ADD CONSTRAINT "homepage_sections_blocks_carousel_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_carousel" ADD CONSTRAINT "homepage_sections_blocks_carousel_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_carousel" ADD CONSTRAINT "homepage_sections_blocks_carousel_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_carousel" ADD CONSTRAINT "homepage_sections_blocks_carousel_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_carousel" ADD CONSTRAINT "homepage_sections_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_carousel_items_order_idx" ON "pages_blocks_carousel_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_carousel_items_parent_id_idx" ON "pages_blocks_carousel_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_carousel_sources_order_idx" ON "pages_blocks_carousel_sources" USING btree ("order");
  CREATE INDEX "pages_blocks_carousel_sources_parent_idx" ON "pages_blocks_carousel_sources" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_carousel_order_idx" ON "pages_blocks_carousel" USING btree ("_order");
  CREATE INDEX "pages_blocks_carousel_parent_id_idx" ON "pages_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_carousel_path_idx" ON "pages_blocks_carousel" USING btree ("_path");
  CREATE INDEX "pages_blocks_carousel_surface_image_idx" ON "pages_blocks_carousel" USING btree ("surface_image_id");
  CREATE INDEX "pages_blocks_carousel_parent_page_idx" ON "pages_blocks_carousel" USING btree ("parent_page_id");
  CREATE INDEX "pages_blocks_carousel_category_idx" ON "pages_blocks_carousel" USING btree ("category_id");
  CREATE INDEX "pages_blocks_carousel_tag_idx" ON "pages_blocks_carousel" USING btree ("tag_id");
  CREATE INDEX "pages_blocks_carousel_event_cycle_idx" ON "pages_blocks_carousel" USING btree ("event_cycle_id");
  CREATE INDEX "_pages_v_blocks_carousel_items_order_idx" ON "_pages_v_blocks_carousel_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_carousel_items_parent_id_idx" ON "_pages_v_blocks_carousel_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_carousel_sources_order_idx" ON "_pages_v_blocks_carousel_sources" USING btree ("order");
  CREATE INDEX "_pages_v_blocks_carousel_sources_parent_idx" ON "_pages_v_blocks_carousel_sources" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_carousel_order_idx" ON "_pages_v_blocks_carousel" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_carousel_parent_id_idx" ON "_pages_v_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_carousel_path_idx" ON "_pages_v_blocks_carousel" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_carousel_surface_image_idx" ON "_pages_v_blocks_carousel" USING btree ("surface_image_id");
  CREATE INDEX "_pages_v_blocks_carousel_parent_page_idx" ON "_pages_v_blocks_carousel" USING btree ("parent_page_id");
  CREATE INDEX "_pages_v_blocks_carousel_category_idx" ON "_pages_v_blocks_carousel" USING btree ("category_id");
  CREATE INDEX "_pages_v_blocks_carousel_tag_idx" ON "_pages_v_blocks_carousel" USING btree ("tag_id");
  CREATE INDEX "_pages_v_blocks_carousel_event_cycle_idx" ON "_pages_v_blocks_carousel" USING btree ("event_cycle_id");
  CREATE INDEX "posts_blocks_carousel_items_order_idx" ON "posts_blocks_carousel_items" USING btree ("_order");
  CREATE INDEX "posts_blocks_carousel_items_parent_id_idx" ON "posts_blocks_carousel_items" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_carousel_sources_order_idx" ON "posts_blocks_carousel_sources" USING btree ("order");
  CREATE INDEX "posts_blocks_carousel_sources_parent_idx" ON "posts_blocks_carousel_sources" USING btree ("parent_id");
  CREATE INDEX "posts_blocks_carousel_order_idx" ON "posts_blocks_carousel" USING btree ("_order");
  CREATE INDEX "posts_blocks_carousel_parent_id_idx" ON "posts_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_carousel_path_idx" ON "posts_blocks_carousel" USING btree ("_path");
  CREATE INDEX "posts_blocks_carousel_surface_image_idx" ON "posts_blocks_carousel" USING btree ("surface_image_id");
  CREATE INDEX "posts_blocks_carousel_parent_page_idx" ON "posts_blocks_carousel" USING btree ("parent_page_id");
  CREATE INDEX "posts_blocks_carousel_category_idx" ON "posts_blocks_carousel" USING btree ("category_id");
  CREATE INDEX "posts_blocks_carousel_tag_idx" ON "posts_blocks_carousel" USING btree ("tag_id");
  CREATE INDEX "posts_blocks_carousel_event_cycle_idx" ON "posts_blocks_carousel" USING btree ("event_cycle_id");
  CREATE INDEX "_posts_v_blocks_carousel_items_order_idx" ON "_posts_v_blocks_carousel_items" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_carousel_items_parent_id_idx" ON "_posts_v_blocks_carousel_items" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_carousel_sources_order_idx" ON "_posts_v_blocks_carousel_sources" USING btree ("order");
  CREATE INDEX "_posts_v_blocks_carousel_sources_parent_idx" ON "_posts_v_blocks_carousel_sources" USING btree ("parent_id");
  CREATE INDEX "_posts_v_blocks_carousel_order_idx" ON "_posts_v_blocks_carousel" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_carousel_parent_id_idx" ON "_posts_v_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_carousel_path_idx" ON "_posts_v_blocks_carousel" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_carousel_surface_image_idx" ON "_posts_v_blocks_carousel" USING btree ("surface_image_id");
  CREATE INDEX "_posts_v_blocks_carousel_parent_page_idx" ON "_posts_v_blocks_carousel" USING btree ("parent_page_id");
  CREATE INDEX "_posts_v_blocks_carousel_category_idx" ON "_posts_v_blocks_carousel" USING btree ("category_id");
  CREATE INDEX "_posts_v_blocks_carousel_tag_idx" ON "_posts_v_blocks_carousel" USING btree ("tag_id");
  CREATE INDEX "_posts_v_blocks_carousel_event_cycle_idx" ON "_posts_v_blocks_carousel" USING btree ("event_cycle_id");
  CREATE INDEX "events_blocks_carousel_items_order_idx" ON "events_blocks_carousel_items" USING btree ("_order");
  CREATE INDEX "events_blocks_carousel_items_parent_id_idx" ON "events_blocks_carousel_items" USING btree ("_parent_id");
  CREATE INDEX "events_blocks_carousel_sources_order_idx" ON "events_blocks_carousel_sources" USING btree ("order");
  CREATE INDEX "events_blocks_carousel_sources_parent_idx" ON "events_blocks_carousel_sources" USING btree ("parent_id");
  CREATE INDEX "events_blocks_carousel_order_idx" ON "events_blocks_carousel" USING btree ("_order");
  CREATE INDEX "events_blocks_carousel_parent_id_idx" ON "events_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "events_blocks_carousel_path_idx" ON "events_blocks_carousel" USING btree ("_path");
  CREATE INDEX "events_blocks_carousel_surface_image_idx" ON "events_blocks_carousel" USING btree ("surface_image_id");
  CREATE INDEX "events_blocks_carousel_parent_page_idx" ON "events_blocks_carousel" USING btree ("parent_page_id");
  CREATE INDEX "events_blocks_carousel_category_idx" ON "events_blocks_carousel" USING btree ("category_id");
  CREATE INDEX "events_blocks_carousel_tag_idx" ON "events_blocks_carousel" USING btree ("tag_id");
  CREATE INDEX "events_blocks_carousel_event_cycle_idx" ON "events_blocks_carousel" USING btree ("event_cycle_id");
  CREATE INDEX "_events_v_blocks_carousel_items_order_idx" ON "_events_v_blocks_carousel_items" USING btree ("_order");
  CREATE INDEX "_events_v_blocks_carousel_items_parent_id_idx" ON "_events_v_blocks_carousel_items" USING btree ("_parent_id");
  CREATE INDEX "_events_v_blocks_carousel_sources_order_idx" ON "_events_v_blocks_carousel_sources" USING btree ("order");
  CREATE INDEX "_events_v_blocks_carousel_sources_parent_idx" ON "_events_v_blocks_carousel_sources" USING btree ("parent_id");
  CREATE INDEX "_events_v_blocks_carousel_order_idx" ON "_events_v_blocks_carousel" USING btree ("_order");
  CREATE INDEX "_events_v_blocks_carousel_parent_id_idx" ON "_events_v_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "_events_v_blocks_carousel_path_idx" ON "_events_v_blocks_carousel" USING btree ("_path");
  CREATE INDEX "_events_v_blocks_carousel_surface_image_idx" ON "_events_v_blocks_carousel" USING btree ("surface_image_id");
  CREATE INDEX "_events_v_blocks_carousel_parent_page_idx" ON "_events_v_blocks_carousel" USING btree ("parent_page_id");
  CREATE INDEX "_events_v_blocks_carousel_category_idx" ON "_events_v_blocks_carousel" USING btree ("category_id");
  CREATE INDEX "_events_v_blocks_carousel_tag_idx" ON "_events_v_blocks_carousel" USING btree ("tag_id");
  CREATE INDEX "_events_v_blocks_carousel_event_cycle_idx" ON "_events_v_blocks_carousel" USING btree ("event_cycle_id");
  CREATE INDEX "event_cycles_blocks_carousel_items_order_idx" ON "event_cycles_blocks_carousel_items" USING btree ("_order");
  CREATE INDEX "event_cycles_blocks_carousel_items_parent_id_idx" ON "event_cycles_blocks_carousel_items" USING btree ("_parent_id");
  CREATE INDEX "event_cycles_blocks_carousel_sources_order_idx" ON "event_cycles_blocks_carousel_sources" USING btree ("order");
  CREATE INDEX "event_cycles_blocks_carousel_sources_parent_idx" ON "event_cycles_blocks_carousel_sources" USING btree ("parent_id");
  CREATE INDEX "event_cycles_blocks_carousel_order_idx" ON "event_cycles_blocks_carousel" USING btree ("_order");
  CREATE INDEX "event_cycles_blocks_carousel_parent_id_idx" ON "event_cycles_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "event_cycles_blocks_carousel_path_idx" ON "event_cycles_blocks_carousel" USING btree ("_path");
  CREATE INDEX "event_cycles_blocks_carousel_surface_image_idx" ON "event_cycles_blocks_carousel" USING btree ("surface_image_id");
  CREATE INDEX "event_cycles_blocks_carousel_parent_page_idx" ON "event_cycles_blocks_carousel" USING btree ("parent_page_id");
  CREATE INDEX "event_cycles_blocks_carousel_category_idx" ON "event_cycles_blocks_carousel" USING btree ("category_id");
  CREATE INDEX "event_cycles_blocks_carousel_tag_idx" ON "event_cycles_blocks_carousel" USING btree ("tag_id");
  CREATE INDEX "event_cycles_blocks_carousel_event_cycle_idx" ON "event_cycles_blocks_carousel" USING btree ("event_cycle_id");
  CREATE INDEX "_event_cycles_v_blocks_carousel_items_order_idx" ON "_event_cycles_v_blocks_carousel_items" USING btree ("_order");
  CREATE INDEX "_event_cycles_v_blocks_carousel_items_parent_id_idx" ON "_event_cycles_v_blocks_carousel_items" USING btree ("_parent_id");
  CREATE INDEX "_event_cycles_v_blocks_carousel_sources_order_idx" ON "_event_cycles_v_blocks_carousel_sources" USING btree ("order");
  CREATE INDEX "_event_cycles_v_blocks_carousel_sources_parent_idx" ON "_event_cycles_v_blocks_carousel_sources" USING btree ("parent_id");
  CREATE INDEX "_event_cycles_v_blocks_carousel_order_idx" ON "_event_cycles_v_blocks_carousel" USING btree ("_order");
  CREATE INDEX "_event_cycles_v_blocks_carousel_parent_id_idx" ON "_event_cycles_v_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "_event_cycles_v_blocks_carousel_path_idx" ON "_event_cycles_v_blocks_carousel" USING btree ("_path");
  CREATE INDEX "_event_cycles_v_blocks_carousel_surface_image_idx" ON "_event_cycles_v_blocks_carousel" USING btree ("surface_image_id");
  CREATE INDEX "_event_cycles_v_blocks_carousel_parent_page_idx" ON "_event_cycles_v_blocks_carousel" USING btree ("parent_page_id");
  CREATE INDEX "_event_cycles_v_blocks_carousel_category_idx" ON "_event_cycles_v_blocks_carousel" USING btree ("category_id");
  CREATE INDEX "_event_cycles_v_blocks_carousel_tag_idx" ON "_event_cycles_v_blocks_carousel" USING btree ("tag_id");
  CREATE INDEX "_event_cycles_v_blocks_carousel_event_cycle_idx" ON "_event_cycles_v_blocks_carousel" USING btree ("event_cycle_id");
  CREATE INDEX "partners_blocks_carousel_items_order_idx" ON "partners_blocks_carousel_items" USING btree ("_order");
  CREATE INDEX "partners_blocks_carousel_items_parent_id_idx" ON "partners_blocks_carousel_items" USING btree ("_parent_id");
  CREATE INDEX "partners_blocks_carousel_sources_order_idx" ON "partners_blocks_carousel_sources" USING btree ("order");
  CREATE INDEX "partners_blocks_carousel_sources_parent_idx" ON "partners_blocks_carousel_sources" USING btree ("parent_id");
  CREATE INDEX "partners_blocks_carousel_order_idx" ON "partners_blocks_carousel" USING btree ("_order");
  CREATE INDEX "partners_blocks_carousel_parent_id_idx" ON "partners_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "partners_blocks_carousel_path_idx" ON "partners_blocks_carousel" USING btree ("_path");
  CREATE INDEX "partners_blocks_carousel_surface_image_idx" ON "partners_blocks_carousel" USING btree ("surface_image_id");
  CREATE INDEX "partners_blocks_carousel_parent_page_idx" ON "partners_blocks_carousel" USING btree ("parent_page_id");
  CREATE INDEX "partners_blocks_carousel_category_idx" ON "partners_blocks_carousel" USING btree ("category_id");
  CREATE INDEX "partners_blocks_carousel_tag_idx" ON "partners_blocks_carousel" USING btree ("tag_id");
  CREATE INDEX "partners_blocks_carousel_event_cycle_idx" ON "partners_blocks_carousel" USING btree ("event_cycle_id");
  CREATE INDEX "_partners_v_blocks_carousel_items_order_idx" ON "_partners_v_blocks_carousel_items" USING btree ("_order");
  CREATE INDEX "_partners_v_blocks_carousel_items_parent_id_idx" ON "_partners_v_blocks_carousel_items" USING btree ("_parent_id");
  CREATE INDEX "_partners_v_blocks_carousel_sources_order_idx" ON "_partners_v_blocks_carousel_sources" USING btree ("order");
  CREATE INDEX "_partners_v_blocks_carousel_sources_parent_idx" ON "_partners_v_blocks_carousel_sources" USING btree ("parent_id");
  CREATE INDEX "_partners_v_blocks_carousel_order_idx" ON "_partners_v_blocks_carousel" USING btree ("_order");
  CREATE INDEX "_partners_v_blocks_carousel_parent_id_idx" ON "_partners_v_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "_partners_v_blocks_carousel_path_idx" ON "_partners_v_blocks_carousel" USING btree ("_path");
  CREATE INDEX "_partners_v_blocks_carousel_surface_image_idx" ON "_partners_v_blocks_carousel" USING btree ("surface_image_id");
  CREATE INDEX "_partners_v_blocks_carousel_parent_page_idx" ON "_partners_v_blocks_carousel" USING btree ("parent_page_id");
  CREATE INDEX "_partners_v_blocks_carousel_category_idx" ON "_partners_v_blocks_carousel" USING btree ("category_id");
  CREATE INDEX "_partners_v_blocks_carousel_tag_idx" ON "_partners_v_blocks_carousel" USING btree ("tag_id");
  CREATE INDEX "_partners_v_blocks_carousel_event_cycle_idx" ON "_partners_v_blocks_carousel" USING btree ("event_cycle_id");
  CREATE INDEX "homepage_sections_blocks_carousel_items_order_idx" ON "homepage_sections_blocks_carousel_items" USING btree ("_order");
  CREATE INDEX "homepage_sections_blocks_carousel_items_parent_id_idx" ON "homepage_sections_blocks_carousel_items" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_blocks_carousel_sources_order_idx" ON "homepage_sections_blocks_carousel_sources" USING btree ("order");
  CREATE INDEX "homepage_sections_blocks_carousel_sources_parent_idx" ON "homepage_sections_blocks_carousel_sources" USING btree ("parent_id");
  CREATE INDEX "homepage_sections_blocks_carousel_order_idx" ON "homepage_sections_blocks_carousel" USING btree ("_order");
  CREATE INDEX "homepage_sections_blocks_carousel_parent_id_idx" ON "homepage_sections_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_blocks_carousel_path_idx" ON "homepage_sections_blocks_carousel" USING btree ("_path");
  CREATE INDEX "homepage_sections_blocks_carousel_surface_image_idx" ON "homepage_sections_blocks_carousel" USING btree ("surface_image_id");
  CREATE INDEX "homepage_sections_blocks_carousel_parent_page_idx" ON "homepage_sections_blocks_carousel" USING btree ("parent_page_id");
  CREATE INDEX "homepage_sections_blocks_carousel_category_idx" ON "homepage_sections_blocks_carousel" USING btree ("category_id");
  CREATE INDEX "homepage_sections_blocks_carousel_tag_idx" ON "homepage_sections_blocks_carousel" USING btree ("tag_id");
  CREATE INDEX "homepage_sections_blocks_carousel_event_cycle_idx" ON "homepage_sections_blocks_carousel" USING btree ("event_cycle_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_carousel_items" CASCADE;
  DROP TABLE "pages_blocks_carousel_sources" CASCADE;
  DROP TABLE "pages_blocks_carousel" CASCADE;
  DROP TABLE "_pages_v_blocks_carousel_items" CASCADE;
  DROP TABLE "_pages_v_blocks_carousel_sources" CASCADE;
  DROP TABLE "_pages_v_blocks_carousel" CASCADE;
  DROP TABLE "posts_blocks_carousel_items" CASCADE;
  DROP TABLE "posts_blocks_carousel_sources" CASCADE;
  DROP TABLE "posts_blocks_carousel" CASCADE;
  DROP TABLE "_posts_v_blocks_carousel_items" CASCADE;
  DROP TABLE "_posts_v_blocks_carousel_sources" CASCADE;
  DROP TABLE "_posts_v_blocks_carousel" CASCADE;
  DROP TABLE "events_blocks_carousel_items" CASCADE;
  DROP TABLE "events_blocks_carousel_sources" CASCADE;
  DROP TABLE "events_blocks_carousel" CASCADE;
  DROP TABLE "_events_v_blocks_carousel_items" CASCADE;
  DROP TABLE "_events_v_blocks_carousel_sources" CASCADE;
  DROP TABLE "_events_v_blocks_carousel" CASCADE;
  DROP TABLE "event_cycles_blocks_carousel_items" CASCADE;
  DROP TABLE "event_cycles_blocks_carousel_sources" CASCADE;
  DROP TABLE "event_cycles_blocks_carousel" CASCADE;
  DROP TABLE "_event_cycles_v_blocks_carousel_items" CASCADE;
  DROP TABLE "_event_cycles_v_blocks_carousel_sources" CASCADE;
  DROP TABLE "_event_cycles_v_blocks_carousel" CASCADE;
  DROP TABLE "partners_blocks_carousel_items" CASCADE;
  DROP TABLE "partners_blocks_carousel_sources" CASCADE;
  DROP TABLE "partners_blocks_carousel" CASCADE;
  DROP TABLE "_partners_v_blocks_carousel_items" CASCADE;
  DROP TABLE "_partners_v_blocks_carousel_sources" CASCADE;
  DROP TABLE "_partners_v_blocks_carousel" CASCADE;
  DROP TABLE "homepage_sections_blocks_carousel_items" CASCADE;
  DROP TABLE "homepage_sections_blocks_carousel_sources" CASCADE;
  DROP TABLE "homepage_sections_blocks_carousel" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_carousel_sources";
  DROP TYPE "public"."enum_pages_blocks_carousel_selection_mode";
  DROP TYPE "public"."enum_pages_blocks_carousel_event_time_filter";
  DROP TYPE "public"."enum_pages_blocks_carousel_sort";
  DROP TYPE "public"."enum_pages_blocks_carousel_parent_filter";
  DROP TYPE "public"."enum__pages_v_blocks_carousel_sources";
  DROP TYPE "public"."enum__pages_v_blocks_carousel_selection_mode";
  DROP TYPE "public"."enum__pages_v_blocks_carousel_event_time_filter";
  DROP TYPE "public"."enum__pages_v_blocks_carousel_sort";
  DROP TYPE "public"."enum__pages_v_blocks_carousel_parent_filter";
  DROP TYPE "public"."enum_posts_blocks_carousel_sources";
  DROP TYPE "public"."enum_posts_blocks_carousel_selection_mode";
  DROP TYPE "public"."enum_posts_blocks_carousel_event_time_filter";
  DROP TYPE "public"."enum_posts_blocks_carousel_sort";
  DROP TYPE "public"."enum_posts_blocks_carousel_parent_filter";
  DROP TYPE "public"."enum__posts_v_blocks_carousel_sources";
  DROP TYPE "public"."enum__posts_v_blocks_carousel_selection_mode";
  DROP TYPE "public"."enum__posts_v_blocks_carousel_event_time_filter";
  DROP TYPE "public"."enum__posts_v_blocks_carousel_sort";
  DROP TYPE "public"."enum__posts_v_blocks_carousel_parent_filter";
  DROP TYPE "public"."enum_events_blocks_carousel_sources";
  DROP TYPE "public"."enum_events_blocks_carousel_selection_mode";
  DROP TYPE "public"."enum_events_blocks_carousel_event_time_filter";
  DROP TYPE "public"."enum_events_blocks_carousel_sort";
  DROP TYPE "public"."enum_events_blocks_carousel_parent_filter";
  DROP TYPE "public"."enum__events_v_blocks_carousel_sources";
  DROP TYPE "public"."enum__events_v_blocks_carousel_selection_mode";
  DROP TYPE "public"."enum__events_v_blocks_carousel_event_time_filter";
  DROP TYPE "public"."enum__events_v_blocks_carousel_sort";
  DROP TYPE "public"."enum__events_v_blocks_carousel_parent_filter";
  DROP TYPE "public"."enum_event_cycles_blocks_carousel_sources";
  DROP TYPE "public"."enum_event_cycles_blocks_carousel_selection_mode";
  DROP TYPE "public"."enum_event_cycles_blocks_carousel_event_time_filter";
  DROP TYPE "public"."enum_event_cycles_blocks_carousel_sort";
  DROP TYPE "public"."enum_event_cycles_blocks_carousel_parent_filter";
  DROP TYPE "public"."enum__event_cycles_v_blocks_carousel_sources";
  DROP TYPE "public"."enum__event_cycles_v_blocks_carousel_selection_mode";
  DROP TYPE "public"."enum__event_cycles_v_blocks_carousel_event_time_filter";
  DROP TYPE "public"."enum__event_cycles_v_blocks_carousel_sort";
  DROP TYPE "public"."enum__event_cycles_v_blocks_carousel_parent_filter";
  DROP TYPE "public"."enum_partners_blocks_carousel_sources";
  DROP TYPE "public"."enum_partners_blocks_carousel_selection_mode";
  DROP TYPE "public"."enum_partners_blocks_carousel_event_time_filter";
  DROP TYPE "public"."enum_partners_blocks_carousel_sort";
  DROP TYPE "public"."enum_partners_blocks_carousel_parent_filter";
  DROP TYPE "public"."enum__partners_v_blocks_carousel_sources";
  DROP TYPE "public"."enum__partners_v_blocks_carousel_selection_mode";
  DROP TYPE "public"."enum__partners_v_blocks_carousel_event_time_filter";
  DROP TYPE "public"."enum__partners_v_blocks_carousel_sort";
  DROP TYPE "public"."enum__partners_v_blocks_carousel_parent_filter";
  DROP TYPE "public"."enum_homepage_sections_blocks_carousel_sources";
  DROP TYPE "public"."enum_homepage_sections_blocks_carousel_selection_mode";
  DROP TYPE "public"."enum_homepage_sections_blocks_carousel_event_time_filter";
  DROP TYPE "public"."enum_homepage_sections_blocks_carousel_sort";
  DROP TYPE "public"."enum_homepage_sections_blocks_carousel_parent_filter";`)
}
