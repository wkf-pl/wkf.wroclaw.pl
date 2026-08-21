import type { MetadataRoute } from 'next'

const websiteURL = 'https://wkf.wroclaw.pl'

type SitemapDocument = {
  slug: string
  updatedAt: string
}

type SitemapPage = SitemapDocument & {
  systemKey?: null | string
}

export type PublicSitemapContent = {
  categories: SitemapDocument[]
  cycles: SitemapDocument[]
  events: SitemapDocument[]
  memberProfiles: SitemapDocument[]
  pages: SitemapPage[]
  partners: SitemapDocument[]
  posts: SitemapDocument[]
  tags: SitemapDocument[]
}

function createSitemapEntry(
  pathname: string,
  lastModified?: string,
): MetadataRoute.Sitemap[number] {
  return {
    ...(lastModified ? { lastModified } : {}),
    url: `${websiteURL}${pathname}`,
  }
}

export function createPublicSitemap(content: PublicSitemapContent): MetadataRoute.Sitemap {
  const blogPage = content.pages.find((page) => page.systemKey === 'blog')

  return [
    createSitemapEntry('/'),
    ...(blogPage ? [createSitemapEntry('/blog', blogPage.updatedAt)] : []),
    createSitemapEntry('/events'),
    createSitemapEntry('/members'),
    ...content.pages
      .filter((page) => page.systemKey !== 'blog' && page.systemKey !== 'events')
      .map((page) => createSitemapEntry(`/${page.slug}`, page.updatedAt)),
    ...content.posts.map((post) => createSitemapEntry(`/blog/${post.slug}`, post.updatedAt)),
    ...content.categories.map((category) =>
      createSitemapEntry(`/category/${category.slug}`, category.updatedAt),
    ),
    ...content.tags.map((tag) => createSitemapEntry(`/tag/${tag.slug}`, tag.updatedAt)),
    ...content.events.map((event) => createSitemapEntry(`/events/${event.slug}`, event.updatedAt)),
    ...content.cycles.map((cycle) =>
      createSitemapEntry(`/events/series/${cycle.slug}`, cycle.updatedAt),
    ),
    ...content.partners.map((partner) =>
      createSitemapEntry(`/partners/${partner.slug}`, partner.updatedAt),
    ),
    ...content.memberProfiles.map((profile) =>
      createSitemapEntry(`/members/${profile.slug}`, profile.updatedAt),
    ),
  ]
}
