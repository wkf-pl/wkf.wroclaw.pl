import Link from 'next/link'
import { redirect } from 'next/navigation'

import type { Category, Tag } from '@/payload-types'
import { findChildCategories } from '@/modules/content/category-hierarchy'
import { findPublicContent } from '@/modules/content/content-listing'
import {
  createCategoryBreadcrumbs,
  type PublicBreadcrumb,
} from '@/modules/content/public-hierarchy'

import { ContentHero } from './ContentHero'
import { ContentList } from './ContentList'
import { ContentPagination, createPaginatedURL, getRequestedPage } from './ContentPagination'

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
  const categoryBreadcrumbs = kind === 'category' ? createCategoryBreadcrumbs(taxonomy) : []
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

  const title = `${kind === 'tag' ? '#' : ''}${taxonomy.name}`
  const taxonomyBreadcrumbs =
    categoryBreadcrumbs.at(-1)?.label === taxonomy.name
      ? categoryBreadcrumbs
      : [...categoryBreadcrumbs, { label: taxonomy.name, url: null }]
  const heroBreadcrumbs: PublicBreadcrumb[] = [
    { label: 'Strona główna', url: '/' },
    ...(kind === 'category' ? taxonomyBreadcrumbs : [{ label: title, url: null }]),
  ]

  return (
    <main className="contentHeroPage">
      <ContentHero
        breadcrumbs={heroBreadcrumbs}
        description={taxonomy.description}
        eyebrow={kind === 'category' ? 'Kategoria' : 'Tag'}
        title={title}
      >
        {childCategories.length ? (
          <nav aria-label="Podkategorie" className="childCategories">
            {childCategories.map((category) => (
              <Link href={`/category/${category.slug}`} key={category.id}>
                {category.name}
              </Link>
            ))}
          </nav>
        ) : null}
      </ContentHero>

      <div className="contentShell contentPageBody taxonomyPageBody">
        <ContentList items={result.items} view="cards" />
        <ContentPagination
          currentPage={result.page}
          parameterName="page"
          pathname={pathname}
          searchParams={searchParams}
          totalPages={result.totalPages}
        />
      </div>
    </main>
  )
}
