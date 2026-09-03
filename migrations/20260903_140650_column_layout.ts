import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_column_layout_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"width" numeric DEFAULT 2
  );
  
  CREATE TABLE "pages_blocks_column_layout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_column_layout_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"width" numeric DEFAULT 2,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_column_layout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_column_layout_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"width" numeric DEFAULT 2
  );
  
  CREATE TABLE "posts_blocks_column_layout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_column_layout_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"width" numeric DEFAULT 2,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_column_layout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "events_blocks_column_layout_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"width" numeric DEFAULT 2
  );
  
  CREATE TABLE "events_blocks_column_layout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "_events_v_blocks_column_layout_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"width" numeric DEFAULT 2,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_events_v_blocks_column_layout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "event_cycles_blocks_column_layout_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"width" numeric DEFAULT 2
  );
  
  CREATE TABLE "event_cycles_blocks_column_layout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "_event_cycles_v_blocks_column_layout_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"width" numeric DEFAULT 2,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_event_cycles_v_blocks_column_layout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "partners_blocks_column_layout_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"width" numeric DEFAULT 2
  );
  
  CREATE TABLE "partners_blocks_column_layout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "_partners_v_blocks_column_layout_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"width" numeric DEFAULT 2,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_partners_v_blocks_column_layout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_column_layout_columns" ADD CONSTRAINT "pages_blocks_column_layout_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_column_layout"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_column_layout" ADD CONSTRAINT "pages_blocks_column_layout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_column_layout_columns" ADD CONSTRAINT "_pages_v_blocks_column_layout_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_column_layout"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_column_layout" ADD CONSTRAINT "_pages_v_blocks_column_layout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_column_layout_columns" ADD CONSTRAINT "posts_blocks_column_layout_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_column_layout"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_column_layout" ADD CONSTRAINT "posts_blocks_column_layout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_column_layout_columns" ADD CONSTRAINT "_posts_v_blocks_column_layout_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_column_layout"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_column_layout" ADD CONSTRAINT "_posts_v_blocks_column_layout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_blocks_column_layout_columns" ADD CONSTRAINT "events_blocks_column_layout_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events_blocks_column_layout"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_blocks_column_layout" ADD CONSTRAINT "events_blocks_column_layout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_column_layout_columns" ADD CONSTRAINT "_events_v_blocks_column_layout_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v_blocks_column_layout"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_column_layout" ADD CONSTRAINT "_events_v_blocks_column_layout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_column_layout_columns" ADD CONSTRAINT "event_cycles_blocks_column_layout_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_cycles_blocks_column_layout"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_column_layout" ADD CONSTRAINT "event_cycles_blocks_column_layout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_cycles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_column_layout_columns" ADD CONSTRAINT "_event_cycles_v_blocks_column_layout_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_event_cycles_v_blocks_column_layout"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_column_layout" ADD CONSTRAINT "_event_cycles_v_blocks_column_layout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_event_cycles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_blocks_column_layout_columns" ADD CONSTRAINT "partners_blocks_column_layout_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners_blocks_column_layout"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_blocks_column_layout" ADD CONSTRAINT "partners_blocks_column_layout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_column_layout_columns" ADD CONSTRAINT "_partners_v_blocks_column_layout_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partners_v_blocks_column_layout"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_column_layout" ADD CONSTRAINT "_partners_v_blocks_column_layout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partners_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_column_layout_columns_order_idx" ON "pages_blocks_column_layout_columns" USING btree ("_order");
  CREATE INDEX "pages_blocks_column_layout_columns_parent_id_idx" ON "pages_blocks_column_layout_columns" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_column_layout_order_idx" ON "pages_blocks_column_layout" USING btree ("_order");
  CREATE INDEX "pages_blocks_column_layout_parent_id_idx" ON "pages_blocks_column_layout" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_column_layout_path_idx" ON "pages_blocks_column_layout" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_column_layout_columns_order_idx" ON "_pages_v_blocks_column_layout_columns" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_column_layout_columns_parent_id_idx" ON "_pages_v_blocks_column_layout_columns" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_column_layout_order_idx" ON "_pages_v_blocks_column_layout" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_column_layout_parent_id_idx" ON "_pages_v_blocks_column_layout" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_column_layout_path_idx" ON "_pages_v_blocks_column_layout" USING btree ("_path");
  CREATE INDEX "posts_blocks_column_layout_columns_order_idx" ON "posts_blocks_column_layout_columns" USING btree ("_order");
  CREATE INDEX "posts_blocks_column_layout_columns_parent_id_idx" ON "posts_blocks_column_layout_columns" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_column_layout_order_idx" ON "posts_blocks_column_layout" USING btree ("_order");
  CREATE INDEX "posts_blocks_column_layout_parent_id_idx" ON "posts_blocks_column_layout" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_column_layout_path_idx" ON "posts_blocks_column_layout" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_column_layout_columns_order_idx" ON "_posts_v_blocks_column_layout_columns" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_column_layout_columns_parent_id_idx" ON "_posts_v_blocks_column_layout_columns" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_column_layout_order_idx" ON "_posts_v_blocks_column_layout" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_column_layout_parent_id_idx" ON "_posts_v_blocks_column_layout" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_column_layout_path_idx" ON "_posts_v_blocks_column_layout" USING btree ("_path");
  CREATE INDEX "events_blocks_column_layout_columns_order_idx" ON "events_blocks_column_layout_columns" USING btree ("_order");
  CREATE INDEX "events_blocks_column_layout_columns_parent_id_idx" ON "events_blocks_column_layout_columns" USING btree ("_parent_id");
  CREATE INDEX "events_blocks_column_layout_order_idx" ON "events_blocks_column_layout" USING btree ("_order");
  CREATE INDEX "events_blocks_column_layout_parent_id_idx" ON "events_blocks_column_layout" USING btree ("_parent_id");
  CREATE INDEX "events_blocks_column_layout_path_idx" ON "events_blocks_column_layout" USING btree ("_path");
  CREATE INDEX "_events_v_blocks_column_layout_columns_order_idx" ON "_events_v_blocks_column_layout_columns" USING btree ("_order");
  CREATE INDEX "_events_v_blocks_column_layout_columns_parent_id_idx" ON "_events_v_blocks_column_layout_columns" USING btree ("_parent_id");
  CREATE INDEX "_events_v_blocks_column_layout_order_idx" ON "_events_v_blocks_column_layout" USING btree ("_order");
  CREATE INDEX "_events_v_blocks_column_layout_parent_id_idx" ON "_events_v_blocks_column_layout" USING btree ("_parent_id");
  CREATE INDEX "_events_v_blocks_column_layout_path_idx" ON "_events_v_blocks_column_layout" USING btree ("_path");
  CREATE INDEX "event_cycles_blocks_column_layout_columns_order_idx" ON "event_cycles_blocks_column_layout_columns" USING btree ("_order");
  CREATE INDEX "event_cycles_blocks_column_layout_columns_parent_id_idx" ON "event_cycles_blocks_column_layout_columns" USING btree ("_parent_id");
  CREATE INDEX "event_cycles_blocks_column_layout_order_idx" ON "event_cycles_blocks_column_layout" USING btree ("_order");
  CREATE INDEX "event_cycles_blocks_column_layout_parent_id_idx" ON "event_cycles_blocks_column_layout" USING btree ("_parent_id");
  CREATE INDEX "event_cycles_blocks_column_layout_path_idx" ON "event_cycles_blocks_column_layout" USING btree ("_path");
  CREATE INDEX "_event_cycles_v_blocks_column_layout_columns_order_idx" ON "_event_cycles_v_blocks_column_layout_columns" USING btree ("_order");
  CREATE INDEX "_event_cycles_v_blocks_column_layout_columns_parent_id_idx" ON "_event_cycles_v_blocks_column_layout_columns" USING btree ("_parent_id");
  CREATE INDEX "_event_cycles_v_blocks_column_layout_order_idx" ON "_event_cycles_v_blocks_column_layout" USING btree ("_order");
  CREATE INDEX "_event_cycles_v_blocks_column_layout_parent_id_idx" ON "_event_cycles_v_blocks_column_layout" USING btree ("_parent_id");
  CREATE INDEX "_event_cycles_v_blocks_column_layout_path_idx" ON "_event_cycles_v_blocks_column_layout" USING btree ("_path");
  CREATE INDEX "partners_blocks_column_layout_columns_order_idx" ON "partners_blocks_column_layout_columns" USING btree ("_order");
  CREATE INDEX "partners_blocks_column_layout_columns_parent_id_idx" ON "partners_blocks_column_layout_columns" USING btree ("_parent_id");
  CREATE INDEX "partners_blocks_column_layout_order_idx" ON "partners_blocks_column_layout" USING btree ("_order");
  CREATE INDEX "partners_blocks_column_layout_parent_id_idx" ON "partners_blocks_column_layout" USING btree ("_parent_id");
  CREATE INDEX "partners_blocks_column_layout_path_idx" ON "partners_blocks_column_layout" USING btree ("_path");
  CREATE INDEX "_partners_v_blocks_column_layout_columns_order_idx" ON "_partners_v_blocks_column_layout_columns" USING btree ("_order");
  CREATE INDEX "_partners_v_blocks_column_layout_columns_parent_id_idx" ON "_partners_v_blocks_column_layout_columns" USING btree ("_parent_id");
  CREATE INDEX "_partners_v_blocks_column_layout_order_idx" ON "_partners_v_blocks_column_layout" USING btree ("_order");
  CREATE INDEX "_partners_v_blocks_column_layout_parent_id_idx" ON "_partners_v_blocks_column_layout" USING btree ("_parent_id");
  CREATE INDEX "_partners_v_blocks_column_layout_path_idx" ON "_partners_v_blocks_column_layout" USING btree ("_path");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_column_layout_columns" CASCADE;
  DROP TABLE "pages_blocks_column_layout" CASCADE;
  DROP TABLE "_pages_v_blocks_column_layout_columns" CASCADE;
  DROP TABLE "_pages_v_blocks_column_layout" CASCADE;
  DROP TABLE "posts_blocks_column_layout_columns" CASCADE;
  DROP TABLE "posts_blocks_column_layout" CASCADE;
  DROP TABLE "_posts_v_blocks_column_layout_columns" CASCADE;
  DROP TABLE "_posts_v_blocks_column_layout" CASCADE;
  DROP TABLE "events_blocks_column_layout_columns" CASCADE;
  DROP TABLE "events_blocks_column_layout" CASCADE;
  DROP TABLE "_events_v_blocks_column_layout_columns" CASCADE;
  DROP TABLE "_events_v_blocks_column_layout" CASCADE;
  DROP TABLE "event_cycles_blocks_column_layout_columns" CASCADE;
  DROP TABLE "event_cycles_blocks_column_layout" CASCADE;
  DROP TABLE "_event_cycles_v_blocks_column_layout_columns" CASCADE;
  DROP TABLE "_event_cycles_v_blocks_column_layout" CASCADE;
  DROP TABLE "partners_blocks_column_layout_columns" CASCADE;
  DROP TABLE "partners_blocks_column_layout" CASCADE;
  DROP TABLE "_partners_v_blocks_column_layout_columns" CASCADE;
  DROP TABLE "_partners_v_blocks_column_layout" CASCADE;`)
}
