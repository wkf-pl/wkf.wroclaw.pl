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

describe('Listing decoration', () => {
  it.each([
    ['legacyColumns', 'small'],
    ['legacyTile', 'large'],
  ])('maps old %s spacing and fill to editable values', (gap, replacement) => {
    const { view } = resolveListingView({ overrides: { decoration: { gap, fill: 'legacy' } } })
    expect(view.decoration).toMatchObject({ gap: replacement, fill: 'default' })
  })

  it('merges each local and template setting independently', () => {
    const shared = {
      decoration: {
        frame: 'outline',
        itemBorder: 'outline',
        gap: 'small',
        surfaceImage: 21,
        fill: 'inverse',
      },
    }
    const { view, legacy } = resolveListingView(
      {
        preset: 'shared:42',
        overrides: { decoration: { frame: 'none', padding: 'large', surfaceImage: null } },
      },
      'tiles',
      shared,
    )
    expect(legacy).toBeUndefined()
    expect(view.decoration).toMatchObject({
      frame: 'none',
      itemBorder: 'outline',
      gap: 'small',
      padding: 'large',
      surfaceImage: null,
      fill: 'inverse',
    })
  })

  it('keeps the existing renderer for records without decoration', () => {
    expect(resolveListingView(undefined, 'compact', undefined, { frame: 'outline' })).toMatchObject(
      { legacy: 'compact' },
    )
    expect(resolveListingView(undefined, 'compact').view.decoration).toBeUndefined()
  })

  it('maps legacy row decoration and lets a reset follow the template', () => {
    const previous = {
      frame: 'outline',
      surface: 'image',
      surfaceImage: { id: 21 },
      surfaceHorizontalPosition: 'right',
    }
    const shared = { decoration: { frame: 'none' } }
    expect(
      resolveListingView(undefined, 'compact', shared, previous).view.decoration,
    ).toMatchObject({
      frame: 'outline',
      itemBorder: 'outline',
      padding: 'none',
      gap: 'none',
      surface: 'image',
      surfaceImage: 21,
      surfaceHorizontalPosition: 'right',
    })
    expect(
      resolveListingView({ overrides: { decoration: {} } }, 'compact', shared, previous).view
        .decoration,
    ).toMatchObject({
      frame: 'none',
      itemBorder: 'none',
      surface: 'transparent',
    })
  })

  it('does not pass malformed values or raw media URLs into the view', () => {
    expect(
      resolveListingView({
        overrides: {
          decoration: {
            gap: '10px',
            fallbackImage: 'https://example.invalid/a.png',
            fillImage: -1,
          },
        },
      }).view.decoration,
    ).toMatchObject({
      gap: 'large',
      fallbackImage: null,
      fillImage: null,
    })
  })
})
