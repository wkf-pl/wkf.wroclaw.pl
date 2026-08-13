import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
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
  ALTER TABLE "navigation_social_items" ALTER COLUMN "system_icon" SET DATA TYPE text;
  DROP TYPE "public"."enum_navigation_social_items_system_icon";
  CREATE TYPE "public"."enum_navigation_social_items_system_icon" AS ENUM('time', 'discord', 'mail', 'facebook', 'star', 'instagram', 'calendar', 'collection', 'dice', 'book', 'location', 'pawn', 'review', 'slack', 'users');
  ALTER TABLE "navigation_social_items" ALTER COLUMN "system_icon" SET DATA TYPE "public"."enum_navigation_social_items_system_icon" USING "system_icon"::"public"."enum_navigation_social_items_system_icon";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   UPDATE "club_sections_menu_items" SET "system_icon" = NULL WHERE "system_icon" = 'slack';
  UPDATE "_club_sections_v_version_menu_items" SET "system_icon" = NULL WHERE "system_icon" = 'slack';
  UPDATE "navigation_header_items" SET "system_icon" = NULL WHERE "system_icon" = 'slack';
  UPDATE "navigation_social_items" SET "system_icon" = NULL WHERE "system_icon" = 'slack';
  ALTER TABLE "club_sections_menu_items" ALTER COLUMN "system_icon" SET DATA TYPE text;
  DROP TYPE "public"."enum_club_sections_menu_items_system_icon";
  CREATE TYPE "public"."enum_club_sections_menu_items_system_icon" AS ENUM('book', 'calendar', 'collection', 'dice', 'discord', 'facebook', 'instagram', 'location', 'mail', 'pawn', 'review', 'star', 'time', 'users');
  ALTER TABLE "club_sections_menu_items" ALTER COLUMN "system_icon" SET DATA TYPE "public"."enum_club_sections_menu_items_system_icon" USING "system_icon"::"public"."enum_club_sections_menu_items_system_icon";
  ALTER TABLE "_club_sections_v_version_menu_items" ALTER COLUMN "system_icon" SET DATA TYPE text;
  DROP TYPE "public"."enum__club_sections_v_version_menu_items_system_icon";
  CREATE TYPE "public"."enum__club_sections_v_version_menu_items_system_icon" AS ENUM('book', 'calendar', 'collection', 'dice', 'discord', 'facebook', 'instagram', 'location', 'mail', 'pawn', 'review', 'star', 'time', 'users');
  ALTER TABLE "_club_sections_v_version_menu_items" ALTER COLUMN "system_icon" SET DATA TYPE "public"."enum__club_sections_v_version_menu_items_system_icon" USING "system_icon"::"public"."enum__club_sections_v_version_menu_items_system_icon";
  ALTER TABLE "navigation_header_items" ALTER COLUMN "system_icon" SET DATA TYPE text;
  DROP TYPE "public"."enum_navigation_header_items_system_icon";
  CREATE TYPE "public"."enum_navigation_header_items_system_icon" AS ENUM('book', 'calendar', 'collection', 'dice', 'discord', 'facebook', 'instagram', 'location', 'mail', 'pawn', 'review', 'star', 'time', 'users');
  ALTER TABLE "navigation_header_items" ALTER COLUMN "system_icon" SET DATA TYPE "public"."enum_navigation_header_items_system_icon" USING "system_icon"::"public"."enum_navigation_header_items_system_icon";
  ALTER TABLE "navigation_social_items" ALTER COLUMN "system_icon" SET DATA TYPE text;
  DROP TYPE "public"."enum_navigation_social_items_system_icon";
  CREATE TYPE "public"."enum_navigation_social_items_system_icon" AS ENUM('book', 'calendar', 'collection', 'dice', 'discord', 'facebook', 'instagram', 'location', 'mail', 'pawn', 'review', 'star', 'time', 'users');
  ALTER TABLE "navigation_social_items" ALTER COLUMN "system_icon" SET DATA TYPE "public"."enum_navigation_social_items_system_icon" USING "system_icon"::"public"."enum_navigation_social_items_system_icon";`)
}
