import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "event_cycles" ADD COLUMN "event_defaults_title" varchar;
  ALTER TABLE "_event_cycles_v" ADD COLUMN "version_event_defaults_title" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "event_cycles" DROP COLUMN "event_defaults_title";
  ALTER TABLE "_event_cycles_v" DROP COLUMN "version_event_defaults_title";`)
}
