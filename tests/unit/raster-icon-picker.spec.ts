import { describe, expect, it } from 'vitest'

import {
  matchesRasterIconSearch,
  rasterIconPickerOptions,
} from '@/modules/icons/icon-picker-options'
import { rasterIconCategoryLabels } from '@/modules/icons/icon-registry'

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
    expect(rasterIconPickerOptions).toHaveLength(113)
    expect(rasterIconPickerOptions.every(({ category, value }) => category && value)).toBe(true)
  })

  it('uses the consolidated editorial groups and assigns thematic icons correctly', () => {
    expect(rasterIconCategoryLabels).toEqual({
      action: 'Akcje i informacje',
      content: 'Treści',
      games: 'Gry',
      fantasy: 'Fantastyka',
      community: 'Społeczność',
      contact: 'Kontakt',
    })

    expect(rasterIconPickerOptions.find(({ name }) => name === 'arrow')?.category).toBe('fantasy')
    expect(rasterIconPickerOptions.find(({ name }) => name === 'arrows')?.category).toBe('fantasy')
    expect(rasterIconPickerOptions.find(({ name }) => name === 'board-game')?.category).toBe(
      'games',
    )
    expect(rasterIconPickerOptions.find(({ name }) => name === 'guitar')?.category).toBe('content')
    expect(rasterIconPickerOptions.find(({ name }) => name === 'soundtrack')?.category).toBe(
      'content',
    )
    expect(rasterIconPickerOptions.find(({ name }) => name === 'larp')?.category).toBe('games')
    expect(rasterIconPickerOptions.find(({ name }) => name === 'skull')?.category).toBe('fantasy')
    expect(rasterIconPickerOptions.find(({ name }) => name === 'bottle-mana')?.category).toBe(
      'fantasy',
    )
    expect(rasterIconPickerOptions.find(({ name }) => name === 'ticket')?.category).toBe('action')
    expect(rasterIconPickerOptions.map(({ name }) => name)).not.toContain('larp-mask')
  })

  it.each([
    ['search', 'action', 'lupa'],
    ['listing-template', 'content', 'układ'],
    ['crown', 'fantasy', 'królowa'],
    ['profile-card', 'community', 'klubowicz'],
    ['rss', 'contact', 'subskrypcja'],
  ])('offers %s in %s and matches its Polish keyword', (name, category, keyword) => {
    const option = rasterIconPickerOptions.find((option) => option.name === name)
    expect(option?.category).toBe(category)
    expect(option && matchesRasterIconSearch(option, keyword)).toBe(true)
  })

  it('keeps the internal footer and profile icons out of the picker', () => {
    expect(rasterIconPickerOptions.map(({ name }) => name)).not.toContain('footer')
    expect(rasterIconPickerOptions.map(({ name }) => name)).not.toContain('profile')
  })
})
