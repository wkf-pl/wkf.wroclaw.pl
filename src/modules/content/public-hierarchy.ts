import { getPayload } from 'payload'

import config from '@payload-config'

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

export function createCategoryBreadcrumbs(
  category: HierarchyDocumentWithBreadcrumbs,
): PublicBreadcrumb[] {
  return (category.breadcrumbs ?? []).flatMap((breadcrumb, index, breadcrumbs) => {
    if (!breadcrumb.label) return []
    return [
      {
        label: breadcrumb.label,
        url: index === breadcrumbs.length - 1 ? null : (breadcrumb.url ?? null),
      },
    ]
  })
}

export async function createPageBreadcrumbs(
  page: HierarchyDocumentWithBreadcrumbs,
): Promise<PublicBreadcrumb[]> {
  const storedBreadcrumbs = page.breadcrumbs ?? []
  const ancestorSlugs = storedBreadcrumbs.flatMap((breadcrumb, index) => {
    if (index === storedBreadcrumbs.length - 1) return []
    const slug = breadcrumb.url?.match(/^\/([^/]+)$/)?.[1]
    return slug ? [slug] : []
  })
  const publishedAncestorURLs = new Set<string>()

  if (ancestorSlugs.length) {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'pages',
      depth: 0,
      draft: false,
      limit: ancestorSlugs.length,
      overrideAccess: true,
      pagination: false,
      where: {
        and: [{ slug: { in: ancestorSlugs } }, { _status: { equals: 'published' } }],
      },
    })
    for (const ancestor of result.docs) publishedAncestorURLs.add(`/${ancestor.slug}`)
  }

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
