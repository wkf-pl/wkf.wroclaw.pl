import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."column_layout_vertical_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."column_layout_separators" AS ENUM('none', 'between');
  CREATE TYPE "public"."tab_header_icon_name" AS ENUM('camera', 'astronaut', 'ticket', 'bluesky', 'mace', 'bottle-mana', 'cthulhu', 'time', 'skull', 'dnd5', 'discord', 'document', 'pumpkin-halloween', 'mail', 'facebook', 'guitar', 'globe', 'board-game', 'star', 'instagram', 'calendar', 'hat', 'gun', 'cards', 'playing-cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'water-drop', 'crystal-ball', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'pirate-map', 'vendetta', 'messenger', 'sword', 'potion', 'music', 'image', 'announcement', 'eye', 'partner', 'pdf', 'seal', 'pawn', 'quill', 'flame', 'download', 'review', 'wand', 'sf', 'seance', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'superhero', 'stormtrooper', 'soundtrack', 'tag', 'shield', 'axe', 'twitch', 'shuttle', 'fighter', 'event', 'filled-star', 'youtube', 'scroll');
  CREATE TYPE "public"."enum_site_settings_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__site_settings_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_navigation_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__navigation_v_version_header_items_appearance" AS ENUM('link', 'primaryButton', 'secondaryButton');
  CREATE TYPE "public"."enum__navigation_v_version_header_items_icon_name" AS ENUM('camera', 'astronaut', 'ticket', 'bluesky', 'mace', 'bottle-mana', 'cthulhu', 'time', 'skull', 'dnd5', 'discord', 'document', 'pumpkin-halloween', 'mail', 'facebook', 'guitar', 'globe', 'board-game', 'star', 'instagram', 'calendar', 'hat', 'gun', 'cards', 'playing-cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'water-drop', 'crystal-ball', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'pirate-map', 'vendetta', 'messenger', 'sword', 'potion', 'music', 'image', 'announcement', 'eye', 'partner', 'pdf', 'seal', 'pawn', 'quill', 'flame', 'download', 'review', 'wand', 'sf', 'seance', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'superhero', 'stormtrooper', 'soundtrack', 'tag', 'shield', 'axe', 'twitch', 'shuttle', 'fighter', 'event', 'filled-star', 'youtube', 'scroll');
  CREATE TYPE "public"."enum__navigation_v_version_header_items_target_type" AS ENUM('eventCycle', 'document', 'siteContactEmail', 'category', 'partner', 'page', 'tag', 'custom', 'post', 'event');
  CREATE TYPE "public"."enum__navigation_v_version_header_items_custom_scheme" AS ENUM('https', 'http', 'mailto', 'tel', 'path', 'anchor');
  CREATE TYPE "public"."enum__navigation_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_homepage_hero_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__homepage_hero_v_version_items_appearance" AS ENUM('link', 'primaryButton', 'secondaryButton');
  CREATE TYPE "public"."enum__homepage_hero_v_version_items_icon_name" AS ENUM('camera', 'astronaut', 'ticket', 'bluesky', 'mace', 'bottle-mana', 'cthulhu', 'time', 'skull', 'dnd5', 'discord', 'document', 'pumpkin-halloween', 'mail', 'facebook', 'guitar', 'globe', 'board-game', 'star', 'instagram', 'calendar', 'hat', 'gun', 'cards', 'playing-cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'water-drop', 'crystal-ball', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'pirate-map', 'vendetta', 'messenger', 'sword', 'potion', 'music', 'image', 'announcement', 'eye', 'partner', 'pdf', 'seal', 'pawn', 'quill', 'flame', 'download', 'review', 'wand', 'sf', 'seance', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'superhero', 'stormtrooper', 'soundtrack', 'tag', 'shield', 'axe', 'twitch', 'shuttle', 'fighter', 'event', 'filled-star', 'youtube', 'scroll');
  CREATE TYPE "public"."enum__homepage_hero_v_version_items_target_type" AS ENUM('eventCycle', 'document', 'category', 'partner', 'page', 'tag', 'custom', 'post', 'event');
  CREATE TYPE "public"."enum__homepage_hero_v_version_items_custom_scheme" AS ENUM('https', 'http', 'mailto', 'tel', 'path', 'anchor');
  CREATE TYPE "public"."enum__homepage_hero_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_homepage_sections_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_rich_text_text_style" AS ENUM('default', 'lead', 'note');
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_heading_heading_level" AS ENUM('h2', 'h3', 'h4');
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_heading_heading_icon_name" AS ENUM('camera', 'astronaut', 'ticket', 'bluesky', 'mace', 'bottle-mana', 'cthulhu', 'time', 'skull', 'dnd5', 'discord', 'document', 'pumpkin-halloween', 'mail', 'facebook', 'guitar', 'globe', 'board-game', 'star', 'instagram', 'calendar', 'hat', 'gun', 'cards', 'playing-cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'water-drop', 'crystal-ball', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'pirate-map', 'vendetta', 'messenger', 'sword', 'potion', 'music', 'image', 'announcement', 'eye', 'partner', 'pdf', 'seal', 'pawn', 'quill', 'flame', 'download', 'review', 'wand', 'sf', 'seance', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'superhero', 'stormtrooper', 'soundtrack', 'tag', 'shield', 'axe', 'twitch', 'shuttle', 'fighter', 'event', 'filled-star', 'youtube', 'scroll');
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_action_links_items_icon_name" AS ENUM('camera', 'astronaut', 'ticket', 'bluesky', 'mace', 'bottle-mana', 'cthulhu', 'time', 'skull', 'dnd5', 'discord', 'document', 'pumpkin-halloween', 'mail', 'facebook', 'guitar', 'globe', 'board-game', 'star', 'instagram', 'calendar', 'hat', 'gun', 'cards', 'playing-cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'water-drop', 'crystal-ball', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'pirate-map', 'vendetta', 'messenger', 'sword', 'potion', 'music', 'image', 'announcement', 'eye', 'partner', 'pdf', 'seal', 'pawn', 'quill', 'flame', 'download', 'review', 'wand', 'sf', 'seance', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'superhero', 'stormtrooper', 'soundtrack', 'tag', 'shield', 'axe', 'twitch', 'shuttle', 'fighter', 'event', 'filled-star', 'youtube', 'scroll');
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_action_links_layout" AS ENUM('inline', 'stacked');
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_action_links_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_card_links_icon_name" AS ENUM('camera', 'astronaut', 'ticket', 'bluesky', 'mace', 'bottle-mana', 'cthulhu', 'time', 'skull', 'dnd5', 'discord', 'document', 'pumpkin-halloween', 'mail', 'facebook', 'guitar', 'globe', 'board-game', 'star', 'instagram', 'calendar', 'hat', 'gun', 'cards', 'playing-cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'water-drop', 'crystal-ball', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'pirate-map', 'vendetta', 'messenger', 'sword', 'potion', 'music', 'image', 'announcement', 'eye', 'partner', 'pdf', 'seal', 'pawn', 'quill', 'flame', 'download', 'review', 'wand', 'sf', 'seance', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'superhero', 'stormtrooper', 'soundtrack', 'tag', 'shield', 'axe', 'twitch', 'shuttle', 'fighter', 'event', 'filled-star', 'youtube', 'scroll');
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents');
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_listing_view" AS ENUM('cards', 'carousel', 'compact', 'grid', 'tiles');
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_listing_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_listing_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_listing_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_listing_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents');
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_carousel_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_carousel_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_carousel_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_carousel_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_content_calendar_sources" AS ENUM('events', 'posts');
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_media_gallery_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_media_gallery_sort" AS ENUM('newest', 'oldest', 'nameAscending', 'nameDescending');
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_media_gallery_view" AS ENUM('cards', 'list', 'grid');
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_attachments_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_attachments_sort" AS ENUM('newest', 'oldest', 'nameAscending', 'nameDescending');
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_attachments_view" AS ENUM('cards', 'list', 'grid');
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_member_profiles_view" AS ENUM('card', 'list', 'grid');
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_tabs_footer_items_icon_name" AS ENUM('camera', 'astronaut', 'ticket', 'bluesky', 'mace', 'bottle-mana', 'cthulhu', 'time', 'skull', 'dnd5', 'discord', 'document', 'pumpkin-halloween', 'mail', 'facebook', 'guitar', 'globe', 'board-game', 'star', 'instagram', 'calendar', 'hat', 'gun', 'cards', 'playing-cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'water-drop', 'crystal-ball', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'pirate-map', 'vendetta', 'messenger', 'sword', 'potion', 'music', 'image', 'announcement', 'eye', 'partner', 'pdf', 'seal', 'pawn', 'quill', 'flame', 'download', 'review', 'wand', 'sf', 'seance', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'superhero', 'stormtrooper', 'soundtrack', 'tag', 'shield', 'axe', 'twitch', 'shuttle', 'fighter', 'event', 'filled-star', 'youtube', 'scroll');
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_tabs_footer_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum__homepage_sections_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_footer_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__footer_v_version_social_items_appearance" AS ENUM('link', 'primaryButton', 'secondaryButton');
  CREATE TYPE "public"."enum__footer_v_version_social_items_icon_name" AS ENUM('camera', 'astronaut', 'ticket', 'bluesky', 'mace', 'bottle-mana', 'cthulhu', 'time', 'skull', 'dnd5', 'discord', 'document', 'pumpkin-halloween', 'mail', 'facebook', 'guitar', 'globe', 'board-game', 'star', 'instagram', 'calendar', 'hat', 'gun', 'cards', 'playing-cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'water-drop', 'crystal-ball', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'pirate-map', 'vendetta', 'messenger', 'sword', 'potion', 'music', 'image', 'announcement', 'eye', 'partner', 'pdf', 'seal', 'pawn', 'quill', 'flame', 'download', 'review', 'wand', 'sf', 'seance', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'superhero', 'stormtrooper', 'soundtrack', 'tag', 'shield', 'axe', 'twitch', 'shuttle', 'fighter', 'event', 'filled-star', 'youtube', 'scroll');
  CREATE TYPE "public"."enum__footer_v_version_social_items_target_type" AS ENUM('eventCycle', 'document', 'category', 'partner', 'page', 'tag', 'custom', 'post', 'event');
  CREATE TYPE "public"."enum__footer_v_version_social_items_custom_scheme" AS ENUM('https', 'http', 'mailto', 'tel', 'path', 'anchor');
  CREATE TYPE "public"."enum__footer_v_version_columns_items_appearance" AS ENUM('link', 'primaryButton', 'secondaryButton');
  CREATE TYPE "public"."enum__footer_v_version_columns_items_icon_name" AS ENUM('camera', 'astronaut', 'ticket', 'bluesky', 'mace', 'bottle-mana', 'cthulhu', 'time', 'skull', 'dnd5', 'discord', 'document', 'pumpkin-halloween', 'mail', 'facebook', 'guitar', 'globe', 'board-game', 'star', 'instagram', 'calendar', 'hat', 'gun', 'cards', 'playing-cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'water-drop', 'crystal-ball', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'pirate-map', 'vendetta', 'messenger', 'sword', 'potion', 'music', 'image', 'announcement', 'eye', 'partner', 'pdf', 'seal', 'pawn', 'quill', 'flame', 'download', 'review', 'wand', 'sf', 'seance', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'superhero', 'stormtrooper', 'soundtrack', 'tag', 'shield', 'axe', 'twitch', 'shuttle', 'fighter', 'event', 'filled-star', 'youtube', 'scroll');
  CREATE TYPE "public"."enum__footer_v_version_columns_items_target_type" AS ENUM('eventCycle', 'document', 'siteContactEmail', 'category', 'partner', 'page', 'tag', 'custom', 'post', 'event');
  CREATE TYPE "public"."enum__footer_v_version_columns_items_custom_scheme" AS ENUM('https', 'http', 'mailto', 'tel', 'path', 'anchor');
  CREATE TYPE "public"."enum__footer_v_version_columns_alignment" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum__footer_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "_site_settings_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_site_name" varchar DEFAULT 'Wrocławski Klub Fantastyki',
  	"version_site_description" varchar,
  	"version_contact_email" varchar,
  	"version__status" "enum__site_settings_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_navigation_v_version_header_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "enum__navigation_v_version_header_items_appearance" DEFAULT 'link',
  	"icon_name" "enum__navigation_v_version_header_items_icon_name",
  	"target_type" "enum__navigation_v_version_header_items_target_type" DEFAULT 'custom',
  	"event_cycle_id" integer,
  	"document_id" integer,
  	"category_id" integer,
  	"partner_id" integer,
  	"page_id" integer,
  	"tag_id" integer,
  	"post_id" integer,
  	"event_id" integer,
  	"custom_scheme" "enum__navigation_v_version_header_items_custom_scheme" DEFAULT 'https',
  	"custom_address" varchar,
  	"email_subject" varchar,
  	"email_body" varchar,
  	"open_in_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_navigation_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_logo_id" integer,
  	"version__status" "enum__navigation_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_homepage_hero_v_version_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "enum__homepage_hero_v_version_items_appearance" DEFAULT 'link',
  	"icon_name" "enum__homepage_hero_v_version_items_icon_name",
  	"target_type" "enum__homepage_hero_v_version_items_target_type" DEFAULT 'custom',
  	"event_cycle_id" integer,
  	"document_id" integer,
  	"category_id" integer,
  	"partner_id" integer,
  	"page_id" integer,
  	"tag_id" integer,
  	"post_id" integer,
  	"event_id" integer,
  	"custom_scheme" "enum__homepage_hero_v_version_items_custom_scheme" DEFAULT 'https',
  	"custom_address" varchar,
  	"open_in_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_hero_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_image_id" integer,
  	"version_title" jsonb DEFAULT '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Witaj w klubie","type":"text","version":1},{"type":"linebreak","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":"ludzi z ","type":"text","version":1},{"detail":0,"format":2,"mode":"normal","style":"","text":"wyobraźnią","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"textFormat":0,"textStyle":"","type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}'::jsonb,
  	"version_content" jsonb,
  	"version__status" "enum__homepage_hero_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_homepage_sections_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text_style" "enum__homepage_sections_v_blocks_rich_text_text_style" DEFAULT 'default',
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_sections_v_blocks_heading" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"heading_level" "enum__homepage_sections_v_blocks_heading_heading_level" DEFAULT 'h2',
  	"heading_icon_name" "enum__homepage_sections_v_blocks_heading_heading_icon_name",
  	"icon_inverted" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_sections_v_blocks_action_links_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum__homepage_sections_v_blocks_action_links_items_icon_name",
  	"target_type" "target" DEFAULT 'custom',
  	"event_cycle_id" integer,
  	"document_id" integer,
  	"category_id" integer,
  	"partner_id" integer,
  	"page_id" integer,
  	"tag_id" integer,
  	"post_id" integer,
  	"event_id" integer,
  	"custom_scheme" "scheme" DEFAULT 'https',
  	"custom_address" varchar,
  	"email_subject" varchar,
  	"email_body" varchar,
  	"open_in_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_sections_v_blocks_action_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"layout" "enum__homepage_sections_v_blocks_action_links_layout" DEFAULT 'inline',
  	"alignment" "enum__homepage_sections_v_blocks_action_links_alignment" DEFAULT 'start',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_sections_v_blocks_card_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum__homepage_sections_v_blocks_card_links_icon_name",
  	"target_type" "target" DEFAULT 'custom',
  	"event_cycle_id" integer,
  	"document_id" integer,
  	"category_id" integer,
  	"partner_id" integer,
  	"page_id" integer,
  	"tag_id" integer,
  	"post_id" integer,
  	"event_id" integer,
  	"custom_scheme" "scheme" DEFAULT 'https',
  	"custom_address" varchar,
  	"email_subject" varchar,
  	"email_body" varchar,
  	"open_in_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_sections_v_blocks_card" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"destination_page_id" integer,
  	"image_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_sections_v_blocks_listing_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_sections_v_blocks_listing_sources" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__homepage_sections_v_blocks_listing_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_homepage_sections_v_blocks_listing" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"view" "enum__homepage_sections_v_blocks_listing_view" DEFAULT 'cards',
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"selection_mode" "enum__homepage_sections_v_blocks_listing_selection_mode" DEFAULT 'filters',
  	"parent_page_id" integer,
  	"category_id" integer,
  	"tag_id" integer,
  	"event_time_filter" "enum__homepage_sections_v_blocks_listing_event_time_filter" DEFAULT 'all',
  	"event_cycle_id" integer,
  	"max_age_days" numeric DEFAULT 0,
  	"sort" "enum__homepage_sections_v_blocks_listing_sort" DEFAULT 'newest',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"parent_filter" "enum__homepage_sections_v_blocks_listing_parent_filter" DEFAULT 'none',
  	"empty_message" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_sections_v_blocks_carousel_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_sections_v_blocks_carousel_sources" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__homepage_sections_v_blocks_carousel_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_homepage_sections_v_blocks_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"selection_mode" "enum__homepage_sections_v_blocks_carousel_selection_mode" DEFAULT 'filters',
  	"parent_page_id" integer,
  	"category_id" integer,
  	"tag_id" integer,
  	"event_time_filter" "enum__homepage_sections_v_blocks_carousel_event_time_filter" DEFAULT 'all',
  	"event_cycle_id" integer,
  	"max_age_days" numeric DEFAULT 0,
  	"sort" "enum__homepage_sections_v_blocks_carousel_sort" DEFAULT 'newest',
  	"slide_limit" numeric DEFAULT 5,
  	"parent_filter" "enum__homepage_sections_v_blocks_carousel_parent_filter" DEFAULT 'none',
  	"empty_message" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_sections_v_blocks_content_calendar_sources" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__homepage_sections_v_blocks_content_calendar_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_homepage_sections_v_blocks_content_calendar" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"category_id" integer,
  	"tag_id" integer,
  	"event_cycle_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_sections_v_blocks_media_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_sections_v_blocks_media_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"selection_mode" "enum__homepage_sections_v_blocks_media_gallery_selection_mode" DEFAULT 'filters',
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum__homepage_sections_v_blocks_media_gallery_sort" DEFAULT 'newest',
  	"view" "enum__homepage_sections_v_blocks_media_gallery_view" DEFAULT 'grid',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_sections_v_blocks_attachments_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_sections_v_blocks_attachments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"selection_mode" "enum__homepage_sections_v_blocks_attachments_selection_mode" DEFAULT 'filters',
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum__homepage_sections_v_blocks_attachments_sort" DEFAULT 'newest',
  	"view" "enum__homepage_sections_v_blocks_attachments_view" DEFAULT 'list',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_sections_v_blocks_member_profiles_entries" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"profile_id" integer,
  	"context_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_sections_v_blocks_member_profiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"view" "enum__homepage_sections_v_blocks_member_profiles_view" DEFAULT 'grid',
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_sections_v_blocks_column_layout_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"width" numeric DEFAULT 2,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_sections_v_blocks_column_layout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"vertical_alignment" "column_layout_vertical_alignment" DEFAULT 'start',
  	"column_separators" "column_layout_separators" DEFAULT 'none',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_sections_v_blocks_tabs_header_left_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "tab_header_icon_name",
  	"target_type" "target" DEFAULT 'custom',
  	"event_cycle_id" integer,
  	"document_id" integer,
  	"category_id" integer,
  	"partner_id" integer,
  	"page_id" integer,
  	"tag_id" integer,
  	"post_id" integer,
  	"event_id" integer,
  	"custom_scheme" "scheme" DEFAULT 'https',
  	"custom_address" varchar,
  	"email_subject" varchar,
  	"email_body" varchar,
  	"open_in_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_sections_v_blocks_tabs_header_right_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "tab_header_icon_name",
  	"target_type" "target" DEFAULT 'custom',
  	"event_cycle_id" integer,
  	"document_id" integer,
  	"category_id" integer,
  	"partner_id" integer,
  	"page_id" integer,
  	"tag_id" integer,
  	"post_id" integer,
  	"event_id" integer,
  	"custom_scheme" "scheme" DEFAULT 'https',
  	"custom_address" varchar,
  	"email_subject" varchar,
  	"email_body" varchar,
  	"open_in_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_sections_v_blocks_tabs_footer_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum__homepage_sections_v_blocks_tabs_footer_items_icon_name",
  	"target_type" "target" DEFAULT 'custom',
  	"event_cycle_id" integer,
  	"document_id" integer,
  	"category_id" integer,
  	"partner_id" integer,
  	"page_id" integer,
  	"tag_id" integer,
  	"post_id" integer,
  	"event_id" integer,
  	"custom_scheme" "scheme" DEFAULT 'https',
  	"custom_address" varchar,
  	"email_subject" varchar,
  	"email_body" varchar,
  	"open_in_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_sections_v_blocks_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_sections_v_blocks_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"footer_alignment" "enum__homepage_sections_v_blocks_tabs_footer_alignment" DEFAULT 'center',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_sections_v_blocks_section_group_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_sections_v_blocks_section_group" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"empty_child_behavior" "empty_child" DEFAULT 'show',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_sections_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version__status" "enum__homepage_sections_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_homepage_sections_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"events_id" integer,
  	"event_cycles_id" integer,
  	"documents_id" integer
  );
  
  CREATE TABLE "_footer_v_version_social_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "enum__footer_v_version_social_items_appearance" DEFAULT 'link',
  	"icon_name" "enum__footer_v_version_social_items_icon_name",
  	"target_type" "enum__footer_v_version_social_items_target_type" DEFAULT 'custom',
  	"event_cycle_id" integer,
  	"document_id" integer,
  	"category_id" integer,
  	"partner_id" integer,
  	"page_id" integer,
  	"tag_id" integer,
  	"post_id" integer,
  	"event_id" integer,
  	"custom_scheme" "enum__footer_v_version_social_items_custom_scheme" DEFAULT 'https',
  	"custom_address" varchar,
  	"open_in_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_footer_v_version_columns_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "enum__footer_v_version_columns_items_appearance" DEFAULT 'link',
  	"icon_name" "enum__footer_v_version_columns_items_icon_name",
  	"target_type" "enum__footer_v_version_columns_items_target_type" DEFAULT 'custom',
  	"event_cycle_id" integer,
  	"document_id" integer,
  	"category_id" integer,
  	"partner_id" integer,
  	"page_id" integer,
  	"tag_id" integer,
  	"post_id" integer,
  	"event_id" integer,
  	"custom_scheme" "enum__footer_v_version_columns_items_custom_scheme" DEFAULT 'https',
  	"custom_address" varchar,
  	"email_subject" varchar,
  	"email_body" varchar,
  	"open_in_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_footer_v_version_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"alignment" "enum__footer_v_version_columns_alignment" DEFAULT 'left',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_footer_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_copyright" jsonb,
  	"version_content" jsonb,
  	"version_contact_heading" varchar,
  	"version__status" "enum__footer_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "pages_blocks_column_layout" ALTER COLUMN "vertical_alignment" DROP DEFAULT;
  ALTER TABLE "pages_blocks_column_layout" ALTER COLUMN "vertical_alignment" SET DATA TYPE "public"."column_layout_vertical_alignment" USING "vertical_alignment"::text::"public"."column_layout_vertical_alignment";
  ALTER TABLE "pages_blocks_column_layout" ALTER COLUMN "vertical_alignment" SET DEFAULT 'start';
  ALTER TABLE "pages_blocks_column_layout" ALTER COLUMN "column_separators" DROP DEFAULT;
  ALTER TABLE "pages_blocks_column_layout" ALTER COLUMN "column_separators" SET DATA TYPE "public"."column_layout_separators" USING "column_separators"::text::"public"."column_layout_separators";
  ALTER TABLE "pages_blocks_column_layout" ALTER COLUMN "column_separators" SET DEFAULT 'none';
  ALTER TABLE "pages_blocks_tabs_header_left_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."tab_header_icon_name" USING "icon_name"::text::"public"."tab_header_icon_name";
  ALTER TABLE "pages_blocks_tabs_header_right_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."tab_header_icon_name" USING "icon_name"::text::"public"."tab_header_icon_name";
  ALTER TABLE "_pages_v_blocks_column_layout" ALTER COLUMN "vertical_alignment" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_column_layout" ALTER COLUMN "vertical_alignment" SET DATA TYPE "public"."column_layout_vertical_alignment" USING "vertical_alignment"::text::"public"."column_layout_vertical_alignment";
  ALTER TABLE "_pages_v_blocks_column_layout" ALTER COLUMN "vertical_alignment" SET DEFAULT 'start';
  ALTER TABLE "_pages_v_blocks_column_layout" ALTER COLUMN "column_separators" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_column_layout" ALTER COLUMN "column_separators" SET DATA TYPE "public"."column_layout_separators" USING "column_separators"::text::"public"."column_layout_separators";
  ALTER TABLE "_pages_v_blocks_column_layout" ALTER COLUMN "column_separators" SET DEFAULT 'none';
  ALTER TABLE "_pages_v_blocks_tabs_header_left_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."tab_header_icon_name" USING "icon_name"::text::"public"."tab_header_icon_name";
  ALTER TABLE "_pages_v_blocks_tabs_header_right_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."tab_header_icon_name" USING "icon_name"::text::"public"."tab_header_icon_name";
  ALTER TABLE "posts_blocks_column_layout" ALTER COLUMN "vertical_alignment" DROP DEFAULT;
  ALTER TABLE "posts_blocks_column_layout" ALTER COLUMN "vertical_alignment" SET DATA TYPE "public"."column_layout_vertical_alignment" USING "vertical_alignment"::text::"public"."column_layout_vertical_alignment";
  ALTER TABLE "posts_blocks_column_layout" ALTER COLUMN "vertical_alignment" SET DEFAULT 'start';
  ALTER TABLE "posts_blocks_column_layout" ALTER COLUMN "column_separators" DROP DEFAULT;
  ALTER TABLE "posts_blocks_column_layout" ALTER COLUMN "column_separators" SET DATA TYPE "public"."column_layout_separators" USING "column_separators"::text::"public"."column_layout_separators";
  ALTER TABLE "posts_blocks_column_layout" ALTER COLUMN "column_separators" SET DEFAULT 'none';
  ALTER TABLE "posts_blocks_tabs_header_left_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."tab_header_icon_name" USING "icon_name"::text::"public"."tab_header_icon_name";
  ALTER TABLE "posts_blocks_tabs_header_right_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."tab_header_icon_name" USING "icon_name"::text::"public"."tab_header_icon_name";
  ALTER TABLE "_posts_v_blocks_column_layout" ALTER COLUMN "vertical_alignment" DROP DEFAULT;
  ALTER TABLE "_posts_v_blocks_column_layout" ALTER COLUMN "vertical_alignment" SET DATA TYPE "public"."column_layout_vertical_alignment" USING "vertical_alignment"::text::"public"."column_layout_vertical_alignment";
  ALTER TABLE "_posts_v_blocks_column_layout" ALTER COLUMN "vertical_alignment" SET DEFAULT 'start';
  ALTER TABLE "_posts_v_blocks_column_layout" ALTER COLUMN "column_separators" DROP DEFAULT;
  ALTER TABLE "_posts_v_blocks_column_layout" ALTER COLUMN "column_separators" SET DATA TYPE "public"."column_layout_separators" USING "column_separators"::text::"public"."column_layout_separators";
  ALTER TABLE "_posts_v_blocks_column_layout" ALTER COLUMN "column_separators" SET DEFAULT 'none';
  ALTER TABLE "_posts_v_blocks_tabs_header_left_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."tab_header_icon_name" USING "icon_name"::text::"public"."tab_header_icon_name";
  ALTER TABLE "_posts_v_blocks_tabs_header_right_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."tab_header_icon_name" USING "icon_name"::text::"public"."tab_header_icon_name";
  ALTER TABLE "events_blocks_column_layout" ALTER COLUMN "vertical_alignment" DROP DEFAULT;
  ALTER TABLE "events_blocks_column_layout" ALTER COLUMN "vertical_alignment" SET DATA TYPE "public"."column_layout_vertical_alignment" USING "vertical_alignment"::text::"public"."column_layout_vertical_alignment";
  ALTER TABLE "events_blocks_column_layout" ALTER COLUMN "vertical_alignment" SET DEFAULT 'start';
  ALTER TABLE "events_blocks_column_layout" ALTER COLUMN "column_separators" DROP DEFAULT;
  ALTER TABLE "events_blocks_column_layout" ALTER COLUMN "column_separators" SET DATA TYPE "public"."column_layout_separators" USING "column_separators"::text::"public"."column_layout_separators";
  ALTER TABLE "events_blocks_column_layout" ALTER COLUMN "column_separators" SET DEFAULT 'none';
  ALTER TABLE "events_blocks_tabs_header_left_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."tab_header_icon_name" USING "icon_name"::text::"public"."tab_header_icon_name";
  ALTER TABLE "events_blocks_tabs_header_right_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."tab_header_icon_name" USING "icon_name"::text::"public"."tab_header_icon_name";
  ALTER TABLE "_events_v_blocks_column_layout" ALTER COLUMN "vertical_alignment" DROP DEFAULT;
  ALTER TABLE "_events_v_blocks_column_layout" ALTER COLUMN "vertical_alignment" SET DATA TYPE "public"."column_layout_vertical_alignment" USING "vertical_alignment"::text::"public"."column_layout_vertical_alignment";
  ALTER TABLE "_events_v_blocks_column_layout" ALTER COLUMN "vertical_alignment" SET DEFAULT 'start';
  ALTER TABLE "_events_v_blocks_column_layout" ALTER COLUMN "column_separators" DROP DEFAULT;
  ALTER TABLE "_events_v_blocks_column_layout" ALTER COLUMN "column_separators" SET DATA TYPE "public"."column_layout_separators" USING "column_separators"::text::"public"."column_layout_separators";
  ALTER TABLE "_events_v_blocks_column_layout" ALTER COLUMN "column_separators" SET DEFAULT 'none';
  ALTER TABLE "_events_v_blocks_tabs_header_left_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."tab_header_icon_name" USING "icon_name"::text::"public"."tab_header_icon_name";
  ALTER TABLE "_events_v_blocks_tabs_header_right_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."tab_header_icon_name" USING "icon_name"::text::"public"."tab_header_icon_name";
  ALTER TABLE "event_cycles_blocks_column_layout" ALTER COLUMN "vertical_alignment" DROP DEFAULT;
  ALTER TABLE "event_cycles_blocks_column_layout" ALTER COLUMN "vertical_alignment" SET DATA TYPE "public"."column_layout_vertical_alignment" USING "vertical_alignment"::text::"public"."column_layout_vertical_alignment";
  ALTER TABLE "event_cycles_blocks_column_layout" ALTER COLUMN "vertical_alignment" SET DEFAULT 'start';
  ALTER TABLE "event_cycles_blocks_column_layout" ALTER COLUMN "column_separators" DROP DEFAULT;
  ALTER TABLE "event_cycles_blocks_column_layout" ALTER COLUMN "column_separators" SET DATA TYPE "public"."column_layout_separators" USING "column_separators"::text::"public"."column_layout_separators";
  ALTER TABLE "event_cycles_blocks_column_layout" ALTER COLUMN "column_separators" SET DEFAULT 'none';
  ALTER TABLE "event_cycles_blocks_tabs_header_left_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."tab_header_icon_name" USING "icon_name"::text::"public"."tab_header_icon_name";
  ALTER TABLE "event_cycles_blocks_tabs_header_right_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."tab_header_icon_name" USING "icon_name"::text::"public"."tab_header_icon_name";
  ALTER TABLE "_event_cycles_v_blocks_column_layout" ALTER COLUMN "vertical_alignment" DROP DEFAULT;
  ALTER TABLE "_event_cycles_v_blocks_column_layout" ALTER COLUMN "vertical_alignment" SET DATA TYPE "public"."column_layout_vertical_alignment" USING "vertical_alignment"::text::"public"."column_layout_vertical_alignment";
  ALTER TABLE "_event_cycles_v_blocks_column_layout" ALTER COLUMN "vertical_alignment" SET DEFAULT 'start';
  ALTER TABLE "_event_cycles_v_blocks_column_layout" ALTER COLUMN "column_separators" DROP DEFAULT;
  ALTER TABLE "_event_cycles_v_blocks_column_layout" ALTER COLUMN "column_separators" SET DATA TYPE "public"."column_layout_separators" USING "column_separators"::text::"public"."column_layout_separators";
  ALTER TABLE "_event_cycles_v_blocks_column_layout" ALTER COLUMN "column_separators" SET DEFAULT 'none';
  ALTER TABLE "_event_cycles_v_blocks_tabs_header_left_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."tab_header_icon_name" USING "icon_name"::text::"public"."tab_header_icon_name";
  ALTER TABLE "_event_cycles_v_blocks_tabs_header_right_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."tab_header_icon_name" USING "icon_name"::text::"public"."tab_header_icon_name";
  ALTER TABLE "partners_blocks_column_layout" ALTER COLUMN "vertical_alignment" DROP DEFAULT;
  ALTER TABLE "partners_blocks_column_layout" ALTER COLUMN "vertical_alignment" SET DATA TYPE "public"."column_layout_vertical_alignment" USING "vertical_alignment"::text::"public"."column_layout_vertical_alignment";
  ALTER TABLE "partners_blocks_column_layout" ALTER COLUMN "vertical_alignment" SET DEFAULT 'start';
  ALTER TABLE "partners_blocks_column_layout" ALTER COLUMN "column_separators" DROP DEFAULT;
  ALTER TABLE "partners_blocks_column_layout" ALTER COLUMN "column_separators" SET DATA TYPE "public"."column_layout_separators" USING "column_separators"::text::"public"."column_layout_separators";
  ALTER TABLE "partners_blocks_column_layout" ALTER COLUMN "column_separators" SET DEFAULT 'none';
  ALTER TABLE "partners_blocks_tabs_header_left_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."tab_header_icon_name" USING "icon_name"::text::"public"."tab_header_icon_name";
  ALTER TABLE "partners_blocks_tabs_header_right_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."tab_header_icon_name" USING "icon_name"::text::"public"."tab_header_icon_name";
  ALTER TABLE "_partners_v_blocks_column_layout" ALTER COLUMN "vertical_alignment" DROP DEFAULT;
  ALTER TABLE "_partners_v_blocks_column_layout" ALTER COLUMN "vertical_alignment" SET DATA TYPE "public"."column_layout_vertical_alignment" USING "vertical_alignment"::text::"public"."column_layout_vertical_alignment";
  ALTER TABLE "_partners_v_blocks_column_layout" ALTER COLUMN "vertical_alignment" SET DEFAULT 'start';
  ALTER TABLE "_partners_v_blocks_column_layout" ALTER COLUMN "column_separators" DROP DEFAULT;
  ALTER TABLE "_partners_v_blocks_column_layout" ALTER COLUMN "column_separators" SET DATA TYPE "public"."column_layout_separators" USING "column_separators"::text::"public"."column_layout_separators";
  ALTER TABLE "_partners_v_blocks_column_layout" ALTER COLUMN "column_separators" SET DEFAULT 'none';
  ALTER TABLE "_partners_v_blocks_tabs_header_left_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."tab_header_icon_name" USING "icon_name"::text::"public"."tab_header_icon_name";
  ALTER TABLE "_partners_v_blocks_tabs_header_right_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."tab_header_icon_name" USING "icon_name"::text::"public"."tab_header_icon_name";
  ALTER TABLE "site_settings" ALTER COLUMN "site_name" DROP NOT NULL;
  ALTER TABLE "navigation_header_items" ALTER COLUMN "appearance" DROP NOT NULL;
  ALTER TABLE "navigation_header_items" ALTER COLUMN "target_type" DROP NOT NULL;
  ALTER TABLE "homepage_hero_items" ALTER COLUMN "appearance" DROP NOT NULL;
  ALTER TABLE "homepage_hero_items" ALTER COLUMN "target_type" DROP NOT NULL;
  ALTER TABLE "homepage_hero" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "homepage_sections_blocks_rich_text" ALTER COLUMN "content" DROP NOT NULL;
  ALTER TABLE "homepage_sections_blocks_heading" ALTER COLUMN "heading_level" DROP NOT NULL;
  ALTER TABLE "homepage_sections_blocks_action_links_items" ALTER COLUMN "appearance" DROP NOT NULL;
  ALTER TABLE "homepage_sections_blocks_action_links_items" ALTER COLUMN "target_type" DROP NOT NULL;
  ALTER TABLE "homepage_sections_blocks_action_links" ALTER COLUMN "layout" DROP NOT NULL;
  ALTER TABLE "homepage_sections_blocks_action_links" ALTER COLUMN "alignment" DROP NOT NULL;
  ALTER TABLE "homepage_sections_blocks_card_links" ALTER COLUMN "appearance" DROP NOT NULL;
  ALTER TABLE "homepage_sections_blocks_card_links" ALTER COLUMN "target_type" DROP NOT NULL;
  ALTER TABLE "homepage_sections_blocks_card" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "homepage_sections_blocks_listing" ALTER COLUMN "view" DROP NOT NULL;
  ALTER TABLE "homepage_sections_blocks_listing" ALTER COLUMN "selection_mode" DROP NOT NULL;
  ALTER TABLE "homepage_sections_blocks_listing" ALTER COLUMN "page_size" DROP NOT NULL;
  ALTER TABLE "homepage_sections_blocks_listing" ALTER COLUMN "parent_filter" DROP NOT NULL;
  ALTER TABLE "homepage_sections_blocks_carousel" ALTER COLUMN "selection_mode" DROP NOT NULL;
  ALTER TABLE "homepage_sections_blocks_carousel" ALTER COLUMN "slide_limit" DROP NOT NULL;
  ALTER TABLE "homepage_sections_blocks_carousel" ALTER COLUMN "parent_filter" DROP NOT NULL;
  ALTER TABLE "homepage_sections_blocks_media_gallery" ALTER COLUMN "selection_mode" DROP NOT NULL;
  ALTER TABLE "homepage_sections_blocks_media_gallery" ALTER COLUMN "view" DROP NOT NULL;
  ALTER TABLE "homepage_sections_blocks_media_gallery" ALTER COLUMN "page_size" DROP NOT NULL;
  ALTER TABLE "homepage_sections_blocks_attachments" ALTER COLUMN "selection_mode" DROP NOT NULL;
  ALTER TABLE "homepage_sections_blocks_attachments" ALTER COLUMN "view" DROP NOT NULL;
  ALTER TABLE "homepage_sections_blocks_attachments" ALTER COLUMN "page_size" DROP NOT NULL;
  ALTER TABLE "homepage_sections_blocks_member_profiles_entries" ALTER COLUMN "profile_id" DROP NOT NULL;
  ALTER TABLE "homepage_sections_blocks_member_profiles" ALTER COLUMN "view" DROP NOT NULL;
  ALTER TABLE "homepage_sections_blocks_column_layout_columns" ALTER COLUMN "width" DROP NOT NULL;
  ALTER TABLE "homepage_sections_blocks_column_layout" ALTER COLUMN "vertical_alignment" DROP DEFAULT;
  ALTER TABLE "homepage_sections_blocks_column_layout" ALTER COLUMN "vertical_alignment" SET DATA TYPE "public"."column_layout_vertical_alignment" USING "vertical_alignment"::text::"public"."column_layout_vertical_alignment";
  ALTER TABLE "homepage_sections_blocks_column_layout" ALTER COLUMN "vertical_alignment" SET DEFAULT 'start';
  ALTER TABLE "homepage_sections_blocks_column_layout" ALTER COLUMN "vertical_alignment" DROP NOT NULL;
  ALTER TABLE "homepage_sections_blocks_column_layout" ALTER COLUMN "column_separators" DROP DEFAULT;
  ALTER TABLE "homepage_sections_blocks_column_layout" ALTER COLUMN "column_separators" SET DATA TYPE "public"."column_layout_separators" USING "column_separators"::text::"public"."column_layout_separators";
  ALTER TABLE "homepage_sections_blocks_column_layout" ALTER COLUMN "column_separators" SET DEFAULT 'none';
  ALTER TABLE "homepage_sections_blocks_column_layout" ALTER COLUMN "column_separators" DROP NOT NULL;
  ALTER TABLE "homepage_sections_blocks_tabs_header_left_items" ALTER COLUMN "appearance" DROP NOT NULL;
  ALTER TABLE "homepage_sections_blocks_tabs_header_left_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."tab_header_icon_name" USING "icon_name"::text::"public"."tab_header_icon_name";
  ALTER TABLE "homepage_sections_blocks_tabs_header_left_items" ALTER COLUMN "target_type" DROP NOT NULL;
  ALTER TABLE "homepage_sections_blocks_tabs_header_right_items" ALTER COLUMN "appearance" DROP NOT NULL;
  ALTER TABLE "homepage_sections_blocks_tabs_header_right_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."tab_header_icon_name" USING "icon_name"::text::"public"."tab_header_icon_name";
  ALTER TABLE "homepage_sections_blocks_tabs_header_right_items" ALTER COLUMN "target_type" DROP NOT NULL;
  ALTER TABLE "homepage_sections_blocks_tabs_footer_items" ALTER COLUMN "appearance" DROP NOT NULL;
  ALTER TABLE "homepage_sections_blocks_tabs_footer_items" ALTER COLUMN "target_type" DROP NOT NULL;
  ALTER TABLE "homepage_sections_blocks_tabs_tabs" ALTER COLUMN "label" DROP NOT NULL;
  ALTER TABLE "footer_social_items" ALTER COLUMN "appearance" DROP NOT NULL;
  ALTER TABLE "footer_social_items" ALTER COLUMN "target_type" DROP NOT NULL;
  ALTER TABLE "footer_columns_items" ALTER COLUMN "appearance" DROP NOT NULL;
  ALTER TABLE "footer_columns_items" ALTER COLUMN "target_type" DROP NOT NULL;
  ALTER TABLE "footer_columns" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "footer_columns" ALTER COLUMN "alignment" DROP NOT NULL;
  ALTER TABLE "site_settings" ADD COLUMN "_status" "enum_site_settings_status" DEFAULT 'draft';
  ALTER TABLE "navigation" ADD COLUMN "_status" "enum_navigation_status" DEFAULT 'draft';
  ALTER TABLE "homepage_hero" ADD COLUMN "_status" "enum_homepage_hero_status" DEFAULT 'draft';
  ALTER TABLE "homepage_sections" ADD COLUMN "_status" "enum_homepage_sections_status" DEFAULT 'draft';
  ALTER TABLE "footer" ADD COLUMN "_status" "enum_footer_status" DEFAULT 'draft';
  UPDATE "site_settings" SET "_status" = 'published';
  UPDATE "navigation" SET "_status" = 'published';
  UPDATE "homepage_hero" SET "_status" = 'published';
  UPDATE "homepage_sections" SET "_status" = 'published';
  UPDATE "footer" SET "_status" = 'published';
  ALTER TABLE "_navigation_v_version_header_items" ADD CONSTRAINT "_navigation_v_version_header_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_header_items" ADD CONSTRAINT "_navigation_v_version_header_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_header_items" ADD CONSTRAINT "_navigation_v_version_header_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_header_items" ADD CONSTRAINT "_navigation_v_version_header_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_header_items" ADD CONSTRAINT "_navigation_v_version_header_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_header_items" ADD CONSTRAINT "_navigation_v_version_header_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_header_items" ADD CONSTRAINT "_navigation_v_version_header_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_header_items" ADD CONSTRAINT "_navigation_v_version_header_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_header_items" ADD CONSTRAINT "_navigation_v_version_header_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_navigation_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v" ADD CONSTRAINT "_navigation_v_version_logo_id_media_id_fk" FOREIGN KEY ("version_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_hero_v_version_items" ADD CONSTRAINT "_homepage_hero_v_version_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_hero_v_version_items" ADD CONSTRAINT "_homepage_hero_v_version_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_hero_v_version_items" ADD CONSTRAINT "_homepage_hero_v_version_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_hero_v_version_items" ADD CONSTRAINT "_homepage_hero_v_version_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_hero_v_version_items" ADD CONSTRAINT "_homepage_hero_v_version_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_hero_v_version_items" ADD CONSTRAINT "_homepage_hero_v_version_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_hero_v_version_items" ADD CONSTRAINT "_homepage_hero_v_version_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_hero_v_version_items" ADD CONSTRAINT "_homepage_hero_v_version_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_hero_v_version_items" ADD CONSTRAINT "_homepage_hero_v_version_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_hero_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_hero_v" ADD CONSTRAINT "_homepage_hero_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_rich_text" ADD CONSTRAINT "_homepage_sections_v_blocks_rich_text_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_rich_text" ADD CONSTRAINT "_homepage_sections_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_sections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_heading" ADD CONSTRAINT "_homepage_sections_v_blocks_heading_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_sections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_action_links_items" ADD CONSTRAINT "_homepage_sections_v_blocks_action_links_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_action_links_items" ADD CONSTRAINT "_homepage_sections_v_blocks_action_links_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_action_links_items" ADD CONSTRAINT "_homepage_sections_v_blocks_action_links_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_action_links_items" ADD CONSTRAINT "_homepage_sections_v_blocks_action_links_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_action_links_items" ADD CONSTRAINT "_homepage_sections_v_blocks_action_links_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_action_links_items" ADD CONSTRAINT "_homepage_sections_v_blocks_action_links_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_action_links_items" ADD CONSTRAINT "_homepage_sections_v_blocks_action_links_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_action_links_items" ADD CONSTRAINT "_homepage_sections_v_blocks_action_links_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_action_links_items" ADD CONSTRAINT "_homepage_sections_v_blocks_action_links_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_sections_v_blocks_action_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_action_links" ADD CONSTRAINT "_homepage_sections_v_blocks_action_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_sections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_card_links" ADD CONSTRAINT "_homepage_sections_v_blocks_card_links_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_card_links" ADD CONSTRAINT "_homepage_sections_v_blocks_card_links_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_card_links" ADD CONSTRAINT "_homepage_sections_v_blocks_card_links_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_card_links" ADD CONSTRAINT "_homepage_sections_v_blocks_card_links_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_card_links" ADD CONSTRAINT "_homepage_sections_v_blocks_card_links_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_card_links" ADD CONSTRAINT "_homepage_sections_v_blocks_card_links_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_card_links" ADD CONSTRAINT "_homepage_sections_v_blocks_card_links_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_card_links" ADD CONSTRAINT "_homepage_sections_v_blocks_card_links_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_card_links" ADD CONSTRAINT "_homepage_sections_v_blocks_card_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_sections_v_blocks_card"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_card" ADD CONSTRAINT "_homepage_sections_v_blocks_card_destination_page_id_pages_id_fk" FOREIGN KEY ("destination_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_card" ADD CONSTRAINT "_homepage_sections_v_blocks_card_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_card" ADD CONSTRAINT "_homepage_sections_v_blocks_card_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_sections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_listing_items" ADD CONSTRAINT "_homepage_sections_v_blocks_listing_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_sections_v_blocks_listing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_listing_sources" ADD CONSTRAINT "_homepage_sections_v_blocks_listing_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_homepage_sections_v_blocks_listing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_listing" ADD CONSTRAINT "_homepage_sections_v_blocks_listing_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_listing" ADD CONSTRAINT "_homepage_sections_v_blocks_listing_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_listing" ADD CONSTRAINT "_homepage_sections_v_blocks_listing_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_listing" ADD CONSTRAINT "_homepage_sections_v_blocks_listing_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_listing" ADD CONSTRAINT "_homepage_sections_v_blocks_listing_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_listing" ADD CONSTRAINT "_homepage_sections_v_blocks_listing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_sections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_carousel_items" ADD CONSTRAINT "_homepage_sections_v_blocks_carousel_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_sections_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_carousel_sources" ADD CONSTRAINT "_homepage_sections_v_blocks_carousel_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_homepage_sections_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_carousel" ADD CONSTRAINT "_homepage_sections_v_blocks_carousel_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_carousel" ADD CONSTRAINT "_homepage_sections_v_blocks_carousel_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_carousel" ADD CONSTRAINT "_homepage_sections_v_blocks_carousel_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_carousel" ADD CONSTRAINT "_homepage_sections_v_blocks_carousel_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_carousel" ADD CONSTRAINT "_homepage_sections_v_blocks_carousel_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_carousel" ADD CONSTRAINT "_homepage_sections_v_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_sections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_content_calendar_sources" ADD CONSTRAINT "_homepage_sections_v_blocks_content_calendar_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_homepage_sections_v_blocks_content_calendar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_content_calendar" ADD CONSTRAINT "_homepage_sections_v_blocks_content_calendar_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_content_calendar" ADD CONSTRAINT "_homepage_sections_v_blocks_content_calendar_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_content_calendar" ADD CONSTRAINT "_homepage_sections_v_blocks_content_calendar_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_content_calendar" ADD CONSTRAINT "_homepage_sections_v_blocks_content_calendar_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_content_calendar" ADD CONSTRAINT "_homepage_sections_v_blocks_content_calendar_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_sections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_media_gallery_items" ADD CONSTRAINT "_homepage_sections_v_blocks_media_gallery_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_media_gallery_items" ADD CONSTRAINT "_homepage_sections_v_blocks_media_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_sections_v_blocks_media_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_media_gallery" ADD CONSTRAINT "_homepage_sections_v_blocks_media_gallery_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_media_gallery" ADD CONSTRAINT "_homepage_sections_v_blocks_media_gallery_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_media_gallery" ADD CONSTRAINT "_homepage_sections_v_blocks_media_gallery_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_media_gallery" ADD CONSTRAINT "_homepage_sections_v_blocks_media_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_sections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_attachments_items" ADD CONSTRAINT "_homepage_sections_v_blocks_attachments_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_attachments_items" ADD CONSTRAINT "_homepage_sections_v_blocks_attachments_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_sections_v_blocks_attachments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_attachments" ADD CONSTRAINT "_homepage_sections_v_blocks_attachments_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_attachments" ADD CONSTRAINT "_homepage_sections_v_blocks_attachments_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_attachments" ADD CONSTRAINT "_homepage_sections_v_blocks_attachments_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_attachments" ADD CONSTRAINT "_homepage_sections_v_blocks_attachments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_sections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_member_profiles_entries" ADD CONSTRAINT "_homepage_sections_v_blocks_member_profiles_entries_profile_id_member_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."member_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_member_profiles_entries" ADD CONSTRAINT "_homepage_sections_v_blocks_member_profiles_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_sections_v_blocks_member_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_member_profiles" ADD CONSTRAINT "_homepage_sections_v_blocks_member_profiles_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_member_profiles" ADD CONSTRAINT "_homepage_sections_v_blocks_member_profiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_sections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_column_layout_columns" ADD CONSTRAINT "_homepage_sections_v_blocks_column_layout_columns_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_column_layout_columns" ADD CONSTRAINT "_homepage_sections_v_blocks_column_layout_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_sections_v_blocks_column_layout"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_column_layout" ADD CONSTRAINT "_homepage_sections_v_blocks_column_layout_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_column_layout" ADD CONSTRAINT "_homepage_sections_v_blocks_column_layout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_sections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_homepage_sections_v_blocks_tabs_header_left_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_homepage_sections_v_blocks_tabs_header_left_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_homepage_sections_v_blocks_tabs_header_left_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_homepage_sections_v_blocks_tabs_header_left_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_homepage_sections_v_blocks_tabs_header_left_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_homepage_sections_v_blocks_tabs_header_left_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_homepage_sections_v_blocks_tabs_header_left_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_homepage_sections_v_blocks_tabs_header_left_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_homepage_sections_v_blocks_tabs_header_left_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_sections_v_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_homepage_sections_v_blocks_tabs_header_right_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_homepage_sections_v_blocks_tabs_header_right_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_homepage_sections_v_blocks_tabs_header_right_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_homepage_sections_v_blocks_tabs_header_right_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_homepage_sections_v_blocks_tabs_header_right_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_homepage_sections_v_blocks_tabs_header_right_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_homepage_sections_v_blocks_tabs_header_right_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_homepage_sections_v_blocks_tabs_header_right_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_homepage_sections_v_blocks_tabs_header_right_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_sections_v_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_tabs_footer_items" ADD CONSTRAINT "_homepage_sections_v_blocks_tabs_footer_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_tabs_footer_items" ADD CONSTRAINT "_homepage_sections_v_blocks_tabs_footer_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_tabs_footer_items" ADD CONSTRAINT "_homepage_sections_v_blocks_tabs_footer_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_tabs_footer_items" ADD CONSTRAINT "_homepage_sections_v_blocks_tabs_footer_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_tabs_footer_items" ADD CONSTRAINT "_homepage_sections_v_blocks_tabs_footer_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_tabs_footer_items" ADD CONSTRAINT "_homepage_sections_v_blocks_tabs_footer_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_tabs_footer_items" ADD CONSTRAINT "_homepage_sections_v_blocks_tabs_footer_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_tabs_footer_items" ADD CONSTRAINT "_homepage_sections_v_blocks_tabs_footer_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_tabs_footer_items" ADD CONSTRAINT "_homepage_sections_v_blocks_tabs_footer_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_sections_v_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_tabs_tabs" ADD CONSTRAINT "_homepage_sections_v_blocks_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_sections_v_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_tabs" ADD CONSTRAINT "_homepage_sections_v_blocks_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_sections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_section_group_sections" ADD CONSTRAINT "_homepage_sections_v_blocks_section_group_sections_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_section_group_sections" ADD CONSTRAINT "_homepage_sections_v_blocks_section_group_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_sections_v_blocks_section_group"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_section_group" ADD CONSTRAINT "_homepage_sections_v_blocks_section_group_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_section_group" ADD CONSTRAINT "_homepage_sections_v_blocks_section_group_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_sections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_rels" ADD CONSTRAINT "_homepage_sections_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_homepage_sections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_rels" ADD CONSTRAINT "_homepage_sections_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_rels" ADD CONSTRAINT "_homepage_sections_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_rels" ADD CONSTRAINT "_homepage_sections_v_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_rels" ADD CONSTRAINT "_homepage_sections_v_rels_event_cycles_fk" FOREIGN KEY ("event_cycles_id") REFERENCES "public"."event_cycles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_rels" ADD CONSTRAINT "_homepage_sections_v_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_social_items" ADD CONSTRAINT "_footer_v_version_social_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_footer_v_version_social_items" ADD CONSTRAINT "_footer_v_version_social_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_footer_v_version_social_items" ADD CONSTRAINT "_footer_v_version_social_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_footer_v_version_social_items" ADD CONSTRAINT "_footer_v_version_social_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_footer_v_version_social_items" ADD CONSTRAINT "_footer_v_version_social_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_footer_v_version_social_items" ADD CONSTRAINT "_footer_v_version_social_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_footer_v_version_social_items" ADD CONSTRAINT "_footer_v_version_social_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_footer_v_version_social_items" ADD CONSTRAINT "_footer_v_version_social_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_footer_v_version_social_items" ADD CONSTRAINT "_footer_v_version_social_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_columns_items" ADD CONSTRAINT "_footer_v_version_columns_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_footer_v_version_columns_items" ADD CONSTRAINT "_footer_v_version_columns_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_footer_v_version_columns_items" ADD CONSTRAINT "_footer_v_version_columns_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_footer_v_version_columns_items" ADD CONSTRAINT "_footer_v_version_columns_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_footer_v_version_columns_items" ADD CONSTRAINT "_footer_v_version_columns_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_footer_v_version_columns_items" ADD CONSTRAINT "_footer_v_version_columns_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_footer_v_version_columns_items" ADD CONSTRAINT "_footer_v_version_columns_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_footer_v_version_columns_items" ADD CONSTRAINT "_footer_v_version_columns_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_footer_v_version_columns_items" ADD CONSTRAINT "_footer_v_version_columns_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v_version_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_columns" ADD CONSTRAINT "_footer_v_version_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "_site_settings_v_version_version__status_idx" ON "_site_settings_v" USING btree ("version__status");
  CREATE INDEX "_site_settings_v_created_at_idx" ON "_site_settings_v" USING btree ("created_at");
  CREATE INDEX "_site_settings_v_updated_at_idx" ON "_site_settings_v" USING btree ("updated_at");
  CREATE INDEX "_site_settings_v_latest_idx" ON "_site_settings_v" USING btree ("latest");
  CREATE INDEX "_navigation_v_version_header_items_order_idx" ON "_navigation_v_version_header_items" USING btree ("_order");
  CREATE INDEX "_navigation_v_version_header_items_parent_id_idx" ON "_navigation_v_version_header_items" USING btree ("_parent_id");
  CREATE INDEX "_navigation_v_version_header_items_event_cycle_idx" ON "_navigation_v_version_header_items" USING btree ("event_cycle_id");
  CREATE INDEX "_navigation_v_version_header_items_document_idx" ON "_navigation_v_version_header_items" USING btree ("document_id");
  CREATE INDEX "_navigation_v_version_header_items_category_idx" ON "_navigation_v_version_header_items" USING btree ("category_id");
  CREATE INDEX "_navigation_v_version_header_items_partner_idx" ON "_navigation_v_version_header_items" USING btree ("partner_id");
  CREATE INDEX "_navigation_v_version_header_items_page_idx" ON "_navigation_v_version_header_items" USING btree ("page_id");
  CREATE INDEX "_navigation_v_version_header_items_tag_idx" ON "_navigation_v_version_header_items" USING btree ("tag_id");
  CREATE INDEX "_navigation_v_version_header_items_post_idx" ON "_navigation_v_version_header_items" USING btree ("post_id");
  CREATE INDEX "_navigation_v_version_header_items_event_idx" ON "_navigation_v_version_header_items" USING btree ("event_id");
  CREATE INDEX "_navigation_v_version_version_logo_idx" ON "_navigation_v" USING btree ("version_logo_id");
  CREATE INDEX "_navigation_v_version_version__status_idx" ON "_navigation_v" USING btree ("version__status");
  CREATE INDEX "_navigation_v_created_at_idx" ON "_navigation_v" USING btree ("created_at");
  CREATE INDEX "_navigation_v_updated_at_idx" ON "_navigation_v" USING btree ("updated_at");
  CREATE INDEX "_navigation_v_latest_idx" ON "_navigation_v" USING btree ("latest");
  CREATE INDEX "_homepage_hero_v_version_items_order_idx" ON "_homepage_hero_v_version_items" USING btree ("_order");
  CREATE INDEX "_homepage_hero_v_version_items_parent_id_idx" ON "_homepage_hero_v_version_items" USING btree ("_parent_id");
  CREATE INDEX "_homepage_hero_v_version_items_event_cycle_idx" ON "_homepage_hero_v_version_items" USING btree ("event_cycle_id");
  CREATE INDEX "_homepage_hero_v_version_items_document_idx" ON "_homepage_hero_v_version_items" USING btree ("document_id");
  CREATE INDEX "_homepage_hero_v_version_items_category_idx" ON "_homepage_hero_v_version_items" USING btree ("category_id");
  CREATE INDEX "_homepage_hero_v_version_items_partner_idx" ON "_homepage_hero_v_version_items" USING btree ("partner_id");
  CREATE INDEX "_homepage_hero_v_version_items_page_idx" ON "_homepage_hero_v_version_items" USING btree ("page_id");
  CREATE INDEX "_homepage_hero_v_version_items_tag_idx" ON "_homepage_hero_v_version_items" USING btree ("tag_id");
  CREATE INDEX "_homepage_hero_v_version_items_post_idx" ON "_homepage_hero_v_version_items" USING btree ("post_id");
  CREATE INDEX "_homepage_hero_v_version_items_event_idx" ON "_homepage_hero_v_version_items" USING btree ("event_id");
  CREATE INDEX "_homepage_hero_v_version_version_image_idx" ON "_homepage_hero_v" USING btree ("version_image_id");
  CREATE INDEX "_homepage_hero_v_version_version__status_idx" ON "_homepage_hero_v" USING btree ("version__status");
  CREATE INDEX "_homepage_hero_v_created_at_idx" ON "_homepage_hero_v" USING btree ("created_at");
  CREATE INDEX "_homepage_hero_v_updated_at_idx" ON "_homepage_hero_v" USING btree ("updated_at");
  CREATE INDEX "_homepage_hero_v_latest_idx" ON "_homepage_hero_v" USING btree ("latest");
  CREATE INDEX "_homepage_sections_v_blocks_rich_text_order_idx" ON "_homepage_sections_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_homepage_sections_v_blocks_rich_text_parent_id_idx" ON "_homepage_sections_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_homepage_sections_v_blocks_rich_text_path_idx" ON "_homepage_sections_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_homepage_sections_v_blocks_rich_text_surface_image_idx" ON "_homepage_sections_v_blocks_rich_text" USING btree ("surface_image_id");
  CREATE INDEX "_homepage_sections_v_blocks_heading_order_idx" ON "_homepage_sections_v_blocks_heading" USING btree ("_order");
  CREATE INDEX "_homepage_sections_v_blocks_heading_parent_id_idx" ON "_homepage_sections_v_blocks_heading" USING btree ("_parent_id");
  CREATE INDEX "_homepage_sections_v_blocks_heading_path_idx" ON "_homepage_sections_v_blocks_heading" USING btree ("_path");
  CREATE INDEX "_homepage_sections_v_blocks_action_links_items_order_idx" ON "_homepage_sections_v_blocks_action_links_items" USING btree ("_order");
  CREATE INDEX "_homepage_sections_v_blocks_action_links_items_parent_id_idx" ON "_homepage_sections_v_blocks_action_links_items" USING btree ("_parent_id");
  CREATE INDEX "_homepage_sections_v_blocks_action_links_items_event_cyc_idx" ON "_homepage_sections_v_blocks_action_links_items" USING btree ("event_cycle_id");
  CREATE INDEX "_homepage_sections_v_blocks_action_links_items_document_idx" ON "_homepage_sections_v_blocks_action_links_items" USING btree ("document_id");
  CREATE INDEX "_homepage_sections_v_blocks_action_links_items_category_idx" ON "_homepage_sections_v_blocks_action_links_items" USING btree ("category_id");
  CREATE INDEX "_homepage_sections_v_blocks_action_links_items_partner_idx" ON "_homepage_sections_v_blocks_action_links_items" USING btree ("partner_id");
  CREATE INDEX "_homepage_sections_v_blocks_action_links_items_page_idx" ON "_homepage_sections_v_blocks_action_links_items" USING btree ("page_id");
  CREATE INDEX "_homepage_sections_v_blocks_action_links_items_tag_idx" ON "_homepage_sections_v_blocks_action_links_items" USING btree ("tag_id");
  CREATE INDEX "_homepage_sections_v_blocks_action_links_items_post_idx" ON "_homepage_sections_v_blocks_action_links_items" USING btree ("post_id");
  CREATE INDEX "_homepage_sections_v_blocks_action_links_items_event_idx" ON "_homepage_sections_v_blocks_action_links_items" USING btree ("event_id");
  CREATE INDEX "_homepage_sections_v_blocks_action_links_order_idx" ON "_homepage_sections_v_blocks_action_links" USING btree ("_order");
  CREATE INDEX "_homepage_sections_v_blocks_action_links_parent_id_idx" ON "_homepage_sections_v_blocks_action_links" USING btree ("_parent_id");
  CREATE INDEX "_homepage_sections_v_blocks_action_links_path_idx" ON "_homepage_sections_v_blocks_action_links" USING btree ("_path");
  CREATE INDEX "_homepage_sections_v_blocks_card_links_order_idx" ON "_homepage_sections_v_blocks_card_links" USING btree ("_order");
  CREATE INDEX "_homepage_sections_v_blocks_card_links_parent_id_idx" ON "_homepage_sections_v_blocks_card_links" USING btree ("_parent_id");
  CREATE INDEX "_homepage_sections_v_blocks_card_links_event_cycle_idx" ON "_homepage_sections_v_blocks_card_links" USING btree ("event_cycle_id");
  CREATE INDEX "_homepage_sections_v_blocks_card_links_document_idx" ON "_homepage_sections_v_blocks_card_links" USING btree ("document_id");
  CREATE INDEX "_homepage_sections_v_blocks_card_links_category_idx" ON "_homepage_sections_v_blocks_card_links" USING btree ("category_id");
  CREATE INDEX "_homepage_sections_v_blocks_card_links_partner_idx" ON "_homepage_sections_v_blocks_card_links" USING btree ("partner_id");
  CREATE INDEX "_homepage_sections_v_blocks_card_links_page_idx" ON "_homepage_sections_v_blocks_card_links" USING btree ("page_id");
  CREATE INDEX "_homepage_sections_v_blocks_card_links_tag_idx" ON "_homepage_sections_v_blocks_card_links" USING btree ("tag_id");
  CREATE INDEX "_homepage_sections_v_blocks_card_links_post_idx" ON "_homepage_sections_v_blocks_card_links" USING btree ("post_id");
  CREATE INDEX "_homepage_sections_v_blocks_card_links_event_idx" ON "_homepage_sections_v_blocks_card_links" USING btree ("event_id");
  CREATE INDEX "_homepage_sections_v_blocks_card_order_idx" ON "_homepage_sections_v_blocks_card" USING btree ("_order");
  CREATE INDEX "_homepage_sections_v_blocks_card_parent_id_idx" ON "_homepage_sections_v_blocks_card" USING btree ("_parent_id");
  CREATE INDEX "_homepage_sections_v_blocks_card_path_idx" ON "_homepage_sections_v_blocks_card" USING btree ("_path");
  CREATE INDEX "_homepage_sections_v_blocks_card_destination_page_idx" ON "_homepage_sections_v_blocks_card" USING btree ("destination_page_id");
  CREATE INDEX "_homepage_sections_v_blocks_card_image_idx" ON "_homepage_sections_v_blocks_card" USING btree ("image_id");
  CREATE INDEX "_homepage_sections_v_blocks_listing_items_order_idx" ON "_homepage_sections_v_blocks_listing_items" USING btree ("_order");
  CREATE INDEX "_homepage_sections_v_blocks_listing_items_parent_id_idx" ON "_homepage_sections_v_blocks_listing_items" USING btree ("_parent_id");
  CREATE INDEX "_homepage_sections_v_blocks_listing_sources_order_idx" ON "_homepage_sections_v_blocks_listing_sources" USING btree ("order");
  CREATE INDEX "_homepage_sections_v_blocks_listing_sources_parent_idx" ON "_homepage_sections_v_blocks_listing_sources" USING btree ("parent_id");
  CREATE INDEX "_homepage_sections_v_blocks_listing_order_idx" ON "_homepage_sections_v_blocks_listing" USING btree ("_order");
  CREATE INDEX "_homepage_sections_v_blocks_listing_parent_id_idx" ON "_homepage_sections_v_blocks_listing" USING btree ("_parent_id");
  CREATE INDEX "_homepage_sections_v_blocks_listing_path_idx" ON "_homepage_sections_v_blocks_listing" USING btree ("_path");
  CREATE INDEX "_homepage_sections_v_blocks_listing_surface_image_idx" ON "_homepage_sections_v_blocks_listing" USING btree ("surface_image_id");
  CREATE INDEX "_homepage_sections_v_blocks_listing_parent_page_idx" ON "_homepage_sections_v_blocks_listing" USING btree ("parent_page_id");
  CREATE INDEX "_homepage_sections_v_blocks_listing_category_idx" ON "_homepage_sections_v_blocks_listing" USING btree ("category_id");
  CREATE INDEX "_homepage_sections_v_blocks_listing_tag_idx" ON "_homepage_sections_v_blocks_listing" USING btree ("tag_id");
  CREATE INDEX "_homepage_sections_v_blocks_listing_event_cycle_idx" ON "_homepage_sections_v_blocks_listing" USING btree ("event_cycle_id");
  CREATE INDEX "_homepage_sections_v_blocks_carousel_items_order_idx" ON "_homepage_sections_v_blocks_carousel_items" USING btree ("_order");
  CREATE INDEX "_homepage_sections_v_blocks_carousel_items_parent_id_idx" ON "_homepage_sections_v_blocks_carousel_items" USING btree ("_parent_id");
  CREATE INDEX "_homepage_sections_v_blocks_carousel_sources_order_idx" ON "_homepage_sections_v_blocks_carousel_sources" USING btree ("order");
  CREATE INDEX "_homepage_sections_v_blocks_carousel_sources_parent_idx" ON "_homepage_sections_v_blocks_carousel_sources" USING btree ("parent_id");
  CREATE INDEX "_homepage_sections_v_blocks_carousel_order_idx" ON "_homepage_sections_v_blocks_carousel" USING btree ("_order");
  CREATE INDEX "_homepage_sections_v_blocks_carousel_parent_id_idx" ON "_homepage_sections_v_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "_homepage_sections_v_blocks_carousel_path_idx" ON "_homepage_sections_v_blocks_carousel" USING btree ("_path");
  CREATE INDEX "_homepage_sections_v_blocks_carousel_surface_image_idx" ON "_homepage_sections_v_blocks_carousel" USING btree ("surface_image_id");
  CREATE INDEX "_homepage_sections_v_blocks_carousel_parent_page_idx" ON "_homepage_sections_v_blocks_carousel" USING btree ("parent_page_id");
  CREATE INDEX "_homepage_sections_v_blocks_carousel_category_idx" ON "_homepage_sections_v_blocks_carousel" USING btree ("category_id");
  CREATE INDEX "_homepage_sections_v_blocks_carousel_tag_idx" ON "_homepage_sections_v_blocks_carousel" USING btree ("tag_id");
  CREATE INDEX "_homepage_sections_v_blocks_carousel_event_cycle_idx" ON "_homepage_sections_v_blocks_carousel" USING btree ("event_cycle_id");
  CREATE INDEX "_homepage_sections_v_blocks_content_calendar_sources_order_idx" ON "_homepage_sections_v_blocks_content_calendar_sources" USING btree ("order");
  CREATE INDEX "_homepage_sections_v_blocks_content_calendar_sources_parent_idx" ON "_homepage_sections_v_blocks_content_calendar_sources" USING btree ("parent_id");
  CREATE INDEX "_homepage_sections_v_blocks_content_calendar_order_idx" ON "_homepage_sections_v_blocks_content_calendar" USING btree ("_order");
  CREATE INDEX "_homepage_sections_v_blocks_content_calendar_parent_id_idx" ON "_homepage_sections_v_blocks_content_calendar" USING btree ("_parent_id");
  CREATE INDEX "_homepage_sections_v_blocks_content_calendar_path_idx" ON "_homepage_sections_v_blocks_content_calendar" USING btree ("_path");
  CREATE INDEX "_homepage_sections_v_blocks_content_calendar_surface_ima_idx" ON "_homepage_sections_v_blocks_content_calendar" USING btree ("surface_image_id");
  CREATE INDEX "_homepage_sections_v_blocks_content_calendar_category_idx" ON "_homepage_sections_v_blocks_content_calendar" USING btree ("category_id");
  CREATE INDEX "_homepage_sections_v_blocks_content_calendar_tag_idx" ON "_homepage_sections_v_blocks_content_calendar" USING btree ("tag_id");
  CREATE INDEX "_homepage_sections_v_blocks_content_calendar_event_cycle_idx" ON "_homepage_sections_v_blocks_content_calendar" USING btree ("event_cycle_id");
  CREATE INDEX "_homepage_sections_v_blocks_media_gallery_items_order_idx" ON "_homepage_sections_v_blocks_media_gallery_items" USING btree ("_order");
  CREATE INDEX "_homepage_sections_v_blocks_media_gallery_items_parent_id_idx" ON "_homepage_sections_v_blocks_media_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "_homepage_sections_v_blocks_media_gallery_items_media_idx" ON "_homepage_sections_v_blocks_media_gallery_items" USING btree ("media_id");
  CREATE INDEX "_homepage_sections_v_blocks_media_gallery_order_idx" ON "_homepage_sections_v_blocks_media_gallery" USING btree ("_order");
  CREATE INDEX "_homepage_sections_v_blocks_media_gallery_parent_id_idx" ON "_homepage_sections_v_blocks_media_gallery" USING btree ("_parent_id");
  CREATE INDEX "_homepage_sections_v_blocks_media_gallery_path_idx" ON "_homepage_sections_v_blocks_media_gallery" USING btree ("_path");
  CREATE INDEX "_homepage_sections_v_blocks_media_gallery_surface_image_idx" ON "_homepage_sections_v_blocks_media_gallery" USING btree ("surface_image_id");
  CREATE INDEX "_homepage_sections_v_blocks_media_gallery_category_idx" ON "_homepage_sections_v_blocks_media_gallery" USING btree ("category_id");
  CREATE INDEX "_homepage_sections_v_blocks_media_gallery_tag_idx" ON "_homepage_sections_v_blocks_media_gallery" USING btree ("tag_id");
  CREATE INDEX "_homepage_sections_v_blocks_attachments_items_order_idx" ON "_homepage_sections_v_blocks_attachments_items" USING btree ("_order");
  CREATE INDEX "_homepage_sections_v_blocks_attachments_items_parent_id_idx" ON "_homepage_sections_v_blocks_attachments_items" USING btree ("_parent_id");
  CREATE INDEX "_homepage_sections_v_blocks_attachments_items_media_idx" ON "_homepage_sections_v_blocks_attachments_items" USING btree ("media_id");
  CREATE INDEX "_homepage_sections_v_blocks_attachments_order_idx" ON "_homepage_sections_v_blocks_attachments" USING btree ("_order");
  CREATE INDEX "_homepage_sections_v_blocks_attachments_parent_id_idx" ON "_homepage_sections_v_blocks_attachments" USING btree ("_parent_id");
  CREATE INDEX "_homepage_sections_v_blocks_attachments_path_idx" ON "_homepage_sections_v_blocks_attachments" USING btree ("_path");
  CREATE INDEX "_homepage_sections_v_blocks_attachments_surface_image_idx" ON "_homepage_sections_v_blocks_attachments" USING btree ("surface_image_id");
  CREATE INDEX "_homepage_sections_v_blocks_attachments_category_idx" ON "_homepage_sections_v_blocks_attachments" USING btree ("category_id");
  CREATE INDEX "_homepage_sections_v_blocks_attachments_tag_idx" ON "_homepage_sections_v_blocks_attachments" USING btree ("tag_id");
  CREATE INDEX "_homepage_sections_v_blocks_member_profiles_entries_order_idx" ON "_homepage_sections_v_blocks_member_profiles_entries" USING btree ("_order");
  CREATE INDEX "_homepage_sections_v_blocks_member_profiles_entries_parent_id_idx" ON "_homepage_sections_v_blocks_member_profiles_entries" USING btree ("_parent_id");
  CREATE INDEX "_homepage_sections_v_blocks_member_profiles_entries_prof_idx" ON "_homepage_sections_v_blocks_member_profiles_entries" USING btree ("profile_id");
  CREATE INDEX "_homepage_sections_v_blocks_member_profiles_order_idx" ON "_homepage_sections_v_blocks_member_profiles" USING btree ("_order");
  CREATE INDEX "_homepage_sections_v_blocks_member_profiles_parent_id_idx" ON "_homepage_sections_v_blocks_member_profiles" USING btree ("_parent_id");
  CREATE INDEX "_homepage_sections_v_blocks_member_profiles_path_idx" ON "_homepage_sections_v_blocks_member_profiles" USING btree ("_path");
  CREATE INDEX "_homepage_sections_v_blocks_member_profiles_surface_imag_idx" ON "_homepage_sections_v_blocks_member_profiles" USING btree ("surface_image_id");
  CREATE INDEX "_homepage_sections_v_blocks_column_layout_columns_order_idx" ON "_homepage_sections_v_blocks_column_layout_columns" USING btree ("_order");
  CREATE INDEX "_homepage_sections_v_blocks_column_layout_columns_parent_id_idx" ON "_homepage_sections_v_blocks_column_layout_columns" USING btree ("_parent_id");
  CREATE INDEX "_homepage_sections_v_blocks_column_layout_columns_surfac_idx" ON "_homepage_sections_v_blocks_column_layout_columns" USING btree ("surface_image_id");
  CREATE INDEX "_homepage_sections_v_blocks_column_layout_order_idx" ON "_homepage_sections_v_blocks_column_layout" USING btree ("_order");
  CREATE INDEX "_homepage_sections_v_blocks_column_layout_parent_id_idx" ON "_homepage_sections_v_blocks_column_layout" USING btree ("_parent_id");
  CREATE INDEX "_homepage_sections_v_blocks_column_layout_path_idx" ON "_homepage_sections_v_blocks_column_layout" USING btree ("_path");
  CREATE INDEX "_homepage_sections_v_blocks_column_layout_surface_image_idx" ON "_homepage_sections_v_blocks_column_layout" USING btree ("surface_image_id");
  CREATE INDEX "_homepage_sections_v_blocks_tabs_header_left_items_order_idx" ON "_homepage_sections_v_blocks_tabs_header_left_items" USING btree ("_order");
  CREATE INDEX "_homepage_sections_v_blocks_tabs_header_left_items_parent_id_idx" ON "_homepage_sections_v_blocks_tabs_header_left_items" USING btree ("_parent_id");
  CREATE INDEX "_homepage_sections_v_blocks_tabs_header_left_items_event_idx" ON "_homepage_sections_v_blocks_tabs_header_left_items" USING btree ("event_cycle_id");
  CREATE INDEX "_homepage_sections_v_blocks_tabs_header_left_items_docum_idx" ON "_homepage_sections_v_blocks_tabs_header_left_items" USING btree ("document_id");
  CREATE INDEX "_homepage_sections_v_blocks_tabs_header_left_items_categ_idx" ON "_homepage_sections_v_blocks_tabs_header_left_items" USING btree ("category_id");
  CREATE INDEX "_homepage_sections_v_blocks_tabs_header_left_items_partn_idx" ON "_homepage_sections_v_blocks_tabs_header_left_items" USING btree ("partner_id");
  CREATE INDEX "_homepage_sections_v_blocks_tabs_header_left_items_page_idx" ON "_homepage_sections_v_blocks_tabs_header_left_items" USING btree ("page_id");
  CREATE INDEX "_homepage_sections_v_blocks_tabs_header_left_items_tag_idx" ON "_homepage_sections_v_blocks_tabs_header_left_items" USING btree ("tag_id");
  CREATE INDEX "_homepage_sections_v_blocks_tabs_header_left_items_post_idx" ON "_homepage_sections_v_blocks_tabs_header_left_items" USING btree ("post_id");
  CREATE INDEX "_homepage_sections_v_blocks_tabs_header_left_items_eve_1_idx" ON "_homepage_sections_v_blocks_tabs_header_left_items" USING btree ("event_id");
  CREATE INDEX "_homepage_sections_v_blocks_tabs_header_right_items_order_idx" ON "_homepage_sections_v_blocks_tabs_header_right_items" USING btree ("_order");
  CREATE INDEX "_homepage_sections_v_blocks_tabs_header_right_items_parent_id_idx" ON "_homepage_sections_v_blocks_tabs_header_right_items" USING btree ("_parent_id");
  CREATE INDEX "_homepage_sections_v_blocks_tabs_header_right_items_even_idx" ON "_homepage_sections_v_blocks_tabs_header_right_items" USING btree ("event_cycle_id");
  CREATE INDEX "_homepage_sections_v_blocks_tabs_header_right_items_docu_idx" ON "_homepage_sections_v_blocks_tabs_header_right_items" USING btree ("document_id");
  CREATE INDEX "_homepage_sections_v_blocks_tabs_header_right_items_cate_idx" ON "_homepage_sections_v_blocks_tabs_header_right_items" USING btree ("category_id");
  CREATE INDEX "_homepage_sections_v_blocks_tabs_header_right_items_part_idx" ON "_homepage_sections_v_blocks_tabs_header_right_items" USING btree ("partner_id");
  CREATE INDEX "_homepage_sections_v_blocks_tabs_header_right_items_page_idx" ON "_homepage_sections_v_blocks_tabs_header_right_items" USING btree ("page_id");
  CREATE INDEX "_homepage_sections_v_blocks_tabs_header_right_items_tag_idx" ON "_homepage_sections_v_blocks_tabs_header_right_items" USING btree ("tag_id");
  CREATE INDEX "_homepage_sections_v_blocks_tabs_header_right_items_post_idx" ON "_homepage_sections_v_blocks_tabs_header_right_items" USING btree ("post_id");
  CREATE INDEX "_homepage_sections_v_blocks_tabs_header_right_items_ev_1_idx" ON "_homepage_sections_v_blocks_tabs_header_right_items" USING btree ("event_id");
  CREATE INDEX "_homepage_sections_v_blocks_tabs_footer_items_order_idx" ON "_homepage_sections_v_blocks_tabs_footer_items" USING btree ("_order");
  CREATE INDEX "_homepage_sections_v_blocks_tabs_footer_items_parent_id_idx" ON "_homepage_sections_v_blocks_tabs_footer_items" USING btree ("_parent_id");
  CREATE INDEX "_homepage_sections_v_blocks_tabs_footer_items_event_cycl_idx" ON "_homepage_sections_v_blocks_tabs_footer_items" USING btree ("event_cycle_id");
  CREATE INDEX "_homepage_sections_v_blocks_tabs_footer_items_document_idx" ON "_homepage_sections_v_blocks_tabs_footer_items" USING btree ("document_id");
  CREATE INDEX "_homepage_sections_v_blocks_tabs_footer_items_category_idx" ON "_homepage_sections_v_blocks_tabs_footer_items" USING btree ("category_id");
  CREATE INDEX "_homepage_sections_v_blocks_tabs_footer_items_partner_idx" ON "_homepage_sections_v_blocks_tabs_footer_items" USING btree ("partner_id");
  CREATE INDEX "_homepage_sections_v_blocks_tabs_footer_items_page_idx" ON "_homepage_sections_v_blocks_tabs_footer_items" USING btree ("page_id");
  CREATE INDEX "_homepage_sections_v_blocks_tabs_footer_items_tag_idx" ON "_homepage_sections_v_blocks_tabs_footer_items" USING btree ("tag_id");
  CREATE INDEX "_homepage_sections_v_blocks_tabs_footer_items_post_idx" ON "_homepage_sections_v_blocks_tabs_footer_items" USING btree ("post_id");
  CREATE INDEX "_homepage_sections_v_blocks_tabs_footer_items_event_idx" ON "_homepage_sections_v_blocks_tabs_footer_items" USING btree ("event_id");
  CREATE INDEX "_homepage_sections_v_blocks_tabs_tabs_order_idx" ON "_homepage_sections_v_blocks_tabs_tabs" USING btree ("_order");
  CREATE INDEX "_homepage_sections_v_blocks_tabs_tabs_parent_id_idx" ON "_homepage_sections_v_blocks_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "_homepage_sections_v_blocks_tabs_order_idx" ON "_homepage_sections_v_blocks_tabs" USING btree ("_order");
  CREATE INDEX "_homepage_sections_v_blocks_tabs_parent_id_idx" ON "_homepage_sections_v_blocks_tabs" USING btree ("_parent_id");
  CREATE INDEX "_homepage_sections_v_blocks_tabs_path_idx" ON "_homepage_sections_v_blocks_tabs" USING btree ("_path");
  CREATE INDEX "_homepage_sections_v_blocks_section_group_sections_order_idx" ON "_homepage_sections_v_blocks_section_group_sections" USING btree ("_order");
  CREATE INDEX "_homepage_sections_v_blocks_section_group_sections_parent_id_idx" ON "_homepage_sections_v_blocks_section_group_sections" USING btree ("_parent_id");
  CREATE INDEX "_homepage_sections_v_blocks_section_group_sections_surfa_idx" ON "_homepage_sections_v_blocks_section_group_sections" USING btree ("surface_image_id");
  CREATE INDEX "_homepage_sections_v_blocks_section_group_order_idx" ON "_homepage_sections_v_blocks_section_group" USING btree ("_order");
  CREATE INDEX "_homepage_sections_v_blocks_section_group_parent_id_idx" ON "_homepage_sections_v_blocks_section_group" USING btree ("_parent_id");
  CREATE INDEX "_homepage_sections_v_blocks_section_group_path_idx" ON "_homepage_sections_v_blocks_section_group" USING btree ("_path");
  CREATE INDEX "_homepage_sections_v_blocks_section_group_surface_image_idx" ON "_homepage_sections_v_blocks_section_group" USING btree ("surface_image_id");
  CREATE INDEX "_homepage_sections_v_version_version__status_idx" ON "_homepage_sections_v" USING btree ("version__status");
  CREATE INDEX "_homepage_sections_v_created_at_idx" ON "_homepage_sections_v" USING btree ("created_at");
  CREATE INDEX "_homepage_sections_v_updated_at_idx" ON "_homepage_sections_v" USING btree ("updated_at");
  CREATE INDEX "_homepage_sections_v_latest_idx" ON "_homepage_sections_v" USING btree ("latest");
  CREATE INDEX "_homepage_sections_v_rels_order_idx" ON "_homepage_sections_v_rels" USING btree ("order");
  CREATE INDEX "_homepage_sections_v_rels_parent_idx" ON "_homepage_sections_v_rels" USING btree ("parent_id");
  CREATE INDEX "_homepage_sections_v_rels_path_idx" ON "_homepage_sections_v_rels" USING btree ("path");
  CREATE INDEX "_homepage_sections_v_rels_pages_id_idx" ON "_homepage_sections_v_rels" USING btree ("pages_id");
  CREATE INDEX "_homepage_sections_v_rels_posts_id_idx" ON "_homepage_sections_v_rels" USING btree ("posts_id");
  CREATE INDEX "_homepage_sections_v_rels_events_id_idx" ON "_homepage_sections_v_rels" USING btree ("events_id");
  CREATE INDEX "_homepage_sections_v_rels_event_cycles_id_idx" ON "_homepage_sections_v_rels" USING btree ("event_cycles_id");
  CREATE INDEX "_homepage_sections_v_rels_documents_id_idx" ON "_homepage_sections_v_rels" USING btree ("documents_id");
  CREATE INDEX "_footer_v_version_social_items_order_idx" ON "_footer_v_version_social_items" USING btree ("_order");
  CREATE INDEX "_footer_v_version_social_items_parent_id_idx" ON "_footer_v_version_social_items" USING btree ("_parent_id");
  CREATE INDEX "_footer_v_version_social_items_event_cycle_idx" ON "_footer_v_version_social_items" USING btree ("event_cycle_id");
  CREATE INDEX "_footer_v_version_social_items_document_idx" ON "_footer_v_version_social_items" USING btree ("document_id");
  CREATE INDEX "_footer_v_version_social_items_category_idx" ON "_footer_v_version_social_items" USING btree ("category_id");
  CREATE INDEX "_footer_v_version_social_items_partner_idx" ON "_footer_v_version_social_items" USING btree ("partner_id");
  CREATE INDEX "_footer_v_version_social_items_page_idx" ON "_footer_v_version_social_items" USING btree ("page_id");
  CREATE INDEX "_footer_v_version_social_items_tag_idx" ON "_footer_v_version_social_items" USING btree ("tag_id");
  CREATE INDEX "_footer_v_version_social_items_post_idx" ON "_footer_v_version_social_items" USING btree ("post_id");
  CREATE INDEX "_footer_v_version_social_items_event_idx" ON "_footer_v_version_social_items" USING btree ("event_id");
  CREATE INDEX "_footer_v_version_columns_items_order_idx" ON "_footer_v_version_columns_items" USING btree ("_order");
  CREATE INDEX "_footer_v_version_columns_items_parent_id_idx" ON "_footer_v_version_columns_items" USING btree ("_parent_id");
  CREATE INDEX "_footer_v_version_columns_items_event_cycle_idx" ON "_footer_v_version_columns_items" USING btree ("event_cycle_id");
  CREATE INDEX "_footer_v_version_columns_items_document_idx" ON "_footer_v_version_columns_items" USING btree ("document_id");
  CREATE INDEX "_footer_v_version_columns_items_category_idx" ON "_footer_v_version_columns_items" USING btree ("category_id");
  CREATE INDEX "_footer_v_version_columns_items_partner_idx" ON "_footer_v_version_columns_items" USING btree ("partner_id");
  CREATE INDEX "_footer_v_version_columns_items_page_idx" ON "_footer_v_version_columns_items" USING btree ("page_id");
  CREATE INDEX "_footer_v_version_columns_items_tag_idx" ON "_footer_v_version_columns_items" USING btree ("tag_id");
  CREATE INDEX "_footer_v_version_columns_items_post_idx" ON "_footer_v_version_columns_items" USING btree ("post_id");
  CREATE INDEX "_footer_v_version_columns_items_event_idx" ON "_footer_v_version_columns_items" USING btree ("event_id");
  CREATE INDEX "_footer_v_version_columns_order_idx" ON "_footer_v_version_columns" USING btree ("_order");
  CREATE INDEX "_footer_v_version_columns_parent_id_idx" ON "_footer_v_version_columns" USING btree ("_parent_id");
  CREATE INDEX "_footer_v_version_version__status_idx" ON "_footer_v" USING btree ("version__status");
  CREATE INDEX "_footer_v_created_at_idx" ON "_footer_v" USING btree ("created_at");
  CREATE INDEX "_footer_v_updated_at_idx" ON "_footer_v" USING btree ("updated_at");
  CREATE INDEX "_footer_v_latest_idx" ON "_footer_v" USING btree ("latest");
  CREATE INDEX "site_settings__status_idx" ON "site_settings" USING btree ("_status");
  CREATE INDEX "navigation__status_idx" ON "navigation" USING btree ("_status");
  CREATE INDEX "homepage_hero__status_idx" ON "homepage_hero" USING btree ("_status");
  CREATE INDEX "homepage_sections__status_idx" ON "homepage_sections" USING btree ("_status");
  CREATE INDEX "footer__status_idx" ON "footer" USING btree ("_status");
  DROP TYPE "public"."enum_pages_blocks_column_layout_vertical_alignment";
  DROP TYPE "public"."enum_pages_blocks_column_layout_column_separators";
  DROP TYPE "public"."enum_pages_blocks_tabs_header_left_items_icon_name";
  DROP TYPE "public"."enum_pages_blocks_tabs_header_right_items_icon_name";
  DROP TYPE "public"."enum__pages_v_blocks_column_layout_vertical_alignment";
  DROP TYPE "public"."enum__pages_v_blocks_column_layout_column_separators";
  DROP TYPE "public"."enum__pages_v_blocks_tabs_header_left_items_icon_name";
  DROP TYPE "public"."enum__pages_v_blocks_tabs_header_right_items_icon_name";
  DROP TYPE "public"."enum_posts_blocks_column_layout_vertical_alignment";
  DROP TYPE "public"."enum_posts_blocks_column_layout_column_separators";
  DROP TYPE "public"."enum_posts_blocks_tabs_header_left_items_icon_name";
  DROP TYPE "public"."enum_posts_blocks_tabs_header_right_items_icon_name";
  DROP TYPE "public"."enum__posts_v_blocks_column_layout_vertical_alignment";
  DROP TYPE "public"."enum__posts_v_blocks_column_layout_column_separators";
  DROP TYPE "public"."enum__posts_v_blocks_tabs_header_left_items_icon_name";
  DROP TYPE "public"."enum__posts_v_blocks_tabs_header_right_items_icon_name";
  DROP TYPE "public"."enum_events_blocks_column_layout_vertical_alignment";
  DROP TYPE "public"."enum_events_blocks_column_layout_column_separators";
  DROP TYPE "public"."enum_events_blocks_tabs_header_left_items_icon_name";
  DROP TYPE "public"."enum_events_blocks_tabs_header_right_items_icon_name";
  DROP TYPE "public"."enum__events_v_blocks_column_layout_vertical_alignment";
  DROP TYPE "public"."enum__events_v_blocks_column_layout_column_separators";
  DROP TYPE "public"."enum__events_v_blocks_tabs_header_left_items_icon_name";
  DROP TYPE "public"."enum__events_v_blocks_tabs_header_right_items_icon_name";
  DROP TYPE "public"."enum_event_cycles_blocks_column_layout_vertical_alignment";
  DROP TYPE "public"."enum_event_cycles_blocks_column_layout_column_separators";
  DROP TYPE "public"."enum_event_cycles_blocks_tabs_header_left_items_icon_name";
  DROP TYPE "public"."enum_event_cycles_blocks_tabs_header_right_items_icon_name";
  DROP TYPE "public"."enum__event_cycles_v_blocks_column_layout_vertical_alignment";
  DROP TYPE "public"."enum__event_cycles_v_blocks_column_layout_column_separators";
  DROP TYPE "public"."enum__event_cycles_v_blocks_tabs_header_left_items_icon_name";
  DROP TYPE "public"."enum__event_cycles_v_blocks_tabs_header_right_items_icon_name";
  DROP TYPE "public"."enum_partners_blocks_column_layout_vertical_alignment";
  DROP TYPE "public"."enum_partners_blocks_column_layout_column_separators";
  DROP TYPE "public"."enum_partners_blocks_tabs_header_left_items_icon_name";
  DROP TYPE "public"."enum_partners_blocks_tabs_header_right_items_icon_name";
  DROP TYPE "public"."enum__partners_v_blocks_column_layout_vertical_alignment";
  DROP TYPE "public"."enum__partners_v_blocks_column_layout_column_separators";
  DROP TYPE "public"."enum__partners_v_blocks_tabs_header_left_items_icon_name";
  DROP TYPE "public"."enum__partners_v_blocks_tabs_header_right_items_icon_name";
  DROP TYPE "public"."enum_homepage_sections_blocks_column_layout_vertical_alignment";
  DROP TYPE "public"."enum_homepage_sections_blocks_column_layout_column_separators";
  DROP TYPE "public"."enum_homepage_sections_blocks_tabs_header_left_items_icon_name";
  DROP TYPE "public"."enum_homepage_sections_blocks_tabs_header_right_items_icon_name";`)

  await db.execute(sql`
   ALTER TABLE "pages" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  ALTER TABLE "_pages_v" ADD COLUMN "version_deleted_at" timestamp(3) with time zone;
  ALTER TABLE "posts" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  ALTER TABLE "_posts_v" ADD COLUMN "version_deleted_at" timestamp(3) with time zone;
  ALTER TABLE "events" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  ALTER TABLE "_events_v" ADD COLUMN "version_deleted_at" timestamp(3) with time zone;
  ALTER TABLE "event_cycles" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  ALTER TABLE "_event_cycles_v" ADD COLUMN "version_deleted_at" timestamp(3) with time zone;
  ALTER TABLE "member_profiles" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  ALTER TABLE "_member_profiles_v" ADD COLUMN "version_deleted_at" timestamp(3) with time zone;
  ALTER TABLE "documents" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  ALTER TABLE "_documents_v" ADD COLUMN "version_deleted_at" timestamp(3) with time zone;
  ALTER TABLE "partners" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  ALTER TABLE "_partners_v" ADD COLUMN "version_deleted_at" timestamp(3) with time zone;
  ALTER TABLE "club_sections" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  ALTER TABLE "_club_sections_v" ADD COLUMN "version_deleted_at" timestamp(3) with time zone;
  CREATE INDEX "pages_deleted_at_idx" ON "pages" USING btree ("deleted_at");
  CREATE INDEX "_pages_v_version_version_deleted_at_idx" ON "_pages_v" USING btree ("version_deleted_at");
  CREATE INDEX "posts_deleted_at_idx" ON "posts" USING btree ("deleted_at");
  CREATE INDEX "_posts_v_version_version_deleted_at_idx" ON "_posts_v" USING btree ("version_deleted_at");
  CREATE INDEX "events_deleted_at_idx" ON "events" USING btree ("deleted_at");
  CREATE INDEX "_events_v_version_version_deleted_at_idx" ON "_events_v" USING btree ("version_deleted_at");
  CREATE INDEX "event_cycles_deleted_at_idx" ON "event_cycles" USING btree ("deleted_at");
  CREATE INDEX "_event_cycles_v_version_version_deleted_at_idx" ON "_event_cycles_v" USING btree ("version_deleted_at");
  CREATE INDEX "member_profiles_deleted_at_idx" ON "member_profiles" USING btree ("deleted_at");
  CREATE INDEX "_member_profiles_v_version_version_deleted_at_idx" ON "_member_profiles_v" USING btree ("version_deleted_at");
  CREATE INDEX "documents_deleted_at_idx" ON "documents" USING btree ("deleted_at");
  CREATE INDEX "_documents_v_version_version_deleted_at_idx" ON "_documents_v" USING btree ("version_deleted_at");
  CREATE INDEX "partners_deleted_at_idx" ON "partners" USING btree ("deleted_at");
  CREATE INDEX "_partners_v_version_version_deleted_at_idx" ON "_partners_v" USING btree ("version_deleted_at");
  CREATE INDEX "club_sections_deleted_at_idx" ON "club_sections" USING btree ("deleted_at");
  CREATE INDEX "_club_sections_v_version_version_deleted_at_idx" ON "_club_sections_v" USING btree ("version_deleted_at");`)

  await db.execute(sql`
   ALTER TABLE "roles_permissions" ADD COLUMN "restore_allowed" boolean DEFAULT false;
  ALTER TABLE "roles_permissions" ADD COLUMN "permanent_delete_allowed" boolean DEFAULT false;

  UPDATE "roles_permissions"
  SET "restore_allowed" = true
  WHERE "update_allowed" = true
    AND "resource" IN (
      'pages',
      'posts',
      'events',
      'event-cycles',
      'documents',
      'partners',
      'club-sections',
      'member-profiles'
    );

  UPDATE "roles_permissions" AS "permission"
  SET "permanent_delete_allowed" = true
  FROM "roles"
  WHERE "permission"."_parent_id" = "roles"."id"
    AND "roles"."key" = 'administrator'
    AND "permission"."delete_allowed" = true
    AND "permission"."resource" IN (
      'pages',
      'posts',
      'events',
      'event-cycles',
      'documents',
      'partners',
      'club-sections',
      'member-profiles'
    );`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "roles_permissions" DROP COLUMN "restore_allowed";
  ALTER TABLE "roles_permissions" DROP COLUMN "permanent_delete_allowed";`)

  await db.execute(sql`
   DROP INDEX "pages_deleted_at_idx";
  DROP INDEX "_pages_v_version_version_deleted_at_idx";
  DROP INDEX "posts_deleted_at_idx";
  DROP INDEX "_posts_v_version_version_deleted_at_idx";
  DROP INDEX "events_deleted_at_idx";
  DROP INDEX "_events_v_version_version_deleted_at_idx";
  DROP INDEX "event_cycles_deleted_at_idx";
  DROP INDEX "_event_cycles_v_version_version_deleted_at_idx";
  DROP INDEX "member_profiles_deleted_at_idx";
  DROP INDEX "_member_profiles_v_version_version_deleted_at_idx";
  DROP INDEX "documents_deleted_at_idx";
  DROP INDEX "_documents_v_version_version_deleted_at_idx";
  DROP INDEX "partners_deleted_at_idx";
  DROP INDEX "_partners_v_version_version_deleted_at_idx";
  DROP INDEX "club_sections_deleted_at_idx";
  DROP INDEX "_club_sections_v_version_version_deleted_at_idx";
  ALTER TABLE "pages" DROP COLUMN "deleted_at";
  ALTER TABLE "_pages_v" DROP COLUMN "version_deleted_at";
  ALTER TABLE "posts" DROP COLUMN "deleted_at";
  ALTER TABLE "_posts_v" DROP COLUMN "version_deleted_at";
  ALTER TABLE "events" DROP COLUMN "deleted_at";
  ALTER TABLE "_events_v" DROP COLUMN "version_deleted_at";
  ALTER TABLE "event_cycles" DROP COLUMN "deleted_at";
  ALTER TABLE "_event_cycles_v" DROP COLUMN "version_deleted_at";
  ALTER TABLE "member_profiles" DROP COLUMN "deleted_at";
  ALTER TABLE "_member_profiles_v" DROP COLUMN "version_deleted_at";
  ALTER TABLE "documents" DROP COLUMN "deleted_at";
  ALTER TABLE "_documents_v" DROP COLUMN "version_deleted_at";
  ALTER TABLE "partners" DROP COLUMN "deleted_at";
  ALTER TABLE "_partners_v" DROP COLUMN "version_deleted_at";
  ALTER TABLE "club_sections" DROP COLUMN "deleted_at";
  ALTER TABLE "_club_sections_v" DROP COLUMN "version_deleted_at";`)

  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_column_layout_vertical_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum_pages_blocks_column_layout_column_separators" AS ENUM('none', 'between');
  CREATE TYPE "public"."enum_pages_blocks_tabs_header_left_items_icon_name" AS ENUM('camera', 'astronaut', 'ticket', 'bluesky', 'mace', 'bottle-mana', 'cthulhu', 'time', 'skull', 'dnd5', 'discord', 'document', 'pumpkin-halloween', 'mail', 'facebook', 'guitar', 'globe', 'board-game', 'star', 'instagram', 'calendar', 'hat', 'gun', 'cards', 'playing-cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'water-drop', 'crystal-ball', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'pirate-map', 'vendetta', 'messenger', 'sword', 'potion', 'music', 'image', 'announcement', 'eye', 'partner', 'pdf', 'seal', 'pawn', 'quill', 'flame', 'download', 'review', 'wand', 'sf', 'seance', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'superhero', 'stormtrooper', 'soundtrack', 'tag', 'shield', 'axe', 'twitch', 'shuttle', 'fighter', 'event', 'filled-star', 'youtube', 'scroll');
  CREATE TYPE "public"."enum_pages_blocks_tabs_header_right_items_icon_name" AS ENUM('camera', 'astronaut', 'ticket', 'bluesky', 'mace', 'bottle-mana', 'cthulhu', 'time', 'skull', 'dnd5', 'discord', 'document', 'pumpkin-halloween', 'mail', 'facebook', 'guitar', 'globe', 'board-game', 'star', 'instagram', 'calendar', 'hat', 'gun', 'cards', 'playing-cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'water-drop', 'crystal-ball', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'pirate-map', 'vendetta', 'messenger', 'sword', 'potion', 'music', 'image', 'announcement', 'eye', 'partner', 'pdf', 'seal', 'pawn', 'quill', 'flame', 'download', 'review', 'wand', 'sf', 'seance', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'superhero', 'stormtrooper', 'soundtrack', 'tag', 'shield', 'axe', 'twitch', 'shuttle', 'fighter', 'event', 'filled-star', 'youtube', 'scroll');
  CREATE TYPE "public"."enum__pages_v_blocks_column_layout_vertical_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum__pages_v_blocks_column_layout_column_separators" AS ENUM('none', 'between');
  CREATE TYPE "public"."enum__pages_v_blocks_tabs_header_left_items_icon_name" AS ENUM('camera', 'astronaut', 'ticket', 'bluesky', 'mace', 'bottle-mana', 'cthulhu', 'time', 'skull', 'dnd5', 'discord', 'document', 'pumpkin-halloween', 'mail', 'facebook', 'guitar', 'globe', 'board-game', 'star', 'instagram', 'calendar', 'hat', 'gun', 'cards', 'playing-cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'water-drop', 'crystal-ball', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'pirate-map', 'vendetta', 'messenger', 'sword', 'potion', 'music', 'image', 'announcement', 'eye', 'partner', 'pdf', 'seal', 'pawn', 'quill', 'flame', 'download', 'review', 'wand', 'sf', 'seance', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'superhero', 'stormtrooper', 'soundtrack', 'tag', 'shield', 'axe', 'twitch', 'shuttle', 'fighter', 'event', 'filled-star', 'youtube', 'scroll');
  CREATE TYPE "public"."enum__pages_v_blocks_tabs_header_right_items_icon_name" AS ENUM('camera', 'astronaut', 'ticket', 'bluesky', 'mace', 'bottle-mana', 'cthulhu', 'time', 'skull', 'dnd5', 'discord', 'document', 'pumpkin-halloween', 'mail', 'facebook', 'guitar', 'globe', 'board-game', 'star', 'instagram', 'calendar', 'hat', 'gun', 'cards', 'playing-cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'water-drop', 'crystal-ball', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'pirate-map', 'vendetta', 'messenger', 'sword', 'potion', 'music', 'image', 'announcement', 'eye', 'partner', 'pdf', 'seal', 'pawn', 'quill', 'flame', 'download', 'review', 'wand', 'sf', 'seance', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'superhero', 'stormtrooper', 'soundtrack', 'tag', 'shield', 'axe', 'twitch', 'shuttle', 'fighter', 'event', 'filled-star', 'youtube', 'scroll');
  CREATE TYPE "public"."enum_posts_blocks_column_layout_vertical_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum_posts_blocks_column_layout_column_separators" AS ENUM('none', 'between');
  CREATE TYPE "public"."enum_posts_blocks_tabs_header_left_items_icon_name" AS ENUM('camera', 'astronaut', 'ticket', 'bluesky', 'mace', 'bottle-mana', 'cthulhu', 'time', 'skull', 'dnd5', 'discord', 'document', 'pumpkin-halloween', 'mail', 'facebook', 'guitar', 'globe', 'board-game', 'star', 'instagram', 'calendar', 'hat', 'gun', 'cards', 'playing-cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'water-drop', 'crystal-ball', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'pirate-map', 'vendetta', 'messenger', 'sword', 'potion', 'music', 'image', 'announcement', 'eye', 'partner', 'pdf', 'seal', 'pawn', 'quill', 'flame', 'download', 'review', 'wand', 'sf', 'seance', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'superhero', 'stormtrooper', 'soundtrack', 'tag', 'shield', 'axe', 'twitch', 'shuttle', 'fighter', 'event', 'filled-star', 'youtube', 'scroll');
  CREATE TYPE "public"."enum_posts_blocks_tabs_header_right_items_icon_name" AS ENUM('camera', 'astronaut', 'ticket', 'bluesky', 'mace', 'bottle-mana', 'cthulhu', 'time', 'skull', 'dnd5', 'discord', 'document', 'pumpkin-halloween', 'mail', 'facebook', 'guitar', 'globe', 'board-game', 'star', 'instagram', 'calendar', 'hat', 'gun', 'cards', 'playing-cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'water-drop', 'crystal-ball', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'pirate-map', 'vendetta', 'messenger', 'sword', 'potion', 'music', 'image', 'announcement', 'eye', 'partner', 'pdf', 'seal', 'pawn', 'quill', 'flame', 'download', 'review', 'wand', 'sf', 'seance', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'superhero', 'stormtrooper', 'soundtrack', 'tag', 'shield', 'axe', 'twitch', 'shuttle', 'fighter', 'event', 'filled-star', 'youtube', 'scroll');
  CREATE TYPE "public"."enum__posts_v_blocks_column_layout_vertical_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum__posts_v_blocks_column_layout_column_separators" AS ENUM('none', 'between');
  CREATE TYPE "public"."enum__posts_v_blocks_tabs_header_left_items_icon_name" AS ENUM('camera', 'astronaut', 'ticket', 'bluesky', 'mace', 'bottle-mana', 'cthulhu', 'time', 'skull', 'dnd5', 'discord', 'document', 'pumpkin-halloween', 'mail', 'facebook', 'guitar', 'globe', 'board-game', 'star', 'instagram', 'calendar', 'hat', 'gun', 'cards', 'playing-cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'water-drop', 'crystal-ball', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'pirate-map', 'vendetta', 'messenger', 'sword', 'potion', 'music', 'image', 'announcement', 'eye', 'partner', 'pdf', 'seal', 'pawn', 'quill', 'flame', 'download', 'review', 'wand', 'sf', 'seance', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'superhero', 'stormtrooper', 'soundtrack', 'tag', 'shield', 'axe', 'twitch', 'shuttle', 'fighter', 'event', 'filled-star', 'youtube', 'scroll');
  CREATE TYPE "public"."enum__posts_v_blocks_tabs_header_right_items_icon_name" AS ENUM('camera', 'astronaut', 'ticket', 'bluesky', 'mace', 'bottle-mana', 'cthulhu', 'time', 'skull', 'dnd5', 'discord', 'document', 'pumpkin-halloween', 'mail', 'facebook', 'guitar', 'globe', 'board-game', 'star', 'instagram', 'calendar', 'hat', 'gun', 'cards', 'playing-cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'water-drop', 'crystal-ball', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'pirate-map', 'vendetta', 'messenger', 'sword', 'potion', 'music', 'image', 'announcement', 'eye', 'partner', 'pdf', 'seal', 'pawn', 'quill', 'flame', 'download', 'review', 'wand', 'sf', 'seance', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'superhero', 'stormtrooper', 'soundtrack', 'tag', 'shield', 'axe', 'twitch', 'shuttle', 'fighter', 'event', 'filled-star', 'youtube', 'scroll');
  CREATE TYPE "public"."enum_events_blocks_column_layout_vertical_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum_events_blocks_column_layout_column_separators" AS ENUM('none', 'between');
  CREATE TYPE "public"."enum_events_blocks_tabs_header_left_items_icon_name" AS ENUM('camera', 'astronaut', 'ticket', 'bluesky', 'mace', 'bottle-mana', 'cthulhu', 'time', 'skull', 'dnd5', 'discord', 'document', 'pumpkin-halloween', 'mail', 'facebook', 'guitar', 'globe', 'board-game', 'star', 'instagram', 'calendar', 'hat', 'gun', 'cards', 'playing-cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'water-drop', 'crystal-ball', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'pirate-map', 'vendetta', 'messenger', 'sword', 'potion', 'music', 'image', 'announcement', 'eye', 'partner', 'pdf', 'seal', 'pawn', 'quill', 'flame', 'download', 'review', 'wand', 'sf', 'seance', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'superhero', 'stormtrooper', 'soundtrack', 'tag', 'shield', 'axe', 'twitch', 'shuttle', 'fighter', 'event', 'filled-star', 'youtube', 'scroll');
  CREATE TYPE "public"."enum_events_blocks_tabs_header_right_items_icon_name" AS ENUM('camera', 'astronaut', 'ticket', 'bluesky', 'mace', 'bottle-mana', 'cthulhu', 'time', 'skull', 'dnd5', 'discord', 'document', 'pumpkin-halloween', 'mail', 'facebook', 'guitar', 'globe', 'board-game', 'star', 'instagram', 'calendar', 'hat', 'gun', 'cards', 'playing-cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'water-drop', 'crystal-ball', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'pirate-map', 'vendetta', 'messenger', 'sword', 'potion', 'music', 'image', 'announcement', 'eye', 'partner', 'pdf', 'seal', 'pawn', 'quill', 'flame', 'download', 'review', 'wand', 'sf', 'seance', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'superhero', 'stormtrooper', 'soundtrack', 'tag', 'shield', 'axe', 'twitch', 'shuttle', 'fighter', 'event', 'filled-star', 'youtube', 'scroll');
  CREATE TYPE "public"."enum__events_v_blocks_column_layout_vertical_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum__events_v_blocks_column_layout_column_separators" AS ENUM('none', 'between');
  CREATE TYPE "public"."enum__events_v_blocks_tabs_header_left_items_icon_name" AS ENUM('camera', 'astronaut', 'ticket', 'bluesky', 'mace', 'bottle-mana', 'cthulhu', 'time', 'skull', 'dnd5', 'discord', 'document', 'pumpkin-halloween', 'mail', 'facebook', 'guitar', 'globe', 'board-game', 'star', 'instagram', 'calendar', 'hat', 'gun', 'cards', 'playing-cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'water-drop', 'crystal-ball', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'pirate-map', 'vendetta', 'messenger', 'sword', 'potion', 'music', 'image', 'announcement', 'eye', 'partner', 'pdf', 'seal', 'pawn', 'quill', 'flame', 'download', 'review', 'wand', 'sf', 'seance', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'superhero', 'stormtrooper', 'soundtrack', 'tag', 'shield', 'axe', 'twitch', 'shuttle', 'fighter', 'event', 'filled-star', 'youtube', 'scroll');
  CREATE TYPE "public"."enum__events_v_blocks_tabs_header_right_items_icon_name" AS ENUM('camera', 'astronaut', 'ticket', 'bluesky', 'mace', 'bottle-mana', 'cthulhu', 'time', 'skull', 'dnd5', 'discord', 'document', 'pumpkin-halloween', 'mail', 'facebook', 'guitar', 'globe', 'board-game', 'star', 'instagram', 'calendar', 'hat', 'gun', 'cards', 'playing-cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'water-drop', 'crystal-ball', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'pirate-map', 'vendetta', 'messenger', 'sword', 'potion', 'music', 'image', 'announcement', 'eye', 'partner', 'pdf', 'seal', 'pawn', 'quill', 'flame', 'download', 'review', 'wand', 'sf', 'seance', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'superhero', 'stormtrooper', 'soundtrack', 'tag', 'shield', 'axe', 'twitch', 'shuttle', 'fighter', 'event', 'filled-star', 'youtube', 'scroll');
  CREATE TYPE "public"."enum_event_cycles_blocks_column_layout_vertical_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum_event_cycles_blocks_column_layout_column_separators" AS ENUM('none', 'between');
  CREATE TYPE "public"."enum_event_cycles_blocks_tabs_header_left_items_icon_name" AS ENUM('camera', 'astronaut', 'ticket', 'bluesky', 'mace', 'bottle-mana', 'cthulhu', 'time', 'skull', 'dnd5', 'discord', 'document', 'pumpkin-halloween', 'mail', 'facebook', 'guitar', 'globe', 'board-game', 'star', 'instagram', 'calendar', 'hat', 'gun', 'cards', 'playing-cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'water-drop', 'crystal-ball', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'pirate-map', 'vendetta', 'messenger', 'sword', 'potion', 'music', 'image', 'announcement', 'eye', 'partner', 'pdf', 'seal', 'pawn', 'quill', 'flame', 'download', 'review', 'wand', 'sf', 'seance', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'superhero', 'stormtrooper', 'soundtrack', 'tag', 'shield', 'axe', 'twitch', 'shuttle', 'fighter', 'event', 'filled-star', 'youtube', 'scroll');
  CREATE TYPE "public"."enum_event_cycles_blocks_tabs_header_right_items_icon_name" AS ENUM('camera', 'astronaut', 'ticket', 'bluesky', 'mace', 'bottle-mana', 'cthulhu', 'time', 'skull', 'dnd5', 'discord', 'document', 'pumpkin-halloween', 'mail', 'facebook', 'guitar', 'globe', 'board-game', 'star', 'instagram', 'calendar', 'hat', 'gun', 'cards', 'playing-cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'water-drop', 'crystal-ball', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'pirate-map', 'vendetta', 'messenger', 'sword', 'potion', 'music', 'image', 'announcement', 'eye', 'partner', 'pdf', 'seal', 'pawn', 'quill', 'flame', 'download', 'review', 'wand', 'sf', 'seance', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'superhero', 'stormtrooper', 'soundtrack', 'tag', 'shield', 'axe', 'twitch', 'shuttle', 'fighter', 'event', 'filled-star', 'youtube', 'scroll');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_column_layout_vertical_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_column_layout_column_separators" AS ENUM('none', 'between');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_tabs_header_left_items_icon_name" AS ENUM('camera', 'astronaut', 'ticket', 'bluesky', 'mace', 'bottle-mana', 'cthulhu', 'time', 'skull', 'dnd5', 'discord', 'document', 'pumpkin-halloween', 'mail', 'facebook', 'guitar', 'globe', 'board-game', 'star', 'instagram', 'calendar', 'hat', 'gun', 'cards', 'playing-cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'water-drop', 'crystal-ball', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'pirate-map', 'vendetta', 'messenger', 'sword', 'potion', 'music', 'image', 'announcement', 'eye', 'partner', 'pdf', 'seal', 'pawn', 'quill', 'flame', 'download', 'review', 'wand', 'sf', 'seance', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'superhero', 'stormtrooper', 'soundtrack', 'tag', 'shield', 'axe', 'twitch', 'shuttle', 'fighter', 'event', 'filled-star', 'youtube', 'scroll');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_tabs_header_right_items_icon_name" AS ENUM('camera', 'astronaut', 'ticket', 'bluesky', 'mace', 'bottle-mana', 'cthulhu', 'time', 'skull', 'dnd5', 'discord', 'document', 'pumpkin-halloween', 'mail', 'facebook', 'guitar', 'globe', 'board-game', 'star', 'instagram', 'calendar', 'hat', 'gun', 'cards', 'playing-cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'water-drop', 'crystal-ball', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'pirate-map', 'vendetta', 'messenger', 'sword', 'potion', 'music', 'image', 'announcement', 'eye', 'partner', 'pdf', 'seal', 'pawn', 'quill', 'flame', 'download', 'review', 'wand', 'sf', 'seance', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'superhero', 'stormtrooper', 'soundtrack', 'tag', 'shield', 'axe', 'twitch', 'shuttle', 'fighter', 'event', 'filled-star', 'youtube', 'scroll');
  CREATE TYPE "public"."enum_partners_blocks_column_layout_vertical_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum_partners_blocks_column_layout_column_separators" AS ENUM('none', 'between');
  CREATE TYPE "public"."enum_partners_blocks_tabs_header_left_items_icon_name" AS ENUM('camera', 'astronaut', 'ticket', 'bluesky', 'mace', 'bottle-mana', 'cthulhu', 'time', 'skull', 'dnd5', 'discord', 'document', 'pumpkin-halloween', 'mail', 'facebook', 'guitar', 'globe', 'board-game', 'star', 'instagram', 'calendar', 'hat', 'gun', 'cards', 'playing-cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'water-drop', 'crystal-ball', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'pirate-map', 'vendetta', 'messenger', 'sword', 'potion', 'music', 'image', 'announcement', 'eye', 'partner', 'pdf', 'seal', 'pawn', 'quill', 'flame', 'download', 'review', 'wand', 'sf', 'seance', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'superhero', 'stormtrooper', 'soundtrack', 'tag', 'shield', 'axe', 'twitch', 'shuttle', 'fighter', 'event', 'filled-star', 'youtube', 'scroll');
  CREATE TYPE "public"."enum_partners_blocks_tabs_header_right_items_icon_name" AS ENUM('camera', 'astronaut', 'ticket', 'bluesky', 'mace', 'bottle-mana', 'cthulhu', 'time', 'skull', 'dnd5', 'discord', 'document', 'pumpkin-halloween', 'mail', 'facebook', 'guitar', 'globe', 'board-game', 'star', 'instagram', 'calendar', 'hat', 'gun', 'cards', 'playing-cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'water-drop', 'crystal-ball', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'pirate-map', 'vendetta', 'messenger', 'sword', 'potion', 'music', 'image', 'announcement', 'eye', 'partner', 'pdf', 'seal', 'pawn', 'quill', 'flame', 'download', 'review', 'wand', 'sf', 'seance', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'superhero', 'stormtrooper', 'soundtrack', 'tag', 'shield', 'axe', 'twitch', 'shuttle', 'fighter', 'event', 'filled-star', 'youtube', 'scroll');
  CREATE TYPE "public"."enum__partners_v_blocks_column_layout_vertical_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum__partners_v_blocks_column_layout_column_separators" AS ENUM('none', 'between');
  CREATE TYPE "public"."enum__partners_v_blocks_tabs_header_left_items_icon_name" AS ENUM('camera', 'astronaut', 'ticket', 'bluesky', 'mace', 'bottle-mana', 'cthulhu', 'time', 'skull', 'dnd5', 'discord', 'document', 'pumpkin-halloween', 'mail', 'facebook', 'guitar', 'globe', 'board-game', 'star', 'instagram', 'calendar', 'hat', 'gun', 'cards', 'playing-cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'water-drop', 'crystal-ball', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'pirate-map', 'vendetta', 'messenger', 'sword', 'potion', 'music', 'image', 'announcement', 'eye', 'partner', 'pdf', 'seal', 'pawn', 'quill', 'flame', 'download', 'review', 'wand', 'sf', 'seance', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'superhero', 'stormtrooper', 'soundtrack', 'tag', 'shield', 'axe', 'twitch', 'shuttle', 'fighter', 'event', 'filled-star', 'youtube', 'scroll');
  CREATE TYPE "public"."enum__partners_v_blocks_tabs_header_right_items_icon_name" AS ENUM('camera', 'astronaut', 'ticket', 'bluesky', 'mace', 'bottle-mana', 'cthulhu', 'time', 'skull', 'dnd5', 'discord', 'document', 'pumpkin-halloween', 'mail', 'facebook', 'guitar', 'globe', 'board-game', 'star', 'instagram', 'calendar', 'hat', 'gun', 'cards', 'playing-cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'water-drop', 'crystal-ball', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'pirate-map', 'vendetta', 'messenger', 'sword', 'potion', 'music', 'image', 'announcement', 'eye', 'partner', 'pdf', 'seal', 'pawn', 'quill', 'flame', 'download', 'review', 'wand', 'sf', 'seance', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'superhero', 'stormtrooper', 'soundtrack', 'tag', 'shield', 'axe', 'twitch', 'shuttle', 'fighter', 'event', 'filled-star', 'youtube', 'scroll');
  CREATE TYPE "public"."enum_homepage_sections_blocks_column_layout_vertical_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum_homepage_sections_blocks_column_layout_column_separators" AS ENUM('none', 'between');
  CREATE TYPE "public"."enum_homepage_sections_blocks_tabs_header_left_items_icon_name" AS ENUM('camera', 'astronaut', 'ticket', 'bluesky', 'mace', 'bottle-mana', 'cthulhu', 'time', 'skull', 'dnd5', 'discord', 'document', 'pumpkin-halloween', 'mail', 'facebook', 'guitar', 'globe', 'board-game', 'star', 'instagram', 'calendar', 'hat', 'gun', 'cards', 'playing-cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'water-drop', 'crystal-ball', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'pirate-map', 'vendetta', 'messenger', 'sword', 'potion', 'music', 'image', 'announcement', 'eye', 'partner', 'pdf', 'seal', 'pawn', 'quill', 'flame', 'download', 'review', 'wand', 'sf', 'seance', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'superhero', 'stormtrooper', 'soundtrack', 'tag', 'shield', 'axe', 'twitch', 'shuttle', 'fighter', 'event', 'filled-star', 'youtube', 'scroll');
  CREATE TYPE "public"."enum_homepage_sections_blocks_tabs_header_right_items_icon_name" AS ENUM('camera', 'astronaut', 'ticket', 'bluesky', 'mace', 'bottle-mana', 'cthulhu', 'time', 'skull', 'dnd5', 'discord', 'document', 'pumpkin-halloween', 'mail', 'facebook', 'guitar', 'globe', 'board-game', 'star', 'instagram', 'calendar', 'hat', 'gun', 'cards', 'playing-cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'water-drop', 'crystal-ball', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'pirate-map', 'vendetta', 'messenger', 'sword', 'potion', 'music', 'image', 'announcement', 'eye', 'partner', 'pdf', 'seal', 'pawn', 'quill', 'flame', 'download', 'review', 'wand', 'sf', 'seance', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'superhero', 'stormtrooper', 'soundtrack', 'tag', 'shield', 'axe', 'twitch', 'shuttle', 'fighter', 'event', 'filled-star', 'youtube', 'scroll');
  ALTER TABLE "_site_settings_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_navigation_v_version_header_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_navigation_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_hero_v_version_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_hero_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_sections_v_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_sections_v_blocks_heading" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_sections_v_blocks_action_links_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_sections_v_blocks_action_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_sections_v_blocks_card_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_sections_v_blocks_card" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_sections_v_blocks_listing_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_sections_v_blocks_listing_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_sections_v_blocks_listing" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_sections_v_blocks_carousel_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_sections_v_blocks_carousel_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_sections_v_blocks_carousel" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_sections_v_blocks_content_calendar_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_sections_v_blocks_content_calendar" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_sections_v_blocks_media_gallery_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_sections_v_blocks_media_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_sections_v_blocks_attachments_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_sections_v_blocks_attachments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_sections_v_blocks_member_profiles_entries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_sections_v_blocks_member_profiles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_sections_v_blocks_column_layout_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_sections_v_blocks_column_layout" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_sections_v_blocks_tabs_header_left_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_sections_v_blocks_tabs_header_right_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_sections_v_blocks_tabs_footer_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_sections_v_blocks_tabs_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_sections_v_blocks_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_sections_v_blocks_section_group_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_sections_v_blocks_section_group" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_sections_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_sections_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v_version_social_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v_version_columns_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v_version_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "_site_settings_v" CASCADE;
  DROP TABLE "_navigation_v_version_header_items" CASCADE;
  DROP TABLE "_navigation_v" CASCADE;
  DROP TABLE "_homepage_hero_v_version_items" CASCADE;
  DROP TABLE "_homepage_hero_v" CASCADE;
  DROP TABLE "_homepage_sections_v_blocks_rich_text" CASCADE;
  DROP TABLE "_homepage_sections_v_blocks_heading" CASCADE;
  DROP TABLE "_homepage_sections_v_blocks_action_links_items" CASCADE;
  DROP TABLE "_homepage_sections_v_blocks_action_links" CASCADE;
  DROP TABLE "_homepage_sections_v_blocks_card_links" CASCADE;
  DROP TABLE "_homepage_sections_v_blocks_card" CASCADE;
  DROP TABLE "_homepage_sections_v_blocks_listing_items" CASCADE;
  DROP TABLE "_homepage_sections_v_blocks_listing_sources" CASCADE;
  DROP TABLE "_homepage_sections_v_blocks_listing" CASCADE;
  DROP TABLE "_homepage_sections_v_blocks_carousel_items" CASCADE;
  DROP TABLE "_homepage_sections_v_blocks_carousel_sources" CASCADE;
  DROP TABLE "_homepage_sections_v_blocks_carousel" CASCADE;
  DROP TABLE "_homepage_sections_v_blocks_content_calendar_sources" CASCADE;
  DROP TABLE "_homepage_sections_v_blocks_content_calendar" CASCADE;
  DROP TABLE "_homepage_sections_v_blocks_media_gallery_items" CASCADE;
  DROP TABLE "_homepage_sections_v_blocks_media_gallery" CASCADE;
  DROP TABLE "_homepage_sections_v_blocks_attachments_items" CASCADE;
  DROP TABLE "_homepage_sections_v_blocks_attachments" CASCADE;
  DROP TABLE "_homepage_sections_v_blocks_member_profiles_entries" CASCADE;
  DROP TABLE "_homepage_sections_v_blocks_member_profiles" CASCADE;
  DROP TABLE "_homepage_sections_v_blocks_column_layout_columns" CASCADE;
  DROP TABLE "_homepage_sections_v_blocks_column_layout" CASCADE;
  DROP TABLE "_homepage_sections_v_blocks_tabs_header_left_items" CASCADE;
  DROP TABLE "_homepage_sections_v_blocks_tabs_header_right_items" CASCADE;
  DROP TABLE "_homepage_sections_v_blocks_tabs_footer_items" CASCADE;
  DROP TABLE "_homepage_sections_v_blocks_tabs_tabs" CASCADE;
  DROP TABLE "_homepage_sections_v_blocks_tabs" CASCADE;
  DROP TABLE "_homepage_sections_v_blocks_section_group_sections" CASCADE;
  DROP TABLE "_homepage_sections_v_blocks_section_group" CASCADE;
  DROP TABLE "_homepage_sections_v" CASCADE;
  DROP TABLE "_homepage_sections_v_rels" CASCADE;
  DROP TABLE "_footer_v_version_social_items" CASCADE;
  DROP TABLE "_footer_v_version_columns_items" CASCADE;
  DROP TABLE "_footer_v_version_columns" CASCADE;
  DROP TABLE "_footer_v" CASCADE;
  DROP INDEX "site_settings__status_idx";
  DROP INDEX "navigation__status_idx";
  DROP INDEX "homepage_hero__status_idx";
  DROP INDEX "homepage_sections__status_idx";
  DROP INDEX "footer__status_idx";
  ALTER TABLE "pages_blocks_column_layout" ALTER COLUMN "vertical_alignment" DROP DEFAULT;
  ALTER TABLE "pages_blocks_column_layout" ALTER COLUMN "vertical_alignment" SET DATA TYPE "public"."enum_pages_blocks_column_layout_vertical_alignment" USING "vertical_alignment"::text::"public"."enum_pages_blocks_column_layout_vertical_alignment";
  ALTER TABLE "pages_blocks_column_layout" ALTER COLUMN "vertical_alignment" SET DEFAULT 'start';
  ALTER TABLE "pages_blocks_column_layout" ALTER COLUMN "column_separators" DROP DEFAULT;
  ALTER TABLE "pages_blocks_column_layout" ALTER COLUMN "column_separators" SET DATA TYPE "public"."enum_pages_blocks_column_layout_column_separators" USING "column_separators"::text::"public"."enum_pages_blocks_column_layout_column_separators";
  ALTER TABLE "pages_blocks_column_layout" ALTER COLUMN "column_separators" SET DEFAULT 'none';
  ALTER TABLE "pages_blocks_tabs_header_left_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."enum_pages_blocks_tabs_header_left_items_icon_name" USING "icon_name"::text::"public"."enum_pages_blocks_tabs_header_left_items_icon_name";
  ALTER TABLE "pages_blocks_tabs_header_right_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."enum_pages_blocks_tabs_header_right_items_icon_name" USING "icon_name"::text::"public"."enum_pages_blocks_tabs_header_right_items_icon_name";
  ALTER TABLE "_pages_v_blocks_column_layout" ALTER COLUMN "vertical_alignment" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_column_layout" ALTER COLUMN "vertical_alignment" SET DATA TYPE "public"."enum__pages_v_blocks_column_layout_vertical_alignment" USING "vertical_alignment"::text::"public"."enum__pages_v_blocks_column_layout_vertical_alignment";
  ALTER TABLE "_pages_v_blocks_column_layout" ALTER COLUMN "vertical_alignment" SET DEFAULT 'start';
  ALTER TABLE "_pages_v_blocks_column_layout" ALTER COLUMN "column_separators" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_column_layout" ALTER COLUMN "column_separators" SET DATA TYPE "public"."enum__pages_v_blocks_column_layout_column_separators" USING "column_separators"::text::"public"."enum__pages_v_blocks_column_layout_column_separators";
  ALTER TABLE "_pages_v_blocks_column_layout" ALTER COLUMN "column_separators" SET DEFAULT 'none';
  ALTER TABLE "_pages_v_blocks_tabs_header_left_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."enum__pages_v_blocks_tabs_header_left_items_icon_name" USING "icon_name"::text::"public"."enum__pages_v_blocks_tabs_header_left_items_icon_name";
  ALTER TABLE "_pages_v_blocks_tabs_header_right_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."enum__pages_v_blocks_tabs_header_right_items_icon_name" USING "icon_name"::text::"public"."enum__pages_v_blocks_tabs_header_right_items_icon_name";
  ALTER TABLE "posts_blocks_column_layout" ALTER COLUMN "vertical_alignment" DROP DEFAULT;
  ALTER TABLE "posts_blocks_column_layout" ALTER COLUMN "vertical_alignment" SET DATA TYPE "public"."enum_posts_blocks_column_layout_vertical_alignment" USING "vertical_alignment"::text::"public"."enum_posts_blocks_column_layout_vertical_alignment";
  ALTER TABLE "posts_blocks_column_layout" ALTER COLUMN "vertical_alignment" SET DEFAULT 'start';
  ALTER TABLE "posts_blocks_column_layout" ALTER COLUMN "column_separators" DROP DEFAULT;
  ALTER TABLE "posts_blocks_column_layout" ALTER COLUMN "column_separators" SET DATA TYPE "public"."enum_posts_blocks_column_layout_column_separators" USING "column_separators"::text::"public"."enum_posts_blocks_column_layout_column_separators";
  ALTER TABLE "posts_blocks_column_layout" ALTER COLUMN "column_separators" SET DEFAULT 'none';
  ALTER TABLE "posts_blocks_tabs_header_left_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."enum_posts_blocks_tabs_header_left_items_icon_name" USING "icon_name"::text::"public"."enum_posts_blocks_tabs_header_left_items_icon_name";
  ALTER TABLE "posts_blocks_tabs_header_right_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."enum_posts_blocks_tabs_header_right_items_icon_name" USING "icon_name"::text::"public"."enum_posts_blocks_tabs_header_right_items_icon_name";
  ALTER TABLE "_posts_v_blocks_column_layout" ALTER COLUMN "vertical_alignment" DROP DEFAULT;
  ALTER TABLE "_posts_v_blocks_column_layout" ALTER COLUMN "vertical_alignment" SET DATA TYPE "public"."enum__posts_v_blocks_column_layout_vertical_alignment" USING "vertical_alignment"::text::"public"."enum__posts_v_blocks_column_layout_vertical_alignment";
  ALTER TABLE "_posts_v_blocks_column_layout" ALTER COLUMN "vertical_alignment" SET DEFAULT 'start';
  ALTER TABLE "_posts_v_blocks_column_layout" ALTER COLUMN "column_separators" DROP DEFAULT;
  ALTER TABLE "_posts_v_blocks_column_layout" ALTER COLUMN "column_separators" SET DATA TYPE "public"."enum__posts_v_blocks_column_layout_column_separators" USING "column_separators"::text::"public"."enum__posts_v_blocks_column_layout_column_separators";
  ALTER TABLE "_posts_v_blocks_column_layout" ALTER COLUMN "column_separators" SET DEFAULT 'none';
  ALTER TABLE "_posts_v_blocks_tabs_header_left_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."enum__posts_v_blocks_tabs_header_left_items_icon_name" USING "icon_name"::text::"public"."enum__posts_v_blocks_tabs_header_left_items_icon_name";
  ALTER TABLE "_posts_v_blocks_tabs_header_right_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."enum__posts_v_blocks_tabs_header_right_items_icon_name" USING "icon_name"::text::"public"."enum__posts_v_blocks_tabs_header_right_items_icon_name";
  ALTER TABLE "events_blocks_column_layout" ALTER COLUMN "vertical_alignment" DROP DEFAULT;
  ALTER TABLE "events_blocks_column_layout" ALTER COLUMN "vertical_alignment" SET DATA TYPE "public"."enum_events_blocks_column_layout_vertical_alignment" USING "vertical_alignment"::text::"public"."enum_events_blocks_column_layout_vertical_alignment";
  ALTER TABLE "events_blocks_column_layout" ALTER COLUMN "vertical_alignment" SET DEFAULT 'start';
  ALTER TABLE "events_blocks_column_layout" ALTER COLUMN "column_separators" DROP DEFAULT;
  ALTER TABLE "events_blocks_column_layout" ALTER COLUMN "column_separators" SET DATA TYPE "public"."enum_events_blocks_column_layout_column_separators" USING "column_separators"::text::"public"."enum_events_blocks_column_layout_column_separators";
  ALTER TABLE "events_blocks_column_layout" ALTER COLUMN "column_separators" SET DEFAULT 'none';
  ALTER TABLE "events_blocks_tabs_header_left_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."enum_events_blocks_tabs_header_left_items_icon_name" USING "icon_name"::text::"public"."enum_events_blocks_tabs_header_left_items_icon_name";
  ALTER TABLE "events_blocks_tabs_header_right_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."enum_events_blocks_tabs_header_right_items_icon_name" USING "icon_name"::text::"public"."enum_events_blocks_tabs_header_right_items_icon_name";
  ALTER TABLE "_events_v_blocks_column_layout" ALTER COLUMN "vertical_alignment" DROP DEFAULT;
  ALTER TABLE "_events_v_blocks_column_layout" ALTER COLUMN "vertical_alignment" SET DATA TYPE "public"."enum__events_v_blocks_column_layout_vertical_alignment" USING "vertical_alignment"::text::"public"."enum__events_v_blocks_column_layout_vertical_alignment";
  ALTER TABLE "_events_v_blocks_column_layout" ALTER COLUMN "vertical_alignment" SET DEFAULT 'start';
  ALTER TABLE "_events_v_blocks_column_layout" ALTER COLUMN "column_separators" DROP DEFAULT;
  ALTER TABLE "_events_v_blocks_column_layout" ALTER COLUMN "column_separators" SET DATA TYPE "public"."enum__events_v_blocks_column_layout_column_separators" USING "column_separators"::text::"public"."enum__events_v_blocks_column_layout_column_separators";
  ALTER TABLE "_events_v_blocks_column_layout" ALTER COLUMN "column_separators" SET DEFAULT 'none';
  ALTER TABLE "_events_v_blocks_tabs_header_left_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."enum__events_v_blocks_tabs_header_left_items_icon_name" USING "icon_name"::text::"public"."enum__events_v_blocks_tabs_header_left_items_icon_name";
  ALTER TABLE "_events_v_blocks_tabs_header_right_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."enum__events_v_blocks_tabs_header_right_items_icon_name" USING "icon_name"::text::"public"."enum__events_v_blocks_tabs_header_right_items_icon_name";
  ALTER TABLE "event_cycles_blocks_column_layout" ALTER COLUMN "vertical_alignment" DROP DEFAULT;
  ALTER TABLE "event_cycles_blocks_column_layout" ALTER COLUMN "vertical_alignment" SET DATA TYPE "public"."enum_event_cycles_blocks_column_layout_vertical_alignment" USING "vertical_alignment"::text::"public"."enum_event_cycles_blocks_column_layout_vertical_alignment";
  ALTER TABLE "event_cycles_blocks_column_layout" ALTER COLUMN "vertical_alignment" SET DEFAULT 'start';
  ALTER TABLE "event_cycles_blocks_column_layout" ALTER COLUMN "column_separators" DROP DEFAULT;
  ALTER TABLE "event_cycles_blocks_column_layout" ALTER COLUMN "column_separators" SET DATA TYPE "public"."enum_event_cycles_blocks_column_layout_column_separators" USING "column_separators"::text::"public"."enum_event_cycles_blocks_column_layout_column_separators";
  ALTER TABLE "event_cycles_blocks_column_layout" ALTER COLUMN "column_separators" SET DEFAULT 'none';
  ALTER TABLE "event_cycles_blocks_tabs_header_left_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."enum_event_cycles_blocks_tabs_header_left_items_icon_name" USING "icon_name"::text::"public"."enum_event_cycles_blocks_tabs_header_left_items_icon_name";
  ALTER TABLE "event_cycles_blocks_tabs_header_right_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."enum_event_cycles_blocks_tabs_header_right_items_icon_name" USING "icon_name"::text::"public"."enum_event_cycles_blocks_tabs_header_right_items_icon_name";
  ALTER TABLE "_event_cycles_v_blocks_column_layout" ALTER COLUMN "vertical_alignment" DROP DEFAULT;
  ALTER TABLE "_event_cycles_v_blocks_column_layout" ALTER COLUMN "vertical_alignment" SET DATA TYPE "public"."enum__event_cycles_v_blocks_column_layout_vertical_alignment" USING "vertical_alignment"::text::"public"."enum__event_cycles_v_blocks_column_layout_vertical_alignment";
  ALTER TABLE "_event_cycles_v_blocks_column_layout" ALTER COLUMN "vertical_alignment" SET DEFAULT 'start';
  ALTER TABLE "_event_cycles_v_blocks_column_layout" ALTER COLUMN "column_separators" DROP DEFAULT;
  ALTER TABLE "_event_cycles_v_blocks_column_layout" ALTER COLUMN "column_separators" SET DATA TYPE "public"."enum__event_cycles_v_blocks_column_layout_column_separators" USING "column_separators"::text::"public"."enum__event_cycles_v_blocks_column_layout_column_separators";
  ALTER TABLE "_event_cycles_v_blocks_column_layout" ALTER COLUMN "column_separators" SET DEFAULT 'none';
  ALTER TABLE "_event_cycles_v_blocks_tabs_header_left_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."enum__event_cycles_v_blocks_tabs_header_left_items_icon_name" USING "icon_name"::text::"public"."enum__event_cycles_v_blocks_tabs_header_left_items_icon_name";
  ALTER TABLE "_event_cycles_v_blocks_tabs_header_right_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."enum__event_cycles_v_blocks_tabs_header_right_items_icon_name" USING "icon_name"::text::"public"."enum__event_cycles_v_blocks_tabs_header_right_items_icon_name";
  ALTER TABLE "partners_blocks_column_layout" ALTER COLUMN "vertical_alignment" DROP DEFAULT;
  ALTER TABLE "partners_blocks_column_layout" ALTER COLUMN "vertical_alignment" SET DATA TYPE "public"."enum_partners_blocks_column_layout_vertical_alignment" USING "vertical_alignment"::text::"public"."enum_partners_blocks_column_layout_vertical_alignment";
  ALTER TABLE "partners_blocks_column_layout" ALTER COLUMN "vertical_alignment" SET DEFAULT 'start';
  ALTER TABLE "partners_blocks_column_layout" ALTER COLUMN "column_separators" DROP DEFAULT;
  ALTER TABLE "partners_blocks_column_layout" ALTER COLUMN "column_separators" SET DATA TYPE "public"."enum_partners_blocks_column_layout_column_separators" USING "column_separators"::text::"public"."enum_partners_blocks_column_layout_column_separators";
  ALTER TABLE "partners_blocks_column_layout" ALTER COLUMN "column_separators" SET DEFAULT 'none';
  ALTER TABLE "partners_blocks_tabs_header_left_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."enum_partners_blocks_tabs_header_left_items_icon_name" USING "icon_name"::text::"public"."enum_partners_blocks_tabs_header_left_items_icon_name";
  ALTER TABLE "partners_blocks_tabs_header_right_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."enum_partners_blocks_tabs_header_right_items_icon_name" USING "icon_name"::text::"public"."enum_partners_blocks_tabs_header_right_items_icon_name";
  ALTER TABLE "_partners_v_blocks_column_layout" ALTER COLUMN "vertical_alignment" DROP DEFAULT;
  ALTER TABLE "_partners_v_blocks_column_layout" ALTER COLUMN "vertical_alignment" SET DATA TYPE "public"."enum__partners_v_blocks_column_layout_vertical_alignment" USING "vertical_alignment"::text::"public"."enum__partners_v_blocks_column_layout_vertical_alignment";
  ALTER TABLE "_partners_v_blocks_column_layout" ALTER COLUMN "vertical_alignment" SET DEFAULT 'start';
  ALTER TABLE "_partners_v_blocks_column_layout" ALTER COLUMN "column_separators" DROP DEFAULT;
  ALTER TABLE "_partners_v_blocks_column_layout" ALTER COLUMN "column_separators" SET DATA TYPE "public"."enum__partners_v_blocks_column_layout_column_separators" USING "column_separators"::text::"public"."enum__partners_v_blocks_column_layout_column_separators";
  ALTER TABLE "_partners_v_blocks_column_layout" ALTER COLUMN "column_separators" SET DEFAULT 'none';
  ALTER TABLE "_partners_v_blocks_tabs_header_left_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."enum__partners_v_blocks_tabs_header_left_items_icon_name" USING "icon_name"::text::"public"."enum__partners_v_blocks_tabs_header_left_items_icon_name";
  ALTER TABLE "_partners_v_blocks_tabs_header_right_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."enum__partners_v_blocks_tabs_header_right_items_icon_name" USING "icon_name"::text::"public"."enum__partners_v_blocks_tabs_header_right_items_icon_name";
  ALTER TABLE "site_settings" ALTER COLUMN "site_name" SET NOT NULL;
  ALTER TABLE "navigation_header_items" ALTER COLUMN "appearance" SET NOT NULL;
  ALTER TABLE "navigation_header_items" ALTER COLUMN "target_type" SET NOT NULL;
  ALTER TABLE "homepage_hero_items" ALTER COLUMN "appearance" SET NOT NULL;
  ALTER TABLE "homepage_hero_items" ALTER COLUMN "target_type" SET NOT NULL;
  ALTER TABLE "homepage_hero" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "homepage_sections_blocks_rich_text" ALTER COLUMN "content" SET NOT NULL;
  ALTER TABLE "homepage_sections_blocks_heading" ALTER COLUMN "heading_level" SET NOT NULL;
  ALTER TABLE "homepage_sections_blocks_action_links_items" ALTER COLUMN "appearance" SET NOT NULL;
  ALTER TABLE "homepage_sections_blocks_action_links_items" ALTER COLUMN "target_type" SET NOT NULL;
  ALTER TABLE "homepage_sections_blocks_action_links" ALTER COLUMN "layout" SET NOT NULL;
  ALTER TABLE "homepage_sections_blocks_action_links" ALTER COLUMN "alignment" SET NOT NULL;
  ALTER TABLE "homepage_sections_blocks_card_links" ALTER COLUMN "appearance" SET NOT NULL;
  ALTER TABLE "homepage_sections_blocks_card_links" ALTER COLUMN "target_type" SET NOT NULL;
  ALTER TABLE "homepage_sections_blocks_card" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "homepage_sections_blocks_listing" ALTER COLUMN "view" SET NOT NULL;
  ALTER TABLE "homepage_sections_blocks_listing" ALTER COLUMN "selection_mode" SET NOT NULL;
  ALTER TABLE "homepage_sections_blocks_listing" ALTER COLUMN "page_size" SET NOT NULL;
  ALTER TABLE "homepage_sections_blocks_listing" ALTER COLUMN "parent_filter" SET NOT NULL;
  ALTER TABLE "homepage_sections_blocks_carousel" ALTER COLUMN "selection_mode" SET NOT NULL;
  ALTER TABLE "homepage_sections_blocks_carousel" ALTER COLUMN "slide_limit" SET NOT NULL;
  ALTER TABLE "homepage_sections_blocks_carousel" ALTER COLUMN "parent_filter" SET NOT NULL;
  ALTER TABLE "homepage_sections_blocks_media_gallery" ALTER COLUMN "selection_mode" SET NOT NULL;
  ALTER TABLE "homepage_sections_blocks_media_gallery" ALTER COLUMN "view" SET NOT NULL;
  ALTER TABLE "homepage_sections_blocks_media_gallery" ALTER COLUMN "page_size" SET NOT NULL;
  ALTER TABLE "homepage_sections_blocks_attachments" ALTER COLUMN "selection_mode" SET NOT NULL;
  ALTER TABLE "homepage_sections_blocks_attachments" ALTER COLUMN "view" SET NOT NULL;
  ALTER TABLE "homepage_sections_blocks_attachments" ALTER COLUMN "page_size" SET NOT NULL;
  ALTER TABLE "homepage_sections_blocks_member_profiles_entries" ALTER COLUMN "profile_id" SET NOT NULL;
  ALTER TABLE "homepage_sections_blocks_member_profiles" ALTER COLUMN "view" SET NOT NULL;
  ALTER TABLE "homepage_sections_blocks_column_layout_columns" ALTER COLUMN "width" SET NOT NULL;
  ALTER TABLE "homepage_sections_blocks_column_layout" ALTER COLUMN "vertical_alignment" DROP DEFAULT;
  ALTER TABLE "homepage_sections_blocks_column_layout" ALTER COLUMN "vertical_alignment" SET DATA TYPE "public"."enum_homepage_sections_blocks_column_layout_vertical_alignment" USING "vertical_alignment"::text::"public"."enum_homepage_sections_blocks_column_layout_vertical_alignment";
  ALTER TABLE "homepage_sections_blocks_column_layout" ALTER COLUMN "vertical_alignment" SET DEFAULT 'start';
  ALTER TABLE "homepage_sections_blocks_column_layout" ALTER COLUMN "vertical_alignment" SET NOT NULL;
  ALTER TABLE "homepage_sections_blocks_column_layout" ALTER COLUMN "column_separators" DROP DEFAULT;
  ALTER TABLE "homepage_sections_blocks_column_layout" ALTER COLUMN "column_separators" SET DATA TYPE "public"."enum_homepage_sections_blocks_column_layout_column_separators" USING "column_separators"::text::"public"."enum_homepage_sections_blocks_column_layout_column_separators";
  ALTER TABLE "homepage_sections_blocks_column_layout" ALTER COLUMN "column_separators" SET DEFAULT 'none';
  ALTER TABLE "homepage_sections_blocks_column_layout" ALTER COLUMN "column_separators" SET NOT NULL;
  ALTER TABLE "homepage_sections_blocks_tabs_header_left_items" ALTER COLUMN "appearance" SET NOT NULL;
  ALTER TABLE "homepage_sections_blocks_tabs_header_left_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."enum_homepage_sections_blocks_tabs_header_left_items_icon_name" USING "icon_name"::text::"public"."enum_homepage_sections_blocks_tabs_header_left_items_icon_name";
  ALTER TABLE "homepage_sections_blocks_tabs_header_left_items" ALTER COLUMN "target_type" SET NOT NULL;
  ALTER TABLE "homepage_sections_blocks_tabs_header_right_items" ALTER COLUMN "appearance" SET NOT NULL;
  ALTER TABLE "homepage_sections_blocks_tabs_header_right_items" ALTER COLUMN "icon_name" SET DATA TYPE "public"."enum_homepage_sections_blocks_tabs_header_right_items_icon_name" USING "icon_name"::text::"public"."enum_homepage_sections_blocks_tabs_header_right_items_icon_name";
  ALTER TABLE "homepage_sections_blocks_tabs_header_right_items" ALTER COLUMN "target_type" SET NOT NULL;
  ALTER TABLE "homepage_sections_blocks_tabs_footer_items" ALTER COLUMN "appearance" SET NOT NULL;
  ALTER TABLE "homepage_sections_blocks_tabs_footer_items" ALTER COLUMN "target_type" SET NOT NULL;
  ALTER TABLE "homepage_sections_blocks_tabs_tabs" ALTER COLUMN "label" SET NOT NULL;
  ALTER TABLE "footer_social_items" ALTER COLUMN "appearance" SET NOT NULL;
  ALTER TABLE "footer_social_items" ALTER COLUMN "target_type" SET NOT NULL;
  ALTER TABLE "footer_columns_items" ALTER COLUMN "appearance" SET NOT NULL;
  ALTER TABLE "footer_columns_items" ALTER COLUMN "target_type" SET NOT NULL;
  ALTER TABLE "footer_columns" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "footer_columns" ALTER COLUMN "alignment" SET NOT NULL;
  ALTER TABLE "site_settings" DROP COLUMN "_status";
  ALTER TABLE "navigation" DROP COLUMN "_status";
  ALTER TABLE "homepage_hero" DROP COLUMN "_status";
  ALTER TABLE "homepage_sections" DROP COLUMN "_status";
  ALTER TABLE "footer" DROP COLUMN "_status";
  DROP TYPE "public"."column_layout_vertical_alignment";
  DROP TYPE "public"."column_layout_separators";
  DROP TYPE "public"."tab_header_icon_name";
  DROP TYPE "public"."enum_site_settings_status";
  DROP TYPE "public"."enum__site_settings_v_version_status";
  DROP TYPE "public"."enum_navigation_status";
  DROP TYPE "public"."enum__navigation_v_version_header_items_appearance";
  DROP TYPE "public"."enum__navigation_v_version_header_items_icon_name";
  DROP TYPE "public"."enum__navigation_v_version_header_items_target_type";
  DROP TYPE "public"."enum__navigation_v_version_header_items_custom_scheme";
  DROP TYPE "public"."enum__navigation_v_version_status";
  DROP TYPE "public"."enum_homepage_hero_status";
  DROP TYPE "public"."enum__homepage_hero_v_version_items_appearance";
  DROP TYPE "public"."enum__homepage_hero_v_version_items_icon_name";
  DROP TYPE "public"."enum__homepage_hero_v_version_items_target_type";
  DROP TYPE "public"."enum__homepage_hero_v_version_items_custom_scheme";
  DROP TYPE "public"."enum__homepage_hero_v_version_status";
  DROP TYPE "public"."enum_homepage_sections_status";
  DROP TYPE "public"."enum__homepage_sections_v_blocks_rich_text_text_style";
  DROP TYPE "public"."enum__homepage_sections_v_blocks_heading_heading_level";
  DROP TYPE "public"."enum__homepage_sections_v_blocks_heading_heading_icon_name";
  DROP TYPE "public"."enum__homepage_sections_v_blocks_action_links_items_icon_name";
  DROP TYPE "public"."enum__homepage_sections_v_blocks_action_links_layout";
  DROP TYPE "public"."enum__homepage_sections_v_blocks_action_links_alignment";
  DROP TYPE "public"."enum__homepage_sections_v_blocks_card_links_icon_name";
  DROP TYPE "public"."enum__homepage_sections_v_blocks_listing_sources";
  DROP TYPE "public"."enum__homepage_sections_v_blocks_listing_view";
  DROP TYPE "public"."enum__homepage_sections_v_blocks_listing_selection_mode";
  DROP TYPE "public"."enum__homepage_sections_v_blocks_listing_event_time_filter";
  DROP TYPE "public"."enum__homepage_sections_v_blocks_listing_sort";
  DROP TYPE "public"."enum__homepage_sections_v_blocks_listing_parent_filter";
  DROP TYPE "public"."enum__homepage_sections_v_blocks_carousel_sources";
  DROP TYPE "public"."enum__homepage_sections_v_blocks_carousel_selection_mode";
  DROP TYPE "public"."enum__homepage_sections_v_blocks_carousel_event_time_filter";
  DROP TYPE "public"."enum__homepage_sections_v_blocks_carousel_sort";
  DROP TYPE "public"."enum__homepage_sections_v_blocks_carousel_parent_filter";
  DROP TYPE "public"."enum__homepage_sections_v_blocks_content_calendar_sources";
  DROP TYPE "public"."enum__homepage_sections_v_blocks_media_gallery_selection_mode";
  DROP TYPE "public"."enum__homepage_sections_v_blocks_media_gallery_sort";
  DROP TYPE "public"."enum__homepage_sections_v_blocks_media_gallery_view";
  DROP TYPE "public"."enum__homepage_sections_v_blocks_attachments_selection_mode";
  DROP TYPE "public"."enum__homepage_sections_v_blocks_attachments_sort";
  DROP TYPE "public"."enum__homepage_sections_v_blocks_attachments_view";
  DROP TYPE "public"."enum__homepage_sections_v_blocks_member_profiles_view";
  DROP TYPE "public"."enum__homepage_sections_v_blocks_tabs_footer_items_icon_name";
  DROP TYPE "public"."enum__homepage_sections_v_blocks_tabs_footer_alignment";
  DROP TYPE "public"."enum__homepage_sections_v_version_status";
  DROP TYPE "public"."enum_footer_status";
  DROP TYPE "public"."enum__footer_v_version_social_items_appearance";
  DROP TYPE "public"."enum__footer_v_version_social_items_icon_name";
  DROP TYPE "public"."enum__footer_v_version_social_items_target_type";
  DROP TYPE "public"."enum__footer_v_version_social_items_custom_scheme";
  DROP TYPE "public"."enum__footer_v_version_columns_items_appearance";
  DROP TYPE "public"."enum__footer_v_version_columns_items_icon_name";
  DROP TYPE "public"."enum__footer_v_version_columns_items_target_type";
  DROP TYPE "public"."enum__footer_v_version_columns_items_custom_scheme";
  DROP TYPE "public"."enum__footer_v_version_columns_alignment";
  DROP TYPE "public"."enum__footer_v_version_status";`)
}
