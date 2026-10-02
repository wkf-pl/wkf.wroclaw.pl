import type { Block } from 'payload'

import { createIconFields } from '@/modules/navigation/fields'

export const HeadingBlock: Block = {
  slug: 'heading',
  admin: {
    components: {
      Label: '/components/admin/ContentBlockLabel#HeadingBlockLabel',
    },
    disableBlockName: true,
    group: 'Elementy',
    images: {
      thumbnail: {
        alt: 'Schematyczna ikona nagłówka i krótkiej treści',
        url: '/assets/block-thumbnails/heading.png',
      },
    },
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'text',
          type: 'text',
          admin: { width: '66.666%' },
          label: 'Tekst',
          required: true,
        },
        {
          name: 'role',
          type: 'select',
          admin: { isClearable: false, width: '33.333%' },
          defaultValue: 'section',
          label: 'Rola',
          options: [
            { label: 'Nagłówek sekcji', value: 'section' },
            { label: 'Nagłówek elementu', value: 'item' },
          ],
          required: true,
        },
      ],
    },
    ...createIconFields(),
  ],
  interfaceName: 'HeadingBlock',
  labels: {
    plural: 'Nagłówki',
    singular: 'Nagłówek',
  },
}
