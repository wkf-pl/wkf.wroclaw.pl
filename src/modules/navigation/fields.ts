import type { Field, Validate } from 'payload'

import type { SystemIconName } from './icon-names'

type NavigationSiblingData = {
  appearance?: unknown
  iconSource?: unknown
  targetType?: unknown
}

export function isCustomTarget(_data: unknown, siblingData: NavigationSiblingData): boolean {
  return siblingData.targetType === 'custom'
}

export function isPageTarget(_data: unknown, siblingData: NavigationSiblingData): boolean {
  return siblingData.targetType === 'page'
}

export function usesCustomIcon(_data: unknown, siblingData: NavigationSiblingData): boolean {
  return siblingData.iconSource === 'media'
}

export function usesSystemIcon(_data: unknown, siblingData: NavigationSiblingData): boolean {
  return siblingData.iconSource === 'system'
}

export function usesIconAppearance(_data: unknown, siblingData: NavigationSiblingData): boolean {
  return siblingData.appearance === 'icon'
}

export const systemIconOptions: { label: string; value: SystemIconName }[] = [
  { label: 'Książka', value: 'book' },
  { label: 'Kalendarz', value: 'calendar' },
  { label: 'Kolekcja', value: 'collection' },
  { label: 'Kość', value: 'dice' },
  { label: 'Discord', value: 'discord' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'Lokalizacja', value: 'location' },
  { label: 'E-mail', value: 'mail' },
  { label: 'Pionek', value: 'pawn' },
  { label: 'Recenzja', value: 'review' },
  { label: 'Gwiazda', value: 'star' },
  { label: 'Czas', value: 'time' },
  { label: 'Użytkownicy', value: 'users' },
]

export const validateCustomURL: Validate<string | null | undefined> = (value) => {
  if (!value) {
    return true
  }

  const trimmedValue = value.trim()
  if (
    trimmedValue.startsWith('/') ||
    trimmedValue.startsWith('#') ||
    trimmedValue.startsWith('mailto:') ||
    trimmedValue.startsWith('tel:')
  ) {
    return true
  }

  try {
    const url = new URL(trimmedValue)
    return ['http:', 'https:'].includes(url.protocol)
      ? true
      : 'Adres musi używać protokołu HTTP lub HTTPS.'
  } catch {
    return 'Podaj ścieżkę, kotwicę, adres e-mail, telefon albo pełny adres HTTP(S).'
  }
}

export const validatePageTarget: Validate<unknown, unknown, NavigationSiblingData> = (
  value,
  { siblingData },
) => (siblingData.targetType !== 'page' || value ? true : 'Wybierz stronę docelową.')

export const validateCustomTarget: Validate<string, unknown, NavigationSiblingData> = (
  value,
  context,
) => {
  if (context.siblingData.targetType !== 'custom') {
    return true
  }

  return value ? validateCustomURL(value, context) : 'Podaj adres docelowy.'
}

export function createLinkFields(): Field[] {
  return [
    {
      name: 'label',
      type: 'text',
      label: 'Etykieta',
      required: true,
    },
    {
      name: 'targetType',
      type: 'radio',
      defaultValue: 'custom',
      label: 'Cel odnośnika',
      options: [
        { label: 'Strona w serwisie', value: 'page' },
        { label: 'Własny adres', value: 'custom' },
      ],
      required: true,
    },
    {
      name: 'page',
      type: 'relationship',
      admin: {
        condition: isPageTarget,
      },
      filterOptions: {
        _status: { equals: 'published' },
      },
      label: 'Strona',
      relationTo: 'pages',
      validate: validatePageTarget,
    },
    {
      name: 'url',
      type: 'text',
      admin: {
        condition: isCustomTarget,
        description: 'Ścieżka, kotwica, mailto:, tel: albo pełny adres HTTP(S).',
      },
      label: 'Adres',
      validate: validateCustomTarget,
    },
    {
      name: 'openInNewTab',
      type: 'checkbox',
      defaultValue: false,
      label: 'Otwórz w nowej karcie',
    },
  ]
}

export function createIconFields({
  required = false,
  showWhenAppearanceIcon = false,
}: {
  required?: boolean
  showWhenAppearanceIcon?: boolean
} = {}): Field[] {
  const iconIsRequired = (siblingData: NavigationSiblingData) =>
    required || siblingData.appearance === 'icon'
  const validateIconSource: Validate<unknown, unknown, NavigationSiblingData> = (
    value,
    { siblingData },
  ) => (!iconIsRequired(siblingData) || value ? true : 'Wybierz źródło ikony.')
  const validateSystemIcon: Validate<unknown, unknown, NavigationSiblingData> = (
    value,
    { siblingData },
  ) =>
    !iconIsRequired(siblingData) || siblingData.iconSource !== 'system' || value
      ? true
      : 'Wybierz ikonę systemową.'
  const validateCustomIcon: Validate<unknown, unknown, NavigationSiblingData> = (
    value,
    { siblingData },
  ) =>
    !iconIsRequired(siblingData) || siblingData.iconSource !== 'media' || value
      ? true
      : 'Wybierz własną ikonę.'

  return [
    {
      name: 'iconSource',
      type: 'radio',
      admin: {
        condition: showWhenAppearanceIcon ? usesIconAppearance : undefined,
      },
      defaultValue: 'system',
      label: 'Źródło ikony',
      options: [
        { label: 'Ikona systemowa', value: 'system' },
        { label: 'Biblioteka Media', value: 'media' },
      ],
      validate: validateIconSource,
    },
    {
      name: 'systemIcon',
      type: 'select',
      admin: {
        condition: (data, siblingData) =>
          (!showWhenAppearanceIcon || usesIconAppearance(data, siblingData)) &&
          usesSystemIcon(data, siblingData),
      },
      label: 'Ikona',
      options: [...systemIconOptions],
      validate: validateSystemIcon,
    },
    {
      name: 'customIcon',
      type: 'upload',
      admin: {
        condition: (data, siblingData) =>
          (!showWhenAppearanceIcon || usesIconAppearance(data, siblingData)) &&
          usesCustomIcon(data, siblingData),
      },
      label: 'Własna ikona',
      filterOptions: {
        mimeType: { contains: 'image/' },
      },
      relationTo: 'media',
      validate: validateCustomIcon,
    },
  ]
}
