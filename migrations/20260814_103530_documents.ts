import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_documents_document_type" AS ENUM('resolution', 'statute', 'regulations', 'minutes', 'report', 'agreement', 'license', 'other');
  CREATE TYPE "public"."enum_documents_visibility" AS ENUM('public', 'restricted');
  CREATE TYPE "public"."enum_documents_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__documents_v_version_document_type" AS ENUM('resolution', 'statute', 'regulations', 'minutes', 'report', 'agreement', 'license', 'other');
  CREATE TYPE "public"."enum__documents_v_version_visibility" AS ENUM('public', 'restricted');
  CREATE TYPE "public"."enum__documents_v_version_status" AS ENUM('draft', 'published');
  ALTER TABLE "roles_permissions" ALTER COLUMN "resource" SET DATA TYPE text;
  DROP TYPE "public"."enum_roles_permissions_resource";
  CREATE TYPE "public"."enum_roles_permissions_resource" AS ENUM('users', 'media', 'pages', 'posts', 'documents', 'document-files', 'club-sections', 'categories', 'tags', 'navigation', 'footer', 'site-settings');
  ALTER TABLE "roles_permissions" ALTER COLUMN "resource" SET DATA TYPE "public"."enum_roles_permissions_resource" USING "resource"::"public"."enum_roles_permissions_resource";
  CREATE TABLE "document_files" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"document_id" integer,
  	"uploaded_by_id" integer,
  	"prefix" varchar DEFAULT 'documents',
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
  	"focal_y" numeric
  );
  
  CREATE TABLE "documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"document_type" "enum_documents_document_type" DEFAULT 'resolution',
  	"document_number" varchar,
  	"document_date" timestamp(3) with time zone,
  	"summary" varchar,
  	"content" jsonb,
  	"primary_file_id" integer,
  	"visibility" "enum_documents_visibility" DEFAULT 'public',
  	"author_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_documents_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"document_files_id" integer,
  	"roles_id" integer
  );
  
  CREATE TABLE "_documents_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_document_type" "enum__documents_v_version_document_type" DEFAULT 'resolution',
  	"version_document_number" varchar,
  	"version_document_date" timestamp(3) with time zone,
  	"version_summary" varchar,
  	"version_content" jsonb,
  	"version_primary_file_id" integer,
  	"version_visibility" "enum__documents_v_version_visibility" DEFAULT 'public',
  	"version_author_id" integer,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__documents_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_documents_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"document_files_id" integer,
  	"roles_id" integer
  );

  INSERT INTO "roles_permissions" (
    "_order", "_parent_id", "id", "resource", "can_create", "read_allowed",
    "update_allowed", "delete_allowed"
  )
  SELECT COALESCE(MAX("permission"."_order"), 0) + 1, "roles"."id", 'editor-documents',
    'documents'::"enum_roles_permissions_resource", true, true, true, true
  FROM "roles"
  LEFT JOIN "roles_permissions" AS "permission" ON "permission"."_parent_id" = "roles"."id"
  WHERE "roles"."key" = 'editor'
    AND NOT EXISTS (SELECT 1 FROM "roles_permissions" WHERE "id" = 'editor-documents')
  GROUP BY "roles"."id";

  INSERT INTO "roles_permissions" (
    "_order", "_parent_id", "id", "resource", "can_create", "read_allowed",
    "update_allowed", "delete_allowed"
  )
  SELECT COALESCE(MAX("permission"."_order"), 0) + 1, "roles"."id", 'editor-document-files',
    'document-files'::"enum_roles_permissions_resource", true, true, true, true
  FROM "roles"
  LEFT JOIN "roles_permissions" AS "permission" ON "permission"."_parent_id" = "roles"."id"
  WHERE "roles"."key" = 'editor'
    AND NOT EXISTS (SELECT 1 FROM "roles_permissions" WHERE "id" = 'editor-document-files')
  GROUP BY "roles"."id";
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "document_files_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "documents_id" integer;
  ALTER TABLE "document_files" ADD CONSTRAINT "document_files_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "document_files" ADD CONSTRAINT "document_files_uploaded_by_id_users_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "documents" ADD CONSTRAINT "documents_primary_file_id_document_files_id_fk" FOREIGN KEY ("primary_file_id") REFERENCES "public"."document_files"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "documents" ADD CONSTRAINT "documents_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "documents_rels" ADD CONSTRAINT "documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "documents_rels" ADD CONSTRAINT "documents_rels_document_files_fk" FOREIGN KEY ("document_files_id") REFERENCES "public"."document_files"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "documents_rels" ADD CONSTRAINT "documents_rels_roles_fk" FOREIGN KEY ("roles_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_documents_v" ADD CONSTRAINT "_documents_v_parent_id_documents_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_documents_v" ADD CONSTRAINT "_documents_v_version_primary_file_id_document_files_id_fk" FOREIGN KEY ("version_primary_file_id") REFERENCES "public"."document_files"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_documents_v" ADD CONSTRAINT "_documents_v_version_author_id_users_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_documents_v_rels" ADD CONSTRAINT "_documents_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_documents_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_documents_v_rels" ADD CONSTRAINT "_documents_v_rels_document_files_fk" FOREIGN KEY ("document_files_id") REFERENCES "public"."document_files"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_documents_v_rels" ADD CONSTRAINT "_documents_v_rels_roles_fk" FOREIGN KEY ("roles_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "document_files_document_idx" ON "document_files" USING btree ("document_id");
  CREATE INDEX "document_files_uploaded_by_idx" ON "document_files" USING btree ("uploaded_by_id");
  CREATE INDEX "document_files_updated_at_idx" ON "document_files" USING btree ("updated_at");
  CREATE INDEX "document_files_created_at_idx" ON "document_files" USING btree ("created_at");
  CREATE UNIQUE INDEX "document_files_filename_idx" ON "document_files" USING btree ("filename");
  CREATE UNIQUE INDEX "documents_slug_idx" ON "documents" USING btree ("slug");
  CREATE INDEX "documents_document_date_idx" ON "documents" USING btree ("document_date");
  CREATE INDEX "documents_primary_file_idx" ON "documents" USING btree ("primary_file_id");
  CREATE INDEX "documents_author_idx" ON "documents" USING btree ("author_id");
  CREATE INDEX "documents_published_at_idx" ON "documents" USING btree ("published_at");
  CREATE INDEX "documents_updated_at_idx" ON "documents" USING btree ("updated_at");
  CREATE INDEX "documents_created_at_idx" ON "documents" USING btree ("created_at");
  CREATE INDEX "documents__status_idx" ON "documents" USING btree ("_status");
  CREATE UNIQUE INDEX "documentType_documentNumber_idx" ON "documents" USING btree ("document_type","document_number");
  CREATE INDEX "documents_rels_order_idx" ON "documents_rels" USING btree ("order");
  CREATE INDEX "documents_rels_parent_idx" ON "documents_rels" USING btree ("parent_id");
  CREATE INDEX "documents_rels_path_idx" ON "documents_rels" USING btree ("path");
  CREATE INDEX "documents_rels_document_files_id_idx" ON "documents_rels" USING btree ("document_files_id");
  CREATE INDEX "documents_rels_roles_id_idx" ON "documents_rels" USING btree ("roles_id");
  CREATE INDEX "_documents_v_parent_idx" ON "_documents_v" USING btree ("parent_id");
  CREATE INDEX "_documents_v_version_version_slug_idx" ON "_documents_v" USING btree ("version_slug");
  CREATE INDEX "_documents_v_version_version_document_date_idx" ON "_documents_v" USING btree ("version_document_date");
  CREATE INDEX "_documents_v_version_version_primary_file_idx" ON "_documents_v" USING btree ("version_primary_file_id");
  CREATE INDEX "_documents_v_version_version_author_idx" ON "_documents_v" USING btree ("version_author_id");
  CREATE INDEX "_documents_v_version_version_published_at_idx" ON "_documents_v" USING btree ("version_published_at");
  CREATE INDEX "_documents_v_version_version_updated_at_idx" ON "_documents_v" USING btree ("version_updated_at");
  CREATE INDEX "_documents_v_version_version_created_at_idx" ON "_documents_v" USING btree ("version_created_at");
  CREATE INDEX "_documents_v_version_version__status_idx" ON "_documents_v" USING btree ("version__status");
  CREATE INDEX "_documents_v_created_at_idx" ON "_documents_v" USING btree ("created_at");
  CREATE INDEX "_documents_v_updated_at_idx" ON "_documents_v" USING btree ("updated_at");
  CREATE INDEX "_documents_v_latest_idx" ON "_documents_v" USING btree ("latest");
  CREATE INDEX "version_documentType_version_documentNumber_idx" ON "_documents_v" USING btree ("version_document_type","version_document_number");
  CREATE INDEX "_documents_v_rels_order_idx" ON "_documents_v_rels" USING btree ("order");
  CREATE INDEX "_documents_v_rels_parent_idx" ON "_documents_v_rels" USING btree ("parent_id");
  CREATE INDEX "_documents_v_rels_path_idx" ON "_documents_v_rels" USING btree ("path");
  CREATE INDEX "_documents_v_rels_document_files_id_idx" ON "_documents_v_rels" USING btree ("document_files_id");
  CREATE INDEX "_documents_v_rels_roles_id_idx" ON "_documents_v_rels" USING btree ("roles_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_document_files_fk" FOREIGN KEY ("document_files_id") REFERENCES "public"."document_files"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_document_files_id_idx" ON "payload_locked_documents_rels" USING btree ("document_files_id");
  CREATE INDEX "payload_locked_documents_rels_documents_id_idx" ON "payload_locked_documents_rels" USING btree ("documents_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DELETE FROM "roles_permissions"
  WHERE "resource"::text IN ('documents', 'document-files');
  ALTER TABLE "document_files" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "documents_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_documents_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_documents_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "document_files" CASCADE;
  DROP TABLE "documents" CASCADE;
  DROP TABLE "documents_rels" CASCADE;
  DROP TABLE "_documents_v" CASCADE;
  DROP TABLE "_documents_v_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_document_files_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_documents_fk";
  
  ALTER TABLE "roles_permissions" ALTER COLUMN "resource" SET DATA TYPE text;
  DROP TYPE "public"."enum_roles_permissions_resource";
  CREATE TYPE "public"."enum_roles_permissions_resource" AS ENUM('users', 'media', 'pages', 'posts', 'club-sections', 'categories', 'tags', 'navigation', 'footer', 'site-settings');
  ALTER TABLE "roles_permissions" ALTER COLUMN "resource" SET DATA TYPE "public"."enum_roles_permissions_resource" USING "resource"::"public"."enum_roles_permissions_resource";
  DROP INDEX "payload_locked_documents_rels_document_files_id_idx";
  DROP INDEX "payload_locked_documents_rels_documents_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "document_files_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "documents_id";
  DROP TYPE "public"."enum_documents_document_type";
  DROP TYPE "public"."enum_documents_visibility";
  DROP TYPE "public"."enum_documents_status";
  DROP TYPE "public"."enum__documents_v_version_document_type";
  DROP TYPE "public"."enum__documents_v_version_visibility";
  DROP TYPE "public"."enum__documents_v_version_status";`)
}
