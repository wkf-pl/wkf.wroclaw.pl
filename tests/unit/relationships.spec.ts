import { describe, expect, it } from 'vitest'

import {
  getFormRelationshipId,
  getPopulatedRelationship,
  getPopulatedRelationships,
  getRelationshipId,
  getRelationshipIds,
} from '@/lib/relationships'
import {
  normalizeListingWindow,
  paginateInMemory,
  restoreRelationshipOrder,
  validateUniqueRelationshipIds,
} from '@/modules/content/listing-window'
import { collectPayloadPages } from '@/lib/payload-pagination'
import { vi } from 'vitest'

describe('relationship helpers', () => {
  it('normalizes stored and form relationship shapes', () => {
    expect(getRelationshipId(7)).toBe(7)
    expect(getRelationshipId({ id: 'seven' })).toBe('seven')
    expect(getFormRelationshipId({ value: { id: 8 } })).toBe(8)
    expect(getFormRelationshipId({ value: 'nine' })).toBe('nine')
    expect(getRelationshipIds([1, { id: 2 }, { value: 3 }, null])).toEqual([1, 2, 3])
  })

  it('keeps only populated documents', () => {
    const document = { id: 1, title: 'Document' }
    expect(getPopulatedRelationship(document)).toBe(document)
    expect(getPopulatedRelationship(1)).toBeNull()
    expect(getPopulatedRelationships([1, document, 2])).toEqual([document])
  })
})

describe('listing window', () => {
  it('normalizes pagination limits', () => {
    expect(normalizeListingWindow({ page: 0, pageSize: 150, pagination: true })).toEqual({
      page: 1,
      pageSize: 100,
      pagination: true,
    })
    expect(normalizeListingWindow({ page: 8, pageSize: 0, pagination: false })).toEqual({
      page: 1,
      pageSize: 1,
      pagination: false,
    })
  })

  it('paginates in memory and restores manual relationship order', () => {
    const items = [
      { id: 1, title: 'First' },
      { id: 2, title: 'Second' },
      { id: 3, title: 'Third' },
    ]
    const ordered = restoreRelationshipOrder([3, 1, 2], items)

    expect(paginateInMemory(ordered, { page: 2, pageSize: 2, pagination: true })).toEqual({
      items: [{ id: 2, title: 'Second' }],
      page: 2,
      pageSize: 2,
      pagination: true,
      totalDocs: 3,
      totalPages: 2,
    })
  })

  it('detects duplicate stored and form relationship values', () => {
    expect(validateUniqueRelationshipIds([{ item: 7 }, { item: { id: 7 } }], 'item')).toBe(false)
    expect(validateUniqueRelationshipIds([{ item: 7 }, { item: { value: 8 } }], 'item')).toBe(true)
  })
})

describe('Payload pagination', () => {
  it('collects every page without a fixed document cap', async () => {
    const loadPage = vi.fn(async (page: number) => ({
      docs: Array.from({ length: page < 3 ? 500 : 1 }, (_, index) => (page - 1) * 500 + index),
      hasNextPage: page < 3,
      nextPage: page < 3 ? page + 1 : null,
    }))

    const documents = await collectPayloadPages(loadPage)

    expect(documents).toHaveLength(1001)
    expect(loadPage).toHaveBeenCalledTimes(3)
  })
})
