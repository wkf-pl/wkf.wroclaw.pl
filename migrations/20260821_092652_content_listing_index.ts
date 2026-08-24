import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  const existingSchema = await db.execute(sql`
    SELECT
      to_regclass('public.content_listing_items') IS NOT NULL AS "itemsTable",
      to_regclass('public.content_listing_items_rels') IS NOT NULL AS "relationsTable",
      to_regtype('public.enum_content_listing_items_source') IS NOT NULL AS "sourceType",
      to_regtype('public.enum_content_listing_items_visibility') IS NOT NULL AS "visibilityType"
  `)
  const schemaParts = existingSchema.rows[0] as
    | {
        itemsTable: boolean
        relationsTable: boolean
        sourceType: boolean
        visibilityType: boolean
      }
    | undefined
  const schemaAlreadyExists = schemaParts && Object.values(schemaParts).every(Boolean)
  const schemaIsMissing = schemaParts && Object.values(schemaParts).every((exists) => !exists)

  if (!schemaAlreadyExists && !schemaIsMissing) {
    throw new Error(
      'Content listing schema is only partially present. Restore the database backup before running migrations.',
    )
  }

  if (schemaIsMissing) {
    await db.execute(sql`
   CREATE TYPE "public"."enum_content_listing_items_source" AS ENUM('pages', 'posts', 'events', 'event-cycles');
  CREATE TYPE "public"."enum_content_listing_items_visibility" AS ENUM('public', 'members');
  CREATE TABLE "content_listing_items" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"source" "enum_content_listing_items_source" NOT NULL,
  	"source_document_id" numeric NOT NULL,
  	"source_updated_at" timestamp(3) with time zone NOT NULL,
  	"title" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"excerpt" varchar,
  	"sort_date" timestamp(3) with time zone NOT NULL,
  	"event_start_at" timestamp(3) with time zone,
  	"event_end_at" timestamp(3) with time zone,
  	"visibility" "enum_content_listing_items_visibility",
  	"hero_image_id" integer,
  	"parent_page_id" integer,
  	"event_cycle_id" integer
  );
  
  CREATE TABLE "content_listing_items_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer,
  	"tags_id" integer
  );
  
  ALTER TABLE "content_listing_items" ADD CONSTRAINT "content_listing_items_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "content_listing_items" ADD CONSTRAINT "content_listing_items_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "content_listing_items" ADD CONSTRAINT "content_listing_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "content_listing_items_rels" ADD CONSTRAINT "content_listing_items_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."content_listing_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_listing_items_rels" ADD CONSTRAINT "content_listing_items_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_listing_items_rels" ADD CONSTRAINT "content_listing_items_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "content_listing_items_source_idx" ON "content_listing_items" USING btree ("source");
  CREATE INDEX "content_listing_items_source_document_id_idx" ON "content_listing_items" USING btree ("source_document_id");
  CREATE INDEX "content_listing_items_title_idx" ON "content_listing_items" USING btree ("title");
  CREATE INDEX "content_listing_items_sort_date_idx" ON "content_listing_items" USING btree ("sort_date");
  CREATE INDEX "content_listing_items_event_start_at_idx" ON "content_listing_items" USING btree ("event_start_at");
  CREATE INDEX "content_listing_items_event_end_at_idx" ON "content_listing_items" USING btree ("event_end_at");
  CREATE INDEX "content_listing_items_visibility_idx" ON "content_listing_items" USING btree ("visibility");
  CREATE INDEX "content_listing_items_hero_image_idx" ON "content_listing_items" USING btree ("hero_image_id");
  CREATE INDEX "content_listing_items_parent_page_idx" ON "content_listing_items" USING btree ("parent_page_id");
  CREATE INDEX "content_listing_items_event_cycle_idx" ON "content_listing_items" USING btree ("event_cycle_id");
  CREATE UNIQUE INDEX "source_sourceDocumentId_idx" ON "content_listing_items" USING btree ("source","source_document_id");
  CREATE INDEX "source_sortDate_idx" ON "content_listing_items" USING btree ("source","sort_date");
  CREATE INDEX "source_title_idx" ON "content_listing_items" USING btree ("source","title");
  CREATE INDEX "content_listing_items_rels_order_idx" ON "content_listing_items_rels" USING btree ("order");
  CREATE INDEX "content_listing_items_rels_parent_idx" ON "content_listing_items_rels" USING btree ("parent_id");
  CREATE INDEX "content_listing_items_rels_path_idx" ON "content_listing_items_rels" USING btree ("path");
  CREATE INDEX "content_listing_items_rels_categories_id_idx" ON "content_listing_items_rels" USING btree ("categories_id");
    CREATE INDEX "content_listing_items_rels_tags_id_idx" ON "content_listing_items_rels" USING btree ("tags_id");`)
  }

  // The current-schema backfill belongs to the latest schema migration. Keeping it there allows
  // fresh databases to run historical migrations without querying columns that do not exist yet.
  await db.execute(sql`DELETE FROM "payload_migrations" WHERE "name" = 'dev'`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "content_listing_items" CASCADE;
  DROP TABLE "content_listing_items_rels" CASCADE;
  DROP TYPE "public"."enum_content_listing_items_source";
  DROP TYPE "public"."enum_content_listing_items_visibility";`)
}
