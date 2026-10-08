import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  DO $$
  DECLARE
    block_table record;
  BEGIN
    FOR block_table IN
      SELECT DISTINCT "table_name"
      FROM "information_schema"."columns"
      WHERE "table_schema" = 'public'
        AND "table_name" LIKE 'homepage_sections_blocks_%'
        AND "column_name" = '_path'
    LOOP
      EXECUTE format(
        'UPDATE %I AS block
         SET "_order" = block."_order" + 5 + CASE WHEN section."events_content" IS NULL THEN 0 ELSE 1 END
         FROM "homepage_sections" AS section
         WHERE block."_parent_id" = section."id" AND block."_path" = ''layout''',
        block_table."table_name"
      );
    END LOOP;
  END $$;

  INSERT INTO "homepage_sections_blocks_heading" (
    "_order", "_parent_id", "_path", "id", "heading", "heading_level"
  )
  SELECT 1, "id", 'layout', 'homepage-events-heading-' || "id", "events_title", 'h2'
  FROM "homepage_sections";

  INSERT INTO "homepage_sections_blocks_rich_text" (
    "_order", "_parent_id", "_path", "id", "content"
  )
  SELECT 2, "id", 'layout', 'homepage-events-content-' || "id", "events_content"
  FROM "homepage_sections"
  WHERE "events_content" IS NOT NULL;

  INSERT INTO "homepage_sections_blocks_carousel" (
    "_order", "_parent_id", "_path", "id", "selection_mode", "event_time_filter",
    "sort", "slide_limit", "parent_filter"
  )
  SELECT
    2 + CASE WHEN "events_content" IS NULL THEN 0 ELSE 1 END,
    "id",
    'layout',
    'homepage-events-carousel-' || "id",
    'filters',
    'upcoming',
    'eventDateAscending',
    COALESCE("event_slide_limit", 6),
    'none'
  FROM "homepage_sections";

  INSERT INTO "homepage_sections_blocks_carousel_sources" ("order", "parent_id", "value")
  SELECT 1, 'homepage-events-carousel-' || "id", 'events'
  FROM "homepage_sections";

  INSERT INTO "homepage_sections_blocks_content_calendar" (
    "_order", "_parent_id", "_path", "id"
  )
  SELECT
    3 + CASE WHEN "events_content" IS NULL THEN 0 ELSE 1 END,
    "id",
    'layout',
    'homepage-events-calendar-' || "id"
  FROM "homepage_sections";

  INSERT INTO "homepage_sections_blocks_content_calendar_sources" (
    "order", "parent_id", "value"
  )
  SELECT 1, 'homepage-events-calendar-' || "id", 'events'
  FROM "homepage_sections";

  INSERT INTO "homepage_sections_blocks_heading" (
    "_order", "_parent_id", "_path", "id", "heading", "heading_level"
  )
  SELECT
    4 + CASE WHEN "events_content" IS NULL THEN 0 ELSE 1 END,
    "id",
    'layout',
    'homepage-news-heading-' || "id",
    "news_title",
    'h2'
  FROM "homepage_sections";

  INSERT INTO "homepage_sections_blocks_listing" (
    "_order", "_parent_id", "_path", "id", "selection_mode", "sort", "view",
    "event_time_filter", "page_size", "pagination", "parent_filter"
  )
  SELECT
    5 + CASE WHEN "events_content" IS NULL THEN 0 ELSE 1 END,
    "id",
    'layout',
    'homepage-news-listing-' || "id",
    'filters',
    'newest',
    'tiles',
    'all',
    COALESCE("post_count"::text::numeric, 2),
    false,
    'none'
  FROM "homepage_sections";

  INSERT INTO "homepage_sections_blocks_listing_sources" ("order", "parent_id", "value")
  SELECT 1, 'homepage-news-listing-' || "id", 'posts'
  FROM "homepage_sections";

  ALTER TABLE "homepage_sections" DROP COLUMN "events_title";
  ALTER TABLE "homepage_sections" DROP COLUMN "events_content";
  ALTER TABLE "homepage_sections" DROP COLUMN "event_window_weeks";
  ALTER TABLE "homepage_sections" DROP COLUMN "event_slide_limit";
  ALTER TABLE "homepage_sections" DROP COLUMN "news_title";
  ALTER TABLE "homepage_sections" DROP COLUMN "post_count";
  DROP TYPE "public"."enum_homepage_sections_post_count";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  CREATE TYPE "public"."enum_homepage_sections_post_count" AS ENUM('2', '5', '8');
  ALTER TABLE "homepage_sections" ADD COLUMN "events_title" varchar DEFAULT 'Wydarzenia' NOT NULL;
  ALTER TABLE "homepage_sections" ADD COLUMN "events_content" jsonb;
  ALTER TABLE "homepage_sections" ADD COLUMN "event_window_weeks" numeric DEFAULT 4;
  ALTER TABLE "homepage_sections" ADD COLUMN "event_slide_limit" numeric DEFAULT 6;
  ALTER TABLE "homepage_sections" ADD COLUMN "news_title" varchar DEFAULT 'Aktualności' NOT NULL;
  ALTER TABLE "homepage_sections" ADD COLUMN "post_count" "enum_homepage_sections_post_count" DEFAULT '2';

  UPDATE "homepage_sections" AS section
  SET
    "events_title" = COALESCE((
      SELECT "heading"
      FROM "homepage_sections_blocks_heading"
      WHERE "id" = 'homepage-events-heading-' || section."id"
    ), 'Wydarzenia'),
    "events_content" = (
      SELECT "content"
      FROM "homepage_sections_blocks_rich_text"
      WHERE "id" = 'homepage-events-content-' || section."id"
    ),
    "event_slide_limit" = COALESCE((
      SELECT "slide_limit"
      FROM "homepage_sections_blocks_carousel"
      WHERE "id" = 'homepage-events-carousel-' || section."id"
    ), 6),
    "news_title" = COALESCE((
      SELECT "heading"
      FROM "homepage_sections_blocks_heading"
      WHERE "id" = 'homepage-news-heading-' || section."id"
    ), 'Aktualności'),
    "post_count" = CASE (
      SELECT "page_size"
      FROM "homepage_sections_blocks_listing"
      WHERE "id" = 'homepage-news-listing-' || section."id"
    )
      WHEN 5 THEN '5'::"enum_homepage_sections_post_count"
      WHEN 8 THEN '8'::"enum_homepage_sections_post_count"
      ELSE '2'::"enum_homepage_sections_post_count"
    END;

  DELETE FROM "homepage_sections_blocks_heading" AS block
  USING "homepage_sections" AS section
  WHERE block."id" IN (
    'homepage-events-heading-' || section."id",
    'homepage-news-heading-' || section."id"
  );
  DELETE FROM "homepage_sections_blocks_rich_text" AS block
  USING "homepage_sections" AS section
  WHERE block."id" = 'homepage-events-content-' || section."id";
  DELETE FROM "homepage_sections_blocks_carousel" AS block
  USING "homepage_sections" AS section
  WHERE block."id" = 'homepage-events-carousel-' || section."id";
  DELETE FROM "homepage_sections_blocks_content_calendar" AS block
  USING "homepage_sections" AS section
  WHERE block."id" = 'homepage-events-calendar-' || section."id";
  DELETE FROM "homepage_sections_blocks_listing" AS block
  USING "homepage_sections" AS section
  WHERE block."id" = 'homepage-news-listing-' || section."id";

  DO $$
  DECLARE
    block_table record;
  BEGIN
    FOR block_table IN
      SELECT DISTINCT "table_name"
      FROM "information_schema"."columns"
      WHERE "table_schema" = 'public'
        AND "table_name" LIKE 'homepage_sections_blocks_%'
        AND "column_name" = '_path'
    LOOP
      EXECUTE format(
        'UPDATE %I AS block
         SET "_order" = block."_order" - 5 - CASE WHEN section."events_content" IS NULL THEN 0 ELSE 1 END
         FROM "homepage_sections" AS section
         WHERE block."_parent_id" = section."id" AND block."_path" = ''layout''',
        block_table."table_name"
      );
    END LOOP;
  END $$;`)
}
