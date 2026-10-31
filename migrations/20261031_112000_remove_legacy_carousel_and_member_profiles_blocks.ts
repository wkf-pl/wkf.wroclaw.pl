import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_carousel_sources" CASCADE;
  DROP TABLE "pages_blocks_carousel_items" CASCADE;
  DROP TABLE "pages_blocks_carousel_conditions" CASCADE;
  DROP TABLE "pages_blocks_carousel" CASCADE;
  DROP TABLE "pages_blocks_member_profiles_entries" CASCADE;
  DROP TABLE "pages_blocks_member_profiles" CASCADE;
  DROP TABLE "_pages_v_blocks_carousel_sources" CASCADE;
  DROP TABLE "_pages_v_blocks_carousel_items" CASCADE;
  DROP TABLE "_pages_v_blocks_carousel_conditions" CASCADE;
  DROP TABLE "_pages_v_blocks_carousel" CASCADE;
  DROP TABLE "_pages_v_blocks_member_profiles_entries" CASCADE;
  DROP TABLE "_pages_v_blocks_member_profiles" CASCADE;
  DROP TABLE "posts_blocks_carousel_sources" CASCADE;
  DROP TABLE "posts_blocks_carousel_items" CASCADE;
  DROP TABLE "posts_blocks_carousel_conditions" CASCADE;
  DROP TABLE "posts_blocks_carousel" CASCADE;
  DROP TABLE "posts_blocks_member_profiles_entries" CASCADE;
  DROP TABLE "posts_blocks_member_profiles" CASCADE;
  DROP TABLE "_posts_v_blocks_carousel_sources" CASCADE;
  DROP TABLE "_posts_v_blocks_carousel_items" CASCADE;
  DROP TABLE "_posts_v_blocks_carousel_conditions" CASCADE;
  DROP TABLE "_posts_v_blocks_carousel" CASCADE;
  DROP TABLE "_posts_v_blocks_member_profiles_entries" CASCADE;
  DROP TABLE "_posts_v_blocks_member_profiles" CASCADE;
  DROP TABLE "events_blocks_carousel_sources" CASCADE;
  DROP TABLE "events_blocks_carousel_items" CASCADE;
  DROP TABLE "events_blocks_carousel_conditions" CASCADE;
  DROP TABLE "events_blocks_carousel" CASCADE;
  DROP TABLE "events_blocks_member_profiles_entries" CASCADE;
  DROP TABLE "events_blocks_member_profiles" CASCADE;
  DROP TABLE "_events_v_blocks_carousel_sources" CASCADE;
  DROP TABLE "_events_v_blocks_carousel_items" CASCADE;
  DROP TABLE "_events_v_blocks_carousel_conditions" CASCADE;
  DROP TABLE "_events_v_blocks_carousel" CASCADE;
  DROP TABLE "_events_v_blocks_member_profiles_entries" CASCADE;
  DROP TABLE "_events_v_blocks_member_profiles" CASCADE;
  DROP TABLE "event_cycles_blocks_carousel_sources" CASCADE;
  DROP TABLE "event_cycles_blocks_carousel_items" CASCADE;
  DROP TABLE "event_cycles_blocks_carousel_conditions" CASCADE;
  DROP TABLE "event_cycles_blocks_carousel" CASCADE;
  DROP TABLE "event_cycles_blocks_member_profiles_entries" CASCADE;
  DROP TABLE "event_cycles_blocks_member_profiles" CASCADE;
  DROP TABLE "_event_cycles_v_blocks_carousel_sources" CASCADE;
  DROP TABLE "_event_cycles_v_blocks_carousel_items" CASCADE;
  DROP TABLE "_event_cycles_v_blocks_carousel_conditions" CASCADE;
  DROP TABLE "_event_cycles_v_blocks_carousel" CASCADE;
  DROP TABLE "_event_cycles_v_blocks_member_profiles_entries" CASCADE;
  DROP TABLE "_event_cycles_v_blocks_member_profiles" CASCADE;
  DROP TABLE "partners_blocks_carousel_sources" CASCADE;
  DROP TABLE "partners_blocks_carousel_items" CASCADE;
  DROP TABLE "partners_blocks_carousel_conditions" CASCADE;
  DROP TABLE "partners_blocks_carousel" CASCADE;
  DROP TABLE "partners_blocks_member_profiles_entries" CASCADE;
  DROP TABLE "partners_blocks_member_profiles" CASCADE;
  DROP TABLE "_partners_v_blocks_carousel_sources" CASCADE;
  DROP TABLE "_partners_v_blocks_carousel_items" CASCADE;
  DROP TABLE "_partners_v_blocks_carousel_conditions" CASCADE;
  DROP TABLE "_partners_v_blocks_carousel" CASCADE;
  DROP TABLE "_partners_v_blocks_member_profiles_entries" CASCADE;
  DROP TABLE "_partners_v_blocks_member_profiles" CASCADE;
  DROP TABLE "homepage_sections_blocks_carousel_sources" CASCADE;
  DROP TABLE "homepage_sections_blocks_carousel_items" CASCADE;
  DROP TABLE "homepage_sections_blocks_carousel_conditions" CASCADE;
  DROP TABLE "homepage_sections_blocks_carousel" CASCADE;
  DROP TABLE "homepage_sections_blocks_member_profiles_entries" CASCADE;
  DROP TABLE "homepage_sections_blocks_member_profiles" CASCADE;
  DROP TABLE "_homepage_sections_v_blocks_carousel_sources" CASCADE;
  DROP TABLE "_homepage_sections_v_blocks_carousel_items" CASCADE;
  DROP TABLE "_homepage_sections_v_blocks_carousel_conditions" CASCADE;
  DROP TABLE "_homepage_sections_v_blocks_carousel" CASCADE;
  DROP TABLE "_homepage_sections_v_blocks_member_profiles_entries" CASCADE;
  DROP TABLE "_homepage_sections_v_blocks_member_profiles" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_carousel_sources";
  DROP TYPE "public"."enum_pages_blocks_carousel_conditions_field";
  DROP TYPE "public"."enum_pages_blocks_carousel_conditions_operator";
  DROP TYPE "public"."enum_pages_blocks_carousel_selection_mode";
  DROP TYPE "public"."enum_pages_blocks_carousel_sort";
  DROP TYPE "public"."enum_pages_blocks_member_profiles_view";
  DROP TYPE "public"."enum__pages_v_blocks_carousel_sources";
  DROP TYPE "public"."enum__pages_v_blocks_carousel_conditions_field";
  DROP TYPE "public"."enum__pages_v_blocks_carousel_conditions_operator";
  DROP TYPE "public"."enum__pages_v_blocks_carousel_selection_mode";
  DROP TYPE "public"."enum__pages_v_blocks_carousel_sort";
  DROP TYPE "public"."enum__pages_v_blocks_member_profiles_view";
  DROP TYPE "public"."enum_posts_blocks_carousel_sources";
  DROP TYPE "public"."enum_posts_blocks_carousel_conditions_field";
  DROP TYPE "public"."enum_posts_blocks_carousel_conditions_operator";
  DROP TYPE "public"."enum_posts_blocks_carousel_selection_mode";
  DROP TYPE "public"."enum_posts_blocks_carousel_sort";
  DROP TYPE "public"."enum_posts_blocks_member_profiles_view";
  DROP TYPE "public"."enum__posts_v_blocks_carousel_sources";
  DROP TYPE "public"."enum__posts_v_blocks_carousel_conditions_field";
  DROP TYPE "public"."enum__posts_v_blocks_carousel_conditions_operator";
  DROP TYPE "public"."enum__posts_v_blocks_carousel_selection_mode";
  DROP TYPE "public"."enum__posts_v_blocks_carousel_sort";
  DROP TYPE "public"."enum__posts_v_blocks_member_profiles_view";
  DROP TYPE "public"."enum_events_blocks_carousel_sources";
  DROP TYPE "public"."enum_events_blocks_carousel_conditions_field";
  DROP TYPE "public"."enum_events_blocks_carousel_conditions_operator";
  DROP TYPE "public"."enum_events_blocks_carousel_selection_mode";
  DROP TYPE "public"."enum_events_blocks_carousel_sort";
  DROP TYPE "public"."enum_events_blocks_member_profiles_view";
  DROP TYPE "public"."enum__events_v_blocks_carousel_sources";
  DROP TYPE "public"."enum__events_v_blocks_carousel_conditions_field";
  DROP TYPE "public"."enum__events_v_blocks_carousel_conditions_operator";
  DROP TYPE "public"."enum__events_v_blocks_carousel_selection_mode";
  DROP TYPE "public"."enum__events_v_blocks_carousel_sort";
  DROP TYPE "public"."enum__events_v_blocks_member_profiles_view";
  DROP TYPE "public"."enum_event_cycles_blocks_carousel_sources";
  DROP TYPE "public"."enum_event_cycles_blocks_carousel_conditions_field";
  DROP TYPE "public"."enum_event_cycles_blocks_carousel_conditions_operator";
  DROP TYPE "public"."enum_event_cycles_blocks_carousel_selection_mode";
  DROP TYPE "public"."enum_event_cycles_blocks_carousel_sort";
  DROP TYPE "public"."enum_event_cycles_blocks_member_profiles_view";
  DROP TYPE "public"."enum__event_cycles_v_blocks_carousel_sources";
  DROP TYPE "public"."enum__event_cycles_v_blocks_carousel_conditions_field";
  DROP TYPE "public"."enum__event_cycles_v_blocks_carousel_conditions_operator";
  DROP TYPE "public"."enum__event_cycles_v_blocks_carousel_selection_mode";
  DROP TYPE "public"."enum__event_cycles_v_blocks_carousel_sort";
  DROP TYPE "public"."enum__event_cycles_v_blocks_member_profiles_view";
  DROP TYPE "public"."enum_partners_blocks_carousel_sources";
  DROP TYPE "public"."enum_partners_blocks_carousel_conditions_field";
  DROP TYPE "public"."enum_partners_blocks_carousel_conditions_operator";
  DROP TYPE "public"."enum_partners_blocks_carousel_selection_mode";
  DROP TYPE "public"."enum_partners_blocks_carousel_sort";
  DROP TYPE "public"."enum_partners_blocks_member_profiles_view";
  DROP TYPE "public"."enum__partners_v_blocks_carousel_sources";
  DROP TYPE "public"."enum__partners_v_blocks_carousel_conditions_field";
  DROP TYPE "public"."enum__partners_v_blocks_carousel_conditions_operator";
  DROP TYPE "public"."enum__partners_v_blocks_carousel_selection_mode";
  DROP TYPE "public"."enum__partners_v_blocks_carousel_sort";
  DROP TYPE "public"."enum__partners_v_blocks_member_profiles_view";
  DROP TYPE "public"."enum_homepage_sections_blocks_carousel_sources";
  DROP TYPE "public"."enum_homepage_sections_blocks_carousel_conditions_field";
  DROP TYPE "public"."enum_homepage_sections_blocks_carousel_conditions_operator";
  DROP TYPE "public"."enum_homepage_sections_blocks_carousel_selection_mode";
  DROP TYPE "public"."enum_homepage_sections_blocks_carousel_sort";
  DROP TYPE "public"."enum_homepage_sections_blocks_member_profiles_view";
  DROP TYPE "public"."enum__homepage_sections_v_blocks_carousel_sources";
  DROP TYPE "public"."enum__homepage_sections_v_blocks_carousel_conditions_field";
  DROP TYPE "public"."enum__homepage_sections_v_blocks_carousel_conditions_operator";
  DROP TYPE "public"."enum__homepage_sections_v_blocks_carousel_selection_mode";
  DROP TYPE "public"."enum__homepage_sections_v_blocks_carousel_sort";
  DROP TYPE "public"."enum__homepage_sections_v_blocks_member_profiles_view";`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents', 'partners', 'member-profiles');
  CREATE TYPE "public"."enum_pages_blocks_carousel_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  CREATE TYPE "public"."enum_pages_blocks_carousel_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between');
  CREATE TYPE "public"."enum_pages_blocks_carousel_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum_pages_blocks_carousel_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum_pages_blocks_member_profiles_view" AS ENUM('card', 'list', 'grid');
  CREATE TYPE "public"."enum__pages_v_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents', 'partners', 'member-profiles');
  CREATE TYPE "public"."enum__pages_v_blocks_carousel_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  CREATE TYPE "public"."enum__pages_v_blocks_carousel_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between');
  CREATE TYPE "public"."enum__pages_v_blocks_carousel_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum__pages_v_blocks_carousel_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum__pages_v_blocks_member_profiles_view" AS ENUM('card', 'list', 'grid');
  CREATE TYPE "public"."enum_posts_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents', 'partners', 'member-profiles');
  CREATE TYPE "public"."enum_posts_blocks_carousel_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  CREATE TYPE "public"."enum_posts_blocks_carousel_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between');
  CREATE TYPE "public"."enum_posts_blocks_carousel_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum_posts_blocks_carousel_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum_posts_blocks_member_profiles_view" AS ENUM('card', 'list', 'grid');
  CREATE TYPE "public"."enum__posts_v_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents', 'partners', 'member-profiles');
  CREATE TYPE "public"."enum__posts_v_blocks_carousel_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  CREATE TYPE "public"."enum__posts_v_blocks_carousel_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between');
  CREATE TYPE "public"."enum__posts_v_blocks_carousel_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum__posts_v_blocks_carousel_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum__posts_v_blocks_member_profiles_view" AS ENUM('card', 'list', 'grid');
  CREATE TYPE "public"."enum_events_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents', 'partners', 'member-profiles');
  CREATE TYPE "public"."enum_events_blocks_carousel_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  CREATE TYPE "public"."enum_events_blocks_carousel_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between');
  CREATE TYPE "public"."enum_events_blocks_carousel_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum_events_blocks_carousel_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum_events_blocks_member_profiles_view" AS ENUM('card', 'list', 'grid');
  CREATE TYPE "public"."enum__events_v_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents', 'partners', 'member-profiles');
  CREATE TYPE "public"."enum__events_v_blocks_carousel_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  CREATE TYPE "public"."enum__events_v_blocks_carousel_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between');
  CREATE TYPE "public"."enum__events_v_blocks_carousel_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum__events_v_blocks_carousel_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum__events_v_blocks_member_profiles_view" AS ENUM('card', 'list', 'grid');
  CREATE TYPE "public"."enum_event_cycles_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents', 'partners', 'member-profiles');
  CREATE TYPE "public"."enum_event_cycles_blocks_carousel_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  CREATE TYPE "public"."enum_event_cycles_blocks_carousel_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between');
  CREATE TYPE "public"."enum_event_cycles_blocks_carousel_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum_event_cycles_blocks_carousel_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum_event_cycles_blocks_member_profiles_view" AS ENUM('card', 'list', 'grid');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents', 'partners', 'member-profiles');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_carousel_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_carousel_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_carousel_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_carousel_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_member_profiles_view" AS ENUM('card', 'list', 'grid');
  CREATE TYPE "public"."enum_partners_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents', 'partners', 'member-profiles');
  CREATE TYPE "public"."enum_partners_blocks_carousel_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  CREATE TYPE "public"."enum_partners_blocks_carousel_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between');
  CREATE TYPE "public"."enum_partners_blocks_carousel_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum_partners_blocks_carousel_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum_partners_blocks_member_profiles_view" AS ENUM('card', 'list', 'grid');
  CREATE TYPE "public"."enum__partners_v_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents', 'partners', 'member-profiles');
  CREATE TYPE "public"."enum__partners_v_blocks_carousel_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  CREATE TYPE "public"."enum__partners_v_blocks_carousel_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between');
  CREATE TYPE "public"."enum__partners_v_blocks_carousel_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum__partners_v_blocks_carousel_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum__partners_v_blocks_member_profiles_view" AS ENUM('card', 'list', 'grid');
  CREATE TYPE "public"."enum_homepage_sections_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents', 'partners', 'member-profiles');
  CREATE TYPE "public"."enum_homepage_sections_blocks_carousel_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  CREATE TYPE "public"."enum_homepage_sections_blocks_carousel_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between');
  CREATE TYPE "public"."enum_homepage_sections_blocks_carousel_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum_homepage_sections_blocks_carousel_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum_homepage_sections_blocks_member_profiles_view" AS ENUM('card', 'list', 'grid');
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents', 'partners', 'member-profiles');
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_carousel_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_carousel_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between');
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_carousel_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_carousel_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_member_profiles_view" AS ENUM('card', 'list', 'grid');
  CREATE TABLE "pages_blocks_carousel_sources" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_pages_blocks_carousel_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_carousel_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_carousel_conditions" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field" "enum_pages_blocks_carousel_conditions_field",
  	"operator" "enum_pages_blocks_carousel_conditions_operator",
  	"text_value" varchar,
  	"number_value" numeric,
  	"event_time_value" "event_time",
  	"date_value" varchar,
  	"end_date_value" varchar
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
  	"sort" "enum_pages_blocks_carousel_sort" DEFAULT 'newest',
  	"slide_limit" numeric DEFAULT 5,
  	"empty_message" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_member_profiles_entries" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"profile_id" integer,
  	"context_label" varchar
  );
  
  CREATE TABLE "pages_blocks_member_profiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"view" "enum_pages_blocks_member_profiles_view" DEFAULT 'grid',
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_carousel_sources" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__pages_v_blocks_carousel_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_carousel_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_carousel_conditions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"field" "enum__pages_v_blocks_carousel_conditions_field",
  	"operator" "enum__pages_v_blocks_carousel_conditions_operator",
  	"text_value" varchar,
  	"number_value" numeric,
  	"event_time_value" "event_time",
  	"date_value" varchar,
  	"end_date_value" varchar,
  	"_uuid" varchar
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
  	"sort" "enum__pages_v_blocks_carousel_sort" DEFAULT 'newest',
  	"slide_limit" numeric DEFAULT 5,
  	"empty_message" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_member_profiles_entries" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"profile_id" integer,
  	"context_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_member_profiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"view" "enum__pages_v_blocks_member_profiles_view" DEFAULT 'grid',
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_carousel_sources" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_posts_blocks_carousel_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "posts_blocks_carousel_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "posts_blocks_carousel_conditions" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field" "enum_posts_blocks_carousel_conditions_field",
  	"operator" "enum_posts_blocks_carousel_conditions_operator",
  	"text_value" varchar,
  	"number_value" numeric,
  	"event_time_value" "event_time",
  	"date_value" varchar,
  	"end_date_value" varchar
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
  	"sort" "enum_posts_blocks_carousel_sort" DEFAULT 'newest',
  	"slide_limit" numeric DEFAULT 5,
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
  	"view" "enum_posts_blocks_member_profiles_view" DEFAULT 'grid',
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_carousel_sources" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__posts_v_blocks_carousel_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_posts_v_blocks_carousel_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_carousel_conditions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"field" "enum__posts_v_blocks_carousel_conditions_field",
  	"operator" "enum__posts_v_blocks_carousel_conditions_operator",
  	"text_value" varchar,
  	"number_value" numeric,
  	"event_time_value" "event_time",
  	"date_value" varchar,
  	"end_date_value" varchar,
  	"_uuid" varchar
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
  	"sort" "enum__posts_v_blocks_carousel_sort" DEFAULT 'newest',
  	"slide_limit" numeric DEFAULT 5,
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
  	"view" "enum__posts_v_blocks_member_profiles_view" DEFAULT 'grid',
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "events_blocks_carousel_sources" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_events_blocks_carousel_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "events_blocks_carousel_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "events_blocks_carousel_conditions" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field" "enum_events_blocks_carousel_conditions_field",
  	"operator" "enum_events_blocks_carousel_conditions_operator",
  	"text_value" varchar,
  	"number_value" numeric,
  	"event_time_value" "event_time",
  	"date_value" varchar,
  	"end_date_value" varchar
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
  	"sort" "enum_events_blocks_carousel_sort" DEFAULT 'newest',
  	"slide_limit" numeric DEFAULT 5,
  	"empty_message" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "events_blocks_member_profiles_entries" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"profile_id" integer,
  	"context_label" varchar
  );
  
  CREATE TABLE "events_blocks_member_profiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"view" "enum_events_blocks_member_profiles_view" DEFAULT 'grid',
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"block_name" varchar
  );
  
  CREATE TABLE "_events_v_blocks_carousel_sources" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__events_v_blocks_carousel_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_events_v_blocks_carousel_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_events_v_blocks_carousel_conditions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"field" "enum__events_v_blocks_carousel_conditions_field",
  	"operator" "enum__events_v_blocks_carousel_conditions_operator",
  	"text_value" varchar,
  	"number_value" numeric,
  	"event_time_value" "event_time",
  	"date_value" varchar,
  	"end_date_value" varchar,
  	"_uuid" varchar
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
  	"sort" "enum__events_v_blocks_carousel_sort" DEFAULT 'newest',
  	"slide_limit" numeric DEFAULT 5,
  	"empty_message" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_events_v_blocks_member_profiles_entries" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"profile_id" integer,
  	"context_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_events_v_blocks_member_profiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"view" "enum__events_v_blocks_member_profiles_view" DEFAULT 'grid',
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "event_cycles_blocks_carousel_sources" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_event_cycles_blocks_carousel_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "event_cycles_blocks_carousel_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "event_cycles_blocks_carousel_conditions" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field" "enum_event_cycles_blocks_carousel_conditions_field",
  	"operator" "enum_event_cycles_blocks_carousel_conditions_operator",
  	"text_value" varchar,
  	"number_value" numeric,
  	"event_time_value" "event_time",
  	"date_value" varchar,
  	"end_date_value" varchar
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
  	"sort" "enum_event_cycles_blocks_carousel_sort" DEFAULT 'newest',
  	"slide_limit" numeric DEFAULT 5,
  	"empty_message" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "event_cycles_blocks_member_profiles_entries" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"profile_id" integer,
  	"context_label" varchar
  );
  
  CREATE TABLE "event_cycles_blocks_member_profiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"view" "enum_event_cycles_blocks_member_profiles_view" DEFAULT 'grid',
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"block_name" varchar
  );
  
  CREATE TABLE "_event_cycles_v_blocks_carousel_sources" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__event_cycles_v_blocks_carousel_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_event_cycles_v_blocks_carousel_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_event_cycles_v_blocks_carousel_conditions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"field" "enum__event_cycles_v_blocks_carousel_conditions_field",
  	"operator" "enum__event_cycles_v_blocks_carousel_conditions_operator",
  	"text_value" varchar,
  	"number_value" numeric,
  	"event_time_value" "event_time",
  	"date_value" varchar,
  	"end_date_value" varchar,
  	"_uuid" varchar
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
  	"sort" "enum__event_cycles_v_blocks_carousel_sort" DEFAULT 'newest',
  	"slide_limit" numeric DEFAULT 5,
  	"empty_message" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_event_cycles_v_blocks_member_profiles_entries" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"profile_id" integer,
  	"context_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_event_cycles_v_blocks_member_profiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"view" "enum__event_cycles_v_blocks_member_profiles_view" DEFAULT 'grid',
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "partners_blocks_carousel_sources" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_partners_blocks_carousel_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "partners_blocks_carousel_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "partners_blocks_carousel_conditions" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field" "enum_partners_blocks_carousel_conditions_field",
  	"operator" "enum_partners_blocks_carousel_conditions_operator",
  	"text_value" varchar,
  	"number_value" numeric,
  	"event_time_value" "event_time",
  	"date_value" varchar,
  	"end_date_value" varchar
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
  	"sort" "enum_partners_blocks_carousel_sort" DEFAULT 'newest',
  	"slide_limit" numeric DEFAULT 5,
  	"empty_message" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "partners_blocks_member_profiles_entries" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"profile_id" integer,
  	"context_label" varchar
  );
  
  CREATE TABLE "partners_blocks_member_profiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"view" "enum_partners_blocks_member_profiles_view" DEFAULT 'grid',
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"block_name" varchar
  );
  
  CREATE TABLE "_partners_v_blocks_carousel_sources" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__partners_v_blocks_carousel_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_partners_v_blocks_carousel_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_partners_v_blocks_carousel_conditions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"field" "enum__partners_v_blocks_carousel_conditions_field",
  	"operator" "enum__partners_v_blocks_carousel_conditions_operator",
  	"text_value" varchar,
  	"number_value" numeric,
  	"event_time_value" "event_time",
  	"date_value" varchar,
  	"end_date_value" varchar,
  	"_uuid" varchar
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
  	"sort" "enum__partners_v_blocks_carousel_sort" DEFAULT 'newest',
  	"slide_limit" numeric DEFAULT 5,
  	"empty_message" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_partners_v_blocks_member_profiles_entries" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"profile_id" integer,
  	"context_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_partners_v_blocks_member_profiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"view" "enum__partners_v_blocks_member_profiles_view" DEFAULT 'grid',
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_sections_blocks_carousel_sources" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_homepage_sections_blocks_carousel_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "homepage_sections_blocks_carousel_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "homepage_sections_blocks_carousel_conditions" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field" "enum_homepage_sections_blocks_carousel_conditions_field",
  	"operator" "enum_homepage_sections_blocks_carousel_conditions_operator",
  	"text_value" varchar,
  	"number_value" numeric,
  	"event_time_value" "event_time",
  	"date_value" varchar,
  	"end_date_value" varchar
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
  	"selection_mode" "enum_homepage_sections_blocks_carousel_selection_mode" DEFAULT 'filters',
  	"sort" "enum_homepage_sections_blocks_carousel_sort" DEFAULT 'newest',
  	"slide_limit" numeric DEFAULT 5,
  	"empty_message" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_sections_blocks_member_profiles_entries" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"profile_id" integer,
  	"context_label" varchar
  );
  
  CREATE TABLE "homepage_sections_blocks_member_profiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"view" "enum_homepage_sections_blocks_member_profiles_view" DEFAULT 'grid',
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_sections_v_blocks_carousel_sources" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__homepage_sections_v_blocks_carousel_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_homepage_sections_v_blocks_carousel_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_sections_v_blocks_carousel_conditions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"field" "enum__homepage_sections_v_blocks_carousel_conditions_field",
  	"operator" "enum__homepage_sections_v_blocks_carousel_conditions_operator",
  	"text_value" varchar,
  	"number_value" numeric,
  	"event_time_value" "event_time",
  	"date_value" varchar,
  	"end_date_value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_sections_v_blocks_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"selection_mode" "enum__homepage_sections_v_blocks_carousel_selection_mode" DEFAULT 'filters',
  	"sort" "enum__homepage_sections_v_blocks_carousel_sort" DEFAULT 'newest',
  	"slide_limit" numeric DEFAULT 5,
  	"empty_message" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_sections_v_blocks_member_profiles_entries" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"profile_id" integer,
  	"context_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_sections_v_blocks_member_profiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"view" "enum__homepage_sections_v_blocks_member_profiles_view" DEFAULT 'grid',
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_carousel_sources" ADD CONSTRAINT "pages_blocks_carousel_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_carousel_items" ADD CONSTRAINT "pages_blocks_carousel_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_carousel_conditions" ADD CONSTRAINT "pages_blocks_carousel_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_carousel" ADD CONSTRAINT "pages_blocks_carousel_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_carousel" ADD CONSTRAINT "pages_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_member_profiles_entries" ADD CONSTRAINT "pages_blocks_member_profiles_entries_profile_id_member_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."member_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_member_profiles_entries" ADD CONSTRAINT "pages_blocks_member_profiles_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_member_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_member_profiles" ADD CONSTRAINT "pages_blocks_member_profiles_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_member_profiles" ADD CONSTRAINT "pages_blocks_member_profiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_carousel_sources" ADD CONSTRAINT "_pages_v_blocks_carousel_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_carousel_items" ADD CONSTRAINT "_pages_v_blocks_carousel_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_carousel_conditions" ADD CONSTRAINT "_pages_v_blocks_carousel_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_carousel" ADD CONSTRAINT "_pages_v_blocks_carousel_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_carousel" ADD CONSTRAINT "_pages_v_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_member_profiles_entries" ADD CONSTRAINT "_pages_v_blocks_member_profiles_entries_profile_id_member_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."member_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_member_profiles_entries" ADD CONSTRAINT "_pages_v_blocks_member_profiles_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_member_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_member_profiles" ADD CONSTRAINT "_pages_v_blocks_member_profiles_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_member_profiles" ADD CONSTRAINT "_pages_v_blocks_member_profiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_carousel_sources" ADD CONSTRAINT "posts_blocks_carousel_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_carousel_items" ADD CONSTRAINT "posts_blocks_carousel_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_carousel_conditions" ADD CONSTRAINT "posts_blocks_carousel_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_carousel" ADD CONSTRAINT "posts_blocks_carousel_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_carousel" ADD CONSTRAINT "posts_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_member_profiles_entries" ADD CONSTRAINT "posts_blocks_member_profiles_entries_profile_id_member_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."member_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_member_profiles_entries" ADD CONSTRAINT "posts_blocks_member_profiles_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_member_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_member_profiles" ADD CONSTRAINT "posts_blocks_member_profiles_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_member_profiles" ADD CONSTRAINT "posts_blocks_member_profiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_carousel_sources" ADD CONSTRAINT "_posts_v_blocks_carousel_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_carousel_items" ADD CONSTRAINT "_posts_v_blocks_carousel_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_carousel_conditions" ADD CONSTRAINT "_posts_v_blocks_carousel_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_carousel" ADD CONSTRAINT "_posts_v_blocks_carousel_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_carousel" ADD CONSTRAINT "_posts_v_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_member_profiles_entries" ADD CONSTRAINT "_posts_v_blocks_member_profiles_entries_profile_id_member_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."member_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_member_profiles_entries" ADD CONSTRAINT "_posts_v_blocks_member_profiles_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_member_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_member_profiles" ADD CONSTRAINT "_posts_v_blocks_member_profiles_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_member_profiles" ADD CONSTRAINT "_posts_v_blocks_member_profiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_blocks_carousel_sources" ADD CONSTRAINT "events_blocks_carousel_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_blocks_carousel_items" ADD CONSTRAINT "events_blocks_carousel_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_blocks_carousel_conditions" ADD CONSTRAINT "events_blocks_carousel_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_blocks_carousel" ADD CONSTRAINT "events_blocks_carousel_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_carousel" ADD CONSTRAINT "events_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_blocks_member_profiles_entries" ADD CONSTRAINT "events_blocks_member_profiles_entries_profile_id_member_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."member_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_member_profiles_entries" ADD CONSTRAINT "events_blocks_member_profiles_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events_blocks_member_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_blocks_member_profiles" ADD CONSTRAINT "events_blocks_member_profiles_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_member_profiles" ADD CONSTRAINT "events_blocks_member_profiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_carousel_sources" ADD CONSTRAINT "_events_v_blocks_carousel_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_events_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_carousel_items" ADD CONSTRAINT "_events_v_blocks_carousel_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_carousel_conditions" ADD CONSTRAINT "_events_v_blocks_carousel_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_carousel" ADD CONSTRAINT "_events_v_blocks_carousel_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_carousel" ADD CONSTRAINT "_events_v_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_member_profiles_entries" ADD CONSTRAINT "_events_v_blocks_member_profiles_entries_profile_id_member_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."member_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_member_profiles_entries" ADD CONSTRAINT "_events_v_blocks_member_profiles_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v_blocks_member_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_member_profiles" ADD CONSTRAINT "_events_v_blocks_member_profiles_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_member_profiles" ADD CONSTRAINT "_events_v_blocks_member_profiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_carousel_sources" ADD CONSTRAINT "event_cycles_blocks_carousel_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."event_cycles_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_carousel_items" ADD CONSTRAINT "event_cycles_blocks_carousel_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_cycles_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_carousel_conditions" ADD CONSTRAINT "event_cycles_blocks_carousel_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_cycles_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_carousel" ADD CONSTRAINT "event_cycles_blocks_carousel_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_carousel" ADD CONSTRAINT "event_cycles_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_cycles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_member_profiles_entries" ADD CONSTRAINT "event_cycles_blocks_member_profiles_entries_profile_id_member_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."member_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_member_profiles_entries" ADD CONSTRAINT "event_cycles_blocks_member_profiles_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_cycles_blocks_member_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_member_profiles" ADD CONSTRAINT "event_cycles_blocks_member_profiles_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_member_profiles" ADD CONSTRAINT "event_cycles_blocks_member_profiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_cycles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_carousel_sources" ADD CONSTRAINT "_event_cycles_v_blocks_carousel_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_event_cycles_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_carousel_items" ADD CONSTRAINT "_event_cycles_v_blocks_carousel_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_event_cycles_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_carousel_conditions" ADD CONSTRAINT "_event_cycles_v_blocks_carousel_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_event_cycles_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_carousel" ADD CONSTRAINT "_event_cycles_v_blocks_carousel_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_carousel" ADD CONSTRAINT "_event_cycles_v_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_event_cycles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_member_profiles_entries" ADD CONSTRAINT "_event_cycles_v_blocks_member_profiles_entries_profile_id_member_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."member_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_member_profiles_entries" ADD CONSTRAINT "_event_cycles_v_blocks_member_profiles_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_event_cycles_v_blocks_member_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_member_profiles" ADD CONSTRAINT "_event_cycles_v_blocks_member_profiles_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_member_profiles" ADD CONSTRAINT "_event_cycles_v_blocks_member_profiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_event_cycles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_blocks_carousel_sources" ADD CONSTRAINT "partners_blocks_carousel_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."partners_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_blocks_carousel_items" ADD CONSTRAINT "partners_blocks_carousel_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_blocks_carousel_conditions" ADD CONSTRAINT "partners_blocks_carousel_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_blocks_carousel" ADD CONSTRAINT "partners_blocks_carousel_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_carousel" ADD CONSTRAINT "partners_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_blocks_member_profiles_entries" ADD CONSTRAINT "partners_blocks_member_profiles_entries_profile_id_member_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."member_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_member_profiles_entries" ADD CONSTRAINT "partners_blocks_member_profiles_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners_blocks_member_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_blocks_member_profiles" ADD CONSTRAINT "partners_blocks_member_profiles_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_member_profiles" ADD CONSTRAINT "partners_blocks_member_profiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_carousel_sources" ADD CONSTRAINT "_partners_v_blocks_carousel_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_partners_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_carousel_items" ADD CONSTRAINT "_partners_v_blocks_carousel_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partners_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_carousel_conditions" ADD CONSTRAINT "_partners_v_blocks_carousel_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partners_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_carousel" ADD CONSTRAINT "_partners_v_blocks_carousel_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_carousel" ADD CONSTRAINT "_partners_v_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partners_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_member_profiles_entries" ADD CONSTRAINT "_partners_v_blocks_member_profiles_entries_profile_id_member_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."member_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_member_profiles_entries" ADD CONSTRAINT "_partners_v_blocks_member_profiles_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partners_v_blocks_member_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_member_profiles" ADD CONSTRAINT "_partners_v_blocks_member_profiles_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_member_profiles" ADD CONSTRAINT "_partners_v_blocks_member_profiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partners_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_carousel_sources" ADD CONSTRAINT "homepage_sections_blocks_carousel_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage_sections_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_carousel_items" ADD CONSTRAINT "homepage_sections_blocks_carousel_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_carousel_conditions" ADD CONSTRAINT "homepage_sections_blocks_carousel_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_carousel" ADD CONSTRAINT "homepage_sections_blocks_carousel_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_carousel" ADD CONSTRAINT "homepage_sections_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_member_profiles_entries" ADD CONSTRAINT "homepage_sections_blocks_member_profiles_entries_profile_id_member_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."member_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_member_profiles_entries" ADD CONSTRAINT "homepage_sections_blocks_member_profiles_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections_blocks_member_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_member_profiles" ADD CONSTRAINT "homepage_sections_blocks_member_profiles_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_member_profiles" ADD CONSTRAINT "homepage_sections_blocks_member_profiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_carousel_sources" ADD CONSTRAINT "_homepage_sections_v_blocks_carousel_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_homepage_sections_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_carousel_items" ADD CONSTRAINT "_homepage_sections_v_blocks_carousel_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_sections_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_carousel_conditions" ADD CONSTRAINT "_homepage_sections_v_blocks_carousel_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_sections_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_carousel" ADD CONSTRAINT "_homepage_sections_v_blocks_carousel_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_carousel" ADD CONSTRAINT "_homepage_sections_v_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_sections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_member_profiles_entries" ADD CONSTRAINT "_homepage_sections_v_blocks_member_profiles_entries_profile_id_member_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."member_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_member_profiles_entries" ADD CONSTRAINT "_homepage_sections_v_blocks_member_profiles_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_sections_v_blocks_member_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_member_profiles" ADD CONSTRAINT "_homepage_sections_v_blocks_member_profiles_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_member_profiles" ADD CONSTRAINT "_homepage_sections_v_blocks_member_profiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_sections_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_carousel_sources_order_idx" ON "pages_blocks_carousel_sources" USING btree ("order");
  CREATE INDEX "pages_blocks_carousel_sources_parent_idx" ON "pages_blocks_carousel_sources" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_carousel_items_order_idx" ON "pages_blocks_carousel_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_carousel_items_parent_id_idx" ON "pages_blocks_carousel_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_carousel_conditions_order_idx" ON "pages_blocks_carousel_conditions" USING btree ("_order");
  CREATE INDEX "pages_blocks_carousel_conditions_parent_id_idx" ON "pages_blocks_carousel_conditions" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_carousel_order_idx" ON "pages_blocks_carousel" USING btree ("_order");
  CREATE INDEX "pages_blocks_carousel_parent_id_idx" ON "pages_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_carousel_path_idx" ON "pages_blocks_carousel" USING btree ("_path");
  CREATE INDEX "pages_blocks_carousel_surface_image_idx" ON "pages_blocks_carousel" USING btree ("surface_image_id");
  CREATE INDEX "pages_blocks_member_profiles_entries_order_idx" ON "pages_blocks_member_profiles_entries" USING btree ("_order");
  CREATE INDEX "pages_blocks_member_profiles_entries_parent_id_idx" ON "pages_blocks_member_profiles_entries" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_member_profiles_entries_profile_idx" ON "pages_blocks_member_profiles_entries" USING btree ("profile_id");
  CREATE INDEX "pages_blocks_member_profiles_order_idx" ON "pages_blocks_member_profiles" USING btree ("_order");
  CREATE INDEX "pages_blocks_member_profiles_parent_id_idx" ON "pages_blocks_member_profiles" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_member_profiles_path_idx" ON "pages_blocks_member_profiles" USING btree ("_path");
  CREATE INDEX "pages_blocks_member_profiles_surface_image_idx" ON "pages_blocks_member_profiles" USING btree ("surface_image_id");
  CREATE INDEX "_pages_v_blocks_carousel_sources_order_idx" ON "_pages_v_blocks_carousel_sources" USING btree ("order");
  CREATE INDEX "_pages_v_blocks_carousel_sources_parent_idx" ON "_pages_v_blocks_carousel_sources" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_carousel_items_order_idx" ON "_pages_v_blocks_carousel_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_carousel_items_parent_id_idx" ON "_pages_v_blocks_carousel_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_carousel_conditions_order_idx" ON "_pages_v_blocks_carousel_conditions" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_carousel_conditions_parent_id_idx" ON "_pages_v_blocks_carousel_conditions" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_carousel_order_idx" ON "_pages_v_blocks_carousel" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_carousel_parent_id_idx" ON "_pages_v_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_carousel_path_idx" ON "_pages_v_blocks_carousel" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_carousel_surface_image_idx" ON "_pages_v_blocks_carousel" USING btree ("surface_image_id");
  CREATE INDEX "_pages_v_blocks_member_profiles_entries_order_idx" ON "_pages_v_blocks_member_profiles_entries" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_member_profiles_entries_parent_id_idx" ON "_pages_v_blocks_member_profiles_entries" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_member_profiles_entries_profile_idx" ON "_pages_v_blocks_member_profiles_entries" USING btree ("profile_id");
  CREATE INDEX "_pages_v_blocks_member_profiles_order_idx" ON "_pages_v_blocks_member_profiles" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_member_profiles_parent_id_idx" ON "_pages_v_blocks_member_profiles" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_member_profiles_path_idx" ON "_pages_v_blocks_member_profiles" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_member_profiles_surface_image_idx" ON "_pages_v_blocks_member_profiles" USING btree ("surface_image_id");
  CREATE INDEX "posts_blocks_carousel_sources_order_idx" ON "posts_blocks_carousel_sources" USING btree ("order");
  CREATE INDEX "posts_blocks_carousel_sources_parent_idx" ON "posts_blocks_carousel_sources" USING btree ("parent_id");
  CREATE INDEX "posts_blocks_carousel_items_order_idx" ON "posts_blocks_carousel_items" USING btree ("_order");
  CREATE INDEX "posts_blocks_carousel_items_parent_id_idx" ON "posts_blocks_carousel_items" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_carousel_conditions_order_idx" ON "posts_blocks_carousel_conditions" USING btree ("_order");
  CREATE INDEX "posts_blocks_carousel_conditions_parent_id_idx" ON "posts_blocks_carousel_conditions" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_carousel_order_idx" ON "posts_blocks_carousel" USING btree ("_order");
  CREATE INDEX "posts_blocks_carousel_parent_id_idx" ON "posts_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_carousel_path_idx" ON "posts_blocks_carousel" USING btree ("_path");
  CREATE INDEX "posts_blocks_carousel_surface_image_idx" ON "posts_blocks_carousel" USING btree ("surface_image_id");
  CREATE INDEX "posts_blocks_member_profiles_entries_order_idx" ON "posts_blocks_member_profiles_entries" USING btree ("_order");
  CREATE INDEX "posts_blocks_member_profiles_entries_parent_id_idx" ON "posts_blocks_member_profiles_entries" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_member_profiles_entries_profile_idx" ON "posts_blocks_member_profiles_entries" USING btree ("profile_id");
  CREATE INDEX "posts_blocks_member_profiles_order_idx" ON "posts_blocks_member_profiles" USING btree ("_order");
  CREATE INDEX "posts_blocks_member_profiles_parent_id_idx" ON "posts_blocks_member_profiles" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_member_profiles_path_idx" ON "posts_blocks_member_profiles" USING btree ("_path");
  CREATE INDEX "posts_blocks_member_profiles_surface_image_idx" ON "posts_blocks_member_profiles" USING btree ("surface_image_id");
  CREATE INDEX "_posts_v_blocks_carousel_sources_order_idx" ON "_posts_v_blocks_carousel_sources" USING btree ("order");
  CREATE INDEX "_posts_v_blocks_carousel_sources_parent_idx" ON "_posts_v_blocks_carousel_sources" USING btree ("parent_id");
  CREATE INDEX "_posts_v_blocks_carousel_items_order_idx" ON "_posts_v_blocks_carousel_items" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_carousel_items_parent_id_idx" ON "_posts_v_blocks_carousel_items" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_carousel_conditions_order_idx" ON "_posts_v_blocks_carousel_conditions" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_carousel_conditions_parent_id_idx" ON "_posts_v_blocks_carousel_conditions" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_carousel_order_idx" ON "_posts_v_blocks_carousel" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_carousel_parent_id_idx" ON "_posts_v_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_carousel_path_idx" ON "_posts_v_blocks_carousel" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_carousel_surface_image_idx" ON "_posts_v_blocks_carousel" USING btree ("surface_image_id");
  CREATE INDEX "_posts_v_blocks_member_profiles_entries_order_idx" ON "_posts_v_blocks_member_profiles_entries" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_member_profiles_entries_parent_id_idx" ON "_posts_v_blocks_member_profiles_entries" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_member_profiles_entries_profile_idx" ON "_posts_v_blocks_member_profiles_entries" USING btree ("profile_id");
  CREATE INDEX "_posts_v_blocks_member_profiles_order_idx" ON "_posts_v_blocks_member_profiles" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_member_profiles_parent_id_idx" ON "_posts_v_blocks_member_profiles" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_member_profiles_path_idx" ON "_posts_v_blocks_member_profiles" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_member_profiles_surface_image_idx" ON "_posts_v_blocks_member_profiles" USING btree ("surface_image_id");
  CREATE INDEX "events_blocks_carousel_sources_order_idx" ON "events_blocks_carousel_sources" USING btree ("order");
  CREATE INDEX "events_blocks_carousel_sources_parent_idx" ON "events_blocks_carousel_sources" USING btree ("parent_id");
  CREATE INDEX "events_blocks_carousel_items_order_idx" ON "events_blocks_carousel_items" USING btree ("_order");
  CREATE INDEX "events_blocks_carousel_items_parent_id_idx" ON "events_blocks_carousel_items" USING btree ("_parent_id");
  CREATE INDEX "events_blocks_carousel_conditions_order_idx" ON "events_blocks_carousel_conditions" USING btree ("_order");
  CREATE INDEX "events_blocks_carousel_conditions_parent_id_idx" ON "events_blocks_carousel_conditions" USING btree ("_parent_id");
  CREATE INDEX "events_blocks_carousel_order_idx" ON "events_blocks_carousel" USING btree ("_order");
  CREATE INDEX "events_blocks_carousel_parent_id_idx" ON "events_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "events_blocks_carousel_path_idx" ON "events_blocks_carousel" USING btree ("_path");
  CREATE INDEX "events_blocks_carousel_surface_image_idx" ON "events_blocks_carousel" USING btree ("surface_image_id");
  CREATE INDEX "events_blocks_member_profiles_entries_order_idx" ON "events_blocks_member_profiles_entries" USING btree ("_order");
  CREATE INDEX "events_blocks_member_profiles_entries_parent_id_idx" ON "events_blocks_member_profiles_entries" USING btree ("_parent_id");
  CREATE INDEX "events_blocks_member_profiles_entries_profile_idx" ON "events_blocks_member_profiles_entries" USING btree ("profile_id");
  CREATE INDEX "events_blocks_member_profiles_order_idx" ON "events_blocks_member_profiles" USING btree ("_order");
  CREATE INDEX "events_blocks_member_profiles_parent_id_idx" ON "events_blocks_member_profiles" USING btree ("_parent_id");
  CREATE INDEX "events_blocks_member_profiles_path_idx" ON "events_blocks_member_profiles" USING btree ("_path");
  CREATE INDEX "events_blocks_member_profiles_surface_image_idx" ON "events_blocks_member_profiles" USING btree ("surface_image_id");
  CREATE INDEX "_events_v_blocks_carousel_sources_order_idx" ON "_events_v_blocks_carousel_sources" USING btree ("order");
  CREATE INDEX "_events_v_blocks_carousel_sources_parent_idx" ON "_events_v_blocks_carousel_sources" USING btree ("parent_id");
  CREATE INDEX "_events_v_blocks_carousel_items_order_idx" ON "_events_v_blocks_carousel_items" USING btree ("_order");
  CREATE INDEX "_events_v_blocks_carousel_items_parent_id_idx" ON "_events_v_blocks_carousel_items" USING btree ("_parent_id");
  CREATE INDEX "_events_v_blocks_carousel_conditions_order_idx" ON "_events_v_blocks_carousel_conditions" USING btree ("_order");
  CREATE INDEX "_events_v_blocks_carousel_conditions_parent_id_idx" ON "_events_v_blocks_carousel_conditions" USING btree ("_parent_id");
  CREATE INDEX "_events_v_blocks_carousel_order_idx" ON "_events_v_blocks_carousel" USING btree ("_order");
  CREATE INDEX "_events_v_blocks_carousel_parent_id_idx" ON "_events_v_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "_events_v_blocks_carousel_path_idx" ON "_events_v_blocks_carousel" USING btree ("_path");
  CREATE INDEX "_events_v_blocks_carousel_surface_image_idx" ON "_events_v_blocks_carousel" USING btree ("surface_image_id");
  CREATE INDEX "_events_v_blocks_member_profiles_entries_order_idx" ON "_events_v_blocks_member_profiles_entries" USING btree ("_order");
  CREATE INDEX "_events_v_blocks_member_profiles_entries_parent_id_idx" ON "_events_v_blocks_member_profiles_entries" USING btree ("_parent_id");
  CREATE INDEX "_events_v_blocks_member_profiles_entries_profile_idx" ON "_events_v_blocks_member_profiles_entries" USING btree ("profile_id");
  CREATE INDEX "_events_v_blocks_member_profiles_order_idx" ON "_events_v_blocks_member_profiles" USING btree ("_order");
  CREATE INDEX "_events_v_blocks_member_profiles_parent_id_idx" ON "_events_v_blocks_member_profiles" USING btree ("_parent_id");
  CREATE INDEX "_events_v_blocks_member_profiles_path_idx" ON "_events_v_blocks_member_profiles" USING btree ("_path");
  CREATE INDEX "_events_v_blocks_member_profiles_surface_image_idx" ON "_events_v_blocks_member_profiles" USING btree ("surface_image_id");
  CREATE INDEX "event_cycles_blocks_carousel_sources_order_idx" ON "event_cycles_blocks_carousel_sources" USING btree ("order");
  CREATE INDEX "event_cycles_blocks_carousel_sources_parent_idx" ON "event_cycles_blocks_carousel_sources" USING btree ("parent_id");
  CREATE INDEX "event_cycles_blocks_carousel_items_order_idx" ON "event_cycles_blocks_carousel_items" USING btree ("_order");
  CREATE INDEX "event_cycles_blocks_carousel_items_parent_id_idx" ON "event_cycles_blocks_carousel_items" USING btree ("_parent_id");
  CREATE INDEX "event_cycles_blocks_carousel_conditions_order_idx" ON "event_cycles_blocks_carousel_conditions" USING btree ("_order");
  CREATE INDEX "event_cycles_blocks_carousel_conditions_parent_id_idx" ON "event_cycles_blocks_carousel_conditions" USING btree ("_parent_id");
  CREATE INDEX "event_cycles_blocks_carousel_order_idx" ON "event_cycles_blocks_carousel" USING btree ("_order");
  CREATE INDEX "event_cycles_blocks_carousel_parent_id_idx" ON "event_cycles_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "event_cycles_blocks_carousel_path_idx" ON "event_cycles_blocks_carousel" USING btree ("_path");
  CREATE INDEX "event_cycles_blocks_carousel_surface_image_idx" ON "event_cycles_blocks_carousel" USING btree ("surface_image_id");
  CREATE INDEX "event_cycles_blocks_member_profiles_entries_order_idx" ON "event_cycles_blocks_member_profiles_entries" USING btree ("_order");
  CREATE INDEX "event_cycles_blocks_member_profiles_entries_parent_id_idx" ON "event_cycles_blocks_member_profiles_entries" USING btree ("_parent_id");
  CREATE INDEX "event_cycles_blocks_member_profiles_entries_profile_idx" ON "event_cycles_blocks_member_profiles_entries" USING btree ("profile_id");
  CREATE INDEX "event_cycles_blocks_member_profiles_order_idx" ON "event_cycles_blocks_member_profiles" USING btree ("_order");
  CREATE INDEX "event_cycles_blocks_member_profiles_parent_id_idx" ON "event_cycles_blocks_member_profiles" USING btree ("_parent_id");
  CREATE INDEX "event_cycles_blocks_member_profiles_path_idx" ON "event_cycles_blocks_member_profiles" USING btree ("_path");
  CREATE INDEX "event_cycles_blocks_member_profiles_surface_image_idx" ON "event_cycles_blocks_member_profiles" USING btree ("surface_image_id");
  CREATE INDEX "_event_cycles_v_blocks_carousel_sources_order_idx" ON "_event_cycles_v_blocks_carousel_sources" USING btree ("order");
  CREATE INDEX "_event_cycles_v_blocks_carousel_sources_parent_idx" ON "_event_cycles_v_blocks_carousel_sources" USING btree ("parent_id");
  CREATE INDEX "_event_cycles_v_blocks_carousel_items_order_idx" ON "_event_cycles_v_blocks_carousel_items" USING btree ("_order");
  CREATE INDEX "_event_cycles_v_blocks_carousel_items_parent_id_idx" ON "_event_cycles_v_blocks_carousel_items" USING btree ("_parent_id");
  CREATE INDEX "_event_cycles_v_blocks_carousel_conditions_order_idx" ON "_event_cycles_v_blocks_carousel_conditions" USING btree ("_order");
  CREATE INDEX "_event_cycles_v_blocks_carousel_conditions_parent_id_idx" ON "_event_cycles_v_blocks_carousel_conditions" USING btree ("_parent_id");
  CREATE INDEX "_event_cycles_v_blocks_carousel_order_idx" ON "_event_cycles_v_blocks_carousel" USING btree ("_order");
  CREATE INDEX "_event_cycles_v_blocks_carousel_parent_id_idx" ON "_event_cycles_v_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "_event_cycles_v_blocks_carousel_path_idx" ON "_event_cycles_v_blocks_carousel" USING btree ("_path");
  CREATE INDEX "_event_cycles_v_blocks_carousel_surface_image_idx" ON "_event_cycles_v_blocks_carousel" USING btree ("surface_image_id");
  CREATE INDEX "_event_cycles_v_blocks_member_profiles_entries_order_idx" ON "_event_cycles_v_blocks_member_profiles_entries" USING btree ("_order");
  CREATE INDEX "_event_cycles_v_blocks_member_profiles_entries_parent_id_idx" ON "_event_cycles_v_blocks_member_profiles_entries" USING btree ("_parent_id");
  CREATE INDEX "_event_cycles_v_blocks_member_profiles_entries_profile_idx" ON "_event_cycles_v_blocks_member_profiles_entries" USING btree ("profile_id");
  CREATE INDEX "_event_cycles_v_blocks_member_profiles_order_idx" ON "_event_cycles_v_blocks_member_profiles" USING btree ("_order");
  CREATE INDEX "_event_cycles_v_blocks_member_profiles_parent_id_idx" ON "_event_cycles_v_blocks_member_profiles" USING btree ("_parent_id");
  CREATE INDEX "_event_cycles_v_blocks_member_profiles_path_idx" ON "_event_cycles_v_blocks_member_profiles" USING btree ("_path");
  CREATE INDEX "_event_cycles_v_blocks_member_profiles_surface_image_idx" ON "_event_cycles_v_blocks_member_profiles" USING btree ("surface_image_id");
  CREATE INDEX "partners_blocks_carousel_sources_order_idx" ON "partners_blocks_carousel_sources" USING btree ("order");
  CREATE INDEX "partners_blocks_carousel_sources_parent_idx" ON "partners_blocks_carousel_sources" USING btree ("parent_id");
  CREATE INDEX "partners_blocks_carousel_items_order_idx" ON "partners_blocks_carousel_items" USING btree ("_order");
  CREATE INDEX "partners_blocks_carousel_items_parent_id_idx" ON "partners_blocks_carousel_items" USING btree ("_parent_id");
  CREATE INDEX "partners_blocks_carousel_conditions_order_idx" ON "partners_blocks_carousel_conditions" USING btree ("_order");
  CREATE INDEX "partners_blocks_carousel_conditions_parent_id_idx" ON "partners_blocks_carousel_conditions" USING btree ("_parent_id");
  CREATE INDEX "partners_blocks_carousel_order_idx" ON "partners_blocks_carousel" USING btree ("_order");
  CREATE INDEX "partners_blocks_carousel_parent_id_idx" ON "partners_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "partners_blocks_carousel_path_idx" ON "partners_blocks_carousel" USING btree ("_path");
  CREATE INDEX "partners_blocks_carousel_surface_image_idx" ON "partners_blocks_carousel" USING btree ("surface_image_id");
  CREATE INDEX "partners_blocks_member_profiles_entries_order_idx" ON "partners_blocks_member_profiles_entries" USING btree ("_order");
  CREATE INDEX "partners_blocks_member_profiles_entries_parent_id_idx" ON "partners_blocks_member_profiles_entries" USING btree ("_parent_id");
  CREATE INDEX "partners_blocks_member_profiles_entries_profile_idx" ON "partners_blocks_member_profiles_entries" USING btree ("profile_id");
  CREATE INDEX "partners_blocks_member_profiles_order_idx" ON "partners_blocks_member_profiles" USING btree ("_order");
  CREATE INDEX "partners_blocks_member_profiles_parent_id_idx" ON "partners_blocks_member_profiles" USING btree ("_parent_id");
  CREATE INDEX "partners_blocks_member_profiles_path_idx" ON "partners_blocks_member_profiles" USING btree ("_path");
  CREATE INDEX "partners_blocks_member_profiles_surface_image_idx" ON "partners_blocks_member_profiles" USING btree ("surface_image_id");
  CREATE INDEX "_partners_v_blocks_carousel_sources_order_idx" ON "_partners_v_blocks_carousel_sources" USING btree ("order");
  CREATE INDEX "_partners_v_blocks_carousel_sources_parent_idx" ON "_partners_v_blocks_carousel_sources" USING btree ("parent_id");
  CREATE INDEX "_partners_v_blocks_carousel_items_order_idx" ON "_partners_v_blocks_carousel_items" USING btree ("_order");
  CREATE INDEX "_partners_v_blocks_carousel_items_parent_id_idx" ON "_partners_v_blocks_carousel_items" USING btree ("_parent_id");
  CREATE INDEX "_partners_v_blocks_carousel_conditions_order_idx" ON "_partners_v_blocks_carousel_conditions" USING btree ("_order");
  CREATE INDEX "_partners_v_blocks_carousel_conditions_parent_id_idx" ON "_partners_v_blocks_carousel_conditions" USING btree ("_parent_id");
  CREATE INDEX "_partners_v_blocks_carousel_order_idx" ON "_partners_v_blocks_carousel" USING btree ("_order");
  CREATE INDEX "_partners_v_blocks_carousel_parent_id_idx" ON "_partners_v_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "_partners_v_blocks_carousel_path_idx" ON "_partners_v_blocks_carousel" USING btree ("_path");
  CREATE INDEX "_partners_v_blocks_carousel_surface_image_idx" ON "_partners_v_blocks_carousel" USING btree ("surface_image_id");
  CREATE INDEX "_partners_v_blocks_member_profiles_entries_order_idx" ON "_partners_v_blocks_member_profiles_entries" USING btree ("_order");
  CREATE INDEX "_partners_v_blocks_member_profiles_entries_parent_id_idx" ON "_partners_v_blocks_member_profiles_entries" USING btree ("_parent_id");
  CREATE INDEX "_partners_v_blocks_member_profiles_entries_profile_idx" ON "_partners_v_blocks_member_profiles_entries" USING btree ("profile_id");
  CREATE INDEX "_partners_v_blocks_member_profiles_order_idx" ON "_partners_v_blocks_member_profiles" USING btree ("_order");
  CREATE INDEX "_partners_v_blocks_member_profiles_parent_id_idx" ON "_partners_v_blocks_member_profiles" USING btree ("_parent_id");
  CREATE INDEX "_partners_v_blocks_member_profiles_path_idx" ON "_partners_v_blocks_member_profiles" USING btree ("_path");
  CREATE INDEX "_partners_v_blocks_member_profiles_surface_image_idx" ON "_partners_v_blocks_member_profiles" USING btree ("surface_image_id");
  CREATE INDEX "homepage_sections_blocks_carousel_sources_order_idx" ON "homepage_sections_blocks_carousel_sources" USING btree ("order");
  CREATE INDEX "homepage_sections_blocks_carousel_sources_parent_idx" ON "homepage_sections_blocks_carousel_sources" USING btree ("parent_id");
  CREATE INDEX "homepage_sections_blocks_carousel_items_order_idx" ON "homepage_sections_blocks_carousel_items" USING btree ("_order");
  CREATE INDEX "homepage_sections_blocks_carousel_items_parent_id_idx" ON "homepage_sections_blocks_carousel_items" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_blocks_carousel_conditions_order_idx" ON "homepage_sections_blocks_carousel_conditions" USING btree ("_order");
  CREATE INDEX "homepage_sections_blocks_carousel_conditions_parent_id_idx" ON "homepage_sections_blocks_carousel_conditions" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_blocks_carousel_order_idx" ON "homepage_sections_blocks_carousel" USING btree ("_order");
  CREATE INDEX "homepage_sections_blocks_carousel_parent_id_idx" ON "homepage_sections_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_blocks_carousel_path_idx" ON "homepage_sections_blocks_carousel" USING btree ("_path");
  CREATE INDEX "homepage_sections_blocks_carousel_surface_image_idx" ON "homepage_sections_blocks_carousel" USING btree ("surface_image_id");
  CREATE INDEX "homepage_sections_blocks_member_profiles_entries_order_idx" ON "homepage_sections_blocks_member_profiles_entries" USING btree ("_order");
  CREATE INDEX "homepage_sections_blocks_member_profiles_entries_parent_id_idx" ON "homepage_sections_blocks_member_profiles_entries" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_blocks_member_profiles_entries_profile_idx" ON "homepage_sections_blocks_member_profiles_entries" USING btree ("profile_id");
  CREATE INDEX "homepage_sections_blocks_member_profiles_order_idx" ON "homepage_sections_blocks_member_profiles" USING btree ("_order");
  CREATE INDEX "homepage_sections_blocks_member_profiles_parent_id_idx" ON "homepage_sections_blocks_member_profiles" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_blocks_member_profiles_path_idx" ON "homepage_sections_blocks_member_profiles" USING btree ("_path");
  CREATE INDEX "homepage_sections_blocks_member_profiles_surface_image_idx" ON "homepage_sections_blocks_member_profiles" USING btree ("surface_image_id");
  CREATE INDEX "_homepage_sections_v_blocks_carousel_sources_order_idx" ON "_homepage_sections_v_blocks_carousel_sources" USING btree ("order");
  CREATE INDEX "_homepage_sections_v_blocks_carousel_sources_parent_idx" ON "_homepage_sections_v_blocks_carousel_sources" USING btree ("parent_id");
  CREATE INDEX "_homepage_sections_v_blocks_carousel_items_order_idx" ON "_homepage_sections_v_blocks_carousel_items" USING btree ("_order");
  CREATE INDEX "_homepage_sections_v_blocks_carousel_items_parent_id_idx" ON "_homepage_sections_v_blocks_carousel_items" USING btree ("_parent_id");
  CREATE INDEX "_homepage_sections_v_blocks_carousel_conditions_order_idx" ON "_homepage_sections_v_blocks_carousel_conditions" USING btree ("_order");
  CREATE INDEX "_homepage_sections_v_blocks_carousel_conditions_parent_id_idx" ON "_homepage_sections_v_blocks_carousel_conditions" USING btree ("_parent_id");
  CREATE INDEX "_homepage_sections_v_blocks_carousel_order_idx" ON "_homepage_sections_v_blocks_carousel" USING btree ("_order");
  CREATE INDEX "_homepage_sections_v_blocks_carousel_parent_id_idx" ON "_homepage_sections_v_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "_homepage_sections_v_blocks_carousel_path_idx" ON "_homepage_sections_v_blocks_carousel" USING btree ("_path");
  CREATE INDEX "_homepage_sections_v_blocks_carousel_surface_image_idx" ON "_homepage_sections_v_blocks_carousel" USING btree ("surface_image_id");
  CREATE INDEX "_homepage_sections_v_blocks_member_profiles_entries_order_idx" ON "_homepage_sections_v_blocks_member_profiles_entries" USING btree ("_order");
  CREATE INDEX "_homepage_sections_v_blocks_member_profiles_entries_parent_id_idx" ON "_homepage_sections_v_blocks_member_profiles_entries" USING btree ("_parent_id");
  CREATE INDEX "_homepage_sections_v_blocks_member_profiles_entries_prof_idx" ON "_homepage_sections_v_blocks_member_profiles_entries" USING btree ("profile_id");
  CREATE INDEX "_homepage_sections_v_blocks_member_profiles_order_idx" ON "_homepage_sections_v_blocks_member_profiles" USING btree ("_order");
  CREATE INDEX "_homepage_sections_v_blocks_member_profiles_parent_id_idx" ON "_homepage_sections_v_blocks_member_profiles" USING btree ("_parent_id");
  CREATE INDEX "_homepage_sections_v_blocks_member_profiles_path_idx" ON "_homepage_sections_v_blocks_member_profiles" USING btree ("_path");
  CREATE INDEX "_homepage_sections_v_blocks_member_profiles_surface_imag_idx" ON "_homepage_sections_v_blocks_member_profiles" USING btree ("surface_image_id");`)
}
