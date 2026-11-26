import { describe, expect, it } from 'vitest'

import { ListingBlock } from '@/blocks/Listing'
import {
  getContentSearchParameterNames,
  getPreservedSearchParameters,
  parseContentSearchFilters,
} from '@/modules/content/content-search-parameters'
import {
  getWarsawDayAfterISOString,
  getWarsawDayStartISOString,
} from '@/modules/content/listing-conditions'

const names = getContentSearchParameterNames('search_catalog')
const enabled = {
  phrase: true,
  author: true,
  date: true,
  tags: true,
  topic: true,
  contentType: true,
}
const options = {
  topics: [{ id: 4, label: 'RPG' }],
  tags: [
    { id: 2, label: 'Dark Sun' },
    { id: 7, label: 'Opowiadanie' },
  ],
}

describe('content search', () => {
  it('registers an optional search tab on the Listing', () => {
    const tabsField = ListingBlock.fields[0]
    if (tabsField.type !== 'tabs') throw new Error('Expected a tabbed block.')
    expect(tabsField.tabs.map(({ label }) => label)).toEqual([
      'Treści',
      'Wyszukiwanie',
      'Prezentacja',
    ])
    const searchFields = tabsField.tabs[1].fields
    expect(searchFields[0]).toMatchObject({ name: 'searchEnabled', defaultValue: false })
    expect(searchFields[2]).toMatchObject({
      type: 'row',
      admin: { className: 'wkf-listing-search-filters' },
      fields: expect.arrayContaining([
        expect.objectContaining({ name: 'filterPhrase', type: 'checkbox' }),
        expect.objectContaining({ name: 'filterBranch', type: 'checkbox' }),
      ]),
    })
    expect(searchFields[3]).toMatchObject({ name: 'filterTagGroups' })
    expect(JSON.stringify(tabsField.tabs[0].fields)).toContain('"member-profiles"')
    expect(JSON.stringify(tabsField.tabs[0].fields)).toContain('"locations"')
    expect(JSON.stringify(tabsField.tabs[0].fields)).toContain('"partners"')
  })

  it('normalizes repeated parameters and keeps only allowed choices', () => {
    const { filters, errors, hasInput } = parseContentSearchFilters({
      enabled,
      names,
      options,
      sources: ['pages', 'posts'],
      parameters: {
        [names.phrase]: '  Słońce  ',
        [names.topic]: '4',
        [names.tags]: ['7', '2', '7', '500'],
        [names.contentType]: ['posts', 'pages', 'partners'],
      },
    })
    expect(filters).toEqual({
      phrase: 'Słońce',
      topicIds: [4],
      tagIds: [7, 2],
      sources: ['posts', 'pages'],
    })
    expect(Object.keys(errors)).toEqual(['tags', 'contentType'])
    expect(hasInput).toBe(true)
  })

  it('ignores disabled filters and retains valid fields when a date or topic is invalid', () => {
    const { filters, errors } = parseContentSearchFilters({
      enabled: { ...enabled, tags: false },
      names,
      options,
      sources: ['pages'],
      parameters: {
        [names.author]: 'Redakcja',
        [names.tags]: '2',
        [names.topic]: '999',
        [names.dateFrom]: '2026-10-26',
        [names.dateTo]: '2026-10-25',
      },
    })
    expect(filters).toEqual({ author: 'Redakcja' })
    expect(Object.keys(errors)).toEqual(['dateFrom', 'dateTo', 'topic'])
  })

  it('resets only its own parameters and keeps repeated filters from other blocks', () => {
    expect(
      getPreservedSearchParameters(
        {
          [names.phrase]: 'słońce',
          [names.tags]: ['7', '2'],
          pageTemplatePreview: 'blog-index',
          search_catalog: '2',
          search_other_tag: ['7', '2'],
        },
        names,
        'search_catalog',
      ),
    ).toEqual([
      ['pageTemplatePreview', 'blog-index'],
      ['search_other_tag', '7'],
      ['search_other_tag', '2'],
    ])
  })

  it('validates the author selected from the scoped options and accepts old text links', () => {
    const parseAuthor = (author: string) =>
      parseContentSearchFilters({
        enabled,
        names,
        options: { ...options, authors: [{ id: 2, label: 'Anna' }] },
        sources: ['pages'],
        parameters: { [names.author]: author },
      })
    expect(parseAuthor('id:2').filters).toEqual({ authorId: 2 })
    expect(parseAuthor('id:9')).toMatchObject({
      filters: {},
      errors: { author: expect.any(String) },
    })
    expect(parseAuthor('Ann').filters).toEqual({ author: 'Ann' })
  })

  it('uses local calendar boundaries on the day when clocks change', () => {
    expect(getWarsawDayStartISOString('2026-10-25')).toBe('2026-10-24T22:00:00.000Z')
    expect(getWarsawDayAfterISOString('2026-10-25')).toBe('2026-10-25T23:00:00.000Z')
  })
})
