import type { Block } from 'payload'

import { createStyleField, createTextStyleOptions } from '@/modules/content/text-styles'
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
      leadingField: createStyleField({
        name: 'textStyle',
        admin: { width: '33.333%' },
        defaultValue: 'default',
        options: createTextStyleOptions({ basic: 'default', compact: 'note', basicFirst: true }),
      }),
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
