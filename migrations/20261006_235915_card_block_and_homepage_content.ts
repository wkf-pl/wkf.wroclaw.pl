import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_card_links_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum__pages_v_blocks_card_links_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_posts_blocks_card_links_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum__posts_v_blocks_card_links_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_events_blocks_card_links_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum__events_v_blocks_card_links_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_event_cycles_blocks_card_links_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_card_links_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_partners_blocks_card_links_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum__partners_v_blocks_card_links_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_homepage_sections_blocks_rich_text_text_style" AS ENUM('default', 'lead', 'note');
  CREATE TYPE "public"."enum_homepage_sections_blocks_heading_heading_level" AS ENUM('h2', 'h3', 'h4');
  CREATE TYPE "public"."enum_homepage_sections_blocks_heading_heading_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_homepage_sections_blocks_action_links_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_homepage_sections_blocks_action_links_layout" AS ENUM('inline', 'stacked');
  CREATE TYPE "public"."enum_homepage_sections_blocks_action_links_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum_homepage_sections_blocks_card_links_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_homepage_sections_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles');
  CREATE TYPE "public"."enum_homepage_sections_blocks_listing_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum_homepage_sections_blocks_listing_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending', 'eventDateAscending');
  CREATE TYPE "public"."enum_homepage_sections_blocks_listing_view" AS ENUM('cards', 'compact', 'grid');
  CREATE TYPE "public"."enum_homepage_sections_blocks_listing_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum_homepage_sections_blocks_listing_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TYPE "public"."enum_homepage_sections_blocks_media_gallery_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum_homepage_sections_blocks_media_gallery_sort" AS ENUM('newest', 'oldest', 'nameAscending', 'nameDescending');
  CREATE TYPE "public"."enum_homepage_sections_blocks_media_gallery_view" AS ENUM('cards', 'list', 'grid');
  CREATE TYPE "public"."enum_homepage_sections_blocks_documents_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum_homepage_sections_blocks_documents_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum_homepage_sections_blocks_documents_view" AS ENUM('cards', 'list', 'grid');
  CREATE TYPE "public"."enum_homepage_sections_blocks_attachments_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum_homepage_sections_blocks_attachments_sort" AS ENUM('newest', 'oldest', 'nameAscending', 'nameDescending');
  CREATE TYPE "public"."enum_homepage_sections_blocks_attachments_view" AS ENUM('cards', 'list', 'grid');
  CREATE TYPE "public"."enum_homepage_sections_blocks_member_profiles_view" AS ENUM('card', 'list', 'grid');
  CREATE TYPE "public"."enum_homepage_sections_blocks_column_layout_vertical_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum_homepage_sections_blocks_column_layout_column_separators" AS ENUM('none', 'between');
  CREATE TABLE "pages_blocks_card_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum_pages_blocks_card_links_icon_name",
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
  
  CREATE TABLE "pages_blocks_card" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"destination_page_id" integer,
  	"image_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_card_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum__pages_v_blocks_card_links_icon_name",
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
  
  CREATE TABLE "_pages_v_blocks_card" (
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
  
  CREATE TABLE "posts_blocks_card_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum_posts_blocks_card_links_icon_name",
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
  
  CREATE TABLE "posts_blocks_card" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"destination_page_id" integer,
  	"image_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_card_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum__posts_v_blocks_card_links_icon_name",
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
  
  CREATE TABLE "_posts_v_blocks_card" (
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
  
  CREATE TABLE "events_blocks_card_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum_events_blocks_card_links_icon_name",
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
  
  CREATE TABLE "events_blocks_card" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"destination_page_id" integer,
  	"image_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "_events_v_blocks_card_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum__events_v_blocks_card_links_icon_name",
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
  
  CREATE TABLE "_events_v_blocks_card" (
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
  
  CREATE TABLE "event_cycles_blocks_card_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum_event_cycles_blocks_card_links_icon_name",
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
  
  CREATE TABLE "event_cycles_blocks_card" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"destination_page_id" integer,
  	"image_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "_event_cycles_v_blocks_card_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum__event_cycles_v_blocks_card_links_icon_name",
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
  
  CREATE TABLE "_event_cycles_v_blocks_card" (
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
  
  CREATE TABLE "partners_blocks_card_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum_partners_blocks_card_links_icon_name",
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
  
  CREATE TABLE "partners_blocks_card" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"destination_page_id" integer,
  	"image_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "_partners_v_blocks_card_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum__partners_v_blocks_card_links_icon_name",
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
  
  CREATE TABLE "_partners_v_blocks_card" (
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
  
  CREATE TABLE "homepage_sections_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text_style" "enum_homepage_sections_blocks_rich_text_text_style" DEFAULT 'default',
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"content" jsonb NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_sections_blocks_heading" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"heading_level" "enum_homepage_sections_blocks_heading_heading_level" DEFAULT 'h2' NOT NULL,
  	"heading_icon_name" "enum_homepage_sections_blocks_heading_heading_icon_name",
  	"icon_inverted" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_sections_blocks_action_links_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link' NOT NULL,
  	"icon_name" "enum_homepage_sections_blocks_action_links_items_icon_name",
  	"target_type" "target" DEFAULT 'custom' NOT NULL,
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
  
  CREATE TABLE "homepage_sections_blocks_action_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"layout" "enum_homepage_sections_blocks_action_links_layout" DEFAULT 'inline' NOT NULL,
  	"alignment" "enum_homepage_sections_blocks_action_links_alignment" DEFAULT 'start' NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_sections_blocks_card_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link' NOT NULL,
  	"icon_name" "enum_homepage_sections_blocks_card_links_icon_name",
  	"target_type" "target" DEFAULT 'custom' NOT NULL,
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
  
  CREATE TABLE "homepage_sections_blocks_card" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"destination_page_id" integer,
  	"image_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_sections_blocks_listing_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "homepage_sections_blocks_listing_sources" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_homepage_sections_blocks_listing_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "homepage_sections_blocks_listing" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"selection_mode" "enum_homepage_sections_blocks_listing_selection_mode" DEFAULT 'filters' NOT NULL,
  	"parent_page_id" integer,
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum_homepage_sections_blocks_listing_sort" DEFAULT 'newest',
  	"view" "enum_homepage_sections_blocks_listing_view" DEFAULT 'cards' NOT NULL,
  	"event_time_filter" "enum_homepage_sections_blocks_listing_event_time_filter" DEFAULT 'all',
  	"event_cycle_id" integer,
  	"page_size" numeric DEFAULT 12 NOT NULL,
  	"pagination" boolean DEFAULT true,
  	"parent_filter" "enum_homepage_sections_blocks_listing_parent_filter" DEFAULT 'none' NOT NULL,
  	"empty_message" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_sections_blocks_media_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "homepage_sections_blocks_media_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"selection_mode" "enum_homepage_sections_blocks_media_gallery_selection_mode" DEFAULT 'filters' NOT NULL,
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum_homepage_sections_blocks_media_gallery_sort" DEFAULT 'newest',
  	"view" "enum_homepage_sections_blocks_media_gallery_view" DEFAULT 'grid' NOT NULL,
  	"page_size" numeric DEFAULT 12 NOT NULL,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_sections_blocks_documents_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"document_id" integer
  );
  
  CREATE TABLE "homepage_sections_blocks_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"selection_mode" "enum_homepage_sections_blocks_documents_selection_mode" DEFAULT 'filters' NOT NULL,
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum_homepage_sections_blocks_documents_sort" DEFAULT 'newest',
  	"view" "enum_homepage_sections_blocks_documents_view" DEFAULT 'list' NOT NULL,
  	"page_size" numeric DEFAULT 12 NOT NULL,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_sections_blocks_attachments_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "homepage_sections_blocks_attachments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"selection_mode" "enum_homepage_sections_blocks_attachments_selection_mode" DEFAULT 'filters' NOT NULL,
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum_homepage_sections_blocks_attachments_sort" DEFAULT 'newest',
  	"view" "enum_homepage_sections_blocks_attachments_view" DEFAULT 'list' NOT NULL,
  	"page_size" numeric DEFAULT 12 NOT NULL,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_sections_blocks_member_profiles_entries" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"profile_id" integer NOT NULL,
  	"context_label" varchar
  );
  
  CREATE TABLE "homepage_sections_blocks_member_profiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"view" "enum_homepage_sections_blocks_member_profiles_view" DEFAULT 'grid' NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_sections_blocks_column_layout_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"width" numeric DEFAULT 2 NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle'
  );
  
  CREATE TABLE "homepage_sections_blocks_column_layout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"vertical_alignment" "enum_homepage_sections_blocks_column_layout_vertical_alignment" DEFAULT 'start' NOT NULL,
  	"column_separators" "enum_homepage_sections_blocks_column_layout_column_separators" DEFAULT 'none' NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_sections_blocks_section_group_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle'
  );
  
  CREATE TABLE "homepage_sections_blocks_section_group" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_sections_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"events_id" integer,
   	"event_cycles_id" integer
  );

  INSERT INTO "homepage_sections_blocks_column_layout" (
    "_order", "_parent_id", "_path", "id", "vertical_alignment", "column_separators"
  )
  SELECT 1, groups."_parent_id", 'layout',
    'migrated-homepage-groups-' || groups."_parent_id", 'start', 'none'
  FROM "homepage_sections_groups" AS groups
  GROUP BY groups."_parent_id"
  HAVING count(*) BETWEEN 2 AND 4;

  INSERT INTO "homepage_sections_blocks_column_layout_columns" (
    "_order", "_parent_id", "id", "width"
  )
  SELECT groups."_order",
    'migrated-homepage-groups-' || groups."_parent_id",
    'migrated-homepage-column-' || groups."id",
    12 / counts."group_count"
  FROM "homepage_sections_groups" AS groups
  JOIN (
    SELECT "_parent_id", count(*) AS "group_count"
    FROM "homepage_sections_groups"
    GROUP BY "_parent_id"
  ) AS counts ON counts."_parent_id" = groups."_parent_id"
  WHERE counts."group_count" BETWEEN 2 AND 4;

  INSERT INTO "homepage_sections_blocks_card" (
    "_order", "_parent_id", "_path", "id", "title", "destination_page_id", "image_id"
  )
  SELECT
    CASE WHEN counts."group_count" BETWEEN 2 AND 4 THEN 1 ELSE groups."_order" END,
    groups."_parent_id",
    CASE
      WHEN counts."group_count" BETWEEN 2 AND 4
        THEN 'layout.0.columns.' || (groups."_order" - 1) || '.blocks'
      ELSE 'layout'
    END,
    groups."id", groups."name", groups."destination_page_id", groups."background_image_id"
  FROM "homepage_sections_groups" AS groups
  JOIN (
    SELECT "_parent_id", count(*) AS "group_count"
    FROM "homepage_sections_groups"
    GROUP BY "_parent_id"
  ) AS counts ON counts."_parent_id" = groups."_parent_id";

  INSERT INTO "homepage_sections_blocks_card_links" (
    "_order", "_parent_id", "id", "label", "appearance", "icon_name", "target_type",
    "event_cycle_id", "document_id", "category_id", "partner_id", "page_id", "tag_id",
    "post_id", "event_id", "custom_scheme", "custom_address", "open_in_new_tab"
  )
  SELECT items."_order", items."_parent_id", items."id", items."label",
    items."appearance"::text::"public"."appearance",
    items."icon_name"::text::"public"."enum_homepage_sections_blocks_card_links_icon_name",
    items."target_type"::text::"public"."target",
    items."event_cycle_id", items."document_id", items."category_id", items."partner_id",
    items."page_id", items."tag_id", items."post_id", items."event_id",
    items."custom_scheme"::text::"public"."scheme", items."custom_address",
    items."open_in_new_tab"
  FROM "homepage_sections_groups_menu_items" AS items;
  
  DROP TABLE "homepage_sections_groups_menu_items" CASCADE;
  DROP TABLE "homepage_sections_groups" CASCADE;
  ALTER TABLE "pages_blocks_card_links" ADD CONSTRAINT "pages_blocks_card_links_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_card_links" ADD CONSTRAINT "pages_blocks_card_links_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_card_links" ADD CONSTRAINT "pages_blocks_card_links_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_card_links" ADD CONSTRAINT "pages_blocks_card_links_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_card_links" ADD CONSTRAINT "pages_blocks_card_links_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_card_links" ADD CONSTRAINT "pages_blocks_card_links_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_card_links" ADD CONSTRAINT "pages_blocks_card_links_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_card_links" ADD CONSTRAINT "pages_blocks_card_links_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_card_links" ADD CONSTRAINT "pages_blocks_card_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_card"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_card" ADD CONSTRAINT "pages_blocks_card_destination_page_id_pages_id_fk" FOREIGN KEY ("destination_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_card" ADD CONSTRAINT "pages_blocks_card_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_card" ADD CONSTRAINT "pages_blocks_card_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_card_links" ADD CONSTRAINT "_pages_v_blocks_card_links_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_card_links" ADD CONSTRAINT "_pages_v_blocks_card_links_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_card_links" ADD CONSTRAINT "_pages_v_blocks_card_links_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_card_links" ADD CONSTRAINT "_pages_v_blocks_card_links_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_card_links" ADD CONSTRAINT "_pages_v_blocks_card_links_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_card_links" ADD CONSTRAINT "_pages_v_blocks_card_links_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_card_links" ADD CONSTRAINT "_pages_v_blocks_card_links_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_card_links" ADD CONSTRAINT "_pages_v_blocks_card_links_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_card_links" ADD CONSTRAINT "_pages_v_blocks_card_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_card"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_card" ADD CONSTRAINT "_pages_v_blocks_card_destination_page_id_pages_id_fk" FOREIGN KEY ("destination_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_card" ADD CONSTRAINT "_pages_v_blocks_card_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_card" ADD CONSTRAINT "_pages_v_blocks_card_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_card_links" ADD CONSTRAINT "posts_blocks_card_links_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_card_links" ADD CONSTRAINT "posts_blocks_card_links_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_card_links" ADD CONSTRAINT "posts_blocks_card_links_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_card_links" ADD CONSTRAINT "posts_blocks_card_links_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_card_links" ADD CONSTRAINT "posts_blocks_card_links_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_card_links" ADD CONSTRAINT "posts_blocks_card_links_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_card_links" ADD CONSTRAINT "posts_blocks_card_links_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_card_links" ADD CONSTRAINT "posts_blocks_card_links_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_card_links" ADD CONSTRAINT "posts_blocks_card_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_card"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_card" ADD CONSTRAINT "posts_blocks_card_destination_page_id_pages_id_fk" FOREIGN KEY ("destination_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_card" ADD CONSTRAINT "posts_blocks_card_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_card" ADD CONSTRAINT "posts_blocks_card_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_card_links" ADD CONSTRAINT "_posts_v_blocks_card_links_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_card_links" ADD CONSTRAINT "_posts_v_blocks_card_links_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_card_links" ADD CONSTRAINT "_posts_v_blocks_card_links_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_card_links" ADD CONSTRAINT "_posts_v_blocks_card_links_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_card_links" ADD CONSTRAINT "_posts_v_blocks_card_links_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_card_links" ADD CONSTRAINT "_posts_v_blocks_card_links_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_card_links" ADD CONSTRAINT "_posts_v_blocks_card_links_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_card_links" ADD CONSTRAINT "_posts_v_blocks_card_links_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_card_links" ADD CONSTRAINT "_posts_v_blocks_card_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_card"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_card" ADD CONSTRAINT "_posts_v_blocks_card_destination_page_id_pages_id_fk" FOREIGN KEY ("destination_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_card" ADD CONSTRAINT "_posts_v_blocks_card_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_card" ADD CONSTRAINT "_posts_v_blocks_card_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_blocks_card_links" ADD CONSTRAINT "events_blocks_card_links_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_card_links" ADD CONSTRAINT "events_blocks_card_links_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_card_links" ADD CONSTRAINT "events_blocks_card_links_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_card_links" ADD CONSTRAINT "events_blocks_card_links_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_card_links" ADD CONSTRAINT "events_blocks_card_links_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_card_links" ADD CONSTRAINT "events_blocks_card_links_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_card_links" ADD CONSTRAINT "events_blocks_card_links_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_card_links" ADD CONSTRAINT "events_blocks_card_links_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_card_links" ADD CONSTRAINT "events_blocks_card_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events_blocks_card"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_blocks_card" ADD CONSTRAINT "events_blocks_card_destination_page_id_pages_id_fk" FOREIGN KEY ("destination_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_card" ADD CONSTRAINT "events_blocks_card_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_card" ADD CONSTRAINT "events_blocks_card_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_card_links" ADD CONSTRAINT "_events_v_blocks_card_links_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_card_links" ADD CONSTRAINT "_events_v_blocks_card_links_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_card_links" ADD CONSTRAINT "_events_v_blocks_card_links_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_card_links" ADD CONSTRAINT "_events_v_blocks_card_links_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_card_links" ADD CONSTRAINT "_events_v_blocks_card_links_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_card_links" ADD CONSTRAINT "_events_v_blocks_card_links_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_card_links" ADD CONSTRAINT "_events_v_blocks_card_links_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_card_links" ADD CONSTRAINT "_events_v_blocks_card_links_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_card_links" ADD CONSTRAINT "_events_v_blocks_card_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v_blocks_card"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_card" ADD CONSTRAINT "_events_v_blocks_card_destination_page_id_pages_id_fk" FOREIGN KEY ("destination_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_card" ADD CONSTRAINT "_events_v_blocks_card_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_card" ADD CONSTRAINT "_events_v_blocks_card_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_card_links" ADD CONSTRAINT "event_cycles_blocks_card_links_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_card_links" ADD CONSTRAINT "event_cycles_blocks_card_links_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_card_links" ADD CONSTRAINT "event_cycles_blocks_card_links_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_card_links" ADD CONSTRAINT "event_cycles_blocks_card_links_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_card_links" ADD CONSTRAINT "event_cycles_blocks_card_links_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_card_links" ADD CONSTRAINT "event_cycles_blocks_card_links_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_card_links" ADD CONSTRAINT "event_cycles_blocks_card_links_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_card_links" ADD CONSTRAINT "event_cycles_blocks_card_links_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_card_links" ADD CONSTRAINT "event_cycles_blocks_card_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_cycles_blocks_card"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_card" ADD CONSTRAINT "event_cycles_blocks_card_destination_page_id_pages_id_fk" FOREIGN KEY ("destination_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_card" ADD CONSTRAINT "event_cycles_blocks_card_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_card" ADD CONSTRAINT "event_cycles_blocks_card_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_cycles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_card_links" ADD CONSTRAINT "_event_cycles_v_blocks_card_links_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_card_links" ADD CONSTRAINT "_event_cycles_v_blocks_card_links_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_card_links" ADD CONSTRAINT "_event_cycles_v_blocks_card_links_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_card_links" ADD CONSTRAINT "_event_cycles_v_blocks_card_links_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_card_links" ADD CONSTRAINT "_event_cycles_v_blocks_card_links_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_card_links" ADD CONSTRAINT "_event_cycles_v_blocks_card_links_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_card_links" ADD CONSTRAINT "_event_cycles_v_blocks_card_links_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_card_links" ADD CONSTRAINT "_event_cycles_v_blocks_card_links_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_card_links" ADD CONSTRAINT "_event_cycles_v_blocks_card_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_event_cycles_v_blocks_card"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_card" ADD CONSTRAINT "_event_cycles_v_blocks_card_destination_page_id_pages_id_fk" FOREIGN KEY ("destination_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_card" ADD CONSTRAINT "_event_cycles_v_blocks_card_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_card" ADD CONSTRAINT "_event_cycles_v_blocks_card_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_event_cycles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_blocks_card_links" ADD CONSTRAINT "partners_blocks_card_links_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_card_links" ADD CONSTRAINT "partners_blocks_card_links_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_card_links" ADD CONSTRAINT "partners_blocks_card_links_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_card_links" ADD CONSTRAINT "partners_blocks_card_links_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_card_links" ADD CONSTRAINT "partners_blocks_card_links_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_card_links" ADD CONSTRAINT "partners_blocks_card_links_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_card_links" ADD CONSTRAINT "partners_blocks_card_links_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_card_links" ADD CONSTRAINT "partners_blocks_card_links_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_card_links" ADD CONSTRAINT "partners_blocks_card_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners_blocks_card"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_blocks_card" ADD CONSTRAINT "partners_blocks_card_destination_page_id_pages_id_fk" FOREIGN KEY ("destination_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_card" ADD CONSTRAINT "partners_blocks_card_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_card" ADD CONSTRAINT "partners_blocks_card_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_card_links" ADD CONSTRAINT "_partners_v_blocks_card_links_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_card_links" ADD CONSTRAINT "_partners_v_blocks_card_links_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_card_links" ADD CONSTRAINT "_partners_v_blocks_card_links_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_card_links" ADD CONSTRAINT "_partners_v_blocks_card_links_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_card_links" ADD CONSTRAINT "_partners_v_blocks_card_links_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_card_links" ADD CONSTRAINT "_partners_v_blocks_card_links_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_card_links" ADD CONSTRAINT "_partners_v_blocks_card_links_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_card_links" ADD CONSTRAINT "_partners_v_blocks_card_links_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_card_links" ADD CONSTRAINT "_partners_v_blocks_card_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partners_v_blocks_card"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_card" ADD CONSTRAINT "_partners_v_blocks_card_destination_page_id_pages_id_fk" FOREIGN KEY ("destination_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_card" ADD CONSTRAINT "_partners_v_blocks_card_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_card" ADD CONSTRAINT "_partners_v_blocks_card_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partners_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_rich_text" ADD CONSTRAINT "homepage_sections_blocks_rich_text_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_rich_text" ADD CONSTRAINT "homepage_sections_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_heading" ADD CONSTRAINT "homepage_sections_blocks_heading_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_action_links_items" ADD CONSTRAINT "homepage_sections_blocks_action_links_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_action_links_items" ADD CONSTRAINT "homepage_sections_blocks_action_links_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_action_links_items" ADD CONSTRAINT "homepage_sections_blocks_action_links_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_action_links_items" ADD CONSTRAINT "homepage_sections_blocks_action_links_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_action_links_items" ADD CONSTRAINT "homepage_sections_blocks_action_links_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_action_links_items" ADD CONSTRAINT "homepage_sections_blocks_action_links_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_action_links_items" ADD CONSTRAINT "homepage_sections_blocks_action_links_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_action_links_items" ADD CONSTRAINT "homepage_sections_blocks_action_links_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_action_links_items" ADD CONSTRAINT "homepage_sections_blocks_action_links_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections_blocks_action_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_action_links" ADD CONSTRAINT "homepage_sections_blocks_action_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_card_links" ADD CONSTRAINT "homepage_sections_blocks_card_links_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_card_links" ADD CONSTRAINT "homepage_sections_blocks_card_links_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_card_links" ADD CONSTRAINT "homepage_sections_blocks_card_links_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_card_links" ADD CONSTRAINT "homepage_sections_blocks_card_links_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_card_links" ADD CONSTRAINT "homepage_sections_blocks_card_links_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_card_links" ADD CONSTRAINT "homepage_sections_blocks_card_links_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_card_links" ADD CONSTRAINT "homepage_sections_blocks_card_links_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_card_links" ADD CONSTRAINT "homepage_sections_blocks_card_links_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_card_links" ADD CONSTRAINT "homepage_sections_blocks_card_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections_blocks_card"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_card" ADD CONSTRAINT "homepage_sections_blocks_card_destination_page_id_pages_id_fk" FOREIGN KEY ("destination_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_card" ADD CONSTRAINT "homepage_sections_blocks_card_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_card" ADD CONSTRAINT "homepage_sections_blocks_card_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_listing_items" ADD CONSTRAINT "homepage_sections_blocks_listing_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections_blocks_listing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_listing_sources" ADD CONSTRAINT "homepage_sections_blocks_listing_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage_sections_blocks_listing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_listing" ADD CONSTRAINT "homepage_sections_blocks_listing_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_listing" ADD CONSTRAINT "homepage_sections_blocks_listing_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_listing" ADD CONSTRAINT "homepage_sections_blocks_listing_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_listing" ADD CONSTRAINT "homepage_sections_blocks_listing_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_listing" ADD CONSTRAINT "homepage_sections_blocks_listing_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_listing" ADD CONSTRAINT "homepage_sections_blocks_listing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_media_gallery_items" ADD CONSTRAINT "homepage_sections_blocks_media_gallery_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_media_gallery_items" ADD CONSTRAINT "homepage_sections_blocks_media_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections_blocks_media_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_media_gallery" ADD CONSTRAINT "homepage_sections_blocks_media_gallery_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_media_gallery" ADD CONSTRAINT "homepage_sections_blocks_media_gallery_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_media_gallery" ADD CONSTRAINT "homepage_sections_blocks_media_gallery_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_media_gallery" ADD CONSTRAINT "homepage_sections_blocks_media_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_documents_items" ADD CONSTRAINT "homepage_sections_blocks_documents_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_documents_items" ADD CONSTRAINT "homepage_sections_blocks_documents_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections_blocks_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_documents" ADD CONSTRAINT "homepage_sections_blocks_documents_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_documents" ADD CONSTRAINT "homepage_sections_blocks_documents_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_documents" ADD CONSTRAINT "homepage_sections_blocks_documents_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_documents" ADD CONSTRAINT "homepage_sections_blocks_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_attachments_items" ADD CONSTRAINT "homepage_sections_blocks_attachments_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_attachments_items" ADD CONSTRAINT "homepage_sections_blocks_attachments_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections_blocks_attachments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_attachments" ADD CONSTRAINT "homepage_sections_blocks_attachments_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_attachments" ADD CONSTRAINT "homepage_sections_blocks_attachments_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_attachments" ADD CONSTRAINT "homepage_sections_blocks_attachments_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_attachments" ADD CONSTRAINT "homepage_sections_blocks_attachments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_member_profiles_entries" ADD CONSTRAINT "homepage_sections_blocks_member_profiles_entries_profile_id_member_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."member_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_member_profiles_entries" ADD CONSTRAINT "homepage_sections_blocks_member_profiles_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections_blocks_member_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_member_profiles" ADD CONSTRAINT "homepage_sections_blocks_member_profiles_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_member_profiles" ADD CONSTRAINT "homepage_sections_blocks_member_profiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_column_layout_columns" ADD CONSTRAINT "homepage_sections_blocks_column_layout_columns_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_column_layout_columns" ADD CONSTRAINT "homepage_sections_blocks_column_layout_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections_blocks_column_layout"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_column_layout" ADD CONSTRAINT "homepage_sections_blocks_column_layout_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_column_layout" ADD CONSTRAINT "homepage_sections_blocks_column_layout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_section_group_sections" ADD CONSTRAINT "homepage_sections_blocks_section_group_sections_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_section_group_sections" ADD CONSTRAINT "homepage_sections_blocks_section_group_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections_blocks_section_group"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_section_group" ADD CONSTRAINT "homepage_sections_blocks_section_group_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_section_group" ADD CONSTRAINT "homepage_sections_blocks_section_group_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_rels" ADD CONSTRAINT "homepage_sections_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_rels" ADD CONSTRAINT "homepage_sections_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_rels" ADD CONSTRAINT "homepage_sections_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_rels" ADD CONSTRAINT "homepage_sections_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_rels" ADD CONSTRAINT "homepage_sections_rels_event_cycles_fk" FOREIGN KEY ("event_cycles_id") REFERENCES "public"."event_cycles"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_card_links_order_idx" ON "pages_blocks_card_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_card_links_parent_id_idx" ON "pages_blocks_card_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_card_links_event_cycle_idx" ON "pages_blocks_card_links" USING btree ("event_cycle_id");
  CREATE INDEX "pages_blocks_card_links_document_idx" ON "pages_blocks_card_links" USING btree ("document_id");
  CREATE INDEX "pages_blocks_card_links_category_idx" ON "pages_blocks_card_links" USING btree ("category_id");
  CREATE INDEX "pages_blocks_card_links_partner_idx" ON "pages_blocks_card_links" USING btree ("partner_id");
  CREATE INDEX "pages_blocks_card_links_page_idx" ON "pages_blocks_card_links" USING btree ("page_id");
  CREATE INDEX "pages_blocks_card_links_tag_idx" ON "pages_blocks_card_links" USING btree ("tag_id");
  CREATE INDEX "pages_blocks_card_links_post_idx" ON "pages_blocks_card_links" USING btree ("post_id");
  CREATE INDEX "pages_blocks_card_links_event_idx" ON "pages_blocks_card_links" USING btree ("event_id");
  CREATE INDEX "pages_blocks_card_order_idx" ON "pages_blocks_card" USING btree ("_order");
  CREATE INDEX "pages_blocks_card_parent_id_idx" ON "pages_blocks_card" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_card_path_idx" ON "pages_blocks_card" USING btree ("_path");
  CREATE INDEX "pages_blocks_card_destination_page_idx" ON "pages_blocks_card" USING btree ("destination_page_id");
  CREATE INDEX "pages_blocks_card_image_idx" ON "pages_blocks_card" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_card_links_order_idx" ON "_pages_v_blocks_card_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_card_links_parent_id_idx" ON "_pages_v_blocks_card_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_card_links_event_cycle_idx" ON "_pages_v_blocks_card_links" USING btree ("event_cycle_id");
  CREATE INDEX "_pages_v_blocks_card_links_document_idx" ON "_pages_v_blocks_card_links" USING btree ("document_id");
  CREATE INDEX "_pages_v_blocks_card_links_category_idx" ON "_pages_v_blocks_card_links" USING btree ("category_id");
  CREATE INDEX "_pages_v_blocks_card_links_partner_idx" ON "_pages_v_blocks_card_links" USING btree ("partner_id");
  CREATE INDEX "_pages_v_blocks_card_links_page_idx" ON "_pages_v_blocks_card_links" USING btree ("page_id");
  CREATE INDEX "_pages_v_blocks_card_links_tag_idx" ON "_pages_v_blocks_card_links" USING btree ("tag_id");
  CREATE INDEX "_pages_v_blocks_card_links_post_idx" ON "_pages_v_blocks_card_links" USING btree ("post_id");
  CREATE INDEX "_pages_v_blocks_card_links_event_idx" ON "_pages_v_blocks_card_links" USING btree ("event_id");
  CREATE INDEX "_pages_v_blocks_card_order_idx" ON "_pages_v_blocks_card" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_card_parent_id_idx" ON "_pages_v_blocks_card" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_card_path_idx" ON "_pages_v_blocks_card" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_card_destination_page_idx" ON "_pages_v_blocks_card" USING btree ("destination_page_id");
  CREATE INDEX "_pages_v_blocks_card_image_idx" ON "_pages_v_blocks_card" USING btree ("image_id");
  CREATE INDEX "posts_blocks_card_links_order_idx" ON "posts_blocks_card_links" USING btree ("_order");
  CREATE INDEX "posts_blocks_card_links_parent_id_idx" ON "posts_blocks_card_links" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_card_links_event_cycle_idx" ON "posts_blocks_card_links" USING btree ("event_cycle_id");
  CREATE INDEX "posts_blocks_card_links_document_idx" ON "posts_blocks_card_links" USING btree ("document_id");
  CREATE INDEX "posts_blocks_card_links_category_idx" ON "posts_blocks_card_links" USING btree ("category_id");
  CREATE INDEX "posts_blocks_card_links_partner_idx" ON "posts_blocks_card_links" USING btree ("partner_id");
  CREATE INDEX "posts_blocks_card_links_page_idx" ON "posts_blocks_card_links" USING btree ("page_id");
  CREATE INDEX "posts_blocks_card_links_tag_idx" ON "posts_blocks_card_links" USING btree ("tag_id");
  CREATE INDEX "posts_blocks_card_links_post_idx" ON "posts_blocks_card_links" USING btree ("post_id");
  CREATE INDEX "posts_blocks_card_links_event_idx" ON "posts_blocks_card_links" USING btree ("event_id");
  CREATE INDEX "posts_blocks_card_order_idx" ON "posts_blocks_card" USING btree ("_order");
  CREATE INDEX "posts_blocks_card_parent_id_idx" ON "posts_blocks_card" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_card_path_idx" ON "posts_blocks_card" USING btree ("_path");
  CREATE INDEX "posts_blocks_card_destination_page_idx" ON "posts_blocks_card" USING btree ("destination_page_id");
  CREATE INDEX "posts_blocks_card_image_idx" ON "posts_blocks_card" USING btree ("image_id");
  CREATE INDEX "_posts_v_blocks_card_links_order_idx" ON "_posts_v_blocks_card_links" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_card_links_parent_id_idx" ON "_posts_v_blocks_card_links" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_card_links_event_cycle_idx" ON "_posts_v_blocks_card_links" USING btree ("event_cycle_id");
  CREATE INDEX "_posts_v_blocks_card_links_document_idx" ON "_posts_v_blocks_card_links" USING btree ("document_id");
  CREATE INDEX "_posts_v_blocks_card_links_category_idx" ON "_posts_v_blocks_card_links" USING btree ("category_id");
  CREATE INDEX "_posts_v_blocks_card_links_partner_idx" ON "_posts_v_blocks_card_links" USING btree ("partner_id");
  CREATE INDEX "_posts_v_blocks_card_links_page_idx" ON "_posts_v_blocks_card_links" USING btree ("page_id");
  CREATE INDEX "_posts_v_blocks_card_links_tag_idx" ON "_posts_v_blocks_card_links" USING btree ("tag_id");
  CREATE INDEX "_posts_v_blocks_card_links_post_idx" ON "_posts_v_blocks_card_links" USING btree ("post_id");
  CREATE INDEX "_posts_v_blocks_card_links_event_idx" ON "_posts_v_blocks_card_links" USING btree ("event_id");
  CREATE INDEX "_posts_v_blocks_card_order_idx" ON "_posts_v_blocks_card" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_card_parent_id_idx" ON "_posts_v_blocks_card" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_card_path_idx" ON "_posts_v_blocks_card" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_card_destination_page_idx" ON "_posts_v_blocks_card" USING btree ("destination_page_id");
  CREATE INDEX "_posts_v_blocks_card_image_idx" ON "_posts_v_blocks_card" USING btree ("image_id");
  CREATE INDEX "events_blocks_card_links_order_idx" ON "events_blocks_card_links" USING btree ("_order");
  CREATE INDEX "events_blocks_card_links_parent_id_idx" ON "events_blocks_card_links" USING btree ("_parent_id");
  CREATE INDEX "events_blocks_card_links_event_cycle_idx" ON "events_blocks_card_links" USING btree ("event_cycle_id");
  CREATE INDEX "events_blocks_card_links_document_idx" ON "events_blocks_card_links" USING btree ("document_id");
  CREATE INDEX "events_blocks_card_links_category_idx" ON "events_blocks_card_links" USING btree ("category_id");
  CREATE INDEX "events_blocks_card_links_partner_idx" ON "events_blocks_card_links" USING btree ("partner_id");
  CREATE INDEX "events_blocks_card_links_page_idx" ON "events_blocks_card_links" USING btree ("page_id");
  CREATE INDEX "events_blocks_card_links_tag_idx" ON "events_blocks_card_links" USING btree ("tag_id");
  CREATE INDEX "events_blocks_card_links_post_idx" ON "events_blocks_card_links" USING btree ("post_id");
  CREATE INDEX "events_blocks_card_links_event_idx" ON "events_blocks_card_links" USING btree ("event_id");
  CREATE INDEX "events_blocks_card_order_idx" ON "events_blocks_card" USING btree ("_order");
  CREATE INDEX "events_blocks_card_parent_id_idx" ON "events_blocks_card" USING btree ("_parent_id");
  CREATE INDEX "events_blocks_card_path_idx" ON "events_blocks_card" USING btree ("_path");
  CREATE INDEX "events_blocks_card_destination_page_idx" ON "events_blocks_card" USING btree ("destination_page_id");
  CREATE INDEX "events_blocks_card_image_idx" ON "events_blocks_card" USING btree ("image_id");
  CREATE INDEX "_events_v_blocks_card_links_order_idx" ON "_events_v_blocks_card_links" USING btree ("_order");
  CREATE INDEX "_events_v_blocks_card_links_parent_id_idx" ON "_events_v_blocks_card_links" USING btree ("_parent_id");
  CREATE INDEX "_events_v_blocks_card_links_event_cycle_idx" ON "_events_v_blocks_card_links" USING btree ("event_cycle_id");
  CREATE INDEX "_events_v_blocks_card_links_document_idx" ON "_events_v_blocks_card_links" USING btree ("document_id");
  CREATE INDEX "_events_v_blocks_card_links_category_idx" ON "_events_v_blocks_card_links" USING btree ("category_id");
  CREATE INDEX "_events_v_blocks_card_links_partner_idx" ON "_events_v_blocks_card_links" USING btree ("partner_id");
  CREATE INDEX "_events_v_blocks_card_links_page_idx" ON "_events_v_blocks_card_links" USING btree ("page_id");
  CREATE INDEX "_events_v_blocks_card_links_tag_idx" ON "_events_v_blocks_card_links" USING btree ("tag_id");
  CREATE INDEX "_events_v_blocks_card_links_post_idx" ON "_events_v_blocks_card_links" USING btree ("post_id");
  CREATE INDEX "_events_v_blocks_card_links_event_idx" ON "_events_v_blocks_card_links" USING btree ("event_id");
  CREATE INDEX "_events_v_blocks_card_order_idx" ON "_events_v_blocks_card" USING btree ("_order");
  CREATE INDEX "_events_v_blocks_card_parent_id_idx" ON "_events_v_blocks_card" USING btree ("_parent_id");
  CREATE INDEX "_events_v_blocks_card_path_idx" ON "_events_v_blocks_card" USING btree ("_path");
  CREATE INDEX "_events_v_blocks_card_destination_page_idx" ON "_events_v_blocks_card" USING btree ("destination_page_id");
  CREATE INDEX "_events_v_blocks_card_image_idx" ON "_events_v_blocks_card" USING btree ("image_id");
  CREATE INDEX "event_cycles_blocks_card_links_order_idx" ON "event_cycles_blocks_card_links" USING btree ("_order");
  CREATE INDEX "event_cycles_blocks_card_links_parent_id_idx" ON "event_cycles_blocks_card_links" USING btree ("_parent_id");
  CREATE INDEX "event_cycles_blocks_card_links_event_cycle_idx" ON "event_cycles_blocks_card_links" USING btree ("event_cycle_id");
  CREATE INDEX "event_cycles_blocks_card_links_document_idx" ON "event_cycles_blocks_card_links" USING btree ("document_id");
  CREATE INDEX "event_cycles_blocks_card_links_category_idx" ON "event_cycles_blocks_card_links" USING btree ("category_id");
  CREATE INDEX "event_cycles_blocks_card_links_partner_idx" ON "event_cycles_blocks_card_links" USING btree ("partner_id");
  CREATE INDEX "event_cycles_blocks_card_links_page_idx" ON "event_cycles_blocks_card_links" USING btree ("page_id");
  CREATE INDEX "event_cycles_blocks_card_links_tag_idx" ON "event_cycles_blocks_card_links" USING btree ("tag_id");
  CREATE INDEX "event_cycles_blocks_card_links_post_idx" ON "event_cycles_blocks_card_links" USING btree ("post_id");
  CREATE INDEX "event_cycles_blocks_card_links_event_idx" ON "event_cycles_blocks_card_links" USING btree ("event_id");
  CREATE INDEX "event_cycles_blocks_card_order_idx" ON "event_cycles_blocks_card" USING btree ("_order");
  CREATE INDEX "event_cycles_blocks_card_parent_id_idx" ON "event_cycles_blocks_card" USING btree ("_parent_id");
  CREATE INDEX "event_cycles_blocks_card_path_idx" ON "event_cycles_blocks_card" USING btree ("_path");
  CREATE INDEX "event_cycles_blocks_card_destination_page_idx" ON "event_cycles_blocks_card" USING btree ("destination_page_id");
  CREATE INDEX "event_cycles_blocks_card_image_idx" ON "event_cycles_blocks_card" USING btree ("image_id");
  CREATE INDEX "_event_cycles_v_blocks_card_links_order_idx" ON "_event_cycles_v_blocks_card_links" USING btree ("_order");
  CREATE INDEX "_event_cycles_v_blocks_card_links_parent_id_idx" ON "_event_cycles_v_blocks_card_links" USING btree ("_parent_id");
  CREATE INDEX "_event_cycles_v_blocks_card_links_event_cycle_idx" ON "_event_cycles_v_blocks_card_links" USING btree ("event_cycle_id");
  CREATE INDEX "_event_cycles_v_blocks_card_links_document_idx" ON "_event_cycles_v_blocks_card_links" USING btree ("document_id");
  CREATE INDEX "_event_cycles_v_blocks_card_links_category_idx" ON "_event_cycles_v_blocks_card_links" USING btree ("category_id");
  CREATE INDEX "_event_cycles_v_blocks_card_links_partner_idx" ON "_event_cycles_v_blocks_card_links" USING btree ("partner_id");
  CREATE INDEX "_event_cycles_v_blocks_card_links_page_idx" ON "_event_cycles_v_blocks_card_links" USING btree ("page_id");
  CREATE INDEX "_event_cycles_v_blocks_card_links_tag_idx" ON "_event_cycles_v_blocks_card_links" USING btree ("tag_id");
  CREATE INDEX "_event_cycles_v_blocks_card_links_post_idx" ON "_event_cycles_v_blocks_card_links" USING btree ("post_id");
  CREATE INDEX "_event_cycles_v_blocks_card_links_event_idx" ON "_event_cycles_v_blocks_card_links" USING btree ("event_id");
  CREATE INDEX "_event_cycles_v_blocks_card_order_idx" ON "_event_cycles_v_blocks_card" USING btree ("_order");
  CREATE INDEX "_event_cycles_v_blocks_card_parent_id_idx" ON "_event_cycles_v_blocks_card" USING btree ("_parent_id");
  CREATE INDEX "_event_cycles_v_blocks_card_path_idx" ON "_event_cycles_v_blocks_card" USING btree ("_path");
  CREATE INDEX "_event_cycles_v_blocks_card_destination_page_idx" ON "_event_cycles_v_blocks_card" USING btree ("destination_page_id");
  CREATE INDEX "_event_cycles_v_blocks_card_image_idx" ON "_event_cycles_v_blocks_card" USING btree ("image_id");
  CREATE INDEX "partners_blocks_card_links_order_idx" ON "partners_blocks_card_links" USING btree ("_order");
  CREATE INDEX "partners_blocks_card_links_parent_id_idx" ON "partners_blocks_card_links" USING btree ("_parent_id");
  CREATE INDEX "partners_blocks_card_links_event_cycle_idx" ON "partners_blocks_card_links" USING btree ("event_cycle_id");
  CREATE INDEX "partners_blocks_card_links_document_idx" ON "partners_blocks_card_links" USING btree ("document_id");
  CREATE INDEX "partners_blocks_card_links_category_idx" ON "partners_blocks_card_links" USING btree ("category_id");
  CREATE INDEX "partners_blocks_card_links_partner_idx" ON "partners_blocks_card_links" USING btree ("partner_id");
  CREATE INDEX "partners_blocks_card_links_page_idx" ON "partners_blocks_card_links" USING btree ("page_id");
  CREATE INDEX "partners_blocks_card_links_tag_idx" ON "partners_blocks_card_links" USING btree ("tag_id");
  CREATE INDEX "partners_blocks_card_links_post_idx" ON "partners_blocks_card_links" USING btree ("post_id");
  CREATE INDEX "partners_blocks_card_links_event_idx" ON "partners_blocks_card_links" USING btree ("event_id");
  CREATE INDEX "partners_blocks_card_order_idx" ON "partners_blocks_card" USING btree ("_order");
  CREATE INDEX "partners_blocks_card_parent_id_idx" ON "partners_blocks_card" USING btree ("_parent_id");
  CREATE INDEX "partners_blocks_card_path_idx" ON "partners_blocks_card" USING btree ("_path");
  CREATE INDEX "partners_blocks_card_destination_page_idx" ON "partners_blocks_card" USING btree ("destination_page_id");
  CREATE INDEX "partners_blocks_card_image_idx" ON "partners_blocks_card" USING btree ("image_id");
  CREATE INDEX "_partners_v_blocks_card_links_order_idx" ON "_partners_v_blocks_card_links" USING btree ("_order");
  CREATE INDEX "_partners_v_blocks_card_links_parent_id_idx" ON "_partners_v_blocks_card_links" USING btree ("_parent_id");
  CREATE INDEX "_partners_v_blocks_card_links_event_cycle_idx" ON "_partners_v_blocks_card_links" USING btree ("event_cycle_id");
  CREATE INDEX "_partners_v_blocks_card_links_document_idx" ON "_partners_v_blocks_card_links" USING btree ("document_id");
  CREATE INDEX "_partners_v_blocks_card_links_category_idx" ON "_partners_v_blocks_card_links" USING btree ("category_id");
  CREATE INDEX "_partners_v_blocks_card_links_partner_idx" ON "_partners_v_blocks_card_links" USING btree ("partner_id");
  CREATE INDEX "_partners_v_blocks_card_links_page_idx" ON "_partners_v_blocks_card_links" USING btree ("page_id");
  CREATE INDEX "_partners_v_blocks_card_links_tag_idx" ON "_partners_v_blocks_card_links" USING btree ("tag_id");
  CREATE INDEX "_partners_v_blocks_card_links_post_idx" ON "_partners_v_blocks_card_links" USING btree ("post_id");
  CREATE INDEX "_partners_v_blocks_card_links_event_idx" ON "_partners_v_blocks_card_links" USING btree ("event_id");
  CREATE INDEX "_partners_v_blocks_card_order_idx" ON "_partners_v_blocks_card" USING btree ("_order");
  CREATE INDEX "_partners_v_blocks_card_parent_id_idx" ON "_partners_v_blocks_card" USING btree ("_parent_id");
  CREATE INDEX "_partners_v_blocks_card_path_idx" ON "_partners_v_blocks_card" USING btree ("_path");
  CREATE INDEX "_partners_v_blocks_card_destination_page_idx" ON "_partners_v_blocks_card" USING btree ("destination_page_id");
  CREATE INDEX "_partners_v_blocks_card_image_idx" ON "_partners_v_blocks_card" USING btree ("image_id");
  CREATE INDEX "homepage_sections_blocks_rich_text_order_idx" ON "homepage_sections_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "homepage_sections_blocks_rich_text_parent_id_idx" ON "homepage_sections_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_blocks_rich_text_path_idx" ON "homepage_sections_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "homepage_sections_blocks_rich_text_surface_image_idx" ON "homepage_sections_blocks_rich_text" USING btree ("surface_image_id");
  CREATE INDEX "homepage_sections_blocks_heading_order_idx" ON "homepage_sections_blocks_heading" USING btree ("_order");
  CREATE INDEX "homepage_sections_blocks_heading_parent_id_idx" ON "homepage_sections_blocks_heading" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_blocks_heading_path_idx" ON "homepage_sections_blocks_heading" USING btree ("_path");
  CREATE INDEX "homepage_sections_blocks_action_links_items_order_idx" ON "homepage_sections_blocks_action_links_items" USING btree ("_order");
  CREATE INDEX "homepage_sections_blocks_action_links_items_parent_id_idx" ON "homepage_sections_blocks_action_links_items" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_blocks_action_links_items_event_cycle_idx" ON "homepage_sections_blocks_action_links_items" USING btree ("event_cycle_id");
  CREATE INDEX "homepage_sections_blocks_action_links_items_document_idx" ON "homepage_sections_blocks_action_links_items" USING btree ("document_id");
  CREATE INDEX "homepage_sections_blocks_action_links_items_category_idx" ON "homepage_sections_blocks_action_links_items" USING btree ("category_id");
  CREATE INDEX "homepage_sections_blocks_action_links_items_partner_idx" ON "homepage_sections_blocks_action_links_items" USING btree ("partner_id");
  CREATE INDEX "homepage_sections_blocks_action_links_items_page_idx" ON "homepage_sections_blocks_action_links_items" USING btree ("page_id");
  CREATE INDEX "homepage_sections_blocks_action_links_items_tag_idx" ON "homepage_sections_blocks_action_links_items" USING btree ("tag_id");
  CREATE INDEX "homepage_sections_blocks_action_links_items_post_idx" ON "homepage_sections_blocks_action_links_items" USING btree ("post_id");
  CREATE INDEX "homepage_sections_blocks_action_links_items_event_idx" ON "homepage_sections_blocks_action_links_items" USING btree ("event_id");
  CREATE INDEX "homepage_sections_blocks_action_links_order_idx" ON "homepage_sections_blocks_action_links" USING btree ("_order");
  CREATE INDEX "homepage_sections_blocks_action_links_parent_id_idx" ON "homepage_sections_blocks_action_links" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_blocks_action_links_path_idx" ON "homepage_sections_blocks_action_links" USING btree ("_path");
  CREATE INDEX "homepage_sections_blocks_card_links_order_idx" ON "homepage_sections_blocks_card_links" USING btree ("_order");
  CREATE INDEX "homepage_sections_blocks_card_links_parent_id_idx" ON "homepage_sections_blocks_card_links" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_blocks_card_links_event_cycle_idx" ON "homepage_sections_blocks_card_links" USING btree ("event_cycle_id");
  CREATE INDEX "homepage_sections_blocks_card_links_document_idx" ON "homepage_sections_blocks_card_links" USING btree ("document_id");
  CREATE INDEX "homepage_sections_blocks_card_links_category_idx" ON "homepage_sections_blocks_card_links" USING btree ("category_id");
  CREATE INDEX "homepage_sections_blocks_card_links_partner_idx" ON "homepage_sections_blocks_card_links" USING btree ("partner_id");
  CREATE INDEX "homepage_sections_blocks_card_links_page_idx" ON "homepage_sections_blocks_card_links" USING btree ("page_id");
  CREATE INDEX "homepage_sections_blocks_card_links_tag_idx" ON "homepage_sections_blocks_card_links" USING btree ("tag_id");
  CREATE INDEX "homepage_sections_blocks_card_links_post_idx" ON "homepage_sections_blocks_card_links" USING btree ("post_id");
  CREATE INDEX "homepage_sections_blocks_card_links_event_idx" ON "homepage_sections_blocks_card_links" USING btree ("event_id");
  CREATE INDEX "homepage_sections_blocks_card_order_idx" ON "homepage_sections_blocks_card" USING btree ("_order");
  CREATE INDEX "homepage_sections_blocks_card_parent_id_idx" ON "homepage_sections_blocks_card" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_blocks_card_path_idx" ON "homepage_sections_blocks_card" USING btree ("_path");
  CREATE INDEX "homepage_sections_blocks_card_destination_page_idx" ON "homepage_sections_blocks_card" USING btree ("destination_page_id");
  CREATE INDEX "homepage_sections_blocks_card_image_idx" ON "homepage_sections_blocks_card" USING btree ("image_id");
  CREATE INDEX "homepage_sections_blocks_listing_items_order_idx" ON "homepage_sections_blocks_listing_items" USING btree ("_order");
  CREATE INDEX "homepage_sections_blocks_listing_items_parent_id_idx" ON "homepage_sections_blocks_listing_items" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_blocks_listing_sources_order_idx" ON "homepage_sections_blocks_listing_sources" USING btree ("order");
  CREATE INDEX "homepage_sections_blocks_listing_sources_parent_idx" ON "homepage_sections_blocks_listing_sources" USING btree ("parent_id");
  CREATE INDEX "homepage_sections_blocks_listing_order_idx" ON "homepage_sections_blocks_listing" USING btree ("_order");
  CREATE INDEX "homepage_sections_blocks_listing_parent_id_idx" ON "homepage_sections_blocks_listing" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_blocks_listing_path_idx" ON "homepage_sections_blocks_listing" USING btree ("_path");
  CREATE INDEX "homepage_sections_blocks_listing_surface_image_idx" ON "homepage_sections_blocks_listing" USING btree ("surface_image_id");
  CREATE INDEX "homepage_sections_blocks_listing_parent_page_idx" ON "homepage_sections_blocks_listing" USING btree ("parent_page_id");
  CREATE INDEX "homepage_sections_blocks_listing_category_idx" ON "homepage_sections_blocks_listing" USING btree ("category_id");
  CREATE INDEX "homepage_sections_blocks_listing_tag_idx" ON "homepage_sections_blocks_listing" USING btree ("tag_id");
  CREATE INDEX "homepage_sections_blocks_listing_event_cycle_idx" ON "homepage_sections_blocks_listing" USING btree ("event_cycle_id");
  CREATE INDEX "homepage_sections_blocks_media_gallery_items_order_idx" ON "homepage_sections_blocks_media_gallery_items" USING btree ("_order");
  CREATE INDEX "homepage_sections_blocks_media_gallery_items_parent_id_idx" ON "homepage_sections_blocks_media_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_blocks_media_gallery_items_media_idx" ON "homepage_sections_blocks_media_gallery_items" USING btree ("media_id");
  CREATE INDEX "homepage_sections_blocks_media_gallery_order_idx" ON "homepage_sections_blocks_media_gallery" USING btree ("_order");
  CREATE INDEX "homepage_sections_blocks_media_gallery_parent_id_idx" ON "homepage_sections_blocks_media_gallery" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_blocks_media_gallery_path_idx" ON "homepage_sections_blocks_media_gallery" USING btree ("_path");
  CREATE INDEX "homepage_sections_blocks_media_gallery_surface_image_idx" ON "homepage_sections_blocks_media_gallery" USING btree ("surface_image_id");
  CREATE INDEX "homepage_sections_blocks_media_gallery_category_idx" ON "homepage_sections_blocks_media_gallery" USING btree ("category_id");
  CREATE INDEX "homepage_sections_blocks_media_gallery_tag_idx" ON "homepage_sections_blocks_media_gallery" USING btree ("tag_id");
  CREATE INDEX "homepage_sections_blocks_documents_items_order_idx" ON "homepage_sections_blocks_documents_items" USING btree ("_order");
  CREATE INDEX "homepage_sections_blocks_documents_items_parent_id_idx" ON "homepage_sections_blocks_documents_items" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_blocks_documents_items_document_idx" ON "homepage_sections_blocks_documents_items" USING btree ("document_id");
  CREATE INDEX "homepage_sections_blocks_documents_order_idx" ON "homepage_sections_blocks_documents" USING btree ("_order");
  CREATE INDEX "homepage_sections_blocks_documents_parent_id_idx" ON "homepage_sections_blocks_documents" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_blocks_documents_path_idx" ON "homepage_sections_blocks_documents" USING btree ("_path");
  CREATE INDEX "homepage_sections_blocks_documents_surface_image_idx" ON "homepage_sections_blocks_documents" USING btree ("surface_image_id");
  CREATE INDEX "homepage_sections_blocks_documents_category_idx" ON "homepage_sections_blocks_documents" USING btree ("category_id");
  CREATE INDEX "homepage_sections_blocks_documents_tag_idx" ON "homepage_sections_blocks_documents" USING btree ("tag_id");
  CREATE INDEX "homepage_sections_blocks_attachments_items_order_idx" ON "homepage_sections_blocks_attachments_items" USING btree ("_order");
  CREATE INDEX "homepage_sections_blocks_attachments_items_parent_id_idx" ON "homepage_sections_blocks_attachments_items" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_blocks_attachments_items_media_idx" ON "homepage_sections_blocks_attachments_items" USING btree ("media_id");
  CREATE INDEX "homepage_sections_blocks_attachments_order_idx" ON "homepage_sections_blocks_attachments" USING btree ("_order");
  CREATE INDEX "homepage_sections_blocks_attachments_parent_id_idx" ON "homepage_sections_blocks_attachments" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_blocks_attachments_path_idx" ON "homepage_sections_blocks_attachments" USING btree ("_path");
  CREATE INDEX "homepage_sections_blocks_attachments_surface_image_idx" ON "homepage_sections_blocks_attachments" USING btree ("surface_image_id");
  CREATE INDEX "homepage_sections_blocks_attachments_category_idx" ON "homepage_sections_blocks_attachments" USING btree ("category_id");
  CREATE INDEX "homepage_sections_blocks_attachments_tag_idx" ON "homepage_sections_blocks_attachments" USING btree ("tag_id");
  CREATE INDEX "homepage_sections_blocks_member_profiles_entries_order_idx" ON "homepage_sections_blocks_member_profiles_entries" USING btree ("_order");
  CREATE INDEX "homepage_sections_blocks_member_profiles_entries_parent_id_idx" ON "homepage_sections_blocks_member_profiles_entries" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_blocks_member_profiles_entries_profile_idx" ON "homepage_sections_blocks_member_profiles_entries" USING btree ("profile_id");
  CREATE INDEX "homepage_sections_blocks_member_profiles_order_idx" ON "homepage_sections_blocks_member_profiles" USING btree ("_order");
  CREATE INDEX "homepage_sections_blocks_member_profiles_parent_id_idx" ON "homepage_sections_blocks_member_profiles" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_blocks_member_profiles_path_idx" ON "homepage_sections_blocks_member_profiles" USING btree ("_path");
  CREATE INDEX "homepage_sections_blocks_member_profiles_surface_image_idx" ON "homepage_sections_blocks_member_profiles" USING btree ("surface_image_id");
  CREATE INDEX "homepage_sections_blocks_column_layout_columns_order_idx" ON "homepage_sections_blocks_column_layout_columns" USING btree ("_order");
  CREATE INDEX "homepage_sections_blocks_column_layout_columns_parent_id_idx" ON "homepage_sections_blocks_column_layout_columns" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_blocks_column_layout_columns_surface_i_idx" ON "homepage_sections_blocks_column_layout_columns" USING btree ("surface_image_id");
  CREATE INDEX "homepage_sections_blocks_column_layout_order_idx" ON "homepage_sections_blocks_column_layout" USING btree ("_order");
  CREATE INDEX "homepage_sections_blocks_column_layout_parent_id_idx" ON "homepage_sections_blocks_column_layout" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_blocks_column_layout_path_idx" ON "homepage_sections_blocks_column_layout" USING btree ("_path");
  CREATE INDEX "homepage_sections_blocks_column_layout_surface_image_idx" ON "homepage_sections_blocks_column_layout" USING btree ("surface_image_id");
  CREATE INDEX "homepage_sections_blocks_section_group_sections_order_idx" ON "homepage_sections_blocks_section_group_sections" USING btree ("_order");
  CREATE INDEX "homepage_sections_blocks_section_group_sections_parent_id_idx" ON "homepage_sections_blocks_section_group_sections" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_blocks_section_group_sections_surface__idx" ON "homepage_sections_blocks_section_group_sections" USING btree ("surface_image_id");
  CREATE INDEX "homepage_sections_blocks_section_group_order_idx" ON "homepage_sections_blocks_section_group" USING btree ("_order");
  CREATE INDEX "homepage_sections_blocks_section_group_parent_id_idx" ON "homepage_sections_blocks_section_group" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_blocks_section_group_path_idx" ON "homepage_sections_blocks_section_group" USING btree ("_path");
  CREATE INDEX "homepage_sections_blocks_section_group_surface_image_idx" ON "homepage_sections_blocks_section_group" USING btree ("surface_image_id");
  CREATE INDEX "homepage_sections_rels_order_idx" ON "homepage_sections_rels" USING btree ("order");
  CREATE INDEX "homepage_sections_rels_parent_idx" ON "homepage_sections_rels" USING btree ("parent_id");
  CREATE INDEX "homepage_sections_rels_path_idx" ON "homepage_sections_rels" USING btree ("path");
  CREATE INDEX "homepage_sections_rels_pages_id_idx" ON "homepage_sections_rels" USING btree ("pages_id");
  CREATE INDEX "homepage_sections_rels_posts_id_idx" ON "homepage_sections_rels" USING btree ("posts_id");
  CREATE INDEX "homepage_sections_rels_events_id_idx" ON "homepage_sections_rels" USING btree ("events_id");
  CREATE INDEX "homepage_sections_rels_event_cycles_id_idx" ON "homepage_sections_rels" USING btree ("event_cycles_id");
  ALTER TABLE "homepage_sections" DROP COLUMN "sections_title";
  DROP TYPE "public"."enum_homepage_sections_groups_menu_items_appearance";
  DROP TYPE "public"."enum_homepage_sections_groups_menu_items_icon_name";
  DROP TYPE "public"."enum_homepage_sections_groups_menu_items_target_type";
  DROP TYPE "public"."enum_homepage_sections_groups_menu_items_custom_scheme";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_homepage_sections_groups_menu_items_appearance" AS ENUM('link', 'primaryButton', 'secondaryButton');
  CREATE TYPE "public"."enum_homepage_sections_groups_menu_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_homepage_sections_groups_menu_items_target_type" AS ENUM('eventCycle', 'document', 'category', 'partner', 'page', 'tag', 'custom', 'post', 'event');
  CREATE TYPE "public"."enum_homepage_sections_groups_menu_items_custom_scheme" AS ENUM('https', 'http', 'mailto', 'tel', 'path', 'anchor');
  CREATE TABLE "homepage_sections_groups_menu_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "enum_homepage_sections_groups_menu_items_appearance" DEFAULT 'link' NOT NULL,
  	"icon_name" "enum_homepage_sections_groups_menu_items_icon_name",
  	"target_type" "enum_homepage_sections_groups_menu_items_target_type" DEFAULT 'custom' NOT NULL,
  	"event_cycle_id" integer,
  	"document_id" integer,
  	"category_id" integer,
  	"partner_id" integer,
  	"page_id" integer,
  	"tag_id" integer,
  	"post_id" integer,
  	"event_id" integer,
  	"custom_scheme" "enum_homepage_sections_groups_menu_items_custom_scheme" DEFAULT 'https',
  	"custom_address" varchar,
  	"open_in_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "homepage_sections_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"background_image_id" integer,
   	"destination_page_id" integer
  );

  INSERT INTO "homepage_sections_groups" (
    "_order", "_parent_id", "id", "name", "background_image_id", "destination_page_id"
  )
  SELECT row_number() OVER (
      PARTITION BY cards."_parent_id" ORDER BY cards."_path", cards."_order", cards."id"
    ),
    cards."_parent_id", cards."id", cards."title", cards."image_id",
    cards."destination_page_id"
  FROM "homepage_sections_blocks_card" AS cards;

  INSERT INTO "homepage_sections_groups_menu_items" (
    "_order", "_parent_id", "id", "label", "appearance", "icon_name", "target_type",
    "event_cycle_id", "document_id", "category_id", "partner_id", "page_id", "tag_id",
    "post_id", "event_id", "custom_scheme", "custom_address", "open_in_new_tab"
  )
  SELECT links."_order", links."_parent_id", links."id", links."label",
    links."appearance"::text::"public"."enum_homepage_sections_groups_menu_items_appearance",
    links."icon_name"::text::"public"."enum_homepage_sections_groups_menu_items_icon_name",
    links."target_type"::text::"public"."enum_homepage_sections_groups_menu_items_target_type",
    links."event_cycle_id", links."document_id", links."category_id", links."partner_id",
    links."page_id", links."tag_id", links."post_id", links."event_id",
    links."custom_scheme"::text::"public"."enum_homepage_sections_groups_menu_items_custom_scheme",
    links."custom_address", links."open_in_new_tab"
  FROM "homepage_sections_blocks_card_links" AS links
  WHERE links."target_type"::text <> 'siteContactEmail';
  
  DROP TABLE "pages_blocks_card_links" CASCADE;
  DROP TABLE "pages_blocks_card" CASCADE;
  DROP TABLE "_pages_v_blocks_card_links" CASCADE;
  DROP TABLE "_pages_v_blocks_card" CASCADE;
  DROP TABLE "posts_blocks_card_links" CASCADE;
  DROP TABLE "posts_blocks_card" CASCADE;
  DROP TABLE "_posts_v_blocks_card_links" CASCADE;
  DROP TABLE "_posts_v_blocks_card" CASCADE;
  DROP TABLE "events_blocks_card_links" CASCADE;
  DROP TABLE "events_blocks_card" CASCADE;
  DROP TABLE "_events_v_blocks_card_links" CASCADE;
  DROP TABLE "_events_v_blocks_card" CASCADE;
  DROP TABLE "event_cycles_blocks_card_links" CASCADE;
  DROP TABLE "event_cycles_blocks_card" CASCADE;
  DROP TABLE "_event_cycles_v_blocks_card_links" CASCADE;
  DROP TABLE "_event_cycles_v_blocks_card" CASCADE;
  DROP TABLE "partners_blocks_card_links" CASCADE;
  DROP TABLE "partners_blocks_card" CASCADE;
  DROP TABLE "_partners_v_blocks_card_links" CASCADE;
  DROP TABLE "_partners_v_blocks_card" CASCADE;
  DROP TABLE "homepage_sections_blocks_rich_text" CASCADE;
  DROP TABLE "homepage_sections_blocks_heading" CASCADE;
  DROP TABLE "homepage_sections_blocks_action_links_items" CASCADE;
  DROP TABLE "homepage_sections_blocks_action_links" CASCADE;
  DROP TABLE "homepage_sections_blocks_card_links" CASCADE;
  DROP TABLE "homepage_sections_blocks_card" CASCADE;
  DROP TABLE "homepage_sections_blocks_listing_items" CASCADE;
  DROP TABLE "homepage_sections_blocks_listing_sources" CASCADE;
  DROP TABLE "homepage_sections_blocks_listing" CASCADE;
  DROP TABLE "homepage_sections_blocks_media_gallery_items" CASCADE;
  DROP TABLE "homepage_sections_blocks_media_gallery" CASCADE;
  DROP TABLE "homepage_sections_blocks_documents_items" CASCADE;
  DROP TABLE "homepage_sections_blocks_documents" CASCADE;
  DROP TABLE "homepage_sections_blocks_attachments_items" CASCADE;
  DROP TABLE "homepage_sections_blocks_attachments" CASCADE;
  DROP TABLE "homepage_sections_blocks_member_profiles_entries" CASCADE;
  DROP TABLE "homepage_sections_blocks_member_profiles" CASCADE;
  DROP TABLE "homepage_sections_blocks_column_layout_columns" CASCADE;
  DROP TABLE "homepage_sections_blocks_column_layout" CASCADE;
  DROP TABLE "homepage_sections_blocks_section_group_sections" CASCADE;
  DROP TABLE "homepage_sections_blocks_section_group" CASCADE;
  DROP TABLE "homepage_sections_rels" CASCADE;
  ALTER TABLE "homepage_sections" ADD COLUMN "sections_title" varchar DEFAULT 'Sekcje';
  ALTER TABLE "homepage_sections_groups_menu_items" ADD CONSTRAINT "homepage_sections_groups_menu_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_groups_menu_items" ADD CONSTRAINT "homepage_sections_groups_menu_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_groups_menu_items" ADD CONSTRAINT "homepage_sections_groups_menu_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_groups_menu_items" ADD CONSTRAINT "homepage_sections_groups_menu_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_groups_menu_items" ADD CONSTRAINT "homepage_sections_groups_menu_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_groups_menu_items" ADD CONSTRAINT "homepage_sections_groups_menu_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_groups_menu_items" ADD CONSTRAINT "homepage_sections_groups_menu_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_groups_menu_items" ADD CONSTRAINT "homepage_sections_groups_menu_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_groups_menu_items" ADD CONSTRAINT "homepage_sections_groups_menu_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_groups" ADD CONSTRAINT "homepage_sections_groups_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_groups" ADD CONSTRAINT "homepage_sections_groups_destination_page_id_pages_id_fk" FOREIGN KEY ("destination_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_groups" ADD CONSTRAINT "homepage_sections_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "homepage_sections_groups_menu_items_order_idx" ON "homepage_sections_groups_menu_items" USING btree ("_order");
  CREATE INDEX "homepage_sections_groups_menu_items_parent_id_idx" ON "homepage_sections_groups_menu_items" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_groups_menu_items_event_cycle_idx" ON "homepage_sections_groups_menu_items" USING btree ("event_cycle_id");
  CREATE INDEX "homepage_sections_groups_menu_items_document_idx" ON "homepage_sections_groups_menu_items" USING btree ("document_id");
  CREATE INDEX "homepage_sections_groups_menu_items_category_idx" ON "homepage_sections_groups_menu_items" USING btree ("category_id");
  CREATE INDEX "homepage_sections_groups_menu_items_partner_idx" ON "homepage_sections_groups_menu_items" USING btree ("partner_id");
  CREATE INDEX "homepage_sections_groups_menu_items_page_idx" ON "homepage_sections_groups_menu_items" USING btree ("page_id");
  CREATE INDEX "homepage_sections_groups_menu_items_tag_idx" ON "homepage_sections_groups_menu_items" USING btree ("tag_id");
  CREATE INDEX "homepage_sections_groups_menu_items_post_idx" ON "homepage_sections_groups_menu_items" USING btree ("post_id");
  CREATE INDEX "homepage_sections_groups_menu_items_event_idx" ON "homepage_sections_groups_menu_items" USING btree ("event_id");
  CREATE INDEX "homepage_sections_groups_order_idx" ON "homepage_sections_groups" USING btree ("_order");
  CREATE INDEX "homepage_sections_groups_parent_id_idx" ON "homepage_sections_groups" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_groups_background_image_idx" ON "homepage_sections_groups" USING btree ("background_image_id");
  CREATE INDEX "homepage_sections_groups_destination_page_idx" ON "homepage_sections_groups" USING btree ("destination_page_id");
  DROP TYPE "public"."enum_pages_blocks_card_links_icon_name";
  DROP TYPE "public"."enum__pages_v_blocks_card_links_icon_name";
  DROP TYPE "public"."enum_posts_blocks_card_links_icon_name";
  DROP TYPE "public"."enum__posts_v_blocks_card_links_icon_name";
  DROP TYPE "public"."enum_events_blocks_card_links_icon_name";
  DROP TYPE "public"."enum__events_v_blocks_card_links_icon_name";
  DROP TYPE "public"."enum_event_cycles_blocks_card_links_icon_name";
  DROP TYPE "public"."enum__event_cycles_v_blocks_card_links_icon_name";
  DROP TYPE "public"."enum_partners_blocks_card_links_icon_name";
  DROP TYPE "public"."enum__partners_v_blocks_card_links_icon_name";
  DROP TYPE "public"."enum_homepage_sections_blocks_rich_text_text_style";
  DROP TYPE "public"."enum_homepage_sections_blocks_heading_heading_level";
  DROP TYPE "public"."enum_homepage_sections_blocks_heading_heading_icon_name";
  DROP TYPE "public"."enum_homepage_sections_blocks_action_links_items_icon_name";
  DROP TYPE "public"."enum_homepage_sections_blocks_action_links_layout";
  DROP TYPE "public"."enum_homepage_sections_blocks_action_links_alignment";
  DROP TYPE "public"."enum_homepage_sections_blocks_card_links_icon_name";
  DROP TYPE "public"."enum_homepage_sections_blocks_listing_sources";
  DROP TYPE "public"."enum_homepage_sections_blocks_listing_selection_mode";
  DROP TYPE "public"."enum_homepage_sections_blocks_listing_sort";
  DROP TYPE "public"."enum_homepage_sections_blocks_listing_view";
  DROP TYPE "public"."enum_homepage_sections_blocks_listing_event_time_filter";
  DROP TYPE "public"."enum_homepage_sections_blocks_listing_parent_filter";
  DROP TYPE "public"."enum_homepage_sections_blocks_media_gallery_selection_mode";
  DROP TYPE "public"."enum_homepage_sections_blocks_media_gallery_sort";
  DROP TYPE "public"."enum_homepage_sections_blocks_media_gallery_view";
  DROP TYPE "public"."enum_homepage_sections_blocks_documents_selection_mode";
  DROP TYPE "public"."enum_homepage_sections_blocks_documents_sort";
  DROP TYPE "public"."enum_homepage_sections_blocks_documents_view";
  DROP TYPE "public"."enum_homepage_sections_blocks_attachments_selection_mode";
  DROP TYPE "public"."enum_homepage_sections_blocks_attachments_sort";
  DROP TYPE "public"."enum_homepage_sections_blocks_attachments_view";
  DROP TYPE "public"."enum_homepage_sections_blocks_member_profiles_view";
  DROP TYPE "public"."enum_homepage_sections_blocks_column_layout_vertical_alignment";
  DROP TYPE "public"."enum_homepage_sections_blocks_column_layout_column_separators";`)
}
