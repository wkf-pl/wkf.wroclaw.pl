import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

type CustomIconUsage = {
  record_id: number | string
  table_name: string
}

type UnsupportedLegacyIconUsage = CustomIconUsage & {
  icon_name: string
}

const iconColumns = [
  {
    finalEnumName: 'enum_club_sections_menu_items_icon_name',
    legacyEnumName: 'enum_club_sections_menu_items_system_icon',
    tableName: 'club_sections_menu_items',
  },
  {
    finalEnumName: 'enum__club_sections_v_version_menu_items_icon_name',
    legacyEnumName: 'enum__club_sections_v_version_menu_items_system_icon',
    tableName: '_club_sections_v_version_menu_items',
  },
  {
    finalEnumName: 'enum_navigation_header_items_icon_name',
    legacyEnumName: 'enum_navigation_header_items_system_icon',
    tableName: 'navigation_header_items',
  },
  {
    finalEnumName: 'enum_homepage_sections_groups_menu_items_icon_name',
    legacyEnumName: 'enum_homepage_sections_groups_menu_items_system_icon',
    tableName: 'homepage_sections_groups_menu_items',
  },
  {
    finalEnumName: 'enum_footer_social_items_icon_name',
    legacyEnumName: 'enum_footer_social_items_system_icon',
    tableName: 'footer_social_items',
  },
] as const

const legacyIconNames = [
  'time',
  'discord',
  'mail',
  'facebook',
  'star',
  'instagram',
  'calendar',
  'collection',
  'dice',
  'book',
  'location',
  'pawn',
  'review',
  'slack',
  'users',
] as const

const finalIconNames = [
  'astronaut',
  'bluesky',
  'mace',
  'time',
  'dnd5',
  'discord',
  'document',
  'mail',
  'facebook',
  'globe',
  'star',
  'instagram',
  'calendar',
  'gun',
  'cards',
  'collection',
  'compass',
  'confetti',
  'dice',
  'd10',
  'd12',
  'd20',
  'd4',
  'd6',
  'd8',
  'book',
  'fireball',
  'larp',
  'external-link',
  'linkedin',
  'location',
  'bow',
  'mage',
  'messenger',
  'sword',
  'image',
  'announcement',
  'partner',
  'pdf',
  'pawn',
  'download',
  'review',
  'wand',
  'sf',
  'arrows',
  'slack',
  'users',
  'star-trek',
  'star-wars-empire',
  'star-wars-rebel-alliance',
  'steampunk',
  'home',
  'arrow',
  'arrow-left',
  'arrow-right',
  'stormtrooper',
  'tag',
  'shield',
  'axe',
  'twitch',
  'fighter',
  'event',
  'youtube',
] as const

