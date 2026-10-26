import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { getPayload, type Payload } from 'payload'

import config from '@/payload.config'
import { down, up } from '../../migrations/20261026_192840_global_drafts_and_content_trash'

const globalTables = [
  'site_settings',
  'navigation',
  'homepage_hero',
  'homepage_sections',
  'footer',
] as const

let payload: Payload

function migrationArguments(): MigrateDownArgs & MigrateUpArgs {
  return { db: payload.db.drizzle } as MigrateDownArgs & MigrateUpArgs
}

async function statusColumnExists(): Promise<boolean> {
  const result = await payload.db.drizzle.execute(sql`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'site_settings'
        AND column_name = '_status'
    ) AS "exists"
  `)
  return result.rows[0]?.exists === true
}

async function readGlobalRows(table: (typeof globalTables)[number]): Promise<unknown[]> {
  const result = await payload.db.drizzle.execute(
    sql.raw(
      `SELECT to_jsonb("global_row") - '_status' AS "data" FROM "${table}" AS "global_row" ORDER BY "id"`,
    ),
  )
  return result.rows.map((row) => row.data)
}

beforeAll(async () => {
  payload = await getPayload({ config })
})

afterAll(async () => {
  if (payload && !(await statusColumnExists())) await up(migrationArguments())
})

describe('global drafts migration', () => {
  it('preserves current global content and marks every row as published', async () => {
    await down(migrationArguments())

    const contentBeforeMigration = new Map<string, unknown[]>()
    for (const table of globalTables) {
      contentBeforeMigration.set(table, await readGlobalRows(table))
    }

    await up(migrationArguments())

    for (const table of globalTables) {
      expect(await readGlobalRows(table)).toEqual(contentBeforeMigration.get(table))

      const statuses = await payload.db.drizzle.execute(
        sql.raw(`SELECT "_status"::text AS "status" FROM "${table}" ORDER BY "id"`),
      )
      expect(statuses.rows.every((row) => row.status === 'published')).toBe(true)
    }
  })
})
