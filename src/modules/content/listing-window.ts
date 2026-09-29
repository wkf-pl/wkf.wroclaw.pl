import { getFormRelationshipId, type RelationshipID } from '@/lib/relationships'

export type ListingWindow = {
  page: number
  pageSize: number
  pagination: boolean
}

export type PaginatedItems<Item> = ListingWindow & {
  items: Item[]
  totalDocs: number
  totalPages: number
}

export function normalizeListingWindow(window: ListingWindow): ListingWindow {
  return {
    page: window.pagination ? Math.max(1, Math.floor(window.page)) : 1,
    pageSize: Math.min(100, Math.max(1, Math.floor(window.pageSize))),
    pagination: window.pagination,
  }
}

export function paginateInMemory<Item>(
  items: readonly Item[],
  window: ListingWindow,
): PaginatedItems<Item> {
  const normalizedWindow = normalizeListingWindow(window)
  const totalDocs = items.length
  const totalPages = normalizedWindow.pagination
    ? Math.max(1, Math.ceil(totalDocs / normalizedWindow.pageSize))
    : 1
  const offset = normalizedWindow.pagination
    ? (normalizedWindow.page - 1) * normalizedWindow.pageSize
    : 0

  return {
    ...normalizedWindow,
    items: items.slice(offset, offset + normalizedWindow.pageSize),
    totalDocs,
    totalPages,
  }
}

export function restoreRelationshipOrder<Item extends { id: RelationshipID }>(
  relationshipIds: readonly RelationshipID[],
  items: readonly Item[],
): Item[] {
  const itemsById = new Map(items.map((item) => [String(item.id), item]))
  return relationshipIds.flatMap((id) => {
    const item = itemsById.get(String(id))
    return item ? [item] : []
  })
}

export function validateUniqueRelationshipIds(rows: unknown, relationshipField: string): boolean {
  if (!Array.isArray(rows)) {
    return true
  }

  const relationshipIds = rows.flatMap((row) => {
    if (!row || typeof row !== 'object' || !(relationshipField in row)) {
      return []
    }

    const id = getFormRelationshipId(row[relationshipField])
    return id === undefined ? [] : [String(id)]
  })

  return new Set(relationshipIds).size === relationshipIds.length
}
