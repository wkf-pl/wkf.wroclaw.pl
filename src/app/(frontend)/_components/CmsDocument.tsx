import { RichText } from '@payloadcms/richtext-lexical/react'

import type { Media, Page, Post, User } from '@/payload-types'

import { CmsImage } from './CmsImage'
import { TaxonomyLinks } from './TaxonomyLinks'

type CmsDocumentProperties = {
  document: Page | Post
}

const dateFormatter = new Intl.DateTimeFormat('pl-PL', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

function getAuthorName(author: null | number | User): null | string {
  return author && typeof author === 'object' ? author.displayName || null : null
}

function getPopulatedAttachments(attachments: (Media | number)[] | null | undefined): Media[] {
  return (
    attachments?.filter((attachment): attachment is Media => typeof attachment === 'object') ?? []
  )
}

export function CmsDocument({ document }: CmsDocumentProperties) {
  const authorName = getAuthorName(document.author)
  const attachments = getPopulatedAttachments(document.attachments)
  const isPost = 'excerpt' in document

  return (
    <main className="contentShell">
      <article className="cmsDocument">
        <header className="cmsDocumentHeader">
          {isPost ? <p className="eyebrow">Blog</p> : null}
          <h1>{document.title}</h1>
          {isPost ? <p className="contentLead">{document.excerpt}</p> : null}
          <TaxonomyLinks
            categories={isPost ? document.categories : undefined}
            tags={isPost ? document.tags : undefined}
          />
          {document.publishedAt || authorName ? (
            <p className="contentMeta">
              {document.publishedAt ? (
                <time dateTime={document.publishedAt}>
                  {dateFormatter.format(new Date(document.publishedAt))}
                </time>
              ) : null}
              {document.publishedAt && authorName ? ' · ' : null}
              {authorName ? `Autor: ${authorName}` : null}
            </p>
          ) : null}
        </header>

        <CmsImage className="heroImage" media={document.heroImage} />
        <RichText className="richText" data={document.content} />

        {attachments.length ? (
          <section aria-labelledby="attachments-heading" className="attachments">
            <h2 id="attachments-heading">Załączniki</h2>
            <ul>
              {attachments.map((attachment) => (
                <li key={attachment.id}>
                  {attachment.url ? (
                    <a href={attachment.url}>{attachment.filename || attachment.alt}</a>
                  ) : (
                    attachment.filename || attachment.alt
                  )}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </article>
    </main>
  )
}
