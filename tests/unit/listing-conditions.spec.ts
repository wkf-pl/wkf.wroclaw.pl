import { describe, expect, it } from 'vitest'

import { validateListingConditions } from '@/blocks/listing-condition-fields'
import { compileListingConditionWhere } from '@/modules/content/content-listing'
import {
  createListingTagSearchIndex,
  allListingSources,
  formatPolishListingConditionCount,
  getApplicableListingSources,
  getListingConditionOperatorLabel,
  getWarsawDayAfterISOString,
  getWarsawDayStartISOString,
  getWarsawDaysAgoStartISOString,
  listingConditionFields,
  listingConditionOperatorsByField,
  listingConditionSupportedSources,
  listingSourceLabels,
  listingSourceSingularLabels,
  normalizeListingTitle,
  type ListingConditionInput,
} from '@/modules/content/listing-conditions'

function validate(
  conditions: ListingConditionInput[],
  sources: readonly string[] = allListingSources,
): true | string {
  return validateListingConditions(conditions, {
    siblingData: { selectionMode: 'filters', sources },
  } as never) as true | string
}

describe('listing conditions', () => {
  it('defines the supported fields, operators, and source capabilities', () => {
    expect(allListingSources).toEqual([
      'pages',
      'posts',
      'events',
      'event-cycles',
      'documents',
      'partners',
      'member-profiles',
    ])
    expect(listingSourceLabels).toMatchObject({
      'member-profiles': 'Wizytówki',
      partners: 'Partnerzy',
    })
    expect(listingSourceSingularLabels).toMatchObject({
      'member-profiles': 'Wizytówka',
      partners: 'Partner',
    })
    expect(listingConditionFields).toEqual([
      'title',
      'category',
      'tag',
      'parentPage',
      'eventCycle',
      'eventTime',
      'significantDate',
    ])
    expect(listingConditionOperatorsByField).toEqual({
      category: ['inSubtree', 'equals'],
      eventCycle: ['equals'],
      eventTime: ['equals'],
      parentPage: ['equals'],
      significantDate: ['notOlderThan', 'before', 'after', 'between'],
      tag: ['contains'],
      title: ['contains', 'equals'],
    })
    expect(listingConditionSupportedSources.parentPage).toEqual(['pages'])
    expect(listingConditionSupportedSources.eventCycle).toEqual(['events'])
    expect(listingConditionSupportedSources.eventTime).toEqual(['events'])
    expect(listingConditionSupportedSources.significantDate).toEqual([
      'posts',
      'events',
      'documents',
    ])
    expect(listingConditionSupportedSources.category).not.toContain('partners')
    expect(listingConditionSupportedSources.category).not.toContain('member-profiles')
    expect(listingConditionSupportedSources.title).toEqual(allListingSources)
    expect(getApplicableListingSources('title', ['pages', 'events'])).toEqual(['pages', 'events'])
  })

  it('uses concise operator labels for titles and categories', () => {
    expect(getListingConditionOperatorLabel('title', 'contains')).toBe('zawiera')
    expect(getListingConditionOperatorLabel('title', 'equals')).toBe('to')
    expect(getListingConditionOperatorLabel('category', 'inSubtree')).toBe('to')
    expect(getListingConditionOperatorLabel('category', 'equals')).toBe('to dokładnie')
  })

  it.each<ListingConditionInput>([
    { field: 'title', operator: 'contains', textValue: 'RPG' },
    {
      field: 'category',
      operator: 'inSubtree',
      relationshipValue: { relationTo: 'categories', value: 1 },
    },
    {
      field: 'category',
      operator: 'equals',
      relationshipValue: { relationTo: 'categories', value: 1 },
    },
    {
      field: 'tag',
      operator: 'contains',
      relationshipValue: { relationTo: 'tags', value: 2 },
    },
    {
      field: 'parentPage',
      operator: 'equals',
      relationshipValue: { relationTo: 'pages', value: 3 },
    },
    {
      field: 'eventCycle',
      operator: 'equals',
      relationshipValue: { relationTo: 'event-cycles', value: 4 },
    },
    { eventTimeValue: 'upcoming', field: 'eventTime', operator: 'equals' },
    { field: 'significantDate', numberValue: 30, operator: 'notOlderThan' },
    { dateValue: '2026-10-30', field: 'significantDate', operator: 'before' },
    { dateValue: '2026-10-30', field: 'significantDate', operator: 'after' },
    {
      dateValue: '2026-10-01',
      endDateValue: '2026-10-30',
      field: 'significantDate',
      operator: 'between',
    },
  ])('accepts a complete condition %#', (condition) => {
    expect(validate([condition])).toBe(true)
  })

  it('accepts source-only listings and client-side array row counts', () => {
    const validationOptions = {
      siblingData: { selectionMode: 'filters', sources: ['event-cycles'] },
    } as never

    expect(validate([])).toBe(true)
    expect(validateListingConditions(0 as never, validationOptions)).toBe(true)
    expect(validateListingConditions(1 as never, validationOptions)).toBe(true)
    expect(validateListingConditions(11 as never, validationOptions)).toContain(
      'najwyżej 10 warunków',
    )
  })

  it('rejects invalid pairs, values, relationship types, duplicates, and inactive conditions', () => {
    expect(validate([{ field: 'tag', operator: 'equals' }])).toBeTypeOf('string')
    expect(validate([{ field: 'title', operator: 'contains', textValue: '  ' }])).toBeTypeOf(
      'string',
    )
    expect(
      validate([
        {
          field: 'parentPage',
          operator: 'equals',
          relationshipValue: { relationTo: 'tags', value: 1 },
        },
      ]),
    ).toBeTypeOf('string')
    expect(
      validate([
        { field: 'title', operator: 'contains', textValue: 'RPG' },
        { field: 'title', operator: 'contains', textValue: ' ｒｐｇ ' },
      ]),
    ).toContain('duplikatem')
    expect(
      validate(
        [
          {
            field: 'parentPage',
            operator: 'equals',
            relationshipValue: { relationTo: 'pages', value: 1 },
          },
        ],
        ['posts'],
      ),
    ).toContain('nie dotyczy')
    expect(
      validate([
        {
          dateValue: '2026-10-31',
          endDateValue: '2026-10-01',
          field: 'significantDate',
          operator: 'between',
        },
      ]),
    ).toContain('nie może być późniejsza')
  })

  it('keeps different conditions for the same field', () => {
    expect(
      validate([
        {
          field: 'tag',
          operator: 'contains',
          relationshipValue: { relationTo: 'tags', value: 1 },
        },
        {
          field: 'tag',
          operator: 'contains',
          relationshipValue: { relationTo: 'tags', value: 2 },
        },
      ]),
    ).toBe(true)
  })

  it('compiles unsupported sources as pass-through and keeps all-source fields direct', () => {
    expect(
      compileListingConditionWhere({ field: 'parentPage', operator: 'equals', relationshipId: 7 }),
    ).toEqual({
      or: [{ source: { not_in: ['pages'] } }, { parentPage: { equals: 7 } }],
    })
    expect(
      compileListingConditionWhere({ field: 'title', operator: 'contains', textValue: 'rpg' }),
    ).toEqual({ normalizedTitle: { contains: 'rpg' } })
  })

  it('normalizes titles with Polish case rules and Unicode compatibility', () => {
    expect(normalizeListingTitle('  ZAŻÓŁĆ ＲＰＧ  ')).toBe('zażółć rpg')
  })

  it.each([
    [0, '0 warunków'],
    [1, '1 warunek'],
    [2, '2 warunki'],
    [4, '4 warunki'],
    [5, '5 warunków'],
    [12, '12 warunków'],
    [22, '22 warunki'],
  ])('formats the condition count for Polish numerals: %i', (count, expected) => {
    expect(formatPolishListingConditionCount(count)).toBe(expected)
  })

  it('creates stable, delimited tag search tokens', () => {
    expect(createListingTagSearchIndex([12, 2, 12, 20])).toBe('|2|12|20|')
    expect(createListingTagSearchIndex([])).toBe('||')
  })

  it('uses full Warsaw calendar days across daylight-saving transitions', () => {
    expect(getWarsawDayStartISOString('2026-03-29')).toBe('2026-03-28T23:00:00.000Z')
    expect(getWarsawDayAfterISOString('2026-03-29')).toBe('2026-03-29T22:00:00.000Z')
    expect(getWarsawDayStartISOString('2026-10-25')).toBe('2026-10-24T22:00:00.000Z')
    expect(getWarsawDayAfterISOString('2026-10-25')).toBe('2026-10-25T23:00:00.000Z')
    expect(getWarsawDaysAgoStartISOString(1, new Date('2026-03-30T12:00:00Z'))).toBe(
      '2026-03-28T23:00:00.000Z',
    )
  })
})
