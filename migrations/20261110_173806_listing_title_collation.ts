import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "public"."content_listing_items"
    ALTER COLUMN "title" TYPE varchar COLLATE "pg_catalog"."pl-x-icu";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "public"."content_listing_items"
    ALTER COLUMN "title" TYPE varchar COLLATE "pg_catalog"."default";
  `)
}
