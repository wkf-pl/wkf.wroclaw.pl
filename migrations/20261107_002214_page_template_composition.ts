import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TYPE "public"."action_source" AS ENUM('standard', 'contextAction');
  CREATE TYPE "public"."context_action" AS ENUM('eventCalendar', 'eventMap', 'eventCycleCalendar');
  CREATE TYPE "public"."enum_page_templates_blocks_listing_context_relation" AS ENUM('eventPartners');
  CREATE TYPE "public"."enum__page_templates_v_blocks_listing_context_relation" AS ENUM('eventPartners');
  ALTER TYPE "public"."enum_page_templates_blocks_listing_selection_mode" ADD VALUE 'contextRelation';
  ALTER TYPE "public"."enum__page_templates_v_blocks_listing_selection_mode" ADD VALUE 'contextRelation';
  CREATE TABLE "page_templates_blocks_current_item_field_row" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );

  CREATE TABLE "_page_templates_v_blocks_current_item_field_row" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );

  ALTER TABLE "page_templates_blocks_action_links_items" ADD COLUMN "action_source" "action_source" DEFAULT 'standard';
  ALTER TABLE "page_templates_blocks_action_links_items" ADD COLUMN "context_action" "context_action";
  ALTER TABLE "_page_templates_v_blocks_action_links_items" ADD COLUMN "action_source" "action_source" DEFAULT 'standard';
  ALTER TABLE "_page_templates_v_blocks_action_links_items" ADD COLUMN "context_action" "context_action";

  INSERT INTO "page_templates_blocks_action_links" (
    "_order", "_parent_id", "_path", "id", "layout", "alignment", "block_name"
  )
  SELECT "_order", "_parent_id", "_path", "id", 'inline', 'start', "block_name"
  FROM "page_templates_blocks_current_item_field"
  WHERE "field" = 'eventActions';

  INSERT INTO "page_templates_blocks_action_links_items" (
    "_order", "_parent_id", "id", "label", "appearance", "icon_name", "action_source",
    "context_action", "target_type", "open_in_new_tab"
  )
  SELECT action."item_order", field."id", field."id" || action."id_suffix", action."label",
    'link', action."icon_name"::"public"."enum_page_templates_blocks_action_links_items_icon_name",
    'contextAction', action."context_action"::"public"."context_action", 'custom', false
  FROM "page_templates_blocks_current_item_field" field
  CROSS JOIN (VALUES
    (0, '-event-calendar', 'Dodaj do kalendarza', 'calendar', 'eventCalendar'),
    (1, '-event-map', 'Otwórz w Mapach', 'location', 'eventMap')
  ) AS action("item_order", "id_suffix", "label", "icon_name", "context_action")
  WHERE field."field" = 'eventActions';

  INSERT INTO "_page_templates_v_blocks_action_links" (
    "_order", "_parent_id", "_path", "id", "layout", "alignment", "_uuid", "block_name"
  )
  SELECT "_order", "_parent_id", "_path", -"id", 'inline', 'start', "_uuid", "block_name"
  FROM "_page_templates_v_blocks_current_item_field"
  WHERE "field" = 'eventActions';

  INSERT INTO "_page_templates_v_blocks_action_links_items" (
    "_order", "_parent_id", "label", "appearance", "icon_name", "action_source",
    "context_action", "target_type", "open_in_new_tab"
  )
  SELECT action."item_order", -field."id", action."label", 'link',
    action."icon_name"::"public"."enum__page_templates_v_blocks_action_links_items_icon_name",
    'contextAction', action."context_action"::"public"."context_action", 'custom', false
  FROM "_page_templates_v_blocks_current_item_field" field
  CROSS JOIN (VALUES
    (0, 'Dodaj do kalendarza', 'calendar', 'eventCalendar'),
    (1, 'Otwórz w Mapach', 'location', 'eventMap')
  ) AS action("item_order", "label", "icon_name", "context_action")
  WHERE field."field" = 'eventActions';

  DELETE FROM "page_templates_blocks_current_item_field" WHERE "field" = 'eventActions';
  DELETE FROM "_page_templates_v_blocks_current_item_field" WHERE "field" = 'eventActions';

  ALTER TABLE "page_templates_blocks_current_item_field" ALTER COLUMN "field" SET DATA TYPE text;
  DROP TYPE "public"."enum_page_templates_blocks_current_item_field_field";
  CREATE TYPE "public"."enum_page_templates_blocks_current_item_field_field" AS ENUM('name', 'description', 'hierarchy', 'eventType', 'eventStatus', 'title', 'excerpt', 'eventCycle', 'tags', 'eventTime', 'eventLocation', 'eventAudience', 'eventCapacity', 'partners', 'organizers', 'website', 'publicName', 'clubFunction', 'about', 'contactChannels');
  ALTER TABLE "page_templates_blocks_current_item_field" ALTER COLUMN "field" SET DATA TYPE "public"."enum_page_templates_blocks_current_item_field_field" USING "field"::"public"."enum_page_templates_blocks_current_item_field_field";
  ALTER TABLE "_page_templates_v_blocks_current_item_field" ALTER COLUMN "field" SET DATA TYPE text;
  DROP TYPE "public"."enum__page_templates_v_blocks_current_item_field_field";
  CREATE TYPE "public"."enum__page_templates_v_blocks_current_item_field_field" AS ENUM('name', 'description', 'hierarchy', 'eventType', 'eventStatus', 'title', 'excerpt', 'eventCycle', 'tags', 'eventTime', 'eventLocation', 'eventAudience', 'eventCapacity', 'partners', 'organizers', 'website', 'publicName', 'clubFunction', 'about', 'contactChannels');
  ALTER TABLE "_page_templates_v_blocks_current_item_field" ALTER COLUMN "field" SET DATA TYPE "public"."enum__page_templates_v_blocks_current_item_field_field" USING "field"::"public"."enum__page_templates_v_blocks_current_item_field_field";
  ALTER TABLE "page_templates_blocks_listing" ADD COLUMN "context_relation" "enum_page_templates_blocks_listing_context_relation";
  ALTER TABLE "_page_templates_v_blocks_listing" ADD COLUMN "context_relation" "enum__page_templates_v_blocks_listing_context_relation";
  ALTER TABLE "page_templates_blocks_current_item_field_row" ADD CONSTRAINT "page_templates_blocks_current_item_field_row_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_current_item_field_row" ADD CONSTRAINT "_page_templates_v_blocks_current_item_field_row_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_templates_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "page_templates_blocks_current_item_field_row_order_idx" ON "page_templates_blocks_current_item_field_row" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_current_item_field_row_parent_id_idx" ON "page_templates_blocks_current_item_field_row" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_current_item_field_row_path_idx" ON "page_templates_blocks_current_item_field_row" USING btree ("_path");
  CREATE INDEX "_page_templates_v_blocks_current_item_field_row_order_idx" ON "_page_templates_v_blocks_current_item_field_row" USING btree ("_order");
  CREATE INDEX "_page_templates_v_blocks_current_item_field_row_parent_id_idx" ON "_page_templates_v_blocks_current_item_field_row" USING btree ("_parent_id");
  CREATE INDEX "_page_templates_v_blocks_current_item_field_row_path_idx" ON "_page_templates_v_blocks_current_item_field_row" USING btree ("_path");

  CREATE TYPE "public"."enum_page_templates_blocks_field_row_text_style" AS ENUM('plain', 'badge', 'emphasizedBadge', 'informationLabel');
  CREATE TYPE "public"."enum__page_templates_v_blocks_field_row_text_style" AS ENUM('plain', 'badge', 'emphasizedBadge', 'informationLabel');
  CREATE TABLE "page_templates_blocks_field_row_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" jsonb,
  	"block_name" varchar,
  	"style" "enum_page_templates_blocks_field_row_text_style" DEFAULT 'plain'
  );

  CREATE TABLE "_page_templates_v_blocks_field_row_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar,
  	"style" "enum__page_templates_v_blocks_field_row_text_style" DEFAULT 'plain'
  );

  ALTER TABLE "page_templates_blocks_field_row_text" ADD CONSTRAINT "page_templates_blocks_field_row_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_field_row_text" ADD CONSTRAINT "_page_templates_v_blocks_field_row_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_templates_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "page_templates_blocks_field_row_text_order_idx" ON "page_templates_blocks_field_row_text" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_field_row_text_parent_id_idx" ON "page_templates_blocks_field_row_text" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_field_row_text_path_idx" ON "page_templates_blocks_field_row_text" USING btree ("_path");
  CREATE INDEX "_page_templates_v_blocks_field_row_text_order_idx" ON "_page_templates_v_blocks_field_row_text" USING btree ("_order");
  CREATE INDEX "_page_templates_v_blocks_field_row_text_parent_id_idx" ON "_page_templates_v_blocks_field_row_text" USING btree ("_parent_id");
  CREATE INDEX "_page_templates_v_blocks_field_row_text_path_idx" ON "_page_templates_v_blocks_field_row_text" USING btree ("_path");

  CREATE TYPE "public"."enum_page_templates_blocks_page_template_icon_icon_name" AS ENUM('camera', 'astronaut', 'ticket', 'bluesky', 'mace', 'bottle-mana', 'cthulhu', 'time', 'skull', 'dnd5', 'discord', 'document', 'pumpkin-halloween', 'mail', 'facebook', 'guitar', 'globe', 'board-game', 'star', 'instagram', 'calendar', 'hat', 'gun', 'cards', 'playing-cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'water-drop', 'crystal-ball', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'pirate-map', 'vendetta', 'messenger', 'sword', 'potion', 'music', 'image', 'announcement', 'eye', 'partner', 'pdf', 'seal', 'pawn', 'quill', 'flame', 'download', 'review', 'wand', 'sf', 'seance', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'superhero', 'stormtrooper', 'soundtrack', 'tag', 'shield', 'axe', 'twitch', 'shuttle', 'fighter', 'event', 'filled-star', 'youtube', 'scroll');
  CREATE TYPE "public"."enum__page_templates_v_blocks_page_template_icon_icon_name" AS ENUM('camera', 'astronaut', 'ticket', 'bluesky', 'mace', 'bottle-mana', 'cthulhu', 'time', 'skull', 'dnd5', 'discord', 'document', 'pumpkin-halloween', 'mail', 'facebook', 'guitar', 'globe', 'board-game', 'star', 'instagram', 'calendar', 'hat', 'gun', 'cards', 'playing-cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'water-drop', 'crystal-ball', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'pirate-map', 'vendetta', 'messenger', 'sword', 'potion', 'music', 'image', 'announcement', 'eye', 'partner', 'pdf', 'seal', 'pawn', 'quill', 'flame', 'download', 'review', 'wand', 'sf', 'seance', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'superhero', 'stormtrooper', 'soundtrack', 'tag', 'shield', 'axe', 'twitch', 'shuttle', 'fighter', 'event', 'filled-star', 'youtube', 'scroll');
  CREATE TABLE "page_templates_blocks_page_template_icon" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon_name" "enum_page_templates_blocks_page_template_icon_icon_name",
  	"hanging" boolean DEFAULT false,
  	"block_name" varchar,
  	"icon_inverted" boolean DEFAULT false
  );

  CREATE TABLE "_page_templates_v_blocks_page_template_icon" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon_name" "enum__page_templates_v_blocks_page_template_icon_icon_name",
  	"hanging" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar,
  	"icon_inverted" boolean DEFAULT false
  );

  ALTER TABLE "page_templates_blocks_page_template_icon" ADD CONSTRAINT "page_templates_blocks_page_template_icon_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_templates_v_blocks_page_template_icon" ADD CONSTRAINT "_page_templates_v_blocks_page_template_icon_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_templates_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "page_templates_blocks_page_template_icon_order_idx" ON "page_templates_blocks_page_template_icon" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_page_template_icon_parent_id_idx" ON "page_templates_blocks_page_template_icon" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_page_template_icon_path_idx" ON "page_templates_blocks_page_template_icon" USING btree ("_path");
  CREATE INDEX "_page_templates_v_blocks_page_template_icon_order_idx" ON "_page_templates_v_blocks_page_template_icon" USING btree ("_order");
  CREATE INDEX "_page_templates_v_blocks_page_template_icon_parent_id_idx" ON "_page_templates_v_blocks_page_template_icon" USING btree ("_parent_id");
  CREATE INDEX "_page_templates_v_blocks_page_template_icon_path_idx" ON "_page_templates_v_blocks_page_template_icon" USING btree ("_path");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DO $$
  BEGIN
    IF EXISTS (
      SELECT 1 FROM "page_templates_blocks_action_links_items"
      WHERE "action_source" = 'contextAction'
    ) OR EXISTS (
      SELECT 1 FROM "_page_templates_v_blocks_action_links_items"
      WHERE "action_source" = 'contextAction'
    ) OR EXISTS (
      SELECT 1 FROM "page_templates_blocks_listing"
      WHERE "selection_mode" = 'contextRelation'
    ) OR EXISTS (
      SELECT 1 FROM "_page_templates_v_blocks_listing"
      WHERE "selection_mode" = 'contextRelation'
    ) OR EXISTS (
      SELECT 1 FROM "page_templates_blocks_current_item_field_row"
    ) OR EXISTS (
      SELECT 1 FROM "_page_templates_v_blocks_current_item_field_row"
    ) OR EXISTS (
      SELECT 1 FROM "page_templates_blocks_field_row_text"
    ) OR EXISTS (
      SELECT 1 FROM "_page_templates_v_blocks_field_row_text"
    ) OR EXISTS (
      SELECT 1 FROM "page_templates_blocks_page_template_icon"
    ) OR EXISTS (
      SELECT 1 FROM "_page_templates_v_blocks_page_template_icon"
    ) THEN
      RAISE EXCEPTION 'Cannot roll back page template composition while contextual actions, contextual listings, field rows, short text, or icons are in use.';
    END IF;
  END
  $$;

  DROP TABLE "page_templates_blocks_field_row_text", "_page_templates_v_blocks_field_row_text";
  DROP TABLE "page_templates_blocks_page_template_icon", "_page_templates_v_blocks_page_template_icon";
  DROP TYPE "public"."enum_page_templates_blocks_field_row_text_style";
  DROP TYPE "public"."enum__page_templates_v_blocks_field_row_text_style";
  DROP TYPE "public"."enum_page_templates_blocks_page_template_icon_icon_name";
  DROP TYPE "public"."enum__page_templates_v_blocks_page_template_icon_icon_name";

  ALTER TYPE "public"."enum_page_templates_blocks_current_item_field_field" ADD VALUE 'eventActions' BEFORE 'partners';
  ALTER TYPE "public"."enum__page_templates_v_blocks_current_item_field_field" ADD VALUE 'eventActions' BEFORE 'partners';
  DROP TABLE "page_templates_blocks_current_item_field_row" CASCADE;
  DROP TABLE "_page_templates_v_blocks_current_item_field_row" CASCADE;
  ALTER TABLE "page_templates_blocks_listing" ALTER COLUMN "selection_mode" SET DATA TYPE text;
  ALTER TABLE "page_templates_blocks_listing" ALTER COLUMN "selection_mode" SET DEFAULT 'filters'::text;
  DROP TYPE "public"."enum_page_templates_blocks_listing_selection_mode";
  CREATE TYPE "public"."enum_page_templates_blocks_listing_selection_mode" AS ENUM('manual', 'filters');
  ALTER TABLE "page_templates_blocks_listing" ALTER COLUMN "selection_mode" SET DEFAULT 'filters'::"public"."enum_page_templates_blocks_listing_selection_mode";
  ALTER TABLE "page_templates_blocks_listing" ALTER COLUMN "selection_mode" SET DATA TYPE "public"."enum_page_templates_blocks_listing_selection_mode" USING "selection_mode"::"public"."enum_page_templates_blocks_listing_selection_mode";
  ALTER TABLE "_page_templates_v_blocks_listing" ALTER COLUMN "selection_mode" SET DATA TYPE text;
  ALTER TABLE "_page_templates_v_blocks_listing" ALTER COLUMN "selection_mode" SET DEFAULT 'filters'::text;
  DROP TYPE "public"."enum__page_templates_v_blocks_listing_selection_mode";
  CREATE TYPE "public"."enum__page_templates_v_blocks_listing_selection_mode" AS ENUM('manual', 'filters');
  ALTER TABLE "_page_templates_v_blocks_listing" ALTER COLUMN "selection_mode" SET DEFAULT 'filters'::"public"."enum__page_templates_v_blocks_listing_selection_mode";
  ALTER TABLE "_page_templates_v_blocks_listing" ALTER COLUMN "selection_mode" SET DATA TYPE "public"."enum__page_templates_v_blocks_listing_selection_mode" USING "selection_mode"::"public"."enum__page_templates_v_blocks_listing_selection_mode";
  ALTER TABLE "page_templates_blocks_action_links_items" DROP COLUMN "action_source";
  ALTER TABLE "page_templates_blocks_action_links_items" DROP COLUMN "context_action";
  ALTER TABLE "page_templates_blocks_listing" DROP COLUMN "context_relation";
  ALTER TABLE "_page_templates_v_blocks_action_links_items" DROP COLUMN "action_source";
  ALTER TABLE "_page_templates_v_blocks_action_links_items" DROP COLUMN "context_action";
  ALTER TABLE "_page_templates_v_blocks_listing" DROP COLUMN "context_relation";
  DROP TYPE "public"."action_source";
  DROP TYPE "public"."context_action";
  DROP TYPE "public"."enum_page_templates_blocks_listing_context_relation";
  DROP TYPE "public"."enum__page_templates_v_blocks_listing_context_relation";
  `)
}
