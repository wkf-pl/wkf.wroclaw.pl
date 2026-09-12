import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "club_sections_menu_items" ALTER COLUMN "icon_name" SET DATA TYPE text;
  ALTER TABLE "_club_sections_v_version_menu_items" ALTER COLUMN "icon_name" SET DATA TYPE text;
  ALTER TABLE "navigation_header_items" ALTER COLUMN "icon_name" SET DATA TYPE text;
  ALTER TABLE "homepage_sections_groups_menu_items" ALTER COLUMN "icon_name" SET DATA TYPE text;
  ALTER TABLE "footer_social_items" ALTER COLUMN "icon_name" SET DATA TYPE text;
  UPDATE "club_sections_menu_items" SET "icon_name" = CASE "icon_name"
    WHEN 'map' THEN 'location'
    WHEN 'controller' THEN 'dice'
    WHEN 'mastodon' THEN 'globe'
    WHEN 'news' THEN 'announcement'
    WHEN 'miniature' THEN 'pawn'
    ELSE "icon_name" END;
  UPDATE "_club_sections_v_version_menu_items" SET "icon_name" = CASE "icon_name"
    WHEN 'map' THEN 'location'
    WHEN 'controller' THEN 'dice'
    WHEN 'mastodon' THEN 'globe'
    WHEN 'news' THEN 'announcement'
    WHEN 'miniature' THEN 'pawn'
    ELSE "icon_name" END;
  UPDATE "navigation_header_items" SET "icon_name" = CASE "icon_name"
    WHEN 'map' THEN 'location'
    WHEN 'controller' THEN 'dice'
    WHEN 'mastodon' THEN 'globe'
    WHEN 'news' THEN 'announcement'
    WHEN 'miniature' THEN 'pawn'
    ELSE "icon_name" END;
  UPDATE "homepage_sections_groups_menu_items" SET "icon_name" = CASE "icon_name"
    WHEN 'map' THEN 'location'
    WHEN 'controller' THEN 'dice'
    WHEN 'mastodon' THEN 'globe'
    WHEN 'news' THEN 'announcement'
    WHEN 'miniature' THEN 'pawn'
    ELSE "icon_name" END;
  UPDATE "footer_social_items" SET "icon_name" = CASE "icon_name"
    WHEN 'map' THEN 'location'
    WHEN 'controller' THEN 'dice'
    WHEN 'mastodon' THEN 'globe'
    WHEN 'news' THEN 'announcement'
    WHEN 'miniature' THEN 'pawn'
    ELSE "icon_name" END;
  DROP TYPE "public"."enum_club_sections_menu_items_icon_name";
  CREATE TYPE "public"."enum_club_sections_menu_items_icon_name" AS ENUM('bluesky', 'time', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'cards', 'collection', 'dice', 'book', 'external-link', 'linkedin', 'location', 'larp-mask', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'slack', 'users', 'home', 'arrow-right', 'tag', 'twitch', 'event', 'youtube');
  ALTER TABLE "club_sections_menu_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."enum_club_sections_menu_items_icon_name" USING "icon_name"::"public"."enum_club_sections_menu_items_icon_name";
  DROP TYPE "public"."enum__club_sections_v_version_menu_items_icon_name";
  CREATE TYPE "public"."enum__club_sections_v_version_menu_items_icon_name" AS ENUM('bluesky', 'time', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'cards', 'collection', 'dice', 'book', 'external-link', 'linkedin', 'location', 'larp-mask', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'slack', 'users', 'home', 'arrow-right', 'tag', 'twitch', 'event', 'youtube');
  ALTER TABLE "_club_sections_v_version_menu_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."enum__club_sections_v_version_menu_items_icon_name" USING "icon_name"::"public"."enum__club_sections_v_version_menu_items_icon_name";
  DROP TYPE "public"."enum_navigation_header_items_icon_name";
  CREATE TYPE "public"."enum_navigation_header_items_icon_name" AS ENUM('bluesky', 'time', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'cards', 'collection', 'dice', 'book', 'external-link', 'linkedin', 'location', 'larp-mask', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'slack', 'users', 'home', 'arrow-right', 'tag', 'twitch', 'event', 'youtube');
  ALTER TABLE "navigation_header_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."enum_navigation_header_items_icon_name" USING "icon_name"::"public"."enum_navigation_header_items_icon_name";
  DROP TYPE "public"."enum_homepage_sections_groups_menu_items_icon_name";
  CREATE TYPE "public"."enum_homepage_sections_groups_menu_items_icon_name" AS ENUM('bluesky', 'time', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'cards', 'collection', 'dice', 'book', 'external-link', 'linkedin', 'location', 'larp-mask', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'slack', 'users', 'home', 'arrow-right', 'tag', 'twitch', 'event', 'youtube');
  ALTER TABLE "homepage_sections_groups_menu_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."enum_homepage_sections_groups_menu_items_icon_name" USING "icon_name"::"public"."enum_homepage_sections_groups_menu_items_icon_name";
  DROP TYPE "public"."enum_footer_social_items_icon_name";
  CREATE TYPE "public"."enum_footer_social_items_icon_name" AS ENUM('bluesky', 'time', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'cards', 'collection', 'dice', 'book', 'external-link', 'linkedin', 'location', 'larp-mask', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'slack', 'users', 'home', 'arrow-right', 'tag', 'twitch', 'event', 'youtube');
  ALTER TABLE "footer_social_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."enum_footer_social_items_icon_name" USING "icon_name"::"public"."enum_footer_social_items_icon_name";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_club_sections_menu_items_icon_name" ADD VALUE 'news' BEFORE 'bluesky';
  ALTER TYPE "public"."enum_club_sections_menu_items_icon_name" ADD VALUE 'miniature' BEFORE 'globe';
  ALTER TYPE "public"."enum_club_sections_menu_items_icon_name" ADD VALUE 'controller' BEFORE 'dice';
  ALTER TYPE "public"."enum_club_sections_menu_items_icon_name" ADD VALUE 'map' BEFORE 'larp-mask';
  ALTER TYPE "public"."enum_club_sections_menu_items_icon_name" ADD VALUE 'mastodon' BEFORE 'messenger';
  ALTER TYPE "public"."enum__club_sections_v_version_menu_items_icon_name" ADD VALUE 'news' BEFORE 'bluesky';
  ALTER TYPE "public"."enum__club_sections_v_version_menu_items_icon_name" ADD VALUE 'miniature' BEFORE 'globe';
  ALTER TYPE "public"."enum__club_sections_v_version_menu_items_icon_name" ADD VALUE 'controller' BEFORE 'dice';
  ALTER TYPE "public"."enum__club_sections_v_version_menu_items_icon_name" ADD VALUE 'map' BEFORE 'larp-mask';
  ALTER TYPE "public"."enum__club_sections_v_version_menu_items_icon_name" ADD VALUE 'mastodon' BEFORE 'messenger';
  ALTER TYPE "public"."enum_navigation_header_items_icon_name" ADD VALUE 'news' BEFORE 'bluesky';
  ALTER TYPE "public"."enum_navigation_header_items_icon_name" ADD VALUE 'miniature' BEFORE 'globe';
  ALTER TYPE "public"."enum_navigation_header_items_icon_name" ADD VALUE 'controller' BEFORE 'dice';
  ALTER TYPE "public"."enum_navigation_header_items_icon_name" ADD VALUE 'map' BEFORE 'larp-mask';
  ALTER TYPE "public"."enum_navigation_header_items_icon_name" ADD VALUE 'mastodon' BEFORE 'messenger';
  ALTER TYPE "public"."enum_homepage_sections_groups_menu_items_icon_name" ADD VALUE 'news' BEFORE 'bluesky';
  ALTER TYPE "public"."enum_homepage_sections_groups_menu_items_icon_name" ADD VALUE 'miniature' BEFORE 'globe';
  ALTER TYPE "public"."enum_homepage_sections_groups_menu_items_icon_name" ADD VALUE 'controller' BEFORE 'dice';
  ALTER TYPE "public"."enum_homepage_sections_groups_menu_items_icon_name" ADD VALUE 'map' BEFORE 'larp-mask';
  ALTER TYPE "public"."enum_homepage_sections_groups_menu_items_icon_name" ADD VALUE 'mastodon' BEFORE 'messenger';
  ALTER TYPE "public"."enum_footer_social_items_icon_name" ADD VALUE 'news' BEFORE 'bluesky';
  ALTER TYPE "public"."enum_footer_social_items_icon_name" ADD VALUE 'miniature' BEFORE 'globe';
  ALTER TYPE "public"."enum_footer_social_items_icon_name" ADD VALUE 'controller' BEFORE 'dice';
  ALTER TYPE "public"."enum_footer_social_items_icon_name" ADD VALUE 'map' BEFORE 'larp-mask';
  ALTER TYPE "public"."enum_footer_social_items_icon_name" ADD VALUE 'mastodon' BEFORE 'messenger';`)
}
