import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createLocalReq, type PayloadRequest } from 'payload'

import {
  down as downRelatedContent,
  up as upRelatedContent,
} from '../../migrations/20261102_114056_related_content_listing'
import {
  down as downPageTemplates,
  up as upPageTemplates,
} from '../../migrations/20261104_020601_page_templates_collection'
import { setPageTemplateCompositionSchema } from '../helpers/page-template-composition-migration'
import {
  createContentTaxonomyFixture,
  type ContentTaxonomyFixture,
} from '../helpers/content-taxonomy-fixture'
import { createLexicalDocument } from '../helpers/lexical-document'

const cycleSlug = 'integration-related-content-migration-cycle'
const eventSlug = 'integration-related-content-migration-event'
const postSlug = 'integration-related-content-migration-post'

let fixture: ContentTaxonomyFixture
let migrationRequest: PayloadRequest

function migrationArguments(): MigrateDownArgs & MigrateUpArgs {
  return {
    db: fixture.payload.db.drizzle,
    payload: fixture.payload,
    req: migrationRequest,
  } as MigrateDownArgs & MigrateUpArgs
}

async function relatedContentSchemaExists(): Promise<boolean> {
  const result = await fixture.payload.db.drizzle.execute(sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'content_listing_items'
        AND column_name = 'related_target_search_index'
    ) AS "exists"
  `)
  return result.rows[0]?.exists === true
}

async function pageTemplatesSchemaExists(): Promise<boolean> {
  const result = await fixture.payload.db.drizzle.execute(
    sql`SELECT to_regclass('public.page_templates') IS NOT NULL AS "exists"`,
  )
  return result.rows[0]?.exists === true
}

async function suspendPageTemplatesSchema(): Promise<void> {
  await setPageTemplateCompositionSchema(migrationArguments(), false)
  if (await pageTemplatesSchemaExists()) await downPageTemplates(migrationArguments())
  await fixture.payload.db.drizzle.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
    ADD COLUMN IF NOT EXISTS "page_templates_id" integer
  `)
}

async function restorePageTemplatesSchema(): Promise<void> {
  if (!(await pageTemplatesSchemaExists())) {
    await fixture.payload.db.drizzle.execute(sql`
      ALTER TABLE "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS "page_templates_id"
    `)
    await upPageTemplates(migrationArguments())
    await migrationArguments().db.execute(
      sql`ALTER TABLE "_page_templates_v" ADD COLUMN "autosave" boolean; CREATE INDEX "_page_templates_v_autosave_idx" ON "_page_templates_v" ("autosave");`,
    )
  }
  await setPageTemplateCompositionSchema(migrationArguments(), true)
}

async function cleanupFixtures(): Promise<void> {
  if (!(await relatedContentSchemaExists())) {
    await suspendPageTemplatesSchema()
    await upRelatedContent(migrationArguments())
  }
  await restorePageTemplatesSchema()
  await fixture.payload.delete({
    collection: 'posts',
    overrideAccess: true,
    trash: true,
    where: { slug: { equals: postSlug } },
  })
  await fixture.payload.delete({
    collection: 'events',
    overrideAccess: true,
    trash: true,
    where: { slug: { equals: eventSlug } },
  })
  await fixture.payload.delete({
    collection: 'event-cycles',
    overrideAccess: true,
    trash: true,
    where: { slug: { equals: cycleSlug } },
  })
}

beforeAll(async () => {
  fixture = await createContentTaxonomyFixture('related-content-migration')
  migrationRequest = await createLocalReq(
    { context: { skipContentListingSync: true, skipPublicCacheInvalidation: true } },
    fixture.payload,
  )
  await cleanupFixtures()
})

afterAll(async () => {
  if (!fixture?.payload) return
  await cleanupFixtures()
  await fixture.cleanup()
})

