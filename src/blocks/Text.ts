import {
  BoldFeature,
  FixedToolbarFeature,
  ItalicFeature,
  lexicalEditor,
  ParagraphFeature,
  SubscriptFeature,
  SuperscriptFeature,
  UnderlineFeature,
} from '@payloadcms/richtext-lexical'
import type { Block } from 'payload'

import { createStyleField, createTextStyleOptions } from '@/modules/content/text-styles'

export const FieldRowTextBlock: Block = {
  slug: 'fieldRowText',
  admin: {
    components: {
      Label: '/components/admin/PageTemplateFields#FieldRowTextBlockLabel',
    },
    disableBlockName: true,
    group: 'Elementy',
    images: {
      thumbnail: {
        alt: 'Krótki tekst',
        url: '/assets/block-thumbnails/rich-text.png',
      },
    },
  },
  fields: [
    createStyleField({
      name: 'style',
      defaultValue: 'plain',
      options: createTextStyleOptions({ basic: 'plain', compact: 'compact' }),
    }),
    {
      name: 'text',
      type: 'richText',
      editor: lexicalEditor({
        features: () => [
          ParagraphFeature(),
          BoldFeature(),
          ItalicFeature(),
          UnderlineFeature(),
          SuperscriptFeature(),
          SubscriptFeature(),
          FixedToolbarFeature(),
        ],
      }),
      label: 'Tekst',
      required: true,
    },
  ],
  interfaceName: 'FieldRowTextBlock',
  labels: { plural: 'Teksty', singular: 'Tekst' },
}
