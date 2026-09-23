import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CmsRichText } from '@/components/CmsRichText'
import { getDocumentDisplayLabel } from '@/modules/documents/document-types'
import { findPublishedDocumentBySlug } from '@/modules/documents/public-documents'
import type { DocumentFile, User } from '@/payload-types'

import { ContentHero, ContentHeroMeta } from '../../_components/ContentHero'
import { DocumentPdfPreview } from '../../_components/DocumentPdfPreview'
import { TaxonomyLinks } from '../../_components/TaxonomyLinks'

export const dynamic = 'force-dynamic'

const dateFormatter = new Intl.DateTimeFormat('pl-PL', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const document = await findPublishedDocumentBySlug(slug)

  return document
    ? {
        description: document.summary,
        title: document.title,
      }
    : {}
}

export default async function DocumentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const document = await findPublishedDocumentBySlug(slug)

  if (!document) notFound()

  const primaryFile = getPopulatedFile(document.primaryFile)
  const attachments =
    document.attachments?.flatMap((file) => {
      const populatedFile = getPopulatedFile(file)
      return populatedFile ? [populatedFile] : []
    }) ?? []
  const authorName = getAuthorName(document.author)
  const primaryFileHref = primaryFile ? `/dokumenty/${document.slug}/plik/${primaryFile.id}` : null

  return (
    <main className="contentHeroPage">
      <article className="cmsDocument documentDetail">
        <ContentHero
          breadcrumbs={[
            { label: 'Strona główna', url: '/' },
            { label: 'Dokumenty', url: '/dokumenty' },
            { label: document.title, url: null },
          ]}
          eyebrow={getDocumentDisplayLabel(document.documentType, document.documentNumber)}
          media={
            primaryFileHref ? (
              <DocumentPdfPreview documentTitle={document.title} href={primaryFileHref} />
            ) : undefined
          }
          title={document.title}
        >
          <TaxonomyLinks category={document.category} tags={document.tags} />
          <ContentHeroMeta
            authorName={authorName}
            date={{
              dateTime: document.documentDate,
              label: dateFormatter.format(new Date(document.documentDate)),
            }}
          />
        </ContentHero>

        <div className="contentShell contentPageBody documentBody">
          <p className="documentSummary">{document.summary}</p>
          {document.content ? <CmsRichText className="richText" data={document.content} /> : null}

          {attachments.length > 0 ? (
            <section aria-labelledby="document-files-heading" className="attachments">
              <h2 id="document-files-heading">Załączniki</h2>
              <ul>
                {attachments.map((file) => (
                  <FileLink file={file} key={file.id} slug={document.slug} />
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </article>
    </main>
  )
}

function FileLink({ file, slug }: { file: DocumentFile; slug: string }) {
  return (
    <li>
      <a href={`/dokumenty/${slug}/plik/${file.id}`}>{file.label}</a>
    </li>
  )
}

function getPopulatedFile(value: DocumentFile | number): DocumentFile | null {
  return typeof value === 'object' ? value : null
}

function getAuthorName(author: null | number | User): null | string {
  return author && typeof author === 'object' ? author.displayName || null : null
}
