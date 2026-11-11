import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_page_templates_blocks_spacer_size" AS ENUM('16', '24', '32', '48', '64');
    CREATE TYPE "public"."enum__page_templates_v_blocks_spacer_size" AS ENUM('16', '24', '32', '48', '64');
    CREATE TYPE "public"."enum_pages_blocks_spacer_size" AS ENUM('16', '24', '32', '48', '64');
    CREATE TYPE "public"."enum__pages_v_blocks_spacer_size" AS ENUM('16', '24', '32', '48', '64');
    CREATE TYPE "public"."enum_posts_blocks_spacer_size" AS ENUM('16', '24', '32', '48', '64');
    CREATE TYPE "public"."enum__posts_v_blocks_spacer_size" AS ENUM('16', '24', '32', '48', '64');
    CREATE TYPE "public"."enum_events_blocks_spacer_size" AS ENUM('16', '24', '32', '48', '64');
    CREATE TYPE "public"."enum__events_v_blocks_spacer_size" AS ENUM('16', '24', '32', '48', '64');
    CREATE TYPE "public"."enum_event_cycles_blocks_spacer_size" AS ENUM('16', '24', '32', '48', '64');
    CREATE TYPE "public"."enum__event_cycles_v_blocks_spacer_size" AS ENUM('16', '24', '32', '48', '64');
    CREATE TYPE "public"."enum_partners_blocks_spacer_size" AS ENUM('16', '24', '32', '48', '64');
    CREATE TYPE "public"."enum__partners_v_blocks_spacer_size" AS ENUM('16', '24', '32', '48', '64');
    CREATE TYPE "public"."enum_homepage_sections_blocks_spacer_size" AS ENUM('16', '24', '32', '48', '64');
    CREATE TYPE "public"."enum__homepage_sections_v_blocks_spacer_size" AS ENUM('16', '24', '32', '48', '64');
    CREATE TABLE "page_templates_blocks_spacer" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "size" "enum_page_templates_blocks_spacer_size" DEFAULT '32',
      "block_name" varchar
    );

    CREATE TABLE "_page_templates_v_blocks_spacer" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "size" "enum__page_templates_v_blocks_spacer_size" DEFAULT '32',
      "_uuid" varchar,
      "block_name" varchar
    );

    CREATE TABLE "pages_blocks_spacer" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "size" "enum_pages_blocks_spacer_size" DEFAULT '32',
      "block_name" varchar
    );

    CREATE TABLE "_pages_v_blocks_spacer" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "size" "enum__pages_v_blocks_spacer_size" DEFAULT '32',
      "_uuid" varchar,
      "block_name" varchar
    );

    CREATE TABLE "posts_blocks_spacer" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "size" "enum_posts_blocks_spacer_size" DEFAULT '32',
      "block_name" varchar
    );

    CREATE TABLE "_posts_v_blocks_spacer" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "size" "enum__posts_v_blocks_spacer_size" DEFAULT '32',
      "_uuid" varchar,
      "block_name" varchar
    );

    CREATE TABLE "events_blocks_spacer" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "size" "enum_events_blocks_spacer_size" DEFAULT '32',
      "block_name" varchar
    );

    CREATE TABLE "_events_v_blocks_spacer" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "size" "enum__events_v_blocks_spacer_size" DEFAULT '32',
      "_uuid" varchar,
      "block_name" varchar
    );

    CREATE TABLE "event_cycles_blocks_spacer" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "size" "enum_event_cycles_blocks_spacer_size" DEFAULT '32',
      "block_name" varchar
    );

    CREATE TABLE "_event_cycles_v_blocks_spacer" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "size" "enum__event_cycles_v_blocks_spacer_size" DEFAULT '32',
      "_uuid" varchar,
      "block_name" varchar
    );

    CREATE TABLE "partners_blocks_spacer" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "size" "enum_partners_blocks_spacer_size" DEFAULT '32',
      "block_name" varchar
    );

    CREATE TABLE "_partners_v_blocks_spacer" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "size" "enum__partners_v_blocks_spacer_size" DEFAULT '32',
      "_uuid" varchar,
      "block_name" varchar
    );

    CREATE TABLE "homepage_sections_blocks_spacer" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "size" "enum_homepage_sections_blocks_spacer_size" DEFAULT '32',
      "block_name" varchar
    );

    CREATE TABLE "_homepage_sections_v_blocks_spacer" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "size" "enum__homepage_sections_v_blocks_spacer_size" DEFAULT '32',
      "_uuid" varchar,
      "block_name" varchar
    );

    ALTER TABLE "page_templates_blocks_spacer" ADD CONSTRAINT "page_templates_blocks_spacer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_page_templates_v_blocks_spacer" ADD CONSTRAINT "_page_templates_v_blocks_spacer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_templates_v"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "pages_blocks_spacer" ADD CONSTRAINT "pages_blocks_spacer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_spacer" ADD CONSTRAINT "_pages_v_blocks_spacer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "posts_blocks_spacer" ADD CONSTRAINT "posts_blocks_spacer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_posts_v_blocks_spacer" ADD CONSTRAINT "_posts_v_blocks_spacer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "events_blocks_spacer" ADD CONSTRAINT "events_blocks_spacer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_events_v_blocks_spacer" ADD CONSTRAINT "_events_v_blocks_spacer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "event_cycles_blocks_spacer" ADD CONSTRAINT "event_cycles_blocks_spacer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_cycles"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_event_cycles_v_blocks_spacer" ADD CONSTRAINT "_event_cycles_v_blocks_spacer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_event_cycles_v"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "partners_blocks_spacer" ADD CONSTRAINT "partners_blocks_spacer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_partners_v_blocks_spacer" ADD CONSTRAINT "_partners_v_blocks_spacer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partners_v"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "homepage_sections_blocks_spacer" ADD CONSTRAINT "homepage_sections_blocks_spacer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_homepage_sections_v_blocks_spacer" ADD CONSTRAINT "_homepage_sections_v_blocks_spacer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_sections_v"("id") ON DELETE cascade ON UPDATE no action;
    CREATE INDEX "page_templates_blocks_spacer_order_idx" ON "page_templates_blocks_spacer" USING btree ("_order");
    CREATE INDEX "page_templates_blocks_spacer_parent_id_idx" ON "page_templates_blocks_spacer" USING btree ("_parent_id");
    CREATE INDEX "page_templates_blocks_spacer_path_idx" ON "page_templates_blocks_spacer" USING btree ("_path");
    CREATE INDEX "_page_templates_v_blocks_spacer_order_idx" ON "_page_templates_v_blocks_spacer" USING btree ("_order");
    CREATE INDEX "_page_templates_v_blocks_spacer_parent_id_idx" ON "_page_templates_v_blocks_spacer" USING btree ("_parent_id");
    CREATE INDEX "_page_templates_v_blocks_spacer_path_idx" ON "_page_templates_v_blocks_spacer" USING btree ("_path");
    CREATE INDEX "pages_blocks_spacer_order_idx" ON "pages_blocks_spacer" USING btree ("_order");
    CREATE INDEX "pages_blocks_spacer_parent_id_idx" ON "pages_blocks_spacer" USING btree ("_parent_id");
    CREATE INDEX "pages_blocks_spacer_path_idx" ON "pages_blocks_spacer" USING btree ("_path");
    CREATE INDEX "_pages_v_blocks_spacer_order_idx" ON "_pages_v_blocks_spacer" USING btree ("_order");
    CREATE INDEX "_pages_v_blocks_spacer_parent_id_idx" ON "_pages_v_blocks_spacer" USING btree ("_parent_id");
    CREATE INDEX "_pages_v_blocks_spacer_path_idx" ON "_pages_v_blocks_spacer" USING btree ("_path");
    CREATE INDEX "posts_blocks_spacer_order_idx" ON "posts_blocks_spacer" USING btree ("_order");
    CREATE INDEX "posts_blocks_spacer_parent_id_idx" ON "posts_blocks_spacer" USING btree ("_parent_id");
    CREATE INDEX "posts_blocks_spacer_path_idx" ON "posts_blocks_spacer" USING btree ("_path");
    CREATE INDEX "_posts_v_blocks_spacer_order_idx" ON "_posts_v_blocks_spacer" USING btree ("_order");
    CREATE INDEX "_posts_v_blocks_spacer_parent_id_idx" ON "_posts_v_blocks_spacer" USING btree ("_parent_id");
    CREATE INDEX "_posts_v_blocks_spacer_path_idx" ON "_posts_v_blocks_spacer" USING btree ("_path");
    CREATE INDEX "events_blocks_spacer_order_idx" ON "events_blocks_spacer" USING btree ("_order");
    CREATE INDEX "events_blocks_spacer_parent_id_idx" ON "events_blocks_spacer" USING btree ("_parent_id");
    CREATE INDEX "events_blocks_spacer_path_idx" ON "events_blocks_spacer" USING btree ("_path");
    CREATE INDEX "_events_v_blocks_spacer_order_idx" ON "_events_v_blocks_spacer" USING btree ("_order");
    CREATE INDEX "_events_v_blocks_spacer_parent_id_idx" ON "_events_v_blocks_spacer" USING btree ("_parent_id");
    CREATE INDEX "_events_v_blocks_spacer_path_idx" ON "_events_v_blocks_spacer" USING btree ("_path");
    CREATE INDEX "event_cycles_blocks_spacer_order_idx" ON "event_cycles_blocks_spacer" USING btree ("_order");
    CREATE INDEX "event_cycles_blocks_spacer_parent_id_idx" ON "event_cycles_blocks_spacer" USING btree ("_parent_id");
    CREATE INDEX "event_cycles_blocks_spacer_path_idx" ON "event_cycles_blocks_spacer" USING btree ("_path");
    CREATE INDEX "_event_cycles_v_blocks_spacer_order_idx" ON "_event_cycles_v_blocks_spacer" USING btree ("_order");
    CREATE INDEX "_event_cycles_v_blocks_spacer_parent_id_idx" ON "_event_cycles_v_blocks_spacer" USING btree ("_parent_id");
    CREATE INDEX "_event_cycles_v_blocks_spacer_path_idx" ON "_event_cycles_v_blocks_spacer" USING btree ("_path");
    CREATE INDEX "partners_blocks_spacer_order_idx" ON "partners_blocks_spacer" USING btree ("_order");
    CREATE INDEX "partners_blocks_spacer_parent_id_idx" ON "partners_blocks_spacer" USING btree ("_parent_id");
    CREATE INDEX "partners_blocks_spacer_path_idx" ON "partners_blocks_spacer" USING btree ("_path");
    CREATE INDEX "_partners_v_blocks_spacer_order_idx" ON "_partners_v_blocks_spacer" USING btree ("_order");
    CREATE INDEX "_partners_v_blocks_spacer_parent_id_idx" ON "_partners_v_blocks_spacer" USING btree ("_parent_id");
    CREATE INDEX "_partners_v_blocks_spacer_path_idx" ON "_partners_v_blocks_spacer" USING btree ("_path");
    CREATE INDEX "homepage_sections_blocks_spacer_order_idx" ON "homepage_sections_blocks_spacer" USING btree ("_order");
    CREATE INDEX "homepage_sections_blocks_spacer_parent_id_idx" ON "homepage_sections_blocks_spacer" USING btree ("_parent_id");
    CREATE INDEX "homepage_sections_blocks_spacer_path_idx" ON "homepage_sections_blocks_spacer" USING btree ("_path");
    CREATE INDEX "_homepage_sections_v_blocks_spacer_order_idx" ON "_homepage_sections_v_blocks_spacer" USING btree ("_order");
    CREATE INDEX "_homepage_sections_v_blocks_spacer_parent_id_idx" ON "_homepage_sections_v_blocks_spacer" USING btree ("_parent_id");
    CREATE INDEX "_homepage_sections_v_blocks_spacer_path_idx" ON "_homepage_sections_v_blocks_spacer" USING btree ("_path");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE "page_templates_blocks_spacer" CASCADE;
    DROP TABLE "_page_templates_v_blocks_spacer" CASCADE;
    DROP TABLE "pages_blocks_spacer" CASCADE;
    DROP TABLE "_pages_v_blocks_spacer" CASCADE;
    DROP TABLE "posts_blocks_spacer" CASCADE;
    DROP TABLE "_posts_v_blocks_spacer" CASCADE;
    DROP TABLE "events_blocks_spacer" CASCADE;
    DROP TABLE "_events_v_blocks_spacer" CASCADE;
    DROP TABLE "event_cycles_blocks_spacer" CASCADE;
    DROP TABLE "_event_cycles_v_blocks_spacer" CASCADE;
    DROP TABLE "partners_blocks_spacer" CASCADE;
    DROP TABLE "_partners_v_blocks_spacer" CASCADE;
    DROP TABLE "homepage_sections_blocks_spacer" CASCADE;
    DROP TABLE "_homepage_sections_v_blocks_spacer" CASCADE;
    DROP TYPE "public"."enum_page_templates_blocks_spacer_size";
    DROP TYPE "public"."enum__page_templates_v_blocks_spacer_size";
    DROP TYPE "public"."enum_pages_blocks_spacer_size";
    DROP TYPE "public"."enum__pages_v_blocks_spacer_size";
    DROP TYPE "public"."enum_posts_blocks_spacer_size";
    DROP TYPE "public"."enum__posts_v_blocks_spacer_size";
    DROP TYPE "public"."enum_events_blocks_spacer_size";
    DROP TYPE "public"."enum__events_v_blocks_spacer_size";
    DROP TYPE "public"."enum_event_cycles_blocks_spacer_size";
    DROP TYPE "public"."enum__event_cycles_v_blocks_spacer_size";
    DROP TYPE "public"."enum_partners_blocks_spacer_size";
    DROP TYPE "public"."enum__partners_v_blocks_spacer_size";
    DROP TYPE "public"."enum_homepage_sections_blocks_spacer_size";
    DROP TYPE "public"."enum__homepage_sections_v_blocks_spacer_size";
  `)
}
