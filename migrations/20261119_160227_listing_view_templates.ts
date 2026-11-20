import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

const initialTemplates = {
  cards: {
    label: 'Karty',
    view: {
      layout: 'static',
      columns: 1,
      form: 'horizontal',
      dateFormat: 'full',
      information: {
        image: true,
        kind: true,
        date: true,
        venue: true,
        cycle: true,
        excerpt: true,
        taxonomy: true,
        context: true,
        interests: true,
        calendar: false,
      },
    },
  },
  grid: {
    label: 'Siatka',
    view: {
      layout: 'static',
      columns: 3,
      form: 'vertical',
      dateFormat: 'short',
      information: {
        image: true,
        kind: true,
        date: true,
        venue: true,
        cycle: false,
        excerpt: true,
        taxonomy: true,
        context: true,
        interests: true,
        calendar: false,
      },
    },
  },
  tiles: {
    label: 'Kafelki',
    view: {
      layout: 'static',
      columns: 3,
      form: 'tile',
      dateFormat: 'short',
      information: {
        image: true,
        kind: true,
        date: true,
        venue: false,
        cycle: false,
        excerpt: false,
        taxonomy: false,
        context: true,
        interests: false,
        calendar: false,
      },
    },
  },
  compact: {
    label: 'Lista kompaktowa',
    view: {
      layout: 'static',
      columns: 1,
      form: 'row',
      dateFormat: 'short',
      information: {
        image: false,
        kind: true,
        date: true,
        venue: false,
        cycle: false,
        excerpt: false,
        taxonomy: false,
        context: true,
        interests: false,
        calendar: false,
      },
    },
  },
  carousel: {
    label: 'Karuzela',
    view: {
      layout: 'carousel',
      columns: 1,
      form: 'horizontal',
      dateFormat: 'full',
      information: {
        image: true,
        kind: true,
        date: true,
        venue: true,
        cycle: false,
        excerpt: true,
        taxonomy: true,
        context: true,
        interests: false,
        calendar: true,
      },
    },
  },
  upcoming: {
    label: 'Nadchodzące wydarzenia',
    view: {
      layout: 'static',
      columns: 3,
      form: 'vertical',
      dateFormat: 'full',
      information: {
        image: true,
        kind: false,
        date: true,
        venue: true,
        cycle: false,
        excerpt: true,
        taxonomy: false,
        context: false,
        interests: false,
        calendar: false,
      },
    },
  },
  agenda: {
    label: 'Program — zwarta lista',
    view: {
      layout: 'static',
      columns: 1,
      form: 'row',
      dateFormat: 'short',
      information: {
        image: false,
        kind: false,
        date: true,
        venue: true,
        cycle: false,
        excerpt: false,
        taxonomy: false,
        context: false,
        interests: false,
        calendar: false,
      },
    },
  },
  featured: {
    label: 'Polecane wydarzenia — karuzela',
    view: {
      layout: 'carousel',
      columns: 2,
      form: 'vertical',
      dateFormat: 'full',
      information: {
        image: true,
        kind: false,
        date: true,
        venue: false,
        cycle: false,
        excerpt: true,
        taxonomy: false,
        context: false,
        interests: false,
        calendar: false,
      },
    },
  },
}

const listingTables = [
  'page_templates_blocks_listing',
  '_page_templates_v_blocks_listing',
  'pages_blocks_listing',
  '_pages_v_blocks_listing',
  'posts_blocks_listing',
  '_posts_v_blocks_listing',
  'events_blocks_listing',
  '_events_v_blocks_listing',
  'event_cycles_blocks_listing',
  '_event_cycles_v_blocks_listing',
  'partners_blocks_listing',
  '_partners_v_blocks_listing',
  'homepage_sections_blocks_listing',
  '_homepage_sections_v_blocks_listing',
] as const

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "listing_views" ADD COLUMN "preset_key" varchar;
  ALTER TABLE "_listing_views_v" ADD COLUMN "version_preset_key" varchar;
  CREATE UNIQUE INDEX "listing_views_preset_key_idx" ON "listing_views" USING btree ("preset_key");
  CREATE INDEX "_listing_views_v_version_version_preset_key_idx" ON "_listing_views_v" USING btree ("version_preset_key");`)
  await migrateListingViewPresets({ db } as MigrateUpArgs)
}

export async function migrateListingViewPresets({ db }: MigrateUpArgs): Promise<void> {
  for (const [presetKey, template] of Object.entries(initialTemplates)) {
    const existing = await db.execute<{ id: number }>(sql`
      SELECT "id" FROM "listing_views" WHERE "preset_key" = ${presetKey} LIMIT 1;
    `)
    let documentID = existing.rows[0]?.id
    if (documentID === undefined) {
      const settings = JSON.stringify(template.view)
      const inserted = await db.execute<{ id: number }>(sql`
        INSERT INTO "listing_views" ("name", "preset_key", "settings", "retired", "_status")
        VALUES (${template.label}, ${presetKey}, ${settings}::jsonb, false, 'published')
        RETURNING "id";
      `)
      documentID = inserted.rows[0]!.id
      await db.execute(sql`
        INSERT INTO "_listing_views_v" (
          "parent_id", "version_name", "version_preset_key", "version_settings",
          "version_retired", "version_created_at", "version_updated_at",
          "version__status", "latest"
        ) VALUES (
          ${documentID}, ${template.label}, ${presetKey}, ${settings}::jsonb,
          false, now(), now(), 'published', true
        );
      `)
    }
    for (const table of listingTables) {
      await db.execute(sql`
        UPDATE ${sql.identifier(table)}
        SET "appearance" = jsonb_set(
          COALESCE("appearance", '{}'::jsonb),
          '{preset}',
          to_jsonb(${'shared:' + documentID}::text)
        )
        WHERE COALESCE("appearance"->>'preset', "view"::text, 'cards') = ${presetKey};
      `)
    }
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const table of listingTables) {
    await db.execute(sql`
      UPDATE ${sql.identifier(table)} AS block
      SET "appearance" = jsonb_build_object(
        'preset', template."preset_key",
        'overrides', template."settings" || COALESCE(block."appearance"->'overrides', '{}'::jsonb) ||
          jsonb_build_object('information',
            COALESCE(template."settings"->'information', '{}'::jsonb) ||
            COALESCE(block."appearance"->'overrides'->'information', '{}'::jsonb)
          )
      )
      FROM "listing_views" AS template
      WHERE template."preset_key" IS NOT NULL
        AND block."appearance"->>'preset' = 'shared:' || template."id"::text;
    `)
  }
  // Keep the templates and their versions available when rolling back the reference mapping.
  await db.execute(sql`
   DROP INDEX "listing_views_preset_key_idx";
  DROP INDEX "_listing_views_v_version_version_preset_key_idx";
  ALTER TABLE "listing_views" DROP COLUMN "preset_key";
  ALTER TABLE "_listing_views_v" DROP COLUMN "version_preset_key";`)
}