describe('related content migration', () => {
  it('backfills Post relations and guards rollback', { timeout: 20_000 }, async () => {
    const cycle = await fixture.payload.create({
      collection: 'event-cycles',
      data: {
        _status: 'published',
        author: fixture.author.id,
        eventDefaults: {
          capacityMode: 'unlimited',
          eventType: 1,
          layout: [
            { blockType: 'richText', content: createLexicalDocument('Default cycle content') },
          ],
          location: { city: 'Wrocław', country: 'Polska' },
          participation: 'public',
        },
        excerpt: createLexicalDocument('Migration cycle excerpt'),
        layout: [{ blockType: 'richText', content: createLexicalDocument('Cycle content') }],
        slug: cycleSlug,
        title: 'Migration related cycle',
      },
      draft: false,
      overrideAccess: true,
    })
    const event = await fixture.payload.create({
      collection: 'events',
      data: {
        _status: 'published',
        author: fixture.author.id,
        calendarRevision: 0,
        capacityMode: 'unlimited',
        cycle: cycle.id,
        eventStatus: 'scheduled',
        eventType: 1,
        excerpt: createLexicalDocument('Migration event excerpt'),
        layout: [{ blockType: 'richText', content: createLexicalDocument('Event content') }],
        location: { city: 'Wrocław', country: 'Polska' },
        participation: 'public',
        slug: eventSlug,
        startAt: '2032-09-10T16:00:00.000Z',
        timeMode: 'timed',
        title: 'Migration related event',
      },
      draft: false,
      overrideAccess: true,
    })
    const post = await fixture.payload.create({
      collection: 'posts',
      data: {
        _status: 'published',
        author: fixture.author.id,
        excerpt: 'Migration post excerpt',
        layout: [{ blockType: 'richText', content: createLexicalDocument('Post content') }],
        relatedContent: [
          { relationTo: 'events', value: event.id },
          { relationTo: 'event-cycles', value: cycle.id },
        ],
        slug: postSlug,
        title: 'Migration related post',
      },
      draft: false,
      overrideAccess: true,
    })

    await suspendPageTemplatesSchema()
    await downRelatedContent(migrationArguments())
    const legacyPaths = await fixture.payload.db.drizzle.execute(sql`
      SELECT "path", count(*)::int AS "count"
      FROM "posts_rels"
      WHERE "parent_id" = ${post.id}
        AND "path" IN ('relatedEvents', 'relatedEventCycles')
      GROUP BY "path"
      ORDER BY "path"
    `)
    expect(legacyPaths.rows).toEqual([
      { count: 1, path: 'relatedEventCycles' },
      { count: 1, path: 'relatedEvents' },
    ])
    const legacyVersionPaths = await fixture.payload.db.drizzle.execute(sql`
      SELECT DISTINCT "path"
      FROM "_posts_v_rels"
      WHERE "path" IN ('version.relatedEvents', 'version.relatedEventCycles')
      ORDER BY "path"
    `)
    expect(legacyVersionPaths.rows).toEqual([
      { path: 'version.relatedEventCycles' },
      { path: 'version.relatedEvents' },
    ])

    // The related target must be indexable before this later layout table exists.
    await fixture.payload.db.drizzle.execute(sql`
      ALTER TABLE "events_blocks_field_row_text" RENAME TO "future_events_blocks_field_row_text"
    `)
    try {
      await upRelatedContent(migrationArguments())
    } finally {
      await fixture.payload.db.drizzle.execute(sql`
        ALTER TABLE "future_events_blocks_field_row_text" RENAME TO "events_blocks_field_row_text"
      `)
    }
    const indexedPost = await fixture.payload.db.drizzle.execute(sql`
      SELECT "related_target_search_index" AS "relatedTargetSearchIndex"
      FROM "content_listing_items"
      WHERE "source" = 'posts' AND "source_document_id" = ${post.id}
    `)
    expect(indexedPost.rows).toEqual([
      { relatedTargetSearchIndex: `|events:${event.id}|event-cycles:${cycle.id}|` },
    ])

    const migratedPost = await fixture.payload.findByID({
      collection: 'posts',
      depth: 0,
      id: post.id,
      overrideAccess: true,
    })
    expect(migratedPost.relatedContent).toEqual([
      { relationTo: 'events', value: event.id },
      { relationTo: 'event-cycles', value: cycle.id },
    ])

    await fixture.payload.update({
      collection: 'posts',
      data: {
        _status: 'published',
        relatedContent: [{ relationTo: 'pages', value: fixture.page.id }],
      },
      draft: false,
      id: post.id,
      overrideAccess: true,
    })
    await expect(downRelatedContent(migrationArguments())).rejects.toThrow(
      'contains targets unsupported by the legacy fields',
    )
    await fixture.payload.db.drizzle.execute(sql`
      DELETE FROM "_posts_v_rels"
      WHERE "path" = 'version.relatedContent' AND "pages_id" IS NOT NULL
    `)

    await fixture.payload.update({
      collection: 'posts',
      data: {
        _status: 'published',
        layout: [
          { blockType: 'richText', content: createLexicalDocument('Post content') },
          {
            blockType: 'listing',
            conditions: [
              { field: 'relatedTo', operator: 'contains', relatedTargetMode: 'current' },
            ],
            pageSize: 12,
            pagination: false,
            selectionMode: 'filters',
            sort: 'newest',
            sources: ['posts'],
            view: 'cards',
          },
        ],
        relatedContent: [
          { relationTo: 'events', value: event.id },
          { relationTo: 'event-cycles', value: cycle.id },
        ],
      },
      draft: false,
      id: post.id,
      overrideAccess: true,
    })
    await expect(downRelatedContent(migrationArguments())).rejects.toThrow(
      'at least one Listing uses the relatedTo condition',
    )

    await fixture.payload.update({
      collection: 'posts',
      data: {
        _status: 'published',
        layout: [{ blockType: 'richText', content: createLexicalDocument('Post content') }],
      },
      draft: false,
      id: post.id,
      overrideAccess: true,
    })
    await fixture.payload.db.drizzle.execute(sql`
      DELETE FROM "posts_blocks_listing_conditions" WHERE "field" = 'relatedTo';
      DELETE FROM "_posts_v_blocks_listing_conditions" WHERE "field" = 'relatedTo';
    `)
    await downRelatedContent(migrationArguments())
    await upRelatedContent(migrationArguments())
    await restorePageTemplatesSchema()
  })
})
