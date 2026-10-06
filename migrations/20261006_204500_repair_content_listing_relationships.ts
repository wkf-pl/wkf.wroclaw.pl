import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "content_listing_items" AS "listing"
    SET "hero_image_id" = NULL
    WHERE "listing"."hero_image_id" IS NOT NULL
      AND (
        ("listing"."source" = 'pages' AND EXISTS (
          SELECT 1 FROM "pages" AS "source"
          WHERE "source"."id" = "listing"."source_document_id"
            AND "source"."hero_image_id" IS NULL
        ))
        OR ("listing"."source" = 'posts' AND EXISTS (
          SELECT 1 FROM "posts" AS "source"
          WHERE "source"."id" = "listing"."source_document_id"
            AND "source"."hero_image_id" IS NULL
        ))
        OR ("listing"."source" = 'events' AND EXISTS (
          SELECT 1 FROM "events" AS "source"
          WHERE "source"."id" = "listing"."source_document_id"
            AND "source"."hero_image_id" IS NULL
        ))
        OR ("listing"."source" = 'event-cycles' AND EXISTS (
          SELECT 1 FROM "event_cycles" AS "source"
          WHERE "source"."id" = "listing"."source_document_id"
            AND "source"."hero_image_id" IS NULL
        ))
      );

    UPDATE "content_listing_items" AS "listing"
    SET "category_id" = NULL
    WHERE "listing"."category_id" IS NOT NULL
      AND (
        ("listing"."source" = 'pages' AND EXISTS (
          SELECT 1 FROM "pages" AS "source"
          WHERE "source"."id" = "listing"."source_document_id"
            AND "source"."category_id" IS NULL
        ))
        OR ("listing"."source" = 'posts' AND EXISTS (
          SELECT 1 FROM "posts" AS "source"
          WHERE "source"."id" = "listing"."source_document_id"
            AND "source"."category_id" IS NULL
        ))
        OR ("listing"."source" = 'events' AND EXISTS (
          SELECT 1 FROM "events" AS "source"
          WHERE "source"."id" = "listing"."source_document_id"
            AND "source"."category_id" IS NULL
        ))
        OR ("listing"."source" = 'event-cycles' AND EXISTS (
          SELECT 1 FROM "event_cycles" AS "source"
          WHERE "source"."id" = "listing"."source_document_id"
            AND "source"."category_id" IS NULL
        ))
      );

    UPDATE "content_listing_items" AS "listing"
    SET "parent_page_id" = NULL
    WHERE "listing"."source" = 'pages'
      AND "listing"."parent_page_id" IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM "pages" AS "source"
        WHERE "source"."id" = "listing"."source_document_id"
          AND "source"."parent_id" IS NULL
      );

    UPDATE "content_listing_items" AS "listing"
    SET "event_cycle_id" = NULL
    WHERE "listing"."source" = 'events'
      AND "listing"."event_cycle_id" IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM "events" AS "source"
        WHERE "source"."id" = "listing"."source_document_id"
          AND "source"."cycle_id" IS NULL
      );
  `)
}

export function down(_arguments: MigrateDownArgs): Promise<void> {
  return Promise.resolve()
}
