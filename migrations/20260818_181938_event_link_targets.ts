import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."target" AS ENUM('page', 'category', 'tag', 'event', 'eventCycle', 'partner', 'custom');
  CREATE TYPE "public"."scheme" AS ENUM('https', 'http', 'mailto', 'tel', 'path', 'anchor');
  ALTER TABLE "events_external_links" ADD COLUMN "target_type" "target" DEFAULT 'custom';
  ALTER TABLE "events_external_links" ADD COLUMN "event_id" integer;
  ALTER TABLE "events_external_links" ADD COLUMN "event_cycle_id" integer;
  ALTER TABLE "events_external_links" ADD COLUMN "partner_id" integer;
  ALTER TABLE "events_external_links" ADD COLUMN "page_id" integer;
  ALTER TABLE "events_external_links" ADD COLUMN "category_id" integer;
  ALTER TABLE "events_external_links" ADD COLUMN "tag_id" integer;
  ALTER TABLE "events_external_links" ADD COLUMN "custom_scheme" "scheme" DEFAULT 'https';
  ALTER TABLE "events_external_links" ADD COLUMN "custom_address" varchar;
  ALTER TABLE "events_external_links" ADD COLUMN "open_in_new_tab" boolean DEFAULT false;
  UPDATE "events_external_links" SET "custom_address" = regexp_replace("url", '^https://', '') WHERE "url" IS NOT NULL;
  ALTER TABLE "_events_v_version_external_links" ADD COLUMN "target_type" "target" DEFAULT 'custom';
  ALTER TABLE "_events_v_version_external_links" ADD COLUMN "event_id" integer;
  ALTER TABLE "_events_v_version_external_links" ADD COLUMN "event_cycle_id" integer;
  ALTER TABLE "_events_v_version_external_links" ADD COLUMN "partner_id" integer;
  ALTER TABLE "_events_v_version_external_links" ADD COLUMN "page_id" integer;
  ALTER TABLE "_events_v_version_external_links" ADD COLUMN "category_id" integer;
  ALTER TABLE "_events_v_version_external_links" ADD COLUMN "tag_id" integer;
  ALTER TABLE "_events_v_version_external_links" ADD COLUMN "custom_scheme" "scheme" DEFAULT 'https';
  ALTER TABLE "_events_v_version_external_links" ADD COLUMN "custom_address" varchar;
  ALTER TABLE "_events_v_version_external_links" ADD COLUMN "open_in_new_tab" boolean DEFAULT false;
  UPDATE "_events_v_version_external_links" SET "custom_address" = regexp_replace("url", '^https://', '') WHERE "url" IS NOT NULL;
  ALTER TABLE "event_cycles_event_defaults_external_links" ADD COLUMN "target_type" "target" DEFAULT 'custom';
  ALTER TABLE "event_cycles_event_defaults_external_links" ADD COLUMN "event_id" integer;
  ALTER TABLE "event_cycles_event_defaults_external_links" ADD COLUMN "event_cycle_id" integer;
  ALTER TABLE "event_cycles_event_defaults_external_links" ADD COLUMN "partner_id" integer;
  ALTER TABLE "event_cycles_event_defaults_external_links" ADD COLUMN "page_id" integer;
  ALTER TABLE "event_cycles_event_defaults_external_links" ADD COLUMN "category_id" integer;
  ALTER TABLE "event_cycles_event_defaults_external_links" ADD COLUMN "tag_id" integer;
  ALTER TABLE "event_cycles_event_defaults_external_links" ADD COLUMN "custom_scheme" "scheme" DEFAULT 'https';
  ALTER TABLE "event_cycles_event_defaults_external_links" ADD COLUMN "custom_address" varchar;
  ALTER TABLE "event_cycles_event_defaults_external_links" ADD COLUMN "open_in_new_tab" boolean DEFAULT false;
  UPDATE "event_cycles_event_defaults_external_links" SET "custom_address" = regexp_replace("url", '^https://', '') WHERE "url" IS NOT NULL;
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" ADD COLUMN "target_type" "target" DEFAULT 'custom';
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" ADD COLUMN "event_id" integer;
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" ADD COLUMN "event_cycle_id" integer;
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" ADD COLUMN "partner_id" integer;
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" ADD COLUMN "page_id" integer;
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" ADD COLUMN "category_id" integer;
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" ADD COLUMN "tag_id" integer;
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" ADD COLUMN "custom_scheme" "scheme" DEFAULT 'https';
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" ADD COLUMN "custom_address" varchar;
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" ADD COLUMN "open_in_new_tab" boolean DEFAULT false;
  UPDATE "_event_cycles_v_version_event_defaults_external_links" SET "custom_address" = regexp_replace("url", '^https://', '') WHERE "url" IS NOT NULL;
  ALTER TABLE "events_external_links" ADD CONSTRAINT "events_external_links_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_external_links" ADD CONSTRAINT "events_external_links_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_external_links" ADD CONSTRAINT "events_external_links_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_external_links" ADD CONSTRAINT "events_external_links_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_external_links" ADD CONSTRAINT "events_external_links_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_external_links" ADD CONSTRAINT "events_external_links_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_version_external_links" ADD CONSTRAINT "_events_v_version_external_links_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_version_external_links" ADD CONSTRAINT "_events_v_version_external_links_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_version_external_links" ADD CONSTRAINT "_events_v_version_external_links_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_version_external_links" ADD CONSTRAINT "_events_v_version_external_links_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_version_external_links" ADD CONSTRAINT "_events_v_version_external_links_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_version_external_links" ADD CONSTRAINT "_events_v_version_external_links_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_event_defaults_external_links" ADD CONSTRAINT "event_cycles_event_defaults_external_links_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_event_defaults_external_links" ADD CONSTRAINT "event_cycles_event_defaults_external_links_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_event_defaults_external_links" ADD CONSTRAINT "event_cycles_event_defaults_external_links_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_event_defaults_external_links" ADD CONSTRAINT "event_cycles_event_defaults_external_links_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_event_defaults_external_links" ADD CONSTRAINT "event_cycles_event_defaults_external_links_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_event_defaults_external_links" ADD CONSTRAINT "event_cycles_event_defaults_external_links_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" ADD CONSTRAINT "_event_cycles_v_version_event_defaults_external_links_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" ADD CONSTRAINT "_event_cycles_v_version_event_defaults_external_links_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" ADD CONSTRAINT "_event_cycles_v_version_event_defaults_external_links_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" ADD CONSTRAINT "_event_cycles_v_version_event_defaults_external_links_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" ADD CONSTRAINT "_event_cycles_v_version_event_defaults_external_links_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" ADD CONSTRAINT "_event_cycles_v_version_event_defaults_external_links_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "events_external_links_event_idx" ON "events_external_links" USING btree ("event_id");
  CREATE INDEX "events_external_links_event_cycle_idx" ON "events_external_links" USING btree ("event_cycle_id");
  CREATE INDEX "events_external_links_partner_idx" ON "events_external_links" USING btree ("partner_id");
  CREATE INDEX "events_external_links_page_idx" ON "events_external_links" USING btree ("page_id");
  CREATE INDEX "events_external_links_category_idx" ON "events_external_links" USING btree ("category_id");
  CREATE INDEX "events_external_links_tag_idx" ON "events_external_links" USING btree ("tag_id");
  CREATE INDEX "_events_v_version_external_links_event_idx" ON "_events_v_version_external_links" USING btree ("event_id");
  CREATE INDEX "_events_v_version_external_links_event_cycle_idx" ON "_events_v_version_external_links" USING btree ("event_cycle_id");
  CREATE INDEX "_events_v_version_external_links_partner_idx" ON "_events_v_version_external_links" USING btree ("partner_id");
  CREATE INDEX "_events_v_version_external_links_page_idx" ON "_events_v_version_external_links" USING btree ("page_id");
  CREATE INDEX "_events_v_version_external_links_category_idx" ON "_events_v_version_external_links" USING btree ("category_id");
  CREATE INDEX "_events_v_version_external_links_tag_idx" ON "_events_v_version_external_links" USING btree ("tag_id");
  CREATE INDEX "event_cycles_event_defaults_external_links_event_idx" ON "event_cycles_event_defaults_external_links" USING btree ("event_id");
  CREATE INDEX "event_cycles_event_defaults_external_links_event_cycle_idx" ON "event_cycles_event_defaults_external_links" USING btree ("event_cycle_id");
  CREATE INDEX "event_cycles_event_defaults_external_links_partner_idx" ON "event_cycles_event_defaults_external_links" USING btree ("partner_id");
  CREATE INDEX "event_cycles_event_defaults_external_links_page_idx" ON "event_cycles_event_defaults_external_links" USING btree ("page_id");
  CREATE INDEX "event_cycles_event_defaults_external_links_category_idx" ON "event_cycles_event_defaults_external_links" USING btree ("category_id");
  CREATE INDEX "event_cycles_event_defaults_external_links_tag_idx" ON "event_cycles_event_defaults_external_links" USING btree ("tag_id");
  CREATE INDEX "_event_cycles_v_version_event_defaults_external_links_ev_idx" ON "_event_cycles_v_version_event_defaults_external_links" USING btree ("event_id");
  CREATE INDEX "_event_cycles_v_version_event_defaults_external_links__1_idx" ON "_event_cycles_v_version_event_defaults_external_links" USING btree ("event_cycle_id");
  CREATE INDEX "_event_cycles_v_version_event_defaults_external_links_pa_idx" ON "_event_cycles_v_version_event_defaults_external_links" USING btree ("partner_id");
  CREATE INDEX "_event_cycles_v_version_event_defaults_external_links__2_idx" ON "_event_cycles_v_version_event_defaults_external_links" USING btree ("page_id");
  CREATE INDEX "_event_cycles_v_version_event_defaults_external_links_ca_idx" ON "_event_cycles_v_version_event_defaults_external_links" USING btree ("category_id");
  CREATE INDEX "_event_cycles_v_version_event_defaults_external_links_ta_idx" ON "_event_cycles_v_version_event_defaults_external_links" USING btree ("tag_id");
  ALTER TABLE "events_external_links" DROP COLUMN "type";
  ALTER TABLE "events_external_links" DROP COLUMN "url";
  ALTER TABLE "_events_v_version_external_links" DROP COLUMN "type";
  ALTER TABLE "_events_v_version_external_links" DROP COLUMN "url";
  ALTER TABLE "event_cycles_event_defaults_external_links" DROP COLUMN "type";
  ALTER TABLE "event_cycles_event_defaults_external_links" DROP COLUMN "url";
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" DROP COLUMN "type";
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" DROP COLUMN "url";
  DROP TYPE "public"."enum_events_external_links_type";
  DROP TYPE "public"."enum__events_v_version_external_links_type";
  DROP TYPE "public"."enum_event_cycles_event_defaults_external_links_type";
  DROP TYPE "public"."enum__event_cycles_v_version_event_defaults_external_links_type";`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_events_external_links_type" AS ENUM('eventPage', 'facebook', 'instagram', 'other');
  CREATE TYPE "public"."enum__events_v_version_external_links_type" AS ENUM('eventPage', 'facebook', 'instagram', 'other');
  CREATE TYPE "public"."enum_event_cycles_event_defaults_external_links_type" AS ENUM('eventPage', 'facebook', 'instagram', 'other');
  CREATE TYPE "public"."enum__event_cycles_v_version_event_defaults_external_links_type" AS ENUM('eventPage', 'facebook', 'instagram', 'other');
  ALTER TABLE "events_external_links" DROP CONSTRAINT "events_external_links_event_id_events_id_fk";
  
  ALTER TABLE "events_external_links" DROP CONSTRAINT "events_external_links_event_cycle_id_event_cycles_id_fk";
  
  ALTER TABLE "events_external_links" DROP CONSTRAINT "events_external_links_partner_id_partners_id_fk";
  
  ALTER TABLE "events_external_links" DROP CONSTRAINT "events_external_links_page_id_pages_id_fk";
  
  ALTER TABLE "events_external_links" DROP CONSTRAINT "events_external_links_category_id_categories_id_fk";
  
  ALTER TABLE "events_external_links" DROP CONSTRAINT "events_external_links_tag_id_tags_id_fk";
  
  ALTER TABLE "_events_v_version_external_links" DROP CONSTRAINT "_events_v_version_external_links_event_id_events_id_fk";
  
  ALTER TABLE "_events_v_version_external_links" DROP CONSTRAINT "_events_v_version_external_links_event_cycle_id_event_cycles_id_fk";
  
  ALTER TABLE "_events_v_version_external_links" DROP CONSTRAINT "_events_v_version_external_links_partner_id_partners_id_fk";
  
  ALTER TABLE "_events_v_version_external_links" DROP CONSTRAINT "_events_v_version_external_links_page_id_pages_id_fk";
  
  ALTER TABLE "_events_v_version_external_links" DROP CONSTRAINT "_events_v_version_external_links_category_id_categories_id_fk";
  
  ALTER TABLE "_events_v_version_external_links" DROP CONSTRAINT "_events_v_version_external_links_tag_id_tags_id_fk";
  
  ALTER TABLE "event_cycles_event_defaults_external_links" DROP CONSTRAINT "event_cycles_event_defaults_external_links_event_id_events_id_fk";
  
  ALTER TABLE "event_cycles_event_defaults_external_links" DROP CONSTRAINT "event_cycles_event_defaults_external_links_event_cycle_id_event_cycles_id_fk";
  
  ALTER TABLE "event_cycles_event_defaults_external_links" DROP CONSTRAINT "event_cycles_event_defaults_external_links_partner_id_partners_id_fk";
  
  ALTER TABLE "event_cycles_event_defaults_external_links" DROP CONSTRAINT "event_cycles_event_defaults_external_links_page_id_pages_id_fk";
  
  ALTER TABLE "event_cycles_event_defaults_external_links" DROP CONSTRAINT "event_cycles_event_defaults_external_links_category_id_categories_id_fk";
  
  ALTER TABLE "event_cycles_event_defaults_external_links" DROP CONSTRAINT "event_cycles_event_defaults_external_links_tag_id_tags_id_fk";
  
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" DROP CONSTRAINT "_event_cycles_v_version_event_defaults_external_links_event_id_events_id_fk";
  
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" DROP CONSTRAINT "_event_cycles_v_version_event_defaults_external_links_event_cycle_id_event_cycles_id_fk";
  
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" DROP CONSTRAINT "_event_cycles_v_version_event_defaults_external_links_partner_id_partners_id_fk";
  
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" DROP CONSTRAINT "_event_cycles_v_version_event_defaults_external_links_page_id_pages_id_fk";
  
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" DROP CONSTRAINT "_event_cycles_v_version_event_defaults_external_links_category_id_categories_id_fk";
  
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" DROP CONSTRAINT "_event_cycles_v_version_event_defaults_external_links_tag_id_tags_id_fk";
  
  DROP INDEX "events_external_links_event_idx";
  DROP INDEX "events_external_links_event_cycle_idx";
  DROP INDEX "events_external_links_partner_idx";
  DROP INDEX "events_external_links_page_idx";
  DROP INDEX "events_external_links_category_idx";
  DROP INDEX "events_external_links_tag_idx";
  DROP INDEX "_events_v_version_external_links_event_idx";
  DROP INDEX "_events_v_version_external_links_event_cycle_idx";
  DROP INDEX "_events_v_version_external_links_partner_idx";
  DROP INDEX "_events_v_version_external_links_page_idx";
  DROP INDEX "_events_v_version_external_links_category_idx";
  DROP INDEX "_events_v_version_external_links_tag_idx";
  DROP INDEX "event_cycles_event_defaults_external_links_event_idx";
  DROP INDEX "event_cycles_event_defaults_external_links_event_cycle_idx";
  DROP INDEX "event_cycles_event_defaults_external_links_partner_idx";
  DROP INDEX "event_cycles_event_defaults_external_links_page_idx";
  DROP INDEX "event_cycles_event_defaults_external_links_category_idx";
  DROP INDEX "event_cycles_event_defaults_external_links_tag_idx";
  DROP INDEX "_event_cycles_v_version_event_defaults_external_links_ev_idx";
  DROP INDEX "_event_cycles_v_version_event_defaults_external_links__1_idx";
  DROP INDEX "_event_cycles_v_version_event_defaults_external_links_pa_idx";
  DROP INDEX "_event_cycles_v_version_event_defaults_external_links__2_idx";
  DROP INDEX "_event_cycles_v_version_event_defaults_external_links_ca_idx";
  DROP INDEX "_event_cycles_v_version_event_defaults_external_links_ta_idx";
  ALTER TABLE "events_external_links" ADD COLUMN "type" "enum_events_external_links_type" DEFAULT 'other';
  ALTER TABLE "events_external_links" ADD COLUMN "url" varchar;
  ALTER TABLE "_events_v_version_external_links" ADD COLUMN "type" "enum__events_v_version_external_links_type" DEFAULT 'other';
  ALTER TABLE "_events_v_version_external_links" ADD COLUMN "url" varchar;
  ALTER TABLE "event_cycles_event_defaults_external_links" ADD COLUMN "type" "enum_event_cycles_event_defaults_external_links_type" DEFAULT 'other';
  ALTER TABLE "event_cycles_event_defaults_external_links" ADD COLUMN "url" varchar;
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" ADD COLUMN "type" "enum__event_cycles_v_version_event_defaults_external_links_type" DEFAULT 'other';
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" ADD COLUMN "url" varchar;
  UPDATE "events_external_links" SET "url" = CASE "custom_scheme"
    WHEN 'https' THEN 'https://' || "custom_address"
    WHEN 'http' THEN 'http://' || "custom_address"
    WHEN 'mailto' THEN 'mailto:' || "custom_address"
    WHEN 'tel' THEN 'tel:' || "custom_address"
    WHEN 'path' THEN '/' || ltrim("custom_address", '/')
    WHEN 'anchor' THEN '#' || ltrim("custom_address", '#')
  END WHERE "target_type" = 'custom' AND "custom_address" IS NOT NULL;
  UPDATE "_events_v_version_external_links" SET "url" = CASE "custom_scheme"
    WHEN 'https' THEN 'https://' || "custom_address"
    WHEN 'http' THEN 'http://' || "custom_address"
    WHEN 'mailto' THEN 'mailto:' || "custom_address"
    WHEN 'tel' THEN 'tel:' || "custom_address"
    WHEN 'path' THEN '/' || ltrim("custom_address", '/')
    WHEN 'anchor' THEN '#' || ltrim("custom_address", '#')
  END WHERE "target_type" = 'custom' AND "custom_address" IS NOT NULL;
  UPDATE "event_cycles_event_defaults_external_links" SET "url" = CASE "custom_scheme"
    WHEN 'https' THEN 'https://' || "custom_address"
    WHEN 'http' THEN 'http://' || "custom_address"
    WHEN 'mailto' THEN 'mailto:' || "custom_address"
    WHEN 'tel' THEN 'tel:' || "custom_address"
    WHEN 'path' THEN '/' || ltrim("custom_address", '/')
    WHEN 'anchor' THEN '#' || ltrim("custom_address", '#')
  END WHERE "target_type" = 'custom' AND "custom_address" IS NOT NULL;
  UPDATE "_event_cycles_v_version_event_defaults_external_links" SET "url" = CASE "custom_scheme"
    WHEN 'https' THEN 'https://' || "custom_address"
    WHEN 'http' THEN 'http://' || "custom_address"
    WHEN 'mailto' THEN 'mailto:' || "custom_address"
    WHEN 'tel' THEN 'tel:' || "custom_address"
    WHEN 'path' THEN '/' || ltrim("custom_address", '/')
    WHEN 'anchor' THEN '#' || ltrim("custom_address", '#')
  END WHERE "target_type" = 'custom' AND "custom_address" IS NOT NULL;
  ALTER TABLE "events_external_links" DROP COLUMN "target_type";
  ALTER TABLE "events_external_links" DROP COLUMN "event_id";
  ALTER TABLE "events_external_links" DROP COLUMN "event_cycle_id";
  ALTER TABLE "events_external_links" DROP COLUMN "partner_id";
  ALTER TABLE "events_external_links" DROP COLUMN "page_id";
  ALTER TABLE "events_external_links" DROP COLUMN "category_id";
  ALTER TABLE "events_external_links" DROP COLUMN "tag_id";
  ALTER TABLE "events_external_links" DROP COLUMN "custom_scheme";
  ALTER TABLE "events_external_links" DROP COLUMN "custom_address";
  ALTER TABLE "events_external_links" DROP COLUMN "open_in_new_tab";
  ALTER TABLE "_events_v_version_external_links" DROP COLUMN "target_type";
  ALTER TABLE "_events_v_version_external_links" DROP COLUMN "event_id";
  ALTER TABLE "_events_v_version_external_links" DROP COLUMN "event_cycle_id";
  ALTER TABLE "_events_v_version_external_links" DROP COLUMN "partner_id";
  ALTER TABLE "_events_v_version_external_links" DROP COLUMN "page_id";
  ALTER TABLE "_events_v_version_external_links" DROP COLUMN "category_id";
  ALTER TABLE "_events_v_version_external_links" DROP COLUMN "tag_id";
  ALTER TABLE "_events_v_version_external_links" DROP COLUMN "custom_scheme";
  ALTER TABLE "_events_v_version_external_links" DROP COLUMN "custom_address";
  ALTER TABLE "_events_v_version_external_links" DROP COLUMN "open_in_new_tab";
  ALTER TABLE "event_cycles_event_defaults_external_links" DROP COLUMN "target_type";
  ALTER TABLE "event_cycles_event_defaults_external_links" DROP COLUMN "event_id";
  ALTER TABLE "event_cycles_event_defaults_external_links" DROP COLUMN "event_cycle_id";
  ALTER TABLE "event_cycles_event_defaults_external_links" DROP COLUMN "partner_id";
  ALTER TABLE "event_cycles_event_defaults_external_links" DROP COLUMN "page_id";
  ALTER TABLE "event_cycles_event_defaults_external_links" DROP COLUMN "category_id";
  ALTER TABLE "event_cycles_event_defaults_external_links" DROP COLUMN "tag_id";
  ALTER TABLE "event_cycles_event_defaults_external_links" DROP COLUMN "custom_scheme";
  ALTER TABLE "event_cycles_event_defaults_external_links" DROP COLUMN "custom_address";
  ALTER TABLE "event_cycles_event_defaults_external_links" DROP COLUMN "open_in_new_tab";
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" DROP COLUMN "target_type";
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" DROP COLUMN "event_id";
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" DROP COLUMN "event_cycle_id";
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" DROP COLUMN "partner_id";
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" DROP COLUMN "page_id";
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" DROP COLUMN "category_id";
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" DROP COLUMN "tag_id";
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" DROP COLUMN "custom_scheme";
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" DROP COLUMN "custom_address";
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" DROP COLUMN "open_in_new_tab";
  DROP TYPE "public"."target";
  DROP TYPE "public"."scheme";`)
}
