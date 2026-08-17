import type { Block } from 'payload'

export const RichTextBlock: Block = {
  slug: 'richText',
  admin: {
    components: {
      Label: '/components/admin/ContentBlockLabel#RichTextBlockLabel',
    },
    disableBlockName: true,
  },
  fields: [
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
