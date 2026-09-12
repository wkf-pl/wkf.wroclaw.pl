import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

type CustomIconUsage = {
  record_id: number | string
  table_name: string
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  const customIconUsage = await db.execute(sql`
    SELECT 'club_sections_menu_items' AS table_name, id::text AS record_id
      FROM "club_sections_menu_items"
      WHERE "icon_source" = 'media' AND "custom_icon_id" IS NOT NULL
    UNION ALL
    SELECT '_club_sections_v_version_menu_items', id::text
      FROM "_club_sections_v_version_menu_items"
      WHERE "icon_source" = 'media' AND "custom_icon_id" IS NOT NULL
    UNION ALL
    SELECT 'navigation_header_items', id::text
      FROM "navigation_header_items"
      WHERE "icon_source" = 'media' AND "custom_icon_id" IS NOT NULL
    UNION ALL
    SELECT 'homepage_sections_groups_menu_items', id::text
      FROM "homepage_sections_groups_menu_items"
      WHERE "icon_source" = 'media' AND "custom_icon_id" IS NOT NULL
    UNION ALL
    SELECT 'footer_social_items', id::text
      FROM "footer_social_items"
      WHERE "icon_source" = 'media' AND "custom_icon_id" IS NOT NULL
    ORDER BY table_name, record_id
  `)
  const customIconRecords = customIconUsage.rows as CustomIconUsage[]

  if (customIconRecords.length > 0) {
    const recordList = customIconRecords
      .map(({ record_id, table_name }) => `${table_name}#${record_id}`)
      .join(', ')

    throw new Error(
      `Raster icon migration stopped because custom Media icons cannot be mapped safely. Replace these records with named icons first: ${recordList}`,
    )
  }

  await db.execute(sql`
   ALTER TYPE "public"."enum_club_sections_menu_items_system_icon" RENAME TO "enum_club_sections_menu_items_icon_name";
  ALTER TYPE "public"."enum__club_sections_v_version_menu_items_system_icon" RENAME TO "enum__club_sections_v_version_menu_items_icon_name";
  ALTER TYPE "public"."enum_navigation_header_items_system_icon" RENAME TO "enum_navigation_header_items_icon_name";
  ALTER TYPE "public"."enum_homepage_sections_groups_menu_items_system_icon" RENAME TO "enum_homepage_sections_groups_menu_items_icon_name";
  ALTER TYPE "public"."enum_footer_social_items_system_icon" RENAME TO "enum_footer_social_items_icon_name";
  ALTER TYPE "public"."enum_club_sections_menu_items_icon_name" ADD VALUE 'news' BEFORE 'time';
  ALTER TYPE "public"."enum_club_sections_menu_items_icon_name" ADD VALUE 'bluesky' BEFORE 'time';
  ALTER TYPE "public"."enum_club_sections_menu_items_icon_name" ADD VALUE 'document' BEFORE 'mail';
  ALTER TYPE "public"."enum_club_sections_menu_items_icon_name" ADD VALUE 'miniature' BEFORE 'star';
  ALTER TYPE "public"."enum_club_sections_menu_items_icon_name" ADD VALUE 'globe' BEFORE 'star';
  ALTER TYPE "public"."enum_club_sections_menu_items_icon_name" ADD VALUE 'cards' BEFORE 'collection';
  ALTER TYPE "public"."enum_club_sections_menu_items_icon_name" ADD VALUE 'controller' BEFORE 'dice';
  ALTER TYPE "public"."enum_club_sections_menu_items_icon_name" ADD VALUE 'external-link' BEFORE 'location';
  ALTER TYPE "public"."enum_club_sections_menu_items_icon_name" ADD VALUE 'linkedin' BEFORE 'location';
  ALTER TYPE "public"."enum_club_sections_menu_items_icon_name" ADD VALUE 'map' BEFORE 'pawn';
  ALTER TYPE "public"."enum_club_sections_menu_items_icon_name" ADD VALUE 'larp-mask' BEFORE 'pawn';
  ALTER TYPE "public"."enum_club_sections_menu_items_icon_name" ADD VALUE 'mastodon' BEFORE 'pawn';
  ALTER TYPE "public"."enum_club_sections_menu_items_icon_name" ADD VALUE 'messenger' BEFORE 'pawn';
  ALTER TYPE "public"."enum_club_sections_menu_items_icon_name" ADD VALUE 'sword' BEFORE 'pawn';
  ALTER TYPE "public"."enum_club_sections_menu_items_icon_name" ADD VALUE 'image' BEFORE 'pawn';
  ALTER TYPE "public"."enum_club_sections_menu_items_icon_name" ADD VALUE 'announcement' BEFORE 'pawn';
  ALTER TYPE "public"."enum_club_sections_menu_items_icon_name" ADD VALUE 'partner' BEFORE 'pawn';
  ALTER TYPE "public"."enum_club_sections_menu_items_icon_name" ADD VALUE 'pdf' BEFORE 'pawn';
  ALTER TYPE "public"."enum_club_sections_menu_items_icon_name" ADD VALUE 'download' BEFORE 'review';
  ALTER TYPE "public"."enum_club_sections_menu_items_icon_name" ADD VALUE 'home';
  ALTER TYPE "public"."enum_club_sections_menu_items_icon_name" ADD VALUE 'arrow-right';
  ALTER TYPE "public"."enum_club_sections_menu_items_icon_name" ADD VALUE 'tag';
  ALTER TYPE "public"."enum_club_sections_menu_items_icon_name" ADD VALUE 'twitch';
  ALTER TYPE "public"."enum_club_sections_menu_items_icon_name" ADD VALUE 'event';
  ALTER TYPE "public"."enum_club_sections_menu_items_icon_name" ADD VALUE 'youtube';
  ALTER TYPE "public"."enum__club_sections_v_version_menu_items_icon_name" ADD VALUE 'news' BEFORE 'time';
  ALTER TYPE "public"."enum__club_sections_v_version_menu_items_icon_name" ADD VALUE 'bluesky' BEFORE 'time';
  ALTER TYPE "public"."enum__club_sections_v_version_menu_items_icon_name" ADD VALUE 'document' BEFORE 'mail';
  ALTER TYPE "public"."enum__club_sections_v_version_menu_items_icon_name" ADD VALUE 'miniature' BEFORE 'star';
  ALTER TYPE "public"."enum__club_sections_v_version_menu_items_icon_name" ADD VALUE 'globe' BEFORE 'star';
  ALTER TYPE "public"."enum__club_sections_v_version_menu_items_icon_name" ADD VALUE 'cards' BEFORE 'collection';
  ALTER TYPE "public"."enum__club_sections_v_version_menu_items_icon_name" ADD VALUE 'controller' BEFORE 'dice';
  ALTER TYPE "public"."enum__club_sections_v_version_menu_items_icon_name" ADD VALUE 'external-link' BEFORE 'location';
  ALTER TYPE "public"."enum__club_sections_v_version_menu_items_icon_name" ADD VALUE 'linkedin' BEFORE 'location';
  ALTER TYPE "public"."enum__club_sections_v_version_menu_items_icon_name" ADD VALUE 'map' BEFORE 'pawn';
  ALTER TYPE "public"."enum__club_sections_v_version_menu_items_icon_name" ADD VALUE 'larp-mask' BEFORE 'pawn';
  ALTER TYPE "public"."enum__club_sections_v_version_menu_items_icon_name" ADD VALUE 'mastodon' BEFORE 'pawn';
  ALTER TYPE "public"."enum__club_sections_v_version_menu_items_icon_name" ADD VALUE 'messenger' BEFORE 'pawn';
  ALTER TYPE "public"."enum__club_sections_v_version_menu_items_icon_name" ADD VALUE 'sword' BEFORE 'pawn';
  ALTER TYPE "public"."enum__club_sections_v_version_menu_items_icon_name" ADD VALUE 'image' BEFORE 'pawn';
  ALTER TYPE "public"."enum__club_sections_v_version_menu_items_icon_name" ADD VALUE 'announcement' BEFORE 'pawn';
  ALTER TYPE "public"."enum__club_sections_v_version_menu_items_icon_name" ADD VALUE 'partner' BEFORE 'pawn';
  ALTER TYPE "public"."enum__club_sections_v_version_menu_items_icon_name" ADD VALUE 'pdf' BEFORE 'pawn';
  ALTER TYPE "public"."enum__club_sections_v_version_menu_items_icon_name" ADD VALUE 'download' BEFORE 'review';
  ALTER TYPE "public"."enum__club_sections_v_version_menu_items_icon_name" ADD VALUE 'home';
  ALTER TYPE "public"."enum__club_sections_v_version_menu_items_icon_name" ADD VALUE 'arrow-right';
  ALTER TYPE "public"."enum__club_sections_v_version_menu_items_icon_name" ADD VALUE 'tag';
  ALTER TYPE "public"."enum__club_sections_v_version_menu_items_icon_name" ADD VALUE 'twitch';
  ALTER TYPE "public"."enum__club_sections_v_version_menu_items_icon_name" ADD VALUE 'event';
  ALTER TYPE "public"."enum__club_sections_v_version_menu_items_icon_name" ADD VALUE 'youtube';
  ALTER TYPE "public"."enum_navigation_header_items_icon_name" ADD VALUE 'news' BEFORE 'time';
  ALTER TYPE "public"."enum_navigation_header_items_icon_name" ADD VALUE 'bluesky' BEFORE 'time';
  ALTER TYPE "public"."enum_navigation_header_items_icon_name" ADD VALUE 'document' BEFORE 'mail';
  ALTER TYPE "public"."enum_navigation_header_items_icon_name" ADD VALUE 'miniature' BEFORE 'star';
  ALTER TYPE "public"."enum_navigation_header_items_icon_name" ADD VALUE 'globe' BEFORE 'star';
  ALTER TYPE "public"."enum_navigation_header_items_icon_name" ADD VALUE 'cards' BEFORE 'collection';
  ALTER TYPE "public"."enum_navigation_header_items_icon_name" ADD VALUE 'controller' BEFORE 'dice';
  ALTER TYPE "public"."enum_navigation_header_items_icon_name" ADD VALUE 'external-link' BEFORE 'location';
  ALTER TYPE "public"."enum_navigation_header_items_icon_name" ADD VALUE 'linkedin' BEFORE 'location';
  ALTER TYPE "public"."enum_navigation_header_items_icon_name" ADD VALUE 'map' BEFORE 'pawn';
  ALTER TYPE "public"."enum_navigation_header_items_icon_name" ADD VALUE 'larp-mask' BEFORE 'pawn';
  ALTER TYPE "public"."enum_navigation_header_items_icon_name" ADD VALUE 'mastodon' BEFORE 'pawn';
  ALTER TYPE "public"."enum_navigation_header_items_icon_name" ADD VALUE 'messenger' BEFORE 'pawn';
  ALTER TYPE "public"."enum_navigation_header_items_icon_name" ADD VALUE 'sword' BEFORE 'pawn';
  ALTER TYPE "public"."enum_navigation_header_items_icon_name" ADD VALUE 'image' BEFORE 'pawn';
  ALTER TYPE "public"."enum_navigation_header_items_icon_name" ADD VALUE 'announcement' BEFORE 'pawn';
  ALTER TYPE "public"."enum_navigation_header_items_icon_name" ADD VALUE 'partner' BEFORE 'pawn';
  ALTER TYPE "public"."enum_navigation_header_items_icon_name" ADD VALUE 'pdf' BEFORE 'pawn';
  ALTER TYPE "public"."enum_navigation_header_items_icon_name" ADD VALUE 'download' BEFORE 'review';
  ALTER TYPE "public"."enum_navigation_header_items_icon_name" ADD VALUE 'home';
  ALTER TYPE "public"."enum_navigation_header_items_icon_name" ADD VALUE 'arrow-right';
  ALTER TYPE "public"."enum_navigation_header_items_icon_name" ADD VALUE 'tag';
  ALTER TYPE "public"."enum_navigation_header_items_icon_name" ADD VALUE 'twitch';
  ALTER TYPE "public"."enum_navigation_header_items_icon_name" ADD VALUE 'event';
  ALTER TYPE "public"."enum_navigation_header_items_icon_name" ADD VALUE 'youtube';
  ALTER TYPE "public"."enum_homepage_sections_groups_menu_items_icon_name" ADD VALUE 'news' BEFORE 'time';
  ALTER TYPE "public"."enum_homepage_sections_groups_menu_items_icon_name" ADD VALUE 'bluesky' BEFORE 'time';
  ALTER TYPE "public"."enum_homepage_sections_groups_menu_items_icon_name" ADD VALUE 'document' BEFORE 'mail';
  ALTER TYPE "public"."enum_homepage_sections_groups_menu_items_icon_name" ADD VALUE 'miniature' BEFORE 'star';
  ALTER TYPE "public"."enum_homepage_sections_groups_menu_items_icon_name" ADD VALUE 'globe' BEFORE 'star';
  ALTER TYPE "public"."enum_homepage_sections_groups_menu_items_icon_name" ADD VALUE 'cards' BEFORE 'collection';
  ALTER TYPE "public"."enum_homepage_sections_groups_menu_items_icon_name" ADD VALUE 'controller' BEFORE 'dice';
  ALTER TYPE "public"."enum_homepage_sections_groups_menu_items_icon_name" ADD VALUE 'external-link' BEFORE 'location';
  ALTER TYPE "public"."enum_homepage_sections_groups_menu_items_icon_name" ADD VALUE 'linkedin' BEFORE 'location';
  ALTER TYPE "public"."enum_homepage_sections_groups_menu_items_icon_name" ADD VALUE 'map' BEFORE 'pawn';
  ALTER TYPE "public"."enum_homepage_sections_groups_menu_items_icon_name" ADD VALUE 'larp-mask' BEFORE 'pawn';
  ALTER TYPE "public"."enum_homepage_sections_groups_menu_items_icon_name" ADD VALUE 'mastodon' BEFORE 'pawn';
  ALTER TYPE "public"."enum_homepage_sections_groups_menu_items_icon_name" ADD VALUE 'messenger' BEFORE 'pawn';
  ALTER TYPE "public"."enum_homepage_sections_groups_menu_items_icon_name" ADD VALUE 'sword' BEFORE 'pawn';
  ALTER TYPE "public"."enum_homepage_sections_groups_menu_items_icon_name" ADD VALUE 'image' BEFORE 'pawn';
  ALTER TYPE "public"."enum_homepage_sections_groups_menu_items_icon_name" ADD VALUE 'announcement' BEFORE 'pawn';
  ALTER TYPE "public"."enum_homepage_sections_groups_menu_items_icon_name" ADD VALUE 'partner' BEFORE 'pawn';
  ALTER TYPE "public"."enum_homepage_sections_groups_menu_items_icon_name" ADD VALUE 'pdf' BEFORE 'pawn';
  ALTER TYPE "public"."enum_homepage_sections_groups_menu_items_icon_name" ADD VALUE 'download' BEFORE 'review';
  ALTER TYPE "public"."enum_homepage_sections_groups_menu_items_icon_name" ADD VALUE 'home';
  ALTER TYPE "public"."enum_homepage_sections_groups_menu_items_icon_name" ADD VALUE 'arrow-right';
  ALTER TYPE "public"."enum_homepage_sections_groups_menu_items_icon_name" ADD VALUE 'tag';
  ALTER TYPE "public"."enum_homepage_sections_groups_menu_items_icon_name" ADD VALUE 'twitch';
  ALTER TYPE "public"."enum_homepage_sections_groups_menu_items_icon_name" ADD VALUE 'event';
  ALTER TYPE "public"."enum_homepage_sections_groups_menu_items_icon_name" ADD VALUE 'youtube';
  ALTER TYPE "public"."enum_footer_social_items_icon_name" ADD VALUE 'news' BEFORE 'time';
  ALTER TYPE "public"."enum_footer_social_items_icon_name" ADD VALUE 'bluesky' BEFORE 'time';
  ALTER TYPE "public"."enum_footer_social_items_icon_name" ADD VALUE 'document' BEFORE 'mail';
  ALTER TYPE "public"."enum_footer_social_items_icon_name" ADD VALUE 'miniature' BEFORE 'star';
  ALTER TYPE "public"."enum_footer_social_items_icon_name" ADD VALUE 'globe' BEFORE 'star';
  ALTER TYPE "public"."enum_footer_social_items_icon_name" ADD VALUE 'cards' BEFORE 'collection';
  ALTER TYPE "public"."enum_footer_social_items_icon_name" ADD VALUE 'controller' BEFORE 'dice';
  ALTER TYPE "public"."enum_footer_social_items_icon_name" ADD VALUE 'external-link' BEFORE 'location';
  ALTER TYPE "public"."enum_footer_social_items_icon_name" ADD VALUE 'linkedin' BEFORE 'location';
  ALTER TYPE "public"."enum_footer_social_items_icon_name" ADD VALUE 'map' BEFORE 'pawn';
  ALTER TYPE "public"."enum_footer_social_items_icon_name" ADD VALUE 'larp-mask' BEFORE 'pawn';
  ALTER TYPE "public"."enum_footer_social_items_icon_name" ADD VALUE 'mastodon' BEFORE 'pawn';
  ALTER TYPE "public"."enum_footer_social_items_icon_name" ADD VALUE 'messenger' BEFORE 'pawn';
  ALTER TYPE "public"."enum_footer_social_items_icon_name" ADD VALUE 'sword' BEFORE 'pawn';
  ALTER TYPE "public"."enum_footer_social_items_icon_name" ADD VALUE 'image' BEFORE 'pawn';
  ALTER TYPE "public"."enum_footer_social_items_icon_name" ADD VALUE 'announcement' BEFORE 'pawn';
  ALTER TYPE "public"."enum_footer_social_items_icon_name" ADD VALUE 'partner' BEFORE 'pawn';
  ALTER TYPE "public"."enum_footer_social_items_icon_name" ADD VALUE 'pdf' BEFORE 'pawn';
  ALTER TYPE "public"."enum_footer_social_items_icon_name" ADD VALUE 'download' BEFORE 'review';
  ALTER TYPE "public"."enum_footer_social_items_icon_name" ADD VALUE 'home';
  ALTER TYPE "public"."enum_footer_social_items_icon_name" ADD VALUE 'arrow-right';
  ALTER TYPE "public"."enum_footer_social_items_icon_name" ADD VALUE 'tag';
  ALTER TYPE "public"."enum_footer_social_items_icon_name" ADD VALUE 'twitch';
  ALTER TYPE "public"."enum_footer_social_items_icon_name" ADD VALUE 'event';
  ALTER TYPE "public"."enum_footer_social_items_icon_name" ADD VALUE 'youtube';
  ALTER TABLE "club_sections_menu_items" RENAME COLUMN "system_icon" TO "icon_name";
  ALTER TABLE "_club_sections_v_version_menu_items" RENAME COLUMN "system_icon" TO "icon_name";
  ALTER TABLE "navigation_header_items" RENAME COLUMN "system_icon" TO "icon_name";
  ALTER TABLE "homepage_sections_groups_menu_items" RENAME COLUMN "system_icon" TO "icon_name";
  ALTER TABLE "footer_social_items" RENAME COLUMN "system_icon" TO "icon_name";
  ALTER TABLE "club_sections_menu_items" DROP CONSTRAINT "club_sections_menu_items_custom_icon_id_media_id_fk";
  
  ALTER TABLE "_club_sections_v_version_menu_items" DROP CONSTRAINT "_club_sections_v_version_menu_items_custom_icon_id_media_id_fk";
  
  ALTER TABLE "navigation_header_items" DROP CONSTRAINT "navigation_header_items_custom_icon_id_media_id_fk";
  
  ALTER TABLE "homepage_sections_groups_menu_items" DROP CONSTRAINT "homepage_sections_groups_menu_items_custom_icon_id_media_id_fk";
  
  ALTER TABLE "footer_social_items" DROP CONSTRAINT "footer_social_items_custom_icon_id_media_id_fk";
  
  DROP INDEX "club_sections_menu_items_custom_icon_idx";
  DROP INDEX "_club_sections_v_version_menu_items_custom_icon_idx";
  DROP INDEX "navigation_header_items_custom_icon_idx";
  DROP INDEX "homepage_sections_groups_menu_items_custom_icon_idx";
  DROP INDEX "footer_social_items_custom_icon_idx";
  ALTER TABLE "club_sections_menu_items" DROP COLUMN "icon_source";
  ALTER TABLE "club_sections_menu_items" DROP COLUMN "custom_icon_id";
  ALTER TABLE "_club_sections_v_version_menu_items" DROP COLUMN "icon_source";
  ALTER TABLE "_club_sections_v_version_menu_items" DROP COLUMN "custom_icon_id";
  ALTER TABLE "navigation_header_items" DROP COLUMN "icon_source";
  ALTER TABLE "navigation_header_items" DROP COLUMN "custom_icon_id";
  ALTER TABLE "homepage_sections_groups_menu_items" DROP COLUMN "icon_source";
  ALTER TABLE "homepage_sections_groups_menu_items" DROP COLUMN "custom_icon_id";
  ALTER TABLE "footer_social_items" DROP COLUMN "icon_source";
  ALTER TABLE "footer_social_items" DROP COLUMN "custom_icon_id";
  DROP TYPE "public"."enum_club_sections_menu_items_icon_source";
  DROP TYPE "public"."enum__club_sections_v_version_menu_items_icon_source";
  DROP TYPE "public"."enum_navigation_header_items_icon_source";
  DROP TYPE "public"."enum_homepage_sections_groups_menu_items_icon_source";
  DROP TYPE "public"."enum_footer_social_items_icon_source";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_club_sections_menu_items_icon_source" AS ENUM('system', 'media');
  CREATE TYPE "public"."enum__club_sections_v_version_menu_items_icon_source" AS ENUM('system', 'media');
  CREATE TYPE "public"."enum_navigation_header_items_icon_source" AS ENUM('system', 'media');
  CREATE TYPE "public"."enum_homepage_sections_groups_menu_items_icon_source" AS ENUM('system', 'media');
  CREATE TYPE "public"."enum_footer_social_items_icon_source" AS ENUM('system', 'media');
  ALTER TYPE "public"."enum_club_sections_menu_items_icon_name" RENAME TO "enum_club_sections_menu_items_system_icon";
  ALTER TYPE "public"."enum__club_sections_v_version_menu_items_icon_name" RENAME TO "enum__club_sections_v_version_menu_items_system_icon";
  ALTER TYPE "public"."enum_navigation_header_items_icon_name" RENAME TO "enum_navigation_header_items_system_icon";
  ALTER TYPE "public"."enum_homepage_sections_groups_menu_items_icon_name" RENAME TO "enum_homepage_sections_groups_menu_items_system_icon";
  ALTER TYPE "public"."enum_footer_social_items_icon_name" RENAME TO "enum_footer_social_items_system_icon";
  ALTER TABLE "club_sections_menu_items" RENAME COLUMN "icon_name" TO "system_icon";
  ALTER TABLE "_club_sections_v_version_menu_items" RENAME COLUMN "icon_name" TO "system_icon";
  ALTER TABLE "navigation_header_items" RENAME COLUMN "icon_name" TO "system_icon";
  ALTER TABLE "homepage_sections_groups_menu_items" RENAME COLUMN "icon_name" TO "system_icon";
  ALTER TABLE "footer_social_items" RENAME COLUMN "icon_name" TO "system_icon";
  ALTER TABLE "club_sections_menu_items" ALTER COLUMN "system_icon" SET DATA TYPE text;
  DROP TYPE "public"."enum_club_sections_menu_items_system_icon";
  CREATE TYPE "public"."enum_club_sections_menu_items_system_icon" AS ENUM('time', 'discord', 'mail', 'facebook', 'star', 'instagram', 'calendar', 'collection', 'dice', 'book', 'location', 'pawn', 'review', 'slack', 'users');
  ALTER TABLE "club_sections_menu_items" ALTER COLUMN "system_icon" SET DATA TYPE "public"."enum_club_sections_menu_items_system_icon" USING "system_icon"::"public"."enum_club_sections_menu_items_system_icon";
  ALTER TABLE "_club_sections_v_version_menu_items" ALTER COLUMN "system_icon" SET DATA TYPE text;
  DROP TYPE "public"."enum__club_sections_v_version_menu_items_system_icon";
  CREATE TYPE "public"."enum__club_sections_v_version_menu_items_system_icon" AS ENUM('time', 'discord', 'mail', 'facebook', 'star', 'instagram', 'calendar', 'collection', 'dice', 'book', 'location', 'pawn', 'review', 'slack', 'users');
  ALTER TABLE "_club_sections_v_version_menu_items" ALTER COLUMN "system_icon" SET DATA TYPE "public"."enum__club_sections_v_version_menu_items_system_icon" USING "system_icon"::"public"."enum__club_sections_v_version_menu_items_system_icon";
  ALTER TABLE "navigation_header_items" ALTER COLUMN "system_icon" SET DATA TYPE text;
  DROP TYPE "public"."enum_navigation_header_items_system_icon";
  CREATE TYPE "public"."enum_navigation_header_items_system_icon" AS ENUM('time', 'discord', 'mail', 'facebook', 'star', 'instagram', 'calendar', 'collection', 'dice', 'book', 'location', 'pawn', 'review', 'slack', 'users');
  ALTER TABLE "navigation_header_items" ALTER COLUMN "system_icon" SET DATA TYPE "public"."enum_navigation_header_items_system_icon" USING "system_icon"::"public"."enum_navigation_header_items_system_icon";
  ALTER TABLE "homepage_sections_groups_menu_items" ALTER COLUMN "system_icon" SET DATA TYPE text;
  DROP TYPE "public"."enum_homepage_sections_groups_menu_items_system_icon";
  CREATE TYPE "public"."enum_homepage_sections_groups_menu_items_system_icon" AS ENUM('time', 'discord', 'mail', 'facebook', 'star', 'instagram', 'calendar', 'collection', 'dice', 'book', 'location', 'pawn', 'review', 'slack', 'users');
  ALTER TABLE "homepage_sections_groups_menu_items" ALTER COLUMN "system_icon" SET DATA TYPE "public"."enum_homepage_sections_groups_menu_items_system_icon" USING "system_icon"::"public"."enum_homepage_sections_groups_menu_items_system_icon";
  ALTER TABLE "footer_social_items" ALTER COLUMN "system_icon" SET DATA TYPE text;
  DROP TYPE "public"."enum_footer_social_items_system_icon";
  CREATE TYPE "public"."enum_footer_social_items_system_icon" AS ENUM('time', 'discord', 'mail', 'facebook', 'star', 'instagram', 'calendar', 'collection', 'dice', 'book', 'location', 'pawn', 'review', 'slack', 'users');
  ALTER TABLE "footer_social_items" ALTER COLUMN "system_icon" SET DATA TYPE "public"."enum_footer_social_items_system_icon" USING "system_icon"::"public"."enum_footer_social_items_system_icon";
  ALTER TABLE "club_sections_menu_items" ADD COLUMN "icon_source" "enum_club_sections_menu_items_icon_source" DEFAULT 'system';
  ALTER TABLE "club_sections_menu_items" ADD COLUMN "custom_icon_id" integer;
  ALTER TABLE "_club_sections_v_version_menu_items" ADD COLUMN "icon_source" "enum__club_sections_v_version_menu_items_icon_source" DEFAULT 'system';
  ALTER TABLE "_club_sections_v_version_menu_items" ADD COLUMN "custom_icon_id" integer;
  ALTER TABLE "navigation_header_items" ADD COLUMN "icon_source" "enum_navigation_header_items_icon_source" DEFAULT 'system';
  ALTER TABLE "navigation_header_items" ADD COLUMN "custom_icon_id" integer;
  ALTER TABLE "homepage_sections_groups_menu_items" ADD COLUMN "icon_source" "enum_homepage_sections_groups_menu_items_icon_source" DEFAULT 'system';
  ALTER TABLE "homepage_sections_groups_menu_items" ADD COLUMN "custom_icon_id" integer;
  ALTER TABLE "footer_social_items" ADD COLUMN "icon_source" "enum_footer_social_items_icon_source" DEFAULT 'system';
  ALTER TABLE "footer_social_items" ADD COLUMN "custom_icon_id" integer;
  ALTER TABLE "club_sections_menu_items" ADD CONSTRAINT "club_sections_menu_items_custom_icon_id_media_id_fk" FOREIGN KEY ("custom_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_club_sections_v_version_menu_items" ADD CONSTRAINT "_club_sections_v_version_menu_items_custom_icon_id_media_id_fk" FOREIGN KEY ("custom_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_header_items" ADD CONSTRAINT "navigation_header_items_custom_icon_id_media_id_fk" FOREIGN KEY ("custom_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_groups_menu_items" ADD CONSTRAINT "homepage_sections_groups_menu_items_custom_icon_id_media_id_fk" FOREIGN KEY ("custom_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_social_items" ADD CONSTRAINT "footer_social_items_custom_icon_id_media_id_fk" FOREIGN KEY ("custom_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "club_sections_menu_items_custom_icon_idx" ON "club_sections_menu_items" USING btree ("custom_icon_id");
  CREATE INDEX "_club_sections_v_version_menu_items_custom_icon_idx" ON "_club_sections_v_version_menu_items" USING btree ("custom_icon_id");
  CREATE INDEX "navigation_header_items_custom_icon_idx" ON "navigation_header_items" USING btree ("custom_icon_id");
  CREATE INDEX "homepage_sections_groups_menu_items_custom_icon_idx" ON "homepage_sections_groups_menu_items" USING btree ("custom_icon_id");
  CREATE INDEX "footer_social_items_custom_icon_idx" ON "footer_social_items" USING btree ("custom_icon_id");`)
}
