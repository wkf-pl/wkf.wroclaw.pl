import type { PageTemplate } from '@/payload-types'

import { getContentHeroImage } from './ContentHero'
import { DraftPreviewBanner } from './DraftPreviewBanner'
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
    <>
      {isDraftPreview ? (
        <DraftPreviewBanner
          message="Podglądasz roboczy układ szablonu. Opublikowana strona nadal używa ostatnio opublikowanego trybu renderowania."
          pathname={pathname}
        />
      ) : null}
      <PageTemplateDocument
        breadcrumbs={[
          { label: 'Strona główna', url: '/' },
          { label: title, url: null },
        ]}
        image={getContentHeroImage(template.heroImage)}
        indexTitle={title}
        pathname={pathname}
        searchParams={searchParams}
        template={template}
      />
    </>
  )
}
