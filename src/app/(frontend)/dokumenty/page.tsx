import type { Metadata } from 'next'

import { getCurrentUser } from '@/modules/auth/current-user'
import {
  findAccessibleDocuments,
  parseDocumentListFilters,
} from '@/modules/documents/public-documents'

import { DocumentList } from '../_components/DocumentList'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  description: 'Uchwały i pozostałe dokumenty Wrocławskiego Klubu Fantastyki.',
  title: 'Dokumenty klubowe',
}

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [user, resolvedSearchParams] = await Promise.all([getCurrentUser(), searchParams])
  const filters = parseDocumentListFilters(resolvedSearchParams)
  const result = await findAccessibleDocuments({ filters, user })

  return (
    <main className="contentShell">
      <header className="listingHeader">
        <p className="eyebrow">Klub</p>
        <h1>Dokumenty klubowe</h1>
        <p>
          Uchwały, regulaminy, protokoły i pozostałe dokumenty udostępnione publicznie lub Twoim
          rolom.
        </p>
      </header>
      <DocumentList
        documents={result.docs}
        page={result.page ?? filters.page}
        totalPages={result.totalPages}
        type={filters.type}
        year={filters.year}
      />
    </main>
  )
}
