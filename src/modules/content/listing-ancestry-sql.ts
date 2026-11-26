import { sql } from '@payloadcms/db-postgres'

export const refreshListingAncestry = sql`
  WITH RECURSIVE ancestry AS (
    SELECT item.id, item.content_parent AS parent_key, ARRAY[item.content_parent] AS visited, 1 AS depth
    FROM content_listing_items item
    WHERE item.content_parent IS NOT NULL
    UNION ALL
    SELECT ancestry.id, parent.content_parent, ancestry.visited || parent.content_parent, ancestry.depth + 1
    FROM ancestry
    JOIN content_listing_items parent ON parent.source::text || ':' || parent.source_document_id::text = ancestry.parent_key
    WHERE parent.content_parent IS NOT NULL AND NOT parent.content_parent = ANY(ancestry.visited)
  ), paths AS (
    SELECT id, '|' || string_agg(parent_key, '|' ORDER BY depth) || '|' AS path
    FROM ancestry
    GROUP BY id
  ), updated_paths AS (
    SELECT item.id, COALESCE(paths.path, '|') AS path
    FROM content_listing_items item LEFT JOIN paths USING (id)
  )
  UPDATE content_listing_items item SET ancestor_search_index = updated_paths.path
  FROM updated_paths WHERE updated_paths.id = item.id
    AND item.ancestor_search_index IS DISTINCT FROM updated_paths.path
`
