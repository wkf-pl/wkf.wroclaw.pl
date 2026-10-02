import type { Block } from 'payload'

import { createPresentedLinkFields, validatePresentedLinkItems } from '@/modules/navigation/fields'

export const ActionLinksBlock: Block = {
  slug: 'actionLinks',
  admin: {
    components: {
      Label: '/components/admin/ContentBlockLabel#ActionLinksBlockLabel',
    },
    disableBlockName: true,
    group: 'Elementy',
    images: {
      thumbnail: {
        alt: 'Schematyczna ikona przycisków i odnośnika akcji',
        url: '/assets/block-thumbnails/action-links.png',
      },
    },
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'layout',
          type: 'select',
          admin: { isClearable: false, width: '50%' },
          defaultValue: 'inline',
          label: 'Układ',
          options: [
            { label: 'W jednym wierszu', value: 'inline' },
            { label: 'Jeden pod drugim', value: 'stacked' },
          ],
          required: true,
        },
        {
          name: 'alignment',
          type: 'select',
          admin: { isClearable: false, width: '50%' },
          defaultValue: 'start',
          label: 'Wyrównanie',
          options: [
            { label: 'Do początku', value: 'start' },
            { label: 'Do środka', value: 'center' },
            { label: 'Do końca', value: 'end' },
          ],
          required: true,
        },
      ],
    },
    {
      name: 'items',
      type: 'array',
      admin: {
        components: {
          RowLabel: '/components/admin/DynamicRowLabel#PresentedLinkRowLabel',
        },
        initCollapsed: true,
      },
      fields: createPresentedLinkFields({
        compactDatabaseNames: true,
        includeSiteContactEmail: true,
      }),
      label: 'Odnośniki',
      labels: {
        plural: 'Odnośniki',
        singular: 'odnośnik',
      },
      maxRows: 3,
      minRows: 1,
      required: true,
      validate: validatePresentedLinkItems,
    },
  ],
  interfaceName: 'ActionLinksBlock',
  labels: {
    plural: 'Odnośniki akcji',
    singular: 'Odnośniki akcji',
  },
}
