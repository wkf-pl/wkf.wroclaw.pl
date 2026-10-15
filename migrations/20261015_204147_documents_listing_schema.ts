import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
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

    ALTER TABLE "pages_rels" ADD COLUMN "documents_id" integer;
    ALTER TABLE "_pages_v_rels" ADD COLUMN "documents_id" integer;
    ALTER TABLE "posts_rels" ADD COLUMN "documents_id" integer;
    ALTER TABLE "_posts_v_rels" ADD COLUMN "documents_id" integer;
    ALTER TABLE "events_rels" ADD COLUMN "documents_id" integer;
    ALTER TABLE "_events_v_rels" ADD COLUMN "documents_id" integer;
    ALTER TABLE "event_cycles_rels" ADD COLUMN "documents_id" integer;
    ALTER TABLE "_event_cycles_v_rels" ADD COLUMN "documents_id" integer;
    ALTER TABLE "partners_rels" ADD COLUMN "documents_id" integer;
    ALTER TABLE "_partners_v_rels" ADD COLUMN "documents_id" integer;
    ALTER TABLE "homepage_sections_rels" ADD COLUMN "documents_id" integer;

    ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "event_cycles_rels" ADD CONSTRAINT "event_cycles_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_event_cycles_v_rels" ADD CONSTRAINT "_event_cycles_v_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "partners_rels" ADD CONSTRAINT "partners_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_partners_v_rels" ADD CONSTRAINT "_partners_v_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "homepage_sections_rels" ADD CONSTRAINT "homepage_sections_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;

    CREATE INDEX "pages_rels_documents_id_idx" ON "pages_rels" USING btree ("documents_id");
    CREATE INDEX "_pages_v_rels_documents_id_idx" ON "_pages_v_rels" USING btree ("documents_id");
    CREATE INDEX "posts_rels_documents_id_idx" ON "posts_rels" USING btree ("documents_id");
    CREATE INDEX "_posts_v_rels_documents_id_idx" ON "_posts_v_rels" USING btree ("documents_id");
    CREATE INDEX "events_rels_documents_id_idx" ON "events_rels" USING btree ("documents_id");
    CREATE INDEX "_events_v_rels_documents_id_idx" ON "_events_v_rels" USING btree ("documents_id");
    CREATE INDEX "event_cycles_rels_documents_id_idx" ON "event_cycles_rels" USING btree ("documents_id");
    CREATE INDEX "_event_cycles_v_rels_documents_id_idx" ON "_event_cycles_v_rels" USING btree ("documents_id");
    CREATE INDEX "partners_rels_documents_id_idx" ON "partners_rels" USING btree ("documents_id");
    CREATE INDEX "_partners_v_rels_documents_id_idx" ON "_partners_v_rels" USING btree ("documents_id");
    CREATE INDEX "homepage_sections_rels_documents_id_idx" ON "homepage_sections_rels" USING btree ("documents_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DELETE FROM "content_listing_items" WHERE "source" = 'documents';

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
          'DELETE FROM %I WHERE value::text = ''documents''',
          collection_prefix || '_blocks_listing_sources'
        );
        EXECUTE format(
          'DELETE FROM %I WHERE value::text = ''documents''',
          collection_prefix || '_blocks_carousel_sources'
        );
        EXECUTE format(
          'UPDATE %I SET view = ''cards'' WHERE view::text = ''carousel''',
          collection_prefix || '_blocks_listing'
        );

        EXECUTE format(
          'ALTER TABLE %I ALTER COLUMN value TYPE text USING value::text',
          collection_prefix || '_blocks_listing_sources'
        );
        EXECUTE format('DROP TYPE %I', 'enum_' || collection_prefix || '_blocks_listing_sources');
        EXECUTE format(
          'CREATE TYPE %I AS ENUM (''pages'', ''posts'', ''events'', ''event-cycles'')',
          'enum_' || collection_prefix || '_blocks_listing_sources'
        );
        EXECUTE format(
          'ALTER TABLE %I ALTER COLUMN value TYPE %I USING value::%I',
          collection_prefix || '_blocks_listing_sources',
          'enum_' || collection_prefix || '_blocks_listing_sources',
          'enum_' || collection_prefix || '_blocks_listing_sources'
        );

        EXECUTE format(
          'ALTER TABLE %I ALTER COLUMN value TYPE text USING value::text',
          collection_prefix || '_blocks_carousel_sources'
        );
        EXECUTE format('DROP TYPE %I', 'enum_' || collection_prefix || '_blocks_carousel_sources');
        EXECUTE format(
          'CREATE TYPE %I AS ENUM (''pages'', ''posts'', ''events'', ''event-cycles'')',
          'enum_' || collection_prefix || '_blocks_carousel_sources'
        );
        EXECUTE format(
          'ALTER TABLE %I ALTER COLUMN value TYPE %I USING value::%I',
          collection_prefix || '_blocks_carousel_sources',
          'enum_' || collection_prefix || '_blocks_carousel_sources',
          'enum_' || collection_prefix || '_blocks_carousel_sources'
        );

        EXECUTE format(
          'ALTER TABLE %I ALTER COLUMN view DROP DEFAULT',
          collection_prefix || '_blocks_listing'
        );
        EXECUTE format(
          'ALTER TABLE %I ALTER COLUMN view TYPE text USING view::text',
          collection_prefix || '_blocks_listing'
        );
        EXECUTE format('DROP TYPE %I', 'enum_' || collection_prefix || '_blocks_listing_view');
        EXECUTE format(
          'CREATE TYPE %I AS ENUM (''cards'', ''compact'', ''grid'', ''tiles'')',
          'enum_' || collection_prefix || '_blocks_listing_view'
        );
        EXECUTE format(
          'ALTER TABLE %I ALTER COLUMN view TYPE %I USING view::%I',
          collection_prefix || '_blocks_listing',
          'enum_' || collection_prefix || '_blocks_listing_view',
          'enum_' || collection_prefix || '_blocks_listing_view'
        );
        EXECUTE format(
          'ALTER TABLE %I ALTER COLUMN view SET DEFAULT ''cards''::%I',
          collection_prefix || '_blocks_listing',
          'enum_' || collection_prefix || '_blocks_listing_view'
        );

        EXECUTE format(
          'ALTER TABLE %I DROP COLUMN documents_id',
          collection_prefix || '_rels'
        );
      END LOOP;
    END
    $migration$;

    ALTER TABLE "content_listing_items" ALTER COLUMN "source" TYPE text USING "source"::text;
    DROP TYPE "public"."enum_content_listing_items_source";
    CREATE TYPE "public"."enum_content_listing_items_source" AS ENUM('pages', 'posts', 'events', 'event-cycles');
    ALTER TABLE "content_listing_items" ALTER COLUMN "source" TYPE "public"."enum_content_listing_items_source" USING "source"::"public"."enum_content_listing_items_source";
  `)
}
