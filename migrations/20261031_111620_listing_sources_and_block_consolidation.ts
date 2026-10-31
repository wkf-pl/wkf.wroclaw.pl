import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

import { syncContentListingItem } from '../src/modules/content/content-listing-index'
import {
  consolidateLegacyContentBlocks,
  restoreLegacyContentBlocks,
} from './lib/content-listing-block-consolidation'

const backfillBatchSize = 100

const listingSourceEnumColumns = [
  ['content_listing_items', 'source', 'enum_content_listing_items_source'],
  ['pages_blocks_listing_sources', 'value', 'enum_pages_blocks_listing_sources'],
  ['pages_blocks_carousel_sources', 'value', 'enum_pages_blocks_carousel_sources'],
  ['_pages_v_blocks_listing_sources', 'value', 'enum__pages_v_blocks_listing_sources'],
  ['_pages_v_blocks_carousel_sources', 'value', 'enum__pages_v_blocks_carousel_sources'],
  ['posts_blocks_listing_sources', 'value', 'enum_posts_blocks_listing_sources'],
  ['posts_blocks_carousel_sources', 'value', 'enum_posts_blocks_carousel_sources'],
  ['_posts_v_blocks_listing_sources', 'value', 'enum__posts_v_blocks_listing_sources'],
  ['_posts_v_blocks_carousel_sources', 'value', 'enum__posts_v_blocks_carousel_sources'],
  ['events_blocks_listing_sources', 'value', 'enum_events_blocks_listing_sources'],
  ['events_blocks_carousel_sources', 'value', 'enum_events_blocks_carousel_sources'],
  ['_events_v_blocks_listing_sources', 'value', 'enum__events_v_blocks_listing_sources'],
  ['_events_v_blocks_carousel_sources', 'value', 'enum__events_v_blocks_carousel_sources'],
  ['event_cycles_blocks_listing_sources', 'value', 'enum_event_cycles_blocks_listing_sources'],
  ['event_cycles_blocks_carousel_sources', 'value', 'enum_event_cycles_blocks_carousel_sources'],
  [
    '_event_cycles_v_blocks_listing_sources',
    'value',
    'enum__event_cycles_v_blocks_listing_sources',
  ],
  [
    '_event_cycles_v_blocks_carousel_sources',
    'value',
    'enum__event_cycles_v_blocks_carousel_sources',
  ],
  ['partners_blocks_listing_sources', 'value', 'enum_partners_blocks_listing_sources'],
  ['partners_blocks_carousel_sources', 'value', 'enum_partners_blocks_carousel_sources'],
  ['_partners_v_blocks_listing_sources', 'value', 'enum__partners_v_blocks_listing_sources'],
  ['_partners_v_blocks_carousel_sources', 'value', 'enum__partners_v_blocks_carousel_sources'],
  [
    'homepage_sections_blocks_listing_sources',
    'value',
    'enum_homepage_sections_blocks_listing_sources',
  ],
  [
    'homepage_sections_blocks_carousel_sources',
    'value',
    'enum_homepage_sections_blocks_carousel_sources',
  ],
  [
    '_homepage_sections_v_blocks_listing_sources',
    'value',
    'enum__homepage_sections_v_blocks_listing_sources',
  ],
  [
    '_homepage_sections_v_blocks_carousel_sources',
    'value',
    'enum__homepage_sections_v_blocks_carousel_sources',
  ],
] as const

function quoteIdentifier(identifier: string): string {
  return `"${identifier.replaceAll('"', '""')}"`
}

async function recreateListingSourceEnums(db: MigrateUpArgs['db']): Promise<void> {
  const sourceValues =
    "'pages', 'posts', 'events', 'event-cycles', 'documents', 'partners', 'member-profiles'"
  const statements = listingSourceEnumColumns.map(([table, column, enumType]) => {
    const quotedTable = quoteIdentifier(table)
    const quotedColumn = quoteIdentifier(column)
    const quotedEnumType = `"public".${quoteIdentifier(enumType)}`

    return `
      ALTER TABLE ${quotedTable} ALTER COLUMN ${quotedColumn} SET DATA TYPE text;
      DROP TYPE ${quotedEnumType};
      CREATE TYPE ${quotedEnumType} AS ENUM(${sourceValues});
      ALTER TABLE ${quotedTable} ALTER COLUMN ${quotedColumn}
        SET DATA TYPE ${quotedEnumType} USING ${quotedColumn}::${quotedEnumType};
    `
  })

  await db.execute(sql.raw(statements.join('\n')))
}

async function findPublishedDocumentIDs(
  db: MigrateUpArgs['db'],
  collection: 'member-profiles' | 'partners',
  lastDocumentID: number,
): Promise<number[]> {
  const query =
    collection === 'partners'
      ? sql`SELECT "id" FROM "partners" WHERE "id" > ${lastDocumentID} AND "_status" = 'published' ORDER BY "id" LIMIT ${backfillBatchSize}`
      : sql`SELECT "id" FROM "member_profiles" WHERE "id" > ${lastDocumentID} AND "_status" = 'published' ORDER BY "id" LIMIT ${backfillBatchSize}`
  const result = await db.execute(query)

  return result.rows.map((row) => (row as { id: number }).id)
}

async function backfillNewListingSources(
  db: MigrateUpArgs['db'],
  req: MigrateUpArgs['req'],
): Promise<void> {
  req.context = {
    ...req.context,
    skipContentListingSync: true,
    skipPublicCacheInvalidation: true,
  }

  for (const collection of ['partners', 'member-profiles'] as const) {
    let lastDocumentID = 0
    while (true) {
      const documentIDs = await findPublishedDocumentIDs(db, collection, lastDocumentID)
      for (const documentID of documentIDs) {
        lastDocumentID = documentID
        await syncContentListingItem(req, collection, documentID)
      }
      if (documentIDs.length < backfillBatchSize) break
    }
  }
}

