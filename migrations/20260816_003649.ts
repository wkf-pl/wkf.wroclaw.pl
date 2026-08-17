import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_member_profiles_status" AS ENUM('draft', 'published');
    CREATE TYPE "public"."enum__member_profiles_v_version_status" AS ENUM('draft', 'published');

    CREATE FUNCTION pg_temp.wkf_rich_text(paragraphs text[])
    RETURNS jsonb
    LANGUAGE sql
    IMMUTABLE
    AS $function$
      SELECT jsonb_build_object(
        'root',
        jsonb_build_object(
          'children', COALESCE(
            jsonb_agg(
              jsonb_build_object(
                'children', jsonb_build_array(
                  jsonb_build_object(
                    'detail', 0,
                    'format', 0,
                    'mode', 'normal',
                    'style', '',
                    'text', paragraph,
                    'type', 'text',
                    'version', 1
                  )
                ),
                'direction', 'ltr',
                'format', '',
                'indent', 0,
                'textFormat', 0,
                'textStyle', '',
                'type', 'paragraph',
                'version', 1
              ) ORDER BY paragraph_order
            ) FILTER (WHERE btrim(paragraph) <> ''),
            '[]'::jsonb
          ),
          'direction', 'ltr',
          'format', '',
          'indent', 0,
          'type', 'root',
          'version', 1
        )
      )
      FROM unnest(paragraphs) WITH ORDINALITY AS source(paragraph, paragraph_order)
    $function$;

    ALTER TABLE "member_profiles" RENAME COLUMN "club_summary" TO "about";
    ALTER TABLE "_member_profiles_v" RENAME COLUMN "version_club_summary" TO "version_about";

    ALTER TABLE "member_profiles" ALTER COLUMN "about" SET DATA TYPE jsonb
      USING CASE
        WHEN "about" IS NULL OR btrim("about") = '' THEN NULL
        ELSE pg_temp.wkf_rich_text(ARRAY["about"])
      END;
    ALTER TABLE "_member_profiles_v" ALTER COLUMN "version_about" SET DATA TYPE jsonb
      USING CASE
        WHEN "version_about" IS NULL OR btrim("version_about") = '' THEN NULL
        ELSE pg_temp.wkf_rich_text(ARRAY["version_about"])
      END;

    ALTER TABLE "member_profiles" ADD COLUMN "interests" varchar;
    ALTER TABLE "member_profiles" ADD COLUMN "club_function" varchar;
    ALTER TABLE "member_profiles" ADD COLUMN "club_activities" jsonb;
    ALTER TABLE "member_profiles" ADD COLUMN "_status" "enum_member_profiles_status" DEFAULT 'draft';
    ALTER TABLE "_member_profiles_v" ADD COLUMN "version_interests" varchar;
    ALTER TABLE "_member_profiles_v" ADD COLUMN "version_club_function" varchar;
    ALTER TABLE "_member_profiles_v" ADD COLUMN "version_club_activities" jsonb;
    ALTER TABLE "_member_profiles_v" ADD COLUMN "version__status" "enum__member_profiles_v_version_status" DEFAULT 'draft';
    ALTER TABLE "_member_profiles_v" ADD COLUMN "latest" boolean;

    UPDATE "member_profiles" AS profile
    SET
      "interests" = (
        SELECT string_agg("label", ', ' ORDER BY "_order")
        FROM "member_profiles_interests"
        WHERE "_parent_id" = profile."id"
      ),
      "club_activities" = (
        SELECT CASE
          WHEN count(*) = 0 THEN NULL
          ELSE pg_temp.wkf_rich_text(array_agg("label" ORDER BY "_order"))
        END
        FROM "member_profiles_activities"
        WHERE "_parent_id" = profile."id"
      ),
      "_status" = CASE
        WHEN profile."is_published" THEN 'published'::"enum_member_profiles_status"
        ELSE 'draft'::"enum_member_profiles_status"
      END;

    UPDATE "_member_profiles_v" AS profile_version
    SET
      "version_interests" = (
        SELECT string_agg("label", ', ' ORDER BY "_order")
        FROM "_member_profiles_v_version_interests"
        WHERE "_parent_id" = profile_version."id"
      ),
      "version_club_activities" = (
        SELECT CASE
          WHEN count(*) = 0 THEN NULL
          ELSE pg_temp.wkf_rich_text(array_agg("label" ORDER BY "_order"))
        END
        FROM "_member_profiles_v_version_activities"
        WHERE "_parent_id" = profile_version."id"
      ),
      "version__status" = CASE
        WHEN profile_version."version_is_published" THEN 'published'::"enum__member_profiles_v_version_status"
        ELSE 'draft'::"enum__member_profiles_v_version_status"
      END,
      "latest" = false;

    UPDATE "_member_profiles_v" AS profile_version
    SET "latest" = true
    FROM (
      SELECT DISTINCT ON ("parent_id") "id"
      FROM "_member_profiles_v"
      WHERE "parent_id" IS NOT NULL
      ORDER BY "parent_id", "created_at" DESC, "id" DESC
    ) AS latest_version
    WHERE profile_version."id" = latest_version."id";

    ALTER TABLE "member_profiles_activities" DISABLE ROW LEVEL SECURITY;
    ALTER TABLE "member_profiles_interests" DISABLE ROW LEVEL SECURITY;
    ALTER TABLE "_member_profiles_v_version_activities" DISABLE ROW LEVEL SECURITY;
    ALTER TABLE "_member_profiles_v_version_interests" DISABLE ROW LEVEL SECURITY;
    DROP TABLE "member_profiles_activities" CASCADE;
    DROP TABLE "member_profiles_interests" CASCADE;
    DROP TABLE "_member_profiles_v_version_activities" CASCADE;
    DROP TABLE "_member_profiles_v_version_interests" CASCADE;

    DROP INDEX "member_profiles_is_published_idx";
    DROP INDEX "member_profiles_moderator_hidden_idx";
    DROP INDEX "_member_profiles_v_version_version_is_published_idx";
    DROP INDEX "_member_profiles_v_version_version_moderator_hidden_idx";
    ALTER TABLE "member_profiles_games" ALTER COLUMN "title" DROP NOT NULL;
    ALTER TABLE "member_profiles_contact_channels" ALTER COLUMN "type" DROP NOT NULL;
    ALTER TABLE "member_profiles_contact_channels" ALTER COLUMN "url" DROP NOT NULL;
    ALTER TABLE "member_profiles" ALTER COLUMN "owner_id" DROP NOT NULL;
    ALTER TABLE "member_profiles" ALTER COLUMN "public_name" DROP NOT NULL;
    ALTER TABLE "member_profiles" ALTER COLUMN "slug" DROP NOT NULL;
    ALTER TABLE "_member_profiles_v_version_games" ALTER COLUMN "title" DROP NOT NULL;
    ALTER TABLE "_member_profiles_v_version_contact_channels" ALTER COLUMN "type" DROP NOT NULL;
    ALTER TABLE "_member_profiles_v_version_contact_channels" ALTER COLUMN "url" DROP NOT NULL;
    ALTER TABLE "_member_profiles_v" ALTER COLUMN "version_owner_id" DROP NOT NULL;
    ALTER TABLE "_member_profiles_v" ALTER COLUMN "version_public_name" DROP NOT NULL;
    ALTER TABLE "_member_profiles_v" ALTER COLUMN "version_slug" DROP NOT NULL;
    CREATE INDEX "member_profiles__status_idx" ON "member_profiles" USING btree ("_status");
    CREATE INDEX "_member_profiles_v_version_version__status_idx" ON "_member_profiles_v" USING btree ("version__status");
    CREATE INDEX "_member_profiles_v_latest_idx" ON "_member_profiles_v" USING btree ("latest");
    ALTER TABLE "member_profiles" DROP COLUMN "is_published";
    ALTER TABLE "_member_profiles_v" DROP COLUMN "version_is_published";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    CREATE FUNCTION pg_temp.wkf_plain_text(document jsonb)
    RETURNS text
    LANGUAGE sql
    IMMUTABLE
    AS $function$
      SELECT string_agg(text_node #>> '{}', '' ORDER BY text_order)
      FROM jsonb_path_query(document, 'strict $.**.text')
        WITH ORDINALITY AS texts(text_node, text_order)
    $function$;

    CREATE TABLE "member_profiles_activities" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "label" varchar NOT NULL
    );
    CREATE TABLE "member_profiles_interests" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "label" varchar NOT NULL
    );
    CREATE TABLE "_member_profiles_v_version_activities" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "label" varchar NOT NULL,
      "_uuid" varchar
    );
    CREATE TABLE "_member_profiles_v_version_interests" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "label" varchar NOT NULL,
      "_uuid" varchar
    );

    INSERT INTO "member_profiles_activities" ("_order", "_parent_id", "id", "label")
    SELECT
      block_order - 1,
      profile."id",
      concat('restored-activity-', profile."id", '-', block_order),
      pg_temp.wkf_plain_text(block)
    FROM "member_profiles" AS profile
    CROSS JOIN LATERAL jsonb_array_elements(profile."club_activities"->'root'->'children')
      WITH ORDINALITY AS blocks(block, block_order)
    WHERE pg_temp.wkf_plain_text(block) <> '';

    INSERT INTO "member_profiles_interests" ("_order", "_parent_id", "id", "label")
    SELECT
      interest_order - 1,
      profile."id",
      concat('restored-interest-', profile."id", '-', interest_order),
      btrim(interest)
    FROM "member_profiles" AS profile
    CROSS JOIN LATERAL unnest(string_to_array(profile."interests", ','))
      WITH ORDINALITY AS interests(interest, interest_order)
    WHERE btrim(interest) <> '';

    INSERT INTO "_member_profiles_v_version_activities" ("_order", "_parent_id", "label")
    SELECT
      block_order - 1,
      profile_version."id",
      pg_temp.wkf_plain_text(block)
    FROM "_member_profiles_v" AS profile_version
    CROSS JOIN LATERAL jsonb_array_elements(profile_version."version_club_activities"->'root'->'children')
      WITH ORDINALITY AS blocks(block, block_order)
    WHERE pg_temp.wkf_plain_text(block) <> '';

    INSERT INTO "_member_profiles_v_version_interests" ("_order", "_parent_id", "label")
    SELECT
      interest_order - 1,
      profile_version."id",
      btrim(interest)
    FROM "_member_profiles_v" AS profile_version
    CROSS JOIN LATERAL unnest(string_to_array(profile_version."version_interests", ','))
      WITH ORDINALITY AS interests(interest, interest_order)
    WHERE btrim(interest) <> '';

    ALTER TABLE "member_profiles" ADD COLUMN "is_published" boolean DEFAULT false;
    ALTER TABLE "_member_profiles_v" ADD COLUMN "version_is_published" boolean DEFAULT false;
    UPDATE "member_profiles" SET "is_published" = "_status" = 'published';
    UPDATE "_member_profiles_v" SET "version_is_published" = "version__status" = 'published';

    ALTER TABLE "member_profiles" ALTER COLUMN "about" SET DATA TYPE varchar
      USING pg_temp.wkf_plain_text("about");
    ALTER TABLE "_member_profiles_v" ALTER COLUMN "version_about" SET DATA TYPE varchar
      USING pg_temp.wkf_plain_text("version_about");
    ALTER TABLE "member_profiles" RENAME COLUMN "about" TO "club_summary";
    ALTER TABLE "_member_profiles_v" RENAME COLUMN "version_about" TO "version_club_summary";

    DROP INDEX "member_profiles__status_idx";
    DROP INDEX "_member_profiles_v_version_version__status_idx";
    DROP INDEX "_member_profiles_v_latest_idx";
    DELETE FROM "member_profiles_games" WHERE "title" IS NULL;
    DELETE FROM "member_profiles_contact_channels" WHERE "type" IS NULL OR "url" IS NULL;
    DELETE FROM "_member_profiles_v_version_games" WHERE "title" IS NULL;
    DELETE FROM "_member_profiles_v_version_contact_channels" WHERE "type" IS NULL OR "url" IS NULL;
    ALTER TABLE "member_profiles_games" ALTER COLUMN "title" SET NOT NULL;
    ALTER TABLE "member_profiles_contact_channels" ALTER COLUMN "type" SET NOT NULL;
    ALTER TABLE "member_profiles_contact_channels" ALTER COLUMN "url" SET NOT NULL;
    ALTER TABLE "member_profiles" ALTER COLUMN "owner_id" SET NOT NULL;
    ALTER TABLE "member_profiles" ALTER COLUMN "public_name" SET NOT NULL;
    ALTER TABLE "member_profiles" ALTER COLUMN "slug" SET NOT NULL;
    ALTER TABLE "_member_profiles_v_version_games" ALTER COLUMN "title" SET NOT NULL;
    ALTER TABLE "_member_profiles_v_version_contact_channels" ALTER COLUMN "type" SET NOT NULL;
    ALTER TABLE "_member_profiles_v_version_contact_channels" ALTER COLUMN "url" SET NOT NULL;
    ALTER TABLE "_member_profiles_v" ALTER COLUMN "version_owner_id" SET NOT NULL;
    ALTER TABLE "_member_profiles_v" ALTER COLUMN "version_public_name" SET NOT NULL;
    ALTER TABLE "_member_profiles_v" ALTER COLUMN "version_slug" SET NOT NULL;
    ALTER TABLE "member_profiles_activities" ADD CONSTRAINT "member_profiles_activities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."member_profiles"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "member_profiles_interests" ADD CONSTRAINT "member_profiles_interests_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."member_profiles"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_member_profiles_v_version_activities" ADD CONSTRAINT "_member_profiles_v_version_activities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_member_profiles_v"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_member_profiles_v_version_interests" ADD CONSTRAINT "_member_profiles_v_version_interests_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_member_profiles_v"("id") ON DELETE cascade ON UPDATE no action;
    CREATE INDEX "member_profiles_activities_order_idx" ON "member_profiles_activities" USING btree ("_order");
    CREATE INDEX "member_profiles_activities_parent_id_idx" ON "member_profiles_activities" USING btree ("_parent_id");
    CREATE INDEX "member_profiles_interests_order_idx" ON "member_profiles_interests" USING btree ("_order");
    CREATE INDEX "member_profiles_interests_parent_id_idx" ON "member_profiles_interests" USING btree ("_parent_id");
    CREATE INDEX "_member_profiles_v_version_activities_order_idx" ON "_member_profiles_v_version_activities" USING btree ("_order");
    CREATE INDEX "_member_profiles_v_version_activities_parent_id_idx" ON "_member_profiles_v_version_activities" USING btree ("_parent_id");
    CREATE INDEX "_member_profiles_v_version_interests_order_idx" ON "_member_profiles_v_version_interests" USING btree ("_order");
    CREATE INDEX "_member_profiles_v_version_interests_parent_id_idx" ON "_member_profiles_v_version_interests" USING btree ("_parent_id");
    CREATE INDEX "member_profiles_is_published_idx" ON "member_profiles" USING btree ("is_published");
    CREATE INDEX "member_profiles_moderator_hidden_idx" ON "member_profiles" USING btree ("moderator_hidden");
    CREATE INDEX "_member_profiles_v_version_version_is_published_idx" ON "_member_profiles_v" USING btree ("version_is_published");
    CREATE INDEX "_member_profiles_v_version_version_moderator_hidden_idx" ON "_member_profiles_v" USING btree ("version_moderator_hidden");
    ALTER TABLE "member_profiles" DROP COLUMN "interests";
    ALTER TABLE "member_profiles" DROP COLUMN "club_function";
    ALTER TABLE "member_profiles" DROP COLUMN "club_activities";
    ALTER TABLE "member_profiles" DROP COLUMN "_status";
    ALTER TABLE "_member_profiles_v" DROP COLUMN "version_interests";
    ALTER TABLE "_member_profiles_v" DROP COLUMN "version_club_function";
    ALTER TABLE "_member_profiles_v" DROP COLUMN "version_club_activities";
    ALTER TABLE "_member_profiles_v" DROP COLUMN "version__status";
    ALTER TABLE "_member_profiles_v" DROP COLUMN "latest";
    DROP TYPE "public"."enum_member_profiles_status";
    DROP TYPE "public"."enum__member_profiles_v_version_status";
  `)
}
