import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DELETE FROM "page_templates_blocks_field_row_text" AS separator
    USING "page_templates_blocks_current_item_field" AS status, "page_templates_blocks_current_item_field" AS event_type
    WHERE status."field" = 'eventStatus'
      AND event_type."field" = 'eventType'
      AND separator."_parent_id" = status."_parent_id"
      AND event_type."_parent_id" = status."_parent_id"
      AND separator."_path" = status."_path"
      AND event_type."_path" = status."_path"
      AND separator."_order" = status."_order" - 1
      AND event_type."_order" = status."_order" - 2
      AND separator."text" #>> '{root,children,0,children,0,text}' = '—'
      AND jsonb_array_length(separator."text" #> '{root,children}') = 1
      AND jsonb_array_length(separator."text" #> '{root,children,0,children}') = 1;

    WITH removed AS (
      DELETE FROM "page_templates_blocks_current_item_field"
      WHERE "field" IN ('eventStatus', 'previousStartAt', 'publishedStartAt')
      RETURNING "_parent_id", "_path"
    )
    DELETE FROM "page_templates_blocks_current_item_field_row" AS field_row
    USING removed
    WHERE field_row."_parent_id" = removed."_parent_id"
      AND concat(field_row."_path", '.', field_row."_order" - 1, '.items') = removed."_path"
      AND NOT EXISTS (
      SELECT 1 FROM "page_templates_blocks_current_item_field"
      WHERE "_parent_id" = removed."_parent_id" AND "_path" = removed."_path"
        AND ("field" IS NULL OR "field" NOT IN ('eventStatus', 'previousStartAt', 'publishedStartAt'))
      UNION ALL
      SELECT 1 FROM "page_templates_blocks_field_row_text"
      WHERE "_parent_id" = removed."_parent_id" AND "_path" = removed."_path"
      UNION ALL
      SELECT 1 FROM "page_templates_blocks_page_template_icon"
      WHERE "_parent_id" = removed."_parent_id" AND "_path" = removed."_path"
      UNION ALL
      SELECT 1 FROM "page_templates_blocks_action_links"
      WHERE "_parent_id" = removed."_parent_id" AND "_path" = removed."_path"
      UNION ALL
      SELECT 1 FROM "page_templates_blocks_spacer"
      WHERE "_parent_id" = removed."_parent_id" AND "_path" = removed."_path"
    );

    DELETE FROM "_page_templates_v_blocks_field_row_text" AS separator
    USING "_page_templates_v_blocks_current_item_field" AS status, "_page_templates_v_blocks_current_item_field" AS event_type
    WHERE status."field" = 'eventStatus'
      AND event_type."field" = 'eventType'
      AND separator."_parent_id" = status."_parent_id"
      AND event_type."_parent_id" = status."_parent_id"
      AND separator."_path" = status."_path"
      AND event_type."_path" = status."_path"
      AND separator."_order" = status."_order" - 1
      AND event_type."_order" = status."_order" - 2
      AND separator."text" #>> '{root,children,0,children,0,text}' = '—'
      AND jsonb_array_length(separator."text" #> '{root,children}') = 1
      AND jsonb_array_length(separator."text" #> '{root,children,0,children}') = 1;

    WITH removed AS (
      DELETE FROM "_page_templates_v_blocks_current_item_field"
      WHERE "field" IN ('eventStatus', 'previousStartAt', 'publishedStartAt')
      RETURNING "_parent_id", "_path"
    )
    DELETE FROM "_page_templates_v_blocks_current_item_field_row" AS field_row
    USING removed
    WHERE field_row."_parent_id" = removed."_parent_id"
      AND concat(field_row."_path", '.', field_row."_order" - 1, '.items') = removed."_path"
      AND NOT EXISTS (
      SELECT 1 FROM "_page_templates_v_blocks_current_item_field"
      WHERE "_parent_id" = removed."_parent_id" AND "_path" = removed."_path"
        AND ("field" IS NULL OR "field" NOT IN ('eventStatus', 'previousStartAt', 'publishedStartAt'))
      UNION ALL
      SELECT 1 FROM "_page_templates_v_blocks_field_row_text"
      WHERE "_parent_id" = removed."_parent_id" AND "_path" = removed."_path"
      UNION ALL
      SELECT 1 FROM "_page_templates_v_blocks_page_template_icon"
      WHERE "_parent_id" = removed."_parent_id" AND "_path" = removed."_path"
      UNION ALL
      SELECT 1 FROM "_page_templates_v_blocks_action_links"
      WHERE "_parent_id" = removed."_parent_id" AND "_path" = removed."_path"
      UNION ALL
      SELECT 1 FROM "_page_templates_v_blocks_spacer"
      WHERE "_parent_id" = removed."_parent_id" AND "_path" = removed."_path"
    );

  ALTER TABLE "page_templates_blocks_current_item_field" ALTER COLUMN "field" SET DATA TYPE text;
  DROP TYPE "public"."enum_page_templates_blocks_current_item_field_field";
  CREATE TYPE "public"."enum_page_templates_blocks_current_item_field_field" AS ENUM('name', 'description', 'hierarchy', 'eventType', 'title', 'excerpt', 'eventCycle', 'tags', 'eventTime', 'eventLocation', 'eventAudience', 'eventCapacity', 'partners', 'organizers', 'website', 'publicName', 'clubFunction', 'about', 'contactChannels', 'relatedPages', 'relatedPosts', 'relatedEvents', 'relatedEventCycles', 'relatedDocuments', 'updatedAt', 'parent', 'fullTitle', 'breadcrumbs', 'heroImage', 'layout', 'author', 'publishedAt', 'category', 'timeMode', 'startAt', 'endAt', 'location.venueName', 'location.venueWebsite', 'location.streetAddress', 'location.postalCode', 'location.city', 'location.mapEmbedURL', 'location.country', 'participation', 'capacityMode', 'capacity', 'externalLinks', 'defaultsAppliedCycle', 'calendarUID', 'calendarRevision', 'calendarFingerprint', 'calendarFeedKey', 'eventDefaults.title', 'eventDefaults.eventType', 'eventDefaults.heroImage', 'eventDefaults.excerpt', 'eventDefaults.layout', 'eventDefaults.category', 'eventDefaults.tags', 'eventDefaults.recurrenceType', 'eventDefaults.weekInterval', 'eventDefaults.monthDay', 'eventDefaults.weekOfMonth', 'eventDefaults.recurrenceWeekday', 'eventDefaults.defaultDayCount', 'eventDefaults.defaultStartTime', 'eventDefaults.defaultEndTime', 'eventDefaults.location.venueName', 'eventDefaults.location.venueWebsite', 'eventDefaults.location.streetAddress', 'eventDefaults.location.postalCode', 'eventDefaults.location.city', 'eventDefaults.location.mapEmbedURL', 'eventDefaults.location.country', 'eventDefaults.participation', 'eventDefaults.capacityMode', 'eventDefaults.capacity', 'eventDefaults.externalLinks', 'photo', 'interests', 'games', 'contactTopics');
  ALTER TABLE "page_templates_blocks_current_item_field" ALTER COLUMN "field" SET DATA TYPE "public"."enum_page_templates_blocks_current_item_field_field" USING "field"::"public"."enum_page_templates_blocks_current_item_field_field";
  ALTER TABLE "_page_templates_v_blocks_current_item_field" ALTER COLUMN "field" SET DATA TYPE text;
  DROP TYPE "public"."enum__page_templates_v_blocks_current_item_field_field";
  CREATE TYPE "public"."enum__page_templates_v_blocks_current_item_field_field" AS ENUM('name', 'description', 'hierarchy', 'eventType', 'title', 'excerpt', 'eventCycle', 'tags', 'eventTime', 'eventLocation', 'eventAudience', 'eventCapacity', 'partners', 'organizers', 'website', 'publicName', 'clubFunction', 'about', 'contactChannels', 'relatedPages', 'relatedPosts', 'relatedEvents', 'relatedEventCycles', 'relatedDocuments', 'updatedAt', 'parent', 'fullTitle', 'breadcrumbs', 'heroImage', 'layout', 'author', 'publishedAt', 'category', 'timeMode', 'startAt', 'endAt', 'location.venueName', 'location.venueWebsite', 'location.streetAddress', 'location.postalCode', 'location.city', 'location.mapEmbedURL', 'location.country', 'participation', 'capacityMode', 'capacity', 'externalLinks', 'defaultsAppliedCycle', 'calendarUID', 'calendarRevision', 'calendarFingerprint', 'calendarFeedKey', 'eventDefaults.title', 'eventDefaults.eventType', 'eventDefaults.heroImage', 'eventDefaults.excerpt', 'eventDefaults.layout', 'eventDefaults.category', 'eventDefaults.tags', 'eventDefaults.recurrenceType', 'eventDefaults.weekInterval', 'eventDefaults.monthDay', 'eventDefaults.weekOfMonth', 'eventDefaults.recurrenceWeekday', 'eventDefaults.defaultDayCount', 'eventDefaults.defaultStartTime', 'eventDefaults.defaultEndTime', 'eventDefaults.location.venueName', 'eventDefaults.location.venueWebsite', 'eventDefaults.location.streetAddress', 'eventDefaults.location.postalCode', 'eventDefaults.location.city', 'eventDefaults.location.mapEmbedURL', 'eventDefaults.location.country', 'eventDefaults.participation', 'eventDefaults.capacityMode', 'eventDefaults.capacity', 'eventDefaults.externalLinks', 'photo', 'interests', 'games', 'contactTopics');
  ALTER TABLE "_page_templates_v_blocks_current_item_field" ALTER COLUMN "field" SET DATA TYPE "public"."enum__page_templates_v_blocks_current_item_field_field" USING "field"::"public"."enum__page_templates_v_blocks_current_item_field_field";
  ALTER TABLE "events" DROP COLUMN "event_status";
  ALTER TABLE "events" DROP COLUMN "previous_start_at";
  ALTER TABLE "events" DROP COLUMN "published_start_at";
  ALTER TABLE "_events_v" DROP COLUMN "version_event_status";
  ALTER TABLE "_events_v" DROP COLUMN "version_previous_start_at";
  ALTER TABLE "_events_v" DROP COLUMN "version_published_start_at";
  DROP TYPE "public"."enum_events_event_status";
  DROP TYPE "public"."enum__events_v_version_event_status";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  CREATE TYPE "public"."enum_events_event_status" AS ENUM('scheduled', 'completed', 'cancelled', 'postponed', 'rescheduled');
  CREATE TYPE "public"."enum__events_v_version_event_status" AS ENUM('scheduled', 'completed', 'cancelled', 'postponed', 'rescheduled');
  ALTER TYPE "public"."enum_page_templates_blocks_current_item_field_field" ADD VALUE 'eventStatus' BEFORE 'title';
  ALTER TYPE "public"."enum_page_templates_blocks_current_item_field_field" ADD VALUE 'previousStartAt' BEFORE 'calendarUID';
  ALTER TYPE "public"."enum_page_templates_blocks_current_item_field_field" ADD VALUE 'publishedStartAt' BEFORE 'calendarUID';
  ALTER TYPE "public"."enum__page_templates_v_blocks_current_item_field_field" ADD VALUE 'eventStatus' BEFORE 'title';
  ALTER TYPE "public"."enum__page_templates_v_blocks_current_item_field_field" ADD VALUE 'previousStartAt' BEFORE 'calendarUID';
  ALTER TYPE "public"."enum__page_templates_v_blocks_current_item_field_field" ADD VALUE 'publishedStartAt' BEFORE 'calendarUID';
  ALTER TABLE "events" ADD COLUMN "event_status" "enum_events_event_status" DEFAULT 'scheduled';
  ALTER TABLE "events" ADD COLUMN "previous_start_at" timestamp(3) with time zone;
  ALTER TABLE "events" ADD COLUMN "published_start_at" timestamp(3) with time zone;
  ALTER TABLE "_events_v" ADD COLUMN "version_event_status" "enum__events_v_version_event_status" DEFAULT 'scheduled';
  ALTER TABLE "_events_v" ADD COLUMN "version_previous_start_at" timestamp(3) with time zone;
  ALTER TABLE "_events_v" ADD COLUMN "version_published_start_at" timestamp(3) with time zone;`)
}
