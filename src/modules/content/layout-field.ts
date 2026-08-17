import type { Field } from 'payload'

import {
  AttachmentsBlock,
  ListingBlock,
  MediaGalleryBlock,
  MemberProfilesBlock,
  RichTextBlock,
} from '@/blocks'

const emptyRichTextDocument = {
  root: {
    children: [],
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
    blocks: [RichTextBlock, ListingBlock, MediaGalleryBlock, AttachmentsBlock, MemberProfilesBlock],
    defaultValue: [
      {
        blockType: 'richText',
        content: emptyRichTextDocument,
      },
    ],
    label,
    minRows: 1,
    required: true,
  }
}
