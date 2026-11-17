import { migrateLegacyLocations, restoreLegacyLocationColumns } from './lib/legacy-locations'
import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_locations_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__locations_v_version_status" AS ENUM('draft', 'published');
  ALTER TYPE "public"."enum_content_listing_items_source" ADD VALUE 'locations' BEFORE 'member-profiles';
  ALTER TYPE "public"."enum_page_templates_blocks_listing_sources" ADD VALUE 'locations' BEFORE 'member-profiles';
  ALTER TYPE "public"."enum__page_templates_v_blocks_listing_sources" ADD VALUE 'locations' BEFORE 'member-profiles';
  ALTER TYPE "public"."enum_pages_blocks_listing_sources" ADD VALUE 'locations' BEFORE 'member-profiles';
  ALTER TYPE "public"."enum__pages_v_blocks_listing_sources" ADD VALUE 'locations' BEFORE 'member-profiles';
  ALTER TYPE "public"."enum_posts_blocks_listing_sources" ADD VALUE 'locations' BEFORE 'member-profiles';
  ALTER TYPE "public"."enum__posts_v_blocks_listing_sources" ADD VALUE 'locations' BEFORE 'member-profiles';
  ALTER TYPE "public"."enum_events_blocks_listing_sources" ADD VALUE 'locations' BEFORE 'member-profiles';
  ALTER TYPE "public"."enum__events_v_blocks_listing_sources" ADD VALUE 'locations' BEFORE 'member-profiles';
  ALTER TYPE "public"."enum_event_cycles_blocks_listing_sources" ADD VALUE 'locations' BEFORE 'member-profiles';
  ALTER TYPE "public"."enum__event_cycles_v_blocks_listing_sources" ADD VALUE 'locations' BEFORE 'member-profiles';
  ALTER TYPE "public"."enum_partners_blocks_listing_sources" ADD VALUE 'locations' BEFORE 'member-profiles';
  ALTER TYPE "public"."enum__partners_v_blocks_listing_sources" ADD VALUE 'locations' BEFORE 'member-profiles';
  ALTER TYPE "public"."enum_roles_permissions_resource" ADD VALUE 'locations' BEFORE 'partners';
  ALTER TYPE "public"."enum_homepage_sections_blocks_listing_sources" ADD VALUE 'locations' BEFORE 'member-profiles';
  ALTER TYPE "public"."enum__homepage_sections_v_blocks_listing_sources" ADD VALUE 'locations' BEFORE 'member-profiles';
  CREATE TABLE "locations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"venue_name" varchar,
  	"venue_website" varchar,
  	"street_address" varchar,
  	"postal_code" varchar,
  	"city" varchar DEFAULT 'Wrocław',
  	"country" varchar DEFAULT 'Polska',
  	"map_embed_u_r_l" varchar,
  	"is_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"deleted_at" timestamp(3) with time zone,
  	"_status" "enum_locations_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_locations_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_venue_name" varchar,
  	"version_venue_website" varchar,
  	"version_street_address" varchar,
  	"version_postal_code" varchar,
  	"version_city" varchar DEFAULT 'Wrocław',
  	"version_country" varchar DEFAULT 'Polska',
  	"version_map_embed_u_r_l" varchar,
  	"version_is_active" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_deleted_at" timestamp(3) with time zone,
  	"version__status" "enum__locations_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "content_listing_items" ADD COLUMN "is_inactive_location" boolean DEFAULT false;
  ALTER TABLE "content_listing_items_rels" ADD COLUMN "locations_id" integer;
  ALTER TABLE "page_templates_blocks_listing" ADD COLUMN "include_inactive_locations" boolean DEFAULT false;
  ALTER TABLE "page_templates_rels" ADD COLUMN "locations_id" integer;
  ALTER TABLE "_page_templates_v_blocks_listing" ADD COLUMN "include_inactive_locations" boolean DEFAULT false;
  ALTER TABLE "_page_templates_v_rels" ADD COLUMN "locations_id" integer;
  ALTER TABLE "pages_blocks_listing" ADD COLUMN "include_inactive_locations" boolean DEFAULT false;
  ALTER TABLE "pages_rels" ADD COLUMN "locations_id" integer;
  ALTER TABLE "_pages_v_blocks_listing" ADD COLUMN "include_inactive_locations" boolean DEFAULT false;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "locations_id" integer;
  ALTER TABLE "posts_blocks_listing" ADD COLUMN "include_inactive_locations" boolean DEFAULT false;
  ALTER TABLE "posts_rels" ADD COLUMN "locations_id" integer;
  ALTER TABLE "_posts_v_blocks_listing" ADD COLUMN "include_inactive_locations" boolean DEFAULT false;
  ALTER TABLE "_posts_v_rels" ADD COLUMN "locations_id" integer;
  ALTER TABLE "events_blocks_listing" ADD COLUMN "include_inactive_locations" boolean DEFAULT false;
  ALTER TABLE "events" ADD COLUMN "location_id" integer;
  ALTER TABLE "events" ADD COLUMN "legacy_location" jsonb;
  ALTER TABLE "events" ADD COLUMN "confirmed_missing_location" boolean;
  ALTER TABLE "events" ADD COLUMN "online_event_u_r_l" varchar;
  ALTER TABLE "events_rels" ADD COLUMN "locations_id" integer;
  ALTER TABLE "_events_v_blocks_listing" ADD COLUMN "include_inactive_locations" boolean DEFAULT false;
  ALTER TABLE "_events_v" ADD COLUMN "version_location_id" integer;
  ALTER TABLE "_events_v" ADD COLUMN "version_legacy_location" jsonb;
  ALTER TABLE "_events_v" ADD COLUMN "version_confirmed_missing_location" boolean;
  ALTER TABLE "_events_v" ADD COLUMN "version_online_event_u_r_l" varchar;
  ALTER TABLE "_events_v_rels" ADD COLUMN "locations_id" integer;
  ALTER TABLE "event_cycles_blocks_listing" ADD COLUMN "include_inactive_locations" boolean DEFAULT false;
  ALTER TABLE "event_cycles" ADD COLUMN "event_defaults_location_id" integer;
  ALTER TABLE "event_cycles" ADD COLUMN "event_defaults_legacy_location" jsonb;
  ALTER TABLE "event_cycles" ADD COLUMN "event_defaults_confirmed_missing_location" boolean;
  ALTER TABLE "event_cycles_rels" ADD COLUMN "locations_id" integer;
  ALTER TABLE "_event_cycles_v_blocks_listing" ADD COLUMN "include_inactive_locations" boolean DEFAULT false;
  ALTER TABLE "_event_cycles_v" ADD COLUMN "version_event_defaults_location_id" integer;
  ALTER TABLE "_event_cycles_v" ADD COLUMN "version_event_defaults_legacy_location" jsonb;
  ALTER TABLE "_event_cycles_v" ADD COLUMN "version_event_defaults_confirmed_missing_location" boolean;
  ALTER TABLE "_event_cycles_v_rels" ADD COLUMN "locations_id" integer;
  ALTER TABLE "partners_blocks_listing" ADD COLUMN "include_inactive_locations" boolean DEFAULT false;
  ALTER TABLE "partners_rels" ADD COLUMN "locations_id" integer;
  ALTER TABLE "_partners_v_blocks_listing" ADD COLUMN "include_inactive_locations" boolean DEFAULT false;
  ALTER TABLE "_partners_v_rels" ADD COLUMN "locations_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "locations_id" integer;
  ALTER TABLE "homepage_sections_blocks_listing" ADD COLUMN "include_inactive_locations" boolean DEFAULT false;
  ALTER TABLE "homepage_sections_rels" ADD COLUMN "locations_id" integer;
  ALTER TABLE "_homepage_sections_v_blocks_listing" ADD COLUMN "include_inactive_locations" boolean DEFAULT false;
  ALTER TABLE "_homepage_sections_v_rels" ADD COLUMN "locations_id" integer;
  ALTER TABLE "_locations_v" ADD CONSTRAINT "_locations_v_parent_id_locations_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "locations_is_active_idx" ON "locations" USING btree ("is_active");
  CREATE INDEX "locations_updated_at_idx" ON "locations" USING btree ("updated_at");
  CREATE INDEX "locations_created_at_idx" ON "locations" USING btree ("created_at");
  CREATE INDEX "locations_deleted_at_idx" ON "locations" USING btree ("deleted_at");
  CREATE INDEX "locations__status_idx" ON "locations" USING btree ("_status");
  CREATE INDEX "_locations_v_parent_idx" ON "_locations_v" USING btree ("parent_id");
  CREATE INDEX "_locations_v_version_version_is_active_idx" ON "_locations_v" USING btree ("version_is_active");
  CREATE INDEX "_locations_v_version_version_updated_at_idx" ON "_locations_v" USING btree ("version_updated_at");
  CREATE INDEX "_locations_v_version_version_created_at_idx" ON "_locations_v" USING btree ("version_created_at");
  CREATE INDEX "_locations_v_version_version_deleted_at_idx" ON "_locations_v" USING btree ("version_deleted_at");
  CREATE INDEX "_locations_v_version_version__status_idx" ON "_locations_v" USING btree ("version__status");
  CREATE INDEX "_locations_v_created_at_idx" ON "_locations_v" USING btree ("created_at");
  CREATE INDEX "_locations_v_updated_at_idx" ON "_locations_v" USING btree ("updated_at");
  CREATE INDEX "_locations_v_latest_idx" ON "_locations_v" USING btree ("latest");
  ALTER TABLE "content_listing_items_rels" ADD CONSTRAINT "content_listing_items_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_rels" ADD CONSTRAINT "page_templates_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_v_rels" ADD CONSTRAINT "_page_templates_v_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_location_id_locations_id_fk" FOREIGN KEY ("version_location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles" ADD CONSTRAINT "event_cycles_event_defaults_location_id_locations_id_fk" FOREIGN KEY ("event_defaults_location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_rels" ADD CONSTRAINT "event_cycles_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v" ADD CONSTRAINT "_event_cycles_v_version_event_defaults_location_id_locations_id_fk" FOREIGN KEY ("version_event_defaults_location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_rels" ADD CONSTRAINT "_event_cycles_v_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_rels" ADD CONSTRAINT "partners_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_rels" ADD CONSTRAINT "_partners_v_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_rels" ADD CONSTRAINT "homepage_sections_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_rels" ADD CONSTRAINT "_homepage_sections_v_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "content_listing_items_rels_locations_id_idx" ON "content_listing_items_rels" USING btree ("locations_id");
  CREATE INDEX "page_templates_rels_locations_id_idx" ON "page_templates_rels" USING btree ("locations_id");
  CREATE INDEX "_page_templates_v_rels_locations_id_idx" ON "_page_templates_v_rels" USING btree ("locations_id");
  CREATE INDEX "pages_rels_locations_id_idx" ON "pages_rels" USING btree ("locations_id");
  CREATE INDEX "_pages_v_rels_locations_id_idx" ON "_pages_v_rels" USING btree ("locations_id");
  CREATE INDEX "posts_rels_locations_id_idx" ON "posts_rels" USING btree ("locations_id");
  CREATE INDEX "_posts_v_rels_locations_id_idx" ON "_posts_v_rels" USING btree ("locations_id");
  CREATE INDEX "events_location_idx" ON "events" USING btree ("location_id");
  CREATE INDEX "events_rels_locations_id_idx" ON "events_rels" USING btree ("locations_id");
  CREATE INDEX "_events_v_version_version_location_idx" ON "_events_v" USING btree ("version_location_id");
  CREATE INDEX "_events_v_rels_locations_id_idx" ON "_events_v_rels" USING btree ("locations_id");
  CREATE INDEX "event_cycles_event_defaults_event_defaults_location_idx" ON "event_cycles" USING btree ("event_defaults_location_id");
  CREATE INDEX "event_cycles_rels_locations_id_idx" ON "event_cycles_rels" USING btree ("locations_id");
  CREATE INDEX "_event_cycles_v_version_event_defaults_version_event_d_4_idx" ON "_event_cycles_v" USING btree ("version_event_defaults_location_id");
  CREATE INDEX "_event_cycles_v_rels_locations_id_idx" ON "_event_cycles_v_rels" USING btree ("locations_id");
  CREATE INDEX "partners_rels_locations_id_idx" ON "partners_rels" USING btree ("locations_id");
  CREATE INDEX "_partners_v_rels_locations_id_idx" ON "_partners_v_rels" USING btree ("locations_id");
  CREATE INDEX "payload_locked_documents_rels_locations_id_idx" ON "payload_locked_documents_rels" USING btree ("locations_id");
  CREATE INDEX "homepage_sections_rels_locations_id_idx" ON "homepage_sections_rels" USING btree ("locations_id");
  CREATE INDEX "_homepage_sections_v_rels_locations_id_idx" ON "_homepage_sections_v_rels" USING btree ("locations_id");
  `)
  await migrateLegacyLocations(db)
  await db.execute(sql`
  ALTER TABLE "events" DROP COLUMN "location_venue_name";
  ALTER TABLE "events" DROP COLUMN "location_venue_website";
  ALTER TABLE "events" DROP COLUMN "location_street_address";
  ALTER TABLE "events" DROP COLUMN "location_postal_code";
  ALTER TABLE "events" DROP COLUMN "location_city";
  ALTER TABLE "events" DROP COLUMN "location_map_embed_u_r_l";
  ALTER TABLE "events" DROP COLUMN "location_country";
  ALTER TABLE "_events_v" DROP COLUMN "version_location_venue_name";
  ALTER TABLE "_events_v" DROP COLUMN "version_location_venue_website";
  ALTER TABLE "_events_v" DROP COLUMN "version_location_street_address";
  ALTER TABLE "_events_v" DROP COLUMN "version_location_postal_code";
  ALTER TABLE "_events_v" DROP COLUMN "version_location_city";
  ALTER TABLE "_events_v" DROP COLUMN "version_location_map_embed_u_r_l";
  ALTER TABLE "_events_v" DROP COLUMN "version_location_country";
  ALTER TABLE "event_cycles" DROP COLUMN "event_defaults_location_venue_name";
  ALTER TABLE "event_cycles" DROP COLUMN "event_defaults_location_venue_website";
  ALTER TABLE "event_cycles" DROP COLUMN "event_defaults_location_street_address";
  ALTER TABLE "event_cycles" DROP COLUMN "event_defaults_location_postal_code";
  ALTER TABLE "event_cycles" DROP COLUMN "event_defaults_location_city";
  ALTER TABLE "event_cycles" DROP COLUMN "event_defaults_location_map_embed_u_r_l";
  ALTER TABLE "event_cycles" DROP COLUMN "event_defaults_location_country";
  ALTER TABLE "_event_cycles_v" DROP COLUMN "version_event_defaults_location_venue_name";
  ALTER TABLE "_event_cycles_v" DROP COLUMN "version_event_defaults_location_venue_website";
  ALTER TABLE "_event_cycles_v" DROP COLUMN "version_event_defaults_location_street_address";
  ALTER TABLE "_event_cycles_v" DROP COLUMN "version_event_defaults_location_postal_code";
  ALTER TABLE "_event_cycles_v" DROP COLUMN "version_event_defaults_location_city";
  ALTER TABLE "_event_cycles_v" DROP COLUMN "version_event_defaults_location_map_embed_u_r_l";
  ALTER TABLE "_event_cycles_v" DROP COLUMN "version_event_defaults_location_country";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "content_listing_items_rels" DROP CONSTRAINT "content_listing_items_rels_locations_fk";
  
  ALTER TABLE "page_templates_rels" DROP CONSTRAINT "page_templates_rels_locations_fk";
  
  ALTER TABLE "_page_templates_v_rels" DROP CONSTRAINT "_page_templates_v_rels_locations_fk";
  
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_locations_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_locations_fk";
  
  ALTER TABLE "posts_rels" DROP CONSTRAINT "posts_rels_locations_fk";
  
  ALTER TABLE "_posts_v_rels" DROP CONSTRAINT "_posts_v_rels_locations_fk";
  
  ALTER TABLE "events" DROP CONSTRAINT "events_location_id_locations_id_fk";
  
  ALTER TABLE "events_rels" DROP CONSTRAINT "events_rels_locations_fk";
  
  ALTER TABLE "_events_v" DROP CONSTRAINT "_events_v_version_location_id_locations_id_fk";
  
  ALTER TABLE "_events_v_rels" DROP CONSTRAINT "_events_v_rels_locations_fk";
  
  ALTER TABLE "event_cycles" DROP CONSTRAINT "event_cycles_event_defaults_location_id_locations_id_fk";
  
  ALTER TABLE "event_cycles_rels" DROP CONSTRAINT "event_cycles_rels_locations_fk";
  
  ALTER TABLE "_event_cycles_v" DROP CONSTRAINT "_event_cycles_v_version_event_defaults_location_id_locations_id_fk";
  
  ALTER TABLE "_event_cycles_v_rels" DROP CONSTRAINT "_event_cycles_v_rels_locations_fk";
  
  ALTER TABLE "partners_rels" DROP CONSTRAINT "partners_rels_locations_fk";
  
  ALTER TABLE "_partners_v_rels" DROP CONSTRAINT "_partners_v_rels_locations_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_locations_fk";
  
  ALTER TABLE "homepage_sections_rels" DROP CONSTRAINT "homepage_sections_rels_locations_fk";
  
  ALTER TABLE "_homepage_sections_v_rels" DROP CONSTRAINT "_homepage_sections_v_rels_locations_fk";
  
  DELETE FROM "content_listing_items" WHERE "source" = 'locations';
  ALTER TABLE "content_listing_items" ALTER COLUMN "source" SET DATA TYPE text;
  DROP TYPE "public"."enum_content_listing_items_source";
  CREATE TYPE "public"."enum_content_listing_items_source" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents', 'partners', 'member-profiles');
  ALTER TABLE "content_listing_items" ALTER COLUMN "source" SET DATA TYPE "public"."enum_content_listing_items_source" USING "source"::"public"."enum_content_listing_items_source";
  DELETE FROM "page_templates_blocks_listing_sources" WHERE "value" = 'locations';
  ALTER TABLE "page_templates_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_page_templates_blocks_listing_sources";
  CREATE TYPE "public"."enum_page_templates_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents', 'partners', 'member-profiles');
  ALTER TABLE "page_templates_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum_page_templates_blocks_listing_sources" USING "value"::"public"."enum_page_templates_blocks_listing_sources";
  DELETE FROM "_page_templates_v_blocks_listing_sources" WHERE "value" = 'locations';
  ALTER TABLE "_page_templates_v_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum__page_templates_v_blocks_listing_sources";
  CREATE TYPE "public"."enum__page_templates_v_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents', 'partners', 'member-profiles');
  ALTER TABLE "_page_templates_v_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum__page_templates_v_blocks_listing_sources" USING "value"::"public"."enum__page_templates_v_blocks_listing_sources";
  DELETE FROM "pages_blocks_listing_sources" WHERE "value" = 'locations';
  ALTER TABLE "pages_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_pages_blocks_listing_sources";
  CREATE TYPE "public"."enum_pages_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents', 'partners', 'member-profiles');
  ALTER TABLE "pages_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum_pages_blocks_listing_sources" USING "value"::"public"."enum_pages_blocks_listing_sources";
  DELETE FROM "_pages_v_blocks_listing_sources" WHERE "value" = 'locations';
  ALTER TABLE "_pages_v_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum__pages_v_blocks_listing_sources";
  CREATE TYPE "public"."enum__pages_v_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents', 'partners', 'member-profiles');
  ALTER TABLE "_pages_v_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum__pages_v_blocks_listing_sources" USING "value"::"public"."enum__pages_v_blocks_listing_sources";
  DELETE FROM "posts_blocks_listing_sources" WHERE "value" = 'locations';
  ALTER TABLE "posts_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_posts_blocks_listing_sources";
  CREATE TYPE "public"."enum_posts_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents', 'partners', 'member-profiles');
  ALTER TABLE "posts_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum_posts_blocks_listing_sources" USING "value"::"public"."enum_posts_blocks_listing_sources";
  DELETE FROM "_posts_v_blocks_listing_sources" WHERE "value" = 'locations';
  ALTER TABLE "_posts_v_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum__posts_v_blocks_listing_sources";
  CREATE TYPE "public"."enum__posts_v_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents', 'partners', 'member-profiles');
  ALTER TABLE "_posts_v_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum__posts_v_blocks_listing_sources" USING "value"::"public"."enum__posts_v_blocks_listing_sources";
  DELETE FROM "events_blocks_listing_sources" WHERE "value" = 'locations';
  ALTER TABLE "events_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_events_blocks_listing_sources";
  CREATE TYPE "public"."enum_events_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents', 'partners', 'member-profiles');
  ALTER TABLE "events_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum_events_blocks_listing_sources" USING "value"::"public"."enum_events_blocks_listing_sources";
  DELETE FROM "_events_v_blocks_listing_sources" WHERE "value" = 'locations';
  ALTER TABLE "_events_v_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum__events_v_blocks_listing_sources";
  CREATE TYPE "public"."enum__events_v_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents', 'partners', 'member-profiles');
  ALTER TABLE "_events_v_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum__events_v_blocks_listing_sources" USING "value"::"public"."enum__events_v_blocks_listing_sources";
  DELETE FROM "event_cycles_blocks_listing_sources" WHERE "value" = 'locations';
  ALTER TABLE "event_cycles_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_event_cycles_blocks_listing_sources";
  CREATE TYPE "public"."enum_event_cycles_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents', 'partners', 'member-profiles');
  ALTER TABLE "event_cycles_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum_event_cycles_blocks_listing_sources" USING "value"::"public"."enum_event_cycles_blocks_listing_sources";
  DELETE FROM "_event_cycles_v_blocks_listing_sources" WHERE "value" = 'locations';
  ALTER TABLE "_event_cycles_v_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum__event_cycles_v_blocks_listing_sources";
  CREATE TYPE "public"."enum__event_cycles_v_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents', 'partners', 'member-profiles');
  ALTER TABLE "_event_cycles_v_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum__event_cycles_v_blocks_listing_sources" USING "value"::"public"."enum__event_cycles_v_blocks_listing_sources";
  DELETE FROM "partners_blocks_listing_sources" WHERE "value" = 'locations';
  ALTER TABLE "partners_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_partners_blocks_listing_sources";
  CREATE TYPE "public"."enum_partners_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents', 'partners', 'member-profiles');
  ALTER TABLE "partners_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum_partners_blocks_listing_sources" USING "value"::"public"."enum_partners_blocks_listing_sources";
  DELETE FROM "_partners_v_blocks_listing_sources" WHERE "value" = 'locations';
  ALTER TABLE "_partners_v_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum__partners_v_blocks_listing_sources";
  CREATE TYPE "public"."enum__partners_v_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents', 'partners', 'member-profiles');
  ALTER TABLE "_partners_v_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum__partners_v_blocks_listing_sources" USING "value"::"public"."enum__partners_v_blocks_listing_sources";
  DELETE FROM "roles_permissions" WHERE "resource" = 'locations';
  ALTER TABLE "roles_permissions" ALTER COLUMN "resource" SET DATA TYPE text;
  DROP TYPE "public"."enum_roles_permissions_resource";
  CREATE TYPE "public"."enum_roles_permissions_resource" AS ENUM('users', 'user-groups', 'media', 'member-profiles', 'pages', 'posts', 'events', 'event-cycles', 'event-types', 'partners', 'documents', 'url-aliases', 'categories', 'tags', 'page-templates', 'navigation', 'site-settings', 'content-audit-log');
  ALTER TABLE "roles_permissions" ALTER COLUMN "resource" SET DATA TYPE "public"."enum_roles_permissions_resource" USING "resource"::"public"."enum_roles_permissions_resource";
  DELETE FROM "homepage_sections_blocks_listing_sources" WHERE "value" = 'locations';
  ALTER TABLE "homepage_sections_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_homepage_sections_blocks_listing_sources";
  CREATE TYPE "public"."enum_homepage_sections_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents', 'partners', 'member-profiles');
  ALTER TABLE "homepage_sections_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum_homepage_sections_blocks_listing_sources" USING "value"::"public"."enum_homepage_sections_blocks_listing_sources";
  DELETE FROM "_homepage_sections_v_blocks_listing_sources" WHERE "value" = 'locations';
  ALTER TABLE "_homepage_sections_v_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum__homepage_sections_v_blocks_listing_sources";
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents', 'partners', 'member-profiles');
  ALTER TABLE "_homepage_sections_v_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum__homepage_sections_v_blocks_listing_sources" USING "value"::"public"."enum__homepage_sections_v_blocks_listing_sources";
  DROP INDEX "content_listing_items_rels_locations_id_idx";
  DROP INDEX "page_templates_rels_locations_id_idx";
  DROP INDEX "_page_templates_v_rels_locations_id_idx";
  DROP INDEX "pages_rels_locations_id_idx";
  DROP INDEX "_pages_v_rels_locations_id_idx";
  DROP INDEX "posts_rels_locations_id_idx";
  DROP INDEX "_posts_v_rels_locations_id_idx";
  DROP INDEX "events_location_idx";
  DROP INDEX "events_rels_locations_id_idx";
  DROP INDEX "_events_v_version_version_location_idx";
  DROP INDEX "_events_v_rels_locations_id_idx";
  DROP INDEX "event_cycles_event_defaults_event_defaults_location_idx";
  DROP INDEX "event_cycles_rels_locations_id_idx";
  DROP INDEX "_event_cycles_v_version_event_defaults_version_event_d_4_idx";
  DROP INDEX "_event_cycles_v_rels_locations_id_idx";
  DROP INDEX "partners_rels_locations_id_idx";
  DROP INDEX "_partners_v_rels_locations_id_idx";
  DROP INDEX "payload_locked_documents_rels_locations_id_idx";
  DROP INDEX "homepage_sections_rels_locations_id_idx";
  DROP INDEX "_homepage_sections_v_rels_locations_id_idx";
  ALTER TABLE "events" ADD COLUMN "location_venue_name" varchar;
  ALTER TABLE "events" ADD COLUMN "location_venue_website" varchar;
  ALTER TABLE "events" ADD COLUMN "location_street_address" varchar;
  ALTER TABLE "events" ADD COLUMN "location_postal_code" varchar;
  ALTER TABLE "events" ADD COLUMN "location_city" varchar DEFAULT 'Wrocław';
  ALTER TABLE "events" ADD COLUMN "location_map_embed_u_r_l" varchar;
  ALTER TABLE "events" ADD COLUMN "location_country" varchar DEFAULT 'Polska';
  ALTER TABLE "_events_v" ADD COLUMN "version_location_venue_name" varchar;
  ALTER TABLE "_events_v" ADD COLUMN "version_location_venue_website" varchar;
  ALTER TABLE "_events_v" ADD COLUMN "version_location_street_address" varchar;
  ALTER TABLE "_events_v" ADD COLUMN "version_location_postal_code" varchar;
  ALTER TABLE "_events_v" ADD COLUMN "version_location_city" varchar DEFAULT 'Wrocław';
  ALTER TABLE "_events_v" ADD COLUMN "version_location_map_embed_u_r_l" varchar;
  ALTER TABLE "_events_v" ADD COLUMN "version_location_country" varchar DEFAULT 'Polska';
  ALTER TABLE "event_cycles" ADD COLUMN "event_defaults_location_venue_name" varchar;
  ALTER TABLE "event_cycles" ADD COLUMN "event_defaults_location_venue_website" varchar;
  ALTER TABLE "event_cycles" ADD COLUMN "event_defaults_location_street_address" varchar;
  ALTER TABLE "event_cycles" ADD COLUMN "event_defaults_location_postal_code" varchar;
  ALTER TABLE "event_cycles" ADD COLUMN "event_defaults_location_city" varchar DEFAULT 'Wrocław';
  ALTER TABLE "event_cycles" ADD COLUMN "event_defaults_location_map_embed_u_r_l" varchar;
  ALTER TABLE "event_cycles" ADD COLUMN "event_defaults_location_country" varchar DEFAULT 'Polska';
  ALTER TABLE "_event_cycles_v" ADD COLUMN "version_event_defaults_location_venue_name" varchar;
  ALTER TABLE "_event_cycles_v" ADD COLUMN "version_event_defaults_location_venue_website" varchar;
  ALTER TABLE "_event_cycles_v" ADD COLUMN "version_event_defaults_location_street_address" varchar;
  ALTER TABLE "_event_cycles_v" ADD COLUMN "version_event_defaults_location_postal_code" varchar;
  ALTER TABLE "_event_cycles_v" ADD COLUMN "version_event_defaults_location_city" varchar DEFAULT 'Wrocław';
  ALTER TABLE "_event_cycles_v" ADD COLUMN "version_event_defaults_location_map_embed_u_r_l" varchar;
  ALTER TABLE "_event_cycles_v" ADD COLUMN "version_event_defaults_location_country" varchar DEFAULT 'Polska';
  `)
  await restoreLegacyLocationColumns(db)
  await db.execute(sql`
  ALTER TABLE "content_listing_items" DROP COLUMN "is_inactive_location";
  ALTER TABLE "content_listing_items_rels" DROP COLUMN "locations_id";
  ALTER TABLE "page_templates_blocks_listing" DROP COLUMN "include_inactive_locations";
  ALTER TABLE "page_templates_rels" DROP COLUMN "locations_id";
  ALTER TABLE "_page_templates_v_blocks_listing" DROP COLUMN "include_inactive_locations";
  ALTER TABLE "_page_templates_v_rels" DROP COLUMN "locations_id";
  ALTER TABLE "pages_blocks_listing" DROP COLUMN "include_inactive_locations";
  ALTER TABLE "pages_rels" DROP COLUMN "locations_id";
  ALTER TABLE "_pages_v_blocks_listing" DROP COLUMN "include_inactive_locations";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "locations_id";
  ALTER TABLE "posts_blocks_listing" DROP COLUMN "include_inactive_locations";
  ALTER TABLE "posts_rels" DROP COLUMN "locations_id";
  ALTER TABLE "_posts_v_blocks_listing" DROP COLUMN "include_inactive_locations";
  ALTER TABLE "_posts_v_rels" DROP COLUMN "locations_id";
  ALTER TABLE "events_blocks_listing" DROP COLUMN "include_inactive_locations";
  ALTER TABLE "events" DROP COLUMN "location_id";
  ALTER TABLE "events" DROP COLUMN "legacy_location";
  ALTER TABLE "events" DROP COLUMN "confirmed_missing_location";
  ALTER TABLE "events" DROP COLUMN "online_event_u_r_l";
  ALTER TABLE "events_rels" DROP COLUMN "locations_id";
  ALTER TABLE "_events_v_blocks_listing" DROP COLUMN "include_inactive_locations";
  ALTER TABLE "_events_v" DROP COLUMN "version_location_id";
  ALTER TABLE "_events_v" DROP COLUMN "version_legacy_location";
  ALTER TABLE "_events_v" DROP COLUMN "version_confirmed_missing_location";
  ALTER TABLE "_events_v" DROP COLUMN "version_online_event_u_r_l";
  ALTER TABLE "_events_v_rels" DROP COLUMN "locations_id";
  ALTER TABLE "event_cycles_blocks_listing" DROP COLUMN "include_inactive_locations";
  ALTER TABLE "event_cycles" DROP COLUMN "event_defaults_location_id";
  ALTER TABLE "event_cycles" DROP COLUMN "event_defaults_legacy_location";
  ALTER TABLE "event_cycles" DROP COLUMN "event_defaults_confirmed_missing_location";
  ALTER TABLE "event_cycles_rels" DROP COLUMN "locations_id";
  ALTER TABLE "_event_cycles_v_blocks_listing" DROP COLUMN "include_inactive_locations";
  ALTER TABLE "_event_cycles_v" DROP COLUMN "version_event_defaults_location_id";
  ALTER TABLE "_event_cycles_v" DROP COLUMN "version_event_defaults_legacy_location";
  ALTER TABLE "_event_cycles_v" DROP COLUMN "version_event_defaults_confirmed_missing_location";
  ALTER TABLE "_event_cycles_v_rels" DROP COLUMN "locations_id";
  ALTER TABLE "partners_blocks_listing" DROP COLUMN "include_inactive_locations";
  ALTER TABLE "partners_rels" DROP COLUMN "locations_id";
  ALTER TABLE "_partners_v_blocks_listing" DROP COLUMN "include_inactive_locations";
  ALTER TABLE "_partners_v_rels" DROP COLUMN "locations_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "locations_id";
  ALTER TABLE "homepage_sections_blocks_listing" DROP COLUMN "include_inactive_locations";
  ALTER TABLE "homepage_sections_rels" DROP COLUMN "locations_id";
  ALTER TABLE "_homepage_sections_v_blocks_listing" DROP COLUMN "include_inactive_locations";
  ALTER TABLE "_homepage_sections_v_rels" DROP COLUMN "locations_id";
  DROP TABLE "_locations_v";
  DROP TABLE "locations";
  DROP TYPE "public"."enum_locations_status";
  DROP TYPE "public"."enum__locations_v_version_status";`)
}
