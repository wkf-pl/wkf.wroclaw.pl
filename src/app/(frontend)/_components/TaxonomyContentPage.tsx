import Link from 'next/link'
import { redirect } from 'next/navigation'

import type { Category, Tag } from '@/payload-types'
import { findChildCategories } from '@/modules/content/category-hierarchy'
import { findPublicContent } from '@/modules/content/content-listing'
import { createCategoryBreadcrumbs } from '@/modules/content/public-hierarchy'

import { ContentList } from './ContentList'
import { ContentPagination, createPaginatedURL, getRequestedPage } from './ContentPagination'
import { HierarchyBreadcrumbs } from './HierarchyBreadcrumbs'

type TaxonomyContentPageProperties = {
  kind: 'category' | 'tag'
  searchParams: Record<string, string | string[] | undefined>
  taxonomy: Category | Tag
}

export async function TaxonomyContentPage({
  kind,
  searchParams,
  taxonomy,
}: TaxonomyContentPageProperties) {
  const requestedPage = getRequestedPage(searchParams.page)
  const pathname = `/${kind}/${taxonomy.slug}`
  const childCategories = kind === 'category' ? await findChildCategories(taxonomy.id) : []
  const breadcrumbs = kind === 'category' ? createCategoryBreadcrumbs(taxonomy) : []
  const result = await findPublicContent({
    categoryId: kind === 'category' ? taxonomy.id : undefined,
    page: requestedPage,
    pageSize: 12,
    pagination: true,
    sort: 'newest',
    sources: ['pages', 'posts', 'events', 'event-cycles'],
    tagId: kind === 'tag' ? taxonomy.id : undefined,
  })

  if (requestedPage > result.totalPages) {
    redirect(createPaginatedURL(pathname, searchParams, 'page', result.totalPages))
  }

  return (
    <main className="contentShell">
      <header className="listingHeader">
        <HierarchyBreadcrumbs breadcrumbs={breadcrumbs} />
        <p className="eyebrow">{kind === 'category' ? 'Kategoria' : 'Tag'}</p>
        <h1>
          {kind === 'tag' ? '#' : ''}
          {taxonomy.name}
        </h1>
        {taxonomy.description ? <p>{taxonomy.description}</p> : null}
        {childCategories.length ? (
          <nav aria-label="Podkategorie" className="childCategories">
            {childCategories.map((category) => (
              <Link href={`/category/${category.slug}`} key={category.id}>
                {category.name}
              </Link>
            ))}
          </nav>
        ) : null}
      </header>
      <ContentList items={result.items} view="cards" />
      <ContentPagination
        currentPage={result.page}
        parameterName="page"
        pathname={pathname}
        searchParams={searchParams}
        totalPages={result.totalPages}
      />
    </main>
  )
}
