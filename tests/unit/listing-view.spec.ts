import { describe, expect, it } from 'vitest'

import {
  getSharedListingViewId,
  getListingViewReference,
  legacyListingViews,
  resolveListingView,
} from '@/modules/content/listing-view'

describe('Listing view resolution', () => {
  it.each(legacyListingViews)('keeps the legacy renderer for an unchanged %s preset', (view) => {
    expect(resolveListingView(undefined, view).legacy).toBe(view)
    expect(resolveListingView({ preset: view }, view).legacy).toBe(view)
  })

  it('resolves saved and restored preset names through editable templates', () => {
    expect(getListingViewReference(undefined, 'grid')).toEqual({ presetKey: 'grid' })
    expect(getListingViewReference({ preset: 'upcoming' })).toEqual({ presetKey: 'upcoming' })
    expect(getListingViewReference({ preset: 'shared:42' })).toEqual({ id: 42 })
    expect(getListingViewReference({ preset: 'custom' })).toBeUndefined()
  })

  it('applies local columns and hidden information over published settings', () => {
    const appearance = {
      preset: 'shared:42',
      overrides: { columns: 2, information: { venue: false } },
    }
    expect(getSharedListingViewId(appearance)).toBe(42)
    expect(
      resolveListingView(appearance, 'cards', {
        form: 'vertical',
        columns: 4,
        information: { venue: true, calendar: true },
      }),
    ).toMatchObject({
      view: { form: 'vertical', columns: 2, information: { venue: false, calendar: true } },
      legacy: undefined,
    })
  })

  it('uses the persisted fallback if a published shared view is missing', () => {
    expect(resolveListingView({ preset: 'shared:42' }, 'grid')).toMatchObject({
      legacy: 'grid',
      view: { columns: 3, form: 'vertical' },
    })
  })

  it('ignores invalid options and hides an incompatible image in row form', () => {
    expect(
      resolveListingView({
        preset: 'upcoming',
        overrides: { columns: 0, form: 'row', information: { image: true, unknown: true } },
      }).view,
    ).toMatchObject({ columns: 3, form: 'row', information: { image: false } })
  })
})
