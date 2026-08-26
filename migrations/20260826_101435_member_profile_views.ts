import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_member_profiles_view" AS ENUM('card', 'list', 'grid');
  CREATE TYPE "public"."enum__pages_v_blocks_member_profiles_view" AS ENUM('card', 'list', 'grid');
  CREATE TYPE "public"."enum_posts_blocks_member_profiles_view" AS ENUM('card', 'list', 'grid');
  CREATE TYPE "public"."enum__posts_v_blocks_member_profiles_view" AS ENUM('card', 'list', 'grid');
  CREATE TYPE "public"."enum_events_blocks_member_profiles_view" AS ENUM('card', 'list', 'grid');
  CREATE TYPE "public"."enum__events_v_blocks_member_profiles_view" AS ENUM('card', 'list', 'grid');
  CREATE TYPE "public"."enum_event_cycles_blocks_member_profiles_view" AS ENUM('card', 'list', 'grid');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_member_profiles_view" AS ENUM('card', 'list', 'grid');
  CREATE TYPE "public"."enum_partners_blocks_member_profiles_view" AS ENUM('card', 'list', 'grid');
  CREATE TYPE "public"."enum__partners_v_blocks_member_profiles_view" AS ENUM('card', 'list', 'grid');
  ALTER TABLE "pages_blocks_member_profiles" ADD COLUMN "view" "enum_pages_blocks_member_profiles_view" DEFAULT 'grid';
  ALTER TABLE "_pages_v_blocks_member_profiles" ADD COLUMN "view" "enum__pages_v_blocks_member_profiles_view" DEFAULT 'grid';
  ALTER TABLE "posts_blocks_member_profiles" ADD COLUMN "view" "enum_posts_blocks_member_profiles_view" DEFAULT 'grid';
  ALTER TABLE "_posts_v_blocks_member_profiles" ADD COLUMN "view" "enum__posts_v_blocks_member_profiles_view" DEFAULT 'grid';
  ALTER TABLE "events_blocks_member_profiles" ADD COLUMN "view" "enum_events_blocks_member_profiles_view" DEFAULT 'grid';
  ALTER TABLE "_events_v_blocks_member_profiles" ADD COLUMN "view" "enum__events_v_blocks_member_profiles_view" DEFAULT 'grid';
  ALTER TABLE "event_cycles_blocks_member_profiles" ADD COLUMN "view" "enum_event_cycles_blocks_member_profiles_view" DEFAULT 'grid';
  ALTER TABLE "_event_cycles_v_blocks_member_profiles" ADD COLUMN "view" "enum__event_cycles_v_blocks_member_profiles_view" DEFAULT 'grid';
  ALTER TABLE "partners_blocks_member_profiles" ADD COLUMN "view" "enum_partners_blocks_member_profiles_view" DEFAULT 'grid';
  ALTER TABLE "_partners_v_blocks_member_profiles" ADD COLUMN "view" "enum__partners_v_blocks_member_profiles_view" DEFAULT 'grid';`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_member_profiles" DROP COLUMN "view";
  ALTER TABLE "_pages_v_blocks_member_profiles" DROP COLUMN "view";
  ALTER TABLE "posts_blocks_member_profiles" DROP COLUMN "view";
  ALTER TABLE "_posts_v_blocks_member_profiles" DROP COLUMN "view";
  ALTER TABLE "events_blocks_member_profiles" DROP COLUMN "view";
  ALTER TABLE "_events_v_blocks_member_profiles" DROP COLUMN "view";
  ALTER TABLE "event_cycles_blocks_member_profiles" DROP COLUMN "view";
  ALTER TABLE "_event_cycles_v_blocks_member_profiles" DROP COLUMN "view";
  ALTER TABLE "partners_blocks_member_profiles" DROP COLUMN "view";
  ALTER TABLE "_partners_v_blocks_member_profiles" DROP COLUMN "view";
  DROP TYPE "public"."enum_pages_blocks_member_profiles_view";
  DROP TYPE "public"."enum__pages_v_blocks_member_profiles_view";
  DROP TYPE "public"."enum_posts_blocks_member_profiles_view";
  DROP TYPE "public"."enum__posts_v_blocks_member_profiles_view";
  DROP TYPE "public"."enum_events_blocks_member_profiles_view";
  DROP TYPE "public"."enum__events_v_blocks_member_profiles_view";
  DROP TYPE "public"."enum_event_cycles_blocks_member_profiles_view";
  DROP TYPE "public"."enum__event_cycles_v_blocks_member_profiles_view";
  DROP TYPE "public"."enum_partners_blocks_member_profiles_view";
  DROP TYPE "public"."enum__partners_v_blocks_member_profiles_view";`)
}
