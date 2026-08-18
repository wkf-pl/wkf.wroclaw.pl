import type { Field, Validate } from 'payload'

import { normalizeCustomAddress, validateCustomAddress } from './custom-target'
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

export function isCategoryTarget(_data: unknown, siblingData: NavigationSiblingData): boolean {
  return siblingData.targetType === 'category'
}

export function isTagTarget(_data: unknown, siblingData: NavigationSiblingData): boolean {
  return siblingData.targetType === 'tag'
}

function isTarget(type: string) {
  return (_data: unknown, siblingData: NavigationSiblingData) => siblingData.targetType === type
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
  { label: 'Czas', value: 'time' },
  { label: 'Discord', value: 'discord' },
  { label: 'E-mail', value: 'mail' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'Gwiazda', value: 'star' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'Kalendarz', value: 'calendar' },
  { label: 'Kolekcja', value: 'collection' },
  { label: 'Kość', value: 'dice' },
  { label: 'Książka', value: 'book' },
  { label: 'Lokalizacja', value: 'location' },
  { label: 'Pionek', value: 'pawn' },
  { label: 'Recenzja', value: 'review' },
  { label: 'Slack', value: 'slack' },
  { label: 'Użytkownicy', value: 'users' },
]

export const validatePageTarget: Validate<unknown, unknown, NavigationSiblingData> = (
  value,
  { siblingData },
) => (siblingData.targetType !== 'page' || value ? true : 'Wybierz stronę docelową.')

export const validateCategoryTarget: Validate<unknown, unknown, NavigationSiblingData> = (
  value,
  { siblingData },
) => (siblingData.targetType !== 'category' || value ? true : 'Wybierz kategorię docelową.')

export const validateTagTarget: Validate<unknown, unknown, NavigationSiblingData> = (
  value,
  { siblingData },
) => (siblingData.targetType !== 'tag' || value ? true : 'Wybierz tag docelowy.')

function validateTarget(
  type: string,
  message: string,
): Validate<unknown, unknown, NavigationSiblingData> {
  return (value, { siblingData }) => (siblingData.targetType !== type || value ? true : message)
}

export function createLinkFields({
  compactDatabaseNames = false,
}: { compactDatabaseNames?: boolean } = {}): Field[] {
  const databaseName = (name: string): string | undefined =>
    compactDatabaseNames ? name : undefined

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
      dbName: databaseName('target'),
      defaultValue: 'custom',
      label: 'Cel odnośnika',
      options: [
        { label: 'Strona', value: 'page' },
        { label: 'Kategoria', value: 'category' },
        { label: 'Tag', value: 'tag' },
        { label: 'Wydarzenie', value: 'event' },
        { label: 'Cykl wydarzeń', value: 'eventCycle' },
        { label: 'Partner', value: 'partner' },
        { label: 'Własny adres', value: 'custom' },
      ],
      required: true,
    },
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      label: 'Wydarzenie',
      admin: { condition: isTarget('event') },
      filterOptions: { _status: { equals: 'published' } },
      validate: validateTarget('event', 'Wybierz wydarzenie docelowe.'),
    },
    {
      name: 'eventCycle',
      type: 'relationship',
      relationTo: 'event-cycles',
      label: 'Cykl wydarzeń',
      admin: { condition: isTarget('eventCycle') },
      filterOptions: { _status: { equals: 'published' } },
      validate: validateTarget('eventCycle', 'Wybierz cykl docelowy.'),
    },
    {
      name: 'partner',
      type: 'relationship',
      relationTo: 'partners',
      label: 'Partner',
      admin: { condition: isTarget('partner') },
      filterOptions: { _status: { equals: 'published' } },
      validate: validateTarget('partner', 'Wybierz Partnera docelowego.'),
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
      name: 'category',
      type: 'relationship',
      admin: {
        condition: isCategoryTarget,
        placeholder: '<brak>',
      },
      label: 'Kategoria',
      relationTo: 'categories',
      validate: validateCategoryTarget,
    },
    {
      name: 'tag',
      type: 'relationship',
      admin: {
        condition: isTagTarget,
        placeholder: '<brak>',
      },
      label: 'Tag',
      relationTo: 'tags',
      validate: validateTagTarget,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'customScheme',
          type: 'select',
          dbName: databaseName('scheme'),
          admin: {
            condition: isCustomTarget,
            isClearable: false,
            width: '25%',
          },
          defaultValue: 'https',
          label: 'Schemat',
          options: [
            { label: 'https://', value: 'https' },
            { label: 'http://', value: 'http' },
            { label: 'mailto:', value: 'mailto' },
            { label: 'tel:', value: 'tel' },
            { label: '/', value: 'path' },
            { label: '#', value: 'anchor' },
          ],
        },
        {
          name: 'customAddress',
          type: 'text',
          admin: {
            components: {
              Field: '/components/admin/CustomAddressField#CustomAddressField',
            },
            condition: isCustomTarget,
            description: 'Możesz wkleić pełny adres — schemat zostanie rozpoznany automatycznie.',
            width: '75%',
          },
          hooks: {
            beforeValidate: [normalizeCustomAddress],
          },
          label: 'Adres',
          validate: validateCustomAddress,
        },
      ],
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
