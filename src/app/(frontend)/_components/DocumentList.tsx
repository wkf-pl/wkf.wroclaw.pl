import Link from 'next/link'

import { documentTypeOptions } from '@/modules/documents/document-types'
import type { Document } from '@/payload-types'
import type { DocumentListingView } from '@/modules/documents/document-listing'

import { ContentCard } from './ContentCard'
import { ContentCarousel } from './ContentCarousel'
import { ContentListingMeta } from './ContentListingMeta'
import { ContentTile } from './ContentTile'

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
  if (!documents.length) {
    return <p className="emptyState">{emptyMessage || 'Nie ma dokumentów.'}</p>
  }

  if (view === 'carousel') {
    return (
      <ContentCarousel
        items={documents.map((document) => ({
          document,
          kind: 'documents',
          url: `/dokumenty/${document.slug}`,
        }))}
      />
    )
  }

  if (view === 'tiles') {
    return (
      <div className="documentList documentList-tiles">
        {documents.map((document) => (
          <ContentTile
            item={{
              document,
              kind: 'documents',
              url: `/dokumenty/${document.slug}`,
            }}
            key={document.id}
          />
        ))}
      </div>
    )
  }

  if (view !== 'list') {
    return (
      <div className={`documentList documentList-${view}`}>
        {documents.map((document) => (
          <ContentCard
            item={{
              document,
              kind: 'documents',
              url: `/dokumenty/${document.slug}`,
            }}
            key={document.id}
            view={view}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="documentList documentList-list">
      {documents.map((document) => (
        <article className="documentListItem" key={document.id}>
          <div className="documentListItemContent">
            <ContentListingMeta
              className="contentCardMeta documentListItemMeta"
              item={{
                document,
                kind: 'documents',
                url: `/dokumenty/${document.slug}`,
              }}
            />
            <h2>
              <Link href={`/dokumenty/${document.slug}`}>{document.title}</Link>
            </h2>
          </div>
        </article>
      ))}
    </div>
  )
}

function buildPageURL(page: number, type?: string, year?: number): string {
  const params = new URLSearchParams({ strona: `${page}` })
  if (type) params.set('typ', type)
  if (year) params.set('rok', `${year}`)
  return `/dokumenty?${params.toString()}`
}
