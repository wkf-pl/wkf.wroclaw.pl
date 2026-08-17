import { APIError, getPayload, type Where } from 'payload'

import config from '@payload-config'

import type { Document, User } from '@/payload-types'
import { websiteRequestContext } from '@/modules/membership/role-permissions'

const pageSize = 20

export type DocumentListFilters = {
  page: number
  type?: string
  year?: number
}

export async function findAccessibleDocuments({
  filters,
  user,
}: {
  filters: DocumentListFilters
  user: null | User
}) {
  const payload = await getPayload({ config })
  const conditions: Where[] = []

  if (filters.type) {
    conditions.push({ documentType: { equals: filters.type } })
  }

  if (filters.year) {
    conditions.push({
      documentDate: {
        greater_than_equal: `${filters.year}-01-01T00:00:00.000Z`,
        less_than_equal: `${filters.year}-12-31T23:59:59.999Z`,
      },
    })
  }

  try {
    return await payload.find({
      collection: 'documents',
      context: websiteRequestContext,
      depth: 1,
      limit: pageSize,
      overrideAccess: false,
      page: filters.page,
      sort: ['-documentDate', 'title'],
      user,
      where: conditions.length > 0 ? { and: conditions } : undefined,
    })
  } catch (err) {
    if (!(err instanceof APIError) || err.status !== 403) {
      throw err
    }

    return {
      docs: [],
      hasNextPage: false,
      hasPrevPage: false,
      limit: pageSize,
      nextPage: null,
      page: filters.page,
      pagingCounter: 1,
      prevPage: null,
      totalDocs: 0,
      totalPages: 0,
    }
  }
}

export async function findAccessibleDocumentBySlug({
  slug,
  user,
}: {
  slug: string
  user: null | User
}): Promise<Document | null> {
  const payload = await getPayload({ config })
  try {
    const result = await payload.find({
      collection: 'documents',
      context: websiteRequestContext,
      depth: 1,
      limit: 1,
      overrideAccess: false,
      user,
      where: { slug: { equals: slug } },
    })

    return result.docs[0] ?? null
  } catch (err) {
    if (err instanceof APIError && err.status === 403) {
      return null
    }

    throw err
  }
}

export function parseDocumentListFilters(
  searchParams: Record<string, string | string[] | undefined>,
): DocumentListFilters {
  const pageValue = getSingleValue(searchParams.strona)
  const yearValue = getSingleValue(searchParams.rok)
  const parsedPage = Number.parseInt(pageValue ?? '', 10)
  const parsedYear = Number.parseInt(yearValue ?? '', 10)

  return {
    page: Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1,
    type: getSingleValue(searchParams.typ),
    year:
      Number.isSafeInteger(parsedYear) && parsedYear >= 1900 && parsedYear <= 2100
        ? parsedYear
        : undefined,
  }
}

function getSingleValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}
