import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_event_types_icon_name" AS ENUM('announcement', 'arrow-right', 'arrow', 'arrow-left', 'arrows', 'calendar', 'download', 'event', 'external-link', 'globe', 'home', 'location', 'compass', 'confetti', 'star', 'time', 'book', 'collection', 'document', 'image', 'pdf', 'review', 'tag', 'cards', 'dice', 'd4', 'd6', 'd8', 'd10', 'd12', 'd20', 'dnd5', 'pawn', 'larp', 'sword', 'axe', 'bow', 'fighter', 'fireball', 'mace', 'mage', 'shield', 'wand', 'astronaut', 'gun', 'sf', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'stormtrooper', 'partner', 'users', 'bluesky', 'discord', 'facebook', 'instagram', 'linkedin', 'mail', 'messenger', 'slack', 'twitch', 'youtube');
  CREATE TYPE "public"."enum_event_types_icon_color" AS ENUM('lantern-glow', 'mist-silver', 'parchment-ivory');
  ALTER TABLE "roles_permissions" ALTER COLUMN "resource" SET DATA TYPE text;
  DROP TYPE "public"."enum_roles_permissions_resource";
  CREATE TYPE "public"."enum_roles_permissions_resource" AS ENUM('users', 'media', 'member-profiles', 'member-profile-images', 'pages', 'posts', 'events', 'event-cycles', 'event-types', 'partners', 'documents', 'club-sections', 'categories', 'tags', 'navigation', 'site-settings');
  ALTER TABLE "roles_permissions" ALTER COLUMN "resource" SET DATA TYPE "public"."enum_roles_permissions_resource" USING "resource"::"public"."enum_roles_permissions_resource";
  CREATE TABLE "event_types" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"icon_name" "enum_event_types_icon_name" NOT NULL,
  	"icon_color" "enum_event_types_icon_color" NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  DROP INDEX "_event_cycles_v_version_event_defaults_version_event_def_idx";
  DROP INDEX "_event_cycles_v_version_event_defaults_version_event_d_1_idx";
  ALTER TABLE "events" ADD COLUMN "event_type_id" integer;
  ALTER TABLE "_events_v" ADD COLUMN "version_event_type_id" integer;
  ALTER TABLE "event_cycles" ADD COLUMN "event_defaults_event_type_id" integer;
  ALTER TABLE "_event_cycles_v" ADD COLUMN "version_event_defaults_event_type_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "event_types_id" integer;
  INSERT INTO "event_types" ("name", "icon_name", "icon_color") VALUES
    ('Sesje RPG', 'dice', 'lantern-glow'),
    ('Spotkania', 'users', 'mist-silver');

  UPDATE "events"
  SET "event_type_id" = (SELECT "id" FROM "event_types" WHERE "name" = 'Sesje RPG');

  UPDATE "_events_v"
  SET "version_event_type_id" = (SELECT "id" FROM "event_types" WHERE "name" = 'Sesje RPG');

  UPDATE "event_cycles"
  SET "event_defaults_event_type_id" = (SELECT "id" FROM "event_types" WHERE "name" = 'Sesje RPG');

  UPDATE "_event_cycles_v"
  SET "version_event_defaults_event_type_id" = (SELECT "id" FROM "event_types" WHERE "name" = 'Sesje RPG');

  INSERT INTO "roles_permissions" (
    "_order", "_parent_id", "id", "resource", "can_create", "read_allowed",
    "read_own", "read_published", "update_allowed", "update_own", "update_published",
    "delete_allowed", "delete_own", "delete_published"
  )
  SELECT
    COALESCE((
      SELECT MAX("sibling"."_order") + 1
      FROM "roles_permissions" AS "sibling"
      WHERE "sibling"."_parent_id" = "events_permission"."_parent_id"
    ), 1),
    "events_permission"."_parent_id",
    "events_permission"."id" || '-event-types',
    'event-types'::"enum_roles_permissions_resource",
    "events_permission"."can_create",
    "events_permission"."read_allowed",
    false,
    false,
    "events_permission"."update_allowed",
    false,
    false,
    "events_permission"."delete_allowed",
    false,
    false
  FROM "roles_permissions" AS "events_permission"
  WHERE "events_permission"."resource" = 'events';
  CREATE UNIQUE INDEX "event_types_name_idx" ON "event_types" USING btree ("name");
  CREATE INDEX "event_types_updated_at_idx" ON "event_types" USING btree ("updated_at");
  CREATE INDEX "event_types_created_at_idx" ON "event_types" USING btree ("created_at");
  ALTER TABLE "events" ADD CONSTRAINT "events_event_type_id_event_types_id_fk" FOREIGN KEY ("event_type_id") REFERENCES "public"."event_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_event_type_id_event_types_id_fk" FOREIGN KEY ("version_event_type_id") REFERENCES "public"."event_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles" ADD CONSTRAINT "event_cycles_event_defaults_event_type_id_event_types_id_fk" FOREIGN KEY ("event_defaults_event_type_id") REFERENCES "public"."event_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v" ADD CONSTRAINT "_event_cycles_v_version_event_defaults_event_type_id_event_types_id_fk" FOREIGN KEY ("version_event_defaults_event_type_id") REFERENCES "public"."event_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_event_types_fk" FOREIGN KEY ("event_types_id") REFERENCES "public"."event_types"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "events_event_type_idx" ON "events" USING btree ("event_type_id");
  CREATE INDEX "_events_v_version_version_event_type_idx" ON "_events_v" USING btree ("version_event_type_id");
  CREATE INDEX "event_cycles_event_defaults_event_defaults_event_type_idx" ON "event_cycles" USING btree ("event_defaults_event_type_id");
  CREATE INDEX "_event_cycles_v_version_event_defaults_version_event_d_2_idx" ON "_event_cycles_v" USING btree ("version_event_defaults_category_id");
  CREATE INDEX "payload_locked_documents_rels_event_types_id_idx" ON "payload_locked_documents_rels" USING btree ("event_types_id");
  CREATE INDEX "_event_cycles_v_version_event_defaults_version_event_def_idx" ON "_event_cycles_v" USING btree ("version_event_defaults_event_type_id");
  CREATE INDEX "_event_cycles_v_version_event_defaults_version_event_d_1_idx" ON "_event_cycles_v" USING btree ("version_event_defaults_hero_image_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DELETE FROM "roles_permissions" WHERE "resource" = 'event-types';

  ALTER TABLE "events" DROP CONSTRAINT "events_event_type_id_event_types_id_fk";
  
  ALTER TABLE "_events_v" DROP CONSTRAINT "_events_v_version_event_type_id_event_types_id_fk";
  
  ALTER TABLE "event_cycles" DROP CONSTRAINT "event_cycles_event_defaults_event_type_id_event_types_id_fk";
  
  ALTER TABLE "_event_cycles_v" DROP CONSTRAINT "_event_cycles_v_version_event_defaults_event_type_id_event_types_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_event_types_fk";
  
  ALTER TABLE "roles_permissions" ALTER COLUMN "resource" SET DATA TYPE text;
  DROP TYPE "public"."enum_roles_permissions_resource";
  CREATE TYPE "public"."enum_roles_permissions_resource" AS ENUM('users', 'media', 'member-profiles', 'member-profile-images', 'pages', 'posts', 'events', 'event-cycles', 'partners', 'documents', 'club-sections', 'categories', 'tags', 'navigation', 'site-settings');
  ALTER TABLE "roles_permissions" ALTER COLUMN "resource" SET DATA TYPE "public"."enum_roles_permissions_resource" USING "resource"::"public"."enum_roles_permissions_resource";
  DROP INDEX "events_event_type_idx";
  DROP INDEX "_events_v_version_version_event_type_idx";
  DROP INDEX "event_cycles_event_defaults_event_defaults_event_type_idx";
  DROP INDEX "_event_cycles_v_version_event_defaults_version_event_d_2_idx";
  DROP INDEX "payload_locked_documents_rels_event_types_id_idx";
  DROP INDEX "_event_cycles_v_version_event_defaults_version_event_def_idx";
  DROP INDEX "_event_cycles_v_version_event_defaults_version_event_d_1_idx";
  CREATE INDEX "_event_cycles_v_version_event_defaults_version_event_def_idx" ON "_event_cycles_v" USING btree ("version_event_defaults_hero_image_id");
  CREATE INDEX "_event_cycles_v_version_event_defaults_version_event_d_1_idx" ON "_event_cycles_v" USING btree ("version_event_defaults_category_id");
  ALTER TABLE "events" DROP COLUMN "event_type_id";
  ALTER TABLE "_events_v" DROP COLUMN "version_event_type_id";
  ALTER TABLE "event_cycles" DROP COLUMN "event_defaults_event_type_id";
  ALTER TABLE "_event_cycles_v" DROP COLUMN "version_event_defaults_event_type_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "event_types_id";
  ALTER TABLE "event_types" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "event_types";
  DROP TYPE "public"."enum_event_types_icon_name";
  DROP TYPE "public"."enum_event_types_icon_color";`)
}
