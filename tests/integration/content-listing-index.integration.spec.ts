import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createLocalReq } from 'payload'

import { syncContentListingItem } from '@/modules/content/content-listing-index'
import type { ContentListingItem } from '@/payload-types'

import {
  createContentTaxonomyFixture,
  type ContentTaxonomyFixture,
} from '../helpers/content-taxonomy-fixture'
import { createLexicalDocument } from '../helpers/lexical-document'

let fixture: ContentTaxonomyFixture

beforeAll(async () => {
  fixture = await createContentTaxonomyFixture('listing-index')
}, 20_000)

afterAll(async () => {
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
})

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
