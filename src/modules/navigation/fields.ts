import type { Field, Validate } from 'payload'

import { rasterIconDefinitions, type SelectableRasterIconName } from '@/modules/icons/icon-registry'

import { normalizeCustomAddress, validateCustomAddress } from './custom-target'

type NavigationSiblingData = {
  appearance?: unknown
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

export function usesIconAppearance(_data: unknown, siblingData: NavigationSiblingData): boolean {
  return siblingData.appearance === 'icon'
}

export const iconNameOptions: { label: string; value: SelectableRasterIconName }[] =
  rasterIconDefinitions
    .filter((definition) => definition.selectable)
    .map(({ label, name }) => ({ label, value: name }))
    .sort((first, second) => first.label.localeCompare(second.label, 'pl'))

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
  includeLabel = true,
  includePartner = true,
  openInNewTabFieldName = 'openInNewTab',
}: {
  compactDatabaseNames?: boolean
  includeLabel?: boolean
  includePartner?: boolean
  openInNewTabFieldName?: 'newTab' | 'openInNewTab'
} = {}): Field[] {
  const databaseName = (name: string): string | undefined =>
    compactDatabaseNames ? name : undefined

  return [
    ...(includeLabel
      ? ([
          {
            name: 'label',
            type: 'text',
            label: 'Etykieta',
            required: true,
          },
        ] satisfies Field[])
      : []),
    {
      type: 'row',
      fields: [
        {
          name: 'targetType',
          type: 'select',
          admin: { isClearable: false, width: '50%' },
          dbName: databaseName('target'),
          defaultValue: 'custom',
          label: 'Cel odnośnika',
          options: [
            { label: 'Własny adres', value: 'custom' },
            { label: 'Cykl wydarzeń', value: 'eventCycle' },
            { label: 'Dokument', value: 'document' },
            { label: 'Kategoria', value: 'category' },
            ...(includePartner ? [{ label: 'Partner', value: 'partner' }] : []),
            { label: 'Strona', value: 'page' },
            { label: 'Tag', value: 'tag' },
            { label: 'Wpis', value: 'post' },
            { label: 'Wydarzenie', value: 'event' },
          ],
          required: true,
        },
        {
          name: 'eventCycle',
          type: 'relationship',
          relationTo: 'event-cycles',
          label: 'Cykl wydarzeń',
          admin: { condition: isTarget('eventCycle'), width: '50%' },
          filterOptions: { _status: { equals: 'published' } },
          validate: validateTarget('eventCycle', 'Wybierz cykl docelowy.'),
        },
        {
          name: 'document',
          type: 'relationship',
          relationTo: 'documents',
          label: 'Dokument',
          admin: { condition: isTarget('document'), width: '50%' },
          filterOptions: { _status: { equals: 'published' } },
          validate: validateTarget('document', 'Wybierz dokument docelowy.'),
        },
        {
          name: 'category',
          type: 'relationship',
          admin: {
            condition: isCategoryTarget,
            placeholder: '<brak>',
            width: '50%',
          },
          label: 'Kategoria',
          relationTo: 'categories',
          validate: validateCategoryTarget,
        },
        ...(includePartner
          ? ([
              {
                name: 'partner',
                type: 'relationship',
                relationTo: 'partners',
                label: 'Partner',
                admin: { condition: isTarget('partner'), width: '50%' },
                filterOptions: { _status: { equals: 'published' } },
                validate: validateTarget('partner', 'Wybierz Partnera docelowego.'),
              },
            ] satisfies Field[])
          : []),
        {
          name: 'page',
          type: 'relationship',
          admin: {
            condition: isPageTarget,
            width: '50%',
          },
          filterOptions: {
            _status: { equals: 'published' },
          },
          label: 'Strona',
          relationTo: 'pages',
          validate: validatePageTarget,
        },
        {
          name: 'tag',
          type: 'relationship',
          admin: {
            condition: isTagTarget,
            placeholder: '<brak>',
            width: '50%',
          },
          label: 'Tag',
          relationTo: 'tags',
          validate: validateTagTarget,
        },
        {
          name: 'post',
          type: 'relationship',
          relationTo: 'posts',
          label: 'Wpis',
          admin: { condition: isTarget('post'), width: '50%' },
          filterOptions: { _status: { equals: 'published' } },
          validate: validateTarget('post', 'Wybierz wpis docelowy.'),
        },
        {
          name: 'event',
          type: 'relationship',
          relationTo: 'events',
          label: 'Wydarzenie',
          admin: { condition: isTarget('event'), width: '50%' },
          filterOptions: { _status: { equals: 'published' } },
          validate: validateTarget('event', 'Wybierz wydarzenie docelowe.'),
        },
      ],
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
      name: openInNewTabFieldName,
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
  const validateIconName: Validate<unknown, unknown, NavigationSiblingData> = (
    value,
    { siblingData },
  ) => (!iconIsRequired(siblingData) || value ? true : 'Wybierz ikonę.')

  return [
    {
      name: 'iconName',
      type: 'select',
      admin: {
        components: {
          Field: '/components/admin/RasterIconPickerField#RasterIconPickerField',
        },
        condition: showWhenAppearanceIcon ? usesIconAppearance : undefined,
      },
      label: 'Ikona',
      options: [...iconNameOptions],
      validate: validateIconName,
    },
  ]
}
