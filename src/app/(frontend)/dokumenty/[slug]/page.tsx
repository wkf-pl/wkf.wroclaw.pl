import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getCurrentUser } from '@/modules/auth/current-user'
import { getDocumentTypeLabel } from '@/modules/documents/document-types'
import { findAccessibleDocumentBySlug } from '@/modules/documents/public-documents'
import type { DocumentFile } from '@/payload-types'

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
  const user = await getCurrentUser()
  const document = await findAccessibleDocumentBySlug({ slug, user })

  return document
    ? {
        description: document.summary,
        robots: user ? { index: false } : undefined,
        title: document.title,
      }
    : {}
}

export default async function DocumentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const document = await findAccessibleDocumentBySlug({ slug, user: await getCurrentUser() })

  if (!document) notFound()

  const primaryFile = getPopulatedFile(document.primaryFile)
  const attachments =
    document.attachments?.flatMap((file) => {
      const populatedFile = getPopulatedFile(file)
      return populatedFile ? [populatedFile] : []
    }) ?? []

  return (
    <main className="contentShell">
      <article className="cmsDocument documentDetail">
        <header className="cmsDocumentHeader">
          <p className="eyebrow">
            {getDocumentTypeLabel(document.documentType)}
            {document.documentNumber ? ` ${document.documentNumber}` : ''}
          </p>
          <h1>{document.title}</h1>
          <p className="contentLead">{document.summary}</p>
          <p className="contentMeta">
            <time dateTime={document.documentDate}>
              {dateFormatter.format(new Date(document.documentDate))}
            </time>
          </p>
        </header>

        {document.content ? <RichText className="richText" data={document.content} /> : null}

        <section aria-labelledby="document-files-heading" className="attachments">
          <h2 id="document-files-heading">Pliki</h2>
          <ul>
            {primaryFile ? <FileLink file={primaryFile} slug={document.slug} /> : null}
            {attachments.map((file) => (
              <FileLink file={file} key={file.id} slug={document.slug} />
            ))}
          </ul>
        </section>
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
