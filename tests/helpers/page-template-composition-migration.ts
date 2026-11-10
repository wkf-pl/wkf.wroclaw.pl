import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'

import { down, up } from '../../migrations/20261107_002214_page_template_composition'

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
  if (enabled && !exists) await up(migrationArguments)
  if (!enabled && exists) await down(migrationArguments)
}
