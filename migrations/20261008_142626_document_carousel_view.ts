import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_pages_blocks_documents_view" ADD VALUE 'carousel';
  ALTER TYPE "public"."enum__pages_v_blocks_documents_view" ADD VALUE 'carousel';
  ALTER TYPE "public"."enum_posts_blocks_documents_view" ADD VALUE 'carousel';
  ALTER TYPE "public"."enum__posts_v_blocks_documents_view" ADD VALUE 'carousel';
  ALTER TYPE "public"."enum_events_blocks_documents_view" ADD VALUE 'carousel';
  ALTER TYPE "public"."enum__events_v_blocks_documents_view" ADD VALUE 'carousel';
  ALTER TYPE "public"."enum_event_cycles_blocks_documents_view" ADD VALUE 'carousel';
  ALTER TYPE "public"."enum__event_cycles_v_blocks_documents_view" ADD VALUE 'carousel';
  ALTER TYPE "public"."enum_partners_blocks_documents_view" ADD VALUE 'carousel';
  ALTER TYPE "public"."enum__partners_v_blocks_documents_view" ADD VALUE 'carousel';
  ALTER TYPE "public"."enum_homepage_sections_blocks_documents_view" ADD VALUE 'carousel';`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   UPDATE "pages_blocks_documents" SET "view" = 'list' WHERE "view" = 'carousel';
  UPDATE "_pages_v_blocks_documents" SET "view" = 'list' WHERE "view" = 'carousel';
  UPDATE "posts_blocks_documents" SET "view" = 'list' WHERE "view" = 'carousel';
  UPDATE "_posts_v_blocks_documents" SET "view" = 'list' WHERE "view" = 'carousel';
  UPDATE "events_blocks_documents" SET "view" = 'list' WHERE "view" = 'carousel';
  UPDATE "_events_v_blocks_documents" SET "view" = 'list' WHERE "view" = 'carousel';
  UPDATE "event_cycles_blocks_documents" SET "view" = 'list' WHERE "view" = 'carousel';
  UPDATE "_event_cycles_v_blocks_documents" SET "view" = 'list' WHERE "view" = 'carousel';
  UPDATE "partners_blocks_documents" SET "view" = 'list' WHERE "view" = 'carousel';
  UPDATE "_partners_v_blocks_documents" SET "view" = 'list' WHERE "view" = 'carousel';
  UPDATE "homepage_sections_blocks_documents" SET "view" = 'list' WHERE "view" = 'carousel';

  ALTER TABLE "pages_blocks_documents" ALTER COLUMN "view" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_documents" ALTER COLUMN "view" SET DEFAULT 'list'::text;
  DROP TYPE "public"."enum_pages_blocks_documents_view";
  CREATE TYPE "public"."enum_pages_blocks_documents_view" AS ENUM('cards', 'list', 'grid');
  ALTER TABLE "pages_blocks_documents" ALTER COLUMN "view" SET DEFAULT 'list'::"public"."enum_pages_blocks_documents_view";
  ALTER TABLE "pages_blocks_documents" ALTER COLUMN "view" SET DATA TYPE "public"."enum_pages_blocks_documents_view" USING "view"::"public"."enum_pages_blocks_documents_view";
  ALTER TABLE "_pages_v_blocks_documents" ALTER COLUMN "view" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_documents" ALTER COLUMN "view" SET DEFAULT 'list'::text;
  DROP TYPE "public"."enum__pages_v_blocks_documents_view";
  CREATE TYPE "public"."enum__pages_v_blocks_documents_view" AS ENUM('cards', 'list', 'grid');
  ALTER TABLE "_pages_v_blocks_documents" ALTER COLUMN "view" SET DEFAULT 'list'::"public"."enum__pages_v_blocks_documents_view";
  ALTER TABLE "_pages_v_blocks_documents" ALTER COLUMN "view" SET DATA TYPE "public"."enum__pages_v_blocks_documents_view" USING "view"::"public"."enum__pages_v_blocks_documents_view";
  ALTER TABLE "posts_blocks_documents" ALTER COLUMN "view" SET DATA TYPE text;
  ALTER TABLE "posts_blocks_documents" ALTER COLUMN "view" SET DEFAULT 'list'::text;
  DROP TYPE "public"."enum_posts_blocks_documents_view";
  CREATE TYPE "public"."enum_posts_blocks_documents_view" AS ENUM('cards', 'list', 'grid');
  ALTER TABLE "posts_blocks_documents" ALTER COLUMN "view" SET DEFAULT 'list'::"public"."enum_posts_blocks_documents_view";
  ALTER TABLE "posts_blocks_documents" ALTER COLUMN "view" SET DATA TYPE "public"."enum_posts_blocks_documents_view" USING "view"::"public"."enum_posts_blocks_documents_view";
  ALTER TABLE "_posts_v_blocks_documents" ALTER COLUMN "view" SET DATA TYPE text;
  ALTER TABLE "_posts_v_blocks_documents" ALTER COLUMN "view" SET DEFAULT 'list'::text;
  DROP TYPE "public"."enum__posts_v_blocks_documents_view";
  CREATE TYPE "public"."enum__posts_v_blocks_documents_view" AS ENUM('cards', 'list', 'grid');
  ALTER TABLE "_posts_v_blocks_documents" ALTER COLUMN "view" SET DEFAULT 'list'::"public"."enum__posts_v_blocks_documents_view";
  ALTER TABLE "_posts_v_blocks_documents" ALTER COLUMN "view" SET DATA TYPE "public"."enum__posts_v_blocks_documents_view" USING "view"::"public"."enum__posts_v_blocks_documents_view";
  ALTER TABLE "events_blocks_documents" ALTER COLUMN "view" SET DATA TYPE text;
  ALTER TABLE "events_blocks_documents" ALTER COLUMN "view" SET DEFAULT 'list'::text;
  DROP TYPE "public"."enum_events_blocks_documents_view";
  CREATE TYPE "public"."enum_events_blocks_documents_view" AS ENUM('cards', 'list', 'grid');
  ALTER TABLE "events_blocks_documents" ALTER COLUMN "view" SET DEFAULT 'list'::"public"."enum_events_blocks_documents_view";
  ALTER TABLE "events_blocks_documents" ALTER COLUMN "view" SET DATA TYPE "public"."enum_events_blocks_documents_view" USING "view"::"public"."enum_events_blocks_documents_view";
  ALTER TABLE "_events_v_blocks_documents" ALTER COLUMN "view" SET DATA TYPE text;
  ALTER TABLE "_events_v_blocks_documents" ALTER COLUMN "view" SET DEFAULT 'list'::text;
  DROP TYPE "public"."enum__events_v_blocks_documents_view";
  CREATE TYPE "public"."enum__events_v_blocks_documents_view" AS ENUM('cards', 'list', 'grid');
  ALTER TABLE "_events_v_blocks_documents" ALTER COLUMN "view" SET DEFAULT 'list'::"public"."enum__events_v_blocks_documents_view";
  ALTER TABLE "_events_v_blocks_documents" ALTER COLUMN "view" SET DATA TYPE "public"."enum__events_v_blocks_documents_view" USING "view"::"public"."enum__events_v_blocks_documents_view";
  ALTER TABLE "event_cycles_blocks_documents" ALTER COLUMN "view" SET DATA TYPE text;
  ALTER TABLE "event_cycles_blocks_documents" ALTER COLUMN "view" SET DEFAULT 'list'::text;
  DROP TYPE "public"."enum_event_cycles_blocks_documents_view";
  CREATE TYPE "public"."enum_event_cycles_blocks_documents_view" AS ENUM('cards', 'list', 'grid');
  ALTER TABLE "event_cycles_blocks_documents" ALTER COLUMN "view" SET DEFAULT 'list'::"public"."enum_event_cycles_blocks_documents_view";
  ALTER TABLE "event_cycles_blocks_documents" ALTER COLUMN "view" SET DATA TYPE "public"."enum_event_cycles_blocks_documents_view" USING "view"::"public"."enum_event_cycles_blocks_documents_view";
  ALTER TABLE "_event_cycles_v_blocks_documents" ALTER COLUMN "view" SET DATA TYPE text;
  ALTER TABLE "_event_cycles_v_blocks_documents" ALTER COLUMN "view" SET DEFAULT 'list'::text;
  DROP TYPE "public"."enum__event_cycles_v_blocks_documents_view";
  CREATE TYPE "public"."enum__event_cycles_v_blocks_documents_view" AS ENUM('cards', 'list', 'grid');
  ALTER TABLE "_event_cycles_v_blocks_documents" ALTER COLUMN "view" SET DEFAULT 'list'::"public"."enum__event_cycles_v_blocks_documents_view";
  ALTER TABLE "_event_cycles_v_blocks_documents" ALTER COLUMN "view" SET DATA TYPE "public"."enum__event_cycles_v_blocks_documents_view" USING "view"::"public"."enum__event_cycles_v_blocks_documents_view";
  ALTER TABLE "partners_blocks_documents" ALTER COLUMN "view" SET DATA TYPE text;
  ALTER TABLE "partners_blocks_documents" ALTER COLUMN "view" SET DEFAULT 'list'::text;
  DROP TYPE "public"."enum_partners_blocks_documents_view";
  CREATE TYPE "public"."enum_partners_blocks_documents_view" AS ENUM('cards', 'list', 'grid');
  ALTER TABLE "partners_blocks_documents" ALTER COLUMN "view" SET DEFAULT 'list'::"public"."enum_partners_blocks_documents_view";
  ALTER TABLE "partners_blocks_documents" ALTER COLUMN "view" SET DATA TYPE "public"."enum_partners_blocks_documents_view" USING "view"::"public"."enum_partners_blocks_documents_view";
  ALTER TABLE "_partners_v_blocks_documents" ALTER COLUMN "view" SET DATA TYPE text;
  ALTER TABLE "_partners_v_blocks_documents" ALTER COLUMN "view" SET DEFAULT 'list'::text;
  DROP TYPE "public"."enum__partners_v_blocks_documents_view";
  CREATE TYPE "public"."enum__partners_v_blocks_documents_view" AS ENUM('cards', 'list', 'grid');
  ALTER TABLE "_partners_v_blocks_documents" ALTER COLUMN "view" SET DEFAULT 'list'::"public"."enum__partners_v_blocks_documents_view";
  ALTER TABLE "_partners_v_blocks_documents" ALTER COLUMN "view" SET DATA TYPE "public"."enum__partners_v_blocks_documents_view" USING "view"::"public"."enum__partners_v_blocks_documents_view";
  ALTER TABLE "homepage_sections_blocks_documents" ALTER COLUMN "view" SET DATA TYPE text;
  ALTER TABLE "homepage_sections_blocks_documents" ALTER COLUMN "view" SET DEFAULT 'list'::text;
  DROP TYPE "public"."enum_homepage_sections_blocks_documents_view";
  CREATE TYPE "public"."enum_homepage_sections_blocks_documents_view" AS ENUM('cards', 'list', 'grid');
  ALTER TABLE "homepage_sections_blocks_documents" ALTER COLUMN "view" SET DEFAULT 'list'::"public"."enum_homepage_sections_blocks_documents_view";
  ALTER TABLE "homepage_sections_blocks_documents" ALTER COLUMN "view" SET DATA TYPE "public"."enum_homepage_sections_blocks_documents_view" USING "view"::"public"."enum_homepage_sections_blocks_documents_view";`)
}
