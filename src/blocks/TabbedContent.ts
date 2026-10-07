import {
  APIError,
  type ArrayField,
  type ArrayFieldValidation,
  type Block,
  type FieldHook,
} from 'payload'

import { createSiteMenuLinkFields, validatePresentedLinkItems } from '@/modules/navigation/fields'

import { ColumnLayoutBlock } from './ColumnLayout'
import { contentLeafBlocks } from './contentLeafBlocks'

type MenuFieldName = 'footerItems' | 'headerLeftItems' | 'headerRightItems'

const minimumTabCount = 2
const maximumTabCount = 8

function getTabCountValidationError(value: unknown): string | undefined {
  return !Array.isArray(value) || value.length < minimumTabCount || value.length > maximumTabCount
    ? 'Blok musi zawierać od 2 do 8 zakładek.'
    : undefined
}

export const validateTabbedContentTabs: ArrayFieldValidation = (value) =>
  getTabCountValidationError(value) ?? true

const enforceTabbedContentTabs: FieldHook = ({ value }) => {
  const validationError = getTabCountValidationError(value)
  if (validationError) throw new APIError(validationError, 400)
  return value
}

function createMenuField(name: MenuFieldName, label: string): ArrayField {
  return {
    name,
    type: 'array',
    admin: {
      components: {
        RowLabel: '/components/admin/DynamicRowLabel#NavigationItemRowLabel',
      },
      initCollapsed: true,
    },
    fields: createSiteMenuLinkFields({ compactDatabaseNames: true }),
    label,
    labels: {
      plural: 'Pozycje menu',
      singular: 'pozycję menu',
    },
    validate: validatePresentedLinkItems,
  }
}

export const TabbedContentBlock: Block = {
  slug: 'tabs',
  admin: {
    components: {
      Label: '/components/admin/ContentBlockLabel#TabbedContentBlockLabel',
    },
    disableBlockName: true,
    group: 'Układ',
    images: {
      thumbnail: {
        alt: 'Schematyczna ikona treści przełączanej zakładkami',
        url: '/assets/block-thumbnails/section-group.png',
      },
    },
  },
  fields: [
    {
      admin: {
        components: {
          Field: '/components/admin/TabbedLayoutField#TabbedContentTabsField',
        },
      },
      type: 'group',
      fields: [
        createMenuField('headerLeftItems', 'Menu po lewej stronie nagłówka'),
        createMenuField('headerRightItems', 'Menu po prawej stronie nagłówka'),
        createMenuField('footerItems', 'Menu w stopce'),
        {
          name: 'footerAlignment',
          type: 'select',
          admin: {
            condition: (_, siblingData) =>
              Array.isArray(siblingData.footerItems) && siblingData.footerItems.length > 0,
            isClearable: false,
          },
          defaultValue: 'center',
          label: 'Wyrównanie menu w stopce',
          options: [
            { label: 'Do lewej', value: 'start' },
            { label: 'Do środka', value: 'center' },
            { label: 'Do prawej', value: 'end' },
          ],
          required: true,
        },
        {
          name: 'tabs',
          type: 'array',
          admin: {
            components: {
              RowLabel: '/components/admin/DynamicRowLabel#TabbedContentTabRowLabel',
            },
            initCollapsed: false,
          },
          defaultValue: [
            { blocks: [], label: 'Najbliższe' },
            { blocks: [], label: 'Kalendarz' },
          ],
          hooks: {
            beforeValidate: [enforceTabbedContentTabs],
          },
          fields: [
            {
              name: 'label',
              type: 'text',
              label: 'Nazwa zakładki',
              required: true,
            },
            {
              name: 'blocks',
              type: 'blocks',
              admin: { initCollapsed: false },
              blocks: [...contentLeafBlocks, ColumnLayoutBlock],
              label: 'Treść zakładki',
              labels: {
                plural: 'Bloki treści',
                singular: 'blok treści',
              },
            },
          ],
          label: 'Zakładki',
          labels: {
            plural: 'Zakładki',
            singular: 'zakładkę',
          },
          maxRows: maximumTabCount,
          minRows: minimumTabCount,
          required: true,
          validate: validateTabbedContentTabs,
        },
      ],
    },
  ],
  interfaceName: 'TabbedContentBlock',
  labels: {
    plural: 'Treści w zakładkach',
    singular: 'Treść w zakładkach',
  },
}
