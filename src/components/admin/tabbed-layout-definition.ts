import type { Validate } from 'payload'

export const totalColumnWidth = 12

export type LayoutKind = 'columns' | 'sections' | 'tabs'

export type LayoutDefinition = {
  addLabel: string
  arrayName: 'columns' | 'sections' | 'tabs'
  itemAccusative: 'kolumnę' | 'sekcję' | 'zakładkę'
  itemLabel: 'Kolumna' | 'Sekcja' | 'Zakładka'
  kind: LayoutKind
  maximumRows: number
  minimumRows: number
  rootTabLabel: string
  tabListLabel: string
}

export const layoutDefinitions: Record<LayoutKind, LayoutDefinition> = {
  columns: {
    addLabel: 'Dodaj kolumnę',
    arrayName: 'columns',
    itemAccusative: 'kolumnę',
    itemLabel: 'Kolumna',
    kind: 'columns',
    maximumRows: 4,
    minimumRows: 2,
    rootTabLabel: 'Prezentacja',
    tabListLabel: 'Ustawienia układu kolumnowego',
  },
  sections: {
    addLabel: 'Dodaj sekcję',
    arrayName: 'sections',
    itemAccusative: 'sekcję',
    itemLabel: 'Sekcja',
    kind: 'sections',
    maximumRows: 8,
    minimumRows: 1,
    rootTabLabel: 'Prezentacja',
    tabListLabel: 'Ustawienia grupy sekcji',
  },
  tabs: {
    addLabel: 'Dodaj zakładkę',
    arrayName: 'tabs',
    itemAccusative: 'zakładkę',
    itemLabel: 'Zakładka',
    kind: 'tabs',
    maximumRows: 8,
    minimumRows: 2,
    rootTabLabel: 'Prezentacja',
    tabListLabel: 'Ustawienia zakładek',
  },
}

export function getClientValidation(definition: LayoutDefinition): Validate {
  if (definition.kind === 'sections') {
    return (value) =>
      Array.isArray(value) &&
      value.length >= definition.minimumRows &&
      value.length <= definition.maximumRows
        ? true
        : 'Grupa sekcji musi zawierać od 1 do 8 sekcji.'
  }

  if (definition.kind === 'tabs') {
    return (value) =>
      Array.isArray(value) &&
      value.length >= definition.minimumRows &&
      value.length <= definition.maximumRows
        ? true
        : 'Blok musi zawierać od 2 do 8 zakładek.'
  }

  return (value) => {
    if (
      !Array.isArray(value) ||
      value.length < definition.minimumRows ||
      value.length > definition.maximumRows
    ) {
      return 'Układ kolumnowy musi zawierać od 2 do 4 kolumn.'
    }

    const widths = value.map((column) =>
      column && typeof column === 'object' && 'width' in column ? column.width : undefined,
    )
    return getColumnWidthError(widths) ?? true
  }
}

export function getColumnWidthError(widths: readonly unknown[]): string | undefined {
  if (widths.some((width) => !Number.isInteger(width) || Number(width) < 2 || Number(width) > 10)) {
    return 'Szerokość każdej kolumny musi być liczbą całkowitą od 2 do 10.'
  }

  if (widths.reduce<number>((sum, width) => sum + Number(width), 0) !== totalColumnWidth) {
    return 'Szerokości kolumn muszą sumować się do 12.'
  }
}
