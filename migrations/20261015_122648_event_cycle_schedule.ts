import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_event_cycles_event_defaults_recurrence_type" AS ENUM('daily', 'weekly', 'monthlyDate', 'monthlyWeekday');
  CREATE TYPE "public"."enum_event_cycles_event_defaults_recurrence_weekday" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
  CREATE TYPE "public"."enum__event_cycles_v_version_event_defaults_recurrence_type" AS ENUM('daily', 'weekly', 'monthlyDate', 'monthlyWeekday');
  CREATE TYPE "public"."enum__event_cycles_v_version_event_defaults_recurrence_weekday" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
  ALTER TABLE "event_cycles" ADD COLUMN "event_defaults_recurrence_type" "enum_event_cycles_event_defaults_recurrence_type" DEFAULT 'weekly';
  ALTER TABLE "event_cycles" ADD COLUMN "event_defaults_week_interval" numeric DEFAULT 2;
  ALTER TABLE "event_cycles" ADD COLUMN "event_defaults_month_day" numeric DEFAULT 1;
  ALTER TABLE "event_cycles" ADD COLUMN "event_defaults_week_of_month" numeric DEFAULT 1;
  ALTER TABLE "event_cycles" ADD COLUMN "event_defaults_recurrence_weekday" "enum_event_cycles_event_defaults_recurrence_weekday" DEFAULT 'tuesday';
  ALTER TABLE "event_cycles" ADD COLUMN "event_defaults_default_day_count" numeric DEFAULT 1;
  ALTER TABLE "event_cycles" ADD COLUMN "event_defaults_default_end_time" varchar;
  ALTER TABLE "_event_cycles_v" ADD COLUMN "version_event_defaults_recurrence_type" "enum__event_cycles_v_version_event_defaults_recurrence_type" DEFAULT 'weekly';
  ALTER TABLE "_event_cycles_v" ADD COLUMN "version_event_defaults_week_interval" numeric DEFAULT 2;
  ALTER TABLE "_event_cycles_v" ADD COLUMN "version_event_defaults_month_day" numeric DEFAULT 1;
  ALTER TABLE "_event_cycles_v" ADD COLUMN "version_event_defaults_week_of_month" numeric DEFAULT 1;
  ALTER TABLE "_event_cycles_v" ADD COLUMN "version_event_defaults_recurrence_weekday" "enum__event_cycles_v_version_event_defaults_recurrence_weekday" DEFAULT 'tuesday';
  ALTER TABLE "_event_cycles_v" ADD COLUMN "version_event_defaults_default_day_count" numeric DEFAULT 1;
  ALTER TABLE "_event_cycles_v" ADD COLUMN "version_event_defaults_default_end_time" varchar;
  UPDATE "event_cycles"
  SET
    "event_defaults_default_day_count" = FLOOR((
      SPLIT_PART("event_defaults_default_start_time", ':', 1)::numeric * 60 +
      SPLIT_PART("event_defaults_default_start_time", ':', 2)::numeric +
      "event_defaults_default_duration_minutes"
    ) / 1440) + 1,
    "event_defaults_default_end_time" =
      LPAD((MOD(FLOOR((
        SPLIT_PART("event_defaults_default_start_time", ':', 1)::numeric * 60 +
        SPLIT_PART("event_defaults_default_start_time", ':', 2)::numeric +
        "event_defaults_default_duration_minutes"
      ) / 60), 24))::text, 2, '0') || ':' ||
      LPAD((MOD((
        SPLIT_PART("event_defaults_default_start_time", ':', 1)::numeric * 60 +
        SPLIT_PART("event_defaults_default_start_time", ':', 2)::numeric +
        "event_defaults_default_duration_minutes"
      ), 60))::text, 2, '0')
  WHERE "event_defaults_default_start_time" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
    AND "event_defaults_default_duration_minutes" IS NOT NULL;
  UPDATE "_event_cycles_v"
  SET
    "version_event_defaults_default_day_count" = FLOOR((
      SPLIT_PART("version_event_defaults_default_start_time", ':', 1)::numeric * 60 +
      SPLIT_PART("version_event_defaults_default_start_time", ':', 2)::numeric +
      "version_event_defaults_default_duration_minutes"
    ) / 1440) + 1,
    "version_event_defaults_default_end_time" =
      LPAD((MOD(FLOOR((
        SPLIT_PART("version_event_defaults_default_start_time", ':', 1)::numeric * 60 +
        SPLIT_PART("version_event_defaults_default_start_time", ':', 2)::numeric +
        "version_event_defaults_default_duration_minutes"
      ) / 60), 24))::text, 2, '0') || ':' ||
      LPAD((MOD((
        SPLIT_PART("version_event_defaults_default_start_time", ':', 1)::numeric * 60 +
        SPLIT_PART("version_event_defaults_default_start_time", ':', 2)::numeric +
        "version_event_defaults_default_duration_minutes"
      ), 60))::text, 2, '0')
  WHERE "version_event_defaults_default_start_time" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
    AND "version_event_defaults_default_duration_minutes" IS NOT NULL;
  ALTER TABLE "event_cycles" DROP COLUMN "event_defaults_default_time_mode";
  ALTER TABLE "event_cycles" DROP COLUMN "event_defaults_default_duration_minutes";
  ALTER TABLE "_event_cycles_v" DROP COLUMN "version_event_defaults_default_time_mode";
  ALTER TABLE "_event_cycles_v" DROP COLUMN "version_event_defaults_default_duration_minutes";
  DROP TYPE "public"."enum_event_cycles_event_defaults_default_time_mode";
  DROP TYPE "public"."enum__event_cycles_v_version_event_defaults_default_time_mode";
  ALTER TYPE "public"."enum_events_event_status" ADD VALUE 'completed' BEFORE 'cancelled';
  ALTER TYPE "public"."enum__events_v_version_event_status" ADD VALUE 'completed' BEFORE 'cancelled';`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" ALTER COLUMN "event_status" SET DATA TYPE text;
  ALTER TABLE "events" ALTER COLUMN "event_status" SET DEFAULT 'scheduled'::text;
  UPDATE "events" SET "event_status" = 'scheduled' WHERE "event_status" = 'completed';
  DROP TYPE "public"."enum_events_event_status";
  CREATE TYPE "public"."enum_events_event_status" AS ENUM('scheduled', 'cancelled', 'postponed', 'rescheduled');
  ALTER TABLE "events" ALTER COLUMN "event_status" SET DEFAULT 'scheduled'::"public"."enum_events_event_status";
  ALTER TABLE "events" ALTER COLUMN "event_status" SET DATA TYPE "public"."enum_events_event_status" USING "event_status"::"public"."enum_events_event_status";
  ALTER TABLE "_events_v" ALTER COLUMN "version_event_status" SET DATA TYPE text;
  ALTER TABLE "_events_v" ALTER COLUMN "version_event_status" SET DEFAULT 'scheduled'::text;
  UPDATE "_events_v" SET "version_event_status" = 'scheduled' WHERE "version_event_status" = 'completed';
  DROP TYPE "public"."enum__events_v_version_event_status";
  CREATE TYPE "public"."enum__events_v_version_event_status" AS ENUM('scheduled', 'cancelled', 'postponed', 'rescheduled');
  ALTER TABLE "_events_v" ALTER COLUMN "version_event_status" SET DEFAULT 'scheduled'::"public"."enum__events_v_version_event_status";
  ALTER TABLE "_events_v" ALTER COLUMN "version_event_status" SET DATA TYPE "public"."enum__events_v_version_event_status" USING "version_event_status"::"public"."enum__events_v_version_event_status";
  CREATE TYPE "public"."enum_event_cycles_event_defaults_default_time_mode" AS ENUM('timed', 'allDay');
  CREATE TYPE "public"."enum__event_cycles_v_version_event_defaults_default_time_mode" AS ENUM('timed', 'allDay');
  ALTER TABLE "event_cycles" ADD COLUMN "event_defaults_default_time_mode" "enum_event_cycles_event_defaults_default_time_mode" DEFAULT 'timed';
  ALTER TABLE "event_cycles" ADD COLUMN "event_defaults_default_duration_minutes" numeric;
  ALTER TABLE "_event_cycles_v" ADD COLUMN "version_event_defaults_default_time_mode" "enum__event_cycles_v_version_event_defaults_default_time_mode" DEFAULT 'timed';
  ALTER TABLE "_event_cycles_v" ADD COLUMN "version_event_defaults_default_duration_minutes" numeric;
  UPDATE "event_cycles"
  SET "event_defaults_default_duration_minutes" =
    ("event_defaults_default_day_count" - 1) * 1440 +
    SPLIT_PART("event_defaults_default_end_time", ':', 1)::numeric * 60 +
    SPLIT_PART("event_defaults_default_end_time", ':', 2)::numeric -
    SPLIT_PART("event_defaults_default_start_time", ':', 1)::numeric * 60 -
    SPLIT_PART("event_defaults_default_start_time", ':', 2)::numeric
  WHERE "event_defaults_default_start_time" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
    AND "event_defaults_default_end_time" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$';
  UPDATE "_event_cycles_v"
  SET "version_event_defaults_default_duration_minutes" =
    ("version_event_defaults_default_day_count" - 1) * 1440 +
    SPLIT_PART("version_event_defaults_default_end_time", ':', 1)::numeric * 60 +
    SPLIT_PART("version_event_defaults_default_end_time", ':', 2)::numeric -
    SPLIT_PART("version_event_defaults_default_start_time", ':', 1)::numeric * 60 -
    SPLIT_PART("version_event_defaults_default_start_time", ':', 2)::numeric
  WHERE "version_event_defaults_default_start_time" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
    AND "version_event_defaults_default_end_time" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$';
  ALTER TABLE "event_cycles" DROP COLUMN "event_defaults_recurrence_type";
  ALTER TABLE "event_cycles" DROP COLUMN "event_defaults_week_interval";
  ALTER TABLE "event_cycles" DROP COLUMN "event_defaults_month_day";
  ALTER TABLE "event_cycles" DROP COLUMN "event_defaults_week_of_month";
  ALTER TABLE "event_cycles" DROP COLUMN "event_defaults_recurrence_weekday";
  ALTER TABLE "event_cycles" DROP COLUMN "event_defaults_default_day_count";
  ALTER TABLE "event_cycles" DROP COLUMN "event_defaults_default_end_time";
  ALTER TABLE "_event_cycles_v" DROP COLUMN "version_event_defaults_recurrence_type";
  ALTER TABLE "_event_cycles_v" DROP COLUMN "version_event_defaults_week_interval";
  ALTER TABLE "_event_cycles_v" DROP COLUMN "version_event_defaults_month_day";
  ALTER TABLE "_event_cycles_v" DROP COLUMN "version_event_defaults_week_of_month";
  ALTER TABLE "_event_cycles_v" DROP COLUMN "version_event_defaults_recurrence_weekday";
  ALTER TABLE "_event_cycles_v" DROP COLUMN "version_event_defaults_default_day_count";
  ALTER TABLE "_event_cycles_v" DROP COLUMN "version_event_defaults_default_end_time";
  DROP TYPE "public"."enum_event_cycles_event_defaults_recurrence_type";
  DROP TYPE "public"."enum_event_cycles_event_defaults_recurrence_weekday";
  DROP TYPE "public"."enum__event_cycles_v_version_event_defaults_recurrence_type";
  DROP TYPE "public"."enum__event_cycles_v_version_event_defaults_recurrence_weekday";`)
}
