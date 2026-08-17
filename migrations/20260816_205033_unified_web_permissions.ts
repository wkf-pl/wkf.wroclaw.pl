import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TYPE "public"."enum_website_permissions_permissions_resource" AS ENUM(
    'media', 'pages', 'posts', 'documents-resolution', 'documents-statute',
    'documents-regulations', 'documents-minutes', 'documents-report',
    'documents-agreement', 'documents-license', 'documents-other', 'club-sections'
  );

  CREATE TABLE "website_permissions_permissions" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "resource" "enum_website_permissions_permissions_resource" NOT NULL,
    "anonymous_allowed" boolean DEFAULT false
  );

  CREATE TABLE "website_permissions" (
    "id" serial PRIMARY KEY NOT NULL,
    "updated_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone
  );

  CREATE TABLE "website_permissions_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "roles_id" integer
  );

  INSERT INTO "website_permissions" ("id", "updated_at", "created_at")
  VALUES (1, now(), now());

  SELECT setval(pg_get_serial_sequence('website_permissions', 'id'), 1, true);

  INSERT INTO "website_permissions_permissions" (
    "_order", "_parent_id", "id", "resource", "anonymous_allowed"
  )
  SELECT "resource_order", 1, 'website-' || "resource", "resource"::"enum_website_permissions_permissions_resource",
    "resource" IN ('media', 'pages', 'posts', 'club-sections')
  FROM (VALUES
    (1, 'media'),
    (2, 'pages'),
    (3, 'posts'),
    (4, 'documents-resolution'),
    (5, 'documents-statute'),
    (6, 'documents-regulations'),
    (7, 'documents-minutes'),
    (8, 'documents-report'),
    (9, 'documents-agreement'),
    (10, 'documents-license'),
    (11, 'documents-other'),
    (12, 'club-sections')
  ) AS "resources"("resource_order", "resource");

  DO $$
  DECLARE
    document_policy record;
    document_count integer;
    policy_count integer;
    restricted_without_roles integer;
    policy_is_anonymous boolean;
  BEGIN
    FOR document_policy IN
      SELECT * FROM (VALUES
        ('resolution', 'documents-resolution', 4),
        ('statute', 'documents-statute', 5),
        ('regulations', 'documents-regulations', 6),
        ('minutes', 'documents-minutes', 7),
        ('report', 'documents-report', 8),
        ('agreement', 'documents-agreement', 9),
        ('license', 'documents-license', 10),
        ('other', 'documents-other', 11)
      ) AS policies(document_type, resource, resource_order)
    LOOP
      SELECT count(*) INTO document_count
      FROM "documents"
      WHERE "document_type"::text = document_policy.document_type;

      SELECT count(*) INTO restricted_without_roles
      FROM "documents" AS documents
      WHERE documents."document_type"::text = document_policy.document_type
        AND documents."visibility"::text = 'restricted'
        AND NOT EXISTS (
          SELECT 1 FROM "documents_rels" AS relations
          WHERE relations."parent_id" = documents."id"
            AND relations."path" = 'audienceRoles'
            AND relations."roles_id" IS NOT NULL
        );

      IF restricted_without_roles > 0 THEN
        RAISE EXCEPTION
          'Cannot migrate document type %: a restricted document has no audience roles',
          document_policy.document_type;
      END IF;

      SELECT count(DISTINCT policy_signature) INTO policy_count
      FROM (
        SELECT CASE
          WHEN documents."visibility"::text = 'public' THEN 'anonymous'
          ELSE 'roles:' || COALESCE((
            SELECT string_agg(relations."roles_id"::text, ',' ORDER BY relations."roles_id")
            FROM "documents_rels" AS relations
            WHERE relations."parent_id" = documents."id"
              AND relations."path" = 'audienceRoles'
              AND relations."roles_id" IS NOT NULL
          ), '')
        END AS policy_signature
        FROM "documents" AS documents
        WHERE documents."document_type"::text = document_policy.document_type
      ) AS signatures;

      IF policy_count > 1 THEN
        RAISE EXCEPTION
          'Cannot migrate document type %: documents use different visibility policies',
          document_policy.document_type;
      END IF;

      IF document_count > 0 THEN
        SELECT bool_and("visibility"::text = 'public') INTO policy_is_anonymous
        FROM "documents"
        WHERE "document_type"::text = document_policy.document_type;

        UPDATE "website_permissions_permissions"
        SET "anonymous_allowed" = policy_is_anonymous
        WHERE "resource"::text = document_policy.resource;

        IF NOT policy_is_anonymous THEN
          INSERT INTO "website_permissions_rels" (
            "order", "parent_id", "path", "roles_id"
          )
          SELECT row_number() OVER (ORDER BY role_ids."roles_id"),
            1,
            'permissions.' || (document_policy.resource_order - 1) || '.roles',
            role_ids."roles_id"
          FROM (
            SELECT DISTINCT relations."roles_id"
            FROM "documents" AS documents
            INNER JOIN "documents_rels" AS relations
              ON relations."parent_id" = documents."id"
              AND relations."path" = 'audienceRoles'
            WHERE documents."document_type"::text = document_policy.document_type
              AND relations."roles_id" IS NOT NULL
          ) AS role_ids;
        END IF;
      END IF;
    END LOOP;
  END $$;

  ALTER TABLE "roles_permissions" ALTER COLUMN "resource" SET DATA TYPE text;

  INSERT INTO "roles_permissions" (
    "_order", "_parent_id", "id", "resource", "can_create",
    "read_allowed", "read_own", "read_published", "update_allowed",
    "update_own", "update_published", "delete_allowed", "delete_own",
    "delete_published"
  )
  SELECT COALESCE((
      SELECT max(existing."_order")
      FROM "roles_permissions" AS existing
      WHERE existing."_parent_id" = source."_parent_id"
    ), 0) + document_types.type_order,
    source."_parent_id",
    source."id" || '-' || document_types.document_type,
    'documents-' || document_types.document_type,
    source."can_create", source."read_allowed", source."read_own",
    source."read_published", source."update_allowed", source."update_own",
    source."update_published", source."delete_allowed", source."delete_own",
    source."delete_published"
  FROM "roles_permissions" AS source
  CROSS JOIN (VALUES
    (1, 'resolution'), (2, 'statute'), (3, 'regulations'), (4, 'minutes'),
    (5, 'report'), (6, 'agreement'), (7, 'license'), (8, 'other')
  ) AS document_types(type_order, document_type)
  WHERE source."resource"::text = 'documents';

  DELETE FROM "roles_permissions"
  WHERE "resource"::text IN ('documents', 'footer');

  UPDATE "roles_permissions"
  SET "can_create" = false,
      "update_allowed" = false,
      "update_own" = false,
      "update_published" = false,
      "delete_allowed" = false,
      "delete_own" = false,
      "delete_published" = false
  WHERE NOT "read_allowed";

  ALTER TABLE "documents_rels" DROP CONSTRAINT "documents_rels_roles_fk";
  ALTER TABLE "_documents_v_rels" DROP CONSTRAINT "_documents_v_rels_roles_fk";

  DROP TYPE "public"."enum_roles_permissions_resource";
  CREATE TYPE "public"."enum_roles_permissions_resource" AS ENUM(
    'users', 'media', 'member-profiles', 'member-profile-images', 'pages', 'posts',
    'documents-resolution', 'documents-statute', 'documents-regulations',
    'documents-minutes', 'documents-report', 'documents-agreement',
    'documents-license', 'documents-other', 'document-files', 'club-sections',
    'categories', 'tags', 'navigation', 'site-settings'
  );
  ALTER TABLE "roles_permissions" ALTER COLUMN "resource"
    SET DATA TYPE "public"."enum_roles_permissions_resource"
    USING "resource"::"public"."enum_roles_permissions_resource";

  DROP INDEX "documents_rels_roles_id_idx";
  DROP INDEX "_documents_v_rels_roles_id_idx";

  ALTER TABLE "website_permissions_permissions"
    ADD CONSTRAINT "website_permissions_permissions_parent_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "public"."website_permissions"("id")
    ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "website_permissions_rels"
    ADD CONSTRAINT "website_permissions_rels_parent_fk"
    FOREIGN KEY ("parent_id") REFERENCES "public"."website_permissions"("id")
    ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "website_permissions_rels"
    ADD CONSTRAINT "website_permissions_rels_roles_fk"
    FOREIGN KEY ("roles_id") REFERENCES "public"."roles"("id")
    ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "website_permissions_permissions_order_idx"
    ON "website_permissions_permissions" USING btree ("_order");
  CREATE INDEX "website_permissions_permissions_parent_id_idx"
    ON "website_permissions_permissions" USING btree ("_parent_id");
  CREATE INDEX "website_permissions_rels_order_idx"
    ON "website_permissions_rels" USING btree ("order");
  CREATE INDEX "website_permissions_rels_parent_idx"
    ON "website_permissions_rels" USING btree ("parent_id");
  CREATE INDEX "website_permissions_rels_path_idx"
    ON "website_permissions_rels" USING btree ("path");
  CREATE INDEX "website_permissions_rels_roles_id_idx"
    ON "website_permissions_rels" USING btree ("roles_id");

  ALTER TABLE "documents" DROP COLUMN "visibility";
  ALTER TABLE "documents_rels" DROP COLUMN "roles_id";
  ALTER TABLE "_documents_v" DROP COLUMN "version_visibility";
  ALTER TABLE "_documents_v_rels" DROP COLUMN "roles_id";
  DROP TYPE "public"."enum_documents_visibility";
  DROP TYPE "public"."enum__documents_v_version_visibility";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DO $$
  DECLARE
    inconsistent_role_id integer;
  BEGIN
    SELECT grouped."_parent_id" INTO inconsistent_role_id
    FROM (
      SELECT "_parent_id",
        count(*) AS permission_count,
        count(DISTINCT concat_ws('|', "can_create", "read_allowed", "read_own",
          "read_published", "update_allowed", "update_own", "update_published",
          "delete_allowed", "delete_own", "delete_published")) AS signature_count
      FROM "roles_permissions"
      WHERE "resource"::text LIKE 'documents-%'
      GROUP BY "_parent_id"
    ) AS grouped
    WHERE grouped.permission_count <> 8 OR grouped.signature_count <> 1
    LIMIT 1;

    IF inconsistent_role_id IS NOT NULL THEN
      RAISE EXCEPTION
        'Cannot roll back: role % has document-type permissions that cannot be collapsed safely',
        inconsistent_role_id;
    END IF;
  END $$;

  CREATE TYPE "public"."enum_documents_visibility" AS ENUM('public', 'restricted');
  CREATE TYPE "public"."enum__documents_v_version_visibility" AS ENUM('public', 'restricted');
  ALTER TABLE "documents" ADD COLUMN "visibility" "enum_documents_visibility" DEFAULT 'public';
  ALTER TABLE "documents_rels" ADD COLUMN "roles_id" integer;
  ALTER TABLE "_documents_v" ADD COLUMN "version_visibility" "enum__documents_v_version_visibility" DEFAULT 'public';
  ALTER TABLE "_documents_v_rels" ADD COLUMN "roles_id" integer;

  UPDATE "documents" SET "visibility" = 'restricted';
  UPDATE "_documents_v" SET "version_visibility" = 'restricted';

  UPDATE "documents" AS documents
  SET "visibility" = 'public'
  FROM "website_permissions_permissions" AS permissions
  WHERE permissions."resource"::text = 'documents-' || documents."document_type"::text
    AND permissions."anonymous_allowed";

  UPDATE "_documents_v" AS versions
  SET "version_visibility" = 'public'
  FROM "website_permissions_permissions" AS permissions
  WHERE permissions."resource"::text = 'documents-' || versions."version_document_type"::text
    AND permissions."anonymous_allowed";

  INSERT INTO "documents_rels" ("order", "parent_id", "path", "roles_id")
  SELECT row_number() OVER (PARTITION BY documents."id" ORDER BY relations."roles_id"),
    documents."id", 'audienceRoles', relations."roles_id"
  FROM "documents" AS documents
  INNER JOIN "website_permissions_permissions" AS permissions
    ON permissions."resource"::text = 'documents-' || documents."document_type"::text
    AND NOT permissions."anonymous_allowed"
  INNER JOIN "website_permissions_rels" AS relations
    ON relations."parent_id" = permissions."_parent_id"
    AND relations."path" = 'permissions.' || (permissions."_order" - 1) || '.roles'
    AND relations."roles_id" IS NOT NULL;

  INSERT INTO "_documents_v_rels" ("order", "parent_id", "path", "roles_id")
  SELECT row_number() OVER (PARTITION BY versions."id" ORDER BY relations."roles_id"),
    versions."id", 'version.audienceRoles', relations."roles_id"
  FROM "_documents_v" AS versions
  INNER JOIN "website_permissions_permissions" AS permissions
    ON permissions."resource"::text = 'documents-' || versions."version_document_type"::text
    AND NOT permissions."anonymous_allowed"
  INNER JOIN "website_permissions_rels" AS relations
    ON relations."parent_id" = permissions."_parent_id"
    AND relations."path" = 'permissions.' || (permissions."_order" - 1) || '.roles'
    AND relations."roles_id" IS NOT NULL;

  ALTER TABLE "roles_permissions" ALTER COLUMN "resource" SET DATA TYPE text;

  INSERT INTO "roles_permissions" (
    "_order", "_parent_id", "id", "resource", "can_create", "read_allowed",
    "read_own", "read_published", "update_allowed", "update_own",
    "update_published", "delete_allowed", "delete_own", "delete_published"
  )
  SELECT min(source."_order"), source."_parent_id",
    'rollback-documents-' || source."_parent_id", 'documents',
    bool_or(source."can_create"), bool_or(source."read_allowed"), bool_or(source."read_own"),
    bool_or(source."read_published"), bool_or(source."update_allowed"),
    bool_or(source."update_own"), bool_or(source."update_published"),
    bool_or(source."delete_allowed"), bool_or(source."delete_own"),
    bool_or(source."delete_published")
  FROM "roles_permissions" AS source
  WHERE source."resource" LIKE 'documents-%'
  GROUP BY source."_parent_id";

  DELETE FROM "roles_permissions" WHERE "resource" LIKE 'documents-%';

  DROP TYPE "public"."enum_roles_permissions_resource";
  CREATE TYPE "public"."enum_roles_permissions_resource" AS ENUM(
    'users', 'media', 'member-profiles', 'member-profile-images', 'pages', 'posts',
    'documents', 'document-files', 'club-sections', 'categories', 'tags',
    'navigation', 'footer', 'site-settings'
  );
  ALTER TABLE "roles_permissions" ALTER COLUMN "resource"
    SET DATA TYPE "public"."enum_roles_permissions_resource"
    USING "resource"::"public"."enum_roles_permissions_resource";

  ALTER TABLE "documents_rels"
    ADD CONSTRAINT "documents_rels_roles_fk"
    FOREIGN KEY ("roles_id") REFERENCES "public"."roles"("id")
    ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_documents_v_rels"
    ADD CONSTRAINT "_documents_v_rels_roles_fk"
    FOREIGN KEY ("roles_id") REFERENCES "public"."roles"("id")
    ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "documents_rels_roles_id_idx" ON "documents_rels" USING btree ("roles_id");
  CREATE INDEX "_documents_v_rels_roles_id_idx" ON "_documents_v_rels" USING btree ("roles_id");

  ALTER TABLE "website_permissions_permissions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "website_permissions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "website_permissions_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "website_permissions_permissions" CASCADE;
  DROP TABLE "website_permissions" CASCADE;
  DROP TABLE "website_permissions_rels" CASCADE;
  DROP TYPE "public"."enum_website_permissions_permissions_resource";
  `)
}
