import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "listing_views" RENAME COLUMN "retired" TO "active";
    ALTER TABLE "_listing_views_v" RENAME COLUMN "version_retired" TO "version_active";
    UPDATE "listing_views" SET "active" = NOT COALESCE("active", false);
    UPDATE "_listing_views_v" SET "version_active" = NOT COALESCE("version_active", false);
    ALTER TABLE "listing_views" ALTER COLUMN "active" SET DEFAULT true;
    ALTER TABLE "_listing_views_v" ALTER COLUMN "version_active" SET DEFAULT true;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "listing_views" RENAME COLUMN "active" TO "retired";
    ALTER TABLE "_listing_views_v" RENAME COLUMN "version_active" TO "version_retired";
    UPDATE "listing_views" SET "retired" = NOT COALESCE("retired", true);
    UPDATE "_listing_views_v" SET "version_retired" = NOT COALESCE("version_retired", true);
    ALTER TABLE "listing_views" ALTER COLUMN "retired" SET DEFAULT false;
    ALTER TABLE "_listing_views_v" ALTER COLUMN "version_retired" SET DEFAULT false;
  `)
}
