import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_listing_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum__pages_v_blocks_listing_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum_posts_blocks_listing_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum__posts_v_blocks_listing_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum_events_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles');
  CREATE TYPE "public"."enum_events_blocks_listing_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending', 'eventDateAscending');
  CREATE TYPE "public"."enum_events_blocks_listing_view" AS ENUM('cards', 'compact', 'grid');
  CREATE TYPE "public"."enum_events_blocks_listing_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum_events_blocks_listing_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TYPE "public"."enum_events_blocks_media_gallery_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum_events_blocks_media_gallery_sort" AS ENUM('newest', 'oldest', 'nameAscending', 'nameDescending');
  CREATE TYPE "public"."enum_events_blocks_media_gallery_view" AS ENUM('cards', 'list', 'grid');
  CREATE TYPE "public"."enum_events_blocks_attachments_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum_events_blocks_attachments_sort" AS ENUM('newest', 'oldest', 'nameAscending', 'nameDescending');
  CREATE TYPE "public"."enum_events_blocks_attachments_view" AS ENUM('cards', 'list', 'grid');
  CREATE TYPE "public"."enum_events_partners_roles" AS ENUM('coOrganizer', 'sponsor', 'partner', 'patron', 'venueHost', 'support');
  CREATE TYPE "public"."enum_events_external_links_type" AS ENUM('eventPage', 'facebook', 'instagram', 'other');
  CREATE TYPE "public"."enum_events_time_mode" AS ENUM('timed', 'allDay');
  CREATE TYPE "public"."enum_events_event_status" AS ENUM('scheduled', 'cancelled', 'postponed', 'rescheduled');
  CREATE TYPE "public"."enum_events_participation" AS ENUM('public', 'members');
  CREATE TYPE "public"."enum_events_visibility" AS ENUM('public', 'members');
  CREATE TYPE "public"."enum_events_capacity_mode" AS ENUM('unlimited', 'exact', 'approximate');
  CREATE TYPE "public"."enum_events_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__events_v_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles');
  CREATE TYPE "public"."enum__events_v_blocks_listing_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending', 'eventDateAscending');
  CREATE TYPE "public"."enum__events_v_blocks_listing_view" AS ENUM('cards', 'compact', 'grid');
  CREATE TYPE "public"."enum__events_v_blocks_listing_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum__events_v_blocks_listing_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TYPE "public"."enum__events_v_blocks_media_gallery_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum__events_v_blocks_media_gallery_sort" AS ENUM('newest', 'oldest', 'nameAscending', 'nameDescending');
  CREATE TYPE "public"."enum__events_v_blocks_media_gallery_view" AS ENUM('cards', 'list', 'grid');
  CREATE TYPE "public"."enum__events_v_blocks_attachments_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum__events_v_blocks_attachments_sort" AS ENUM('newest', 'oldest', 'nameAscending', 'nameDescending');
  CREATE TYPE "public"."enum__events_v_blocks_attachments_view" AS ENUM('cards', 'list', 'grid');
  CREATE TYPE "public"."enum__events_v_version_partners_roles" AS ENUM('coOrganizer', 'sponsor', 'partner', 'patron', 'venueHost', 'support');
  CREATE TYPE "public"."enum__events_v_version_external_links_type" AS ENUM('eventPage', 'facebook', 'instagram', 'other');
  CREATE TYPE "public"."enum__events_v_version_time_mode" AS ENUM('timed', 'allDay');
  CREATE TYPE "public"."enum__events_v_version_event_status" AS ENUM('scheduled', 'cancelled', 'postponed', 'rescheduled');
  CREATE TYPE "public"."enum__events_v_version_participation" AS ENUM('public', 'members');
  CREATE TYPE "public"."enum__events_v_version_visibility" AS ENUM('public', 'members');
  CREATE TYPE "public"."enum__events_v_version_capacity_mode" AS ENUM('unlimited', 'exact', 'approximate');
  CREATE TYPE "public"."enum__events_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_event_cycles_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles');
  CREATE TYPE "public"."enum_event_cycles_blocks_listing_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending', 'eventDateAscending');
  CREATE TYPE "public"."enum_event_cycles_blocks_listing_view" AS ENUM('cards', 'compact', 'grid');
  CREATE TYPE "public"."enum_event_cycles_blocks_listing_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum_event_cycles_blocks_listing_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TYPE "public"."enum_event_cycles_blocks_media_gallery_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum_event_cycles_blocks_media_gallery_sort" AS ENUM('newest', 'oldest', 'nameAscending', 'nameDescending');
  CREATE TYPE "public"."enum_event_cycles_blocks_media_gallery_view" AS ENUM('cards', 'list', 'grid');
  CREATE TYPE "public"."enum_event_cycles_blocks_attachments_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum_event_cycles_blocks_attachments_sort" AS ENUM('newest', 'oldest', 'nameAscending', 'nameDescending');
  CREATE TYPE "public"."enum_event_cycles_blocks_attachments_view" AS ENUM('cards', 'list', 'grid');
  CREATE TYPE "public"."enum_event_cycles_event_defaults_partners_roles" AS ENUM('coOrganizer', 'sponsor', 'partner', 'patron', 'venueHost', 'support');
  CREATE TYPE "public"."enum_event_cycles_event_defaults_external_links_type" AS ENUM('eventPage', 'facebook', 'instagram', 'other');
  CREATE TYPE "public"."enum_event_cycles_visibility" AS ENUM('public', 'members');
  CREATE TYPE "public"."enum_event_cycles_event_defaults_default_time_mode" AS ENUM('timed', 'allDay');
  CREATE TYPE "public"."enum_event_cycles_event_defaults_participation" AS ENUM('public', 'members');
  CREATE TYPE "public"."enum_event_cycles_event_defaults_visibility" AS ENUM('public', 'members');
  CREATE TYPE "public"."enum_event_cycles_event_defaults_capacity_mode" AS ENUM('unlimited', 'exact', 'approximate');
  CREATE TYPE "public"."enum_event_cycles_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_listing_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending', 'eventDateAscending');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_listing_view" AS ENUM('cards', 'compact', 'grid');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_listing_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_listing_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_media_gallery_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_media_gallery_sort" AS ENUM('newest', 'oldest', 'nameAscending', 'nameDescending');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_media_gallery_view" AS ENUM('cards', 'list', 'grid');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_attachments_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_attachments_sort" AS ENUM('newest', 'oldest', 'nameAscending', 'nameDescending');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_attachments_view" AS ENUM('cards', 'list', 'grid');
  CREATE TYPE "public"."enum__event_cycles_v_version_event_defaults_partners_roles" AS ENUM('coOrganizer', 'sponsor', 'partner', 'patron', 'venueHost', 'support');
  CREATE TYPE "public"."enum__event_cycles_v_version_event_defaults_external_links_type" AS ENUM('eventPage', 'facebook', 'instagram', 'other');
  CREATE TYPE "public"."enum__event_cycles_v_version_visibility" AS ENUM('public', 'members');
  CREATE TYPE "public"."enum__event_cycles_v_version_event_defaults_default_time_mode" AS ENUM('timed', 'allDay');
  CREATE TYPE "public"."enum__event_cycles_v_version_event_defaults_participation" AS ENUM('public', 'members');
  CREATE TYPE "public"."enum__event_cycles_v_version_event_defaults_visibility" AS ENUM('public', 'members');
  CREATE TYPE "public"."enum__event_cycles_v_version_event_defaults_capacity_mode" AS ENUM('unlimited', 'exact', 'approximate');
  CREATE TYPE "public"."enum__event_cycles_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_partners_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles');
  CREATE TYPE "public"."enum_partners_blocks_listing_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending', 'eventDateAscending');
  CREATE TYPE "public"."enum_partners_blocks_listing_view" AS ENUM('cards', 'compact', 'grid');
  CREATE TYPE "public"."enum_partners_blocks_listing_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum_partners_blocks_listing_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TYPE "public"."enum_partners_blocks_media_gallery_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum_partners_blocks_media_gallery_sort" AS ENUM('newest', 'oldest', 'nameAscending', 'nameDescending');
  CREATE TYPE "public"."enum_partners_blocks_media_gallery_view" AS ENUM('cards', 'list', 'grid');
  CREATE TYPE "public"."enum_partners_blocks_attachments_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum_partners_blocks_attachments_sort" AS ENUM('newest', 'oldest', 'nameAscending', 'nameDescending');
  CREATE TYPE "public"."enum_partners_blocks_attachments_view" AS ENUM('cards', 'list', 'grid');
  CREATE TYPE "public"."enum_partners_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__partners_v_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles');
  CREATE TYPE "public"."enum__partners_v_blocks_listing_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending', 'eventDateAscending');
  CREATE TYPE "public"."enum__partners_v_blocks_listing_view" AS ENUM('cards', 'compact', 'grid');
  CREATE TYPE "public"."enum__partners_v_blocks_listing_event_time_filter" AS ENUM('all', 'upcoming', 'past');
  CREATE TYPE "public"."enum__partners_v_blocks_listing_parent_filter" AS ENUM('none', 'current', 'specific');
  CREATE TYPE "public"."enum__partners_v_blocks_media_gallery_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum__partners_v_blocks_media_gallery_sort" AS ENUM('newest', 'oldest', 'nameAscending', 'nameDescending');
  CREATE TYPE "public"."enum__partners_v_blocks_media_gallery_view" AS ENUM('cards', 'list', 'grid');
  CREATE TYPE "public"."enum__partners_v_blocks_attachments_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum__partners_v_blocks_attachments_sort" AS ENUM('newest', 'oldest', 'nameAscending', 'nameDescending');
  CREATE TYPE "public"."enum__partners_v_blocks_attachments_view" AS ENUM('cards', 'list', 'grid');
  CREATE TYPE "public"."enum__partners_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_site_settings_homepage_post_count" AS ENUM('2', '5', '8');
  ALTER TYPE "public"."enum_pages_blocks_listing_sources" ADD VALUE 'events';
  ALTER TYPE "public"."enum_pages_blocks_listing_sources" ADD VALUE 'event-cycles';
  ALTER TYPE "public"."enum_pages_blocks_listing_sort" ADD VALUE 'eventDateAscending';
  ALTER TYPE "public"."enum__pages_v_blocks_listing_sources" ADD VALUE 'events';
  ALTER TYPE "public"."enum__pages_v_blocks_listing_sources" ADD VALUE 'event-cycles';
  ALTER TYPE "public"."enum__pages_v_blocks_listing_sort" ADD VALUE 'eventDateAscending';
  ALTER TYPE "public"."enum_posts_blocks_listing_sources" ADD VALUE 'events';
  ALTER TYPE "public"."enum_posts_blocks_listing_sources" ADD VALUE 'event-cycles';
  ALTER TYPE "public"."enum_posts_blocks_listing_sort" ADD VALUE 'eventDateAscending';
  ALTER TYPE "public"."enum__posts_v_blocks_listing_sources" ADD VALUE 'events';
  ALTER TYPE "public"."enum__posts_v_blocks_listing_sources" ADD VALUE 'event-cycles';
  ALTER TYPE "public"."enum__posts_v_blocks_listing_sort" ADD VALUE 'eventDateAscending';
  ALTER TYPE "public"."enum_club_sections_menu_items_target_type" ADD VALUE 'event' BEFORE 'custom';
  ALTER TYPE "public"."enum_club_sections_menu_items_target_type" ADD VALUE 'eventCycle' BEFORE 'custom';
  ALTER TYPE "public"."enum_club_sections_menu_items_target_type" ADD VALUE 'partner' BEFORE 'custom';
  ALTER TYPE "public"."enum__club_sections_v_version_menu_items_target_type" ADD VALUE 'event' BEFORE 'custom';
  ALTER TYPE "public"."enum__club_sections_v_version_menu_items_target_type" ADD VALUE 'eventCycle' BEFORE 'custom';
  ALTER TYPE "public"."enum__club_sections_v_version_menu_items_target_type" ADD VALUE 'partner' BEFORE 'custom';
  ALTER TYPE "public"."enum_roles_permissions_resource" ADD VALUE 'events' BEFORE 'documents-resolution';
  ALTER TYPE "public"."enum_roles_permissions_resource" ADD VALUE 'event-cycles' BEFORE 'documents-resolution';
  ALTER TYPE "public"."enum_roles_permissions_resource" ADD VALUE 'partners' BEFORE 'documents-resolution';
  ALTER TYPE "public"."enum_navigation_header_items_target_type" ADD VALUE 'event' BEFORE 'custom';
  ALTER TYPE "public"."enum_navigation_header_items_target_type" ADD VALUE 'eventCycle' BEFORE 'custom';
  ALTER TYPE "public"."enum_navigation_header_items_target_type" ADD VALUE 'partner' BEFORE 'custom';
  ALTER TYPE "public"."enum_navigation_hero_items_target_type" ADD VALUE 'event' BEFORE 'custom';
  ALTER TYPE "public"."enum_navigation_hero_items_target_type" ADD VALUE 'eventCycle' BEFORE 'custom';
  ALTER TYPE "public"."enum_navigation_hero_items_target_type" ADD VALUE 'partner' BEFORE 'custom';
  ALTER TYPE "public"."enum_navigation_social_items_target_type" ADD VALUE 'event' BEFORE 'custom';
  ALTER TYPE "public"."enum_navigation_social_items_target_type" ADD VALUE 'eventCycle' BEFORE 'custom';
  ALTER TYPE "public"."enum_navigation_social_items_target_type" ADD VALUE 'partner' BEFORE 'custom';
  ALTER TYPE "public"."enum_navigation_footer_columns_items_target_type" ADD VALUE 'event' BEFORE 'custom';
  ALTER TYPE "public"."enum_navigation_footer_columns_items_target_type" ADD VALUE 'eventCycle' BEFORE 'custom';
  ALTER TYPE "public"."enum_navigation_footer_columns_items_target_type" ADD VALUE 'partner' BEFORE 'custom';
  ALTER TYPE "public"."enum_website_permissions_permissions_resource" ADD VALUE 'events' BEFORE 'documents-resolution';
  ALTER TYPE "public"."enum_website_permissions_permissions_resource" ADD VALUE 'event-cycles' BEFORE 'documents-resolution';
  ALTER TYPE "public"."enum_website_permissions_permissions_resource" ADD VALUE 'partners' BEFORE 'documents-resolution';
  CREATE TABLE "events_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "events_blocks_listing_sources" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_events_blocks_listing_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "events_blocks_listing" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"parent_page_id" integer,
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum_events_blocks_listing_sort" DEFAULT 'newest',
  	"view" "enum_events_blocks_listing_view" DEFAULT 'cards',
  	"event_time_filter" "enum_events_blocks_listing_event_time_filter" DEFAULT 'all',
  	"event_cycle_id" integer,
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"parent_filter" "enum_events_blocks_listing_parent_filter" DEFAULT 'none',
  	"empty_message" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "events_blocks_media_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "events_blocks_media_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"selection_mode" "enum_events_blocks_media_gallery_selection_mode" DEFAULT 'filters',
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum_events_blocks_media_gallery_sort" DEFAULT 'newest',
  	"view" "enum_events_blocks_media_gallery_view" DEFAULT 'grid',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "events_blocks_attachments_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "events_blocks_attachments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"selection_mode" "enum_events_blocks_attachments_selection_mode" DEFAULT 'filters',
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum_events_blocks_attachments_sort" DEFAULT 'newest',
  	"view" "enum_events_blocks_attachments_view" DEFAULT 'list',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "events_blocks_member_profiles_entries" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"profile_id" integer,
  	"context_label" varchar
  );
  
  CREATE TABLE "events_blocks_member_profiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "events_organizers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"profile_id" integer,
  	"role" varchar,
  	"responsibilities" varchar,
  	"contact_for" varchar,
  	"show_contact_channels" boolean DEFAULT false
  );
  
  CREATE TABLE "events_partners_roles" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_events_partners_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "events_partners" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"partner_id" integer,
  	"contribution" varchar
  );
  
  CREATE TABLE "events_external_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_events_external_links_type" DEFAULT 'other',
  	"label" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"cycle_id" integer,
  	"hero_image_id" integer,
  	"tagline" varchar,
  	"excerpt" varchar,
  	"time_mode" "enum_events_time_mode" DEFAULT 'timed',
  	"event_status" "enum_events_event_status" DEFAULT 'scheduled',
  	"start_at" timestamp(3) with time zone,
  	"end_at" timestamp(3) with time zone,
  	"location_venue_name" varchar,
  	"location_venue_website" varchar,
  	"location_street_address" varchar,
  	"location_postal_code" varchar,
  	"location_city" varchar DEFAULT 'Wrocław',
  	"location_map_embed_u_r_l" varchar,
  	"participation" "enum_events_participation" DEFAULT 'public',
  	"visibility" "enum_events_visibility" DEFAULT 'public',
  	"capacity_mode" "enum_events_capacity_mode" DEFAULT 'unlimited',
  	"capacity" numeric,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_image_id" integer,
  	"slug" varchar,
  	"author_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"defaults_applied_cycle_id" integer,
  	"previous_start_at" timestamp(3) with time zone,
  	"calendar_u_i_d" varchar,
  	"calendar_revision" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_events_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "events_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer,
  	"tags_id" integer
  );
  
  CREATE TABLE "_events_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_events_v_blocks_listing_sources" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__events_v_blocks_listing_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_events_v_blocks_listing" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"parent_page_id" integer,
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum__events_v_blocks_listing_sort" DEFAULT 'newest',
  	"view" "enum__events_v_blocks_listing_view" DEFAULT 'cards',
  	"event_time_filter" "enum__events_v_blocks_listing_event_time_filter" DEFAULT 'all',
  	"event_cycle_id" integer,
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"parent_filter" "enum__events_v_blocks_listing_parent_filter" DEFAULT 'none',
  	"empty_message" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_events_v_blocks_media_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_events_v_blocks_media_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"selection_mode" "enum__events_v_blocks_media_gallery_selection_mode" DEFAULT 'filters',
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum__events_v_blocks_media_gallery_sort" DEFAULT 'newest',
  	"view" "enum__events_v_blocks_media_gallery_view" DEFAULT 'grid',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_events_v_blocks_attachments_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_events_v_blocks_attachments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"selection_mode" "enum__events_v_blocks_attachments_selection_mode" DEFAULT 'filters',
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum__events_v_blocks_attachments_sort" DEFAULT 'newest',
  	"view" "enum__events_v_blocks_attachments_view" DEFAULT 'list',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_events_v_blocks_member_profiles_entries" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"profile_id" integer,
  	"context_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_events_v_blocks_member_profiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_events_v_version_organizers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"profile_id" integer,
  	"role" varchar,
  	"responsibilities" varchar,
  	"contact_for" varchar,
  	"show_contact_channels" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_events_v_version_partners_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__events_v_version_partners_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_events_v_version_partners" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"partner_id" integer,
  	"contribution" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_events_v_version_external_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum__events_v_version_external_links_type" DEFAULT 'other',
  	"label" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_events_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_cycle_id" integer,
  	"version_hero_image_id" integer,
  	"version_tagline" varchar,
  	"version_excerpt" varchar,
  	"version_time_mode" "enum__events_v_version_time_mode" DEFAULT 'timed',
  	"version_event_status" "enum__events_v_version_event_status" DEFAULT 'scheduled',
  	"version_start_at" timestamp(3) with time zone,
  	"version_end_at" timestamp(3) with time zone,
  	"version_location_venue_name" varchar,
  	"version_location_venue_website" varchar,
  	"version_location_street_address" varchar,
  	"version_location_postal_code" varchar,
  	"version_location_city" varchar DEFAULT 'Wrocław',
  	"version_location_map_embed_u_r_l" varchar,
  	"version_participation" "enum__events_v_version_participation" DEFAULT 'public',
  	"version_visibility" "enum__events_v_version_visibility" DEFAULT 'public',
  	"version_capacity_mode" "enum__events_v_version_capacity_mode" DEFAULT 'unlimited',
  	"version_capacity" numeric,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_image_id" integer,
  	"version_slug" varchar,
  	"version_author_id" integer,
  	"version_published_at" timestamp(3) with time zone,
  	"version_defaults_applied_cycle_id" integer,
  	"version_previous_start_at" timestamp(3) with time zone,
  	"version_calendar_u_i_d" varchar,
  	"version_calendar_revision" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__events_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_events_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer,
  	"tags_id" integer
  );
  
  CREATE TABLE "event_cycles_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "event_cycles_blocks_listing_sources" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_event_cycles_blocks_listing_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "event_cycles_blocks_listing" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"parent_page_id" integer,
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum_event_cycles_blocks_listing_sort" DEFAULT 'newest',
  	"view" "enum_event_cycles_blocks_listing_view" DEFAULT 'cards',
  	"event_time_filter" "enum_event_cycles_blocks_listing_event_time_filter" DEFAULT 'all',
  	"event_cycle_id" integer,
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"parent_filter" "enum_event_cycles_blocks_listing_parent_filter" DEFAULT 'none',
  	"empty_message" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "event_cycles_blocks_media_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "event_cycles_blocks_media_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"selection_mode" "enum_event_cycles_blocks_media_gallery_selection_mode" DEFAULT 'filters',
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum_event_cycles_blocks_media_gallery_sort" DEFAULT 'newest',
  	"view" "enum_event_cycles_blocks_media_gallery_view" DEFAULT 'grid',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "event_cycles_blocks_attachments_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "event_cycles_blocks_attachments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"selection_mode" "enum_event_cycles_blocks_attachments_selection_mode" DEFAULT 'filters',
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum_event_cycles_blocks_attachments_sort" DEFAULT 'newest',
  	"view" "enum_event_cycles_blocks_attachments_view" DEFAULT 'list',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "event_cycles_blocks_member_profiles_entries" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"profile_id" integer,
  	"context_label" varchar
  );
  
  CREATE TABLE "event_cycles_blocks_member_profiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "event_cycles_event_defaults_organizers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"profile_id" integer,
  	"role" varchar,
  	"responsibilities" varchar,
  	"contact_for" varchar,
  	"show_contact_channels" boolean DEFAULT false
  );
  
  CREATE TABLE "event_cycles_event_defaults_partners_roles" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_event_cycles_event_defaults_partners_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "event_cycles_event_defaults_partners" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"partner_id" integer,
  	"contribution" varchar
  );
  
  CREATE TABLE "event_cycles_event_defaults_external_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_event_cycles_event_defaults_external_links_type" DEFAULT 'other',
  	"label" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "event_cycles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"hero_image_id" integer,
  	"tagline" varchar,
  	"excerpt" varchar,
  	"visibility" "enum_event_cycles_visibility" DEFAULT 'public',
  	"event_defaults_hero_image_id" integer,
  	"event_defaults_tagline" varchar,
  	"event_defaults_excerpt" varchar,
  	"event_defaults_default_time_mode" "enum_event_cycles_event_defaults_default_time_mode" DEFAULT 'timed',
  	"event_defaults_default_duration_minutes" numeric,
  	"event_defaults_location_venue_name" varchar,
  	"event_defaults_location_venue_website" varchar,
  	"event_defaults_location_street_address" varchar,
  	"event_defaults_location_postal_code" varchar,
  	"event_defaults_location_city" varchar DEFAULT 'Wrocław',
  	"event_defaults_location_map_embed_u_r_l" varchar,
  	"event_defaults_participation" "enum_event_cycles_event_defaults_participation" DEFAULT 'public',
  	"event_defaults_visibility" "enum_event_cycles_event_defaults_visibility" DEFAULT 'public',
  	"event_defaults_capacity_mode" "enum_event_cycles_event_defaults_capacity_mode" DEFAULT 'unlimited',
  	"event_defaults_capacity" numeric,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_image_id" integer,
  	"slug" varchar,
  	"author_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"calendar_feed_key" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_event_cycles_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "event_cycles_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer,
  	"tags_id" integer
  );
  
  CREATE TABLE "_event_cycles_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_event_cycles_v_blocks_listing_sources" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__event_cycles_v_blocks_listing_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_event_cycles_v_blocks_listing" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"parent_page_id" integer,
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum__event_cycles_v_blocks_listing_sort" DEFAULT 'newest',
  	"view" "enum__event_cycles_v_blocks_listing_view" DEFAULT 'cards',
  	"event_time_filter" "enum__event_cycles_v_blocks_listing_event_time_filter" DEFAULT 'all',
  	"event_cycle_id" integer,
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"parent_filter" "enum__event_cycles_v_blocks_listing_parent_filter" DEFAULT 'none',
  	"empty_message" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_event_cycles_v_blocks_media_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_event_cycles_v_blocks_media_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"selection_mode" "enum__event_cycles_v_blocks_media_gallery_selection_mode" DEFAULT 'filters',
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum__event_cycles_v_blocks_media_gallery_sort" DEFAULT 'newest',
  	"view" "enum__event_cycles_v_blocks_media_gallery_view" DEFAULT 'grid',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_event_cycles_v_blocks_attachments_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_event_cycles_v_blocks_attachments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"selection_mode" "enum__event_cycles_v_blocks_attachments_selection_mode" DEFAULT 'filters',
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum__event_cycles_v_blocks_attachments_sort" DEFAULT 'newest',
  	"view" "enum__event_cycles_v_blocks_attachments_view" DEFAULT 'list',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_event_cycles_v_blocks_member_profiles_entries" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"profile_id" integer,
  	"context_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_event_cycles_v_blocks_member_profiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_event_cycles_v_version_event_defaults_organizers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"profile_id" integer,
  	"role" varchar,
  	"responsibilities" varchar,
  	"contact_for" varchar,
  	"show_contact_channels" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_event_cycles_v_version_event_defaults_partners_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__event_cycles_v_version_event_defaults_partners_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_event_cycles_v_version_event_defaults_partners" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"partner_id" integer,
  	"contribution" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_event_cycles_v_version_event_defaults_external_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum__event_cycles_v_version_event_defaults_external_links_type" DEFAULT 'other',
  	"label" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_event_cycles_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_hero_image_id" integer,
  	"version_tagline" varchar,
  	"version_excerpt" varchar,
  	"version_visibility" "enum__event_cycles_v_version_visibility" DEFAULT 'public',
  	"version_event_defaults_hero_image_id" integer,
  	"version_event_defaults_tagline" varchar,
  	"version_event_defaults_excerpt" varchar,
  	"version_event_defaults_default_time_mode" "enum__event_cycles_v_version_event_defaults_default_time_mode" DEFAULT 'timed',
  	"version_event_defaults_default_duration_minutes" numeric,
  	"version_event_defaults_location_venue_name" varchar,
  	"version_event_defaults_location_venue_website" varchar,
  	"version_event_defaults_location_street_address" varchar,
  	"version_event_defaults_location_postal_code" varchar,
  	"version_event_defaults_location_city" varchar DEFAULT 'Wrocław',
  	"version_event_defaults_location_map_embed_u_r_l" varchar,
  	"version_event_defaults_participation" "enum__event_cycles_v_version_event_defaults_participation" DEFAULT 'public',
  	"version_event_defaults_visibility" "enum__event_cycles_v_version_event_defaults_visibility" DEFAULT 'public',
  	"version_event_defaults_capacity_mode" "enum__event_cycles_v_version_event_defaults_capacity_mode" DEFAULT 'unlimited',
  	"version_event_defaults_capacity" numeric,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_image_id" integer,
  	"version_slug" varchar,
  	"version_author_id" integer,
  	"version_published_at" timestamp(3) with time zone,
  	"version_calendar_feed_key" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__event_cycles_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_event_cycles_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer,
  	"tags_id" integer
  );
  
  CREATE TABLE "partners_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "partners_blocks_listing_sources" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_partners_blocks_listing_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "partners_blocks_listing" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"parent_page_id" integer,
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum_partners_blocks_listing_sort" DEFAULT 'newest',
  	"view" "enum_partners_blocks_listing_view" DEFAULT 'cards',
  	"event_time_filter" "enum_partners_blocks_listing_event_time_filter" DEFAULT 'all',
  	"event_cycle_id" integer,
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"parent_filter" "enum_partners_blocks_listing_parent_filter" DEFAULT 'none',
  	"empty_message" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "partners_blocks_media_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "partners_blocks_media_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"selection_mode" "enum_partners_blocks_media_gallery_selection_mode" DEFAULT 'filters',
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum_partners_blocks_media_gallery_sort" DEFAULT 'newest',
  	"view" "enum_partners_blocks_media_gallery_view" DEFAULT 'grid',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "partners_blocks_attachments_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "partners_blocks_attachments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"selection_mode" "enum_partners_blocks_attachments_selection_mode" DEFAULT 'filters',
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum_partners_blocks_attachments_sort" DEFAULT 'newest',
  	"view" "enum_partners_blocks_attachments_view" DEFAULT 'list',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "partners_blocks_member_profiles_entries" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"profile_id" integer,
  	"context_label" varchar
  );
  
  CREATE TABLE "partners_blocks_member_profiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "partners" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"hero_image_id" integer,
  	"excerpt" varchar,
  	"website" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_image_id" integer,
  	"slug" varchar,
  	"author_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_partners_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_partners_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_partners_v_blocks_listing_sources" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__partners_v_blocks_listing_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_partners_v_blocks_listing" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"parent_page_id" integer,
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum__partners_v_blocks_listing_sort" DEFAULT 'newest',
  	"view" "enum__partners_v_blocks_listing_view" DEFAULT 'cards',
  	"event_time_filter" "enum__partners_v_blocks_listing_event_time_filter" DEFAULT 'all',
  	"event_cycle_id" integer,
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"parent_filter" "enum__partners_v_blocks_listing_parent_filter" DEFAULT 'none',
  	"empty_message" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_partners_v_blocks_media_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_partners_v_blocks_media_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"selection_mode" "enum__partners_v_blocks_media_gallery_selection_mode" DEFAULT 'filters',
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum__partners_v_blocks_media_gallery_sort" DEFAULT 'newest',
  	"view" "enum__partners_v_blocks_media_gallery_view" DEFAULT 'grid',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_partners_v_blocks_attachments_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_partners_v_blocks_attachments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"selection_mode" "enum__partners_v_blocks_attachments_selection_mode" DEFAULT 'filters',
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum__partners_v_blocks_attachments_sort" DEFAULT 'newest',
  	"view" "enum__partners_v_blocks_attachments_view" DEFAULT 'list',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_partners_v_blocks_member_profiles_entries" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"profile_id" integer,
  	"context_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_partners_v_blocks_member_profiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_partners_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_hero_image_id" integer,
  	"version_excerpt" varchar,
  	"version_website" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_image_id" integer,
  	"version_slug" varchar,
  	"version_author_id" integer,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__partners_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "pages_blocks_listing" ADD COLUMN "event_time_filter" "enum_pages_blocks_listing_event_time_filter" DEFAULT 'all';
  ALTER TABLE "pages_blocks_listing" ADD COLUMN "event_cycle_id" integer;
  ALTER TABLE "_pages_v_blocks_listing" ADD COLUMN "event_time_filter" "enum__pages_v_blocks_listing_event_time_filter" DEFAULT 'all';
  ALTER TABLE "_pages_v_blocks_listing" ADD COLUMN "event_cycle_id" integer;
  ALTER TABLE "posts_blocks_listing" ADD COLUMN "event_time_filter" "enum_posts_blocks_listing_event_time_filter" DEFAULT 'all';
  ALTER TABLE "posts_blocks_listing" ADD COLUMN "event_cycle_id" integer;
  ALTER TABLE "posts_rels" ADD COLUMN "events_id" integer;
  ALTER TABLE "posts_rels" ADD COLUMN "event_cycles_id" integer;
  ALTER TABLE "_posts_v_blocks_listing" ADD COLUMN "event_time_filter" "enum__posts_v_blocks_listing_event_time_filter" DEFAULT 'all';
  ALTER TABLE "_posts_v_blocks_listing" ADD COLUMN "event_cycle_id" integer;
  ALTER TABLE "_posts_v_rels" ADD COLUMN "events_id" integer;
  ALTER TABLE "_posts_v_rels" ADD COLUMN "event_cycles_id" integer;
  ALTER TABLE "club_sections_menu_items" ADD COLUMN "event_id" integer;
  ALTER TABLE "club_sections_menu_items" ADD COLUMN "event_cycle_id" integer;
  ALTER TABLE "club_sections_menu_items" ADD COLUMN "partner_id" integer;
  ALTER TABLE "_club_sections_v_version_menu_items" ADD COLUMN "event_id" integer;
  ALTER TABLE "_club_sections_v_version_menu_items" ADD COLUMN "event_cycle_id" integer;
  ALTER TABLE "_club_sections_v_version_menu_items" ADD COLUMN "partner_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "events_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "event_cycles_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "partners_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_event_window_weeks" numeric DEFAULT 4;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_event_slide_limit" numeric DEFAULT 6;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_post_count" "enum_site_settings_homepage_post_count" DEFAULT '2';
  ALTER TABLE "navigation_header_items" ADD COLUMN "event_id" integer;
  ALTER TABLE "navigation_header_items" ADD COLUMN "event_cycle_id" integer;
  ALTER TABLE "navigation_header_items" ADD COLUMN "partner_id" integer;
  ALTER TABLE "navigation_hero_items" ADD COLUMN "event_id" integer;
  ALTER TABLE "navigation_hero_items" ADD COLUMN "event_cycle_id" integer;
  ALTER TABLE "navigation_hero_items" ADD COLUMN "partner_id" integer;
  ALTER TABLE "navigation_social_items" ADD COLUMN "event_id" integer;
  ALTER TABLE "navigation_social_items" ADD COLUMN "event_cycle_id" integer;
  ALTER TABLE "navigation_social_items" ADD COLUMN "partner_id" integer;
  ALTER TABLE "navigation_footer_columns_items" ADD COLUMN "event_id" integer;
  ALTER TABLE "navigation_footer_columns_items" ADD COLUMN "event_cycle_id" integer;
  ALTER TABLE "navigation_footer_columns_items" ADD COLUMN "partner_id" integer;
  ALTER TABLE "events_blocks_rich_text" ADD CONSTRAINT "events_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_blocks_listing_sources" ADD CONSTRAINT "events_blocks_listing_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events_blocks_listing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_blocks_listing" ADD CONSTRAINT "events_blocks_listing_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_listing" ADD CONSTRAINT "events_blocks_listing_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_listing" ADD CONSTRAINT "events_blocks_listing_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_listing" ADD CONSTRAINT "events_blocks_listing_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_listing" ADD CONSTRAINT "events_blocks_listing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_blocks_media_gallery_items" ADD CONSTRAINT "events_blocks_media_gallery_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_media_gallery_items" ADD CONSTRAINT "events_blocks_media_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events_blocks_media_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_blocks_media_gallery" ADD CONSTRAINT "events_blocks_media_gallery_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_media_gallery" ADD CONSTRAINT "events_blocks_media_gallery_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_media_gallery" ADD CONSTRAINT "events_blocks_media_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_blocks_attachments_items" ADD CONSTRAINT "events_blocks_attachments_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_attachments_items" ADD CONSTRAINT "events_blocks_attachments_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events_blocks_attachments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_blocks_attachments" ADD CONSTRAINT "events_blocks_attachments_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_attachments" ADD CONSTRAINT "events_blocks_attachments_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_attachments" ADD CONSTRAINT "events_blocks_attachments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_blocks_member_profiles_entries" ADD CONSTRAINT "events_blocks_member_profiles_entries_profile_id_member_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."member_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_member_profiles_entries" ADD CONSTRAINT "events_blocks_member_profiles_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events_blocks_member_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_blocks_member_profiles" ADD CONSTRAINT "events_blocks_member_profiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_organizers" ADD CONSTRAINT "events_organizers_profile_id_member_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."member_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_organizers" ADD CONSTRAINT "events_organizers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_partners_roles" ADD CONSTRAINT "events_partners_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events_partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_partners" ADD CONSTRAINT "events_partners_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_partners" ADD CONSTRAINT "events_partners_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_external_links" ADD CONSTRAINT "events_external_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_cycle_id_event_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_defaults_applied_cycle_id_event_cycles_id_fk" FOREIGN KEY ("defaults_applied_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_rich_text" ADD CONSTRAINT "_events_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_listing_sources" ADD CONSTRAINT "_events_v_blocks_listing_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_events_v_blocks_listing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_listing" ADD CONSTRAINT "_events_v_blocks_listing_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_listing" ADD CONSTRAINT "_events_v_blocks_listing_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_listing" ADD CONSTRAINT "_events_v_blocks_listing_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_listing" ADD CONSTRAINT "_events_v_blocks_listing_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_listing" ADD CONSTRAINT "_events_v_blocks_listing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_media_gallery_items" ADD CONSTRAINT "_events_v_blocks_media_gallery_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_media_gallery_items" ADD CONSTRAINT "_events_v_blocks_media_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v_blocks_media_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_media_gallery" ADD CONSTRAINT "_events_v_blocks_media_gallery_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_media_gallery" ADD CONSTRAINT "_events_v_blocks_media_gallery_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_media_gallery" ADD CONSTRAINT "_events_v_blocks_media_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_attachments_items" ADD CONSTRAINT "_events_v_blocks_attachments_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_attachments_items" ADD CONSTRAINT "_events_v_blocks_attachments_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v_blocks_attachments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_attachments" ADD CONSTRAINT "_events_v_blocks_attachments_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_attachments" ADD CONSTRAINT "_events_v_blocks_attachments_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_attachments" ADD CONSTRAINT "_events_v_blocks_attachments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_member_profiles_entries" ADD CONSTRAINT "_events_v_blocks_member_profiles_entries_profile_id_member_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."member_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_member_profiles_entries" ADD CONSTRAINT "_events_v_blocks_member_profiles_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v_blocks_member_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_member_profiles" ADD CONSTRAINT "_events_v_blocks_member_profiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_version_organizers" ADD CONSTRAINT "_events_v_version_organizers_profile_id_member_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."member_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_version_organizers" ADD CONSTRAINT "_events_v_version_organizers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_version_partners_roles" ADD CONSTRAINT "_events_v_version_partners_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_events_v_version_partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_version_partners" ADD CONSTRAINT "_events_v_version_partners_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_version_partners" ADD CONSTRAINT "_events_v_version_partners_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_version_external_links" ADD CONSTRAINT "_events_v_version_external_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_parent_id_events_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_cycle_id_event_cycles_id_fk" FOREIGN KEY ("version_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_author_id_users_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_defaults_applied_cycle_id_event_cycles_id_fk" FOREIGN KEY ("version_defaults_applied_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_rich_text" ADD CONSTRAINT "event_cycles_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_cycles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_listing_sources" ADD CONSTRAINT "event_cycles_blocks_listing_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."event_cycles_blocks_listing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_listing" ADD CONSTRAINT "event_cycles_blocks_listing_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_listing" ADD CONSTRAINT "event_cycles_blocks_listing_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_listing" ADD CONSTRAINT "event_cycles_blocks_listing_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_listing" ADD CONSTRAINT "event_cycles_blocks_listing_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_listing" ADD CONSTRAINT "event_cycles_blocks_listing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_cycles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_media_gallery_items" ADD CONSTRAINT "event_cycles_blocks_media_gallery_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_media_gallery_items" ADD CONSTRAINT "event_cycles_blocks_media_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_cycles_blocks_media_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_media_gallery" ADD CONSTRAINT "event_cycles_blocks_media_gallery_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_media_gallery" ADD CONSTRAINT "event_cycles_blocks_media_gallery_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_media_gallery" ADD CONSTRAINT "event_cycles_blocks_media_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_cycles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_attachments_items" ADD CONSTRAINT "event_cycles_blocks_attachments_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_attachments_items" ADD CONSTRAINT "event_cycles_blocks_attachments_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_cycles_blocks_attachments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_attachments" ADD CONSTRAINT "event_cycles_blocks_attachments_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_attachments" ADD CONSTRAINT "event_cycles_blocks_attachments_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_attachments" ADD CONSTRAINT "event_cycles_blocks_attachments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_cycles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_member_profiles_entries" ADD CONSTRAINT "event_cycles_blocks_member_profiles_entries_profile_id_member_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."member_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_member_profiles_entries" ADD CONSTRAINT "event_cycles_blocks_member_profiles_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_cycles_blocks_member_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_member_profiles" ADD CONSTRAINT "event_cycles_blocks_member_profiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_cycles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_event_defaults_organizers" ADD CONSTRAINT "event_cycles_event_defaults_organizers_profile_id_member_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."member_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_event_defaults_organizers" ADD CONSTRAINT "event_cycles_event_defaults_organizers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_cycles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_event_defaults_partners_roles" ADD CONSTRAINT "event_cycles_event_defaults_partners_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."event_cycles_event_defaults_partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_event_defaults_partners" ADD CONSTRAINT "event_cycles_event_defaults_partners_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_event_defaults_partners" ADD CONSTRAINT "event_cycles_event_defaults_partners_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_cycles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_event_defaults_external_links" ADD CONSTRAINT "event_cycles_event_defaults_external_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_cycles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles" ADD CONSTRAINT "event_cycles_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles" ADD CONSTRAINT "event_cycles_event_defaults_hero_image_id_media_id_fk" FOREIGN KEY ("event_defaults_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles" ADD CONSTRAINT "event_cycles_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles" ADD CONSTRAINT "event_cycles_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_rels" ADD CONSTRAINT "event_cycles_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."event_cycles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_rels" ADD CONSTRAINT "event_cycles_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_rels" ADD CONSTRAINT "event_cycles_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_rich_text" ADD CONSTRAINT "_event_cycles_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_event_cycles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_listing_sources" ADD CONSTRAINT "_event_cycles_v_blocks_listing_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_event_cycles_v_blocks_listing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_listing" ADD CONSTRAINT "_event_cycles_v_blocks_listing_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_listing" ADD CONSTRAINT "_event_cycles_v_blocks_listing_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_listing" ADD CONSTRAINT "_event_cycles_v_blocks_listing_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_listing" ADD CONSTRAINT "_event_cycles_v_blocks_listing_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_listing" ADD CONSTRAINT "_event_cycles_v_blocks_listing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_event_cycles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_media_gallery_items" ADD CONSTRAINT "_event_cycles_v_blocks_media_gallery_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_media_gallery_items" ADD CONSTRAINT "_event_cycles_v_blocks_media_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_event_cycles_v_blocks_media_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_media_gallery" ADD CONSTRAINT "_event_cycles_v_blocks_media_gallery_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_media_gallery" ADD CONSTRAINT "_event_cycles_v_blocks_media_gallery_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_media_gallery" ADD CONSTRAINT "_event_cycles_v_blocks_media_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_event_cycles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_attachments_items" ADD CONSTRAINT "_event_cycles_v_blocks_attachments_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_attachments_items" ADD CONSTRAINT "_event_cycles_v_blocks_attachments_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_event_cycles_v_blocks_attachments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_attachments" ADD CONSTRAINT "_event_cycles_v_blocks_attachments_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_attachments" ADD CONSTRAINT "_event_cycles_v_blocks_attachments_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_attachments" ADD CONSTRAINT "_event_cycles_v_blocks_attachments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_event_cycles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_member_profiles_entries" ADD CONSTRAINT "_event_cycles_v_blocks_member_profiles_entries_profile_id_member_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."member_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_member_profiles_entries" ADD CONSTRAINT "_event_cycles_v_blocks_member_profiles_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_event_cycles_v_blocks_member_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_member_profiles" ADD CONSTRAINT "_event_cycles_v_blocks_member_profiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_event_cycles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_version_event_defaults_organizers" ADD CONSTRAINT "_event_cycles_v_version_event_defaults_organizers_profile_id_member_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."member_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_version_event_defaults_organizers" ADD CONSTRAINT "_event_cycles_v_version_event_defaults_organizers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_event_cycles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_version_event_defaults_partners_roles" ADD CONSTRAINT "_event_cycles_v_version_event_defaults_partners_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_event_cycles_v_version_event_defaults_partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_version_event_defaults_partners" ADD CONSTRAINT "_event_cycles_v_version_event_defaults_partners_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_version_event_defaults_partners" ADD CONSTRAINT "_event_cycles_v_version_event_defaults_partners_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_event_cycles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" ADD CONSTRAINT "_event_cycles_v_version_event_defaults_external_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_event_cycles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v" ADD CONSTRAINT "_event_cycles_v_parent_id_event_cycles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v" ADD CONSTRAINT "_event_cycles_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v" ADD CONSTRAINT "_event_cycles_v_version_event_defaults_hero_image_id_media_id_fk" FOREIGN KEY ("version_event_defaults_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v" ADD CONSTRAINT "_event_cycles_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v" ADD CONSTRAINT "_event_cycles_v_version_author_id_users_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_rels" ADD CONSTRAINT "_event_cycles_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_event_cycles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_rels" ADD CONSTRAINT "_event_cycles_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_rels" ADD CONSTRAINT "_event_cycles_v_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_blocks_rich_text" ADD CONSTRAINT "partners_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_blocks_listing_sources" ADD CONSTRAINT "partners_blocks_listing_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."partners_blocks_listing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_blocks_listing" ADD CONSTRAINT "partners_blocks_listing_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_listing" ADD CONSTRAINT "partners_blocks_listing_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_listing" ADD CONSTRAINT "partners_blocks_listing_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_listing" ADD CONSTRAINT "partners_blocks_listing_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_listing" ADD CONSTRAINT "partners_blocks_listing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_blocks_media_gallery_items" ADD CONSTRAINT "partners_blocks_media_gallery_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_media_gallery_items" ADD CONSTRAINT "partners_blocks_media_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners_blocks_media_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_blocks_media_gallery" ADD CONSTRAINT "partners_blocks_media_gallery_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_media_gallery" ADD CONSTRAINT "partners_blocks_media_gallery_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_media_gallery" ADD CONSTRAINT "partners_blocks_media_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_blocks_attachments_items" ADD CONSTRAINT "partners_blocks_attachments_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_attachments_items" ADD CONSTRAINT "partners_blocks_attachments_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners_blocks_attachments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_blocks_attachments" ADD CONSTRAINT "partners_blocks_attachments_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_attachments" ADD CONSTRAINT "partners_blocks_attachments_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_attachments" ADD CONSTRAINT "partners_blocks_attachments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_blocks_member_profiles_entries" ADD CONSTRAINT "partners_blocks_member_profiles_entries_profile_id_member_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."member_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_member_profiles_entries" ADD CONSTRAINT "partners_blocks_member_profiles_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners_blocks_member_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_blocks_member_profiles" ADD CONSTRAINT "partners_blocks_member_profiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners" ADD CONSTRAINT "partners_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners" ADD CONSTRAINT "partners_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners" ADD CONSTRAINT "partners_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_rich_text" ADD CONSTRAINT "_partners_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partners_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_listing_sources" ADD CONSTRAINT "_partners_v_blocks_listing_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_partners_v_blocks_listing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_listing" ADD CONSTRAINT "_partners_v_blocks_listing_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_listing" ADD CONSTRAINT "_partners_v_blocks_listing_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_listing" ADD CONSTRAINT "_partners_v_blocks_listing_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_listing" ADD CONSTRAINT "_partners_v_blocks_listing_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_listing" ADD CONSTRAINT "_partners_v_blocks_listing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partners_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_media_gallery_items" ADD CONSTRAINT "_partners_v_blocks_media_gallery_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_media_gallery_items" ADD CONSTRAINT "_partners_v_blocks_media_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partners_v_blocks_media_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_media_gallery" ADD CONSTRAINT "_partners_v_blocks_media_gallery_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_media_gallery" ADD CONSTRAINT "_partners_v_blocks_media_gallery_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_media_gallery" ADD CONSTRAINT "_partners_v_blocks_media_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partners_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_attachments_items" ADD CONSTRAINT "_partners_v_blocks_attachments_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_attachments_items" ADD CONSTRAINT "_partners_v_blocks_attachments_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partners_v_blocks_attachments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_attachments" ADD CONSTRAINT "_partners_v_blocks_attachments_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_attachments" ADD CONSTRAINT "_partners_v_blocks_attachments_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_attachments" ADD CONSTRAINT "_partners_v_blocks_attachments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partners_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_member_profiles_entries" ADD CONSTRAINT "_partners_v_blocks_member_profiles_entries_profile_id_member_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."member_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_member_profiles_entries" ADD CONSTRAINT "_partners_v_blocks_member_profiles_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partners_v_blocks_member_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_member_profiles" ADD CONSTRAINT "_partners_v_blocks_member_profiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partners_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v" ADD CONSTRAINT "_partners_v_parent_id_partners_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v" ADD CONSTRAINT "_partners_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v" ADD CONSTRAINT "_partners_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v" ADD CONSTRAINT "_partners_v_version_author_id_users_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "events_blocks_rich_text_order_idx" ON "events_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "events_blocks_rich_text_parent_id_idx" ON "events_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "events_blocks_rich_text_path_idx" ON "events_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "events_blocks_listing_sources_order_idx" ON "events_blocks_listing_sources" USING btree ("order");
  CREATE INDEX "events_blocks_listing_sources_parent_idx" ON "events_blocks_listing_sources" USING btree ("parent_id");
  CREATE INDEX "events_blocks_listing_order_idx" ON "events_blocks_listing" USING btree ("_order");
  CREATE INDEX "events_blocks_listing_parent_id_idx" ON "events_blocks_listing" USING btree ("_parent_id");
  CREATE INDEX "events_blocks_listing_path_idx" ON "events_blocks_listing" USING btree ("_path");
  CREATE INDEX "events_blocks_listing_parent_page_idx" ON "events_blocks_listing" USING btree ("parent_page_id");
  CREATE INDEX "events_blocks_listing_category_idx" ON "events_blocks_listing" USING btree ("category_id");
  CREATE INDEX "events_blocks_listing_tag_idx" ON "events_blocks_listing" USING btree ("tag_id");
  CREATE INDEX "events_blocks_listing_event_cycle_idx" ON "events_blocks_listing" USING btree ("event_cycle_id");
  CREATE INDEX "events_blocks_media_gallery_items_order_idx" ON "events_blocks_media_gallery_items" USING btree ("_order");
  CREATE INDEX "events_blocks_media_gallery_items_parent_id_idx" ON "events_blocks_media_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "events_blocks_media_gallery_items_media_idx" ON "events_blocks_media_gallery_items" USING btree ("media_id");
  CREATE INDEX "events_blocks_media_gallery_order_idx" ON "events_blocks_media_gallery" USING btree ("_order");
  CREATE INDEX "events_blocks_media_gallery_parent_id_idx" ON "events_blocks_media_gallery" USING btree ("_parent_id");
  CREATE INDEX "events_blocks_media_gallery_path_idx" ON "events_blocks_media_gallery" USING btree ("_path");
  CREATE INDEX "events_blocks_media_gallery_category_idx" ON "events_blocks_media_gallery" USING btree ("category_id");
  CREATE INDEX "events_blocks_media_gallery_tag_idx" ON "events_blocks_media_gallery" USING btree ("tag_id");
  CREATE INDEX "events_blocks_attachments_items_order_idx" ON "events_blocks_attachments_items" USING btree ("_order");
  CREATE INDEX "events_blocks_attachments_items_parent_id_idx" ON "events_blocks_attachments_items" USING btree ("_parent_id");
  CREATE INDEX "events_blocks_attachments_items_media_idx" ON "events_blocks_attachments_items" USING btree ("media_id");
  CREATE INDEX "events_blocks_attachments_order_idx" ON "events_blocks_attachments" USING btree ("_order");
  CREATE INDEX "events_blocks_attachments_parent_id_idx" ON "events_blocks_attachments" USING btree ("_parent_id");
  CREATE INDEX "events_blocks_attachments_path_idx" ON "events_blocks_attachments" USING btree ("_path");
  CREATE INDEX "events_blocks_attachments_category_idx" ON "events_blocks_attachments" USING btree ("category_id");
  CREATE INDEX "events_blocks_attachments_tag_idx" ON "events_blocks_attachments" USING btree ("tag_id");
  CREATE INDEX "events_blocks_member_profiles_entries_order_idx" ON "events_blocks_member_profiles_entries" USING btree ("_order");
  CREATE INDEX "events_blocks_member_profiles_entries_parent_id_idx" ON "events_blocks_member_profiles_entries" USING btree ("_parent_id");
  CREATE INDEX "events_blocks_member_profiles_entries_profile_idx" ON "events_blocks_member_profiles_entries" USING btree ("profile_id");
  CREATE INDEX "events_blocks_member_profiles_order_idx" ON "events_blocks_member_profiles" USING btree ("_order");
  CREATE INDEX "events_blocks_member_profiles_parent_id_idx" ON "events_blocks_member_profiles" USING btree ("_parent_id");
  CREATE INDEX "events_blocks_member_profiles_path_idx" ON "events_blocks_member_profiles" USING btree ("_path");
  CREATE INDEX "events_organizers_order_idx" ON "events_organizers" USING btree ("_order");
  CREATE INDEX "events_organizers_parent_id_idx" ON "events_organizers" USING btree ("_parent_id");
  CREATE INDEX "events_organizers_profile_idx" ON "events_organizers" USING btree ("profile_id");
  CREATE INDEX "events_partners_roles_order_idx" ON "events_partners_roles" USING btree ("order");
  CREATE INDEX "events_partners_roles_parent_idx" ON "events_partners_roles" USING btree ("parent_id");
  CREATE INDEX "events_partners_order_idx" ON "events_partners" USING btree ("_order");
  CREATE INDEX "events_partners_parent_id_idx" ON "events_partners" USING btree ("_parent_id");
  CREATE INDEX "events_partners_partner_idx" ON "events_partners" USING btree ("partner_id");
  CREATE INDEX "events_external_links_order_idx" ON "events_external_links" USING btree ("_order");
  CREATE INDEX "events_external_links_parent_id_idx" ON "events_external_links" USING btree ("_parent_id");
  CREATE INDEX "events_cycle_idx" ON "events" USING btree ("cycle_id");
  CREATE INDEX "events_hero_image_idx" ON "events" USING btree ("hero_image_id");
  CREATE INDEX "events_start_at_idx" ON "events" USING btree ("start_at");
  CREATE INDEX "events_end_at_idx" ON "events" USING btree ("end_at");
  CREATE INDEX "events_seo_seo_image_idx" ON "events" USING btree ("seo_image_id");
  CREATE UNIQUE INDEX "events_slug_idx" ON "events" USING btree ("slug");
  CREATE INDEX "events_author_idx" ON "events" USING btree ("author_id");
  CREATE INDEX "events_published_at_idx" ON "events" USING btree ("published_at");
  CREATE INDEX "events_defaults_applied_cycle_idx" ON "events" USING btree ("defaults_applied_cycle_id");
  CREATE UNIQUE INDEX "events_calendar_u_i_d_idx" ON "events" USING btree ("calendar_u_i_d");
  CREATE INDEX "events_updated_at_idx" ON "events" USING btree ("updated_at");
  CREATE INDEX "events_created_at_idx" ON "events" USING btree ("created_at");
  CREATE INDEX "events__status_idx" ON "events" USING btree ("_status");
  CREATE INDEX "events_rels_order_idx" ON "events_rels" USING btree ("order");
  CREATE INDEX "events_rels_parent_idx" ON "events_rels" USING btree ("parent_id");
  CREATE INDEX "events_rels_path_idx" ON "events_rels" USING btree ("path");
  CREATE INDEX "events_rels_categories_id_idx" ON "events_rels" USING btree ("categories_id");
  CREATE INDEX "events_rels_tags_id_idx" ON "events_rels" USING btree ("tags_id");
  CREATE INDEX "_events_v_blocks_rich_text_order_idx" ON "_events_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_events_v_blocks_rich_text_parent_id_idx" ON "_events_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_events_v_blocks_rich_text_path_idx" ON "_events_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_events_v_blocks_listing_sources_order_idx" ON "_events_v_blocks_listing_sources" USING btree ("order");
  CREATE INDEX "_events_v_blocks_listing_sources_parent_idx" ON "_events_v_blocks_listing_sources" USING btree ("parent_id");
  CREATE INDEX "_events_v_blocks_listing_order_idx" ON "_events_v_blocks_listing" USING btree ("_order");
  CREATE INDEX "_events_v_blocks_listing_parent_id_idx" ON "_events_v_blocks_listing" USING btree ("_parent_id");
  CREATE INDEX "_events_v_blocks_listing_path_idx" ON "_events_v_blocks_listing" USING btree ("_path");
  CREATE INDEX "_events_v_blocks_listing_parent_page_idx" ON "_events_v_blocks_listing" USING btree ("parent_page_id");
  CREATE INDEX "_events_v_blocks_listing_category_idx" ON "_events_v_blocks_listing" USING btree ("category_id");
  CREATE INDEX "_events_v_blocks_listing_tag_idx" ON "_events_v_blocks_listing" USING btree ("tag_id");
  CREATE INDEX "_events_v_blocks_listing_event_cycle_idx" ON "_events_v_blocks_listing" USING btree ("event_cycle_id");
  CREATE INDEX "_events_v_blocks_media_gallery_items_order_idx" ON "_events_v_blocks_media_gallery_items" USING btree ("_order");
  CREATE INDEX "_events_v_blocks_media_gallery_items_parent_id_idx" ON "_events_v_blocks_media_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "_events_v_blocks_media_gallery_items_media_idx" ON "_events_v_blocks_media_gallery_items" USING btree ("media_id");
  CREATE INDEX "_events_v_blocks_media_gallery_order_idx" ON "_events_v_blocks_media_gallery" USING btree ("_order");
  CREATE INDEX "_events_v_blocks_media_gallery_parent_id_idx" ON "_events_v_blocks_media_gallery" USING btree ("_parent_id");
  CREATE INDEX "_events_v_blocks_media_gallery_path_idx" ON "_events_v_blocks_media_gallery" USING btree ("_path");
  CREATE INDEX "_events_v_blocks_media_gallery_category_idx" ON "_events_v_blocks_media_gallery" USING btree ("category_id");
  CREATE INDEX "_events_v_blocks_media_gallery_tag_idx" ON "_events_v_blocks_media_gallery" USING btree ("tag_id");
  CREATE INDEX "_events_v_blocks_attachments_items_order_idx" ON "_events_v_blocks_attachments_items" USING btree ("_order");
  CREATE INDEX "_events_v_blocks_attachments_items_parent_id_idx" ON "_events_v_blocks_attachments_items" USING btree ("_parent_id");
  CREATE INDEX "_events_v_blocks_attachments_items_media_idx" ON "_events_v_blocks_attachments_items" USING btree ("media_id");
  CREATE INDEX "_events_v_blocks_attachments_order_idx" ON "_events_v_blocks_attachments" USING btree ("_order");
  CREATE INDEX "_events_v_blocks_attachments_parent_id_idx" ON "_events_v_blocks_attachments" USING btree ("_parent_id");
  CREATE INDEX "_events_v_blocks_attachments_path_idx" ON "_events_v_blocks_attachments" USING btree ("_path");
  CREATE INDEX "_events_v_blocks_attachments_category_idx" ON "_events_v_blocks_attachments" USING btree ("category_id");
  CREATE INDEX "_events_v_blocks_attachments_tag_idx" ON "_events_v_blocks_attachments" USING btree ("tag_id");
  CREATE INDEX "_events_v_blocks_member_profiles_entries_order_idx" ON "_events_v_blocks_member_profiles_entries" USING btree ("_order");
  CREATE INDEX "_events_v_blocks_member_profiles_entries_parent_id_idx" ON "_events_v_blocks_member_profiles_entries" USING btree ("_parent_id");
  CREATE INDEX "_events_v_blocks_member_profiles_entries_profile_idx" ON "_events_v_blocks_member_profiles_entries" USING btree ("profile_id");
  CREATE INDEX "_events_v_blocks_member_profiles_order_idx" ON "_events_v_blocks_member_profiles" USING btree ("_order");
  CREATE INDEX "_events_v_blocks_member_profiles_parent_id_idx" ON "_events_v_blocks_member_profiles" USING btree ("_parent_id");
  CREATE INDEX "_events_v_blocks_member_profiles_path_idx" ON "_events_v_blocks_member_profiles" USING btree ("_path");
  CREATE INDEX "_events_v_version_organizers_order_idx" ON "_events_v_version_organizers" USING btree ("_order");
  CREATE INDEX "_events_v_version_organizers_parent_id_idx" ON "_events_v_version_organizers" USING btree ("_parent_id");
  CREATE INDEX "_events_v_version_organizers_profile_idx" ON "_events_v_version_organizers" USING btree ("profile_id");
  CREATE INDEX "_events_v_version_partners_roles_order_idx" ON "_events_v_version_partners_roles" USING btree ("order");
  CREATE INDEX "_events_v_version_partners_roles_parent_idx" ON "_events_v_version_partners_roles" USING btree ("parent_id");
  CREATE INDEX "_events_v_version_partners_order_idx" ON "_events_v_version_partners" USING btree ("_order");
  CREATE INDEX "_events_v_version_partners_parent_id_idx" ON "_events_v_version_partners" USING btree ("_parent_id");
  CREATE INDEX "_events_v_version_partners_partner_idx" ON "_events_v_version_partners" USING btree ("partner_id");
  CREATE INDEX "_events_v_version_external_links_order_idx" ON "_events_v_version_external_links" USING btree ("_order");
  CREATE INDEX "_events_v_version_external_links_parent_id_idx" ON "_events_v_version_external_links" USING btree ("_parent_id");
  CREATE INDEX "_events_v_parent_idx" ON "_events_v" USING btree ("parent_id");
  CREATE INDEX "_events_v_version_version_cycle_idx" ON "_events_v" USING btree ("version_cycle_id");
  CREATE INDEX "_events_v_version_version_hero_image_idx" ON "_events_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_events_v_version_version_start_at_idx" ON "_events_v" USING btree ("version_start_at");
  CREATE INDEX "_events_v_version_version_end_at_idx" ON "_events_v" USING btree ("version_end_at");
  CREATE INDEX "_events_v_version_seo_version_seo_image_idx" ON "_events_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_events_v_version_version_slug_idx" ON "_events_v" USING btree ("version_slug");
  CREATE INDEX "_events_v_version_version_author_idx" ON "_events_v" USING btree ("version_author_id");
  CREATE INDEX "_events_v_version_version_published_at_idx" ON "_events_v" USING btree ("version_published_at");
  CREATE INDEX "_events_v_version_version_defaults_applied_cycle_idx" ON "_events_v" USING btree ("version_defaults_applied_cycle_id");
  CREATE INDEX "_events_v_version_version_calendar_u_i_d_idx" ON "_events_v" USING btree ("version_calendar_u_i_d");
  CREATE INDEX "_events_v_version_version_updated_at_idx" ON "_events_v" USING btree ("version_updated_at");
  CREATE INDEX "_events_v_version_version_created_at_idx" ON "_events_v" USING btree ("version_created_at");
  CREATE INDEX "_events_v_version_version__status_idx" ON "_events_v" USING btree ("version__status");
  CREATE INDEX "_events_v_created_at_idx" ON "_events_v" USING btree ("created_at");
  CREATE INDEX "_events_v_updated_at_idx" ON "_events_v" USING btree ("updated_at");
  CREATE INDEX "_events_v_latest_idx" ON "_events_v" USING btree ("latest");
  CREATE INDEX "_events_v_rels_order_idx" ON "_events_v_rels" USING btree ("order");
  CREATE INDEX "_events_v_rels_parent_idx" ON "_events_v_rels" USING btree ("parent_id");
  CREATE INDEX "_events_v_rels_path_idx" ON "_events_v_rels" USING btree ("path");
  CREATE INDEX "_events_v_rels_categories_id_idx" ON "_events_v_rels" USING btree ("categories_id");
  CREATE INDEX "_events_v_rels_tags_id_idx" ON "_events_v_rels" USING btree ("tags_id");
  CREATE INDEX "event_cycles_blocks_rich_text_order_idx" ON "event_cycles_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "event_cycles_blocks_rich_text_parent_id_idx" ON "event_cycles_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "event_cycles_blocks_rich_text_path_idx" ON "event_cycles_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "event_cycles_blocks_listing_sources_order_idx" ON "event_cycles_blocks_listing_sources" USING btree ("order");
  CREATE INDEX "event_cycles_blocks_listing_sources_parent_idx" ON "event_cycles_blocks_listing_sources" USING btree ("parent_id");
  CREATE INDEX "event_cycles_blocks_listing_order_idx" ON "event_cycles_blocks_listing" USING btree ("_order");
  CREATE INDEX "event_cycles_blocks_listing_parent_id_idx" ON "event_cycles_blocks_listing" USING btree ("_parent_id");
  CREATE INDEX "event_cycles_blocks_listing_path_idx" ON "event_cycles_blocks_listing" USING btree ("_path");
  CREATE INDEX "event_cycles_blocks_listing_parent_page_idx" ON "event_cycles_blocks_listing" USING btree ("parent_page_id");
  CREATE INDEX "event_cycles_blocks_listing_category_idx" ON "event_cycles_blocks_listing" USING btree ("category_id");
  CREATE INDEX "event_cycles_blocks_listing_tag_idx" ON "event_cycles_blocks_listing" USING btree ("tag_id");
  CREATE INDEX "event_cycles_blocks_listing_event_cycle_idx" ON "event_cycles_blocks_listing" USING btree ("event_cycle_id");
  CREATE INDEX "event_cycles_blocks_media_gallery_items_order_idx" ON "event_cycles_blocks_media_gallery_items" USING btree ("_order");
  CREATE INDEX "event_cycles_blocks_media_gallery_items_parent_id_idx" ON "event_cycles_blocks_media_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "event_cycles_blocks_media_gallery_items_media_idx" ON "event_cycles_blocks_media_gallery_items" USING btree ("media_id");
  CREATE INDEX "event_cycles_blocks_media_gallery_order_idx" ON "event_cycles_blocks_media_gallery" USING btree ("_order");
  CREATE INDEX "event_cycles_blocks_media_gallery_parent_id_idx" ON "event_cycles_blocks_media_gallery" USING btree ("_parent_id");
  CREATE INDEX "event_cycles_blocks_media_gallery_path_idx" ON "event_cycles_blocks_media_gallery" USING btree ("_path");
  CREATE INDEX "event_cycles_blocks_media_gallery_category_idx" ON "event_cycles_blocks_media_gallery" USING btree ("category_id");
  CREATE INDEX "event_cycles_blocks_media_gallery_tag_idx" ON "event_cycles_blocks_media_gallery" USING btree ("tag_id");
  CREATE INDEX "event_cycles_blocks_attachments_items_order_idx" ON "event_cycles_blocks_attachments_items" USING btree ("_order");
  CREATE INDEX "event_cycles_blocks_attachments_items_parent_id_idx" ON "event_cycles_blocks_attachments_items" USING btree ("_parent_id");
  CREATE INDEX "event_cycles_blocks_attachments_items_media_idx" ON "event_cycles_blocks_attachments_items" USING btree ("media_id");
  CREATE INDEX "event_cycles_blocks_attachments_order_idx" ON "event_cycles_blocks_attachments" USING btree ("_order");
  CREATE INDEX "event_cycles_blocks_attachments_parent_id_idx" ON "event_cycles_blocks_attachments" USING btree ("_parent_id");
  CREATE INDEX "event_cycles_blocks_attachments_path_idx" ON "event_cycles_blocks_attachments" USING btree ("_path");
  CREATE INDEX "event_cycles_blocks_attachments_category_idx" ON "event_cycles_blocks_attachments" USING btree ("category_id");
  CREATE INDEX "event_cycles_blocks_attachments_tag_idx" ON "event_cycles_blocks_attachments" USING btree ("tag_id");
  CREATE INDEX "event_cycles_blocks_member_profiles_entries_order_idx" ON "event_cycles_blocks_member_profiles_entries" USING btree ("_order");
  CREATE INDEX "event_cycles_blocks_member_profiles_entries_parent_id_idx" ON "event_cycles_blocks_member_profiles_entries" USING btree ("_parent_id");
  CREATE INDEX "event_cycles_blocks_member_profiles_entries_profile_idx" ON "event_cycles_blocks_member_profiles_entries" USING btree ("profile_id");
  CREATE INDEX "event_cycles_blocks_member_profiles_order_idx" ON "event_cycles_blocks_member_profiles" USING btree ("_order");
  CREATE INDEX "event_cycles_blocks_member_profiles_parent_id_idx" ON "event_cycles_blocks_member_profiles" USING btree ("_parent_id");
  CREATE INDEX "event_cycles_blocks_member_profiles_path_idx" ON "event_cycles_blocks_member_profiles" USING btree ("_path");
  CREATE INDEX "event_cycles_event_defaults_organizers_order_idx" ON "event_cycles_event_defaults_organizers" USING btree ("_order");
  CREATE INDEX "event_cycles_event_defaults_organizers_parent_id_idx" ON "event_cycles_event_defaults_organizers" USING btree ("_parent_id");
  CREATE INDEX "event_cycles_event_defaults_organizers_profile_idx" ON "event_cycles_event_defaults_organizers" USING btree ("profile_id");
  CREATE INDEX "event_cycles_event_defaults_partners_roles_order_idx" ON "event_cycles_event_defaults_partners_roles" USING btree ("order");
  CREATE INDEX "event_cycles_event_defaults_partners_roles_parent_idx" ON "event_cycles_event_defaults_partners_roles" USING btree ("parent_id");
  CREATE INDEX "event_cycles_event_defaults_partners_order_idx" ON "event_cycles_event_defaults_partners" USING btree ("_order");
  CREATE INDEX "event_cycles_event_defaults_partners_parent_id_idx" ON "event_cycles_event_defaults_partners" USING btree ("_parent_id");
  CREATE INDEX "event_cycles_event_defaults_partners_partner_idx" ON "event_cycles_event_defaults_partners" USING btree ("partner_id");
  CREATE INDEX "event_cycles_event_defaults_external_links_order_idx" ON "event_cycles_event_defaults_external_links" USING btree ("_order");
  CREATE INDEX "event_cycles_event_defaults_external_links_parent_id_idx" ON "event_cycles_event_defaults_external_links" USING btree ("_parent_id");
  CREATE INDEX "event_cycles_hero_image_idx" ON "event_cycles" USING btree ("hero_image_id");
  CREATE INDEX "event_cycles_event_defaults_event_defaults_hero_image_idx" ON "event_cycles" USING btree ("event_defaults_hero_image_id");
  CREATE INDEX "event_cycles_seo_seo_image_idx" ON "event_cycles" USING btree ("seo_image_id");
  CREATE UNIQUE INDEX "event_cycles_slug_idx" ON "event_cycles" USING btree ("slug");
  CREATE INDEX "event_cycles_author_idx" ON "event_cycles" USING btree ("author_id");
  CREATE INDEX "event_cycles_published_at_idx" ON "event_cycles" USING btree ("published_at");
  CREATE UNIQUE INDEX "event_cycles_calendar_feed_key_idx" ON "event_cycles" USING btree ("calendar_feed_key");
  CREATE INDEX "event_cycles_updated_at_idx" ON "event_cycles" USING btree ("updated_at");
  CREATE INDEX "event_cycles_created_at_idx" ON "event_cycles" USING btree ("created_at");
  CREATE INDEX "event_cycles__status_idx" ON "event_cycles" USING btree ("_status");
  CREATE INDEX "event_cycles_rels_order_idx" ON "event_cycles_rels" USING btree ("order");
  CREATE INDEX "event_cycles_rels_parent_idx" ON "event_cycles_rels" USING btree ("parent_id");
  CREATE INDEX "event_cycles_rels_path_idx" ON "event_cycles_rels" USING btree ("path");
  CREATE INDEX "event_cycles_rels_categories_id_idx" ON "event_cycles_rels" USING btree ("categories_id");
  CREATE INDEX "event_cycles_rels_tags_id_idx" ON "event_cycles_rels" USING btree ("tags_id");
  CREATE INDEX "_event_cycles_v_blocks_rich_text_order_idx" ON "_event_cycles_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_event_cycles_v_blocks_rich_text_parent_id_idx" ON "_event_cycles_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_event_cycles_v_blocks_rich_text_path_idx" ON "_event_cycles_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_event_cycles_v_blocks_listing_sources_order_idx" ON "_event_cycles_v_blocks_listing_sources" USING btree ("order");
  CREATE INDEX "_event_cycles_v_blocks_listing_sources_parent_idx" ON "_event_cycles_v_blocks_listing_sources" USING btree ("parent_id");
  CREATE INDEX "_event_cycles_v_blocks_listing_order_idx" ON "_event_cycles_v_blocks_listing" USING btree ("_order");
  CREATE INDEX "_event_cycles_v_blocks_listing_parent_id_idx" ON "_event_cycles_v_blocks_listing" USING btree ("_parent_id");
  CREATE INDEX "_event_cycles_v_blocks_listing_path_idx" ON "_event_cycles_v_blocks_listing" USING btree ("_path");
  CREATE INDEX "_event_cycles_v_blocks_listing_parent_page_idx" ON "_event_cycles_v_blocks_listing" USING btree ("parent_page_id");
  CREATE INDEX "_event_cycles_v_blocks_listing_category_idx" ON "_event_cycles_v_blocks_listing" USING btree ("category_id");
  CREATE INDEX "_event_cycles_v_blocks_listing_tag_idx" ON "_event_cycles_v_blocks_listing" USING btree ("tag_id");
  CREATE INDEX "_event_cycles_v_blocks_listing_event_cycle_idx" ON "_event_cycles_v_blocks_listing" USING btree ("event_cycle_id");
  CREATE INDEX "_event_cycles_v_blocks_media_gallery_items_order_idx" ON "_event_cycles_v_blocks_media_gallery_items" USING btree ("_order");
  CREATE INDEX "_event_cycles_v_blocks_media_gallery_items_parent_id_idx" ON "_event_cycles_v_blocks_media_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "_event_cycles_v_blocks_media_gallery_items_media_idx" ON "_event_cycles_v_blocks_media_gallery_items" USING btree ("media_id");
  CREATE INDEX "_event_cycles_v_blocks_media_gallery_order_idx" ON "_event_cycles_v_blocks_media_gallery" USING btree ("_order");
  CREATE INDEX "_event_cycles_v_blocks_media_gallery_parent_id_idx" ON "_event_cycles_v_blocks_media_gallery" USING btree ("_parent_id");
  CREATE INDEX "_event_cycles_v_blocks_media_gallery_path_idx" ON "_event_cycles_v_blocks_media_gallery" USING btree ("_path");
  CREATE INDEX "_event_cycles_v_blocks_media_gallery_category_idx" ON "_event_cycles_v_blocks_media_gallery" USING btree ("category_id");
  CREATE INDEX "_event_cycles_v_blocks_media_gallery_tag_idx" ON "_event_cycles_v_blocks_media_gallery" USING btree ("tag_id");
  CREATE INDEX "_event_cycles_v_blocks_attachments_items_order_idx" ON "_event_cycles_v_blocks_attachments_items" USING btree ("_order");
  CREATE INDEX "_event_cycles_v_blocks_attachments_items_parent_id_idx" ON "_event_cycles_v_blocks_attachments_items" USING btree ("_parent_id");
  CREATE INDEX "_event_cycles_v_blocks_attachments_items_media_idx" ON "_event_cycles_v_blocks_attachments_items" USING btree ("media_id");
  CREATE INDEX "_event_cycles_v_blocks_attachments_order_idx" ON "_event_cycles_v_blocks_attachments" USING btree ("_order");
  CREATE INDEX "_event_cycles_v_blocks_attachments_parent_id_idx" ON "_event_cycles_v_blocks_attachments" USING btree ("_parent_id");
  CREATE INDEX "_event_cycles_v_blocks_attachments_path_idx" ON "_event_cycles_v_blocks_attachments" USING btree ("_path");
  CREATE INDEX "_event_cycles_v_blocks_attachments_category_idx" ON "_event_cycles_v_blocks_attachments" USING btree ("category_id");
  CREATE INDEX "_event_cycles_v_blocks_attachments_tag_idx" ON "_event_cycles_v_blocks_attachments" USING btree ("tag_id");
  CREATE INDEX "_event_cycles_v_blocks_member_profiles_entries_order_idx" ON "_event_cycles_v_blocks_member_profiles_entries" USING btree ("_order");
  CREATE INDEX "_event_cycles_v_blocks_member_profiles_entries_parent_id_idx" ON "_event_cycles_v_blocks_member_profiles_entries" USING btree ("_parent_id");
  CREATE INDEX "_event_cycles_v_blocks_member_profiles_entries_profile_idx" ON "_event_cycles_v_blocks_member_profiles_entries" USING btree ("profile_id");
  CREATE INDEX "_event_cycles_v_blocks_member_profiles_order_idx" ON "_event_cycles_v_blocks_member_profiles" USING btree ("_order");
  CREATE INDEX "_event_cycles_v_blocks_member_profiles_parent_id_idx" ON "_event_cycles_v_blocks_member_profiles" USING btree ("_parent_id");
  CREATE INDEX "_event_cycles_v_blocks_member_profiles_path_idx" ON "_event_cycles_v_blocks_member_profiles" USING btree ("_path");
  CREATE INDEX "_event_cycles_v_version_event_defaults_organizers_order_idx" ON "_event_cycles_v_version_event_defaults_organizers" USING btree ("_order");
  CREATE INDEX "_event_cycles_v_version_event_defaults_organizers_parent_id_idx" ON "_event_cycles_v_version_event_defaults_organizers" USING btree ("_parent_id");
  CREATE INDEX "_event_cycles_v_version_event_defaults_organizers_profil_idx" ON "_event_cycles_v_version_event_defaults_organizers" USING btree ("profile_id");
  CREATE INDEX "_event_cycles_v_version_event_defaults_partners_roles_order_idx" ON "_event_cycles_v_version_event_defaults_partners_roles" USING btree ("order");
  CREATE INDEX "_event_cycles_v_version_event_defaults_partners_roles_parent_idx" ON "_event_cycles_v_version_event_defaults_partners_roles" USING btree ("parent_id");
  CREATE INDEX "_event_cycles_v_version_event_defaults_partners_order_idx" ON "_event_cycles_v_version_event_defaults_partners" USING btree ("_order");
  CREATE INDEX "_event_cycles_v_version_event_defaults_partners_parent_id_idx" ON "_event_cycles_v_version_event_defaults_partners" USING btree ("_parent_id");
  CREATE INDEX "_event_cycles_v_version_event_defaults_partners_partner_idx" ON "_event_cycles_v_version_event_defaults_partners" USING btree ("partner_id");
  CREATE INDEX "_event_cycles_v_version_event_defaults_external_links_order_idx" ON "_event_cycles_v_version_event_defaults_external_links" USING btree ("_order");
  CREATE INDEX "_event_cycles_v_version_event_defaults_external_links_parent_id_idx" ON "_event_cycles_v_version_event_defaults_external_links" USING btree ("_parent_id");
  CREATE INDEX "_event_cycles_v_parent_idx" ON "_event_cycles_v" USING btree ("parent_id");
  CREATE INDEX "_event_cycles_v_version_version_hero_image_idx" ON "_event_cycles_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_event_cycles_v_version_event_defaults_version_event_def_idx" ON "_event_cycles_v" USING btree ("version_event_defaults_hero_image_id");
  CREATE INDEX "_event_cycles_v_version_seo_version_seo_image_idx" ON "_event_cycles_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_event_cycles_v_version_version_slug_idx" ON "_event_cycles_v" USING btree ("version_slug");
  CREATE INDEX "_event_cycles_v_version_version_author_idx" ON "_event_cycles_v" USING btree ("version_author_id");
  CREATE INDEX "_event_cycles_v_version_version_published_at_idx" ON "_event_cycles_v" USING btree ("version_published_at");
  CREATE INDEX "_event_cycles_v_version_version_calendar_feed_key_idx" ON "_event_cycles_v" USING btree ("version_calendar_feed_key");
  CREATE INDEX "_event_cycles_v_version_version_updated_at_idx" ON "_event_cycles_v" USING btree ("version_updated_at");
  CREATE INDEX "_event_cycles_v_version_version_created_at_idx" ON "_event_cycles_v" USING btree ("version_created_at");
  CREATE INDEX "_event_cycles_v_version_version__status_idx" ON "_event_cycles_v" USING btree ("version__status");
  CREATE INDEX "_event_cycles_v_created_at_idx" ON "_event_cycles_v" USING btree ("created_at");
  CREATE INDEX "_event_cycles_v_updated_at_idx" ON "_event_cycles_v" USING btree ("updated_at");
  CREATE INDEX "_event_cycles_v_latest_idx" ON "_event_cycles_v" USING btree ("latest");
  CREATE INDEX "_event_cycles_v_rels_order_idx" ON "_event_cycles_v_rels" USING btree ("order");
  CREATE INDEX "_event_cycles_v_rels_parent_idx" ON "_event_cycles_v_rels" USING btree ("parent_id");
  CREATE INDEX "_event_cycles_v_rels_path_idx" ON "_event_cycles_v_rels" USING btree ("path");
  CREATE INDEX "_event_cycles_v_rels_categories_id_idx" ON "_event_cycles_v_rels" USING btree ("categories_id");
  CREATE INDEX "_event_cycles_v_rels_tags_id_idx" ON "_event_cycles_v_rels" USING btree ("tags_id");
  CREATE INDEX "partners_blocks_rich_text_order_idx" ON "partners_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "partners_blocks_rich_text_parent_id_idx" ON "partners_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "partners_blocks_rich_text_path_idx" ON "partners_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "partners_blocks_listing_sources_order_idx" ON "partners_blocks_listing_sources" USING btree ("order");
  CREATE INDEX "partners_blocks_listing_sources_parent_idx" ON "partners_blocks_listing_sources" USING btree ("parent_id");
  CREATE INDEX "partners_blocks_listing_order_idx" ON "partners_blocks_listing" USING btree ("_order");
  CREATE INDEX "partners_blocks_listing_parent_id_idx" ON "partners_blocks_listing" USING btree ("_parent_id");
  CREATE INDEX "partners_blocks_listing_path_idx" ON "partners_blocks_listing" USING btree ("_path");
  CREATE INDEX "partners_blocks_listing_parent_page_idx" ON "partners_blocks_listing" USING btree ("parent_page_id");
  CREATE INDEX "partners_blocks_listing_category_idx" ON "partners_blocks_listing" USING btree ("category_id");
  CREATE INDEX "partners_blocks_listing_tag_idx" ON "partners_blocks_listing" USING btree ("tag_id");
  CREATE INDEX "partners_blocks_listing_event_cycle_idx" ON "partners_blocks_listing" USING btree ("event_cycle_id");
  CREATE INDEX "partners_blocks_media_gallery_items_order_idx" ON "partners_blocks_media_gallery_items" USING btree ("_order");
  CREATE INDEX "partners_blocks_media_gallery_items_parent_id_idx" ON "partners_blocks_media_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "partners_blocks_media_gallery_items_media_idx" ON "partners_blocks_media_gallery_items" USING btree ("media_id");
  CREATE INDEX "partners_blocks_media_gallery_order_idx" ON "partners_blocks_media_gallery" USING btree ("_order");
  CREATE INDEX "partners_blocks_media_gallery_parent_id_idx" ON "partners_blocks_media_gallery" USING btree ("_parent_id");
  CREATE INDEX "partners_blocks_media_gallery_path_idx" ON "partners_blocks_media_gallery" USING btree ("_path");
  CREATE INDEX "partners_blocks_media_gallery_category_idx" ON "partners_blocks_media_gallery" USING btree ("category_id");
  CREATE INDEX "partners_blocks_media_gallery_tag_idx" ON "partners_blocks_media_gallery" USING btree ("tag_id");
  CREATE INDEX "partners_blocks_attachments_items_order_idx" ON "partners_blocks_attachments_items" USING btree ("_order");
  CREATE INDEX "partners_blocks_attachments_items_parent_id_idx" ON "partners_blocks_attachments_items" USING btree ("_parent_id");
  CREATE INDEX "partners_blocks_attachments_items_media_idx" ON "partners_blocks_attachments_items" USING btree ("media_id");
  CREATE INDEX "partners_blocks_attachments_order_idx" ON "partners_blocks_attachments" USING btree ("_order");
  CREATE INDEX "partners_blocks_attachments_parent_id_idx" ON "partners_blocks_attachments" USING btree ("_parent_id");
  CREATE INDEX "partners_blocks_attachments_path_idx" ON "partners_blocks_attachments" USING btree ("_path");
  CREATE INDEX "partners_blocks_attachments_category_idx" ON "partners_blocks_attachments" USING btree ("category_id");
  CREATE INDEX "partners_blocks_attachments_tag_idx" ON "partners_blocks_attachments" USING btree ("tag_id");
  CREATE INDEX "partners_blocks_member_profiles_entries_order_idx" ON "partners_blocks_member_profiles_entries" USING btree ("_order");
  CREATE INDEX "partners_blocks_member_profiles_entries_parent_id_idx" ON "partners_blocks_member_profiles_entries" USING btree ("_parent_id");
  CREATE INDEX "partners_blocks_member_profiles_entries_profile_idx" ON "partners_blocks_member_profiles_entries" USING btree ("profile_id");
  CREATE INDEX "partners_blocks_member_profiles_order_idx" ON "partners_blocks_member_profiles" USING btree ("_order");
  CREATE INDEX "partners_blocks_member_profiles_parent_id_idx" ON "partners_blocks_member_profiles" USING btree ("_parent_id");
  CREATE INDEX "partners_blocks_member_profiles_path_idx" ON "partners_blocks_member_profiles" USING btree ("_path");
  CREATE INDEX "partners_hero_image_idx" ON "partners" USING btree ("hero_image_id");
  CREATE INDEX "partners_seo_seo_image_idx" ON "partners" USING btree ("seo_image_id");
  CREATE UNIQUE INDEX "partners_slug_idx" ON "partners" USING btree ("slug");
  CREATE INDEX "partners_author_idx" ON "partners" USING btree ("author_id");
  CREATE INDEX "partners_published_at_idx" ON "partners" USING btree ("published_at");
  CREATE INDEX "partners_updated_at_idx" ON "partners" USING btree ("updated_at");
  CREATE INDEX "partners_created_at_idx" ON "partners" USING btree ("created_at");
  CREATE INDEX "partners__status_idx" ON "partners" USING btree ("_status");
  CREATE INDEX "_partners_v_blocks_rich_text_order_idx" ON "_partners_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_partners_v_blocks_rich_text_parent_id_idx" ON "_partners_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_partners_v_blocks_rich_text_path_idx" ON "_partners_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_partners_v_blocks_listing_sources_order_idx" ON "_partners_v_blocks_listing_sources" USING btree ("order");
  CREATE INDEX "_partners_v_blocks_listing_sources_parent_idx" ON "_partners_v_blocks_listing_sources" USING btree ("parent_id");
  CREATE INDEX "_partners_v_blocks_listing_order_idx" ON "_partners_v_blocks_listing" USING btree ("_order");
  CREATE INDEX "_partners_v_blocks_listing_parent_id_idx" ON "_partners_v_blocks_listing" USING btree ("_parent_id");
  CREATE INDEX "_partners_v_blocks_listing_path_idx" ON "_partners_v_blocks_listing" USING btree ("_path");
  CREATE INDEX "_partners_v_blocks_listing_parent_page_idx" ON "_partners_v_blocks_listing" USING btree ("parent_page_id");
  CREATE INDEX "_partners_v_blocks_listing_category_idx" ON "_partners_v_blocks_listing" USING btree ("category_id");
  CREATE INDEX "_partners_v_blocks_listing_tag_idx" ON "_partners_v_blocks_listing" USING btree ("tag_id");
  CREATE INDEX "_partners_v_blocks_listing_event_cycle_idx" ON "_partners_v_blocks_listing" USING btree ("event_cycle_id");
  CREATE INDEX "_partners_v_blocks_media_gallery_items_order_idx" ON "_partners_v_blocks_media_gallery_items" USING btree ("_order");
  CREATE INDEX "_partners_v_blocks_media_gallery_items_parent_id_idx" ON "_partners_v_blocks_media_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "_partners_v_blocks_media_gallery_items_media_idx" ON "_partners_v_blocks_media_gallery_items" USING btree ("media_id");
  CREATE INDEX "_partners_v_blocks_media_gallery_order_idx" ON "_partners_v_blocks_media_gallery" USING btree ("_order");
  CREATE INDEX "_partners_v_blocks_media_gallery_parent_id_idx" ON "_partners_v_blocks_media_gallery" USING btree ("_parent_id");
  CREATE INDEX "_partners_v_blocks_media_gallery_path_idx" ON "_partners_v_blocks_media_gallery" USING btree ("_path");
  CREATE INDEX "_partners_v_blocks_media_gallery_category_idx" ON "_partners_v_blocks_media_gallery" USING btree ("category_id");
  CREATE INDEX "_partners_v_blocks_media_gallery_tag_idx" ON "_partners_v_blocks_media_gallery" USING btree ("tag_id");
  CREATE INDEX "_partners_v_blocks_attachments_items_order_idx" ON "_partners_v_blocks_attachments_items" USING btree ("_order");
  CREATE INDEX "_partners_v_blocks_attachments_items_parent_id_idx" ON "_partners_v_blocks_attachments_items" USING btree ("_parent_id");
  CREATE INDEX "_partners_v_blocks_attachments_items_media_idx" ON "_partners_v_blocks_attachments_items" USING btree ("media_id");
  CREATE INDEX "_partners_v_blocks_attachments_order_idx" ON "_partners_v_blocks_attachments" USING btree ("_order");
  CREATE INDEX "_partners_v_blocks_attachments_parent_id_idx" ON "_partners_v_blocks_attachments" USING btree ("_parent_id");
  CREATE INDEX "_partners_v_blocks_attachments_path_idx" ON "_partners_v_blocks_attachments" USING btree ("_path");
  CREATE INDEX "_partners_v_blocks_attachments_category_idx" ON "_partners_v_blocks_attachments" USING btree ("category_id");
  CREATE INDEX "_partners_v_blocks_attachments_tag_idx" ON "_partners_v_blocks_attachments" USING btree ("tag_id");
  CREATE INDEX "_partners_v_blocks_member_profiles_entries_order_idx" ON "_partners_v_blocks_member_profiles_entries" USING btree ("_order");
  CREATE INDEX "_partners_v_blocks_member_profiles_entries_parent_id_idx" ON "_partners_v_blocks_member_profiles_entries" USING btree ("_parent_id");
  CREATE INDEX "_partners_v_blocks_member_profiles_entries_profile_idx" ON "_partners_v_blocks_member_profiles_entries" USING btree ("profile_id");
  CREATE INDEX "_partners_v_blocks_member_profiles_order_idx" ON "_partners_v_blocks_member_profiles" USING btree ("_order");
  CREATE INDEX "_partners_v_blocks_member_profiles_parent_id_idx" ON "_partners_v_blocks_member_profiles" USING btree ("_parent_id");
  CREATE INDEX "_partners_v_blocks_member_profiles_path_idx" ON "_partners_v_blocks_member_profiles" USING btree ("_path");
  CREATE INDEX "_partners_v_parent_idx" ON "_partners_v" USING btree ("parent_id");
  CREATE INDEX "_partners_v_version_version_hero_image_idx" ON "_partners_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_partners_v_version_seo_version_seo_image_idx" ON "_partners_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_partners_v_version_version_slug_idx" ON "_partners_v" USING btree ("version_slug");
  CREATE INDEX "_partners_v_version_version_author_idx" ON "_partners_v" USING btree ("version_author_id");
  CREATE INDEX "_partners_v_version_version_published_at_idx" ON "_partners_v" USING btree ("version_published_at");
  CREATE INDEX "_partners_v_version_version_updated_at_idx" ON "_partners_v" USING btree ("version_updated_at");
  CREATE INDEX "_partners_v_version_version_created_at_idx" ON "_partners_v" USING btree ("version_created_at");
  CREATE INDEX "_partners_v_version_version__status_idx" ON "_partners_v" USING btree ("version__status");
  CREATE INDEX "_partners_v_created_at_idx" ON "_partners_v" USING btree ("created_at");
  CREATE INDEX "_partners_v_updated_at_idx" ON "_partners_v" USING btree ("updated_at");
  CREATE INDEX "_partners_v_latest_idx" ON "_partners_v" USING btree ("latest");
  ALTER TABLE "pages_blocks_listing" ADD CONSTRAINT "pages_blocks_listing_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_listing" ADD CONSTRAINT "_pages_v_blocks_listing_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_listing" ADD CONSTRAINT "posts_blocks_listing_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_event_cycles_fk" FOREIGN KEY ("event_cycles_id") REFERENCES "public"."event_cycles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_listing" ADD CONSTRAINT "_posts_v_blocks_listing_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_event_cycles_fk" FOREIGN KEY ("event_cycles_id") REFERENCES "public"."event_cycles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "club_sections_menu_items" ADD CONSTRAINT "club_sections_menu_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "club_sections_menu_items" ADD CONSTRAINT "club_sections_menu_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "club_sections_menu_items" ADD CONSTRAINT "club_sections_menu_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_club_sections_v_version_menu_items" ADD CONSTRAINT "_club_sections_v_version_menu_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_club_sections_v_version_menu_items" ADD CONSTRAINT "_club_sections_v_version_menu_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_club_sections_v_version_menu_items" ADD CONSTRAINT "_club_sections_v_version_menu_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_event_cycles_fk" FOREIGN KEY ("event_cycles_id") REFERENCES "public"."event_cycles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_partners_fk" FOREIGN KEY ("partners_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_header_items" ADD CONSTRAINT "navigation_header_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_header_items" ADD CONSTRAINT "navigation_header_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_header_items" ADD CONSTRAINT "navigation_header_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_hero_items" ADD CONSTRAINT "navigation_hero_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_hero_items" ADD CONSTRAINT "navigation_hero_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_hero_items" ADD CONSTRAINT "navigation_hero_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_social_items" ADD CONSTRAINT "navigation_social_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_social_items" ADD CONSTRAINT "navigation_social_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_social_items" ADD CONSTRAINT "navigation_social_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns_items" ADD CONSTRAINT "navigation_footer_columns_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns_items" ADD CONSTRAINT "navigation_footer_columns_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns_items" ADD CONSTRAINT "navigation_footer_columns_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_blocks_listing_event_cycle_idx" ON "pages_blocks_listing" USING btree ("event_cycle_id");
  CREATE INDEX "_pages_v_blocks_listing_event_cycle_idx" ON "_pages_v_blocks_listing" USING btree ("event_cycle_id");
  CREATE INDEX "posts_blocks_listing_event_cycle_idx" ON "posts_blocks_listing" USING btree ("event_cycle_id");
  CREATE INDEX "posts_rels_events_id_idx" ON "posts_rels" USING btree ("events_id");
  CREATE INDEX "posts_rels_event_cycles_id_idx" ON "posts_rels" USING btree ("event_cycles_id");
  CREATE INDEX "_posts_v_blocks_listing_event_cycle_idx" ON "_posts_v_blocks_listing" USING btree ("event_cycle_id");
  CREATE INDEX "_posts_v_rels_events_id_idx" ON "_posts_v_rels" USING btree ("events_id");
  CREATE INDEX "_posts_v_rels_event_cycles_id_idx" ON "_posts_v_rels" USING btree ("event_cycles_id");
  CREATE INDEX "club_sections_menu_items_event_idx" ON "club_sections_menu_items" USING btree ("event_id");
  CREATE INDEX "club_sections_menu_items_event_cycle_idx" ON "club_sections_menu_items" USING btree ("event_cycle_id");
  CREATE INDEX "club_sections_menu_items_partner_idx" ON "club_sections_menu_items" USING btree ("partner_id");
  CREATE INDEX "_club_sections_v_version_menu_items_event_idx" ON "_club_sections_v_version_menu_items" USING btree ("event_id");
  CREATE INDEX "_club_sections_v_version_menu_items_event_cycle_idx" ON "_club_sections_v_version_menu_items" USING btree ("event_cycle_id");
  CREATE INDEX "_club_sections_v_version_menu_items_partner_idx" ON "_club_sections_v_version_menu_items" USING btree ("partner_id");
  CREATE INDEX "payload_locked_documents_rels_events_id_idx" ON "payload_locked_documents_rels" USING btree ("events_id");
  CREATE INDEX "payload_locked_documents_rels_event_cycles_id_idx" ON "payload_locked_documents_rels" USING btree ("event_cycles_id");
  CREATE INDEX "payload_locked_documents_rels_partners_id_idx" ON "payload_locked_documents_rels" USING btree ("partners_id");
  CREATE INDEX "navigation_header_items_event_idx" ON "navigation_header_items" USING btree ("event_id");
  CREATE INDEX "navigation_header_items_event_cycle_idx" ON "navigation_header_items" USING btree ("event_cycle_id");
  CREATE INDEX "navigation_header_items_partner_idx" ON "navigation_header_items" USING btree ("partner_id");
  CREATE INDEX "navigation_hero_items_event_idx" ON "navigation_hero_items" USING btree ("event_id");
  CREATE INDEX "navigation_hero_items_event_cycle_idx" ON "navigation_hero_items" USING btree ("event_cycle_id");
  CREATE INDEX "navigation_hero_items_partner_idx" ON "navigation_hero_items" USING btree ("partner_id");
  CREATE INDEX "navigation_social_items_event_idx" ON "navigation_social_items" USING btree ("event_id");
  CREATE INDEX "navigation_social_items_event_cycle_idx" ON "navigation_social_items" USING btree ("event_cycle_id");
  CREATE INDEX "navigation_social_items_partner_idx" ON "navigation_social_items" USING btree ("partner_id");
  CREATE INDEX "navigation_footer_columns_items_event_idx" ON "navigation_footer_columns_items" USING btree ("event_id");
  CREATE INDEX "navigation_footer_columns_items_event_cycle_idx" ON "navigation_footer_columns_items" USING btree ("event_cycle_id");
  CREATE INDEX "navigation_footer_columns_items_partner_idx" ON "navigation_footer_columns_items" USING btree ("partner_id");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_blocks_listing_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_blocks_listing" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_blocks_media_gallery_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_blocks_media_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_blocks_attachments_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_blocks_attachments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_blocks_member_profiles_entries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_blocks_member_profiles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_organizers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_partners_roles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_partners" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_external_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_v_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_v_blocks_listing_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_v_blocks_listing" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_v_blocks_media_gallery_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_v_blocks_media_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_v_blocks_attachments_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_v_blocks_attachments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_v_blocks_member_profiles_entries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_v_blocks_member_profiles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_v_version_organizers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_v_version_partners_roles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_v_version_partners" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_v_version_external_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "event_cycles_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "event_cycles_blocks_listing_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "event_cycles_blocks_listing" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "event_cycles_blocks_media_gallery_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "event_cycles_blocks_media_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "event_cycles_blocks_attachments_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "event_cycles_blocks_attachments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "event_cycles_blocks_member_profiles_entries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "event_cycles_blocks_member_profiles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "event_cycles_event_defaults_organizers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "event_cycles_event_defaults_partners_roles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "event_cycles_event_defaults_partners" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "event_cycles_event_defaults_external_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "event_cycles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "event_cycles_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_event_cycles_v_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_event_cycles_v_blocks_listing_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_event_cycles_v_blocks_listing" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_event_cycles_v_blocks_media_gallery_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_event_cycles_v_blocks_media_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_event_cycles_v_blocks_attachments_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_event_cycles_v_blocks_attachments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_event_cycles_v_blocks_member_profiles_entries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_event_cycles_v_blocks_member_profiles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_event_cycles_v_version_event_defaults_organizers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_event_cycles_v_version_event_defaults_partners_roles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_event_cycles_v_version_event_defaults_partners" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_event_cycles_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_event_cycles_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "partners_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "partners_blocks_listing_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "partners_blocks_listing" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "partners_blocks_media_gallery_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "partners_blocks_media_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "partners_blocks_attachments_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "partners_blocks_attachments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "partners_blocks_member_profiles_entries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "partners_blocks_member_profiles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "partners" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_partners_v_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_partners_v_blocks_listing_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_partners_v_blocks_listing" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_partners_v_blocks_media_gallery_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_partners_v_blocks_media_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_partners_v_blocks_attachments_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_partners_v_blocks_attachments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_partners_v_blocks_member_profiles_entries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_partners_v_blocks_member_profiles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_partners_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "events_blocks_rich_text" CASCADE;
  DROP TABLE "events_blocks_listing_sources" CASCADE;
  DROP TABLE "events_blocks_listing" CASCADE;
  DROP TABLE "events_blocks_media_gallery_items" CASCADE;
  DROP TABLE "events_blocks_media_gallery" CASCADE;
  DROP TABLE "events_blocks_attachments_items" CASCADE;
  DROP TABLE "events_blocks_attachments" CASCADE;
  DROP TABLE "events_blocks_member_profiles_entries" CASCADE;
  DROP TABLE "events_blocks_member_profiles" CASCADE;
  DROP TABLE "events_organizers" CASCADE;
  DROP TABLE "events_partners_roles" CASCADE;
  DROP TABLE "events_partners" CASCADE;
  DROP TABLE "events_external_links" CASCADE;
  DROP TABLE "events" CASCADE;
  DROP TABLE "events_rels" CASCADE;
  DROP TABLE "_events_v_blocks_rich_text" CASCADE;
  DROP TABLE "_events_v_blocks_listing_sources" CASCADE;
  DROP TABLE "_events_v_blocks_listing" CASCADE;
  DROP TABLE "_events_v_blocks_media_gallery_items" CASCADE;
  DROP TABLE "_events_v_blocks_media_gallery" CASCADE;
  DROP TABLE "_events_v_blocks_attachments_items" CASCADE;
  DROP TABLE "_events_v_blocks_attachments" CASCADE;
  DROP TABLE "_events_v_blocks_member_profiles_entries" CASCADE;
  DROP TABLE "_events_v_blocks_member_profiles" CASCADE;
  DROP TABLE "_events_v_version_organizers" CASCADE;
  DROP TABLE "_events_v_version_partners_roles" CASCADE;
  DROP TABLE "_events_v_version_partners" CASCADE;
  DROP TABLE "_events_v_version_external_links" CASCADE;
  DROP TABLE "_events_v" CASCADE;
  DROP TABLE "_events_v_rels" CASCADE;
  DROP TABLE "event_cycles_blocks_rich_text" CASCADE;
  DROP TABLE "event_cycles_blocks_listing_sources" CASCADE;
  DROP TABLE "event_cycles_blocks_listing" CASCADE;
  DROP TABLE "event_cycles_blocks_media_gallery_items" CASCADE;
  DROP TABLE "event_cycles_blocks_media_gallery" CASCADE;
  DROP TABLE "event_cycles_blocks_attachments_items" CASCADE;
  DROP TABLE "event_cycles_blocks_attachments" CASCADE;
  DROP TABLE "event_cycles_blocks_member_profiles_entries" CASCADE;
  DROP TABLE "event_cycles_blocks_member_profiles" CASCADE;
  DROP TABLE "event_cycles_event_defaults_organizers" CASCADE;
  DROP TABLE "event_cycles_event_defaults_partners_roles" CASCADE;
  DROP TABLE "event_cycles_event_defaults_partners" CASCADE;
  DROP TABLE "event_cycles_event_defaults_external_links" CASCADE;
  DROP TABLE "event_cycles" CASCADE;
  DROP TABLE "event_cycles_rels" CASCADE;
  DROP TABLE "_event_cycles_v_blocks_rich_text" CASCADE;
  DROP TABLE "_event_cycles_v_blocks_listing_sources" CASCADE;
  DROP TABLE "_event_cycles_v_blocks_listing" CASCADE;
  DROP TABLE "_event_cycles_v_blocks_media_gallery_items" CASCADE;
  DROP TABLE "_event_cycles_v_blocks_media_gallery" CASCADE;
  DROP TABLE "_event_cycles_v_blocks_attachments_items" CASCADE;
  DROP TABLE "_event_cycles_v_blocks_attachments" CASCADE;
  DROP TABLE "_event_cycles_v_blocks_member_profiles_entries" CASCADE;
  DROP TABLE "_event_cycles_v_blocks_member_profiles" CASCADE;
  DROP TABLE "_event_cycles_v_version_event_defaults_organizers" CASCADE;
  DROP TABLE "_event_cycles_v_version_event_defaults_partners_roles" CASCADE;
  DROP TABLE "_event_cycles_v_version_event_defaults_partners" CASCADE;
  DROP TABLE "_event_cycles_v_version_event_defaults_external_links" CASCADE;
  DROP TABLE "_event_cycles_v" CASCADE;
  DROP TABLE "_event_cycles_v_rels" CASCADE;
  DROP TABLE "partners_blocks_rich_text" CASCADE;
  DROP TABLE "partners_blocks_listing_sources" CASCADE;
  DROP TABLE "partners_blocks_listing" CASCADE;
  DROP TABLE "partners_blocks_media_gallery_items" CASCADE;
  DROP TABLE "partners_blocks_media_gallery" CASCADE;
  DROP TABLE "partners_blocks_attachments_items" CASCADE;
  DROP TABLE "partners_blocks_attachments" CASCADE;
  DROP TABLE "partners_blocks_member_profiles_entries" CASCADE;
  DROP TABLE "partners_blocks_member_profiles" CASCADE;
  DROP TABLE "partners" CASCADE;
  DROP TABLE "_partners_v_blocks_rich_text" CASCADE;
  DROP TABLE "_partners_v_blocks_listing_sources" CASCADE;
  DROP TABLE "_partners_v_blocks_listing" CASCADE;
  DROP TABLE "_partners_v_blocks_media_gallery_items" CASCADE;
  DROP TABLE "_partners_v_blocks_media_gallery" CASCADE;
  DROP TABLE "_partners_v_blocks_attachments_items" CASCADE;
  DROP TABLE "_partners_v_blocks_attachments" CASCADE;
  DROP TABLE "_partners_v_blocks_member_profiles_entries" CASCADE;
  DROP TABLE "_partners_v_blocks_member_profiles" CASCADE;
  DROP TABLE "_partners_v" CASCADE;
  ALTER TABLE "pages_blocks_listing" DROP CONSTRAINT IF EXISTS "pages_blocks_listing_event_cycle_id_event_cycles_id_fk";
  
  ALTER TABLE "_pages_v_blocks_listing" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_listing_event_cycle_id_event_cycles_id_fk";
  
  ALTER TABLE "posts_blocks_listing" DROP CONSTRAINT IF EXISTS "posts_blocks_listing_event_cycle_id_event_cycles_id_fk";
  
  ALTER TABLE "posts_rels" DROP CONSTRAINT IF EXISTS "posts_rels_events_fk";
  
  ALTER TABLE "posts_rels" DROP CONSTRAINT IF EXISTS "posts_rels_event_cycles_fk";
  
  ALTER TABLE "_posts_v_blocks_listing" DROP CONSTRAINT IF EXISTS "_posts_v_blocks_listing_event_cycle_id_event_cycles_id_fk";
  
  ALTER TABLE "_posts_v_rels" DROP CONSTRAINT IF EXISTS "_posts_v_rels_events_fk";
  
  ALTER TABLE "_posts_v_rels" DROP CONSTRAINT IF EXISTS "_posts_v_rels_event_cycles_fk";
  
  ALTER TABLE "club_sections_menu_items" DROP CONSTRAINT IF EXISTS "club_sections_menu_items_event_id_events_id_fk";
  
  ALTER TABLE "club_sections_menu_items" DROP CONSTRAINT IF EXISTS "club_sections_menu_items_event_cycle_id_event_cycles_id_fk";
  
  ALTER TABLE "club_sections_menu_items" DROP CONSTRAINT IF EXISTS "club_sections_menu_items_partner_id_partners_id_fk";
  
  ALTER TABLE "_club_sections_v_version_menu_items" DROP CONSTRAINT IF EXISTS "_club_sections_v_version_menu_items_event_id_events_id_fk";
  
  ALTER TABLE "_club_sections_v_version_menu_items" DROP CONSTRAINT IF EXISTS "_club_sections_v_version_menu_items_event_cycle_id_event_cycles_id_fk";
  
  ALTER TABLE "_club_sections_v_version_menu_items" DROP CONSTRAINT IF EXISTS "_club_sections_v_version_menu_items_partner_id_partners_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_events_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_event_cycles_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_partners_fk";
  
  ALTER TABLE "navigation_header_items" DROP CONSTRAINT IF EXISTS "navigation_header_items_event_id_events_id_fk";
  
  ALTER TABLE "navigation_header_items" DROP CONSTRAINT IF EXISTS "navigation_header_items_event_cycle_id_event_cycles_id_fk";
  
  ALTER TABLE "navigation_header_items" DROP CONSTRAINT IF EXISTS "navigation_header_items_partner_id_partners_id_fk";
  
  ALTER TABLE "navigation_hero_items" DROP CONSTRAINT IF EXISTS "navigation_hero_items_event_id_events_id_fk";
  
  ALTER TABLE "navigation_hero_items" DROP CONSTRAINT IF EXISTS "navigation_hero_items_event_cycle_id_event_cycles_id_fk";
  
  ALTER TABLE "navigation_hero_items" DROP CONSTRAINT IF EXISTS "navigation_hero_items_partner_id_partners_id_fk";
  
  ALTER TABLE "navigation_social_items" DROP CONSTRAINT IF EXISTS "navigation_social_items_event_id_events_id_fk";
  
  ALTER TABLE "navigation_social_items" DROP CONSTRAINT IF EXISTS "navigation_social_items_event_cycle_id_event_cycles_id_fk";
  
  ALTER TABLE "navigation_social_items" DROP CONSTRAINT IF EXISTS "navigation_social_items_partner_id_partners_id_fk";
  
  ALTER TABLE "navigation_footer_columns_items" DROP CONSTRAINT IF EXISTS "navigation_footer_columns_items_event_id_events_id_fk";
  
  ALTER TABLE "navigation_footer_columns_items" DROP CONSTRAINT IF EXISTS "navigation_footer_columns_items_event_cycle_id_event_cycles_id_fk";
  
  ALTER TABLE "navigation_footer_columns_items" DROP CONSTRAINT IF EXISTS "navigation_footer_columns_items_partner_id_partners_id_fk";
  
  ALTER TABLE "pages_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_pages_blocks_listing_sources";
  CREATE TYPE "public"."enum_pages_blocks_listing_sources" AS ENUM('pages', 'posts');
  ALTER TABLE "pages_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum_pages_blocks_listing_sources" USING "value"::"public"."enum_pages_blocks_listing_sources";
  ALTER TABLE "pages_blocks_listing" ALTER COLUMN "sort" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_listing" ALTER COLUMN "sort" SET DEFAULT 'newest'::text;
  DROP TYPE "public"."enum_pages_blocks_listing_sort";
  CREATE TYPE "public"."enum_pages_blocks_listing_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  ALTER TABLE "pages_blocks_listing" ALTER COLUMN "sort" SET DEFAULT 'newest'::"public"."enum_pages_blocks_listing_sort";
  ALTER TABLE "pages_blocks_listing" ALTER COLUMN "sort" SET DATA TYPE "public"."enum_pages_blocks_listing_sort" USING "sort"::"public"."enum_pages_blocks_listing_sort";
  ALTER TABLE "_pages_v_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum__pages_v_blocks_listing_sources";
  CREATE TYPE "public"."enum__pages_v_blocks_listing_sources" AS ENUM('pages', 'posts');
  ALTER TABLE "_pages_v_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum__pages_v_blocks_listing_sources" USING "value"::"public"."enum__pages_v_blocks_listing_sources";
  ALTER TABLE "_pages_v_blocks_listing" ALTER COLUMN "sort" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_listing" ALTER COLUMN "sort" SET DEFAULT 'newest'::text;
  DROP TYPE "public"."enum__pages_v_blocks_listing_sort";
  CREATE TYPE "public"."enum__pages_v_blocks_listing_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  ALTER TABLE "_pages_v_blocks_listing" ALTER COLUMN "sort" SET DEFAULT 'newest'::"public"."enum__pages_v_blocks_listing_sort";
  ALTER TABLE "_pages_v_blocks_listing" ALTER COLUMN "sort" SET DATA TYPE "public"."enum__pages_v_blocks_listing_sort" USING "sort"::"public"."enum__pages_v_blocks_listing_sort";
  ALTER TABLE "posts_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_posts_blocks_listing_sources";
  CREATE TYPE "public"."enum_posts_blocks_listing_sources" AS ENUM('pages', 'posts');
  ALTER TABLE "posts_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum_posts_blocks_listing_sources" USING "value"::"public"."enum_posts_blocks_listing_sources";
  ALTER TABLE "posts_blocks_listing" ALTER COLUMN "sort" SET DATA TYPE text;
  ALTER TABLE "posts_blocks_listing" ALTER COLUMN "sort" SET DEFAULT 'newest'::text;
  DROP TYPE "public"."enum_posts_blocks_listing_sort";
  CREATE TYPE "public"."enum_posts_blocks_listing_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  ALTER TABLE "posts_blocks_listing" ALTER COLUMN "sort" SET DEFAULT 'newest'::"public"."enum_posts_blocks_listing_sort";
  ALTER TABLE "posts_blocks_listing" ALTER COLUMN "sort" SET DATA TYPE "public"."enum_posts_blocks_listing_sort" USING "sort"::"public"."enum_posts_blocks_listing_sort";
  ALTER TABLE "_posts_v_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum__posts_v_blocks_listing_sources";
  CREATE TYPE "public"."enum__posts_v_blocks_listing_sources" AS ENUM('pages', 'posts');
  ALTER TABLE "_posts_v_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum__posts_v_blocks_listing_sources" USING "value"::"public"."enum__posts_v_blocks_listing_sources";
  ALTER TABLE "_posts_v_blocks_listing" ALTER COLUMN "sort" SET DATA TYPE text;
  ALTER TABLE "_posts_v_blocks_listing" ALTER COLUMN "sort" SET DEFAULT 'newest'::text;
  DROP TYPE "public"."enum__posts_v_blocks_listing_sort";
  CREATE TYPE "public"."enum__posts_v_blocks_listing_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  ALTER TABLE "_posts_v_blocks_listing" ALTER COLUMN "sort" SET DEFAULT 'newest'::"public"."enum__posts_v_blocks_listing_sort";
  ALTER TABLE "_posts_v_blocks_listing" ALTER COLUMN "sort" SET DATA TYPE "public"."enum__posts_v_blocks_listing_sort" USING "sort"::"public"."enum__posts_v_blocks_listing_sort";
  ALTER TABLE "club_sections_menu_items" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "club_sections_menu_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  DROP TYPE "public"."enum_club_sections_menu_items_target_type";
  CREATE TYPE "public"."enum_club_sections_menu_items_target_type" AS ENUM('page', 'category', 'tag', 'custom');
  ALTER TABLE "club_sections_menu_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::"public"."enum_club_sections_menu_items_target_type";
  ALTER TABLE "club_sections_menu_items" ALTER COLUMN "target_type" SET DATA TYPE "public"."enum_club_sections_menu_items_target_type" USING "target_type"::"public"."enum_club_sections_menu_items_target_type";
  ALTER TABLE "_club_sections_v_version_menu_items" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "_club_sections_v_version_menu_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  DROP TYPE "public"."enum__club_sections_v_version_menu_items_target_type";
  CREATE TYPE "public"."enum__club_sections_v_version_menu_items_target_type" AS ENUM('page', 'category', 'tag', 'custom');
  ALTER TABLE "_club_sections_v_version_menu_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::"public"."enum__club_sections_v_version_menu_items_target_type";
  ALTER TABLE "_club_sections_v_version_menu_items" ALTER COLUMN "target_type" SET DATA TYPE "public"."enum__club_sections_v_version_menu_items_target_type" USING "target_type"::"public"."enum__club_sections_v_version_menu_items_target_type";
  ALTER TABLE "roles_permissions" ALTER COLUMN "resource" SET DATA TYPE text;
  DROP TYPE "public"."enum_roles_permissions_resource";
  CREATE TYPE "public"."enum_roles_permissions_resource" AS ENUM('users', 'media', 'member-profiles', 'member-profile-images', 'pages', 'posts', 'documents-resolution', 'documents-statute', 'documents-regulations', 'documents-minutes', 'documents-report', 'documents-agreement', 'documents-license', 'documents-other', 'document-files', 'club-sections', 'categories', 'tags', 'navigation', 'site-settings');
  ALTER TABLE "roles_permissions" ALTER COLUMN "resource" SET DATA TYPE "public"."enum_roles_permissions_resource" USING "resource"::"public"."enum_roles_permissions_resource";
  ALTER TABLE "navigation_header_items" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "navigation_header_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  DROP TYPE "public"."enum_navigation_header_items_target_type";
  CREATE TYPE "public"."enum_navigation_header_items_target_type" AS ENUM('page', 'category', 'tag', 'custom');
  ALTER TABLE "navigation_header_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::"public"."enum_navigation_header_items_target_type";
  ALTER TABLE "navigation_header_items" ALTER COLUMN "target_type" SET DATA TYPE "public"."enum_navigation_header_items_target_type" USING "target_type"::"public"."enum_navigation_header_items_target_type";
  ALTER TABLE "navigation_hero_items" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "navigation_hero_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  DROP TYPE "public"."enum_navigation_hero_items_target_type";
  CREATE TYPE "public"."enum_navigation_hero_items_target_type" AS ENUM('page', 'category', 'tag', 'custom');
  ALTER TABLE "navigation_hero_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::"public"."enum_navigation_hero_items_target_type";
  ALTER TABLE "navigation_hero_items" ALTER COLUMN "target_type" SET DATA TYPE "public"."enum_navigation_hero_items_target_type" USING "target_type"::"public"."enum_navigation_hero_items_target_type";
  ALTER TABLE "navigation_social_items" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "navigation_social_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  DROP TYPE "public"."enum_navigation_social_items_target_type";
  CREATE TYPE "public"."enum_navigation_social_items_target_type" AS ENUM('page', 'category', 'tag', 'custom');
  ALTER TABLE "navigation_social_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::"public"."enum_navigation_social_items_target_type";
  ALTER TABLE "navigation_social_items" ALTER COLUMN "target_type" SET DATA TYPE "public"."enum_navigation_social_items_target_type" USING "target_type"::"public"."enum_navigation_social_items_target_type";
  ALTER TABLE "navigation_footer_columns_items" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "navigation_footer_columns_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  DROP TYPE "public"."enum_navigation_footer_columns_items_target_type";
  CREATE TYPE "public"."enum_navigation_footer_columns_items_target_type" AS ENUM('page', 'category', 'tag', 'custom');
  ALTER TABLE "navigation_footer_columns_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::"public"."enum_navigation_footer_columns_items_target_type";
  ALTER TABLE "navigation_footer_columns_items" ALTER COLUMN "target_type" SET DATA TYPE "public"."enum_navigation_footer_columns_items_target_type" USING "target_type"::"public"."enum_navigation_footer_columns_items_target_type";
  ALTER TABLE "website_permissions_permissions" ALTER COLUMN "resource" SET DATA TYPE text;
  DROP TYPE "public"."enum_website_permissions_permissions_resource";
  CREATE TYPE "public"."enum_website_permissions_permissions_resource" AS ENUM('media', 'pages', 'posts', 'documents-resolution', 'documents-statute', 'documents-regulations', 'documents-minutes', 'documents-report', 'documents-agreement', 'documents-license', 'documents-other', 'club-sections');
  ALTER TABLE "website_permissions_permissions" ALTER COLUMN "resource" SET DATA TYPE "public"."enum_website_permissions_permissions_resource" USING "resource"::"public"."enum_website_permissions_permissions_resource";
  DROP INDEX "pages_blocks_listing_event_cycle_idx";
  DROP INDEX "_pages_v_blocks_listing_event_cycle_idx";
  DROP INDEX "posts_blocks_listing_event_cycle_idx";
  DROP INDEX "posts_rels_events_id_idx";
  DROP INDEX "posts_rels_event_cycles_id_idx";
  DROP INDEX "_posts_v_blocks_listing_event_cycle_idx";
  DROP INDEX "_posts_v_rels_events_id_idx";
  DROP INDEX "_posts_v_rels_event_cycles_id_idx";
  DROP INDEX "club_sections_menu_items_event_idx";
  DROP INDEX "club_sections_menu_items_event_cycle_idx";
  DROP INDEX "club_sections_menu_items_partner_idx";
  DROP INDEX "_club_sections_v_version_menu_items_event_idx";
  DROP INDEX "_club_sections_v_version_menu_items_event_cycle_idx";
  DROP INDEX "_club_sections_v_version_menu_items_partner_idx";
  DROP INDEX "payload_locked_documents_rels_events_id_idx";
  DROP INDEX "payload_locked_documents_rels_event_cycles_id_idx";
  DROP INDEX "payload_locked_documents_rels_partners_id_idx";
  DROP INDEX "navigation_header_items_event_idx";
  DROP INDEX "navigation_header_items_event_cycle_idx";
  DROP INDEX "navigation_header_items_partner_idx";
  DROP INDEX "navigation_hero_items_event_idx";
  DROP INDEX "navigation_hero_items_event_cycle_idx";
  DROP INDEX "navigation_hero_items_partner_idx";
  DROP INDEX "navigation_social_items_event_idx";
  DROP INDEX "navigation_social_items_event_cycle_idx";
  DROP INDEX "navigation_social_items_partner_idx";
  DROP INDEX "navigation_footer_columns_items_event_idx";
  DROP INDEX "navigation_footer_columns_items_event_cycle_idx";
  DROP INDEX "navigation_footer_columns_items_partner_idx";
  ALTER TABLE "pages_blocks_listing" DROP COLUMN "event_time_filter";
  ALTER TABLE "pages_blocks_listing" DROP COLUMN "event_cycle_id";
  ALTER TABLE "_pages_v_blocks_listing" DROP COLUMN "event_time_filter";
  ALTER TABLE "_pages_v_blocks_listing" DROP COLUMN "event_cycle_id";
  ALTER TABLE "posts_blocks_listing" DROP COLUMN "event_time_filter";
  ALTER TABLE "posts_blocks_listing" DROP COLUMN "event_cycle_id";
  ALTER TABLE "posts_rels" DROP COLUMN "events_id";
  ALTER TABLE "posts_rels" DROP COLUMN "event_cycles_id";
  ALTER TABLE "_posts_v_blocks_listing" DROP COLUMN "event_time_filter";
  ALTER TABLE "_posts_v_blocks_listing" DROP COLUMN "event_cycle_id";
  ALTER TABLE "_posts_v_rels" DROP COLUMN "events_id";
  ALTER TABLE "_posts_v_rels" DROP COLUMN "event_cycles_id";
  ALTER TABLE "club_sections_menu_items" DROP COLUMN "event_id";
  ALTER TABLE "club_sections_menu_items" DROP COLUMN "event_cycle_id";
  ALTER TABLE "club_sections_menu_items" DROP COLUMN "partner_id";
  ALTER TABLE "_club_sections_v_version_menu_items" DROP COLUMN "event_id";
  ALTER TABLE "_club_sections_v_version_menu_items" DROP COLUMN "event_cycle_id";
  ALTER TABLE "_club_sections_v_version_menu_items" DROP COLUMN "partner_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "events_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "event_cycles_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "partners_id";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_event_window_weeks";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_event_slide_limit";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_post_count";
  ALTER TABLE "navigation_header_items" DROP COLUMN "event_id";
  ALTER TABLE "navigation_header_items" DROP COLUMN "event_cycle_id";
  ALTER TABLE "navigation_header_items" DROP COLUMN "partner_id";
  ALTER TABLE "navigation_hero_items" DROP COLUMN "event_id";
  ALTER TABLE "navigation_hero_items" DROP COLUMN "event_cycle_id";
  ALTER TABLE "navigation_hero_items" DROP COLUMN "partner_id";
  ALTER TABLE "navigation_social_items" DROP COLUMN "event_id";
  ALTER TABLE "navigation_social_items" DROP COLUMN "event_cycle_id";
  ALTER TABLE "navigation_social_items" DROP COLUMN "partner_id";
  ALTER TABLE "navigation_footer_columns_items" DROP COLUMN "event_id";
  ALTER TABLE "navigation_footer_columns_items" DROP COLUMN "event_cycle_id";
  ALTER TABLE "navigation_footer_columns_items" DROP COLUMN "partner_id";
  DROP TYPE "public"."enum_pages_blocks_listing_event_time_filter";
  DROP TYPE "public"."enum__pages_v_blocks_listing_event_time_filter";
  DROP TYPE "public"."enum_posts_blocks_listing_event_time_filter";
  DROP TYPE "public"."enum__posts_v_blocks_listing_event_time_filter";
  DROP TYPE "public"."enum_events_blocks_listing_sources";
  DROP TYPE "public"."enum_events_blocks_listing_sort";
  DROP TYPE "public"."enum_events_blocks_listing_view";
  DROP TYPE "public"."enum_events_blocks_listing_event_time_filter";
  DROP TYPE "public"."enum_events_blocks_listing_parent_filter";
  DROP TYPE "public"."enum_events_blocks_media_gallery_selection_mode";
  DROP TYPE "public"."enum_events_blocks_media_gallery_sort";
  DROP TYPE "public"."enum_events_blocks_media_gallery_view";
  DROP TYPE "public"."enum_events_blocks_attachments_selection_mode";
  DROP TYPE "public"."enum_events_blocks_attachments_sort";
  DROP TYPE "public"."enum_events_blocks_attachments_view";
  DROP TYPE "public"."enum_events_partners_roles";
  DROP TYPE "public"."enum_events_external_links_type";
  DROP TYPE "public"."enum_events_time_mode";
  DROP TYPE "public"."enum_events_event_status";
  DROP TYPE "public"."enum_events_participation";
  DROP TYPE "public"."enum_events_visibility";
  DROP TYPE "public"."enum_events_capacity_mode";
  DROP TYPE "public"."enum_events_status";
  DROP TYPE "public"."enum__events_v_blocks_listing_sources";
  DROP TYPE "public"."enum__events_v_blocks_listing_sort";
  DROP TYPE "public"."enum__events_v_blocks_listing_view";
  DROP TYPE "public"."enum__events_v_blocks_listing_event_time_filter";
  DROP TYPE "public"."enum__events_v_blocks_listing_parent_filter";
  DROP TYPE "public"."enum__events_v_blocks_media_gallery_selection_mode";
  DROP TYPE "public"."enum__events_v_blocks_media_gallery_sort";
  DROP TYPE "public"."enum__events_v_blocks_media_gallery_view";
  DROP TYPE "public"."enum__events_v_blocks_attachments_selection_mode";
  DROP TYPE "public"."enum__events_v_blocks_attachments_sort";
  DROP TYPE "public"."enum__events_v_blocks_attachments_view";
  DROP TYPE "public"."enum__events_v_version_partners_roles";
  DROP TYPE "public"."enum__events_v_version_external_links_type";
  DROP TYPE "public"."enum__events_v_version_time_mode";
  DROP TYPE "public"."enum__events_v_version_event_status";
  DROP TYPE "public"."enum__events_v_version_participation";
  DROP TYPE "public"."enum__events_v_version_visibility";
  DROP TYPE "public"."enum__events_v_version_capacity_mode";
  DROP TYPE "public"."enum__events_v_version_status";
  DROP TYPE "public"."enum_event_cycles_blocks_listing_sources";
  DROP TYPE "public"."enum_event_cycles_blocks_listing_sort";
  DROP TYPE "public"."enum_event_cycles_blocks_listing_view";
  DROP TYPE "public"."enum_event_cycles_blocks_listing_event_time_filter";
  DROP TYPE "public"."enum_event_cycles_blocks_listing_parent_filter";
  DROP TYPE "public"."enum_event_cycles_blocks_media_gallery_selection_mode";
  DROP TYPE "public"."enum_event_cycles_blocks_media_gallery_sort";
  DROP TYPE "public"."enum_event_cycles_blocks_media_gallery_view";
  DROP TYPE "public"."enum_event_cycles_blocks_attachments_selection_mode";
  DROP TYPE "public"."enum_event_cycles_blocks_attachments_sort";
  DROP TYPE "public"."enum_event_cycles_blocks_attachments_view";
  DROP TYPE "public"."enum_event_cycles_event_defaults_partners_roles";
  DROP TYPE "public"."enum_event_cycles_event_defaults_external_links_type";
  DROP TYPE "public"."enum_event_cycles_visibility";
  DROP TYPE "public"."enum_event_cycles_event_defaults_default_time_mode";
  DROP TYPE "public"."enum_event_cycles_event_defaults_participation";
  DROP TYPE "public"."enum_event_cycles_event_defaults_visibility";
  DROP TYPE "public"."enum_event_cycles_event_defaults_capacity_mode";
  DROP TYPE "public"."enum_event_cycles_status";
  DROP TYPE "public"."enum__event_cycles_v_blocks_listing_sources";
  DROP TYPE "public"."enum__event_cycles_v_blocks_listing_sort";
  DROP TYPE "public"."enum__event_cycles_v_blocks_listing_view";
  DROP TYPE "public"."enum__event_cycles_v_blocks_listing_event_time_filter";
  DROP TYPE "public"."enum__event_cycles_v_blocks_listing_parent_filter";
  DROP TYPE "public"."enum__event_cycles_v_blocks_media_gallery_selection_mode";
  DROP TYPE "public"."enum__event_cycles_v_blocks_media_gallery_sort";
  DROP TYPE "public"."enum__event_cycles_v_blocks_media_gallery_view";
  DROP TYPE "public"."enum__event_cycles_v_blocks_attachments_selection_mode";
  DROP TYPE "public"."enum__event_cycles_v_blocks_attachments_sort";
  DROP TYPE "public"."enum__event_cycles_v_blocks_attachments_view";
  DROP TYPE "public"."enum__event_cycles_v_version_event_defaults_partners_roles";
  DROP TYPE "public"."enum__event_cycles_v_version_event_defaults_external_links_type";
  DROP TYPE "public"."enum__event_cycles_v_version_visibility";
  DROP TYPE "public"."enum__event_cycles_v_version_event_defaults_default_time_mode";
  DROP TYPE "public"."enum__event_cycles_v_version_event_defaults_participation";
  DROP TYPE "public"."enum__event_cycles_v_version_event_defaults_visibility";
  DROP TYPE "public"."enum__event_cycles_v_version_event_defaults_capacity_mode";
  DROP TYPE "public"."enum__event_cycles_v_version_status";
  DROP TYPE "public"."enum_partners_blocks_listing_sources";
  DROP TYPE "public"."enum_partners_blocks_listing_sort";
  DROP TYPE "public"."enum_partners_blocks_listing_view";
  DROP TYPE "public"."enum_partners_blocks_listing_event_time_filter";
  DROP TYPE "public"."enum_partners_blocks_listing_parent_filter";
  DROP TYPE "public"."enum_partners_blocks_media_gallery_selection_mode";
  DROP TYPE "public"."enum_partners_blocks_media_gallery_sort";
  DROP TYPE "public"."enum_partners_blocks_media_gallery_view";
  DROP TYPE "public"."enum_partners_blocks_attachments_selection_mode";
  DROP TYPE "public"."enum_partners_blocks_attachments_sort";
  DROP TYPE "public"."enum_partners_blocks_attachments_view";
  DROP TYPE "public"."enum_partners_status";
  DROP TYPE "public"."enum__partners_v_blocks_listing_sources";
  DROP TYPE "public"."enum__partners_v_blocks_listing_sort";
  DROP TYPE "public"."enum__partners_v_blocks_listing_view";
  DROP TYPE "public"."enum__partners_v_blocks_listing_event_time_filter";
  DROP TYPE "public"."enum__partners_v_blocks_listing_parent_filter";
  DROP TYPE "public"."enum__partners_v_blocks_media_gallery_selection_mode";
  DROP TYPE "public"."enum__partners_v_blocks_media_gallery_sort";
  DROP TYPE "public"."enum__partners_v_blocks_media_gallery_view";
  DROP TYPE "public"."enum__partners_v_blocks_attachments_selection_mode";
  DROP TYPE "public"."enum__partners_v_blocks_attachments_sort";
  DROP TYPE "public"."enum__partners_v_blocks_attachments_view";
  DROP TYPE "public"."enum__partners_v_version_status";
  DROP TYPE "public"."enum_site_settings_homepage_post_count";`)
}
