import { sql, type MigrateUpArgs } from '@payloadcms/db-postgres'

export async function moveAuthorsToOwners(db: MigrateUpArgs['db']): Promise<void> {
  for (const collection of ['pages', 'posts', 'events', 'event_cycles', 'partners', 'media']) {
    await moveAuthor(db, collection, false)
    if (collection !== 'media') await moveAuthor(db, collection, true)
  }

  await db.execute(sql`
    INSERT INTO documents_rels ("order", parent_id, path, users_id)
    SELECT 1, id, 'owners', author_id FROM documents WHERE author_id IS NOT NULL;

    INSERT INTO _documents_v_rels ("order", parent_id, path, users_id)
    SELECT 1, id, 'version.owners', version_author_id FROM _documents_v
    WHERE version_author_id IS NOT NULL;

    INSERT INTO event_cycles_rels ("order", parent_id, path, user_groups_id)
    SELECT 1, id, 'eventDefaults.owners', event_defaults_author_group_id FROM event_cycles
    WHERE event_defaults_author_group_id IS NOT NULL;

    INSERT INTO _event_cycles_v_rels ("order", parent_id, path, user_groups_id)
    SELECT 1, id, 'version.eventDefaults.owners', version_event_defaults_author_group_id
    FROM _event_cycles_v WHERE version_event_defaults_author_group_id IS NOT NULL;
  `)
}

async function moveAuthor(
  db: MigrateUpArgs['db'],
  collection: string,
  version: boolean,
): Promise<void> {
  const tableName = version ? `_${collection}_v` : collection
  const table = sql.identifier(tableName)
  const relations = sql.identifier(`${tableName}_rels`)
  const authorColumn = sql.identifier(version ? 'version_author_id' : 'author_id')
  const authorPath = version ? 'version.author' : 'author'
  const ownerPath = version ? 'version.owners' : 'owners'

  await db.execute(sql`
    UPDATE ${table} document SET ${authorColumn} = author.users_id
    FROM (
      SELECT DISTINCT ON (parent_id) parent_id, users_id
      FROM ${relations} WHERE path = ${authorPath} AND users_id IS NOT NULL
      ORDER BY parent_id, "order" NULLS LAST, id
    ) author
    WHERE document.id = author.parent_id
  `)

  await db.execute(sql`
    UPDATE ${relations} SET path = ${ownerPath}, "order" = COALESCE("order", 1)
    WHERE path = ${authorPath}
  `)
}
