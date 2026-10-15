import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_blocks_documents_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_documents_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_documents_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_documents_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_blocks_documents_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_blocks_documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_v_blocks_documents_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_v_blocks_documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "event_cycles_blocks_documents_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "event_cycles_blocks_documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_event_cycles_v_blocks_documents_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_event_cycles_v_blocks_documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "partners_blocks_documents_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "partners_blocks_documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_partners_v_blocks_documents_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_partners_v_blocks_documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage_sections_blocks_documents_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage_sections_blocks_documents" DISABLE ROW LEVEL SECURITY;

  DO $migration$
  DECLARE
    collection_prefix text;
    main_prefixes text[] := ARRAY['pages', 'posts', 'events', 'event_cycles', 'partners', 'homepage_sections'];
    version_prefixes text[] := ARRAY['_pages_v', '_posts_v', '_events_v', '_event_cycles_v', '_partners_v'];
  BEGIN
    FOREACH collection_prefix IN ARRAY main_prefixes LOOP
      EXECUTE format($statement$
        INSERT INTO %I (
          _order, _parent_id, _path, id, frame, surface, surface_image_id,
          surface_horizontal_position, surface_vertical_position, selection_mode,
          category_id, tag_id, sort, view, page_size, pagination, empty_message, block_name
        )
        SELECT
          _order, _parent_id, _path, 'documents-' || id, frame, surface, surface_image_id,
          surface_horizontal_position, surface_vertical_position,
          selection_mode::text::%I, category_id, tag_id, sort::text::%I,
          (CASE WHEN view::text = 'list' THEN 'compact' ELSE view::text END)::%I,
          page_size, pagination, empty_message, block_name
        FROM %I
        ON CONFLICT (id) DO NOTHING
      $statement$,
        collection_prefix || '_blocks_listing',
        'enum_' || collection_prefix || '_blocks_listing_selection_mode',
        'enum_' || collection_prefix || '_blocks_listing_sort',
        'enum_' || collection_prefix || '_blocks_listing_view',
        collection_prefix || '_blocks_documents'
      );

      EXECUTE format($statement$
        INSERT INTO %I (_order, _parent_id, id)
        SELECT _order, 'documents-' || _parent_id, 'documents-' || id
        FROM %I
        ON CONFLICT (id) DO NOTHING
      $statement$,
        collection_prefix || '_blocks_listing_items',
        collection_prefix || '_blocks_documents_items'
      );

      EXECUTE format($statement$
        INSERT INTO %I (parent_id, path, documents_id)
        SELECT
          document_block._parent_id,
          document_block._path || '.' || (document_block._order - 1)::text ||
            '.items.' || (document_item._order - 1)::text || '.item',
          document_item.document_id
        FROM %I AS document_item
        INNER JOIN %I AS document_block ON document_block.id = document_item._parent_id
        WHERE document_item.document_id IS NOT NULL
      $statement$,
        collection_prefix || '_rels',
        collection_prefix || '_blocks_documents_items',
        collection_prefix || '_blocks_documents'
      );

      EXECUTE format($statement$
        INSERT INTO %I ("order", parent_id, value)
        SELECT 1, 'documents-' || id, 'documents'::%I
        FROM %I
        WHERE selection_mode::text = 'filters'
      $statement$,
        collection_prefix || '_blocks_listing_sources',
        'enum_' || collection_prefix || '_blocks_listing_sources',
        collection_prefix || '_blocks_documents'
      );
    END LOOP;

    FOREACH collection_prefix IN ARRAY version_prefixes LOOP
      EXECUTE format($statement$
        INSERT INTO %I (
          _order, _parent_id, _path, frame, surface, surface_image_id,
          surface_horizontal_position, surface_vertical_position, selection_mode,
          category_id, tag_id, sort, view, page_size, pagination, empty_message, _uuid, block_name
        )
        SELECT
          _order, _parent_id, _path, frame, surface, surface_image_id,
          surface_horizontal_position, surface_vertical_position,
          selection_mode::text::%I, category_id, tag_id, sort::text::%I,
          (CASE WHEN view::text = 'list' THEN 'compact' ELSE view::text END)::%I,
          page_size, pagination, empty_message, 'documents-' || COALESCE(_uuid, id::text), block_name
        FROM %I
      $statement$,
        collection_prefix || '_blocks_listing',
        'enum_' || collection_prefix || '_blocks_listing_selection_mode',
        'enum_' || collection_prefix || '_blocks_listing_sort',
        'enum_' || collection_prefix || '_blocks_listing_view',
        collection_prefix || '_blocks_documents'
      );

      EXECUTE format($statement$
        INSERT INTO %I (_order, _parent_id, _uuid)
        SELECT
          document_item._order,
          listing_block.id,
          'documents-' || COALESCE(document_item._uuid, document_item.id::text)
        FROM %I AS document_item
        INNER JOIN %I AS document_block ON document_block.id = document_item._parent_id
        INNER JOIN %I AS listing_block
          ON listing_block._uuid = 'documents-' || COALESCE(document_block._uuid, document_block.id::text)
          AND listing_block._parent_id = document_block._parent_id
          AND listing_block._path = document_block._path
          AND listing_block._order = document_block._order
      $statement$,
        collection_prefix || '_blocks_listing_items',
        collection_prefix || '_blocks_documents_items',
        collection_prefix || '_blocks_documents',
        collection_prefix || '_blocks_listing'
      );

      EXECUTE format($statement$
        INSERT INTO %I (parent_id, path, documents_id)
        SELECT
          document_block._parent_id,
          document_block._path || '.' || (document_block._order - 1)::text ||
            '.items.' || (document_item._order - 1)::text || '.item',
          document_item.document_id
        FROM %I AS document_item
        INNER JOIN %I AS document_block ON document_block.id = document_item._parent_id
        WHERE document_item.document_id IS NOT NULL
      $statement$,
        collection_prefix || '_rels',
        collection_prefix || '_blocks_documents_items',
        collection_prefix || '_blocks_documents'
      );

      EXECUTE format($statement$
        INSERT INTO %I ("order", parent_id, value)
        SELECT 1, listing_block.id, 'documents'::%I
        FROM %I AS document_block
        INNER JOIN %I AS listing_block
          ON listing_block._uuid = 'documents-' || COALESCE(document_block._uuid, document_block.id::text)
          AND listing_block._parent_id = document_block._parent_id
          AND listing_block._path = document_block._path
          AND listing_block._order = document_block._order
        WHERE document_block.selection_mode::text = 'filters'
      $statement$,
        collection_prefix || '_blocks_listing_sources',
        'enum_' || collection_prefix || '_blocks_listing_sources',
        collection_prefix || '_blocks_documents',
        collection_prefix || '_blocks_listing'
      );
    END LOOP;
  END
  $migration$;

  INSERT INTO "content_listing_items" (
    "source", "source_document_id", "source_updated_at", "title", "url", "excerpt",
    "sort_date", "category_id"
  )
  SELECT
    'documents', "id", "updated_at", "title", '/dokumenty/' || "slug", NULLIF(BTRIM("summary"), ''),
    COALESCE("document_date", "published_at", "created_at"), "category_id"
  FROM "documents"
  WHERE "_status" = 'published'
  ON CONFLICT ("source", "source_document_id") DO UPDATE SET
    "source_updated_at" = EXCLUDED."source_updated_at",
    "title" = EXCLUDED."title",
    "url" = EXCLUDED."url",
    "excerpt" = EXCLUDED."excerpt",
    "sort_date" = EXCLUDED."sort_date",
    "category_id" = EXCLUDED."category_id";

  DELETE FROM "content_listing_items_rels"
  WHERE "parent_id" IN (
    SELECT "id" FROM "content_listing_items" WHERE "source" = 'documents'
  ) AND "path" = 'tags';

  INSERT INTO "content_listing_items_rels" ("order", "parent_id", "path", "tags_id")
  SELECT document_relation."order", listing_item."id", 'tags', document_relation."tags_id"
  FROM "documents_rels" AS document_relation
  INNER JOIN "content_listing_items" AS listing_item
    ON listing_item."source" = 'documents'
    AND listing_item."source_document_id" = document_relation."parent_id"
  WHERE document_relation."path" = 'tags' AND document_relation."tags_id" IS NOT NULL;

  DROP TABLE "pages_blocks_documents_items" CASCADE;
  DROP TABLE "pages_blocks_documents" CASCADE;
  DROP TABLE "_pages_v_blocks_documents_items" CASCADE;
  DROP TABLE "_pages_v_blocks_documents" CASCADE;
  DROP TABLE "posts_blocks_documents_items" CASCADE;
  DROP TABLE "posts_blocks_documents" CASCADE;
  DROP TABLE "_posts_v_blocks_documents_items" CASCADE;
  DROP TABLE "_posts_v_blocks_documents" CASCADE;
  DROP TABLE "events_blocks_documents_items" CASCADE;
  DROP TABLE "events_blocks_documents" CASCADE;
  DROP TABLE "_events_v_blocks_documents_items" CASCADE;
  DROP TABLE "_events_v_blocks_documents" CASCADE;
  DROP TABLE "event_cycles_blocks_documents_items" CASCADE;
  DROP TABLE "event_cycles_blocks_documents" CASCADE;
  DROP TABLE "_event_cycles_v_blocks_documents_items" CASCADE;
  DROP TABLE "_event_cycles_v_blocks_documents" CASCADE;
  DROP TABLE "partners_blocks_documents_items" CASCADE;
  DROP TABLE "partners_blocks_documents" CASCADE;
  DROP TABLE "_partners_v_blocks_documents_items" CASCADE;
  DROP TABLE "_partners_v_blocks_documents" CASCADE;
  DROP TABLE "homepage_sections_blocks_documents_items" CASCADE;
  DROP TABLE "homepage_sections_blocks_documents" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_documents_selection_mode";
  DROP TYPE "public"."enum_pages_blocks_documents_sort";
  DROP TYPE "public"."enum_pages_blocks_documents_view";
  DROP TYPE "public"."enum__pages_v_blocks_documents_selection_mode";
  DROP TYPE "public"."enum__pages_v_blocks_documents_sort";
  DROP TYPE "public"."enum__pages_v_blocks_documents_view";
  DROP TYPE "public"."enum_posts_blocks_documents_selection_mode";
  DROP TYPE "public"."enum_posts_blocks_documents_sort";
  DROP TYPE "public"."enum_posts_blocks_documents_view";
  DROP TYPE "public"."enum__posts_v_blocks_documents_selection_mode";
  DROP TYPE "public"."enum__posts_v_blocks_documents_sort";
  DROP TYPE "public"."enum__posts_v_blocks_documents_view";
  DROP TYPE "public"."enum_events_blocks_documents_selection_mode";
  DROP TYPE "public"."enum_events_blocks_documents_sort";
  DROP TYPE "public"."enum_events_blocks_documents_view";
  DROP TYPE "public"."enum__events_v_blocks_documents_selection_mode";
  DROP TYPE "public"."enum__events_v_blocks_documents_sort";
  DROP TYPE "public"."enum__events_v_blocks_documents_view";
  DROP TYPE "public"."enum_event_cycles_blocks_documents_selection_mode";
  DROP TYPE "public"."enum_event_cycles_blocks_documents_sort";
  DROP TYPE "public"."enum_event_cycles_blocks_documents_view";
  DROP TYPE "public"."enum__event_cycles_v_blocks_documents_selection_mode";
  DROP TYPE "public"."enum__event_cycles_v_blocks_documents_sort";
  DROP TYPE "public"."enum__event_cycles_v_blocks_documents_view";
  DROP TYPE "public"."enum_partners_blocks_documents_selection_mode";
  DROP TYPE "public"."enum_partners_blocks_documents_sort";
  DROP TYPE "public"."enum_partners_blocks_documents_view";
  DROP TYPE "public"."enum__partners_v_blocks_documents_selection_mode";
  DROP TYPE "public"."enum__partners_v_blocks_documents_sort";
  DROP TYPE "public"."enum__partners_v_blocks_documents_view";
  DROP TYPE "public"."enum_homepage_sections_blocks_documents_selection_mode";
  DROP TYPE "public"."enum_homepage_sections_blocks_documents_sort";
  DROP TYPE "public"."enum_homepage_sections_blocks_documents_view";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_documents_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum_pages_blocks_documents_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum_pages_blocks_documents_view" AS ENUM('cards', 'list', 'grid', 'tiles', 'carousel');
  CREATE TYPE "public"."enum__pages_v_blocks_documents_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum__pages_v_blocks_documents_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum__pages_v_blocks_documents_view" AS ENUM('cards', 'list', 'grid', 'tiles', 'carousel');
  CREATE TYPE "public"."enum_posts_blocks_documents_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum_posts_blocks_documents_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum_posts_blocks_documents_view" AS ENUM('cards', 'list', 'grid', 'tiles', 'carousel');
  CREATE TYPE "public"."enum__posts_v_blocks_documents_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum__posts_v_blocks_documents_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum__posts_v_blocks_documents_view" AS ENUM('cards', 'list', 'grid', 'tiles', 'carousel');
  CREATE TYPE "public"."enum_events_blocks_documents_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum_events_blocks_documents_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum_events_blocks_documents_view" AS ENUM('cards', 'list', 'grid', 'tiles', 'carousel');
  CREATE TYPE "public"."enum__events_v_blocks_documents_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum__events_v_blocks_documents_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum__events_v_blocks_documents_view" AS ENUM('cards', 'list', 'grid', 'tiles', 'carousel');
  CREATE TYPE "public"."enum_event_cycles_blocks_documents_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum_event_cycles_blocks_documents_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum_event_cycles_blocks_documents_view" AS ENUM('cards', 'list', 'grid', 'tiles', 'carousel');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_documents_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_documents_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_documents_view" AS ENUM('cards', 'list', 'grid', 'tiles', 'carousel');
  CREATE TYPE "public"."enum_partners_blocks_documents_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum_partners_blocks_documents_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum_partners_blocks_documents_view" AS ENUM('cards', 'list', 'grid', 'tiles', 'carousel');
  CREATE TYPE "public"."enum__partners_v_blocks_documents_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum__partners_v_blocks_documents_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum__partners_v_blocks_documents_view" AS ENUM('cards', 'list', 'grid', 'tiles', 'carousel');
  CREATE TYPE "public"."enum_homepage_sections_blocks_documents_selection_mode" AS ENUM('manual', 'filters');
  CREATE TYPE "public"."enum_homepage_sections_blocks_documents_sort" AS ENUM('newest', 'oldest', 'titleAscending', 'titleDescending');
  CREATE TYPE "public"."enum_homepage_sections_blocks_documents_view" AS ENUM('cards', 'list', 'grid', 'tiles', 'carousel');
  CREATE TABLE "pages_blocks_documents_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"document_id" integer
  );
  
  CREATE TABLE "pages_blocks_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"selection_mode" "enum_pages_blocks_documents_selection_mode" DEFAULT 'filters',
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum_pages_blocks_documents_sort" DEFAULT 'newest',
  	"view" "enum_pages_blocks_documents_view" DEFAULT 'list',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_documents_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"document_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"selection_mode" "enum__pages_v_blocks_documents_selection_mode" DEFAULT 'filters',
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum__pages_v_blocks_documents_sort" DEFAULT 'newest',
  	"view" "enum__pages_v_blocks_documents_view" DEFAULT 'list',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_documents_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"document_id" integer
  );
  
  CREATE TABLE "posts_blocks_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"selection_mode" "enum_posts_blocks_documents_selection_mode" DEFAULT 'filters',
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum_posts_blocks_documents_sort" DEFAULT 'newest',
  	"view" "enum_posts_blocks_documents_view" DEFAULT 'list',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_documents_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"document_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"selection_mode" "enum__posts_v_blocks_documents_selection_mode" DEFAULT 'filters',
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum__posts_v_blocks_documents_sort" DEFAULT 'newest',
  	"view" "enum__posts_v_blocks_documents_view" DEFAULT 'list',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "events_blocks_documents_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"document_id" integer
  );
  
  CREATE TABLE "events_blocks_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"selection_mode" "enum_events_blocks_documents_selection_mode" DEFAULT 'filters',
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum_events_blocks_documents_sort" DEFAULT 'newest',
  	"view" "enum_events_blocks_documents_view" DEFAULT 'list',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_events_v_blocks_documents_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"document_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_events_v_blocks_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"selection_mode" "enum__events_v_blocks_documents_selection_mode" DEFAULT 'filters',
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum__events_v_blocks_documents_sort" DEFAULT 'newest',
  	"view" "enum__events_v_blocks_documents_view" DEFAULT 'list',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "event_cycles_blocks_documents_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"document_id" integer
  );
  
  CREATE TABLE "event_cycles_blocks_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"selection_mode" "enum_event_cycles_blocks_documents_selection_mode" DEFAULT 'filters',
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum_event_cycles_blocks_documents_sort" DEFAULT 'newest',
  	"view" "enum_event_cycles_blocks_documents_view" DEFAULT 'list',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_event_cycles_v_blocks_documents_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"document_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_event_cycles_v_blocks_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"selection_mode" "enum__event_cycles_v_blocks_documents_selection_mode" DEFAULT 'filters',
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum__event_cycles_v_blocks_documents_sort" DEFAULT 'newest',
  	"view" "enum__event_cycles_v_blocks_documents_view" DEFAULT 'list',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "partners_blocks_documents_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"document_id" integer
  );
  
  CREATE TABLE "partners_blocks_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"selection_mode" "enum_partners_blocks_documents_selection_mode" DEFAULT 'filters',
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum_partners_blocks_documents_sort" DEFAULT 'newest',
  	"view" "enum_partners_blocks_documents_view" DEFAULT 'list',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_partners_v_blocks_documents_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"document_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_partners_v_blocks_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"selection_mode" "enum__partners_v_blocks_documents_selection_mode" DEFAULT 'filters',
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum__partners_v_blocks_documents_sort" DEFAULT 'newest',
  	"view" "enum__partners_v_blocks_documents_view" DEFAULT 'list',
  	"page_size" numeric DEFAULT 12,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_sections_blocks_documents_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"document_id" integer
  );
  
  CREATE TABLE "homepage_sections_blocks_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"frame" "fr" DEFAULT 'none',
  	"surface" "sf" DEFAULT 'transparent',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"selection_mode" "enum_homepage_sections_blocks_documents_selection_mode" DEFAULT 'filters' NOT NULL,
  	"category_id" integer,
  	"tag_id" integer,
  	"sort" "enum_homepage_sections_blocks_documents_sort" DEFAULT 'newest',
  	"view" "enum_homepage_sections_blocks_documents_view" DEFAULT 'list' NOT NULL,
  	"page_size" numeric DEFAULT 12 NOT NULL,
  	"pagination" boolean DEFAULT true,
  	"empty_message" varchar,
  	"block_name" varchar
  );

  DO $migration$
  DECLARE
    collection_prefix text;
    main_prefixes text[] := ARRAY['pages', 'posts', 'events', 'event_cycles', 'partners', 'homepage_sections'];
    version_prefixes text[] := ARRAY['_pages_v', '_posts_v', '_events_v', '_event_cycles_v', '_partners_v'];
  BEGIN
    FOREACH collection_prefix IN ARRAY main_prefixes LOOP
      EXECUTE format($statement$
        INSERT INTO %I (
          _order, _parent_id, _path, id, frame, surface, surface_image_id,
          surface_horizontal_position, surface_vertical_position, selection_mode,
          category_id, tag_id, sort, view, page_size, pagination, empty_message, block_name
        )
        SELECT
          _order, _parent_id, _path, substring(id FROM 11), frame, surface, surface_image_id,
          surface_horizontal_position, surface_vertical_position,
          selection_mode::text::%I, category_id, tag_id, sort::text::%I,
          (CASE WHEN view::text = 'compact' THEN 'list' ELSE view::text END)::%I,
          page_size, pagination, empty_message, block_name
        FROM %I
        WHERE id LIKE 'documents-%%'
      $statement$,
        collection_prefix || '_blocks_documents',
        'enum_' || collection_prefix || '_blocks_documents_selection_mode',
        'enum_' || collection_prefix || '_blocks_documents_sort',
        'enum_' || collection_prefix || '_blocks_documents_view',
        collection_prefix || '_blocks_listing'
      );

      EXECUTE format($statement$
        INSERT INTO %I (_order, _parent_id, id, document_id)
        SELECT
          listing_item._order,
          substring(listing_item._parent_id FROM 11),
          substring(listing_item.id FROM 11),
          relationship.documents_id
        FROM %I AS listing_item
        INNER JOIN %I AS listing_block ON listing_block.id = listing_item._parent_id
        LEFT JOIN %I AS relationship
          ON relationship.parent_id = listing_block._parent_id
          AND relationship.path = listing_block._path || '.' || (listing_block._order - 1)::text ||
            '.items.' || (listing_item._order - 1)::text || '.item'
        WHERE listing_item.id LIKE 'documents-%%'
      $statement$,
        collection_prefix || '_blocks_documents_items',
        collection_prefix || '_blocks_listing_items',
        collection_prefix || '_blocks_listing',
        collection_prefix || '_rels'
      );

      EXECUTE format(
        'DELETE FROM %I WHERE documents_id IS NOT NULL',
        collection_prefix || '_rels'
      );
      EXECUTE format(
        'DELETE FROM %I WHERE value::text = ''documents''',
        collection_prefix || '_blocks_listing_sources'
      );
      EXECUTE format(
        'DELETE FROM %I WHERE value::text = ''documents''',
        collection_prefix || '_blocks_carousel_sources'
      );
      EXECUTE format(
        'DELETE FROM %I WHERE id LIKE ''documents-%%''',
        collection_prefix || '_blocks_listing'
      );
      EXECUTE format(
        'UPDATE %I SET view = ''cards'' WHERE view::text = ''carousel''',
        collection_prefix || '_blocks_listing'
      );
    END LOOP;

    FOREACH collection_prefix IN ARRAY version_prefixes LOOP
      EXECUTE format($statement$
        INSERT INTO %I (
          _order, _parent_id, _path, frame, surface, surface_image_id,
          surface_horizontal_position, surface_vertical_position, selection_mode,
          category_id, tag_id, sort, view, page_size, pagination, empty_message, _uuid, block_name
        )
        SELECT
          _order, _parent_id, _path, frame, surface, surface_image_id,
          surface_horizontal_position, surface_vertical_position,
          selection_mode::text::%I, category_id, tag_id, sort::text::%I,
          (CASE WHEN view::text = 'compact' THEN 'list' ELSE view::text END)::%I,
          page_size, pagination, empty_message, substring(_uuid FROM 11), block_name
        FROM %I
        WHERE _uuid LIKE 'documents-%%'
      $statement$,
        collection_prefix || '_blocks_documents',
        'enum_' || collection_prefix || '_blocks_documents_selection_mode',
        'enum_' || collection_prefix || '_blocks_documents_sort',
        'enum_' || collection_prefix || '_blocks_documents_view',
        collection_prefix || '_blocks_listing'
      );

      EXECUTE format($statement$
        INSERT INTO %I (_order, _parent_id, document_id, _uuid)
        SELECT
          listing_item._order,
          document_block.id,
          relationship.documents_id,
          substring(listing_item._uuid FROM 11)
        FROM %I AS listing_item
        INNER JOIN %I AS listing_block ON listing_block.id = listing_item._parent_id
        INNER JOIN %I AS document_block
          ON document_block._uuid = substring(listing_block._uuid FROM 11)
          AND document_block._parent_id = listing_block._parent_id
          AND document_block._path = listing_block._path
          AND document_block._order = listing_block._order
        LEFT JOIN %I AS relationship
          ON relationship.parent_id = listing_block._parent_id
          AND relationship.path = listing_block._path || '.' || (listing_block._order - 1)::text ||
            '.items.' || (listing_item._order - 1)::text || '.item'
        WHERE listing_item._uuid LIKE 'documents-%%'
      $statement$,
        collection_prefix || '_blocks_documents_items',
        collection_prefix || '_blocks_listing_items',
        collection_prefix || '_blocks_listing',
        collection_prefix || '_blocks_documents',
        collection_prefix || '_rels'
      );

      EXECUTE format(
        'DELETE FROM %I WHERE documents_id IS NOT NULL',
        collection_prefix || '_rels'
      );
      EXECUTE format(
        'DELETE FROM %I WHERE value::text = ''documents''',
        collection_prefix || '_blocks_listing_sources'
      );
      EXECUTE format(
        'DELETE FROM %I WHERE value::text = ''documents''',
        collection_prefix || '_blocks_carousel_sources'
      );
      EXECUTE format(
        'DELETE FROM %I WHERE _uuid LIKE ''documents-%%''',
        collection_prefix || '_blocks_listing'
      );
      EXECUTE format(
        'UPDATE %I SET view = ''cards'' WHERE view::text = ''carousel''',
        collection_prefix || '_blocks_listing'
      );
    END LOOP;
  END
  $migration$;

  DELETE FROM "content_listing_items" WHERE "source" = 'documents';
  
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_documents_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_documents_fk";
  
  ALTER TABLE "posts_rels" DROP CONSTRAINT "posts_rels_documents_fk";
  
  ALTER TABLE "_posts_v_rels" DROP CONSTRAINT "_posts_v_rels_documents_fk";
  
  ALTER TABLE "events_rels" DROP CONSTRAINT "events_rels_documents_fk";
  
  ALTER TABLE "_events_v_rels" DROP CONSTRAINT "_events_v_rels_documents_fk";
  
  ALTER TABLE "event_cycles_rels" DROP CONSTRAINT "event_cycles_rels_documents_fk";
  
  ALTER TABLE "_event_cycles_v_rels" DROP CONSTRAINT "_event_cycles_v_rels_documents_fk";
  
  ALTER TABLE "partners_rels" DROP CONSTRAINT "partners_rels_documents_fk";
  
  ALTER TABLE "_partners_v_rels" DROP CONSTRAINT "_partners_v_rels_documents_fk";
  
  ALTER TABLE "homepage_sections_rels" DROP CONSTRAINT "homepage_sections_rels_documents_fk";
  
  ALTER TABLE "content_listing_items" ALTER COLUMN "source" SET DATA TYPE text;
  DROP TYPE "public"."enum_content_listing_items_source";
  CREATE TYPE "public"."enum_content_listing_items_source" AS ENUM('pages', 'posts', 'events', 'event-cycles');
  ALTER TABLE "content_listing_items" ALTER COLUMN "source" SET DATA TYPE "public"."enum_content_listing_items_source" USING "source"::"public"."enum_content_listing_items_source";
  ALTER TABLE "pages_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_pages_blocks_listing_sources";
  CREATE TYPE "public"."enum_pages_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles');
  ALTER TABLE "pages_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum_pages_blocks_listing_sources" USING "value"::"public"."enum_pages_blocks_listing_sources";
  ALTER TABLE "pages_blocks_listing" ALTER COLUMN "view" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::text;
  DROP TYPE "public"."enum_pages_blocks_listing_view";
  CREATE TYPE "public"."enum_pages_blocks_listing_view" AS ENUM('cards', 'compact', 'grid', 'tiles');
  ALTER TABLE "pages_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::"public"."enum_pages_blocks_listing_view";
  ALTER TABLE "pages_blocks_listing" ALTER COLUMN "view" SET DATA TYPE "public"."enum_pages_blocks_listing_view" USING "view"::"public"."enum_pages_blocks_listing_view";
  ALTER TABLE "pages_blocks_carousel_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_pages_blocks_carousel_sources";
  CREATE TYPE "public"."enum_pages_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles');
  ALTER TABLE "pages_blocks_carousel_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum_pages_blocks_carousel_sources" USING "value"::"public"."enum_pages_blocks_carousel_sources";
  ALTER TABLE "_pages_v_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum__pages_v_blocks_listing_sources";
  CREATE TYPE "public"."enum__pages_v_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles');
  ALTER TABLE "_pages_v_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum__pages_v_blocks_listing_sources" USING "value"::"public"."enum__pages_v_blocks_listing_sources";
  ALTER TABLE "_pages_v_blocks_listing" ALTER COLUMN "view" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::text;
  DROP TYPE "public"."enum__pages_v_blocks_listing_view";
  CREATE TYPE "public"."enum__pages_v_blocks_listing_view" AS ENUM('cards', 'compact', 'grid', 'tiles');
  ALTER TABLE "_pages_v_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::"public"."enum__pages_v_blocks_listing_view";
  ALTER TABLE "_pages_v_blocks_listing" ALTER COLUMN "view" SET DATA TYPE "public"."enum__pages_v_blocks_listing_view" USING "view"::"public"."enum__pages_v_blocks_listing_view";
  ALTER TABLE "_pages_v_blocks_carousel_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum__pages_v_blocks_carousel_sources";
  CREATE TYPE "public"."enum__pages_v_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles');
  ALTER TABLE "_pages_v_blocks_carousel_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum__pages_v_blocks_carousel_sources" USING "value"::"public"."enum__pages_v_blocks_carousel_sources";
  ALTER TABLE "posts_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_posts_blocks_listing_sources";
  CREATE TYPE "public"."enum_posts_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles');
  ALTER TABLE "posts_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum_posts_blocks_listing_sources" USING "value"::"public"."enum_posts_blocks_listing_sources";
  ALTER TABLE "posts_blocks_listing" ALTER COLUMN "view" SET DATA TYPE text;
  ALTER TABLE "posts_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::text;
  DROP TYPE "public"."enum_posts_blocks_listing_view";
  CREATE TYPE "public"."enum_posts_blocks_listing_view" AS ENUM('cards', 'compact', 'grid', 'tiles');
  ALTER TABLE "posts_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::"public"."enum_posts_blocks_listing_view";
  ALTER TABLE "posts_blocks_listing" ALTER COLUMN "view" SET DATA TYPE "public"."enum_posts_blocks_listing_view" USING "view"::"public"."enum_posts_blocks_listing_view";
  ALTER TABLE "posts_blocks_carousel_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_posts_blocks_carousel_sources";
  CREATE TYPE "public"."enum_posts_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles');
  ALTER TABLE "posts_blocks_carousel_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum_posts_blocks_carousel_sources" USING "value"::"public"."enum_posts_blocks_carousel_sources";
  ALTER TABLE "_posts_v_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum__posts_v_blocks_listing_sources";
  CREATE TYPE "public"."enum__posts_v_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles');
  ALTER TABLE "_posts_v_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum__posts_v_blocks_listing_sources" USING "value"::"public"."enum__posts_v_blocks_listing_sources";
  ALTER TABLE "_posts_v_blocks_listing" ALTER COLUMN "view" SET DATA TYPE text;
  ALTER TABLE "_posts_v_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::text;
  DROP TYPE "public"."enum__posts_v_blocks_listing_view";
  CREATE TYPE "public"."enum__posts_v_blocks_listing_view" AS ENUM('cards', 'compact', 'grid', 'tiles');
  ALTER TABLE "_posts_v_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::"public"."enum__posts_v_blocks_listing_view";
  ALTER TABLE "_posts_v_blocks_listing" ALTER COLUMN "view" SET DATA TYPE "public"."enum__posts_v_blocks_listing_view" USING "view"::"public"."enum__posts_v_blocks_listing_view";
  ALTER TABLE "_posts_v_blocks_carousel_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum__posts_v_blocks_carousel_sources";
  CREATE TYPE "public"."enum__posts_v_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles');
  ALTER TABLE "_posts_v_blocks_carousel_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum__posts_v_blocks_carousel_sources" USING "value"::"public"."enum__posts_v_blocks_carousel_sources";
  ALTER TABLE "events_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_events_blocks_listing_sources";
  CREATE TYPE "public"."enum_events_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles');
  ALTER TABLE "events_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum_events_blocks_listing_sources" USING "value"::"public"."enum_events_blocks_listing_sources";
  ALTER TABLE "events_blocks_listing" ALTER COLUMN "view" SET DATA TYPE text;
  ALTER TABLE "events_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::text;
  DROP TYPE "public"."enum_events_blocks_listing_view";
  CREATE TYPE "public"."enum_events_blocks_listing_view" AS ENUM('cards', 'compact', 'grid', 'tiles');
  ALTER TABLE "events_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::"public"."enum_events_blocks_listing_view";
  ALTER TABLE "events_blocks_listing" ALTER COLUMN "view" SET DATA TYPE "public"."enum_events_blocks_listing_view" USING "view"::"public"."enum_events_blocks_listing_view";
  ALTER TABLE "events_blocks_carousel_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_events_blocks_carousel_sources";
  CREATE TYPE "public"."enum_events_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles');
  ALTER TABLE "events_blocks_carousel_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum_events_blocks_carousel_sources" USING "value"::"public"."enum_events_blocks_carousel_sources";
  ALTER TABLE "_events_v_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum__events_v_blocks_listing_sources";
  CREATE TYPE "public"."enum__events_v_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles');
  ALTER TABLE "_events_v_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum__events_v_blocks_listing_sources" USING "value"::"public"."enum__events_v_blocks_listing_sources";
  ALTER TABLE "_events_v_blocks_listing" ALTER COLUMN "view" SET DATA TYPE text;
  ALTER TABLE "_events_v_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::text;
  DROP TYPE "public"."enum__events_v_blocks_listing_view";
  CREATE TYPE "public"."enum__events_v_blocks_listing_view" AS ENUM('cards', 'compact', 'grid', 'tiles');
  ALTER TABLE "_events_v_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::"public"."enum__events_v_blocks_listing_view";
  ALTER TABLE "_events_v_blocks_listing" ALTER COLUMN "view" SET DATA TYPE "public"."enum__events_v_blocks_listing_view" USING "view"::"public"."enum__events_v_blocks_listing_view";
  ALTER TABLE "_events_v_blocks_carousel_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum__events_v_blocks_carousel_sources";
  CREATE TYPE "public"."enum__events_v_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles');
  ALTER TABLE "_events_v_blocks_carousel_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum__events_v_blocks_carousel_sources" USING "value"::"public"."enum__events_v_blocks_carousel_sources";
  ALTER TABLE "event_cycles_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_event_cycles_blocks_listing_sources";
  CREATE TYPE "public"."enum_event_cycles_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles');
  ALTER TABLE "event_cycles_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum_event_cycles_blocks_listing_sources" USING "value"::"public"."enum_event_cycles_blocks_listing_sources";
  ALTER TABLE "event_cycles_blocks_listing" ALTER COLUMN "view" SET DATA TYPE text;
  ALTER TABLE "event_cycles_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::text;
  DROP TYPE "public"."enum_event_cycles_blocks_listing_view";
  CREATE TYPE "public"."enum_event_cycles_blocks_listing_view" AS ENUM('cards', 'compact', 'grid', 'tiles');
  ALTER TABLE "event_cycles_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::"public"."enum_event_cycles_blocks_listing_view";
  ALTER TABLE "event_cycles_blocks_listing" ALTER COLUMN "view" SET DATA TYPE "public"."enum_event_cycles_blocks_listing_view" USING "view"::"public"."enum_event_cycles_blocks_listing_view";
  ALTER TABLE "event_cycles_blocks_carousel_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_event_cycles_blocks_carousel_sources";
  CREATE TYPE "public"."enum_event_cycles_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles');
  ALTER TABLE "event_cycles_blocks_carousel_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum_event_cycles_blocks_carousel_sources" USING "value"::"public"."enum_event_cycles_blocks_carousel_sources";
  ALTER TABLE "_event_cycles_v_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum__event_cycles_v_blocks_listing_sources";
  CREATE TYPE "public"."enum__event_cycles_v_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles');
  ALTER TABLE "_event_cycles_v_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum__event_cycles_v_blocks_listing_sources" USING "value"::"public"."enum__event_cycles_v_blocks_listing_sources";
  ALTER TABLE "_event_cycles_v_blocks_listing" ALTER COLUMN "view" SET DATA TYPE text;
  ALTER TABLE "_event_cycles_v_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::text;
  DROP TYPE "public"."enum__event_cycles_v_blocks_listing_view";
  CREATE TYPE "public"."enum__event_cycles_v_blocks_listing_view" AS ENUM('cards', 'compact', 'grid', 'tiles');
  ALTER TABLE "_event_cycles_v_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::"public"."enum__event_cycles_v_blocks_listing_view";
  ALTER TABLE "_event_cycles_v_blocks_listing" ALTER COLUMN "view" SET DATA TYPE "public"."enum__event_cycles_v_blocks_listing_view" USING "view"::"public"."enum__event_cycles_v_blocks_listing_view";
  ALTER TABLE "_event_cycles_v_blocks_carousel_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum__event_cycles_v_blocks_carousel_sources";
  CREATE TYPE "public"."enum__event_cycles_v_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles');
  ALTER TABLE "_event_cycles_v_blocks_carousel_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum__event_cycles_v_blocks_carousel_sources" USING "value"::"public"."enum__event_cycles_v_blocks_carousel_sources";
  ALTER TABLE "partners_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_partners_blocks_listing_sources";
  CREATE TYPE "public"."enum_partners_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles');
  ALTER TABLE "partners_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum_partners_blocks_listing_sources" USING "value"::"public"."enum_partners_blocks_listing_sources";
  ALTER TABLE "partners_blocks_listing" ALTER COLUMN "view" SET DATA TYPE text;
  ALTER TABLE "partners_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::text;
  DROP TYPE "public"."enum_partners_blocks_listing_view";
  CREATE TYPE "public"."enum_partners_blocks_listing_view" AS ENUM('cards', 'compact', 'grid', 'tiles');
  ALTER TABLE "partners_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::"public"."enum_partners_blocks_listing_view";
  ALTER TABLE "partners_blocks_listing" ALTER COLUMN "view" SET DATA TYPE "public"."enum_partners_blocks_listing_view" USING "view"::"public"."enum_partners_blocks_listing_view";
  ALTER TABLE "partners_blocks_carousel_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_partners_blocks_carousel_sources";
  CREATE TYPE "public"."enum_partners_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles');
  ALTER TABLE "partners_blocks_carousel_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum_partners_blocks_carousel_sources" USING "value"::"public"."enum_partners_blocks_carousel_sources";
  ALTER TABLE "_partners_v_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum__partners_v_blocks_listing_sources";
  CREATE TYPE "public"."enum__partners_v_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles');
  ALTER TABLE "_partners_v_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum__partners_v_blocks_listing_sources" USING "value"::"public"."enum__partners_v_blocks_listing_sources";
  ALTER TABLE "_partners_v_blocks_listing" ALTER COLUMN "view" SET DATA TYPE text;
  ALTER TABLE "_partners_v_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::text;
  DROP TYPE "public"."enum__partners_v_blocks_listing_view";
  CREATE TYPE "public"."enum__partners_v_blocks_listing_view" AS ENUM('cards', 'compact', 'grid', 'tiles');
  ALTER TABLE "_partners_v_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::"public"."enum__partners_v_blocks_listing_view";
  ALTER TABLE "_partners_v_blocks_listing" ALTER COLUMN "view" SET DATA TYPE "public"."enum__partners_v_blocks_listing_view" USING "view"::"public"."enum__partners_v_blocks_listing_view";
  ALTER TABLE "_partners_v_blocks_carousel_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum__partners_v_blocks_carousel_sources";
  CREATE TYPE "public"."enum__partners_v_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles');
  ALTER TABLE "_partners_v_blocks_carousel_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum__partners_v_blocks_carousel_sources" USING "value"::"public"."enum__partners_v_blocks_carousel_sources";
  ALTER TABLE "homepage_sections_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_homepage_sections_blocks_listing_sources";
  CREATE TYPE "public"."enum_homepage_sections_blocks_listing_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles');
  ALTER TABLE "homepage_sections_blocks_listing_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum_homepage_sections_blocks_listing_sources" USING "value"::"public"."enum_homepage_sections_blocks_listing_sources";
  ALTER TABLE "homepage_sections_blocks_listing" ALTER COLUMN "view" SET DATA TYPE text;
  ALTER TABLE "homepage_sections_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::text;
  DROP TYPE "public"."enum_homepage_sections_blocks_listing_view";
  CREATE TYPE "public"."enum_homepage_sections_blocks_listing_view" AS ENUM('cards', 'compact', 'grid', 'tiles');
  ALTER TABLE "homepage_sections_blocks_listing" ALTER COLUMN "view" SET DEFAULT 'cards'::"public"."enum_homepage_sections_blocks_listing_view";
  ALTER TABLE "homepage_sections_blocks_listing" ALTER COLUMN "view" SET DATA TYPE "public"."enum_homepage_sections_blocks_listing_view" USING "view"::"public"."enum_homepage_sections_blocks_listing_view";
  ALTER TABLE "homepage_sections_blocks_carousel_sources" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_homepage_sections_blocks_carousel_sources";
  CREATE TYPE "public"."enum_homepage_sections_blocks_carousel_sources" AS ENUM('pages', 'posts', 'events', 'event-cycles');
  ALTER TABLE "homepage_sections_blocks_carousel_sources" ALTER COLUMN "value" SET DATA TYPE "public"."enum_homepage_sections_blocks_carousel_sources" USING "value"::"public"."enum_homepage_sections_blocks_carousel_sources";
  DROP INDEX "pages_rels_documents_id_idx";
  DROP INDEX "_pages_v_rels_documents_id_idx";
  DROP INDEX "posts_rels_documents_id_idx";
  DROP INDEX "_posts_v_rels_documents_id_idx";
  DROP INDEX "events_rels_documents_id_idx";
  DROP INDEX "_events_v_rels_documents_id_idx";
  DROP INDEX "event_cycles_rels_documents_id_idx";
  DROP INDEX "_event_cycles_v_rels_documents_id_idx";
  DROP INDEX "partners_rels_documents_id_idx";
  DROP INDEX "_partners_v_rels_documents_id_idx";
  DROP INDEX "homepage_sections_rels_documents_id_idx";
  ALTER TABLE "pages_blocks_documents_items" ADD CONSTRAINT "pages_blocks_documents_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_documents_items" ADD CONSTRAINT "pages_blocks_documents_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_documents" ADD CONSTRAINT "pages_blocks_documents_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_documents" ADD CONSTRAINT "pages_blocks_documents_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_documents" ADD CONSTRAINT "pages_blocks_documents_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_documents" ADD CONSTRAINT "pages_blocks_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_documents_items" ADD CONSTRAINT "_pages_v_blocks_documents_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_documents_items" ADD CONSTRAINT "_pages_v_blocks_documents_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_documents" ADD CONSTRAINT "_pages_v_blocks_documents_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_documents" ADD CONSTRAINT "_pages_v_blocks_documents_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_documents" ADD CONSTRAINT "_pages_v_blocks_documents_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_documents" ADD CONSTRAINT "_pages_v_blocks_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_documents_items" ADD CONSTRAINT "posts_blocks_documents_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_documents_items" ADD CONSTRAINT "posts_blocks_documents_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_documents" ADD CONSTRAINT "posts_blocks_documents_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_documents" ADD CONSTRAINT "posts_blocks_documents_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_documents" ADD CONSTRAINT "posts_blocks_documents_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_documents" ADD CONSTRAINT "posts_blocks_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_documents_items" ADD CONSTRAINT "_posts_v_blocks_documents_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_documents_items" ADD CONSTRAINT "_posts_v_blocks_documents_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_documents" ADD CONSTRAINT "_posts_v_blocks_documents_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_documents" ADD CONSTRAINT "_posts_v_blocks_documents_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_documents" ADD CONSTRAINT "_posts_v_blocks_documents_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_documents" ADD CONSTRAINT "_posts_v_blocks_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_blocks_documents_items" ADD CONSTRAINT "events_blocks_documents_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_documents_items" ADD CONSTRAINT "events_blocks_documents_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events_blocks_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_blocks_documents" ADD CONSTRAINT "events_blocks_documents_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_documents" ADD CONSTRAINT "events_blocks_documents_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_documents" ADD CONSTRAINT "events_blocks_documents_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_documents" ADD CONSTRAINT "events_blocks_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_documents_items" ADD CONSTRAINT "_events_v_blocks_documents_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_documents_items" ADD CONSTRAINT "_events_v_blocks_documents_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v_blocks_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_documents" ADD CONSTRAINT "_events_v_blocks_documents_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_documents" ADD CONSTRAINT "_events_v_blocks_documents_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_documents" ADD CONSTRAINT "_events_v_blocks_documents_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_documents" ADD CONSTRAINT "_events_v_blocks_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_documents_items" ADD CONSTRAINT "event_cycles_blocks_documents_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_documents_items" ADD CONSTRAINT "event_cycles_blocks_documents_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_cycles_blocks_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_documents" ADD CONSTRAINT "event_cycles_blocks_documents_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_documents" ADD CONSTRAINT "event_cycles_blocks_documents_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_documents" ADD CONSTRAINT "event_cycles_blocks_documents_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_documents" ADD CONSTRAINT "event_cycles_blocks_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_cycles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_documents_items" ADD CONSTRAINT "_event_cycles_v_blocks_documents_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_documents_items" ADD CONSTRAINT "_event_cycles_v_blocks_documents_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_event_cycles_v_blocks_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_documents" ADD CONSTRAINT "_event_cycles_v_blocks_documents_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_documents" ADD CONSTRAINT "_event_cycles_v_blocks_documents_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_documents" ADD CONSTRAINT "_event_cycles_v_blocks_documents_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_documents" ADD CONSTRAINT "_event_cycles_v_blocks_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_event_cycles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_blocks_documents_items" ADD CONSTRAINT "partners_blocks_documents_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_documents_items" ADD CONSTRAINT "partners_blocks_documents_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners_blocks_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_blocks_documents" ADD CONSTRAINT "partners_blocks_documents_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_documents" ADD CONSTRAINT "partners_blocks_documents_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_documents" ADD CONSTRAINT "partners_blocks_documents_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_documents" ADD CONSTRAINT "partners_blocks_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_documents_items" ADD CONSTRAINT "_partners_v_blocks_documents_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_documents_items" ADD CONSTRAINT "_partners_v_blocks_documents_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partners_v_blocks_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_documents" ADD CONSTRAINT "_partners_v_blocks_documents_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_documents" ADD CONSTRAINT "_partners_v_blocks_documents_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_documents" ADD CONSTRAINT "_partners_v_blocks_documents_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_documents" ADD CONSTRAINT "_partners_v_blocks_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partners_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_documents_items" ADD CONSTRAINT "homepage_sections_blocks_documents_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_documents_items" ADD CONSTRAINT "homepage_sections_blocks_documents_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections_blocks_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_documents" ADD CONSTRAINT "homepage_sections_blocks_documents_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_documents" ADD CONSTRAINT "homepage_sections_blocks_documents_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_documents" ADD CONSTRAINT "homepage_sections_blocks_documents_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_documents" ADD CONSTRAINT "homepage_sections_blocks_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_documents_items_order_idx" ON "pages_blocks_documents_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_documents_items_parent_id_idx" ON "pages_blocks_documents_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_documents_items_document_idx" ON "pages_blocks_documents_items" USING btree ("document_id");
  CREATE INDEX "pages_blocks_documents_order_idx" ON "pages_blocks_documents" USING btree ("_order");
  CREATE INDEX "pages_blocks_documents_parent_id_idx" ON "pages_blocks_documents" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_documents_path_idx" ON "pages_blocks_documents" USING btree ("_path");
  CREATE INDEX "pages_blocks_documents_surface_image_idx" ON "pages_blocks_documents" USING btree ("surface_image_id");
  CREATE INDEX "pages_blocks_documents_category_idx" ON "pages_blocks_documents" USING btree ("category_id");
  CREATE INDEX "pages_blocks_documents_tag_idx" ON "pages_blocks_documents" USING btree ("tag_id");
  CREATE INDEX "_pages_v_blocks_documents_items_order_idx" ON "_pages_v_blocks_documents_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_documents_items_parent_id_idx" ON "_pages_v_blocks_documents_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_documents_items_document_idx" ON "_pages_v_blocks_documents_items" USING btree ("document_id");
  CREATE INDEX "_pages_v_blocks_documents_order_idx" ON "_pages_v_blocks_documents" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_documents_parent_id_idx" ON "_pages_v_blocks_documents" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_documents_path_idx" ON "_pages_v_blocks_documents" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_documents_surface_image_idx" ON "_pages_v_blocks_documents" USING btree ("surface_image_id");
  CREATE INDEX "_pages_v_blocks_documents_category_idx" ON "_pages_v_blocks_documents" USING btree ("category_id");
  CREATE INDEX "_pages_v_blocks_documents_tag_idx" ON "_pages_v_blocks_documents" USING btree ("tag_id");
  CREATE INDEX "posts_blocks_documents_items_order_idx" ON "posts_blocks_documents_items" USING btree ("_order");
  CREATE INDEX "posts_blocks_documents_items_parent_id_idx" ON "posts_blocks_documents_items" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_documents_items_document_idx" ON "posts_blocks_documents_items" USING btree ("document_id");
  CREATE INDEX "posts_blocks_documents_order_idx" ON "posts_blocks_documents" USING btree ("_order");
  CREATE INDEX "posts_blocks_documents_parent_id_idx" ON "posts_blocks_documents" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_documents_path_idx" ON "posts_blocks_documents" USING btree ("_path");
  CREATE INDEX "posts_blocks_documents_surface_image_idx" ON "posts_blocks_documents" USING btree ("surface_image_id");
  CREATE INDEX "posts_blocks_documents_category_idx" ON "posts_blocks_documents" USING btree ("category_id");
  CREATE INDEX "posts_blocks_documents_tag_idx" ON "posts_blocks_documents" USING btree ("tag_id");
  CREATE INDEX "_posts_v_blocks_documents_items_order_idx" ON "_posts_v_blocks_documents_items" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_documents_items_parent_id_idx" ON "_posts_v_blocks_documents_items" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_documents_items_document_idx" ON "_posts_v_blocks_documents_items" USING btree ("document_id");
  CREATE INDEX "_posts_v_blocks_documents_order_idx" ON "_posts_v_blocks_documents" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_documents_parent_id_idx" ON "_posts_v_blocks_documents" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_documents_path_idx" ON "_posts_v_blocks_documents" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_documents_surface_image_idx" ON "_posts_v_blocks_documents" USING btree ("surface_image_id");
  CREATE INDEX "_posts_v_blocks_documents_category_idx" ON "_posts_v_blocks_documents" USING btree ("category_id");
  CREATE INDEX "_posts_v_blocks_documents_tag_idx" ON "_posts_v_blocks_documents" USING btree ("tag_id");
  CREATE INDEX "events_blocks_documents_items_order_idx" ON "events_blocks_documents_items" USING btree ("_order");
  CREATE INDEX "events_blocks_documents_items_parent_id_idx" ON "events_blocks_documents_items" USING btree ("_parent_id");
  CREATE INDEX "events_blocks_documents_items_document_idx" ON "events_blocks_documents_items" USING btree ("document_id");
  CREATE INDEX "events_blocks_documents_order_idx" ON "events_blocks_documents" USING btree ("_order");
  CREATE INDEX "events_blocks_documents_parent_id_idx" ON "events_blocks_documents" USING btree ("_parent_id");
  CREATE INDEX "events_blocks_documents_path_idx" ON "events_blocks_documents" USING btree ("_path");
  CREATE INDEX "events_blocks_documents_surface_image_idx" ON "events_blocks_documents" USING btree ("surface_image_id");
  CREATE INDEX "events_blocks_documents_category_idx" ON "events_blocks_documents" USING btree ("category_id");
  CREATE INDEX "events_blocks_documents_tag_idx" ON "events_blocks_documents" USING btree ("tag_id");
  CREATE INDEX "_events_v_blocks_documents_items_order_idx" ON "_events_v_blocks_documents_items" USING btree ("_order");
  CREATE INDEX "_events_v_blocks_documents_items_parent_id_idx" ON "_events_v_blocks_documents_items" USING btree ("_parent_id");
  CREATE INDEX "_events_v_blocks_documents_items_document_idx" ON "_events_v_blocks_documents_items" USING btree ("document_id");
  CREATE INDEX "_events_v_blocks_documents_order_idx" ON "_events_v_blocks_documents" USING btree ("_order");
  CREATE INDEX "_events_v_blocks_documents_parent_id_idx" ON "_events_v_blocks_documents" USING btree ("_parent_id");
  CREATE INDEX "_events_v_blocks_documents_path_idx" ON "_events_v_blocks_documents" USING btree ("_path");
  CREATE INDEX "_events_v_blocks_documents_surface_image_idx" ON "_events_v_blocks_documents" USING btree ("surface_image_id");
  CREATE INDEX "_events_v_blocks_documents_category_idx" ON "_events_v_blocks_documents" USING btree ("category_id");
  CREATE INDEX "_events_v_blocks_documents_tag_idx" ON "_events_v_blocks_documents" USING btree ("tag_id");
  CREATE INDEX "event_cycles_blocks_documents_items_order_idx" ON "event_cycles_blocks_documents_items" USING btree ("_order");
  CREATE INDEX "event_cycles_blocks_documents_items_parent_id_idx" ON "event_cycles_blocks_documents_items" USING btree ("_parent_id");
  CREATE INDEX "event_cycles_blocks_documents_items_document_idx" ON "event_cycles_blocks_documents_items" USING btree ("document_id");
  CREATE INDEX "event_cycles_blocks_documents_order_idx" ON "event_cycles_blocks_documents" USING btree ("_order");
  CREATE INDEX "event_cycles_blocks_documents_parent_id_idx" ON "event_cycles_blocks_documents" USING btree ("_parent_id");
  CREATE INDEX "event_cycles_blocks_documents_path_idx" ON "event_cycles_blocks_documents" USING btree ("_path");
  CREATE INDEX "event_cycles_blocks_documents_surface_image_idx" ON "event_cycles_blocks_documents" USING btree ("surface_image_id");
  CREATE INDEX "event_cycles_blocks_documents_category_idx" ON "event_cycles_blocks_documents" USING btree ("category_id");
  CREATE INDEX "event_cycles_blocks_documents_tag_idx" ON "event_cycles_blocks_documents" USING btree ("tag_id");
  CREATE INDEX "_event_cycles_v_blocks_documents_items_order_idx" ON "_event_cycles_v_blocks_documents_items" USING btree ("_order");
  CREATE INDEX "_event_cycles_v_blocks_documents_items_parent_id_idx" ON "_event_cycles_v_blocks_documents_items" USING btree ("_parent_id");
  CREATE INDEX "_event_cycles_v_blocks_documents_items_document_idx" ON "_event_cycles_v_blocks_documents_items" USING btree ("document_id");
  CREATE INDEX "_event_cycles_v_blocks_documents_order_idx" ON "_event_cycles_v_blocks_documents" USING btree ("_order");
  CREATE INDEX "_event_cycles_v_blocks_documents_parent_id_idx" ON "_event_cycles_v_blocks_documents" USING btree ("_parent_id");
  CREATE INDEX "_event_cycles_v_blocks_documents_path_idx" ON "_event_cycles_v_blocks_documents" USING btree ("_path");
  CREATE INDEX "_event_cycles_v_blocks_documents_surface_image_idx" ON "_event_cycles_v_blocks_documents" USING btree ("surface_image_id");
  CREATE INDEX "_event_cycles_v_blocks_documents_category_idx" ON "_event_cycles_v_blocks_documents" USING btree ("category_id");
  CREATE INDEX "_event_cycles_v_blocks_documents_tag_idx" ON "_event_cycles_v_blocks_documents" USING btree ("tag_id");
  CREATE INDEX "partners_blocks_documents_items_order_idx" ON "partners_blocks_documents_items" USING btree ("_order");
  CREATE INDEX "partners_blocks_documents_items_parent_id_idx" ON "partners_blocks_documents_items" USING btree ("_parent_id");
  CREATE INDEX "partners_blocks_documents_items_document_idx" ON "partners_blocks_documents_items" USING btree ("document_id");
  CREATE INDEX "partners_blocks_documents_order_idx" ON "partners_blocks_documents" USING btree ("_order");
  CREATE INDEX "partners_blocks_documents_parent_id_idx" ON "partners_blocks_documents" USING btree ("_parent_id");
  CREATE INDEX "partners_blocks_documents_path_idx" ON "partners_blocks_documents" USING btree ("_path");
  CREATE INDEX "partners_blocks_documents_surface_image_idx" ON "partners_blocks_documents" USING btree ("surface_image_id");
  CREATE INDEX "partners_blocks_documents_category_idx" ON "partners_blocks_documents" USING btree ("category_id");
  CREATE INDEX "partners_blocks_documents_tag_idx" ON "partners_blocks_documents" USING btree ("tag_id");
  CREATE INDEX "_partners_v_blocks_documents_items_order_idx" ON "_partners_v_blocks_documents_items" USING btree ("_order");
  CREATE INDEX "_partners_v_blocks_documents_items_parent_id_idx" ON "_partners_v_blocks_documents_items" USING btree ("_parent_id");
  CREATE INDEX "_partners_v_blocks_documents_items_document_idx" ON "_partners_v_blocks_documents_items" USING btree ("document_id");
  CREATE INDEX "_partners_v_blocks_documents_order_idx" ON "_partners_v_blocks_documents" USING btree ("_order");
  CREATE INDEX "_partners_v_blocks_documents_parent_id_idx" ON "_partners_v_blocks_documents" USING btree ("_parent_id");
  CREATE INDEX "_partners_v_blocks_documents_path_idx" ON "_partners_v_blocks_documents" USING btree ("_path");
  CREATE INDEX "_partners_v_blocks_documents_surface_image_idx" ON "_partners_v_blocks_documents" USING btree ("surface_image_id");
  CREATE INDEX "_partners_v_blocks_documents_category_idx" ON "_partners_v_blocks_documents" USING btree ("category_id");
  CREATE INDEX "_partners_v_blocks_documents_tag_idx" ON "_partners_v_blocks_documents" USING btree ("tag_id");
  CREATE INDEX "homepage_sections_blocks_documents_items_order_idx" ON "homepage_sections_blocks_documents_items" USING btree ("_order");
  CREATE INDEX "homepage_sections_blocks_documents_items_parent_id_idx" ON "homepage_sections_blocks_documents_items" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_blocks_documents_items_document_idx" ON "homepage_sections_blocks_documents_items" USING btree ("document_id");
  CREATE INDEX "homepage_sections_blocks_documents_order_idx" ON "homepage_sections_blocks_documents" USING btree ("_order");
  CREATE INDEX "homepage_sections_blocks_documents_parent_id_idx" ON "homepage_sections_blocks_documents" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_blocks_documents_path_idx" ON "homepage_sections_blocks_documents" USING btree ("_path");
  CREATE INDEX "homepage_sections_blocks_documents_surface_image_idx" ON "homepage_sections_blocks_documents" USING btree ("surface_image_id");
  CREATE INDEX "homepage_sections_blocks_documents_category_idx" ON "homepage_sections_blocks_documents" USING btree ("category_id");
  CREATE INDEX "homepage_sections_blocks_documents_tag_idx" ON "homepage_sections_blocks_documents" USING btree ("tag_id");
  ALTER TABLE "pages_rels" DROP COLUMN "documents_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "documents_id";
  ALTER TABLE "posts_rels" DROP COLUMN "documents_id";
  ALTER TABLE "_posts_v_rels" DROP COLUMN "documents_id";
  ALTER TABLE "events_rels" DROP COLUMN "documents_id";
  ALTER TABLE "_events_v_rels" DROP COLUMN "documents_id";
  ALTER TABLE "event_cycles_rels" DROP COLUMN "documents_id";
  ALTER TABLE "_event_cycles_v_rels" DROP COLUMN "documents_id";
  ALTER TABLE "partners_rels" DROP COLUMN "documents_id";
  ALTER TABLE "_partners_v_rels" DROP COLUMN "documents_id";
  ALTER TABLE "homepage_sections_rels" DROP COLUMN "documents_id";

  ALTER TYPE "public"."enum_content_listing_items_source" ADD VALUE 'documents';
  ALTER TYPE "public"."enum_pages_blocks_listing_sources" ADD VALUE 'documents';
  ALTER TYPE "public"."enum_pages_blocks_listing_view" ADD VALUE 'carousel' BEFORE 'compact';
  ALTER TYPE "public"."enum_pages_blocks_carousel_sources" ADD VALUE 'documents';
  ALTER TYPE "public"."enum__pages_v_blocks_listing_sources" ADD VALUE 'documents';
  ALTER TYPE "public"."enum__pages_v_blocks_listing_view" ADD VALUE 'carousel' BEFORE 'compact';
  ALTER TYPE "public"."enum__pages_v_blocks_carousel_sources" ADD VALUE 'documents';
  ALTER TYPE "public"."enum_posts_blocks_listing_sources" ADD VALUE 'documents';
  ALTER TYPE "public"."enum_posts_blocks_listing_view" ADD VALUE 'carousel' BEFORE 'compact';
  ALTER TYPE "public"."enum_posts_blocks_carousel_sources" ADD VALUE 'documents';
  ALTER TYPE "public"."enum__posts_v_blocks_listing_sources" ADD VALUE 'documents';
  ALTER TYPE "public"."enum__posts_v_blocks_listing_view" ADD VALUE 'carousel' BEFORE 'compact';
  ALTER TYPE "public"."enum__posts_v_blocks_carousel_sources" ADD VALUE 'documents';
  ALTER TYPE "public"."enum_events_blocks_listing_sources" ADD VALUE 'documents';
  ALTER TYPE "public"."enum_events_blocks_listing_view" ADD VALUE 'carousel' BEFORE 'compact';
  ALTER TYPE "public"."enum_events_blocks_carousel_sources" ADD VALUE 'documents';
  ALTER TYPE "public"."enum__events_v_blocks_listing_sources" ADD VALUE 'documents';
  ALTER TYPE "public"."enum__events_v_blocks_listing_view" ADD VALUE 'carousel' BEFORE 'compact';
  ALTER TYPE "public"."enum__events_v_blocks_carousel_sources" ADD VALUE 'documents';
  ALTER TYPE "public"."enum_event_cycles_blocks_listing_sources" ADD VALUE 'documents';
  ALTER TYPE "public"."enum_event_cycles_blocks_listing_view" ADD VALUE 'carousel' BEFORE 'compact';
  ALTER TYPE "public"."enum_event_cycles_blocks_carousel_sources" ADD VALUE 'documents';
  ALTER TYPE "public"."enum__event_cycles_v_blocks_listing_sources" ADD VALUE 'documents';
  ALTER TYPE "public"."enum__event_cycles_v_blocks_listing_view" ADD VALUE 'carousel' BEFORE 'compact';
  ALTER TYPE "public"."enum__event_cycles_v_blocks_carousel_sources" ADD VALUE 'documents';
  ALTER TYPE "public"."enum_partners_blocks_listing_sources" ADD VALUE 'documents';
  ALTER TYPE "public"."enum_partners_blocks_listing_view" ADD VALUE 'carousel' BEFORE 'compact';
  ALTER TYPE "public"."enum_partners_blocks_carousel_sources" ADD VALUE 'documents';
  ALTER TYPE "public"."enum__partners_v_blocks_listing_sources" ADD VALUE 'documents';
  ALTER TYPE "public"."enum__partners_v_blocks_listing_view" ADD VALUE 'carousel' BEFORE 'compact';
  ALTER TYPE "public"."enum__partners_v_blocks_carousel_sources" ADD VALUE 'documents';
  ALTER TYPE "public"."enum_homepage_sections_blocks_listing_sources" ADD VALUE 'documents';
  ALTER TYPE "public"."enum_homepage_sections_blocks_listing_view" ADD VALUE 'carousel' BEFORE 'compact';
  ALTER TYPE "public"."enum_homepage_sections_blocks_carousel_sources" ADD VALUE 'documents';

  DO $migration$
  DECLARE
    collection_prefix text;
    prefixes text[] := ARRAY[
      'pages', '_pages_v', 'posts', '_posts_v', 'events', '_events_v',
      'event_cycles', '_event_cycles_v', 'partners', '_partners_v', 'homepage_sections'
    ];
  BEGIN
    FOREACH collection_prefix IN ARRAY prefixes LOOP
      EXECUTE format(
        'ALTER TABLE %I ADD COLUMN documents_id integer',
        collection_prefix || '_rels'
      );
      EXECUTE format(
        'ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (documents_id) REFERENCES documents(id) ON DELETE cascade ON UPDATE no action',
        collection_prefix || '_rels',
        collection_prefix || '_rels_documents_fk'
      );
      EXECUTE format(
        'CREATE INDEX %I ON %I USING btree (documents_id)',
        collection_prefix || '_rels_documents_id_idx',
        collection_prefix || '_rels'
      );
    END LOOP;
  END
  $migration$;
  `)
}
