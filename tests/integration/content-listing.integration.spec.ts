import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createLocalReq, initTransaction, killTransaction } from 'payload'
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { migrateListingViewPresets } from '../../migrations/20261119_160227_listing_view_templates'
import {
  up as activateListingViews,
  down as retireListingViews,
} from '../../migrations/20261119_162628_listing_views_active'
import { listingPresets } from '@/modules/content/listing-view'
import { sql } from '@payloadcms/db-postgres'

import { findPublicContent } from '@/modules/content/content-listing'
import { resolvePublicListingView } from '@/modules/content/public-listing-view'
import { getContentListingPresentation } from '@/modules/content/content-listing-presentation'
import type { ListingViewUsageResult } from '@/modules/content/listing-view-usage'
import {
  listingViewReassignmentEndpoint,
  listingViewUsageEndpoint,
} from '@/modules/content/listing-view-endpoints'
import type { ListingBlock, Post } from '@/payload-types'

import {
  createContentTaxonomyFixture,
  type ContentTaxonomyFixture,
} from '../helpers/content-taxonomy-fixture'
import { createLexicalDocument } from '../helpers/lexical-document'

let fixture: ContentTaxonomyFixture

beforeAll(async () => {
  fixture = await createContentTaxonomyFixture('listing')
}, 20_000)

afterAll(async () => {
  await fixture?.cleanup()
})

