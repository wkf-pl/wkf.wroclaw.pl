import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_field_row_text_style" AS ENUM('lead', 'plain', 'compact', 'badge', 'emphasizedBadge');
  CREATE TYPE "public"."enum__pages_v_blocks_field_row_text_style" AS ENUM('lead', 'plain', 'compact', 'badge', 'emphasizedBadge');
  CREATE TYPE "public"."enum_posts_blocks_field_row_text_style" AS ENUM('lead', 'plain', 'compact', 'badge', 'emphasizedBadge');
  CREATE TYPE "public"."enum__posts_v_blocks_field_row_text_style" AS ENUM('lead', 'plain', 'compact', 'badge', 'emphasizedBadge');
  CREATE TYPE "public"."enum_events_blocks_field_row_text_style" AS ENUM('lead', 'plain', 'compact', 'badge', 'emphasizedBadge');
  CREATE TYPE "public"."enum__events_v_blocks_field_row_text_style" AS ENUM('lead', 'plain', 'compact', 'badge', 'emphasizedBadge');
  CREATE TYPE "public"."enum_event_cycles_blocks_field_row_text_style" AS ENUM('lead', 'plain', 'compact', 'badge', 'emphasizedBadge');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_field_row_text_style" AS ENUM('lead', 'plain', 'compact', 'badge', 'emphasizedBadge');
  CREATE TYPE "public"."enum_partners_blocks_field_row_text_style" AS ENUM('lead', 'plain', 'compact', 'badge', 'emphasizedBadge');
  CREATE TYPE "public"."enum__partners_v_blocks_field_row_text_style" AS ENUM('lead', 'plain', 'compact', 'badge', 'emphasizedBadge');
  CREATE TYPE "public"."enum_homepage_sections_blocks_field_row_text_style" AS ENUM('lead', 'plain', 'compact', 'badge', 'emphasizedBadge');
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_field_row_text_style" AS ENUM('lead', 'plain', 'compact', 'badge', 'emphasizedBadge');
  ALTER TYPE "public"."enum_page_templates_blocks_rich_text_text_style" ADD VALUE 'badge';
  ALTER TYPE "public"."enum_page_templates_blocks_rich_text_text_style" ADD VALUE 'emphasizedBadge';
  ALTER TYPE "public"."enum__page_templates_v_blocks_rich_text_text_style" ADD VALUE 'badge';
  ALTER TYPE "public"."enum__page_templates_v_blocks_rich_text_text_style" ADD VALUE 'emphasizedBadge';
  ALTER TYPE "public"."enum_pages_blocks_rich_text_text_style" ADD VALUE 'badge';
  ALTER TYPE "public"."enum_pages_blocks_rich_text_text_style" ADD VALUE 'emphasizedBadge';
  ALTER TYPE "public"."enum__pages_v_blocks_rich_text_text_style" ADD VALUE 'badge';
  ALTER TYPE "public"."enum__pages_v_blocks_rich_text_text_style" ADD VALUE 'emphasizedBadge';
  ALTER TYPE "public"."enum_posts_blocks_rich_text_text_style" ADD VALUE 'badge';
  ALTER TYPE "public"."enum_posts_blocks_rich_text_text_style" ADD VALUE 'emphasizedBadge';
  ALTER TYPE "public"."enum__posts_v_blocks_rich_text_text_style" ADD VALUE 'badge';
  ALTER TYPE "public"."enum__posts_v_blocks_rich_text_text_style" ADD VALUE 'emphasizedBadge';
  ALTER TYPE "public"."enum_events_blocks_rich_text_text_style" ADD VALUE 'badge';
  ALTER TYPE "public"."enum_events_blocks_rich_text_text_style" ADD VALUE 'emphasizedBadge';
  ALTER TYPE "public"."enum__events_v_blocks_rich_text_text_style" ADD VALUE 'badge';
  ALTER TYPE "public"."enum__events_v_blocks_rich_text_text_style" ADD VALUE 'emphasizedBadge';
  ALTER TYPE "public"."enum_event_cycles_blocks_rich_text_text_style" ADD VALUE 'badge';
  ALTER TYPE "public"."enum_event_cycles_blocks_rich_text_text_style" ADD VALUE 'emphasizedBadge';
  ALTER TYPE "public"."enum__event_cycles_v_blocks_rich_text_text_style" ADD VALUE 'badge';
  ALTER TYPE "public"."enum__event_cycles_v_blocks_rich_text_text_style" ADD VALUE 'emphasizedBadge';
  ALTER TYPE "public"."enum_partners_blocks_rich_text_text_style" ADD VALUE 'badge';
  ALTER TYPE "public"."enum_partners_blocks_rich_text_text_style" ADD VALUE 'emphasizedBadge';
  ALTER TYPE "public"."enum__partners_v_blocks_rich_text_text_style" ADD VALUE 'badge';
  ALTER TYPE "public"."enum__partners_v_blocks_rich_text_text_style" ADD VALUE 'emphasizedBadge';
  ALTER TYPE "public"."enum_homepage_sections_blocks_rich_text_text_style" ADD VALUE 'badge';
  ALTER TYPE "public"."enum_homepage_sections_blocks_rich_text_text_style" ADD VALUE 'emphasizedBadge';
  ALTER TYPE "public"."enum__homepage_sections_v_blocks_rich_text_text_style" ADD VALUE 'badge';
  ALTER TYPE "public"."enum__homepage_sections_v_blocks_rich_text_text_style" ADD VALUE 'emphasizedBadge';
  CREATE TABLE "pages_blocks_field_row_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"style" "enum_pages_blocks_field_row_text_style" DEFAULT 'plain',
  	"text" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_field_row_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"style" "enum__pages_v_blocks_field_row_text_style" DEFAULT 'plain',
  	"text" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_field_row_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"style" "enum_posts_blocks_field_row_text_style" DEFAULT 'plain',
  	"text" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_field_row_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"style" "enum__posts_v_blocks_field_row_text_style" DEFAULT 'plain',
  	"text" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "events_blocks_field_row_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"style" "enum_events_blocks_field_row_text_style" DEFAULT 'plain',
  	"text" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "_events_v_blocks_field_row_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"style" "enum__events_v_blocks_field_row_text_style" DEFAULT 'plain',
  	"text" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "event_cycles_blocks_field_row_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"style" "enum_event_cycles_blocks_field_row_text_style" DEFAULT 'plain',
  	"text" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "_event_cycles_v_blocks_field_row_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"style" "enum__event_cycles_v_blocks_field_row_text_style" DEFAULT 'plain',
  	"text" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "partners_blocks_field_row_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"style" "enum_partners_blocks_field_row_text_style" DEFAULT 'plain',
  	"text" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "_partners_v_blocks_field_row_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"style" "enum__partners_v_blocks_field_row_text_style" DEFAULT 'plain',
  	"text" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_sections_blocks_field_row_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"style" "enum_homepage_sections_blocks_field_row_text_style" DEFAULT 'plain',
  	"text" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_sections_v_blocks_field_row_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"style" "enum__homepage_sections_v_blocks_field_row_text_style" DEFAULT 'plain',
  	"text" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "page_templates_blocks_field_row_text" ALTER COLUMN "style" SET DATA TYPE text;
  ALTER TABLE "page_templates_blocks_field_row_text" ALTER COLUMN "style" SET DEFAULT 'plain'::text;
  DROP TYPE "public"."enum_page_templates_blocks_field_row_text_style";
  CREATE TYPE "public"."enum_page_templates_blocks_field_row_text_style" AS ENUM('lead', 'plain', 'compact', 'badge', 'emphasizedBadge');
  ALTER TABLE "page_templates_blocks_field_row_text" ALTER COLUMN "style" SET DEFAULT 'plain'::"public"."enum_page_templates_blocks_field_row_text_style";
  ALTER TABLE "page_templates_blocks_field_row_text" ALTER COLUMN "style" SET DATA TYPE "public"."enum_page_templates_blocks_field_row_text_style" USING "style"::"public"."enum_page_templates_blocks_field_row_text_style";
  ALTER TABLE "_page_templates_v_blocks_field_row_text" ALTER COLUMN "style" SET DATA TYPE text;
  ALTER TABLE "_page_templates_v_blocks_field_row_text" ALTER COLUMN "style" SET DEFAULT 'plain'::text;
  DROP TYPE "public"."enum__page_templates_v_blocks_field_row_text_style";
  CREATE TYPE "public"."enum__page_templates_v_blocks_field_row_text_style" AS ENUM('lead', 'plain', 'compact', 'badge', 'emphasizedBadge');
  ALTER TABLE "_page_templates_v_blocks_field_row_text" ALTER COLUMN "style" SET DEFAULT 'plain'::"public"."enum__page_templates_v_blocks_field_row_text_style";
  ALTER TABLE "_page_templates_v_blocks_field_row_text" ALTER COLUMN "style" SET DATA TYPE "public"."enum__page_templates_v_blocks_field_row_text_style" USING "style"::"public"."enum__page_templates_v_blocks_field_row_text_style";
  ALTER TABLE "pages_blocks_field_row_text" ADD CONSTRAINT "pages_blocks_field_row_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_field_row_text" ADD CONSTRAINT "_pages_v_blocks_field_row_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_field_row_text" ADD CONSTRAINT "posts_blocks_field_row_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_field_row_text" ADD CONSTRAINT "_posts_v_blocks_field_row_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_blocks_field_row_text" ADD CONSTRAINT "events_blocks_field_row_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_field_row_text" ADD CONSTRAINT "_events_v_blocks_field_row_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_field_row_text" ADD CONSTRAINT "event_cycles_blocks_field_row_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_cycles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_field_row_text" ADD CONSTRAINT "_event_cycles_v_blocks_field_row_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_event_cycles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_blocks_field_row_text" ADD CONSTRAINT "partners_blocks_field_row_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_field_row_text" ADD CONSTRAINT "_partners_v_blocks_field_row_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partners_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_field_row_text" ADD CONSTRAINT "homepage_sections_blocks_field_row_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_sections_v_blocks_field_row_text" ADD CONSTRAINT "_homepage_sections_v_blocks_field_row_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_sections_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_field_row_text_order_idx" ON "pages_blocks_field_row_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_field_row_text_parent_id_idx" ON "pages_blocks_field_row_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_field_row_text_path_idx" ON "pages_blocks_field_row_text" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_field_row_text_order_idx" ON "_pages_v_blocks_field_row_text" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_field_row_text_parent_id_idx" ON "_pages_v_blocks_field_row_text" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_field_row_text_path_idx" ON "_pages_v_blocks_field_row_text" USING btree ("_path");
  CREATE INDEX "posts_blocks_field_row_text_order_idx" ON "posts_blocks_field_row_text" USING btree ("_order");
  CREATE INDEX "posts_blocks_field_row_text_parent_id_idx" ON "posts_blocks_field_row_text" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_field_row_text_path_idx" ON "posts_blocks_field_row_text" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_field_row_text_order_idx" ON "_posts_v_blocks_field_row_text" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_field_row_text_parent_id_idx" ON "_posts_v_blocks_field_row_text" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_field_row_text_path_idx" ON "_posts_v_blocks_field_row_text" USING btree ("_path");
  CREATE INDEX "events_blocks_field_row_text_order_idx" ON "events_blocks_field_row_text" USING btree ("_order");
  CREATE INDEX "events_blocks_field_row_text_parent_id_idx" ON "events_blocks_field_row_text" USING btree ("_parent_id");
  CREATE INDEX "events_blocks_field_row_text_path_idx" ON "events_blocks_field_row_text" USING btree ("_path");
  CREATE INDEX "_events_v_blocks_field_row_text_order_idx" ON "_events_v_blocks_field_row_text" USING btree ("_order");
  CREATE INDEX "_events_v_blocks_field_row_text_parent_id_idx" ON "_events_v_blocks_field_row_text" USING btree ("_parent_id");
  CREATE INDEX "_events_v_blocks_field_row_text_path_idx" ON "_events_v_blocks_field_row_text" USING btree ("_path");
  CREATE INDEX "event_cycles_blocks_field_row_text_order_idx" ON "event_cycles_blocks_field_row_text" USING btree ("_order");
  CREATE INDEX "event_cycles_blocks_field_row_text_parent_id_idx" ON "event_cycles_blocks_field_row_text" USING btree ("_parent_id");
  CREATE INDEX "event_cycles_blocks_field_row_text_path_idx" ON "event_cycles_blocks_field_row_text" USING btree ("_path");
  CREATE INDEX "_event_cycles_v_blocks_field_row_text_order_idx" ON "_event_cycles_v_blocks_field_row_text" USING btree ("_order");
  CREATE INDEX "_event_cycles_v_blocks_field_row_text_parent_id_idx" ON "_event_cycles_v_blocks_field_row_text" USING btree ("_parent_id");
  CREATE INDEX "_event_cycles_v_blocks_field_row_text_path_idx" ON "_event_cycles_v_blocks_field_row_text" USING btree ("_path");
  CREATE INDEX "partners_blocks_field_row_text_order_idx" ON "partners_blocks_field_row_text" USING btree ("_order");
  CREATE INDEX "partners_blocks_field_row_text_parent_id_idx" ON "partners_blocks_field_row_text" USING btree ("_parent_id");
  CREATE INDEX "partners_blocks_field_row_text_path_idx" ON "partners_blocks_field_row_text" USING btree ("_path");
  CREATE INDEX "_partners_v_blocks_field_row_text_order_idx" ON "_partners_v_blocks_field_row_text" USING btree ("_order");
  CREATE INDEX "_partners_v_blocks_field_row_text_parent_id_idx" ON "_partners_v_blocks_field_row_text" USING btree ("_parent_id");
  CREATE INDEX "_partners_v_blocks_field_row_text_path_idx" ON "_partners_v_blocks_field_row_text" USING btree ("_path");
  CREATE INDEX "homepage_sections_blocks_field_row_text_order_idx" ON "homepage_sections_blocks_field_row_text" USING btree ("_order");
  CREATE INDEX "homepage_sections_blocks_field_row_text_parent_id_idx" ON "homepage_sections_blocks_field_row_text" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_blocks_field_row_text_path_idx" ON "homepage_sections_blocks_field_row_text" USING btree ("_path");
  CREATE INDEX "_homepage_sections_v_blocks_field_row_text_order_idx" ON "_homepage_sections_v_blocks_field_row_text" USING btree ("_order");
  CREATE INDEX "_homepage_sections_v_blocks_field_row_text_parent_id_idx" ON "_homepage_sections_v_blocks_field_row_text" USING btree ("_parent_id");
  CREATE INDEX "_homepage_sections_v_blocks_field_row_text_path_idx" ON "_homepage_sections_v_blocks_field_row_text" USING btree ("_path");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_field_row_text" CASCADE;
  DROP TABLE "_pages_v_blocks_field_row_text" CASCADE;
  DROP TABLE "posts_blocks_field_row_text" CASCADE;
  DROP TABLE "_posts_v_blocks_field_row_text" CASCADE;
  DROP TABLE "events_blocks_field_row_text" CASCADE;
  DROP TABLE "_events_v_blocks_field_row_text" CASCADE;
  DROP TABLE "event_cycles_blocks_field_row_text" CASCADE;
  DROP TABLE "_event_cycles_v_blocks_field_row_text" CASCADE;
  DROP TABLE "partners_blocks_field_row_text" CASCADE;
  DROP TABLE "_partners_v_blocks_field_row_text" CASCADE;
  DROP TABLE "homepage_sections_blocks_field_row_text" CASCADE;
  DROP TABLE "_homepage_sections_v_blocks_field_row_text" CASCADE;
  ALTER TABLE "page_templates_blocks_rich_text" ALTER COLUMN "text_style" SET DATA TYPE text;
  ALTER TABLE "page_templates_blocks_rich_text" ALTER COLUMN "text_style" SET DEFAULT 'default'::text;
  DROP TYPE "public"."enum_page_templates_blocks_rich_text_text_style";
  CREATE TYPE "public"."enum_page_templates_blocks_rich_text_text_style" AS ENUM('default', 'lead', 'note');
  ALTER TABLE "page_templates_blocks_rich_text" ALTER COLUMN "text_style" SET DEFAULT 'default'::"public"."enum_page_templates_blocks_rich_text_text_style";
  ALTER TABLE "page_templates_blocks_rich_text" ALTER COLUMN "text_style" SET DATA TYPE "public"."enum_page_templates_blocks_rich_text_text_style" USING "text_style"::"public"."enum_page_templates_blocks_rich_text_text_style";
  ALTER TABLE "page_templates_blocks_field_row_text" ALTER COLUMN "style" SET DATA TYPE text;
  ALTER TABLE "page_templates_blocks_field_row_text" ALTER COLUMN "style" SET DEFAULT 'plain'::text;
  DROP TYPE "public"."enum_page_templates_blocks_field_row_text_style";
  CREATE TYPE "public"."enum_page_templates_blocks_field_row_text_style" AS ENUM('plain', 'badge', 'emphasizedBadge', 'informationLabel');
  ALTER TABLE "page_templates_blocks_field_row_text" ALTER COLUMN "style" SET DEFAULT 'plain'::"public"."enum_page_templates_blocks_field_row_text_style";
  ALTER TABLE "page_templates_blocks_field_row_text" ALTER COLUMN "style" SET DATA TYPE "public"."enum_page_templates_blocks_field_row_text_style" USING "style"::"public"."enum_page_templates_blocks_field_row_text_style";
  ALTER TABLE "_page_templates_v_blocks_rich_text" ALTER COLUMN "text_style" SET DATA TYPE text;
  ALTER TABLE "_page_templates_v_blocks_rich_text" ALTER COLUMN "text_style" SET DEFAULT 'default'::text;
  DROP TYPE "public"."enum__page_templates_v_blocks_rich_text_text_style";
  CREATE TYPE "public"."enum__page_templates_v_blocks_rich_text_text_style" AS ENUM('default', 'lead', 'note');
  ALTER TABLE "_page_templates_v_blocks_rich_text" ALTER COLUMN "text_style" SET DEFAULT 'default'::"public"."enum__page_templates_v_blocks_rich_text_text_style";
  ALTER TABLE "_page_templates_v_blocks_rich_text" ALTER COLUMN "text_style" SET DATA TYPE "public"."enum__page_templates_v_blocks_rich_text_text_style" USING "text_style"::"public"."enum__page_templates_v_blocks_rich_text_text_style";
  ALTER TABLE "_page_templates_v_blocks_field_row_text" ALTER COLUMN "style" SET DATA TYPE text;
  ALTER TABLE "_page_templates_v_blocks_field_row_text" ALTER COLUMN "style" SET DEFAULT 'plain'::text;
  DROP TYPE "public"."enum__page_templates_v_blocks_field_row_text_style";
  CREATE TYPE "public"."enum__page_templates_v_blocks_field_row_text_style" AS ENUM('plain', 'badge', 'emphasizedBadge', 'informationLabel');
  ALTER TABLE "_page_templates_v_blocks_field_row_text" ALTER COLUMN "style" SET DEFAULT 'plain'::"public"."enum__page_templates_v_blocks_field_row_text_style";
  ALTER TABLE "_page_templates_v_blocks_field_row_text" ALTER COLUMN "style" SET DATA TYPE "public"."enum__page_templates_v_blocks_field_row_text_style" USING "style"::"public"."enum__page_templates_v_blocks_field_row_text_style";
  ALTER TABLE "pages_blocks_rich_text" ALTER COLUMN "text_style" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_rich_text" ALTER COLUMN "text_style" SET DEFAULT 'default'::text;
  DROP TYPE "public"."enum_pages_blocks_rich_text_text_style";
  CREATE TYPE "public"."enum_pages_blocks_rich_text_text_style" AS ENUM('default', 'lead', 'note');
  ALTER TABLE "pages_blocks_rich_text" ALTER COLUMN "text_style" SET DEFAULT 'default'::"public"."enum_pages_blocks_rich_text_text_style";
  ALTER TABLE "pages_blocks_rich_text" ALTER COLUMN "text_style" SET DATA TYPE "public"."enum_pages_blocks_rich_text_text_style" USING "text_style"::"public"."enum_pages_blocks_rich_text_text_style";
  ALTER TABLE "_pages_v_blocks_rich_text" ALTER COLUMN "text_style" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_rich_text" ALTER COLUMN "text_style" SET DEFAULT 'default'::text;
  DROP TYPE "public"."enum__pages_v_blocks_rich_text_text_style";
  CREATE TYPE "public"."enum__pages_v_blocks_rich_text_text_style" AS ENUM('default', 'lead', 'note');
  ALTER TABLE "_pages_v_blocks_rich_text" ALTER COLUMN "text_style" SET DEFAULT 'default'::"public"."enum__pages_v_blocks_rich_text_text_style";
  ALTER TABLE "_pages_v_blocks_rich_text" ALTER COLUMN "text_style" SET DATA TYPE "public"."enum__pages_v_blocks_rich_text_text_style" USING "text_style"::"public"."enum__pages_v_blocks_rich_text_text_style";
  ALTER TABLE "posts_blocks_rich_text" ALTER COLUMN "text_style" SET DATA TYPE text;
  ALTER TABLE "posts_blocks_rich_text" ALTER COLUMN "text_style" SET DEFAULT 'default'::text;
  DROP TYPE "public"."enum_posts_blocks_rich_text_text_style";
  CREATE TYPE "public"."enum_posts_blocks_rich_text_text_style" AS ENUM('default', 'lead', 'note');
  ALTER TABLE "posts_blocks_rich_text" ALTER COLUMN "text_style" SET DEFAULT 'default'::"public"."enum_posts_blocks_rich_text_text_style";
  ALTER TABLE "posts_blocks_rich_text" ALTER COLUMN "text_style" SET DATA TYPE "public"."enum_posts_blocks_rich_text_text_style" USING "text_style"::"public"."enum_posts_blocks_rich_text_text_style";
  ALTER TABLE "_posts_v_blocks_rich_text" ALTER COLUMN "text_style" SET DATA TYPE text;
  ALTER TABLE "_posts_v_blocks_rich_text" ALTER COLUMN "text_style" SET DEFAULT 'default'::text;
  DROP TYPE "public"."enum__posts_v_blocks_rich_text_text_style";
  CREATE TYPE "public"."enum__posts_v_blocks_rich_text_text_style" AS ENUM('default', 'lead', 'note');
  ALTER TABLE "_posts_v_blocks_rich_text" ALTER COLUMN "text_style" SET DEFAULT 'default'::"public"."enum__posts_v_blocks_rich_text_text_style";
  ALTER TABLE "_posts_v_blocks_rich_text" ALTER COLUMN "text_style" SET DATA TYPE "public"."enum__posts_v_blocks_rich_text_text_style" USING "text_style"::"public"."enum__posts_v_blocks_rich_text_text_style";
  ALTER TABLE "events_blocks_rich_text" ALTER COLUMN "text_style" SET DATA TYPE text;
  ALTER TABLE "events_blocks_rich_text" ALTER COLUMN "text_style" SET DEFAULT 'default'::text;
  DROP TYPE "public"."enum_events_blocks_rich_text_text_style";
  CREATE TYPE "public"."enum_events_blocks_rich_text_text_style" AS ENUM('default', 'lead', 'note');
  ALTER TABLE "events_blocks_rich_text" ALTER COLUMN "text_style" SET DEFAULT 'default'::"public"."enum_events_blocks_rich_text_text_style";
  ALTER TABLE "events_blocks_rich_text" ALTER COLUMN "text_style" SET DATA TYPE "public"."enum_events_blocks_rich_text_text_style" USING "text_style"::"public"."enum_events_blocks_rich_text_text_style";
  ALTER TABLE "_events_v_blocks_rich_text" ALTER COLUMN "text_style" SET DATA TYPE text;
  ALTER TABLE "_events_v_blocks_rich_text" ALTER COLUMN "text_style" SET DEFAULT 'default'::text;
  DROP TYPE "public"."enum__events_v_blocks_rich_text_text_style";
  CREATE TYPE "public"."enum__events_v_blocks_rich_text_text_style" AS ENUM('default', 'lead', 'note');
  ALTER TABLE "_events_v_blocks_rich_text" ALTER COLUMN "text_style" SET DEFAULT 'default'::"public"."enum__events_v_blocks_rich_text_text_style";
  ALTER TABLE "_events_v_blocks_rich_text" ALTER COLUMN "text_style" SET DATA TYPE "public"."enum__events_v_blocks_rich_text_text_style" USING "text_style"::"public"."enum__events_v_blocks_rich_text_text_style";
  ALTER TABLE "event_cycles_blocks_rich_text" ALTER COLUMN "text_style" SET DATA TYPE text;
  ALTER TABLE "event_cycles_blocks_rich_text" ALTER COLUMN "text_style" SET DEFAULT 'default'::text;
  DROP TYPE "public"."enum_event_cycles_blocks_rich_text_text_style";
  CREATE TYPE "public"."enum_event_cycles_blocks_rich_text_text_style" AS ENUM('default', 'lead', 'note');
  ALTER TABLE "event_cycles_blocks_rich_text" ALTER COLUMN "text_style" SET DEFAULT 'default'::"public"."enum_event_cycles_blocks_rich_text_text_style";
  ALTER TABLE "event_cycles_blocks_rich_text" ALTER COLUMN "text_style" SET DATA TYPE "public"."enum_event_cycles_blocks_rich_text_text_style" USING "text_style"::"public"."enum_event_cycles_blocks_rich_text_text_style";
  ALTER TABLE "_event_cycles_v_blocks_rich_text" ALTER COLUMN "text_style" SET DATA TYPE text;
  ALTER TABLE "_event_cycles_v_blocks_rich_text" ALTER COLUMN "text_style" SET DEFAULT 'default'::text;
  DROP TYPE "public"."enum__event_cycles_v_blocks_rich_text_text_style";
  CREATE TYPE "public"."enum__event_cycles_v_blocks_rich_text_text_style" AS ENUM('default', 'lead', 'note');
  ALTER TABLE "_event_cycles_v_blocks_rich_text" ALTER COLUMN "text_style" SET DEFAULT 'default'::"public"."enum__event_cycles_v_blocks_rich_text_text_style";
  ALTER TABLE "_event_cycles_v_blocks_rich_text" ALTER COLUMN "text_style" SET DATA TYPE "public"."enum__event_cycles_v_blocks_rich_text_text_style" USING "text_style"::"public"."enum__event_cycles_v_blocks_rich_text_text_style";
  ALTER TABLE "partners_blocks_rich_text" ALTER COLUMN "text_style" SET DATA TYPE text;
  ALTER TABLE "partners_blocks_rich_text" ALTER COLUMN "text_style" SET DEFAULT 'default'::text;
  DROP TYPE "public"."enum_partners_blocks_rich_text_text_style";
  CREATE TYPE "public"."enum_partners_blocks_rich_text_text_style" AS ENUM('default', 'lead', 'note');
  ALTER TABLE "partners_blocks_rich_text" ALTER COLUMN "text_style" SET DEFAULT 'default'::"public"."enum_partners_blocks_rich_text_text_style";
  ALTER TABLE "partners_blocks_rich_text" ALTER COLUMN "text_style" SET DATA TYPE "public"."enum_partners_blocks_rich_text_text_style" USING "text_style"::"public"."enum_partners_blocks_rich_text_text_style";
  ALTER TABLE "_partners_v_blocks_rich_text" ALTER COLUMN "text_style" SET DATA TYPE text;
  ALTER TABLE "_partners_v_blocks_rich_text" ALTER COLUMN "text_style" SET DEFAULT 'default'::text;
  DROP TYPE "public"."enum__partners_v_blocks_rich_text_text_style";
  CREATE TYPE "public"."enum__partners_v_blocks_rich_text_text_style" AS ENUM('default', 'lead', 'note');
  ALTER TABLE "_partners_v_blocks_rich_text" ALTER COLUMN "text_style" SET DEFAULT 'default'::"public"."enum__partners_v_blocks_rich_text_text_style";
  ALTER TABLE "_partners_v_blocks_rich_text" ALTER COLUMN "text_style" SET DATA TYPE "public"."enum__partners_v_blocks_rich_text_text_style" USING "text_style"::"public"."enum__partners_v_blocks_rich_text_text_style";
  ALTER TABLE "homepage_sections_blocks_rich_text" ALTER COLUMN "text_style" SET DATA TYPE text;
  ALTER TABLE "homepage_sections_blocks_rich_text" ALTER COLUMN "text_style" SET DEFAULT 'default'::text;
  DROP TYPE "public"."enum_homepage_sections_blocks_rich_text_text_style";
  CREATE TYPE "public"."enum_homepage_sections_blocks_rich_text_text_style" AS ENUM('default', 'lead', 'note');
  ALTER TABLE "homepage_sections_blocks_rich_text" ALTER COLUMN "text_style" SET DEFAULT 'default'::"public"."enum_homepage_sections_blocks_rich_text_text_style";
  ALTER TABLE "homepage_sections_blocks_rich_text" ALTER COLUMN "text_style" SET DATA TYPE "public"."enum_homepage_sections_blocks_rich_text_text_style" USING "text_style"::"public"."enum_homepage_sections_blocks_rich_text_text_style";
  ALTER TABLE "_homepage_sections_v_blocks_rich_text" ALTER COLUMN "text_style" SET DATA TYPE text;
  ALTER TABLE "_homepage_sections_v_blocks_rich_text" ALTER COLUMN "text_style" SET DEFAULT 'default'::text;
  DROP TYPE "public"."enum__homepage_sections_v_blocks_rich_text_text_style";
  CREATE TYPE "public"."enum__homepage_sections_v_blocks_rich_text_text_style" AS ENUM('default', 'lead', 'note');
  ALTER TABLE "_homepage_sections_v_blocks_rich_text" ALTER COLUMN "text_style" SET DEFAULT 'default'::"public"."enum__homepage_sections_v_blocks_rich_text_text_style";
  ALTER TABLE "_homepage_sections_v_blocks_rich_text" ALTER COLUMN "text_style" SET DATA TYPE "public"."enum__homepage_sections_v_blocks_rich_text_text_style" USING "text_style"::"public"."enum__homepage_sections_v_blocks_rich_text_text_style";
  DROP TYPE "public"."enum_pages_blocks_field_row_text_style";
  DROP TYPE "public"."enum__pages_v_blocks_field_row_text_style";
  DROP TYPE "public"."enum_posts_blocks_field_row_text_style";
  DROP TYPE "public"."enum__posts_v_blocks_field_row_text_style";
  DROP TYPE "public"."enum_events_blocks_field_row_text_style";
  DROP TYPE "public"."enum__events_v_blocks_field_row_text_style";
  DROP TYPE "public"."enum_event_cycles_blocks_field_row_text_style";
  DROP TYPE "public"."enum__event_cycles_v_blocks_field_row_text_style";
  DROP TYPE "public"."enum_partners_blocks_field_row_text_style";
  DROP TYPE "public"."enum__partners_v_blocks_field_row_text_style";
  DROP TYPE "public"."enum_homepage_sections_blocks_field_row_text_style";
  DROP TYPE "public"."enum__homepage_sections_v_blocks_field_row_text_style";`)
}
