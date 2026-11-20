import { describe, expect, it } from 'vitest'

import type { Document, Event, Post } from '@/payload-types'
import { presentListingItem } from '@/modules/content/content-listing-presentation'
import { resolveListingView } from '@/modules/content/listing-view'
import type { PublicContentListItem } from '@/modules/content/content-listing-sources'

const date = '2026-11-19T17:30:00.000Z'
const post = {
  kind: 'posts',
  url: '/blog/test',
  document: { title: 'Post', publishedAt: date } as Post,
} satisfies PublicContentListItem
const document = {
  kind: 'documents',
  url: '/dokumenty/test',
  document: { title: 'Document', documentType: 'other', documentDate: date } as Document,
} satisfies PublicContentListItem
const event = {
  kind: 'events',
  url: '/events/test',
  document: { title: 'Event', slug: 'test', startAt: date, timeMode: 'timed' } as Event,
} satisfies PublicContentListItem

describe('Listing date format', () => {
  it.each([post, document, event])('applies the short date format to $kind', (item) => {
    const { view } = resolveListingView({
      preset: 'upcoming',
      overrides: { dateFormat: 'short', information: { date: true } },
    })
    expect(presentListingItem(item, view).metadataDate?.label).toBe('19.11.2026')
  })

  it.each([post, document])('applies the long date format to $kind', (item) => {
    const { view } = resolveListingView({
      preset: 'upcoming',
      overrides: { dateFormat: 'full', information: { date: true } },
    })
    expect(presentListingItem(item, view).metadataDate?.label).toBe('19 listopada 2026')
  })

  it('preserves event times in the full format', () => {
    const { view } = resolveListingView({ preset: 'upcoming' })
    expect(presentListingItem(event, view).facts[0]?.value).toBe('19 listopada 2026, od 18:30')
  })
})