describe('content listing and pagination', () => {
  it(
    'reassigns individual nested listings and detaches a draft while keeping its effective settings',
    { timeout: 20_000 },
    async () => {
      const { author, page, payload } = fixture
      const {
        docs: [administratorRole],
      } = await payload.find({
        collection: 'roles',
        where: { key: { equals: 'administrator' } },
        limit: 1,
      })
      const sharedView = await payload.create({
        collection: 'listing-views',
        data: { _status: 'published', name: 'Bulk source view', settings: { columns: 2 } },
      })
      const {
        docs: [replacement],
      } = await payload.find({
        collection: 'listing-views',
        where: { presetKey: { equals: 'grid' } },
        limit: 1,
      })
      if (!administratorRole || !replacement) throw new Error('Missing migrated roles or views.')
      const listing: ListingBlock = {
        appearance: {
          preset: `shared:${sharedView.id}`,
          overrides: { information: { date: false } },
        },
        blockType: 'listing',
        pageSize: 4,
        selectionMode: 'filters',
        sort: 'newest',
        sources: ['posts'],
        view: 'grid',
      }
      const req = await createLocalReq(
        {
          req: { routeParams: { id: String(sharedView.id) } },
          user: {
            ...author,
            collection: 'users',
            roles: [...(author.roles ?? []), administratorRole.id],
          },
        },
        payload,
      )
      const draft = await payload.create({
        collection: 'pages',
        data: {
          _status: 'draft',
          author: author.id,
          layout: [listing],
          slug: 'integration-listing-usage-draft',
          title: 'Draft shared listing usage',
        },
        draft: true,
      })

      try {
        await payload.update({
          collection: 'pages',
          id: draft.id,
          draft: true,
          data: {
            layout: [
              { blockType: 'spacer', size: '32' },
              {
                blockType: 'sectionGroup',
                name: 'Program próbny',
                sections: [{ blocks: [draft.layout![0] as ListingBlock] }],
              },
            ],
          },
        })
        await payload.update({
          collection: 'pages',
          id: page.id,
          data: {
            layout: [
              {
                blockType: 'sectionGroup',
                name: 'Aktualności',
                sections: [
                  {
                    blocks: [
                      {
                        blockType: 'listing',
                        selectionMode: 'filters',
                        searchEnabled: true,
                        appearance: listing.appearance,
                        pageSize: listing.pageSize,
                        sources: ['posts'],
                        view: 'grid',
                      },
                    ],
                  },
                ],
              },
              listing,
            ],
          },
          draft: false,
        })

        await expect(
          payload.delete({ collection: 'listing-views', id: sharedView.id }),
        ).rejects.toMatchObject({ status: 409 })

        const response = await listingViewUsageEndpoint.handler(req)
        expect(response.status).toBe(200)
        const { uses, templates } = (await response.json()) as ListingViewUsageResult
        expect(uses).toHaveLength(3)
        expect(templates.some(({ id }) => id === sharedView.id)).toBe(false)
        const nested = uses.find(
          ({ id, path }) => id === page.id && path === 'layout.0.sections.0.blocks.0',
        )
        const sibling = uses.find(({ id, path }) => id === page.id && path === 'layout.1')
        const draftUse = uses.find(({ id, status }) => id === draft.id && status === 'draft')
        if (!nested || !sibling || !draftUse) throw new Error('Missing distinct listing uses.')
        expect(nested.pathNames).toEqual({ 1: 'Aktualności' })
        expect(draftUse).toMatchObject({
          path: 'layout.1.sections.0.blocks.0',
          pathNames: { 1: 'Program próbny' },
        })

        req.json = async () => ({ keys: [sibling.key], target: replacement.id })
        expect((await listingViewReassignmentEndpoint.handler(req)).status).toBe(200)
        const published = await payload.findByID({ collection: 'pages', id: page.id, draft: false })
        expect(published.layout).toMatchObject([
          { sections: [{ blocks: [{ appearance: listing.appearance }] }] },
          { appearance: { ...(listing.appearance as object), preset: `shared:${replacement.id}` } },
        ])

        const originalView = (await resolvePublicListingView(listing)).view
        req.json = async () => ({ keys: [nested.key, draftUse.key], target: null })
        expect((await listingViewReassignmentEndpoint.handler(req)).status).toBe(200)
        const updatedDraft = await payload.findByID({
          collection: 'pages',
          id: draft.id,
          draft: true,
        })
        const draftGroup = updatedDraft.layout?.find(
          ({ blockType }) => blockType === 'sectionGroup',
        )
        const detached =
          draftGroup?.blockType === 'sectionGroup' ? draftGroup.sections[0]?.blocks[0] : undefined
        expect(detached).toMatchObject({
          appearance: { preset: 'custom', overrides: originalView },
        })
        if (!detached || detached.blockType !== 'listing') throw new Error('Missing listing.')
        expect((await resolvePublicListingView(detached)).view).toEqual(originalView)
        expect((await (await listingViewUsageEndpoint.handler(req)).json()).uses).toEqual([])
        await expect(
          payload.delete({ collection: 'listing-views', id: sharedView.id }),
        ).resolves.toMatchObject({ id: sharedView.id })
      } finally {
        await payload.delete({ collection: 'pages', id: draft.id, trash: true })
        await payload.update({
          collection: 'pages',
          id: page.id,
          data: { layout: page.layout },
          draft: false,
        })
        const source = await payload.findByID({
          collection: 'listing-views',
          id: sharedView.id,
          disableErrors: true,
        })
        if (source) await payload.delete({ collection: 'listing-views', id: sharedView.id })
      }
    },
  )

  it('finds the name of a block in the homepage sections', async () => {
    const { author, payload } = fixture
    const [
      {
        docs: [adminRole],
      },
      {
        docs: [template],
      },
    ] = await Promise.all([
      payload.find({ collection: 'roles', where: { key: { equals: 'administrator' } }, limit: 1 }),
      payload.find({
        collection: 'listing-views',
        where: { presetKey: { equals: 'tiles' } },
        limit: 1,
      }),
    ])
    const req = await createLocalReq(
      {
        req: { routeParams: { id: String(template.id) } },
        user: { ...author, collection: 'users', roles: [adminRole.id] },
      },
      payload,
    )
    await initTransaction(req)
    try {
      await payload.updateGlobal({
        slug: 'homepage-sections',
        req,
        data: {
          _status: 'published',
          layout: [
            {
              blockType: 'sectionGroup',
              name: 'Aktualności',
              sections: [
                {
                  blocks: [
                    {
                      blockType: 'listing',
                      appearance: { preset: `shared:${template.id}` },
                      view: 'tiles',
                      selectionMode: 'filters',
                      sources: ['posts'],
                      pageSize: 4,
                    },
                  ],
                },
              ],
            },
          ],
        },
      })
      const response = await listingViewUsageEndpoint.handler(req)
      expect(response.status).toBe(200)
      const { uses } = (await response.json()) as ListingViewUsageResult
      expect(uses).toContainEqual(
        expect.objectContaining({
          collection: 'homepage-sections',
          path: 'layout.0.sections.0.blocks.0',
          pathNames: { 1: 'Aktualności' },
        }),
      )
    } finally {
      await killTransaction(req)
    }
  })

  it('publishes editable templates for every former built-in preset', async () => {
    const { docs } = await fixture.payload.find({
      collection: 'listing-views',
      pagination: false,
      where: { presetKey: { exists: true } },
      overrideAccess: true,
    })
    expect(docs.map(({ presetKey }) => presetKey).sort()).toEqual(
      Object.keys(listingPresets).sort(),
    )
    expect(docs.every(({ _status }) => _status === 'published')).toBe(true)
    const template = docs.find(({ presetKey }) => presetKey === 'grid')!
    try {
      await fixture.payload.update({
        collection: 'listing-views',
        id: template.id,
        data: { settings: { ...listingPresets.grid.view, columns: 2 } },
        overrideAccess: true,
      })
      expect((await resolvePublicListingView({ view: 'grid' })).view.columns).toBe(2)
    } finally {
      await fixture.payload.update({
        collection: 'listing-views',
        id: template.id,
        data: { settings: listingPresets.grid.view },
        overrideAccess: true,
      })
    }
  })

  it('maps old preset references in live blocks and saved versions without losing overrides', async () => {
    const { payload, page } = fixture
    const override = { preset: 'grid', overrides: { columns: 2, information: { excerpt: false } } }
    const original = await payload.findByID({
      collection: 'pages',
      id: page.id,
      depth: 0,
      overrideAccess: true,
    })
    const updated = await payload.update({
      collection: 'pages',
      id: page.id,
      data: {
        layout: [
          {
            blockType: 'listing',
            selectionMode: 'manual',
            items: [{ item: { relationTo: 'posts', value: fixture.post.id } }],
            pageSize: 4,
            appearance: override,
          },
        ],
      },
      overrideAccess: true,
    })
    try {
      const blockID = updated.layout!.find((block) => block.blockType === 'listing')!.id
      await payload.db.drizzle.execute(sql`
        UPDATE "pages_blocks_listing" SET "appearance" = ${JSON.stringify(override)}::jsonb
        WHERE "id" = ${blockID};
      `)
      await payload.db.drizzle.execute(sql`
        UPDATE "_pages_v_blocks_listing" SET "appearance" = ${JSON.stringify(override)}::jsonb
        WHERE "_uuid" = ${blockID};
      `)
      const req = await createLocalReq({}, payload)
      await migrateListingViewPresets({ db: payload.db.drizzle, payload, req } as MigrateUpArgs)
      const template = (
        await payload.find({
          collection: 'listing-views',
          where: { presetKey: { equals: 'grid' } },
          overrideAccess: true,
        })
      ).docs[0]
      const current = await payload.findByID({
        collection: 'pages',
        id: page.id,
        depth: 0,
        overrideAccess: true,
      })
      expect(current.layout![0]).toMatchObject({
        appearance: { ...override, preset: `shared:${template.id}` },
      })
      const versions = await payload.db.drizzle.execute(sql`
        SELECT "appearance" FROM "_pages_v_blocks_listing" WHERE "_uuid" = ${blockID};
      `)
      expect(versions.rows.length).toBeGreaterThan(0)
      for (const row of versions.rows) {
        expect(row.appearance).toEqual({ ...override, preset: `shared:${template.id}` })
      }
    } finally {
      await payload.update({
        collection: 'pages',
        id: page.id,
        data: { layout: original.layout },
        overrideAccess: true,
      })
    }
  })

  it('preserves inactive templates and their versions when migrating the active flag in both directions', async () => {
    const { payload } = fixture
    const template = await payload.create({
      collection: 'listing-views',
      data: {
        name: 'Inactive view migration fixture',
        settings: listingPresets.grid.view,
        active: false,
        _status: 'published',
      },
      overrideAccess: true,
    })
    const migration = {
      db: payload.db.drizzle,
      payload,
      req: await createLocalReq({}, payload),
    } as MigrateUpArgs & MigrateDownArgs
    try {
      await retireListingViews(migration)
      const previous = await payload.db.drizzle.execute(sql`
        SELECT "retired" FROM "listing_views" WHERE "id" = ${template.id};
      `)
      expect(previous.rows[0]?.retired).toBe(true)
      const previousVersions = await payload.db.drizzle.execute(sql`
        SELECT "version_retired" FROM "_listing_views_v" WHERE "parent_id" = ${template.id};
      `)
      expect(previousVersions.rows.every((row) => row.version_retired === true)).toBe(true)
      await activateListingViews(migration)
      const restored = await payload.findByID({
        collection: 'listing-views',
        id: template.id,
        overrideAccess: true,
      })
      expect(restored.active).toBe(false)
      const restoredVersions = await payload.db.drizzle.execute(sql`
        SELECT "version_active" FROM "_listing_views_v" WHERE "parent_id" = ${template.id};
      `)
      expect(restoredVersions.rows.every((row) => row.version_active === false)).toBe(true)
    } finally {
      await payload.delete({ collection: 'listing-views', id: template.id, overrideAccess: true })
    }
  })

  it('keeps the published listing view active until the shared draft is published', async () => {
    const { payload } = fixture
    const template = await payload.create({
      collection: 'listing-views',
      data: {
        _status: 'published',
        name: 'Integration shared listing view',
        settings: { layout: 'static', columns: 3, information: { excerpt: true } },
      },
      overrideAccess: true,
    })
    const listing = {
      view: 'cards',
      appearance: {
        preset: `shared:${template.id}`,
        overrides: { information: { excerpt: false } },
      },
    }
    try {
      await payload.update({
        collection: 'listing-views',
        id: template.id,
        draft: true,
        data: { settings: { layout: 'carousel', columns: 2, information: { excerpt: true } } },
        overrideAccess: true,
      })
      expect((await resolvePublicListingView(listing)).view).toMatchObject({
        layout: 'static',
        columns: 3,
        information: { excerpt: false },
      })
      await payload.update({
        collection: 'listing-views',
        id: template.id,
        data: {
          _status: 'published',
          settings: { layout: 'carousel', columns: 2, information: { excerpt: true } },
          active: false,
        },
        overrideAccess: true,
      })
      expect((await resolvePublicListingView(listing)).view).toMatchObject({
        layout: 'carousel',
        columns: 2,
        information: { excerpt: false },
      })
    } finally {
      await payload.delete({ collection: 'listing-views', id: template.id, overrideAccess: true })
    }
  })

  it('returns a page and a post in one globally sorted public stream', async () => {
    const result = await findPublicContent({
      conditions: [
        {
          field: 'topic',
          operator: 'inSubtree',
          relationshipValue: { relationTo: 'topics', value: fixture.topic.id },
        },
        {
          field: 'tag',
          operator: 'contains',
          relationshipValue: { relationTo: 'tags', value: fixture.tag.id },
        },
      ],
      page: 1,
      pageSize: 12,
      pagination: true,
      sort: 'newest',
      sources: ['pages', 'posts'],
    })

    expect(
      result.items.map((item) => [item.kind, getContentListingPresentation(item, 'cards').title]),
    ).toEqual([
      ['posts', fixture.post.title],
      ['pages', fixture.page.title],
    ])

    const childResult = await findPublicContent({
      conditions: [
        {
          field: 'parentPage',
          operator: 'equals',
          relationshipValue: { relationTo: 'pages', value: fixture.page.id },
        },
      ],
      page: 1,
      pageSize: 12,
      pagination: true,
      sort: 'titleAscending',
      sources: ['pages'],
    })
    expect(childResult.items.map((item) => item.document.id)).toEqual([fixture.childPage.id])
    expect(childResult.items[0]?.document).toMatchObject({
      listingExcerpt: fixture.childPage.listingExcerpt,
    })
    expect(childResult.items[0]?.document).not.toHaveProperty('layout')

    const mixedSourceResult = await findPublicContent({
      conditions: [
        {
          field: 'parentPage',
          operator: 'equals',
          relationshipValue: { relationTo: 'pages', value: fixture.page.id },
        },
      ],
      page: 1,
      pageSize: 12,
      pagination: false,
      sort: 'titleAscending',
      sources: ['pages', 'posts'],
    })
    expect(mixedSourceResult.items.map(({ document, kind }) => `${kind}:${document.id}`)).toEqual([
      `pages:${fixture.childPage.id}`,
      `posts:${fixture.post.id}`,
    ])
  })

  it('distinguishes a topic subtree from an exact topic and combines repeated tags with AND', async () => {
    const childTopicSlug = 'integration-listing-child-topic'
    const secondTagSlug = 'integration-listing-second-tag'
    const doublyTaggedPostSlug = 'integration-listing-doubly-tagged-post'
    await fixture.payload.delete({
      collection: 'posts',
      overrideAccess: true,
      where: { slug: { equals: doublyTaggedPostSlug } },
    })
    await fixture.payload.delete({
      collection: 'topics',
      overrideAccess: true,
      where: { slug: { equals: childTopicSlug } },
    })
    await fixture.payload.delete({
      collection: 'tags',
      overrideAccess: true,
      where: { slug: { equals: secondTagSlug } },
    })

    const childTopic = await fixture.payload.create({
      collection: 'topics',
      data: {
        name: 'Integration child topic',
        parent: fixture.topic.id,
        slug: childTopicSlug,
      },
      overrideAccess: true,
    })
    const secondTag = await fixture.payload.create({
      collection: 'tags',
      data: { name: 'Integration second tag', slug: secondTagSlug },
      overrideAccess: true,
    })
    const doublyTaggedPost = await fixture.payload.create({
      collection: 'posts',
      data: {
        _status: 'published',
        author: fixture.author.id,
        topics: [childTopic.id],
        excerpt: 'Doubly tagged excerpt',
        layout: [{ blockType: 'richText', content: createLexicalDocument('Tagged content') }],
        publishedAt: '2026-08-20T12:00:00.000Z',
        slug: doublyTaggedPostSlug,
        tags: [fixture.tag.id, secondTag.id],
        title: 'Integration doubly tagged post',
      },
      overrideAccess: true,
    })

    try {
      const subtreeResult = await findPublicContent({
        conditions: [
          {
            field: 'topic',
            operator: 'inSubtree',
            relationshipValue: { relationTo: 'topics', value: fixture.topic.id },
          },
        ],
        page: 1,
        pageSize: 20,
        pagination: false,
        sort: 'titleAscending',
        sources: ['posts'],
      })
      const exactResult = await findPublicContent({
        conditions: [
          {
            field: 'topic',
            operator: 'equals',
            relationshipValue: { relationTo: 'topics', value: fixture.topic.id },
          },
        ],
        page: 1,
        pageSize: 20,
        pagination: false,
        sort: 'titleAscending',
        sources: ['posts'],
      })
      const repeatedTagsResult = await findPublicContent({
        conditions: [
          {
            field: 'tag',
            operator: 'contains',
            relationshipValue: { relationTo: 'tags', value: fixture.tag.id },
          },
          {
            field: 'tag',
            operator: 'contains',
            relationshipValue: { relationTo: 'tags', value: secondTag.id },
          },
        ],
        page: 1,
        pageSize: 20,
        pagination: false,
        sort: 'titleAscending',
        sources: ['posts'],
      })

      expect(subtreeResult.items.map((item) => item.document.id)).toContain(doublyTaggedPost.id)
      expect(exactResult.items.map((item) => item.document.id)).not.toContain(doublyTaggedPost.id)
      expect(repeatedTagsResult.items.map((item) => item.document.id)).toEqual([
        doublyTaggedPost.id,
      ])
    } finally {
      await fixture.payload.delete({
        collection: 'posts',
        id: doublyTaggedPost.id,
        overrideAccess: true,
      })
      await fixture.payload.delete({
        collection: 'topics',
        id: childTopic.id,
        overrideAccess: true,
      })
      await fixture.payload.delete({
        collection: 'tags',
        id: secondTag.id,
        overrideAccess: true,
      })
    }
  })

  it('stores empty relationship filters without values and finds pages with missing relationships', async () => {
    const containerPage = await fixture.payload.create({
      collection: 'pages',
      data: {
        _status: 'draft',
        author: fixture.author.id,
        layout: [
          {
            blockType: 'listing',
            conditions: [
              { field: 'parentPage', operator: 'isEmpty' },
              { field: 'topic', operator: 'isEmpty' },
              {
                field: 'tag',
                operator: 'isEmpty',
                relationshipValue: { relationTo: 'tags', value: fixture.tag.id },
              },
              { field: 'eventCycle', operator: 'isEmpty' },
            ],
            pageSize: 12,
            selectionMode: 'filters',
            sources: ['pages', 'events'],
            view: 'cards',
          },
        ],
        slug: `${fixture.slugs.lifecyclePage}-empty-filters`,
        title: 'Integration empty filters container',
      },
      overrideAccess: true,
    })

    try {
      const storedPage = await fixture.payload.findByID({
        collection: 'pages',
        depth: 0,
        id: containerPage.id,
        overrideAccess: true,
      })
      const listing = storedPage.layout?.find((block) => block.blockType === 'listing')
      expect(
        listing?.conditions?.map(({ field, operator, relationshipValue }) => ({
          field,
          operator,
          relationshipValue: relationshipValue ?? null,
        })),
      ).toEqual([
        { field: 'parentPage', operator: 'isEmpty', relationshipValue: null },
        { field: 'topic', operator: 'isEmpty', relationshipValue: null },
        { field: 'tag', operator: 'isEmpty', relationshipValue: null },
        { field: 'eventCycle', operator: 'isEmpty', relationshipValue: null },
      ])

      const cases = [
        ['parentPage', fixture.page.id],
        ['topic', fixture.childPage.id],
        ['tag', fixture.childPage.id],
      ] as const
      for (const [field, matchingPageID] of cases) {
        const result = await findPublicContent({
          conditions: [{ field, operator: 'isEmpty' }],
          page: 1,
          pageSize: 12,
          pagination: false,
          sort: 'titleAscending',
          sources: ['pages'],
        })
        expect(result.items.map((item) => item.document.id)).toEqual([matchingPageID])
      }
    } finally {
      await fixture.payload.delete({
        collection: 'pages',
        id: containerPage.id,
        overrideAccess: true,
      })
    }
  })

  it('matches normalized titles with contains and exact operators', async () => {
    const containsResult = await findPublicContent({
      conditions: [{ field: 'title', operator: 'contains', textValue: '  TAXONOMY  ' }],
      page: 1,
      pageSize: 20,
      pagination: false,
      sort: 'titleAscending',
      sources: ['pages', 'posts'],
    })
    const exactResult = await findPublicContent({
      conditions: [
        {
          field: 'title',
          operator: 'equals',
          textValue: fixture.page.title.toLocaleUpperCase('pl-PL'),
        },
      ],
      page: 1,
      pageSize: 20,
      pagination: false,
      sort: 'titleAscending',
      sources: ['pages', 'posts'],
    })

    expect(containsResult.items.map((item) => item.document.id)).toEqual([
      fixture.page.id,
      fixture.post.id,
    ])
    expect(exactResult.items.map((item) => item.document.id)).toEqual([fixture.page.id])
  })

  it('sorts dated content by its significant date and undated content by title', async () => {
    const result = await findPublicContent({
      page: 1,
      pageSize: 12,
      pagination: false,
      sort: 'oldest',
      sources: ['pages', 'posts'],
    })

    expect(
      result.items.map((item) => [item.kind, getContentListingPresentation(item, 'cards').title]),
    ).toEqual([
      ['posts', fixture.post.title],
      ['pages', fixture.childPage.title],
      ['pages', fixture.page.title],
    ])
  })

  it('preserves manual mixed-content order before pagination', async () => {
    const result = await findPublicContent({
      manualItems: [
        { relationTo: 'posts', value: fixture.post.id },
        { relationTo: 'pages', value: fixture.page.id },
        { relationTo: 'pages', value: fixture.childPage.id },
      ],
      page: 2,
      pageSize: 2,
      pagination: true,
      selectionMode: 'manual',
      sort: 'titleAscending',
      sources: [],
    })

    expect(
      result.items.map((item) => [item.kind, getContentListingPresentation(item, 'cards').title]),
    ).toEqual([['pages', fixture.childPage.title]])
    expect(result.totalDocs).toBe(3)
    expect(result.totalPages).toBe(2)
  })

  it('preserves event roles and the contribution label for a contextual Partner listing', async () => {
    const partner = await fixture.payload.create({
      collection: 'partners',
      data: {
        _status: 'published',
        author: fixture.author.id,
        excerpt: 'Partner contextual listing excerpt.',
        layout: [
          {
            blockType: 'richText',
            content: createLexicalDocument('Partner contextual listing content.'),
          },
        ],
        name: 'Contextual listing partner',
        slug: 'integration-contextual-listing-partner',
      },
      draft: false,
      overrideAccess: true,
    })

    try {
      const result = await findPublicContent({
        manualItems: [
          {
            contextLabel: 'Partner strategiczny',
            partnerRoles: ['sponsor', 'support'],
            relationTo: 'partners',
            value: partner.id,
          },
        ],
        page: 1,
        pageSize: 12,
        pagination: false,
        selectionMode: 'manual',
        sort: 'titleAscending',
        sources: [],
      })

      expect(result.items).toHaveLength(1)
      expect(result.items[0]).toMatchObject({
        contextLabel: 'Partner strategiczny',
        kind: 'partners',
        partnerRoles: ['sponsor', 'support'],
      })
      expect(getContentListingPresentation(result.items[0]!, 'cards')).toMatchObject({
        contextLabel: 'Partner strategiczny',
        kindLabel: 'Partner',
        title: partner.name,
      })
    } finally {
      await fixture.payload.delete({ collection: 'partners', id: partner.id, overrideAccess: true })
    }
  })

  it('filters dated content by age while passing through sources without that field', async () => {
    const recentPost = await fixture.payload.create({
      collection: 'posts',
      data: {
        _status: 'published',
        author: fixture.author.id,
        excerpt: 'Recent post excerpt',
        layout: [{ blockType: 'richText', content: createLexicalDocument('Recent content') }],
        publishedAt: new Date(Date.now() - 86_400_000).toISOString(),
        slug: 'integration-listing-recent-post',
        title: 'Integration recent post',
      },
      overrideAccess: true,
    })

    try {
      const result = await findPublicContent({
        conditions: [{ field: 'significantDate', numberValue: 30, operator: 'notOlderThan' }],
        page: 1,
        pageSize: 20,
        pagination: false,
        sort: 'newest',
        sources: ['pages', 'posts'],
      })
      const references = result.items.map(({ document, kind }) => `${kind}:${document.id}`)

      expect(references).toContain(`posts:${recentPost.id}`)
      expect(references).toContain(`pages:${fixture.page.id}`)
      expect(references).toContain(`pages:${fixture.childPage.id}`)
      expect(references).not.toContain(`posts:${fixture.post.id}`)
    } finally {
      await fixture.payload.delete({
        collection: 'posts',
        id: recentPost.id,
        overrideAccess: true,
      })
    }
  })

  it('applies before, after, and inclusive-between boundaries and rejects an empty supported date', async () => {
    const slugs = {
      after: 'integration-listing-date-after',
      before: 'integration-listing-date-before',
      empty: 'integration-listing-date-empty',
    }
    await fixture.payload.delete({
      collection: 'posts',
      overrideAccess: true,
      where: { slug: { in: Object.values(slugs) } },
    })

    const createPost = (slug: string, title: string, publishedAt: string) =>
      fixture.payload.create({
        collection: 'posts',
        data: {
          _status: 'published',
          author: fixture.author.id,
          excerpt: `${title} excerpt`,
          layout: [{ blockType: 'richText', content: createLexicalDocument(title) }],
          publishedAt,
          slug,
          title,
        },
        overrideAccess: true,
      })
    const beforePost = await createPost(
      slugs.before,
      'Integration date before',
      '2026-08-12T12:00:00Z',
    )
    const afterPost = await createPost(
      slugs.after,
      'Integration date after',
      '2026-08-14T12:00:00Z',
    )
    const emptyDatePost = await createPost(
      slugs.empty,
      'Integration date empty',
      '2026-08-13T12:00:00Z',
    )
    await fixture.payload.db.drizzle.execute(sql`
      UPDATE "content_listing_items" SET "significant_date" = NULL
      WHERE "source" = 'posts' AND "source_document_id" = ${emptyDatePost.id}
    `)

    const findWithDateCondition = (operator: 'after' | 'before' | 'between') =>
      findPublicContent({
        conditions: [
          {
            dateValue: '2026-08-13',
            ...(operator === 'between' ? { endDateValue: '2026-08-13' } : {}),
            field: 'significantDate',
            operator,
          },
        ],
        page: 1,
        pageSize: 20,
        pagination: false,
        sort: 'titleAscending',
        sources: ['posts'],
      })

    try {
      const beforeResult = await findWithDateCondition('before')
      const afterResult = await findWithDateCondition('after')
      const betweenResult = await findWithDateCondition('between')

      expect(beforeResult.items.map((item) => item.document.id)).toContain(beforePost.id)
      expect(beforeResult.items.map((item) => item.document.id)).not.toContain(emptyDatePost.id)
      expect(afterResult.items.map((item) => item.document.id)).toContain(afterPost.id)
      expect(afterResult.items.map((item) => item.document.id)).not.toContain(emptyDatePost.id)
      expect(betweenResult.items.map((item) => item.document.id)).toContain(fixture.post.id)
      expect(betweenResult.items.map((item) => item.document.id)).not.toContain(beforePost.id)
      expect(betweenResult.items.map((item) => item.document.id)).not.toContain(afterPost.id)
      expect(betweenResult.items.map((item) => item.document.id)).not.toContain(emptyDatePost.id)
    } finally {
      for (const post of [beforePost, afterPost, emptyDatePost]) {
        await fixture.payload.delete({ collection: 'posts', id: post.id, overrideAccess: true })
      }
    }
  })

  it('stores a limited manual Listing carousel with pagination disabled', async () => {
    const containerPage = await fixture.payload.create({
      collection: 'pages',
      data: {
        _status: 'published',
        author: fixture.author.id,
        layout: [
          {
            blockType: 'listing',
            items: [
              { item: { relationTo: 'posts', value: fixture.post.id } },
              { item: { relationTo: 'pages', value: fixture.page.id } },
            ],
            pageSize: 1,
            pagination: true,
            selectionMode: 'manual',
            view: 'carousel',
          },
        ],
        slug: `${fixture.slugs.lifecyclePage}-carousel`,
        title: 'Integration manual carousel container',
      },
      overrideAccess: true,
    })

    try {
      const storedPage = await fixture.payload.findByID({
        collection: 'pages',
        depth: 0,
        id: containerPage.id,
        overrideAccess: true,
      })
      const carousel = storedPage.layout?.find(
        (block): block is ListingBlock =>
          block.blockType === 'listing' && block.view === 'carousel',
      )
      const result = await findPublicContent({
        manualItems: carousel?.items?.map(({ contextLabel, item }) => ({ contextLabel, ...item })),
        page: 1,
        pageSize: carousel?.pageSize ?? 5,
        pagination: false,
        selectionMode: carousel?.selectionMode,
        sort: carousel?.sort ?? 'newest',
        sources: [],
      })

      expect(carousel?.items?.map(({ item }) => [item.relationTo, item.value])).toEqual([
        ['posts', fixture.post.id],
        ['pages', fixture.page.id],
      ])
      expect(carousel?.pagination).toBe(false)
      expect(carousel?.pageSize).toBe(1)
      expect(
        result.items.map((item) => [item.kind, getContentListingPresentation(item, 'cards').title]),
      ).toEqual([['posts', fixture.post.title]])
      expect(result.totalDocs).toBe(2)
    } finally {
      await fixture.payload.delete({
        collection: 'pages',
        id: containerPage.id,
        overrideAccess: true,
      })
    }
  })

  it('exposes both collection relations through reverse Join fields', async () => {
    const populatedTopic = await fixture.payload.findByID({
      collection: 'topics',
      depth: 0,
      id: fixture.topic.id,
      joins: { relatedPages: { limit: 10 }, relatedPosts: { limit: 10 } },
      overrideAccess: true,
    })

    expect(populatedTopic.relatedPages?.docs).toHaveLength(1)
    expect(populatedTopic.relatedPosts?.docs).toHaveLength(2)
  })

  it('uses database pagination for a deep mixed listing page', async () => {
    const createdPosts: Post[] = []
    try {
      for (let i = 0; i < 7; i += 1) {
        createdPosts.push(
          await fixture.payload.create({
            collection: 'posts',
            data: {
              _status: 'published',
              author: fixture.author.id,
              topics: [fixture.topic.id],
              excerpt: `Pagination excerpt ${i}`,
              layout: [{ blockType: 'richText', content: createLexicalDocument(`Content ${i}`) }],
              publishedAt: new Date(Date.UTC(2026, 7, 15 + Math.min(i, 5))).toISOString(),
              slug: `integration-listing-pagination-${i}`,
              tags: [fixture.tag.id],
              title: `Integration pagination ${Math.min(i, 5)}`,
            },
            overrideAccess: true,
          }),
        )
      }

      const options = {
        conditions: [
          {
            field: 'topic',
            operator: 'inSubtree',
            relationshipValue: { relationTo: 'topics', value: fixture.topic.id },
          },
          {
            field: 'tag',
            operator: 'contains',
            relationshipValue: { relationTo: 'tags', value: fixture.tag.id },
          },
        ],
        page: 4,
        pageSize: 2,
        pagination: true,
        sort: 'newest',
        sources: ['posts', 'pages', 'posts'],
      } satisfies Parameters<typeof findPublicContent>[0]
      const result = await findPublicContent(options)
      const firstPage = await findPublicContent({ ...options, page: 1 })
      const unpaginated = await findPublicContent({ ...options, pagination: false })

      expect(result.items).toHaveLength(2)
      expect(result.page).toBe(4)
      expect(result.pageSize).toBe(2)
      expect(result.totalDocs).toBe(9)
      expect(unpaginated).toMatchObject({ page: 1, pageSize: 2, totalDocs: null, totalPages: 1 })
      expect(unpaginated.items).toEqual(firstPage.items)
      expect(unpaginated.items.map(({ document }) => document.id)).toEqual(
        createdPosts.slice(-2).map(({ id }) => id),
      )
    } finally {
      for (const createdPost of createdPosts) {
        await fixture.payload.delete({
          collection: 'posts',
          id: createdPost.id,
          overrideAccess: true,
        })
      }
    }
  })
})
