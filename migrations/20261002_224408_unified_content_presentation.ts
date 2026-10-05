import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."hd_icon" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_pages_blocks_heading_heading_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum__pages_v_blocks_heading_heading_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_posts_blocks_heading_heading_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum__posts_v_blocks_heading_heading_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_events_blocks_heading_heading_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum__events_v_blocks_heading_heading_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_event_cycles_blocks_heading_heading_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_heading_heading_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_partners_blocks_heading_heading_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum__partners_v_blocks_heading_heading_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  DO $$
  DECLARE
    table_name text;
  BEGIN
    FOREACH table_name IN ARRAY ARRAY[
      'pages_blocks_column_layout_columns', 'pages_blocks_section_group_sections',
      '_pages_v_blocks_column_layout_columns', '_pages_v_blocks_section_group_sections',
      'posts_blocks_column_layout_columns', 'posts_blocks_section_group_sections',
      '_posts_v_blocks_column_layout_columns', '_posts_v_blocks_section_group_sections',
      'events_blocks_column_layout_columns', 'events_blocks_section_group_sections',
      '_events_v_blocks_column_layout_columns', '_events_v_blocks_section_group_sections',
      'event_cycles_blocks_column_layout_columns', 'event_cycles_blocks_section_group_sections',
      '_event_cycles_v_blocks_column_layout_columns', '_event_cycles_v_blocks_section_group_sections',
      'partners_blocks_column_layout_columns', 'partners_blocks_section_group_sections',
      '_partners_v_blocks_column_layout_columns', '_partners_v_blocks_section_group_sections'
    ] LOOP
      EXECUTE format('ALTER TABLE %I ALTER COLUMN surface DROP DEFAULT', table_name);
      EXECUTE format('ALTER TABLE %I ALTER COLUMN surface TYPE text USING surface::text', table_name);
    END LOOP;
  END $$;
  DROP TYPE "public"."sf";
  CREATE TYPE "public"."sf" AS ENUM('transparent', 'default', 'subtle', 'inverse', 'image');
  DO $$
  DECLARE
    table_name text;
  BEGIN
    FOREACH table_name IN ARRAY ARRAY[
      'pages_blocks_column_layout_columns', 'pages_blocks_section_group_sections',
      '_pages_v_blocks_column_layout_columns', '_pages_v_blocks_section_group_sections',
      'posts_blocks_column_layout_columns', 'posts_blocks_section_group_sections',
      '_posts_v_blocks_column_layout_columns', '_posts_v_blocks_section_group_sections',
      'events_blocks_column_layout_columns', 'events_blocks_section_group_sections',
      '_events_v_blocks_column_layout_columns', '_events_v_blocks_section_group_sections',
      'event_cycles_blocks_column_layout_columns', 'event_cycles_blocks_section_group_sections',
      '_event_cycles_v_blocks_column_layout_columns', '_event_cycles_v_blocks_section_group_sections',
      'partners_blocks_column_layout_columns', 'partners_blocks_section_group_sections',
      '_partners_v_blocks_column_layout_columns', '_partners_v_blocks_section_group_sections'
    ] LOOP
      EXECUTE format(
        'ALTER TABLE %I ALTER COLUMN surface TYPE sf USING (CASE WHEN surface = ''default'' THEN ''transparent'' ELSE surface END)::sf',
        table_name
      );
      EXECUTE format('ALTER TABLE %I ALTER COLUMN surface SET DEFAULT ''transparent''::sf', table_name);
    END LOOP;
  END $$;
  ALTER TABLE "pages_blocks_heading" RENAME COLUMN "text" TO "heading";
  ALTER TABLE "pages_blocks_heading" RENAME COLUMN "icon_name" TO "heading_icon_name";
  ALTER TABLE "_pages_v_blocks_heading" RENAME COLUMN "text" TO "heading";
  ALTER TABLE "_pages_v_blocks_heading" RENAME COLUMN "icon_name" TO "heading_icon_name";
  ALTER TABLE "posts_blocks_heading" RENAME COLUMN "text" TO "heading";
  ALTER TABLE "posts_blocks_heading" RENAME COLUMN "icon_name" TO "heading_icon_name";
  ALTER TABLE "_posts_v_blocks_heading" RENAME COLUMN "text" TO "heading";
  ALTER TABLE "_posts_v_blocks_heading" RENAME COLUMN "icon_name" TO "heading_icon_name";
  ALTER TABLE "events_blocks_heading" RENAME COLUMN "text" TO "heading";
  ALTER TABLE "events_blocks_heading" RENAME COLUMN "icon_name" TO "heading_icon_name";
  ALTER TABLE "_events_v_blocks_heading" RENAME COLUMN "text" TO "heading";
  ALTER TABLE "_events_v_blocks_heading" RENAME COLUMN "icon_name" TO "heading_icon_name";
  ALTER TABLE "event_cycles_blocks_heading" RENAME COLUMN "text" TO "heading";
  ALTER TABLE "event_cycles_blocks_heading" RENAME COLUMN "icon_name" TO "heading_icon_name";
  ALTER TABLE "_event_cycles_v_blocks_heading" RENAME COLUMN "text" TO "heading";
  ALTER TABLE "_event_cycles_v_blocks_heading" RENAME COLUMN "icon_name" TO "heading_icon_name";
  ALTER TABLE "partners_blocks_heading" RENAME COLUMN "text" TO "heading";
  ALTER TABLE "partners_blocks_heading" RENAME COLUMN "icon_name" TO "heading_icon_name";
  ALTER TABLE "_partners_v_blocks_heading" RENAME COLUMN "text" TO "heading";
  ALTER TABLE "_partners_v_blocks_heading" RENAME COLUMN "icon_name" TO "heading_icon_name";
  DO $$
  DECLARE
    table_name text;
    enum_name text;
  BEGIN
    FOREACH table_name IN ARRAY ARRAY[
      'pages_blocks_heading', '_pages_v_blocks_heading',
      'posts_blocks_heading', '_posts_v_blocks_heading',
      'events_blocks_heading', '_events_v_blocks_heading',
      'event_cycles_blocks_heading', '_event_cycles_v_blocks_heading',
      'partners_blocks_heading', '_partners_v_blocks_heading'
    ] LOOP
      enum_name := 'enum_' || table_name || '_heading_icon_name';
      EXECUTE format(
        'ALTER TABLE %I ALTER COLUMN heading_icon_name TYPE %I USING heading_icon_name::text::%I',
        table_name,
        enum_name,
        enum_name
      );
    END LOOP;
  END $$;
  ALTER TABLE "pages_blocks_column_layout_columns" ALTER COLUMN "surface" SET DEFAULT 'transparent';
  ALTER TABLE "pages_blocks_section_group_sections" ALTER COLUMN "surface" SET DEFAULT 'transparent';
  ALTER TABLE "_pages_v_blocks_column_layout_columns" ALTER COLUMN "surface" SET DEFAULT 'transparent';
  ALTER TABLE "_pages_v_blocks_section_group_sections" ALTER COLUMN "surface" SET DEFAULT 'transparent';
  ALTER TABLE "posts_blocks_column_layout_columns" ALTER COLUMN "surface" SET DEFAULT 'transparent';
  ALTER TABLE "posts_blocks_section_group_sections" ALTER COLUMN "surface" SET DEFAULT 'transparent';
  ALTER TABLE "_posts_v_blocks_column_layout_columns" ALTER COLUMN "surface" SET DEFAULT 'transparent';
  ALTER TABLE "_posts_v_blocks_section_group_sections" ALTER COLUMN "surface" SET DEFAULT 'transparent';
  ALTER TABLE "events_blocks_column_layout_columns" ALTER COLUMN "surface" SET DEFAULT 'transparent';
  ALTER TABLE "events_blocks_section_group_sections" ALTER COLUMN "surface" SET DEFAULT 'transparent';
  ALTER TABLE "_events_v_blocks_column_layout_columns" ALTER COLUMN "surface" SET DEFAULT 'transparent';
  ALTER TABLE "_events_v_blocks_section_group_sections" ALTER COLUMN "surface" SET DEFAULT 'transparent';
  ALTER TABLE "event_cycles_blocks_column_layout_columns" ALTER COLUMN "surface" SET DEFAULT 'transparent';
  ALTER TABLE "event_cycles_blocks_section_group_sections" ALTER COLUMN "surface" SET DEFAULT 'transparent';
  ALTER TABLE "_event_cycles_v_blocks_column_layout_columns" ALTER COLUMN "surface" SET DEFAULT 'transparent';
  ALTER TABLE "_event_cycles_v_blocks_section_group_sections" ALTER COLUMN "surface" SET DEFAULT 'transparent';
  ALTER TABLE "partners_blocks_column_layout_columns" ALTER COLUMN "surface" SET DEFAULT 'transparent';
  ALTER TABLE "partners_blocks_section_group_sections" ALTER COLUMN "surface" SET DEFAULT 'transparent';
  ALTER TABLE "_partners_v_blocks_column_layout_columns" ALTER COLUMN "surface" SET DEFAULT 'transparent';
  ALTER TABLE "_partners_v_blocks_section_group_sections" ALTER COLUMN "surface" SET DEFAULT 'transparent';
  DO $$
  DECLARE
    table_name text;
  BEGIN
    FOREACH table_name IN ARRAY ARRAY[
      'pages_blocks_section_group', '_pages_v_blocks_section_group',
      'posts_blocks_section_group', '_posts_v_blocks_section_group',
      'events_blocks_section_group', '_events_v_blocks_section_group',
      'event_cycles_blocks_section_group', '_event_cycles_v_blocks_section_group',
      'partners_blocks_section_group', '_partners_v_blocks_section_group'
    ] LOOP
      EXECUTE format('ALTER TABLE %I ALTER COLUMN frame DROP DEFAULT', table_name);
      EXECUTE format(
        'ALTER TABLE %I ALTER COLUMN frame TYPE boolean USING (frame::text = ''outline'')',
        table_name
      );
      EXECUTE format('ALTER TABLE %I ALTER COLUMN frame SET DEFAULT false', table_name);
    END LOOP;
  END $$;
  ALTER TABLE "pages_blocks_rich_text" ADD COLUMN "heading" varchar;
  ALTER TABLE "pages_blocks_rich_text" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "pages_blocks_rich_text" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_rich_text" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "pages_blocks_rich_text" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "pages_blocks_rich_text" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "pages_blocks_rich_text" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "pages_blocks_listing" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "pages_blocks_listing" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_listing" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "pages_blocks_listing" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "pages_blocks_listing" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "pages_blocks_listing" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "pages_blocks_media_gallery" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "pages_blocks_media_gallery" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_media_gallery" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "pages_blocks_media_gallery" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "pages_blocks_media_gallery" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "pages_blocks_media_gallery" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "pages_blocks_documents" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "pages_blocks_documents" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_documents" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "pages_blocks_documents" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "pages_blocks_documents" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "pages_blocks_documents" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "pages_blocks_attachments" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "pages_blocks_attachments" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_attachments" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "pages_blocks_attachments" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "pages_blocks_attachments" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "pages_blocks_attachments" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "pages_blocks_member_profiles" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "pages_blocks_member_profiles" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_member_profiles" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "pages_blocks_member_profiles" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "pages_blocks_member_profiles" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "pages_blocks_member_profiles" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "pages_blocks_column_layout_columns" ADD COLUMN "heading" varchar;
  ALTER TABLE "pages_blocks_column_layout_columns" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "pages_blocks_column_layout_columns" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_column_layout" ADD COLUMN "heading" varchar;
  ALTER TABLE "pages_blocks_column_layout" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "pages_blocks_column_layout" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_column_layout" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "pages_blocks_column_layout" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "pages_blocks_column_layout" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "pages_blocks_column_layout" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "pages_blocks_section_group_sections" ADD COLUMN "heading" varchar;
  ALTER TABLE "pages_blocks_section_group_sections" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "pages_blocks_section_group_sections" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_section_group" ADD COLUMN "heading" varchar;
  ALTER TABLE "pages_blocks_section_group" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "pages_blocks_section_group" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "pages_blocks_section_group" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "pages_blocks_section_group" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "pages_blocks_section_group" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "_pages_v_blocks_rich_text" ADD COLUMN "heading" varchar;
  ALTER TABLE "_pages_v_blocks_rich_text" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_pages_v_blocks_rich_text" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_rich_text" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "_pages_v_blocks_rich_text" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "_pages_v_blocks_rich_text" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "_pages_v_blocks_rich_text" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "_pages_v_blocks_listing" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_pages_v_blocks_listing" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_listing" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "_pages_v_blocks_listing" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "_pages_v_blocks_listing" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "_pages_v_blocks_listing" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "_pages_v_blocks_media_gallery" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_pages_v_blocks_media_gallery" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_media_gallery" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "_pages_v_blocks_media_gallery" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "_pages_v_blocks_media_gallery" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "_pages_v_blocks_media_gallery" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "_pages_v_blocks_documents" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_pages_v_blocks_documents" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_documents" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "_pages_v_blocks_documents" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "_pages_v_blocks_documents" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "_pages_v_blocks_documents" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "_pages_v_blocks_attachments" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_pages_v_blocks_attachments" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_attachments" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "_pages_v_blocks_attachments" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "_pages_v_blocks_attachments" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "_pages_v_blocks_attachments" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "_pages_v_blocks_member_profiles" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_pages_v_blocks_member_profiles" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_member_profiles" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "_pages_v_blocks_member_profiles" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "_pages_v_blocks_member_profiles" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "_pages_v_blocks_member_profiles" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "_pages_v_blocks_column_layout_columns" ADD COLUMN "heading" varchar;
  ALTER TABLE "_pages_v_blocks_column_layout_columns" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_pages_v_blocks_column_layout_columns" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_column_layout" ADD COLUMN "heading" varchar;
  ALTER TABLE "_pages_v_blocks_column_layout" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_pages_v_blocks_column_layout" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_column_layout" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "_pages_v_blocks_column_layout" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "_pages_v_blocks_column_layout" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "_pages_v_blocks_column_layout" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "_pages_v_blocks_section_group_sections" ADD COLUMN "heading" varchar;
  ALTER TABLE "_pages_v_blocks_section_group_sections" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_pages_v_blocks_section_group_sections" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_section_group" ADD COLUMN "heading" varchar;
  ALTER TABLE "_pages_v_blocks_section_group" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_pages_v_blocks_section_group" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "_pages_v_blocks_section_group" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "_pages_v_blocks_section_group" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "_pages_v_blocks_section_group" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "posts_blocks_rich_text" ADD COLUMN "heading" varchar;
  ALTER TABLE "posts_blocks_rich_text" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "posts_blocks_rich_text" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "posts_blocks_rich_text" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "posts_blocks_rich_text" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "posts_blocks_rich_text" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "posts_blocks_rich_text" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "posts_blocks_listing" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "posts_blocks_listing" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "posts_blocks_listing" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "posts_blocks_listing" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "posts_blocks_listing" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "posts_blocks_listing" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "posts_blocks_media_gallery" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "posts_blocks_media_gallery" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "posts_blocks_media_gallery" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "posts_blocks_media_gallery" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "posts_blocks_media_gallery" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "posts_blocks_media_gallery" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "posts_blocks_documents" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "posts_blocks_documents" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "posts_blocks_documents" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "posts_blocks_documents" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "posts_blocks_documents" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "posts_blocks_documents" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "posts_blocks_attachments" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "posts_blocks_attachments" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "posts_blocks_attachments" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "posts_blocks_attachments" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "posts_blocks_attachments" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "posts_blocks_attachments" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "posts_blocks_member_profiles" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "posts_blocks_member_profiles" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "posts_blocks_member_profiles" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "posts_blocks_member_profiles" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "posts_blocks_member_profiles" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "posts_blocks_member_profiles" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "posts_blocks_column_layout_columns" ADD COLUMN "heading" varchar;
  ALTER TABLE "posts_blocks_column_layout_columns" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "posts_blocks_column_layout_columns" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "posts_blocks_column_layout" ADD COLUMN "heading" varchar;
  ALTER TABLE "posts_blocks_column_layout" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "posts_blocks_column_layout" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "posts_blocks_column_layout" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "posts_blocks_column_layout" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "posts_blocks_column_layout" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "posts_blocks_column_layout" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "posts_blocks_section_group_sections" ADD COLUMN "heading" varchar;
  ALTER TABLE "posts_blocks_section_group_sections" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "posts_blocks_section_group_sections" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "posts_blocks_section_group" ADD COLUMN "heading" varchar;
  ALTER TABLE "posts_blocks_section_group" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "posts_blocks_section_group" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "posts_blocks_section_group" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "posts_blocks_section_group" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "posts_blocks_section_group" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "_posts_v_blocks_rich_text" ADD COLUMN "heading" varchar;
  ALTER TABLE "_posts_v_blocks_rich_text" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_posts_v_blocks_rich_text" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "_posts_v_blocks_rich_text" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "_posts_v_blocks_rich_text" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "_posts_v_blocks_rich_text" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "_posts_v_blocks_rich_text" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "_posts_v_blocks_listing" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_posts_v_blocks_listing" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "_posts_v_blocks_listing" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "_posts_v_blocks_listing" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "_posts_v_blocks_listing" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "_posts_v_blocks_listing" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "_posts_v_blocks_media_gallery" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_posts_v_blocks_media_gallery" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "_posts_v_blocks_media_gallery" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "_posts_v_blocks_media_gallery" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "_posts_v_blocks_media_gallery" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "_posts_v_blocks_media_gallery" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "_posts_v_blocks_documents" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_posts_v_blocks_documents" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "_posts_v_blocks_documents" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "_posts_v_blocks_documents" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "_posts_v_blocks_documents" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "_posts_v_blocks_documents" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "_posts_v_blocks_attachments" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_posts_v_blocks_attachments" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "_posts_v_blocks_attachments" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "_posts_v_blocks_attachments" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "_posts_v_blocks_attachments" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "_posts_v_blocks_attachments" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "_posts_v_blocks_member_profiles" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_posts_v_blocks_member_profiles" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "_posts_v_blocks_member_profiles" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "_posts_v_blocks_member_profiles" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "_posts_v_blocks_member_profiles" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "_posts_v_blocks_member_profiles" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "_posts_v_blocks_column_layout_columns" ADD COLUMN "heading" varchar;
  ALTER TABLE "_posts_v_blocks_column_layout_columns" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_posts_v_blocks_column_layout_columns" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "_posts_v_blocks_column_layout" ADD COLUMN "heading" varchar;
  ALTER TABLE "_posts_v_blocks_column_layout" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_posts_v_blocks_column_layout" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "_posts_v_blocks_column_layout" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "_posts_v_blocks_column_layout" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "_posts_v_blocks_column_layout" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "_posts_v_blocks_column_layout" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "_posts_v_blocks_section_group_sections" ADD COLUMN "heading" varchar;
  ALTER TABLE "_posts_v_blocks_section_group_sections" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_posts_v_blocks_section_group_sections" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "_posts_v_blocks_section_group" ADD COLUMN "heading" varchar;
  ALTER TABLE "_posts_v_blocks_section_group" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_posts_v_blocks_section_group" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "_posts_v_blocks_section_group" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "_posts_v_blocks_section_group" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "_posts_v_blocks_section_group" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "events_blocks_rich_text" ADD COLUMN "heading" varchar;
  ALTER TABLE "events_blocks_rich_text" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "events_blocks_rich_text" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "events_blocks_rich_text" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "events_blocks_rich_text" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "events_blocks_rich_text" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "events_blocks_rich_text" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "events_blocks_listing" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "events_blocks_listing" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "events_blocks_listing" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "events_blocks_listing" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "events_blocks_listing" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "events_blocks_listing" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "events_blocks_media_gallery" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "events_blocks_media_gallery" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "events_blocks_media_gallery" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "events_blocks_media_gallery" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "events_blocks_media_gallery" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "events_blocks_media_gallery" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "events_blocks_documents" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "events_blocks_documents" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "events_blocks_documents" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "events_blocks_documents" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "events_blocks_documents" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "events_blocks_documents" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "events_blocks_attachments" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "events_blocks_attachments" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "events_blocks_attachments" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "events_blocks_attachments" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "events_blocks_attachments" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "events_blocks_attachments" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "events_blocks_member_profiles" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "events_blocks_member_profiles" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "events_blocks_member_profiles" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "events_blocks_member_profiles" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "events_blocks_member_profiles" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "events_blocks_member_profiles" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "events_blocks_column_layout_columns" ADD COLUMN "heading" varchar;
  ALTER TABLE "events_blocks_column_layout_columns" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "events_blocks_column_layout_columns" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "events_blocks_column_layout" ADD COLUMN "heading" varchar;
  ALTER TABLE "events_blocks_column_layout" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "events_blocks_column_layout" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "events_blocks_column_layout" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "events_blocks_column_layout" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "events_blocks_column_layout" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "events_blocks_column_layout" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "events_blocks_section_group_sections" ADD COLUMN "heading" varchar;
  ALTER TABLE "events_blocks_section_group_sections" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "events_blocks_section_group_sections" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "events_blocks_section_group" ADD COLUMN "heading" varchar;
  ALTER TABLE "events_blocks_section_group" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "events_blocks_section_group" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "events_blocks_section_group" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "events_blocks_section_group" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "events_blocks_section_group" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "_events_v_blocks_rich_text" ADD COLUMN "heading" varchar;
  ALTER TABLE "_events_v_blocks_rich_text" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_events_v_blocks_rich_text" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "_events_v_blocks_rich_text" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "_events_v_blocks_rich_text" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "_events_v_blocks_rich_text" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "_events_v_blocks_rich_text" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "_events_v_blocks_listing" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_events_v_blocks_listing" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "_events_v_blocks_listing" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "_events_v_blocks_listing" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "_events_v_blocks_listing" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "_events_v_blocks_listing" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "_events_v_blocks_media_gallery" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_events_v_blocks_media_gallery" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "_events_v_blocks_media_gallery" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "_events_v_blocks_media_gallery" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "_events_v_blocks_media_gallery" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "_events_v_blocks_media_gallery" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "_events_v_blocks_documents" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_events_v_blocks_documents" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "_events_v_blocks_documents" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "_events_v_blocks_documents" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "_events_v_blocks_documents" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "_events_v_blocks_documents" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "_events_v_blocks_attachments" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_events_v_blocks_attachments" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "_events_v_blocks_attachments" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "_events_v_blocks_attachments" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "_events_v_blocks_attachments" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "_events_v_blocks_attachments" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "_events_v_blocks_member_profiles" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_events_v_blocks_member_profiles" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "_events_v_blocks_member_profiles" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "_events_v_blocks_member_profiles" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "_events_v_blocks_member_profiles" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "_events_v_blocks_member_profiles" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "_events_v_blocks_column_layout_columns" ADD COLUMN "heading" varchar;
  ALTER TABLE "_events_v_blocks_column_layout_columns" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_events_v_blocks_column_layout_columns" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "_events_v_blocks_column_layout" ADD COLUMN "heading" varchar;
  ALTER TABLE "_events_v_blocks_column_layout" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_events_v_blocks_column_layout" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "_events_v_blocks_column_layout" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "_events_v_blocks_column_layout" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "_events_v_blocks_column_layout" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "_events_v_blocks_column_layout" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "_events_v_blocks_section_group_sections" ADD COLUMN "heading" varchar;
  ALTER TABLE "_events_v_blocks_section_group_sections" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_events_v_blocks_section_group_sections" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "_events_v_blocks_section_group" ADD COLUMN "heading" varchar;
  ALTER TABLE "_events_v_blocks_section_group" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_events_v_blocks_section_group" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "_events_v_blocks_section_group" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "_events_v_blocks_section_group" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "_events_v_blocks_section_group" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "event_cycles_blocks_rich_text" ADD COLUMN "heading" varchar;
  ALTER TABLE "event_cycles_blocks_rich_text" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "event_cycles_blocks_rich_text" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "event_cycles_blocks_rich_text" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "event_cycles_blocks_rich_text" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "event_cycles_blocks_rich_text" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "event_cycles_blocks_rich_text" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "event_cycles_blocks_listing" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "event_cycles_blocks_listing" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "event_cycles_blocks_listing" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "event_cycles_blocks_listing" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "event_cycles_blocks_listing" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "event_cycles_blocks_listing" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "event_cycles_blocks_media_gallery" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "event_cycles_blocks_media_gallery" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "event_cycles_blocks_media_gallery" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "event_cycles_blocks_media_gallery" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "event_cycles_blocks_media_gallery" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "event_cycles_blocks_media_gallery" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "event_cycles_blocks_documents" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "event_cycles_blocks_documents" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "event_cycles_blocks_documents" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "event_cycles_blocks_documents" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "event_cycles_blocks_documents" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "event_cycles_blocks_documents" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "event_cycles_blocks_attachments" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "event_cycles_blocks_attachments" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "event_cycles_blocks_attachments" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "event_cycles_blocks_attachments" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "event_cycles_blocks_attachments" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "event_cycles_blocks_attachments" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "event_cycles_blocks_member_profiles" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "event_cycles_blocks_member_profiles" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "event_cycles_blocks_member_profiles" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "event_cycles_blocks_member_profiles" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "event_cycles_blocks_member_profiles" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "event_cycles_blocks_member_profiles" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "event_cycles_blocks_column_layout_columns" ADD COLUMN "heading" varchar;
  ALTER TABLE "event_cycles_blocks_column_layout_columns" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "event_cycles_blocks_column_layout_columns" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "event_cycles_blocks_column_layout" ADD COLUMN "heading" varchar;
  ALTER TABLE "event_cycles_blocks_column_layout" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "event_cycles_blocks_column_layout" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "event_cycles_blocks_column_layout" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "event_cycles_blocks_column_layout" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "event_cycles_blocks_column_layout" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "event_cycles_blocks_column_layout" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "event_cycles_blocks_section_group_sections" ADD COLUMN "heading" varchar;
  ALTER TABLE "event_cycles_blocks_section_group_sections" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "event_cycles_blocks_section_group_sections" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "event_cycles_blocks_section_group" ADD COLUMN "heading" varchar;
  ALTER TABLE "event_cycles_blocks_section_group" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "event_cycles_blocks_section_group" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "event_cycles_blocks_section_group" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "event_cycles_blocks_section_group" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "event_cycles_blocks_section_group" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "_event_cycles_v_blocks_rich_text" ADD COLUMN "heading" varchar;
  ALTER TABLE "_event_cycles_v_blocks_rich_text" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_event_cycles_v_blocks_rich_text" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "_event_cycles_v_blocks_rich_text" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "_event_cycles_v_blocks_rich_text" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "_event_cycles_v_blocks_rich_text" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "_event_cycles_v_blocks_rich_text" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "_event_cycles_v_blocks_listing" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_event_cycles_v_blocks_listing" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "_event_cycles_v_blocks_listing" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "_event_cycles_v_blocks_listing" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "_event_cycles_v_blocks_listing" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "_event_cycles_v_blocks_listing" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "_event_cycles_v_blocks_media_gallery" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_event_cycles_v_blocks_media_gallery" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "_event_cycles_v_blocks_media_gallery" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "_event_cycles_v_blocks_media_gallery" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "_event_cycles_v_blocks_media_gallery" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "_event_cycles_v_blocks_media_gallery" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "_event_cycles_v_blocks_documents" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_event_cycles_v_blocks_documents" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "_event_cycles_v_blocks_documents" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "_event_cycles_v_blocks_documents" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "_event_cycles_v_blocks_documents" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "_event_cycles_v_blocks_documents" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "_event_cycles_v_blocks_attachments" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_event_cycles_v_blocks_attachments" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "_event_cycles_v_blocks_attachments" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "_event_cycles_v_blocks_attachments" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "_event_cycles_v_blocks_attachments" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "_event_cycles_v_blocks_attachments" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "_event_cycles_v_blocks_member_profiles" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_event_cycles_v_blocks_member_profiles" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "_event_cycles_v_blocks_member_profiles" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "_event_cycles_v_blocks_member_profiles" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "_event_cycles_v_blocks_member_profiles" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "_event_cycles_v_blocks_member_profiles" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "_event_cycles_v_blocks_column_layout_columns" ADD COLUMN "heading" varchar;
  ALTER TABLE "_event_cycles_v_blocks_column_layout_columns" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_event_cycles_v_blocks_column_layout_columns" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "_event_cycles_v_blocks_column_layout" ADD COLUMN "heading" varchar;
  ALTER TABLE "_event_cycles_v_blocks_column_layout" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_event_cycles_v_blocks_column_layout" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "_event_cycles_v_blocks_column_layout" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "_event_cycles_v_blocks_column_layout" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "_event_cycles_v_blocks_column_layout" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "_event_cycles_v_blocks_column_layout" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "_event_cycles_v_blocks_section_group_sections" ADD COLUMN "heading" varchar;
  ALTER TABLE "_event_cycles_v_blocks_section_group_sections" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_event_cycles_v_blocks_section_group_sections" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "_event_cycles_v_blocks_section_group" ADD COLUMN "heading" varchar;
  ALTER TABLE "_event_cycles_v_blocks_section_group" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_event_cycles_v_blocks_section_group" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "_event_cycles_v_blocks_section_group" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "_event_cycles_v_blocks_section_group" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "_event_cycles_v_blocks_section_group" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "partners_blocks_rich_text" ADD COLUMN "heading" varchar;
  ALTER TABLE "partners_blocks_rich_text" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "partners_blocks_rich_text" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "partners_blocks_rich_text" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "partners_blocks_rich_text" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "partners_blocks_rich_text" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "partners_blocks_rich_text" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "partners_blocks_listing" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "partners_blocks_listing" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "partners_blocks_listing" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "partners_blocks_listing" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "partners_blocks_listing" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "partners_blocks_listing" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "partners_blocks_media_gallery" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "partners_blocks_media_gallery" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "partners_blocks_media_gallery" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "partners_blocks_media_gallery" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "partners_blocks_media_gallery" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "partners_blocks_media_gallery" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "partners_blocks_documents" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "partners_blocks_documents" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "partners_blocks_documents" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "partners_blocks_documents" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "partners_blocks_documents" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "partners_blocks_documents" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "partners_blocks_attachments" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "partners_blocks_attachments" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "partners_blocks_attachments" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "partners_blocks_attachments" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "partners_blocks_attachments" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "partners_blocks_attachments" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "partners_blocks_member_profiles" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "partners_blocks_member_profiles" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "partners_blocks_member_profiles" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "partners_blocks_member_profiles" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "partners_blocks_member_profiles" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "partners_blocks_member_profiles" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "partners_blocks_column_layout_columns" ADD COLUMN "heading" varchar;
  ALTER TABLE "partners_blocks_column_layout_columns" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "partners_blocks_column_layout_columns" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "partners_blocks_column_layout" ADD COLUMN "heading" varchar;
  ALTER TABLE "partners_blocks_column_layout" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "partners_blocks_column_layout" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "partners_blocks_column_layout" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "partners_blocks_column_layout" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "partners_blocks_column_layout" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "partners_blocks_column_layout" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "partners_blocks_section_group_sections" ADD COLUMN "heading" varchar;
  ALTER TABLE "partners_blocks_section_group_sections" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "partners_blocks_section_group_sections" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "partners_blocks_section_group" ADD COLUMN "heading" varchar;
  ALTER TABLE "partners_blocks_section_group" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "partners_blocks_section_group" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "partners_blocks_section_group" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "partners_blocks_section_group" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "partners_blocks_section_group" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "_partners_v_blocks_rich_text" ADD COLUMN "heading" varchar;
  ALTER TABLE "_partners_v_blocks_rich_text" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_partners_v_blocks_rich_text" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "_partners_v_blocks_rich_text" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "_partners_v_blocks_rich_text" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "_partners_v_blocks_rich_text" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "_partners_v_blocks_rich_text" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "_partners_v_blocks_listing" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_partners_v_blocks_listing" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "_partners_v_blocks_listing" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "_partners_v_blocks_listing" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "_partners_v_blocks_listing" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "_partners_v_blocks_listing" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "_partners_v_blocks_media_gallery" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_partners_v_blocks_media_gallery" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "_partners_v_blocks_media_gallery" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "_partners_v_blocks_media_gallery" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "_partners_v_blocks_media_gallery" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "_partners_v_blocks_media_gallery" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "_partners_v_blocks_documents" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_partners_v_blocks_documents" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "_partners_v_blocks_documents" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "_partners_v_blocks_documents" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "_partners_v_blocks_documents" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "_partners_v_blocks_documents" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "_partners_v_blocks_attachments" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_partners_v_blocks_attachments" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "_partners_v_blocks_attachments" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "_partners_v_blocks_attachments" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "_partners_v_blocks_attachments" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "_partners_v_blocks_attachments" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "_partners_v_blocks_member_profiles" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_partners_v_blocks_member_profiles" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "_partners_v_blocks_member_profiles" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "_partners_v_blocks_member_profiles" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "_partners_v_blocks_member_profiles" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "_partners_v_blocks_member_profiles" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "_partners_v_blocks_column_layout_columns" ADD COLUMN "heading" varchar;
  ALTER TABLE "_partners_v_blocks_column_layout_columns" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_partners_v_blocks_column_layout_columns" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "_partners_v_blocks_column_layout" ADD COLUMN "heading" varchar;
  ALTER TABLE "_partners_v_blocks_column_layout" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_partners_v_blocks_column_layout" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "_partners_v_blocks_column_layout" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "_partners_v_blocks_column_layout" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "_partners_v_blocks_column_layout" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "_partners_v_blocks_column_layout" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "_partners_v_blocks_section_group_sections" ADD COLUMN "heading" varchar;
  ALTER TABLE "_partners_v_blocks_section_group_sections" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_partners_v_blocks_section_group_sections" ADD COLUMN "frame" boolean DEFAULT false;
  ALTER TABLE "_partners_v_blocks_section_group" ADD COLUMN "heading" varchar;
  ALTER TABLE "_partners_v_blocks_section_group" ADD COLUMN "heading_icon_name" "hd_icon";
  ALTER TABLE "_partners_v_blocks_section_group" ADD COLUMN "surface" "sf" DEFAULT 'transparent';
  ALTER TABLE "_partners_v_blocks_section_group" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "_partners_v_blocks_section_group" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "_partners_v_blocks_section_group" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "pages_blocks_rich_text" ADD CONSTRAINT "pages_blocks_rich_text_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_listing" ADD CONSTRAINT "pages_blocks_listing_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_media_gallery" ADD CONSTRAINT "pages_blocks_media_gallery_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_documents" ADD CONSTRAINT "pages_blocks_documents_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_attachments" ADD CONSTRAINT "pages_blocks_attachments_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_member_profiles" ADD CONSTRAINT "pages_blocks_member_profiles_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_column_layout" ADD CONSTRAINT "pages_blocks_column_layout_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_section_group" ADD CONSTRAINT "pages_blocks_section_group_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_rich_text" ADD CONSTRAINT "_pages_v_blocks_rich_text_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_listing" ADD CONSTRAINT "_pages_v_blocks_listing_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_media_gallery" ADD CONSTRAINT "_pages_v_blocks_media_gallery_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_documents" ADD CONSTRAINT "_pages_v_blocks_documents_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_attachments" ADD CONSTRAINT "_pages_v_blocks_attachments_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_member_profiles" ADD CONSTRAINT "_pages_v_blocks_member_profiles_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_column_layout" ADD CONSTRAINT "_pages_v_blocks_column_layout_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_section_group" ADD CONSTRAINT "_pages_v_blocks_section_group_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_rich_text" ADD CONSTRAINT "posts_blocks_rich_text_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_listing" ADD CONSTRAINT "posts_blocks_listing_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_media_gallery" ADD CONSTRAINT "posts_blocks_media_gallery_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_documents" ADD CONSTRAINT "posts_blocks_documents_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_attachments" ADD CONSTRAINT "posts_blocks_attachments_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_member_profiles" ADD CONSTRAINT "posts_blocks_member_profiles_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_column_layout" ADD CONSTRAINT "posts_blocks_column_layout_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_section_group" ADD CONSTRAINT "posts_blocks_section_group_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_rich_text" ADD CONSTRAINT "_posts_v_blocks_rich_text_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_listing" ADD CONSTRAINT "_posts_v_blocks_listing_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_media_gallery" ADD CONSTRAINT "_posts_v_blocks_media_gallery_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_documents" ADD CONSTRAINT "_posts_v_blocks_documents_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_attachments" ADD CONSTRAINT "_posts_v_blocks_attachments_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_member_profiles" ADD CONSTRAINT "_posts_v_blocks_member_profiles_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_column_layout" ADD CONSTRAINT "_posts_v_blocks_column_layout_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_section_group" ADD CONSTRAINT "_posts_v_blocks_section_group_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_rich_text" ADD CONSTRAINT "events_blocks_rich_text_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_listing" ADD CONSTRAINT "events_blocks_listing_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_media_gallery" ADD CONSTRAINT "events_blocks_media_gallery_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_documents" ADD CONSTRAINT "events_blocks_documents_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_attachments" ADD CONSTRAINT "events_blocks_attachments_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_member_profiles" ADD CONSTRAINT "events_blocks_member_profiles_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_column_layout" ADD CONSTRAINT "events_blocks_column_layout_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_section_group" ADD CONSTRAINT "events_blocks_section_group_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_rich_text" ADD CONSTRAINT "_events_v_blocks_rich_text_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_listing" ADD CONSTRAINT "_events_v_blocks_listing_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_media_gallery" ADD CONSTRAINT "_events_v_blocks_media_gallery_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_documents" ADD CONSTRAINT "_events_v_blocks_documents_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_attachments" ADD CONSTRAINT "_events_v_blocks_attachments_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_member_profiles" ADD CONSTRAINT "_events_v_blocks_member_profiles_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_column_layout" ADD CONSTRAINT "_events_v_blocks_column_layout_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_section_group" ADD CONSTRAINT "_events_v_blocks_section_group_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_rich_text" ADD CONSTRAINT "event_cycles_blocks_rich_text_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_listing" ADD CONSTRAINT "event_cycles_blocks_listing_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_media_gallery" ADD CONSTRAINT "event_cycles_blocks_media_gallery_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_documents" ADD CONSTRAINT "event_cycles_blocks_documents_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_attachments" ADD CONSTRAINT "event_cycles_blocks_attachments_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_member_profiles" ADD CONSTRAINT "event_cycles_blocks_member_profiles_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_column_layout" ADD CONSTRAINT "event_cycles_blocks_column_layout_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_section_group" ADD CONSTRAINT "event_cycles_blocks_section_group_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_rich_text" ADD CONSTRAINT "_event_cycles_v_blocks_rich_text_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_listing" ADD CONSTRAINT "_event_cycles_v_blocks_listing_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_media_gallery" ADD CONSTRAINT "_event_cycles_v_blocks_media_gallery_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_documents" ADD CONSTRAINT "_event_cycles_v_blocks_documents_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_attachments" ADD CONSTRAINT "_event_cycles_v_blocks_attachments_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_member_profiles" ADD CONSTRAINT "_event_cycles_v_blocks_member_profiles_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_column_layout" ADD CONSTRAINT "_event_cycles_v_blocks_column_layout_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_section_group" ADD CONSTRAINT "_event_cycles_v_blocks_section_group_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_rich_text" ADD CONSTRAINT "partners_blocks_rich_text_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_listing" ADD CONSTRAINT "partners_blocks_listing_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_media_gallery" ADD CONSTRAINT "partners_blocks_media_gallery_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_documents" ADD CONSTRAINT "partners_blocks_documents_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_attachments" ADD CONSTRAINT "partners_blocks_attachments_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_member_profiles" ADD CONSTRAINT "partners_blocks_member_profiles_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_column_layout" ADD CONSTRAINT "partners_blocks_column_layout_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_section_group" ADD CONSTRAINT "partners_blocks_section_group_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_rich_text" ADD CONSTRAINT "_partners_v_blocks_rich_text_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_listing" ADD CONSTRAINT "_partners_v_blocks_listing_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_media_gallery" ADD CONSTRAINT "_partners_v_blocks_media_gallery_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_documents" ADD CONSTRAINT "_partners_v_blocks_documents_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_attachments" ADD CONSTRAINT "_partners_v_blocks_attachments_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_member_profiles" ADD CONSTRAINT "_partners_v_blocks_member_profiles_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_column_layout" ADD CONSTRAINT "_partners_v_blocks_column_layout_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_section_group" ADD CONSTRAINT "_partners_v_blocks_section_group_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_blocks_rich_text_surface_image_idx" ON "pages_blocks_rich_text" USING btree ("surface_image_id");
  CREATE INDEX "pages_blocks_listing_surface_image_idx" ON "pages_blocks_listing" USING btree ("surface_image_id");
  CREATE INDEX "pages_blocks_media_gallery_surface_image_idx" ON "pages_blocks_media_gallery" USING btree ("surface_image_id");
  CREATE INDEX "pages_blocks_documents_surface_image_idx" ON "pages_blocks_documents" USING btree ("surface_image_id");
  CREATE INDEX "pages_blocks_attachments_surface_image_idx" ON "pages_blocks_attachments" USING btree ("surface_image_id");
  CREATE INDEX "pages_blocks_member_profiles_surface_image_idx" ON "pages_blocks_member_profiles" USING btree ("surface_image_id");
  CREATE INDEX "pages_blocks_column_layout_surface_image_idx" ON "pages_blocks_column_layout" USING btree ("surface_image_id");
  CREATE INDEX "pages_blocks_section_group_surface_image_idx" ON "pages_blocks_section_group" USING btree ("surface_image_id");
  CREATE INDEX "_pages_v_blocks_rich_text_surface_image_idx" ON "_pages_v_blocks_rich_text" USING btree ("surface_image_id");
  CREATE INDEX "_pages_v_blocks_listing_surface_image_idx" ON "_pages_v_blocks_listing" USING btree ("surface_image_id");
  CREATE INDEX "_pages_v_blocks_media_gallery_surface_image_idx" ON "_pages_v_blocks_media_gallery" USING btree ("surface_image_id");
  CREATE INDEX "_pages_v_blocks_documents_surface_image_idx" ON "_pages_v_blocks_documents" USING btree ("surface_image_id");
  CREATE INDEX "_pages_v_blocks_attachments_surface_image_idx" ON "_pages_v_blocks_attachments" USING btree ("surface_image_id");
  CREATE INDEX "_pages_v_blocks_member_profiles_surface_image_idx" ON "_pages_v_blocks_member_profiles" USING btree ("surface_image_id");
  CREATE INDEX "_pages_v_blocks_column_layout_surface_image_idx" ON "_pages_v_blocks_column_layout" USING btree ("surface_image_id");
  CREATE INDEX "_pages_v_blocks_section_group_surface_image_idx" ON "_pages_v_blocks_section_group" USING btree ("surface_image_id");
  CREATE INDEX "posts_blocks_rich_text_surface_image_idx" ON "posts_blocks_rich_text" USING btree ("surface_image_id");
  CREATE INDEX "posts_blocks_listing_surface_image_idx" ON "posts_blocks_listing" USING btree ("surface_image_id");
  CREATE INDEX "posts_blocks_media_gallery_surface_image_idx" ON "posts_blocks_media_gallery" USING btree ("surface_image_id");
  CREATE INDEX "posts_blocks_documents_surface_image_idx" ON "posts_blocks_documents" USING btree ("surface_image_id");
  CREATE INDEX "posts_blocks_attachments_surface_image_idx" ON "posts_blocks_attachments" USING btree ("surface_image_id");
  CREATE INDEX "posts_blocks_member_profiles_surface_image_idx" ON "posts_blocks_member_profiles" USING btree ("surface_image_id");
  CREATE INDEX "posts_blocks_column_layout_surface_image_idx" ON "posts_blocks_column_layout" USING btree ("surface_image_id");
  CREATE INDEX "posts_blocks_section_group_surface_image_idx" ON "posts_blocks_section_group" USING btree ("surface_image_id");
  CREATE INDEX "_posts_v_blocks_rich_text_surface_image_idx" ON "_posts_v_blocks_rich_text" USING btree ("surface_image_id");
  CREATE INDEX "_posts_v_blocks_listing_surface_image_idx" ON "_posts_v_blocks_listing" USING btree ("surface_image_id");
  CREATE INDEX "_posts_v_blocks_media_gallery_surface_image_idx" ON "_posts_v_blocks_media_gallery" USING btree ("surface_image_id");
  CREATE INDEX "_posts_v_blocks_documents_surface_image_idx" ON "_posts_v_blocks_documents" USING btree ("surface_image_id");
  CREATE INDEX "_posts_v_blocks_attachments_surface_image_idx" ON "_posts_v_blocks_attachments" USING btree ("surface_image_id");
  CREATE INDEX "_posts_v_blocks_member_profiles_surface_image_idx" ON "_posts_v_blocks_member_profiles" USING btree ("surface_image_id");
  CREATE INDEX "_posts_v_blocks_column_layout_surface_image_idx" ON "_posts_v_blocks_column_layout" USING btree ("surface_image_id");
  CREATE INDEX "_posts_v_blocks_section_group_surface_image_idx" ON "_posts_v_blocks_section_group" USING btree ("surface_image_id");
  CREATE INDEX "events_blocks_rich_text_surface_image_idx" ON "events_blocks_rich_text" USING btree ("surface_image_id");
  CREATE INDEX "events_blocks_listing_surface_image_idx" ON "events_blocks_listing" USING btree ("surface_image_id");
  CREATE INDEX "events_blocks_media_gallery_surface_image_idx" ON "events_blocks_media_gallery" USING btree ("surface_image_id");
  CREATE INDEX "events_blocks_documents_surface_image_idx" ON "events_blocks_documents" USING btree ("surface_image_id");
  CREATE INDEX "events_blocks_attachments_surface_image_idx" ON "events_blocks_attachments" USING btree ("surface_image_id");
  CREATE INDEX "events_blocks_member_profiles_surface_image_idx" ON "events_blocks_member_profiles" USING btree ("surface_image_id");
  CREATE INDEX "events_blocks_column_layout_surface_image_idx" ON "events_blocks_column_layout" USING btree ("surface_image_id");
  CREATE INDEX "events_blocks_section_group_surface_image_idx" ON "events_blocks_section_group" USING btree ("surface_image_id");
  CREATE INDEX "_events_v_blocks_rich_text_surface_image_idx" ON "_events_v_blocks_rich_text" USING btree ("surface_image_id");
  CREATE INDEX "_events_v_blocks_listing_surface_image_idx" ON "_events_v_blocks_listing" USING btree ("surface_image_id");
  CREATE INDEX "_events_v_blocks_media_gallery_surface_image_idx" ON "_events_v_blocks_media_gallery" USING btree ("surface_image_id");
  CREATE INDEX "_events_v_blocks_documents_surface_image_idx" ON "_events_v_blocks_documents" USING btree ("surface_image_id");
  CREATE INDEX "_events_v_blocks_attachments_surface_image_idx" ON "_events_v_blocks_attachments" USING btree ("surface_image_id");
  CREATE INDEX "_events_v_blocks_member_profiles_surface_image_idx" ON "_events_v_blocks_member_profiles" USING btree ("surface_image_id");
  CREATE INDEX "_events_v_blocks_column_layout_surface_image_idx" ON "_events_v_blocks_column_layout" USING btree ("surface_image_id");
  CREATE INDEX "_events_v_blocks_section_group_surface_image_idx" ON "_events_v_blocks_section_group" USING btree ("surface_image_id");
  CREATE INDEX "event_cycles_blocks_rich_text_surface_image_idx" ON "event_cycles_blocks_rich_text" USING btree ("surface_image_id");
  CREATE INDEX "event_cycles_blocks_listing_surface_image_idx" ON "event_cycles_blocks_listing" USING btree ("surface_image_id");
  CREATE INDEX "event_cycles_blocks_media_gallery_surface_image_idx" ON "event_cycles_blocks_media_gallery" USING btree ("surface_image_id");
  CREATE INDEX "event_cycles_blocks_documents_surface_image_idx" ON "event_cycles_blocks_documents" USING btree ("surface_image_id");
  CREATE INDEX "event_cycles_blocks_attachments_surface_image_idx" ON "event_cycles_blocks_attachments" USING btree ("surface_image_id");
  CREATE INDEX "event_cycles_blocks_member_profiles_surface_image_idx" ON "event_cycles_blocks_member_profiles" USING btree ("surface_image_id");
  CREATE INDEX "event_cycles_blocks_column_layout_surface_image_idx" ON "event_cycles_blocks_column_layout" USING btree ("surface_image_id");
  CREATE INDEX "event_cycles_blocks_section_group_surface_image_idx" ON "event_cycles_blocks_section_group" USING btree ("surface_image_id");
  CREATE INDEX "_event_cycles_v_blocks_rich_text_surface_image_idx" ON "_event_cycles_v_blocks_rich_text" USING btree ("surface_image_id");
  CREATE INDEX "_event_cycles_v_blocks_listing_surface_image_idx" ON "_event_cycles_v_blocks_listing" USING btree ("surface_image_id");
  CREATE INDEX "_event_cycles_v_blocks_media_gallery_surface_image_idx" ON "_event_cycles_v_blocks_media_gallery" USING btree ("surface_image_id");
  CREATE INDEX "_event_cycles_v_blocks_documents_surface_image_idx" ON "_event_cycles_v_blocks_documents" USING btree ("surface_image_id");
  CREATE INDEX "_event_cycles_v_blocks_attachments_surface_image_idx" ON "_event_cycles_v_blocks_attachments" USING btree ("surface_image_id");
  CREATE INDEX "_event_cycles_v_blocks_member_profiles_surface_image_idx" ON "_event_cycles_v_blocks_member_profiles" USING btree ("surface_image_id");
  CREATE INDEX "_event_cycles_v_blocks_column_layout_surface_image_idx" ON "_event_cycles_v_blocks_column_layout" USING btree ("surface_image_id");
  CREATE INDEX "_event_cycles_v_blocks_section_group_surface_image_idx" ON "_event_cycles_v_blocks_section_group" USING btree ("surface_image_id");
  CREATE INDEX "partners_blocks_rich_text_surface_image_idx" ON "partners_blocks_rich_text" USING btree ("surface_image_id");
  CREATE INDEX "partners_blocks_listing_surface_image_idx" ON "partners_blocks_listing" USING btree ("surface_image_id");
  CREATE INDEX "partners_blocks_media_gallery_surface_image_idx" ON "partners_blocks_media_gallery" USING btree ("surface_image_id");
  CREATE INDEX "partners_blocks_documents_surface_image_idx" ON "partners_blocks_documents" USING btree ("surface_image_id");
  CREATE INDEX "partners_blocks_attachments_surface_image_idx" ON "partners_blocks_attachments" USING btree ("surface_image_id");
  CREATE INDEX "partners_blocks_member_profiles_surface_image_idx" ON "partners_blocks_member_profiles" USING btree ("surface_image_id");
  CREATE INDEX "partners_blocks_column_layout_surface_image_idx" ON "partners_blocks_column_layout" USING btree ("surface_image_id");
  CREATE INDEX "partners_blocks_section_group_surface_image_idx" ON "partners_blocks_section_group" USING btree ("surface_image_id");
  CREATE INDEX "_partners_v_blocks_rich_text_surface_image_idx" ON "_partners_v_blocks_rich_text" USING btree ("surface_image_id");
  CREATE INDEX "_partners_v_blocks_listing_surface_image_idx" ON "_partners_v_blocks_listing" USING btree ("surface_image_id");
  CREATE INDEX "_partners_v_blocks_media_gallery_surface_image_idx" ON "_partners_v_blocks_media_gallery" USING btree ("surface_image_id");
  CREATE INDEX "_partners_v_blocks_documents_surface_image_idx" ON "_partners_v_blocks_documents" USING btree ("surface_image_id");
  CREATE INDEX "_partners_v_blocks_attachments_surface_image_idx" ON "_partners_v_blocks_attachments" USING btree ("surface_image_id");
  CREATE INDEX "_partners_v_blocks_member_profiles_surface_image_idx" ON "_partners_v_blocks_member_profiles" USING btree ("surface_image_id");
  CREATE INDEX "_partners_v_blocks_column_layout_surface_image_idx" ON "_partners_v_blocks_column_layout" USING btree ("surface_image_id");
  CREATE INDEX "_partners_v_blocks_section_group_surface_image_idx" ON "_partners_v_blocks_section_group" USING btree ("surface_image_id");
  DO $$
  DECLARE
    table_name text;
  BEGIN
    FOREACH table_name IN ARRAY ARRAY[
      'pages_blocks_section_group', '_pages_v_blocks_section_group',
      'posts_blocks_section_group', '_posts_v_blocks_section_group',
      'events_blocks_section_group', '_events_v_blocks_section_group',
      'event_cycles_blocks_section_group', '_event_cycles_v_blocks_section_group',
      'partners_blocks_section_group', '_partners_v_blocks_section_group'
    ] LOOP
      EXECUTE format(
        'UPDATE %I SET surface = CASE WHEN frame THEN ''default''::sf ELSE ''transparent''::sf END',
        table_name
      );
    END LOOP;
  END $$;
  ALTER TABLE "pages_blocks_heading" DROP COLUMN "role";
  ALTER TABLE "_pages_v_blocks_heading" DROP COLUMN "role";
  ALTER TABLE "posts_blocks_heading" DROP COLUMN "role";
  ALTER TABLE "_posts_v_blocks_heading" DROP COLUMN "role";
  ALTER TABLE "events_blocks_heading" DROP COLUMN "role";
  ALTER TABLE "_events_v_blocks_heading" DROP COLUMN "role";
  ALTER TABLE "event_cycles_blocks_heading" DROP COLUMN "role";
  ALTER TABLE "_event_cycles_v_blocks_heading" DROP COLUMN "role";
  ALTER TABLE "partners_blocks_heading" DROP COLUMN "role";
  ALTER TABLE "_partners_v_blocks_heading" DROP COLUMN "role";
  DROP TYPE "public"."enum_pages_blocks_heading_role";
  DROP TYPE "public"."enum_pages_blocks_heading_icon_name";
  DROP TYPE "public"."enum_pages_blocks_section_group_frame";
  DROP TYPE "public"."enum__pages_v_blocks_heading_role";
  DROP TYPE "public"."enum__pages_v_blocks_heading_icon_name";
  DROP TYPE "public"."enum__pages_v_blocks_section_group_frame";
  DROP TYPE "public"."enum_posts_blocks_heading_role";
  DROP TYPE "public"."enum_posts_blocks_heading_icon_name";
  DROP TYPE "public"."enum_posts_blocks_section_group_frame";
  DROP TYPE "public"."enum__posts_v_blocks_heading_role";
  DROP TYPE "public"."enum__posts_v_blocks_heading_icon_name";
  DROP TYPE "public"."enum__posts_v_blocks_section_group_frame";
  DROP TYPE "public"."enum_events_blocks_heading_role";
  DROP TYPE "public"."enum_events_blocks_heading_icon_name";
  DROP TYPE "public"."enum_events_blocks_section_group_frame";
  DROP TYPE "public"."enum__events_v_blocks_heading_role";
  DROP TYPE "public"."enum__events_v_blocks_heading_icon_name";
  DROP TYPE "public"."enum__events_v_blocks_section_group_frame";
  DROP TYPE "public"."enum_event_cycles_blocks_heading_role";
  DROP TYPE "public"."enum_event_cycles_blocks_heading_icon_name";
  DROP TYPE "public"."enum_event_cycles_blocks_section_group_frame";
  DROP TYPE "public"."enum__event_cycles_v_blocks_heading_role";
  DROP TYPE "public"."enum__event_cycles_v_blocks_heading_icon_name";
  DROP TYPE "public"."enum__event_cycles_v_blocks_section_group_frame";
  DROP TYPE "public"."enum_partners_blocks_heading_role";
  DROP TYPE "public"."enum_partners_blocks_heading_icon_name";
  DROP TYPE "public"."enum_partners_blocks_section_group_frame";
  DROP TYPE "public"."enum__partners_v_blocks_heading_role";
  DROP TYPE "public"."enum__partners_v_blocks_heading_icon_name";
  DROP TYPE "public"."enum__partners_v_blocks_section_group_frame";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_heading_role" AS ENUM('section', 'item');
  CREATE TYPE "public"."enum_pages_blocks_heading_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_pages_blocks_section_group_frame" AS ENUM('outline', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_heading_role" AS ENUM('section', 'item');
  CREATE TYPE "public"."enum__pages_v_blocks_heading_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum__pages_v_blocks_section_group_frame" AS ENUM('outline', 'none');
  CREATE TYPE "public"."enum_posts_blocks_heading_role" AS ENUM('section', 'item');
  CREATE TYPE "public"."enum_posts_blocks_heading_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_posts_blocks_section_group_frame" AS ENUM('outline', 'none');
  CREATE TYPE "public"."enum__posts_v_blocks_heading_role" AS ENUM('section', 'item');
  CREATE TYPE "public"."enum__posts_v_blocks_heading_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum__posts_v_blocks_section_group_frame" AS ENUM('outline', 'none');
  CREATE TYPE "public"."enum_events_blocks_heading_role" AS ENUM('section', 'item');
  CREATE TYPE "public"."enum_events_blocks_heading_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_events_blocks_section_group_frame" AS ENUM('outline', 'none');
  CREATE TYPE "public"."enum__events_v_blocks_heading_role" AS ENUM('section', 'item');
  CREATE TYPE "public"."enum__events_v_blocks_heading_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum__events_v_blocks_section_group_frame" AS ENUM('outline', 'none');
  CREATE TYPE "public"."enum_event_cycles_blocks_heading_role" AS ENUM('section', 'item');
  CREATE TYPE "public"."enum_event_cycles_blocks_heading_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_event_cycles_blocks_section_group_frame" AS ENUM('outline', 'none');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_heading_role" AS ENUM('section', 'item');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_heading_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_section_group_frame" AS ENUM('outline', 'none');
  CREATE TYPE "public"."enum_partners_blocks_heading_role" AS ENUM('section', 'item');
  CREATE TYPE "public"."enum_partners_blocks_heading_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_partners_blocks_section_group_frame" AS ENUM('outline', 'none');
  CREATE TYPE "public"."enum__partners_v_blocks_heading_role" AS ENUM('section', 'item');
  CREATE TYPE "public"."enum__partners_v_blocks_heading_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum__partners_v_blocks_section_group_frame" AS ENUM('outline', 'none');
  ALTER TABLE "pages_blocks_heading" RENAME COLUMN "heading" TO "text";
  ALTER TABLE "pages_blocks_heading" RENAME COLUMN "heading_icon_name" TO "icon_name";
  ALTER TABLE "_pages_v_blocks_heading" RENAME COLUMN "heading" TO "text";
  ALTER TABLE "_pages_v_blocks_heading" RENAME COLUMN "heading_icon_name" TO "icon_name";
  ALTER TABLE "posts_blocks_heading" RENAME COLUMN "heading" TO "text";
  ALTER TABLE "posts_blocks_heading" RENAME COLUMN "heading_icon_name" TO "icon_name";
  ALTER TABLE "_posts_v_blocks_heading" RENAME COLUMN "heading" TO "text";
  ALTER TABLE "_posts_v_blocks_heading" RENAME COLUMN "heading_icon_name" TO "icon_name";
  ALTER TABLE "events_blocks_heading" RENAME COLUMN "heading" TO "text";
  ALTER TABLE "events_blocks_heading" RENAME COLUMN "heading_icon_name" TO "icon_name";
  ALTER TABLE "_events_v_blocks_heading" RENAME COLUMN "heading" TO "text";
  ALTER TABLE "_events_v_blocks_heading" RENAME COLUMN "heading_icon_name" TO "icon_name";
  ALTER TABLE "event_cycles_blocks_heading" RENAME COLUMN "heading" TO "text";
  ALTER TABLE "event_cycles_blocks_heading" RENAME COLUMN "heading_icon_name" TO "icon_name";
  ALTER TABLE "_event_cycles_v_blocks_heading" RENAME COLUMN "heading" TO "text";
  ALTER TABLE "_event_cycles_v_blocks_heading" RENAME COLUMN "heading_icon_name" TO "icon_name";
  ALTER TABLE "partners_blocks_heading" RENAME COLUMN "heading" TO "text";
  ALTER TABLE "partners_blocks_heading" RENAME COLUMN "heading_icon_name" TO "icon_name";
  ALTER TABLE "_partners_v_blocks_heading" RENAME COLUMN "heading" TO "text";
  ALTER TABLE "_partners_v_blocks_heading" RENAME COLUMN "heading_icon_name" TO "icon_name";
  DO $$
  DECLARE
    table_name text;
    enum_name text;
  BEGIN
    FOREACH table_name IN ARRAY ARRAY[
      'pages_blocks_heading', '_pages_v_blocks_heading',
      'posts_blocks_heading', '_posts_v_blocks_heading',
      'events_blocks_heading', '_events_v_blocks_heading',
      'event_cycles_blocks_heading', '_event_cycles_v_blocks_heading',
      'partners_blocks_heading', '_partners_v_blocks_heading'
    ] LOOP
      enum_name := 'enum_' || table_name || '_icon_name';
      EXECUTE format(
        'ALTER TABLE %I ALTER COLUMN icon_name TYPE %I USING icon_name::text::%I',
        table_name,
        enum_name,
        enum_name
      );
    END LOOP;
  END $$;
  ALTER TABLE "pages_blocks_rich_text" DROP CONSTRAINT "pages_blocks_rich_text_surface_image_id_media_id_fk";
  
  ALTER TABLE "pages_blocks_listing" DROP CONSTRAINT "pages_blocks_listing_surface_image_id_media_id_fk";
  
  ALTER TABLE "pages_blocks_media_gallery" DROP CONSTRAINT "pages_blocks_media_gallery_surface_image_id_media_id_fk";
  
  ALTER TABLE "pages_blocks_documents" DROP CONSTRAINT "pages_blocks_documents_surface_image_id_media_id_fk";
  
  ALTER TABLE "pages_blocks_attachments" DROP CONSTRAINT "pages_blocks_attachments_surface_image_id_media_id_fk";
  
  ALTER TABLE "pages_blocks_member_profiles" DROP CONSTRAINT "pages_blocks_member_profiles_surface_image_id_media_id_fk";
  
  ALTER TABLE "pages_blocks_column_layout" DROP CONSTRAINT "pages_blocks_column_layout_surface_image_id_media_id_fk";
  
  ALTER TABLE "pages_blocks_section_group" DROP CONSTRAINT "pages_blocks_section_group_surface_image_id_media_id_fk";
  
  ALTER TABLE "_pages_v_blocks_rich_text" DROP CONSTRAINT "_pages_v_blocks_rich_text_surface_image_id_media_id_fk";
  
  ALTER TABLE "_pages_v_blocks_listing" DROP CONSTRAINT "_pages_v_blocks_listing_surface_image_id_media_id_fk";
  
  ALTER TABLE "_pages_v_blocks_media_gallery" DROP CONSTRAINT "_pages_v_blocks_media_gallery_surface_image_id_media_id_fk";
  
  ALTER TABLE "_pages_v_blocks_documents" DROP CONSTRAINT "_pages_v_blocks_documents_surface_image_id_media_id_fk";
  
  ALTER TABLE "_pages_v_blocks_attachments" DROP CONSTRAINT "_pages_v_blocks_attachments_surface_image_id_media_id_fk";
  
  ALTER TABLE "_pages_v_blocks_member_profiles" DROP CONSTRAINT "_pages_v_blocks_member_profiles_surface_image_id_media_id_fk";
  
  ALTER TABLE "_pages_v_blocks_column_layout" DROP CONSTRAINT "_pages_v_blocks_column_layout_surface_image_id_media_id_fk";
  
  ALTER TABLE "_pages_v_blocks_section_group" DROP CONSTRAINT "_pages_v_blocks_section_group_surface_image_id_media_id_fk";
  
  ALTER TABLE "posts_blocks_rich_text" DROP CONSTRAINT "posts_blocks_rich_text_surface_image_id_media_id_fk";
  
  ALTER TABLE "posts_blocks_listing" DROP CONSTRAINT "posts_blocks_listing_surface_image_id_media_id_fk";
  
  ALTER TABLE "posts_blocks_media_gallery" DROP CONSTRAINT "posts_blocks_media_gallery_surface_image_id_media_id_fk";
  
  ALTER TABLE "posts_blocks_documents" DROP CONSTRAINT "posts_blocks_documents_surface_image_id_media_id_fk";
  
  ALTER TABLE "posts_blocks_attachments" DROP CONSTRAINT "posts_blocks_attachments_surface_image_id_media_id_fk";
  
  ALTER TABLE "posts_blocks_member_profiles" DROP CONSTRAINT "posts_blocks_member_profiles_surface_image_id_media_id_fk";
  
  ALTER TABLE "posts_blocks_column_layout" DROP CONSTRAINT "posts_blocks_column_layout_surface_image_id_media_id_fk";
  
  ALTER TABLE "posts_blocks_section_group" DROP CONSTRAINT "posts_blocks_section_group_surface_image_id_media_id_fk";
  
  ALTER TABLE "_posts_v_blocks_rich_text" DROP CONSTRAINT "_posts_v_blocks_rich_text_surface_image_id_media_id_fk";
  
  ALTER TABLE "_posts_v_blocks_listing" DROP CONSTRAINT "_posts_v_blocks_listing_surface_image_id_media_id_fk";
  
  ALTER TABLE "_posts_v_blocks_media_gallery" DROP CONSTRAINT "_posts_v_blocks_media_gallery_surface_image_id_media_id_fk";
  
  ALTER TABLE "_posts_v_blocks_documents" DROP CONSTRAINT "_posts_v_blocks_documents_surface_image_id_media_id_fk";
  
  ALTER TABLE "_posts_v_blocks_attachments" DROP CONSTRAINT "_posts_v_blocks_attachments_surface_image_id_media_id_fk";
  
  ALTER TABLE "_posts_v_blocks_member_profiles" DROP CONSTRAINT "_posts_v_blocks_member_profiles_surface_image_id_media_id_fk";
  
  ALTER TABLE "_posts_v_blocks_column_layout" DROP CONSTRAINT "_posts_v_blocks_column_layout_surface_image_id_media_id_fk";
  
  ALTER TABLE "_posts_v_blocks_section_group" DROP CONSTRAINT "_posts_v_blocks_section_group_surface_image_id_media_id_fk";
  
  ALTER TABLE "events_blocks_rich_text" DROP CONSTRAINT "events_blocks_rich_text_surface_image_id_media_id_fk";
  
  ALTER TABLE "events_blocks_listing" DROP CONSTRAINT "events_blocks_listing_surface_image_id_media_id_fk";
  
  ALTER TABLE "events_blocks_media_gallery" DROP CONSTRAINT "events_blocks_media_gallery_surface_image_id_media_id_fk";
  
  ALTER TABLE "events_blocks_documents" DROP CONSTRAINT "events_blocks_documents_surface_image_id_media_id_fk";
  
  ALTER TABLE "events_blocks_attachments" DROP CONSTRAINT "events_blocks_attachments_surface_image_id_media_id_fk";
  
  ALTER TABLE "events_blocks_member_profiles" DROP CONSTRAINT "events_blocks_member_profiles_surface_image_id_media_id_fk";
  
  ALTER TABLE "events_blocks_column_layout" DROP CONSTRAINT "events_blocks_column_layout_surface_image_id_media_id_fk";
  
  ALTER TABLE "events_blocks_section_group" DROP CONSTRAINT "events_blocks_section_group_surface_image_id_media_id_fk";
  
  ALTER TABLE "_events_v_blocks_rich_text" DROP CONSTRAINT "_events_v_blocks_rich_text_surface_image_id_media_id_fk";
  
  ALTER TABLE "_events_v_blocks_listing" DROP CONSTRAINT "_events_v_blocks_listing_surface_image_id_media_id_fk";
  
  ALTER TABLE "_events_v_blocks_media_gallery" DROP CONSTRAINT "_events_v_blocks_media_gallery_surface_image_id_media_id_fk";
  
  ALTER TABLE "_events_v_blocks_documents" DROP CONSTRAINT "_events_v_blocks_documents_surface_image_id_media_id_fk";
  
  ALTER TABLE "_events_v_blocks_attachments" DROP CONSTRAINT "_events_v_blocks_attachments_surface_image_id_media_id_fk";
  
  ALTER TABLE "_events_v_blocks_member_profiles" DROP CONSTRAINT "_events_v_blocks_member_profiles_surface_image_id_media_id_fk";
  
  ALTER TABLE "_events_v_blocks_column_layout" DROP CONSTRAINT "_events_v_blocks_column_layout_surface_image_id_media_id_fk";
  
  ALTER TABLE "_events_v_blocks_section_group" DROP CONSTRAINT "_events_v_blocks_section_group_surface_image_id_media_id_fk";
  
  ALTER TABLE "event_cycles_blocks_rich_text" DROP CONSTRAINT "event_cycles_blocks_rich_text_surface_image_id_media_id_fk";
  
  ALTER TABLE "event_cycles_blocks_listing" DROP CONSTRAINT "event_cycles_blocks_listing_surface_image_id_media_id_fk";
  
  ALTER TABLE "event_cycles_blocks_media_gallery" DROP CONSTRAINT "event_cycles_blocks_media_gallery_surface_image_id_media_id_fk";
  
  ALTER TABLE "event_cycles_blocks_documents" DROP CONSTRAINT "event_cycles_blocks_documents_surface_image_id_media_id_fk";
  
  ALTER TABLE "event_cycles_blocks_attachments" DROP CONSTRAINT "event_cycles_blocks_attachments_surface_image_id_media_id_fk";
  
  ALTER TABLE "event_cycles_blocks_member_profiles" DROP CONSTRAINT "event_cycles_blocks_member_profiles_surface_image_id_media_id_fk";
  
  ALTER TABLE "event_cycles_blocks_column_layout" DROP CONSTRAINT "event_cycles_blocks_column_layout_surface_image_id_media_id_fk";
  
  ALTER TABLE "event_cycles_blocks_section_group" DROP CONSTRAINT "event_cycles_blocks_section_group_surface_image_id_media_id_fk";
  
  ALTER TABLE "_event_cycles_v_blocks_rich_text" DROP CONSTRAINT "_event_cycles_v_blocks_rich_text_surface_image_id_media_id_fk";
  
  ALTER TABLE "_event_cycles_v_blocks_listing" DROP CONSTRAINT "_event_cycles_v_blocks_listing_surface_image_id_media_id_fk";
  
  ALTER TABLE "_event_cycles_v_blocks_media_gallery" DROP CONSTRAINT "_event_cycles_v_blocks_media_gallery_surface_image_id_media_id_fk";
  
  ALTER TABLE "_event_cycles_v_blocks_documents" DROP CONSTRAINT "_event_cycles_v_blocks_documents_surface_image_id_media_id_fk";
  
  ALTER TABLE "_event_cycles_v_blocks_attachments" DROP CONSTRAINT "_event_cycles_v_blocks_attachments_surface_image_id_media_id_fk";
  
  ALTER TABLE "_event_cycles_v_blocks_member_profiles" DROP CONSTRAINT "_event_cycles_v_blocks_member_profiles_surface_image_id_media_id_fk";
  
  ALTER TABLE "_event_cycles_v_blocks_column_layout" DROP CONSTRAINT "_event_cycles_v_blocks_column_layout_surface_image_id_media_id_fk";
  
  ALTER TABLE "_event_cycles_v_blocks_section_group" DROP CONSTRAINT "_event_cycles_v_blocks_section_group_surface_image_id_media_id_fk";
  
  ALTER TABLE "partners_blocks_rich_text" DROP CONSTRAINT "partners_blocks_rich_text_surface_image_id_media_id_fk";
  
  ALTER TABLE "partners_blocks_listing" DROP CONSTRAINT "partners_blocks_listing_surface_image_id_media_id_fk";
  
  ALTER TABLE "partners_blocks_media_gallery" DROP CONSTRAINT "partners_blocks_media_gallery_surface_image_id_media_id_fk";
  
  ALTER TABLE "partners_blocks_documents" DROP CONSTRAINT "partners_blocks_documents_surface_image_id_media_id_fk";
  
  ALTER TABLE "partners_blocks_attachments" DROP CONSTRAINT "partners_blocks_attachments_surface_image_id_media_id_fk";
  
  ALTER TABLE "partners_blocks_member_profiles" DROP CONSTRAINT "partners_blocks_member_profiles_surface_image_id_media_id_fk";
  
  ALTER TABLE "partners_blocks_column_layout" DROP CONSTRAINT "partners_blocks_column_layout_surface_image_id_media_id_fk";
  
  ALTER TABLE "partners_blocks_section_group" DROP CONSTRAINT "partners_blocks_section_group_surface_image_id_media_id_fk";
  
  ALTER TABLE "_partners_v_blocks_rich_text" DROP CONSTRAINT "_partners_v_blocks_rich_text_surface_image_id_media_id_fk";
  
  ALTER TABLE "_partners_v_blocks_listing" DROP CONSTRAINT "_partners_v_blocks_listing_surface_image_id_media_id_fk";
  
  ALTER TABLE "_partners_v_blocks_media_gallery" DROP CONSTRAINT "_partners_v_blocks_media_gallery_surface_image_id_media_id_fk";
  
  ALTER TABLE "_partners_v_blocks_documents" DROP CONSTRAINT "_partners_v_blocks_documents_surface_image_id_media_id_fk";
  
  ALTER TABLE "_partners_v_blocks_attachments" DROP CONSTRAINT "_partners_v_blocks_attachments_surface_image_id_media_id_fk";
  
  ALTER TABLE "_partners_v_blocks_member_profiles" DROP CONSTRAINT "_partners_v_blocks_member_profiles_surface_image_id_media_id_fk";
  
  ALTER TABLE "_partners_v_blocks_column_layout" DROP CONSTRAINT "_partners_v_blocks_column_layout_surface_image_id_media_id_fk";
  
  ALTER TABLE "_partners_v_blocks_section_group" DROP CONSTRAINT "_partners_v_blocks_section_group_surface_image_id_media_id_fk";
  
  DO $$
  DECLARE
    surface_column record;
  BEGIN
    FOR surface_column IN
      SELECT table_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND column_name = 'surface'
        AND udt_name = 'sf'
    LOOP
      EXECUTE format('ALTER TABLE %I ALTER COLUMN surface DROP DEFAULT', surface_column.table_name);
      EXECUTE format('ALTER TABLE %I ALTER COLUMN surface TYPE text USING surface::text', surface_column.table_name);
      EXECUTE format(
        'UPDATE %I SET surface = ''default'' WHERE surface = ''transparent''',
        surface_column.table_name
      );
    END LOOP;
  END $$;
  ALTER TABLE "pages_blocks_column_layout_columns" ALTER COLUMN "surface" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_column_layout_columns" ALTER COLUMN "surface" SET DEFAULT 'default'::text;
  ALTER TABLE "pages_blocks_section_group_sections" ALTER COLUMN "surface" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_section_group_sections" ALTER COLUMN "surface" SET DEFAULT 'default'::text;
  ALTER TABLE "_pages_v_blocks_column_layout_columns" ALTER COLUMN "surface" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_column_layout_columns" ALTER COLUMN "surface" SET DEFAULT 'default'::text;
  ALTER TABLE "_pages_v_blocks_section_group_sections" ALTER COLUMN "surface" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_section_group_sections" ALTER COLUMN "surface" SET DEFAULT 'default'::text;
  ALTER TABLE "posts_blocks_column_layout_columns" ALTER COLUMN "surface" SET DATA TYPE text;
  ALTER TABLE "posts_blocks_column_layout_columns" ALTER COLUMN "surface" SET DEFAULT 'default'::text;
  ALTER TABLE "posts_blocks_section_group_sections" ALTER COLUMN "surface" SET DATA TYPE text;
  ALTER TABLE "posts_blocks_section_group_sections" ALTER COLUMN "surface" SET DEFAULT 'default'::text;
  ALTER TABLE "_posts_v_blocks_column_layout_columns" ALTER COLUMN "surface" SET DATA TYPE text;
  ALTER TABLE "_posts_v_blocks_column_layout_columns" ALTER COLUMN "surface" SET DEFAULT 'default'::text;
  ALTER TABLE "_posts_v_blocks_section_group_sections" ALTER COLUMN "surface" SET DATA TYPE text;
  ALTER TABLE "_posts_v_blocks_section_group_sections" ALTER COLUMN "surface" SET DEFAULT 'default'::text;
  ALTER TABLE "events_blocks_column_layout_columns" ALTER COLUMN "surface" SET DATA TYPE text;
  ALTER TABLE "events_blocks_column_layout_columns" ALTER COLUMN "surface" SET DEFAULT 'default'::text;
  ALTER TABLE "events_blocks_section_group_sections" ALTER COLUMN "surface" SET DATA TYPE text;
  ALTER TABLE "events_blocks_section_group_sections" ALTER COLUMN "surface" SET DEFAULT 'default'::text;
  ALTER TABLE "_events_v_blocks_column_layout_columns" ALTER COLUMN "surface" SET DATA TYPE text;
  ALTER TABLE "_events_v_blocks_column_layout_columns" ALTER COLUMN "surface" SET DEFAULT 'default'::text;
  ALTER TABLE "_events_v_blocks_section_group_sections" ALTER COLUMN "surface" SET DATA TYPE text;
  ALTER TABLE "_events_v_blocks_section_group_sections" ALTER COLUMN "surface" SET DEFAULT 'default'::text;
  ALTER TABLE "event_cycles_blocks_column_layout_columns" ALTER COLUMN "surface" SET DATA TYPE text;
  ALTER TABLE "event_cycles_blocks_column_layout_columns" ALTER COLUMN "surface" SET DEFAULT 'default'::text;
  ALTER TABLE "event_cycles_blocks_section_group_sections" ALTER COLUMN "surface" SET DATA TYPE text;
  ALTER TABLE "event_cycles_blocks_section_group_sections" ALTER COLUMN "surface" SET DEFAULT 'default'::text;
  ALTER TABLE "_event_cycles_v_blocks_column_layout_columns" ALTER COLUMN "surface" SET DATA TYPE text;
  ALTER TABLE "_event_cycles_v_blocks_column_layout_columns" ALTER COLUMN "surface" SET DEFAULT 'default'::text;
  ALTER TABLE "_event_cycles_v_blocks_section_group_sections" ALTER COLUMN "surface" SET DATA TYPE text;
  ALTER TABLE "_event_cycles_v_blocks_section_group_sections" ALTER COLUMN "surface" SET DEFAULT 'default'::text;
  ALTER TABLE "partners_blocks_column_layout_columns" ALTER COLUMN "surface" SET DATA TYPE text;
  ALTER TABLE "partners_blocks_column_layout_columns" ALTER COLUMN "surface" SET DEFAULT 'default'::text;
  ALTER TABLE "partners_blocks_section_group_sections" ALTER COLUMN "surface" SET DATA TYPE text;
  ALTER TABLE "partners_blocks_section_group_sections" ALTER COLUMN "surface" SET DEFAULT 'default'::text;
  ALTER TABLE "_partners_v_blocks_column_layout_columns" ALTER COLUMN "surface" SET DATA TYPE text;
  ALTER TABLE "_partners_v_blocks_column_layout_columns" ALTER COLUMN "surface" SET DEFAULT 'default'::text;
  ALTER TABLE "_partners_v_blocks_section_group_sections" ALTER COLUMN "surface" SET DATA TYPE text;
  ALTER TABLE "_partners_v_blocks_section_group_sections" ALTER COLUMN "surface" SET DEFAULT 'default'::text;
  DROP TYPE "public"."sf";
  CREATE TYPE "public"."sf" AS ENUM('default', 'subtle', 'inverse', 'image');
  ALTER TABLE "pages_blocks_column_layout_columns" ALTER COLUMN "surface" SET DEFAULT 'default'::"public"."sf";
  ALTER TABLE "pages_blocks_column_layout_columns" ALTER COLUMN "surface" SET DATA TYPE "public"."sf" USING "surface"::"public"."sf";
  ALTER TABLE "pages_blocks_section_group_sections" ALTER COLUMN "surface" SET DEFAULT 'default'::"public"."sf";
  ALTER TABLE "pages_blocks_section_group_sections" ALTER COLUMN "surface" SET DATA TYPE "public"."sf" USING "surface"::"public"."sf";
  ALTER TABLE "_pages_v_blocks_column_layout_columns" ALTER COLUMN "surface" SET DEFAULT 'default'::"public"."sf";
  ALTER TABLE "_pages_v_blocks_column_layout_columns" ALTER COLUMN "surface" SET DATA TYPE "public"."sf" USING "surface"::"public"."sf";
  ALTER TABLE "_pages_v_blocks_section_group_sections" ALTER COLUMN "surface" SET DEFAULT 'default'::"public"."sf";
  ALTER TABLE "_pages_v_blocks_section_group_sections" ALTER COLUMN "surface" SET DATA TYPE "public"."sf" USING "surface"::"public"."sf";
  ALTER TABLE "posts_blocks_column_layout_columns" ALTER COLUMN "surface" SET DEFAULT 'default'::"public"."sf";
  ALTER TABLE "posts_blocks_column_layout_columns" ALTER COLUMN "surface" SET DATA TYPE "public"."sf" USING "surface"::"public"."sf";
  ALTER TABLE "posts_blocks_section_group_sections" ALTER COLUMN "surface" SET DEFAULT 'default'::"public"."sf";
  ALTER TABLE "posts_blocks_section_group_sections" ALTER COLUMN "surface" SET DATA TYPE "public"."sf" USING "surface"::"public"."sf";
  ALTER TABLE "_posts_v_blocks_column_layout_columns" ALTER COLUMN "surface" SET DEFAULT 'default'::"public"."sf";
  ALTER TABLE "_posts_v_blocks_column_layout_columns" ALTER COLUMN "surface" SET DATA TYPE "public"."sf" USING "surface"::"public"."sf";
  ALTER TABLE "_posts_v_blocks_section_group_sections" ALTER COLUMN "surface" SET DEFAULT 'default'::"public"."sf";
  ALTER TABLE "_posts_v_blocks_section_group_sections" ALTER COLUMN "surface" SET DATA TYPE "public"."sf" USING "surface"::"public"."sf";
  ALTER TABLE "events_blocks_column_layout_columns" ALTER COLUMN "surface" SET DEFAULT 'default'::"public"."sf";
  ALTER TABLE "events_blocks_column_layout_columns" ALTER COLUMN "surface" SET DATA TYPE "public"."sf" USING "surface"::"public"."sf";
  ALTER TABLE "events_blocks_section_group_sections" ALTER COLUMN "surface" SET DEFAULT 'default'::"public"."sf";
  ALTER TABLE "events_blocks_section_group_sections" ALTER COLUMN "surface" SET DATA TYPE "public"."sf" USING "surface"::"public"."sf";
  ALTER TABLE "_events_v_blocks_column_layout_columns" ALTER COLUMN "surface" SET DEFAULT 'default'::"public"."sf";
  ALTER TABLE "_events_v_blocks_column_layout_columns" ALTER COLUMN "surface" SET DATA TYPE "public"."sf" USING "surface"::"public"."sf";
  ALTER TABLE "_events_v_blocks_section_group_sections" ALTER COLUMN "surface" SET DEFAULT 'default'::"public"."sf";
  ALTER TABLE "_events_v_blocks_section_group_sections" ALTER COLUMN "surface" SET DATA TYPE "public"."sf" USING "surface"::"public"."sf";
  ALTER TABLE "event_cycles_blocks_column_layout_columns" ALTER COLUMN "surface" SET DEFAULT 'default'::"public"."sf";
  ALTER TABLE "event_cycles_blocks_column_layout_columns" ALTER COLUMN "surface" SET DATA TYPE "public"."sf" USING "surface"::"public"."sf";
  ALTER TABLE "event_cycles_blocks_section_group_sections" ALTER COLUMN "surface" SET DEFAULT 'default'::"public"."sf";
  ALTER TABLE "event_cycles_blocks_section_group_sections" ALTER COLUMN "surface" SET DATA TYPE "public"."sf" USING "surface"::"public"."sf";
  ALTER TABLE "_event_cycles_v_blocks_column_layout_columns" ALTER COLUMN "surface" SET DEFAULT 'default'::"public"."sf";
  ALTER TABLE "_event_cycles_v_blocks_column_layout_columns" ALTER COLUMN "surface" SET DATA TYPE "public"."sf" USING "surface"::"public"."sf";
  ALTER TABLE "_event_cycles_v_blocks_section_group_sections" ALTER COLUMN "surface" SET DEFAULT 'default'::"public"."sf";
  ALTER TABLE "_event_cycles_v_blocks_section_group_sections" ALTER COLUMN "surface" SET DATA TYPE "public"."sf" USING "surface"::"public"."sf";
  ALTER TABLE "partners_blocks_column_layout_columns" ALTER COLUMN "surface" SET DEFAULT 'default'::"public"."sf";
  ALTER TABLE "partners_blocks_column_layout_columns" ALTER COLUMN "surface" SET DATA TYPE "public"."sf" USING "surface"::"public"."sf";
  ALTER TABLE "partners_blocks_section_group_sections" ALTER COLUMN "surface" SET DEFAULT 'default'::"public"."sf";
  ALTER TABLE "partners_blocks_section_group_sections" ALTER COLUMN "surface" SET DATA TYPE "public"."sf" USING "surface"::"public"."sf";
  ALTER TABLE "_partners_v_blocks_column_layout_columns" ALTER COLUMN "surface" SET DEFAULT 'default'::"public"."sf";
  ALTER TABLE "_partners_v_blocks_column_layout_columns" ALTER COLUMN "surface" SET DATA TYPE "public"."sf" USING "surface"::"public"."sf";
  ALTER TABLE "_partners_v_blocks_section_group_sections" ALTER COLUMN "surface" SET DEFAULT 'default'::"public"."sf";
  ALTER TABLE "_partners_v_blocks_section_group_sections" ALTER COLUMN "surface" SET DATA TYPE "public"."sf" USING "surface"::"public"."sf";
  DROP INDEX "pages_blocks_rich_text_surface_image_idx";
  DROP INDEX "pages_blocks_listing_surface_image_idx";
  DROP INDEX "pages_blocks_media_gallery_surface_image_idx";
  DROP INDEX "pages_blocks_documents_surface_image_idx";
  DROP INDEX "pages_blocks_attachments_surface_image_idx";
  DROP INDEX "pages_blocks_member_profiles_surface_image_idx";
  DROP INDEX "pages_blocks_column_layout_surface_image_idx";
  DROP INDEX "pages_blocks_section_group_surface_image_idx";
  DROP INDEX "_pages_v_blocks_rich_text_surface_image_idx";
  DROP INDEX "_pages_v_blocks_listing_surface_image_idx";
  DROP INDEX "_pages_v_blocks_media_gallery_surface_image_idx";
  DROP INDEX "_pages_v_blocks_documents_surface_image_idx";
  DROP INDEX "_pages_v_blocks_attachments_surface_image_idx";
  DROP INDEX "_pages_v_blocks_member_profiles_surface_image_idx";
  DROP INDEX "_pages_v_blocks_column_layout_surface_image_idx";
  DROP INDEX "_pages_v_blocks_section_group_surface_image_idx";
  DROP INDEX "posts_blocks_rich_text_surface_image_idx";
  DROP INDEX "posts_blocks_listing_surface_image_idx";
  DROP INDEX "posts_blocks_media_gallery_surface_image_idx";
  DROP INDEX "posts_blocks_documents_surface_image_idx";
  DROP INDEX "posts_blocks_attachments_surface_image_idx";
  DROP INDEX "posts_blocks_member_profiles_surface_image_idx";
  DROP INDEX "posts_blocks_column_layout_surface_image_idx";
  DROP INDEX "posts_blocks_section_group_surface_image_idx";
  DROP INDEX "_posts_v_blocks_rich_text_surface_image_idx";
  DROP INDEX "_posts_v_blocks_listing_surface_image_idx";
  DROP INDEX "_posts_v_blocks_media_gallery_surface_image_idx";
  DROP INDEX "_posts_v_blocks_documents_surface_image_idx";
  DROP INDEX "_posts_v_blocks_attachments_surface_image_idx";
  DROP INDEX "_posts_v_blocks_member_profiles_surface_image_idx";
  DROP INDEX "_posts_v_blocks_column_layout_surface_image_idx";
  DROP INDEX "_posts_v_blocks_section_group_surface_image_idx";
  DROP INDEX "events_blocks_rich_text_surface_image_idx";
  DROP INDEX "events_blocks_listing_surface_image_idx";
  DROP INDEX "events_blocks_media_gallery_surface_image_idx";
  DROP INDEX "events_blocks_documents_surface_image_idx";
  DROP INDEX "events_blocks_attachments_surface_image_idx";
  DROP INDEX "events_blocks_member_profiles_surface_image_idx";
  DROP INDEX "events_blocks_column_layout_surface_image_idx";
  DROP INDEX "events_blocks_section_group_surface_image_idx";
  DROP INDEX "_events_v_blocks_rich_text_surface_image_idx";
  DROP INDEX "_events_v_blocks_listing_surface_image_idx";
  DROP INDEX "_events_v_blocks_media_gallery_surface_image_idx";
  DROP INDEX "_events_v_blocks_documents_surface_image_idx";
  DROP INDEX "_events_v_blocks_attachments_surface_image_idx";
  DROP INDEX "_events_v_blocks_member_profiles_surface_image_idx";
  DROP INDEX "_events_v_blocks_column_layout_surface_image_idx";
  DROP INDEX "_events_v_blocks_section_group_surface_image_idx";
  DROP INDEX "event_cycles_blocks_rich_text_surface_image_idx";
  DROP INDEX "event_cycles_blocks_listing_surface_image_idx";
  DROP INDEX "event_cycles_blocks_media_gallery_surface_image_idx";
  DROP INDEX "event_cycles_blocks_documents_surface_image_idx";
  DROP INDEX "event_cycles_blocks_attachments_surface_image_idx";
  DROP INDEX "event_cycles_blocks_member_profiles_surface_image_idx";
  DROP INDEX "event_cycles_blocks_column_layout_surface_image_idx";
  DROP INDEX "event_cycles_blocks_section_group_surface_image_idx";
  DROP INDEX "_event_cycles_v_blocks_rich_text_surface_image_idx";
  DROP INDEX "_event_cycles_v_blocks_listing_surface_image_idx";
  DROP INDEX "_event_cycles_v_blocks_media_gallery_surface_image_idx";
  DROP INDEX "_event_cycles_v_blocks_documents_surface_image_idx";
  DROP INDEX "_event_cycles_v_blocks_attachments_surface_image_idx";
  DROP INDEX "_event_cycles_v_blocks_member_profiles_surface_image_idx";
  DROP INDEX "_event_cycles_v_blocks_column_layout_surface_image_idx";
  DROP INDEX "_event_cycles_v_blocks_section_group_surface_image_idx";
  DROP INDEX "partners_blocks_rich_text_surface_image_idx";
  DROP INDEX "partners_blocks_listing_surface_image_idx";
  DROP INDEX "partners_blocks_media_gallery_surface_image_idx";
  DROP INDEX "partners_blocks_documents_surface_image_idx";
  DROP INDEX "partners_blocks_attachments_surface_image_idx";
  DROP INDEX "partners_blocks_member_profiles_surface_image_idx";
  DROP INDEX "partners_blocks_column_layout_surface_image_idx";
  DROP INDEX "partners_blocks_section_group_surface_image_idx";
  DROP INDEX "_partners_v_blocks_rich_text_surface_image_idx";
  DROP INDEX "_partners_v_blocks_listing_surface_image_idx";
  DROP INDEX "_partners_v_blocks_media_gallery_surface_image_idx";
  DROP INDEX "_partners_v_blocks_documents_surface_image_idx";
  DROP INDEX "_partners_v_blocks_attachments_surface_image_idx";
  DROP INDEX "_partners_v_blocks_member_profiles_surface_image_idx";
  DROP INDEX "_partners_v_blocks_column_layout_surface_image_idx";
  DROP INDEX "_partners_v_blocks_section_group_surface_image_idx";
  DO $$
  DECLARE
    table_name text;
    enum_name text;
  BEGIN
    FOREACH table_name IN ARRAY ARRAY[
      'pages_blocks_section_group', '_pages_v_blocks_section_group',
      'posts_blocks_section_group', '_posts_v_blocks_section_group',
      'events_blocks_section_group', '_events_v_blocks_section_group',
      'event_cycles_blocks_section_group', '_event_cycles_v_blocks_section_group',
      'partners_blocks_section_group', '_partners_v_blocks_section_group'
    ] LOOP
      enum_name := 'enum_' || table_name || '_frame';
      EXECUTE format('ALTER TABLE %I ALTER COLUMN frame DROP DEFAULT', table_name);
      EXECUTE format(
        'ALTER TABLE %I ALTER COLUMN frame TYPE %I USING (CASE WHEN frame THEN ''outline'' ELSE ''none'' END)::%I',
        table_name,
        enum_name,
        enum_name
      );
      EXECUTE format('ALTER TABLE %I ALTER COLUMN frame SET DEFAULT ''outline''::%I', table_name, enum_name);
    END LOOP;
  END $$;
  ALTER TABLE "pages_blocks_heading" ADD COLUMN "role" "enum_pages_blocks_heading_role" DEFAULT 'section';
  ALTER TABLE "_pages_v_blocks_heading" ADD COLUMN "role" "enum__pages_v_blocks_heading_role" DEFAULT 'section';
  ALTER TABLE "posts_blocks_heading" ADD COLUMN "role" "enum_posts_blocks_heading_role" DEFAULT 'section';
  ALTER TABLE "_posts_v_blocks_heading" ADD COLUMN "role" "enum__posts_v_blocks_heading_role" DEFAULT 'section';
  ALTER TABLE "events_blocks_heading" ADD COLUMN "role" "enum_events_blocks_heading_role" DEFAULT 'section';
  ALTER TABLE "_events_v_blocks_heading" ADD COLUMN "role" "enum__events_v_blocks_heading_role" DEFAULT 'section';
  ALTER TABLE "event_cycles_blocks_heading" ADD COLUMN "role" "enum_event_cycles_blocks_heading_role" DEFAULT 'section';
  ALTER TABLE "_event_cycles_v_blocks_heading" ADD COLUMN "role" "enum__event_cycles_v_blocks_heading_role" DEFAULT 'section';
  ALTER TABLE "partners_blocks_heading" ADD COLUMN "role" "enum_partners_blocks_heading_role" DEFAULT 'section';
  ALTER TABLE "_partners_v_blocks_heading" ADD COLUMN "role" "enum__partners_v_blocks_heading_role" DEFAULT 'section';
  ALTER TABLE "pages_blocks_rich_text" DROP COLUMN "heading";
  ALTER TABLE "pages_blocks_rich_text" DROP COLUMN "heading_icon_name";
  ALTER TABLE "pages_blocks_rich_text" DROP COLUMN "frame";
  ALTER TABLE "pages_blocks_rich_text" DROP COLUMN "surface";
  ALTER TABLE "pages_blocks_rich_text" DROP COLUMN "surface_image_id";
  ALTER TABLE "pages_blocks_rich_text" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "pages_blocks_rich_text" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "pages_blocks_listing" DROP COLUMN "heading_icon_name";
  ALTER TABLE "pages_blocks_listing" DROP COLUMN "frame";
  ALTER TABLE "pages_blocks_listing" DROP COLUMN "surface";
  ALTER TABLE "pages_blocks_listing" DROP COLUMN "surface_image_id";
  ALTER TABLE "pages_blocks_listing" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "pages_blocks_listing" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "pages_blocks_media_gallery" DROP COLUMN "heading_icon_name";
  ALTER TABLE "pages_blocks_media_gallery" DROP COLUMN "frame";
  ALTER TABLE "pages_blocks_media_gallery" DROP COLUMN "surface";
  ALTER TABLE "pages_blocks_media_gallery" DROP COLUMN "surface_image_id";
  ALTER TABLE "pages_blocks_media_gallery" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "pages_blocks_media_gallery" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "pages_blocks_documents" DROP COLUMN "heading_icon_name";
  ALTER TABLE "pages_blocks_documents" DROP COLUMN "frame";
  ALTER TABLE "pages_blocks_documents" DROP COLUMN "surface";
  ALTER TABLE "pages_blocks_documents" DROP COLUMN "surface_image_id";
  ALTER TABLE "pages_blocks_documents" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "pages_blocks_documents" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "pages_blocks_attachments" DROP COLUMN "heading_icon_name";
  ALTER TABLE "pages_blocks_attachments" DROP COLUMN "frame";
  ALTER TABLE "pages_blocks_attachments" DROP COLUMN "surface";
  ALTER TABLE "pages_blocks_attachments" DROP COLUMN "surface_image_id";
  ALTER TABLE "pages_blocks_attachments" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "pages_blocks_attachments" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "pages_blocks_member_profiles" DROP COLUMN "heading_icon_name";
  ALTER TABLE "pages_blocks_member_profiles" DROP COLUMN "frame";
  ALTER TABLE "pages_blocks_member_profiles" DROP COLUMN "surface";
  ALTER TABLE "pages_blocks_member_profiles" DROP COLUMN "surface_image_id";
  ALTER TABLE "pages_blocks_member_profiles" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "pages_blocks_member_profiles" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "pages_blocks_column_layout_columns" DROP COLUMN "heading";
  ALTER TABLE "pages_blocks_column_layout_columns" DROP COLUMN "heading_icon_name";
  ALTER TABLE "pages_blocks_column_layout_columns" DROP COLUMN "frame";
  ALTER TABLE "pages_blocks_column_layout" DROP COLUMN "heading";
  ALTER TABLE "pages_blocks_column_layout" DROP COLUMN "heading_icon_name";
  ALTER TABLE "pages_blocks_column_layout" DROP COLUMN "frame";
  ALTER TABLE "pages_blocks_column_layout" DROP COLUMN "surface";
  ALTER TABLE "pages_blocks_column_layout" DROP COLUMN "surface_image_id";
  ALTER TABLE "pages_blocks_column_layout" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "pages_blocks_column_layout" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "pages_blocks_section_group_sections" DROP COLUMN "heading";
  ALTER TABLE "pages_blocks_section_group_sections" DROP COLUMN "heading_icon_name";
  ALTER TABLE "pages_blocks_section_group_sections" DROP COLUMN "frame";
  ALTER TABLE "pages_blocks_section_group" DROP COLUMN "heading";
  ALTER TABLE "pages_blocks_section_group" DROP COLUMN "heading_icon_name";
  ALTER TABLE "pages_blocks_section_group" DROP COLUMN "surface";
  ALTER TABLE "pages_blocks_section_group" DROP COLUMN "surface_image_id";
  ALTER TABLE "pages_blocks_section_group" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "pages_blocks_section_group" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "_pages_v_blocks_rich_text" DROP COLUMN "heading";
  ALTER TABLE "_pages_v_blocks_rich_text" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_pages_v_blocks_rich_text" DROP COLUMN "frame";
  ALTER TABLE "_pages_v_blocks_rich_text" DROP COLUMN "surface";
  ALTER TABLE "_pages_v_blocks_rich_text" DROP COLUMN "surface_image_id";
  ALTER TABLE "_pages_v_blocks_rich_text" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "_pages_v_blocks_rich_text" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "_pages_v_blocks_listing" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_pages_v_blocks_listing" DROP COLUMN "frame";
  ALTER TABLE "_pages_v_blocks_listing" DROP COLUMN "surface";
  ALTER TABLE "_pages_v_blocks_listing" DROP COLUMN "surface_image_id";
  ALTER TABLE "_pages_v_blocks_listing" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "_pages_v_blocks_listing" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "_pages_v_blocks_media_gallery" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_pages_v_blocks_media_gallery" DROP COLUMN "frame";
  ALTER TABLE "_pages_v_blocks_media_gallery" DROP COLUMN "surface";
  ALTER TABLE "_pages_v_blocks_media_gallery" DROP COLUMN "surface_image_id";
  ALTER TABLE "_pages_v_blocks_media_gallery" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "_pages_v_blocks_media_gallery" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "_pages_v_blocks_documents" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_pages_v_blocks_documents" DROP COLUMN "frame";
  ALTER TABLE "_pages_v_blocks_documents" DROP COLUMN "surface";
  ALTER TABLE "_pages_v_blocks_documents" DROP COLUMN "surface_image_id";
  ALTER TABLE "_pages_v_blocks_documents" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "_pages_v_blocks_documents" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "_pages_v_blocks_attachments" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_pages_v_blocks_attachments" DROP COLUMN "frame";
  ALTER TABLE "_pages_v_blocks_attachments" DROP COLUMN "surface";
  ALTER TABLE "_pages_v_blocks_attachments" DROP COLUMN "surface_image_id";
  ALTER TABLE "_pages_v_blocks_attachments" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "_pages_v_blocks_attachments" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "_pages_v_blocks_member_profiles" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_pages_v_blocks_member_profiles" DROP COLUMN "frame";
  ALTER TABLE "_pages_v_blocks_member_profiles" DROP COLUMN "surface";
  ALTER TABLE "_pages_v_blocks_member_profiles" DROP COLUMN "surface_image_id";
  ALTER TABLE "_pages_v_blocks_member_profiles" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "_pages_v_blocks_member_profiles" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "_pages_v_blocks_column_layout_columns" DROP COLUMN "heading";
  ALTER TABLE "_pages_v_blocks_column_layout_columns" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_pages_v_blocks_column_layout_columns" DROP COLUMN "frame";
  ALTER TABLE "_pages_v_blocks_column_layout" DROP COLUMN "heading";
  ALTER TABLE "_pages_v_blocks_column_layout" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_pages_v_blocks_column_layout" DROP COLUMN "frame";
  ALTER TABLE "_pages_v_blocks_column_layout" DROP COLUMN "surface";
  ALTER TABLE "_pages_v_blocks_column_layout" DROP COLUMN "surface_image_id";
  ALTER TABLE "_pages_v_blocks_column_layout" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "_pages_v_blocks_column_layout" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "_pages_v_blocks_section_group_sections" DROP COLUMN "heading";
  ALTER TABLE "_pages_v_blocks_section_group_sections" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_pages_v_blocks_section_group_sections" DROP COLUMN "frame";
  ALTER TABLE "_pages_v_blocks_section_group" DROP COLUMN "heading";
  ALTER TABLE "_pages_v_blocks_section_group" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_pages_v_blocks_section_group" DROP COLUMN "surface";
  ALTER TABLE "_pages_v_blocks_section_group" DROP COLUMN "surface_image_id";
  ALTER TABLE "_pages_v_blocks_section_group" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "_pages_v_blocks_section_group" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "posts_blocks_rich_text" DROP COLUMN "heading";
  ALTER TABLE "posts_blocks_rich_text" DROP COLUMN "heading_icon_name";
  ALTER TABLE "posts_blocks_rich_text" DROP COLUMN "frame";
  ALTER TABLE "posts_blocks_rich_text" DROP COLUMN "surface";
  ALTER TABLE "posts_blocks_rich_text" DROP COLUMN "surface_image_id";
  ALTER TABLE "posts_blocks_rich_text" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "posts_blocks_rich_text" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "posts_blocks_listing" DROP COLUMN "heading_icon_name";
  ALTER TABLE "posts_blocks_listing" DROP COLUMN "frame";
  ALTER TABLE "posts_blocks_listing" DROP COLUMN "surface";
  ALTER TABLE "posts_blocks_listing" DROP COLUMN "surface_image_id";
  ALTER TABLE "posts_blocks_listing" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "posts_blocks_listing" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "posts_blocks_media_gallery" DROP COLUMN "heading_icon_name";
  ALTER TABLE "posts_blocks_media_gallery" DROP COLUMN "frame";
  ALTER TABLE "posts_blocks_media_gallery" DROP COLUMN "surface";
  ALTER TABLE "posts_blocks_media_gallery" DROP COLUMN "surface_image_id";
  ALTER TABLE "posts_blocks_media_gallery" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "posts_blocks_media_gallery" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "posts_blocks_documents" DROP COLUMN "heading_icon_name";
  ALTER TABLE "posts_blocks_documents" DROP COLUMN "frame";
  ALTER TABLE "posts_blocks_documents" DROP COLUMN "surface";
  ALTER TABLE "posts_blocks_documents" DROP COLUMN "surface_image_id";
  ALTER TABLE "posts_blocks_documents" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "posts_blocks_documents" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "posts_blocks_attachments" DROP COLUMN "heading_icon_name";
  ALTER TABLE "posts_blocks_attachments" DROP COLUMN "frame";
  ALTER TABLE "posts_blocks_attachments" DROP COLUMN "surface";
  ALTER TABLE "posts_blocks_attachments" DROP COLUMN "surface_image_id";
  ALTER TABLE "posts_blocks_attachments" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "posts_blocks_attachments" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "posts_blocks_member_profiles" DROP COLUMN "heading_icon_name";
  ALTER TABLE "posts_blocks_member_profiles" DROP COLUMN "frame";
  ALTER TABLE "posts_blocks_member_profiles" DROP COLUMN "surface";
  ALTER TABLE "posts_blocks_member_profiles" DROP COLUMN "surface_image_id";
  ALTER TABLE "posts_blocks_member_profiles" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "posts_blocks_member_profiles" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "posts_blocks_column_layout_columns" DROP COLUMN "heading";
  ALTER TABLE "posts_blocks_column_layout_columns" DROP COLUMN "heading_icon_name";
  ALTER TABLE "posts_blocks_column_layout_columns" DROP COLUMN "frame";
  ALTER TABLE "posts_blocks_column_layout" DROP COLUMN "heading";
  ALTER TABLE "posts_blocks_column_layout" DROP COLUMN "heading_icon_name";
  ALTER TABLE "posts_blocks_column_layout" DROP COLUMN "frame";
  ALTER TABLE "posts_blocks_column_layout" DROP COLUMN "surface";
  ALTER TABLE "posts_blocks_column_layout" DROP COLUMN "surface_image_id";
  ALTER TABLE "posts_blocks_column_layout" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "posts_blocks_column_layout" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "posts_blocks_section_group_sections" DROP COLUMN "heading";
  ALTER TABLE "posts_blocks_section_group_sections" DROP COLUMN "heading_icon_name";
  ALTER TABLE "posts_blocks_section_group_sections" DROP COLUMN "frame";
  ALTER TABLE "posts_blocks_section_group" DROP COLUMN "heading";
  ALTER TABLE "posts_blocks_section_group" DROP COLUMN "heading_icon_name";
  ALTER TABLE "posts_blocks_section_group" DROP COLUMN "surface";
  ALTER TABLE "posts_blocks_section_group" DROP COLUMN "surface_image_id";
  ALTER TABLE "posts_blocks_section_group" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "posts_blocks_section_group" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "_posts_v_blocks_rich_text" DROP COLUMN "heading";
  ALTER TABLE "_posts_v_blocks_rich_text" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_posts_v_blocks_rich_text" DROP COLUMN "frame";
  ALTER TABLE "_posts_v_blocks_rich_text" DROP COLUMN "surface";
  ALTER TABLE "_posts_v_blocks_rich_text" DROP COLUMN "surface_image_id";
  ALTER TABLE "_posts_v_blocks_rich_text" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "_posts_v_blocks_rich_text" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "_posts_v_blocks_listing" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_posts_v_blocks_listing" DROP COLUMN "frame";
  ALTER TABLE "_posts_v_blocks_listing" DROP COLUMN "surface";
  ALTER TABLE "_posts_v_blocks_listing" DROP COLUMN "surface_image_id";
  ALTER TABLE "_posts_v_blocks_listing" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "_posts_v_blocks_listing" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "_posts_v_blocks_media_gallery" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_posts_v_blocks_media_gallery" DROP COLUMN "frame";
  ALTER TABLE "_posts_v_blocks_media_gallery" DROP COLUMN "surface";
  ALTER TABLE "_posts_v_blocks_media_gallery" DROP COLUMN "surface_image_id";
  ALTER TABLE "_posts_v_blocks_media_gallery" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "_posts_v_blocks_media_gallery" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "_posts_v_blocks_documents" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_posts_v_blocks_documents" DROP COLUMN "frame";
  ALTER TABLE "_posts_v_blocks_documents" DROP COLUMN "surface";
  ALTER TABLE "_posts_v_blocks_documents" DROP COLUMN "surface_image_id";
  ALTER TABLE "_posts_v_blocks_documents" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "_posts_v_blocks_documents" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "_posts_v_blocks_attachments" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_posts_v_blocks_attachments" DROP COLUMN "frame";
  ALTER TABLE "_posts_v_blocks_attachments" DROP COLUMN "surface";
  ALTER TABLE "_posts_v_blocks_attachments" DROP COLUMN "surface_image_id";
  ALTER TABLE "_posts_v_blocks_attachments" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "_posts_v_blocks_attachments" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "_posts_v_blocks_member_profiles" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_posts_v_blocks_member_profiles" DROP COLUMN "frame";
  ALTER TABLE "_posts_v_blocks_member_profiles" DROP COLUMN "surface";
  ALTER TABLE "_posts_v_blocks_member_profiles" DROP COLUMN "surface_image_id";
  ALTER TABLE "_posts_v_blocks_member_profiles" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "_posts_v_blocks_member_profiles" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "_posts_v_blocks_column_layout_columns" DROP COLUMN "heading";
  ALTER TABLE "_posts_v_blocks_column_layout_columns" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_posts_v_blocks_column_layout_columns" DROP COLUMN "frame";
  ALTER TABLE "_posts_v_blocks_column_layout" DROP COLUMN "heading";
  ALTER TABLE "_posts_v_blocks_column_layout" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_posts_v_blocks_column_layout" DROP COLUMN "frame";
  ALTER TABLE "_posts_v_blocks_column_layout" DROP COLUMN "surface";
  ALTER TABLE "_posts_v_blocks_column_layout" DROP COLUMN "surface_image_id";
  ALTER TABLE "_posts_v_blocks_column_layout" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "_posts_v_blocks_column_layout" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "_posts_v_blocks_section_group_sections" DROP COLUMN "heading";
  ALTER TABLE "_posts_v_blocks_section_group_sections" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_posts_v_blocks_section_group_sections" DROP COLUMN "frame";
  ALTER TABLE "_posts_v_blocks_section_group" DROP COLUMN "heading";
  ALTER TABLE "_posts_v_blocks_section_group" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_posts_v_blocks_section_group" DROP COLUMN "surface";
  ALTER TABLE "_posts_v_blocks_section_group" DROP COLUMN "surface_image_id";
  ALTER TABLE "_posts_v_blocks_section_group" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "_posts_v_blocks_section_group" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "events_blocks_rich_text" DROP COLUMN "heading";
  ALTER TABLE "events_blocks_rich_text" DROP COLUMN "heading_icon_name";
  ALTER TABLE "events_blocks_rich_text" DROP COLUMN "frame";
  ALTER TABLE "events_blocks_rich_text" DROP COLUMN "surface";
  ALTER TABLE "events_blocks_rich_text" DROP COLUMN "surface_image_id";
  ALTER TABLE "events_blocks_rich_text" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "events_blocks_rich_text" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "events_blocks_listing" DROP COLUMN "heading_icon_name";
  ALTER TABLE "events_blocks_listing" DROP COLUMN "frame";
  ALTER TABLE "events_blocks_listing" DROP COLUMN "surface";
  ALTER TABLE "events_blocks_listing" DROP COLUMN "surface_image_id";
  ALTER TABLE "events_blocks_listing" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "events_blocks_listing" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "events_blocks_media_gallery" DROP COLUMN "heading_icon_name";
  ALTER TABLE "events_blocks_media_gallery" DROP COLUMN "frame";
  ALTER TABLE "events_blocks_media_gallery" DROP COLUMN "surface";
  ALTER TABLE "events_blocks_media_gallery" DROP COLUMN "surface_image_id";
  ALTER TABLE "events_blocks_media_gallery" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "events_blocks_media_gallery" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "events_blocks_documents" DROP COLUMN "heading_icon_name";
  ALTER TABLE "events_blocks_documents" DROP COLUMN "frame";
  ALTER TABLE "events_blocks_documents" DROP COLUMN "surface";
  ALTER TABLE "events_blocks_documents" DROP COLUMN "surface_image_id";
  ALTER TABLE "events_blocks_documents" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "events_blocks_documents" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "events_blocks_attachments" DROP COLUMN "heading_icon_name";
  ALTER TABLE "events_blocks_attachments" DROP COLUMN "frame";
  ALTER TABLE "events_blocks_attachments" DROP COLUMN "surface";
  ALTER TABLE "events_blocks_attachments" DROP COLUMN "surface_image_id";
  ALTER TABLE "events_blocks_attachments" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "events_blocks_attachments" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "events_blocks_member_profiles" DROP COLUMN "heading_icon_name";
  ALTER TABLE "events_blocks_member_profiles" DROP COLUMN "frame";
  ALTER TABLE "events_blocks_member_profiles" DROP COLUMN "surface";
  ALTER TABLE "events_blocks_member_profiles" DROP COLUMN "surface_image_id";
  ALTER TABLE "events_blocks_member_profiles" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "events_blocks_member_profiles" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "events_blocks_column_layout_columns" DROP COLUMN "heading";
  ALTER TABLE "events_blocks_column_layout_columns" DROP COLUMN "heading_icon_name";
  ALTER TABLE "events_blocks_column_layout_columns" DROP COLUMN "frame";
  ALTER TABLE "events_blocks_column_layout" DROP COLUMN "heading";
  ALTER TABLE "events_blocks_column_layout" DROP COLUMN "heading_icon_name";
  ALTER TABLE "events_blocks_column_layout" DROP COLUMN "frame";
  ALTER TABLE "events_blocks_column_layout" DROP COLUMN "surface";
  ALTER TABLE "events_blocks_column_layout" DROP COLUMN "surface_image_id";
  ALTER TABLE "events_blocks_column_layout" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "events_blocks_column_layout" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "events_blocks_section_group_sections" DROP COLUMN "heading";
  ALTER TABLE "events_blocks_section_group_sections" DROP COLUMN "heading_icon_name";
  ALTER TABLE "events_blocks_section_group_sections" DROP COLUMN "frame";
  ALTER TABLE "events_blocks_section_group" DROP COLUMN "heading";
  ALTER TABLE "events_blocks_section_group" DROP COLUMN "heading_icon_name";
  ALTER TABLE "events_blocks_section_group" DROP COLUMN "surface";
  ALTER TABLE "events_blocks_section_group" DROP COLUMN "surface_image_id";
  ALTER TABLE "events_blocks_section_group" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "events_blocks_section_group" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "_events_v_blocks_rich_text" DROP COLUMN "heading";
  ALTER TABLE "_events_v_blocks_rich_text" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_events_v_blocks_rich_text" DROP COLUMN "frame";
  ALTER TABLE "_events_v_blocks_rich_text" DROP COLUMN "surface";
  ALTER TABLE "_events_v_blocks_rich_text" DROP COLUMN "surface_image_id";
  ALTER TABLE "_events_v_blocks_rich_text" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "_events_v_blocks_rich_text" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "_events_v_blocks_listing" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_events_v_blocks_listing" DROP COLUMN "frame";
  ALTER TABLE "_events_v_blocks_listing" DROP COLUMN "surface";
  ALTER TABLE "_events_v_blocks_listing" DROP COLUMN "surface_image_id";
  ALTER TABLE "_events_v_blocks_listing" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "_events_v_blocks_listing" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "_events_v_blocks_media_gallery" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_events_v_blocks_media_gallery" DROP COLUMN "frame";
  ALTER TABLE "_events_v_blocks_media_gallery" DROP COLUMN "surface";
  ALTER TABLE "_events_v_blocks_media_gallery" DROP COLUMN "surface_image_id";
  ALTER TABLE "_events_v_blocks_media_gallery" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "_events_v_blocks_media_gallery" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "_events_v_blocks_documents" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_events_v_blocks_documents" DROP COLUMN "frame";
  ALTER TABLE "_events_v_blocks_documents" DROP COLUMN "surface";
  ALTER TABLE "_events_v_blocks_documents" DROP COLUMN "surface_image_id";
  ALTER TABLE "_events_v_blocks_documents" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "_events_v_blocks_documents" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "_events_v_blocks_attachments" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_events_v_blocks_attachments" DROP COLUMN "frame";
  ALTER TABLE "_events_v_blocks_attachments" DROP COLUMN "surface";
  ALTER TABLE "_events_v_blocks_attachments" DROP COLUMN "surface_image_id";
  ALTER TABLE "_events_v_blocks_attachments" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "_events_v_blocks_attachments" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "_events_v_blocks_member_profiles" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_events_v_blocks_member_profiles" DROP COLUMN "frame";
  ALTER TABLE "_events_v_blocks_member_profiles" DROP COLUMN "surface";
  ALTER TABLE "_events_v_blocks_member_profiles" DROP COLUMN "surface_image_id";
  ALTER TABLE "_events_v_blocks_member_profiles" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "_events_v_blocks_member_profiles" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "_events_v_blocks_column_layout_columns" DROP COLUMN "heading";
  ALTER TABLE "_events_v_blocks_column_layout_columns" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_events_v_blocks_column_layout_columns" DROP COLUMN "frame";
  ALTER TABLE "_events_v_blocks_column_layout" DROP COLUMN "heading";
  ALTER TABLE "_events_v_blocks_column_layout" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_events_v_blocks_column_layout" DROP COLUMN "frame";
  ALTER TABLE "_events_v_blocks_column_layout" DROP COLUMN "surface";
  ALTER TABLE "_events_v_blocks_column_layout" DROP COLUMN "surface_image_id";
  ALTER TABLE "_events_v_blocks_column_layout" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "_events_v_blocks_column_layout" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "_events_v_blocks_section_group_sections" DROP COLUMN "heading";
  ALTER TABLE "_events_v_blocks_section_group_sections" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_events_v_blocks_section_group_sections" DROP COLUMN "frame";
  ALTER TABLE "_events_v_blocks_section_group" DROP COLUMN "heading";
  ALTER TABLE "_events_v_blocks_section_group" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_events_v_blocks_section_group" DROP COLUMN "surface";
  ALTER TABLE "_events_v_blocks_section_group" DROP COLUMN "surface_image_id";
  ALTER TABLE "_events_v_blocks_section_group" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "_events_v_blocks_section_group" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "event_cycles_blocks_rich_text" DROP COLUMN "heading";
  ALTER TABLE "event_cycles_blocks_rich_text" DROP COLUMN "heading_icon_name";
  ALTER TABLE "event_cycles_blocks_rich_text" DROP COLUMN "frame";
  ALTER TABLE "event_cycles_blocks_rich_text" DROP COLUMN "surface";
  ALTER TABLE "event_cycles_blocks_rich_text" DROP COLUMN "surface_image_id";
  ALTER TABLE "event_cycles_blocks_rich_text" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "event_cycles_blocks_rich_text" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "event_cycles_blocks_listing" DROP COLUMN "heading_icon_name";
  ALTER TABLE "event_cycles_blocks_listing" DROP COLUMN "frame";
  ALTER TABLE "event_cycles_blocks_listing" DROP COLUMN "surface";
  ALTER TABLE "event_cycles_blocks_listing" DROP COLUMN "surface_image_id";
  ALTER TABLE "event_cycles_blocks_listing" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "event_cycles_blocks_listing" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "event_cycles_blocks_media_gallery" DROP COLUMN "heading_icon_name";
  ALTER TABLE "event_cycles_blocks_media_gallery" DROP COLUMN "frame";
  ALTER TABLE "event_cycles_blocks_media_gallery" DROP COLUMN "surface";
  ALTER TABLE "event_cycles_blocks_media_gallery" DROP COLUMN "surface_image_id";
  ALTER TABLE "event_cycles_blocks_media_gallery" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "event_cycles_blocks_media_gallery" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "event_cycles_blocks_documents" DROP COLUMN "heading_icon_name";
  ALTER TABLE "event_cycles_blocks_documents" DROP COLUMN "frame";
  ALTER TABLE "event_cycles_blocks_documents" DROP COLUMN "surface";
  ALTER TABLE "event_cycles_blocks_documents" DROP COLUMN "surface_image_id";
  ALTER TABLE "event_cycles_blocks_documents" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "event_cycles_blocks_documents" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "event_cycles_blocks_attachments" DROP COLUMN "heading_icon_name";
  ALTER TABLE "event_cycles_blocks_attachments" DROP COLUMN "frame";
  ALTER TABLE "event_cycles_blocks_attachments" DROP COLUMN "surface";
  ALTER TABLE "event_cycles_blocks_attachments" DROP COLUMN "surface_image_id";
  ALTER TABLE "event_cycles_blocks_attachments" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "event_cycles_blocks_attachments" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "event_cycles_blocks_member_profiles" DROP COLUMN "heading_icon_name";
  ALTER TABLE "event_cycles_blocks_member_profiles" DROP COLUMN "frame";
  ALTER TABLE "event_cycles_blocks_member_profiles" DROP COLUMN "surface";
  ALTER TABLE "event_cycles_blocks_member_profiles" DROP COLUMN "surface_image_id";
  ALTER TABLE "event_cycles_blocks_member_profiles" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "event_cycles_blocks_member_profiles" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "event_cycles_blocks_column_layout_columns" DROP COLUMN "heading";
  ALTER TABLE "event_cycles_blocks_column_layout_columns" DROP COLUMN "heading_icon_name";
  ALTER TABLE "event_cycles_blocks_column_layout_columns" DROP COLUMN "frame";
  ALTER TABLE "event_cycles_blocks_column_layout" DROP COLUMN "heading";
  ALTER TABLE "event_cycles_blocks_column_layout" DROP COLUMN "heading_icon_name";
  ALTER TABLE "event_cycles_blocks_column_layout" DROP COLUMN "frame";
  ALTER TABLE "event_cycles_blocks_column_layout" DROP COLUMN "surface";
  ALTER TABLE "event_cycles_blocks_column_layout" DROP COLUMN "surface_image_id";
  ALTER TABLE "event_cycles_blocks_column_layout" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "event_cycles_blocks_column_layout" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "event_cycles_blocks_section_group_sections" DROP COLUMN "heading";
  ALTER TABLE "event_cycles_blocks_section_group_sections" DROP COLUMN "heading_icon_name";
  ALTER TABLE "event_cycles_blocks_section_group_sections" DROP COLUMN "frame";
  ALTER TABLE "event_cycles_blocks_section_group" DROP COLUMN "heading";
  ALTER TABLE "event_cycles_blocks_section_group" DROP COLUMN "heading_icon_name";
  ALTER TABLE "event_cycles_blocks_section_group" DROP COLUMN "surface";
  ALTER TABLE "event_cycles_blocks_section_group" DROP COLUMN "surface_image_id";
  ALTER TABLE "event_cycles_blocks_section_group" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "event_cycles_blocks_section_group" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "_event_cycles_v_blocks_rich_text" DROP COLUMN "heading";
  ALTER TABLE "_event_cycles_v_blocks_rich_text" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_event_cycles_v_blocks_rich_text" DROP COLUMN "frame";
  ALTER TABLE "_event_cycles_v_blocks_rich_text" DROP COLUMN "surface";
  ALTER TABLE "_event_cycles_v_blocks_rich_text" DROP COLUMN "surface_image_id";
  ALTER TABLE "_event_cycles_v_blocks_rich_text" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "_event_cycles_v_blocks_rich_text" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "_event_cycles_v_blocks_listing" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_event_cycles_v_blocks_listing" DROP COLUMN "frame";
  ALTER TABLE "_event_cycles_v_blocks_listing" DROP COLUMN "surface";
  ALTER TABLE "_event_cycles_v_blocks_listing" DROP COLUMN "surface_image_id";
  ALTER TABLE "_event_cycles_v_blocks_listing" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "_event_cycles_v_blocks_listing" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "_event_cycles_v_blocks_media_gallery" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_event_cycles_v_blocks_media_gallery" DROP COLUMN "frame";
  ALTER TABLE "_event_cycles_v_blocks_media_gallery" DROP COLUMN "surface";
  ALTER TABLE "_event_cycles_v_blocks_media_gallery" DROP COLUMN "surface_image_id";
  ALTER TABLE "_event_cycles_v_blocks_media_gallery" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "_event_cycles_v_blocks_media_gallery" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "_event_cycles_v_blocks_documents" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_event_cycles_v_blocks_documents" DROP COLUMN "frame";
  ALTER TABLE "_event_cycles_v_blocks_documents" DROP COLUMN "surface";
  ALTER TABLE "_event_cycles_v_blocks_documents" DROP COLUMN "surface_image_id";
  ALTER TABLE "_event_cycles_v_blocks_documents" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "_event_cycles_v_blocks_documents" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "_event_cycles_v_blocks_attachments" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_event_cycles_v_blocks_attachments" DROP COLUMN "frame";
  ALTER TABLE "_event_cycles_v_blocks_attachments" DROP COLUMN "surface";
  ALTER TABLE "_event_cycles_v_blocks_attachments" DROP COLUMN "surface_image_id";
  ALTER TABLE "_event_cycles_v_blocks_attachments" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "_event_cycles_v_blocks_attachments" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "_event_cycles_v_blocks_member_profiles" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_event_cycles_v_blocks_member_profiles" DROP COLUMN "frame";
  ALTER TABLE "_event_cycles_v_blocks_member_profiles" DROP COLUMN "surface";
  ALTER TABLE "_event_cycles_v_blocks_member_profiles" DROP COLUMN "surface_image_id";
  ALTER TABLE "_event_cycles_v_blocks_member_profiles" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "_event_cycles_v_blocks_member_profiles" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "_event_cycles_v_blocks_column_layout_columns" DROP COLUMN "heading";
  ALTER TABLE "_event_cycles_v_blocks_column_layout_columns" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_event_cycles_v_blocks_column_layout_columns" DROP COLUMN "frame";
  ALTER TABLE "_event_cycles_v_blocks_column_layout" DROP COLUMN "heading";
  ALTER TABLE "_event_cycles_v_blocks_column_layout" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_event_cycles_v_blocks_column_layout" DROP COLUMN "frame";
  ALTER TABLE "_event_cycles_v_blocks_column_layout" DROP COLUMN "surface";
  ALTER TABLE "_event_cycles_v_blocks_column_layout" DROP COLUMN "surface_image_id";
  ALTER TABLE "_event_cycles_v_blocks_column_layout" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "_event_cycles_v_blocks_column_layout" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "_event_cycles_v_blocks_section_group_sections" DROP COLUMN "heading";
  ALTER TABLE "_event_cycles_v_blocks_section_group_sections" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_event_cycles_v_blocks_section_group_sections" DROP COLUMN "frame";
  ALTER TABLE "_event_cycles_v_blocks_section_group" DROP COLUMN "heading";
  ALTER TABLE "_event_cycles_v_blocks_section_group" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_event_cycles_v_blocks_section_group" DROP COLUMN "surface";
  ALTER TABLE "_event_cycles_v_blocks_section_group" DROP COLUMN "surface_image_id";
  ALTER TABLE "_event_cycles_v_blocks_section_group" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "_event_cycles_v_blocks_section_group" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "partners_blocks_rich_text" DROP COLUMN "heading";
  ALTER TABLE "partners_blocks_rich_text" DROP COLUMN "heading_icon_name";
  ALTER TABLE "partners_blocks_rich_text" DROP COLUMN "frame";
  ALTER TABLE "partners_blocks_rich_text" DROP COLUMN "surface";
  ALTER TABLE "partners_blocks_rich_text" DROP COLUMN "surface_image_id";
  ALTER TABLE "partners_blocks_rich_text" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "partners_blocks_rich_text" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "partners_blocks_listing" DROP COLUMN "heading_icon_name";
  ALTER TABLE "partners_blocks_listing" DROP COLUMN "frame";
  ALTER TABLE "partners_blocks_listing" DROP COLUMN "surface";
  ALTER TABLE "partners_blocks_listing" DROP COLUMN "surface_image_id";
  ALTER TABLE "partners_blocks_listing" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "partners_blocks_listing" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "partners_blocks_media_gallery" DROP COLUMN "heading_icon_name";
  ALTER TABLE "partners_blocks_media_gallery" DROP COLUMN "frame";
  ALTER TABLE "partners_blocks_media_gallery" DROP COLUMN "surface";
  ALTER TABLE "partners_blocks_media_gallery" DROP COLUMN "surface_image_id";
  ALTER TABLE "partners_blocks_media_gallery" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "partners_blocks_media_gallery" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "partners_blocks_documents" DROP COLUMN "heading_icon_name";
  ALTER TABLE "partners_blocks_documents" DROP COLUMN "frame";
  ALTER TABLE "partners_blocks_documents" DROP COLUMN "surface";
  ALTER TABLE "partners_blocks_documents" DROP COLUMN "surface_image_id";
  ALTER TABLE "partners_blocks_documents" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "partners_blocks_documents" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "partners_blocks_attachments" DROP COLUMN "heading_icon_name";
  ALTER TABLE "partners_blocks_attachments" DROP COLUMN "frame";
  ALTER TABLE "partners_blocks_attachments" DROP COLUMN "surface";
  ALTER TABLE "partners_blocks_attachments" DROP COLUMN "surface_image_id";
  ALTER TABLE "partners_blocks_attachments" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "partners_blocks_attachments" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "partners_blocks_member_profiles" DROP COLUMN "heading_icon_name";
  ALTER TABLE "partners_blocks_member_profiles" DROP COLUMN "frame";
  ALTER TABLE "partners_blocks_member_profiles" DROP COLUMN "surface";
  ALTER TABLE "partners_blocks_member_profiles" DROP COLUMN "surface_image_id";
  ALTER TABLE "partners_blocks_member_profiles" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "partners_blocks_member_profiles" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "partners_blocks_column_layout_columns" DROP COLUMN "heading";
  ALTER TABLE "partners_blocks_column_layout_columns" DROP COLUMN "heading_icon_name";
  ALTER TABLE "partners_blocks_column_layout_columns" DROP COLUMN "frame";
  ALTER TABLE "partners_blocks_column_layout" DROP COLUMN "heading";
  ALTER TABLE "partners_blocks_column_layout" DROP COLUMN "heading_icon_name";
  ALTER TABLE "partners_blocks_column_layout" DROP COLUMN "frame";
  ALTER TABLE "partners_blocks_column_layout" DROP COLUMN "surface";
  ALTER TABLE "partners_blocks_column_layout" DROP COLUMN "surface_image_id";
  ALTER TABLE "partners_blocks_column_layout" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "partners_blocks_column_layout" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "partners_blocks_section_group_sections" DROP COLUMN "heading";
  ALTER TABLE "partners_blocks_section_group_sections" DROP COLUMN "heading_icon_name";
  ALTER TABLE "partners_blocks_section_group_sections" DROP COLUMN "frame";
  ALTER TABLE "partners_blocks_section_group" DROP COLUMN "heading";
  ALTER TABLE "partners_blocks_section_group" DROP COLUMN "heading_icon_name";
  ALTER TABLE "partners_blocks_section_group" DROP COLUMN "surface";
  ALTER TABLE "partners_blocks_section_group" DROP COLUMN "surface_image_id";
  ALTER TABLE "partners_blocks_section_group" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "partners_blocks_section_group" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "_partners_v_blocks_rich_text" DROP COLUMN "heading";
  ALTER TABLE "_partners_v_blocks_rich_text" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_partners_v_blocks_rich_text" DROP COLUMN "frame";
  ALTER TABLE "_partners_v_blocks_rich_text" DROP COLUMN "surface";
  ALTER TABLE "_partners_v_blocks_rich_text" DROP COLUMN "surface_image_id";
  ALTER TABLE "_partners_v_blocks_rich_text" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "_partners_v_blocks_rich_text" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "_partners_v_blocks_listing" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_partners_v_blocks_listing" DROP COLUMN "frame";
  ALTER TABLE "_partners_v_blocks_listing" DROP COLUMN "surface";
  ALTER TABLE "_partners_v_blocks_listing" DROP COLUMN "surface_image_id";
  ALTER TABLE "_partners_v_blocks_listing" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "_partners_v_blocks_listing" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "_partners_v_blocks_media_gallery" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_partners_v_blocks_media_gallery" DROP COLUMN "frame";
  ALTER TABLE "_partners_v_blocks_media_gallery" DROP COLUMN "surface";
  ALTER TABLE "_partners_v_blocks_media_gallery" DROP COLUMN "surface_image_id";
  ALTER TABLE "_partners_v_blocks_media_gallery" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "_partners_v_blocks_media_gallery" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "_partners_v_blocks_documents" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_partners_v_blocks_documents" DROP COLUMN "frame";
  ALTER TABLE "_partners_v_blocks_documents" DROP COLUMN "surface";
  ALTER TABLE "_partners_v_blocks_documents" DROP COLUMN "surface_image_id";
  ALTER TABLE "_partners_v_blocks_documents" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "_partners_v_blocks_documents" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "_partners_v_blocks_attachments" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_partners_v_blocks_attachments" DROP COLUMN "frame";
  ALTER TABLE "_partners_v_blocks_attachments" DROP COLUMN "surface";
  ALTER TABLE "_partners_v_blocks_attachments" DROP COLUMN "surface_image_id";
  ALTER TABLE "_partners_v_blocks_attachments" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "_partners_v_blocks_attachments" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "_partners_v_blocks_member_profiles" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_partners_v_blocks_member_profiles" DROP COLUMN "frame";
  ALTER TABLE "_partners_v_blocks_member_profiles" DROP COLUMN "surface";
  ALTER TABLE "_partners_v_blocks_member_profiles" DROP COLUMN "surface_image_id";
  ALTER TABLE "_partners_v_blocks_member_profiles" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "_partners_v_blocks_member_profiles" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "_partners_v_blocks_column_layout_columns" DROP COLUMN "heading";
  ALTER TABLE "_partners_v_blocks_column_layout_columns" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_partners_v_blocks_column_layout_columns" DROP COLUMN "frame";
  ALTER TABLE "_partners_v_blocks_column_layout" DROP COLUMN "heading";
  ALTER TABLE "_partners_v_blocks_column_layout" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_partners_v_blocks_column_layout" DROP COLUMN "frame";
  ALTER TABLE "_partners_v_blocks_column_layout" DROP COLUMN "surface";
  ALTER TABLE "_partners_v_blocks_column_layout" DROP COLUMN "surface_image_id";
  ALTER TABLE "_partners_v_blocks_column_layout" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "_partners_v_blocks_column_layout" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "_partners_v_blocks_section_group_sections" DROP COLUMN "heading";
  ALTER TABLE "_partners_v_blocks_section_group_sections" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_partners_v_blocks_section_group_sections" DROP COLUMN "frame";
  ALTER TABLE "_partners_v_blocks_section_group" DROP COLUMN "heading";
  ALTER TABLE "_partners_v_blocks_section_group" DROP COLUMN "heading_icon_name";
  ALTER TABLE "_partners_v_blocks_section_group" DROP COLUMN "surface";
  ALTER TABLE "_partners_v_blocks_section_group" DROP COLUMN "surface_image_id";
  ALTER TABLE "_partners_v_blocks_section_group" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "_partners_v_blocks_section_group" DROP COLUMN "surface_vertical_position";
  DROP TYPE "public"."hd_icon";
  DROP TYPE "public"."enum_pages_blocks_heading_heading_icon_name";
  DROP TYPE "public"."enum__pages_v_blocks_heading_heading_icon_name";
  DROP TYPE "public"."enum_posts_blocks_heading_heading_icon_name";
  DROP TYPE "public"."enum__posts_v_blocks_heading_heading_icon_name";
  DROP TYPE "public"."enum_events_blocks_heading_heading_icon_name";
  DROP TYPE "public"."enum__events_v_blocks_heading_heading_icon_name";
  DROP TYPE "public"."enum_event_cycles_blocks_heading_heading_icon_name";
  DROP TYPE "public"."enum__event_cycles_v_blocks_heading_heading_icon_name";
  DROP TYPE "public"."enum_partners_blocks_heading_heading_icon_name";
  DROP TYPE "public"."enum__partners_v_blocks_heading_heading_icon_name";`)
}
