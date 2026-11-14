import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'

const existingResources = sql.raw(
  "'media', 'member-profiles', 'pages', 'posts', 'events', 'event-cycles', 'event-types', 'partners', 'documents', 'url-aliases', 'categories', 'tags', 'page-templates', 'navigation', 'site-settings', 'content-audit-log'",
)

const authoredTables = ['pages', 'posts', 'events', 'event_cycles', 'partners']
const authorColumns = authoredTables.flatMap((table) => [
  { table, column: 'author_id', path: 'author' },
  { table: `_${table}_v`, column: 'version_author_id', path: 'version.author' },
])

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "roles_permissions" ALTER COLUMN "resource" TYPE text;
    DROP TYPE "public"."enum_roles_permissions_resource";
    CREATE TYPE "public"."enum_roles_permissions_resource" AS ENUM('users', 'user-groups', ${existingResources});
    ALTER TABLE "roles_permissions" ALTER COLUMN "resource" TYPE "public"."enum_roles_permissions_resource"
      USING "resource"::"public"."enum_roles_permissions_resource";

    INSERT INTO "roles_permissions" (
      "_order", "_parent_id", "id", "resource", "can_create", "read_allowed", "update_allowed", "delete_allowed"
    )
    SELECT COALESCE((SELECT MAX("_order") FROM "roles_permissions" WHERE "_parent_id" = roles.id), 0) + 1,
      roles.id, 'administrator-user-groups', 'user-groups', true, true, true, true
    FROM "roles" WHERE "key" = 'administrator';

  CREATE TABLE "user_groups" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "user_groups_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );

  ALTER TABLE "pages" DROP CONSTRAINT "pages_author_id_users_id_fk";

  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_author_id_users_id_fk";

  ALTER TABLE "posts" DROP CONSTRAINT "posts_author_id_users_id_fk";

  ALTER TABLE "_posts_v" DROP CONSTRAINT "_posts_v_version_author_id_users_id_fk";

  ALTER TABLE "events" DROP CONSTRAINT "events_author_id_users_id_fk";

  ALTER TABLE "_events_v" DROP CONSTRAINT "_events_v_version_author_id_users_id_fk";

  ALTER TABLE "event_cycles" DROP CONSTRAINT "event_cycles_author_id_users_id_fk";

  ALTER TABLE "_event_cycles_v" DROP CONSTRAINT "_event_cycles_v_version_author_id_users_id_fk";

  ALTER TABLE "partners" DROP CONSTRAINT "partners_author_id_users_id_fk";

  ALTER TABLE "_partners_v" DROP CONSTRAINT "_partners_v_version_author_id_users_id_fk";

  DROP INDEX "pages_author_idx";
  DROP INDEX "_pages_v_version_version_author_idx";
  DROP INDEX "posts_author_idx";
  DROP INDEX "_posts_v_version_version_author_idx";
  DROP INDEX "events_author_idx";
  DROP INDEX "_events_v_version_version_author_idx";
  DROP INDEX "event_cycles_author_idx";
  DROP INDEX "_event_cycles_v_version_version_author_idx";
  DROP INDEX "partners_author_idx";
  DROP INDEX "_partners_v_version_version_author_idx";
  ALTER TABLE "pages_rels" ADD COLUMN "users_id" integer;
  ALTER TABLE "pages_rels" ADD COLUMN "user_groups_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "users_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "user_groups_id" integer;
  ALTER TABLE "posts_rels" ADD COLUMN "users_id" integer;
  ALTER TABLE "posts_rels" ADD COLUMN "user_groups_id" integer;
  ALTER TABLE "_posts_v_rels" ADD COLUMN "users_id" integer;
  ALTER TABLE "_posts_v_rels" ADD COLUMN "user_groups_id" integer;
  ALTER TABLE "events_rels" ADD COLUMN "users_id" integer;
  ALTER TABLE "events_rels" ADD COLUMN "user_groups_id" integer;
  ALTER TABLE "_events_v_rels" ADD COLUMN "users_id" integer;
  ALTER TABLE "_events_v_rels" ADD COLUMN "user_groups_id" integer;
  ALTER TABLE "event_cycles_rels" ADD COLUMN "users_id" integer;
  ALTER TABLE "event_cycles_rels" ADD COLUMN "user_groups_id" integer;
  ALTER TABLE "_event_cycles_v_rels" ADD COLUMN "users_id" integer;
  ALTER TABLE "_event_cycles_v_rels" ADD COLUMN "user_groups_id" integer;
  ALTER TABLE "media_rels" ADD COLUMN "users_id" integer;
  ALTER TABLE "media_rels" ADD COLUMN "user_groups_id" integer;
  ALTER TABLE "partners_rels" ADD COLUMN "users_id" integer;
  ALTER TABLE "partners_rels" ADD COLUMN "user_groups_id" integer;
  ALTER TABLE "_partners_v_rels" ADD COLUMN "users_id" integer;
  ALTER TABLE "_partners_v_rels" ADD COLUMN "user_groups_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "user_groups_id" integer;
  ALTER TABLE "user_groups_rels" ADD CONSTRAINT "user_groups_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."user_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "user_groups_rels" ADD CONSTRAINT "user_groups_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "user_groups_name_idx" ON "user_groups" USING btree ("name");
  CREATE INDEX "user_groups_updated_at_idx" ON "user_groups" USING btree ("updated_at");
  CREATE INDEX "user_groups_created_at_idx" ON "user_groups" USING btree ("created_at");
  CREATE INDEX "user_groups_rels_order_idx" ON "user_groups_rels" USING btree ("order");
  CREATE INDEX "user_groups_rels_parent_idx" ON "user_groups_rels" USING btree ("parent_id");
  CREATE INDEX "user_groups_rels_path_idx" ON "user_groups_rels" USING btree ("path");
  CREATE INDEX "user_groups_rels_users_id_idx" ON "user_groups_rels" USING btree ("users_id");
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_user_groups_fk" FOREIGN KEY ("user_groups_id") REFERENCES "public"."user_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_user_groups_fk" FOREIGN KEY ("user_groups_id") REFERENCES "public"."user_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_user_groups_fk" FOREIGN KEY ("user_groups_id") REFERENCES "public"."user_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_user_groups_fk" FOREIGN KEY ("user_groups_id") REFERENCES "public"."user_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_user_groups_fk" FOREIGN KEY ("user_groups_id") REFERENCES "public"."user_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_user_groups_fk" FOREIGN KEY ("user_groups_id") REFERENCES "public"."user_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_rels" ADD CONSTRAINT "event_cycles_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_rels" ADD CONSTRAINT "event_cycles_rels_user_groups_fk" FOREIGN KEY ("user_groups_id") REFERENCES "public"."user_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_rels" ADD CONSTRAINT "_event_cycles_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_rels" ADD CONSTRAINT "_event_cycles_v_rels_user_groups_fk" FOREIGN KEY ("user_groups_id") REFERENCES "public"."user_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_user_groups_fk" FOREIGN KEY ("user_groups_id") REFERENCES "public"."user_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_rels" ADD CONSTRAINT "partners_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_rels" ADD CONSTRAINT "partners_rels_user_groups_fk" FOREIGN KEY ("user_groups_id") REFERENCES "public"."user_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_rels" ADD CONSTRAINT "_partners_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_rels" ADD CONSTRAINT "_partners_v_rels_user_groups_fk" FOREIGN KEY ("user_groups_id") REFERENCES "public"."user_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_user_groups_fk" FOREIGN KEY ("user_groups_id") REFERENCES "public"."user_groups"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_rels_users_id_idx" ON "pages_rels" USING btree ("users_id");
  CREATE INDEX "pages_rels_user_groups_id_idx" ON "pages_rels" USING btree ("user_groups_id");
  CREATE INDEX "_pages_v_rels_users_id_idx" ON "_pages_v_rels" USING btree ("users_id");
  CREATE INDEX "_pages_v_rels_user_groups_id_idx" ON "_pages_v_rels" USING btree ("user_groups_id");
  CREATE INDEX "posts_rels_users_id_idx" ON "posts_rels" USING btree ("users_id");
  CREATE INDEX "posts_rels_user_groups_id_idx" ON "posts_rels" USING btree ("user_groups_id");
  CREATE INDEX "_posts_v_rels_users_id_idx" ON "_posts_v_rels" USING btree ("users_id");
  CREATE INDEX "_posts_v_rels_user_groups_id_idx" ON "_posts_v_rels" USING btree ("user_groups_id");
  CREATE INDEX "events_rels_users_id_idx" ON "events_rels" USING btree ("users_id");
  CREATE INDEX "events_rels_user_groups_id_idx" ON "events_rels" USING btree ("user_groups_id");
  CREATE INDEX "_events_v_rels_users_id_idx" ON "_events_v_rels" USING btree ("users_id");
  CREATE INDEX "_events_v_rels_user_groups_id_idx" ON "_events_v_rels" USING btree ("user_groups_id");
  CREATE INDEX "event_cycles_rels_users_id_idx" ON "event_cycles_rels" USING btree ("users_id");
  CREATE INDEX "event_cycles_rels_user_groups_id_idx" ON "event_cycles_rels" USING btree ("user_groups_id");
  CREATE INDEX "_event_cycles_v_rels_users_id_idx" ON "_event_cycles_v_rels" USING btree ("users_id");
  CREATE INDEX "_event_cycles_v_rels_user_groups_id_idx" ON "_event_cycles_v_rels" USING btree ("user_groups_id");
  CREATE INDEX "media_rels_users_id_idx" ON "media_rels" USING btree ("users_id");
  CREATE INDEX "media_rels_user_groups_id_idx" ON "media_rels" USING btree ("user_groups_id");
  CREATE INDEX "partners_rels_users_id_idx" ON "partners_rels" USING btree ("users_id");
  CREATE INDEX "partners_rels_user_groups_id_idx" ON "partners_rels" USING btree ("user_groups_id");
  CREATE INDEX "_partners_v_rels_users_id_idx" ON "_partners_v_rels" USING btree ("users_id");
  CREATE INDEX "_partners_v_rels_user_groups_id_idx" ON "_partners_v_rels" USING btree ("user_groups_id");
  CREATE INDEX "payload_locked_documents_rels_user_groups_id_idx" ON "payload_locked_documents_rels" USING btree ("user_groups_id");
   DROP INDEX "_event_cycles_v_version_event_defaults_version_event_def_idx";
  DROP INDEX "_event_cycles_v_version_event_defaults_version_event_d_1_idx";
  DROP INDEX "_event_cycles_v_version_event_defaults_version_event_d_2_idx";
  ALTER TABLE "event_cycles" ADD COLUMN "event_defaults_author_group_id" integer;
  ALTER TABLE "_event_cycles_v" ADD COLUMN "version_event_defaults_author_group_id" integer;
  ALTER TABLE "event_cycles" ADD CONSTRAINT "event_cycles_event_defaults_author_group_id_user_groups_id_fk" FOREIGN KEY ("event_defaults_author_group_id") REFERENCES "public"."user_groups"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v" ADD CONSTRAINT "_event_cycles_v_version_event_defaults_author_group_id_user_groups_id_fk" FOREIGN KEY ("version_event_defaults_author_group_id") REFERENCES "public"."user_groups"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "event_cycles_event_defaults_event_defaults_author_group_idx" ON "event_cycles" USING btree ("event_defaults_author_group_id");
  CREATE INDEX "_event_cycles_v_version_event_defaults_version_event_d_3_idx" ON "_event_cycles_v" USING btree ("version_event_defaults_category_id");
  CREATE INDEX "_event_cycles_v_version_event_defaults_version_event_def_idx" ON "_event_cycles_v" USING btree ("version_event_defaults_author_group_id");
  CREATE INDEX "_event_cycles_v_version_event_defaults_version_event_d_1_idx" ON "_event_cycles_v" USING btree ("version_event_defaults_event_type_id");
  CREATE INDEX "_event_cycles_v_version_event_defaults_version_event_d_2_idx" ON "_event_cycles_v" USING btree ("version_event_defaults_hero_image_id");
  `)
  for (const { table, column, path } of [
    ...authorColumns,
    { table: 'media', column: 'uploaded_by_id', path: 'author' },
  ]) {
    const authorColumn = sql.identifier(column)
    await db.execute(sql`
      INSERT INTO ${sql.identifier(`${table}_rels`)} ("parent_id", "path", "users_id")
      SELECT "id", ${path}, ${authorColumn} FROM ${sql.identifier(table)} WHERE ${authorColumn} IS NOT NULL;
    `)
    if (table !== 'media') {
      await db.execute(sql`ALTER TABLE ${sql.identifier(table)} DROP COLUMN ${authorColumn};`)
    }
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM "user_groups") THEN
        RAISE EXCEPTION 'Remove user groups and transfer their documents before rolling back this migration.';
      END IF;
    END $$;

   ALTER TABLE "event_cycles" DROP CONSTRAINT "event_cycles_event_defaults_author_group_id_user_groups_id_fk";

  ALTER TABLE "_event_cycles_v" DROP CONSTRAINT "_event_cycles_v_version_event_defaults_author_group_id_user_groups_id_fk";

  DROP INDEX "event_cycles_event_defaults_event_defaults_author_group_idx";
  DROP INDEX "_event_cycles_v_version_event_defaults_version_event_d_3_idx";
  DROP INDEX "_event_cycles_v_version_event_defaults_version_event_def_idx";
  DROP INDEX "_event_cycles_v_version_event_defaults_version_event_d_1_idx";
  DROP INDEX "_event_cycles_v_version_event_defaults_version_event_d_2_idx";
  CREATE INDEX "_event_cycles_v_version_event_defaults_version_event_def_idx" ON "_event_cycles_v" USING btree ("version_event_defaults_event_type_id");
  CREATE INDEX "_event_cycles_v_version_event_defaults_version_event_d_1_idx" ON "_event_cycles_v" USING btree ("version_event_defaults_hero_image_id");
  CREATE INDEX "_event_cycles_v_version_event_defaults_version_event_d_2_idx" ON "_event_cycles_v" USING btree ("version_event_defaults_category_id");
  ALTER TABLE "event_cycles" DROP COLUMN "event_defaults_author_group_id";
  ALTER TABLE "_event_cycles_v" DROP COLUMN "version_event_defaults_author_group_id";
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_users_fk";

  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_user_groups_fk";

  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_users_fk";

  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_user_groups_fk";

  ALTER TABLE "posts_rels" DROP CONSTRAINT "posts_rels_users_fk";

  ALTER TABLE "posts_rels" DROP CONSTRAINT "posts_rels_user_groups_fk";

  ALTER TABLE "_posts_v_rels" DROP CONSTRAINT "_posts_v_rels_users_fk";

  ALTER TABLE "_posts_v_rels" DROP CONSTRAINT "_posts_v_rels_user_groups_fk";

  ALTER TABLE "events_rels" DROP CONSTRAINT "events_rels_users_fk";

  ALTER TABLE "events_rels" DROP CONSTRAINT "events_rels_user_groups_fk";

  ALTER TABLE "_events_v_rels" DROP CONSTRAINT "_events_v_rels_users_fk";

  ALTER TABLE "_events_v_rels" DROP CONSTRAINT "_events_v_rels_user_groups_fk";

  ALTER TABLE "event_cycles_rels" DROP CONSTRAINT "event_cycles_rels_users_fk";

  ALTER TABLE "event_cycles_rels" DROP CONSTRAINT "event_cycles_rels_user_groups_fk";

  ALTER TABLE "_event_cycles_v_rels" DROP CONSTRAINT "_event_cycles_v_rels_users_fk";

  ALTER TABLE "_event_cycles_v_rels" DROP CONSTRAINT "_event_cycles_v_rels_user_groups_fk";

  ALTER TABLE "media_rels" DROP CONSTRAINT "media_rels_users_fk";

  ALTER TABLE "media_rels" DROP CONSTRAINT "media_rels_user_groups_fk";

  ALTER TABLE "partners_rels" DROP CONSTRAINT "partners_rels_users_fk";

  ALTER TABLE "partners_rels" DROP CONSTRAINT "partners_rels_user_groups_fk";

  ALTER TABLE "_partners_v_rels" DROP CONSTRAINT "_partners_v_rels_users_fk";

  ALTER TABLE "_partners_v_rels" DROP CONSTRAINT "_partners_v_rels_user_groups_fk";

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_user_groups_fk";

  DELETE FROM "roles_permissions" WHERE "resource" = 'user-groups';
  ALTER TABLE "roles_permissions" ALTER COLUMN "resource" SET DATA TYPE text;
  DROP TYPE "public"."enum_roles_permissions_resource";
  CREATE TYPE "public"."enum_roles_permissions_resource" AS ENUM('users', ${existingResources});
  ALTER TABLE "roles_permissions" ALTER COLUMN "resource" SET DATA TYPE "public"."enum_roles_permissions_resource" USING "resource"::"public"."enum_roles_permissions_resource";
  DROP INDEX "pages_rels_users_id_idx";
  DROP INDEX "pages_rels_user_groups_id_idx";
  DROP INDEX "_pages_v_rels_users_id_idx";
  DROP INDEX "_pages_v_rels_user_groups_id_idx";
  DROP INDEX "posts_rels_users_id_idx";
  DROP INDEX "posts_rels_user_groups_id_idx";
  DROP INDEX "_posts_v_rels_users_id_idx";
  DROP INDEX "_posts_v_rels_user_groups_id_idx";
  DROP INDEX "events_rels_users_id_idx";
  DROP INDEX "events_rels_user_groups_id_idx";
  DROP INDEX "_events_v_rels_users_id_idx";
  DROP INDEX "_events_v_rels_user_groups_id_idx";
  DROP INDEX "event_cycles_rels_users_id_idx";
  DROP INDEX "event_cycles_rels_user_groups_id_idx";
  DROP INDEX "_event_cycles_v_rels_users_id_idx";
  DROP INDEX "_event_cycles_v_rels_user_groups_id_idx";
  DROP INDEX "media_rels_users_id_idx";
  DROP INDEX "media_rels_user_groups_id_idx";
  DROP INDEX "partners_rels_users_id_idx";
  DROP INDEX "partners_rels_user_groups_id_idx";
  DROP INDEX "_partners_v_rels_users_id_idx";
  DROP INDEX "_partners_v_rels_user_groups_id_idx";
  DROP INDEX "payload_locked_documents_rels_user_groups_id_idx";
  ALTER TABLE "pages" ADD COLUMN "author_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_author_id" integer;
  ALTER TABLE "posts" ADD COLUMN "author_id" integer;
  ALTER TABLE "_posts_v" ADD COLUMN "version_author_id" integer;
  ALTER TABLE "events" ADD COLUMN "author_id" integer;
  ALTER TABLE "_events_v" ADD COLUMN "version_author_id" integer;
  ALTER TABLE "event_cycles" ADD COLUMN "author_id" integer;
  ALTER TABLE "_event_cycles_v" ADD COLUMN "version_author_id" integer;
  ALTER TABLE "partners" ADD COLUMN "author_id" integer;
  ALTER TABLE "_partners_v" ADD COLUMN "version_author_id" integer;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_author_id_users_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_author_id_users_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_author_id_users_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles" ADD CONSTRAINT "event_cycles_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v" ADD CONSTRAINT "_event_cycles_v_version_author_id_users_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners" ADD CONSTRAINT "partners_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v" ADD CONSTRAINT "_partners_v_version_author_id_users_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_author_idx" ON "pages" USING btree ("author_id");
  CREATE INDEX "_pages_v_version_version_author_idx" ON "_pages_v" USING btree ("version_author_id");
  CREATE INDEX "posts_author_idx" ON "posts" USING btree ("author_id");
  CREATE INDEX "_posts_v_version_version_author_idx" ON "_posts_v" USING btree ("version_author_id");
  CREATE INDEX "events_author_idx" ON "events" USING btree ("author_id");
  CREATE INDEX "_events_v_version_version_author_idx" ON "_events_v" USING btree ("version_author_id");
  CREATE INDEX "event_cycles_author_idx" ON "event_cycles" USING btree ("author_id");
  CREATE INDEX "_event_cycles_v_version_version_author_idx" ON "_event_cycles_v" USING btree ("version_author_id");
  CREATE INDEX "partners_author_idx" ON "partners" USING btree ("author_id");
  CREATE INDEX "_partners_v_version_version_author_idx" ON "_partners_v" USING btree ("version_author_id");
  `)
  for (const { table, column, path } of authorColumns) {
    await db.execute(sql`
      UPDATE ${sql.identifier(table)} AS document
      SET ${sql.identifier(column)} = relation."users_id"
      FROM ${sql.identifier(`${table}_rels`)} AS relation
      WHERE relation."parent_id" = document."id" AND relation."path" = ${path};
    `)
  }

  for (const { table, path } of [...authorColumns, { table: 'media', path: 'author' }]) {
    const relationships = sql.identifier(`${table}_rels`)
    await db.execute(sql`
      DELETE FROM ${relationships} WHERE "path" = ${path};
    `)
    await db.execute(
      sql`ALTER TABLE ${relationships} DROP COLUMN "users_id", DROP COLUMN "user_groups_id";`,
    )
  }
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "user_groups_id";
    DROP TABLE "user_groups_rels", "user_groups";
  `)
}
