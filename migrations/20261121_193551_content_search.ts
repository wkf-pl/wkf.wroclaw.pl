import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_page_templates_blocks_cs_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents', 'partners', 'locations', 'member-profiles');
  CREATE TYPE "public"."enum_page_templates_blocks_cs_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'relatedTo', 'significantDate');
  CREATE TYPE "public"."enum_page_templates_blocks_cs_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between', 'isEmpty');
  CREATE TYPE "public"."enum_page_templates_blocks_cs_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum_page_templates_blocks_cs_view" AS ENUM('tiles', 'cards', 'carousel', 'compact', 'grid');
  CREATE TYPE "public"."enum__page_templates_blocks_cs_v_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents', 'partners', 'locations', 'member-profiles');
  CREATE TYPE "public"."enum__page_templates_blocks_cs_v_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'relatedTo', 'significantDate');
  CREATE TYPE "public"."enum__page_templates_blocks_cs_v_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between', 'isEmpty');
  CREATE TYPE "public"."enum__page_templates_blocks_cs_v_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum__page_templates_blocks_cs_v_view" AS ENUM('tiles', 'cards', 'carousel', 'compact', 'grid');
  CREATE TYPE "public"."enum_pages_blocks_cs_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents', 'partners', 'locations', 'member-profiles');
  CREATE TYPE "public"."enum_pages_blocks_cs_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'relatedTo', 'significantDate');
  CREATE TYPE "public"."enum_pages_blocks_cs_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between', 'isEmpty');
  CREATE TYPE "public"."enum_pages_blocks_cs_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum_pages_blocks_cs_view" AS ENUM('tiles', 'cards', 'carousel', 'compact', 'grid');
  CREATE TYPE "public"."enum__pages_blocks_cs_v_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents', 'partners', 'locations', 'member-profiles');
  CREATE TYPE "public"."enum__pages_blocks_cs_v_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'relatedTo', 'significantDate');
  CREATE TYPE "public"."enum__pages_blocks_cs_v_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between', 'isEmpty');
  CREATE TYPE "public"."enum__pages_blocks_cs_v_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum__pages_blocks_cs_v_view" AS ENUM('tiles', 'cards', 'carousel', 'compact', 'grid');
  CREATE TYPE "public"."enum_posts_blocks_cs_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents', 'partners', 'locations', 'member-profiles');
  CREATE TYPE "public"."enum_posts_blocks_cs_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'relatedTo', 'significantDate');
  CREATE TYPE "public"."enum_posts_blocks_cs_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between', 'isEmpty');
  CREATE TYPE "public"."enum_posts_blocks_cs_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum_posts_blocks_cs_view" AS ENUM('tiles', 'cards', 'carousel', 'compact', 'grid');
  CREATE TYPE "public"."enum__posts_blocks_cs_v_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents', 'partners', 'locations', 'member-profiles');
  CREATE TYPE "public"."enum__posts_blocks_cs_v_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'relatedTo', 'significantDate');
  CREATE TYPE "public"."enum__posts_blocks_cs_v_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between', 'isEmpty');
  CREATE TYPE "public"."enum__posts_blocks_cs_v_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum__posts_blocks_cs_v_view" AS ENUM('tiles', 'cards', 'carousel', 'compact', 'grid');
  CREATE TYPE "public"."enum_events_blocks_cs_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents', 'partners', 'locations', 'member-profiles');
  CREATE TYPE "public"."enum_events_blocks_cs_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'relatedTo', 'significantDate');
  CREATE TYPE "public"."enum_events_blocks_cs_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between', 'isEmpty');
  CREATE TYPE "public"."enum_events_blocks_cs_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum_events_blocks_cs_view" AS ENUM('tiles', 'cards', 'carousel', 'compact', 'grid');
  CREATE TYPE "public"."enum__events_blocks_cs_v_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents', 'partners', 'locations', 'member-profiles');
  CREATE TYPE "public"."enum__events_blocks_cs_v_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'relatedTo', 'significantDate');
  CREATE TYPE "public"."enum__events_blocks_cs_v_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between', 'isEmpty');
  CREATE TYPE "public"."enum__events_blocks_cs_v_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum__events_blocks_cs_v_view" AS ENUM('tiles', 'cards', 'carousel', 'compact', 'grid');
  CREATE TYPE "public"."enum_event_cycles_blocks_cs_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents', 'partners', 'locations', 'member-profiles');
  CREATE TYPE "public"."enum_event_cycles_blocks_cs_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'relatedTo', 'significantDate');
  CREATE TYPE "public"."enum_event_cycles_blocks_cs_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between', 'isEmpty');
  CREATE TYPE "public"."enum_event_cycles_blocks_cs_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum_event_cycles_blocks_cs_view" AS ENUM('tiles', 'cards', 'carousel', 'compact', 'grid');
  CREATE TYPE "public"."enum__event_cycles_blocks_cs_v_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents', 'partners', 'locations', 'member-profiles');
  CREATE TYPE "public"."enum__event_cycles_blocks_cs_v_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'relatedTo', 'significantDate');
  CREATE TYPE "public"."enum__event_cycles_blocks_cs_v_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between', 'isEmpty');
  CREATE TYPE "public"."enum__event_cycles_blocks_cs_v_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum__event_cycles_blocks_cs_v_view" AS ENUM('tiles', 'cards', 'carousel', 'compact', 'grid');
  CREATE TYPE "public"."enum_partners_blocks_cs_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents', 'partners', 'locations', 'member-profiles');
  CREATE TYPE "public"."enum_partners_blocks_cs_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'relatedTo', 'significantDate');
  CREATE TYPE "public"."enum_partners_blocks_cs_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between', 'isEmpty');
  CREATE TYPE "public"."enum_partners_blocks_cs_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum_partners_blocks_cs_view" AS ENUM('tiles', 'cards', 'carousel', 'compact', 'grid');
  CREATE TYPE "public"."enum__partners_blocks_cs_v_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents', 'partners', 'locations', 'member-profiles');
  CREATE TYPE "public"."enum__partners_blocks_cs_v_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'relatedTo', 'significantDate');
  CREATE TYPE "public"."enum__partners_blocks_cs_v_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between', 'isEmpty');
  CREATE TYPE "public"."enum__partners_blocks_cs_v_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum__partners_blocks_cs_v_view" AS ENUM('tiles', 'cards', 'carousel', 'compact', 'grid');
  CREATE TYPE "public"."enum_homepage_sections_blocks_cs_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents', 'partners', 'locations', 'member-profiles');
  CREATE TYPE "public"."enum_homepage_sections_blocks_cs_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'relatedTo', 'significantDate');
  CREATE TYPE "public"."enum_homepage_sections_blocks_cs_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between', 'isEmpty');
  CREATE TYPE "public"."enum_homepage_sections_blocks_cs_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum_homepage_sections_blocks_cs_view" AS ENUM('tiles', 'cards', 'carousel', 'compact', 'grid');
  CREATE TYPE "public"."enum__homepage_sections_blocks_cs_v_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents', 'partners', 'locations', 'member-profiles');
  CREATE TYPE "public"."enum__homepage_sections_blocks_cs_v_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'relatedTo', 'significantDate');
  CREATE TYPE "public"."enum__homepage_sections_blocks_cs_v_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between', 'isEmpty');
  CREATE TYPE "public"."enum__homepage_sections_blocks_cs_v_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum__homepage_sections_blocks_cs_v_view" AS ENUM('tiles', 'cards', 'carousel', 'compact', 'grid');
  CREATE TABLE "page_templates_blocks_cs_sources" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_page_templates_blocks_cs_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "page_templates_blocks_cs_conditions" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field" "enum_page_templates_blocks_cs_conditions_field",
  	"operator" "enum_page_templates_blocks_cs_conditions_operator",
  	"related_target_mode" "related_mode" DEFAULT 'current',
  	"text_value" varchar,
  	"number_value" numeric,
  	"event_time_value" "event_time",
  	"date_value" varchar,
  	"end_date_value" varchar
  );
  
  CREATE TABLE "page_templates_blocks_cs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"include_inactive_locations" boolean DEFAULT false,
  	"sort" "enum_page_templates_blocks_cs_sort" DEFAULT 'newest',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"hide_when_empty" boolean DEFAULT false,
  	"empty_message" varchar,
  	"filter_phrase" boolean DEFAULT true,
  	"filter_date" boolean DEFAULT true,
  	"filter_tags" boolean DEFAULT true,
  	"filter_category" boolean DEFAULT true,
  	"filter_author" boolean DEFAULT true,
  	"filter_content_type" boolean DEFAULT true,
  	"view" "enum_page_templates_blocks_cs_view" DEFAULT 'cards',
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"appearance" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "_page_templates_blocks_cs_v_sources" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__page_templates_blocks_cs_v_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_page_templates_blocks_cs_v_conditions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"field" "enum__page_templates_blocks_cs_v_conditions_field",
  	"operator" "enum__page_templates_blocks_cs_v_conditions_operator",
  	"related_target_mode" "related_mode" DEFAULT 'current',
  	"text_value" varchar,
  	"number_value" numeric,
  	"event_time_value" "event_time",
  	"date_value" varchar,
  	"end_date_value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_page_templates_blocks_cs_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"include_inactive_locations" boolean DEFAULT false,
  	"sort" "enum__page_templates_blocks_cs_v_sort" DEFAULT 'newest',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"hide_when_empty" boolean DEFAULT false,
  	"empty_message" varchar,
  	"filter_phrase" boolean DEFAULT true,
  	"filter_date" boolean DEFAULT true,
  	"filter_tags" boolean DEFAULT true,
  	"filter_category" boolean DEFAULT true,
  	"filter_author" boolean DEFAULT true,
  	"filter_content_type" boolean DEFAULT true,
  	"view" "enum__page_templates_blocks_cs_v_view" DEFAULT 'cards',
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"appearance" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cs_sources" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_pages_blocks_cs_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_cs_conditions" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field" "enum_pages_blocks_cs_conditions_field",
  	"operator" "enum_pages_blocks_cs_conditions_operator",
  	"related_target_mode" "related_mode" DEFAULT 'current',
  	"text_value" varchar,
  	"number_value" numeric,
  	"event_time_value" "event_time",
  	"date_value" varchar,
  	"end_date_value" varchar
  );
  
  CREATE TABLE "pages_blocks_cs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"include_inactive_locations" boolean DEFAULT false,
  	"sort" "enum_pages_blocks_cs_sort" DEFAULT 'newest',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"hide_when_empty" boolean DEFAULT false,
  	"empty_message" varchar,
  	"filter_phrase" boolean DEFAULT true,
  	"filter_date" boolean DEFAULT true,
  	"filter_tags" boolean DEFAULT true,
  	"filter_category" boolean DEFAULT true,
  	"filter_author" boolean DEFAULT true,
  	"filter_content_type" boolean DEFAULT true,
  	"view" "enum_pages_blocks_cs_view" DEFAULT 'cards',
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"appearance" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_blocks_cs_v_sources" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__pages_blocks_cs_v_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_blocks_cs_v_conditions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"field" "enum__pages_blocks_cs_v_conditions_field",
  	"operator" "enum__pages_blocks_cs_v_conditions_operator",
  	"related_target_mode" "related_mode" DEFAULT 'current',
  	"text_value" varchar,
  	"number_value" numeric,
  	"event_time_value" "event_time",
  	"date_value" varchar,
  	"end_date_value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_blocks_cs_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"include_inactive_locations" boolean DEFAULT false,
  	"sort" "enum__pages_blocks_cs_v_sort" DEFAULT 'newest',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"hide_when_empty" boolean DEFAULT false,
  	"empty_message" varchar,
  	"filter_phrase" boolean DEFAULT true,
  	"filter_date" boolean DEFAULT true,
  	"filter_tags" boolean DEFAULT true,
  	"filter_category" boolean DEFAULT true,
  	"filter_author" boolean DEFAULT true,
  	"filter_content_type" boolean DEFAULT true,
  	"view" "enum__pages_blocks_cs_v_view" DEFAULT 'cards',
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"appearance" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_cs_sources" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_posts_blocks_cs_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "posts_blocks_cs_conditions" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field" "enum_posts_blocks_cs_conditions_field",
  	"operator" "enum_posts_blocks_cs_conditions_operator",
  	"related_target_mode" "related_mode" DEFAULT 'current',
  	"text_value" varchar,
  	"number_value" numeric,
  	"event_time_value" "event_time",
  	"date_value" varchar,
  	"end_date_value" varchar
  );
  
  CREATE TABLE "posts_blocks_cs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"include_inactive_locations" boolean DEFAULT false,
  	"sort" "enum_posts_blocks_cs_sort" DEFAULT 'newest',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"hide_when_empty" boolean DEFAULT false,
  	"empty_message" varchar,
  	"filter_phrase" boolean DEFAULT true,
  	"filter_date" boolean DEFAULT true,
  	"filter_tags" boolean DEFAULT true,
  	"filter_category" boolean DEFAULT true,
  	"filter_author" boolean DEFAULT true,
  	"filter_content_type" boolean DEFAULT true,
  	"view" "enum_posts_blocks_cs_view" DEFAULT 'cards',
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"appearance" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_blocks_cs_v_sources" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__posts_blocks_cs_v_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_posts_blocks_cs_v_conditions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"field" "enum__posts_blocks_cs_v_conditions_field",
  	"operator" "enum__posts_blocks_cs_v_conditions_operator",
  	"related_target_mode" "related_mode" DEFAULT 'current',
  	"text_value" varchar,
  	"number_value" numeric,
  	"event_time_value" "event_time",
  	"date_value" varchar,
  	"end_date_value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_blocks_cs_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"include_inactive_locations" boolean DEFAULT false,
  	"sort" "enum__posts_blocks_cs_v_sort" DEFAULT 'newest',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"hide_when_empty" boolean DEFAULT false,
  	"empty_message" varchar,
  	"filter_phrase" boolean DEFAULT true,
  	"filter_date" boolean DEFAULT true,
  	"filter_tags" boolean DEFAULT true,
  	"filter_category" boolean DEFAULT true,
  	"filter_author" boolean DEFAULT true,
  	"filter_content_type" boolean DEFAULT true,
  	"view" "enum__posts_blocks_cs_v_view" DEFAULT 'cards',
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"appearance" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "events_blocks_cs_sources" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_events_blocks_cs_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "events_blocks_cs_conditions" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field" "enum_events_blocks_cs_conditions_field",
  	"operator" "enum_events_blocks_cs_conditions_operator",
  	"related_target_mode" "related_mode" DEFAULT 'current',
  	"text_value" varchar,
  	"number_value" numeric,
  	"event_time_value" "event_time",
  	"date_value" varchar,
  	"end_date_value" varchar
  );
  
  CREATE TABLE "events_blocks_cs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"include_inactive_locations" boolean DEFAULT false,
  	"sort" "enum_events_blocks_cs_sort" DEFAULT 'newest',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"hide_when_empty" boolean DEFAULT false,
  	"empty_message" varchar,
  	"filter_phrase" boolean DEFAULT true,
  	"filter_date" boolean DEFAULT true,
  	"filter_tags" boolean DEFAULT true,
  	"filter_category" boolean DEFAULT true,
  	"filter_author" boolean DEFAULT true,
  	"filter_content_type" boolean DEFAULT true,
  	"view" "enum_events_blocks_cs_view" DEFAULT 'cards',
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"appearance" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "_events_blocks_cs_v_sources" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__events_blocks_cs_v_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_events_blocks_cs_v_conditions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"field" "enum__events_blocks_cs_v_conditions_field",
  	"operator" "enum__events_blocks_cs_v_conditions_operator",
  	"related_target_mode" "related_mode" DEFAULT 'current',
  	"text_value" varchar,
  	"number_value" numeric,
  	"event_time_value" "event_time",
  	"date_value" varchar,
  	"end_date_value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_events_blocks_cs_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"include_inactive_locations" boolean DEFAULT false,
  	"sort" "enum__events_blocks_cs_v_sort" DEFAULT 'newest',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"hide_when_empty" boolean DEFAULT false,
  	"empty_message" varchar,
  	"filter_phrase" boolean DEFAULT true,
  	"filter_date" boolean DEFAULT true,
  	"filter_tags" boolean DEFAULT true,
  	"filter_category" boolean DEFAULT true,
  	"filter_author" boolean DEFAULT true,
  	"filter_content_type" boolean DEFAULT true,
  	"view" "enum__events_blocks_cs_v_view" DEFAULT 'cards',
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"appearance" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "event_cycles_blocks_cs_sources" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_event_cycles_blocks_cs_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "event_cycles_blocks_cs_conditions" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field" "enum_event_cycles_blocks_cs_conditions_field",
  	"operator" "enum_event_cycles_blocks_cs_conditions_operator",
  	"related_target_mode" "related_mode" DEFAULT 'current',
  	"text_value" varchar,
  	"number_value" numeric,
  	"event_time_value" "event_time",
  	"date_value" varchar,
  	"end_date_value" varchar
  );
  
  CREATE TABLE "event_cycles_blocks_cs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"include_inactive_locations" boolean DEFAULT false,
  	"sort" "enum_event_cycles_blocks_cs_sort" DEFAULT 'newest',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"hide_when_empty" boolean DEFAULT false,
  	"empty_message" varchar,
  	"filter_phrase" boolean DEFAULT true,
  	"filter_date" boolean DEFAULT true,
  	"filter_tags" boolean DEFAULT true,
  	"filter_category" boolean DEFAULT true,
  	"filter_author" boolean DEFAULT true,
  	"filter_content_type" boolean DEFAULT true,
  	"view" "enum_event_cycles_blocks_cs_view" DEFAULT 'cards',
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"appearance" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "_event_cycles_blocks_cs_v_sources" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__event_cycles_blocks_cs_v_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_event_cycles_blocks_cs_v_conditions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"field" "enum__event_cycles_blocks_cs_v_conditions_field",
  	"operator" "enum__event_cycles_blocks_cs_v_conditions_operator",
  	"related_target_mode" "related_mode" DEFAULT 'current',
  	"text_value" varchar,
  	"number_value" numeric,
  	"event_time_value" "event_time",
  	"date_value" varchar,
  	"end_date_value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_event_cycles_blocks_cs_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"include_inactive_locations" boolean DEFAULT false,
  	"sort" "enum__event_cycles_blocks_cs_v_sort" DEFAULT 'newest',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"hide_when_empty" boolean DEFAULT false,
  	"empty_message" varchar,
  	"filter_phrase" boolean DEFAULT true,
  	"filter_date" boolean DEFAULT true,
  	"filter_tags" boolean DEFAULT true,
  	"filter_category" boolean DEFAULT true,
  	"filter_author" boolean DEFAULT true,
  	"filter_content_type" boolean DEFAULT true,
  	"view" "enum__event_cycles_blocks_cs_v_view" DEFAULT 'cards',
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"appearance" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "partners_blocks_cs_sources" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_partners_blocks_cs_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "partners_blocks_cs_conditions" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field" "enum_partners_blocks_cs_conditions_field",
  	"operator" "enum_partners_blocks_cs_conditions_operator",
  	"related_target_mode" "related_mode" DEFAULT 'current',
  	"text_value" varchar,
  	"number_value" numeric,
  	"event_time_value" "event_time",
  	"date_value" varchar,
  	"end_date_value" varchar
  );
  
  CREATE TABLE "partners_blocks_cs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"include_inactive_locations" boolean DEFAULT false,
  	"sort" "enum_partners_blocks_cs_sort" DEFAULT 'newest',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"hide_when_empty" boolean DEFAULT false,
  	"empty_message" varchar,
  	"filter_phrase" boolean DEFAULT true,
  	"filter_date" boolean DEFAULT true,
  	"filter_tags" boolean DEFAULT true,
  	"filter_category" boolean DEFAULT true,
  	"filter_author" boolean DEFAULT true,
  	"filter_content_type" boolean DEFAULT true,
  	"view" "enum_partners_blocks_cs_view" DEFAULT 'cards',
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"appearance" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "_partners_blocks_cs_v_sources" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__partners_blocks_cs_v_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_partners_blocks_cs_v_conditions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"field" "enum__partners_blocks_cs_v_conditions_field",
  	"operator" "enum__partners_blocks_cs_v_conditions_operator",
  	"related_target_mode" "related_mode" DEFAULT 'current',
  	"text_value" varchar,
  	"number_value" numeric,
  	"event_time_value" "event_time",
  	"date_value" varchar,
  	"end_date_value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_partners_blocks_cs_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"include_inactive_locations" boolean DEFAULT false,
  	"sort" "enum__partners_blocks_cs_v_sort" DEFAULT 'newest',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"hide_when_empty" boolean DEFAULT false,
  	"empty_message" varchar,
  	"filter_phrase" boolean DEFAULT true,
  	"filter_date" boolean DEFAULT true,
  	"filter_tags" boolean DEFAULT true,
  	"filter_category" boolean DEFAULT true,
  	"filter_author" boolean DEFAULT true,
  	"filter_content_type" boolean DEFAULT true,
  	"view" "enum__partners_blocks_cs_v_view" DEFAULT 'cards',
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"appearance" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_sections_blocks_cs_sources" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_homepage_sections_blocks_cs_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "homepage_sections_blocks_cs_conditions" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field" "enum_homepage_sections_blocks_cs_conditions_field",
  	"operator" "enum_homepage_sections_blocks_cs_conditions_operator",
  	"related_target_mode" "related_mode" DEFAULT 'current',
  	"text_value" varchar,
  	"number_value" numeric,
  	"event_time_value" "event_time",
  	"date_value" varchar,
  	"end_date_value" varchar
  );
  
  CREATE TABLE "homepage_sections_blocks_cs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"include_inactive_locations" boolean DEFAULT false,
  	"sort" "enum_homepage_sections_blocks_cs_sort" DEFAULT 'newest',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"hide_when_empty" boolean DEFAULT false,
  	"empty_message" varchar,
  	"filter_phrase" boolean DEFAULT true,
  	"filter_date" boolean DEFAULT true,
  	"filter_tags" boolean DEFAULT true,
  	"filter_category" boolean DEFAULT true,
  	"filter_author" boolean DEFAULT true,
  	"filter_content_type" boolean DEFAULT true,
  	"view" "enum_homepage_sections_blocks_cs_view" DEFAULT 'cards',
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"appearance" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_sections_blocks_cs_v_sources" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__homepage_sections_blocks_cs_v_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_homepage_sections_blocks_cs_v_conditions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"field" "enum__homepage_sections_blocks_cs_v_conditions_field",
  	"operator" "enum__homepage_sections_blocks_cs_v_conditions_operator",
  	"related_target_mode" "related_mode" DEFAULT 'current',
  	"text_value" varchar,
  	"number_value" numeric,
  	"event_time_value" "event_time",
  	"date_value" varchar,
  	"end_date_value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_sections_blocks_cs_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"include_inactive_locations" boolean DEFAULT false,
  	"sort" "enum__homepage_sections_blocks_cs_v_sort" DEFAULT 'newest',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"hide_when_empty" boolean DEFAULT false,
  	"empty_message" varchar,
  	"filter_phrase" boolean DEFAULT true,
  	"filter_date" boolean DEFAULT true,
  	"filter_tags" boolean DEFAULT true,
  	"filter_category" boolean DEFAULT true,
  	"filter_author" boolean DEFAULT true,
  	"filter_content_type" boolean DEFAULT true,
  	"view" "enum__homepage_sections_blocks_cs_v_view" DEFAULT 'cards',
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"appearance" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "content_listing_items" ADD COLUMN "search_date" timestamp(3) with time zone;
  ALTER TABLE "content_listing_items" ADD COLUMN "search_author_signature" varchar;
  ALTER TABLE "content_listing_items" ADD COLUMN "search_author_group_id" integer;
  ALTER TABLE "pages" ADD COLUMN "public_author_signature" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_public_author_signature" varchar;
  ALTER TABLE "posts" ADD COLUMN "public_author_signature" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_public_author_signature" varchar;
  ALTER TABLE "events" ADD COLUMN "public_author_signature" varchar;
  ALTER TABLE "_events_v" ADD COLUMN "version_public_author_signature" varchar;
  ALTER TABLE "event_cycles" ADD COLUMN "public_author_signature" varchar;
  ALTER TABLE "_event_cycles_v" ADD COLUMN "version_public_author_signature" varchar;
  ALTER TABLE "documents" ADD COLUMN "public_author_signature" varchar;
  ALTER TABLE "_documents_v" ADD COLUMN "version_public_author_signature" varchar;
  ALTER TABLE "partners" ADD COLUMN "public_author_signature" varchar;
  ALTER TABLE "_partners_v" ADD COLUMN "version_public_author_signature" varchar;
  ALTER TABLE "page_templates_blocks_cs_sources" ADD CONSTRAINT "page_templates_blocks_cs_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."page_templates_blocks_cs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_cs_conditions" ADD CONSTRAINT "page_templates_blocks_cs_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates_blocks_cs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_cs" ADD CONSTRAINT "page_templates_blocks_cs_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_cs" ADD CONSTRAINT "page_templates_blocks_cs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_blocks_cs_v_sources" ADD CONSTRAINT "_page_templates_blocks_cs_v_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_page_templates_blocks_cs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_blocks_cs_v_conditions" ADD CONSTRAINT "_page_templates_blocks_cs_v_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_templates_blocks_cs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_blocks_cs_v" ADD CONSTRAINT "_page_templates_blocks_cs_v_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_blocks_cs_v" ADD CONSTRAINT "_page_templates_blocks_cs_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_templates_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cs_sources" ADD CONSTRAINT "pages_blocks_cs_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_cs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cs_conditions" ADD CONSTRAINT "pages_blocks_cs_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cs" ADD CONSTRAINT "pages_blocks_cs_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_cs" ADD CONSTRAINT "pages_blocks_cs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_blocks_cs_v_sources" ADD CONSTRAINT "_pages_blocks_cs_v_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_blocks_cs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_blocks_cs_v_conditions" ADD CONSTRAINT "_pages_blocks_cs_v_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_blocks_cs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_blocks_cs_v" ADD CONSTRAINT "_pages_blocks_cs_v_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_blocks_cs_v" ADD CONSTRAINT "_pages_blocks_cs_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_cs_sources" ADD CONSTRAINT "posts_blocks_cs_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts_blocks_cs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_cs_conditions" ADD CONSTRAINT "posts_blocks_cs_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_cs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_cs" ADD CONSTRAINT "posts_blocks_cs_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_cs" ADD CONSTRAINT "posts_blocks_cs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_blocks_cs_v_sources" ADD CONSTRAINT "_posts_blocks_cs_v_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_blocks_cs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_blocks_cs_v_conditions" ADD CONSTRAINT "_posts_blocks_cs_v_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_blocks_cs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_blocks_cs_v" ADD CONSTRAINT "_posts_blocks_cs_v_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_blocks_cs_v" ADD CONSTRAINT "_posts_blocks_cs_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_blocks_cs_sources" ADD CONSTRAINT "events_blocks_cs_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events_blocks_cs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_blocks_cs_conditions" ADD CONSTRAINT "events_blocks_cs_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events_blocks_cs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_blocks_cs" ADD CONSTRAINT "events_blocks_cs_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_cs" ADD CONSTRAINT "events_blocks_cs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_blocks_cs_v_sources" ADD CONSTRAINT "_events_blocks_cs_v_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_events_blocks_cs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_blocks_cs_v_conditions" ADD CONSTRAINT "_events_blocks_cs_v_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_blocks_cs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_blocks_cs_v" ADD CONSTRAINT "_events_blocks_cs_v_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_blocks_cs_v" ADD CONSTRAINT "_events_blocks_cs_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_cs_sources" ADD CONSTRAINT "event_cycles_blocks_cs_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."event_cycles_blocks_cs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_cs_conditions" ADD CONSTRAINT "event_cycles_blocks_cs_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_cycles_blocks_cs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_cs" ADD CONSTRAINT "event_cycles_blocks_cs_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_cs" ADD CONSTRAINT "event_cycles_blocks_cs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_cycles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_blocks_cs_v_sources" ADD CONSTRAINT "_event_cycles_blocks_cs_v_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_event_cycles_blocks_cs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_blocks_cs_v_conditions" ADD CONSTRAINT "_event_cycles_blocks_cs_v_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_event_cycles_blocks_cs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_blocks_cs_v" ADD CONSTRAINT "_event_cycles_blocks_cs_v_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_blocks_cs_v" ADD CONSTRAINT "_event_cycles_blocks_cs_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_event_cycles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_blocks_cs_sources" ADD CONSTRAINT "partners_blocks_cs_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."partners_blocks_cs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_blocks_cs_conditions" ADD CONSTRAINT "partners_blocks_cs_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners_blocks_cs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_blocks_cs" ADD CONSTRAINT "partners_blocks_cs_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_cs" ADD CONSTRAINT "partners_blocks_cs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_blocks_cs_v_sources" ADD CONSTRAINT "_partners_blocks_cs_v_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_partners_blocks_cs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_blocks_cs_v_conditions" ADD CONSTRAINT "_partners_blocks_cs_v_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partners_blocks_cs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_blocks_cs_v" ADD CONSTRAINT "_partners_blocks_cs_v_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_blocks_cs_v" ADD CONSTRAINT "_partners_blocks_cs_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partners_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_cs_sources" ADD CONSTRAINT "homepage_sections_blocks_cs_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage_sections_blocks_cs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_cs_conditions" ADD CONSTRAINT "homepage_sections_blocks_cs_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections_blocks_cs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_cs" ADD CONSTRAINT "homepage_sections_blocks_cs_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_cs" ADD CONSTRAINT "homepage_sections_blocks_cs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_blocks_cs_v_sources" ADD CONSTRAINT "_homepage_sections_blocks_cs_v_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_homepage_sections_blocks_cs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_blocks_cs_v_conditions" ADD CONSTRAINT "_homepage_sections_blocks_cs_v_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_sections_blocks_cs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_blocks_cs_v" ADD CONSTRAINT "_homepage_sections_blocks_cs_v_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_blocks_cs_v" ADD CONSTRAINT "_homepage_sections_blocks_cs_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_sections_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "page_templates_blocks_cs_sources_order_idx" ON "page_templates_blocks_cs_sources" USING btree ("order");
  CREATE INDEX "page_templates_blocks_cs_sources_parent_idx" ON "page_templates_blocks_cs_sources" USING btree ("parent_id");
  CREATE INDEX "page_templates_blocks_cs_conditions_order_idx" ON "page_templates_blocks_cs_conditions" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_cs_conditions_parent_id_idx" ON "page_templates_blocks_cs_conditions" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_cs_order_idx" ON "page_templates_blocks_cs" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_cs_parent_id_idx" ON "page_templates_blocks_cs" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_cs_path_idx" ON "page_templates_blocks_cs" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_cs_surface_image_idx" ON "page_templates_blocks_cs" USING btree ("surface_image_id");
  CREATE INDEX "_page_templates_blocks_cs_v_sources_order_idx" ON "_page_templates_blocks_cs_v_sources" USING btree ("order");
  CREATE INDEX "_page_templates_blocks_cs_v_sources_parent_idx" ON "_page_templates_blocks_cs_v_sources" USING btree ("parent_id");
  CREATE INDEX "_page_templates_blocks_cs_v_conditions_order_idx" ON "_page_templates_blocks_cs_v_conditions" USING btree ("_order");
  CREATE INDEX "_page_templates_blocks_cs_v_conditions_parent_id_idx" ON "_page_templates_blocks_cs_v_conditions" USING btree ("_parent_id");
  CREATE INDEX "_page_templates_blocks_cs_v_order_idx" ON "_page_templates_blocks_cs_v" USING btree ("_order");
  CREATE INDEX "_page_templates_blocks_cs_v_parent_id_idx" ON "_page_templates_blocks_cs_v" USING btree ("_parent_id");
  CREATE INDEX "_page_templates_blocks_cs_v_path_idx" ON "_page_templates_blocks_cs_v" USING btree ("_path");
  CREATE INDEX "_page_templates_blocks_cs_v_surface_image_idx" ON "_page_templates_blocks_cs_v" USING btree ("surface_image_id");
  CREATE INDEX "pages_blocks_cs_sources_order_idx" ON "pages_blocks_cs_sources" USING btree ("order");
  CREATE INDEX "pages_blocks_cs_sources_parent_idx" ON "pages_blocks_cs_sources" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_cs_conditions_order_idx" ON "pages_blocks_cs_conditions" USING btree ("_order");
  CREATE INDEX "pages_blocks_cs_conditions_parent_id_idx" ON "pages_blocks_cs_conditions" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cs_order_idx" ON "pages_blocks_cs" USING btree ("_order");
  CREATE INDEX "pages_blocks_cs_parent_id_idx" ON "pages_blocks_cs" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cs_path_idx" ON "pages_blocks_cs" USING btree ("_path");
  CREATE INDEX "pages_blocks_cs_surface_image_idx" ON "pages_blocks_cs" USING btree ("surface_image_id");
  CREATE INDEX "_pages_blocks_cs_v_sources_order_idx" ON "_pages_blocks_cs_v_sources" USING btree ("order");
  CREATE INDEX "_pages_blocks_cs_v_sources_parent_idx" ON "_pages_blocks_cs_v_sources" USING btree ("parent_id");
  CREATE INDEX "_pages_blocks_cs_v_conditions_order_idx" ON "_pages_blocks_cs_v_conditions" USING btree ("_order");
  CREATE INDEX "_pages_blocks_cs_v_conditions_parent_id_idx" ON "_pages_blocks_cs_v_conditions" USING btree ("_parent_id");
  CREATE INDEX "_pages_blocks_cs_v_order_idx" ON "_pages_blocks_cs_v" USING btree ("_order");
  CREATE INDEX "_pages_blocks_cs_v_parent_id_idx" ON "_pages_blocks_cs_v" USING btree ("_parent_id");
  CREATE INDEX "_pages_blocks_cs_v_path_idx" ON "_pages_blocks_cs_v" USING btree ("_path");
  CREATE INDEX "_pages_blocks_cs_v_surface_image_idx" ON "_pages_blocks_cs_v" USING btree ("surface_image_id");
  CREATE INDEX "posts_blocks_cs_sources_order_idx" ON "posts_blocks_cs_sources" USING btree ("order");
  CREATE INDEX "posts_blocks_cs_sources_parent_idx" ON "posts_blocks_cs_sources" USING btree ("parent_id");
  CREATE INDEX "posts_blocks_cs_conditions_order_idx" ON "posts_blocks_cs_conditions" USING btree ("_order");
  CREATE INDEX "posts_blocks_cs_conditions_parent_id_idx" ON "posts_blocks_cs_conditions" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_cs_order_idx" ON "posts_blocks_cs" USING btree ("_order");
  CREATE INDEX "posts_blocks_cs_parent_id_idx" ON "posts_blocks_cs" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_cs_path_idx" ON "posts_blocks_cs" USING btree ("_path");
  CREATE INDEX "posts_blocks_cs_surface_image_idx" ON "posts_blocks_cs" USING btree ("surface_image_id");
  CREATE INDEX "_posts_blocks_cs_v_sources_order_idx" ON "_posts_blocks_cs_v_sources" USING btree ("order");
  CREATE INDEX "_posts_blocks_cs_v_sources_parent_idx" ON "_posts_blocks_cs_v_sources" USING btree ("parent_id");
  CREATE INDEX "_posts_blocks_cs_v_conditions_order_idx" ON "_posts_blocks_cs_v_conditions" USING btree ("_order");
  CREATE INDEX "_posts_blocks_cs_v_conditions_parent_id_idx" ON "_posts_blocks_cs_v_conditions" USING btree ("_parent_id");
  CREATE INDEX "_posts_blocks_cs_v_order_idx" ON "_posts_blocks_cs_v" USING btree ("_order");
  CREATE INDEX "_posts_blocks_cs_v_parent_id_idx" ON "_posts_blocks_cs_v" USING btree ("_parent_id");
  CREATE INDEX "_posts_blocks_cs_v_path_idx" ON "_posts_blocks_cs_v" USING btree ("_path");
  CREATE INDEX "_posts_blocks_cs_v_surface_image_idx" ON "_posts_blocks_cs_v" USING btree ("surface_image_id");
  CREATE INDEX "events_blocks_cs_sources_order_idx" ON "events_blocks_cs_sources" USING btree ("order");
  CREATE INDEX "events_blocks_cs_sources_parent_idx" ON "events_blocks_cs_sources" USING btree ("parent_id");
  CREATE INDEX "events_blocks_cs_conditions_order_idx" ON "events_blocks_cs_conditions" USING btree ("_order");
  CREATE INDEX "events_blocks_cs_conditions_parent_id_idx" ON "events_blocks_cs_conditions" USING btree ("_parent_id");
  CREATE INDEX "events_blocks_cs_order_idx" ON "events_blocks_cs" USING btree ("_order");
  CREATE INDEX "events_blocks_cs_parent_id_idx" ON "events_blocks_cs" USING btree ("_parent_id");
  CREATE INDEX "events_blocks_cs_path_idx" ON "events_blocks_cs" USING btree ("_path");
  CREATE INDEX "events_blocks_cs_surface_image_idx" ON "events_blocks_cs" USING btree ("surface_image_id");
  CREATE INDEX "_events_blocks_cs_v_sources_order_idx" ON "_events_blocks_cs_v_sources" USING btree ("order");
  CREATE INDEX "_events_blocks_cs_v_sources_parent_idx" ON "_events_blocks_cs_v_sources" USING btree ("parent_id");
  CREATE INDEX "_events_blocks_cs_v_conditions_order_idx" ON "_events_blocks_cs_v_conditions" USING btree ("_order");
  CREATE INDEX "_events_blocks_cs_v_conditions_parent_id_idx" ON "_events_blocks_cs_v_conditions" USING btree ("_parent_id");
  CREATE INDEX "_events_blocks_cs_v_order_idx" ON "_events_blocks_cs_v" USING btree ("_order");
  CREATE INDEX "_events_blocks_cs_v_parent_id_idx" ON "_events_blocks_cs_v" USING btree ("_parent_id");
  CREATE INDEX "_events_blocks_cs_v_path_idx" ON "_events_blocks_cs_v" USING btree ("_path");
  CREATE INDEX "_events_blocks_cs_v_surface_image_idx" ON "_events_blocks_cs_v" USING btree ("surface_image_id");
  CREATE INDEX "event_cycles_blocks_cs_sources_order_idx" ON "event_cycles_blocks_cs_sources" USING btree ("order");
  CREATE INDEX "event_cycles_blocks_cs_sources_parent_idx" ON "event_cycles_blocks_cs_sources" USING btree ("parent_id");
  CREATE INDEX "event_cycles_blocks_cs_conditions_order_idx" ON "event_cycles_blocks_cs_conditions" USING btree ("_order");
  CREATE INDEX "event_cycles_blocks_cs_conditions_parent_id_idx" ON "event_cycles_blocks_cs_conditions" USING btree ("_parent_id");
  CREATE INDEX "event_cycles_blocks_cs_order_idx" ON "event_cycles_blocks_cs" USING btree ("_order");
  CREATE INDEX "event_cycles_blocks_cs_parent_id_idx" ON "event_cycles_blocks_cs" USING btree ("_parent_id");
  CREATE INDEX "event_cycles_blocks_cs_path_idx" ON "event_cycles_blocks_cs" USING btree ("_path");
  CREATE INDEX "event_cycles_blocks_cs_surface_image_idx" ON "event_cycles_blocks_cs" USING btree ("surface_image_id");
  CREATE INDEX "_event_cycles_blocks_cs_v_sources_order_idx" ON "_event_cycles_blocks_cs_v_sources" USING btree ("order");
  CREATE INDEX "_event_cycles_blocks_cs_v_sources_parent_idx" ON "_event_cycles_blocks_cs_v_sources" USING btree ("parent_id");
  CREATE INDEX "_event_cycles_blocks_cs_v_conditions_order_idx" ON "_event_cycles_blocks_cs_v_conditions" USING btree ("_order");
  CREATE INDEX "_event_cycles_blocks_cs_v_conditions_parent_id_idx" ON "_event_cycles_blocks_cs_v_conditions" USING btree ("_parent_id");
  CREATE INDEX "_event_cycles_blocks_cs_v_order_idx" ON "_event_cycles_blocks_cs_v" USING btree ("_order");
  CREATE INDEX "_event_cycles_blocks_cs_v_parent_id_idx" ON "_event_cycles_blocks_cs_v" USING btree ("_parent_id");
  CREATE INDEX "_event_cycles_blocks_cs_v_path_idx" ON "_event_cycles_blocks_cs_v" USING btree ("_path");
  CREATE INDEX "_event_cycles_blocks_cs_v_surface_image_idx" ON "_event_cycles_blocks_cs_v" USING btree ("surface_image_id");
  CREATE INDEX "partners_blocks_cs_sources_order_idx" ON "partners_blocks_cs_sources" USING btree ("order");
  CREATE INDEX "partners_blocks_cs_sources_parent_idx" ON "partners_blocks_cs_sources" USING btree ("parent_id");
  CREATE INDEX "partners_blocks_cs_conditions_order_idx" ON "partners_blocks_cs_conditions" USING btree ("_order");
  CREATE INDEX "partners_blocks_cs_conditions_parent_id_idx" ON "partners_blocks_cs_conditions" USING btree ("_parent_id");
  CREATE INDEX "partners_blocks_cs_order_idx" ON "partners_blocks_cs" USING btree ("_order");
  CREATE INDEX "partners_blocks_cs_parent_id_idx" ON "partners_blocks_cs" USING btree ("_parent_id");
  CREATE INDEX "partners_blocks_cs_path_idx" ON "partners_blocks_cs" USING btree ("_path");
  CREATE INDEX "partners_blocks_cs_surface_image_idx" ON "partners_blocks_cs" USING btree ("surface_image_id");
  CREATE INDEX "_partners_blocks_cs_v_sources_order_idx" ON "_partners_blocks_cs_v_sources" USING btree ("order");
  CREATE INDEX "_partners_blocks_cs_v_sources_parent_idx" ON "_partners_blocks_cs_v_sources" USING btree ("parent_id");
  CREATE INDEX "_partners_blocks_cs_v_conditions_order_idx" ON "_partners_blocks_cs_v_conditions" USING btree ("_order");
  CREATE INDEX "_partners_blocks_cs_v_conditions_parent_id_idx" ON "_partners_blocks_cs_v_conditions" USING btree ("_parent_id");
  CREATE INDEX "_partners_blocks_cs_v_order_idx" ON "_partners_blocks_cs_v" USING btree ("_order");
  CREATE INDEX "_partners_blocks_cs_v_parent_id_idx" ON "_partners_blocks_cs_v" USING btree ("_parent_id");
  CREATE INDEX "_partners_blocks_cs_v_path_idx" ON "_partners_blocks_cs_v" USING btree ("_path");
  CREATE INDEX "_partners_blocks_cs_v_surface_image_idx" ON "_partners_blocks_cs_v" USING btree ("surface_image_id");
  CREATE INDEX "homepage_sections_blocks_cs_sources_order_idx" ON "homepage_sections_blocks_cs_sources" USING btree ("order");
  CREATE INDEX "homepage_sections_blocks_cs_sources_parent_idx" ON "homepage_sections_blocks_cs_sources" USING btree ("parent_id");
  CREATE INDEX "homepage_sections_blocks_cs_conditions_order_idx" ON "homepage_sections_blocks_cs_conditions" USING btree ("_order");
  CREATE INDEX "homepage_sections_blocks_cs_conditions_parent_id_idx" ON "homepage_sections_blocks_cs_conditions" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_blocks_cs_order_idx" ON "homepage_sections_blocks_cs" USING btree ("_order");
  CREATE INDEX "homepage_sections_blocks_cs_parent_id_idx" ON "homepage_sections_blocks_cs" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_blocks_cs_path_idx" ON "homepage_sections_blocks_cs" USING btree ("_path");
  CREATE INDEX "homepage_sections_blocks_cs_surface_image_idx" ON "homepage_sections_blocks_cs" USING btree ("surface_image_id");
  CREATE INDEX "_homepage_sections_blocks_cs_v_sources_order_idx" ON "_homepage_sections_blocks_cs_v_sources" USING btree ("order");
  CREATE INDEX "_homepage_sections_blocks_cs_v_sources_parent_idx" ON "_homepage_sections_blocks_cs_v_sources" USING btree ("parent_id");
  CREATE INDEX "_homepage_sections_blocks_cs_v_conditions_order_idx" ON "_homepage_sections_blocks_cs_v_conditions" USING btree ("_order");
  CREATE INDEX "_homepage_sections_blocks_cs_v_conditions_parent_id_idx" ON "_homepage_sections_blocks_cs_v_conditions" USING btree ("_parent_id");
  CREATE INDEX "_homepage_sections_blocks_cs_v_order_idx" ON "_homepage_sections_blocks_cs_v" USING btree ("_order");
  CREATE INDEX "_homepage_sections_blocks_cs_v_parent_id_idx" ON "_homepage_sections_blocks_cs_v" USING btree ("_parent_id");
  CREATE INDEX "_homepage_sections_blocks_cs_v_path_idx" ON "_homepage_sections_blocks_cs_v" USING btree ("_path");
  CREATE INDEX "_homepage_sections_blocks_cs_v_surface_image_idx" ON "_homepage_sections_blocks_cs_v" USING btree ("surface_image_id");
  ALTER TABLE "content_listing_items" ADD CONSTRAINT "content_listing_items_search_author_group_id_user_groups_id_fk" FOREIGN KEY ("search_author_group_id") REFERENCES "public"."user_groups"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "content_listing_items_search_date_idx" ON "content_listing_items" USING btree ("search_date");
  CREATE INDEX "content_listing_items_search_author_group_idx" ON "content_listing_items" USING btree ("search_author_group_id");`)
  await backfillContentSearchIndex(db)
}

export async function backfillContentSearchIndex(db: MigrateUpArgs['db']): Promise<void> {
  const sources = [
    { source: 'pages', table: 'pages', date: 'published_at', groupAuthors: true },
    { source: 'posts', table: 'posts', date: 'published_at', groupAuthors: true },
    { source: 'events', table: 'events', date: 'start_at', groupAuthors: true },
    { source: 'event-cycles', table: 'event_cycles', date: 'published_at', groupAuthors: true },
    { source: 'partners', table: 'partners', date: 'published_at', groupAuthors: true },
    { source: 'documents', table: 'documents', date: 'document_date', groupAuthors: false },
  ] as const

  for (const { source, table, date, groupAuthors } of sources) {
    const group = groupAuthors
      ? sql`CASE WHEN NULLIF(btrim(document.public_author_signature), '') IS NULL THEN (
          SELECT authors.user_groups_id
          FROM ${sql.identifier(`${table}_rels`)} AS authors
          WHERE authors.parent_id = document.id AND authors.path = 'author'
            AND authors.user_groups_id IS NOT NULL
          ORDER BY authors.id
          LIMIT 1
        ) END`
      : sql`NULL`
    await db.execute(sql`
      UPDATE content_listing_items AS item
      SET search_date = document.${sql.identifier(date)},
          search_author_signature = NULLIF(btrim(document.public_author_signature), ''),
          search_author_group_id = ${group}
      FROM ${sql.identifier(table)} AS document
      WHERE item.source = ${source} AND item.source_document_id = document.id
        AND document._status = 'published' AND document.deleted_at IS NULL
    `)
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "page_templates_blocks_cs_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_cs_conditions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_cs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_templates_blocks_cs_v_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_templates_blocks_cs_v_conditions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_templates_blocks_cs_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_cs_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_cs_conditions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_cs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_blocks_cs_v_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_blocks_cs_v_conditions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_blocks_cs_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_cs_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_cs_conditions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_cs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_blocks_cs_v_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_blocks_cs_v_conditions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_blocks_cs_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_blocks_cs_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_blocks_cs_conditions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_blocks_cs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_blocks_cs_v_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_blocks_cs_v_conditions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_blocks_cs_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "event_cycles_blocks_cs_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "event_cycles_blocks_cs_conditions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "event_cycles_blocks_cs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_event_cycles_blocks_cs_v_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_event_cycles_blocks_cs_v_conditions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_event_cycles_blocks_cs_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "partners_blocks_cs_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "partners_blocks_cs_conditions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "partners_blocks_cs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_partners_blocks_cs_v_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_partners_blocks_cs_v_conditions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_partners_blocks_cs_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage_sections_blocks_cs_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage_sections_blocks_cs_conditions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage_sections_blocks_cs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_sections_blocks_cs_v_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_sections_blocks_cs_v_conditions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_sections_blocks_cs_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "page_templates_blocks_cs_sources" CASCADE;
  DROP TABLE "page_templates_blocks_cs_conditions" CASCADE;
  DROP TABLE "page_templates_blocks_cs" CASCADE;
  DROP TABLE "_page_templates_blocks_cs_v_sources" CASCADE;
  DROP TABLE "_page_templates_blocks_cs_v_conditions" CASCADE;
  DROP TABLE "_page_templates_blocks_cs_v" CASCADE;
  DROP TABLE "pages_blocks_cs_sources" CASCADE;
  DROP TABLE "pages_blocks_cs_conditions" CASCADE;
  DROP TABLE "pages_blocks_cs" CASCADE;
  DROP TABLE "_pages_blocks_cs_v_sources" CASCADE;
  DROP TABLE "_pages_blocks_cs_v_conditions" CASCADE;
  DROP TABLE "_pages_blocks_cs_v" CASCADE;
  DROP TABLE "posts_blocks_cs_sources" CASCADE;
  DROP TABLE "posts_blocks_cs_conditions" CASCADE;
  DROP TABLE "posts_blocks_cs" CASCADE;
  DROP TABLE "_posts_blocks_cs_v_sources" CASCADE;
  DROP TABLE "_posts_blocks_cs_v_conditions" CASCADE;
  DROP TABLE "_posts_blocks_cs_v" CASCADE;
  DROP TABLE "events_blocks_cs_sources" CASCADE;
  DROP TABLE "events_blocks_cs_conditions" CASCADE;
  DROP TABLE "events_blocks_cs" CASCADE;
  DROP TABLE "_events_blocks_cs_v_sources" CASCADE;
  DROP TABLE "_events_blocks_cs_v_conditions" CASCADE;
  DROP TABLE "_events_blocks_cs_v" CASCADE;
  DROP TABLE "event_cycles_blocks_cs_sources" CASCADE;
  DROP TABLE "event_cycles_blocks_cs_conditions" CASCADE;
  DROP TABLE "event_cycles_blocks_cs" CASCADE;
  DROP TABLE "_event_cycles_blocks_cs_v_sources" CASCADE;
  DROP TABLE "_event_cycles_blocks_cs_v_conditions" CASCADE;
  DROP TABLE "_event_cycles_blocks_cs_v" CASCADE;
  DROP TABLE "partners_blocks_cs_sources" CASCADE;
  DROP TABLE "partners_blocks_cs_conditions" CASCADE;
  DROP TABLE "partners_blocks_cs" CASCADE;
  DROP TABLE "_partners_blocks_cs_v_sources" CASCADE;
  DROP TABLE "_partners_blocks_cs_v_conditions" CASCADE;
  DROP TABLE "_partners_blocks_cs_v" CASCADE;
  DROP TABLE "homepage_sections_blocks_cs_sources" CASCADE;
  DROP TABLE "homepage_sections_blocks_cs_conditions" CASCADE;
  DROP TABLE "homepage_sections_blocks_cs" CASCADE;
  DROP TABLE "_homepage_sections_blocks_cs_v_sources" CASCADE;
  DROP TABLE "_homepage_sections_blocks_cs_v_conditions" CASCADE;
  DROP TABLE "_homepage_sections_blocks_cs_v" CASCADE;
  ALTER TABLE "content_listing_items" DROP CONSTRAINT "content_listing_items_search_author_group_id_user_groups_id_fk";
  
  DROP INDEX "content_listing_items_search_date_idx";
  DROP INDEX "content_listing_items_search_author_group_idx";
  ALTER TABLE "content_listing_items" DROP COLUMN "search_date";
  ALTER TABLE "content_listing_items" DROP COLUMN "search_author_signature";
  ALTER TABLE "content_listing_items" DROP COLUMN "search_author_group_id";
  ALTER TABLE "pages" DROP COLUMN "public_author_signature";
  ALTER TABLE "_pages_v" DROP COLUMN "version_public_author_signature";
  ALTER TABLE "posts" DROP COLUMN "public_author_signature";
  ALTER TABLE "_posts_v" DROP COLUMN "version_public_author_signature";
  ALTER TABLE "events" DROP COLUMN "public_author_signature";
  ALTER TABLE "_events_v" DROP COLUMN "version_public_author_signature";
  ALTER TABLE "event_cycles" DROP COLUMN "public_author_signature";
  ALTER TABLE "_event_cycles_v" DROP COLUMN "version_public_author_signature";
  ALTER TABLE "documents" DROP COLUMN "public_author_signature";
  ALTER TABLE "_documents_v" DROP COLUMN "version_public_author_signature";
  ALTER TABLE "partners" DROP COLUMN "public_author_signature";
  ALTER TABLE "_partners_v" DROP COLUMN "version_public_author_signature";
  DROP TYPE "public"."enum_page_templates_blocks_cs_sources";
  DROP TYPE "public"."enum_page_templates_blocks_cs_conditions_field";
  DROP TYPE "public"."enum_page_templates_blocks_cs_conditions_operator";
  DROP TYPE "public"."enum_page_templates_blocks_cs_sort";
  DROP TYPE "public"."enum_page_templates_blocks_cs_view";
  DROP TYPE "public"."enum__page_templates_blocks_cs_v_sources";
  DROP TYPE "public"."enum__page_templates_blocks_cs_v_conditions_field";
  DROP TYPE "public"."enum__page_templates_blocks_cs_v_conditions_operator";
  DROP TYPE "public"."enum__page_templates_blocks_cs_v_sort";
  DROP TYPE "public"."enum__page_templates_blocks_cs_v_view";
  DROP TYPE "public"."enum_pages_blocks_cs_sources";
  DROP TYPE "public"."enum_pages_blocks_cs_conditions_field";
  DROP TYPE "public"."enum_pages_blocks_cs_conditions_operator";
  DROP TYPE "public"."enum_pages_blocks_cs_sort";
  DROP TYPE "public"."enum_pages_blocks_cs_view";
  DROP TYPE "public"."enum__pages_blocks_cs_v_sources";
  DROP TYPE "public"."enum__pages_blocks_cs_v_conditions_field";
  DROP TYPE "public"."enum__pages_blocks_cs_v_conditions_operator";
  DROP TYPE "public"."enum__pages_blocks_cs_v_sort";
  DROP TYPE "public"."enum__pages_blocks_cs_v_view";
  DROP TYPE "public"."enum_posts_blocks_cs_sources";
  DROP TYPE "public"."enum_posts_blocks_cs_conditions_field";
  DROP TYPE "public"."enum_posts_blocks_cs_conditions_operator";
  DROP TYPE "public"."enum_posts_blocks_cs_sort";
  DROP TYPE "public"."enum_posts_blocks_cs_view";
  DROP TYPE "public"."enum__posts_blocks_cs_v_sources";
  DROP TYPE "public"."enum__posts_blocks_cs_v_conditions_field";
  DROP TYPE "public"."enum__posts_blocks_cs_v_conditions_operator";
  DROP TYPE "public"."enum__posts_blocks_cs_v_sort";
  DROP TYPE "public"."enum__posts_blocks_cs_v_view";
  DROP TYPE "public"."enum_events_blocks_cs_sources";
  DROP TYPE "public"."enum_events_blocks_cs_conditions_field";
  DROP TYPE "public"."enum_events_blocks_cs_conditions_operator";
  DROP TYPE "public"."enum_events_blocks_cs_sort";
  DROP TYPE "public"."enum_events_blocks_cs_view";
  DROP TYPE "public"."enum__events_blocks_cs_v_sources";
  DROP TYPE "public"."enum__events_blocks_cs_v_conditions_field";
  DROP TYPE "public"."enum__events_blocks_cs_v_conditions_operator";
  DROP TYPE "public"."enum__events_blocks_cs_v_sort";
  DROP TYPE "public"."enum__events_blocks_cs_v_view";
  DROP TYPE "public"."enum_event_cycles_blocks_cs_sources";
  DROP TYPE "public"."enum_event_cycles_blocks_cs_conditions_field";
  DROP TYPE "public"."enum_event_cycles_blocks_cs_conditions_operator";
  DROP TYPE "public"."enum_event_cycles_blocks_cs_sort";
  DROP TYPE "public"."enum_event_cycles_blocks_cs_view";
  DROP TYPE "public"."enum__event_cycles_blocks_cs_v_sources";
  DROP TYPE "public"."enum__event_cycles_blocks_cs_v_conditions_field";
  DROP TYPE "public"."enum__event_cycles_blocks_cs_v_conditions_operator";
  DROP TYPE "public"."enum__event_cycles_blocks_cs_v_sort";
  DROP TYPE "public"."enum__event_cycles_blocks_cs_v_view";
  DROP TYPE "public"."enum_partners_blocks_cs_sources";
  DROP TYPE "public"."enum_partners_blocks_cs_conditions_field";
  DROP TYPE "public"."enum_partners_blocks_cs_conditions_operator";
  DROP TYPE "public"."enum_partners_blocks_cs_sort";
  DROP TYPE "public"."enum_partners_blocks_cs_view";
  DROP TYPE "public"."enum__partners_blocks_cs_v_sources";
  DROP TYPE "public"."enum__partners_blocks_cs_v_conditions_field";
  DROP TYPE "public"."enum__partners_blocks_cs_v_conditions_operator";
  DROP TYPE "public"."enum__partners_blocks_cs_v_sort";
  DROP TYPE "public"."enum__partners_blocks_cs_v_view";
  DROP TYPE "public"."enum_homepage_sections_blocks_cs_sources";
  DROP TYPE "public"."enum_homepage_sections_blocks_cs_conditions_field";
  DROP TYPE "public"."enum_homepage_sections_blocks_cs_conditions_operator";
  DROP TYPE "public"."enum_homepage_sections_blocks_cs_sort";
  DROP TYPE "public"."enum_homepage_sections_blocks_cs_view";
  DROP TYPE "public"."enum__homepage_sections_blocks_cs_v_sources";
  DROP TYPE "public"."enum__homepage_sections_blocks_cs_v_conditions_field";
  DROP TYPE "public"."enum__homepage_sections_blocks_cs_v_conditions_operator";
  DROP TYPE "public"."enum__homepage_sections_blocks_cs_v_sort";
  DROP TYPE "public"."enum__homepage_sections_blocks_cs_v_view";`)
}
