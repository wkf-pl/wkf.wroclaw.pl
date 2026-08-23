import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`DELETE FROM "_documents_v" WHERE "parent_id" IS NULL`)
}

export async function down({ db: _db }: MigrateDownArgs): Promise<void> {
  // Orphaned versions cannot be restored because their parent documents no longer exist.
}
