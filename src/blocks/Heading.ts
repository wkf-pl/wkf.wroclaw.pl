import type { Block } from 'payload'

import { createContentHeadingFields } from '@/modules/content/content-presentation'

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
  fields: createContentHeadingFields({ requireContent: true }),
  interfaceName: 'HeadingBlock',
  labels: {
    plural: 'Nagłówki',
    singular: 'Nagłówek',
  },
}
