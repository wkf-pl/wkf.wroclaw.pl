import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'
import { getPayload, type Payload } from 'payload'

import config from '@/payload.config'
import { down, up } from '../../migrations/20261025_163139'

const statuteDocumentSlug = 'statut-wroclawskiego-klubu-fantastyki'

let payload: Payload

function migrationArguments(): MigrateDownArgs & MigrateUpArgs {
  return { db: payload.db.drizzle } as MigrateDownArgs & MigrateUpArgs
}

async function urlAliasesTableExists(): Promise<boolean> {
  const result = await payload.db.drizzle.execute(
    sql`SELECT to_regclass('public.url_aliases')::text AS "tableName"`,
  )
  return result.rows[0]?.tableName === 'url_aliases'
}

beforeAll(async () => {
  payload = await getPayload({ config })
  await payload.db.drizzle.execute(sql`DELETE FROM "url_aliases" WHERE "slug" = 'statut'`)
  await payload.db.drizzle.execute(
    sql`DELETE FROM "documents" WHERE "slug" = ${statuteDocumentSlug}`,
  )
})

afterAll(async () => {
  if (!payload) return
  if (!(await urlAliasesTableExists())) await up(migrationArguments())

  await payload.db.drizzle.execute(sql`DELETE FROM "url_aliases" WHERE "slug" = 'statut'`)
  await payload.db.drizzle.execute(
    sql`DELETE FROM "documents" WHERE "slug" = ${statuteDocumentSlug}`,
  )
})

describe('URL aliases migration', () => {
  it('supports down and repeated up with an existing statute document', async () => {
    await down(migrationArguments())

    expect(await urlAliasesTableExists()).toBe(false)
    const removedResources = await payload.db.drizzle.execute(sql`
      SELECT COUNT(*)::int AS "count"
      FROM "roles_permissions"
      WHERE "resource"::text = 'url-aliases'
    `)
    expect(removedResources.rows[0]?.count).toBe(0)

    await payload.db.drizzle.execute(sql`
      INSERT INTO "documents" ("slug", "updated_at", "created_at")
      VALUES (${statuteDocumentSlug}, now(), now())
    `)

    await up(migrationArguments())

    const seededAlias = await payload.db.drizzle.execute(sql`
      SELECT
        "url_aliases"."slug",
        "url_aliases"."document_destination" AS "documentDestination",
        "documents"."slug" AS "documentSlug"
      FROM "url_aliases"
      JOIN "url_aliases_rels"
        ON "url_aliases_rels"."parent_id" = "url_aliases"."id"
        AND "url_aliases_rels"."path" = 'target'
      JOIN "documents" ON "documents"."id" = "url_aliases_rels"."documents_id"
      WHERE "url_aliases"."slug" = 'statut'
    `)
    expect(seededAlias.rows).toEqual([
      {
        documentDestination: 'primaryFile',
        documentSlug: statuteDocumentSlug,
        slug: 'statut',
      },
    ])

    const editorGrant = await payload.db.drizzle.execute(sql`
      SELECT "can_create" AS "canCreate", "read_allowed" AS "canRead",
        "update_allowed" AS "canUpdate", "delete_allowed" AS "canDelete"
      FROM "roles_permissions"
      JOIN "roles" ON "roles"."id" = "roles_permissions"."_parent_id"
      WHERE "roles"."key" = 'editor'
        AND "roles_permissions"."resource" = 'url-aliases'
    `)
    expect(editorGrant.rows).toEqual([
      { canCreate: true, canDelete: true, canRead: true, canUpdate: true },
    ])

    await down(migrationArguments())
    await up(migrationArguments())

    const aliasesAfterSecondUp = await payload.db.drizzle.execute(sql`
      SELECT COUNT(*)::int AS "count" FROM "url_aliases" WHERE "slug" = 'statut'
    `)
    expect(aliasesAfterSecondUp.rows[0]?.count).toBe(1)
  })
})
