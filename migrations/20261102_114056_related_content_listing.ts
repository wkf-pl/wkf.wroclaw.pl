import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

import { syncContentListingItem } from '../src/modules/content/content-listing-index'
import { allListingSources } from '../src/modules/content/listing-conditions'

const relationPathMigrations = [
  {
    eventCyclesPath: 'relatedEventCycles',
    eventsPath: 'relatedEvents',
    relatedContentPath: 'relatedContent',
    table: 'posts_rels',
  },
  {
    eventCyclesPath: 'version.relatedEventCycles',
    eventsPath: 'version.relatedEvents',
    relatedContentPath: 'version.relatedContent',
    table: '_posts_v_rels',
  },
] as const

async function migratePostRelationsUp(db: MigrateUpArgs['db']): Promise<void> {
  for (const migration of relationPathMigrations) {
    await db.execute(
      sql.raw(`
        WITH ordered_relations AS (
          SELECT
            "id",
            ROW_NUMBER() OVER (
              PARTITION BY "parent_id"
              ORDER BY
                CASE "path" WHEN '${migration.eventsPath}' THEN 0 ELSE 1 END,
                "order",
                "id"
            ) - 1 AS "new_order"
          FROM "${migration.table}"
          WHERE "path" IN ('${migration.eventsPath}', '${migration.eventCyclesPath}')
        )
        UPDATE "${migration.table}" AS relations
        SET
          "order" = ordered_relations."new_order",
          "path" = '${migration.relatedContentPath}'
        FROM ordered_relations
        WHERE relations."id" = ordered_relations."id";
      `),
    )
  }
}

async function assertPostRelationsCanMigrateDown(db: MigrateDownArgs['db']): Promise<void> {
  for (const migration of relationPathMigrations) {
    const result = await db.execute(
      sql.raw(`
        SELECT "id"
        FROM "${migration.table}"
        WHERE "path" = '${migration.relatedContentPath}'
          AND "events_id" IS NULL
          AND "event_cycles_id" IS NULL
        LIMIT 1;
      `),
    )
    if (result.rows.length > 0) {
      throw new Error(
        `Cannot roll back related content: ${migration.table} contains targets unsupported by the legacy fields.`,
      )
    }
  }
}

async function assertListingConditionsCanMigrateDown(db: MigrateDownArgs['db']): Promise<void> {
  const conditionTables = [
    'pages_blocks_listing_conditions',
    '_pages_v_blocks_listing_conditions',
    'posts_blocks_listing_conditions',
    '_posts_v_blocks_listing_conditions',
    'events_blocks_listing_conditions',
    '_events_v_blocks_listing_conditions',
    'event_cycles_blocks_listing_conditions',
    '_event_cycles_v_blocks_listing_conditions',
    'partners_blocks_listing_conditions',
    '_partners_v_blocks_listing_conditions',
    'homepage_sections_blocks_listing_conditions',
    '_homepage_sections_v_blocks_listing_conditions',
  ]
  const result = await db.execute(
    sql.raw(
      conditionTables
        .map((table) => `SELECT 1 AS "match" FROM "${table}" WHERE "field" = 'relatedTo'`)
        .join('\nUNION ALL\n') + '\nLIMIT 1;',
    ),
  )
  if (result.rows.length > 0) {
    throw new Error(
      'Cannot roll back related content: at least one Listing uses the relatedTo condition.',
    )
  }
}

