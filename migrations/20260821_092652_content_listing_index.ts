import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

import type { TaxonomizableCollectionSlug } from '../src/modules/content/content-listing'
import { syncContentListingItem } from '../src/modules/content/content-listing-index'
import { extractFirstRichTextParagraph } from '../src/modules/content/listing-excerpt'

const batchSize = 100
const indexedCollections: TaxonomizableCollectionSlug[] = [
  'pages',
  'posts',
  'events',
  'event-cycles',
]

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
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

  req.context = {
    ...req.context,
    skipContentListingSync: true,
    skipPublicCacheInvalidation: true,
  }

  let lastPageID = 0
  while (true) {
    const pages = await payload.find({
      collection: 'pages',
      depth: 0,
      draft: false,
      limit: batchSize,
      overrideAccess: true,
      req,
      select: { id: true, layout: true, listingExcerpt: true },
      sort: 'id',
      where: {
        and: [{ id: { greater_than: lastPageID } }, { _status: { equals: 'published' } }],
      },
    })

    for (const page of pages.docs) {
      lastPageID = page.id
      if (page.listingExcerpt?.trim()) continue
      const listingExcerpt = extractFirstRichTextParagraph(page.layout)
      if (!listingExcerpt) continue

      await payload.update({
        collection: 'pages',
        context: req.context,
        data: { listingExcerpt },
        draft: false,
        id: page.id,
        overrideAccess: true,
        req,
      })
    }

    if (pages.docs.length < batchSize) break
  }

  for (const collection of indexedCollections) {
    let lastDocumentID = 0
    while (true) {
      const documents = await payload.find({
        collection,
        depth: 0,
        draft: false,
        limit: batchSize,
        overrideAccess: true,
        req,
        sort: 'id',
        where: {
          and: [{ id: { greater_than: lastDocumentID } }, { _status: { equals: 'published' } }],
        },
      })

      for (const document of documents.docs) {
        lastDocumentID = document.id
        await syncContentListingItem(req, collection, document.id)
      }

      if (documents.docs.length < batchSize) break
    }
  }
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "content_listing_items" CASCADE;
  DROP TABLE "content_listing_items_rels" CASCADE;
  DROP TYPE "public"."enum_content_listing_items_source";
  DROP TYPE "public"."enum_content_listing_items_visibility";`)
}
