import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "member_profiles" ADD COLUMN "photo" jsonb, ADD COLUMN "draft_photo" jsonb;
    ALTER TABLE "_member_profiles_v"
      ADD COLUMN "version_photo" jsonb, ADD COLUMN "version_draft_photo" jsonb;

    CREATE TEMP TABLE "inline_member_profile_photos" ON COMMIT DROP AS
    SELECT id, jsonb_strip_nulls(jsonb_build_object(
      'prefix', COALESCE(prefix, 'member-profiles'),
      'filename', filename,
      'objectKey', "_objectkey",
      'mimeType', mime_type,
      'filesize', filesize,
      'width', width,
      'height', height,
      'focalX', focal_x,
      'focalY', focal_y,
      'sizes', jsonb_build_object(
        'card', CASE WHEN sizes_card_filename IS NOT NULL THEN jsonb_build_object('filename', sizes_card_filename) END,
        'profile', CASE WHEN sizes_profile_filename IS NOT NULL THEN jsonb_build_object('filename', sizes_profile_filename) END
      )
    )) AS photo
    FROM "member_profile_images";

    UPDATE "member_profiles" AS profile
    SET photo = image.photo
    FROM "inline_member_profile_photos" AS image
    WHERE profile.photo_id = image.id;

    UPDATE "_member_profiles_v" AS version
    SET version_photo = profile.photo,
        version_draft_photo = CASE
          WHEN version.version_photo_id IS NOT DISTINCT FROM profile.photo_id THEN NULL
          WHEN version.version_photo_id IS NULL THEN jsonb_build_object('removed', true)
          ELSE (SELECT photo FROM "inline_member_profile_photos" WHERE id = version.version_photo_id)
        END
    FROM "member_profiles" AS profile
    WHERE version.parent_id = profile.id AND version.version__status = 'draft';

    UPDATE "_member_profiles_v" AS version
    SET version_photo = image.photo
    FROM "inline_member_profile_photos" AS image
    WHERE version.version_photo_id = image.id AND version.version__status IS DISTINCT FROM 'draft';

    DELETE FROM "roles_permissions" WHERE resource = 'member-profile-images';
    ALTER TABLE "roles_permissions" ALTER COLUMN "resource" TYPE text;
    DROP TYPE "public"."enum_roles_permissions_resource";
    CREATE TYPE "public"."enum_roles_permissions_resource" AS ENUM('users', 'media', 'member-profiles', 'pages', 'posts', 'events', 'event-cycles', 'event-types', 'partners', 'documents', 'url-aliases', 'categories', 'tags', 'page-templates', 'navigation', 'site-settings', 'content-audit-log');
    ALTER TABLE "roles_permissions" ALTER COLUMN "resource" TYPE "public"."enum_roles_permissions_resource" USING "resource"::"public"."enum_roles_permissions_resource";

    DELETE FROM "payload_locked_documents_rels" WHERE "member_profile_images_id" IS NOT NULL;
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "member_profile_images_id";
    ALTER TABLE "member_profiles" DROP COLUMN "photo_id";
    ALTER TABLE "_member_profiles_v" DROP COLUMN "version_photo_id";
    DROP TABLE "member_profile_images";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "roles_permissions" ALTER COLUMN "resource" TYPE text;
  DROP TYPE "public"."enum_roles_permissions_resource";
  CREATE TYPE "public"."enum_roles_permissions_resource" AS ENUM('users', 'media', 'member-profiles', 'member-profile-images', 'pages', 'posts', 'events', 'event-cycles', 'event-types', 'partners', 'documents', 'url-aliases', 'categories', 'tags', 'page-templates', 'navigation', 'site-settings', 'content-audit-log');
  ALTER TABLE "roles_permissions" ALTER COLUMN "resource" TYPE "public"."enum_roles_permissions_resource" USING "resource"::"public"."enum_roles_permissions_resource";
  CREATE TABLE "member_profile_images" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"owner_id" integer NOT NULL,
  	"is_publicly_used" boolean DEFAULT false,
  	"prefix" varchar DEFAULT 'member-profiles',
  	"_objectkey" varchar,
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
  
  ALTER TABLE "member_profiles" ADD COLUMN "photo_id" integer;
  ALTER TABLE "_member_profiles_v" ADD COLUMN "version_photo_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "member_profile_images_id" integer;
  ALTER TABLE "member_profile_images" ADD CONSTRAINT "member_profile_images_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "member_profile_images_owner_idx" ON "member_profile_images" USING btree ("owner_id");
  CREATE INDEX "member_profile_images_is_publicly_used_idx" ON "member_profile_images" USING btree ("is_publicly_used");
  CREATE INDEX "member_profile_images_updated_at_idx" ON "member_profile_images" USING btree ("updated_at");
  CREATE INDEX "member_profile_images_created_at_idx" ON "member_profile_images" USING btree ("created_at");
  CREATE UNIQUE INDEX "member_profile_images_filename_idx" ON "member_profile_images" USING btree ("filename");
  CREATE INDEX "member_profile_images_sizes_card_sizes_card_filename_idx" ON "member_profile_images" USING btree ("sizes_card_filename");
  CREATE INDEX "member_profile_images_sizes_profile_sizes_profile_filena_idx" ON "member_profile_images" USING btree ("sizes_profile_filename");
  ALTER TABLE "member_profiles" ADD CONSTRAINT "member_profiles_photo_id_member_profile_images_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."member_profile_images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_member_profiles_v" ADD CONSTRAINT "_member_profiles_v_version_photo_id_member_profile_images_id_fk" FOREIGN KEY ("version_photo_id") REFERENCES "public"."member_profile_images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_member_profile_images_fk" FOREIGN KEY ("member_profile_images_id") REFERENCES "public"."member_profile_images"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "member_profiles_photo_idx" ON "member_profiles" USING btree ("photo_id");
  CREATE INDEX "_member_profiles_v_version_version_photo_idx" ON "_member_profiles_v" USING btree ("version_photo_id");
  CREATE INDEX "payload_locked_documents_rels_member_profile_images_id_idx" ON "payload_locked_documents_rels" USING btree ("member_profile_images_id");
  WITH profiles AS (
    SELECT profile.id, profile.owner_id, profile._status,
      CASE WHEN profile._status = 'published' THEN profile.photo
        WHEN latest.version_draft_photo @> '{"removed": true}'::jsonb THEN NULL
        ELSE COALESCE(latest.version_draft_photo, profile.draft_photo, profile.photo)
      END AS photo
    FROM "member_profiles" AS profile
    LEFT JOIN "_member_profiles_v" AS latest ON latest.parent_id = profile.id AND latest.latest
  )
  INSERT INTO "member_profile_images" (
    owner_id, is_publicly_used, prefix, "_objectkey", filename, mime_type, filesize,
    width, height, focal_x, focal_y, sizes_card_filename, sizes_profile_filename
  )
  SELECT owner_id, _status = 'published', photo->>'prefix', photo->>'objectKey',
    COALESCE(photo->>'filename', photo #>> '{sizes,profile,filename}'),
    COALESCE(photo->>'mimeType', 'image/webp'), (photo->>'filesize')::numeric,
    (photo->>'width')::numeric, (photo->>'height')::numeric,
    (photo->>'focalX')::numeric, (photo->>'focalY')::numeric,
    photo #>> '{sizes,card,filename}', photo #>> '{sizes,profile,filename}'
  FROM profiles WHERE photo IS NOT NULL;

  UPDATE "member_profiles" AS profile SET photo_id = image.id
  FROM "member_profile_images" AS image WHERE profile.owner_id = image.owner_id;

  UPDATE "_member_profiles_v" AS version SET version_photo_id = image.id
  FROM "member_profile_images" AS image
  WHERE version.version_owner_id = image.owner_id
    AND COALESCE(version.version_draft_photo, version.version_photo) IS NOT NULL
    AND NOT (COALESCE(version.version_draft_photo, version.version_photo) @> '{"removed": true}'::jsonb);

  ALTER TABLE "member_profiles" DROP COLUMN "photo";
  ALTER TABLE "member_profiles" DROP COLUMN "draft_photo";
  ALTER TABLE "_member_profiles_v" DROP COLUMN "version_photo";
  ALTER TABLE "_member_profiles_v" DROP COLUMN "version_draft_photo";`)
}
