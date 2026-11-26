import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "media_legacy_image_files" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"filename" varchar NOT NULL
  );

  ALTER TABLE "media" ADD COLUMN "image_variants" jsonb;
  ALTER TABLE "media" ADD COLUMN "image_conversion_source" jsonb;
  ALTER TABLE "media_legacy_image_files" ADD CONSTRAINT "media_legacy_image_files_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "media_legacy_image_files_order_idx" ON "media_legacy_image_files" USING btree ("_order");
  CREATE INDEX "media_legacy_image_files_parent_id_idx" ON "media_legacy_image_files" USING btree ("_parent_id");
  CREATE INDEX "media_legacy_image_files_filename_idx" ON "media_legacy_image_files" USING btree ("filename");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DO $$
  BEGIN
    IF EXISTS (
      SELECT 1 FROM "media" WHERE jsonb_typeof("image_variants") = 'array'
    ) THEN
      RAISE EXCEPTION 'Restore the original media references before rolling back optimized image metadata.';
    END IF;
  END
  $$;
  DROP TABLE "media_legacy_image_files";
  ALTER TABLE "media" DROP COLUMN "image_variants";
  ALTER TABLE "media" DROP COLUMN "image_conversion_source";`)
}
