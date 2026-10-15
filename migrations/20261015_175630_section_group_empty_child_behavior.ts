import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."empty_child" AS ENUM('show', 'hideGroup');
  ALTER TABLE "pages_blocks_section_group" ADD COLUMN "empty_child_behavior" "empty_child" DEFAULT 'show';
  ALTER TABLE "_pages_v_blocks_section_group" ADD COLUMN "empty_child_behavior" "empty_child" DEFAULT 'show';
  ALTER TABLE "posts_blocks_section_group" ADD COLUMN "empty_child_behavior" "empty_child" DEFAULT 'show';
  ALTER TABLE "_posts_v_blocks_section_group" ADD COLUMN "empty_child_behavior" "empty_child" DEFAULT 'show';
  ALTER TABLE "events_blocks_section_group" ADD COLUMN "empty_child_behavior" "empty_child" DEFAULT 'show';
  ALTER TABLE "_events_v_blocks_section_group" ADD COLUMN "empty_child_behavior" "empty_child" DEFAULT 'show';
  ALTER TABLE "event_cycles_blocks_section_group" ADD COLUMN "empty_child_behavior" "empty_child" DEFAULT 'show';
  ALTER TABLE "_event_cycles_v_blocks_section_group" ADD COLUMN "empty_child_behavior" "empty_child" DEFAULT 'show';
  ALTER TABLE "partners_blocks_section_group" ADD COLUMN "empty_child_behavior" "empty_child" DEFAULT 'show';
  ALTER TABLE "_partners_v_blocks_section_group" ADD COLUMN "empty_child_behavior" "empty_child" DEFAULT 'show';
  ALTER TABLE "homepage_sections_blocks_section_group" ADD COLUMN "empty_child_behavior" "empty_child" DEFAULT 'show';`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_section_group" DROP COLUMN "empty_child_behavior";
  ALTER TABLE "_pages_v_blocks_section_group" DROP COLUMN "empty_child_behavior";
  ALTER TABLE "posts_blocks_section_group" DROP COLUMN "empty_child_behavior";
  ALTER TABLE "_posts_v_blocks_section_group" DROP COLUMN "empty_child_behavior";
  ALTER TABLE "events_blocks_section_group" DROP COLUMN "empty_child_behavior";
  ALTER TABLE "_events_v_blocks_section_group" DROP COLUMN "empty_child_behavior";
  ALTER TABLE "event_cycles_blocks_section_group" DROP COLUMN "empty_child_behavior";
  ALTER TABLE "_event_cycles_v_blocks_section_group" DROP COLUMN "empty_child_behavior";
  ALTER TABLE "partners_blocks_section_group" DROP COLUMN "empty_child_behavior";
  ALTER TABLE "_partners_v_blocks_section_group" DROP COLUMN "empty_child_behavior";
  ALTER TABLE "homepage_sections_blocks_section_group" DROP COLUMN "empty_child_behavior";
  DROP TYPE "public"."empty_child";`)
}
