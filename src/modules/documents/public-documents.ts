import { getPayload, type Where } from 'payload'

import config from '@payload-config'

import type { Document } from '@/payload-types'
import { publicRequestContext } from '@/modules/content/public-access'

const pageSize = 20

export type DocumentListFilters = {
  page: number
  type?: string
  year?: number
}

export async function findPublishedDocuments({ filters }: { filters: DocumentListFilters }) {
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

  conditions.push({ _status: { equals: 'published' } })

  return payload.find({
    collection: 'documents',
    context: publicRequestContext,
    depth: 1,
    draft: false,
    limit: pageSize,
    overrideAccess: false,
    page: filters.page,
    sort: ['-documentDate', 'title'],
    user: null,
    where: { and: conditions },
  })
}

export async function findPublishedDocumentBySlug(slug: string): Promise<Document | null> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'documents',
    context: publicRequestContext,
    depth: 1,
    draft: false,
    limit: 1,
    overrideAccess: false,
    user: null,
    where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] },
  })

  return result.docs[0] ?? null
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
