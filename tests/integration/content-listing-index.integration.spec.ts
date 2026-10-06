import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createLocalReq } from 'payload'
import sharp from 'sharp'

import { syncContentListingItem } from '@/modules/content/content-listing-index'
import type { ContentListingItem } from '@/payload-types'

import {
  createContentTaxonomyFixture,
  type ContentTaxonomyFixture,
} from '../helpers/content-taxonomy-fixture'
import { createLexicalDocument } from '../helpers/lexical-document'

let fixture: ContentTaxonomyFixture

const listingImageFilename = 'integration-listing-index-image.png'
const listingEventCycleSlug = 'integration-listing-index-event-cycle'
const listingEventSlug = 'integration-listing-index-event'

beforeAll(async () => {
  fixture = await createContentTaxonomyFixture('listing-index')
  await cleanupRelationshipFixtures()
}, 20_000)

afterAll(async () => {
  await cleanupRelationshipFixtures()
  await fixture?.cleanup()
})

describe('content listing index synchronization', () => {
  it('persists a generated page excerpt and projects only listing fields into the index', async () => {
    const storedPage = await fixture.payload.findByID({
      collection: 'pages',
      depth: 0,
      id: fixture.page.id,
      overrideAccess: true,
    })
    const index = await findListingIndex('pages', fixture.page.id)

    expect(storedPage.listingExcerpt).toBe('Page excerpt')
    expect(index).toMatchObject({
      excerpt: 'Page excerpt',
      source: 'pages',
      sourceDocumentId: fixture.page.id,
      title: fixture.page.title,
      url: `/${fixture.slugs.page}`,
    })
    expect(index).not.toHaveProperty('layout')
  })

  it('rebuilds a missing index entry with the migration backfill primitive', async () => {
    const index = await findListingIndex('pages', fixture.page.id)
    if (!index) throw new Error('Expected the published page to have an index entry.')
    await fixture.payload.delete({
      collection: 'content-listing-items',
      id: index.id,
      overrideAccess: true,
    })

    const req = await createLocalReq(
      { context: { skipContentListingSync: true, skipPublicCacheInvalidation: true } },
      fixture.payload,
    )
    await syncContentListingItem(req, 'pages', fixture.page.id)

    expect(await findListingIndex('pages', fixture.page.id)).toMatchObject({
      sourceDocumentId: fixture.page.id,
      title: fixture.page.title,
    })
  })

  it('keeps the published projection during autosave, then handles republish, unpublish and delete', async () => {
    const lifecyclePage = await fixture.payload.create({
      collection: 'pages',
      data: {
        _status: 'published',
        author: fixture.author.id,
        layout: [{ blockType: 'richText', content: createLexicalDocument('Lifecycle excerpt') }],
        slug: fixture.slugs.lifecyclePage,
        title: 'Published lifecycle page',
      },
      overrideAccess: true,
    })

    await fixture.payload.update({
      collection: 'pages',
      data: { title: 'Draft lifecycle page' },
      draft: true,
      id: lifecyclePage.id,
      overrideAccess: true,
    })
    expect(await findListingIndex('pages', lifecyclePage.id)).toMatchObject({
      title: 'Published lifecycle page',
    })

    await fixture.payload.update({
      collection: 'pages',
      data: { _status: 'published', title: 'Republished lifecycle page' },
      draft: false,
      id: lifecyclePage.id,
      overrideAccess: true,
    })
    expect(await findListingIndex('pages', lifecyclePage.id)).toMatchObject({
      title: 'Republished lifecycle page',
    })

    await fixture.payload.update({
      collection: 'pages',
      data: { _status: 'draft' },
      id: lifecyclePage.id,
      overrideAccess: true,
      unpublishAllLocales: true,
    })
    expect(await findListingIndex('pages', lifecyclePage.id)).toBeNull()

    await fixture.payload.update({
      collection: 'pages',
      data: { _status: 'published' },
      draft: false,
      id: lifecyclePage.id,
      overrideAccess: true,
    })
    expect(await findListingIndex('pages', lifecyclePage.id)).not.toBeNull()

    await fixture.payload.delete({
      collection: 'pages',
      id: lifecyclePage.id,
      overrideAccess: true,
    })
    expect(await findListingIndex('pages', lifecyclePage.id)).toBeNull()
  })

  it('clears optional image, category and parent relationships from the index', async () => {
    const imageData = await sharp({
      create: { background: '#d69524', channels: 4, height: 24, width: 32 },
    })
      .png()
      .toBuffer()
    const image = await fixture.payload.create({
      collection: 'media',
      data: { alt: 'Integration listing image' },
      file: {
        data: imageData,
        mimetype: 'image/png',
        name: listingImageFilename,
        size: imageData.length,
      },
      overrideAccess: true,
    })

    try {
      await fixture.payload.update({
        collection: 'pages',
        data: {
          _status: 'published',
          category: fixture.category.id,
          heroImage: image.id,
          parent: fixture.page.id,
        },
        draft: false,
        id: fixture.childPage.id,
        overrideAccess: true,
      })
      expect(await findListingIndex('pages', fixture.childPage.id)).toMatchObject({
        category: fixture.category.id,
        heroImage: image.id,
        parentPage: fixture.page.id,
      })

      await fixture.payload.update({
        collection: 'pages',
        data: {
          _status: 'published',
          category: null,
          heroImage: null,
          parent: null,
        },
        draft: false,
        id: fixture.childPage.id,
        overrideAccess: true,
      })
      expect(await findListingIndex('pages', fixture.childPage.id)).toMatchObject({
        category: null,
        heroImage: null,
        parentPage: null,
      })
    } finally {
      await fixture.payload.delete({
        collection: 'media',
        id: image.id,
        overrideAccess: true,
      })
    }
  })

  it('clears an optional Event cycle relationship from the index', async () => {
    const cycle = await fixture.payload.create({
      collection: 'event-cycles',
      data: {
        _status: 'published',
        author: fixture.author.id,
        eventDefaults: {
          capacityMode: 'unlimited',
          eventType: 1,
          excerpt: createLexicalDocument('Integration listing cycle defaults'),
          layout: [
            {
              blockType: 'richText',
              content: createLexicalDocument('Integration listing cycle default content'),
            },
          ],
          location: { city: 'Wrocław', country: 'Polska' },
          participation: 'public',
        },
        excerpt: createLexicalDocument('Integration listing cycle'),
        layout: [
          {
            blockType: 'richText',
            content: createLexicalDocument('Integration listing cycle content'),
          },
        ],
        slug: listingEventCycleSlug,
        title: 'Integration listing cycle',
      },
      draft: false,
      overrideAccess: true,
    })

    try {
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
          excerpt: createLexicalDocument('Integration listing event'),
          layout: [
            {
              blockType: 'richText',
              content: createLexicalDocument('Integration listing event content'),
            },
          ],
          location: { city: 'Wrocław', country: 'Polska' },
          participation: 'public',
          slug: listingEventSlug,
          startAt: '2030-09-10T16:00:00.000Z',
          timeMode: 'timed',
          title: 'Integration listing event',
        },
        draft: false,
        overrideAccess: true,
      })
      expect(await findListingIndex('events', event.id)).toMatchObject({ eventCycle: cycle.id })

      await fixture.payload.update({
        collection: 'events',
        data: { _status: 'published', cycle: null },
        draft: false,
        id: event.id,
        overrideAccess: true,
      })
      expect(await findListingIndex('events', event.id)).toMatchObject({ eventCycle: null })
    } finally {
      await cleanupRelationshipFixtures()
    }
  })
})

async function cleanupRelationshipFixtures(): Promise<void> {
  if (!fixture?.payload) return

  await fixture.payload.delete({
    collection: 'events',
    overrideAccess: true,
    where: { slug: { equals: listingEventSlug } },
  })
  await fixture.payload.delete({
    collection: 'event-cycles',
    overrideAccess: true,
    where: { slug: { equals: listingEventCycleSlug } },
  })
  await fixture.payload.delete({
    collection: 'media',
    overrideAccess: true,
    where: { filename: { equals: listingImageFilename } },
  })
}

async function findListingIndex(
  source: ContentListingItem['source'],
  sourceDocumentID: number,
): Promise<ContentListingItem | null> {
  const result = await fixture.payload.find({
    collection: 'content-listing-items',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [{ source: { equals: source } }, { sourceDocumentId: { equals: sourceDocumentID } }],
    },
  })
  return result.docs[0] ?? null
}
