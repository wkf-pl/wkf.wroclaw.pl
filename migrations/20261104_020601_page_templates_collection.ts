import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_page_templates_blocks_rich_text_text_style" AS ENUM('default', 'lead', 'note');
  CREATE TYPE "public"."enum_page_templates_blocks_heading_heading_level" AS ENUM('h2', 'h3', 'h4');
  CREATE TYPE "public"."enum_page_templates_blocks_heading_heading_icon_name" AS ENUM('camera', 'astronaut', 'ticket', 'bluesky', 'mace', 'bottle-mana', 'cthulhu', 'time', 'skull', 'dnd5', 'discord', 'document', 'pumpkin-halloween', 'mail', 'facebook', 'guitar', 'globe', 'board-game', 'star', 'instagram', 'calendar', 'hat', 'gun', 'cards', 'playing-cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'water-drop', 'crystal-ball', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'pirate-map', 'vendetta', 'messenger', 'sword', 'potion', 'music', 'image', 'announcement', 'eye', 'partner', 'pdf', 'seal', 'pawn', 'quill', 'flame', 'download', 'review', 'wand', 'sf', 'seance', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'superhero', 'stormtrooper', 'soundtrack', 'tag', 'shield', 'axe', 'twitch', 'shuttle', 'fighter', 'event', 'filled-star', 'youtube', 'scroll');
  CREATE TYPE "public"."enum_page_templates_blocks_action_links_items_icon_name" AS ENUM('camera', 'astronaut', 'ticket', 'bluesky', 'mace', 'bottle-mana', 'cthulhu', 'time', 'skull', 'dnd5', 'discord', 'document', 'pumpkin-halloween', 'mail', 'facebook', 'guitar', 'globe', 'board-game', 'star', 'instagram', 'calendar', 'hat', 'gun', 'cards', 'playing-cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'water-drop', 'crystal-ball', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'pirate-map', 'vendetta', 'messenger', 'sword', 'potion', 'music', 'image', 'announcement', 'eye', 'partner', 'pdf', 'seal', 'pawn', 'quill', 'flame', 'download', 'review', 'wand', 'sf', 'seance', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'superhero', 'stormtrooper', 'soundtrack', 'tag', 'shield', 'axe', 'twitch', 'shuttle', 'fighter', 'event', 'filled-star', 'youtube', 'scroll');
  CREATE TYPE "public"."enum_page_templates_blocks_action_links_layout" AS ENUM('inline', 'stacked');
  CREATE TYPE "public"."enum_page_templates_blocks_action_links_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum_page_templates_blocks_current_item_field_field" AS ENUM('name', 'description', 'hierarchy', 'eventType', 'eventStatus', 'title', 'excerpt', 'eventCycle', 'tags', 'eventTime', 'eventLocation', 'eventAudience', 'eventCapacity', 'eventActions', 'partners', 'organizers', 'website', 'publicName', 'clubFunction', 'about', 'contactChannels');
  CREATE TYPE "public"."enum_page_templates_blocks_current_item_field_variant" AS ENUM('primaryHeading', 'sectionHeading', 'eyebrow', 'lead', 'body', 'compact', 'inline', 'list', 'pills', 'badge', 'emphasizedBadge', 'icon', 'plain');
  CREATE TYPE "public"."enum_page_templates_blocks_card_links_icon_name" AS ENUM('camera', 'astronaut', 'ticket', 'bluesky', 'mace', 'bottle-mana', 'cthulhu', 'time', 'skull', 'dnd5', 'discord', 'document', 'pumpkin-halloween', 'mail', 'facebook', 'guitar', 'globe', 'board-game', 'star', 'instagram', 'calendar', 'hat', 'gun', 'cards', 'playing-cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'water-drop', 'crystal-ball', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'pirate-map', 'vendetta', 'messenger', 'sword', 'potion', 'music', 'image', 'announcement', 'eye', 'partner', 'pdf', 'seal', 'pawn', 'quill', 'flame', 'download', 'review', 'wand', 'sf', 'seance', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'superhero', 'stormtrooper', 'soundtrack', 'tag', 'shield', 'axe', 'twitch', 'shuttle', 'fighter', 'event', 'filled-star', 'youtube', 'scroll');
  CREATE TYPE "public"."enum_page_templates_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents', 'partners', 'member-profiles');
  CREATE TYPE "public"."enum_page_templates_blocks_listing_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'relatedTo', 'significantDate');
  CREATE TYPE "public"."enum_page_templates_blocks_listing_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between');
  CREATE TYPE "public"."enum_page_templates_blocks_listing_view" AS ENUM('tiles', 'cards', 'carousel', 'compact', 'grid');
  CREATE TYPE "public"."enum_page_templates_blocks_listing_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum_page_templates_blocks_listing_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum_page_templates_blocks_content_calendar_sources" AS ENUM('events', 'posts');
  CREATE TYPE "public"."enum_page_templates_blocks_media_gallery_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum_page_templates_blocks_media_gallery_sort" AS ENUM('newest', 'oldest', 'nameAscending', 'nameDescending');
  CREATE TYPE "public"."enum_page_templates_blocks_media_gallery_view" AS ENUM('cards', 'list', 'grid');
  CREATE TYPE "public"."enum_page_templates_blocks_attachments_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum_page_templates_blocks_attachments_sort" AS ENUM('newest', 'oldest', 'nameAscending', 'nameDescending');
  CREATE TYPE "public"."enum_page_templates_blocks_attachments_view" AS ENUM('cards', 'list', 'grid');
  CREATE TYPE "public"."enum_page_templates_blocks_tabs_footer_items_icon_name" AS ENUM('camera', 'astronaut', 'ticket', 'bluesky', 'mace', 'bottle-mana', 'cthulhu', 'time', 'skull', 'dnd5', 'discord', 'document', 'pumpkin-halloween', 'mail', 'facebook', 'guitar', 'globe', 'board-game', 'star', 'instagram', 'calendar', 'hat', 'gun', 'cards', 'playing-cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'water-drop', 'crystal-ball', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'pirate-map', 'vendetta', 'messenger', 'sword', 'potion', 'music', 'image', 'announcement', 'eye', 'partner', 'pdf', 'seal', 'pawn', 'quill', 'flame', 'download', 'review', 'wand', 'sf', 'seance', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'superhero', 'stormtrooper', 'soundtrack', 'tag', 'shield', 'axe', 'twitch', 'shuttle', 'fighter', 'event', 'filled-star', 'youtube', 'scroll');
  CREATE TYPE "public"."enum_page_templates_blocks_tabs_footer_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum_page_templates_template_key" AS ENUM('blog-index', 'events-index', 'members-index', 'tag-detail', 'category-detail', 'event-detail', 'event-cycle-detail', 'partner-detail', 'member-detail');
  CREATE TYPE "public"."enum_page_templates_rendering_mode" AS ENUM('legacy', 'template');
  CREATE TYPE "public"."enum_page_templates_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__page_templates_v_blocks_rich_text_text_style" AS ENUM('default', 'lead', 'note');
  CREATE TYPE "public"."enum__page_templates_v_blocks_heading_heading_level" AS ENUM('h2', 'h3', 'h4');
  CREATE TYPE "public"."enum__page_templates_v_blocks_heading_heading_icon_name" AS ENUM('camera', 'astronaut', 'ticket', 'bluesky', 'mace', 'bottle-mana', 'cthulhu', 'time', 'skull', 'dnd5', 'discord', 'document', 'pumpkin-halloween', 'mail', 'facebook', 'guitar', 'globe', 'board-game', 'star', 'instagram', 'calendar', 'hat', 'gun', 'cards', 'playing-cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'water-drop', 'crystal-ball', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'pirate-map', 'vendetta', 'messenger', 'sword', 'potion', 'music', 'image', 'announcement', 'eye', 'partner', 'pdf', 'seal', 'pawn', 'quill', 'flame', 'download', 'review', 'wand', 'sf', 'seance', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'superhero', 'stormtrooper', 'soundtrack', 'tag', 'shield', 'axe', 'twitch', 'shuttle', 'fighter', 'event', 'filled-star', 'youtube', 'scroll');
  CREATE TYPE "public"."enum__page_templates_v_blocks_action_links_items_icon_name" AS ENUM('camera', 'astronaut', 'ticket', 'bluesky', 'mace', 'bottle-mana', 'cthulhu', 'time', 'skull', 'dnd5', 'discord', 'document', 'pumpkin-halloween', 'mail', 'facebook', 'guitar', 'globe', 'board-game', 'star', 'instagram', 'calendar', 'hat', 'gun', 'cards', 'playing-cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'water-drop', 'crystal-ball', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'pirate-map', 'vendetta', 'messenger', 'sword', 'potion', 'music', 'image', 'announcement', 'eye', 'partner', 'pdf', 'seal', 'pawn', 'quill', 'flame', 'download', 'review', 'wand', 'sf', 'seance', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'superhero', 'stormtrooper', 'soundtrack', 'tag', 'shield', 'axe', 'twitch', 'shuttle', 'fighter', 'event', 'filled-star', 'youtube', 'scroll');
  CREATE TYPE "public"."enum__page_templates_v_blocks_action_links_layout" AS ENUM('inline', 'stacked');
  CREATE TYPE "public"."enum__page_templates_v_blocks_action_links_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum__page_templates_v_blocks_current_item_field_field" AS ENUM('name', 'description', 'hierarchy', 'eventType', 'eventStatus', 'title', 'excerpt', 'eventCycle', 'tags', 'eventTime', 'eventLocation', 'eventAudience', 'eventCapacity', 'eventActions', 'partners', 'organizers', 'website', 'publicName', 'clubFunction', 'about', 'contactChannels');
  CREATE TYPE "public"."enum__page_templates_v_blocks_current_item_field_variant" AS ENUM('primaryHeading', 'sectionHeading', 'eyebrow', 'lead', 'body', 'compact', 'inline', 'list', 'pills', 'badge', 'emphasizedBadge', 'icon', 'plain');
  CREATE TYPE "public"."enum__page_templates_v_blocks_card_links_icon_name" AS ENUM('camera', 'astronaut', 'ticket', 'bluesky', 'mace', 'bottle-mana', 'cthulhu', 'time', 'skull', 'dnd5', 'discord', 'document', 'pumpkin-halloween', 'mail', 'facebook', 'guitar', 'globe', 'board-game', 'star', 'instagram', 'calendar', 'hat', 'gun', 'cards', 'playing-cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'water-drop', 'crystal-ball', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'pirate-map', 'vendetta', 'messenger', 'sword', 'potion', 'music', 'image', 'announcement', 'eye', 'partner', 'pdf', 'seal', 'pawn', 'quill', 'flame', 'download', 'review', 'wand', 'sf', 'seance', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'superhero', 'stormtrooper', 'soundtrack', 'tag', 'shield', 'axe', 'twitch', 'shuttle', 'fighter', 'event', 'filled-star', 'youtube', 'scroll');
  CREATE TYPE "public"."enum__page_templates_v_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles', 'documents', 'partners', 'member-profiles');
  CREATE TYPE "public"."enum__page_templates_v_blocks_listing_conditions_field" AS ENUM('title', 'category', 'tag', 'parentPage', 'eventCycle', 'eventTime', 'relatedTo', 'significantDate');
  CREATE TYPE "public"."enum__page_templates_v_blocks_listing_conditions_operator" AS ENUM('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between');
  CREATE TYPE "public"."enum__page_templates_v_blocks_listing_view" AS ENUM('tiles', 'cards', 'carousel', 'compact', 'grid');
  CREATE TYPE "public"."enum__page_templates_v_blocks_listing_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum__page_templates_v_blocks_listing_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum__page_templates_v_blocks_content_calendar_sources" AS ENUM('events', 'posts');
  CREATE TYPE "public"."enum__page_templates_v_blocks_media_gallery_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum__page_templates_v_blocks_media_gallery_sort" AS ENUM('newest', 'oldest', 'nameAscending', 'nameDescending');
  CREATE TYPE "public"."enum__page_templates_v_blocks_media_gallery_view" AS ENUM('cards', 'list', 'grid');
  CREATE TYPE "public"."enum__page_templates_v_blocks_attachments_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum__page_templates_v_blocks_attachments_sort" AS ENUM('newest', 'oldest', 'nameAscending', 'nameDescending');
  CREATE TYPE "public"."enum__page_templates_v_blocks_attachments_view" AS ENUM('cards', 'list', 'grid');
  CREATE TYPE "public"."enum__page_templates_v_blocks_tabs_footer_items_icon_name" AS ENUM('camera', 'astronaut', 'ticket', 'bluesky', 'mace', 'bottle-mana', 'cthulhu', 'time', 'skull', 'dnd5', 'discord', 'document', 'pumpkin-halloween', 'mail', 'facebook', 'guitar', 'globe', 'board-game', 'star', 'instagram', 'calendar', 'hat', 'gun', 'cards', 'playing-cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'water-drop', 'crystal-ball', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'pirate-map', 'vendetta', 'messenger', 'sword', 'potion', 'music', 'image', 'announcement', 'eye', 'partner', 'pdf', 'seal', 'pawn', 'quill', 'flame', 'download', 'review', 'wand', 'sf', 'seance', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'superhero', 'stormtrooper', 'soundtrack', 'tag', 'shield', 'axe', 'twitch', 'shuttle', 'fighter', 'event', 'filled-star', 'youtube', 'scroll');
  CREATE TYPE "public"."enum__page_templates_v_blocks_tabs_footer_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum__page_templates_v_version_template_key" AS ENUM('blog-index', 'events-index', 'members-index', 'tag-detail', 'category-detail', 'event-detail', 'event-cycle-detail', 'partner-detail', 'member-detail');
  CREATE TYPE "public"."enum__page_templates_v_version_rendering_mode" AS ENUM('legacy', 'template');
  CREATE TYPE "public"."enum__page_templates_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "page_templates_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text_style" "enum_page_templates_blocks_rich_text_text_style" DEFAULT 'default',
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_heading" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"heading_level" "enum_page_templates_blocks_heading_heading_level" DEFAULT 'h2',
  	"heading_icon_name" "enum_page_templates_blocks_heading_heading_icon_name",
  	"icon_inverted" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_action_links_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum_page_templates_blocks_action_links_items_icon_name",
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
  	"open_in_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "page_templates_blocks_action_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"layout" "enum_page_templates_blocks_action_links_layout" DEFAULT 'inline',
  	"alignment" "enum_page_templates_blocks_action_links_alignment" DEFAULT 'start',
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_current_item_field" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field" "enum_page_templates_blocks_current_item_field_field",
  	"variant" "enum_page_templates_blocks_current_item_field_variant",
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_info_columns_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"width" numeric DEFAULT 2,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle'
  );
  
  CREATE TABLE "page_templates_blocks_info_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"vertical_alignment" "column_layout_vertical_alignment" DEFAULT 'start',
  	"column_separators" "column_layout_separators" DEFAULT 'none',
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_info_group_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle'
  );
  
  CREATE TABLE "page_templates_blocks_info_group" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"empty_child_behavior" "empty_child" DEFAULT 'show',
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_card_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum_page_templates_blocks_card_links_icon_name",
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
  	"open_in_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "page_templates_blocks_card" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"destination_page_id" integer,
  	"image_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_listing_sources" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_page_templates_blocks_listing_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "page_templates_blocks_listing_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"context_label" varchar
  );
  
  CREATE TABLE "page_templates_blocks_listing_conditions" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field" "enum_page_templates_blocks_listing_conditions_field",
  	"operator" "enum_page_templates_blocks_listing_conditions_operator",
  	"related_target_mode" "related_mode" DEFAULT 'current',
  	"text_value" varchar,
  	"number_value" numeric,
  	"event_time_value" "event_time",
  	"date_value" varchar,
  	"end_date_value" varchar
  );
  
  CREATE TABLE "page_templates_blocks_listing" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"view" "enum_page_templates_blocks_listing_view" DEFAULT 'cards',
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"selection_mode" "enum_page_templates_blocks_listing_selection_mode" DEFAULT 'filters',
  	"sort" "enum_page_templates_blocks_listing_sort" DEFAULT 'newest',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"hide_when_empty" boolean DEFAULT false,
  	"empty_message" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_content_calendar_sources" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_page_templates_blocks_content_calendar_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "page_templates_blocks_content_calendar" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"category_id" integer,
  	"tag_id" integer,
  	"event_cycle_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_media_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "page_templates_blocks_media_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"selection_mode" "enum_page_templates_blocks_media_gallery_selection_mode" DEFAULT 'filters',
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum_page_templates_blocks_media_gallery_sort" DEFAULT 'newest',
  	"view" "enum_page_templates_blocks_media_gallery_view" DEFAULT 'grid',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_attachments_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "page_templates_blocks_attachments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"selection_mode" "enum_page_templates_blocks_attachments_selection_mode" DEFAULT 'filters',
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum_page_templates_blocks_attachments_sort" DEFAULT 'newest',
  	"view" "enum_page_templates_blocks_attachments_view" DEFAULT 'list',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_current_item_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_column_layout_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"width" numeric DEFAULT 2,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle'
  );
  
  CREATE TABLE "page_templates_blocks_column_layout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"vertical_alignment" "column_layout_vertical_alignment" DEFAULT 'start',
  	"column_separators" "column_layout_separators" DEFAULT 'none',
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_tabs_header_left_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
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
  	"open_in_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "page_templates_blocks_tabs_header_right_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
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
  	"open_in_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "page_templates_blocks_tabs_footer_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum_page_templates_blocks_tabs_footer_items_icon_name",
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
  	"open_in_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "page_templates_blocks_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar
  );
  
  CREATE TABLE "page_templates_blocks_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"footer_alignment" "enum_page_templates_blocks_tabs_footer_alignment" DEFAULT 'center',
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_section_group_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle'
  );
  
  CREATE TABLE "page_templates_blocks_section_group" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"empty_child_behavior" "empty_child" DEFAULT 'show',
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"template_key" "enum_page_templates_template_key",
  	"rendering_mode" "enum_page_templates_rendering_mode" DEFAULT 'legacy',
  	"hero_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_page_templates_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "page_templates_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer,
  	"categories_id" integer,
  	"events_id" integer,
  	"event_cycles_id" integer,
  	"partners_id" integer,
  	"member_profiles_id" integer,
  	"pages_id" integer,
  	"posts_id" integer,
  	"documents_id" integer
  );
  
  CREATE TABLE "_page_templates_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text_style" "enum__page_templates_v_blocks_rich_text_text_style" DEFAULT 'default',
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_page_templates_v_blocks_heading" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"heading_level" "enum__page_templates_v_blocks_heading_heading_level" DEFAULT 'h2',
  	"heading_icon_name" "enum__page_templates_v_blocks_heading_heading_icon_name",
  	"icon_inverted" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_page_templates_v_blocks_action_links_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum__page_templates_v_blocks_action_links_items_icon_name",
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
  
  CREATE TABLE "_page_templates_v_blocks_action_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"layout" "enum__page_templates_v_blocks_action_links_layout" DEFAULT 'inline',
  	"alignment" "enum__page_templates_v_blocks_action_links_alignment" DEFAULT 'start',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_page_templates_v_blocks_current_item_field" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"field" "enum__page_templates_v_blocks_current_item_field_field",
  	"variant" "enum__page_templates_v_blocks_current_item_field_variant",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_page_templates_v_blocks_info_columns_columns" (
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
  
  CREATE TABLE "_page_templates_v_blocks_info_columns" (
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
  
  CREATE TABLE "_page_templates_v_blocks_info_group_sections" (
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
  
  CREATE TABLE "_page_templates_v_blocks_info_group" (
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
  
  CREATE TABLE "_page_templates_v_blocks_card_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum__page_templates_v_blocks_card_links_icon_name",
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
  
  CREATE TABLE "_page_templates_v_blocks_card" (
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
  
  CREATE TABLE "_page_templates_v_blocks_listing_sources" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__page_templates_v_blocks_listing_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_page_templates_v_blocks_listing_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"context_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_page_templates_v_blocks_listing_conditions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"field" "enum__page_templates_v_blocks_listing_conditions_field",
  	"operator" "enum__page_templates_v_blocks_listing_conditions_operator",
  	"related_target_mode" "related_mode" DEFAULT 'current',
  	"text_value" varchar,
  	"number_value" numeric,
  	"event_time_value" "event_time",
  	"date_value" varchar,
  	"end_date_value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_page_templates_v_blocks_listing" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"view" "enum__page_templates_v_blocks_listing_view" DEFAULT 'cards',
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"selection_mode" "enum__page_templates_v_blocks_listing_selection_mode" DEFAULT 'filters',
  	"sort" "enum__page_templates_v_blocks_listing_sort" DEFAULT 'newest',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"hide_when_empty" boolean DEFAULT false,
  	"empty_message" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_page_templates_v_blocks_content_calendar_sources" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__page_templates_v_blocks_content_calendar_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_page_templates_v_blocks_content_calendar" (
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
  
  CREATE TABLE "_page_templates_v_blocks_media_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_page_templates_v_blocks_media_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"selection_mode" "enum__page_templates_v_blocks_media_gallery_selection_mode" DEFAULT 'filters',
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum__page_templates_v_blocks_media_gallery_sort" DEFAULT 'newest',
  	"view" "enum__page_templates_v_blocks_media_gallery_view" DEFAULT 'grid',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_page_templates_v_blocks_attachments_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_page_templates_v_blocks_attachments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"selection_mode" "enum__page_templates_v_blocks_attachments_selection_mode" DEFAULT 'filters',
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum__page_templates_v_blocks_attachments_sort" DEFAULT 'newest',
  	"view" "enum__page_templates_v_blocks_attachments_view" DEFAULT 'list',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_page_templates_v_blocks_current_item_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_page_templates_v_blocks_column_layout_columns" (
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
  
  CREATE TABLE "_page_templates_v_blocks_column_layout" (
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
  
  CREATE TABLE "_page_templates_v_blocks_tabs_header_left_items" (
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
  
  CREATE TABLE "_page_templates_v_blocks_tabs_header_right_items" (
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
  
  CREATE TABLE "_page_templates_v_blocks_tabs_footer_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum__page_templates_v_blocks_tabs_footer_items_icon_name",
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
  
  CREATE TABLE "_page_templates_v_blocks_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_page_templates_v_blocks_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"footer_alignment" "enum__page_templates_v_blocks_tabs_footer_alignment" DEFAULT 'center',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_page_templates_v_blocks_section_group_sections" (
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
  
  CREATE TABLE "_page_templates_v_blocks_section_group" (
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
  
  CREATE TABLE "_page_templates_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_template_key" "enum__page_templates_v_version_template_key",
  	"version_rendering_mode" "enum__page_templates_v_version_rendering_mode" DEFAULT 'legacy',
  	"version_hero_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__page_templates_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_page_templates_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer,
  	"categories_id" integer,
  	"events_id" integer,
  	"event_cycles_id" integer,
  	"partners_id" integer,
  	"member_profiles_id" integer,
  	"pages_id" integer,
  	"posts_id" integer,
  	"documents_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "page_templates_id" integer;
  ALTER TABLE "page_templates_blocks_rich_text" ADD CONSTRAINT "page_templates_blocks_rich_text_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_rich_text" ADD CONSTRAINT "page_templates_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_heading" ADD CONSTRAINT "page_templates_blocks_heading_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_action_links_items" ADD CONSTRAINT "page_templates_blocks_action_links_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_action_links_items" ADD CONSTRAINT "page_templates_blocks_action_links_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_action_links_items" ADD CONSTRAINT "page_templates_blocks_action_links_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_action_links_items" ADD CONSTRAINT "page_templates_blocks_action_links_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_action_links_items" ADD CONSTRAINT "page_templates_blocks_action_links_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_action_links_items" ADD CONSTRAINT "page_templates_blocks_action_links_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_action_links_items" ADD CONSTRAINT "page_templates_blocks_action_links_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_action_links_items" ADD CONSTRAINT "page_templates_blocks_action_links_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_action_links_items" ADD CONSTRAINT "page_templates_blocks_action_links_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates_blocks_action_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_action_links" ADD CONSTRAINT "page_templates_blocks_action_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_current_item_field" ADD CONSTRAINT "page_templates_blocks_current_item_field_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_info_columns_columns" ADD CONSTRAINT "page_templates_blocks_info_columns_columns_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_info_columns_columns" ADD CONSTRAINT "page_templates_blocks_info_columns_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates_blocks_info_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_info_columns" ADD CONSTRAINT "page_templates_blocks_info_columns_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_info_columns" ADD CONSTRAINT "page_templates_blocks_info_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_info_group_sections" ADD CONSTRAINT "page_templates_blocks_info_group_sections_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_info_group_sections" ADD CONSTRAINT "page_templates_blocks_info_group_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates_blocks_info_group"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_info_group" ADD CONSTRAINT "page_templates_blocks_info_group_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_info_group" ADD CONSTRAINT "page_templates_blocks_info_group_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_card_links" ADD CONSTRAINT "page_templates_blocks_card_links_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_card_links" ADD CONSTRAINT "page_templates_blocks_card_links_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_card_links" ADD CONSTRAINT "page_templates_blocks_card_links_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_card_links" ADD CONSTRAINT "page_templates_blocks_card_links_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_card_links" ADD CONSTRAINT "page_templates_blocks_card_links_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_card_links" ADD CONSTRAINT "page_templates_blocks_card_links_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_card_links" ADD CONSTRAINT "page_templates_blocks_card_links_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_card_links" ADD CONSTRAINT "page_templates_blocks_card_links_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_card_links" ADD CONSTRAINT "page_templates_blocks_card_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates_blocks_card"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_card" ADD CONSTRAINT "page_templates_blocks_card_destination_page_id_pages_id_fk" FOREIGN KEY ("destination_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_card" ADD CONSTRAINT "page_templates_blocks_card_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_card" ADD CONSTRAINT "page_templates_blocks_card_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_listing_sources" ADD CONSTRAINT "page_templates_blocks_listing_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."page_templates_blocks_listing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_listing_items" ADD CONSTRAINT "page_templates_blocks_listing_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates_blocks_listing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_listing_conditions" ADD CONSTRAINT "page_templates_blocks_listing_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates_blocks_listing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_listing" ADD CONSTRAINT "page_templates_blocks_listing_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_listing" ADD CONSTRAINT "page_templates_blocks_listing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_content_calendar_sources" ADD CONSTRAINT "page_templates_blocks_content_calendar_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."page_templates_blocks_content_calendar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_content_calendar" ADD CONSTRAINT "page_templates_blocks_content_calendar_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_content_calendar" ADD CONSTRAINT "page_templates_blocks_content_calendar_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_content_calendar" ADD CONSTRAINT "page_templates_blocks_content_calendar_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_content_calendar" ADD CONSTRAINT "page_templates_blocks_content_calendar_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_content_calendar" ADD CONSTRAINT "page_templates_blocks_content_calendar_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_media_gallery_items" ADD CONSTRAINT "page_templates_blocks_media_gallery_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_media_gallery_items" ADD CONSTRAINT "page_templates_blocks_media_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates_blocks_media_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_media_gallery" ADD CONSTRAINT "page_templates_blocks_media_gallery_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_media_gallery" ADD CONSTRAINT "page_templates_blocks_media_gallery_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_media_gallery" ADD CONSTRAINT "page_templates_blocks_media_gallery_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_media_gallery" ADD CONSTRAINT "page_templates_blocks_media_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_attachments_items" ADD CONSTRAINT "page_templates_blocks_attachments_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_attachments_items" ADD CONSTRAINT "page_templates_blocks_attachments_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates_blocks_attachments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_attachments" ADD CONSTRAINT "page_templates_blocks_attachments_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_attachments" ADD CONSTRAINT "page_templates_blocks_attachments_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_attachments" ADD CONSTRAINT "page_templates_blocks_attachments_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_attachments" ADD CONSTRAINT "page_templates_blocks_attachments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_current_item_content" ADD CONSTRAINT "page_templates_blocks_current_item_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_column_layout_columns" ADD CONSTRAINT "page_templates_blocks_column_layout_columns_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_column_layout_columns" ADD CONSTRAINT "page_templates_blocks_column_layout_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates_blocks_column_layout"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_column_layout" ADD CONSTRAINT "page_templates_blocks_column_layout_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_column_layout" ADD CONSTRAINT "page_templates_blocks_column_layout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_tabs_header_left_items" ADD CONSTRAINT "page_templates_blocks_tabs_header_left_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_tabs_header_left_items" ADD CONSTRAINT "page_templates_blocks_tabs_header_left_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_tabs_header_left_items" ADD CONSTRAINT "page_templates_blocks_tabs_header_left_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_tabs_header_left_items" ADD CONSTRAINT "page_templates_blocks_tabs_header_left_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_tabs_header_left_items" ADD CONSTRAINT "page_templates_blocks_tabs_header_left_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_tabs_header_left_items" ADD CONSTRAINT "page_templates_blocks_tabs_header_left_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_tabs_header_left_items" ADD CONSTRAINT "page_templates_blocks_tabs_header_left_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_tabs_header_left_items" ADD CONSTRAINT "page_templates_blocks_tabs_header_left_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_tabs_header_left_items" ADD CONSTRAINT "page_templates_blocks_tabs_header_left_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_tabs_header_right_items" ADD CONSTRAINT "page_templates_blocks_tabs_header_right_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_tabs_header_right_items" ADD CONSTRAINT "page_templates_blocks_tabs_header_right_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_tabs_header_right_items" ADD CONSTRAINT "page_templates_blocks_tabs_header_right_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_tabs_header_right_items" ADD CONSTRAINT "page_templates_blocks_tabs_header_right_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_tabs_header_right_items" ADD CONSTRAINT "page_templates_blocks_tabs_header_right_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_tabs_header_right_items" ADD CONSTRAINT "page_templates_blocks_tabs_header_right_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_tabs_header_right_items" ADD CONSTRAINT "page_templates_blocks_tabs_header_right_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_tabs_header_right_items" ADD CONSTRAINT "page_templates_blocks_tabs_header_right_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_tabs_header_right_items" ADD CONSTRAINT "page_templates_blocks_tabs_header_right_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_tabs_footer_items" ADD CONSTRAINT "page_templates_blocks_tabs_footer_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_tabs_footer_items" ADD CONSTRAINT "page_templates_blocks_tabs_footer_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_tabs_footer_items" ADD CONSTRAINT "page_templates_blocks_tabs_footer_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_tabs_footer_items" ADD CONSTRAINT "page_templates_blocks_tabs_footer_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_tabs_footer_items" ADD CONSTRAINT "page_templates_blocks_tabs_footer_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_tabs_footer_items" ADD CONSTRAINT "page_templates_blocks_tabs_footer_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_tabs_footer_items" ADD CONSTRAINT "page_templates_blocks_tabs_footer_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_tabs_footer_items" ADD CONSTRAINT "page_templates_blocks_tabs_footer_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_tabs_footer_items" ADD CONSTRAINT "page_templates_blocks_tabs_footer_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_tabs_tabs" ADD CONSTRAINT "page_templates_blocks_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_tabs" ADD CONSTRAINT "page_templates_blocks_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_section_group_sections" ADD CONSTRAINT "page_templates_blocks_section_group_sections_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_section_group_sections" ADD CONSTRAINT "page_templates_blocks_section_group_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates_blocks_section_group"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_section_group" ADD CONSTRAINT "page_templates_blocks_section_group_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_section_group" ADD CONSTRAINT "page_templates_blocks_section_group_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates" ADD CONSTRAINT "page_templates_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_rels" ADD CONSTRAINT "page_templates_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_rels" ADD CONSTRAINT "page_templates_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_rels" ADD CONSTRAINT "page_templates_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_rels" ADD CONSTRAINT "page_templates_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_rels" ADD CONSTRAINT "page_templates_rels_event_cycles_fk" FOREIGN KEY ("event_cycles_id") REFERENCES "public"."event_cycles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_rels" ADD CONSTRAINT "page_templates_rels_partners_fk" FOREIGN KEY ("partners_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_rels" ADD CONSTRAINT "page_templates_rels_member_profiles_fk" FOREIGN KEY ("member_profiles_id") REFERENCES "public"."member_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_rels" ADD CONSTRAINT "page_templates_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_rels" ADD CONSTRAINT "page_templates_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_rels" ADD CONSTRAINT "page_templates_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_rich_text" ADD CONSTRAINT "_page_templates_v_blocks_rich_text_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_rich_text" ADD CONSTRAINT "_page_templates_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_templates_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_heading" ADD CONSTRAINT "_page_templates_v_blocks_heading_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_templates_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_action_links_items" ADD CONSTRAINT "_page_templates_v_blocks_action_links_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_action_links_items" ADD CONSTRAINT "_page_templates_v_blocks_action_links_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_action_links_items" ADD CONSTRAINT "_page_templates_v_blocks_action_links_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_action_links_items" ADD CONSTRAINT "_page_templates_v_blocks_action_links_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_action_links_items" ADD CONSTRAINT "_page_templates_v_blocks_action_links_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_action_links_items" ADD CONSTRAINT "_page_templates_v_blocks_action_links_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_action_links_items" ADD CONSTRAINT "_page_templates_v_blocks_action_links_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_action_links_items" ADD CONSTRAINT "_page_templates_v_blocks_action_links_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_action_links_items" ADD CONSTRAINT "_page_templates_v_blocks_action_links_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_templates_v_blocks_action_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_action_links" ADD CONSTRAINT "_page_templates_v_blocks_action_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_templates_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_current_item_field" ADD CONSTRAINT "_page_templates_v_blocks_current_item_field_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_templates_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_info_columns_columns" ADD CONSTRAINT "_page_templates_v_blocks_info_columns_columns_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_info_columns_columns" ADD CONSTRAINT "_page_templates_v_blocks_info_columns_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_templates_v_blocks_info_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_info_columns" ADD CONSTRAINT "_page_templates_v_blocks_info_columns_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_info_columns" ADD CONSTRAINT "_page_templates_v_blocks_info_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_templates_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_info_group_sections" ADD CONSTRAINT "_page_templates_v_blocks_info_group_sections_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_info_group_sections" ADD CONSTRAINT "_page_templates_v_blocks_info_group_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_templates_v_blocks_info_group"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_info_group" ADD CONSTRAINT "_page_templates_v_blocks_info_group_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_info_group" ADD CONSTRAINT "_page_templates_v_blocks_info_group_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_templates_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_card_links" ADD CONSTRAINT "_page_templates_v_blocks_card_links_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_card_links" ADD CONSTRAINT "_page_templates_v_blocks_card_links_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_card_links" ADD CONSTRAINT "_page_templates_v_blocks_card_links_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_card_links" ADD CONSTRAINT "_page_templates_v_blocks_card_links_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_card_links" ADD CONSTRAINT "_page_templates_v_blocks_card_links_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_card_links" ADD CONSTRAINT "_page_templates_v_blocks_card_links_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_card_links" ADD CONSTRAINT "_page_templates_v_blocks_card_links_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_card_links" ADD CONSTRAINT "_page_templates_v_blocks_card_links_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_card_links" ADD CONSTRAINT "_page_templates_v_blocks_card_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_templates_v_blocks_card"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_card" ADD CONSTRAINT "_page_templates_v_blocks_card_destination_page_id_pages_id_fk" FOREIGN KEY ("destination_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_card" ADD CONSTRAINT "_page_templates_v_blocks_card_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_card" ADD CONSTRAINT "_page_templates_v_blocks_card_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_templates_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_listing_sources" ADD CONSTRAINT "_page_templates_v_blocks_listing_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_page_templates_v_blocks_listing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_listing_items" ADD CONSTRAINT "_page_templates_v_blocks_listing_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_templates_v_blocks_listing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_listing_conditions" ADD CONSTRAINT "_page_templates_v_blocks_listing_conditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_templates_v_blocks_listing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_listing" ADD CONSTRAINT "_page_templates_v_blocks_listing_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_listing" ADD CONSTRAINT "_page_templates_v_blocks_listing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_templates_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_content_calendar_sources" ADD CONSTRAINT "_page_templates_v_blocks_content_calendar_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_page_templates_v_blocks_content_calendar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_content_calendar" ADD CONSTRAINT "_page_templates_v_blocks_content_calendar_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_content_calendar" ADD CONSTRAINT "_page_templates_v_blocks_content_calendar_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_content_calendar" ADD CONSTRAINT "_page_templates_v_blocks_content_calendar_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_content_calendar" ADD CONSTRAINT "_page_templates_v_blocks_content_calendar_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_content_calendar" ADD CONSTRAINT "_page_templates_v_blocks_content_calendar_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_templates_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_media_gallery_items" ADD CONSTRAINT "_page_templates_v_blocks_media_gallery_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_media_gallery_items" ADD CONSTRAINT "_page_templates_v_blocks_media_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_templates_v_blocks_media_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_media_gallery" ADD CONSTRAINT "_page_templates_v_blocks_media_gallery_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_media_gallery" ADD CONSTRAINT "_page_templates_v_blocks_media_gallery_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_media_gallery" ADD CONSTRAINT "_page_templates_v_blocks_media_gallery_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_media_gallery" ADD CONSTRAINT "_page_templates_v_blocks_media_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_templates_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_attachments_items" ADD CONSTRAINT "_page_templates_v_blocks_attachments_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_attachments_items" ADD CONSTRAINT "_page_templates_v_blocks_attachments_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_templates_v_blocks_attachments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_attachments" ADD CONSTRAINT "_page_templates_v_blocks_attachments_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_attachments" ADD CONSTRAINT "_page_templates_v_blocks_attachments_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_attachments" ADD CONSTRAINT "_page_templates_v_blocks_attachments_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_attachments" ADD CONSTRAINT "_page_templates_v_blocks_attachments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_templates_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_current_item_content" ADD CONSTRAINT "_page_templates_v_blocks_current_item_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_templates_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_column_layout_columns" ADD CONSTRAINT "_page_templates_v_blocks_column_layout_columns_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_column_layout_columns" ADD CONSTRAINT "_page_templates_v_blocks_column_layout_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_templates_v_blocks_column_layout"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_column_layout" ADD CONSTRAINT "_page_templates_v_blocks_column_layout_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_column_layout" ADD CONSTRAINT "_page_templates_v_blocks_column_layout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_templates_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_page_templates_v_blocks_tabs_header_left_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_page_templates_v_blocks_tabs_header_left_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_page_templates_v_blocks_tabs_header_left_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_page_templates_v_blocks_tabs_header_left_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_page_templates_v_blocks_tabs_header_left_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_page_templates_v_blocks_tabs_header_left_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_page_templates_v_blocks_tabs_header_left_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_page_templates_v_blocks_tabs_header_left_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_page_templates_v_blocks_tabs_header_left_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_templates_v_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_page_templates_v_blocks_tabs_header_right_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_page_templates_v_blocks_tabs_header_right_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_page_templates_v_blocks_tabs_header_right_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_page_templates_v_blocks_tabs_header_right_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_page_templates_v_blocks_tabs_header_right_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_page_templates_v_blocks_tabs_header_right_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_page_templates_v_blocks_tabs_header_right_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_page_templates_v_blocks_tabs_header_right_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_page_templates_v_blocks_tabs_header_right_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_templates_v_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_tabs_footer_items" ADD CONSTRAINT "_page_templates_v_blocks_tabs_footer_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_tabs_footer_items" ADD CONSTRAINT "_page_templates_v_blocks_tabs_footer_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_tabs_footer_items" ADD CONSTRAINT "_page_templates_v_blocks_tabs_footer_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_tabs_footer_items" ADD CONSTRAINT "_page_templates_v_blocks_tabs_footer_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_tabs_footer_items" ADD CONSTRAINT "_page_templates_v_blocks_tabs_footer_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_tabs_footer_items" ADD CONSTRAINT "_page_templates_v_blocks_tabs_footer_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_tabs_footer_items" ADD CONSTRAINT "_page_templates_v_blocks_tabs_footer_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_tabs_footer_items" ADD CONSTRAINT "_page_templates_v_blocks_tabs_footer_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_tabs_footer_items" ADD CONSTRAINT "_page_templates_v_blocks_tabs_footer_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_templates_v_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_tabs_tabs" ADD CONSTRAINT "_page_templates_v_blocks_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_templates_v_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_tabs" ADD CONSTRAINT "_page_templates_v_blocks_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_templates_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_section_group_sections" ADD CONSTRAINT "_page_templates_v_blocks_section_group_sections_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_section_group_sections" ADD CONSTRAINT "_page_templates_v_blocks_section_group_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_templates_v_blocks_section_group"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_section_group" ADD CONSTRAINT "_page_templates_v_blocks_section_group_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_section_group" ADD CONSTRAINT "_page_templates_v_blocks_section_group_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_templates_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_v" ADD CONSTRAINT "_page_templates_v_parent_id_page_templates_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."page_templates"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v" ADD CONSTRAINT "_page_templates_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v_rels" ADD CONSTRAINT "_page_templates_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_page_templates_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_v_rels" ADD CONSTRAINT "_page_templates_v_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_v_rels" ADD CONSTRAINT "_page_templates_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_v_rels" ADD CONSTRAINT "_page_templates_v_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_v_rels" ADD CONSTRAINT "_page_templates_v_rels_event_cycles_fk" FOREIGN KEY ("event_cycles_id") REFERENCES "public"."event_cycles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_v_rels" ADD CONSTRAINT "_page_templates_v_rels_partners_fk" FOREIGN KEY ("partners_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_v_rels" ADD CONSTRAINT "_page_templates_v_rels_member_profiles_fk" FOREIGN KEY ("member_profiles_id") REFERENCES "public"."member_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_v_rels" ADD CONSTRAINT "_page_templates_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_v_rels" ADD CONSTRAINT "_page_templates_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_v_rels" ADD CONSTRAINT "_page_templates_v_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "page_templates_blocks_rich_text_order_idx" ON "page_templates_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_rich_text_parent_id_idx" ON "page_templates_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_rich_text_path_idx" ON "page_templates_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_rich_text_surface_image_idx" ON "page_templates_blocks_rich_text" USING btree ("surface_image_id");
  CREATE INDEX "page_templates_blocks_heading_order_idx" ON "page_templates_blocks_heading" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_heading_parent_id_idx" ON "page_templates_blocks_heading" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_heading_path_idx" ON "page_templates_blocks_heading" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_action_links_items_order_idx" ON "page_templates_blocks_action_links_items" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_action_links_items_parent_id_idx" ON "page_templates_blocks_action_links_items" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_action_links_items_event_cycle_idx" ON "page_templates_blocks_action_links_items" USING btree ("event_cycle_id");
  CREATE INDEX "page_templates_blocks_action_links_items_document_idx" ON "page_templates_blocks_action_links_items" USING btree ("document_id");
  CREATE INDEX "page_templates_blocks_action_links_items_category_idx" ON "page_templates_blocks_action_links_items" USING btree ("category_id");
  CREATE INDEX "page_templates_blocks_action_links_items_partner_idx" ON "page_templates_blocks_action_links_items" USING btree ("partner_id");
  CREATE INDEX "page_templates_blocks_action_links_items_page_idx" ON "page_templates_blocks_action_links_items" USING btree ("page_id");
  CREATE INDEX "page_templates_blocks_action_links_items_tag_idx" ON "page_templates_blocks_action_links_items" USING btree ("tag_id");
  CREATE INDEX "page_templates_blocks_action_links_items_post_idx" ON "page_templates_blocks_action_links_items" USING btree ("post_id");
  CREATE INDEX "page_templates_blocks_action_links_items_event_idx" ON "page_templates_blocks_action_links_items" USING btree ("event_id");
  CREATE INDEX "page_templates_blocks_action_links_order_idx" ON "page_templates_blocks_action_links" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_action_links_parent_id_idx" ON "page_templates_blocks_action_links" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_action_links_path_idx" ON "page_templates_blocks_action_links" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_current_item_field_order_idx" ON "page_templates_blocks_current_item_field" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_current_item_field_parent_id_idx" ON "page_templates_blocks_current_item_field" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_current_item_field_path_idx" ON "page_templates_blocks_current_item_field" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_info_columns_columns_order_idx" ON "page_templates_blocks_info_columns_columns" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_info_columns_columns_parent_id_idx" ON "page_templates_blocks_info_columns_columns" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_info_columns_columns_surface_image_idx" ON "page_templates_blocks_info_columns_columns" USING btree ("surface_image_id");
  CREATE INDEX "page_templates_blocks_info_columns_order_idx" ON "page_templates_blocks_info_columns" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_info_columns_parent_id_idx" ON "page_templates_blocks_info_columns" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_info_columns_path_idx" ON "page_templates_blocks_info_columns" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_info_columns_surface_image_idx" ON "page_templates_blocks_info_columns" USING btree ("surface_image_id");
  CREATE INDEX "page_templates_blocks_info_group_sections_order_idx" ON "page_templates_blocks_info_group_sections" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_info_group_sections_parent_id_idx" ON "page_templates_blocks_info_group_sections" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_info_group_sections_surface_image_idx" ON "page_templates_blocks_info_group_sections" USING btree ("surface_image_id");
  CREATE INDEX "page_templates_blocks_info_group_order_idx" ON "page_templates_blocks_info_group" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_info_group_parent_id_idx" ON "page_templates_blocks_info_group" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_info_group_path_idx" ON "page_templates_blocks_info_group" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_info_group_surface_image_idx" ON "page_templates_blocks_info_group" USING btree ("surface_image_id");
  CREATE INDEX "page_templates_blocks_card_links_order_idx" ON "page_templates_blocks_card_links" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_card_links_parent_id_idx" ON "page_templates_blocks_card_links" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_card_links_event_cycle_idx" ON "page_templates_blocks_card_links" USING btree ("event_cycle_id");
  CREATE INDEX "page_templates_blocks_card_links_document_idx" ON "page_templates_blocks_card_links" USING btree ("document_id");
  CREATE INDEX "page_templates_blocks_card_links_category_idx" ON "page_templates_blocks_card_links" USING btree ("category_id");
  CREATE INDEX "page_templates_blocks_card_links_partner_idx" ON "page_templates_blocks_card_links" USING btree ("partner_id");
  CREATE INDEX "page_templates_blocks_card_links_page_idx" ON "page_templates_blocks_card_links" USING btree ("page_id");
  CREATE INDEX "page_templates_blocks_card_links_tag_idx" ON "page_templates_blocks_card_links" USING btree ("tag_id");
  CREATE INDEX "page_templates_blocks_card_links_post_idx" ON "page_templates_blocks_card_links" USING btree ("post_id");
  CREATE INDEX "page_templates_blocks_card_links_event_idx" ON "page_templates_blocks_card_links" USING btree ("event_id");
  CREATE INDEX "page_templates_blocks_card_order_idx" ON "page_templates_blocks_card" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_card_parent_id_idx" ON "page_templates_blocks_card" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_card_path_idx" ON "page_templates_blocks_card" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_card_destination_page_idx" ON "page_templates_blocks_card" USING btree ("destination_page_id");
  CREATE INDEX "page_templates_blocks_card_image_idx" ON "page_templates_blocks_card" USING btree ("image_id");
  CREATE INDEX "page_templates_blocks_listing_sources_order_idx" ON "page_templates_blocks_listing_sources" USING btree ("order");
  CREATE INDEX "page_templates_blocks_listing_sources_parent_idx" ON "page_templates_blocks_listing_sources" USING btree ("parent_id");
  CREATE INDEX "page_templates_blocks_listing_items_order_idx" ON "page_templates_blocks_listing_items" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_listing_items_parent_id_idx" ON "page_templates_blocks_listing_items" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_listing_conditions_order_idx" ON "page_templates_blocks_listing_conditions" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_listing_conditions_parent_id_idx" ON "page_templates_blocks_listing_conditions" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_listing_order_idx" ON "page_templates_blocks_listing" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_listing_parent_id_idx" ON "page_templates_blocks_listing" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_listing_path_idx" ON "page_templates_blocks_listing" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_listing_surface_image_idx" ON "page_templates_blocks_listing" USING btree ("surface_image_id");
  CREATE INDEX "page_templates_blocks_content_calendar_sources_order_idx" ON "page_templates_blocks_content_calendar_sources" USING btree ("order");
  CREATE INDEX "page_templates_blocks_content_calendar_sources_parent_idx" ON "page_templates_blocks_content_calendar_sources" USING btree ("parent_id");
  CREATE INDEX "page_templates_blocks_content_calendar_order_idx" ON "page_templates_blocks_content_calendar" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_content_calendar_parent_id_idx" ON "page_templates_blocks_content_calendar" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_content_calendar_path_idx" ON "page_templates_blocks_content_calendar" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_content_calendar_surface_image_idx" ON "page_templates_blocks_content_calendar" USING btree ("surface_image_id");
  CREATE INDEX "page_templates_blocks_content_calendar_category_idx" ON "page_templates_blocks_content_calendar" USING btree ("category_id");
  CREATE INDEX "page_templates_blocks_content_calendar_tag_idx" ON "page_templates_blocks_content_calendar" USING btree ("tag_id");
  CREATE INDEX "page_templates_blocks_content_calendar_event_cycle_idx" ON "page_templates_blocks_content_calendar" USING btree ("event_cycle_id");
  CREATE INDEX "page_templates_blocks_media_gallery_items_order_idx" ON "page_templates_blocks_media_gallery_items" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_media_gallery_items_parent_id_idx" ON "page_templates_blocks_media_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_media_gallery_items_media_idx" ON "page_templates_blocks_media_gallery_items" USING btree ("media_id");
  CREATE INDEX "page_templates_blocks_media_gallery_order_idx" ON "page_templates_blocks_media_gallery" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_media_gallery_parent_id_idx" ON "page_templates_blocks_media_gallery" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_media_gallery_path_idx" ON "page_templates_blocks_media_gallery" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_media_gallery_surface_image_idx" ON "page_templates_blocks_media_gallery" USING btree ("surface_image_id");
  CREATE INDEX "page_templates_blocks_media_gallery_category_idx" ON "page_templates_blocks_media_gallery" USING btree ("category_id");
  CREATE INDEX "page_templates_blocks_media_gallery_tag_idx" ON "page_templates_blocks_media_gallery" USING btree ("tag_id");
  CREATE INDEX "page_templates_blocks_attachments_items_order_idx" ON "page_templates_blocks_attachments_items" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_attachments_items_parent_id_idx" ON "page_templates_blocks_attachments_items" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_attachments_items_media_idx" ON "page_templates_blocks_attachments_items" USING btree ("media_id");
  CREATE INDEX "page_templates_blocks_attachments_order_idx" ON "page_templates_blocks_attachments" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_attachments_parent_id_idx" ON "page_templates_blocks_attachments" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_attachments_path_idx" ON "page_templates_blocks_attachments" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_attachments_surface_image_idx" ON "page_templates_blocks_attachments" USING btree ("surface_image_id");
  CREATE INDEX "page_templates_blocks_attachments_category_idx" ON "page_templates_blocks_attachments" USING btree ("category_id");
  CREATE INDEX "page_templates_blocks_attachments_tag_idx" ON "page_templates_blocks_attachments" USING btree ("tag_id");
  CREATE INDEX "page_templates_blocks_current_item_content_order_idx" ON "page_templates_blocks_current_item_content" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_current_item_content_parent_id_idx" ON "page_templates_blocks_current_item_content" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_current_item_content_path_idx" ON "page_templates_blocks_current_item_content" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_column_layout_columns_order_idx" ON "page_templates_blocks_column_layout_columns" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_column_layout_columns_parent_id_idx" ON "page_templates_blocks_column_layout_columns" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_column_layout_columns_surface_imag_idx" ON "page_templates_blocks_column_layout_columns" USING btree ("surface_image_id");
  CREATE INDEX "page_templates_blocks_column_layout_order_idx" ON "page_templates_blocks_column_layout" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_column_layout_parent_id_idx" ON "page_templates_blocks_column_layout" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_column_layout_path_idx" ON "page_templates_blocks_column_layout" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_column_layout_surface_image_idx" ON "page_templates_blocks_column_layout" USING btree ("surface_image_id");
  CREATE INDEX "page_templates_blocks_tabs_header_left_items_order_idx" ON "page_templates_blocks_tabs_header_left_items" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_tabs_header_left_items_parent_id_idx" ON "page_templates_blocks_tabs_header_left_items" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_tabs_header_left_items_event_cycle_idx" ON "page_templates_blocks_tabs_header_left_items" USING btree ("event_cycle_id");
  CREATE INDEX "page_templates_blocks_tabs_header_left_items_document_idx" ON "page_templates_blocks_tabs_header_left_items" USING btree ("document_id");
  CREATE INDEX "page_templates_blocks_tabs_header_left_items_category_idx" ON "page_templates_blocks_tabs_header_left_items" USING btree ("category_id");
  CREATE INDEX "page_templates_blocks_tabs_header_left_items_partner_idx" ON "page_templates_blocks_tabs_header_left_items" USING btree ("partner_id");
  CREATE INDEX "page_templates_blocks_tabs_header_left_items_page_idx" ON "page_templates_blocks_tabs_header_left_items" USING btree ("page_id");
  CREATE INDEX "page_templates_blocks_tabs_header_left_items_tag_idx" ON "page_templates_blocks_tabs_header_left_items" USING btree ("tag_id");
  CREATE INDEX "page_templates_blocks_tabs_header_left_items_post_idx" ON "page_templates_blocks_tabs_header_left_items" USING btree ("post_id");
  CREATE INDEX "page_templates_blocks_tabs_header_left_items_event_idx" ON "page_templates_blocks_tabs_header_left_items" USING btree ("event_id");
  CREATE INDEX "page_templates_blocks_tabs_header_right_items_order_idx" ON "page_templates_blocks_tabs_header_right_items" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_tabs_header_right_items_parent_id_idx" ON "page_templates_blocks_tabs_header_right_items" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_tabs_header_right_items_event_cycl_idx" ON "page_templates_blocks_tabs_header_right_items" USING btree ("event_cycle_id");
  CREATE INDEX "page_templates_blocks_tabs_header_right_items_document_idx" ON "page_templates_blocks_tabs_header_right_items" USING btree ("document_id");
  CREATE INDEX "page_templates_blocks_tabs_header_right_items_category_idx" ON "page_templates_blocks_tabs_header_right_items" USING btree ("category_id");
  CREATE INDEX "page_templates_blocks_tabs_header_right_items_partner_idx" ON "page_templates_blocks_tabs_header_right_items" USING btree ("partner_id");
  CREATE INDEX "page_templates_blocks_tabs_header_right_items_page_idx" ON "page_templates_blocks_tabs_header_right_items" USING btree ("page_id");
  CREATE INDEX "page_templates_blocks_tabs_header_right_items_tag_idx" ON "page_templates_blocks_tabs_header_right_items" USING btree ("tag_id");
  CREATE INDEX "page_templates_blocks_tabs_header_right_items_post_idx" ON "page_templates_blocks_tabs_header_right_items" USING btree ("post_id");
  CREATE INDEX "page_templates_blocks_tabs_header_right_items_event_idx" ON "page_templates_blocks_tabs_header_right_items" USING btree ("event_id");
  CREATE INDEX "page_templates_blocks_tabs_footer_items_order_idx" ON "page_templates_blocks_tabs_footer_items" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_tabs_footer_items_parent_id_idx" ON "page_templates_blocks_tabs_footer_items" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_tabs_footer_items_event_cycle_idx" ON "page_templates_blocks_tabs_footer_items" USING btree ("event_cycle_id");
  CREATE INDEX "page_templates_blocks_tabs_footer_items_document_idx" ON "page_templates_blocks_tabs_footer_items" USING btree ("document_id");
  CREATE INDEX "page_templates_blocks_tabs_footer_items_category_idx" ON "page_templates_blocks_tabs_footer_items" USING btree ("category_id");
  CREATE INDEX "page_templates_blocks_tabs_footer_items_partner_idx" ON "page_templates_blocks_tabs_footer_items" USING btree ("partner_id");
  CREATE INDEX "page_templates_blocks_tabs_footer_items_page_idx" ON "page_templates_blocks_tabs_footer_items" USING btree ("page_id");
  CREATE INDEX "page_templates_blocks_tabs_footer_items_tag_idx" ON "page_templates_blocks_tabs_footer_items" USING btree ("tag_id");
  CREATE INDEX "page_templates_blocks_tabs_footer_items_post_idx" ON "page_templates_blocks_tabs_footer_items" USING btree ("post_id");
  CREATE INDEX "page_templates_blocks_tabs_footer_items_event_idx" ON "page_templates_blocks_tabs_footer_items" USING btree ("event_id");
  CREATE INDEX "page_templates_blocks_tabs_tabs_order_idx" ON "page_templates_blocks_tabs_tabs" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_tabs_tabs_parent_id_idx" ON "page_templates_blocks_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_tabs_order_idx" ON "page_templates_blocks_tabs" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_tabs_parent_id_idx" ON "page_templates_blocks_tabs" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_tabs_path_idx" ON "page_templates_blocks_tabs" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_section_group_sections_order_idx" ON "page_templates_blocks_section_group_sections" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_section_group_sections_parent_id_idx" ON "page_templates_blocks_section_group_sections" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_section_group_sections_surface_ima_idx" ON "page_templates_blocks_section_group_sections" USING btree ("surface_image_id");
  CREATE INDEX "page_templates_blocks_section_group_order_idx" ON "page_templates_blocks_section_group" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_section_group_parent_id_idx" ON "page_templates_blocks_section_group" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_section_group_path_idx" ON "page_templates_blocks_section_group" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_section_group_surface_image_idx" ON "page_templates_blocks_section_group" USING btree ("surface_image_id");
  CREATE UNIQUE INDEX "page_templates_template_key_idx" ON "page_templates" USING btree ("template_key");
  CREATE INDEX "page_templates_hero_image_idx" ON "page_templates" USING btree ("hero_image_id");
  CREATE INDEX "page_templates_updated_at_idx" ON "page_templates" USING btree ("updated_at");
  CREATE INDEX "page_templates_created_at_idx" ON "page_templates" USING btree ("created_at");
  CREATE INDEX "page_templates__status_idx" ON "page_templates" USING btree ("_status");
  CREATE INDEX "page_templates_rels_order_idx" ON "page_templates_rels" USING btree ("order");
  CREATE INDEX "page_templates_rels_parent_idx" ON "page_templates_rels" USING btree ("parent_id");
  CREATE INDEX "page_templates_rels_path_idx" ON "page_templates_rels" USING btree ("path");
  CREATE INDEX "page_templates_rels_tags_id_idx" ON "page_templates_rels" USING btree ("tags_id");
  CREATE INDEX "page_templates_rels_categories_id_idx" ON "page_templates_rels" USING btree ("categories_id");
  CREATE INDEX "page_templates_rels_events_id_idx" ON "page_templates_rels" USING btree ("events_id");
  CREATE INDEX "page_templates_rels_event_cycles_id_idx" ON "page_templates_rels" USING btree ("event_cycles_id");
  CREATE INDEX "page_templates_rels_partners_id_idx" ON "page_templates_rels" USING btree ("partners_id");
  CREATE INDEX "page_templates_rels_member_profiles_id_idx" ON "page_templates_rels" USING btree ("member_profiles_id");
  CREATE INDEX "page_templates_rels_pages_id_idx" ON "page_templates_rels" USING btree ("pages_id");
  CREATE INDEX "page_templates_rels_posts_id_idx" ON "page_templates_rels" USING btree ("posts_id");
  CREATE INDEX "page_templates_rels_documents_id_idx" ON "page_templates_rels" USING btree ("documents_id");
  CREATE INDEX "_page_templates_v_blocks_rich_text_order_idx" ON "_page_templates_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_page_templates_v_blocks_rich_text_parent_id_idx" ON "_page_templates_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_page_templates_v_blocks_rich_text_path_idx" ON "_page_templates_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_page_templates_v_blocks_rich_text_surface_image_idx" ON "_page_templates_v_blocks_rich_text" USING btree ("surface_image_id");
  CREATE INDEX "_page_templates_v_blocks_heading_order_idx" ON "_page_templates_v_blocks_heading" USING btree ("_order");
  CREATE INDEX "_page_templates_v_blocks_heading_parent_id_idx" ON "_page_templates_v_blocks_heading" USING btree ("_parent_id");
  CREATE INDEX "_page_templates_v_blocks_heading_path_idx" ON "_page_templates_v_blocks_heading" USING btree ("_path");
  CREATE INDEX "_page_templates_v_blocks_action_links_items_order_idx" ON "_page_templates_v_blocks_action_links_items" USING btree ("_order");
  CREATE INDEX "_page_templates_v_blocks_action_links_items_parent_id_idx" ON "_page_templates_v_blocks_action_links_items" USING btree ("_parent_id");
  CREATE INDEX "_page_templates_v_blocks_action_links_items_event_cycle_idx" ON "_page_templates_v_blocks_action_links_items" USING btree ("event_cycle_id");
  CREATE INDEX "_page_templates_v_blocks_action_links_items_document_idx" ON "_page_templates_v_blocks_action_links_items" USING btree ("document_id");
  CREATE INDEX "_page_templates_v_blocks_action_links_items_category_idx" ON "_page_templates_v_blocks_action_links_items" USING btree ("category_id");
  CREATE INDEX "_page_templates_v_blocks_action_links_items_partner_idx" ON "_page_templates_v_blocks_action_links_items" USING btree ("partner_id");
  CREATE INDEX "_page_templates_v_blocks_action_links_items_page_idx" ON "_page_templates_v_blocks_action_links_items" USING btree ("page_id");
  CREATE INDEX "_page_templates_v_blocks_action_links_items_tag_idx" ON "_page_templates_v_blocks_action_links_items" USING btree ("tag_id");
  CREATE INDEX "_page_templates_v_blocks_action_links_items_post_idx" ON "_page_templates_v_blocks_action_links_items" USING btree ("post_id");
  CREATE INDEX "_page_templates_v_blocks_action_links_items_event_idx" ON "_page_templates_v_blocks_action_links_items" USING btree ("event_id");
  CREATE INDEX "_page_templates_v_blocks_action_links_order_idx" ON "_page_templates_v_blocks_action_links" USING btree ("_order");
  CREATE INDEX "_page_templates_v_blocks_action_links_parent_id_idx" ON "_page_templates_v_blocks_action_links" USING btree ("_parent_id");
  CREATE INDEX "_page_templates_v_blocks_action_links_path_idx" ON "_page_templates_v_blocks_action_links" USING btree ("_path");
  CREATE INDEX "_page_templates_v_blocks_current_item_field_order_idx" ON "_page_templates_v_blocks_current_item_field" USING btree ("_order");
  CREATE INDEX "_page_templates_v_blocks_current_item_field_parent_id_idx" ON "_page_templates_v_blocks_current_item_field" USING btree ("_parent_id");
  CREATE INDEX "_page_templates_v_blocks_current_item_field_path_idx" ON "_page_templates_v_blocks_current_item_field" USING btree ("_path");
  CREATE INDEX "_page_templates_v_blocks_info_columns_columns_order_idx" ON "_page_templates_v_blocks_info_columns_columns" USING btree ("_order");
  CREATE INDEX "_page_templates_v_blocks_info_columns_columns_parent_id_idx" ON "_page_templates_v_blocks_info_columns_columns" USING btree ("_parent_id");
  CREATE INDEX "_page_templates_v_blocks_info_columns_columns_surface_im_idx" ON "_page_templates_v_blocks_info_columns_columns" USING btree ("surface_image_id");
  CREATE INDEX "_page_templates_v_blocks_info_columns_order_idx" ON "_page_templates_v_blocks_info_columns" USING btree ("_order");
  CREATE INDEX "_page_templates_v_blocks_info_columns_parent_id_idx" ON "_page_templates_v_blocks_info_columns" USING btree ("_parent_id");
  CREATE INDEX "_page_templates_v_blocks_info_columns_path_idx" ON "_page_templates_v_blocks_info_columns" USING btree ("_path");
  CREATE INDEX "_page_templates_v_blocks_info_columns_surface_image_idx" ON "_page_templates_v_blocks_info_columns" USING btree ("surface_image_id");
  CREATE INDEX "_page_templates_v_blocks_info_group_sections_order_idx" ON "_page_templates_v_blocks_info_group_sections" USING btree ("_order");
  CREATE INDEX "_page_templates_v_blocks_info_group_sections_parent_id_idx" ON "_page_templates_v_blocks_info_group_sections" USING btree ("_parent_id");
  CREATE INDEX "_page_templates_v_blocks_info_group_sections_surface_ima_idx" ON "_page_templates_v_blocks_info_group_sections" USING btree ("surface_image_id");
  CREATE INDEX "_page_templates_v_blocks_info_group_order_idx" ON "_page_templates_v_blocks_info_group" USING btree ("_order");
  CREATE INDEX "_page_templates_v_blocks_info_group_parent_id_idx" ON "_page_templates_v_blocks_info_group" USING btree ("_parent_id");
  CREATE INDEX "_page_templates_v_blocks_info_group_path_idx" ON "_page_templates_v_blocks_info_group" USING btree ("_path");
  CREATE INDEX "_page_templates_v_blocks_info_group_surface_image_idx" ON "_page_templates_v_blocks_info_group" USING btree ("surface_image_id");
  CREATE INDEX "_page_templates_v_blocks_card_links_order_idx" ON "_page_templates_v_blocks_card_links" USING btree ("_order");
  CREATE INDEX "_page_templates_v_blocks_card_links_parent_id_idx" ON "_page_templates_v_blocks_card_links" USING btree ("_parent_id");
  CREATE INDEX "_page_templates_v_blocks_card_links_event_cycle_idx" ON "_page_templates_v_blocks_card_links" USING btree ("event_cycle_id");
  CREATE INDEX "_page_templates_v_blocks_card_links_document_idx" ON "_page_templates_v_blocks_card_links" USING btree ("document_id");
  CREATE INDEX "_page_templates_v_blocks_card_links_category_idx" ON "_page_templates_v_blocks_card_links" USING btree ("category_id");
  CREATE INDEX "_page_templates_v_blocks_card_links_partner_idx" ON "_page_templates_v_blocks_card_links" USING btree ("partner_id");
  CREATE INDEX "_page_templates_v_blocks_card_links_page_idx" ON "_page_templates_v_blocks_card_links" USING btree ("page_id");
  CREATE INDEX "_page_templates_v_blocks_card_links_tag_idx" ON "_page_templates_v_blocks_card_links" USING btree ("tag_id");
  CREATE INDEX "_page_templates_v_blocks_card_links_post_idx" ON "_page_templates_v_blocks_card_links" USING btree ("post_id");
  CREATE INDEX "_page_templates_v_blocks_card_links_event_idx" ON "_page_templates_v_blocks_card_links" USING btree ("event_id");
  CREATE INDEX "_page_templates_v_blocks_card_order_idx" ON "_page_templates_v_blocks_card" USING btree ("_order");
  CREATE INDEX "_page_templates_v_blocks_card_parent_id_idx" ON "_page_templates_v_blocks_card" USING btree ("_parent_id");
  CREATE INDEX "_page_templates_v_blocks_card_path_idx" ON "_page_templates_v_blocks_card" USING btree ("_path");
  CREATE INDEX "_page_templates_v_blocks_card_destination_page_idx" ON "_page_templates_v_blocks_card" USING btree ("destination_page_id");
  CREATE INDEX "_page_templates_v_blocks_card_image_idx" ON "_page_templates_v_blocks_card" USING btree ("image_id");
  CREATE INDEX "_page_templates_v_blocks_listing_sources_order_idx" ON "_page_templates_v_blocks_listing_sources" USING btree ("order");
  CREATE INDEX "_page_templates_v_blocks_listing_sources_parent_idx" ON "_page_templates_v_blocks_listing_sources" USING btree ("parent_id");
  CREATE INDEX "_page_templates_v_blocks_listing_items_order_idx" ON "_page_templates_v_blocks_listing_items" USING btree ("_order");
  CREATE INDEX "_page_templates_v_blocks_listing_items_parent_id_idx" ON "_page_templates_v_blocks_listing_items" USING btree ("_parent_id");
  CREATE INDEX "_page_templates_v_blocks_listing_conditions_order_idx" ON "_page_templates_v_blocks_listing_conditions" USING btree ("_order");
  CREATE INDEX "_page_templates_v_blocks_listing_conditions_parent_id_idx" ON "_page_templates_v_blocks_listing_conditions" USING btree ("_parent_id");
  CREATE INDEX "_page_templates_v_blocks_listing_order_idx" ON "_page_templates_v_blocks_listing" USING btree ("_order");
  CREATE INDEX "_page_templates_v_blocks_listing_parent_id_idx" ON "_page_templates_v_blocks_listing" USING btree ("_parent_id");
  CREATE INDEX "_page_templates_v_blocks_listing_path_idx" ON "_page_templates_v_blocks_listing" USING btree ("_path");
  CREATE INDEX "_page_templates_v_blocks_listing_surface_image_idx" ON "_page_templates_v_blocks_listing" USING btree ("surface_image_id");
  CREATE INDEX "_page_templates_v_blocks_content_calendar_sources_order_idx" ON "_page_templates_v_blocks_content_calendar_sources" USING btree ("order");
  CREATE INDEX "_page_templates_v_blocks_content_calendar_sources_parent_idx" ON "_page_templates_v_blocks_content_calendar_sources" USING btree ("parent_id");
  CREATE INDEX "_page_templates_v_blocks_content_calendar_order_idx" ON "_page_templates_v_blocks_content_calendar" USING btree ("_order");
  CREATE INDEX "_page_templates_v_blocks_content_calendar_parent_id_idx" ON "_page_templates_v_blocks_content_calendar" USING btree ("_parent_id");
  CREATE INDEX "_page_templates_v_blocks_content_calendar_path_idx" ON "_page_templates_v_blocks_content_calendar" USING btree ("_path");
  CREATE INDEX "_page_templates_v_blocks_content_calendar_surface_image_idx" ON "_page_templates_v_blocks_content_calendar" USING btree ("surface_image_id");
  CREATE INDEX "_page_templates_v_blocks_content_calendar_category_idx" ON "_page_templates_v_blocks_content_calendar" USING btree ("category_id");
  CREATE INDEX "_page_templates_v_blocks_content_calendar_tag_idx" ON "_page_templates_v_blocks_content_calendar" USING btree ("tag_id");
  CREATE INDEX "_page_templates_v_blocks_content_calendar_event_cycle_idx" ON "_page_templates_v_blocks_content_calendar" USING btree ("event_cycle_id");
  CREATE INDEX "_page_templates_v_blocks_media_gallery_items_order_idx" ON "_page_templates_v_blocks_media_gallery_items" USING btree ("_order");
  CREATE INDEX "_page_templates_v_blocks_media_gallery_items_parent_id_idx" ON "_page_templates_v_blocks_media_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "_page_templates_v_blocks_media_gallery_items_media_idx" ON "_page_templates_v_blocks_media_gallery_items" USING btree ("media_id");
  CREATE INDEX "_page_templates_v_blocks_media_gallery_order_idx" ON "_page_templates_v_blocks_media_gallery" USING btree ("_order");
  CREATE INDEX "_page_templates_v_blocks_media_gallery_parent_id_idx" ON "_page_templates_v_blocks_media_gallery" USING btree ("_parent_id");
  CREATE INDEX "_page_templates_v_blocks_media_gallery_path_idx" ON "_page_templates_v_blocks_media_gallery" USING btree ("_path");
  CREATE INDEX "_page_templates_v_blocks_media_gallery_surface_image_idx" ON "_page_templates_v_blocks_media_gallery" USING btree ("surface_image_id");
  CREATE INDEX "_page_templates_v_blocks_media_gallery_category_idx" ON "_page_templates_v_blocks_media_gallery" USING btree ("category_id");
  CREATE INDEX "_page_templates_v_blocks_media_gallery_tag_idx" ON "_page_templates_v_blocks_media_gallery" USING btree ("tag_id");
  CREATE INDEX "_page_templates_v_blocks_attachments_items_order_idx" ON "_page_templates_v_blocks_attachments_items" USING btree ("_order");
  CREATE INDEX "_page_templates_v_blocks_attachments_items_parent_id_idx" ON "_page_templates_v_blocks_attachments_items" USING btree ("_parent_id");
  CREATE INDEX "_page_templates_v_blocks_attachments_items_media_idx" ON "_page_templates_v_blocks_attachments_items" USING btree ("media_id");
  CREATE INDEX "_page_templates_v_blocks_attachments_order_idx" ON "_page_templates_v_blocks_attachments" USING btree ("_order");
  CREATE INDEX "_page_templates_v_blocks_attachments_parent_id_idx" ON "_page_templates_v_blocks_attachments" USING btree ("_parent_id");
  CREATE INDEX "_page_templates_v_blocks_attachments_path_idx" ON "_page_templates_v_blocks_attachments" USING btree ("_path");
  CREATE INDEX "_page_templates_v_blocks_attachments_surface_image_idx" ON "_page_templates_v_blocks_attachments" USING btree ("surface_image_id");
  CREATE INDEX "_page_templates_v_blocks_attachments_category_idx" ON "_page_templates_v_blocks_attachments" USING btree ("category_id");
  CREATE INDEX "_page_templates_v_blocks_attachments_tag_idx" ON "_page_templates_v_blocks_attachments" USING btree ("tag_id");
  CREATE INDEX "_page_templates_v_blocks_current_item_content_order_idx" ON "_page_templates_v_blocks_current_item_content" USING btree ("_order");
  CREATE INDEX "_page_templates_v_blocks_current_item_content_parent_id_idx" ON "_page_templates_v_blocks_current_item_content" USING btree ("_parent_id");
  CREATE INDEX "_page_templates_v_blocks_current_item_content_path_idx" ON "_page_templates_v_blocks_current_item_content" USING btree ("_path");
  CREATE INDEX "_page_templates_v_blocks_column_layout_columns_order_idx" ON "_page_templates_v_blocks_column_layout_columns" USING btree ("_order");
  CREATE INDEX "_page_templates_v_blocks_column_layout_columns_parent_id_idx" ON "_page_templates_v_blocks_column_layout_columns" USING btree ("_parent_id");
  CREATE INDEX "_page_templates_v_blocks_column_layout_columns_surface_i_idx" ON "_page_templates_v_blocks_column_layout_columns" USING btree ("surface_image_id");
  CREATE INDEX "_page_templates_v_blocks_column_layout_order_idx" ON "_page_templates_v_blocks_column_layout" USING btree ("_order");
  CREATE INDEX "_page_templates_v_blocks_column_layout_parent_id_idx" ON "_page_templates_v_blocks_column_layout" USING btree ("_parent_id");
  CREATE INDEX "_page_templates_v_blocks_column_layout_path_idx" ON "_page_templates_v_blocks_column_layout" USING btree ("_path");
  CREATE INDEX "_page_templates_v_blocks_column_layout_surface_image_idx" ON "_page_templates_v_blocks_column_layout" USING btree ("surface_image_id");
  CREATE INDEX "_page_templates_v_blocks_tabs_header_left_items_order_idx" ON "_page_templates_v_blocks_tabs_header_left_items" USING btree ("_order");
  CREATE INDEX "_page_templates_v_blocks_tabs_header_left_items_parent_id_idx" ON "_page_templates_v_blocks_tabs_header_left_items" USING btree ("_parent_id");
  CREATE INDEX "_page_templates_v_blocks_tabs_header_left_items_event_cy_idx" ON "_page_templates_v_blocks_tabs_header_left_items" USING btree ("event_cycle_id");
  CREATE INDEX "_page_templates_v_blocks_tabs_header_left_items_document_idx" ON "_page_templates_v_blocks_tabs_header_left_items" USING btree ("document_id");
  CREATE INDEX "_page_templates_v_blocks_tabs_header_left_items_category_idx" ON "_page_templates_v_blocks_tabs_header_left_items" USING btree ("category_id");
  CREATE INDEX "_page_templates_v_blocks_tabs_header_left_items_partner_idx" ON "_page_templates_v_blocks_tabs_header_left_items" USING btree ("partner_id");
  CREATE INDEX "_page_templates_v_blocks_tabs_header_left_items_page_idx" ON "_page_templates_v_blocks_tabs_header_left_items" USING btree ("page_id");
  CREATE INDEX "_page_templates_v_blocks_tabs_header_left_items_tag_idx" ON "_page_templates_v_blocks_tabs_header_left_items" USING btree ("tag_id");
  CREATE INDEX "_page_templates_v_blocks_tabs_header_left_items_post_idx" ON "_page_templates_v_blocks_tabs_header_left_items" USING btree ("post_id");
  CREATE INDEX "_page_templates_v_blocks_tabs_header_left_items_event_idx" ON "_page_templates_v_blocks_tabs_header_left_items" USING btree ("event_id");
  CREATE INDEX "_page_templates_v_blocks_tabs_header_right_items_order_idx" ON "_page_templates_v_blocks_tabs_header_right_items" USING btree ("_order");
  CREATE INDEX "_page_templates_v_blocks_tabs_header_right_items_parent_id_idx" ON "_page_templates_v_blocks_tabs_header_right_items" USING btree ("_parent_id");
  CREATE INDEX "_page_templates_v_blocks_tabs_header_right_items_event_c_idx" ON "_page_templates_v_blocks_tabs_header_right_items" USING btree ("event_cycle_id");
  CREATE INDEX "_page_templates_v_blocks_tabs_header_right_items_documen_idx" ON "_page_templates_v_blocks_tabs_header_right_items" USING btree ("document_id");
  CREATE INDEX "_page_templates_v_blocks_tabs_header_right_items_categor_idx" ON "_page_templates_v_blocks_tabs_header_right_items" USING btree ("category_id");
  CREATE INDEX "_page_templates_v_blocks_tabs_header_right_items_partner_idx" ON "_page_templates_v_blocks_tabs_header_right_items" USING btree ("partner_id");
  CREATE INDEX "_page_templates_v_blocks_tabs_header_right_items_page_idx" ON "_page_templates_v_blocks_tabs_header_right_items" USING btree ("page_id");
  CREATE INDEX "_page_templates_v_blocks_tabs_header_right_items_tag_idx" ON "_page_templates_v_blocks_tabs_header_right_items" USING btree ("tag_id");
  CREATE INDEX "_page_templates_v_blocks_tabs_header_right_items_post_idx" ON "_page_templates_v_blocks_tabs_header_right_items" USING btree ("post_id");
  CREATE INDEX "_page_templates_v_blocks_tabs_header_right_items_event_idx" ON "_page_templates_v_blocks_tabs_header_right_items" USING btree ("event_id");
  CREATE INDEX "_page_templates_v_blocks_tabs_footer_items_order_idx" ON "_page_templates_v_blocks_tabs_footer_items" USING btree ("_order");
  CREATE INDEX "_page_templates_v_blocks_tabs_footer_items_parent_id_idx" ON "_page_templates_v_blocks_tabs_footer_items" USING btree ("_parent_id");
  CREATE INDEX "_page_templates_v_blocks_tabs_footer_items_event_cycle_idx" ON "_page_templates_v_blocks_tabs_footer_items" USING btree ("event_cycle_id");
  CREATE INDEX "_page_templates_v_blocks_tabs_footer_items_document_idx" ON "_page_templates_v_blocks_tabs_footer_items" USING btree ("document_id");
  CREATE INDEX "_page_templates_v_blocks_tabs_footer_items_category_idx" ON "_page_templates_v_blocks_tabs_footer_items" USING btree ("category_id");
  CREATE INDEX "_page_templates_v_blocks_tabs_footer_items_partner_idx" ON "_page_templates_v_blocks_tabs_footer_items" USING btree ("partner_id");
  CREATE INDEX "_page_templates_v_blocks_tabs_footer_items_page_idx" ON "_page_templates_v_blocks_tabs_footer_items" USING btree ("page_id");
  CREATE INDEX "_page_templates_v_blocks_tabs_footer_items_tag_idx" ON "_page_templates_v_blocks_tabs_footer_items" USING btree ("tag_id");
  CREATE INDEX "_page_templates_v_blocks_tabs_footer_items_post_idx" ON "_page_templates_v_blocks_tabs_footer_items" USING btree ("post_id");
  CREATE INDEX "_page_templates_v_blocks_tabs_footer_items_event_idx" ON "_page_templates_v_blocks_tabs_footer_items" USING btree ("event_id");
  CREATE INDEX "_page_templates_v_blocks_tabs_tabs_order_idx" ON "_page_templates_v_blocks_tabs_tabs" USING btree ("_order");
  CREATE INDEX "_page_templates_v_blocks_tabs_tabs_parent_id_idx" ON "_page_templates_v_blocks_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "_page_templates_v_blocks_tabs_order_idx" ON "_page_templates_v_blocks_tabs" USING btree ("_order");
  CREATE INDEX "_page_templates_v_blocks_tabs_parent_id_idx" ON "_page_templates_v_blocks_tabs" USING btree ("_parent_id");
  CREATE INDEX "_page_templates_v_blocks_tabs_path_idx" ON "_page_templates_v_blocks_tabs" USING btree ("_path");
  CREATE INDEX "_page_templates_v_blocks_section_group_sections_order_idx" ON "_page_templates_v_blocks_section_group_sections" USING btree ("_order");
  CREATE INDEX "_page_templates_v_blocks_section_group_sections_parent_id_idx" ON "_page_templates_v_blocks_section_group_sections" USING btree ("_parent_id");
  CREATE INDEX "_page_templates_v_blocks_section_group_sections_surface__idx" ON "_page_templates_v_blocks_section_group_sections" USING btree ("surface_image_id");
  CREATE INDEX "_page_templates_v_blocks_section_group_order_idx" ON "_page_templates_v_blocks_section_group" USING btree ("_order");
  CREATE INDEX "_page_templates_v_blocks_section_group_parent_id_idx" ON "_page_templates_v_blocks_section_group" USING btree ("_parent_id");
  CREATE INDEX "_page_templates_v_blocks_section_group_path_idx" ON "_page_templates_v_blocks_section_group" USING btree ("_path");
  CREATE INDEX "_page_templates_v_blocks_section_group_surface_image_idx" ON "_page_templates_v_blocks_section_group" USING btree ("surface_image_id");
  CREATE INDEX "_page_templates_v_parent_idx" ON "_page_templates_v" USING btree ("parent_id");
  CREATE INDEX "_page_templates_v_version_version_template_key_idx" ON "_page_templates_v" USING btree ("version_template_key");
  CREATE INDEX "_page_templates_v_version_version_hero_image_idx" ON "_page_templates_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_page_templates_v_version_version_updated_at_idx" ON "_page_templates_v" USING btree ("version_updated_at");
  CREATE INDEX "_page_templates_v_version_version_created_at_idx" ON "_page_templates_v" USING btree ("version_created_at");
  CREATE INDEX "_page_templates_v_version_version__status_idx" ON "_page_templates_v" USING btree ("version__status");
  CREATE INDEX "_page_templates_v_created_at_idx" ON "_page_templates_v" USING btree ("created_at");
  CREATE INDEX "_page_templates_v_updated_at_idx" ON "_page_templates_v" USING btree ("updated_at");
  CREATE INDEX "_page_templates_v_latest_idx" ON "_page_templates_v" USING btree ("latest");
  CREATE INDEX "_page_templates_v_rels_order_idx" ON "_page_templates_v_rels" USING btree ("order");
  CREATE INDEX "_page_templates_v_rels_parent_idx" ON "_page_templates_v_rels" USING btree ("parent_id");
  CREATE INDEX "_page_templates_v_rels_path_idx" ON "_page_templates_v_rels" USING btree ("path");
  CREATE INDEX "_page_templates_v_rels_tags_id_idx" ON "_page_templates_v_rels" USING btree ("tags_id");
  CREATE INDEX "_page_templates_v_rels_categories_id_idx" ON "_page_templates_v_rels" USING btree ("categories_id");
  CREATE INDEX "_page_templates_v_rels_events_id_idx" ON "_page_templates_v_rels" USING btree ("events_id");
  CREATE INDEX "_page_templates_v_rels_event_cycles_id_idx" ON "_page_templates_v_rels" USING btree ("event_cycles_id");
  CREATE INDEX "_page_templates_v_rels_partners_id_idx" ON "_page_templates_v_rels" USING btree ("partners_id");
  CREATE INDEX "_page_templates_v_rels_member_profiles_id_idx" ON "_page_templates_v_rels" USING btree ("member_profiles_id");
  CREATE INDEX "_page_templates_v_rels_pages_id_idx" ON "_page_templates_v_rels" USING btree ("pages_id");
  CREATE INDEX "_page_templates_v_rels_posts_id_idx" ON "_page_templates_v_rels" USING btree ("posts_id");
  CREATE INDEX "_page_templates_v_rels_documents_id_idx" ON "_page_templates_v_rels" USING btree ("documents_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_page_templates_fk" FOREIGN KEY ("page_templates_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_page_templates_id_idx" ON "payload_locked_documents_rels" USING btree ("page_templates_id");

  WITH inserted_templates AS (
    INSERT INTO "page_templates" ("template_key", "rendering_mode", "_status")
    VALUES
      ('blog-index', 'legacy', 'published'),
      ('events-index', 'legacy', 'published'),
      ('members-index', 'legacy', 'published'),
      ('tag-detail', 'legacy', 'published'),
      ('category-detail', 'legacy', 'published'),
      ('event-detail', 'legacy', 'published'),
      ('event-cycle-detail', 'legacy', 'published'),
      ('partner-detail', 'legacy', 'published'),
      ('member-detail', 'legacy', 'published')
    RETURNING "id", "template_key", "rendering_mode", "updated_at", "created_at", "_status"
  )
  INSERT INTO "_page_templates_v" (
    "parent_id",
    "version_template_key",
    "version_rendering_mode",
    "version_updated_at",
    "version_created_at",
    "version__status",
    "latest"
  )
  SELECT
    "id",
    "template_key"::text::"enum__page_templates_v_version_template_key",
    "rendering_mode"::text::"enum__page_templates_v_version_rendering_mode",
    "updated_at",
    "created_at",
    "_status"::text::"enum__page_templates_v_version_status",
    true
  FROM inserted_templates;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "page_templates_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_heading" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_action_links_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_action_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_current_item_field" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_info_columns_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_info_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_info_group_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_info_group" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_card_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_card" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_listing_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_listing_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_listing_conditions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_listing" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_content_calendar_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_content_calendar" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_media_gallery_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_media_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_attachments_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_attachments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_current_item_content" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_column_layout_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_column_layout" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_tabs_header_left_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_tabs_header_right_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_tabs_footer_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_tabs_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_section_group_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_section_group" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_templates_v_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_templates_v_blocks_heading" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_templates_v_blocks_action_links_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_templates_v_blocks_action_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_templates_v_blocks_current_item_field" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_templates_v_blocks_info_columns_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_templates_v_blocks_info_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_templates_v_blocks_info_group_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_templates_v_blocks_info_group" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_templates_v_blocks_card_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_templates_v_blocks_card" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_templates_v_blocks_listing_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_templates_v_blocks_listing_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_templates_v_blocks_listing_conditions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_templates_v_blocks_listing" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_templates_v_blocks_content_calendar_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_templates_v_blocks_content_calendar" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_templates_v_blocks_media_gallery_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_templates_v_blocks_media_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_templates_v_blocks_attachments_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_templates_v_blocks_attachments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_templates_v_blocks_current_item_content" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_templates_v_blocks_column_layout_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_templates_v_blocks_column_layout" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_templates_v_blocks_tabs_header_left_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_templates_v_blocks_tabs_header_right_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_templates_v_blocks_tabs_footer_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_templates_v_blocks_tabs_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_templates_v_blocks_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_templates_v_blocks_section_group_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_templates_v_blocks_section_group" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_templates_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_templates_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_page_templates_fk";
  DROP INDEX "payload_locked_documents_rels_page_templates_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "page_templates_id";
  DROP TABLE "page_templates_blocks_rich_text" CASCADE;
  DROP TABLE "page_templates_blocks_heading" CASCADE;
  DROP TABLE "page_templates_blocks_action_links_items" CASCADE;
  DROP TABLE "page_templates_blocks_action_links" CASCADE;
  DROP TABLE "page_templates_blocks_current_item_field" CASCADE;
  DROP TABLE "page_templates_blocks_info_columns_columns" CASCADE;
  DROP TABLE "page_templates_blocks_info_columns" CASCADE;
  DROP TABLE "page_templates_blocks_info_group_sections" CASCADE;
  DROP TABLE "page_templates_blocks_info_group" CASCADE;
  DROP TABLE "page_templates_blocks_card_links" CASCADE;
  DROP TABLE "page_templates_blocks_card" CASCADE;
  DROP TABLE "page_templates_blocks_listing_sources" CASCADE;
  DROP TABLE "page_templates_blocks_listing_items" CASCADE;
  DROP TABLE "page_templates_blocks_listing_conditions" CASCADE;
  DROP TABLE "page_templates_blocks_listing" CASCADE;
  DROP TABLE "page_templates_blocks_content_calendar_sources" CASCADE;
  DROP TABLE "page_templates_blocks_content_calendar" CASCADE;
  DROP TABLE "page_templates_blocks_media_gallery_items" CASCADE;
  DROP TABLE "page_templates_blocks_media_gallery" CASCADE;
  DROP TABLE "page_templates_blocks_attachments_items" CASCADE;
  DROP TABLE "page_templates_blocks_attachments" CASCADE;
  DROP TABLE "page_templates_blocks_current_item_content" CASCADE;
  DROP TABLE "page_templates_blocks_column_layout_columns" CASCADE;
  DROP TABLE "page_templates_blocks_column_layout" CASCADE;
  DROP TABLE "page_templates_blocks_tabs_header_left_items" CASCADE;
  DROP TABLE "page_templates_blocks_tabs_header_right_items" CASCADE;
  DROP TABLE "page_templates_blocks_tabs_footer_items" CASCADE;
  DROP TABLE "page_templates_blocks_tabs_tabs" CASCADE;
  DROP TABLE "page_templates_blocks_tabs" CASCADE;
  DROP TABLE "page_templates_blocks_section_group_sections" CASCADE;
  DROP TABLE "page_templates_blocks_section_group" CASCADE;
  DROP TABLE "page_templates" CASCADE;
  DROP TABLE "page_templates_rels" CASCADE;
  DROP TABLE "_page_templates_v_blocks_rich_text" CASCADE;
  DROP TABLE "_page_templates_v_blocks_heading" CASCADE;
  DROP TABLE "_page_templates_v_blocks_action_links_items" CASCADE;
  DROP TABLE "_page_templates_v_blocks_action_links" CASCADE;
  DROP TABLE "_page_templates_v_blocks_current_item_field" CASCADE;
  DROP TABLE "_page_templates_v_blocks_info_columns_columns" CASCADE;
  DROP TABLE "_page_templates_v_blocks_info_columns" CASCADE;
  DROP TABLE "_page_templates_v_blocks_info_group_sections" CASCADE;
  DROP TABLE "_page_templates_v_blocks_info_group" CASCADE;
  DROP TABLE "_page_templates_v_blocks_card_links" CASCADE;
  DROP TABLE "_page_templates_v_blocks_card" CASCADE;
  DROP TABLE "_page_templates_v_blocks_listing_sources" CASCADE;
  DROP TABLE "_page_templates_v_blocks_listing_items" CASCADE;
  DROP TABLE "_page_templates_v_blocks_listing_conditions" CASCADE;
  DROP TABLE "_page_templates_v_blocks_listing" CASCADE;
  DROP TABLE "_page_templates_v_blocks_content_calendar_sources" CASCADE;
  DROP TABLE "_page_templates_v_blocks_content_calendar" CASCADE;
  DROP TABLE "_page_templates_v_blocks_media_gallery_items" CASCADE;
  DROP TABLE "_page_templates_v_blocks_media_gallery" CASCADE;
  DROP TABLE "_page_templates_v_blocks_attachments_items" CASCADE;
  DROP TABLE "_page_templates_v_blocks_attachments" CASCADE;
  DROP TABLE "_page_templates_v_blocks_current_item_content" CASCADE;
  DROP TABLE "_page_templates_v_blocks_column_layout_columns" CASCADE;
  DROP TABLE "_page_templates_v_blocks_column_layout" CASCADE;
  DROP TABLE "_page_templates_v_blocks_tabs_header_left_items" CASCADE;
  DROP TABLE "_page_templates_v_blocks_tabs_header_right_items" CASCADE;
  DROP TABLE "_page_templates_v_blocks_tabs_footer_items" CASCADE;
  DROP TABLE "_page_templates_v_blocks_tabs_tabs" CASCADE;
  DROP TABLE "_page_templates_v_blocks_tabs" CASCADE;
  DROP TABLE "_page_templates_v_blocks_section_group_sections" CASCADE;
  DROP TABLE "_page_templates_v_blocks_section_group" CASCADE;
  DROP TABLE "_page_templates_v" CASCADE;
  DROP TABLE "_page_templates_v_rels" CASCADE;
  DROP TYPE "public"."enum_page_templates_blocks_rich_text_text_style";
  DROP TYPE "public"."enum_page_templates_blocks_heading_heading_level";
  DROP TYPE "public"."enum_page_templates_blocks_heading_heading_icon_name";
  DROP TYPE "public"."enum_page_templates_blocks_action_links_items_icon_name";
  DROP TYPE "public"."enum_page_templates_blocks_action_links_layout";
  DROP TYPE "public"."enum_page_templates_blocks_action_links_alignment";
  DROP TYPE "public"."enum_page_templates_blocks_current_item_field_field";
  DROP TYPE "public"."enum_page_templates_blocks_current_item_field_variant";
  DROP TYPE "public"."enum_page_templates_blocks_card_links_icon_name";
  DROP TYPE "public"."enum_page_templates_blocks_listing_sources";
  DROP TYPE "public"."enum_page_templates_blocks_listing_conditions_field";
  DROP TYPE "public"."enum_page_templates_blocks_listing_conditions_operator";
  DROP TYPE "public"."enum_page_templates_blocks_listing_view";
  DROP TYPE "public"."enum_page_templates_blocks_listing_selection_mode";
  DROP TYPE "public"."enum_page_templates_blocks_listing_sort";
  DROP TYPE "public"."enum_page_templates_blocks_content_calendar_sources";
  DROP TYPE "public"."enum_page_templates_blocks_media_gallery_selection_mode";
  DROP TYPE "public"."enum_page_templates_blocks_media_gallery_sort";
  DROP TYPE "public"."enum_page_templates_blocks_media_gallery_view";
  DROP TYPE "public"."enum_page_templates_blocks_attachments_selection_mode";
  DROP TYPE "public"."enum_page_templates_blocks_attachments_sort";
  DROP TYPE "public"."enum_page_templates_blocks_attachments_view";
  DROP TYPE "public"."enum_page_templates_blocks_tabs_footer_items_icon_name";
  DROP TYPE "public"."enum_page_templates_blocks_tabs_footer_alignment";
  DROP TYPE "public"."enum_page_templates_template_key";
  DROP TYPE "public"."enum_page_templates_rendering_mode";
  DROP TYPE "public"."enum_page_templates_status";
  DROP TYPE "public"."enum__page_templates_v_blocks_rich_text_text_style";
  DROP TYPE "public"."enum__page_templates_v_blocks_heading_heading_level";
  DROP TYPE "public"."enum__page_templates_v_blocks_heading_heading_icon_name";
  DROP TYPE "public"."enum__page_templates_v_blocks_action_links_items_icon_name";
  DROP TYPE "public"."enum__page_templates_v_blocks_action_links_layout";
  DROP TYPE "public"."enum__page_templates_v_blocks_action_links_alignment";
  DROP TYPE "public"."enum__page_templates_v_blocks_current_item_field_field";
  DROP TYPE "public"."enum__page_templates_v_blocks_current_item_field_variant";
  DROP TYPE "public"."enum__page_templates_v_blocks_card_links_icon_name";
  DROP TYPE "public"."enum__page_templates_v_blocks_listing_sources";
  DROP TYPE "public"."enum__page_templates_v_blocks_listing_conditions_field";
  DROP TYPE "public"."enum__page_templates_v_blocks_listing_conditions_operator";
  DROP TYPE "public"."enum__page_templates_v_blocks_listing_view";
  DROP TYPE "public"."enum__page_templates_v_blocks_listing_selection_mode";
  DROP TYPE "public"."enum__page_templates_v_blocks_listing_sort";
  DROP TYPE "public"."enum__page_templates_v_blocks_content_calendar_sources";
  DROP TYPE "public"."enum__page_templates_v_blocks_media_gallery_selection_mode";
  DROP TYPE "public"."enum__page_templates_v_blocks_media_gallery_sort";
  DROP TYPE "public"."enum__page_templates_v_blocks_media_gallery_view";
  DROP TYPE "public"."enum__page_templates_v_blocks_attachments_selection_mode";
  DROP TYPE "public"."enum__page_templates_v_blocks_attachments_sort";
  DROP TYPE "public"."enum__page_templates_v_blocks_attachments_view";
  DROP TYPE "public"."enum__page_templates_v_blocks_tabs_footer_items_icon_name";
  DROP TYPE "public"."enum__page_templates_v_blocks_tabs_footer_alignment";
  DROP TYPE "public"."enum__page_templates_v_version_template_key";
  DROP TYPE "public"."enum__page_templates_v_version_rendering_mode";
  DROP TYPE "public"."enum__page_templates_v_version_status";`)
}
