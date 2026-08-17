import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "hero_image_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "copyright_text" jsonb;

  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'site_settings_hero_image_id_media_id_fk'
    ) THEN
      ALTER TABLE "site_settings"
      ADD CONSTRAINT "site_settings_hero_image_id_media_id_fk"
      FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id")
      ON DELETE set null ON UPDATE no action;
    END IF;
  END $$;

  CREATE INDEX IF NOT EXISTS "site_settings_hero_image_idx"
  ON "site_settings" USING btree ("hero_image_id");

  DO $$
  BEGIN
    IF EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'footer'
    ) THEN
      UPDATE "site_settings"
      SET "copyright_text" = "footer"."copyright_text",
          "updated_at" = now()
      FROM "footer";
    END IF;
  END $$;

  DROP TABLE IF EXISTS "footer" CASCADE;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "footer" (
    "id" serial PRIMARY KEY NOT NULL,
    "copyright_text" jsonb,
    "updated_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone
  );

  INSERT INTO "footer" ("id", "copyright_text", "updated_at", "created_at")
  SELECT "id", "copyright_text", "updated_at", "created_at"
  FROM "site_settings";

  SELECT setval(
    pg_get_serial_sequence('footer', 'id'),
    COALESCE((SELECT MAX("id") FROM "footer"), 1),
    true
  );

  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_hero_image_id_media_id_fk";

  DROP INDEX "site_settings_hero_image_idx";
  ALTER TABLE "site_settings" DROP COLUMN "hero_image_id";
  ALTER TABLE "site_settings" DROP COLUMN "copyright_text";`)
}