export async function up({ db, payload: _payload, req }: MigrateUpArgs): Promise<void> {
  await recreateListingSourceEnums(db)
  await db.execute(sql`
   ALTER TABLE "pages_blocks_listing" ALTER COLUMN "view" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::text;
  DROP TYPE "public"."enum_pages_blocks_listing_view";
  CREATE TYPE "public"."enum_pages_blocks_listing_view" AS ENUM('tiles', 'cards', 'carousel', 'compact', 'grid');
  ALTER TABLE "pages_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::"public"."enum_pages_blocks_listing_view";
  ALTER TABLE "pages_blocks_listing" ALTER COLUMN "view" SET DATA TYPE "public"."enum_pages_blocks_listing_view" USING "view"::"public"."enum_pages_blocks_listing_view";
  ALTER TABLE "_pages_v_blocks_listing" ALTER COLUMN "view" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::text;
  DROP TYPE "public"."enum__pages_v_blocks_listing_view";
  CREATE TYPE "public"."enum__pages_v_blocks_listing_view" AS ENUM('tiles', 'cards', 'carousel', 'compact', 'grid');
  ALTER TABLE "_pages_v_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::"public"."enum__pages_v_blocks_listing_view";
  ALTER TABLE "_pages_v_blocks_listing" ALTER COLUMN "view" SET DATA TYPE "public"."enum__pages_v_blocks_listing_view" USING "view"::"public"."enum__pages_v_blocks_listing_view";
  ALTER TABLE "posts_blocks_listing" ALTER COLUMN "view" SET DATA TYPE text;
  ALTER TABLE "posts_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::text;
  DROP TYPE "public"."enum_posts_blocks_listing_view";
  CREATE TYPE "public"."enum_posts_blocks_listing_view" AS ENUM('tiles', 'cards', 'carousel', 'compact', 'grid');
  ALTER TABLE "posts_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::"public"."enum_posts_blocks_listing_view";
  ALTER TABLE "posts_blocks_listing" ALTER COLUMN "view" SET DATA TYPE "public"."enum_posts_blocks_listing_view" USING "view"::"public"."enum_posts_blocks_listing_view";
  ALTER TABLE "_posts_v_blocks_listing" ALTER COLUMN "view" SET DATA TYPE text;
  ALTER TABLE "_posts_v_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::text;
  DROP TYPE "public"."enum__posts_v_blocks_listing_view";
  CREATE TYPE "public"."enum__posts_v_blocks_listing_view" AS ENUM('tiles', 'cards', 'carousel', 'compact', 'grid');
  ALTER TABLE "_posts_v_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::"public"."enum__posts_v_blocks_listing_view";
  ALTER TABLE "_posts_v_blocks_listing" ALTER COLUMN "view" SET DATA TYPE "public"."enum__posts_v_blocks_listing_view" USING "view"::"public"."enum__posts_v_blocks_listing_view";
  ALTER TABLE "events_blocks_listing" ALTER COLUMN "view" SET DATA TYPE text;
  ALTER TABLE "events_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::text;
  DROP TYPE "public"."enum_events_blocks_listing_view";
  CREATE TYPE "public"."enum_events_blocks_listing_view" AS ENUM('tiles', 'cards', 'carousel', 'compact', 'grid');
  ALTER TABLE "events_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::"public"."enum_events_blocks_listing_view";
  ALTER TABLE "events_blocks_listing" ALTER COLUMN "view" SET DATA TYPE "public"."enum_events_blocks_listing_view" USING "view"::"public"."enum_events_blocks_listing_view";
  ALTER TABLE "_events_v_blocks_listing" ALTER COLUMN "view" SET DATA TYPE text;
  ALTER TABLE "_events_v_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::text;
  DROP TYPE "public"."enum__events_v_blocks_listing_view";
  CREATE TYPE "public"."enum__events_v_blocks_listing_view" AS ENUM('tiles', 'cards', 'carousel', 'compact', 'grid');
  ALTER TABLE "_events_v_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::"public"."enum__events_v_blocks_listing_view";
  ALTER TABLE "_events_v_blocks_listing" ALTER COLUMN "view" SET DATA TYPE "public"."enum__events_v_blocks_listing_view" USING "view"::"public"."enum__events_v_blocks_listing_view";
  ALTER TABLE "event_cycles_blocks_listing" ALTER COLUMN "view" SET DATA TYPE text;
  ALTER TABLE "event_cycles_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::text;
  DROP TYPE "public"."enum_event_cycles_blocks_listing_view";
  CREATE TYPE "public"."enum_event_cycles_blocks_listing_view" AS ENUM('tiles', 'cards', 'carousel', 'compact', 'grid');
  ALTER TABLE "event_cycles_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::"public"."enum_event_cycles_blocks_listing_view";
  ALTER TABLE "event_cycles_blocks_listing" ALTER COLUMN "view" SET DATA TYPE "public"."enum_event_cycles_blocks_listing_view" USING "view"::"public"."enum_event_cycles_blocks_listing_view";
  ALTER TABLE "_event_cycles_v_blocks_listing" ALTER COLUMN "view" SET DATA TYPE text;
  ALTER TABLE "_event_cycles_v_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::text;
  DROP TYPE "public"."enum__event_cycles_v_blocks_listing_view";
  CREATE TYPE "public"."enum__event_cycles_v_blocks_listing_view" AS ENUM('tiles', 'cards', 'carousel', 'compact', 'grid');
  ALTER TABLE "_event_cycles_v_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::"public"."enum__event_cycles_v_blocks_listing_view";
  ALTER TABLE "_event_cycles_v_blocks_listing" ALTER COLUMN "view" SET DATA TYPE "public"."enum__event_cycles_v_blocks_listing_view" USING "view"::"public"."enum__event_cycles_v_blocks_listing_view";
  ALTER TABLE "partners_blocks_listing" ALTER COLUMN "view" SET DATA TYPE text;
  ALTER TABLE "partners_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::text;
  DROP TYPE "public"."enum_partners_blocks_listing_view";
  CREATE TYPE "public"."enum_partners_blocks_listing_view" AS ENUM('tiles', 'cards', 'carousel', 'compact', 'grid');
  ALTER TABLE "partners_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::"public"."enum_partners_blocks_listing_view";
  ALTER TABLE "partners_blocks_listing" ALTER COLUMN "view" SET DATA TYPE "public"."enum_partners_blocks_listing_view" USING "view"::"public"."enum_partners_blocks_listing_view";
  ALTER TABLE "_partners_v_blocks_listing" ALTER COLUMN "view" SET DATA TYPE text;
  ALTER TABLE "_partners_v_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::text;
  DROP TYPE "public"."enum__partners_v_blocks_listing_view";
  CREATE TYPE "public"."enum__partners_v_blocks_listing_view" AS ENUM('tiles', 'cards', 'carousel', 'compact', 'grid');
  ALTER TABLE "_partners_v_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::"public"."enum__partners_v_blocks_listing_view";
  ALTER TABLE "_partners_v_blocks_listing" ALTER COLUMN "view" SET DATA TYPE "public"."enum__partners_v_blocks_listing_view" USING "view"::"public"."enum__partners_v_blocks_listing_view";
  ALTER TABLE "homepage_sections_blocks_listing" ALTER COLUMN "view" SET DATA TYPE text;
  ALTER TABLE "homepage_sections_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::text;
  DROP TYPE "public"."enum_homepage_sections_blocks_listing_view";
  CREATE TYPE "public"."enum_homepage_sections_blocks_listing_view" AS ENUM('tiles', 'cards', 'carousel', 'compact', 'grid');
  ALTER TABLE "homepage_sections_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::"public"."enum_homepage_sections_blocks_listing_view";
  ALTER TABLE "homepage_sections_blocks_listing" ALTER COLUMN "view" SET DATA TYPE "public"."enum_homepage_sections_blocks_listing_view" USING "view"::"public"."enum_homepage_sections_blocks_listing_view";
  ALTER TABLE "_homepage_sections_v_blocks_listing" ALTER COLUMN "view" SET DATA TYPE text;
  ALTER TABLE "_homepage_sections_v_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::text;
  DROP TYPE "public"."enum__homepage_sections_v_blocks_listing_view";
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_listing_view" AS ENUM('tiles', 'cards', 'carousel', 'compact', 'grid');
  ALTER TABLE "_homepage_sections_v_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::"public"."enum__homepage_sections_v_blocks_listing_view";
  ALTER TABLE "_homepage_sections_v_blocks_listing" ALTER COLUMN "view" SET DATA TYPE "public"."enum__homepage_sections_v_blocks_listing_view" USING "view"::"public"."enum__homepage_sections_v_blocks_listing_view";
  ALTER TABLE "pages_blocks_listing_items" ADD COLUMN "context_label" varchar;
  ALTER TABLE "pages_blocks_listing" ADD COLUMN "hide_when_empty" boolean DEFAULT false;
  ALTER TABLE "pages_rels" ADD COLUMN "partners_id" integer;
  ALTER TABLE "pages_rels" ADD COLUMN "member_profiles_id" integer;
  ALTER TABLE "_pages_v_blocks_listing_items" ADD COLUMN "context_label" varchar;
  ALTER TABLE "_pages_v_blocks_listing" ADD COLUMN "hide_when_empty" boolean DEFAULT false;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "partners_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "member_profiles_id" integer;
  ALTER TABLE "posts_blocks_listing_items" ADD COLUMN "context_label" varchar;
  ALTER TABLE "posts_blocks_listing" ADD COLUMN "hide_when_empty" boolean DEFAULT false;
  ALTER TABLE "posts_rels" ADD COLUMN "partners_id" integer;
  ALTER TABLE "posts_rels" ADD COLUMN "member_profiles_id" integer;
  ALTER TABLE "_posts_v_blocks_listing_items" ADD COLUMN "context_label" varchar;
  ALTER TABLE "_posts_v_blocks_listing" ADD COLUMN "hide_when_empty" boolean DEFAULT false;
  ALTER TABLE "_posts_v_rels" ADD COLUMN "partners_id" integer;
  ALTER TABLE "_posts_v_rels" ADD COLUMN "member_profiles_id" integer;
  ALTER TABLE "events_blocks_listing_items" ADD COLUMN "context_label" varchar;
  ALTER TABLE "events_blocks_listing" ADD COLUMN "hide_when_empty" boolean DEFAULT false;
  ALTER TABLE "events_rels" ADD COLUMN "partners_id" integer;
  ALTER TABLE "events_rels" ADD COLUMN "member_profiles_id" integer;
  ALTER TABLE "_events_v_blocks_listing_items" ADD COLUMN "context_label" varchar;
  ALTER TABLE "_events_v_blocks_listing" ADD COLUMN "hide_when_empty" boolean DEFAULT false;
  ALTER TABLE "_events_v_rels" ADD COLUMN "partners_id" integer;
  ALTER TABLE "_events_v_rels" ADD COLUMN "member_profiles_id" integer;
  ALTER TABLE "event_cycles_blocks_listing_items" ADD COLUMN "context_label" varchar;
  ALTER TABLE "event_cycles_blocks_listing" ADD COLUMN "hide_when_empty" boolean DEFAULT false;
  ALTER TABLE "event_cycles_rels" ADD COLUMN "partners_id" integer;
  ALTER TABLE "event_cycles_rels" ADD COLUMN "member_profiles_id" integer;
  ALTER TABLE "_event_cycles_v_blocks_listing_items" ADD COLUMN "context_label" varchar;
  ALTER TABLE "_event_cycles_v_blocks_listing" ADD COLUMN "hide_when_empty" boolean DEFAULT false;
  ALTER TABLE "_event_cycles_v_rels" ADD COLUMN "partners_id" integer;
  ALTER TABLE "_event_cycles_v_rels" ADD COLUMN "member_profiles_id" integer;
  ALTER TABLE "partners_blocks_listing_items" ADD COLUMN "context_label" varchar;
  ALTER TABLE "partners_blocks_listing" ADD COLUMN "hide_when_empty" boolean DEFAULT false;
  ALTER TABLE "partners_rels" ADD COLUMN "partners_id" integer;
  ALTER TABLE "partners_rels" ADD COLUMN "member_profiles_id" integer;
  ALTER TABLE "_partners_v_blocks_listing_items" ADD COLUMN "context_label" varchar;
  ALTER TABLE "_partners_v_blocks_listing" ADD COLUMN "hide_when_empty" boolean DEFAULT false;
  ALTER TABLE "_partners_v_rels" ADD COLUMN "partners_id" integer;
  ALTER TABLE "_partners_v_rels" ADD COLUMN "member_profiles_id" integer;
  ALTER TABLE "homepage_sections_blocks_listing_items" ADD COLUMN "context_label" varchar;
  ALTER TABLE "homepage_sections_blocks_listing" ADD COLUMN "hide_when_empty" boolean DEFAULT false;
  ALTER TABLE "homepage_sections_rels" ADD COLUMN "partners_id" integer;
  ALTER TABLE "homepage_sections_rels" ADD COLUMN "member_profiles_id" integer;
  ALTER TABLE "_homepage_sections_v_blocks_listing_items" ADD COLUMN "context_label" varchar;
  ALTER TABLE "_homepage_sections_v_blocks_listing" ADD COLUMN "hide_when_empty" boolean DEFAULT false;
  ALTER TABLE "_homepage_sections_v_rels" ADD COLUMN "partners_id" integer;
  ALTER TABLE "_homepage_sections_v_rels" ADD COLUMN "member_profiles_id" integer;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_partners_fk" FOREIGN KEY ("partners_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_member_profiles_fk" FOREIGN KEY ("member_profiles_id") REFERENCES "public"."member_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_partners_fk" FOREIGN KEY ("partners_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_member_profiles_fk" FOREIGN KEY ("member_profiles_id") REFERENCES "public"."member_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_partners_fk" FOREIGN KEY ("partners_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_member_profiles_fk" FOREIGN KEY ("member_profiles_id") REFERENCES "public"."member_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_partners_fk" FOREIGN KEY ("partners_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_member_profiles_fk" FOREIGN KEY ("member_profiles_id") REFERENCES "public"."member_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_partners_fk" FOREIGN KEY ("partners_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_member_profiles_fk" FOREIGN KEY ("member_profiles_id") REFERENCES "public"."member_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_partners_fk" FOREIGN KEY ("partners_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_member_profiles_fk" FOREIGN KEY ("member_profiles_id") REFERENCES "public"."member_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_rels" ADD CONSTRAINT "event_cycles_rels_partners_fk" FOREIGN KEY ("partners_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_rels" ADD CONSTRAINT "event_cycles_rels_member_profiles_fk" FOREIGN KEY ("member_profiles_id") REFERENCES "public"."member_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_rels" ADD CONSTRAINT "_event_cycles_v_rels_partners_fk" FOREIGN KEY ("partners_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_rels" ADD CONSTRAINT "_event_cycles_v_rels_member_profiles_fk" FOREIGN KEY ("member_profiles_id") REFERENCES "public"."member_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_rels" ADD CONSTRAINT "partners_rels_partners_fk" FOREIGN KEY ("partners_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_rels" ADD CONSTRAINT "partners_rels_member_profiles_fk" FOREIGN KEY ("member_profiles_id") REFERENCES "public"."member_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_rels" ADD CONSTRAINT "_partners_v_rels_partners_fk" FOREIGN KEY ("partners_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_rels" ADD CONSTRAINT "_partners_v_rels_member_profiles_fk" FOREIGN KEY ("member_profiles_id") REFERENCES "public"."member_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_rels" ADD CONSTRAINT "homepage_sections_rels_partners_fk" FOREIGN KEY ("partners_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_rels" ADD CONSTRAINT "homepage_sections_rels_member_profiles_fk" FOREIGN KEY ("member_profiles_id") REFERENCES "public"."member_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_rels" ADD CONSTRAINT "_homepage_sections_v_rels_partners_fk" FOREIGN KEY ("partners_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_rels" ADD CONSTRAINT "_homepage_sections_v_rels_member_profiles_fk" FOREIGN KEY ("member_profiles_id") REFERENCES "public"."member_profiles"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_rels_partners_id_idx" ON "pages_rels" USING btree ("partners_id");
  CREATE INDEX "pages_rels_member_profiles_id_idx" ON "pages_rels" USING btree ("member_profiles_id");
  CREATE INDEX "_pages_v_rels_partners_id_idx" ON "_pages_v_rels" USING btree ("partners_id");
  CREATE INDEX "_pages_v_rels_member_profiles_id_idx" ON "_pages_v_rels" USING btree ("member_profiles_id");
  CREATE INDEX "posts_rels_partners_id_idx" ON "posts_rels" USING btree ("partners_id");
  CREATE INDEX "posts_rels_member_profiles_id_idx" ON "posts_rels" USING btree ("member_profiles_id");
  CREATE INDEX "_posts_v_rels_partners_id_idx" ON "_posts_v_rels" USING btree ("partners_id");
  CREATE INDEX "_posts_v_rels_member_profiles_id_idx" ON "_posts_v_rels" USING btree ("member_profiles_id");
  CREATE INDEX "events_rels_partners_id_idx" ON "events_rels" USING btree ("partners_id");
  CREATE INDEX "events_rels_member_profiles_id_idx" ON "events_rels" USING btree ("member_profiles_id");
  CREATE INDEX "_events_v_rels_partners_id_idx" ON "_events_v_rels" USING btree ("partners_id");
  CREATE INDEX "_events_v_rels_member_profiles_id_idx" ON "_events_v_rels" USING btree ("member_profiles_id");
  CREATE INDEX "event_cycles_rels_partners_id_idx" ON "event_cycles_rels" USING btree ("partners_id");
  CREATE INDEX "event_cycles_rels_member_profiles_id_idx" ON "event_cycles_rels" USING btree ("member_profiles_id");
  CREATE INDEX "_event_cycles_v_rels_partners_id_idx" ON "_event_cycles_v_rels" USING btree ("partners_id");
  CREATE INDEX "_event_cycles_v_rels_member_profiles_id_idx" ON "_event_cycles_v_rels" USING btree ("member_profiles_id");
  CREATE INDEX "partners_rels_partners_id_idx" ON "partners_rels" USING btree ("partners_id");
  CREATE INDEX "partners_rels_member_profiles_id_idx" ON "partners_rels" USING btree ("member_profiles_id");
  CREATE INDEX "_partners_v_rels_partners_id_idx" ON "_partners_v_rels" USING btree ("partners_id");
  CREATE INDEX "_partners_v_rels_member_profiles_id_idx" ON "_partners_v_rels" USING btree ("member_profiles_id");
  CREATE INDEX "homepage_sections_rels_partners_id_idx" ON "homepage_sections_rels" USING btree ("partners_id");
  CREATE INDEX "homepage_sections_rels_member_profiles_id_idx" ON "homepage_sections_rels" USING btree ("member_profiles_id");
  CREATE INDEX "_homepage_sections_v_rels_partners_id_idx" ON "_homepage_sections_v_rels" USING btree ("partners_id");
  CREATE INDEX "_homepage_sections_v_rels_member_profiles_id_idx" ON "_homepage_sections_v_rels" USING btree ("member_profiles_id");`)

  await consolidateLegacyContentBlocks(db)
  await backfillNewListingSources(db, req)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await restoreLegacyContentBlocks(db)
  await db.execute(sql`
   ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_partners_fk";
  
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_member_profiles_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_partners_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_member_profiles_fk";
  
  ALTER TABLE "posts_rels" DROP CONSTRAINT "posts_rels_partners_fk";
  
  ALTER TABLE "posts_rels" DROP CONSTRAINT "posts_rels_member_profiles_fk";
  
  ALTER TABLE "_posts_v_rels" DROP CONSTRAINT "_posts_v_rels_partners_fk";
  
  ALTER TABLE "_posts_v_rels" DROP CONSTRAINT "_posts_v_rels_member_profiles_fk";
  
  ALTER TABLE "events_rels" DROP CONSTRAINT "events_rels_partners_fk";
  
  ALTER TABLE "events_rels" DROP CONSTRAINT "events_rels_member_profiles_fk";
  
  ALTER TABLE "_events_v_rels" DROP CONSTRAINT "_events_v_rels_partners_fk";
  
  ALTER TABLE "_events_v_rels" DROP CONSTRAINT "_events_v_rels_member_profiles_fk";
  
  ALTER TABLE "event_cycles_rels" DROP CONSTRAINT "event_cycles_rels_partners_fk";
  
  ALTER TABLE "event_cycles_rels" DROP CONSTRAINT "event_cycles_rels_member_profiles_fk";
  
  ALTER TABLE "_event_cycles_v_rels" DROP CONSTRAINT "_event_cycles_v_rels_partners_fk";
  
  ALTER TABLE "_event_cycles_v_rels" DROP CONSTRAINT "_event_cycles_v_rels_member_profiles_fk";
  
  ALTER TABLE "partners_rels" DROP CONSTRAINT "partners_rels_partners_fk";
  
  ALTER TABLE "partners_rels" DROP CONSTRAINT "partners_rels_member_profiles_fk";
  
  ALTER TABLE "_partners_v_rels" DROP CONSTRAINT "_partners_v_rels_partners_fk";
  
  ALTER TABLE "_partners_v_rels" DROP CONSTRAINT "_partners_v_rels_member_profiles_fk";
  
  ALTER TABLE "homepage_sections_rels" DROP CONSTRAINT "homepage_sections_rels_partners_fk";
  
  ALTER TABLE "homepage_sections_rels" DROP CONSTRAINT "homepage_sections_rels_member_profiles_fk";
  
  ALTER TABLE "_homepage_sections_v_rels" DROP CONSTRAINT "_homepage_sections_v_rels_partners_fk";
  
  ALTER TABLE "_homepage_sections_v_rels" DROP CONSTRAINT "_homepage_sections_v_rels_member_profiles_fk";
  
  ALTER TABLE "content_listing_items" ALTER COLUMN "source" SET DATA TYPE text;
  DROP TYPE "public"."enum_content_listing_items_source";
  CREATE TYPE "public"."enum_content_listing_items_source" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents');
  ALTER TABLE "content_listing_items" ALTER COLUMN "source" SET DATA TYPE "public"."enum_content_listing_items_source" USING "source"::"public"."enum_content_listing_items_source";
  ALTER TABLE "pages_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_pages_blocks_listing_sources";
  CREATE TYPE "public"."enum_pages_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents');
  ALTER TABLE "pages_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum_pages_blocks_listing_sources" USING "value"::"public"."enum_pages_blocks_listing_sources";
  ALTER TABLE "pages_blocks_listing" ALTER COLUMN "view" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::text;
  DROP TYPE "public"."enum_pages_blocks_listing_view";
  CREATE TYPE "public"."enum_pages_blocks_listing_view" AS ENUM('cards', 'carousel', 'compact', 'grid', 'tiles');
  ALTER TABLE "pages_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::"public"."enum_pages_blocks_listing_view";
  ALTER TABLE "pages_blocks_listing" ALTER COLUMN "view" SET DATA TYPE "public"."enum_pages_blocks_listing_view" USING "view"::"public"."enum_pages_blocks_listing_view";
  ALTER TABLE "pages_blocks_carousel_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_pages_blocks_carousel_sources";
  CREATE TYPE "public"."enum_pages_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents');
  ALTER TABLE "pages_blocks_carousel_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum_pages_blocks_carousel_sources" USING "value"::"public"."enum_pages_blocks_carousel_sources";
  ALTER TABLE "_pages_v_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum__pages_v_blocks_listing_sources";
  CREATE TYPE "public"."enum__pages_v_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents');
  ALTER TABLE "_pages_v_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum__pages_v_blocks_listing_sources" USING "value"::"public"."enum__pages_v_blocks_listing_sources";
  ALTER TABLE "_pages_v_blocks_listing" ALTER COLUMN "view" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::text;
  DROP TYPE "public"."enum__pages_v_blocks_listing_view";
  CREATE TYPE "public"."enum__pages_v_blocks_listing_view" AS ENUM('cards', 'carousel', 'compact', 'grid', 'tiles');
  ALTER TABLE "_pages_v_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::"public"."enum__pages_v_blocks_listing_view";
  ALTER TABLE "_pages_v_blocks_listing" ALTER COLUMN "view" SET DATA TYPE "public"."enum__pages_v_blocks_listing_view" USING "view"::"public"."enum__pages_v_blocks_listing_view";
  ALTER TABLE "_pages_v_blocks_carousel_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum__pages_v_blocks_carousel_sources";
  CREATE TYPE "public"."enum__pages_v_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents');
  ALTER TABLE "_pages_v_blocks_carousel_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum__pages_v_blocks_carousel_sources" USING "value"::"public"."enum__pages_v_blocks_carousel_sources";
  ALTER TABLE "posts_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_posts_blocks_listing_sources";
  CREATE TYPE "public"."enum_posts_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents');
  ALTER TABLE "posts_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum_posts_blocks_listing_sources" USING "value"::"public"."enum_posts_blocks_listing_sources";
  ALTER TABLE "posts_blocks_listing" ALTER COLUMN "view" SET DATA TYPE text;
  ALTER TABLE "posts_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::text;
  DROP TYPE "public"."enum_posts_blocks_listing_view";
  CREATE TYPE "public"."enum_posts_blocks_listing_view" AS ENUM('cards', 'carousel', 'compact', 'grid', 'tiles');
  ALTER TABLE "posts_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::"public"."enum_posts_blocks_listing_view";
  ALTER TABLE "posts_blocks_listing" ALTER COLUMN "view" SET DATA TYPE "public"."enum_posts_blocks_listing_view" USING "view"::"public"."enum_posts_blocks_listing_view";
  ALTER TABLE "posts_blocks_carousel_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_posts_blocks_carousel_sources";
  CREATE TYPE "public"."enum_posts_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents');
  ALTER TABLE "posts_blocks_carousel_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum_posts_blocks_carousel_sources" USING "value"::"public"."enum_posts_blocks_carousel_sources";
  ALTER TABLE "_posts_v_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum__posts_v_blocks_listing_sources";
  CREATE TYPE "public"."enum__posts_v_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents');
  ALTER TABLE "_posts_v_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum__posts_v_blocks_listing_sources" USING "value"::"public"."enum__posts_v_blocks_listing_sources";
  ALTER TABLE "_posts_v_blocks_listing" ALTER COLUMN "view" SET DATA TYPE text;
  ALTER TABLE "_posts_v_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::text;
  DROP TYPE "public"."enum__posts_v_blocks_listing_view";
  CREATE TYPE "public"."enum__posts_v_blocks_listing_view" AS ENUM('cards', 'carousel', 'compact', 'grid', 'tiles');
  ALTER TABLE "_posts_v_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::"public"."enum__posts_v_blocks_listing_view";
  ALTER TABLE "_posts_v_blocks_listing" ALTER COLUMN "view" SET DATA TYPE "public"."enum__posts_v_blocks_listing_view" USING "view"::"public"."enum__posts_v_blocks_listing_view";
  ALTER TABLE "_posts_v_blocks_carousel_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum__posts_v_blocks_carousel_sources";
  CREATE TYPE "public"."enum__posts_v_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents');
  ALTER TABLE "_posts_v_blocks_carousel_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum__posts_v_blocks_carousel_sources" USING "value"::"public"."enum__posts_v_blocks_carousel_sources";
  ALTER TABLE "events_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_events_blocks_listing_sources";
  CREATE TYPE "public"."enum_events_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents');
  ALTER TABLE "events_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum_events_blocks_listing_sources" USING "value"::"public"."enum_events_blocks_listing_sources";
  ALTER TABLE "events_blocks_listing" ALTER COLUMN "view" SET DATA TYPE text;
  ALTER TABLE "events_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::text;
  DROP TYPE "public"."enum_events_blocks_listing_view";
  CREATE TYPE "public"."enum_events_blocks_listing_view" AS ENUM('cards', 'carousel', 'compact', 'grid', 'tiles');
  ALTER TABLE "events_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::"public"."enum_events_blocks_listing_view";
  ALTER TABLE "events_blocks_listing" ALTER COLUMN "view" SET DATA TYPE "public"."enum_events_blocks_listing_view" USING "view"::"public"."enum_events_blocks_listing_view";
  ALTER TABLE "events_blocks_carousel_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_events_blocks_carousel_sources";
  CREATE TYPE "public"."enum_events_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents');
  ALTER TABLE "events_blocks_carousel_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum_events_blocks_carousel_sources" USING "value"::"public"."enum_events_blocks_carousel_sources";
  ALTER TABLE "_events_v_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum__events_v_blocks_listing_sources";
  CREATE TYPE "public"."enum__events_v_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents');
  ALTER TABLE "_events_v_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum__events_v_blocks_listing_sources" USING "value"::"public"."enum__events_v_blocks_listing_sources";
  ALTER TABLE "_events_v_blocks_listing" ALTER COLUMN "view" SET DATA TYPE text;
  ALTER TABLE "_events_v_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::text;
  DROP TYPE "public"."enum__events_v_blocks_listing_view";
  CREATE TYPE "public"."enum__events_v_blocks_listing_view" AS ENUM('cards', 'carousel', 'compact', 'grid', 'tiles');
  ALTER TABLE "_events_v_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::"public"."enum__events_v_blocks_listing_view";
  ALTER TABLE "_events_v_blocks_listing" ALTER COLUMN "view" SET DATA TYPE "public"."enum__events_v_blocks_listing_view" USING "view"::"public"."enum__events_v_blocks_listing_view";
  ALTER TABLE "_events_v_blocks_carousel_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum__events_v_blocks_carousel_sources";
  CREATE TYPE "public"."enum__events_v_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents');
  ALTER TABLE "_events_v_blocks_carousel_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum__events_v_blocks_carousel_sources" USING "value"::"public"."enum__events_v_blocks_carousel_sources";
  ALTER TABLE "event_cycles_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_event_cycles_blocks_listing_sources";
  CREATE TYPE "public"."enum_event_cycles_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents');
  ALTER TABLE "event_cycles_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum_event_cycles_blocks_listing_sources" USING "value"::"public"."enum_event_cycles_blocks_listing_sources";
  ALTER TABLE "event_cycles_blocks_listing" ALTER COLUMN "view" SET DATA TYPE text;
  ALTER TABLE "event_cycles_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::text;
  DROP TYPE "public"."enum_event_cycles_blocks_listing_view";
  CREATE TYPE "public"."enum_event_cycles_blocks_listing_view" AS ENUM('cards', 'carousel', 'compact', 'grid', 'tiles');
  ALTER TABLE "event_cycles_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::"public"."enum_event_cycles_blocks_listing_view";
  ALTER TABLE "event_cycles_blocks_listing" ALTER COLUMN "view" SET DATA TYPE "public"."enum_event_cycles_blocks_listing_view" USING "view"::"public"."enum_event_cycles_blocks_listing_view";
  ALTER TABLE "event_cycles_blocks_carousel_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_event_cycles_blocks_carousel_sources";
  CREATE TYPE "public"."enum_event_cycles_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents');
  ALTER TABLE "event_cycles_blocks_carousel_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum_event_cycles_blocks_carousel_sources" USING "value"::"public"."enum_event_cycles_blocks_carousel_sources";
  ALTER TABLE "_event_cycles_v_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum__event_cycles_v_blocks_listing_sources";
  CREATE TYPE "public"."enum__event_cycles_v_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents');
  ALTER TABLE "_event_cycles_v_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum__event_cycles_v_blocks_listing_sources" USING "value"::"public"."enum__event_cycles_v_blocks_listing_sources";
  ALTER TABLE "_event_cycles_v_blocks_listing" ALTER COLUMN "view" SET DATA TYPE text;
  ALTER TABLE "_event_cycles_v_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::text;
  DROP TYPE "public"."enum__event_cycles_v_blocks_listing_view";
  CREATE TYPE "public"."enum__event_cycles_v_blocks_listing_view" AS ENUM('cards', 'carousel', 'compact', 'grid', 'tiles');
  ALTER TABLE "_event_cycles_v_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::"public"."enum__event_cycles_v_blocks_listing_view";
  ALTER TABLE "_event_cycles_v_blocks_listing" ALTER COLUMN "view" SET DATA TYPE "public"."enum__event_cycles_v_blocks_listing_view" USING "view"::"public"."enum__event_cycles_v_blocks_listing_view";
  ALTER TABLE "_event_cycles_v_blocks_carousel_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum__event_cycles_v_blocks_carousel_sources";
  CREATE TYPE "public"."enum__event_cycles_v_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents');
  ALTER TABLE "_event_cycles_v_blocks_carousel_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum__event_cycles_v_blocks_carousel_sources" USING "value"::"public"."enum__event_cycles_v_blocks_carousel_sources";
  ALTER TABLE "partners_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_partners_blocks_listing_sources";
  CREATE TYPE "public"."enum_partners_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents');
  ALTER TABLE "partners_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum_partners_blocks_listing_sources" USING "value"::"public"."enum_partners_blocks_listing_sources";
  ALTER TABLE "partners_blocks_listing" ALTER COLUMN "view" SET DATA TYPE text;
  ALTER TABLE "partners_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::text;
  DROP TYPE "public"."enum_partners_blocks_listing_view";
  CREATE TYPE "public"."enum_partners_blocks_listing_view" AS ENUM('cards', 'carousel', 'compact', 'grid', 'tiles');
  ALTER TABLE "partners_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::"public"."enum_partners_blocks_listing_view";
  ALTER TABLE "partners_blocks_listing" ALTER COLUMN "view" SET DATA TYPE "public"."enum_partners_blocks_listing_view" USING "view"::"public"."enum_partners_blocks_listing_view";
  ALTER TABLE "partners_blocks_carousel_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_partners_blocks_carousel_sources";
  CREATE TYPE "public"."enum_partners_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents');
  ALTER TABLE "partners_blocks_carousel_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum_partners_blocks_carousel_sources" USING "value"::"public"."enum_partners_blocks_carousel_sources";
  ALTER TABLE "_partners_v_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum__partners_v_blocks_listing_sources";
  CREATE TYPE "public"."enum__partners_v_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents');
  ALTER TABLE "_partners_v_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum__partners_v_blocks_listing_sources" USING "value"::"public"."enum__partners_v_blocks_listing_sources";
  ALTER TABLE "_partners_v_blocks_listing" ALTER COLUMN "view" SET DATA TYPE text;
  ALTER TABLE "_partners_v_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::text;
  DROP TYPE "public"."enum__partners_v_blocks_listing_view";
  CREATE TYPE "public"."enum__partners_v_blocks_listing_view" AS ENUM('cards', 'carousel', 'compact', 'grid', 'tiles');
  ALTER TABLE "_partners_v_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::"public"."enum__partners_v_blocks_listing_view";
  ALTER TABLE "_partners_v_blocks_listing" ALTER COLUMN "view" SET DATA TYPE "public"."enum__partners_v_blocks_listing_view" USING "view"::"public"."enum__partners_v_blocks_listing_view";
  ALTER TABLE "_partners_v_blocks_carousel_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum__partners_v_blocks_carousel_sources";
  CREATE TYPE "public"."enum__partners_v_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents');
  ALTER TABLE "_partners_v_blocks_carousel_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum__partners_v_blocks_carousel_sources" USING "value"::"public"."enum__partners_v_blocks_carousel_sources";
  ALTER TABLE "homepage_sections_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_homepage_sections_blocks_listing_sources";
  CREATE TYPE "public"."enum_homepage_sections_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents');
  ALTER TABLE "homepage_sections_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum_homepage_sections_blocks_listing_sources" USING "value"::"public"."enum_homepage_sections_blocks_listing_sources";
  ALTER TABLE "homepage_sections_blocks_listing" ALTER COLUMN "view" SET DATA TYPE text;
  ALTER TABLE "homepage_sections_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::text;
  DROP TYPE "public"."enum_homepage_sections_blocks_listing_view";
  CREATE TYPE "public"."enum_homepage_sections_blocks_listing_view" AS ENUM('cards', 'carousel', 'compact', 'grid', 'tiles');
  ALTER TABLE "homepage_sections_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::"public"."enum_homepage_sections_blocks_listing_view";
  ALTER TABLE "homepage_sections_blocks_listing" ALTER COLUMN "view" SET DATA TYPE "public"."enum_homepage_sections_blocks_listing_view" USING "view"::"public"."enum_homepage_sections_blocks_listing_view";
  ALTER TABLE "homepage_sections_blocks_carousel_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_homepage_sections_blocks_carousel_sources";
  CREATE TYPE "public"."enum_homepage_sections_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents');
  ALTER TABLE "homepage_sections_blocks_carousel_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum_homepage_sections_blocks_carousel_sources" USING "value"::"public"."enum_homepage_sections_blocks_carousel_sources";
  ALTER TABLE "_homepage_sections_v_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum__homepage_sections_v_blocks_listing_sources";
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents');
  ALTER TABLE "_homepage_sections_v_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum__homepage_sections_v_blocks_listing_sources" USING "value"::"public"."enum__homepage_sections_v_blocks_listing_sources";
  ALTER TABLE "_homepage_sections_v_blocks_listing" ALTER COLUMN "view" SET DATA TYPE text;
  ALTER TABLE "_homepage_sections_v_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::text;
  DROP TYPE "public"."enum__homepage_sections_v_blocks_listing_view";
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_listing_view" AS ENUM('cards', 'carousel', 'compact', 'grid', 'tiles');
  ALTER TABLE "_homepage_sections_v_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::"public"."enum__homepage_sections_v_blocks_listing_view";
  ALTER TABLE "_homepage_sections_v_blocks_listing" ALTER COLUMN "view" SET DATA TYPE "public"."enum__homepage_sections_v_blocks_listing_view" USING "view"::"public"."enum__homepage_sections_v_blocks_listing_view";
  ALTER TABLE "_homepage_sections_v_blocks_carousel_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum__homepage_sections_v_blocks_carousel_sources";
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents');
  ALTER TABLE "_homepage_sections_v_blocks_carousel_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum__homepage_sections_v_blocks_carousel_sources" USING "value"::"public"."enum__homepage_sections_v_blocks_carousel_sources";
  DROP INDEX "pages_rels_partners_id_idx";
  DROP INDEX "pages_rels_member_profiles_id_idx";
  DROP INDEX "_pages_v_rels_partners_id_idx";
  DROP INDEX "_pages_v_rels_member_profiles_id_idx";
  DROP INDEX "posts_rels_partners_id_idx";
  DROP INDEX "posts_rels_member_profiles_id_idx";
  DROP INDEX "_posts_v_rels_partners_id_idx";
  DROP INDEX "_posts_v_rels_member_profiles_id_idx";
  DROP INDEX "events_rels_partners_id_idx";
  DROP INDEX "events_rels_member_profiles_id_idx";
  DROP INDEX "_events_v_rels_partners_id_idx";
  DROP INDEX "_events_v_rels_member_profiles_id_idx";
  DROP INDEX "event_cycles_rels_partners_id_idx";
  DROP INDEX "event_cycles_rels_member_profiles_id_idx";
  DROP INDEX "_event_cycles_v_rels_partners_id_idx";
  DROP INDEX "_event_cycles_v_rels_member_profiles_id_idx";
  DROP INDEX "partners_rels_partners_id_idx";
  DROP INDEX "partners_rels_member_profiles_id_idx";
  DROP INDEX "_partners_v_rels_partners_id_idx";
  DROP INDEX "_partners_v_rels_member_profiles_id_idx";
  DROP INDEX "homepage_sections_rels_partners_id_idx";
  DROP INDEX "homepage_sections_rels_member_profiles_id_idx";
  DROP INDEX "_homepage_sections_v_rels_partners_id_idx";
  DROP INDEX "_homepage_sections_v_rels_member_profiles_id_idx";
  ALTER TABLE "pages_blocks_listing_items" DROP COLUMN "context_label";
  ALTER TABLE "pages_blocks_listing" DROP COLUMN "hide_when_empty";
  ALTER TABLE "pages_rels" DROP COLUMN "partners_id";
  ALTER TABLE "pages_rels" DROP COLUMN "member_profiles_id";
  ALTER TABLE "_pages_v_blocks_listing_items" DROP COLUMN "context_label";
  ALTER TABLE "_pages_v_blocks_listing" DROP COLUMN "hide_when_empty";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "partners_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "member_profiles_id";
  ALTER TABLE "posts_blocks_listing_items" DROP COLUMN "context_label";
  ALTER TABLE "posts_blocks_listing" DROP COLUMN "hide_when_empty";
  ALTER TABLE "posts_rels" DROP COLUMN "partners_id";
  ALTER TABLE "posts_rels" DROP COLUMN "member_profiles_id";
  ALTER TABLE "_posts_v_blocks_listing_items" DROP COLUMN "context_label";
  ALTER TABLE "_posts_v_blocks_listing" DROP COLUMN "hide_when_empty";
  ALTER TABLE "_posts_v_rels" DROP COLUMN "partners_id";
  ALTER TABLE "_posts_v_rels" DROP COLUMN "member_profiles_id";
  ALTER TABLE "events_blocks_listing_items" DROP COLUMN "context_label";
  ALTER TABLE "events_blocks_listing" DROP COLUMN "hide_when_empty";
  ALTER TABLE "events_rels" DROP COLUMN "partners_id";
  ALTER TABLE "events_rels" DROP COLUMN "member_profiles_id";
  ALTER TABLE "_events_v_blocks_listing_items" DROP COLUMN "context_label";
  ALTER TABLE "_events_v_blocks_listing" DROP COLUMN "hide_when_empty";
  ALTER TABLE "_events_v_rels" DROP COLUMN "partners_id";
  ALTER TABLE "_events_v_rels" DROP COLUMN "member_profiles_id";
  ALTER TABLE "event_cycles_blocks_listing_items" DROP COLUMN "context_label";
  ALTER TABLE "event_cycles_blocks_listing" DROP COLUMN "hide_when_empty";
  ALTER TABLE "event_cycles_rels" DROP COLUMN "partners_id";
  ALTER TABLE "event_cycles_rels" DROP COLUMN "member_profiles_id";
  ALTER TABLE "_event_cycles_v_blocks_listing_items" DROP COLUMN "context_label";
  ALTER TABLE "_event_cycles_v_blocks_listing" DROP COLUMN "hide_when_empty";
  ALTER TABLE "_event_cycles_v_rels" DROP COLUMN "partners_id";
  ALTER TABLE "_event_cycles_v_rels" DROP COLUMN "member_profiles_id";
  ALTER TABLE "partners_blocks_listing_items" DROP COLUMN "context_label";
  ALTER TABLE "partners_blocks_listing" DROP COLUMN "hide_when_empty";
  ALTER TABLE "partners_rels" DROP COLUMN "partners_id";
  ALTER TABLE "partners_rels" DROP COLUMN "member_profiles_id";
  ALTER TABLE "_partners_v_blocks_listing_items" DROP COLUMN "context_label";
  ALTER TABLE "_partners_v_blocks_listing" DROP COLUMN "hide_when_empty";
  ALTER TABLE "_partners_v_rels" DROP COLUMN "partners_id";
  ALTER TABLE "_partners_v_rels" DROP COLUMN "member_profiles_id";
  ALTER TABLE "homepage_sections_blocks_listing_items" DROP COLUMN "context_label";
  ALTER TABLE "homepage_sections_blocks_listing" DROP COLUMN "hide_when_empty";
  ALTER TABLE "homepage_sections_rels" DROP COLUMN "partners_id";
  ALTER TABLE "homepage_sections_rels" DROP COLUMN "member_profiles_id";
  ALTER TABLE "_homepage_sections_v_blocks_listing_items" DROP COLUMN "context_label";
  ALTER TABLE "_homepage_sections_v_blocks_listing" DROP COLUMN "hide_when_empty";
  ALTER TABLE "_homepage_sections_v_rels" DROP COLUMN "partners_id";
  ALTER TABLE "_homepage_sections_v_rels" DROP COLUMN "member_profiles_id";`)
}
