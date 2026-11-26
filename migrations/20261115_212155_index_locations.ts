import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'

import {
  createContentListingIndexData,
  findPublishedContentListingDocument,
} from '../src/modules/content/content-listing-sources'

export async function up({ db, req }: MigrateUpArgs): Promise<void> {
  const result = await db.execute<{ id: number }>(sql`
    SELECT id FROM locations WHERE _status = 'published' AND deleted_at IS NULL
  `)
  for (const { id } of result.rows) {
    const location = await findPublishedContentListingDocument(req, 'locations', id)
    if (!location) continue
    const item = createContentListingIndexData('locations', location)

    // Keep the projection limited to the columns available at this point in the migration chain.
    await db.execute(sql`
      INSERT INTO content_listing_items (
        source, source_document_id, source_updated_at, title, normalized_title, tag_search_index,
        related_target_search_index, url, excerpt, has_significant_date, is_inactive_location
      ) VALUES (
        'locations', ${id}, ${item.sourceUpdatedAt}, ${item.title}, ${item.normalizedTitle},
        ${item.tagSearchIndex}, ${item.relatedTargetSearchIndex}, ${item.url}, ${item.excerpt}, false,
        ${item.isInactiveLocation}
      )
      ON CONFLICT (source, source_document_id) DO UPDATE
      SET source_updated_at = EXCLUDED.source_updated_at,
          title = EXCLUDED.title,
          normalized_title = EXCLUDED.normalized_title,
          url = EXCLUDED.url,
          excerpt = EXCLUDED.excerpt,
          is_inactive_location = EXCLUDED.is_inactive_location
    `)
  }

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
