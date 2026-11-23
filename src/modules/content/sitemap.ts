import type { MetadataRoute } from 'next'

const websiteURL = 'https://wkf.wroclaw.pl'

type SitemapDocument = {
  slug: string
  updatedAt: string
}

export type PublicSitemapContent = {
  blogTemplateUpdatedAt?: string
  topics: SitemapDocument[]
  cycles: SitemapDocument[]
  events: SitemapDocument[]
  memberProfiles: SitemapDocument[]
  pages: SitemapDocument[]
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
  return [
    createSitemapEntry('/'),
    ...(content.blogTemplateUpdatedAt
      ? [createSitemapEntry('/blog', content.blogTemplateUpdatedAt)]
      : []),
    createSitemapEntry('/events'),
    createSitemapEntry('/members'),
    ...content.pages.map((page) => createSitemapEntry(`/${page.slug}`, page.updatedAt)),
    ...content.posts.map((post) => createSitemapEntry(`/blog/${post.slug}`, post.updatedAt)),
    ...content.topics.map((topic) => createSitemapEntry(`/topic/${topic.slug}`, topic.updatedAt)),
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
