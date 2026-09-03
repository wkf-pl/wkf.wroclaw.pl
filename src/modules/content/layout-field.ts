import type { Field } from 'payload'

import { ColumnLayoutBlock, contentLeafBlocks } from '@/blocks'

const emptyRichTextDocument = {
  root: {
    children: [
      {
        children: [],
        direction: null,
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        type: 'paragraph' as const,
        version: 1,
      },
    ],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    type: 'root' as const,
    version: 1,
  },
}

export function createContentLayoutField(label: string): Field {
  return {
    name: 'layout',
    type: 'blocks',
    admin: {
      initCollapsed: false,
    },
    blocks: [...contentLeafBlocks, ColumnLayoutBlock],
    defaultValue: [
      {
        blockType: 'richText',
        content: emptyRichTextDocument,
      },
    ],
    label,
    labels: {
      plural: 'Bloki treści',
      singular: 'blok treści',
    },
    minRows: 1,
    required: true,
  }
}
