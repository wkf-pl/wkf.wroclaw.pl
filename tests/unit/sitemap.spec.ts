import { describe, expect, it } from 'vitest'

import { createPublicSitemap } from '@/modules/content/sitemap'

const updatedAt = '2026-08-21T10:00:00.000Z'

describe('public sitemap', () => {
  it('includes every public CMS route and excludes system page duplicates', () => {
    const sitemap = createPublicSitemap({
      categories: [{ slug: 'fantastyka', updatedAt }],
      cycles: [{ slug: 'erpegowe-wtorki', updatedAt }],
      events: [{ slug: 'sesja', updatedAt }],
      memberProfiles: [{ slug: 'anna', updatedAt }],
      pages: [
        { slug: 'blog', systemKey: 'blog', updatedAt },
        { slug: 'events', systemKey: 'events', updatedAt },
        { slug: 'o-nas', updatedAt },
      ],
      partners: [{ slug: 'biblioteka', updatedAt }],
      posts: [{ slug: 'nowosci', updatedAt }],
      tags: [{ slug: 'rpg', updatedAt }],
    })

    expect(sitemap).toEqual([
      { url: 'https://wkf.wroclaw.pl/' },
      { lastModified: updatedAt, url: 'https://wkf.wroclaw.pl/blog' },
      { url: 'https://wkf.wroclaw.pl/events' },
      { url: 'https://wkf.wroclaw.pl/members' },
      { lastModified: updatedAt, url: 'https://wkf.wroclaw.pl/o-nas' },
      { lastModified: updatedAt, url: 'https://wkf.wroclaw.pl/blog/nowosci' },
      { lastModified: updatedAt, url: 'https://wkf.wroclaw.pl/category/fantastyka' },
      { lastModified: updatedAt, url: 'https://wkf.wroclaw.pl/tag/rpg' },
      { lastModified: updatedAt, url: 'https://wkf.wroclaw.pl/events/sesja' },
      { lastModified: updatedAt, url: 'https://wkf.wroclaw.pl/events/series/erpegowe-wtorki' },
      { lastModified: updatedAt, url: 'https://wkf.wroclaw.pl/partners/biblioteka' },
      { lastModified: updatedAt, url: 'https://wkf.wroclaw.pl/members/anna' },
    ])
  })

  it('does not advertise the blog route before its system page is published', () => {
    const sitemap = createPublicSitemap({
      categories: [],
      cycles: [],
      events: [],
      memberProfiles: [],
      pages: [],
      partners: [],
      posts: [],
      tags: [],
    })

    expect(sitemap.map((entry) => entry.url)).not.toContain('https://wkf.wroclaw.pl/blog')
  })
})
