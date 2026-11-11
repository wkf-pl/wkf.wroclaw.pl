import type { PageTemplate } from '@/payload-types'

import { getContentHeroImage } from './ContentHero'
import { PageTemplateDocument } from './PageTemplateDocument'

type IndexPageTemplateDocumentProperties = {
  isDraftPreview: boolean
  pathname: string
  searchParams: Record<string, string | string[] | undefined>
  template: PageTemplate
  title: string
}

export function IndexPageTemplateDocument({
  isDraftPreview,
  pathname,
  searchParams,
  template,
  title,
}: IndexPageTemplateDocumentProperties) {
  return (
    <PageTemplateDocument
      breadcrumbs={[
        { label: 'Strona główna', url: '/' },
        { label: title, url: null },
      ]}
      image={getContentHeroImage(template.heroImage)}
      fallbackTitle={title}
      isDraftPreview={isDraftPreview}
      pathname={pathname}
      searchParams={searchParams}
      template={template}
    />
  )
}
