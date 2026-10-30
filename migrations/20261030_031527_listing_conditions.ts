import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_listing_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  CREATE TYPE "public"."enum_pages_blocks_listing_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between');
  CREATE TYPE "public"."event_time" AS ENUM('upcoming', 'past');
  CREATE TYPE "public"."enum_pages_blocks_carousel_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  CREATE TYPE "public"."enum_pages_blocks_carousel_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between');
  CREATE TYPE "public"."enum__pages_v_blocks_listing_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  CREATE TYPE "public"."enum__pages_v_blocks_listing_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between');
  CREATE TYPE "public"."enum__pages_v_blocks_carousel_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  CREATE TYPE "public"."enum__pages_v_blocks_carousel_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between');
  CREATE TYPE "public"."enum_posts_blocks_listing_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  CREATE TYPE "public"."enum_posts_blocks_listing_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between');
  CREATE TYPE "public"."enum_posts_blocks_carousel_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  CREATE TYPE "public"."enum_posts_blocks_carousel_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between');
  CREATE TYPE "public"."enum__posts_v_blocks_listing_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  CREATE TYPE "public"."enum__posts_v_blocks_listing_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between');
  CREATE TYPE "public"."enum__posts_v_blocks_carousel_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  CREATE TYPE "public"."enum__posts_v_blocks_carousel_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between');
  CREATE TYPE "public"."enum_events_blocks_listing_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  CREATE TYPE "public"."enum_events_blocks_listing_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between');
  CREATE TYPE "public"."enum_events_blocks_carousel_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  CREATE TYPE "public"."enum_events_blocks_carousel_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between');
  CREATE TYPE "public"."enum__events_v_blocks_listing_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  CREATE TYPE "public"."enum__events_v_blocks_listing_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between');
  CREATE TYPE "public"."enum__events_v_blocks_carousel_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  CREATE TYPE "public"."enum__events_v_blocks_carousel_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between');
  CREATE TYPE "public"."enum_event_cycles_blocks_listing_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  CREATE TYPE "public"."enum_event_cycles_blocks_listing_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between');
  CREATE TYPE "public"."enum_event_cycles_blocks_carousel_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  CREATE TYPE "public"."enum_event_cycles_blocks_carousel_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_listing_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_listing_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_carousel_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_carousel_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between');
  CREATE TYPE "public"."enum_partners_blocks_listing_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  CREATE TYPE "public"."enum_partners_blocks_listing_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between');
  CREATE TYPE "public"."enum_partners_blocks_carousel_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  CREATE TYPE "public"."enum_partners_blocks_carousel_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between');
  CREATE TYPE "public"."enum__partners_v_blocks_listing_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  CREATE TYPE "public"."enum__partners_v_blocks_listing_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between');
  CREATE TYPE "public"."enum__partners_v_blocks_carousel_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  CREATE TYPE "public"."enum__partners_v_blocks_carousel_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between');
  CREATE TYPE "public"."enum_homepage_sections_blocks_listing_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  CREATE TYPE "public"."enum_homepage_sections_blocks_listing_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between');
  CREATE TYPE "public"."enum_homepage_sections_blocks_carousel_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  CREATE TYPE "public"."enum_homepage_sections_blocks_carousel_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between');
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_listing_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_listing_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between');
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_carousel_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_carousel_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between');
  CREATE TABLE "pages_blocks_listing_conditions" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field" "enum_pages_blocks_listing_conditions_field",
  	"operator" "enum_pages_blocks_listing_conditions_operator",
  	"text_value" varchar,
  	"number_value" numeric,
  	"event_time_value" "event_time",
  	"date_value" varchar,
  	"end_date_value" varchar
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
  
  CREATE TABLE "_pages_v_blocks_listing_conditions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"field" "enum__pages_v_blocks_listing_conditions_field",
  	"operator" "enum__pages_v_blocks_listing_conditions_operator",
  	"text_value" varchar,
  	"number_value" numeric,
  	"event_time_value" "event_time",
  	"date_value" varchar,
  	"end_date_value" varchar,
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
  
  CREATE TABLE "posts_blocks_listing_conditions" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field" "enum_posts_blocks_listing_conditions_field",
  	"operator" "enum_posts_blocks_listing_conditions_operator",
  	"text_value" varchar,
  	"number_value" numeric,
  	"event_time_value" "event_time",
  	"date_value" varchar,
  	"end_date_value" varchar
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
  
  CREATE TABLE "_posts_v_blocks_listing_conditions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"field" "enum__posts_v_blocks_listing_conditions_field",
  	"operator" "enum__posts_v_blocks_listing_conditions_operator",
  	"text_value" varchar,
  	"number_value" numeric,
  	"event_time_value" "event_time",
  	"date_value" varchar,
  	"end_date_value" varchar,
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
  
  CREATE TABLE "events_blocks_listing_conditions" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field" "enum_events_blocks_listing_conditions_field",
  	"operator" "enum_events_blocks_listing_conditions_operator",
  	"text_value" varchar,
  	"number_value" numeric,
  	"event_time_value" "event_time",
  	"date_value" varchar,
  	"end_date_value" varchar
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
  
  CREATE TABLE "_events_v_blocks_listing_conditions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"field" "enum__events_v_blocks_listing_conditions_field",
  	"operator" "enum__events_v_blocks_listing_conditions_operator",
  	"text_value" varchar,
  	"number_value" numeric,
  	"event_time_value" "event_time",
  	"date_value" varchar,
  	"end_date_value" varchar,
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
  
  CREATE TABLE "event_cycles_blocks_listing_conditions" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field" "enum_event_cycles_blocks_listing_conditions_field",
  	"operator" "enum_event_cycles_blocks_listing_conditions_operator",
  	"text_value" varchar,
  	"number_value" numeric,
  	"event_time_value" "event_time",
  	"date_value" varchar,
  	"end_date_value" varchar
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
  
  CREATE TABLE "_event_cycles_v_blocks_listing_conditions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"field" "enum__event_cycles_v_blocks_listing_conditions_field",
  	"operator" "enum__event_cycles_v_blocks_listing_conditions_operator",
  	"text_value" varchar,
  	"number_value" numeric,
  	"event_time_value" "event_time",
  	"date_value" varchar,
  	"end_date_value" varchar,
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
  
  CREATE TABLE "partners_blocks_listing_conditions" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field" "enum_partners_blocks_listing_conditions_field",
  	"operator" "enum_partners_blocks_listing_conditions_operator",
  	"text_value" varchar,
  	"number_value" numeric,
  	"event_time_value" "event_time",
  	"date_value" varchar,
  	"end_date_value" varchar
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
  
  CREATE TABLE "_partners_v_blocks_listing_conditions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"field" "enum__partners_v_blocks_listing_conditions_field",
  	"operator" "enum__partners_v_blocks_listing_conditions_operator",
  	"text_value" varchar,
  	"number_value" numeric,
  	"event_time_value" "event_time",
  	"date_value" varchar,
  	"end_date_value" varchar,
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
  
  CREATE TABLE "homepage_sections_blocks_listing_conditions" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field" "enum_homepage_sections_blocks_listing_conditions_field",
  	"operator" "enum_homepage_sections_blocks_listing_conditions_operator",
  	"text_value" varchar,
  	"number_value" numeric,
  	"event_time_value" "event_time",
  	"date_value" varchar,
  	"end_date_value" varchar
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
  
  CREATE TABLE "_homepage_sections_v_blocks_listing_conditions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"field" "enum__homepage_sections_v_blocks_listing_conditions_field",
  	"operator" "enum__homepage_sections_v_blocks_listing_conditions_operator",
  	"text_value" varchar,
  	"number_value" numeric,
  	"event_time_value" "event_time",
  	"date_value" varchar,
  	"end_date_value" varchar,
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
  
  ALTER TABLE "pages_blocks_listing" DROP CONSTRAINT "pages_blocks_listing_parent_page_id_pages_id_fk";
  
  ALTER TABLE "pages_blocks_listing" DROP CONSTRAINT "pages_blocks_listing_category_id_categories_id_fk";
  
  ALTER TABLE "pages_blocks_listing" DROP CONSTRAINT "pages_blocks_listing_tag_id_tags_id_fk";
  
  ALTER TABLE "pages_blocks_listing" DROP CONSTRAINT "pages_blocks_listing_event_cycle_id_event_cycles_id_fk";
  
  ALTER TABLE "pages_blocks_carousel" DROP CONSTRAINT "pages_blocks_carousel_parent_page_id_pages_id_fk";
  
  ALTER TABLE "pages_blocks_carousel" DROP CONSTRAINT "pages_blocks_carousel_category_id_categories_id_fk";
  
  ALTER TABLE "pages_blocks_carousel" DROP CONSTRAINT "pages_blocks_carousel_tag_id_tags_id_fk";
  
  ALTER TABLE "pages_blocks_carousel" DROP CONSTRAINT "pages_blocks_carousel_event_cycle_id_event_cycles_id_fk";
  
  ALTER TABLE "_pages_v_blocks_listing" DROP CONSTRAINT "_pages_v_blocks_listing_parent_page_id_pages_id_fk";
  
  ALTER TABLE "_pages_v_blocks_listing" DROP CONSTRAINT "_pages_v_blocks_listing_category_id_categories_id_fk";
  
  ALTER TABLE "_pages_v_blocks_listing" DROP CONSTRAINT "_pages_v_blocks_listing_tag_id_tags_id_fk";
  
  ALTER TABLE "_pages_v_blocks_listing" DROP CONSTRAINT "_pages_v_blocks_listing_event_cycle_id_event_cycles_id_fk";
  
  ALTER TABLE "_pages_v_blocks_carousel" DROP CONSTRAINT "_pages_v_blocks_carousel_parent_page_id_pages_id_fk";
  
  ALTER TABLE "_pages_v_blocks_carousel" DROP CONSTRAINT "_pages_v_blocks_carousel_category_id_categories_id_fk";
  
  ALTER TABLE "_pages_v_blocks_carousel" DROP CONSTRAINT "_pages_v_blocks_carousel_tag_id_tags_id_fk";
  
  ALTER TABLE "_pages_v_blocks_carousel" DROP CONSTRAINT "_pages_v_blocks_carousel_event_cycle_id_event_cycles_id_fk";
  
  ALTER TABLE "posts_blocks_listing" DROP CONSTRAINT "posts_blocks_listing_parent_page_id_pages_id_fk";
  
  ALTER TABLE "posts_blocks_listing" DROP CONSTRAINT "posts_blocks_listing_category_id_categories_id_fk";
  
  ALTER TABLE "posts_blocks_listing" DROP CONSTRAINT "posts_blocks_listing_tag_id_tags_id_fk";
  
  ALTER TABLE "posts_blocks_listing" DROP CONSTRAINT "posts_blocks_listing_event_cycle_id_event_cycles_id_fk";
  
  ALTER TABLE "posts_blocks_carousel" DROP CONSTRAINT "posts_blocks_carousel_parent_page_id_pages_id_fk";
  
  ALTER TABLE "posts_blocks_carousel" DROP CONSTRAINT "posts_blocks_carousel_category_id_categories_id_fk";
  
  ALTER TABLE "posts_blocks_carousel" DROP CONSTRAINT "posts_blocks_carousel_tag_id_tags_id_fk";
  
  ALTER TABLE "posts_blocks_carousel" DROP CONSTRAINT "posts_blocks_carousel_event_cycle_id_event_cycles_id_fk";
  
  ALTER TABLE "_posts_v_blocks_listing" DROP CONSTRAINT "_posts_v_blocks_listing_parent_page_id_pages_id_fk";
  
  ALTER TABLE "_posts_v_blocks_listing" DROP CONSTRAINT "_posts_v_blocks_listing_category_id_categories_id_fk";
  
  ALTER TABLE "_posts_v_blocks_listing" DROP CONSTRAINT "_posts_v_blocks_listing_tag_id_tags_id_fk";
  
  ALTER TABLE "_posts_v_blocks_listing" DROP CONSTRAINT "_posts_v_blocks_listing_event_cycle_id_event_cycles_id_fk";
  
  ALTER TABLE "_posts_v_blocks_carousel" DROP CONSTRAINT "_posts_v_blocks_carousel_parent_page_id_pages_id_fk";
  
  ALTER TABLE "_posts_v_blocks_carousel" DROP CONSTRAINT "_posts_v_blocks_carousel_category_id_categories_id_fk";
  
  ALTER TABLE "_posts_v_blocks_carousel" DROP CONSTRAINT "_posts_v_blocks_carousel_tag_id_tags_id_fk";
  
  ALTER TABLE "_posts_v_blocks_carousel" DROP CONSTRAINT "_posts_v_blocks_carousel_event_cycle_id_event_cycles_id_fk";
  
  ALTER TABLE "events_blocks_listing" DROP CONSTRAINT "events_blocks_listing_parent_page_id_pages_id_fk";
  
  ALTER TABLE "events_blocks_listing" DROP CONSTRAINT "events_blocks_listing_category_id_categories_id_fk";
  
  ALTER TABLE "events_blocks_listing" DROP CONSTRAINT "events_blocks_listing_tag_id_tags_id_fk";
  
  ALTER TABLE "events_blocks_listing" DROP CONSTRAINT "events_blocks_listing_event_cycle_id_event_cycles_id_fk";
  
  ALTER TABLE "events_blocks_carousel" DROP CONSTRAINT "events_blocks_carousel_parent_page_id_pages_id_fk";
  
  ALTER TABLE "events_blocks_carousel" DROP CONSTRAINT "events_blocks_carousel_category_id_categories_id_fk";
  
  ALTER TABLE "events_blocks_carousel" DROP CONSTRAINT "events_blocks_carousel_tag_id_tags_id_fk";
  
  ALTER TABLE "events_blocks_carousel" DROP CONSTRAINT "events_blocks_carousel_event_cycle_id_event_cycles_id_fk";
  
  ALTER TABLE "_events_v_blocks_listing" DROP CONSTRAINT "_events_v_blocks_listing_parent_page_id_pages_id_fk";
  
  ALTER TABLE "_events_v_blocks_listing" DROP CONSTRAINT "_events_v_blocks_listing_category_id_categories_id_fk";
  
  ALTER TABLE "_events_v_blocks_listing" DROP CONSTRAINT "_events_v_blocks_listing_tag_id_tags_id_fk";
  
  ALTER TABLE "_events_v_blocks_listing" DROP CONSTRAINT "_events_v_blocks_listing_event_cycle_id_event_cycles_id_fk";
  
  ALTER TABLE "_events_v_blocks_carousel" DROP CONSTRAINT "_events_v_blocks_carousel_parent_page_id_pages_id_fk";
  
  ALTER TABLE "_events_v_blocks_carousel" DROP CONSTRAINT "_events_v_blocks_carousel_category_id_categories_id_fk";
  
  ALTER TABLE "_events_v_blocks_carousel" DROP CONSTRAINT "_events_v_blocks_carousel_tag_id_tags_id_fk";
  
  ALTER TABLE "_events_v_blocks_carousel" DROP CONSTRAINT "_events_v_blocks_carousel_event_cycle_id_event_cycles_id_fk";
  
  ALTER TABLE "event_cycles_blocks_listing" DROP CONSTRAINT "event_cycles_blocks_listing_parent_page_id_pages_id_fk";
  
  ALTER TABLE "event_cycles_blocks_listing" DROP CONSTRAINT "event_cycles_blocks_listing_category_id_categories_id_fk";
  
  ALTER TABLE "event_cycles_blocks_listing" DROP CONSTRAINT "event_cycles_blocks_listing_tag_id_tags_id_fk";
  
  ALTER TABLE "event_cycles_blocks_listing" DROP CONSTRAINT "event_cycles_blocks_listing_event_cycle_id_event_cycles_id_fk";
  
  ALTER TABLE "event_cycles_blocks_carousel" DROP CONSTRAINT "event_cycles_blocks_carousel_parent_page_id_pages_id_fk";
  
  ALTER TABLE "event_cycles_blocks_carousel" DROP CONSTRAINT "event_cycles_blocks_carousel_category_id_categories_id_fk";
  
  ALTER TABLE "event_cycles_blocks_carousel" DROP CONSTRAINT "event_cycles_blocks_carousel_tag_id_tags_id_fk";
  
  ALTER TABLE "event_cycles_blocks_carousel" DROP CONSTRAINT "event_cycles_blocks_carousel_event_cycle_id_event_cycles_id_fk";
  
  ALTER TABLE "_event_cycles_v_blocks_listing" DROP CONSTRAINT "_event_cycles_v_blocks_listing_parent_page_id_pages_id_fk";
  
  ALTER TABLE "_event_cycles_v_blocks_listing" DROP CONSTRAINT "_event_cycles_v_blocks_listing_category_id_categories_id_fk";
  
  ALTER TABLE "_event_cycles_v_blocks_listing" DROP CONSTRAINT "_event_cycles_v_blocks_listing_tag_id_tags_id_fk";
  
  ALTER TABLE "_event_cycles_v_blocks_listing" DROP CONSTRAINT "_event_cycles_v_blocks_listing_event_cycle_id_event_cycles_id_fk";
  
  ALTER TABLE "_event_cycles_v_blocks_carousel" DROP CONSTRAINT "_event_cycles_v_blocks_carousel_parent_page_id_pages_id_fk";
  
  ALTER TABLE "_event_cycles_v_blocks_carousel" DROP CONSTRAINT "_event_cycles_v_blocks_carousel_category_id_categories_id_fk";
  
  ALTER TABLE "_event_cycles_v_blocks_carousel" DROP CONSTRAINT "_event_cycles_v_blocks_carousel_tag_id_tags_id_fk";
  
  ALTER TABLE "_event_cycles_v_blocks_carousel" DROP CONSTRAINT "_event_cycles_v_blocks_carousel_event_cycle_id_event_cycles_id_fk";
  
  ALTER TABLE "partners_blocks_listing" DROP CONSTRAINT "partners_blocks_listing_parent_page_id_pages_id_fk";
  
  ALTER TABLE "partners_blocks_listing" DROP CONSTRAINT "partners_blocks_listing_category_id_categories_id_fk";
  
  ALTER TABLE "partners_blocks_listing" DROP CONSTRAINT "partners_blocks_listing_tag_id_tags_id_fk";
  
  ALTER TABLE "partners_blocks_listing" DROP CONSTRAINT "partners_blocks_listing_event_cycle_id_event_cycles_id_fk";
  
  ALTER TABLE "partners_blocks_carousel" DROP CONSTRAINT "partners_blocks_carousel_parent_page_id_pages_id_fk";
  
  ALTER TABLE "partners_blocks_carousel" DROP CONSTRAINT "partners_blocks_carousel_category_id_categories_id_fk";
  
  ALTER TABLE "partners_blocks_carousel" DROP CONSTRAINT "partners_blocks_carousel_tag_id_tags_id_fk";
  
  ALTER TABLE "partners_blocks_carousel" DROP CONSTRAINT "partners_blocks_carousel_event_cycle_id_event_cycles_id_fk";
  
  ALTER TABLE "_partners_v_blocks_listing" DROP CONSTRAINT "_partners_v_blocks_listing_parent_page_id_pages_id_fk";
  
  ALTER TABLE "_partners_v_blocks_listing" DROP CONSTRAINT "_partners_v_blocks_listing_category_id_categories_id_fk";
  
  ALTER TABLE "_partners_v_blocks_listing" DROP CONSTRAINT "_partners_v_blocks_listing_tag_id_tags_id_fk";
  
  ALTER TABLE "_partners_v_blocks_listing" DROP CONSTRAINT "_partners_v_blocks_listing_event_cycle_id_event_cycles_id_fk";
  
  ALTER TABLE "_partners_v_blocks_carousel" DROP CONSTRAINT "_partners_v_blocks_carousel_parent_page_id_pages_id_fk";
  
  ALTER TABLE "_partners_v_blocks_carousel" DROP CONSTRAINT "_partners_v_blocks_carousel_category_id_categories_id_fk";
  
  ALTER TABLE "_partners_v_blocks_carousel" DROP CONSTRAINT "_partners_v_blocks_carousel_tag_id_tags_id_fk";
  
  ALTER TABLE "_partners_v_blocks_carousel" DROP CONSTRAINT "_partners_v_blocks_carousel_event_cycle_id_event_cycles_id_fk";
  
  ALTER TABLE "homepage_sections_blocks_listing" DROP CONSTRAINT "homepage_sections_blocks_listing_parent_page_id_pages_id_fk";
  
  ALTER TABLE "homepage_sections_blocks_listing" DROP CONSTRAINT "homepage_sections_blocks_listing_category_id_categories_id_fk";
  
  ALTER TABLE "homepage_sections_blocks_listing" DROP CONSTRAINT "homepage_sections_blocks_listing_tag_id_tags_id_fk";
  
  ALTER TABLE "homepage_sections_blocks_listing" DROP CONSTRAINT "homepage_sections_blocks_listing_event_cycle_id_event_cycles_id_fk";
  
  ALTER TABLE "homepage_sections_blocks_carousel" DROP CONSTRAINT "homepage_sections_blocks_carousel_parent_page_id_pages_id_fk";
  
  ALTER TABLE "homepage_sections_blocks_carousel" DROP CONSTRAINT "homepage_sections_blocks_carousel_category_id_categories_id_fk";
  
  ALTER TABLE "homepage_sections_blocks_carousel" DROP CONSTRAINT "homepage_sections_blocks_carousel_tag_id_tags_id_fk";
  
  ALTER TABLE "homepage_sections_blocks_carousel" DROP CONSTRAINT "homepage_sections_blocks_carousel_event_cycle_id_event_cycles_id_fk";
  
  ALTER TABLE "_homepage_sections_v_blocks_listing" DROP CONSTRAINT "_homepage_sections_v_blocks_listing_parent_page_id_pages_id_fk";
  
  ALTER TABLE "_homepage_sections_v_blocks_listing" DROP CONSTRAINT "_homepage_sections_v_blocks_listing_category_id_categories_id_fk";
  
  ALTER TABLE "_homepage_sections_v_blocks_listing" DROP CONSTRAINT "_homepage_sections_v_blocks_listing_tag_id_tags_id_fk";
  
  ALTER TABLE "_homepage_sections_v_blocks_listing" DROP CONSTRAINT "_homepage_sections_v_blocks_listing_event_cycle_id_event_cycles_id_fk";
  
  ALTER TABLE "_homepage_sections_v_blocks_carousel" DROP CONSTRAINT "_homepage_sections_v_blocks_carousel_parent_page_id_pages_id_fk";
  
  ALTER TABLE "_homepage_sections_v_blocks_carousel" DROP CONSTRAINT "_homepage_sections_v_blocks_carousel_category_id_categories_id_fk";
  
  ALTER TABLE "_homepage_sections_v_blocks_carousel" DROP CONSTRAINT "_homepage_sections_v_blocks_carousel_tag_id_tags_id_fk";
  
  ALTER TABLE "_homepage_sections_v_blocks_carousel" DROP CONSTRAINT "_homepage_sections_v_blocks_carousel_event_cycle_id_event_cycles_id_fk";
  
  DROP INDEX "pages_blocks_listing_parent_page_idx";
  DROP INDEX "pages_blocks_listing_category_idx";
  DROP INDEX "pages_blocks_listing_tag_idx";
  DROP INDEX "pages_blocks_listing_event_cycle_idx";
  DROP INDEX "pages_blocks_carousel_parent_page_idx";
  DROP INDEX "pages_blocks_carousel_category_idx";
  DROP INDEX "pages_blocks_carousel_tag_idx";
  DROP INDEX "pages_blocks_carousel_event_cycle_idx";
  DROP INDEX "_pages_v_blocks_listing_parent_page_idx";
  DROP INDEX "_pages_v_blocks_listing_category_idx";
  DROP INDEX "_pages_v_blocks_listing_tag_idx";
  DROP INDEX "_pages_v_blocks_listing_event_cycle_idx";
  DROP INDEX "_pages_v_blocks_carousel_parent_page_idx";
  DROP INDEX "_pages_v_blocks_carousel_category_idx";
  DROP INDEX "_pages_v_blocks_carousel_tag_idx";
  DROP INDEX "_pages_v_blocks_carousel_event_cycle_idx";
  DROP INDEX "posts_blocks_listing_parent_page_idx";
  DROP INDEX "posts_blocks_listing_category_idx";
  DROP INDEX "posts_blocks_listing_tag_idx";
  DROP INDEX "posts_blocks_listing_event_cycle_idx";
  DROP INDEX "posts_blocks_carousel_parent_page_idx";
  DROP INDEX "posts_blocks_carousel_category_idx";
  DROP INDEX "posts_blocks_carousel_tag_idx";
  DROP INDEX "posts_blocks_carousel_event_cycle_idx";
  DROP INDEX "_posts_v_blocks_listing_parent_page_idx";
  DROP INDEX "_posts_v_blocks_listing_category_idx";
  DROP INDEX "_posts_v_blocks_listing_tag_idx";
  DROP INDEX "_posts_v_blocks_listing_event_cycle_idx";
  DROP INDEX "_posts_v_blocks_carousel_parent_page_idx";
  DROP INDEX "_posts_v_blocks_carousel_category_idx";
  DROP INDEX "_posts_v_blocks_carousel_tag_idx";
  DROP INDEX "_posts_v_blocks_carousel_event_cycle_idx";
  DROP INDEX "events_blocks_listing_parent_page_idx";
  DROP INDEX "events_blocks_listing_category_idx";
  DROP INDEX "events_blocks_listing_tag_idx";
  DROP INDEX "events_blocks_listing_event_cycle_idx";
  DROP INDEX "events_blocks_carousel_parent_page_idx";
  DROP INDEX "events_blocks_carousel_category_idx";
  DROP INDEX "events_blocks_carousel_tag_idx";
  DROP INDEX "events_blocks_carousel_event_cycle_idx";
  DROP INDEX "_events_v_blocks_listing_parent_page_idx";
  DROP INDEX "_events_v_blocks_listing_category_idx";
  DROP INDEX "_events_v_blocks_listing_tag_idx";
  DROP INDEX "_events_v_blocks_listing_event_cycle_idx";
  DROP INDEX "_events_v_blocks_carousel_parent_page_idx";
  DROP INDEX "_events_v_blocks_carousel_category_idx";
  DROP INDEX "_events_v_blocks_carousel_tag_idx";
  DROP INDEX "_events_v_blocks_carousel_event_cycle_idx";
  DROP INDEX "event_cycles_blocks_listing_parent_page_idx";
  DROP INDEX "event_cycles_blocks_listing_category_idx";
  DROP INDEX "event_cycles_blocks_listing_tag_idx";
  DROP INDEX "event_cycles_blocks_listing_event_cycle_idx";
  DROP INDEX "event_cycles_blocks_carousel_parent_page_idx";
  DROP INDEX "event_cycles_blocks_carousel_category_idx";
  DROP INDEX "event_cycles_blocks_carousel_tag_idx";
  DROP INDEX "event_cycles_blocks_carousel_event_cycle_idx";
  DROP INDEX "_event_cycles_v_blocks_listing_parent_page_idx";
  DROP INDEX "_event_cycles_v_blocks_listing_category_idx";
  DROP INDEX "_event_cycles_v_blocks_listing_tag_idx";
  DROP INDEX "_event_cycles_v_blocks_listing_event_cycle_idx";
  DROP INDEX "_event_cycles_v_blocks_carousel_parent_page_idx";
  DROP INDEX "_event_cycles_v_blocks_carousel_category_idx";
  DROP INDEX "_event_cycles_v_blocks_carousel_tag_idx";
  DROP INDEX "_event_cycles_v_blocks_carousel_event_cycle_idx";
  DROP INDEX "partners_blocks_listing_parent_page_idx";
  DROP INDEX "partners_blocks_listing_category_idx";
  DROP INDEX "partners_blocks_listing_tag_idx";
  DROP INDEX "partners_blocks_listing_event_cycle_idx";
  DROP INDEX "partners_blocks_carousel_parent_page_idx";
  DROP INDEX "partners_blocks_carousel_category_idx";
  DROP INDEX "partners_blocks_carousel_tag_idx";
  DROP INDEX "partners_blocks_carousel_event_cycle_idx";
  DROP INDEX "_partners_v_blocks_listing_parent_page_idx";
  DROP INDEX "_partners_v_blocks_listing_category_idx";
  DROP INDEX "_partners_v_blocks_listing_tag_idx";
  DROP INDEX "_partners_v_blocks_listing_event_cycle_idx";
  DROP INDEX "_partners_v_blocks_carousel_parent_page_idx";
  DROP INDEX "_partners_v_blocks_carousel_category_idx";
  DROP INDEX "_partners_v_blocks_carousel_tag_idx";
  DROP INDEX "_partners_v_blocks_carousel_event_cycle_idx";
  DROP INDEX "homepage_sections_blocks_listing_parent_page_idx";
  DROP INDEX "homepage_sections_blocks_listing_category_idx";
  DROP INDEX "homepage_sections_blocks_listing_tag_idx";
  DROP INDEX "homepage_sections_blocks_listing_event_cycle_idx";
  DROP INDEX "homepage_sections_blocks_carousel_parent_page_idx";
  DROP INDEX "homepage_sections_blocks_carousel_category_idx";
  DROP INDEX "homepage_sections_blocks_carousel_tag_idx";
  DROP INDEX "homepage_sections_blocks_carousel_event_cycle_idx";
  DROP INDEX "_homepage_sections_v_blocks_listing_parent_page_idx";
  DROP INDEX "_homepage_sections_v_blocks_listing_category_idx";
  DROP INDEX "_homepage_sections_v_blocks_listing_tag_idx";
  DROP INDEX "_homepage_sections_v_blocks_listing_event_cycle_idx";
  DROP INDEX "_homepage_sections_v_blocks_carousel_parent_page_idx";
  DROP INDEX "_homepage_sections_v_blocks_carousel_category_idx";
  DROP INDEX "_homepage_sections_v_blocks_carousel_tag_idx";
  DROP INDEX "_homepage_sections_v_blocks_carousel_event_cycle_idx";
  ALTER TABLE "content_listing_items" ADD COLUMN "normalized_title" varchar;
  ALTER TABLE "content_listing_items" ADD COLUMN "tag_search_index" varchar;
  ALTER TABLE "pages_rels" ADD COLUMN "categories_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "categories_id" integer;
  ALTER TABLE "posts_rels" ADD COLUMN "categories_id" integer;
  ALTER TABLE "_posts_v_rels" ADD COLUMN "categories_id" integer;
  ALTER TABLE "events_rels" ADD COLUMN "categories_id" integer;
  ALTER TABLE "_events_v_rels" ADD COLUMN "categories_id" integer;
  ALTER TABLE "event_cycles_rels" ADD COLUMN "categories_id" integer;
  ALTER TABLE "_event_cycles_v_rels" ADD COLUMN "categories_id" integer;
  ALTER TABLE "partners_rels" ADD COLUMN "categories_id" integer;
  ALTER TABLE "partners_rels" ADD COLUMN "tags_id" integer;
  ALTER TABLE "_partners_v_rels" ADD COLUMN "categories_id" integer;
  ALTER TABLE "_partners_v_rels" ADD COLUMN "tags_id" integer;
  ALTER TABLE "homepage_sections_rels" ADD COLUMN "categories_id" integer;
  ALTER TABLE "homepage_sections_rels" ADD COLUMN "tags_id" integer;
  ALTER TABLE "_homepage_sections_v_rels" ADD COLUMN "categories_id" integer;
  ALTER TABLE "_homepage_sections_v_rels" ADD COLUMN "tags_id" integer;
  ALTER TABLE "pages_blocks_listing_conditions" ADD CONSTRAINT "pages_blocks_listing_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_listing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_carousel_conditions" ADD CONSTRAINT "pages_blocks_carousel_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_listing_conditions" ADD CONSTRAINT "_pages_v_blocks_listing_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_listing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_carousel_conditions" ADD CONSTRAINT "_pages_v_blocks_carousel_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_listing_conditions" ADD CONSTRAINT "posts_blocks_listing_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_listing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_carousel_conditions" ADD CONSTRAINT "posts_blocks_carousel_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_listing_conditions" ADD CONSTRAINT "_posts_v_blocks_listing_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_listing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_carousel_conditions" ADD CONSTRAINT "_posts_v_blocks_carousel_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_blocks_listing_conditions" ADD CONSTRAINT "events_blocks_listing_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events_blocks_listing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_blocks_carousel_conditions" ADD CONSTRAINT "events_blocks_carousel_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_listing_conditions" ADD CONSTRAINT "_events_v_blocks_listing_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v_blocks_listing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_carousel_conditions" ADD CONSTRAINT "_events_v_blocks_carousel_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_listing_conditions" ADD CONSTRAINT "event_cycles_blocks_listing_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_cycles_blocks_listing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_carousel_conditions" ADD CONSTRAINT "event_cycles_blocks_carousel_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_cycles_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_listing_conditions" ADD CONSTRAINT "_event_cycles_v_blocks_listing_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_event_cycles_v_blocks_listing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_carousel_conditions" ADD CONSTRAINT "_event_cycles_v_blocks_carousel_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_event_cycles_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_blocks_listing_conditions" ADD CONSTRAINT "partners_blocks_listing_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners_blocks_listing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_blocks_carousel_conditions" ADD CONSTRAINT "partners_blocks_carousel_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_listing_conditions" ADD CONSTRAINT "_partners_v_blocks_listing_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partners_v_blocks_listing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_carousel_conditions" ADD CONSTRAINT "_partners_v_blocks_carousel_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partners_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_listing_conditions" ADD CONSTRAINT "homepage_sections_blocks_listing_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections_blocks_listing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_carousel_conditions" ADD CONSTRAINT "homepage_sections_blocks_carousel_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_listing_conditions" ADD CONSTRAINT "_homepage_sections_v_blocks_listing_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_sections_v_blocks_listing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_carousel_conditions" ADD CONSTRAINT "_homepage_sections_v_blocks_carousel_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_sections_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_listing_conditions_order_idx" ON "pages_blocks_listing_conditions" USING btree ("_order");
  CREATE INDEX "pages_blocks_listing_conditions_parent_id_idx" ON "pages_blocks_listing_conditions" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_carousel_conditions_order_idx" ON "pages_blocks_carousel_conditions" USING btree ("_order");
  CREATE INDEX "pages_blocks_carousel_conditions_parent_id_idx" ON "pages_blocks_carousel_conditions" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_listing_conditions_order_idx" ON "_pages_v_blocks_listing_conditions" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_listing_conditions_parent_id_idx" ON "_pages_v_blocks_listing_conditions" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_carousel_conditions_order_idx" ON "_pages_v_blocks_carousel_conditions" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_carousel_conditions_parent_id_idx" ON "_pages_v_blocks_carousel_conditions" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_listing_conditions_order_idx" ON "posts_blocks_listing_conditions" USING btree ("_order");
  CREATE INDEX "posts_blocks_listing_conditions_parent_id_idx" ON "posts_blocks_listing_conditions" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_carousel_conditions_order_idx" ON "posts_blocks_carousel_conditions" USING btree ("_order");
  CREATE INDEX "posts_blocks_carousel_conditions_parent_id_idx" ON "posts_blocks_carousel_conditions" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_listing_conditions_order_idx" ON "_posts_v_blocks_listing_conditions" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_listing_conditions_parent_id_idx" ON "_posts_v_blocks_listing_conditions" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_carousel_conditions_order_idx" ON "_posts_v_blocks_carousel_conditions" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_carousel_conditions_parent_id_idx" ON "_posts_v_blocks_carousel_conditions" USING btree ("_parent_id");
  CREATE INDEX "events_blocks_listing_conditions_order_idx" ON "events_blocks_listing_conditions" USING btree ("_order");
  CREATE INDEX "events_blocks_listing_conditions_parent_id_idx" ON "events_blocks_listing_conditions" USING btree ("_parent_id");
  CREATE INDEX "events_blocks_carousel_conditions_order_idx" ON "events_blocks_carousel_conditions" USING btree ("_order");
  CREATE INDEX "events_blocks_carousel_conditions_parent_id_idx" ON "events_blocks_carousel_conditions" USING btree ("_parent_id");
  CREATE INDEX "_events_v_blocks_listing_conditions_order_idx" ON "_events_v_blocks_listing_conditions" USING btree ("_order");
  CREATE INDEX "_events_v_blocks_listing_conditions_parent_id_idx" ON "_events_v_blocks_listing_conditions" USING btree ("_parent_id");
  CREATE INDEX "_events_v_blocks_carousel_conditions_order_idx" ON "_events_v_blocks_carousel_conditions" USING btree ("_order");
  CREATE INDEX "_events_v_blocks_carousel_conditions_parent_id_idx" ON "_events_v_blocks_carousel_conditions" USING btree ("_parent_id");
  CREATE INDEX "event_cycles_blocks_listing_conditions_order_idx" ON "event_cycles_blocks_listing_conditions" USING btree ("_order");
  CREATE INDEX "event_cycles_blocks_listing_conditions_parent_id_idx" ON "event_cycles_blocks_listing_conditions" USING btree ("_parent_id");
  CREATE INDEX "event_cycles_blocks_carousel_conditions_order_idx" ON "event_cycles_blocks_carousel_conditions" USING btree ("_order");
  CREATE INDEX "event_cycles_blocks_carousel_conditions_parent_id_idx" ON "event_cycles_blocks_carousel_conditions" USING btree ("_parent_id");
  CREATE INDEX "_event_cycles_v_blocks_listing_conditions_order_idx" ON "_event_cycles_v_blocks_listing_conditions" USING btree ("_order");
  CREATE INDEX "_event_cycles_v_blocks_listing_conditions_parent_id_idx" ON "_event_cycles_v_blocks_listing_conditions" USING btree ("_parent_id");
  CREATE INDEX "_event_cycles_v_blocks_carousel_conditions_order_idx" ON "_event_cycles_v_blocks_carousel_conditions" USING btree ("_order");
  CREATE INDEX "_event_cycles_v_blocks_carousel_conditions_parent_id_idx" ON "_event_cycles_v_blocks_carousel_conditions" USING btree ("_parent_id");
  CREATE INDEX "partners_blocks_listing_conditions_order_idx" ON "partners_blocks_listing_conditions" USING btree ("_order");
  CREATE INDEX "partners_blocks_listing_conditions_parent_id_idx" ON "partners_blocks_listing_conditions" USING btree ("_parent_id");
  CREATE INDEX "partners_blocks_carousel_conditions_order_idx" ON "partners_blocks_carousel_conditions" USING btree ("_order");
  CREATE INDEX "partners_blocks_carousel_conditions_parent_id_idx" ON "partners_blocks_carousel_conditions" USING btree ("_parent_id");
  CREATE INDEX "_partners_v_blocks_listing_conditions_order_idx" ON "_partners_v_blocks_listing_conditions" USING btree ("_order");
  CREATE INDEX "_partners_v_blocks_listing_conditions_parent_id_idx" ON "_partners_v_blocks_listing_conditions" USING btree ("_parent_id");
  CREATE INDEX "_partners_v_blocks_carousel_conditions_order_idx" ON "_partners_v_blocks_carousel_conditions" USING btree ("_order");
  CREATE INDEX "_partners_v_blocks_carousel_conditions_parent_id_idx" ON "_partners_v_blocks_carousel_conditions" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_blocks_listing_conditions_order_idx" ON "homepage_sections_blocks_listing_conditions" USING btree ("_order");
  CREATE INDEX "homepage_sections_blocks_listing_conditions_parent_id_idx" ON "homepage_sections_blocks_listing_conditions" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_blocks_carousel_conditions_order_idx" ON "homepage_sections_blocks_carousel_conditions" USING btree ("_order");
  CREATE INDEX "homepage_sections_blocks_carousel_conditions_parent_id_idx" ON "homepage_sections_blocks_carousel_conditions" USING btree ("_parent_id");
  CREATE INDEX "_homepage_sections_v_blocks_listing_conditions_order_idx" ON "_homepage_sections_v_blocks_listing_conditions" USING btree ("_order");
  CREATE INDEX "_homepage_sections_v_blocks_listing_conditions_parent_id_idx" ON "_homepage_sections_v_blocks_listing_conditions" USING btree ("_parent_id");
  CREATE INDEX "_homepage_sections_v_blocks_carousel_conditions_order_idx" ON "_homepage_sections_v_blocks_carousel_conditions" USING btree ("_order");
  CREATE INDEX "_homepage_sections_v_blocks_carousel_conditions_parent_id_idx" ON "_homepage_sections_v_blocks_carousel_conditions" USING btree ("_parent_id");
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_rels" ADD CONSTRAINT "event_cycles_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_rels" ADD CONSTRAINT "_event_cycles_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_rels" ADD CONSTRAINT "partners_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_rels" ADD CONSTRAINT "partners_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_rels" ADD CONSTRAINT "_partners_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_rels" ADD CONSTRAINT "_partners_v_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_rels" ADD CONSTRAINT "homepage_sections_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_rels" ADD CONSTRAINT "homepage_sections_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_rels" ADD CONSTRAINT "_homepage_sections_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_rels" ADD CONSTRAINT "_homepage_sections_v_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  UPDATE "content_listing_items"
  SET "normalized_title" = lower(btrim(normalize("title", NFKC)));
  UPDATE "content_listing_items" item
  SET "tag_search_index" = '|' || coalesce((
    SELECT string_agg(relation.tags_id::text, '|' ORDER BY relation.tags_id)
    FROM "content_listing_items_rels" relation
    WHERE relation.parent_id = item.id AND relation.tags_id IS NOT NULL
  ), '') || '|';
  ALTER TABLE "content_listing_items" ALTER COLUMN "normalized_title" SET NOT NULL;
  ALTER TABLE "content_listing_items" ALTER COLUMN "tag_search_index" SET NOT NULL;
  CREATE INDEX "content_listing_items_normalized_title_idx" ON "content_listing_items" USING btree ("normalized_title");
  CREATE INDEX "pages_rels_categories_id_idx" ON "pages_rels" USING btree ("categories_id");
  CREATE INDEX "_pages_v_rels_categories_id_idx" ON "_pages_v_rels" USING btree ("categories_id");
  CREATE INDEX "posts_rels_categories_id_idx" ON "posts_rels" USING btree ("categories_id");
  CREATE INDEX "_posts_v_rels_categories_id_idx" ON "_posts_v_rels" USING btree ("categories_id");
  CREATE INDEX "events_rels_categories_id_idx" ON "events_rels" USING btree ("categories_id");
  CREATE INDEX "_events_v_rels_categories_id_idx" ON "_events_v_rels" USING btree ("categories_id");
  CREATE INDEX "event_cycles_rels_categories_id_idx" ON "event_cycles_rels" USING btree ("categories_id");
  CREATE INDEX "_event_cycles_v_rels_categories_id_idx" ON "_event_cycles_v_rels" USING btree ("categories_id");
  CREATE INDEX "partners_rels_categories_id_idx" ON "partners_rels" USING btree ("categories_id");
  CREATE INDEX "partners_rels_tags_id_idx" ON "partners_rels" USING btree ("tags_id");
  CREATE INDEX "_partners_v_rels_categories_id_idx" ON "_partners_v_rels" USING btree ("categories_id");
  CREATE INDEX "_partners_v_rels_tags_id_idx" ON "_partners_v_rels" USING btree ("tags_id");
  CREATE INDEX "homepage_sections_rels_categories_id_idx" ON "homepage_sections_rels" USING btree ("categories_id");
  CREATE INDEX "homepage_sections_rels_tags_id_idx" ON "homepage_sections_rels" USING btree ("tags_id");
  CREATE INDEX "_homepage_sections_v_rels_categories_id_idx" ON "_homepage_sections_v_rels" USING btree ("categories_id");
  CREATE INDEX "_homepage_sections_v_rels_tags_id_idx" ON "_homepage_sections_v_rels" USING btree ("tags_id");

  DO $migration$
  DECLARE
    metadata record;
    identity_column text;
    current_page_expression text;
    current_cycle_expression text;
    invalid_current_parent_count integer;
  BEGIN
    FOR metadata IN
      SELECT *
      FROM (VALUES
        ('pages', false, 'pages_blocks_listing', 'pages_blocks_listing_conditions', 'pages_blocks_listing_sources', 'pages_rels'),
        ('pages', false, 'pages_blocks_carousel', 'pages_blocks_carousel_conditions', 'pages_blocks_carousel_sources', 'pages_rels'),
        ('pages', true, '_pages_v_blocks_listing', '_pages_v_blocks_listing_conditions', '_pages_v_blocks_listing_sources', '_pages_v_rels'),
        ('pages', true, '_pages_v_blocks_carousel', '_pages_v_blocks_carousel_conditions', '_pages_v_blocks_carousel_sources', '_pages_v_rels'),
        ('posts', false, 'posts_blocks_listing', 'posts_blocks_listing_conditions', 'posts_blocks_listing_sources', 'posts_rels'),
        ('posts', false, 'posts_blocks_carousel', 'posts_blocks_carousel_conditions', 'posts_blocks_carousel_sources', 'posts_rels'),
        ('posts', true, '_posts_v_blocks_listing', '_posts_v_blocks_listing_conditions', '_posts_v_blocks_listing_sources', '_posts_v_rels'),
        ('posts', true, '_posts_v_blocks_carousel', '_posts_v_blocks_carousel_conditions', '_posts_v_blocks_carousel_sources', '_posts_v_rels'),
        ('events', false, 'events_blocks_listing', 'events_blocks_listing_conditions', 'events_blocks_listing_sources', 'events_rels'),
        ('events', false, 'events_blocks_carousel', 'events_blocks_carousel_conditions', 'events_blocks_carousel_sources', 'events_rels'),
        ('events', true, '_events_v_blocks_listing', '_events_v_blocks_listing_conditions', '_events_v_blocks_listing_sources', '_events_v_rels'),
        ('events', true, '_events_v_blocks_carousel', '_events_v_blocks_carousel_conditions', '_events_v_blocks_carousel_sources', '_events_v_rels'),
        ('event-cycles', false, 'event_cycles_blocks_listing', 'event_cycles_blocks_listing_conditions', 'event_cycles_blocks_listing_sources', 'event_cycles_rels'),
        ('event-cycles', false, 'event_cycles_blocks_carousel', 'event_cycles_blocks_carousel_conditions', 'event_cycles_blocks_carousel_sources', 'event_cycles_rels'),
        ('event-cycles', true, '_event_cycles_v_blocks_listing', '_event_cycles_v_blocks_listing_conditions', '_event_cycles_v_blocks_listing_sources', '_event_cycles_v_rels'),
        ('event-cycles', true, '_event_cycles_v_blocks_carousel', '_event_cycles_v_blocks_carousel_conditions', '_event_cycles_v_blocks_carousel_sources', '_event_cycles_v_rels'),
        ('partners', false, 'partners_blocks_listing', 'partners_blocks_listing_conditions', 'partners_blocks_listing_sources', 'partners_rels'),
        ('partners', false, 'partners_blocks_carousel', 'partners_blocks_carousel_conditions', 'partners_blocks_carousel_sources', 'partners_rels'),
        ('partners', true, '_partners_v_blocks_listing', '_partners_v_blocks_listing_conditions', '_partners_v_blocks_listing_sources', '_partners_v_rels'),
        ('partners', true, '_partners_v_blocks_carousel', '_partners_v_blocks_carousel_conditions', '_partners_v_blocks_carousel_sources', '_partners_v_rels'),
        ('homepage-sections', false, 'homepage_sections_blocks_listing', 'homepage_sections_blocks_listing_conditions', 'homepage_sections_blocks_listing_sources', 'homepage_sections_rels'),
        ('homepage-sections', false, 'homepage_sections_blocks_carousel', 'homepage_sections_blocks_carousel_conditions', 'homepage_sections_blocks_carousel_sources', 'homepage_sections_rels'),
        ('homepage-sections', true, '_homepage_sections_v_blocks_listing', '_homepage_sections_v_blocks_listing_conditions', '_homepage_sections_v_blocks_listing_sources', '_homepage_sections_v_rels'),
        ('homepage-sections', true, '_homepage_sections_v_blocks_carousel', '_homepage_sections_v_blocks_carousel_conditions', '_homepage_sections_v_blocks_carousel_sources', '_homepage_sections_v_rels')
      ) AS migration_metadata(root_name, is_version, block_table, conditions_table, sources_table, relations_table)
    LOOP
      identity_column := CASE WHEN metadata.is_version THEN '_uuid' ELSE 'id' END;

      EXECUTE format(
        'INSERT INTO %I ("_order", "_parent_id", "field", "operator", %I)
         SELECT 0, block.id, %L, %L, md5(block.id::text || '':category'')
         FROM %I block
         WHERE block.selection_mode::text = ''filters''
           AND block.category_id IS NOT NULL
           AND EXISTS (SELECT 1 FROM %I source WHERE source.parent_id = block.id)',
        metadata.conditions_table, identity_column, 'category', 'inSubtree', metadata.block_table,
        metadata.sources_table
      );
      EXECUTE format(
        'INSERT INTO %I ("order", parent_id, path, categories_id)
         SELECT condition."_order", block."_parent_id",
           block."_path" || ''.'' || block."_order" || ''.conditions.'' || condition."_order" || ''.relationshipValue'',
           block.category_id
         FROM %I block
         JOIN %I condition ON condition."_parent_id" = block.id AND condition.field::text = ''category''',
        metadata.relations_table, metadata.block_table, metadata.conditions_table
      );

      EXECUTE format(
        'INSERT INTO %I ("_order", "_parent_id", "field", "operator", %I)
         SELECT (SELECT count(*) FROM %I existing WHERE existing."_parent_id" = block.id),
           block.id, %L, %L, md5(block.id::text || '':tag'')
         FROM %I block
         WHERE block.selection_mode::text = ''filters''
           AND block.tag_id IS NOT NULL
           AND EXISTS (SELECT 1 FROM %I source WHERE source.parent_id = block.id)',
        metadata.conditions_table, identity_column, metadata.conditions_table, 'tag', 'contains',
        metadata.block_table, metadata.sources_table
      );
      EXECUTE format(
        'INSERT INTO %I ("order", parent_id, path, tags_id)
         SELECT condition."_order", block."_parent_id",
           block."_path" || ''.'' || block."_order" || ''.conditions.'' || condition."_order" || ''.relationshipValue'',
           block.tag_id
         FROM %I block
         JOIN %I condition ON condition."_parent_id" = block.id AND condition.field::text = ''tag''',
        metadata.relations_table, metadata.block_table, metadata.conditions_table
      );

      IF metadata.root_name <> 'pages' THEN
        EXECUTE format(
          'SELECT count(*) FROM %I block
           WHERE block.selection_mode::text = ''filters''
             AND block.parent_filter::text = ''current''
             AND EXISTS (
               SELECT 1 FROM %I source
               WHERE source.parent_id = block.id AND source.value::text = ''pages''
             )',
          metadata.block_table, metadata.sources_table
        ) INTO invalid_current_parent_count;
        IF invalid_current_parent_count > 0 THEN
          RAISE EXCEPTION 'Cannot migrate parentFilter=current outside a Page document (%).', metadata.block_table;
        END IF;
      END IF;

      current_page_expression := CASE
        WHEN metadata.root_name = 'pages' AND metadata.is_version
          THEN '(SELECT version.parent_id FROM "_pages_v" version WHERE version.id = block."_parent_id")'
        WHEN metadata.root_name = 'pages' THEN 'block."_parent_id"'
        ELSE 'NULL'
      END;
      EXECUTE format(
        'INSERT INTO %I ("_order", "_parent_id", "field", "operator", %I)
         SELECT (SELECT count(*) FROM %I existing WHERE existing."_parent_id" = block.id),
           block.id, %L, %L, md5(block.id::text || '':parentPage'')
         FROM %I block
         WHERE block.selection_mode::text = ''filters''
           AND EXISTS (
             SELECT 1 FROM %I source
             WHERE source.parent_id = block.id AND source.value::text = ''pages''
           )
           AND CASE
             WHEN block.parent_filter::text = ''specific'' THEN block.parent_page_id
             WHEN block.parent_filter::text = ''current'' THEN %s
             ELSE NULL
           END IS NOT NULL',
        metadata.conditions_table, identity_column, metadata.conditions_table, 'parentPage', 'equals',
        metadata.block_table, metadata.sources_table, current_page_expression
      );
      EXECUTE format(
        'INSERT INTO %I ("order", parent_id, path, pages_id)
         SELECT condition."_order", block."_parent_id",
           block."_path" || ''.'' || block."_order" || ''.conditions.'' || condition."_order" || ''.relationshipValue'',
           CASE
             WHEN block.parent_filter::text = ''specific'' THEN block.parent_page_id
             WHEN block.parent_filter::text = ''current'' THEN %s
             ELSE NULL
           END
         FROM %I block
         JOIN %I condition ON condition."_parent_id" = block.id AND condition.field::text = ''parentPage''',
        metadata.relations_table, current_page_expression, metadata.block_table,
        metadata.conditions_table
      );

      current_cycle_expression := CASE
        WHEN metadata.root_name = 'event-cycles' AND metadata.is_version
          THEN '(SELECT version.parent_id FROM "_event_cycles_v" version WHERE version.id = block."_parent_id")'
        WHEN metadata.root_name = 'event-cycles' THEN 'block."_parent_id"'
        ELSE 'NULL'
      END;
      EXECUTE format(
        'INSERT INTO %I ("_order", "_parent_id", "field", "operator", %I)
         SELECT (SELECT count(*) FROM %I existing WHERE existing."_parent_id" = block.id),
           block.id, %L, %L, md5(block.id::text || '':eventCycle'')
         FROM %I block
         WHERE block.selection_mode::text = ''filters''
           AND EXISTS (
             SELECT 1 FROM %I source
             WHERE source.parent_id = block.id AND source.value::text = ''events''
           )
           AND coalesce(block.event_cycle_id, %s) IS NOT NULL',
        metadata.conditions_table, identity_column, metadata.conditions_table, 'eventCycle', 'equals',
        metadata.block_table, metadata.sources_table, current_cycle_expression
      );
      EXECUTE format(
        'INSERT INTO %I ("order", parent_id, path, event_cycles_id)
         SELECT condition."_order", block."_parent_id",
           block."_path" || ''.'' || block."_order" || ''.conditions.'' || condition."_order" || ''.relationshipValue'',
           coalesce(block.event_cycle_id, %s)
         FROM %I block
         JOIN %I condition ON condition."_parent_id" = block.id AND condition.field::text = ''eventCycle''',
        metadata.relations_table, current_cycle_expression, metadata.block_table,
        metadata.conditions_table
      );

      EXECUTE format(
        'INSERT INTO %I ("_order", "_parent_id", "field", "operator", %I, event_time_value)
         SELECT (SELECT count(*) FROM %I existing WHERE existing."_parent_id" = block.id),
           block.id, %L, %L, md5(block.id::text || '':eventTime''), block.event_time_filter::text::event_time
         FROM %I block
         WHERE block.selection_mode::text = ''filters''
           AND block.event_time_filter::text IN (''upcoming'', ''past'')
           AND EXISTS (
             SELECT 1 FROM %I source
             WHERE source.parent_id = block.id AND source.value::text = ''events''
           )',
        metadata.conditions_table, identity_column, metadata.conditions_table, 'eventTime', 'equals',
        metadata.block_table, metadata.sources_table
      );

      EXECUTE format(
        'INSERT INTO %I ("_order", "_parent_id", "field", "operator", %I, number_value)
         SELECT (SELECT count(*) FROM %I existing WHERE existing."_parent_id" = block.id),
           block.id, %L, %L, md5(block.id::text || '':significantDate''), block.max_age_days
         FROM %I block
         WHERE block.selection_mode::text = ''filters''
           AND block.max_age_days BETWEEN 1 AND 366
           AND EXISTS (
             SELECT 1 FROM %I source
             WHERE source.parent_id = block.id
               AND source.value::text IN (''posts'', ''events'', ''documents'')
           )',
        metadata.conditions_table, identity_column, metadata.conditions_table, 'significantDate',
        'notOlderThan', metadata.block_table, metadata.sources_table
      );
    END LOOP;
  END
  $migration$;

  ALTER TABLE "pages_blocks_listing" DROP COLUMN "parent_page_id";
  ALTER TABLE "pages_blocks_listing" DROP COLUMN "category_id";
  ALTER TABLE "pages_blocks_listing" DROP COLUMN "tag_id";
  ALTER TABLE "pages_blocks_listing" DROP COLUMN "event_time_filter";
  ALTER TABLE "pages_blocks_listing" DROP COLUMN "event_cycle_id";
  ALTER TABLE "pages_blocks_listing" DROP COLUMN "max_age_days";
  ALTER TABLE "pages_blocks_listing" DROP COLUMN "parent_filter";
  ALTER TABLE "pages_blocks_carousel" DROP COLUMN "parent_page_id";
  ALTER TABLE "pages_blocks_carousel" DROP COLUMN "category_id";
  ALTER TABLE "pages_blocks_carousel" DROP COLUMN "tag_id";
  ALTER TABLE "pages_blocks_carousel" DROP COLUMN "event_time_filter";
  ALTER TABLE "pages_blocks_carousel" DROP COLUMN "event_cycle_id";
  ALTER TABLE "pages_blocks_carousel" DROP COLUMN "max_age_days";
  ALTER TABLE "pages_blocks_carousel" DROP COLUMN "parent_filter";
  ALTER TABLE "_pages_v_blocks_listing" DROP COLUMN "parent_page_id";
  ALTER TABLE "_pages_v_blocks_listing" DROP COLUMN "category_id";
  ALTER TABLE "_pages_v_blocks_listing" DROP COLUMN "tag_id";
  ALTER TABLE "_pages_v_blocks_listing" DROP COLUMN "event_time_filter";
  ALTER TABLE "_pages_v_blocks_listing" DROP COLUMN "event_cycle_id";
  ALTER TABLE "_pages_v_blocks_listing" DROP COLUMN "max_age_days";
  ALTER TABLE "_pages_v_blocks_listing" DROP COLUMN "parent_filter";
  ALTER TABLE "_pages_v_blocks_carousel" DROP COLUMN "parent_page_id";
  ALTER TABLE "_pages_v_blocks_carousel" DROP COLUMN "category_id";
  ALTER TABLE "_pages_v_blocks_carousel" DROP COLUMN "tag_id";
  ALTER TABLE "_pages_v_blocks_carousel" DROP COLUMN "event_time_filter";
  ALTER TABLE "_pages_v_blocks_carousel" DROP COLUMN "event_cycle_id";
  ALTER TABLE "_pages_v_blocks_carousel" DROP COLUMN "max_age_days";
  ALTER TABLE "_pages_v_blocks_carousel" DROP COLUMN "parent_filter";
  ALTER TABLE "posts_blocks_listing" DROP COLUMN "parent_page_id";
  ALTER TABLE "posts_blocks_listing" DROP COLUMN "category_id";
  ALTER TABLE "posts_blocks_listing" DROP COLUMN "tag_id";
  ALTER TABLE "posts_blocks_listing" DROP COLUMN "event_time_filter";
  ALTER TABLE "posts_blocks_listing" DROP COLUMN "event_cycle_id";
  ALTER TABLE "posts_blocks_listing" DROP COLUMN "max_age_days";
  ALTER TABLE "posts_blocks_listing" DROP COLUMN "parent_filter";
  ALTER TABLE "posts_blocks_carousel" DROP COLUMN "parent_page_id";
  ALTER TABLE "posts_blocks_carousel" DROP COLUMN "category_id";
  ALTER TABLE "posts_blocks_carousel" DROP COLUMN "tag_id";
  ALTER TABLE "posts_blocks_carousel" DROP COLUMN "event_time_filter";
  ALTER TABLE "posts_blocks_carousel" DROP COLUMN "event_cycle_id";
  ALTER TABLE "posts_blocks_carousel" DROP COLUMN "max_age_days";
  ALTER TABLE "posts_blocks_carousel" DROP COLUMN "parent_filter";
  ALTER TABLE "_posts_v_blocks_listing" DROP COLUMN "parent_page_id";
  ALTER TABLE "_posts_v_blocks_listing" DROP COLUMN "category_id";
  ALTER TABLE "_posts_v_blocks_listing" DROP COLUMN "tag_id";
  ALTER TABLE "_posts_v_blocks_listing" DROP COLUMN "event_time_filter";
  ALTER TABLE "_posts_v_blocks_listing" DROP COLUMN "event_cycle_id";
  ALTER TABLE "_posts_v_blocks_listing" DROP COLUMN "max_age_days";
  ALTER TABLE "_posts_v_blocks_listing" DROP COLUMN "parent_filter";
  ALTER TABLE "_posts_v_blocks_carousel" DROP COLUMN "parent_page_id";
  ALTER TABLE "_posts_v_blocks_carousel" DROP COLUMN "category_id";
  ALTER TABLE "_posts_v_blocks_carousel" DROP COLUMN "tag_id";
  ALTER TABLE "_posts_v_blocks_carousel" DROP COLUMN "event_time_filter";
  ALTER TABLE "_posts_v_blocks_carousel" DROP COLUMN "event_cycle_id";
  ALTER TABLE "_posts_v_blocks_carousel" DROP COLUMN "max_age_days";
  ALTER TABLE "_posts_v_blocks_carousel" DROP COLUMN "parent_filter";
  ALTER TABLE "events_blocks_listing" DROP COLUMN "parent_page_id";
  ALTER TABLE "events_blocks_listing" DROP COLUMN "category_id";
  ALTER TABLE "events_blocks_listing" DROP COLUMN "tag_id";
  ALTER TABLE "events_blocks_listing" DROP COLUMN "event_time_filter";
  ALTER TABLE "events_blocks_listing" DROP COLUMN "event_cycle_id";
  ALTER TABLE "events_blocks_listing" DROP COLUMN "max_age_days";
  ALTER TABLE "events_blocks_listing" DROP COLUMN "parent_filter";
  ALTER TABLE "events_blocks_carousel" DROP COLUMN "parent_page_id";
  ALTER TABLE "events_blocks_carousel" DROP COLUMN "category_id";
  ALTER TABLE "events_blocks_carousel" DROP COLUMN "tag_id";
  ALTER TABLE "events_blocks_carousel" DROP COLUMN "event_time_filter";
  ALTER TABLE "events_blocks_carousel" DROP COLUMN "event_cycle_id";
  ALTER TABLE "events_blocks_carousel" DROP COLUMN "max_age_days";
  ALTER TABLE "events_blocks_carousel" DROP COLUMN "parent_filter";
  ALTER TABLE "_events_v_blocks_listing" DROP COLUMN "parent_page_id";
  ALTER TABLE "_events_v_blocks_listing" DROP COLUMN "category_id";
  ALTER TABLE "_events_v_blocks_listing" DROP COLUMN "tag_id";
  ALTER TABLE "_events_v_blocks_listing" DROP COLUMN "event_time_filter";
  ALTER TABLE "_events_v_blocks_listing" DROP COLUMN "event_cycle_id";
  ALTER TABLE "_events_v_blocks_listing" DROP COLUMN "max_age_days";
  ALTER TABLE "_events_v_blocks_listing" DROP COLUMN "parent_filter";
  ALTER TABLE "_events_v_blocks_carousel" DROP COLUMN "parent_page_id";
  ALTER TABLE "_events_v_blocks_carousel" DROP COLUMN "category_id";
  ALTER TABLE "_events_v_blocks_carousel" DROP COLUMN "tag_id";
  ALTER TABLE "_events_v_blocks_carousel" DROP COLUMN "event_time_filter";
  ALTER TABLE "_events_v_blocks_carousel" DROP COLUMN "event_cycle_id";
  ALTER TABLE "_events_v_blocks_carousel" DROP COLUMN "max_age_days";
  ALTER TABLE "_events_v_blocks_carousel" DROP COLUMN "parent_filter";
  ALTER TABLE "event_cycles_blocks_listing" DROP COLUMN "parent_page_id";
  ALTER TABLE "event_cycles_blocks_listing" DROP COLUMN "category_id";
  ALTER TABLE "event_cycles_blocks_listing" DROP COLUMN "tag_id";
  ALTER TABLE "event_cycles_blocks_listing" DROP COLUMN "event_time_filter";
  ALTER TABLE "event_cycles_blocks_listing" DROP COLUMN "event_cycle_id";
  ALTER TABLE "event_cycles_blocks_listing" DROP COLUMN "max_age_days";
  ALTER TABLE "event_cycles_blocks_listing" DROP COLUMN "parent_filter";
  ALTER TABLE "event_cycles_blocks_carousel" DROP COLUMN "parent_page_id";
  ALTER TABLE "event_cycles_blocks_carousel" DROP COLUMN "category_id";
  ALTER TABLE "event_cycles_blocks_carousel" DROP COLUMN "tag_id";
  ALTER TABLE "event_cycles_blocks_carousel" DROP COLUMN "event_time_filter";
  ALTER TABLE "event_cycles_blocks_carousel" DROP COLUMN "event_cycle_id";
  ALTER TABLE "event_cycles_blocks_carousel" DROP COLUMN "max_age_days";
  ALTER TABLE "event_cycles_blocks_carousel" DROP COLUMN "parent_filter";
  ALTER TABLE "_event_cycles_v_blocks_listing" DROP COLUMN "parent_page_id";
  ALTER TABLE "_event_cycles_v_blocks_listing" DROP COLUMN "category_id";
  ALTER TABLE "_event_cycles_v_blocks_listing" DROP COLUMN "tag_id";
  ALTER TABLE "_event_cycles_v_blocks_listing" DROP COLUMN "event_time_filter";
  ALTER TABLE "_event_cycles_v_blocks_listing" DROP COLUMN "event_cycle_id";
  ALTER TABLE "_event_cycles_v_blocks_listing" DROP COLUMN "max_age_days";
  ALTER TABLE "_event_cycles_v_blocks_listing" DROP COLUMN "parent_filter";
  ALTER TABLE "_event_cycles_v_blocks_carousel" DROP COLUMN "parent_page_id";
  ALTER TABLE "_event_cycles_v_blocks_carousel" DROP COLUMN "category_id";
  ALTER TABLE "_event_cycles_v_blocks_carousel" DROP COLUMN "tag_id";
  ALTER TABLE "_event_cycles_v_blocks_carousel" DROP COLUMN "event_time_filter";
  ALTER TABLE "_event_cycles_v_blocks_carousel" DROP COLUMN "event_cycle_id";
  ALTER TABLE "_event_cycles_v_blocks_carousel" DROP COLUMN "max_age_days";
  ALTER TABLE "_event_cycles_v_blocks_carousel" DROP COLUMN "parent_filter";
  ALTER TABLE "partners_blocks_listing" DROP COLUMN "parent_page_id";
  ALTER TABLE "partners_blocks_listing" DROP COLUMN "category_id";
  ALTER TABLE "partners_blocks_listing" DROP COLUMN "tag_id";
  ALTER TABLE "partners_blocks_listing" DROP COLUMN "event_time_filter";
  ALTER TABLE "partners_blocks_listing" DROP COLUMN "event_cycle_id";
  ALTER TABLE "partners_blocks_listing" DROP COLUMN "max_age_days";
  ALTER TABLE "partners_blocks_listing" DROP COLUMN "parent_filter";
  ALTER TABLE "partners_blocks_carousel" DROP COLUMN "parent_page_id";
  ALTER TABLE "partners_blocks_carousel" DROP COLUMN "category_id";
  ALTER TABLE "partners_blocks_carousel" DROP COLUMN "tag_id";
  ALTER TABLE "partners_blocks_carousel" DROP COLUMN "event_time_filter";
  ALTER TABLE "partners_blocks_carousel" DROP COLUMN "event_cycle_id";
  ALTER TABLE "partners_blocks_carousel" DROP COLUMN "max_age_days";
  ALTER TABLE "partners_blocks_carousel" DROP COLUMN "parent_filter";
  ALTER TABLE "_partners_v_blocks_listing" DROP COLUMN "parent_page_id";
  ALTER TABLE "_partners_v_blocks_listing" DROP COLUMN "category_id";
  ALTER TABLE "_partners_v_blocks_listing" DROP COLUMN "tag_id";
  ALTER TABLE "_partners_v_blocks_listing" DROP COLUMN "event_time_filter";
  ALTER TABLE "_partners_v_blocks_listing" DROP COLUMN "event_cycle_id";
  ALTER TABLE "_partners_v_blocks_listing" DROP COLUMN "max_age_days";
  ALTER TABLE "_partners_v_blocks_listing" DROP COLUMN "parent_filter";
  ALTER TABLE "_partners_v_blocks_carousel" DROP COLUMN "parent_page_id";
  ALTER TABLE "_partners_v_blocks_carousel" DROP COLUMN "category_id";
  ALTER TABLE "_partners_v_blocks_carousel" DROP COLUMN "tag_id";
  ALTER TABLE "_partners_v_blocks_carousel" DROP COLUMN "event_time_filter";
  ALTER TABLE "_partners_v_blocks_carousel" DROP COLUMN "event_cycle_id";
  ALTER TABLE "_partners_v_blocks_carousel" DROP COLUMN "max_age_days";
  ALTER TABLE "_partners_v_blocks_carousel" DROP COLUMN "parent_filter";
  ALTER TABLE "homepage_sections_blocks_listing" DROP COLUMN "parent_page_id";
  ALTER TABLE "homepage_sections_blocks_listing" DROP COLUMN "category_id";
  ALTER TABLE "homepage_sections_blocks_listing" DROP COLUMN "tag_id";
  ALTER TABLE "homepage_sections_blocks_listing" DROP COLUMN "event_time_filter";
  ALTER TABLE "homepage_sections_blocks_listing" DROP COLUMN "event_cycle_id";
  ALTER TABLE "homepage_sections_blocks_listing" DROP COLUMN "max_age_days";
  ALTER TABLE "homepage_sections_blocks_listing" DROP COLUMN "parent_filter";
  ALTER TABLE "homepage_sections_blocks_carousel" DROP COLUMN "parent_page_id";
  ALTER TABLE "homepage_sections_blocks_carousel" DROP COLUMN "category_id";
  ALTER TABLE "homepage_sections_blocks_carousel" DROP COLUMN "tag_id";
  ALTER TABLE "homepage_sections_blocks_carousel" DROP COLUMN "event_time_filter";
  ALTER TABLE "homepage_sections_blocks_carousel" DROP COLUMN "event_cycle_id";
  ALTER TABLE "homepage_sections_blocks_carousel" DROP COLUMN "max_age_days";
  ALTER TABLE "homepage_sections_blocks_carousel" DROP COLUMN "parent_filter";
  ALTER TABLE "_homepage_sections_v_blocks_listing" DROP COLUMN "parent_page_id";
  ALTER TABLE "_homepage_sections_v_blocks_listing" DROP COLUMN "category_id";
  ALTER TABLE "_homepage_sections_v_blocks_listing" DROP COLUMN "tag_id";
  ALTER TABLE "_homepage_sections_v_blocks_listing" DROP COLUMN "event_time_filter";
  ALTER TABLE "_homepage_sections_v_blocks_listing" DROP COLUMN "event_cycle_id";
  ALTER TABLE "_homepage_sections_v_blocks_listing" DROP COLUMN "max_age_days";
  ALTER TABLE "_homepage_sections_v_blocks_listing" DROP COLUMN "parent_filter";
  ALTER TABLE "_homepage_sections_v_blocks_carousel" DROP COLUMN "parent_page_id";
  ALTER TABLE "_homepage_sections_v_blocks_carousel" DROP COLUMN "category_id";
  ALTER TABLE "_homepage_sections_v_blocks_carousel" DROP COLUMN "tag_id";
  ALTER TABLE "_homepage_sections_v_blocks_carousel" DROP COLUMN "event_time_filter";
  ALTER TABLE "_homepage_sections_v_blocks_carousel" DROP COLUMN "event_cycle_id";
  ALTER TABLE "_homepage_sections_v_blocks_carousel" DROP COLUMN "max_age_days";
  ALTER TABLE "_homepage_sections_v_blocks_carousel" DROP COLUMN "parent_filter";
  DROP TYPE "public"."enum_pages_blocks_listing_event_time_filter";
  DROP TYPE "public"."enum_pages_blocks_listing_parent_filter";
  DROP TYPE "public"."enum_pages_blocks_carousel_event_time_filter";
  DROP TYPE "public"."enum_pages_blocks_carousel_parent_filter";
  DROP TYPE "public"."enum__pages_v_blocks_listing_event_time_filter";
  DROP TYPE "public"."enum__pages_v_blocks_listing_parent_filter";
  DROP TYPE "public"."enum__pages_v_blocks_carousel_event_time_filter";
  DROP TYPE "public"."enum__pages_v_blocks_carousel_parent_filter";
  DROP TYPE "public"."enum_posts_blocks_listing_event_time_filter";
  DROP TYPE "public"."enum_posts_blocks_listing_parent_filter";
  DROP TYPE "public"."enum_posts_blocks_carousel_event_time_filter";
  DROP TYPE "public"."enum_posts_blocks_carousel_parent_filter";
  DROP TYPE "public"."enum__posts_v_blocks_listing_event_time_filter";
  DROP TYPE "public"."enum__posts_v_blocks_listing_parent_filter";
  DROP TYPE "public"."enum__posts_v_blocks_carousel_event_time_filter";
  DROP TYPE "public"."enum__posts_v_blocks_carousel_parent_filter";
  DROP TYPE "public"."enum_events_blocks_listing_event_time_filter";
  DROP TYPE "public"."enum_events_blocks_listing_parent_filter";
  DROP TYPE "public"."enum_events_blocks_carousel_event_time_filter";
  DROP TYPE "public"."enum_events_blocks_carousel_parent_filter";
  DROP TYPE "public"."enum__events_v_blocks_listing_event_time_filter";
  DROP TYPE "public"."enum__events_v_blocks_listing_parent_filter";
  DROP TYPE "public"."enum__events_v_blocks_carousel_event_time_filter";
  DROP TYPE "public"."enum__events_v_blocks_carousel_parent_filter";
  DROP TYPE "public"."enum_event_cycles_blocks_listing_event_time_filter";
  DROP TYPE "public"."enum_event_cycles_blocks_listing_parent_filter";
  DROP TYPE "public"."enum_event_cycles_blocks_carousel_event_time_filter";
  DROP TYPE "public"."enum_event_cycles_blocks_carousel_parent_filter";
  DROP TYPE "public"."enum__event_cycles_v_blocks_listing_event_time_filter";
  DROP TYPE "public"."enum__event_cycles_v_blocks_listing_parent_filter";
  DROP TYPE "public"."enum__event_cycles_v_blocks_carousel_event_time_filter";
  DROP TYPE "public"."enum__event_cycles_v_blocks_carousel_parent_filter";
  DROP TYPE "public"."enum_partners_blocks_listing_event_time_filter";
  DROP TYPE "public"."enum_partners_blocks_listing_parent_filter";
  DROP TYPE "public"."enum_partners_blocks_carousel_event_time_filter";
  DROP TYPE "public"."enum_partners_blocks_carousel_parent_filter";
  DROP TYPE "public"."enum__partners_v_blocks_listing_event_time_filter";
  DROP TYPE "public"."enum__partners_v_blocks_listing_parent_filter";
  DROP TYPE "public"."enum__partners_v_blocks_carousel_event_time_filter";
  DROP TYPE "public"."enum__partners_v_blocks_carousel_parent_filter";
  DROP TYPE "public"."enum_homepage_sections_blocks_listing_event_time_filter";
  DROP TYPE "public"."enum_homepage_sections_blocks_listing_parent_filter";
  DROP TYPE "public"."enum_homepage_sections_blocks_carousel_event_time_filter";
  DROP TYPE "public"."enum_homepage_sections_blocks_carousel_parent_filter";
  DROP TYPE "public"."enum__homepage_sections_v_blocks_listing_event_time_filter";
  DROP TYPE "public"."enum__homepage_sections_v_blocks_listing_parent_filter";
  DROP TYPE "public"."enum__homepage_sections_v_blocks_carousel_event_time_filter";
  DROP TYPE "public"."enum__homepage_sections_v_blocks_carousel_parent_filter";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DO $migration$
  DECLARE
    metadata record;
    invalid_count integer;
  BEGIN
    FOR metadata IN
      SELECT *
      FROM (VALUES
        ('pages_blocks_listing', 'pages_blocks_listing_conditions', 'pages_blocks_listing_sources', 'pages_rels'),
        ('pages_blocks_carousel', 'pages_blocks_carousel_conditions', 'pages_blocks_carousel_sources', 'pages_rels'),
        ('_pages_v_blocks_listing', '_pages_v_blocks_listing_conditions', '_pages_v_blocks_listing_sources', '_pages_v_rels'),
        ('_pages_v_blocks_carousel', '_pages_v_blocks_carousel_conditions', '_pages_v_blocks_carousel_sources', '_pages_v_rels'),
        ('posts_blocks_listing', 'posts_blocks_listing_conditions', 'posts_blocks_listing_sources', 'posts_rels'),
        ('posts_blocks_carousel', 'posts_blocks_carousel_conditions', 'posts_blocks_carousel_sources', 'posts_rels'),
        ('_posts_v_blocks_listing', '_posts_v_blocks_listing_conditions', '_posts_v_blocks_listing_sources', '_posts_v_rels'),
        ('_posts_v_blocks_carousel', '_posts_v_blocks_carousel_conditions', '_posts_v_blocks_carousel_sources', '_posts_v_rels'),
        ('events_blocks_listing', 'events_blocks_listing_conditions', 'events_blocks_listing_sources', 'events_rels'),
        ('events_blocks_carousel', 'events_blocks_carousel_conditions', 'events_blocks_carousel_sources', 'events_rels'),
        ('_events_v_blocks_listing', '_events_v_blocks_listing_conditions', '_events_v_blocks_listing_sources', '_events_v_rels'),
        ('_events_v_blocks_carousel', '_events_v_blocks_carousel_conditions', '_events_v_blocks_carousel_sources', '_events_v_rels'),
        ('event_cycles_blocks_listing', 'event_cycles_blocks_listing_conditions', 'event_cycles_blocks_listing_sources', 'event_cycles_rels'),
        ('event_cycles_blocks_carousel', 'event_cycles_blocks_carousel_conditions', 'event_cycles_blocks_carousel_sources', 'event_cycles_rels'),
        ('_event_cycles_v_blocks_listing', '_event_cycles_v_blocks_listing_conditions', '_event_cycles_v_blocks_listing_sources', '_event_cycles_v_rels'),
        ('_event_cycles_v_blocks_carousel', '_event_cycles_v_blocks_carousel_conditions', '_event_cycles_v_blocks_carousel_sources', '_event_cycles_v_rels'),
        ('partners_blocks_listing', 'partners_blocks_listing_conditions', 'partners_blocks_listing_sources', 'partners_rels'),
        ('partners_blocks_carousel', 'partners_blocks_carousel_conditions', 'partners_blocks_carousel_sources', 'partners_rels'),
        ('_partners_v_blocks_listing', '_partners_v_blocks_listing_conditions', '_partners_v_blocks_listing_sources', '_partners_v_rels'),
        ('_partners_v_blocks_carousel', '_partners_v_blocks_carousel_conditions', '_partners_v_blocks_carousel_sources', '_partners_v_rels'),
        ('homepage_sections_blocks_listing', 'homepage_sections_blocks_listing_conditions', 'homepage_sections_blocks_listing_sources', 'homepage_sections_rels'),
        ('homepage_sections_blocks_carousel', 'homepage_sections_blocks_carousel_conditions', 'homepage_sections_blocks_carousel_sources', 'homepage_sections_rels'),
        ('_homepage_sections_v_blocks_listing', '_homepage_sections_v_blocks_listing_conditions', '_homepage_sections_v_blocks_listing_sources', '_homepage_sections_v_rels'),
        ('_homepage_sections_v_blocks_carousel', '_homepage_sections_v_blocks_carousel_conditions', '_homepage_sections_v_blocks_carousel_sources', '_homepage_sections_v_rels')
      ) AS migration_metadata(block_table, conditions_table, sources_table, relations_table)
    LOOP
      EXECUTE format(
        'SELECT count(*) FROM %I condition
         WHERE condition.field::text = ''title''
            OR (condition.field::text = ''category'' AND condition.operator::text <> ''inSubtree'')
            OR (condition.field::text = ''tag'' AND condition.operator::text <> ''contains'')
            OR (condition.field::text IN (''parentPage'', ''eventCycle'', ''eventTime'') AND condition.operator::text <> ''equals'')
            OR (condition.field::text = ''significantDate'' AND condition.operator::text <> ''notOlderThan'')',
        metadata.conditions_table
      ) INTO invalid_count;
      IF invalid_count > 0 THEN
        RAISE EXCEPTION 'Cannot roll back listing conditions in %: at least one condition has no lossless legacy representation.', metadata.conditions_table;
      END IF;

      EXECUTE format(
        'SELECT count(*) FROM (
           SELECT condition."_parent_id", condition.field
           FROM %I condition
           GROUP BY condition."_parent_id", condition.field
           HAVING count(*) > 1
         ) duplicate',
        metadata.conditions_table
      ) INTO invalid_count;
      IF invalid_count > 0 THEN
        RAISE EXCEPTION 'Cannot roll back listing conditions in %: repeated fields have no lossless legacy representation.', metadata.conditions_table;
      END IF;

      EXECUTE format(
        'SELECT count(*)
         FROM %I condition
         JOIN %I block ON block.id = condition."_parent_id"
         LEFT JOIN %I relation ON relation.parent_id = block."_parent_id"
           AND relation.path = block."_path" || ''.'' || block."_order" || ''.conditions.'' || condition."_order" || ''.relationshipValue''
         WHERE (condition.field::text = ''category'' AND relation.categories_id IS NULL)
            OR (condition.field::text = ''tag'' AND relation.tags_id IS NULL)
            OR (condition.field::text = ''parentPage'' AND relation.pages_id IS NULL)
            OR (condition.field::text = ''eventCycle'' AND relation.event_cycles_id IS NULL)
            OR (condition.field::text = ''eventTime'' AND condition.event_time_value IS NULL)
            OR (condition.field::text = ''significantDate'' AND (condition.number_value IS NULL OR condition.number_value NOT BETWEEN 1 AND 366))',
        metadata.conditions_table, metadata.block_table, metadata.relations_table
      ) INTO invalid_count;
      IF invalid_count > 0 THEN
        RAISE EXCEPTION 'Cannot roll back listing conditions in %: a condition is incomplete.', metadata.conditions_table;
      END IF;

      EXECUTE format(
        'SELECT count(*)
         FROM %I condition
         WHERE condition.field::text = ''parentPage''
           AND (
             NOT EXISTS (SELECT 1 FROM %I source WHERE source.parent_id = condition."_parent_id" AND source.value::text = ''pages'')
             OR EXISTS (SELECT 1 FROM %I source WHERE source.parent_id = condition."_parent_id" AND source.value::text <> ''pages'')
           )',
        metadata.conditions_table, metadata.sources_table, metadata.sources_table
      ) INTO invalid_count;
      IF invalid_count > 0 THEN
        RAISE EXCEPTION 'Cannot roll back parent-page conditions in %: the legacy field only supports Page-only listings.', metadata.conditions_table;
      END IF;
    END LOOP;
  END
  $migration$;

   CREATE TYPE "public"."enum_pages_blocks_listing_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum_pages_blocks_listing_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TYPE "public"."enum_pages_blocks_carousel_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum_pages_blocks_carousel_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TYPE "public"."enum__pages_v_blocks_listing_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum__pages_v_blocks_listing_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TYPE "public"."enum__pages_v_blocks_carousel_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum__pages_v_blocks_carousel_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TYPE "public"."enum_posts_blocks_listing_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum_posts_blocks_listing_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TYPE "public"."enum_posts_blocks_carousel_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum_posts_blocks_carousel_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TYPE "public"."enum__posts_v_blocks_listing_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum__posts_v_blocks_listing_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TYPE "public"."enum__posts_v_blocks_carousel_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum__posts_v_blocks_carousel_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TYPE "public"."enum_events_blocks_listing_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum_events_blocks_listing_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TYPE "public"."enum_events_blocks_carousel_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum_events_blocks_carousel_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TYPE "public"."enum__events_v_blocks_listing_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum__events_v_blocks_listing_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TYPE "public"."enum__events_v_blocks_carousel_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum__events_v_blocks_carousel_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TYPE "public"."enum_event_cycles_blocks_listing_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum_event_cycles_blocks_listing_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TYPE "public"."enum_event_cycles_blocks_carousel_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum_event_cycles_blocks_carousel_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_listing_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_listing_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_carousel_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_carousel_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TYPE "public"."enum_partners_blocks_listing_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum_partners_blocks_listing_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TYPE "public"."enum_partners_blocks_carousel_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum_partners_blocks_carousel_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TYPE "public"."enum__partners_v_blocks_listing_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum__partners_v_blocks_listing_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TYPE "public"."enum__partners_v_blocks_carousel_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum__partners_v_blocks_carousel_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TYPE "public"."enum_homepage_sections_blocks_listing_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum_homepage_sections_blocks_listing_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TYPE "public"."enum_homepage_sections_blocks_carousel_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum_homepage_sections_blocks_carousel_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_listing_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_listing_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_carousel_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_carousel_parent_filter" AS ENUM('none', 'current', 'specific');
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_categories_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_categories_fk";
  
  ALTER TABLE "posts_rels" DROP CONSTRAINT "posts_rels_categories_fk";
  
  ALTER TABLE "_posts_v_rels" DROP CONSTRAINT "_posts_v_rels_categories_fk";
  
  ALTER TABLE "events_rels" DROP CONSTRAINT "events_rels_categories_fk";
  
  ALTER TABLE "_events_v_rels" DROP CONSTRAINT "_events_v_rels_categories_fk";
  
  ALTER TABLE "event_cycles_rels" DROP CONSTRAINT "event_cycles_rels_categories_fk";
  
  ALTER TABLE "_event_cycles_v_rels" DROP CONSTRAINT "_event_cycles_v_rels_categories_fk";
  
  ALTER TABLE "partners_rels" DROP CONSTRAINT "partners_rels_categories_fk";
  
  ALTER TABLE "partners_rels" DROP CONSTRAINT "partners_rels_tags_fk";
  
  ALTER TABLE "_partners_v_rels" DROP CONSTRAINT "_partners_v_rels_categories_fk";
  
  ALTER TABLE "_partners_v_rels" DROP CONSTRAINT "_partners_v_rels_tags_fk";
  
  ALTER TABLE "homepage_sections_rels" DROP CONSTRAINT "homepage_sections_rels_categories_fk";
  
  ALTER TABLE "homepage_sections_rels" DROP CONSTRAINT "homepage_sections_rels_tags_fk";
  
  ALTER TABLE "_homepage_sections_v_rels" DROP CONSTRAINT "_homepage_sections_v_rels_categories_fk";
  
  ALTER TABLE "_homepage_sections_v_rels" DROP CONSTRAINT "_homepage_sections_v_rels_tags_fk";
  
  DROP INDEX "content_listing_items_normalized_title_idx";
  DROP INDEX "pages_rels_categories_id_idx";
  DROP INDEX "_pages_v_rels_categories_id_idx";
  DROP INDEX "posts_rels_categories_id_idx";
  DROP INDEX "_posts_v_rels_categories_id_idx";
  DROP INDEX "events_rels_categories_id_idx";
  DROP INDEX "_events_v_rels_categories_id_idx";
  DROP INDEX "event_cycles_rels_categories_id_idx";
  DROP INDEX "_event_cycles_v_rels_categories_id_idx";
  DROP INDEX "partners_rels_categories_id_idx";
  DROP INDEX "partners_rels_tags_id_idx";
  DROP INDEX "_partners_v_rels_categories_id_idx";
  DROP INDEX "_partners_v_rels_tags_id_idx";
  DROP INDEX "homepage_sections_rels_categories_id_idx";
  DROP INDEX "homepage_sections_rels_tags_id_idx";
  DROP INDEX "_homepage_sections_v_rels_categories_id_idx";
  DROP INDEX "_homepage_sections_v_rels_tags_id_idx";
  ALTER TABLE "pages_blocks_listing" ADD COLUMN "parent_page_id" integer;
  ALTER TABLE "pages_blocks_listing" ADD COLUMN "category_id" integer;
  ALTER TABLE "pages_blocks_listing" ADD COLUMN "tag_id" integer;
  ALTER TABLE "pages_blocks_listing" ADD COLUMN "event_time_filter" "enum_pages_blocks_listing_event_time_filter" DEFAULT 'all';
  ALTER TABLE "pages_blocks_listing" ADD COLUMN "event_cycle_id" integer;
  ALTER TABLE "pages_blocks_listing" ADD COLUMN "max_age_days" numeric DEFAULT 0;
  ALTER TABLE "pages_blocks_listing" ADD COLUMN "parent_filter" "enum_pages_blocks_listing_parent_filter" DEFAULT 'none';
  ALTER TABLE "pages_blocks_carousel" ADD COLUMN "parent_page_id" integer;
  ALTER TABLE "pages_blocks_carousel" ADD COLUMN "category_id" integer;
  ALTER TABLE "pages_blocks_carousel" ADD COLUMN "tag_id" integer;
  ALTER TABLE "pages_blocks_carousel" ADD COLUMN "event_time_filter" "enum_pages_blocks_carousel_event_time_filter" DEFAULT 'all';
  ALTER TABLE "pages_blocks_carousel" ADD COLUMN "event_cycle_id" integer;
  ALTER TABLE "pages_blocks_carousel" ADD COLUMN "max_age_days" numeric DEFAULT 0;
  ALTER TABLE "pages_blocks_carousel" ADD COLUMN "parent_filter" "enum_pages_blocks_carousel_parent_filter" DEFAULT 'none';
  ALTER TABLE "_pages_v_blocks_listing" ADD COLUMN "parent_page_id" integer;
  ALTER TABLE "_pages_v_blocks_listing" ADD COLUMN "category_id" integer;
  ALTER TABLE "_pages_v_blocks_listing" ADD COLUMN "tag_id" integer;
  ALTER TABLE "_pages_v_blocks_listing" ADD COLUMN "event_time_filter" "enum__pages_v_blocks_listing_event_time_filter" DEFAULT 'all';
  ALTER TABLE "_pages_v_blocks_listing" ADD COLUMN "event_cycle_id" integer;
  ALTER TABLE "_pages_v_blocks_listing" ADD COLUMN "max_age_days" numeric DEFAULT 0;
  ALTER TABLE "_pages_v_blocks_listing" ADD COLUMN "parent_filter" "enum__pages_v_blocks_listing_parent_filter" DEFAULT 'none';
  ALTER TABLE "_pages_v_blocks_carousel" ADD COLUMN "parent_page_id" integer;
  ALTER TABLE "_pages_v_blocks_carousel" ADD COLUMN "category_id" integer;
  ALTER TABLE "_pages_v_blocks_carousel" ADD COLUMN "tag_id" integer;
  ALTER TABLE "_pages_v_blocks_carousel" ADD COLUMN "event_time_filter" "enum__pages_v_blocks_carousel_event_time_filter" DEFAULT 'all';
  ALTER TABLE "_pages_v_blocks_carousel" ADD COLUMN "event_cycle_id" integer;
  ALTER TABLE "_pages_v_blocks_carousel" ADD COLUMN "max_age_days" numeric DEFAULT 0;
  ALTER TABLE "_pages_v_blocks_carousel" ADD COLUMN "parent_filter" "enum__pages_v_blocks_carousel_parent_filter" DEFAULT 'none';
  ALTER TABLE "posts_blocks_listing" ADD COLUMN "parent_page_id" integer;
  ALTER TABLE "posts_blocks_listing" ADD COLUMN "category_id" integer;
  ALTER TABLE "posts_blocks_listing" ADD COLUMN "tag_id" integer;
  ALTER TABLE "posts_blocks_listing" ADD COLUMN "event_time_filter" "enum_posts_blocks_listing_event_time_filter" DEFAULT 'all';
  ALTER TABLE "posts_blocks_listing" ADD COLUMN "event_cycle_id" integer;
  ALTER TABLE "posts_blocks_listing" ADD COLUMN "max_age_days" numeric DEFAULT 0;
  ALTER TABLE "posts_blocks_listing" ADD COLUMN "parent_filter" "enum_posts_blocks_listing_parent_filter" DEFAULT 'none';
  ALTER TABLE "posts_blocks_carousel" ADD COLUMN "parent_page_id" integer;
  ALTER TABLE "posts_blocks_carousel" ADD COLUMN "category_id" integer;
  ALTER TABLE "posts_blocks_carousel" ADD COLUMN "tag_id" integer;
  ALTER TABLE "posts_blocks_carousel" ADD COLUMN "event_time_filter" "enum_posts_blocks_carousel_event_time_filter" DEFAULT 'all';
  ALTER TABLE "posts_blocks_carousel" ADD COLUMN "event_cycle_id" integer;
  ALTER TABLE "posts_blocks_carousel" ADD COLUMN "max_age_days" numeric DEFAULT 0;
  ALTER TABLE "posts_blocks_carousel" ADD COLUMN "parent_filter" "enum_posts_blocks_carousel_parent_filter" DEFAULT 'none';
  ALTER TABLE "_posts_v_blocks_listing" ADD COLUMN "parent_page_id" integer;
  ALTER TABLE "_posts_v_blocks_listing" ADD COLUMN "category_id" integer;
  ALTER TABLE "_posts_v_blocks_listing" ADD COLUMN "tag_id" integer;
  ALTER TABLE "_posts_v_blocks_listing" ADD COLUMN "event_time_filter" "enum__posts_v_blocks_listing_event_time_filter" DEFAULT 'all';
  ALTER TABLE "_posts_v_blocks_listing" ADD COLUMN "event_cycle_id" integer;
  ALTER TABLE "_posts_v_blocks_listing" ADD COLUMN "max_age_days" numeric DEFAULT 0;
  ALTER TABLE "_posts_v_blocks_listing" ADD COLUMN "parent_filter" "enum__posts_v_blocks_listing_parent_filter" DEFAULT 'none';
  ALTER TABLE "_posts_v_blocks_carousel" ADD COLUMN "parent_page_id" integer;
  ALTER TABLE "_posts_v_blocks_carousel" ADD COLUMN "category_id" integer;
  ALTER TABLE "_posts_v_blocks_carousel" ADD COLUMN "tag_id" integer;
  ALTER TABLE "_posts_v_blocks_carousel" ADD COLUMN "event_time_filter" "enum__posts_v_blocks_carousel_event_time_filter" DEFAULT 'all';
  ALTER TABLE "_posts_v_blocks_carousel" ADD COLUMN "event_cycle_id" integer;
  ALTER TABLE "_posts_v_blocks_carousel" ADD COLUMN "max_age_days" numeric DEFAULT 0;
  ALTER TABLE "_posts_v_blocks_carousel" ADD COLUMN "parent_filter" "enum__posts_v_blocks_carousel_parent_filter" DEFAULT 'none';
  ALTER TABLE "events_blocks_listing" ADD COLUMN "parent_page_id" integer;
  ALTER TABLE "events_blocks_listing" ADD COLUMN "category_id" integer;
  ALTER TABLE "events_blocks_listing" ADD COLUMN "tag_id" integer;
  ALTER TABLE "events_blocks_listing" ADD COLUMN "event_time_filter" "enum_events_blocks_listing_event_time_filter" DEFAULT 'all';
  ALTER TABLE "events_blocks_listing" ADD COLUMN "event_cycle_id" integer;
  ALTER TABLE "events_blocks_listing" ADD COLUMN "max_age_days" numeric DEFAULT 0;
  ALTER TABLE "events_blocks_listing" ADD COLUMN "parent_filter" "enum_events_blocks_listing_parent_filter" DEFAULT 'none';
  ALTER TABLE "events_blocks_carousel" ADD COLUMN "parent_page_id" integer;
  ALTER TABLE "events_blocks_carousel" ADD COLUMN "category_id" integer;
  ALTER TABLE "events_blocks_carousel" ADD COLUMN "tag_id" integer;
  ALTER TABLE "events_blocks_carousel" ADD COLUMN "event_time_filter" "enum_events_blocks_carousel_event_time_filter" DEFAULT 'all';
  ALTER TABLE "events_blocks_carousel" ADD COLUMN "event_cycle_id" integer;
  ALTER TABLE "events_blocks_carousel" ADD COLUMN "max_age_days" numeric DEFAULT 0;
  ALTER TABLE "events_blocks_carousel" ADD COLUMN "parent_filter" "enum_events_blocks_carousel_parent_filter" DEFAULT 'none';
  ALTER TABLE "_events_v_blocks_listing" ADD COLUMN "parent_page_id" integer;
  ALTER TABLE "_events_v_blocks_listing" ADD COLUMN "category_id" integer;
  ALTER TABLE "_events_v_blocks_listing" ADD COLUMN "tag_id" integer;
  ALTER TABLE "_events_v_blocks_listing" ADD COLUMN "event_time_filter" "enum__events_v_blocks_listing_event_time_filter" DEFAULT 'all';
  ALTER TABLE "_events_v_blocks_listing" ADD COLUMN "event_cycle_id" integer;
  ALTER TABLE "_events_v_blocks_listing" ADD COLUMN "max_age_days" numeric DEFAULT 0;
  ALTER TABLE "_events_v_blocks_listing" ADD COLUMN "parent_filter" "enum__events_v_blocks_listing_parent_filter" DEFAULT 'none';
  ALTER TABLE "_events_v_blocks_carousel" ADD COLUMN "parent_page_id" integer;
  ALTER TABLE "_events_v_blocks_carousel" ADD COLUMN "category_id" integer;
  ALTER TABLE "_events_v_blocks_carousel" ADD COLUMN "tag_id" integer;
  ALTER TABLE "_events_v_blocks_carousel" ADD COLUMN "event_time_filter" "enum__events_v_blocks_carousel_event_time_filter" DEFAULT 'all';
  ALTER TABLE "_events_v_blocks_carousel" ADD COLUMN "event_cycle_id" integer;
  ALTER TABLE "_events_v_blocks_carousel" ADD COLUMN "max_age_days" numeric DEFAULT 0;
  ALTER TABLE "_events_v_blocks_carousel" ADD COLUMN "parent_filter" "enum__events_v_blocks_carousel_parent_filter" DEFAULT 'none';
  ALTER TABLE "event_cycles_blocks_listing" ADD COLUMN "parent_page_id" integer;
  ALTER TABLE "event_cycles_blocks_listing" ADD COLUMN "category_id" integer;
  ALTER TABLE "event_cycles_blocks_listing" ADD COLUMN "tag_id" integer;
  ALTER TABLE "event_cycles_blocks_listing" ADD COLUMN "event_time_filter" "enum_event_cycles_blocks_listing_event_time_filter" DEFAULT 'all';
  ALTER TABLE "event_cycles_blocks_listing" ADD COLUMN "event_cycle_id" integer;
  ALTER TABLE "event_cycles_blocks_listing" ADD COLUMN "max_age_days" numeric DEFAULT 0;
  ALTER TABLE "event_cycles_blocks_listing" ADD COLUMN "parent_filter" "enum_event_cycles_blocks_listing_parent_filter" DEFAULT 'none';
  ALTER TABLE "event_cycles_blocks_carousel" ADD COLUMN "parent_page_id" integer;
  ALTER TABLE "event_cycles_blocks_carousel" ADD COLUMN "category_id" integer;
  ALTER TABLE "event_cycles_blocks_carousel" ADD COLUMN "tag_id" integer;
  ALTER TABLE "event_cycles_blocks_carousel" ADD COLUMN "event_time_filter" "enum_event_cycles_blocks_carousel_event_time_filter" DEFAULT 'all';
  ALTER TABLE "event_cycles_blocks_carousel" ADD COLUMN "event_cycle_id" integer;
  ALTER TABLE "event_cycles_blocks_carousel" ADD COLUMN "max_age_days" numeric DEFAULT 0;
  ALTER TABLE "event_cycles_blocks_carousel" ADD COLUMN "parent_filter" "enum_event_cycles_blocks_carousel_parent_filter" DEFAULT 'none';
  ALTER TABLE "_event_cycles_v_blocks_listing" ADD COLUMN "parent_page_id" integer;
  ALTER TABLE "_event_cycles_v_blocks_listing" ADD COLUMN "category_id" integer;
  ALTER TABLE "_event_cycles_v_blocks_listing" ADD COLUMN "tag_id" integer;
  ALTER TABLE "_event_cycles_v_blocks_listing" ADD COLUMN "event_time_filter" "enum__event_cycles_v_blocks_listing_event_time_filter" DEFAULT 'all';
  ALTER TABLE "_event_cycles_v_blocks_listing" ADD COLUMN "event_cycle_id" integer;
  ALTER TABLE "_event_cycles_v_blocks_listing" ADD COLUMN "max_age_days" numeric DEFAULT 0;
  ALTER TABLE "_event_cycles_v_blocks_listing" ADD COLUMN "parent_filter" "enum__event_cycles_v_blocks_listing_parent_filter" DEFAULT 'none';
  ALTER TABLE "_event_cycles_v_blocks_carousel" ADD COLUMN "parent_page_id" integer;
  ALTER TABLE "_event_cycles_v_blocks_carousel" ADD COLUMN "category_id" integer;
  ALTER TABLE "_event_cycles_v_blocks_carousel" ADD COLUMN "tag_id" integer;
  ALTER TABLE "_event_cycles_v_blocks_carousel" ADD COLUMN "event_time_filter" "enum__event_cycles_v_blocks_carousel_event_time_filter" DEFAULT 'all';
  ALTER TABLE "_event_cycles_v_blocks_carousel" ADD COLUMN "event_cycle_id" integer;
  ALTER TABLE "_event_cycles_v_blocks_carousel" ADD COLUMN "max_age_days" numeric DEFAULT 0;
  ALTER TABLE "_event_cycles_v_blocks_carousel" ADD COLUMN "parent_filter" "enum__event_cycles_v_blocks_carousel_parent_filter" DEFAULT 'none';
  ALTER TABLE "partners_blocks_listing" ADD COLUMN "parent_page_id" integer;
  ALTER TABLE "partners_blocks_listing" ADD COLUMN "category_id" integer;
  ALTER TABLE "partners_blocks_listing" ADD COLUMN "tag_id" integer;
  ALTER TABLE "partners_blocks_listing" ADD COLUMN "event_time_filter" "enum_partners_blocks_listing_event_time_filter" DEFAULT 'all';
  ALTER TABLE "partners_blocks_listing" ADD COLUMN "event_cycle_id" integer;
  ALTER TABLE "partners_blocks_listing" ADD COLUMN "max_age_days" numeric DEFAULT 0;
  ALTER TABLE "partners_blocks_listing" ADD COLUMN "parent_filter" "enum_partners_blocks_listing_parent_filter" DEFAULT 'none';
  ALTER TABLE "partners_blocks_carousel" ADD COLUMN "parent_page_id" integer;
  ALTER TABLE "partners_blocks_carousel" ADD COLUMN "category_id" integer;
  ALTER TABLE "partners_blocks_carousel" ADD COLUMN "tag_id" integer;
  ALTER TABLE "partners_blocks_carousel" ADD COLUMN "event_time_filter" "enum_partners_blocks_carousel_event_time_filter" DEFAULT 'all';
  ALTER TABLE "partners_blocks_carousel" ADD COLUMN "event_cycle_id" integer;
  ALTER TABLE "partners_blocks_carousel" ADD COLUMN "max_age_days" numeric DEFAULT 0;
  ALTER TABLE "partners_blocks_carousel" ADD COLUMN "parent_filter" "enum_partners_blocks_carousel_parent_filter" DEFAULT 'none';
  ALTER TABLE "_partners_v_blocks_listing" ADD COLUMN "parent_page_id" integer;
  ALTER TABLE "_partners_v_blocks_listing" ADD COLUMN "category_id" integer;
  ALTER TABLE "_partners_v_blocks_listing" ADD COLUMN "tag_id" integer;
  ALTER TABLE "_partners_v_blocks_listing" ADD COLUMN "event_time_filter" "enum__partners_v_blocks_listing_event_time_filter" DEFAULT 'all';
  ALTER TABLE "_partners_v_blocks_listing" ADD COLUMN "event_cycle_id" integer;
  ALTER TABLE "_partners_v_blocks_listing" ADD COLUMN "max_age_days" numeric DEFAULT 0;
  ALTER TABLE "_partners_v_blocks_listing" ADD COLUMN "parent_filter" "enum__partners_v_blocks_listing_parent_filter" DEFAULT 'none';
  ALTER TABLE "_partners_v_blocks_carousel" ADD COLUMN "parent_page_id" integer;
  ALTER TABLE "_partners_v_blocks_carousel" ADD COLUMN "category_id" integer;
  ALTER TABLE "_partners_v_blocks_carousel" ADD COLUMN "tag_id" integer;
  ALTER TABLE "_partners_v_blocks_carousel" ADD COLUMN "event_time_filter" "enum__partners_v_blocks_carousel_event_time_filter" DEFAULT 'all';
  ALTER TABLE "_partners_v_blocks_carousel" ADD COLUMN "event_cycle_id" integer;
  ALTER TABLE "_partners_v_blocks_carousel" ADD COLUMN "max_age_days" numeric DEFAULT 0;
  ALTER TABLE "_partners_v_blocks_carousel" ADD COLUMN "parent_filter" "enum__partners_v_blocks_carousel_parent_filter" DEFAULT 'none';
  ALTER TABLE "homepage_sections_blocks_listing" ADD COLUMN "parent_page_id" integer;
  ALTER TABLE "homepage_sections_blocks_listing" ADD COLUMN "category_id" integer;
  ALTER TABLE "homepage_sections_blocks_listing" ADD COLUMN "tag_id" integer;
  ALTER TABLE "homepage_sections_blocks_listing" ADD COLUMN "event_time_filter" "enum_homepage_sections_blocks_listing_event_time_filter" DEFAULT 'all';
  ALTER TABLE "homepage_sections_blocks_listing" ADD COLUMN "event_cycle_id" integer;
  ALTER TABLE "homepage_sections_blocks_listing" ADD COLUMN "max_age_days" numeric DEFAULT 0;
  ALTER TABLE "homepage_sections_blocks_listing" ADD COLUMN "parent_filter" "enum_homepage_sections_blocks_listing_parent_filter" DEFAULT 'none';
  ALTER TABLE "homepage_sections_blocks_carousel" ADD COLUMN "parent_page_id" integer;
  ALTER TABLE "homepage_sections_blocks_carousel" ADD COLUMN "category_id" integer;
  ALTER TABLE "homepage_sections_blocks_carousel" ADD COLUMN "tag_id" integer;
  ALTER TABLE "homepage_sections_blocks_carousel" ADD COLUMN "event_time_filter" "enum_homepage_sections_blocks_carousel_event_time_filter" DEFAULT 'all';
  ALTER TABLE "homepage_sections_blocks_carousel" ADD COLUMN "event_cycle_id" integer;
  ALTER TABLE "homepage_sections_blocks_carousel" ADD COLUMN "max_age_days" numeric DEFAULT 0;
  ALTER TABLE "homepage_sections_blocks_carousel" ADD COLUMN "parent_filter" "enum_homepage_sections_blocks_carousel_parent_filter" DEFAULT 'none';
  ALTER TABLE "_homepage_sections_v_blocks_listing" ADD COLUMN "parent_page_id" integer;
  ALTER TABLE "_homepage_sections_v_blocks_listing" ADD COLUMN "category_id" integer;
  ALTER TABLE "_homepage_sections_v_blocks_listing" ADD COLUMN "tag_id" integer;
  ALTER TABLE "_homepage_sections_v_blocks_listing" ADD COLUMN "event_time_filter" "enum__homepage_sections_v_blocks_listing_event_time_filter" DEFAULT 'all';
  ALTER TABLE "_homepage_sections_v_blocks_listing" ADD COLUMN "event_cycle_id" integer;
  ALTER TABLE "_homepage_sections_v_blocks_listing" ADD COLUMN "max_age_days" numeric DEFAULT 0;
  ALTER TABLE "_homepage_sections_v_blocks_listing" ADD COLUMN "parent_filter" "enum__homepage_sections_v_blocks_listing_parent_filter" DEFAULT 'none';
  ALTER TABLE "_homepage_sections_v_blocks_carousel" ADD COLUMN "parent_page_id" integer;
  ALTER TABLE "_homepage_sections_v_blocks_carousel" ADD COLUMN "category_id" integer;
  ALTER TABLE "_homepage_sections_v_blocks_carousel" ADD COLUMN "tag_id" integer;
  ALTER TABLE "_homepage_sections_v_blocks_carousel" ADD COLUMN "event_time_filter" "enum__homepage_sections_v_blocks_carousel_event_time_filter" DEFAULT 'all';
  ALTER TABLE "_homepage_sections_v_blocks_carousel" ADD COLUMN "event_cycle_id" integer;
  ALTER TABLE "_homepage_sections_v_blocks_carousel" ADD COLUMN "max_age_days" numeric DEFAULT 0;
  ALTER TABLE "_homepage_sections_v_blocks_carousel" ADD COLUMN "parent_filter" "enum__homepage_sections_v_blocks_carousel_parent_filter" DEFAULT 'none';
  ALTER TABLE "pages_blocks_listing" ADD CONSTRAINT "pages_blocks_listing_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_listing" ADD CONSTRAINT "pages_blocks_listing_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_listing" ADD CONSTRAINT "pages_blocks_listing_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_listing" ADD CONSTRAINT "pages_blocks_listing_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_carousel" ADD CONSTRAINT "pages_blocks_carousel_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_carousel" ADD CONSTRAINT "pages_blocks_carousel_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_carousel" ADD CONSTRAINT "pages_blocks_carousel_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_carousel" ADD CONSTRAINT "pages_blocks_carousel_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_listing" ADD CONSTRAINT "_pages_v_blocks_listing_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_listing" ADD CONSTRAINT "_pages_v_blocks_listing_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_listing" ADD CONSTRAINT "_pages_v_blocks_listing_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_listing" ADD CONSTRAINT "_pages_v_blocks_listing_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_carousel" ADD CONSTRAINT "_pages_v_blocks_carousel_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_carousel" ADD CONSTRAINT "_pages_v_blocks_carousel_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_carousel" ADD CONSTRAINT "_pages_v_blocks_carousel_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_carousel" ADD CONSTRAINT "_pages_v_blocks_carousel_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_listing" ADD CONSTRAINT "posts_blocks_listing_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_listing" ADD CONSTRAINT "posts_blocks_listing_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_listing" ADD CONSTRAINT "posts_blocks_listing_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_listing" ADD CONSTRAINT "posts_blocks_listing_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_carousel" ADD CONSTRAINT "posts_blocks_carousel_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_carousel" ADD CONSTRAINT "posts_blocks_carousel_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_carousel" ADD CONSTRAINT "posts_blocks_carousel_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_carousel" ADD CONSTRAINT "posts_blocks_carousel_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_listing" ADD CONSTRAINT "_posts_v_blocks_listing_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_listing" ADD CONSTRAINT "_posts_v_blocks_listing_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_listing" ADD CONSTRAINT "_posts_v_blocks_listing_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_listing" ADD CONSTRAINT "_posts_v_blocks_listing_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_carousel" ADD CONSTRAINT "_posts_v_blocks_carousel_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_carousel" ADD CONSTRAINT "_posts_v_blocks_carousel_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_carousel" ADD CONSTRAINT "_posts_v_blocks_carousel_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_carousel" ADD CONSTRAINT "_posts_v_blocks_carousel_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_listing" ADD CONSTRAINT "events_blocks_listing_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_listing" ADD CONSTRAINT "events_blocks_listing_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_listing" ADD CONSTRAINT "events_blocks_listing_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_listing" ADD CONSTRAINT "events_blocks_listing_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_carousel" ADD CONSTRAINT "events_blocks_carousel_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_carousel" ADD CONSTRAINT "events_blocks_carousel_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_carousel" ADD CONSTRAINT "events_blocks_carousel_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_carousel" ADD CONSTRAINT "events_blocks_carousel_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_listing" ADD CONSTRAINT "_events_v_blocks_listing_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_listing" ADD CONSTRAINT "_events_v_blocks_listing_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_listing" ADD CONSTRAINT "_events_v_blocks_listing_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_listing" ADD CONSTRAINT "_events_v_blocks_listing_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_carousel" ADD CONSTRAINT "_events_v_blocks_carousel_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_carousel" ADD CONSTRAINT "_events_v_blocks_carousel_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_carousel" ADD CONSTRAINT "_events_v_blocks_carousel_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_carousel" ADD CONSTRAINT "_events_v_blocks_carousel_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_listing" ADD CONSTRAINT "event_cycles_blocks_listing_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_listing" ADD CONSTRAINT "event_cycles_blocks_listing_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_listing" ADD CONSTRAINT "event_cycles_blocks_listing_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_listing" ADD CONSTRAINT "event_cycles_blocks_listing_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_carousel" ADD CONSTRAINT "event_cycles_blocks_carousel_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_carousel" ADD CONSTRAINT "event_cycles_blocks_carousel_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_carousel" ADD CONSTRAINT "event_cycles_blocks_carousel_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_carousel" ADD CONSTRAINT "event_cycles_blocks_carousel_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_listing" ADD CONSTRAINT "_event_cycles_v_blocks_listing_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_listing" ADD CONSTRAINT "_event_cycles_v_blocks_listing_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_listing" ADD CONSTRAINT "_event_cycles_v_blocks_listing_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_listing" ADD CONSTRAINT "_event_cycles_v_blocks_listing_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_carousel" ADD CONSTRAINT "_event_cycles_v_blocks_carousel_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_carousel" ADD CONSTRAINT "_event_cycles_v_blocks_carousel_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_carousel" ADD CONSTRAINT "_event_cycles_v_blocks_carousel_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_carousel" ADD CONSTRAINT "_event_cycles_v_blocks_carousel_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_listing" ADD CONSTRAINT "partners_blocks_listing_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_listing" ADD CONSTRAINT "partners_blocks_listing_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_listing" ADD CONSTRAINT "partners_blocks_listing_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_listing" ADD CONSTRAINT "partners_blocks_listing_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_carousel" ADD CONSTRAINT "partners_blocks_carousel_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_carousel" ADD CONSTRAINT "partners_blocks_carousel_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_carousel" ADD CONSTRAINT "partners_blocks_carousel_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_carousel" ADD CONSTRAINT "partners_blocks_carousel_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_listing" ADD CONSTRAINT "_partners_v_blocks_listing_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_listing" ADD CONSTRAINT "_partners_v_blocks_listing_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_listing" ADD CONSTRAINT "_partners_v_blocks_listing_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_listing" ADD CONSTRAINT "_partners_v_blocks_listing_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_carousel" ADD CONSTRAINT "_partners_v_blocks_carousel_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_carousel" ADD CONSTRAINT "_partners_v_blocks_carousel_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_carousel" ADD CONSTRAINT "_partners_v_blocks_carousel_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_carousel" ADD CONSTRAINT "_partners_v_blocks_carousel_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_listing" ADD CONSTRAINT "homepage_sections_blocks_listing_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_listing" ADD CONSTRAINT "homepage_sections_blocks_listing_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_listing" ADD CONSTRAINT "homepage_sections_blocks_listing_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_listing" ADD CONSTRAINT "homepage_sections_blocks_listing_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_carousel" ADD CONSTRAINT "homepage_sections_blocks_carousel_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_carousel" ADD CONSTRAINT "homepage_sections_blocks_carousel_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_carousel" ADD CONSTRAINT "homepage_sections_blocks_carousel_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_carousel" ADD CONSTRAINT "homepage_sections_blocks_carousel_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_listing" ADD CONSTRAINT "_homepage_sections_v_blocks_listing_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_listing" ADD CONSTRAINT "_homepage_sections_v_blocks_listing_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_listing" ADD CONSTRAINT "_homepage_sections_v_blocks_listing_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_listing" ADD CONSTRAINT "_homepage_sections_v_blocks_listing_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_carousel" ADD CONSTRAINT "_homepage_sections_v_blocks_carousel_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_carousel" ADD CONSTRAINT "_homepage_sections_v_blocks_carousel_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_carousel" ADD CONSTRAINT "_homepage_sections_v_blocks_carousel_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_carousel" ADD CONSTRAINT "_homepage_sections_v_blocks_carousel_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_blocks_listing_parent_page_idx" ON "pages_blocks_listing" USING btree ("parent_page_id");
  CREATE INDEX "pages_blocks_listing_category_idx" ON "pages_blocks_listing" USING btree ("category_id");
  CREATE INDEX "pages_blocks_listing_tag_idx" ON "pages_blocks_listing" USING btree ("tag_id");
  CREATE INDEX "pages_blocks_listing_event_cycle_idx" ON "pages_blocks_listing" USING btree ("event_cycle_id");
  CREATE INDEX "pages_blocks_carousel_parent_page_idx" ON "pages_blocks_carousel" USING btree ("parent_page_id");
  CREATE INDEX "pages_blocks_carousel_category_idx" ON "pages_blocks_carousel" USING btree ("category_id");
  CREATE INDEX "pages_blocks_carousel_tag_idx" ON "pages_blocks_carousel" USING btree ("tag_id");
  CREATE INDEX "pages_blocks_carousel_event_cycle_idx" ON "pages_blocks_carousel" USING btree ("event_cycle_id");
  CREATE INDEX "_pages_v_blocks_listing_parent_page_idx" ON "_pages_v_blocks_listing" USING btree ("parent_page_id");
  CREATE INDEX "_pages_v_blocks_listing_category_idx" ON "_pages_v_blocks_listing" USING btree ("category_id");
  CREATE INDEX "_pages_v_blocks_listing_tag_idx" ON "_pages_v_blocks_listing" USING btree ("tag_id");
  CREATE INDEX "_pages_v_blocks_listing_event_cycle_idx" ON "_pages_v_blocks_listing" USING btree ("event_cycle_id");
  CREATE INDEX "_pages_v_blocks_carousel_parent_page_idx" ON "_pages_v_blocks_carousel" USING btree ("parent_page_id");
  CREATE INDEX "_pages_v_blocks_carousel_category_idx" ON "_pages_v_blocks_carousel" USING btree ("category_id");
  CREATE INDEX "_pages_v_blocks_carousel_tag_idx" ON "_pages_v_blocks_carousel" USING btree ("tag_id");
  CREATE INDEX "_pages_v_blocks_carousel_event_cycle_idx" ON "_pages_v_blocks_carousel" USING btree ("event_cycle_id");
  CREATE INDEX "posts_blocks_listing_parent_page_idx" ON "posts_blocks_listing" USING btree ("parent_page_id");
  CREATE INDEX "posts_blocks_listing_category_idx" ON "posts_blocks_listing" USING btree ("category_id");
  CREATE INDEX "posts_blocks_listing_tag_idx" ON "posts_blocks_listing" USING btree ("tag_id");
  CREATE INDEX "posts_blocks_listing_event_cycle_idx" ON "posts_blocks_listing" USING btree ("event_cycle_id");
  CREATE INDEX "posts_blocks_carousel_parent_page_idx" ON "posts_blocks_carousel" USING btree ("parent_page_id");
  CREATE INDEX "posts_blocks_carousel_category_idx" ON "posts_blocks_carousel" USING btree ("category_id");
  CREATE INDEX "posts_blocks_carousel_tag_idx" ON "posts_blocks_carousel" USING btree ("tag_id");
  CREATE INDEX "posts_blocks_carousel_event_cycle_idx" ON "posts_blocks_carousel" USING btree ("event_cycle_id");
  CREATE INDEX "_posts_v_blocks_listing_parent_page_idx" ON "_posts_v_blocks_listing" USING btree ("parent_page_id");
  CREATE INDEX "_posts_v_blocks_listing_category_idx" ON "_posts_v_blocks_listing" USING btree ("category_id");
  CREATE INDEX "_posts_v_blocks_listing_tag_idx" ON "_posts_v_blocks_listing" USING btree ("tag_id");
  CREATE INDEX "_posts_v_blocks_listing_event_cycle_idx" ON "_posts_v_blocks_listing" USING btree ("event_cycle_id");
  CREATE INDEX "_posts_v_blocks_carousel_parent_page_idx" ON "_posts_v_blocks_carousel" USING btree ("parent_page_id");
  CREATE INDEX "_posts_v_blocks_carousel_category_idx" ON "_posts_v_blocks_carousel" USING btree ("category_id");
  CREATE INDEX "_posts_v_blocks_carousel_tag_idx" ON "_posts_v_blocks_carousel" USING btree ("tag_id");
  CREATE INDEX "_posts_v_blocks_carousel_event_cycle_idx" ON "_posts_v_blocks_carousel" USING btree ("event_cycle_id");
  CREATE INDEX "events_blocks_listing_parent_page_idx" ON "events_blocks_listing" USING btree ("parent_page_id");
  CREATE INDEX "events_blocks_listing_category_idx" ON "events_blocks_listing" USING btree ("category_id");
  CREATE INDEX "events_blocks_listing_tag_idx" ON "events_blocks_listing" USING btree ("tag_id");
  CREATE INDEX "events_blocks_listing_event_cycle_idx" ON "events_blocks_listing" USING btree ("event_cycle_id");
  CREATE INDEX "events_blocks_carousel_parent_page_idx" ON "events_blocks_carousel" USING btree ("parent_page_id");
  CREATE INDEX "events_blocks_carousel_category_idx" ON "events_blocks_carousel" USING btree ("category_id");
  CREATE INDEX "events_blocks_carousel_tag_idx" ON "events_blocks_carousel" USING btree ("tag_id");
  CREATE INDEX "events_blocks_carousel_event_cycle_idx" ON "events_blocks_carousel" USING btree ("event_cycle_id");
  CREATE INDEX "_events_v_blocks_listing_parent_page_idx" ON "_events_v_blocks_listing" USING btree ("parent_page_id");
  CREATE INDEX "_events_v_blocks_listing_category_idx" ON "_events_v_blocks_listing" USING btree ("category_id");
  CREATE INDEX "_events_v_blocks_listing_tag_idx" ON "_events_v_blocks_listing" USING btree ("tag_id");
  CREATE INDEX "_events_v_blocks_listing_event_cycle_idx" ON "_events_v_blocks_listing" USING btree ("event_cycle_id");
  CREATE INDEX "_events_v_blocks_carousel_parent_page_idx" ON "_events_v_blocks_carousel" USING btree ("parent_page_id");
  CREATE INDEX "_events_v_blocks_carousel_category_idx" ON "_events_v_blocks_carousel" USING btree ("category_id");
  CREATE INDEX "_events_v_blocks_carousel_tag_idx" ON "_events_v_blocks_carousel" USING btree ("tag_id");
  CREATE INDEX "_events_v_blocks_carousel_event_cycle_idx" ON "_events_v_blocks_carousel" USING btree ("event_cycle_id");
  CREATE INDEX "event_cycles_blocks_listing_parent_page_idx" ON "event_cycles_blocks_listing" USING btree ("parent_page_id");
  CREATE INDEX "event_cycles_blocks_listing_category_idx" ON "event_cycles_blocks_listing" USING btree ("category_id");
  CREATE INDEX "event_cycles_blocks_listing_tag_idx" ON "event_cycles_blocks_listing" USING btree ("tag_id");
  CREATE INDEX "event_cycles_blocks_listing_event_cycle_idx" ON "event_cycles_blocks_listing" USING btree ("event_cycle_id");
  CREATE INDEX "event_cycles_blocks_carousel_parent_page_idx" ON "event_cycles_blocks_carousel" USING btree ("parent_page_id");
  CREATE INDEX "event_cycles_blocks_carousel_category_idx" ON "event_cycles_blocks_carousel" USING btree ("category_id");
  CREATE INDEX "event_cycles_blocks_carousel_tag_idx" ON "event_cycles_blocks_carousel" USING btree ("tag_id");
  CREATE INDEX "event_cycles_blocks_carousel_event_cycle_idx" ON "event_cycles_blocks_carousel" USING btree ("event_cycle_id");
  CREATE INDEX "_event_cycles_v_blocks_listing_parent_page_idx" ON "_event_cycles_v_blocks_listing" USING btree ("parent_page_id");
  CREATE INDEX "_event_cycles_v_blocks_listing_category_idx" ON "_event_cycles_v_blocks_listing" USING btree ("category_id");
  CREATE INDEX "_event_cycles_v_blocks_listing_tag_idx" ON "_event_cycles_v_blocks_listing" USING btree ("tag_id");
  CREATE INDEX "_event_cycles_v_blocks_listing_event_cycle_idx" ON "_event_cycles_v_blocks_listing" USING btree ("event_cycle_id");
  CREATE INDEX "_event_cycles_v_blocks_carousel_parent_page_idx" ON "_event_cycles_v_blocks_carousel" USING btree ("parent_page_id");
  CREATE INDEX "_event_cycles_v_blocks_carousel_category_idx" ON "_event_cycles_v_blocks_carousel" USING btree ("category_id");
  CREATE INDEX "_event_cycles_v_blocks_carousel_tag_idx" ON "_event_cycles_v_blocks_carousel" USING btree ("tag_id");
  CREATE INDEX "_event_cycles_v_blocks_carousel_event_cycle_idx" ON "_event_cycles_v_blocks_carousel" USING btree ("event_cycle_id");
  CREATE INDEX "partners_blocks_listing_parent_page_idx" ON "partners_blocks_listing" USING btree ("parent_page_id");
  CREATE INDEX "partners_blocks_listing_category_idx" ON "partners_blocks_listing" USING btree ("category_id");
  CREATE INDEX "partners_blocks_listing_tag_idx" ON "partners_blocks_listing" USING btree ("tag_id");
  CREATE INDEX "partners_blocks_listing_event_cycle_idx" ON "partners_blocks_listing" USING btree ("event_cycle_id");
  CREATE INDEX "partners_blocks_carousel_parent_page_idx" ON "partners_blocks_carousel" USING btree ("parent_page_id");
  CREATE INDEX "partners_blocks_carousel_category_idx" ON "partners_blocks_carousel" USING btree ("category_id");
  CREATE INDEX "partners_blocks_carousel_tag_idx" ON "partners_blocks_carousel" USING btree ("tag_id");
  CREATE INDEX "partners_blocks_carousel_event_cycle_idx" ON "partners_blocks_carousel" USING btree ("event_cycle_id");
  CREATE INDEX "_partners_v_blocks_listing_parent_page_idx" ON "_partners_v_blocks_listing" USING btree ("parent_page_id");
  CREATE INDEX "_partners_v_blocks_listing_category_idx" ON "_partners_v_blocks_listing" USING btree ("category_id");
  CREATE INDEX "_partners_v_blocks_listing_tag_idx" ON "_partners_v_blocks_listing" USING btree ("tag_id");
  CREATE INDEX "_partners_v_blocks_listing_event_cycle_idx" ON "_partners_v_blocks_listing" USING btree ("event_cycle_id");
  CREATE INDEX "_partners_v_blocks_carousel_parent_page_idx" ON "_partners_v_blocks_carousel" USING btree ("parent_page_id");
  CREATE INDEX "_partners_v_blocks_carousel_category_idx" ON "_partners_v_blocks_carousel" USING btree ("category_id");
  CREATE INDEX "_partners_v_blocks_carousel_tag_idx" ON "_partners_v_blocks_carousel" USING btree ("tag_id");
  CREATE INDEX "_partners_v_blocks_carousel_event_cycle_idx" ON "_partners_v_blocks_carousel" USING btree ("event_cycle_id");
  CREATE INDEX "homepage_sections_blocks_listing_parent_page_idx" ON "homepage_sections_blocks_listing" USING btree ("parent_page_id");
  CREATE INDEX "homepage_sections_blocks_listing_category_idx" ON "homepage_sections_blocks_listing" USING btree ("category_id");
  CREATE INDEX "homepage_sections_blocks_listing_tag_idx" ON "homepage_sections_blocks_listing" USING btree ("tag_id");
  CREATE INDEX "homepage_sections_blocks_listing_event_cycle_idx" ON "homepage_sections_blocks_listing" USING btree ("event_cycle_id");
  CREATE INDEX "homepage_sections_blocks_carousel_parent_page_idx" ON "homepage_sections_blocks_carousel" USING btree ("parent_page_id");
  CREATE INDEX "homepage_sections_blocks_carousel_category_idx" ON "homepage_sections_blocks_carousel" USING btree ("category_id");
  CREATE INDEX "homepage_sections_blocks_carousel_tag_idx" ON "homepage_sections_blocks_carousel" USING btree ("tag_id");
  CREATE INDEX "homepage_sections_blocks_carousel_event_cycle_idx" ON "homepage_sections_blocks_carousel" USING btree ("event_cycle_id");
  CREATE INDEX "_homepage_sections_v_blocks_listing_parent_page_idx" ON "_homepage_sections_v_blocks_listing" USING btree ("parent_page_id");
  CREATE INDEX "_homepage_sections_v_blocks_listing_category_idx" ON "_homepage_sections_v_blocks_listing" USING btree ("category_id");
  CREATE INDEX "_homepage_sections_v_blocks_listing_tag_idx" ON "_homepage_sections_v_blocks_listing" USING btree ("tag_id");
  CREATE INDEX "_homepage_sections_v_blocks_listing_event_cycle_idx" ON "_homepage_sections_v_blocks_listing" USING btree ("event_cycle_id");
  CREATE INDEX "_homepage_sections_v_blocks_carousel_parent_page_idx" ON "_homepage_sections_v_blocks_carousel" USING btree ("parent_page_id");
  CREATE INDEX "_homepage_sections_v_blocks_carousel_category_idx" ON "_homepage_sections_v_blocks_carousel" USING btree ("category_id");
  CREATE INDEX "_homepage_sections_v_blocks_carousel_tag_idx" ON "_homepage_sections_v_blocks_carousel" USING btree ("tag_id");
  CREATE INDEX "_homepage_sections_v_blocks_carousel_event_cycle_idx" ON "_homepage_sections_v_blocks_carousel" USING btree ("event_cycle_id");

  DO $migration$
  DECLARE
    metadata record;
    event_time_enum text;
    parent_filter_enum text;
  BEGIN
    FOR metadata IN
      SELECT *
      FROM (VALUES
        ('pages_blocks_listing', 'pages_blocks_listing_conditions', 'pages_rels'),
        ('pages_blocks_carousel', 'pages_blocks_carousel_conditions', 'pages_rels'),
        ('_pages_v_blocks_listing', '_pages_v_blocks_listing_conditions', '_pages_v_rels'),
        ('_pages_v_blocks_carousel', '_pages_v_blocks_carousel_conditions', '_pages_v_rels'),
        ('posts_blocks_listing', 'posts_blocks_listing_conditions', 'posts_rels'),
        ('posts_blocks_carousel', 'posts_blocks_carousel_conditions', 'posts_rels'),
        ('_posts_v_blocks_listing', '_posts_v_blocks_listing_conditions', '_posts_v_rels'),
        ('_posts_v_blocks_carousel', '_posts_v_blocks_carousel_conditions', '_posts_v_rels'),
        ('events_blocks_listing', 'events_blocks_listing_conditions', 'events_rels'),
        ('events_blocks_carousel', 'events_blocks_carousel_conditions', 'events_rels'),
        ('_events_v_blocks_listing', '_events_v_blocks_listing_conditions', '_events_v_rels'),
        ('_events_v_blocks_carousel', '_events_v_blocks_carousel_conditions', '_events_v_rels'),
        ('event_cycles_blocks_listing', 'event_cycles_blocks_listing_conditions', 'event_cycles_rels'),
        ('event_cycles_blocks_carousel', 'event_cycles_blocks_carousel_conditions', 'event_cycles_rels'),
        ('_event_cycles_v_blocks_listing', '_event_cycles_v_blocks_listing_conditions', '_event_cycles_v_rels'),
        ('_event_cycles_v_blocks_carousel', '_event_cycles_v_blocks_carousel_conditions', '_event_cycles_v_rels'),
        ('partners_blocks_listing', 'partners_blocks_listing_conditions', 'partners_rels'),
        ('partners_blocks_carousel', 'partners_blocks_carousel_conditions', 'partners_rels'),
        ('_partners_v_blocks_listing', '_partners_v_blocks_listing_conditions', '_partners_v_rels'),
        ('_partners_v_blocks_carousel', '_partners_v_blocks_carousel_conditions', '_partners_v_rels'),
        ('homepage_sections_blocks_listing', 'homepage_sections_blocks_listing_conditions', 'homepage_sections_rels'),
        ('homepage_sections_blocks_carousel', 'homepage_sections_blocks_carousel_conditions', 'homepage_sections_rels'),
        ('_homepage_sections_v_blocks_listing', '_homepage_sections_v_blocks_listing_conditions', '_homepage_sections_v_rels'),
        ('_homepage_sections_v_blocks_carousel', '_homepage_sections_v_blocks_carousel_conditions', '_homepage_sections_v_rels')
      ) AS migration_metadata(block_table, conditions_table, relations_table)
    LOOP
      event_time_enum := 'enum_' || metadata.block_table || '_event_time_filter';
      parent_filter_enum := 'enum_' || metadata.block_table || '_parent_filter';

      EXECUTE format(
        'UPDATE %I block SET category_id = relation.categories_id
         FROM %I condition, %I relation
         WHERE condition."_parent_id" = block.id
           AND condition.field::text = ''category''
           AND relation.parent_id = block."_parent_id"
           AND relation.path = block."_path" || ''.'' || block."_order" || ''.conditions.'' || condition."_order" || ''.relationshipValue''',
        metadata.block_table, metadata.conditions_table, metadata.relations_table
      );
      EXECUTE format(
        'UPDATE %I block SET tag_id = relation.tags_id
         FROM %I condition, %I relation
         WHERE condition."_parent_id" = block.id
           AND condition.field::text = ''tag''
           AND relation.parent_id = block."_parent_id"
           AND relation.path = block."_path" || ''.'' || block."_order" || ''.conditions.'' || condition."_order" || ''.relationshipValue''',
        metadata.block_table, metadata.conditions_table, metadata.relations_table
      );
      EXECUTE format(
        'UPDATE %I block
         SET parent_page_id = relation.pages_id, parent_filter = ''specific''::%I
         FROM %I condition, %I relation
         WHERE condition."_parent_id" = block.id
           AND condition.field::text = ''parentPage''
           AND relation.parent_id = block."_parent_id"
           AND relation.path = block."_path" || ''.'' || block."_order" || ''.conditions.'' || condition."_order" || ''.relationshipValue''',
        metadata.block_table, parent_filter_enum, metadata.conditions_table,
        metadata.relations_table
      );
      EXECUTE format(
        'UPDATE %I block SET event_cycle_id = relation.event_cycles_id
         FROM %I condition, %I relation
         WHERE condition."_parent_id" = block.id
           AND condition.field::text = ''eventCycle''
           AND relation.parent_id = block."_parent_id"
           AND relation.path = block."_path" || ''.'' || block."_order" || ''.conditions.'' || condition."_order" || ''.relationshipValue''',
        metadata.block_table, metadata.conditions_table, metadata.relations_table
      );
      EXECUTE format(
        'UPDATE %I block SET event_time_filter = condition.event_time_value::text::%I
         FROM %I condition
         WHERE condition."_parent_id" = block.id AND condition.field::text = ''eventTime''',
        metadata.block_table, event_time_enum, metadata.conditions_table
      );
      EXECUTE format(
        'UPDATE %I block SET max_age_days = condition.number_value
         FROM %I condition
         WHERE condition."_parent_id" = block.id AND condition.field::text = ''significantDate''',
        metadata.block_table, metadata.conditions_table
      );

      EXECUTE format(
        'DELETE FROM %I relation USING %I block
         WHERE relation.parent_id = block."_parent_id"
           AND relation.path LIKE block."_path" || ''.'' || block."_order" || ''.conditions.%%.relationshipValue''',
        metadata.relations_table, metadata.block_table
      );
      EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', metadata.conditions_table);
      EXECUTE format('DROP TABLE %I CASCADE', metadata.conditions_table);
    END LOOP;
  END
  $migration$;

  ALTER TABLE "content_listing_items" DROP COLUMN "normalized_title";
  ALTER TABLE "content_listing_items" DROP COLUMN "tag_search_index";
  ALTER TABLE "pages_rels" DROP COLUMN "categories_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "categories_id";
  ALTER TABLE "posts_rels" DROP COLUMN "categories_id";
  ALTER TABLE "_posts_v_rels" DROP COLUMN "categories_id";
  ALTER TABLE "events_rels" DROP COLUMN "categories_id";
  ALTER TABLE "_events_v_rels" DROP COLUMN "categories_id";
  ALTER TABLE "event_cycles_rels" DROP COLUMN "categories_id";
  ALTER TABLE "_event_cycles_v_rels" DROP COLUMN "categories_id";
  ALTER TABLE "partners_rels" DROP COLUMN "categories_id";
  ALTER TABLE "partners_rels" DROP COLUMN "tags_id";
  ALTER TABLE "_partners_v_rels" DROP COLUMN "categories_id";
  ALTER TABLE "_partners_v_rels" DROP COLUMN "tags_id";
  ALTER TABLE "homepage_sections_rels" DROP COLUMN "categories_id";
  ALTER TABLE "homepage_sections_rels" DROP COLUMN "tags_id";
  ALTER TABLE "_homepage_sections_v_rels" DROP COLUMN "categories_id";
  ALTER TABLE "_homepage_sections_v_rels" DROP COLUMN "tags_id";
  DROP TYPE "public"."enum_pages_blocks_listing_conditions_field";
  DROP TYPE "public"."enum_pages_blocks_listing_conditions_operator";
  DROP TYPE "public"."event_time";
  DROP TYPE "public"."enum_pages_blocks_carousel_conditions_field";
  DROP TYPE "public"."enum_pages_blocks_carousel_conditions_operator";
  DROP TYPE "public"."enum__pages_v_blocks_listing_conditions_field";
  DROP TYPE "public"."enum__pages_v_blocks_listing_conditions_operator";
  DROP TYPE "public"."enum__pages_v_blocks_carousel_conditions_field";
  DROP TYPE "public"."enum__pages_v_blocks_carousel_conditions_operator";
  DROP TYPE "public"."enum_posts_blocks_listing_conditions_field";
  DROP TYPE "public"."enum_posts_blocks_listing_conditions_operator";
  DROP TYPE "public"."enum_posts_blocks_carousel_conditions_field";
  DROP TYPE "public"."enum_posts_blocks_carousel_conditions_operator";
  DROP TYPE "public"."enum__posts_v_blocks_listing_conditions_field";
  DROP TYPE "public"."enum__posts_v_blocks_listing_conditions_operator";
  DROP TYPE "public"."enum__posts_v_blocks_carousel_conditions_field";
  DROP TYPE "public"."enum__posts_v_blocks_carousel_conditions_operator";
  DROP TYPE "public"."enum_events_blocks_listing_conditions_field";
  DROP TYPE "public"."enum_events_blocks_listing_conditions_operator";
  DROP TYPE "public"."enum_events_blocks_carousel_conditions_field";
  DROP TYPE "public"."enum_events_blocks_carousel_conditions_operator";
  DROP TYPE "public"."enum__events_v_blocks_listing_conditions_field";
  DROP TYPE "public"."enum__events_v_blocks_listing_conditions_operator";
  DROP TYPE "public"."enum__events_v_blocks_carousel_conditions_field";
  DROP TYPE "public"."enum__events_v_blocks_carousel_conditions_operator";
  DROP TYPE "public"."enum_event_cycles_blocks_listing_conditions_field";
  DROP TYPE "public"."enum_event_cycles_blocks_listing_conditions_operator";
  DROP TYPE "public"."enum_event_cycles_blocks_carousel_conditions_field";
  DROP TYPE "public"."enum_event_cycles_blocks_carousel_conditions_operator";
  DROP TYPE "public"."enum__event_cycles_v_blocks_listing_conditions_field";
  DROP TYPE "public"."enum__event_cycles_v_blocks_listing_conditions_operator";
  DROP TYPE "public"."enum__event_cycles_v_blocks_carousel_conditions_field";
  DROP TYPE "public"."enum__event_cycles_v_blocks_carousel_conditions_operator";
  DROP TYPE "public"."enum_partners_blocks_listing_conditions_field";
  DROP TYPE "public"."enum_partners_blocks_listing_conditions_operator";
  DROP TYPE "public"."enum_partners_blocks_carousel_conditions_field";
  DROP TYPE "public"."enum_partners_blocks_carousel_conditions_operator";
  DROP TYPE "public"."enum__partners_v_blocks_listing_conditions_field";
  DROP TYPE "public"."enum__partners_v_blocks_listing_conditions_operator";
  DROP TYPE "public"."enum__partners_v_blocks_carousel_conditions_field";
  DROP TYPE "public"."enum__partners_v_blocks_carousel_conditions_operator";
  DROP TYPE "public"."enum_homepage_sections_blocks_listing_conditions_field";
  DROP TYPE "public"."enum_homepage_sections_blocks_listing_conditions_operator";
  DROP TYPE "public"."enum_homepage_sections_blocks_carousel_conditions_field";
  DROP TYPE "public"."enum_homepage_sections_blocks_carousel_conditions_operator";
  DROP TYPE "public"."enum__homepage_sections_v_blocks_listing_conditions_field";
  DROP TYPE "public"."enum__homepage_sections_v_blocks_listing_conditions_operator";
  DROP TYPE "public"."enum__homepage_sections_v_blocks_carousel_conditions_field";
  DROP TYPE "public"."enum__homepage_sections_v_blocks_carousel_conditions_operator";`)
}
