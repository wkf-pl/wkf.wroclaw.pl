import Link from 'next/link'
import { redirect } from 'next/navigation'

import { findChildTopics } from '@/modules/content/topic-hierarchy'
import { resolveTemplateListingPageURL } from '@/modules/page-templates/template-listing-pagination'
import type { Topic, PageTemplate, Tag } from '@/payload-types'

import { CurrentItemHeading, CurrentItemList, CurrentItemText } from './CurrentItemPresentation'
import { PageTemplateDocument } from './PageTemplateDocument'

export async function TaxonomyTemplateDocument({
  breadcrumbs,
  isDraftPreview,
  kind,
  pathname,
  searchParams,
  taxonomy,
  template,
  title,
}: {
  breadcrumbs: Parameters<typeof PageTemplateDocument>[0]['breadcrumbs']
  isDraftPreview: boolean
  kind: 'topic' | 'tag'
  pathname: string
  searchParams: Record<string, string | string[] | undefined>
  taxonomy: Topic | Tag
  template: PageTemplate
  title: string
}) {
  const listingURL = await resolveTemplateListingPageURL({
    template,
    pathname,
    searchParams,
    matches: (block) =>
      block.selectionMode === 'filters' &&
      Boolean(
        block.conditions?.some(
          ({ field, relatedTargetMode }) =>
            field === 'relatedTo' && relatedTargetMode === 'current',
        ),
      ),
  })
  if (listingURL) redirect(listingURL)

  return (
    <PageTemplateDocument
      breadcrumbs={breadcrumbs}
      currentItem={{
        document: taxonomy,
        target: { relationTo: kind === 'topic' ? 'topics' : 'tags', value: taxonomy.id },
        renderField: (block) => {
          if (block.field === 'name')
            return <CurrentItemHeading text={title} variant={block.variant} />
          if (block.field === 'description') {
            return <CurrentItemText text={taxonomy.description} variant={block.variant} />
          }
          if (block.field === 'hierarchy' && kind === 'topic') {
            return <ChildTopicLinks topicID={taxonomy.id} variant={block.variant} />
          }
          return null
        },
      }}
      fallbackTitle={title}
      isDraftPreview={isDraftPreview}
      pathname={pathname}
      searchParams={searchParams}
      template={template}
    />
  )
}

async function ChildTopicLinks({ topicID, variant }: { topicID: number; variant: string }) {
  const childTopics = await findChildTopics(topicID)
  return childTopics.length ? (
    <nav aria-label="Podtematy">
      <CurrentItemList variant={variant}>
        {childTopics.map((topic) => (
          <li key={topic.id}>
            <Link href={`/topic/${topic.slug}`}>{topic.name}</Link>
          </li>
        ))}
      </CurrentItemList>
    </nav>
  ) : null
}
