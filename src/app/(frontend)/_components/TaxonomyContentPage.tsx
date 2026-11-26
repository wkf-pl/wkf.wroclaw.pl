import Link from 'next/link'
import { redirect } from 'next/navigation'

import type { Topic, Tag } from '@/payload-types'
import { findChildTopics } from '@/modules/content/topic-hierarchy'
import { findPublicContent } from '@/modules/content/content-listing'
import { findRenderablePageTemplateForRequest } from '@/modules/content/preview-content'
import { createTopicBreadcrumbs, type PublicBreadcrumb } from '@/modules/content/public-hierarchy'

import { ContentHero } from './ContentHero'
import { ContentList } from './ContentList'
import { createPaginatedURL, getRequestedPage } from '@/modules/content/pagination'

import { ContentPagination } from './ContentPagination'
import { TaxonomyTemplateDocument } from './TaxonomyTemplateDocument'

type TaxonomyContentPageProperties = {
  kind: 'topic' | 'tag'
  searchParams: Record<string, string | string[] | undefined>
  taxonomy: Topic | Tag
}

export async function TaxonomyContentPage({
  kind,
  searchParams,
  taxonomy,
}: TaxonomyContentPageProperties) {
  const requestedPage = getRequestedPage(searchParams.page)
  const pathname = `/${kind}/${taxonomy.slug}`
  const topicBreadcrumbs = kind === 'topic' ? createTopicBreadcrumbs(taxonomy) : []
  const title = `${kind === 'tag' ? '#' : ''}${taxonomy.name}`
  const taxonomyBreadcrumbs =
    topicBreadcrumbs.at(-1)?.label === taxonomy.name
      ? topicBreadcrumbs
      : [...topicBreadcrumbs, { label: taxonomy.name, url: null }]
  const heroBreadcrumbs: PublicBreadcrumb[] = [
    { label: 'Strona główna', url: '/' },
    ...(kind === 'topic' ? taxonomyBreadcrumbs : [{ label: title, url: null }]),
  ]

  const { document: template, isDraftPreview } = await findRenderablePageTemplateForRequest(
    kind === 'topic' ? 'topic-detail' : 'tag-detail',
    searchParams,
  )
  if (template) {
    return (
      <TaxonomyTemplateDocument
        breadcrumbs={heroBreadcrumbs}
        isDraftPreview={isDraftPreview}
        kind={kind}
        pathname={pathname}
        searchParams={searchParams}
        taxonomy={taxonomy}
        template={template}
        title={title}
      />
    )
  }

  const childTopics = kind === 'topic' ? await findChildTopics(taxonomy.id) : []
  const result = await findPublicContent({
    conditions: [
      kind === 'topic'
        ? {
            field: 'topic',
            operator: 'inSubtree',
            relationshipValue: { relationTo: 'topics', value: taxonomy.id },
          }
        : {
            field: 'tag',
            operator: 'contains',
            relationshipValue: { relationTo: 'tags', value: taxonomy.id },
          },
    ],
    page: requestedPage,
    pageSize: 12,
    pagination: true,
    sort: 'newest',
    sources: ['pages', 'posts', 'events', 'event-cycles'],
  })

  if (requestedPage > result.totalPages) {
    redirect(createPaginatedURL(pathname, searchParams, 'page', result.totalPages))
  }

  return (
    <main className="contentHeroPage">
      <ContentHero
        breadcrumbs={heroBreadcrumbs}
        description={taxonomy.description}
        eyebrow={kind === 'topic' ? 'Temat' : 'Tag'}
        title={title}
      >
        {childTopics.length ? (
          <nav aria-label="Podtematy" className="childTopics">
            {childTopics.map((topic) => (
              <Link href={`/topic/${topic.slug}`} key={topic.id}>
                {topic.name}
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
