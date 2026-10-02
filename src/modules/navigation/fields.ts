import type { Field, Validate } from 'payload'

import { rasterIconDefinitions, type SelectableRasterIconName } from '@/modules/icons/icon-registry'

import { normalizeCustomAddress, validateCustomAddress } from './custom-target'

type NavigationSiblingData = {
  appearance?: unknown
  iconName?: unknown
  label?: unknown
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

function isNotSiteContactTarget(_data: unknown, siblingData: NavigationSiblingData): boolean {
  return siblingData.targetType !== 'siteContactEmail'
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
  includeSiteContactEmail = false,
  openInNewTabFieldName = 'openInNewTab',
}: {
  compactDatabaseNames?: boolean
  includeLabel?: boolean
  includePartner?: boolean
  includeSiteContactEmail?: boolean
  openInNewTabFieldName?: 'newTab' | 'openInNewTab'
} = {}): Field[] {
  const databaseName = (name: string): string | undefined =>
    compactDatabaseNames ? name : undefined
  const targetTypeOptions = [
    { label: 'Własny adres', value: 'custom' },
    { label: 'Cykl wydarzeń', value: 'eventCycle' },
    { label: 'Dokument', value: 'document' },
    { label: 'Kategoria', value: 'category' },
    ...(includePartner ? [{ label: 'Partner', value: 'partner' }] : []),
    ...(includeSiteContactEmail
      ? [{ label: 'Główny adres serwisu', value: 'siteContactEmail' }]
      : []),
    { label: 'Strona', value: 'page' },
    { label: 'Tag', value: 'tag' },
    { label: 'Wpis', value: 'post' },
    { label: 'Wydarzenie', value: 'event' },
  ].sort((first, second) => first.label.localeCompare(second.label, 'pl'))

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
          options: targetTypeOptions,
          required: true,
        },
        {
          name: 'eventCycle',
          type: 'relationship',
          ...(compactDatabaseNames ? { dbName: 'cycle' } : {}),
          relationTo: 'event-cycles',
          label: 'Cykl wydarzeń',
          admin: { condition: isTarget('eventCycle'), width: '50%' },
          filterOptions: { _status: { equals: 'published' } },
          validate: validateTarget('eventCycle', 'Wybierz cykl docelowy.'),
        },
        {
          name: 'document',
          type: 'relationship',
          ...(compactDatabaseNames ? { dbName: 'doc' } : {}),
          relationTo: 'documents',
          label: 'Dokument',
          admin: { condition: isTarget('document'), width: '50%' },
          filterOptions: { _status: { equals: 'published' } },
          validate: validateTarget('document', 'Wybierz dokument docelowy.'),
        },
        {
          name: 'category',
          type: 'relationship',
          ...(compactDatabaseNames ? { dbName: 'cat' } : {}),
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
                ...(compactDatabaseNames ? { dbName: 'partner' } : {}),
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
          ...(compactDatabaseNames ? { dbName: 'page' } : {}),
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
          ...(compactDatabaseNames ? { dbName: 'tag' } : {}),
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
          ...(compactDatabaseNames ? { dbName: 'post' } : {}),
          relationTo: 'posts',
          label: 'Wpis',
          admin: { condition: isTarget('post'), width: '50%' },
          filterOptions: { _status: { equals: 'published' } },
          validate: validateTarget('post', 'Wybierz wpis docelowy.'),
        },
        {
          name: 'event',
          type: 'relationship',
          ...(compactDatabaseNames ? { dbName: 'event' } : {}),
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
    ...(includeSiteContactEmail
      ? ([
          {
            type: 'row',
            fields: [
              {
                name: 'emailSubject',
                type: 'text',
                admin: { condition: isTarget('siteContactEmail'), width: '50%' },
                label: 'Temat wiadomości',
              },
              {
                name: 'emailBody',
                type: 'textarea',
                admin: { condition: isTarget('siteContactEmail'), width: '50%' },
                label: 'Treść wiadomości',
              },
            ],
          },
        ] satisfies Field[])
      : []),
    {
      name: openInNewTabFieldName,
      type: 'checkbox',
      admin: {
        ...(includeSiteContactEmail ? { condition: isNotSiteContactTarget } : {}),
      },
      defaultValue: false,
      label: 'Otwórz w nowej karcie',
    },
  ]
}

export function createIconFields({
  required = false,
  requiredWhenLabelEmpty = false,
}: {
  required?: boolean
  requiredWhenLabelEmpty?: boolean
} = {}): Field[] {
  const iconIsRequired = (siblingData: NavigationSiblingData) =>
    required ||
    (requiredWhenLabelEmpty && (typeof siblingData.label !== 'string' || !siblingData.label.trim()))
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
      },
      label: 'Ikona',
      options: [...iconNameOptions],
      validate: validateIconName,
    },
  ]
}

export const presentedLinkAppearanceOptions = [
  { label: 'Odnośnik', value: 'link' },
  { label: 'Przycisk główny', value: 'primaryButton' },
  { label: 'Przycisk dodatkowy', value: 'secondaryButton' },
] as const

const validatePresentedLinkLabel: Validate<unknown, unknown, NavigationSiblingData> = (
  value,
  { siblingData },
) => {
  const label = typeof value === 'string' ? value.trim() : ''
  return label || siblingData.iconName ? true : 'Podaj tekst albo wybierz ikonę.'
}

export function createPresentedLinkFields({
  compactDatabaseNames = false,
  defaultAppearance = 'link',
  includeSiteContactEmail = false,
}: {
  compactDatabaseNames?: boolean
  defaultAppearance?: 'link' | 'primaryButton' | 'secondaryButton'
  includeSiteContactEmail?: boolean
} = {}): Field[] {
  const databaseName = (name: string): string | undefined =>
    compactDatabaseNames ? name : undefined

  return [
    {
      type: 'row',
      fields: [
        {
          name: 'label',
          type: 'text',
          admin: {
            description:
              'Pozostaw puste tylko wtedy, gdy odnośnik ma być samą ikoną. Nazwa dostępna zostanie utworzona z celu odnośnika.',
            width: '50%',
          },
          label: 'Tekst',
          validate: validatePresentedLinkLabel,
        },
        {
          name: 'appearance',
          type: 'select',
          admin: { isClearable: false, width: '50%' },
          ...(compactDatabaseNames ? { dbName: databaseName('appearance') } : {}),
          defaultValue: defaultAppearance,
          label: 'Wygląd',
          options: [...presentedLinkAppearanceOptions],
          required: true,
        },
      ],
    },
    ...createIconFields({ requiredWhenLabelEmpty: true }),
    ...createLinkFields({
      compactDatabaseNames,
      includeLabel: false,
      includeSiteContactEmail,
    }),
  ]
}

export function validatePresentedLinkItems(value: unknown): true | string {
  if (!Array.isArray(value)) {
    return true
  }

  const primaryButtonCount = value.filter(
    (item) =>
      item &&
      typeof item === 'object' &&
      'appearance' in item &&
      item.appearance === 'primaryButton',
  ).length

  return primaryButtonCount <= 1
    ? true
    : 'W jednej grupie może znajdować się najwyżej jeden przycisk główny.'
}
