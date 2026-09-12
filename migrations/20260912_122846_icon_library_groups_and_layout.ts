import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

const iconNameEnumTypes = [
  'enum_club_sections_menu_items_icon_name',
  'enum__club_sections_v_version_menu_items_icon_name',
  'enum_navigation_header_items_icon_name',
  'enum_homepage_sections_groups_menu_items_icon_name',
  'enum_footer_social_items_icon_name',
] as const

async function renameIconNameEnumValue(
  db: MigrateUpArgs['db'] | MigrateDownArgs['db'],
  from: string,
  to: string,
): Promise<void> {
  for (const enumType of iconNameEnumTypes) {
    await db.execute(
      sql.raw(`ALTER TYPE "public"."${enumType}" RENAME VALUE '${from}' TO '${to}';`),
    )
  }
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await renameIconNameEnumValue(db, 'larp-mask', 'larp')
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await renameIconNameEnumValue(db, 'larp', 'larp-mask')
}
