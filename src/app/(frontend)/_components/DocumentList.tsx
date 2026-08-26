import Link from 'next/link'

import { documentTypeOptions, getDocumentTypeLabel } from '@/modules/documents/document-types'
import type { Document } from '@/payload-types'
import type { DocumentListingView } from '@/modules/documents/document-listing'

const dateFormatter = new Intl.DateTimeFormat('pl-PL', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export function DocumentList({
  documents,
  page,
  totalPages,
  type,
  year,
}: {
  documents: Document[]
  page: number
  totalPages: number
  type?: string
  year?: number
}) {
  return (
    <>
      <form className="documentFilters" method="get">
        <label>
          Rodzaj
          <select defaultValue={type ?? ''} name="typ">
            <option value="">Wszystkie</option>
            {documentTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Rok
          <input
            defaultValue={year}
            inputMode="numeric"
            max="2100"
            min="1900"
            name="rok"
            type="number"
          />
        </label>
        <button type="submit">Filtruj</button>
      </form>

      <DocumentItems documents={documents} />

      {totalPages > 1 ? (
        <nav aria-label="Strony dokumentów" className="documentPagination">
          {page > 1 ? <Link href={buildPageURL(page - 1, type, year)}>Poprzednia</Link> : <span />}
          <span>
            Strona {page} z {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={buildPageURL(page + 1, type, year)}>Następna</Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </>
  )
}

export function DocumentItems({
  documents,
  emptyMessage = 'Brak dokumentów spełniających wybrane kryteria.',
  view = 'cards',
}: {
  documents: Document[]
  emptyMessage?: null | string
  view?: DocumentListingView
}) {
  return documents.length ? (
    <div className={`documentList documentList-${view}`}>
      {documents.map((document) => (
        <article className="documentListItem" key={document.id}>
          <div className="documentListItemContent">
            <p className="documentListItemMeta">
              <span>
                {getDocumentTypeLabel(document.documentType)}
                {document.documentNumber ? ` ${document.documentNumber}` : ''}
              </span>
              <time dateTime={document.documentDate}>
                {dateFormatter.format(new Date(document.documentDate))}
              </time>
            </p>
            <h2>
              <Link href={`/dokumenty/${document.slug}`}>{document.title}</Link>
            </h2>
            {view !== 'list' ? <p>{document.summary}</p> : null}
          </div>
        </article>
      ))}
    </div>
  ) : (
    <p className="emptyState">{emptyMessage || 'Nie ma dokumentów.'}</p>
  )
}

function buildPageURL(page: number, type?: string, year?: number): string {
  const params = new URLSearchParams({ strona: `${page}` })
  if (type) params.set('typ', type)
  if (year) params.set('rok', `${year}`)
  return `/dokumenty?${params.toString()}`
}
