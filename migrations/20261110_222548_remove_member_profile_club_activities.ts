import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

import { extractRichTextText } from '../src/modules/content/rich-text'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    LOCK TABLE "member_profiles", "_member_profiles_v" IN ACCESS EXCLUSIVE MODE;

    CREATE FUNCTION pg_temp.merge_member_profile_about(about jsonb, activities jsonb)
    RETURNS jsonb LANGUAGE plpgsql AS $$
    DECLARE
      activity_nodes jsonb := activities #> '{root,children}';
    BEGIN
      IF jsonb_typeof(activity_nodes) IS DISTINCT FROM 'array' THEN
        RAISE EXCEPTION 'Invalid club activities document in a member profile.';
      END IF;
      IF activity_nodes = '[]'::jsonb THEN
        RETURN about;
      END IF;
      IF about IS NULL OR about = 'null'::jsonb THEN
        RETURN activities;
      END IF;
      IF jsonb_typeof(about #> '{root,children}') IS DISTINCT FROM 'array' THEN
        RAISE EXCEPTION 'Invalid About document in a member profile.';
      END IF;
      RETURN jsonb_set(about, '{root,children}', (about #> '{root,children}') || activity_nodes);
    END;
    $$;
  `)

  const updatedProfiles = await db.execute<{ id: number; about: unknown }>(sql`
    UPDATE "member_profiles"
    SET "about" = pg_temp.merge_member_profile_about("about", "club_activities")
    WHERE "club_activities" IS NOT NULL AND "club_activities" <> 'null'::jsonb
    RETURNING "id", "about";
  `)

  for (const { id, about } of updatedProfiles.rows) {
    await db.execute(sql`
      UPDATE "content_listing_items"
      SET "excerpt" = ${extractRichTextText(about) || null}
      WHERE "source" = 'member-profiles' AND "source_document_id" = ${id};
    `)
  }

  await db.execute(sql`
    UPDATE "_member_profiles_v"
    SET "version_about" = pg_temp.merge_member_profile_about("version_about", "version_club_activities")
    WHERE "version_club_activities" IS NOT NULL AND "version_club_activities" <> 'null'::jsonb;

    ALTER TABLE "member_profiles" DROP COLUMN "club_activities";
    ALTER TABLE "_member_profiles_v" DROP COLUMN "version_club_activities";
    DROP FUNCTION pg_temp.merge_member_profile_about(jsonb, jsonb);
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Merged content stays in About because it may have been edited since the migration.
  await db.execute(sql`
    ALTER TABLE "member_profiles" ADD COLUMN "club_activities" jsonb;
    ALTER TABLE "_member_profiles_v" ADD COLUMN "version_club_activities" jsonb;
  `)
}
