import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "_events_v" ADD COLUMN "autosave" boolean;
    ALTER TABLE "_event_cycles_v" ADD COLUMN "autosave" boolean;
    CREATE INDEX "_events_v_autosave_idx" ON "_events_v" USING btree ("autosave");
    CREATE INDEX "_event_cycles_v_autosave_idx" ON "_event_cycles_v" USING btree ("autosave");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX "_events_v_autosave_idx";
    DROP INDEX "_event_cycles_v_autosave_idx";
    ALTER TABLE "_events_v" DROP COLUMN "autosave";
    ALTER TABLE "_event_cycles_v" DROP COLUMN "autosave";
  `)
}
