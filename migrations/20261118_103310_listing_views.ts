import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

const listingTables = [
  'page_templates_blocks_listing',
  '_page_templates_v_blocks_listing',
  'pages_blocks_listing',
  '_pages_v_blocks_listing',
  'posts_blocks_listing',
  '_posts_v_blocks_listing',
  'events_blocks_listing',
  '_events_v_blocks_listing',
  'event_cycles_blocks_listing',
  '_event_cycles_v_blocks_listing',
  'partners_blocks_listing',
  '_partners_v_blocks_listing',
  'homepage_sections_blocks_listing',
  '_homepage_sections_v_blocks_listing',
] as const

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_listing_views_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__listing_views_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "listing_views" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar,
    "settings" jsonb DEFAULT '{"layout":"static","columns":3,"form":"vertical","dateFormat":"full","information":{"image":true,"kind":false,"date":true,"venue":true,"cycle":false,"excerpt":true,"taxonomy":false,"context":false,"interests":false,"calendar":false}}'::jsonb,
    "retired" boolean DEFAULT false,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "_status" "enum_listing_views_status" DEFAULT 'draft'
  );

  CREATE TABLE "_listing_views_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_name" varchar,
    "version_settings" jsonb DEFAULT '{"layout":"static","columns":3,"form":"vertical","dateFormat":"full","information":{"image":true,"kind":false,"date":true,"venue":true,"cycle":false,"excerpt":true,"taxonomy":false,"context":false,"interests":false,"calendar":false}}'::jsonb,
    "version_retired" boolean DEFAULT false,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "version__status" "enum__listing_views_v_version_status" DEFAULT 'draft',
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "latest" boolean
  );

  ALTER TABLE "page_templates_blocks_listing" ADD COLUMN "appearance" jsonb;
  ALTER TABLE "_page_templates_v_blocks_listing" ADD COLUMN "appearance" jsonb;
  ALTER TABLE "pages_blocks_listing" ADD COLUMN "appearance" jsonb;
  ALTER TABLE "_pages_v_blocks_listing" ADD COLUMN "appearance" jsonb;
  ALTER TABLE "posts_blocks_listing" ADD COLUMN "appearance" jsonb;
  ALTER TABLE "_posts_v_blocks_listing" ADD COLUMN "appearance" jsonb;
  ALTER TABLE "events_blocks_listing" ADD COLUMN "appearance" jsonb;
  ALTER TABLE "_events_v_blocks_listing" ADD COLUMN "appearance" jsonb;
  ALTER TABLE "event_cycles_blocks_listing" ADD COLUMN "appearance" jsonb;
  ALTER TABLE "_event_cycles_v_blocks_listing" ADD COLUMN "appearance" jsonb;
  ALTER TABLE "partners_blocks_listing" ADD COLUMN "appearance" jsonb;
  ALTER TABLE "_partners_v_blocks_listing" ADD COLUMN "appearance" jsonb;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "listing_views_id" integer;
  ALTER TABLE "homepage_sections_blocks_listing" ADD COLUMN "appearance" jsonb;
  ALTER TABLE "_homepage_sections_v_blocks_listing" ADD COLUMN "appearance" jsonb;
  ALTER TABLE "_listing_views_v" ADD CONSTRAINT "_listing_views_v_parent_id_listing_views_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."listing_views"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "listing_views_updated_at_idx" ON "listing_views" USING btree ("updated_at");
  CREATE INDEX "listing_views_created_at_idx" ON "listing_views" USING btree ("created_at");
  CREATE INDEX "listing_views__status_idx" ON "listing_views" USING btree ("_status");
  CREATE INDEX "_listing_views_v_parent_idx" ON "_listing_views_v" USING btree ("parent_id");
  CREATE INDEX "_listing_views_v_version_version_updated_at_idx" ON "_listing_views_v" USING btree ("version_updated_at");
  CREATE INDEX "_listing_views_v_version_version_created_at_idx" ON "_listing_views_v" USING btree ("version_created_at");
  CREATE INDEX "_listing_views_v_version_version__status_idx" ON "_listing_views_v" USING btree ("version__status");
  CREATE INDEX "_listing_views_v_created_at_idx" ON "_listing_views_v" USING btree ("created_at");
  CREATE INDEX "_listing_views_v_updated_at_idx" ON "_listing_views_v" USING btree ("updated_at");
  CREATE INDEX "_listing_views_v_latest_idx" ON "_listing_views_v" USING btree ("latest");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_listing_views_fk" FOREIGN KEY ("listing_views_id") REFERENCES "public"."listing_views"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_listing_views_id_idx" ON "payload_locked_documents_rels" USING btree ("listing_views_id");`)
  for (const table of listingTables) {
    await db.execute(sql`
      UPDATE ${sql.identifier(table)}
      SET "appearance" = jsonb_build_object('preset', "view"::text)
      WHERE "appearance" IS NULL;
    `)
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "listing_views_id";
  DROP TABLE "_listing_views_v";
  DROP TABLE "listing_views";
  ALTER TABLE "page_templates_blocks_listing" DROP COLUMN "appearance";
  ALTER TABLE "_page_templates_v_blocks_listing" DROP COLUMN "appearance";
  ALTER TABLE "pages_blocks_listing" DROP COLUMN "appearance";
  ALTER TABLE "_pages_v_blocks_listing" DROP COLUMN "appearance";
  ALTER TABLE "posts_blocks_listing" DROP COLUMN "appearance";
  ALTER TABLE "_posts_v_blocks_listing" DROP COLUMN "appearance";
  ALTER TABLE "events_blocks_listing" DROP COLUMN "appearance";
  ALTER TABLE "_events_v_blocks_listing" DROP COLUMN "appearance";
  ALTER TABLE "event_cycles_blocks_listing" DROP COLUMN "appearance";
  ALTER TABLE "_event_cycles_v_blocks_listing" DROP COLUMN "appearance";
  ALTER TABLE "partners_blocks_listing" DROP COLUMN "appearance";
  ALTER TABLE "_partners_v_blocks_listing" DROP COLUMN "appearance";
  ALTER TABLE "homepage_sections_blocks_listing" DROP COLUMN "appearance";
  ALTER TABLE "_homepage_sections_v_blocks_listing" DROP COLUMN "appearance";
  DROP TYPE "public"."enum_listing_views_status";
  DROP TYPE "public"."enum__listing_views_v_version_status";`)
}
