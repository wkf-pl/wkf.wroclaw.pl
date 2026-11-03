import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

const resourceValuesWithoutPageTemplates = sql.raw(`
  'users', 'media', 'member-profiles', 'member-profile-images', 'pages', 'posts',
  'events', 'event-cycles', 'event-types', 'partners', 'documents', 'url-aliases',
  'club-sections', 'categories', 'tags', 'navigation', 'site-settings'
`)

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "roles_permissions" ALTER COLUMN "resource" SET DATA TYPE text;
    DROP TYPE "public"."enum_roles_permissions_resource";
    CREATE TYPE "public"."enum_roles_permissions_resource" AS ENUM(
      ${resourceValuesWithoutPageTemplates}, 'page-templates'
    );
    ALTER TABLE "roles_permissions" ALTER COLUMN "resource"
      SET DATA TYPE "public"."enum_roles_permissions_resource"
      USING "resource"::"public"."enum_roles_permissions_resource";

    INSERT INTO "roles_permissions" (
      "_order", "_parent_id", "id", "resource", "can_create", "read_allowed",
      "read_own", "read_published", "update_allowed", "update_own", "update_published",
      "delete_allowed", "delete_own", "delete_published", "restore_allowed",
      "permanent_delete_allowed"
    )
    SELECT
      COALESCE((
        SELECT MAX("sibling"."_order") + 1
        FROM "roles_permissions" AS "sibling"
        WHERE "sibling"."_parent_id" = "roles"."id"
      ), 1),
      "roles"."id",
      'administrator-page-templates',
      'page-templates'::"enum_roles_permissions_resource",
      false, true, false, false, true, false, false, false, false, false, false, false
    FROM "roles"
    WHERE "roles"."key" = 'administrator'
      AND NOT EXISTS (
        SELECT 1 FROM "roles_permissions" WHERE "id" = 'administrator-page-templates'
      );
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DELETE FROM "roles_permissions" WHERE "resource" = 'page-templates';

    ALTER TABLE "roles_permissions" ALTER COLUMN "resource" SET DATA TYPE text;
    DROP TYPE "public"."enum_roles_permissions_resource";
    CREATE TYPE "public"."enum_roles_permissions_resource" AS ENUM(
      ${resourceValuesWithoutPageTemplates}
    );
    ALTER TABLE "roles_permissions" ALTER COLUMN "resource"
      SET DATA TYPE "public"."enum_roles_permissions_resource"
      USING "resource"::"public"."enum_roles_permissions_resource";
  `)
}
