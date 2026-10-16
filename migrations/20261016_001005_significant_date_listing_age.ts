import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  DO $migration$
  DECLARE
    block_table text;
    block_tables text[] := ARRAY[
      'pages_blocks_listing', 'pages_blocks_carousel',
      '_pages_v_blocks_listing', '_pages_v_blocks_carousel',
      'posts_blocks_listing', 'posts_blocks_carousel',
      '_posts_v_blocks_listing', '_posts_v_blocks_carousel',
      'events_blocks_listing', 'events_blocks_carousel',
      '_events_v_blocks_listing', '_events_v_blocks_carousel',
      'event_cycles_blocks_listing', 'event_cycles_blocks_carousel',
      '_event_cycles_v_blocks_listing', '_event_cycles_v_blocks_carousel',
      'partners_blocks_listing', 'partners_blocks_carousel',
      '_partners_v_blocks_listing', '_partners_v_blocks_carousel',
      'homepage_sections_blocks_listing', 'homepage_sections_blocks_carousel'
    ];
  BEGIN
    FOREACH block_table IN ARRAY block_tables LOOP
      EXECUTE format(
        'UPDATE %I SET sort = %L WHERE sort::text = %L',
        block_table,
        'oldest',
        'eventDateAscending'
      );
    END LOOP;
  END
  $migration$;

  ALTER TABLE "content_listing_items" RENAME COLUMN "sort_date" TO "significant_date";
  ALTER TABLE "content_listing_items" ALTER COLUMN "significant_date" DROP NOT NULL;
  UPDATE "content_listing_items" AS listing_item
  SET "significant_date" = CASE listing_item."source"::text
    WHEN 'posts' THEN (
      SELECT post."published_at" FROM "posts" AS post
      WHERE post."id" = listing_item."source_document_id"
    )
    WHEN 'events' THEN (
      SELECT event."start_at" FROM "events" AS event
      WHERE event."id" = listing_item."source_document_id"
    )
    WHEN 'documents' THEN (
      SELECT document."document_date" FROM "documents" AS document
      WHERE document."id" = listing_item."source_document_id"
    )
    ELSE NULL
  END;
  ALTER TABLE "pages_blocks_listing" ALTER COLUMN "sort" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_listing" ALTER COLUMN "sort" SET DEFAULT 'newest'::text;
  DROP TYPE "public"."enum_pages_blocks_listing_sort";
  CREATE TYPE "public"."enum_pages_blocks_listing_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  ALTER TABLE "pages_blocks_listing" ALTER COLUMN "sort" SET DEFAULT 'newest'::"public"."enum_pages_blocks_listing_sort";
  ALTER TABLE "pages_blocks_listing" ALTER COLUMN "sort" SET DATA TYPE "public"."enum_pages_blocks_listing_sort" USING "sort"::"public"."enum_pages_blocks_listing_sort";
  ALTER TABLE "pages_blocks_carousel" ALTER COLUMN "sort" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_carousel" ALTER COLUMN "sort" SET DEFAULT 'newest'::text;
  DROP TYPE "public"."enum_pages_blocks_carousel_sort";
  CREATE TYPE "public"."enum_pages_blocks_carousel_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  ALTER TABLE "pages_blocks_carousel" ALTER COLUMN "sort" SET DEFAULT 'newest'::"public"."enum_pages_blocks_carousel_sort";
  ALTER TABLE "pages_blocks_carousel" ALTER COLUMN "sort" SET DATA TYPE "public"."enum_pages_blocks_carousel_sort" USING "sort"::"public"."enum_pages_blocks_carousel_sort";
  ALTER TABLE "_pages_v_blocks_listing" ALTER COLUMN "sort" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_listing" ALTER COLUMN "sort" SET DEFAULT 'newest'::text;
  DROP TYPE "public"."enum__pages_v_blocks_listing_sort";
  CREATE TYPE "public"."enum__pages_v_blocks_listing_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  ALTER TABLE "_pages_v_blocks_listing" ALTER COLUMN "sort" SET DEFAULT 'newest'::"public"."enum__pages_v_blocks_listing_sort";
  ALTER TABLE "_pages_v_blocks_listing" ALTER COLUMN "sort" SET DATA TYPE "public"."enum__pages_v_blocks_listing_sort" USING "sort"::"public"."enum__pages_v_blocks_listing_sort";
  ALTER TABLE "_pages_v_blocks_carousel" ALTER COLUMN "sort" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_carousel" ALTER COLUMN "sort" SET DEFAULT 'newest'::text;
  DROP TYPE "public"."enum__pages_v_blocks_carousel_sort";
  CREATE TYPE "public"."enum__pages_v_blocks_carousel_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  ALTER TABLE "_pages_v_blocks_carousel" ALTER COLUMN "sort" SET DEFAULT 'newest'::"public"."enum__pages_v_blocks_carousel_sort";
  ALTER TABLE "_pages_v_blocks_carousel" ALTER COLUMN "sort" SET DATA TYPE "public"."enum__pages_v_blocks_carousel_sort" USING "sort"::"public"."enum__pages_v_blocks_carousel_sort";
  ALTER TABLE "posts_blocks_listing" ALTER COLUMN "sort" SET DATA TYPE text;
  ALTER TABLE "posts_blocks_listing" ALTER COLUMN "sort" SET DEFAULT 'newest'::text;
  DROP TYPE "public"."enum_posts_blocks_listing_sort";
  CREATE TYPE "public"."enum_posts_blocks_listing_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  ALTER TABLE "posts_blocks_listing" ALTER COLUMN "sort" SET DEFAULT 'newest'::"public"."enum_posts_blocks_listing_sort";
  ALTER TABLE "posts_blocks_listing" ALTER COLUMN "sort" SET DATA TYPE "public"."enum_posts_blocks_listing_sort" USING "sort"::"public"."enum_posts_blocks_listing_sort";
  ALTER TABLE "posts_blocks_carousel" ALTER COLUMN "sort" SET DATA TYPE text;
  ALTER TABLE "posts_blocks_carousel" ALTER COLUMN "sort" SET DEFAULT 'newest'::text;
  DROP TYPE "public"."enum_posts_blocks_carousel_sort";
  CREATE TYPE "public"."enum_posts_blocks_carousel_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  ALTER TABLE "posts_blocks_carousel" ALTER COLUMN "sort" SET DEFAULT 'newest'::"public"."enum_posts_blocks_carousel_sort";
  ALTER TABLE "posts_blocks_carousel" ALTER COLUMN "sort" SET DATA TYPE "public"."enum_posts_blocks_carousel_sort" USING "sort"::"public"."enum_posts_blocks_carousel_sort";
  ALTER TABLE "_posts_v_blocks_listing" ALTER COLUMN "sort" SET DATA TYPE text;
  ALTER TABLE "_posts_v_blocks_listing" ALTER COLUMN "sort" SET DEFAULT 'newest'::text;
  DROP TYPE "public"."enum__posts_v_blocks_listing_sort";
  CREATE TYPE "public"."enum__posts_v_blocks_listing_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  ALTER TABLE "_posts_v_blocks_listing" ALTER COLUMN "sort" SET DEFAULT 'newest'::"public"."enum__posts_v_blocks_listing_sort";
  ALTER TABLE "_posts_v_blocks_listing" ALTER COLUMN "sort" SET DATA TYPE "public"."enum__posts_v_blocks_listing_sort" USING "sort"::"public"."enum__posts_v_blocks_listing_sort";
  ALTER TABLE "_posts_v_blocks_carousel" ALTER COLUMN "sort" SET DATA TYPE text;
  ALTER TABLE "_posts_v_blocks_carousel" ALTER COLUMN "sort" SET DEFAULT 'newest'::text;
  DROP TYPE "public"."enum__posts_v_blocks_carousel_sort";
  CREATE TYPE "public"."enum__posts_v_blocks_carousel_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  ALTER TABLE "_posts_v_blocks_carousel" ALTER COLUMN "sort" SET DEFAULT 'newest'::"public"."enum__posts_v_blocks_carousel_sort";
  ALTER TABLE "_posts_v_blocks_carousel" ALTER COLUMN "sort" SET DATA TYPE "public"."enum__posts_v_blocks_carousel_sort" USING "sort"::"public"."enum__posts_v_blocks_carousel_sort";
  ALTER TABLE "events_blocks_listing" ALTER COLUMN "sort" SET DATA TYPE text;
  ALTER TABLE "events_blocks_listing" ALTER COLUMN "sort" SET DEFAULT 'newest'::text;
  DROP TYPE "public"."enum_events_blocks_listing_sort";
  CREATE TYPE "public"."enum_events_blocks_listing_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  ALTER TABLE "events_blocks_listing" ALTER COLUMN "sort" SET DEFAULT 'newest'::"public"."enum_events_blocks_listing_sort";
  ALTER TABLE "events_blocks_listing" ALTER COLUMN "sort" SET DATA TYPE "public"."enum_events_blocks_listing_sort" USING "sort"::"public"."enum_events_blocks_listing_sort";
  ALTER TABLE "events_blocks_carousel" ALTER COLUMN "sort" SET DATA TYPE text;
  ALTER TABLE "events_blocks_carousel" ALTER COLUMN "sort" SET DEFAULT 'newest'::text;
  DROP TYPE "public"."enum_events_blocks_carousel_sort";
  CREATE TYPE "public"."enum_events_blocks_carousel_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  ALTER TABLE "events_blocks_carousel" ALTER COLUMN "sort" SET DEFAULT 'newest'::"public"."enum_events_blocks_carousel_sort";
  ALTER TABLE "events_blocks_carousel" ALTER COLUMN "sort" SET DATA TYPE "public"."enum_events_blocks_carousel_sort" USING "sort"::"public"."enum_events_blocks_carousel_sort";
  ALTER TABLE "_events_v_blocks_listing" ALTER COLUMN "sort" SET DATA TYPE text;
  ALTER TABLE "_events_v_blocks_listing" ALTER COLUMN "sort" SET DEFAULT 'newest'::text;
  DROP TYPE "public"."enum__events_v_blocks_listing_sort";
  CREATE TYPE "public"."enum__events_v_blocks_listing_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  ALTER TABLE "_events_v_blocks_listing" ALTER COLUMN "sort" SET DEFAULT 'newest'::"public"."enum__events_v_blocks_listing_sort";
  ALTER TABLE "_events_v_blocks_listing" ALTER COLUMN "sort" SET DATA TYPE "public"."enum__events_v_blocks_listing_sort" USING "sort"::"public"."enum__events_v_blocks_listing_sort";
  ALTER TABLE "_events_v_blocks_carousel" ALTER COLUMN "sort" SET DATA TYPE text;
  ALTER TABLE "_events_v_blocks_carousel" ALTER COLUMN "sort" SET DEFAULT 'newest'::text;
  DROP TYPE "public"."enum__events_v_blocks_carousel_sort";
  CREATE TYPE "public"."enum__events_v_blocks_carousel_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  ALTER TABLE "_events_v_blocks_carousel" ALTER COLUMN "sort" SET DEFAULT 'newest'::"public"."enum__events_v_blocks_carousel_sort";
  ALTER TABLE "_events_v_blocks_carousel" ALTER COLUMN "sort" SET DATA TYPE "public"."enum__events_v_blocks_carousel_sort" USING "sort"::"public"."enum__events_v_blocks_carousel_sort";
  ALTER TABLE "event_cycles_blocks_listing" ALTER COLUMN "sort" SET DATA TYPE text;
  ALTER TABLE "event_cycles_blocks_listing" ALTER COLUMN "sort" SET DEFAULT 'newest'::text;
  DROP TYPE "public"."enum_event_cycles_blocks_listing_sort";
  CREATE TYPE "public"."enum_event_cycles_blocks_listing_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  ALTER TABLE "event_cycles_blocks_listing" ALTER COLUMN "sort" SET DEFAULT 'newest'::"public"."enum_event_cycles_blocks_listing_sort";
  ALTER TABLE "event_cycles_blocks_listing" ALTER COLUMN "sort" SET DATA TYPE "public"."enum_event_cycles_blocks_listing_sort" USING "sort"::"public"."enum_event_cycles_blocks_listing_sort";
  ALTER TABLE "event_cycles_blocks_carousel" ALTER COLUMN "sort" SET DATA TYPE text;
  ALTER TABLE "event_cycles_blocks_carousel" ALTER COLUMN "sort" SET DEFAULT 'newest'::text;
  DROP TYPE "public"."enum_event_cycles_blocks_carousel_sort";
  CREATE TYPE "public"."enum_event_cycles_blocks_carousel_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  ALTER TABLE "event_cycles_blocks_carousel" ALTER COLUMN "sort" SET DEFAULT 'newest'::"public"."enum_event_cycles_blocks_carousel_sort";
  ALTER TABLE "event_cycles_blocks_carousel" ALTER COLUMN "sort" SET DATA TYPE "public"."enum_event_cycles_blocks_carousel_sort" USING "sort"::"public"."enum_event_cycles_blocks_carousel_sort";
  ALTER TABLE "_event_cycles_v_blocks_listing" ALTER COLUMN "sort" SET DATA TYPE text;
  ALTER TABLE "_event_cycles_v_blocks_listing" ALTER COLUMN "sort" SET DEFAULT 'newest'::text;
  DROP TYPE "public"."enum__event_cycles_v_blocks_listing_sort";
  CREATE TYPE "public"."enum__event_cycles_v_blocks_listing_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  ALTER TABLE "_event_cycles_v_blocks_listing" ALTER COLUMN "sort" SET DEFAULT 'newest'::"public"."enum__event_cycles_v_blocks_listing_sort";
  ALTER TABLE "_event_cycles_v_blocks_listing" ALTER COLUMN "sort" SET DATA TYPE "public"."enum__event_cycles_v_blocks_listing_sort" USING "sort"::"public"."enum__event_cycles_v_blocks_listing_sort";
  ALTER TABLE "_event_cycles_v_blocks_carousel" ALTER COLUMN "sort" SET DATA TYPE text;
  ALTER TABLE "_event_cycles_v_blocks_carousel" ALTER COLUMN "sort" SET DEFAULT 'newest'::text;
  DROP TYPE "public"."enum__event_cycles_v_blocks_carousel_sort";
  CREATE TYPE "public"."enum__event_cycles_v_blocks_carousel_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  ALTER TABLE "_event_cycles_v_blocks_carousel" ALTER COLUMN "sort" SET DEFAULT 'newest'::"public"."enum__event_cycles_v_blocks_carousel_sort";
  ALTER TABLE "_event_cycles_v_blocks_carousel" ALTER COLUMN "sort" SET DATA TYPE "public"."enum__event_cycles_v_blocks_carousel_sort" USING "sort"::"public"."enum__event_cycles_v_blocks_carousel_sort";
  ALTER TABLE "partners_blocks_listing" ALTER COLUMN "sort" SET DATA TYPE text;
  ALTER TABLE "partners_blocks_listing" ALTER COLUMN "sort" SET DEFAULT 'newest'::text;
  DROP TYPE "public"."enum_partners_blocks_listing_sort";
  CREATE TYPE "public"."enum_partners_blocks_listing_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  ALTER TABLE "partners_blocks_listing" ALTER COLUMN "sort" SET DEFAULT 'newest'::"public"."enum_partners_blocks_listing_sort";
  ALTER TABLE "partners_blocks_listing" ALTER COLUMN "sort" SET DATA TYPE "public"."enum_partners_blocks_listing_sort" USING "sort"::"public"."enum_partners_blocks_listing_sort";
  ALTER TABLE "partners_blocks_carousel" ALTER COLUMN "sort" SET DATA TYPE text;
  ALTER TABLE "partners_blocks_carousel" ALTER COLUMN "sort" SET DEFAULT 'newest'::text;
  DROP TYPE "public"."enum_partners_blocks_carousel_sort";
  CREATE TYPE "public"."enum_partners_blocks_carousel_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  ALTER TABLE "partners_blocks_carousel" ALTER COLUMN "sort" SET DEFAULT 'newest'::"public"."enum_partners_blocks_carousel_sort";
  ALTER TABLE "partners_blocks_carousel" ALTER COLUMN "sort" SET DATA TYPE "public"."enum_partners_blocks_carousel_sort" USING "sort"::"public"."enum_partners_blocks_carousel_sort";
  ALTER TABLE "_partners_v_blocks_listing" ALTER COLUMN "sort" SET DATA TYPE text;
  ALTER TABLE "_partners_v_blocks_listing" ALTER COLUMN "sort" SET DEFAULT 'newest'::text;
  DROP TYPE "public"."enum__partners_v_blocks_listing_sort";
  CREATE TYPE "public"."enum__partners_v_blocks_listing_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  ALTER TABLE "_partners_v_blocks_listing" ALTER COLUMN "sort" SET DEFAULT 'newest'::"public"."enum__partners_v_blocks_listing_sort";
  ALTER TABLE "_partners_v_blocks_listing" ALTER COLUMN "sort" SET DATA TYPE "public"."enum__partners_v_blocks_listing_sort" USING "sort"::"public"."enum__partners_v_blocks_listing_sort";
  ALTER TABLE "_partners_v_blocks_carousel" ALTER COLUMN "sort" SET DATA TYPE text;
  ALTER TABLE "_partners_v_blocks_carousel" ALTER COLUMN "sort" SET DEFAULT 'newest'::text;
  DROP TYPE "public"."enum__partners_v_blocks_carousel_sort";
  CREATE TYPE "public"."enum__partners_v_blocks_carousel_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  ALTER TABLE "_partners_v_blocks_carousel" ALTER COLUMN "sort" SET DEFAULT 'newest'::"public"."enum__partners_v_blocks_carousel_sort";
  ALTER TABLE "_partners_v_blocks_carousel" ALTER COLUMN "sort" SET DATA TYPE "public"."enum__partners_v_blocks_carousel_sort" USING "sort"::"public"."enum__partners_v_blocks_carousel_sort";
  ALTER TABLE "homepage_sections_blocks_listing" ALTER COLUMN "sort" SET DATA TYPE text;
  ALTER TABLE "homepage_sections_blocks_listing" ALTER COLUMN "sort" SET DEFAULT 'newest'::text;
  DROP TYPE "public"."enum_homepage_sections_blocks_listing_sort";
  CREATE TYPE "public"."enum_homepage_sections_blocks_listing_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  ALTER TABLE "homepage_sections_blocks_listing" ALTER COLUMN "sort" SET DEFAULT 'newest'::"public"."enum_homepage_sections_blocks_listing_sort";
  ALTER TABLE "homepage_sections_blocks_listing" ALTER COLUMN "sort" SET DATA TYPE "public"."enum_homepage_sections_blocks_listing_sort" USING "sort"::"public"."enum_homepage_sections_blocks_listing_sort";
  ALTER TABLE "homepage_sections_blocks_carousel" ALTER COLUMN "sort" SET DATA TYPE text;
  ALTER TABLE "homepage_sections_blocks_carousel" ALTER COLUMN "sort" SET DEFAULT 'newest'::text;
  DROP TYPE "public"."enum_homepage_sections_blocks_carousel_sort";
  CREATE TYPE "public"."enum_homepage_sections_blocks_carousel_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  ALTER TABLE "homepage_sections_blocks_carousel" ALTER COLUMN "sort" SET DEFAULT 'newest'::"public"."enum_homepage_sections_blocks_carousel_sort";
  ALTER TABLE "homepage_sections_blocks_carousel" ALTER COLUMN "sort" SET DATA TYPE "public"."enum_homepage_sections_blocks_carousel_sort" USING "sort"::"public"."enum_homepage_sections_blocks_carousel_sort";
  DROP INDEX "content_listing_items_sort_date_idx";
  DROP INDEX "source_sortDate_idx";
  ALTER TABLE "content_listing_items" ADD COLUMN "has_significant_date" boolean DEFAULT false;
  UPDATE "content_listing_items"
  SET "has_significant_date" = "significant_date" IS NOT NULL;
  ALTER TABLE "pages_blocks_listing" ADD COLUMN "max_age_days" numeric DEFAULT 0;
  ALTER TABLE "pages_blocks_carousel" ADD COLUMN "max_age_days" numeric DEFAULT 0;
  ALTER TABLE "_pages_v_blocks_listing" ADD COLUMN "max_age_days" numeric DEFAULT 0;
  ALTER TABLE "_pages_v_blocks_carousel" ADD COLUMN "max_age_days" numeric DEFAULT 0;
  ALTER TABLE "posts_blocks_listing" ADD COLUMN "max_age_days" numeric DEFAULT 0;
  ALTER TABLE "posts_blocks_carousel" ADD COLUMN "max_age_days" numeric DEFAULT 0;
  ALTER TABLE "_posts_v_blocks_listing" ADD COLUMN "max_age_days" numeric DEFAULT 0;
  ALTER TABLE "_posts_v_blocks_carousel" ADD COLUMN "max_age_days" numeric DEFAULT 0;
  ALTER TABLE "events_blocks_listing" ADD COLUMN "max_age_days" numeric DEFAULT 0;
  ALTER TABLE "events_blocks_carousel" ADD COLUMN "max_age_days" numeric DEFAULT 0;
  ALTER TABLE "_events_v_blocks_listing" ADD COLUMN "max_age_days" numeric DEFAULT 0;
  ALTER TABLE "_events_v_blocks_carousel" ADD COLUMN "max_age_days" numeric DEFAULT 0;
  ALTER TABLE "event_cycles_blocks_listing" ADD COLUMN "max_age_days" numeric DEFAULT 0;
  ALTER TABLE "event_cycles_blocks_carousel" ADD COLUMN "max_age_days" numeric DEFAULT 0;
  ALTER TABLE "_event_cycles_v_blocks_listing" ADD COLUMN "max_age_days" numeric DEFAULT 0;
  ALTER TABLE "_event_cycles_v_blocks_carousel" ADD COLUMN "max_age_days" numeric DEFAULT 0;
  ALTER TABLE "partners_blocks_listing" ADD COLUMN "max_age_days" numeric DEFAULT 0;
  ALTER TABLE "partners_blocks_carousel" ADD COLUMN "max_age_days" numeric DEFAULT 0;
  ALTER TABLE "_partners_v_blocks_listing" ADD COLUMN "max_age_days" numeric DEFAULT 0;
  ALTER TABLE "_partners_v_blocks_carousel" ADD COLUMN "max_age_days" numeric DEFAULT 0;
  ALTER TABLE "homepage_sections_blocks_listing" ADD COLUMN "max_age_days" numeric DEFAULT 0;
  ALTER TABLE "homepage_sections_blocks_carousel" ADD COLUMN "max_age_days" numeric DEFAULT 0;
  CREATE INDEX "content_listing_items_has_significant_date_idx" ON "content_listing_items" USING btree ("has_significant_date");
  CREATE INDEX "content_listing_items_significant_date_idx" ON "content_listing_items" USING btree ("significant_date");
  CREATE INDEX "source_significantDate_idx" ON "content_listing_items" USING btree ("source","significant_date");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_pages_blocks_listing_sort" ADD VALUE 'eventDateAscending';
  ALTER TYPE "public"."enum_pages_blocks_carousel_sort" ADD VALUE 'eventDateAscending';
  ALTER TYPE "public"."enum__pages_v_blocks_listing_sort" ADD VALUE 'eventDateAscending';
  ALTER TYPE "public"."enum__pages_v_blocks_carousel_sort" ADD VALUE 'eventDateAscending';
  ALTER TYPE "public"."enum_posts_blocks_listing_sort" ADD VALUE 'eventDateAscending';
  ALTER TYPE "public"."enum_posts_blocks_carousel_sort" ADD VALUE 'eventDateAscending';
  ALTER TYPE "public"."enum__posts_v_blocks_listing_sort" ADD VALUE 'eventDateAscending';
  ALTER TYPE "public"."enum__posts_v_blocks_carousel_sort" ADD VALUE 'eventDateAscending';
  ALTER TYPE "public"."enum_events_blocks_listing_sort" ADD VALUE 'eventDateAscending';
  ALTER TYPE "public"."enum_events_blocks_carousel_sort" ADD VALUE 'eventDateAscending';
  ALTER TYPE "public"."enum__events_v_blocks_listing_sort" ADD VALUE 'eventDateAscending';
  ALTER TYPE "public"."enum__events_v_blocks_carousel_sort" ADD VALUE 'eventDateAscending';
  ALTER TYPE "public"."enum_event_cycles_blocks_listing_sort" ADD VALUE 'eventDateAscending';
  ALTER TYPE "public"."enum_event_cycles_blocks_carousel_sort" ADD VALUE 'eventDateAscending';
  ALTER TYPE "public"."enum__event_cycles_v_blocks_listing_sort" ADD VALUE 'eventDateAscending';
  ALTER TYPE "public"."enum__event_cycles_v_blocks_carousel_sort" ADD VALUE 'eventDateAscending';
  ALTER TYPE "public"."enum_partners_blocks_listing_sort" ADD VALUE 'eventDateAscending';
  ALTER TYPE "public"."enum_partners_blocks_carousel_sort" ADD VALUE 'eventDateAscending';
  ALTER TYPE "public"."enum__partners_v_blocks_listing_sort" ADD VALUE 'eventDateAscending';
  ALTER TYPE "public"."enum__partners_v_blocks_carousel_sort" ADD VALUE 'eventDateAscending';
  ALTER TYPE "public"."enum_homepage_sections_blocks_listing_sort" ADD VALUE 'eventDateAscending';
  ALTER TYPE "public"."enum_homepage_sections_blocks_carousel_sort" ADD VALUE 'eventDateAscending';
  UPDATE "content_listing_items" AS listing_item
  SET "significant_date" = CASE listing_item."source"::text
    WHEN 'posts' THEN (
      SELECT COALESCE(post."published_at", post."created_at") FROM "posts" AS post
      WHERE post."id" = listing_item."source_document_id"
    )
    WHEN 'events' THEN (
      SELECT COALESCE(event."start_at", event."published_at", event."created_at")
      FROM "events" AS event
      WHERE event."id" = listing_item."source_document_id"
    )
    WHEN 'documents' THEN (
      SELECT COALESCE(document."document_date", document."published_at", document."created_at")
      FROM "documents" AS document
      WHERE document."id" = listing_item."source_document_id"
    )
    WHEN 'pages' THEN (
      SELECT COALESCE(page."published_at", page."created_at") FROM "pages" AS page
      WHERE page."id" = listing_item."source_document_id"
    )
    WHEN 'event-cycles' THEN (
      SELECT COALESCE(event_cycle."published_at", event_cycle."created_at")
      FROM "event_cycles" AS event_cycle
      WHERE event_cycle."id" = listing_item."source_document_id"
    )
  END;
  ALTER TABLE "content_listing_items" ALTER COLUMN "significant_date" SET NOT NULL;
  ALTER TABLE "content_listing_items" RENAME COLUMN "significant_date" TO "sort_date";
  DROP INDEX "content_listing_items_has_significant_date_idx";
  DROP INDEX "content_listing_items_significant_date_idx";
  DROP INDEX "source_significantDate_idx";
  CREATE INDEX "content_listing_items_sort_date_idx" ON "content_listing_items" USING btree ("sort_date");
  CREATE INDEX "source_sortDate_idx" ON "content_listing_items" USING btree ("source","sort_date");
  ALTER TABLE "content_listing_items" DROP COLUMN "has_significant_date";
  ALTER TABLE "pages_blocks_listing" DROP COLUMN "max_age_days";
  ALTER TABLE "pages_blocks_carousel" DROP COLUMN "max_age_days";
  ALTER TABLE "_pages_v_blocks_listing" DROP COLUMN "max_age_days";
  ALTER TABLE "_pages_v_blocks_carousel" DROP COLUMN "max_age_days";
  ALTER TABLE "posts_blocks_listing" DROP COLUMN "max_age_days";
  ALTER TABLE "posts_blocks_carousel" DROP COLUMN "max_age_days";
  ALTER TABLE "_posts_v_blocks_listing" DROP COLUMN "max_age_days";
  ALTER TABLE "_posts_v_blocks_carousel" DROP COLUMN "max_age_days";
  ALTER TABLE "events_blocks_listing" DROP COLUMN "max_age_days";
  ALTER TABLE "events_blocks_carousel" DROP COLUMN "max_age_days";
  ALTER TABLE "_events_v_blocks_listing" DROP COLUMN "max_age_days";
  ALTER TABLE "_events_v_blocks_carousel" DROP COLUMN "max_age_days";
  ALTER TABLE "event_cycles_blocks_listing" DROP COLUMN "max_age_days";
  ALTER TABLE "event_cycles_blocks_carousel" DROP COLUMN "max_age_days";
  ALTER TABLE "_event_cycles_v_blocks_listing" DROP COLUMN "max_age_days";
  ALTER TABLE "_event_cycles_v_blocks_carousel" DROP COLUMN "max_age_days";
  ALTER TABLE "partners_blocks_listing" DROP COLUMN "max_age_days";
  ALTER TABLE "partners_blocks_carousel" DROP COLUMN "max_age_days";
  ALTER TABLE "_partners_v_blocks_listing" DROP COLUMN "max_age_days";
  ALTER TABLE "_partners_v_blocks_carousel" DROP COLUMN "max_age_days";
  ALTER TABLE "homepage_sections_blocks_listing" DROP COLUMN "max_age_days";
  ALTER TABLE "homepage_sections_blocks_carousel" DROP COLUMN "max_age_days";`)
}
