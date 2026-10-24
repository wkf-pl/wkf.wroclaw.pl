import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_column_layout" ADD COLUMN "name" varchar;
  ALTER TABLE "pages_blocks_tabs" ADD COLUMN "name" varchar;
  ALTER TABLE "pages_blocks_section_group" ADD COLUMN "name" varchar;
  ALTER TABLE "_pages_v_blocks_column_layout" ADD COLUMN "name" varchar;
  ALTER TABLE "_pages_v_blocks_tabs" ADD COLUMN "name" varchar;
  ALTER TABLE "_pages_v_blocks_section_group" ADD COLUMN "name" varchar;
  ALTER TABLE "posts_blocks_column_layout" ADD COLUMN "name" varchar;
  ALTER TABLE "posts_blocks_tabs" ADD COLUMN "name" varchar;
  ALTER TABLE "posts_blocks_section_group" ADD COLUMN "name" varchar;
  ALTER TABLE "_posts_v_blocks_column_layout" ADD COLUMN "name" varchar;
  ALTER TABLE "_posts_v_blocks_tabs" ADD COLUMN "name" varchar;
  ALTER TABLE "_posts_v_blocks_section_group" ADD COLUMN "name" varchar;
  ALTER TABLE "events_blocks_column_layout" ADD COLUMN "name" varchar;
  ALTER TABLE "events_blocks_tabs" ADD COLUMN "name" varchar;
  ALTER TABLE "events_blocks_section_group" ADD COLUMN "name" varchar;
  ALTER TABLE "_events_v_blocks_column_layout" ADD COLUMN "name" varchar;
  ALTER TABLE "_events_v_blocks_tabs" ADD COLUMN "name" varchar;
  ALTER TABLE "_events_v_blocks_section_group" ADD COLUMN "name" varchar;
  ALTER TABLE "event_cycles_blocks_column_layout" ADD COLUMN "name" varchar;
  ALTER TABLE "event_cycles_blocks_tabs" ADD COLUMN "name" varchar;
  ALTER TABLE "event_cycles_blocks_section_group" ADD COLUMN "name" varchar;
  ALTER TABLE "_event_cycles_v_blocks_column_layout" ADD COLUMN "name" varchar;
  ALTER TABLE "_event_cycles_v_blocks_tabs" ADD COLUMN "name" varchar;
  ALTER TABLE "_event_cycles_v_blocks_section_group" ADD COLUMN "name" varchar;
  ALTER TABLE "partners_blocks_column_layout" ADD COLUMN "name" varchar;
  ALTER TABLE "partners_blocks_tabs" ADD COLUMN "name" varchar;
  ALTER TABLE "partners_blocks_section_group" ADD COLUMN "name" varchar;
  ALTER TABLE "_partners_v_blocks_column_layout" ADD COLUMN "name" varchar;
  ALTER TABLE "_partners_v_blocks_tabs" ADD COLUMN "name" varchar;
  ALTER TABLE "_partners_v_blocks_section_group" ADD COLUMN "name" varchar;
  ALTER TABLE "homepage_sections_blocks_column_layout" ADD COLUMN "name" varchar;
  ALTER TABLE "homepage_sections_blocks_tabs" ADD COLUMN "name" varchar;
  ALTER TABLE "homepage_sections_blocks_section_group" ADD COLUMN "name" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_column_layout" DROP COLUMN "name";
  ALTER TABLE "pages_blocks_tabs" DROP COLUMN "name";
  ALTER TABLE "pages_blocks_section_group" DROP COLUMN "name";
  ALTER TABLE "_pages_v_blocks_column_layout" DROP COLUMN "name";
  ALTER TABLE "_pages_v_blocks_tabs" DROP COLUMN "name";
  ALTER TABLE "_pages_v_blocks_section_group" DROP COLUMN "name";
  ALTER TABLE "posts_blocks_column_layout" DROP COLUMN "name";
  ALTER TABLE "posts_blocks_tabs" DROP COLUMN "name";
  ALTER TABLE "posts_blocks_section_group" DROP COLUMN "name";
  ALTER TABLE "_posts_v_blocks_column_layout" DROP COLUMN "name";
  ALTER TABLE "_posts_v_blocks_tabs" DROP COLUMN "name";
  ALTER TABLE "_posts_v_blocks_section_group" DROP COLUMN "name";
  ALTER TABLE "events_blocks_column_layout" DROP COLUMN "name";
  ALTER TABLE "events_blocks_tabs" DROP COLUMN "name";
  ALTER TABLE "events_blocks_section_group" DROP COLUMN "name";
  ALTER TABLE "_events_v_blocks_column_layout" DROP COLUMN "name";
  ALTER TABLE "_events_v_blocks_tabs" DROP COLUMN "name";
  ALTER TABLE "_events_v_blocks_section_group" DROP COLUMN "name";
  ALTER TABLE "event_cycles_blocks_column_layout" DROP COLUMN "name";
  ALTER TABLE "event_cycles_blocks_tabs" DROP COLUMN "name";
  ALTER TABLE "event_cycles_blocks_section_group" DROP COLUMN "name";
  ALTER TABLE "_event_cycles_v_blocks_column_layout" DROP COLUMN "name";
  ALTER TABLE "_event_cycles_v_blocks_tabs" DROP COLUMN "name";
  ALTER TABLE "_event_cycles_v_blocks_section_group" DROP COLUMN "name";
  ALTER TABLE "partners_blocks_column_layout" DROP COLUMN "name";
  ALTER TABLE "partners_blocks_tabs" DROP COLUMN "name";
  ALTER TABLE "partners_blocks_section_group" DROP COLUMN "name";
  ALTER TABLE "_partners_v_blocks_column_layout" DROP COLUMN "name";
  ALTER TABLE "_partners_v_blocks_tabs" DROP COLUMN "name";
  ALTER TABLE "_partners_v_blocks_section_group" DROP COLUMN "name";
  ALTER TABLE "homepage_sections_blocks_column_layout" DROP COLUMN "name";
  ALTER TABLE "homepage_sections_blocks_tabs" DROP COLUMN "name";
  ALTER TABLE "homepage_sections_blocks_section_group" DROP COLUMN "name";`)
}
