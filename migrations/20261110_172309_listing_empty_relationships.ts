import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

const conditionTables = [
  'page_templates_blocks_listing_conditions',
  '_page_templates_v_blocks_listing_conditions',
  'pages_blocks_listing_conditions',
  '_pages_v_blocks_listing_conditions',
  'posts_blocks_listing_conditions',
  '_posts_v_blocks_listing_conditions',
  'events_blocks_listing_conditions',
  '_events_v_blocks_listing_conditions',
  'event_cycles_blocks_listing_conditions',
  '_event_cycles_v_blocks_listing_conditions',
  'partners_blocks_listing_conditions',
  '_partners_v_blocks_listing_conditions',
  'homepage_sections_blocks_listing_conditions',
  '_homepage_sections_v_blocks_listing_conditions',
]

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const tableName of conditionTables) {
    const operatorType = sql.identifier(`enum_${tableName}_operator`)
    await db.execute(sql`ALTER TYPE "public".${operatorType} ADD VALUE 'isEmpty';`)
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const tableName of conditionTables) {
    const table = sql.identifier(tableName)
    const { rows } = await db.execute(sql`
      SELECT 1 FROM "public".${table} WHERE "operator" = 'isEmpty' LIMIT 1;
    `)
    if (rows.length > 0) {
      throw new Error(
        `Cannot remove the isEmpty Listing operator while it is used in ${tableName}.`,
      )
    }
  }

  for (const tableName of conditionTables) {
    const table = sql.identifier(tableName)
    const operatorType = sql.identifier(`enum_${tableName}_operator`)
    await db.execute(sql`
      ALTER TABLE "public".${table} ALTER COLUMN "operator" SET DATA TYPE text;
      DROP TYPE "public".${operatorType};
      CREATE TYPE "public".${operatorType}
        AS ENUM ('contains', 'equals', 'inSubtree', 'notOlderThan', 'before', 'after', 'between');
      ALTER TABLE "public".${table} ALTER COLUMN "operator" SET DATA TYPE "public".${operatorType}
        USING "operator"::"public".${operatorType};
    `)
  }
}
