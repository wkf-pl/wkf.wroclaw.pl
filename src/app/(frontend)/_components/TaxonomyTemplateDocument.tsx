import Link from 'next/link'
import { redirect } from 'next/navigation'

import { findChildCategories } from '@/modules/content/category-hierarchy'
import { resolveTemplateListingPageURL } from '@/modules/page-templates/template-listing-pagination'
import type { Category, PageTemplate, Tag } from '@/payload-types'

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
  kind: 'category' | 'tag'
  pathname: string
  searchParams: Record<string, string | string[] | undefined>
  taxonomy: Category | Tag
  template: PageTemplate
  title: string
}) {
  const listingURL = resolveTemplateListingPageURL({
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
        target: { relationTo: kind === 'category' ? 'categories' : 'tags', value: taxonomy.id },
        renderField: (block) => {
          if (block.field === 'name')
            return <CurrentItemHeading text={title} variant={block.variant} />
          if (block.field === 'description') {
            return <CurrentItemText text={taxonomy.description} variant={block.variant} />
          }
          if (block.field === 'hierarchy' && kind === 'category') {
            return <ChildCategoryLinks categoryID={taxonomy.id} variant={block.variant} />
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

async function ChildCategoryLinks({
  categoryID,
  variant,
}: {
  categoryID: number
  variant: string
}) {
  const childCategories = await findChildCategories(categoryID)
  return childCategories.length ? (
    <nav aria-label="Podkategorie">
      <CurrentItemList variant={variant}>
        {childCategories.map((category) => (
          <li key={category.id}>
            <Link href={`/category/${category.slug}`}>{category.name}</Link>
          </li>
        ))}
      </CurrentItemList>
    </nav>
  ) : null
}
