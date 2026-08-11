import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_roles_permissions_resource" AS ENUM('users', 'media', 'pages', 'posts', 'categories', 'tags', 'navigation', 'footer', 'site-settings');
  CREATE TABLE "users_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"roles_id" integer
  );
  
  CREATE TABLE "roles_permissions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"resource" "enum_roles_permissions_resource" NOT NULL,
  	"can_create" boolean DEFAULT false,
  	"read_allowed" boolean DEFAULT false,
  	"read_own" boolean DEFAULT false,
  	"read_published" boolean DEFAULT false,
  	"update_allowed" boolean DEFAULT false,
  	"update_own" boolean DEFAULT false,
  	"update_published" boolean DEFAULT false,
  	"delete_allowed" boolean DEFAULT false,
  	"delete_own" boolean DEFAULT false,
  	"delete_published" boolean DEFAULT false
  );
  
  CREATE TABLE "roles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"key" varchar NOT NULL,
  	"is_system" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  INSERT INTO "roles" ("name", "description", "key", "is_system") VALUES
    ('Użytkownik', 'Podstawowa rola nowego użytkownika.', 'user', false),
    ('Klubowicz', 'Członek Wrocławskiego Klubu Fantastyki.', 'member', false),
    ('Mistrz gry', 'Osoba prowadząca wydarzenia i sesje.', 'game_master', false),
    ('Autor', 'Autor treści publikowanych w serwisie.', 'author', false),
    ('Redaktor', 'Osoba zarządzająca treściami serwisu.', 'editor', false),
    ('Moderator', 'Osoba moderująca społeczność.', 'moderator', false),
    ('Administrator', 'Systemowa rola zarządzająca użytkownikami i rolami.', 'administrator', true);

  INSERT INTO "roles_permissions" (
    "_order", "_parent_id", "id", "resource", "can_create", "read_allowed",
    "update_allowed", "delete_allowed"
  )
  SELECT 1, "id", 'administrator-users', 'users', true, true, true, true
  FROM "roles" WHERE "key" = 'administrator';

  INSERT INTO "roles_permissions" (
    "_order", "_parent_id", "id", "resource", "can_create", "read_allowed",
    "update_allowed", "delete_allowed"
  )
  SELECT "permission"."order", "roles"."id", 'editor-' || "permission"."resource",
    "permission"."resource"::"enum_roles_permissions_resource", true, true, true, true
  FROM "roles"
  CROSS JOIN (VALUES
    (1, 'media'),
    (2, 'pages'),
    (3, 'posts'),
    (4, 'categories'),
    (5, 'tags')
  ) AS "permission"("order", "resource")
  WHERE "roles"."key" = 'editor';

  INSERT INTO "roles_permissions" (
    "_order", "_parent_id", "id", "resource", "read_allowed", "update_allowed"
  )
  SELECT "permission"."order", "roles"."id", 'editor-' || "permission"."resource",
    "permission"."resource"::"enum_roles_permissions_resource", true, true
  FROM "roles"
  CROSS JOIN (VALUES
    (6, 'navigation'),
    (7, 'footer'),
    (8, 'site-settings')
  ) AS "permission"("order", "resource")
  WHERE "roles"."key" = 'editor';

  INSERT INTO "users_rels" ("order", "parent_id", "path", "roles_id")
  SELECT "users_roles"."order", "users_roles"."parent_id", 'roles', "roles"."id"
  FROM "users_roles"
  INNER JOIN "roles" ON "roles"."key" = "users_roles"."value"::text;
  
  ALTER TABLE "users_roles" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "users_roles" CASCADE;
  ALTER TABLE "media" ADD COLUMN "uploaded_by_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "roles_id" integer;
  ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_roles_fk" FOREIGN KEY ("roles_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "roles_permissions" ADD CONSTRAINT "roles_permissions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_rels_order_idx" ON "users_rels" USING btree ("order");
  CREATE INDEX "users_rels_parent_idx" ON "users_rels" USING btree ("parent_id");
  CREATE INDEX "users_rels_path_idx" ON "users_rels" USING btree ("path");
  CREATE INDEX "users_rels_roles_id_idx" ON "users_rels" USING btree ("roles_id");
  CREATE INDEX "roles_permissions_order_idx" ON "roles_permissions" USING btree ("_order");
  CREATE INDEX "roles_permissions_parent_id_idx" ON "roles_permissions" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "roles_name_idx" ON "roles" USING btree ("name");
  CREATE UNIQUE INDEX "roles_key_idx" ON "roles" USING btree ("key");
  CREATE INDEX "roles_updated_at_idx" ON "roles" USING btree ("updated_at");
  CREATE INDEX "roles_created_at_idx" ON "roles" USING btree ("created_at");
  ALTER TABLE "media" ADD CONSTRAINT "media_uploaded_by_id_users_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_roles_fk" FOREIGN KEY ("roles_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "media_uploaded_by_idx" ON "media" USING btree ("uploaded_by_id");
  CREATE INDEX "payload_locked_documents_rels_roles_id_idx" ON "payload_locked_documents_rels" USING btree ("roles_id");
  DROP TYPE "public"."enum_users_roles";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_roles" AS ENUM('user', 'member', 'game_master', 'author', 'editor', 'moderator', 'administrator');
  CREATE TABLE "users_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );

  DO $$
  BEGIN
    IF EXISTS (
      SELECT 1
      FROM "users_rels"
      INNER JOIN "roles" ON "roles"."id" = "users_rels"."roles_id"
      WHERE "roles"."key" NOT IN (
        'user', 'member', 'game_master', 'author', 'editor', 'moderator', 'administrator'
      )
    ) THEN
      RAISE EXCEPTION 'Cannot roll back roles migration while users have custom roles assigned';
    END IF;
  END $$;

  INSERT INTO "users_roles" ("order", "parent_id", "value")
  SELECT COALESCE("users_rels"."order", 0), "users_rels"."parent_id",
    "roles"."key"::"enum_users_roles"
  FROM "users_rels"
  INNER JOIN "roles" ON "roles"."id" = "users_rels"."roles_id"
  WHERE "roles"."key" IN (
    'user', 'member', 'game_master', 'author', 'editor', 'moderator', 'administrator'
  );
  
  ALTER TABLE "users_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "roles_permissions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "roles" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "users_rels" CASCADE;
  DROP TABLE "roles_permissions" CASCADE;
  DROP TABLE "roles" CASCADE;
  ALTER TABLE "media" DROP CONSTRAINT "media_uploaded_by_id_users_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_roles_fk";
  
  DROP INDEX "media_uploaded_by_idx";
  DROP INDEX "payload_locked_documents_rels_roles_id_idx";
  ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_roles_order_idx" ON "users_roles" USING btree ("order");
  CREATE INDEX "users_roles_parent_idx" ON "users_roles" USING btree ("parent_id");
  ALTER TABLE "media" DROP COLUMN "uploaded_by_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "roles_id";
  DROP TYPE "public"."enum_roles_permissions_resource";`)
}
