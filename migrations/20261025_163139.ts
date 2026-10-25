import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_url_aliases_document_destination" AS ENUM('page', 'primaryFile');
  ALTER TABLE "roles_permissions" ALTER COLUMN "resource" SET DATA TYPE text;
  DROP TYPE "public"."enum_roles_permissions_resource";
  CREATE TYPE "public"."enum_roles_permissions_resource" AS ENUM('users', 'media', 'member-profiles', 'member-profile-images', 'pages', 'posts', 'events', 'event-cycles', 'event-types', 'partners', 'documents', 'url-aliases', 'club-sections', 'categories', 'tags', 'navigation', 'site-settings');
  ALTER TABLE "roles_permissions" ALTER COLUMN "resource" SET DATA TYPE "public"."enum_roles_permissions_resource" USING "resource"::"public"."enum_roles_permissions_resource";
  CREATE TABLE "url_aliases" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"document_destination" "enum_url_aliases_document_destination" DEFAULT 'page',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "url_aliases_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"events_id" integer,
  	"event_cycles_id" integer,
  	"partners_id" integer,
  	"categories_id" integer,
  	"tags_id" integer,
  	"documents_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "url_aliases_id" integer;
  ALTER TABLE "url_aliases_rels" ADD CONSTRAINT "url_aliases_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."url_aliases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "url_aliases_rels" ADD CONSTRAINT "url_aliases_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "url_aliases_rels" ADD CONSTRAINT "url_aliases_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "url_aliases_rels" ADD CONSTRAINT "url_aliases_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "url_aliases_rels" ADD CONSTRAINT "url_aliases_rels_event_cycles_fk" FOREIGN KEY ("event_cycles_id") REFERENCES "public"."event_cycles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "url_aliases_rels" ADD CONSTRAINT "url_aliases_rels_partners_fk" FOREIGN KEY ("partners_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "url_aliases_rels" ADD CONSTRAINT "url_aliases_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "url_aliases_rels" ADD CONSTRAINT "url_aliases_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "url_aliases_rels" ADD CONSTRAINT "url_aliases_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "url_aliases_slug_idx" ON "url_aliases" USING btree ("slug");
  CREATE INDEX "url_aliases_updated_at_idx" ON "url_aliases" USING btree ("updated_at");
  CREATE INDEX "url_aliases_created_at_idx" ON "url_aliases" USING btree ("created_at");
  CREATE INDEX "url_aliases_rels_order_idx" ON "url_aliases_rels" USING btree ("order");
  CREATE INDEX "url_aliases_rels_parent_idx" ON "url_aliases_rels" USING btree ("parent_id");
  CREATE INDEX "url_aliases_rels_path_idx" ON "url_aliases_rels" USING btree ("path");
  CREATE INDEX "url_aliases_rels_pages_id_idx" ON "url_aliases_rels" USING btree ("pages_id");
  CREATE INDEX "url_aliases_rels_posts_id_idx" ON "url_aliases_rels" USING btree ("posts_id");
  CREATE INDEX "url_aliases_rels_events_id_idx" ON "url_aliases_rels" USING btree ("events_id");
  CREATE INDEX "url_aliases_rels_event_cycles_id_idx" ON "url_aliases_rels" USING btree ("event_cycles_id");
  CREATE INDEX "url_aliases_rels_partners_id_idx" ON "url_aliases_rels" USING btree ("partners_id");
  CREATE INDEX "url_aliases_rels_categories_id_idx" ON "url_aliases_rels" USING btree ("categories_id");
  CREATE INDEX "url_aliases_rels_tags_id_idx" ON "url_aliases_rels" USING btree ("tags_id");
  CREATE INDEX "url_aliases_rels_documents_id_idx" ON "url_aliases_rels" USING btree ("documents_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_url_aliases_fk" FOREIGN KEY ("url_aliases_id") REFERENCES "public"."url_aliases"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_url_aliases_id_idx" ON "payload_locked_documents_rels" USING btree ("url_aliases_id");

  INSERT INTO "roles_permissions" (
    "_order", "_parent_id", "id", "resource", "can_create", "read_allowed",
    "read_own", "read_published", "update_allowed", "update_own", "update_published",
    "delete_allowed", "delete_own", "delete_published"
  )
  SELECT
    COALESCE((
      SELECT MAX("sibling"."_order") + 1
      FROM "roles_permissions" AS "sibling"
      WHERE "sibling"."_parent_id" = "roles"."id"
    ), 1),
    "roles"."id",
    'editor-url-aliases',
    'url-aliases'::"enum_roles_permissions_resource",
    true, true, false, false, true, false, false, true, false, false
  FROM "roles"
  WHERE "roles"."key" = 'editor'
    AND NOT EXISTS (
      SELECT 1 FROM "roles_permissions" WHERE "id" = 'editor-url-aliases'
    );

  INSERT INTO "url_aliases" ("slug", "document_destination", "updated_at", "created_at")
  SELECT 'statut', 'primaryFile', now(), now()
  WHERE EXISTS (
    SELECT 1
    FROM "documents"
    WHERE "slug" = 'statut-wroclawskiego-klubu-fantastyki'
  )
    AND NOT EXISTS (SELECT 1 FROM "url_aliases" WHERE "slug" = 'statut');

  INSERT INTO "url_aliases_rels" ("parent_id", "path", "documents_id")
  SELECT "url_aliases"."id", 'target', "documents"."id"
  FROM "url_aliases"
  JOIN "documents"
    ON "documents"."slug" = 'statut-wroclawskiego-klubu-fantastyki'
  WHERE "url_aliases"."slug" = 'statut'
    AND NOT EXISTS (
      SELECT 1
      FROM "url_aliases_rels"
      WHERE "url_aliases_rels"."parent_id" = "url_aliases"."id"
        AND "url_aliases_rels"."path" = 'target'
    );`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DELETE FROM "roles_permissions" WHERE "resource" = 'url-aliases';

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_url_aliases_fk";
  ALTER TABLE "url_aliases" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "url_aliases_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "url_aliases" CASCADE;
  DROP TABLE "url_aliases_rels" CASCADE;

  ALTER TABLE "roles_permissions" ALTER COLUMN "resource" SET DATA TYPE text;
  DROP TYPE "public"."enum_roles_permissions_resource";
  CREATE TYPE "public"."enum_roles_permissions_resource" AS ENUM('users', 'media', 'member-profiles', 'member-profile-images', 'pages', 'posts', 'events', 'event-cycles', 'event-types', 'partners', 'documents', 'club-sections', 'categories', 'tags', 'navigation', 'site-settings');
  ALTER TABLE "roles_permissions" ALTER COLUMN "resource" SET DATA TYPE "public"."enum_roles_permissions_resource" USING "resource"::"public"."enum_roles_permissions_resource";
  DROP INDEX "payload_locked_documents_rels_url_aliases_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "url_aliases_id";
  DROP TYPE "public"."enum_url_aliases_document_destination";`)
}
