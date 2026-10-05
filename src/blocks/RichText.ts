import type { Block } from 'payload'

import { createContentPresentationFields } from '@/modules/content/content-presentation'

export const RichTextBlock: Block = {
  slug: 'richText',
  admin: {
    components: {
      Label: '/components/admin/ContentBlockLabel#RichTextBlockLabel',
    },
    disableBlockName: true,
    group: 'Treści',
    images: {
      thumbnail: {
        alt: 'Schematyczna ikona dokumentu z tekstem i piórem',
        url: '/assets/block-thumbnails/rich-text.png',
      },
    },
  },
  fields: [
    ...createContentPresentationFields({
      leadingField: {
        name: 'textStyle',
        type: 'select',
        admin: { isClearable: false, width: '33.333%' },
        defaultValue: 'default',
        label: 'Skala tekstu',
        options: [
          { label: 'Standardowa', value: 'default' },
          { label: 'Wprowadzenie', value: 'lead' },
          { label: 'Notatka', value: 'note' },
        ],
      },
    }),
    {
      name: 'content',
      type: 'richText',
      label: 'Treść',
      required: true,
    },
  ],
  interfaceName: 'RichTextBlock',
  labels: {
    plural: 'Bloki treści',
    singular: 'Treść',
  },
}
