import { sql, type MigrateUpArgs, type MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  DELETE FROM "roles_permissions" WHERE "resource" = 'club-sections';
  DELETE FROM "payload_locked_documents_rels" WHERE "club_sections_id" IS NOT NULL;
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "club_sections_id";

  DROP TABLE "club_sections_menu_items";
  DROP TABLE "_club_sections_v_version_menu_items";
  DROP TABLE "_club_sections_v";
  DROP TABLE "club_sections";

  ALTER TABLE "roles_permissions" ALTER COLUMN "resource" SET DATA TYPE text;
  DROP TYPE "public"."enum_roles_permissions_resource";
  CREATE TYPE "public"."enum_roles_permissions_resource" AS ENUM('users', 'media', 'member-profiles', 'member-profile-images', 'pages', 'posts', 'events', 'event-cycles', 'event-types', 'partners', 'documents', 'url-aliases', 'categories', 'tags', 'page-templates', 'navigation', 'site-settings', 'content-audit-log');
  ALTER TABLE "roles_permissions" ALTER COLUMN "resource" SET DATA TYPE "public"."enum_roles_permissions_resource" USING "resource"::"public"."enum_roles_permissions_resource";
  DROP TYPE "public"."enum_club_sections_menu_items_appearance";
  DROP TYPE "public"."enum_club_sections_menu_items_icon_name";
  DROP TYPE "public"."enum_club_sections_menu_items_target_type";
  DROP TYPE "public"."enum_club_sections_menu_items_custom_scheme";
  DROP TYPE "public"."enum_club_sections_status";
  DROP TYPE "public"."enum__club_sections_v_version_menu_items_appearance";
  DROP TYPE "public"."enum__club_sections_v_version_menu_items_icon_name";
  DROP TYPE "public"."enum__club_sections_v_version_menu_items_target_type";
  DROP TYPE "public"."enum__club_sections_v_version_menu_items_custom_scheme";
  DROP TYPE "public"."enum__club_sections_v_version_status";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_club_sections_menu_items_appearance" AS ENUM('link', 'primaryButton', 'secondaryButton');
  CREATE TYPE "public"."enum_club_sections_menu_items_icon_name" AS ENUM('camera', 'astronaut', 'ticket', 'bluesky', 'mace', 'bottle-mana', 'cthulhu', 'time', 'skull', 'dnd5', 'discord', 'document', 'pumpkin-halloween', 'mail', 'facebook', 'guitar', 'globe', 'board-game', 'star', 'instagram', 'calendar', 'hat', 'gun', 'cards', 'playing-cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'water-drop', 'crystal-ball', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'pirate-map', 'vendetta', 'messenger', 'sword', 'potion', 'music', 'image', 'announcement', 'eye', 'partner', 'pdf', 'seal', 'pawn', 'quill', 'flame', 'download', 'review', 'wand', 'sf', 'seance', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'superhero', 'stormtrooper', 'soundtrack', 'tag', 'shield', 'axe', 'twitch', 'shuttle', 'fighter', 'event', 'filled-star', 'youtube', 'scroll');
  CREATE TYPE "public"."enum_club_sections_menu_items_target_type" AS ENUM('eventCycle', 'document', 'category', 'partner', 'page', 'tag', 'custom', 'post', 'event');
  CREATE TYPE "public"."enum_club_sections_menu_items_custom_scheme" AS ENUM('https', 'http', 'mailto', 'tel', 'path', 'anchor');
  CREATE TYPE "public"."enum_club_sections_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__club_sections_v_version_menu_items_appearance" AS ENUM('link', 'primaryButton', 'secondaryButton');
  CREATE TYPE "public"."enum__club_sections_v_version_menu_items_icon_name" AS ENUM('camera', 'astronaut', 'ticket', 'bluesky', 'mace', 'bottle-mana', 'cthulhu', 'time', 'skull', 'dnd5', 'discord', 'document', 'pumpkin-halloween', 'mail', 'facebook', 'guitar', 'globe', 'board-game', 'star', 'instagram', 'calendar', 'hat', 'gun', 'cards', 'playing-cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'water-drop', 'crystal-ball', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'pirate-map', 'vendetta', 'messenger', 'sword', 'potion', 'music', 'image', 'announcement', 'eye', 'partner', 'pdf', 'seal', 'pawn', 'quill', 'flame', 'download', 'review', 'wand', 'sf', 'seance', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'superhero', 'stormtrooper', 'soundtrack', 'tag', 'shield', 'axe', 'twitch', 'shuttle', 'fighter', 'event', 'filled-star', 'youtube', 'scroll');
  CREATE TYPE "public"."enum__club_sections_v_version_menu_items_target_type" AS ENUM('eventCycle', 'document', 'category', 'partner', 'page', 'tag', 'custom', 'post', 'event');
  CREATE TYPE "public"."enum__club_sections_v_version_menu_items_custom_scheme" AS ENUM('https', 'http', 'mailto', 'tel', 'path', 'anchor');
  CREATE TYPE "public"."enum__club_sections_v_version_status" AS ENUM('draft', 'published');
  ALTER TYPE "public"."enum_roles_permissions_resource" ADD VALUE 'club-sections' BEFORE 'categories';
  CREATE TABLE "club_sections_menu_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "enum_club_sections_menu_items_appearance" DEFAULT 'link',
  	"icon_name" "enum_club_sections_menu_items_icon_name",
  	"target_type" "enum_club_sections_menu_items_target_type" DEFAULT 'custom',
  	"event_cycle_id" integer,
  	"document_id" integer,
  	"category_id" integer,
  	"partner_id" integer,
  	"page_id" integer,
  	"tag_id" integer,
  	"post_id" integer,
  	"event_id" integer,
  	"custom_scheme" "enum_club_sections_menu_items_custom_scheme" DEFAULT 'https',
  	"custom_address" varchar,
  	"open_in_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "club_sections" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"background_image_id" integer,
  	"destination_page_id" integer,
  	"slug" varchar,
  	"display_order" numeric DEFAULT 0,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"deleted_at" timestamp(3) with time zone,
  	"_status" "enum_club_sections_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_club_sections_v_version_menu_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "enum__club_sections_v_version_menu_items_appearance" DEFAULT 'link',
  	"icon_name" "enum__club_sections_v_version_menu_items_icon_name",
  	"target_type" "enum__club_sections_v_version_menu_items_target_type" DEFAULT 'custom',
  	"event_cycle_id" integer,
  	"document_id" integer,
  	"category_id" integer,
  	"partner_id" integer,
  	"page_id" integer,
  	"tag_id" integer,
  	"post_id" integer,
  	"event_id" integer,
  	"custom_scheme" "enum__club_sections_v_version_menu_items_custom_scheme" DEFAULT 'https',
  	"custom_address" varchar,
  	"open_in_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_club_sections_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_background_image_id" integer,
  	"version_destination_page_id" integer,
  	"version_slug" varchar,
  	"version_display_order" numeric DEFAULT 0,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_deleted_at" timestamp(3) with time zone,
  	"version__status" "enum__club_sections_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "club_sections_id" integer;
  ALTER TABLE "club_sections_menu_items" ADD CONSTRAINT "club_sections_menu_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "club_sections_menu_items" ADD CONSTRAINT "club_sections_menu_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "club_sections_menu_items" ADD CONSTRAINT "club_sections_menu_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "club_sections_menu_items" ADD CONSTRAINT "club_sections_menu_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "club_sections_menu_items" ADD CONSTRAINT "club_sections_menu_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "club_sections_menu_items" ADD CONSTRAINT "club_sections_menu_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "club_sections_menu_items" ADD CONSTRAINT "club_sections_menu_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "club_sections_menu_items" ADD CONSTRAINT "club_sections_menu_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "club_sections_menu_items" ADD CONSTRAINT "club_sections_menu_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."club_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "club_sections" ADD CONSTRAINT "club_sections_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "club_sections" ADD CONSTRAINT "club_sections_destination_page_id_pages_id_fk" FOREIGN KEY ("destination_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_club_sections_v_version_menu_items" ADD CONSTRAINT "_club_sections_v_version_menu_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_club_sections_v_version_menu_items" ADD CONSTRAINT "_club_sections_v_version_menu_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_club_sections_v_version_menu_items" ADD CONSTRAINT "_club_sections_v_version_menu_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_club_sections_v_version_menu_items" ADD CONSTRAINT "_club_sections_v_version_menu_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_club_sections_v_version_menu_items" ADD CONSTRAINT "_club_sections_v_version_menu_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_club_sections_v_version_menu_items" ADD CONSTRAINT "_club_sections_v_version_menu_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_club_sections_v_version_menu_items" ADD CONSTRAINT "_club_sections_v_version_menu_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_club_sections_v_version_menu_items" ADD CONSTRAINT "_club_sections_v_version_menu_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_club_sections_v_version_menu_items" ADD CONSTRAINT "_club_sections_v_version_menu_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_club_sections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_club_sections_v" ADD CONSTRAINT "_club_sections_v_parent_id_club_sections_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."club_sections"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_club_sections_v" ADD CONSTRAINT "_club_sections_v_version_background_image_id_media_id_fk" FOREIGN KEY ("version_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_club_sections_v" ADD CONSTRAINT "_club_sections_v_version_destination_page_id_pages_id_fk" FOREIGN KEY ("version_destination_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "club_sections_menu_items_order_idx" ON "club_sections_menu_items" USING btree ("_order");
  CREATE INDEX "club_sections_menu_items_parent_id_idx" ON "club_sections_menu_items" USING btree ("_parent_id");
  CREATE INDEX "club_sections_menu_items_event_cycle_idx" ON "club_sections_menu_items" USING btree ("event_cycle_id");
  CREATE INDEX "club_sections_menu_items_document_idx" ON "club_sections_menu_items" USING btree ("document_id");
  CREATE INDEX "club_sections_menu_items_category_idx" ON "club_sections_menu_items" USING btree ("category_id");
  CREATE INDEX "club_sections_menu_items_partner_idx" ON "club_sections_menu_items" USING btree ("partner_id");
  CREATE INDEX "club_sections_menu_items_page_idx" ON "club_sections_menu_items" USING btree ("page_id");
  CREATE INDEX "club_sections_menu_items_tag_idx" ON "club_sections_menu_items" USING btree ("tag_id");
  CREATE INDEX "club_sections_menu_items_post_idx" ON "club_sections_menu_items" USING btree ("post_id");
  CREATE INDEX "club_sections_menu_items_event_idx" ON "club_sections_menu_items" USING btree ("event_id");
  CREATE INDEX "club_sections_background_image_idx" ON "club_sections" USING btree ("background_image_id");
  CREATE INDEX "club_sections_destination_page_idx" ON "club_sections" USING btree ("destination_page_id");
  CREATE UNIQUE INDEX "club_sections_slug_idx" ON "club_sections" USING btree ("slug");
  CREATE INDEX "club_sections_updated_at_idx" ON "club_sections" USING btree ("updated_at");
  CREATE INDEX "club_sections_created_at_idx" ON "club_sections" USING btree ("created_at");
  CREATE INDEX "club_sections_deleted_at_idx" ON "club_sections" USING btree ("deleted_at");
  CREATE INDEX "club_sections__status_idx" ON "club_sections" USING btree ("_status");
  CREATE INDEX "_club_sections_v_version_menu_items_order_idx" ON "_club_sections_v_version_menu_items" USING btree ("_order");
  CREATE INDEX "_club_sections_v_version_menu_items_parent_id_idx" ON "_club_sections_v_version_menu_items" USING btree ("_parent_id");
  CREATE INDEX "_club_sections_v_version_menu_items_event_cycle_idx" ON "_club_sections_v_version_menu_items" USING btree ("event_cycle_id");
  CREATE INDEX "_club_sections_v_version_menu_items_document_idx" ON "_club_sections_v_version_menu_items" USING btree ("document_id");
  CREATE INDEX "_club_sections_v_version_menu_items_category_idx" ON "_club_sections_v_version_menu_items" USING btree ("category_id");
  CREATE INDEX "_club_sections_v_version_menu_items_partner_idx" ON "_club_sections_v_version_menu_items" USING btree ("partner_id");
  CREATE INDEX "_club_sections_v_version_menu_items_page_idx" ON "_club_sections_v_version_menu_items" USING btree ("page_id");
  CREATE INDEX "_club_sections_v_version_menu_items_tag_idx" ON "_club_sections_v_version_menu_items" USING btree ("tag_id");
  CREATE INDEX "_club_sections_v_version_menu_items_post_idx" ON "_club_sections_v_version_menu_items" USING btree ("post_id");
  CREATE INDEX "_club_sections_v_version_menu_items_event_idx" ON "_club_sections_v_version_menu_items" USING btree ("event_id");
  CREATE INDEX "_club_sections_v_parent_idx" ON "_club_sections_v" USING btree ("parent_id");
  CREATE INDEX "_club_sections_v_version_version_background_image_idx" ON "_club_sections_v" USING btree ("version_background_image_id");
  CREATE INDEX "_club_sections_v_version_version_destination_page_idx" ON "_club_sections_v" USING btree ("version_destination_page_id");
  CREATE INDEX "_club_sections_v_version_version_slug_idx" ON "_club_sections_v" USING btree ("version_slug");
  CREATE INDEX "_club_sections_v_version_version_updated_at_idx" ON "_club_sections_v" USING btree ("version_updated_at");
  CREATE INDEX "_club_sections_v_version_version_created_at_idx" ON "_club_sections_v" USING btree ("version_created_at");
  CREATE INDEX "_club_sections_v_version_version_deleted_at_idx" ON "_club_sections_v" USING btree ("version_deleted_at");
  CREATE INDEX "_club_sections_v_version_version__status_idx" ON "_club_sections_v" USING btree ("version__status");
  CREATE INDEX "_club_sections_v_created_at_idx" ON "_club_sections_v" USING btree ("created_at");
  CREATE INDEX "_club_sections_v_updated_at_idx" ON "_club_sections_v" USING btree ("updated_at");
  CREATE INDEX "_club_sections_v_latest_idx" ON "_club_sections_v" USING btree ("latest");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_club_sections_fk" FOREIGN KEY ("club_sections_id") REFERENCES "public"."club_sections"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_club_sections_id_idx" ON "payload_locked_documents_rels" USING btree ("club_sections_id");`)
}
