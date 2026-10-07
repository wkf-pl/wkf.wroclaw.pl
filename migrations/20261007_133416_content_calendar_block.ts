import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_content_calendar_sources" AS ENUM('events', 'posts');
  CREATE TYPE "public"."enum__pages_v_blocks_content_calendar_sources" AS ENUM('events', 'posts');
  CREATE TYPE "public"."enum_posts_blocks_content_calendar_sources" AS ENUM('events', 'posts');
  CREATE TYPE "public"."enum__posts_v_blocks_content_calendar_sources" AS ENUM('events', 'posts');
  CREATE TYPE "public"."enum_events_blocks_content_calendar_sources" AS ENUM('events', 'posts');
  CREATE TYPE "public"."enum__events_v_blocks_content_calendar_sources" AS ENUM('events', 'posts');
  CREATE TYPE "public"."enum_event_cycles_blocks_content_calendar_sources" AS ENUM('events', 'posts');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_content_calendar_sources" AS ENUM('events', 'posts');
  CREATE TYPE "public"."enum_partners_blocks_content_calendar_sources" AS ENUM('events', 'posts');
  CREATE TYPE "public"."enum__partners_v_blocks_content_calendar_sources" AS ENUM('events', 'posts');
  CREATE TYPE "public"."enum_homepage_sections_blocks_content_calendar_sources" AS ENUM('events', 'posts');
  CREATE TABLE "pages_blocks_content_calendar_sources" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_pages_blocks_content_calendar_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_content_calendar" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"category_id" integer,
  	"tag_id" integer,
  	"event_cycle_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_content_calendar_sources" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__pages_v_blocks_content_calendar_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_content_calendar" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"category_id" integer,
  	"tag_id" integer,
  	"event_cycle_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_content_calendar_sources" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_posts_blocks_content_calendar_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "posts_blocks_content_calendar" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"category_id" integer,
  	"tag_id" integer,
  	"event_cycle_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_content_calendar_sources" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__posts_v_blocks_content_calendar_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_posts_v_blocks_content_calendar" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"category_id" integer,
  	"tag_id" integer,
  	"event_cycle_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "events_blocks_content_calendar_sources" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_events_blocks_content_calendar_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "events_blocks_content_calendar" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"category_id" integer,
  	"tag_id" integer,
  	"event_cycle_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "_events_v_blocks_content_calendar_sources" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__events_v_blocks_content_calendar_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_events_v_blocks_content_calendar" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"category_id" integer,
  	"tag_id" integer,
  	"event_cycle_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "event_cycles_blocks_content_calendar_sources" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_event_cycles_blocks_content_calendar_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "event_cycles_blocks_content_calendar" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"category_id" integer,
  	"tag_id" integer,
  	"event_cycle_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "_event_cycles_v_blocks_content_calendar_sources" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__event_cycles_v_blocks_content_calendar_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_event_cycles_v_blocks_content_calendar" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"category_id" integer,
  	"tag_id" integer,
  	"event_cycle_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "partners_blocks_content_calendar_sources" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_partners_blocks_content_calendar_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "partners_blocks_content_calendar" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"category_id" integer,
  	"tag_id" integer,
  	"event_cycle_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "_partners_v_blocks_content_calendar_sources" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__partners_v_blocks_content_calendar_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_partners_v_blocks_content_calendar" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"category_id" integer,
  	"tag_id" integer,
  	"event_cycle_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_sections_blocks_content_calendar_sources" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_homepage_sections_blocks_content_calendar_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "homepage_sections_blocks_content_calendar" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"category_id" integer,
  	"tag_id" integer,
  	"event_cycle_id" integer,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_content_calendar_sources" ADD CONSTRAINT "pages_blocks_content_calendar_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_content_calendar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_content_calendar" ADD CONSTRAINT "pages_blocks_content_calendar_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_content_calendar" ADD CONSTRAINT "pages_blocks_content_calendar_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_content_calendar" ADD CONSTRAINT "pages_blocks_content_calendar_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_content_calendar" ADD CONSTRAINT "pages_blocks_content_calendar_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_content_calendar" ADD CONSTRAINT "pages_blocks_content_calendar_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content_calendar_sources" ADD CONSTRAINT "_pages_v_blocks_content_calendar_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_content_calendar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content_calendar" ADD CONSTRAINT "_pages_v_blocks_content_calendar_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content_calendar" ADD CONSTRAINT "_pages_v_blocks_content_calendar_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content_calendar" ADD CONSTRAINT "_pages_v_blocks_content_calendar_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content_calendar" ADD CONSTRAINT "_pages_v_blocks_content_calendar_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content_calendar" ADD CONSTRAINT "_pages_v_blocks_content_calendar_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_content_calendar_sources" ADD CONSTRAINT "posts_blocks_content_calendar_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts_blocks_content_calendar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_content_calendar" ADD CONSTRAINT "posts_blocks_content_calendar_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_content_calendar" ADD CONSTRAINT "posts_blocks_content_calendar_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_content_calendar" ADD CONSTRAINT "posts_blocks_content_calendar_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_content_calendar" ADD CONSTRAINT "posts_blocks_content_calendar_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_content_calendar" ADD CONSTRAINT "posts_blocks_content_calendar_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_content_calendar_sources" ADD CONSTRAINT "_posts_v_blocks_content_calendar_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v_blocks_content_calendar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_content_calendar" ADD CONSTRAINT "_posts_v_blocks_content_calendar_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_content_calendar" ADD CONSTRAINT "_posts_v_blocks_content_calendar_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_content_calendar" ADD CONSTRAINT "_posts_v_blocks_content_calendar_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_content_calendar" ADD CONSTRAINT "_posts_v_blocks_content_calendar_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_content_calendar" ADD CONSTRAINT "_posts_v_blocks_content_calendar_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_blocks_content_calendar_sources" ADD CONSTRAINT "events_blocks_content_calendar_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events_blocks_content_calendar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_blocks_content_calendar" ADD CONSTRAINT "events_blocks_content_calendar_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_content_calendar" ADD CONSTRAINT "events_blocks_content_calendar_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_content_calendar" ADD CONSTRAINT "events_blocks_content_calendar_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_content_calendar" ADD CONSTRAINT "events_blocks_content_calendar_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_content_calendar" ADD CONSTRAINT "events_blocks_content_calendar_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_content_calendar_sources" ADD CONSTRAINT "_events_v_blocks_content_calendar_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_events_v_blocks_content_calendar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_content_calendar" ADD CONSTRAINT "_events_v_blocks_content_calendar_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_content_calendar" ADD CONSTRAINT "_events_v_blocks_content_calendar_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_content_calendar" ADD CONSTRAINT "_events_v_blocks_content_calendar_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_content_calendar" ADD CONSTRAINT "_events_v_blocks_content_calendar_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_content_calendar" ADD CONSTRAINT "_events_v_blocks_content_calendar_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_content_calendar_sources" ADD CONSTRAINT "event_cycles_blocks_content_calendar_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."event_cycles_blocks_content_calendar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_content_calendar" ADD CONSTRAINT "event_cycles_blocks_content_calendar_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_content_calendar" ADD CONSTRAINT "event_cycles_blocks_content_calendar_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_content_calendar" ADD CONSTRAINT "event_cycles_blocks_content_calendar_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_content_calendar" ADD CONSTRAINT "event_cycles_blocks_content_calendar_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_content_calendar" ADD CONSTRAINT "event_cycles_blocks_content_calendar_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_cycles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_content_calendar_sources" ADD CONSTRAINT "_event_cycles_v_blocks_content_calendar_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_event_cycles_v_blocks_content_calendar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_content_calendar" ADD CONSTRAINT "_event_cycles_v_blocks_content_calendar_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_content_calendar" ADD CONSTRAINT "_event_cycles_v_blocks_content_calendar_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_content_calendar" ADD CONSTRAINT "_event_cycles_v_blocks_content_calendar_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_content_calendar" ADD CONSTRAINT "_event_cycles_v_blocks_content_calendar_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_content_calendar" ADD CONSTRAINT "_event_cycles_v_blocks_content_calendar_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_event_cycles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_blocks_content_calendar_sources" ADD CONSTRAINT "partners_blocks_content_calendar_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."partners_blocks_content_calendar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_blocks_content_calendar" ADD CONSTRAINT "partners_blocks_content_calendar_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_content_calendar" ADD CONSTRAINT "partners_blocks_content_calendar_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_content_calendar" ADD CONSTRAINT "partners_blocks_content_calendar_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_content_calendar" ADD CONSTRAINT "partners_blocks_content_calendar_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_content_calendar" ADD CONSTRAINT "partners_blocks_content_calendar_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_content_calendar_sources" ADD CONSTRAINT "_partners_v_blocks_content_calendar_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_partners_v_blocks_content_calendar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_content_calendar" ADD CONSTRAINT "_partners_v_blocks_content_calendar_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_content_calendar" ADD CONSTRAINT "_partners_v_blocks_content_calendar_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_content_calendar" ADD CONSTRAINT "_partners_v_blocks_content_calendar_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_content_calendar" ADD CONSTRAINT "_partners_v_blocks_content_calendar_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_content_calendar" ADD CONSTRAINT "_partners_v_blocks_content_calendar_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partners_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_content_calendar_sources" ADD CONSTRAINT "homepage_sections_blocks_content_calendar_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage_sections_blocks_content_calendar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_content_calendar" ADD CONSTRAINT "homepage_sections_blocks_content_calendar_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_content_calendar" ADD CONSTRAINT "homepage_sections_blocks_content_calendar_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_content_calendar" ADD CONSTRAINT "homepage_sections_blocks_content_calendar_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_content_calendar" ADD CONSTRAINT "homepage_sections_blocks_content_calendar_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_content_calendar" ADD CONSTRAINT "homepage_sections_blocks_content_calendar_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_content_calendar_sources_order_idx" ON "pages_blocks_content_calendar_sources" USING btree ("order");
  CREATE INDEX "pages_blocks_content_calendar_sources_parent_idx" ON "pages_blocks_content_calendar_sources" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_content_calendar_order_idx" ON "pages_blocks_content_calendar" USING btree ("_order");
  CREATE INDEX "pages_blocks_content_calendar_parent_id_idx" ON "pages_blocks_content_calendar" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_content_calendar_path_idx" ON "pages_blocks_content_calendar" USING btree ("_path");
  CREATE INDEX "pages_blocks_content_calendar_surface_image_idx" ON "pages_blocks_content_calendar" USING btree ("surface_image_id");
  CREATE INDEX "pages_blocks_content_calendar_category_idx" ON "pages_blocks_content_calendar" USING btree ("category_id");
  CREATE INDEX "pages_blocks_content_calendar_tag_idx" ON "pages_blocks_content_calendar" USING btree ("tag_id");
  CREATE INDEX "pages_blocks_content_calendar_event_cycle_idx" ON "pages_blocks_content_calendar" USING btree ("event_cycle_id");
  CREATE INDEX "_pages_v_blocks_content_calendar_sources_order_idx" ON "_pages_v_blocks_content_calendar_sources" USING btree ("order");
  CREATE INDEX "_pages_v_blocks_content_calendar_sources_parent_idx" ON "_pages_v_blocks_content_calendar_sources" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_content_calendar_order_idx" ON "_pages_v_blocks_content_calendar" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_content_calendar_parent_id_idx" ON "_pages_v_blocks_content_calendar" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_content_calendar_path_idx" ON "_pages_v_blocks_content_calendar" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_content_calendar_surface_image_idx" ON "_pages_v_blocks_content_calendar" USING btree ("surface_image_id");
  CREATE INDEX "_pages_v_blocks_content_calendar_category_idx" ON "_pages_v_blocks_content_calendar" USING btree ("category_id");
  CREATE INDEX "_pages_v_blocks_content_calendar_tag_idx" ON "_pages_v_blocks_content_calendar" USING btree ("tag_id");
  CREATE INDEX "_pages_v_blocks_content_calendar_event_cycle_idx" ON "_pages_v_blocks_content_calendar" USING btree ("event_cycle_id");
  CREATE INDEX "posts_blocks_content_calendar_sources_order_idx" ON "posts_blocks_content_calendar_sources" USING btree ("order");
  CREATE INDEX "posts_blocks_content_calendar_sources_parent_idx" ON "posts_blocks_content_calendar_sources" USING btree ("parent_id");
  CREATE INDEX "posts_blocks_content_calendar_order_idx" ON "posts_blocks_content_calendar" USING btree ("_order");
  CREATE INDEX "posts_blocks_content_calendar_parent_id_idx" ON "posts_blocks_content_calendar" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_content_calendar_path_idx" ON "posts_blocks_content_calendar" USING btree ("_path");
  CREATE INDEX "posts_blocks_content_calendar_surface_image_idx" ON "posts_blocks_content_calendar" USING btree ("surface_image_id");
  CREATE INDEX "posts_blocks_content_calendar_category_idx" ON "posts_blocks_content_calendar" USING btree ("category_id");
  CREATE INDEX "posts_blocks_content_calendar_tag_idx" ON "posts_blocks_content_calendar" USING btree ("tag_id");
  CREATE INDEX "posts_blocks_content_calendar_event_cycle_idx" ON "posts_blocks_content_calendar" USING btree ("event_cycle_id");
  CREATE INDEX "_posts_v_blocks_content_calendar_sources_order_idx" ON "_posts_v_blocks_content_calendar_sources" USING btree ("order");
  CREATE INDEX "_posts_v_blocks_content_calendar_sources_parent_idx" ON "_posts_v_blocks_content_calendar_sources" USING btree ("parent_id");
  CREATE INDEX "_posts_v_blocks_content_calendar_order_idx" ON "_posts_v_blocks_content_calendar" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_content_calendar_parent_id_idx" ON "_posts_v_blocks_content_calendar" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_content_calendar_path_idx" ON "_posts_v_blocks_content_calendar" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_content_calendar_surface_image_idx" ON "_posts_v_blocks_content_calendar" USING btree ("surface_image_id");
  CREATE INDEX "_posts_v_blocks_content_calendar_category_idx" ON "_posts_v_blocks_content_calendar" USING btree ("category_id");
  CREATE INDEX "_posts_v_blocks_content_calendar_tag_idx" ON "_posts_v_blocks_content_calendar" USING btree ("tag_id");
  CREATE INDEX "_posts_v_blocks_content_calendar_event_cycle_idx" ON "_posts_v_blocks_content_calendar" USING btree ("event_cycle_id");
  CREATE INDEX "events_blocks_content_calendar_sources_order_idx" ON "events_blocks_content_calendar_sources" USING btree ("order");
  CREATE INDEX "events_blocks_content_calendar_sources_parent_idx" ON "events_blocks_content_calendar_sources" USING btree ("parent_id");
  CREATE INDEX "events_blocks_content_calendar_order_idx" ON "events_blocks_content_calendar" USING btree ("_order");
  CREATE INDEX "events_blocks_content_calendar_parent_id_idx" ON "events_blocks_content_calendar" USING btree ("_parent_id");
  CREATE INDEX "events_blocks_content_calendar_path_idx" ON "events_blocks_content_calendar" USING btree ("_path");
  CREATE INDEX "events_blocks_content_calendar_surface_image_idx" ON "events_blocks_content_calendar" USING btree ("surface_image_id");
  CREATE INDEX "events_blocks_content_calendar_category_idx" ON "events_blocks_content_calendar" USING btree ("category_id");
  CREATE INDEX "events_blocks_content_calendar_tag_idx" ON "events_blocks_content_calendar" USING btree ("tag_id");
  CREATE INDEX "events_blocks_content_calendar_event_cycle_idx" ON "events_blocks_content_calendar" USING btree ("event_cycle_id");
  CREATE INDEX "_events_v_blocks_content_calendar_sources_order_idx" ON "_events_v_blocks_content_calendar_sources" USING btree ("order");
  CREATE INDEX "_events_v_blocks_content_calendar_sources_parent_idx" ON "_events_v_blocks_content_calendar_sources" USING btree ("parent_id");
  CREATE INDEX "_events_v_blocks_content_calendar_order_idx" ON "_events_v_blocks_content_calendar" USING btree ("_order");
  CREATE INDEX "_events_v_blocks_content_calendar_parent_id_idx" ON "_events_v_blocks_content_calendar" USING btree ("_parent_id");
  CREATE INDEX "_events_v_blocks_content_calendar_path_idx" ON "_events_v_blocks_content_calendar" USING btree ("_path");
  CREATE INDEX "_events_v_blocks_content_calendar_surface_image_idx" ON "_events_v_blocks_content_calendar" USING btree ("surface_image_id");
  CREATE INDEX "_events_v_blocks_content_calendar_category_idx" ON "_events_v_blocks_content_calendar" USING btree ("category_id");
  CREATE INDEX "_events_v_blocks_content_calendar_tag_idx" ON "_events_v_blocks_content_calendar" USING btree ("tag_id");
  CREATE INDEX "_events_v_blocks_content_calendar_event_cycle_idx" ON "_events_v_blocks_content_calendar" USING btree ("event_cycle_id");
  CREATE INDEX "event_cycles_blocks_content_calendar_sources_order_idx" ON "event_cycles_blocks_content_calendar_sources" USING btree ("order");
  CREATE INDEX "event_cycles_blocks_content_calendar_sources_parent_idx" ON "event_cycles_blocks_content_calendar_sources" USING btree ("parent_id");
  CREATE INDEX "event_cycles_blocks_content_calendar_order_idx" ON "event_cycles_blocks_content_calendar" USING btree ("_order");
  CREATE INDEX "event_cycles_blocks_content_calendar_parent_id_idx" ON "event_cycles_blocks_content_calendar" USING btree ("_parent_id");
  CREATE INDEX "event_cycles_blocks_content_calendar_path_idx" ON "event_cycles_blocks_content_calendar" USING btree ("_path");
  CREATE INDEX "event_cycles_blocks_content_calendar_surface_image_idx" ON "event_cycles_blocks_content_calendar" USING btree ("surface_image_id");
  CREATE INDEX "event_cycles_blocks_content_calendar_category_idx" ON "event_cycles_blocks_content_calendar" USING btree ("category_id");
  CREATE INDEX "event_cycles_blocks_content_calendar_tag_idx" ON "event_cycles_blocks_content_calendar" USING btree ("tag_id");
  CREATE INDEX "event_cycles_blocks_content_calendar_event_cycle_idx" ON "event_cycles_blocks_content_calendar" USING btree ("event_cycle_id");
  CREATE INDEX "_event_cycles_v_blocks_content_calendar_sources_order_idx" ON "_event_cycles_v_blocks_content_calendar_sources" USING btree ("order");
  CREATE INDEX "_event_cycles_v_blocks_content_calendar_sources_parent_idx" ON "_event_cycles_v_blocks_content_calendar_sources" USING btree ("parent_id");
  CREATE INDEX "_event_cycles_v_blocks_content_calendar_order_idx" ON "_event_cycles_v_blocks_content_calendar" USING btree ("_order");
  CREATE INDEX "_event_cycles_v_blocks_content_calendar_parent_id_idx" ON "_event_cycles_v_blocks_content_calendar" USING btree ("_parent_id");
  CREATE INDEX "_event_cycles_v_blocks_content_calendar_path_idx" ON "_event_cycles_v_blocks_content_calendar" USING btree ("_path");
  CREATE INDEX "_event_cycles_v_blocks_content_calendar_surface_image_idx" ON "_event_cycles_v_blocks_content_calendar" USING btree ("surface_image_id");
  CREATE INDEX "_event_cycles_v_blocks_content_calendar_category_idx" ON "_event_cycles_v_blocks_content_calendar" USING btree ("category_id");
  CREATE INDEX "_event_cycles_v_blocks_content_calendar_tag_idx" ON "_event_cycles_v_blocks_content_calendar" USING btree ("tag_id");
  CREATE INDEX "_event_cycles_v_blocks_content_calendar_event_cycle_idx" ON "_event_cycles_v_blocks_content_calendar" USING btree ("event_cycle_id");
  CREATE INDEX "partners_blocks_content_calendar_sources_order_idx" ON "partners_blocks_content_calendar_sources" USING btree ("order");
  CREATE INDEX "partners_blocks_content_calendar_sources_parent_idx" ON "partners_blocks_content_calendar_sources" USING btree ("parent_id");
  CREATE INDEX "partners_blocks_content_calendar_order_idx" ON "partners_blocks_content_calendar" USING btree ("_order");
  CREATE INDEX "partners_blocks_content_calendar_parent_id_idx" ON "partners_blocks_content_calendar" USING btree ("_parent_id");
  CREATE INDEX "partners_blocks_content_calendar_path_idx" ON "partners_blocks_content_calendar" USING btree ("_path");
  CREATE INDEX "partners_blocks_content_calendar_surface_image_idx" ON "partners_blocks_content_calendar" USING btree ("surface_image_id");
  CREATE INDEX "partners_blocks_content_calendar_category_idx" ON "partners_blocks_content_calendar" USING btree ("category_id");
  CREATE INDEX "partners_blocks_content_calendar_tag_idx" ON "partners_blocks_content_calendar" USING btree ("tag_id");
  CREATE INDEX "partners_blocks_content_calendar_event_cycle_idx" ON "partners_blocks_content_calendar" USING btree ("event_cycle_id");
  CREATE INDEX "_partners_v_blocks_content_calendar_sources_order_idx" ON "_partners_v_blocks_content_calendar_sources" USING btree ("order");
  CREATE INDEX "_partners_v_blocks_content_calendar_sources_parent_idx" ON "_partners_v_blocks_content_calendar_sources" USING btree ("parent_id");
  CREATE INDEX "_partners_v_blocks_content_calendar_order_idx" ON "_partners_v_blocks_content_calendar" USING btree ("_order");
  CREATE INDEX "_partners_v_blocks_content_calendar_parent_id_idx" ON "_partners_v_blocks_content_calendar" USING btree ("_parent_id");
  CREATE INDEX "_partners_v_blocks_content_calendar_path_idx" ON "_partners_v_blocks_content_calendar" USING btree ("_path");
  CREATE INDEX "_partners_v_blocks_content_calendar_surface_image_idx" ON "_partners_v_blocks_content_calendar" USING btree ("surface_image_id");
  CREATE INDEX "_partners_v_blocks_content_calendar_category_idx" ON "_partners_v_blocks_content_calendar" USING btree ("category_id");
  CREATE INDEX "_partners_v_blocks_content_calendar_tag_idx" ON "_partners_v_blocks_content_calendar" USING btree ("tag_id");
  CREATE INDEX "_partners_v_blocks_content_calendar_event_cycle_idx" ON "_partners_v_blocks_content_calendar" USING btree ("event_cycle_id");
  CREATE INDEX "homepage_sections_blocks_content_calendar_sources_order_idx" ON "homepage_sections_blocks_content_calendar_sources" USING btree ("order");
  CREATE INDEX "homepage_sections_blocks_content_calendar_sources_parent_idx" ON "homepage_sections_blocks_content_calendar_sources" USING btree ("parent_id");
  CREATE INDEX "homepage_sections_blocks_content_calendar_order_idx" ON "homepage_sections_blocks_content_calendar" USING btree ("_order");
  CREATE INDEX "homepage_sections_blocks_content_calendar_parent_id_idx" ON "homepage_sections_blocks_content_calendar" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_blocks_content_calendar_path_idx" ON "homepage_sections_blocks_content_calendar" USING btree ("_path");
  CREATE INDEX "homepage_sections_blocks_content_calendar_surface_image_idx" ON "homepage_sections_blocks_content_calendar" USING btree ("surface_image_id");
  CREATE INDEX "homepage_sections_blocks_content_calendar_category_idx" ON "homepage_sections_blocks_content_calendar" USING btree ("category_id");
  CREATE INDEX "homepage_sections_blocks_content_calendar_tag_idx" ON "homepage_sections_blocks_content_calendar" USING btree ("tag_id");
  CREATE INDEX "homepage_sections_blocks_content_calendar_event_cycle_idx" ON "homepage_sections_blocks_content_calendar" USING btree ("event_cycle_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_content_calendar_sources" CASCADE;
  DROP TABLE "pages_blocks_content_calendar" CASCADE;
  DROP TABLE "_pages_v_blocks_content_calendar_sources" CASCADE;
  DROP TABLE "_pages_v_blocks_content_calendar" CASCADE;
  DROP TABLE "posts_blocks_content_calendar_sources" CASCADE;
  DROP TABLE "posts_blocks_content_calendar" CASCADE;
  DROP TABLE "_posts_v_blocks_content_calendar_sources" CASCADE;
  DROP TABLE "_posts_v_blocks_content_calendar" CASCADE;
  DROP TABLE "events_blocks_content_calendar_sources" CASCADE;
  DROP TABLE "events_blocks_content_calendar" CASCADE;
  DROP TABLE "_events_v_blocks_content_calendar_sources" CASCADE;
  DROP TABLE "_events_v_blocks_content_calendar" CASCADE;
  DROP TABLE "event_cycles_blocks_content_calendar_sources" CASCADE;
  DROP TABLE "event_cycles_blocks_content_calendar" CASCADE;
  DROP TABLE "_event_cycles_v_blocks_content_calendar_sources" CASCADE;
  DROP TABLE "_event_cycles_v_blocks_content_calendar" CASCADE;
  DROP TABLE "partners_blocks_content_calendar_sources" CASCADE;
  DROP TABLE "partners_blocks_content_calendar" CASCADE;
  DROP TABLE "_partners_v_blocks_content_calendar_sources" CASCADE;
  DROP TABLE "_partners_v_blocks_content_calendar" CASCADE;
  DROP TABLE "homepage_sections_blocks_content_calendar_sources" CASCADE;
  DROP TABLE "homepage_sections_blocks_content_calendar" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_content_calendar_sources";
  DROP TYPE "public"."enum__pages_v_blocks_content_calendar_sources";
  DROP TYPE "public"."enum_posts_blocks_content_calendar_sources";
  DROP TYPE "public"."enum__posts_v_blocks_content_calendar_sources";
  DROP TYPE "public"."enum_events_blocks_content_calendar_sources";
  DROP TYPE "public"."enum__events_v_blocks_content_calendar_sources";
  DROP TYPE "public"."enum_event_cycles_blocks_content_calendar_sources";
  DROP TYPE "public"."enum__event_cycles_v_blocks_content_calendar_sources";
  DROP TYPE "public"."enum_partners_blocks_content_calendar_sources";
  DROP TYPE "public"."enum__partners_v_blocks_content_calendar_sources";
  DROP TYPE "public"."enum_homepage_sections_blocks_content_calendar_sources";`)
}