async function migratePostRelationsDown(db: MigrateDownArgs['db']): Promise<void> {
  for (const migration of relationPathMigrations) {
    await db.execute(
      sql.raw(`
        UPDATE "${migration.table}"
        SET "path" = CASE
          WHEN "events_id" IS NOT NULL THEN '${migration.eventsPath}'
          ELSE '${migration.eventCyclesPath}'
        END
        WHERE "path" = '${migration.relatedContentPath}';

        WITH ordered_relations AS (
          SELECT
            "id",
            ROW_NUMBER() OVER (
              PARTITION BY "parent_id", "path"
              ORDER BY "order", "id"
            ) - 1 AS "new_order"
          FROM "${migration.table}"
          WHERE "path" IN ('${migration.eventsPath}', '${migration.eventCyclesPath}')
        )
        UPDATE "${migration.table}" AS relations
        SET "order" = ordered_relations."new_order"
        FROM ordered_relations
        WHERE relations."id" = ordered_relations."id";
      `),
    )
  }
}

async function rebuildContentListingIndex({
  db,
  req,
}: Pick<MigrateUpArgs, 'db' | 'req'>): Promise<void> {
  req.context = {
    ...req.context,
    skipContentListingSync: true,
    skipPublicCacheInvalidation: true,
  }
  await db.execute(sql`
    UPDATE "content_listing_items"
    SET "source_updated_at" = '1970-01-01T00:00:00.000Z';
  `)
  const publishedDocuments = await db.execute(sql`
    SELECT 'pages' AS "source", "id" AS "source_document_id"
      FROM "pages" WHERE "_status" = 'published' AND "deleted_at" IS NULL
    UNION ALL
    SELECT 'posts', "id" FROM "posts"
      WHERE "_status" = 'published' AND "deleted_at" IS NULL
    UNION ALL
    SELECT 'events', "id" FROM "events"
      WHERE "_status" = 'published' AND "deleted_at" IS NULL
    UNION ALL
    SELECT 'event-cycles', "id" FROM "event_cycles"
      WHERE "_status" = 'published' AND "deleted_at" IS NULL
    UNION ALL
    SELECT 'documents', "id" FROM "documents"
      WHERE "_status" = 'published' AND "deleted_at" IS NULL
    UNION ALL
    SELECT 'partners', "id" FROM "partners"
      WHERE "_status" = 'published' AND "deleted_at" IS NULL
    UNION ALL
    SELECT 'member-profiles', "id" FROM "member_profiles"
      WHERE "_status" = 'published' AND "deleted_at" IS NULL
    UNION
    SELECT "source"::text, "source_document_id" FROM "content_listing_items"
    ORDER BY "source", "source_document_id";
  `)
  for (const row of publishedDocuments.rows) {
    const item = row as { source: string; source_document_id: number }
    const source = allListingSources.find((candidate) => candidate === item.source)
    if (source) await syncContentListingItem(req, source, item.source_document_id)
  }
  await db.execute(sql`
    ALTER TABLE "content_listing_items"
    ALTER COLUMN "related_target_search_index" DROP DEFAULT;
  `)
}

