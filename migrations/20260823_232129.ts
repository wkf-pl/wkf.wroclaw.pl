import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

import type { TaxonomizableCollectionSlug } from '../src/modules/content/content-listing'
import { syncContentListingItem } from '../src/modules/content/content-listing-index'

const batchSize = 100
const indexedCollections: TaxonomizableCollectionSlug[] = [
  'pages',
  'posts',
  'events',
  'event-cycles',
]

async function findPublishedDocumentIDs(
  db: MigrateUpArgs['db'],
  collection: TaxonomizableCollectionSlug,
  lastDocumentID: number,
): Promise<number[]> {
  const query =
    collection === 'pages'
      ? sql`SELECT "id" FROM "pages" WHERE "id" > ${lastDocumentID} AND "_status" = 'published' ORDER BY "id" LIMIT ${batchSize}`
      : collection === 'posts'
        ? sql`SELECT "id" FROM "posts" WHERE "id" > ${lastDocumentID} AND "_status" = 'published' ORDER BY "id" LIMIT ${batchSize}`
        : collection === 'events'
          ? sql`SELECT "id" FROM "events" WHERE "id" > ${lastDocumentID} AND "_status" = 'published' ORDER BY "id" LIMIT ${batchSize}`
          : sql`SELECT "id" FROM "event_cycles" WHERE "id" > ${lastDocumentID} AND "_status" = 'published' ORDER BY "id" LIMIT ${batchSize}`
  const result = await db.execute(query)

  return result.rows.map((row) => (row as { id: number }).id)
}

