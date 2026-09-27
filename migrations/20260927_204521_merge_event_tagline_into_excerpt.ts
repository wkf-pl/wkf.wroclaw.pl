import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  UPDATE "events"
  SET "excerpt" = CASE
    WHEN NULLIF(btrim("excerpt"), '') IS NULL THEN btrim("tagline")
    ELSE btrim("tagline") || E'\n\n' || btrim("excerpt")
  END
  WHERE NULLIF(btrim("tagline"), '') IS NOT NULL;

  UPDATE "_events_v"
  SET "version_excerpt" = CASE
    WHEN NULLIF(btrim("version_excerpt"), '') IS NULL THEN btrim("version_tagline")
    ELSE btrim("version_tagline") || E'\n\n' || btrim("version_excerpt")
  END
  WHERE NULLIF(btrim("version_tagline"), '') IS NOT NULL;

  UPDATE "event_cycles"
  SET
    "excerpt" = CASE
      WHEN NULLIF(btrim("tagline"), '') IS NULL THEN "excerpt"
      WHEN NULLIF(btrim("excerpt"), '') IS NULL THEN btrim("tagline")
      ELSE btrim("tagline") || E'\n\n' || btrim("excerpt")
    END,
    "event_defaults_excerpt" = CASE
      WHEN NULLIF(btrim("event_defaults_tagline"), '') IS NULL THEN "event_defaults_excerpt"
      WHEN NULLIF(btrim("event_defaults_excerpt"), '') IS NULL THEN btrim("event_defaults_tagline")
      ELSE btrim("event_defaults_tagline") || E'\n\n' || btrim("event_defaults_excerpt")
    END;

  UPDATE "_event_cycles_v"
  SET
    "version_excerpt" = CASE
      WHEN NULLIF(btrim("version_tagline"), '') IS NULL THEN "version_excerpt"
      WHEN NULLIF(btrim("version_excerpt"), '') IS NULL THEN btrim("version_tagline")
      ELSE btrim("version_tagline") || E'\n\n' || btrim("version_excerpt")
    END,
    "version_event_defaults_excerpt" = CASE
      WHEN NULLIF(btrim("version_event_defaults_tagline"), '') IS NULL
        THEN "version_event_defaults_excerpt"
      WHEN NULLIF(btrim("version_event_defaults_excerpt"), '') IS NULL
        THEN btrim("version_event_defaults_tagline")
      ELSE btrim("version_event_defaults_tagline") || E'\n\n' || btrim("version_event_defaults_excerpt")
    END;

  ALTER TABLE "events" DROP COLUMN "tagline";
  ALTER TABLE "_events_v" DROP COLUMN "version_tagline";
  ALTER TABLE "event_cycles" DROP COLUMN "tagline";
  ALTER TABLE "event_cycles" DROP COLUMN "event_defaults_tagline";
  ALTER TABLE "_event_cycles_v" DROP COLUMN "version_tagline";
  ALTER TABLE "_event_cycles_v" DROP COLUMN "version_event_defaults_tagline";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "events" ADD COLUMN "tagline" varchar;
  ALTER TABLE "_events_v" ADD COLUMN "version_tagline" varchar;
  ALTER TABLE "event_cycles" ADD COLUMN "tagline" varchar;
  ALTER TABLE "event_cycles" ADD COLUMN "event_defaults_tagline" varchar;
  ALTER TABLE "_event_cycles_v" ADD COLUMN "version_tagline" varchar;
  ALTER TABLE "_event_cycles_v" ADD COLUMN "version_event_defaults_tagline" varchar;`)
}
