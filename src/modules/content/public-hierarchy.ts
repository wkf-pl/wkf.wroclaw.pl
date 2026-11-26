import { getPayload } from 'payload'

import config from '@payload-config'

import { cachePublicData, publicCacheTags } from '@/modules/cache/public-data-cache'
import { publicRequestContext } from './public-access'

type StoredBreadcrumb = {
  doc?: unknown
  label?: null | string
  url?: null | string
}

export type HierarchyDocumentWithBreadcrumbs = {
  breadcrumbs?: null | StoredBreadcrumb[]
  id: number
}

export type PublicBreadcrumb = {
  label: string
  url: null | string
}

export function createTopicBreadcrumbs(
  topic: HierarchyDocumentWithBreadcrumbs,
): PublicBreadcrumb[] {
  return (topic.breadcrumbs ?? []).flatMap((breadcrumb, index, breadcrumbs) => {
    if (!breadcrumb.label) return []
    return [
      {
        label: breadcrumb.label,
        url: index === breadcrumbs.length - 1 ? null : (breadcrumb.url ?? null),
      },
    ]
  })
}

const findPublishedAncestorSlugs = cachePublicData(
  'public-page-ancestor-slugs',
  async (slugs: string[]): Promise<string[]> => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'pages',
      context: publicRequestContext,
      depth: 0,
      draft: false,
      limit: slugs.length,
      overrideAccess: false,
      pagination: false,
      select: { slug: true },
      user: null,
      where: {
        and: [{ slug: { in: slugs } }, { _status: { equals: 'published' } }],
      },
    })

    return result.docs.map(({ slug }) => slug)
  },
  { revalidate: 300, tags: [publicCacheTags.pages] },
)

export async function createPageBreadcrumbs(
  page: HierarchyDocumentWithBreadcrumbs,
): Promise<PublicBreadcrumb[]> {
  const storedBreadcrumbs = page.breadcrumbs ?? []
  const ancestorSlugs = storedBreadcrumbs.flatMap((breadcrumb, index) => {
    if (index === storedBreadcrumbs.length - 1) return []
    const slug = breadcrumb.url?.match(/^\/([^/]+)$/)?.[1]
    return slug ? [slug] : []
  })
  const publishedSlugs = ancestorSlugs.length
    ? await findPublishedAncestorSlugs([...new Set(ancestorSlugs)].sort())
    : []
  const publishedAncestorURLs = new Set(publishedSlugs.map((slug) => `/${slug}`))

  const breadcrumbs: PublicBreadcrumb[] = [{ label: 'Strona główna', url: '/' }]
  for (const [index, breadcrumb] of storedBreadcrumbs.entries()) {
    if (!breadcrumb.label) continue
    const isCurrentPage = index === storedBreadcrumbs.length - 1
    const isPublishedAncestor =
      breadcrumb.url !== null &&
      breadcrumb.url !== undefined &&
      publishedAncestorURLs.has(breadcrumb.url)
    breadcrumbs.push({
      label: breadcrumb.label,
      url: !isCurrentPage && isPublishedAncestor ? (breadcrumb.url ?? null) : null,
    })
  }

  return breadcrumbs
}