export async function up({ db, payload: _payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    DECLARE
      relation_table text;
    BEGIN
      FOREACH relation_table IN ARRAY ARRAY[
        'pages_rels',
        '_pages_v_rels',
        'posts_rels',
        '_posts_v_rels',
        'events_rels',
        '_events_v_rels',
        'event_cycles_rels',
        '_event_cycles_v_rels',
        'media_rels'
      ]
      LOOP
        EXECUTE format($statement$
          WITH ranked_categories AS (
            SELECT
              "categories_id",
              row_number() OVER (
                PARTITION BY "parent_id", "path"
                ORDER BY "order" NULLS LAST, "id"
              ) AS category_rank
            FROM %I
            WHERE "categories_id" IS NOT NULL
          )
          INSERT INTO "tags" ("name", "slug", "description")
          SELECT DISTINCT ON (category."slug")
            category."name",
            category."slug",
            category."description"
          FROM ranked_categories
          JOIN "categories" AS category ON category."id" = ranked_categories."categories_id"
          WHERE ranked_categories.category_rank > 1
          ORDER BY category."slug"
          ON CONFLICT ("slug") DO NOTHING
        $statement$, relation_table);

        EXECUTE format($statement$
          WITH ranked_categories AS (
            SELECT
              "id",
              "order",
              "parent_id",
              "path",
              "categories_id",
              row_number() OVER (
                PARTITION BY "parent_id", "path"
                ORDER BY "order" NULLS LAST, "id"
              ) AS category_rank
            FROM %I
            WHERE "categories_id" IS NOT NULL
          ),
          promoted_tags AS (
            SELECT
              ranked_categories.*,
              tag."id" AS tag_id,
              replace(ranked_categories."path", 'categories', 'tags') AS tag_path,
              row_number() OVER (
                PARTITION BY ranked_categories."parent_id", ranked_categories."path"
                ORDER BY ranked_categories."order" NULLS LAST, ranked_categories."id"
              ) AS promoted_order
            FROM ranked_categories
            JOIN "categories" AS category ON category."id" = ranked_categories."categories_id"
            JOIN "tags" AS tag ON tag."slug" = category."slug"
            WHERE ranked_categories.category_rank > 1
          )
          INSERT INTO %I ("order", "parent_id", "path", "tags_id")
          SELECT
            COALESCE((
              SELECT MAX(existing_tag."order")
              FROM %I AS existing_tag
              WHERE existing_tag."parent_id" = promoted_tags."parent_id"
                AND existing_tag."path" = promoted_tags.tag_path
                AND existing_tag."tags_id" IS NOT NULL
            ), 0) + promoted_tags.promoted_order,
            promoted_tags."parent_id",
            promoted_tags.tag_path,
            promoted_tags.tag_id
          FROM promoted_tags
          WHERE NOT EXISTS (
            SELECT 1
            FROM %I AS existing_tag
            WHERE existing_tag."parent_id" = promoted_tags."parent_id"
              AND existing_tag."path" = promoted_tags.tag_path
              AND existing_tag."tags_id" = promoted_tags.tag_id
          )
        $statement$, relation_table, relation_table, relation_table, relation_table);
      END LOOP;
    END $$;
  `)

  await db.execute(sql`
   CREATE TABLE "pages_breadcrumbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"doc_id" integer,
  	"url" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "_pages_v_version_breadcrumbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"doc_id" integer,
  	"url" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "categories_breadcrumbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"doc_id" integer,
  	"url" varchar,
  	"label" varchar
  );
  
  ALTER TABLE "content_listing_items_rels" DROP CONSTRAINT "content_listing_items_rels_categories_fk";
  
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_categories_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_categories_fk";
  
  ALTER TABLE "posts_rels" DROP CONSTRAINT "posts_rels_categories_fk";
  
  ALTER TABLE "_posts_v_rels" DROP CONSTRAINT "_posts_v_rels_categories_fk";
  
  ALTER TABLE "events_rels" DROP CONSTRAINT "events_rels_categories_fk";
  
  ALTER TABLE "_events_v_rels" DROP CONSTRAINT "_events_v_rels_categories_fk";
  
  ALTER TABLE "event_cycles_rels" DROP CONSTRAINT "event_cycles_rels_categories_fk";
  
  ALTER TABLE "_event_cycles_v_rels" DROP CONSTRAINT "_event_cycles_v_rels_categories_fk";
  
  ALTER TABLE "media_rels" DROP CONSTRAINT "media_rels_categories_fk";
  
  DROP INDEX "content_listing_items_rels_categories_id_idx";
  DROP INDEX "pages_rels_categories_id_idx";
  DROP INDEX "_pages_v_rels_categories_id_idx";
  DROP INDEX "posts_rels_categories_id_idx";
  DROP INDEX "_posts_v_rels_categories_id_idx";
  DROP INDEX "events_rels_categories_id_idx";
  DROP INDEX "_events_v_rels_categories_id_idx";
  DROP INDEX "event_cycles_rels_categories_id_idx";
  DROP INDEX "_event_cycles_v_rels_categories_id_idx";
  DROP INDEX "media_rels_categories_id_idx";
  ALTER TABLE "content_listing_items" ADD COLUMN "category_id" integer;
  ALTER TABLE "pages" ADD COLUMN "category_id" integer;
  ALTER TABLE "pages" ADD COLUMN "full_title" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_category_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_full_title" varchar;
  ALTER TABLE "posts" ADD COLUMN "category_id" integer;
  ALTER TABLE "_posts_v" ADD COLUMN "version_category_id" integer;
  ALTER TABLE "events" ADD COLUMN "category_id" integer;
  ALTER TABLE "_events_v" ADD COLUMN "version_category_id" integer;
  ALTER TABLE "event_cycles" ADD COLUMN "category_id" integer;
  ALTER TABLE "event_cycles" ADD COLUMN "event_defaults_category_id" integer;
  ALTER TABLE "_event_cycles_v" ADD COLUMN "version_category_id" integer;
  ALTER TABLE "_event_cycles_v" ADD COLUMN "version_event_defaults_category_id" integer;
  ALTER TABLE "categories" ADD COLUMN "parent_id" integer;
  ALTER TABLE "categories" ADD COLUMN "full_title" varchar;
  ALTER TABLE "media" ADD COLUMN "category_id" integer;
  ALTER TABLE "pages_breadcrumbs" ADD CONSTRAINT "pages_breadcrumbs_doc_id_pages_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_breadcrumbs" ADD CONSTRAINT "pages_breadcrumbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_breadcrumbs" ADD CONSTRAINT "_pages_v_version_breadcrumbs_doc_id_pages_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_breadcrumbs" ADD CONSTRAINT "_pages_v_version_breadcrumbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories_breadcrumbs" ADD CONSTRAINT "categories_breadcrumbs_doc_id_categories_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories_breadcrumbs" ADD CONSTRAINT "categories_breadcrumbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_breadcrumbs_order_idx" ON "pages_breadcrumbs" USING btree ("_order");
  CREATE INDEX "pages_breadcrumbs_parent_id_idx" ON "pages_breadcrumbs" USING btree ("_parent_id");
  CREATE INDEX "pages_breadcrumbs_doc_idx" ON "pages_breadcrumbs" USING btree ("doc_id");
  CREATE INDEX "_pages_v_version_breadcrumbs_order_idx" ON "_pages_v_version_breadcrumbs" USING btree ("_order");
  CREATE INDEX "_pages_v_version_breadcrumbs_parent_id_idx" ON "_pages_v_version_breadcrumbs" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_breadcrumbs_doc_idx" ON "_pages_v_version_breadcrumbs" USING btree ("doc_id");
  CREATE INDEX "categories_breadcrumbs_order_idx" ON "categories_breadcrumbs" USING btree ("_order");
  CREATE INDEX "categories_breadcrumbs_parent_id_idx" ON "categories_breadcrumbs" USING btree ("_parent_id");
  CREATE INDEX "categories_breadcrumbs_doc_idx" ON "categories_breadcrumbs" USING btree ("doc_id");
  ALTER TABLE "content_listing_items" ADD CONSTRAINT "content_listing_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_category_id_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_category_id_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_category_id_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles" ADD CONSTRAINT "event_cycles_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles" ADD CONSTRAINT "event_cycles_event_defaults_category_id_categories_id_fk" FOREIGN KEY ("event_defaults_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v" ADD CONSTRAINT "_event_cycles_v_version_category_id_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v" ADD CONSTRAINT "_event_cycles_v_version_event_defaults_category_id_categories_id_fk" FOREIGN KEY ("version_event_defaults_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "content_listing_items_category_idx" ON "content_listing_items" USING btree ("category_id");
  CREATE INDEX "pages_category_idx" ON "pages" USING btree ("category_id");
  CREATE INDEX "pages_full_title_idx" ON "pages" USING btree ("full_title");
  CREATE INDEX "_pages_v_version_version_category_idx" ON "_pages_v" USING btree ("version_category_id");
  CREATE INDEX "_pages_v_version_version_full_title_idx" ON "_pages_v" USING btree ("version_full_title");
  CREATE INDEX "posts_category_idx" ON "posts" USING btree ("category_id");
  CREATE INDEX "_posts_v_version_version_category_idx" ON "_posts_v" USING btree ("version_category_id");
  CREATE INDEX "events_category_idx" ON "events" USING btree ("category_id");
  CREATE INDEX "_events_v_version_version_category_idx" ON "_events_v" USING btree ("version_category_id");
  CREATE INDEX "event_cycles_category_idx" ON "event_cycles" USING btree ("category_id");
  CREATE INDEX "event_cycles_event_defaults_event_defaults_category_idx" ON "event_cycles" USING btree ("event_defaults_category_id");
  CREATE INDEX "_event_cycles_v_version_version_category_idx" ON "_event_cycles_v" USING btree ("version_category_id");
  CREATE INDEX "_event_cycles_v_version_event_defaults_version_event_d_1_idx" ON "_event_cycles_v" USING btree ("version_event_defaults_category_id");
  CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");
  CREATE INDEX "categories_full_title_idx" ON "categories" USING btree ("full_title");
  CREATE INDEX "media_category_idx" ON "media" USING btree ("category_id");

  UPDATE "pages" AS target
  SET "category_id" = selected."categories_id"
  FROM (
    SELECT DISTINCT ON ("parent_id") "parent_id", "categories_id"
    FROM "pages_rels"
    WHERE "path" = 'categories' AND "categories_id" IS NOT NULL
    ORDER BY "parent_id", "order" NULLS LAST, "id"
  ) AS selected
  WHERE target."id" = selected."parent_id";

  UPDATE "_pages_v" AS target
  SET "version_category_id" = selected."categories_id"
  FROM (
    SELECT DISTINCT ON ("parent_id") "parent_id", "categories_id"
    FROM "_pages_v_rels"
    WHERE "path" = 'version.categories' AND "categories_id" IS NOT NULL
    ORDER BY "parent_id", "order" NULLS LAST, "id"
  ) AS selected
  WHERE target."id" = selected."parent_id";

  UPDATE "posts" AS target
  SET "category_id" = selected."categories_id"
  FROM (
    SELECT DISTINCT ON ("parent_id") "parent_id", "categories_id"
    FROM "posts_rels"
    WHERE "path" = 'categories' AND "categories_id" IS NOT NULL
    ORDER BY "parent_id", "order" NULLS LAST, "id"
  ) AS selected
  WHERE target."id" = selected."parent_id";

  UPDATE "_posts_v" AS target
  SET "version_category_id" = selected."categories_id"
  FROM (
    SELECT DISTINCT ON ("parent_id") "parent_id", "categories_id"
    FROM "_posts_v_rels"
    WHERE "path" = 'version.categories' AND "categories_id" IS NOT NULL
    ORDER BY "parent_id", "order" NULLS LAST, "id"
  ) AS selected
  WHERE target."id" = selected."parent_id";

  UPDATE "events" AS target
  SET "category_id" = selected."categories_id"
  FROM (
    SELECT DISTINCT ON ("parent_id") "parent_id", "categories_id"
    FROM "events_rels"
    WHERE "path" = 'categories' AND "categories_id" IS NOT NULL
    ORDER BY "parent_id", "order" NULLS LAST, "id"
  ) AS selected
  WHERE target."id" = selected."parent_id";

  UPDATE "_events_v" AS target
  SET "version_category_id" = selected."categories_id"
  FROM (
    SELECT DISTINCT ON ("parent_id") "parent_id", "categories_id"
    FROM "_events_v_rels"
    WHERE "path" = 'version.categories' AND "categories_id" IS NOT NULL
    ORDER BY "parent_id", "order" NULLS LAST, "id"
  ) AS selected
  WHERE target."id" = selected."parent_id";

  UPDATE "event_cycles" AS target
  SET "category_id" = selected."categories_id"
  FROM (
    SELECT DISTINCT ON ("parent_id") "parent_id", "categories_id"
    FROM "event_cycles_rels"
    WHERE "path" = 'categories' AND "categories_id" IS NOT NULL
    ORDER BY "parent_id", "order" NULLS LAST, "id"
  ) AS selected
  WHERE target."id" = selected."parent_id";

  UPDATE "event_cycles" AS target
  SET "event_defaults_category_id" = selected."categories_id"
  FROM (
    SELECT DISTINCT ON ("parent_id") "parent_id", "categories_id"
    FROM "event_cycles_rels"
    WHERE "path" = 'eventDefaults.categories' AND "categories_id" IS NOT NULL
    ORDER BY "parent_id", "order" NULLS LAST, "id"
  ) AS selected
  WHERE target."id" = selected."parent_id";

  UPDATE "_event_cycles_v" AS target
  SET "version_category_id" = selected."categories_id"
  FROM (
    SELECT DISTINCT ON ("parent_id") "parent_id", "categories_id"
    FROM "_event_cycles_v_rels"
    WHERE "path" = 'version.categories' AND "categories_id" IS NOT NULL
    ORDER BY "parent_id", "order" NULLS LAST, "id"
  ) AS selected
  WHERE target."id" = selected."parent_id";

  UPDATE "_event_cycles_v" AS target
  SET "version_event_defaults_category_id" = selected."categories_id"
  FROM (
    SELECT DISTINCT ON ("parent_id") "parent_id", "categories_id"
    FROM "_event_cycles_v_rels"
    WHERE "path" = 'version.eventDefaults.categories' AND "categories_id" IS NOT NULL
    ORDER BY "parent_id", "order" NULLS LAST, "id"
  ) AS selected
  WHERE target."id" = selected."parent_id";

  UPDATE "media" AS target
  SET "category_id" = selected."categories_id"
  FROM (
    SELECT DISTINCT ON ("parent_id") "parent_id", "categories_id"
    FROM "media_rels"
    WHERE "path" = 'categories' AND "categories_id" IS NOT NULL
    ORDER BY "parent_id", "order" NULLS LAST, "id"
  ) AS selected
  WHERE target."id" = selected."parent_id";

  UPDATE "categories" SET "full_title" = "name";
  INSERT INTO "categories_breadcrumbs" ("_order", "_parent_id", "id", "doc_id", "url", "label")
  SELECT 1, "id", 'migration-category-' || "id", "id", '/category/' || "slug", "name"
  FROM "categories";

  WITH RECURSIVE page_hierarchy AS (
    SELECT
      page."id",
      ARRAY[page."id"] AS document_ids,
      ARRAY[page."title"] AS labels,
      ARRAY[page."slug"] AS slugs
    FROM "pages" AS page
    WHERE page."parent_id" IS NULL

    UNION ALL

    SELECT
      child."id",
      page_hierarchy.document_ids || child."id",
      page_hierarchy.labels || child."title",
      page_hierarchy.slugs || child."slug"
    FROM "pages" AS child
    JOIN page_hierarchy ON child."parent_id" = page_hierarchy."id"
  )
  UPDATE "pages" AS page
  SET "full_title" = array_to_string(page_hierarchy.labels, ' › ')
  FROM page_hierarchy
  WHERE page."id" = page_hierarchy."id";

  WITH RECURSIVE page_hierarchy AS (
    SELECT
      page."id",
      ARRAY[page."id"] AS document_ids,
      ARRAY[page."title"] AS labels,
      ARRAY[page."slug"] AS slugs
    FROM "pages" AS page
    WHERE page."parent_id" IS NULL

    UNION ALL

    SELECT
      child."id",
      page_hierarchy.document_ids || child."id",
      page_hierarchy.labels || child."title",
      page_hierarchy.slugs || child."slug"
    FROM "pages" AS child
    JOIN page_hierarchy ON child."parent_id" = page_hierarchy."id"
  )
  INSERT INTO "pages_breadcrumbs" ("_order", "_parent_id", "id", "doc_id", "url", "label")
  SELECT
    crumb.ordinality,
    page_hierarchy."id",
    'migration-page-' || page_hierarchy."id" || '-' || crumb.ordinality,
    crumb.document_id,
    '/' || crumb.slug,
    crumb.label
  FROM page_hierarchy
  CROSS JOIN LATERAL unnest(
    page_hierarchy.document_ids,
    page_hierarchy.labels,
    page_hierarchy.slugs
  ) WITH ORDINALITY AS crumb(document_id, label, slug, ordinality);

  UPDATE "_pages_v" AS version
  SET "version_full_title" = concat_ws(
    ' › ',
    (SELECT parent."full_title" FROM "pages" AS parent WHERE parent."id" = version."version_parent_id"),
    version."version_title"
  );

  INSERT INTO "_pages_v_version_breadcrumbs" (
    "_order", "_parent_id", "doc_id", "url", "label"
  )
  SELECT breadcrumb."_order", version."id", breadcrumb."doc_id", breadcrumb."url", breadcrumb."label"
  FROM "_pages_v" AS version
  JOIN "pages_breadcrumbs" AS breadcrumb
    ON breadcrumb."_parent_id" = version."version_parent_id";

  INSERT INTO "_pages_v_version_breadcrumbs" (
    "_order", "_parent_id", "doc_id", "url", "label"
  )
  SELECT
    COALESCE((
      SELECT MAX(breadcrumb."_order")
      FROM "_pages_v_version_breadcrumbs" AS breadcrumb
      WHERE breadcrumb."_parent_id" = version."id"
    ), 0) + 1,
    version."id",
    version."parent_id",
    '/' || version."version_slug",
    version."version_title"
  FROM "_pages_v" AS version;

  ALTER TABLE "content_listing_items_rels" DROP COLUMN "categories_id";
  ALTER TABLE "pages_rels" DROP COLUMN "categories_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "categories_id";
  ALTER TABLE "posts_rels" DROP COLUMN "categories_id";
  ALTER TABLE "_posts_v_rels" DROP COLUMN "categories_id";
  ALTER TABLE "events_rels" DROP COLUMN "categories_id";
  ALTER TABLE "_events_v_rels" DROP COLUMN "categories_id";
  ALTER TABLE "event_cycles_rels" DROP COLUMN "categories_id";
  ALTER TABLE "_event_cycles_v_rels" DROP COLUMN "categories_id";
  ALTER TABLE "media_rels" DROP COLUMN "categories_id";
  DELETE FROM "content_listing_items";`)

  req.context = {
    ...req.context,
    skipContentListingSync: true,
    skipPublicCacheInvalidation: true,
  }

  for (const collection of indexedCollections) {
    let lastDocumentID = 0
    while (true) {
      const documentIDs = await findPublishedDocumentIDs(db, collection, lastDocumentID)

      for (const documentID of documentIDs) {
        lastDocumentID = documentID
        await syncContentListingItem(req, collection, documentID)
      }

      if (documentIDs.length < batchSize) break
    }
  }
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_breadcrumbs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_breadcrumbs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "categories_breadcrumbs" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_breadcrumbs" CASCADE;
  DROP TABLE "_pages_v_version_breadcrumbs" CASCADE;
  DROP TABLE "categories_breadcrumbs" CASCADE;
  ALTER TABLE "content_listing_items" DROP CONSTRAINT "content_listing_items_category_id_categories_id_fk";
  
  ALTER TABLE "pages" DROP CONSTRAINT "pages_category_id_categories_id_fk";
  
  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_category_id_categories_id_fk";
  
  ALTER TABLE "posts" DROP CONSTRAINT "posts_category_id_categories_id_fk";
  
  ALTER TABLE "_posts_v" DROP CONSTRAINT "_posts_v_version_category_id_categories_id_fk";
  
  ALTER TABLE "events" DROP CONSTRAINT "events_category_id_categories_id_fk";
  
  ALTER TABLE "_events_v" DROP CONSTRAINT "_events_v_version_category_id_categories_id_fk";
  
  ALTER TABLE "event_cycles" DROP CONSTRAINT "event_cycles_category_id_categories_id_fk";
  
  ALTER TABLE "event_cycles" DROP CONSTRAINT "event_cycles_event_defaults_category_id_categories_id_fk";
  
  ALTER TABLE "_event_cycles_v" DROP CONSTRAINT "_event_cycles_v_version_category_id_categories_id_fk";
  
  ALTER TABLE "_event_cycles_v" DROP CONSTRAINT "_event_cycles_v_version_event_defaults_category_id_categories_id_fk";
  
  ALTER TABLE "categories" DROP CONSTRAINT "categories_parent_id_categories_id_fk";
  
  ALTER TABLE "media" DROP CONSTRAINT "media_category_id_categories_id_fk";
  
  DROP INDEX "content_listing_items_category_idx";
  DROP INDEX "pages_category_idx";
  DROP INDEX "pages_full_title_idx";
  DROP INDEX "_pages_v_version_version_category_idx";
  DROP INDEX "_pages_v_version_version_full_title_idx";
  DROP INDEX "posts_category_idx";
  DROP INDEX "_posts_v_version_version_category_idx";
  DROP INDEX "events_category_idx";
  DROP INDEX "_events_v_version_version_category_idx";
  DROP INDEX "event_cycles_category_idx";
  DROP INDEX "event_cycles_event_defaults_event_defaults_category_idx";
  DROP INDEX "_event_cycles_v_version_version_category_idx";
  DROP INDEX "_event_cycles_v_version_event_defaults_version_event_d_1_idx";
  DROP INDEX "categories_parent_idx";
  DROP INDEX "categories_full_title_idx";
  DROP INDEX "media_category_idx";
  ALTER TABLE "content_listing_items_rels" ADD COLUMN "categories_id" integer;
  ALTER TABLE "pages_rels" ADD COLUMN "categories_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "categories_id" integer;
  ALTER TABLE "posts_rels" ADD COLUMN "categories_id" integer;
  ALTER TABLE "_posts_v_rels" ADD COLUMN "categories_id" integer;
  ALTER TABLE "events_rels" ADD COLUMN "categories_id" integer;
  ALTER TABLE "_events_v_rels" ADD COLUMN "categories_id" integer;
  ALTER TABLE "event_cycles_rels" ADD COLUMN "categories_id" integer;
  ALTER TABLE "_event_cycles_v_rels" ADD COLUMN "categories_id" integer;
  ALTER TABLE "media_rels" ADD COLUMN "categories_id" integer;
  ALTER TABLE "content_listing_items_rels" ADD CONSTRAINT "content_listing_items_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_rels" ADD CONSTRAINT "event_cycles_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_rels" ADD CONSTRAINT "_event_cycles_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "content_listing_items_rels_categories_id_idx" ON "content_listing_items_rels" USING btree ("categories_id");
  CREATE INDEX "pages_rels_categories_id_idx" ON "pages_rels" USING btree ("categories_id");
  CREATE INDEX "_pages_v_rels_categories_id_idx" ON "_pages_v_rels" USING btree ("categories_id");
  CREATE INDEX "posts_rels_categories_id_idx" ON "posts_rels" USING btree ("categories_id");
  CREATE INDEX "_posts_v_rels_categories_id_idx" ON "_posts_v_rels" USING btree ("categories_id");
  CREATE INDEX "events_rels_categories_id_idx" ON "events_rels" USING btree ("categories_id");
  CREATE INDEX "_events_v_rels_categories_id_idx" ON "_events_v_rels" USING btree ("categories_id");
  CREATE INDEX "event_cycles_rels_categories_id_idx" ON "event_cycles_rels" USING btree ("categories_id");
  CREATE INDEX "_event_cycles_v_rels_categories_id_idx" ON "_event_cycles_v_rels" USING btree ("categories_id");
  CREATE INDEX "media_rels_categories_id_idx" ON "media_rels" USING btree ("categories_id");

  INSERT INTO "content_listing_items_rels" ("order", "parent_id", "path", "categories_id")
  SELECT 1, "id", 'categories', "category_id"
  FROM "content_listing_items" WHERE "category_id" IS NOT NULL;

  INSERT INTO "pages_rels" ("order", "parent_id", "path", "categories_id")
  SELECT 1, "id", 'categories', "category_id"
  FROM "pages" WHERE "category_id" IS NOT NULL;

  INSERT INTO "_pages_v_rels" ("order", "parent_id", "path", "categories_id")
  SELECT 1, "id", 'version.categories', "version_category_id"
  FROM "_pages_v" WHERE "version_category_id" IS NOT NULL;

  INSERT INTO "posts_rels" ("order", "parent_id", "path", "categories_id")
  SELECT 1, "id", 'categories', "category_id"
  FROM "posts" WHERE "category_id" IS NOT NULL;

  INSERT INTO "_posts_v_rels" ("order", "parent_id", "path", "categories_id")
  SELECT 1, "id", 'version.categories', "version_category_id"
  FROM "_posts_v" WHERE "version_category_id" IS NOT NULL;

  INSERT INTO "events_rels" ("order", "parent_id", "path", "categories_id")
  SELECT 1, "id", 'categories', "category_id"
  FROM "events" WHERE "category_id" IS NOT NULL;

  INSERT INTO "_events_v_rels" ("order", "parent_id", "path", "categories_id")
  SELECT 1, "id", 'version.categories', "version_category_id"
  FROM "_events_v" WHERE "version_category_id" IS NOT NULL;

  INSERT INTO "event_cycles_rels" ("order", "parent_id", "path", "categories_id")
  SELECT 1, "id", 'categories', "category_id"
  FROM "event_cycles" WHERE "category_id" IS NOT NULL;

  INSERT INTO "event_cycles_rels" ("order", "parent_id", "path", "categories_id")
  SELECT 1, "id", 'eventDefaults.categories', "event_defaults_category_id"
  FROM "event_cycles" WHERE "event_defaults_category_id" IS NOT NULL;

  INSERT INTO "_event_cycles_v_rels" ("order", "parent_id", "path", "categories_id")
  SELECT 1, "id", 'version.categories', "version_category_id"
  FROM "_event_cycles_v" WHERE "version_category_id" IS NOT NULL;

  INSERT INTO "_event_cycles_v_rels" ("order", "parent_id", "path", "categories_id")
  SELECT 1, "id", 'version.eventDefaults.categories', "version_event_defaults_category_id"
  FROM "_event_cycles_v" WHERE "version_event_defaults_category_id" IS NOT NULL;

  INSERT INTO "media_rels" ("order", "parent_id", "path", "categories_id")
  SELECT 1, "id", 'categories', "category_id"
  FROM "media" WHERE "category_id" IS NOT NULL;

  ALTER TABLE "content_listing_items" DROP COLUMN "category_id";
  ALTER TABLE "pages" DROP COLUMN "category_id";
  ALTER TABLE "pages" DROP COLUMN "full_title";
  ALTER TABLE "_pages_v" DROP COLUMN "version_category_id";
  ALTER TABLE "_pages_v" DROP COLUMN "version_full_title";
  ALTER TABLE "posts" DROP COLUMN "category_id";
  ALTER TABLE "_posts_v" DROP COLUMN "version_category_id";
  ALTER TABLE "events" DROP COLUMN "category_id";
  ALTER TABLE "_events_v" DROP COLUMN "version_category_id";
  ALTER TABLE "event_cycles" DROP COLUMN "category_id";
  ALTER TABLE "event_cycles" DROP COLUMN "event_defaults_category_id";
  ALTER TABLE "_event_cycles_v" DROP COLUMN "version_category_id";
  ALTER TABLE "_event_cycles_v" DROP COLUMN "version_event_defaults_category_id";
  ALTER TABLE "categories" DROP COLUMN "parent_id";
  ALTER TABLE "categories" DROP COLUMN "full_title";
  ALTER TABLE "media" DROP COLUMN "category_id";`)
}