function createEnumValueList(values: readonly string[]): string {
  return values.map((value) => `'${value.replaceAll("'", "''")}'`).join(', ')
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  const customIconUsage = await db.execute(sql`
    SELECT 'club_sections_menu_items' AS table_name, id::text AS record_id
      FROM "club_sections_menu_items"
      WHERE "icon_source" = 'media' AND "custom_icon_id" IS NOT NULL
    UNION ALL
    SELECT '_club_sections_v_version_menu_items', id::text
      FROM "_club_sections_v_version_menu_items"
      WHERE "icon_source" = 'media' AND "custom_icon_id" IS NOT NULL
    UNION ALL
    SELECT 'navigation_header_items', id::text
      FROM "navigation_header_items"
      WHERE "icon_source" = 'media' AND "custom_icon_id" IS NOT NULL
    UNION ALL
    SELECT 'homepage_sections_groups_menu_items', id::text
      FROM "homepage_sections_groups_menu_items"
      WHERE "icon_source" = 'media' AND "custom_icon_id" IS NOT NULL
    UNION ALL
    SELECT 'footer_social_items', id::text
      FROM "footer_social_items"
      WHERE "icon_source" = 'media' AND "custom_icon_id" IS NOT NULL
    ORDER BY table_name, record_id
  `)
  const customIconRecords = customIconUsage.rows as CustomIconUsage[]

  if (customIconRecords.length > 0) {
    const recordList = customIconRecords
      .map(({ record_id, table_name }) => `${table_name}#${record_id}`)
      .join(', ')

    throw new Error(
      `Raster icon migration stopped because custom Media icons cannot be mapped safely. Replace these records with named icons first: ${recordList}`,
    )
  }

  const finalEnumValues = createEnumValueList(finalIconNames)

  for (const { finalEnumName, legacyEnumName, tableName } of iconColumns) {
    await db.execute(
      sql.raw(`
        ALTER TABLE "${tableName}" ALTER COLUMN "system_icon" SET DATA TYPE text;
        DROP TYPE "public"."${legacyEnumName}";
        CREATE TYPE "public"."${finalEnumName}" AS ENUM(${finalEnumValues});
        ALTER TABLE "${tableName}" ALTER COLUMN "system_icon" SET DATA TYPE "public"."${finalEnumName}" USING "system_icon"::"public"."${finalEnumName}";
        ALTER TABLE "${tableName}" RENAME COLUMN "system_icon" TO "icon_name";
      `),
    )
  }

  await db.execute(sql`
    ALTER TABLE "club_sections_menu_items" DROP CONSTRAINT "club_sections_menu_items_custom_icon_id_media_id_fk";
    ALTER TABLE "_club_sections_v_version_menu_items" DROP CONSTRAINT "_club_sections_v_version_menu_items_custom_icon_id_media_id_fk";
    ALTER TABLE "navigation_header_items" DROP CONSTRAINT "navigation_header_items_custom_icon_id_media_id_fk";
    ALTER TABLE "homepage_sections_groups_menu_items" DROP CONSTRAINT "homepage_sections_groups_menu_items_custom_icon_id_media_id_fk";
    ALTER TABLE "footer_social_items" DROP CONSTRAINT "footer_social_items_custom_icon_id_media_id_fk";
    DROP INDEX "club_sections_menu_items_custom_icon_idx";
    DROP INDEX "_club_sections_v_version_menu_items_custom_icon_idx";
    DROP INDEX "navigation_header_items_custom_icon_idx";
    DROP INDEX "homepage_sections_groups_menu_items_custom_icon_idx";
    DROP INDEX "footer_social_items_custom_icon_idx";
    ALTER TABLE "club_sections_menu_items" DROP COLUMN "icon_source";
    ALTER TABLE "club_sections_menu_items" DROP COLUMN "custom_icon_id";
    ALTER TABLE "_club_sections_v_version_menu_items" DROP COLUMN "icon_source";
    ALTER TABLE "_club_sections_v_version_menu_items" DROP COLUMN "custom_icon_id";
    ALTER TABLE "navigation_header_items" DROP COLUMN "icon_source";
    ALTER TABLE "navigation_header_items" DROP COLUMN "custom_icon_id";
    ALTER TABLE "homepage_sections_groups_menu_items" DROP COLUMN "icon_source";
    ALTER TABLE "homepage_sections_groups_menu_items" DROP COLUMN "custom_icon_id";
    ALTER TABLE "footer_social_items" DROP COLUMN "icon_source";
    ALTER TABLE "footer_social_items" DROP COLUMN "custom_icon_id";
    DROP TYPE "public"."enum_club_sections_menu_items_icon_source";
    DROP TYPE "public"."enum__club_sections_v_version_menu_items_icon_source";
    DROP TYPE "public"."enum_navigation_header_items_icon_source";
    DROP TYPE "public"."enum_homepage_sections_groups_menu_items_icon_source";
    DROP TYPE "public"."enum_footer_social_items_icon_source";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  const legacyEnumValues = createEnumValueList(legacyIconNames)
  const unsupportedLegacyIcons: UnsupportedLegacyIconUsage[] = []

  for (const { tableName } of iconColumns) {
    const result = await db.execute(
      sql.raw(`
        SELECT '${tableName}' AS table_name, id::text AS record_id, icon_name
          FROM "${tableName}"
          WHERE icon_name IS NOT NULL AND icon_name NOT IN (${legacyEnumValues})
          ORDER BY id
      `),
    )
    unsupportedLegacyIcons.push(...(result.rows as UnsupportedLegacyIconUsage[]))
  }

  if (unsupportedLegacyIcons.length > 0) {
    const recordList = unsupportedLegacyIcons
      .map(({ icon_name, record_id, table_name }) => `${table_name}#${record_id} (${icon_name})`)
      .join(', ')

    throw new Error(
      `Raster icon rollback stopped because these records use icons unavailable in the legacy schema: ${recordList}`,
    )
  }

  await db.execute(sql`
    CREATE TYPE "public"."enum_club_sections_menu_items_icon_source" AS ENUM('system', 'media');
    CREATE TYPE "public"."enum__club_sections_v_version_menu_items_icon_source" AS ENUM('system', 'media');
    CREATE TYPE "public"."enum_navigation_header_items_icon_source" AS ENUM('system', 'media');
    CREATE TYPE "public"."enum_homepage_sections_groups_menu_items_icon_source" AS ENUM('system', 'media');
    CREATE TYPE "public"."enum_footer_social_items_icon_source" AS ENUM('system', 'media');
  `)

  for (const { finalEnumName, legacyEnumName, tableName } of iconColumns) {
    await db.execute(
      sql.raw(`
        ALTER TABLE "${tableName}" RENAME COLUMN "icon_name" TO "system_icon";
        ALTER TABLE "${tableName}" ALTER COLUMN "system_icon" SET DATA TYPE text;
        DROP TYPE "public"."${finalEnumName}";
        CREATE TYPE "public"."${legacyEnumName}" AS ENUM(${legacyEnumValues});
        ALTER TABLE "${tableName}" ALTER COLUMN "system_icon" SET DATA TYPE "public"."${legacyEnumName}" USING "system_icon"::"public"."${legacyEnumName}";
      `),
    )
  }

  await db.execute(sql`
    ALTER TABLE "club_sections_menu_items" ADD COLUMN "icon_source" "enum_club_sections_menu_items_icon_source" DEFAULT 'system';
    ALTER TABLE "club_sections_menu_items" ADD COLUMN "custom_icon_id" integer;
    ALTER TABLE "_club_sections_v_version_menu_items" ADD COLUMN "icon_source" "enum__club_sections_v_version_menu_items_icon_source" DEFAULT 'system';
    ALTER TABLE "_club_sections_v_version_menu_items" ADD COLUMN "custom_icon_id" integer;
    ALTER TABLE "navigation_header_items" ADD COLUMN "icon_source" "enum_navigation_header_items_icon_source" DEFAULT 'system';
    ALTER TABLE "navigation_header_items" ADD COLUMN "custom_icon_id" integer;
    ALTER TABLE "homepage_sections_groups_menu_items" ADD COLUMN "icon_source" "enum_homepage_sections_groups_menu_items_icon_source" DEFAULT 'system';
    ALTER TABLE "homepage_sections_groups_menu_items" ADD COLUMN "custom_icon_id" integer;
    ALTER TABLE "footer_social_items" ADD COLUMN "icon_source" "enum_footer_social_items_icon_source" DEFAULT 'system';
    ALTER TABLE "footer_social_items" ADD COLUMN "custom_icon_id" integer;
    ALTER TABLE "club_sections_menu_items" ADD CONSTRAINT "club_sections_menu_items_custom_icon_id_media_id_fk" FOREIGN KEY ("custom_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_club_sections_v_version_menu_items" ADD CONSTRAINT "_club_sections_v_version_menu_items_custom_icon_id_media_id_fk" FOREIGN KEY ("custom_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "navigation_header_items" ADD CONSTRAINT "navigation_header_items_custom_icon_id_media_id_fk" FOREIGN KEY ("custom_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "homepage_sections_groups_menu_items" ADD CONSTRAINT "homepage_sections_groups_menu_items_custom_icon_id_media_id_fk" FOREIGN KEY ("custom_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "footer_social_items" ADD CONSTRAINT "footer_social_items_custom_icon_id_media_id_fk" FOREIGN KEY ("custom_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    CREATE INDEX "club_sections_menu_items_custom_icon_idx" ON "club_sections_menu_items" USING btree ("custom_icon_id");
    CREATE INDEX "_club_sections_v_version_menu_items_custom_icon_idx" ON "_club_sections_v_version_menu_items" USING btree ("custom_icon_id");
    CREATE INDEX "navigation_header_items_custom_icon_idx" ON "navigation_header_items" USING btree ("custom_icon_id");
    CREATE INDEX "homepage_sections_groups_menu_items_custom_icon_idx" ON "homepage_sections_groups_menu_items" USING btree ("custom_icon_id");
    CREATE INDEX "footer_social_items_custom_icon_idx" ON "footer_social_items" USING btree ("custom_icon_id");
  `)
}
