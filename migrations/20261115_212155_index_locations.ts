import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'

import { syncContentListingItem } from '../src/modules/content/content-listing-index'

export async function up({ db, req }: MigrateUpArgs): Promise<void> {
  const result = await db.execute<{ id: number }>(sql`
    SELECT id FROM locations WHERE _status = 'published' AND deleted_at IS NULL
  `)
  for (const { id } of result.rows) await syncContentListingItem(req, 'locations', id)

  await db.execute(sql`
    INSERT INTO roles_permissions (_order, _parent_id, id, resource, can_create, read_allowed, update_allowed)
    SELECT
      (SELECT coalesce(max(permission._order), 0) + 1 FROM roles_permissions permission WHERE permission._parent_id = roles.id),
      roles.id, md5('locations:' || roles.id), 'locations', true, true, true
    FROM roles
    WHERE roles.key = 'editor'
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DELETE FROM roles_permissions WHERE resource = 'locations';
    DELETE FROM content_listing_items WHERE source = 'locations';
  `)
}
