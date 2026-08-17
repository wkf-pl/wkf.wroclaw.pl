import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_member_profiles_contact_channels_type" AS ENUM('email', 'facebook', 'messenger', 'discord', 'instagram', 'bluesky', 'mastodon', 'linkedin', 'youtube', 'twitch', 'website', 'other');
  CREATE TYPE "public"."enum__member_profiles_v_version_contact_channels_type" AS ENUM('email', 'facebook', 'messenger', 'discord', 'instagram', 'bluesky', 'mastodon', 'linkedin', 'youtube', 'twitch', 'website', 'other');
  ALTER TABLE "roles_permissions" ALTER COLUMN "resource" SET DATA TYPE text;
  DROP TYPE "public"."enum_roles_permissions_resource";
  CREATE TYPE "public"."enum_roles_permissions_resource" AS ENUM('users', 'media', 'member-profiles', 'member-profile-images', 'pages', 'posts', 'documents', 'document-files', 'club-sections', 'categories', 'tags', 'navigation', 'footer', 'site-settings');
  ALTER TABLE "roles_permissions" ALTER COLUMN "resource" SET DATA TYPE "public"."enum_roles_permissions_resource" USING "resource"::"public"."enum_roles_permissions_resource";

  INSERT INTO "roles_permissions" (
    "_order", "_parent_id", "id", "resource", "can_create", "read_allowed",
    "read_own", "update_allowed", "update_own", "delete_allowed", "delete_own"
  )
  SELECT COALESCE((
      SELECT MAX("existing_permission"."_order")
      FROM "roles_permissions" AS "existing_permission"
      WHERE "existing_permission"."_parent_id" = "roles"."id"
    ), 0) + "permission"."order",
    "roles"."id", 'member-' || "permission"."resource",
    "permission"."resource"::"enum_roles_permissions_resource", true, true, true,
    true, true, "permission"."can_delete_own", "permission"."can_delete_own"
  FROM "roles"
  CROSS JOIN (VALUES
    (1, 'member-profiles', false),
    (2, 'member-profile-images', true)
  ) AS "permission"("order", "resource", "can_delete_own")
  WHERE "roles"."key" = 'member';

  INSERT INTO "roles_permissions" (
    "_order", "_parent_id", "id", "resource", "can_create", "read_allowed",
    "update_allowed", "delete_allowed"
  )
  SELECT COALESCE((
      SELECT MAX("existing_permission"."_order")
      FROM "roles_permissions" AS "existing_permission"
      WHERE "existing_permission"."_parent_id" = "roles"."id"
    ), 0) + "permission"."order",
    "roles"."id", "roles"."key" || '-' || "permission"."resource",
    "permission"."resource"::"enum_roles_permissions_resource", true, true, true, true
  FROM "roles"
  CROSS JOIN (VALUES
    (1, 'member-profiles'),
    (2, 'member-profile-images')
  ) AS "permission"("order", "resource")
  WHERE "roles"."key" IN ('moderator', 'administrator');
  CREATE TABLE "member_profile_images" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"owner_id" integer NOT NULL,
  	"is_publicly_used" boolean DEFAULT false,
  	"prefix" varchar DEFAULT 'member-profiles',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_profile_url" varchar,
  	"sizes_profile_width" numeric,
  	"sizes_profile_height" numeric,
  	"sizes_profile_mime_type" varchar,
  	"sizes_profile_filesize" numeric,
  	"sizes_profile_filename" varchar
  );
  
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
  
  CREATE TABLE "member_profiles_games" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"plays" boolean,
  	"runs" boolean
  );
  
  CREATE TABLE "member_profiles_contact_channels" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_member_profiles_contact_channels_type" NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "member_profiles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"owner_id" integer NOT NULL,
  	"public_name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"club_summary" varchar,
  	"contact_topics" varchar,
  	"photo_id" integer,
  	"is_published" boolean DEFAULT false,
  	"moderator_hidden" boolean DEFAULT false,
  	"moderation_reason" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
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
  
  CREATE TABLE "_member_profiles_v_version_games" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"plays" boolean,
  	"runs" boolean,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_member_profiles_v_version_contact_channels" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum__member_profiles_v_version_contact_channels_type" NOT NULL,
  	"url" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_member_profiles_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_owner_id" integer NOT NULL,
  	"version_public_name" varchar NOT NULL,
  	"version_slug" varchar NOT NULL,
  	"version_club_summary" varchar,
  	"version_contact_topics" varchar,
  	"version_photo_id" integer,
  	"version_is_published" boolean DEFAULT false,
  	"version_moderator_hidden" boolean DEFAULT false,
  	"version_moderation_reason" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pages_blocks_member_profiles_entries" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"profile_id" integer,
  	"context_label" varchar
  );
  
  CREATE TABLE "pages_blocks_member_profiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_member_profiles_entries" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"profile_id" integer,
  	"context_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_member_profiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "member_profile_images_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "member_profiles_id" integer;
  ALTER TABLE "member_profile_images" ADD CONSTRAINT "member_profile_images_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "member_profiles_activities" ADD CONSTRAINT "member_profiles_activities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."member_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "member_profiles_interests" ADD CONSTRAINT "member_profiles_interests_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."member_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "member_profiles_games" ADD CONSTRAINT "member_profiles_games_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."member_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "member_profiles_contact_channels" ADD CONSTRAINT "member_profiles_contact_channels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."member_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "member_profiles" ADD CONSTRAINT "member_profiles_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "member_profiles" ADD CONSTRAINT "member_profiles_photo_id_member_profile_images_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."member_profile_images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_member_profiles_v_version_activities" ADD CONSTRAINT "_member_profiles_v_version_activities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_member_profiles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_member_profiles_v_version_interests" ADD CONSTRAINT "_member_profiles_v_version_interests_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_member_profiles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_member_profiles_v_version_games" ADD CONSTRAINT "_member_profiles_v_version_games_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_member_profiles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_member_profiles_v_version_contact_channels" ADD CONSTRAINT "_member_profiles_v_version_contact_channels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_member_profiles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_member_profiles_v" ADD CONSTRAINT "_member_profiles_v_parent_id_member_profiles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."member_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_member_profiles_v" ADD CONSTRAINT "_member_profiles_v_version_owner_id_users_id_fk" FOREIGN KEY ("version_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_member_profiles_v" ADD CONSTRAINT "_member_profiles_v_version_photo_id_member_profile_images_id_fk" FOREIGN KEY ("version_photo_id") REFERENCES "public"."member_profile_images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_member_profiles_entries" ADD CONSTRAINT "pages_blocks_member_profiles_entries_profile_id_member_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."member_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_member_profiles_entries" ADD CONSTRAINT "pages_blocks_member_profiles_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_member_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_member_profiles" ADD CONSTRAINT "pages_blocks_member_profiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_member_profiles_entries" ADD CONSTRAINT "_pages_v_blocks_member_profiles_entries_profile_id_member_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."member_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_member_profiles_entries" ADD CONSTRAINT "_pages_v_blocks_member_profiles_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_member_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_member_profiles" ADD CONSTRAINT "_pages_v_blocks_member_profiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "member_profile_images_owner_idx" ON "member_profile_images" USING btree ("owner_id");
  CREATE INDEX "member_profile_images_is_publicly_used_idx" ON "member_profile_images" USING btree ("is_publicly_used");
  CREATE INDEX "member_profile_images_updated_at_idx" ON "member_profile_images" USING btree ("updated_at");
  CREATE INDEX "member_profile_images_created_at_idx" ON "member_profile_images" USING btree ("created_at");
  CREATE UNIQUE INDEX "member_profile_images_filename_idx" ON "member_profile_images" USING btree ("filename");
  CREATE INDEX "member_profile_images_sizes_card_sizes_card_filename_idx" ON "member_profile_images" USING btree ("sizes_card_filename");
  CREATE INDEX "member_profile_images_sizes_profile_sizes_profile_filena_idx" ON "member_profile_images" USING btree ("sizes_profile_filename");
  CREATE INDEX "member_profiles_activities_order_idx" ON "member_profiles_activities" USING btree ("_order");
  CREATE INDEX "member_profiles_activities_parent_id_idx" ON "member_profiles_activities" USING btree ("_parent_id");
  CREATE INDEX "member_profiles_interests_order_idx" ON "member_profiles_interests" USING btree ("_order");
  CREATE INDEX "member_profiles_interests_parent_id_idx" ON "member_profiles_interests" USING btree ("_parent_id");
  CREATE INDEX "member_profiles_games_order_idx" ON "member_profiles_games" USING btree ("_order");
  CREATE INDEX "member_profiles_games_parent_id_idx" ON "member_profiles_games" USING btree ("_parent_id");
  CREATE INDEX "member_profiles_contact_channels_order_idx" ON "member_profiles_contact_channels" USING btree ("_order");
  CREATE INDEX "member_profiles_contact_channels_parent_id_idx" ON "member_profiles_contact_channels" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "member_profiles_owner_idx" ON "member_profiles" USING btree ("owner_id");
  CREATE INDEX "member_profiles_public_name_idx" ON "member_profiles" USING btree ("public_name");
  CREATE UNIQUE INDEX "member_profiles_slug_idx" ON "member_profiles" USING btree ("slug");
  CREATE INDEX "member_profiles_photo_idx" ON "member_profiles" USING btree ("photo_id");
  CREATE INDEX "member_profiles_is_published_idx" ON "member_profiles" USING btree ("is_published");
  CREATE INDEX "member_profiles_moderator_hidden_idx" ON "member_profiles" USING btree ("moderator_hidden");
  CREATE INDEX "member_profiles_updated_at_idx" ON "member_profiles" USING btree ("updated_at");
  CREATE INDEX "member_profiles_created_at_idx" ON "member_profiles" USING btree ("created_at");
  CREATE INDEX "_member_profiles_v_version_activities_order_idx" ON "_member_profiles_v_version_activities" USING btree ("_order");
  CREATE INDEX "_member_profiles_v_version_activities_parent_id_idx" ON "_member_profiles_v_version_activities" USING btree ("_parent_id");
  CREATE INDEX "_member_profiles_v_version_interests_order_idx" ON "_member_profiles_v_version_interests" USING btree ("_order");
  CREATE INDEX "_member_profiles_v_version_interests_parent_id_idx" ON "_member_profiles_v_version_interests" USING btree ("_parent_id");
  CREATE INDEX "_member_profiles_v_version_games_order_idx" ON "_member_profiles_v_version_games" USING btree ("_order");
  CREATE INDEX "_member_profiles_v_version_games_parent_id_idx" ON "_member_profiles_v_version_games" USING btree ("_parent_id");
  CREATE INDEX "_member_profiles_v_version_contact_channels_order_idx" ON "_member_profiles_v_version_contact_channels" USING btree ("_order");
  CREATE INDEX "_member_profiles_v_version_contact_channels_parent_id_idx" ON "_member_profiles_v_version_contact_channels" USING btree ("_parent_id");
  CREATE INDEX "_member_profiles_v_parent_idx" ON "_member_profiles_v" USING btree ("parent_id");
  CREATE INDEX "_member_profiles_v_version_version_owner_idx" ON "_member_profiles_v" USING btree ("version_owner_id");
  CREATE INDEX "_member_profiles_v_version_version_public_name_idx" ON "_member_profiles_v" USING btree ("version_public_name");
  CREATE INDEX "_member_profiles_v_version_version_slug_idx" ON "_member_profiles_v" USING btree ("version_slug");
  CREATE INDEX "_member_profiles_v_version_version_photo_idx" ON "_member_profiles_v" USING btree ("version_photo_id");
  CREATE INDEX "_member_profiles_v_version_version_is_published_idx" ON "_member_profiles_v" USING btree ("version_is_published");
  CREATE INDEX "_member_profiles_v_version_version_moderator_hidden_idx" ON "_member_profiles_v" USING btree ("version_moderator_hidden");
  CREATE INDEX "_member_profiles_v_version_version_updated_at_idx" ON "_member_profiles_v" USING btree ("version_updated_at");
  CREATE INDEX "_member_profiles_v_version_version_created_at_idx" ON "_member_profiles_v" USING btree ("version_created_at");
  CREATE INDEX "_member_profiles_v_created_at_idx" ON "_member_profiles_v" USING btree ("created_at");
  CREATE INDEX "_member_profiles_v_updated_at_idx" ON "_member_profiles_v" USING btree ("updated_at");
  CREATE INDEX "pages_blocks_member_profiles_entries_order_idx" ON "pages_blocks_member_profiles_entries" USING btree ("_order");
  CREATE INDEX "pages_blocks_member_profiles_entries_parent_id_idx" ON "pages_blocks_member_profiles_entries" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_member_profiles_entries_profile_idx" ON "pages_blocks_member_profiles_entries" USING btree ("profile_id");
  CREATE INDEX "pages_blocks_member_profiles_order_idx" ON "pages_blocks_member_profiles" USING btree ("_order");
  CREATE INDEX "pages_blocks_member_profiles_parent_id_idx" ON "pages_blocks_member_profiles" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_member_profiles_path_idx" ON "pages_blocks_member_profiles" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_member_profiles_entries_order_idx" ON "_pages_v_blocks_member_profiles_entries" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_member_profiles_entries_parent_id_idx" ON "_pages_v_blocks_member_profiles_entries" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_member_profiles_entries_profile_idx" ON "_pages_v_blocks_member_profiles_entries" USING btree ("profile_id");
  CREATE INDEX "_pages_v_blocks_member_profiles_order_idx" ON "_pages_v_blocks_member_profiles" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_member_profiles_parent_id_idx" ON "_pages_v_blocks_member_profiles" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_member_profiles_path_idx" ON "_pages_v_blocks_member_profiles" USING btree ("_path");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_member_profile_images_fk" FOREIGN KEY ("member_profile_images_id") REFERENCES "public"."member_profile_images"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_member_profiles_fk" FOREIGN KEY ("member_profiles_id") REFERENCES "public"."member_profiles"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_member_profile_images_id_idx" ON "payload_locked_documents_rels" USING btree ("member_profile_images_id");
  CREATE INDEX "payload_locked_documents_rels_member_profiles_id_idx" ON "payload_locked_documents_rels" USING btree ("member_profiles_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "member_profile_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "member_profiles_activities" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "member_profiles_interests" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "member_profiles_games" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "member_profiles_contact_channels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "member_profiles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_member_profiles_v_version_activities" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_member_profiles_v_version_interests" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_member_profiles_v_version_games" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_member_profiles_v_version_contact_channels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_member_profiles_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_member_profiles_entries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_member_profiles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_member_profiles_entries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_member_profiles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_member_profile_images_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_member_profiles_fk";
  DROP TABLE "member_profile_images" CASCADE;
  DROP TABLE "member_profiles_activities" CASCADE;
  DROP TABLE "member_profiles_interests" CASCADE;
  DROP TABLE "member_profiles_games" CASCADE;
  DROP TABLE "member_profiles_contact_channels" CASCADE;
  DROP TABLE "member_profiles" CASCADE;
  DROP TABLE "_member_profiles_v_version_activities" CASCADE;
  DROP TABLE "_member_profiles_v_version_interests" CASCADE;
  DROP TABLE "_member_profiles_v_version_games" CASCADE;
  DROP TABLE "_member_profiles_v_version_contact_channels" CASCADE;
  DROP TABLE "_member_profiles_v" CASCADE;
  DROP TABLE "pages_blocks_member_profiles_entries" CASCADE;
  DROP TABLE "pages_blocks_member_profiles" CASCADE;
  DROP TABLE "_pages_v_blocks_member_profiles_entries" CASCADE;
  DROP TABLE "_pages_v_blocks_member_profiles" CASCADE;
  DELETE FROM "roles_permissions"
  WHERE "resource"::text IN ('member-profiles', 'member-profile-images');
  ALTER TABLE "roles_permissions" ALTER COLUMN "resource" SET DATA TYPE text;
  DROP TYPE "public"."enum_roles_permissions_resource";
  CREATE TYPE "public"."enum_roles_permissions_resource" AS ENUM('users', 'media', 'pages', 'posts', 'documents', 'document-files', 'club-sections', 'categories', 'tags', 'navigation', 'footer', 'site-settings');
  ALTER TABLE "roles_permissions" ALTER COLUMN "resource" SET DATA TYPE "public"."enum_roles_permissions_resource" USING "resource"::"public"."enum_roles_permissions_resource";
  DROP INDEX "payload_locked_documents_rels_member_profile_images_id_idx";
  DROP INDEX "payload_locked_documents_rels_member_profiles_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "member_profile_images_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "member_profiles_id";
  DROP TYPE "public"."enum_member_profiles_contact_channels_type";
  DROP TYPE "public"."enum__member_profiles_v_version_contact_channels_type";`)
}
