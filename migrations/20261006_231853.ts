import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_listing_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum__pages_v_blocks_listing_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum_posts_blocks_listing_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum__posts_v_blocks_listing_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum_events_blocks_listing_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum__events_v_blocks_listing_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum_event_cycles_blocks_listing_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_listing_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum_partners_blocks_listing_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum__partners_v_blocks_listing_selection_mode" AS ENUM('manual', 'filters');
  CREATE TABLE "pages_blocks_listing_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_listing_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "posts_blocks_listing_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_posts_v_blocks_listing_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "events_blocks_listing_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_events_v_blocks_listing_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "event_cycles_blocks_listing_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_event_cycles_v_blocks_listing_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "partners_blocks_listing_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "partners_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"events_id" integer,
  	"event_cycles_id" integer
  );
  
  CREATE TABLE "_partners_v_blocks_listing_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_partners_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"events_id" integer,
  	"event_cycles_id" integer
  );
  
  ALTER TABLE "pages_blocks_listing" ADD COLUMN "selection_mode" "enum_pages_blocks_listing_selection_mode" DEFAULT 'filters';
  ALTER TABLE "pages_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "pages_rels" ADD COLUMN "posts_id" integer;
  ALTER TABLE "pages_rels" ADD COLUMN "events_id" integer;
  ALTER TABLE "pages_rels" ADD COLUMN "event_cycles_id" integer;
  ALTER TABLE "_pages_v_blocks_listing" ADD COLUMN "selection_mode" "enum__pages_v_blocks_listing_selection_mode" DEFAULT 'filters';
  ALTER TABLE "_pages_v_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "posts_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "events_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "event_cycles_id" integer;
  ALTER TABLE "posts_blocks_listing" ADD COLUMN "selection_mode" "enum_posts_blocks_listing_selection_mode" DEFAULT 'filters';
  ALTER TABLE "posts_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "posts_rels" ADD COLUMN "posts_id" integer;
  ALTER TABLE "_posts_v_blocks_listing" ADD COLUMN "selection_mode" "enum__posts_v_blocks_listing_selection_mode" DEFAULT 'filters';
  ALTER TABLE "_posts_v_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "_posts_v_rels" ADD COLUMN "posts_id" integer;
  ALTER TABLE "events_blocks_listing" ADD COLUMN "selection_mode" "enum_events_blocks_listing_selection_mode" DEFAULT 'filters';
  ALTER TABLE "events_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "events_rels" ADD COLUMN "posts_id" integer;
  ALTER TABLE "events_rels" ADD COLUMN "events_id" integer;
  ALTER TABLE "events_rels" ADD COLUMN "event_cycles_id" integer;
  ALTER TABLE "_events_v_blocks_listing" ADD COLUMN "selection_mode" "enum__events_v_blocks_listing_selection_mode" DEFAULT 'filters';
  ALTER TABLE "_events_v_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "_events_v_rels" ADD COLUMN "posts_id" integer;
  ALTER TABLE "_events_v_rels" ADD COLUMN "events_id" integer;
  ALTER TABLE "_events_v_rels" ADD COLUMN "event_cycles_id" integer;
  ALTER TABLE "event_cycles_blocks_listing" ADD COLUMN "selection_mode" "enum_event_cycles_blocks_listing_selection_mode" DEFAULT 'filters';
  ALTER TABLE "event_cycles_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "event_cycles_rels" ADD COLUMN "posts_id" integer;
  ALTER TABLE "event_cycles_rels" ADD COLUMN "events_id" integer;
  ALTER TABLE "event_cycles_rels" ADD COLUMN "event_cycles_id" integer;
  ALTER TABLE "_event_cycles_v_blocks_listing" ADD COLUMN "selection_mode" "enum__event_cycles_v_blocks_listing_selection_mode" DEFAULT 'filters';
  ALTER TABLE "_event_cycles_v_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "_event_cycles_v_rels" ADD COLUMN "posts_id" integer;
  ALTER TABLE "_event_cycles_v_rels" ADD COLUMN "events_id" integer;
  ALTER TABLE "_event_cycles_v_rels" ADD COLUMN "event_cycles_id" integer;
  ALTER TABLE "partners_blocks_listing" ADD COLUMN "selection_mode" "enum_partners_blocks_listing_selection_mode" DEFAULT 'filters';
  ALTER TABLE "_partners_v_blocks_listing" ADD COLUMN "selection_mode" "enum__partners_v_blocks_listing_selection_mode" DEFAULT 'filters';
  ALTER TABLE "pages_blocks_listing_items" ADD CONSTRAINT "pages_blocks_listing_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_listing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_listing_items" ADD CONSTRAINT "_pages_v_blocks_listing_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_listing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_listing_items" ADD CONSTRAINT "posts_blocks_listing_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_listing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_listing_items" ADD CONSTRAINT "_posts_v_blocks_listing_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_listing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_blocks_listing_items" ADD CONSTRAINT "events_blocks_listing_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events_blocks_listing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_listing_items" ADD CONSTRAINT "_events_v_blocks_listing_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v_blocks_listing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_listing_items" ADD CONSTRAINT "event_cycles_blocks_listing_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_cycles_blocks_listing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_listing_items" ADD CONSTRAINT "_event_cycles_v_blocks_listing_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_event_cycles_v_blocks_listing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_blocks_listing_items" ADD CONSTRAINT "partners_blocks_listing_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners_blocks_listing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_rels" ADD CONSTRAINT "partners_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_rels" ADD CONSTRAINT "partners_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_rels" ADD CONSTRAINT "partners_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_rels" ADD CONSTRAINT "partners_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_rels" ADD CONSTRAINT "partners_rels_event_cycles_fk" FOREIGN KEY ("event_cycles_id") REFERENCES "public"."event_cycles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_listing_items" ADD CONSTRAINT "_partners_v_blocks_listing_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partners_v_blocks_listing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_rels" ADD CONSTRAINT "_partners_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_partners_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_rels" ADD CONSTRAINT "_partners_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_rels" ADD CONSTRAINT "_partners_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_rels" ADD CONSTRAINT "_partners_v_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_rels" ADD CONSTRAINT "_partners_v_rels_event_cycles_fk" FOREIGN KEY ("event_cycles_id") REFERENCES "public"."event_cycles"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_listing_items_order_idx" ON "pages_blocks_listing_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_listing_items_parent_id_idx" ON "pages_blocks_listing_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_listing_items_order_idx" ON "_pages_v_blocks_listing_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_listing_items_parent_id_idx" ON "_pages_v_blocks_listing_items" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_listing_items_order_idx" ON "posts_blocks_listing_items" USING btree ("_order");
  CREATE INDEX "posts_blocks_listing_items_parent_id_idx" ON "posts_blocks_listing_items" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_listing_items_order_idx" ON "_posts_v_blocks_listing_items" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_listing_items_parent_id_idx" ON "_posts_v_blocks_listing_items" USING btree ("_parent_id");
  CREATE INDEX "events_blocks_listing_items_order_idx" ON "events_blocks_listing_items" USING btree ("_order");
  CREATE INDEX "events_blocks_listing_items_parent_id_idx" ON "events_blocks_listing_items" USING btree ("_parent_id");
  CREATE INDEX "_events_v_blocks_listing_items_order_idx" ON "_events_v_blocks_listing_items" USING btree ("_order");
  CREATE INDEX "_events_v_blocks_listing_items_parent_id_idx" ON "_events_v_blocks_listing_items" USING btree ("_parent_id");
  CREATE INDEX "event_cycles_blocks_listing_items_order_idx" ON "event_cycles_blocks_listing_items" USING btree ("_order");
  CREATE INDEX "event_cycles_blocks_listing_items_parent_id_idx" ON "event_cycles_blocks_listing_items" USING btree ("_parent_id");
  CREATE INDEX "_event_cycles_v_blocks_listing_items_order_idx" ON "_event_cycles_v_blocks_listing_items" USING btree ("_order");
  CREATE INDEX "_event_cycles_v_blocks_listing_items_parent_id_idx" ON "_event_cycles_v_blocks_listing_items" USING btree ("_parent_id");
  CREATE INDEX "partners_blocks_listing_items_order_idx" ON "partners_blocks_listing_items" USING btree ("_order");
  CREATE INDEX "partners_blocks_listing_items_parent_id_idx" ON "partners_blocks_listing_items" USING btree ("_parent_id");
  CREATE INDEX "partners_rels_order_idx" ON "partners_rels" USING btree ("order");
  CREATE INDEX "partners_rels_parent_idx" ON "partners_rels" USING btree ("parent_id");
  CREATE INDEX "partners_rels_path_idx" ON "partners_rels" USING btree ("path");
  CREATE INDEX "partners_rels_pages_id_idx" ON "partners_rels" USING btree ("pages_id");
  CREATE INDEX "partners_rels_posts_id_idx" ON "partners_rels" USING btree ("posts_id");
  CREATE INDEX "partners_rels_events_id_idx" ON "partners_rels" USING btree ("events_id");
  CREATE INDEX "partners_rels_event_cycles_id_idx" ON "partners_rels" USING btree ("event_cycles_id");
  CREATE INDEX "_partners_v_blocks_listing_items_order_idx" ON "_partners_v_blocks_listing_items" USING btree ("_order");
  CREATE INDEX "_partners_v_blocks_listing_items_parent_id_idx" ON "_partners_v_blocks_listing_items" USING btree ("_parent_id");
  CREATE INDEX "_partners_v_rels_order_idx" ON "_partners_v_rels" USING btree ("order");
  CREATE INDEX "_partners_v_rels_parent_idx" ON "_partners_v_rels" USING btree ("parent_id");
  CREATE INDEX "_partners_v_rels_path_idx" ON "_partners_v_rels" USING btree ("path");
  CREATE INDEX "_partners_v_rels_pages_id_idx" ON "_partners_v_rels" USING btree ("pages_id");
  CREATE INDEX "_partners_v_rels_posts_id_idx" ON "_partners_v_rels" USING btree ("posts_id");
  CREATE INDEX "_partners_v_rels_events_id_idx" ON "_partners_v_rels" USING btree ("events_id");
  CREATE INDEX "_partners_v_rels_event_cycles_id_idx" ON "_partners_v_rels" USING btree ("event_cycles_id");
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_event_cycles_fk" FOREIGN KEY ("event_cycles_id") REFERENCES "public"."event_cycles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_event_cycles_fk" FOREIGN KEY ("event_cycles_id") REFERENCES "public"."event_cycles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_event_cycles_fk" FOREIGN KEY ("event_cycles_id") REFERENCES "public"."event_cycles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_event_cycles_fk" FOREIGN KEY ("event_cycles_id") REFERENCES "public"."event_cycles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_rels" ADD CONSTRAINT "event_cycles_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_rels" ADD CONSTRAINT "event_cycles_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_rels" ADD CONSTRAINT "event_cycles_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_rels" ADD CONSTRAINT "event_cycles_rels_event_cycles_fk" FOREIGN KEY ("event_cycles_id") REFERENCES "public"."event_cycles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_rels" ADD CONSTRAINT "_event_cycles_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_rels" ADD CONSTRAINT "_event_cycles_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_rels" ADD CONSTRAINT "_event_cycles_v_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_rels" ADD CONSTRAINT "_event_cycles_v_rels_event_cycles_fk" FOREIGN KEY ("event_cycles_id") REFERENCES "public"."event_cycles"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_rels_pages_id_idx" ON "pages_rels" USING btree ("pages_id");
  CREATE INDEX "pages_rels_posts_id_idx" ON "pages_rels" USING btree ("posts_id");
  CREATE INDEX "pages_rels_events_id_idx" ON "pages_rels" USING btree ("events_id");
  CREATE INDEX "pages_rels_event_cycles_id_idx" ON "pages_rels" USING btree ("event_cycles_id");
  CREATE INDEX "_pages_v_rels_pages_id_idx" ON "_pages_v_rels" USING btree ("pages_id");
  CREATE INDEX "_pages_v_rels_posts_id_idx" ON "_pages_v_rels" USING btree ("posts_id");
  CREATE INDEX "_pages_v_rels_events_id_idx" ON "_pages_v_rels" USING btree ("events_id");
  CREATE INDEX "_pages_v_rels_event_cycles_id_idx" ON "_pages_v_rels" USING btree ("event_cycles_id");
  CREATE INDEX "posts_rels_pages_id_idx" ON "posts_rels" USING btree ("pages_id");
  CREATE INDEX "posts_rels_posts_id_idx" ON "posts_rels" USING btree ("posts_id");
  CREATE INDEX "_posts_v_rels_pages_id_idx" ON "_posts_v_rels" USING btree ("pages_id");
  CREATE INDEX "_posts_v_rels_posts_id_idx" ON "_posts_v_rels" USING btree ("posts_id");
  CREATE INDEX "events_rels_pages_id_idx" ON "events_rels" USING btree ("pages_id");
  CREATE INDEX "events_rels_posts_id_idx" ON "events_rels" USING btree ("posts_id");
  CREATE INDEX "events_rels_events_id_idx" ON "events_rels" USING btree ("events_id");
  CREATE INDEX "events_rels_event_cycles_id_idx" ON "events_rels" USING btree ("event_cycles_id");
  CREATE INDEX "_events_v_rels_pages_id_idx" ON "_events_v_rels" USING btree ("pages_id");
  CREATE INDEX "_events_v_rels_posts_id_idx" ON "_events_v_rels" USING btree ("posts_id");
  CREATE INDEX "_events_v_rels_events_id_idx" ON "_events_v_rels" USING btree ("events_id");
  CREATE INDEX "_events_v_rels_event_cycles_id_idx" ON "_events_v_rels" USING btree ("event_cycles_id");
  CREATE INDEX "event_cycles_rels_pages_id_idx" ON "event_cycles_rels" USING btree ("pages_id");
  CREATE INDEX "event_cycles_rels_posts_id_idx" ON "event_cycles_rels" USING btree ("posts_id");
  CREATE INDEX "event_cycles_rels_events_id_idx" ON "event_cycles_rels" USING btree ("events_id");
  CREATE INDEX "event_cycles_rels_event_cycles_id_idx" ON "event_cycles_rels" USING btree ("event_cycles_id");
  CREATE INDEX "_event_cycles_v_rels_pages_id_idx" ON "_event_cycles_v_rels" USING btree ("pages_id");
  CREATE INDEX "_event_cycles_v_rels_posts_id_idx" ON "_event_cycles_v_rels" USING btree ("posts_id");
  CREATE INDEX "_event_cycles_v_rels_events_id_idx" ON "_event_cycles_v_rels" USING btree ("events_id");
  CREATE INDEX "_event_cycles_v_rels_event_cycles_id_idx" ON "_event_cycles_v_rels" USING btree ("event_cycles_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_listing_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_listing_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_listing_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_listing_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_blocks_listing_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_v_blocks_listing_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "event_cycles_blocks_listing_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_event_cycles_v_blocks_listing_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "partners_blocks_listing_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "partners_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_partners_v_blocks_listing_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_partners_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_listing_items" CASCADE;
  DROP TABLE "_pages_v_blocks_listing_items" CASCADE;
  DROP TABLE "posts_blocks_listing_items" CASCADE;
  DROP TABLE "_posts_v_blocks_listing_items" CASCADE;
  DROP TABLE "events_blocks_listing_items" CASCADE;
  DROP TABLE "_events_v_blocks_listing_items" CASCADE;
  DROP TABLE "event_cycles_blocks_listing_items" CASCADE;
  DROP TABLE "_event_cycles_v_blocks_listing_items" CASCADE;
  DROP TABLE "partners_blocks_listing_items" CASCADE;
  DROP TABLE "partners_rels" CASCADE;
  DROP TABLE "_partners_v_blocks_listing_items" CASCADE;
  DROP TABLE "_partners_v_rels" CASCADE;
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_pages_fk";
  
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_posts_fk";
  
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_events_fk";
  
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_event_cycles_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_pages_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_posts_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_events_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_event_cycles_fk";
  
  ALTER TABLE "posts_rels" DROP CONSTRAINT "posts_rels_pages_fk";
  
  ALTER TABLE "posts_rels" DROP CONSTRAINT "posts_rels_posts_fk";
  
  ALTER TABLE "_posts_v_rels" DROP CONSTRAINT "_posts_v_rels_pages_fk";
  
  ALTER TABLE "_posts_v_rels" DROP CONSTRAINT "_posts_v_rels_posts_fk";
  
  ALTER TABLE "events_rels" DROP CONSTRAINT "events_rels_pages_fk";
  
  ALTER TABLE "events_rels" DROP CONSTRAINT "events_rels_posts_fk";
  
  ALTER TABLE "events_rels" DROP CONSTRAINT "events_rels_events_fk";
  
  ALTER TABLE "events_rels" DROP CONSTRAINT "events_rels_event_cycles_fk";
  
  ALTER TABLE "_events_v_rels" DROP CONSTRAINT "_events_v_rels_pages_fk";
  
  ALTER TABLE "_events_v_rels" DROP CONSTRAINT "_events_v_rels_posts_fk";
  
  ALTER TABLE "_events_v_rels" DROP CONSTRAINT "_events_v_rels_events_fk";
  
  ALTER TABLE "_events_v_rels" DROP CONSTRAINT "_events_v_rels_event_cycles_fk";
  
  ALTER TABLE "event_cycles_rels" DROP CONSTRAINT "event_cycles_rels_pages_fk";
  
  ALTER TABLE "event_cycles_rels" DROP CONSTRAINT "event_cycles_rels_posts_fk";
  
  ALTER TABLE "event_cycles_rels" DROP CONSTRAINT "event_cycles_rels_events_fk";
  
  ALTER TABLE "event_cycles_rels" DROP CONSTRAINT "event_cycles_rels_event_cycles_fk";
  
  ALTER TABLE "_event_cycles_v_rels" DROP CONSTRAINT "_event_cycles_v_rels_pages_fk";
  
  ALTER TABLE "_event_cycles_v_rels" DROP CONSTRAINT "_event_cycles_v_rels_posts_fk";
  
  ALTER TABLE "_event_cycles_v_rels" DROP CONSTRAINT "_event_cycles_v_rels_events_fk";
  
  ALTER TABLE "_event_cycles_v_rels" DROP CONSTRAINT "_event_cycles_v_rels_event_cycles_fk";
  
  DROP INDEX "pages_rels_pages_id_idx";
  DROP INDEX "pages_rels_posts_id_idx";
  DROP INDEX "pages_rels_events_id_idx";
  DROP INDEX "pages_rels_event_cycles_id_idx";
  DROP INDEX "_pages_v_rels_pages_id_idx";
  DROP INDEX "_pages_v_rels_posts_id_idx";
  DROP INDEX "_pages_v_rels_events_id_idx";
  DROP INDEX "_pages_v_rels_event_cycles_id_idx";
  DROP INDEX "posts_rels_pages_id_idx";
  DROP INDEX "posts_rels_posts_id_idx";
  DROP INDEX "_posts_v_rels_pages_id_idx";
  DROP INDEX "_posts_v_rels_posts_id_idx";
  DROP INDEX "events_rels_pages_id_idx";
  DROP INDEX "events_rels_posts_id_idx";
  DROP INDEX "events_rels_events_id_idx";
  DROP INDEX "events_rels_event_cycles_id_idx";
  DROP INDEX "_events_v_rels_pages_id_idx";
  DROP INDEX "_events_v_rels_posts_id_idx";
  DROP INDEX "_events_v_rels_events_id_idx";
  DROP INDEX "_events_v_rels_event_cycles_id_idx";
  DROP INDEX "event_cycles_rels_pages_id_idx";
  DROP INDEX "event_cycles_rels_posts_id_idx";
  DROP INDEX "event_cycles_rels_events_id_idx";
  DROP INDEX "event_cycles_rels_event_cycles_id_idx";
  DROP INDEX "_event_cycles_v_rels_pages_id_idx";
  DROP INDEX "_event_cycles_v_rels_posts_id_idx";
  DROP INDEX "_event_cycles_v_rels_events_id_idx";
  DROP INDEX "_event_cycles_v_rels_event_cycles_id_idx";
  ALTER TABLE "pages_blocks_listing" DROP COLUMN "selection_mode";
  ALTER TABLE "pages_rels" DROP COLUMN "pages_id";
  ALTER TABLE "pages_rels" DROP COLUMN "posts_id";
  ALTER TABLE "pages_rels" DROP COLUMN "events_id";
  ALTER TABLE "pages_rels" DROP COLUMN "event_cycles_id";
  ALTER TABLE "_pages_v_blocks_listing" DROP COLUMN "selection_mode";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "pages_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "posts_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "events_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "event_cycles_id";
  ALTER TABLE "posts_blocks_listing" DROP COLUMN "selection_mode";
  ALTER TABLE "posts_rels" DROP COLUMN "pages_id";
  ALTER TABLE "posts_rels" DROP COLUMN "posts_id";
  ALTER TABLE "_posts_v_blocks_listing" DROP COLUMN "selection_mode";
  ALTER TABLE "_posts_v_rels" DROP COLUMN "pages_id";
  ALTER TABLE "_posts_v_rels" DROP COLUMN "posts_id";
  ALTER TABLE "events_blocks_listing" DROP COLUMN "selection_mode";
  ALTER TABLE "events_rels" DROP COLUMN "pages_id";
  ALTER TABLE "events_rels" DROP COLUMN "posts_id";
  ALTER TABLE "events_rels" DROP COLUMN "events_id";
  ALTER TABLE "events_rels" DROP COLUMN "event_cycles_id";
  ALTER TABLE "_events_v_blocks_listing" DROP COLUMN "selection_mode";
  ALTER TABLE "_events_v_rels" DROP COLUMN "pages_id";
  ALTER TABLE "_events_v_rels" DROP COLUMN "posts_id";
  ALTER TABLE "_events_v_rels" DROP COLUMN "events_id";
  ALTER TABLE "_events_v_rels" DROP COLUMN "event_cycles_id";
  ALTER TABLE "event_cycles_blocks_listing" DROP COLUMN "selection_mode";
  ALTER TABLE "event_cycles_rels" DROP COLUMN "pages_id";
  ALTER TABLE "event_cycles_rels" DROP COLUMN "posts_id";
  ALTER TABLE "event_cycles_rels" DROP COLUMN "events_id";
  ALTER TABLE "event_cycles_rels" DROP COLUMN "event_cycles_id";
  ALTER TABLE "_event_cycles_v_blocks_listing" DROP COLUMN "selection_mode";
  ALTER TABLE "_event_cycles_v_rels" DROP COLUMN "pages_id";
  ALTER TABLE "_event_cycles_v_rels" DROP COLUMN "posts_id";
  ALTER TABLE "_event_cycles_v_rels" DROP COLUMN "events_id";
  ALTER TABLE "_event_cycles_v_rels" DROP COLUMN "event_cycles_id";
  ALTER TABLE "partners_blocks_listing" DROP COLUMN "selection_mode";
  ALTER TABLE "_partners_v_blocks_listing" DROP COLUMN "selection_mode";
  DROP TYPE "public"."enum_pages_blocks_listing_selection_mode";
  DROP TYPE "public"."enum__pages_v_blocks_listing_selection_mode";
  DROP TYPE "public"."enum_posts_blocks_listing_selection_mode";
  DROP TYPE "public"."enum__posts_v_blocks_listing_selection_mode";
  DROP TYPE "public"."enum_events_blocks_listing_selection_mode";
  DROP TYPE "public"."enum__events_v_blocks_listing_selection_mode";
  DROP TYPE "public"."enum_event_cycles_blocks_listing_selection_mode";
  DROP TYPE "public"."enum__event_cycles_v_blocks_listing_selection_mode";
  DROP TYPE "public"."enum_partners_blocks_listing_selection_mode";
  DROP TYPE "public"."enum__partners_v_blocks_listing_selection_mode";`)
}
