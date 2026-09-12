import { describe, expect, it } from 'vitest'

import {
  matchesRasterIconSearch,
  rasterIconPickerOptions,
} from '@/modules/icons/icon-picker-options'

describe('RasterIconPickerField', () => {
  it('finds icons by Polish label, stable slug and synonyms', () => {
    const dice = rasterIconPickerOptions.find(({ name }) => name === 'dice')
    const arrow = rasterIconPickerOptions.find(({ name }) => name === 'arrow-right')

    expect(dice && matchesRasterIconSearch(dice, 'kość')).toBe(true)
    expect(dice && matchesRasterIconSearch(dice, 'dice')).toBe(true)
    expect(dice && matchesRasterIconSearch(dice, 'RPG')).toBe(true)
    expect(arrow && matchesRasterIconSearch(arrow, 'dalej')).toBe(true)
  })

  it('keeps all picker options selectable and assigned to an editorial category', () => {
    expect(rasterIconPickerOptions).toHaveLength(63)
    expect(rasterIconPickerOptions.every(({ category, value }) => category && value)).toBe(true)
  })
})
