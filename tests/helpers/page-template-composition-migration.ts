import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'

import {
  down as downPageTemplateComposition,
  up as upPageTemplateComposition,
} from '../../migrations/20261107_002214_page_template_composition'
import {
  down as downListingEmptyRelationships,
  up as upListingEmptyRelationships,
} from '../../migrations/20261110_172309_listing_empty_relationships'
import {
  down as downCurrentItemFields,
  up as upCurrentItemFields,
} from '../../migrations/20261111_125928_current_item_fields'

export async function pageTemplateCompositionSchemaExists(
  database: Pick<MigrateUpArgs['db'], 'execute'>,
): Promise<boolean> {
  const result = await database.execute(sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'page_templates_blocks_action_links_items'
        AND column_name = 'action_source'
    ) AS "exists"
  `)
  return result.rows[0]?.exists === true
}

export async function setPageTemplateCompositionSchema(
  migrationArguments: MigrateDownArgs & MigrateUpArgs,
  enabled: boolean,
): Promise<void> {
  const exists = await pageTemplateCompositionSchemaExists(migrationArguments.db)
  if (enabled && !exists) {
    await upPageTemplateComposition(migrationArguments)
    await upListingEmptyRelationships(migrationArguments)
    await upCurrentItemFields(migrationArguments)
  }
  if (!enabled && exists) {
    await downCurrentItemFields(migrationArguments)
    await downListingEmptyRelationships(migrationArguments)
    await downPageTemplateComposition(migrationArguments)
  }
}