export async function up({ db, payload: _payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."related_mode" AS ENUM('current', 'selected');
  ALTER TYPE "public"."enum_pages_blocks_listing_conditions_field" ADD VALUE 'relatedTo' BEFORE 'significantDate';
  ALTER TYPE "public"."enum__pages_v_blocks_listing_conditions_field" ADD VALUE 'relatedTo' BEFORE 'significantDate';
  ALTER TYPE "public"."enum_posts_blocks_listing_conditions_field" ADD VALUE 'relatedTo' BEFORE 'significantDate';
  ALTER TYPE "public"."enum__posts_v_blocks_listing_conditions_field" ADD VALUE 'relatedTo' BEFORE 'significantDate';
  ALTER TYPE "public"."enum_events_blocks_listing_conditions_field" ADD VALUE 'relatedTo' BEFORE 'significantDate';
  ALTER TYPE "public"."enum__events_v_blocks_listing_conditions_field" ADD VALUE 'relatedTo' BEFORE 'significantDate';
  ALTER TYPE "public"."enum_event_cycles_blocks_listing_conditions_field" ADD VALUE 'relatedTo' BEFORE 'significantDate';
  ALTER TYPE "public"."enum__event_cycles_v_blocks_listing_conditions_field" ADD VALUE 'relatedTo' BEFORE 'significantDate';
  ALTER TYPE "public"."enum_partners_blocks_listing_conditions_field" ADD VALUE 'relatedTo' BEFORE 'significantDate';
  ALTER TYPE "public"."enum__partners_v_blocks_listing_conditions_field" ADD VALUE 'relatedTo' BEFORE 'significantDate';
  ALTER TYPE "public"."enum_homepage_sections_blocks_listing_conditions_field" ADD VALUE 'relatedTo' BEFORE 'significantDate';
  ALTER TYPE "public"."enum__homepage_sections_v_blocks_listing_conditions_field" ADD VALUE 'relatedTo' BEFORE 'significantDate';
  ALTER TABLE "content_listing_items" ADD COLUMN "related_target_search_index" varchar DEFAULT '|' NOT NULL;
  ALTER TABLE "content_listing_items_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "content_listing_items_rels" ADD COLUMN "posts_id" integer;
  ALTER TABLE "content_listing_items_rels" ADD COLUMN "events_id" integer;
  ALTER TABLE "content_listing_items_rels" ADD COLUMN "event_cycles_id" integer;
  ALTER TABLE "content_listing_items_rels" ADD COLUMN "documents_id" integer;
  ALTER TABLE "content_listing_items_rels" ADD COLUMN "partners_id" integer;
  ALTER TABLE "content_listing_items_rels" ADD COLUMN "member_profiles_id" integer;
  ALTER TABLE "pages_blocks_listing_conditions" ADD COLUMN "related_target_mode" "related_mode" DEFAULT 'current';
  ALTER TABLE "_pages_v_blocks_listing_conditions" ADD COLUMN "related_target_mode" "related_mode" DEFAULT 'current';
  ALTER TABLE "posts_blocks_listing_conditions" ADD COLUMN "related_target_mode" "related_mode" DEFAULT 'current';
  ALTER TABLE "_posts_v_blocks_listing_conditions" ADD COLUMN "related_target_mode" "related_mode" DEFAULT 'current';
  ALTER TABLE "events_blocks_listing_conditions" ADD COLUMN "related_target_mode" "related_mode" DEFAULT 'current';
  ALTER TABLE "_events_v_blocks_listing_conditions" ADD COLUMN "related_target_mode" "related_mode" DEFAULT 'current';
  ALTER TABLE "event_cycles_blocks_listing_conditions" ADD COLUMN "related_target_mode" "related_mode" DEFAULT 'current';
  ALTER TABLE "_event_cycles_v_blocks_listing_conditions" ADD COLUMN "related_target_mode" "related_mode" DEFAULT 'current';
  ALTER TABLE "partners_blocks_listing_conditions" ADD COLUMN "related_target_mode" "related_mode" DEFAULT 'current';
  ALTER TABLE "_partners_v_blocks_listing_conditions" ADD COLUMN "related_target_mode" "related_mode" DEFAULT 'current';
  ALTER TABLE "homepage_sections_blocks_listing_conditions" ADD COLUMN "related_target_mode" "related_mode" DEFAULT 'current';
  ALTER TABLE "_homepage_sections_v_blocks_listing_conditions" ADD COLUMN "related_target_mode" "related_mode" DEFAULT 'current';
  ALTER TABLE "content_listing_items_rels" ADD CONSTRAINT "content_listing_items_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_listing_items_rels" ADD CONSTRAINT "content_listing_items_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_listing_items_rels" ADD CONSTRAINT "content_listing_items_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_listing_items_rels" ADD CONSTRAINT "content_listing_items_rels_event_cycles_fk" FOREIGN KEY ("event_cycles_id") REFERENCES "public"."event_cycles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_listing_items_rels" ADD CONSTRAINT "content_listing_items_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_listing_items_rels" ADD CONSTRAINT "content_listing_items_rels_partners_fk" FOREIGN KEY ("partners_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_listing_items_rels" ADD CONSTRAINT "content_listing_items_rels_member_profiles_fk" FOREIGN KEY ("member_profiles_id") REFERENCES "public"."member_profiles"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "content_listing_items_rels_pages_id_idx" ON "content_listing_items_rels" USING btree ("pages_id");
  CREATE INDEX "content_listing_items_rels_posts_id_idx" ON "content_listing_items_rels" USING btree ("posts_id");
  CREATE INDEX "content_listing_items_rels_events_id_idx" ON "content_listing_items_rels" USING btree ("events_id");
  CREATE INDEX "content_listing_items_rels_event_cycles_id_idx" ON "content_listing_items_rels" USING btree ("event_cycles_id");
  CREATE INDEX "content_listing_items_rels_documents_id_idx" ON "content_listing_items_rels" USING btree ("documents_id");
  CREATE INDEX "content_listing_items_rels_partners_id_idx" ON "content_listing_items_rels" USING btree ("partners_id");
  CREATE INDEX "content_listing_items_rels_member_profiles_id_idx" ON "content_listing_items_rels" USING btree ("member_profiles_id");`)
  await migratePostRelationsUp(db)
  await rebuildContentListingIndex({ db, req })
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await assertPostRelationsCanMigrateDown(db)
  await assertListingConditionsCanMigrateDown(db)
  await migratePostRelationsDown(db)
  await db.execute(sql`
    DELETE FROM "content_listing_items_rels" WHERE "path" = 'relatedTargets';
  `)
  await db.execute(sql`
   ALTER TABLE "content_listing_items_rels" DROP CONSTRAINT "content_listing_items_rels_pages_fk";
  
  ALTER TABLE "content_listing_items_rels" DROP CONSTRAINT "content_listing_items_rels_posts_fk";
  
  ALTER TABLE "content_listing_items_rels" DROP CONSTRAINT "content_listing_items_rels_events_fk";
  
  ALTER TABLE "content_listing_items_rels" DROP CONSTRAINT "content_listing_items_rels_event_cycles_fk";
  
  ALTER TABLE "content_listing_items_rels" DROP CONSTRAINT "content_listing_items_rels_documents_fk";
  
  ALTER TABLE "content_listing_items_rels" DROP CONSTRAINT "content_listing_items_rels_partners_fk";
  
  ALTER TABLE "content_listing_items_rels" DROP CONSTRAINT "content_listing_items_rels_member_profiles_fk";
  
  ALTER TABLE "pages_blocks_listing_conditions" ALTER COLUMN "field" SET DATA TYPE text;
  DROP TYPE "public"."enum_pages_blocks_listing_conditions_field";
  CREATE TYPE "public"."enum_pages_blocks_listing_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  ALTER TABLE "pages_blocks_listing_conditions" ALTER COLUMN "field" SET DATA TYPE "public"."enum_pages_blocks_listing_conditions_field" USING "field"::"public"."enum_pages_blocks_listing_conditions_field";
  ALTER TABLE "_pages_v_blocks_listing_conditions" ALTER COLUMN "field" SET DATA TYPE text;
  DROP TYPE "public"."enum__pages_v_blocks_listing_conditions_field";
  CREATE TYPE "public"."enum__pages_v_blocks_listing_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  ALTER TABLE "_pages_v_blocks_listing_conditions" ALTER COLUMN "field" SET DATA TYPE "public"."enum__pages_v_blocks_listing_conditions_field" USING "field"::"public"."enum__pages_v_blocks_listing_conditions_field";
  ALTER TABLE "posts_blocks_listing_conditions" ALTER COLUMN "field" SET DATA TYPE text;
  DROP TYPE "public"."enum_posts_blocks_listing_conditions_field";
  CREATE TYPE "public"."enum_posts_blocks_listing_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  ALTER TABLE "posts_blocks_listing_conditions" ALTER COLUMN "field" SET DATA TYPE "public"."enum_posts_blocks_listing_conditions_field" USING "field"::"public"."enum_posts_blocks_listing_conditions_field";
  ALTER TABLE "_posts_v_blocks_listing_conditions" ALTER COLUMN "field" SET DATA TYPE text;
  DROP TYPE "public"."enum__posts_v_blocks_listing_conditions_field";
  CREATE TYPE "public"."enum__posts_v_blocks_listing_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  ALTER TABLE "_posts_v_blocks_listing_conditions" ALTER COLUMN "field" SET DATA TYPE "public"."enum__posts_v_blocks_listing_conditions_field" USING "field"::"public"."enum__posts_v_blocks_listing_conditions_field";
  ALTER TABLE "events_blocks_listing_conditions" ALTER COLUMN "field" SET DATA TYPE text;
  DROP TYPE "public"."enum_events_blocks_listing_conditions_field";
  CREATE TYPE "public"."enum_events_blocks_listing_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  ALTER TABLE "events_blocks_listing_conditions" ALTER COLUMN "field" SET DATA TYPE "public"."enum_events_blocks_listing_conditions_field" USING "field"::"public"."enum_events_blocks_listing_conditions_field";
  ALTER TABLE "_events_v_blocks_listing_conditions" ALTER COLUMN "field" SET DATA TYPE text;
  DROP TYPE "public"."enum__events_v_blocks_listing_conditions_field";
  CREATE TYPE "public"."enum__events_v_blocks_listing_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  ALTER TABLE "_events_v_blocks_listing_conditions" ALTER COLUMN "field" SET DATA TYPE "public"."enum__events_v_blocks_listing_conditions_field" USING "field"::"public"."enum__events_v_blocks_listing_conditions_field";
  ALTER TABLE "event_cycles_blocks_listing_conditions" ALTER COLUMN "field" SET DATA TYPE text;
  DROP TYPE "public"."enum_event_cycles_blocks_listing_conditions_field";
  CREATE TYPE "public"."enum_event_cycles_blocks_listing_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  ALTER TABLE "event_cycles_blocks_listing_conditions" ALTER COLUMN "field" SET DATA TYPE "public"."enum_event_cycles_blocks_listing_conditions_field" USING "field"::"public"."enum_event_cycles_blocks_listing_conditions_field";
  ALTER TABLE "_event_cycles_v_blocks_listing_conditions" ALTER COLUMN "field" SET DATA TYPE text;
  DROP TYPE "public"."enum__event_cycles_v_blocks_listing_conditions_field";
  CREATE TYPE "public"."enum__event_cycles_v_blocks_listing_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  ALTER TABLE "_event_cycles_v_blocks_listing_conditions" ALTER COLUMN "field" SET DATA TYPE "public"."enum__event_cycles_v_blocks_listing_conditions_field" USING "field"::"public"."enum__event_cycles_v_blocks_listing_conditions_field";
  ALTER TABLE "partners_blocks_listing_conditions" ALTER COLUMN "field" SET DATA TYPE text;
  DROP TYPE "public"."enum_partners_blocks_listing_conditions_field";
  CREATE TYPE "public"."enum_partners_blocks_listing_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  ALTER TABLE "partners_blocks_listing_conditions" ALTER COLUMN "field" SET DATA TYPE "public"."enum_partners_blocks_listing_conditions_field" USING "field"::"public"."enum_partners_blocks_listing_conditions_field";
  ALTER TABLE "_partners_v_blocks_listing_conditions" ALTER COLUMN "field" SET DATA TYPE text;
  DROP TYPE "public"."enum__partners_v_blocks_listing_conditions_field";
  CREATE TYPE "public"."enum__partners_v_blocks_listing_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  ALTER TABLE "_partners_v_blocks_listing_conditions" ALTER COLUMN "field" SET DATA TYPE "public"."enum__partners_v_blocks_listing_conditions_field" USING "field"::"public"."enum__partners_v_blocks_listing_conditions_field";
  ALTER TABLE "homepage_sections_blocks_listing_conditions" ALTER COLUMN "field" SET DATA TYPE text;
  DROP TYPE "public"."enum_homepage_sections_blocks_listing_conditions_field";
  CREATE TYPE "public"."enum_homepage_sections_blocks_listing_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  ALTER TABLE "homepage_sections_blocks_listing_conditions" ALTER COLUMN "field" SET DATA TYPE "public"."enum_homepage_sections_blocks_listing_conditions_field" USING "field"::"public"."enum_homepage_sections_blocks_listing_conditions_field";
  ALTER TABLE "_homepage_sections_v_blocks_listing_conditions" ALTER COLUMN "field" SET DATA TYPE text;
  DROP TYPE "public"."enum__homepage_sections_v_blocks_listing_conditions_field";
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_listing_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'significantDate');
  ALTER TABLE "_homepage_sections_v_blocks_listing_conditions" ALTER COLUMN "field" SET DATA TYPE "public"."enum__homepage_sections_v_blocks_listing_conditions_field" USING "field"::"public"."enum__homepage_sections_v_blocks_listing_conditions_field";
  DROP INDEX "content_listing_items_rels_pages_id_idx";
  DROP INDEX "content_listing_items_rels_posts_id_idx";
  DROP INDEX "content_listing_items_rels_events_id_idx";
  DROP INDEX "content_listing_items_rels_event_cycles_id_idx";
  DROP INDEX "content_listing_items_rels_documents_id_idx";
  DROP INDEX "content_listing_items_rels_partners_id_idx";
  DROP INDEX "content_listing_items_rels_member_profiles_id_idx";
  ALTER TABLE "content_listing_items" DROP COLUMN "related_target_search_index";
  ALTER TABLE "content_listing_items_rels" DROP COLUMN "pages_id";
  ALTER TABLE "content_listing_items_rels" DROP COLUMN "posts_id";
  ALTER TABLE "content_listing_items_rels" DROP COLUMN "events_id";
  ALTER TABLE "content_listing_items_rels" DROP COLUMN "event_cycles_id";
  ALTER TABLE "content_listing_items_rels" DROP COLUMN "documents_id";
  ALTER TABLE "content_listing_items_rels" DROP COLUMN "partners_id";
  ALTER TABLE "content_listing_items_rels" DROP COLUMN "member_profiles_id";
  ALTER TABLE "pages_blocks_listing_conditions" DROP COLUMN "related_target_mode";
  ALTER TABLE "_pages_v_blocks_listing_conditions" DROP COLUMN "related_target_mode";
  ALTER TABLE "posts_blocks_listing_conditions" DROP COLUMN "related_target_mode";
  ALTER TABLE "_posts_v_blocks_listing_conditions" DROP COLUMN "related_target_mode";
  ALTER TABLE "events_blocks_listing_conditions" DROP COLUMN "related_target_mode";
  ALTER TABLE "_events_v_blocks_listing_conditions" DROP COLUMN "related_target_mode";
  ALTER TABLE "event_cycles_blocks_listing_conditions" DROP COLUMN "related_target_mode";
  ALTER TABLE "_event_cycles_v_blocks_listing_conditions" DROP COLUMN "related_target_mode";
  ALTER TABLE "partners_blocks_listing_conditions" DROP COLUMN "related_target_mode";
  ALTER TABLE "_partners_v_blocks_listing_conditions" DROP COLUMN "related_target_mode";
  ALTER TABLE "homepage_sections_blocks_listing_conditions" DROP COLUMN "related_target_mode";
  ALTER TABLE "_homepage_sections_v_blocks_listing_conditions" DROP COLUMN "related_target_mode";
  DROP TYPE "public"."related_mode";`)
}
