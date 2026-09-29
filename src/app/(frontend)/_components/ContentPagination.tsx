import Link from 'next/link'

import { createPaginatedURL } from '@/modules/content/pagination'

type ContentPaginationProperties = {
  currentPage: number
  parameterName: string
  pathname: string
  searchParams: Record<string, string | string[] | undefined>
  totalPages: number
}

export function ContentPagination({
  currentPage,
  parameterName,
  pathname,
  searchParams,
  totalPages,
}: ContentPaginationProperties) {
  if (totalPages <= 1) {
    return null
  }

  return (
    <nav aria-label="Paginacja" className="contentPagination">
      {currentPage > 1 ? (
        <Link href={createPaginatedURL(pathname, searchParams, parameterName, currentPage - 1)}>
          Poprzednia
        </Link>
      ) : (
        <span />
      )}
      <span>
        Strona {currentPage} z {totalPages}
      </span>
      {currentPage < totalPages ? (
        <Link href={createPaginatedURL(pathname, searchParams, parameterName, currentPage + 1)}>
          Następna
        </Link>
      ) : (
        <span />
      )}
    </nav>
  )
}
