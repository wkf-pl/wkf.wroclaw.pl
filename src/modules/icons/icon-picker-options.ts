import {
  rasterIconDefinitions,
  type RasterIconCategory,
  type SelectableRasterIconName,
} from '@/modules/icons/icon-registry'

export type RasterIconPickerOption = {
  category: Exclude<RasterIconCategory, 'internal'>
  keywords: string
  label: string
  name: SelectableRasterIconName
  value: SelectableRasterIconName
}

export const rasterIconPickerOptions: RasterIconPickerOption[] = rasterIconDefinitions
  .filter((definition) => definition.selectable)
  .map((definition) => ({
    category: definition.category,
    keywords: definition.keywords.join(' '),
    label: definition.label,
    name: definition.name,
    value: definition.name,
  }))

export function matchesRasterIconSearch(option: RasterIconPickerOption, search: string): boolean {
  const normalizedSearch = search.trim().toLocaleLowerCase('pl')
  return `${option.label} ${option.name} ${option.keywords}`
    .toLocaleLowerCase('pl')
    .includes(normalizedSearch)
}
