import { redirect } from 'next/navigation'

import type { Category, Tag } from '@/payload-types'
import { getCurrentUser } from '@/modules/auth/current-user'
import { findPublicContent } from '@/modules/content/content-listing'

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
  const result = await findPublicContent(
    {
      categoryId: kind === 'category' ? taxonomy.id : undefined,
      page: requestedPage,
      pageSize: 12,
      pagination: true,
      sort: 'newest',
      sources: ['pages', 'posts'],
      tagId: kind === 'tag' ? taxonomy.id : undefined,
    },
    await getCurrentUser(),
  )

  if (requestedPage > result.totalPages) {
    redirect(createPaginatedURL(pathname, searchParams, 'page', result.totalPages))
  }

  return (
    <main className="contentShell">
      <header className="listingHeader">
        <p className="eyebrow">{kind === 'category' ? 'Kategoria' : 'Tag'}</p>
        <h1>
          {kind === 'tag' ? '#' : ''}
          {taxonomy.name}
        </h1>
        {taxonomy.description ? <p>{taxonomy.description}</p> : null}
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
