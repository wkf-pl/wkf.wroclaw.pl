import type { Post } from '@/payload-types'

import { CmsPageDocument } from './CmsPageDocument'

type CmsDocumentProperties = {
  document: Post
  searchParams: Record<string, string | string[] | undefined>
}

export function CmsDocument({ document, searchParams }: CmsDocumentProperties) {
  return (
    <CmsPageDocument
      breadcrumbs={[
        { label: 'Strona główna', url: '/' },
        { label: 'Aktualności', url: '/blog' },
        { label: document.title, url: null },
      ]}
      document={document}
      pathname={`/blog/${document.slug}`}
      searchParams={searchParams}
    />
  )
}
