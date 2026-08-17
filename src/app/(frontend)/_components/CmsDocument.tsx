import type { Post } from '@/payload-types'

import { CmsPageDocument } from './CmsPageDocument'

type CmsDocumentProperties = {
  document: Post
  searchParams: Record<string, string | string[] | undefined>
}

export function CmsDocument({ document, searchParams }: CmsDocumentProperties) {
  return (
    <CmsPageDocument
      document={document}
      pathname={`/blog/${document.slug}`}
      searchParams={searchParams}
      showBlogEyebrow
    />
  )
}
