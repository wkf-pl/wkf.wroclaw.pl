import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createLocalReq, initTransaction, killTransaction, type PayloadRequest } from 'payload'

import {
  down as downRelatedContent,
  up as upRelatedContent,
} from '../../migrations/20261102_114056_related_content_listing'
import { down as downPageTemplates } from '../../migrations/20261104_020601_page_templates_collection'
import { setPageTemplateCompositionSchema } from '../helpers/page-template-composition-migration'
import {
  createContentTaxonomyFixture,
  type ContentTaxonomyFixture,
} from '../helpers/content-taxonomy-fixture'
import { createLexicalDocument } from '../helpers/lexical-document'

const cycleSlug = 'integration-related-content-migration-cycle'
const eventSlug = 'integration-related-content-migration-event'

let fixture: ContentTaxonomyFixture
let migrationRequest: PayloadRequest
let migrationDatabase: MigrateUpArgs['db']

function migrationArguments(): MigrateDownArgs & MigrateUpArgs {
  return {
    db: migrationDatabase,
    payload: fixture.payload,
    req: migrationRequest,
  } as MigrateDownArgs & MigrateUpArgs
}

async function pageTemplatesSchemaExists(): Promise<boolean> {
  const result = await migrationDatabase.execute(
    sql`SELECT to_regclass('public.page_templates') IS NOT NULL AS "exists"`,
  )
  return result.rows[0]?.exists === true
}

async function suspendPageTemplatesSchema(): Promise<void> {
  await setPageTemplateCompositionSchema(migrationArguments(), false)
  if (await pageTemplatesSchemaExists()) await downPageTemplates(migrationArguments())
  await migrationDatabase.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
    ADD COLUMN IF NOT EXISTS "page_templates_id" integer
  `)
}

beforeAll(async () => {
  fixture = await createContentTaxonomyFixture('related-content-migration')
  migrationRequest = await createLocalReq(
    { context: { skipContentListingSync: true, skipPublicCacheInvalidation: true } },
    fixture.payload,
  )
  await initTransaction(migrationRequest)
  const transactionId = await migrationRequest.transactionID
  const db = transactionId == null ? undefined : fixture.payload.db.sessions?.[transactionId]?.db
  if (!db) throw new Error('Payload migration transaction was not initialized')
  migrationDatabase = db as MigrateUpArgs['db']
})

afterAll(async () => {
  if (!fixture?.payload) return
  if (migrationRequest) await killTransaction(migrationRequest)
  await fixture.cleanup()
})

describe('related content migration', () => {
  it('backfills Post relations and guards rollback', { timeout: 20_000 }, async () => {
    const cycle = await fixture.payload.create({
      req: migrationRequest,
      collection: 'event-cycles',
      data: {
        _status: 'published',
        author: { relationTo: 'users', value: fixture.author.id },
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
      req: migrationRequest,
      collection: 'events',
      data: {
        _status: 'published',
        author: { relationTo: 'users', value: fixture.author.id },
        calendarRevision: 0,
        capacityMode: 'unlimited',
        cycle: cycle.id,
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
    const post = await fixture.payload.update({
      req: migrationRequest,
      collection: 'posts',
      id: fixture.post.id,
      data: {
        relatedContent: [
          { relationTo: 'events', value: event.id },
          { relationTo: 'event-cycles', value: cycle.id },
        ],
      },
      draft: false,
      overrideAccess: true,
    })

    await suspendPageTemplatesSchema()
    await downRelatedContent(migrationArguments())
    const legacyPaths = await migrationDatabase.execute(sql`
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
    const legacyVersionPaths = await migrationDatabase.execute(sql`
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
    await migrationDatabase.execute(sql`
      ALTER TABLE "events_blocks_field_row_text" RENAME TO "future_events_blocks_field_row_text"
    `)
    try {
      await upRelatedContent(migrationArguments())
    } finally {
      await migrationDatabase.execute(sql`
        ALTER TABLE "future_events_blocks_field_row_text" RENAME TO "events_blocks_field_row_text"
      `)
    }
    const indexedPost = await migrationDatabase.execute(sql`
      SELECT "related_target_search_index" AS "relatedTargetSearchIndex"
      FROM "content_listing_items"
      WHERE "source" = 'posts' AND "source_document_id" = ${post.id}
    `)
    expect(indexedPost.rows).toEqual([
      { relatedTargetSearchIndex: `|events:${event.id}|event-cycles:${cycle.id}|` },
    ])

    const migratedPost = await fixture.payload.findByID({
      req: migrationRequest,
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
      req: migrationRequest,
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
    await migrationDatabase.execute(sql`
      DELETE FROM "_posts_v_rels"
      WHERE "path" = 'version.relatedContent' AND "pages_id" IS NOT NULL
    `)

    await fixture.payload.update({
      req: migrationRequest,
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
      req: migrationRequest,
      collection: 'posts',
      data: {
        _status: 'published',
        layout: [{ blockType: 'richText', content: createLexicalDocument('Post content') }],
      },
      draft: false,
      id: post.id,
      overrideAccess: true,
    })
    await migrationDatabase.execute(sql`
      DELETE FROM "posts_blocks_listing_conditions" WHERE "field" = 'relatedTo';
      DELETE FROM "_posts_v_blocks_listing_conditions" WHERE "field" = 'relatedTo';
    `)
    await downRelatedContent(migrationArguments())
    await upRelatedContent(migrationArguments())
  })
})
