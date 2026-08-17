import Link from 'next/link'

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

export function createPaginatedURL(
  pathname: string,
  searchParams: Record<string, string | string[] | undefined>,
  parameterName: string,
  page: number,
): string {
  const parameters = new URLSearchParams()

  for (const [name, value] of Object.entries(searchParams)) {
    if (name === parameterName || value === undefined) {
      continue
    }

    for (const item of Array.isArray(value) ? value : [value]) {
      parameters.append(name, item)
    }
  }

  if (page > 1) {
    parameters.set(parameterName, String(page))
  }

  const query = parameters.toString()
  return query ? `${pathname}?${query}` : pathname
}

export function getRequestedPage(value: string | string[] | undefined): number {
  const candidate = Array.isArray(value) ? value[0] : value
  if (!candidate || !/^\d+$/.test(candidate)) {
    return 1
  }

  const page = Number(candidate)
  return Number.isSafeInteger(page) && page > 0 ? page : 1
}
