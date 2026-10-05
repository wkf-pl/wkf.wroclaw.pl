import type { Block } from 'payload'

import { createContentPresentationFields } from '@/modules/content/content-presentation'

import { ColumnLayoutBlock } from './ColumnLayout'
import { contentLeafBlocks } from './contentLeafBlocks'

export const SectionGroupBlock: Block = {
  slug: 'sectionGroup',
  admin: {
    components: {
      Label: '/components/admin/ContentBlockLabel#SectionGroupBlockLabel',
    },
    disableBlockName: true,
    group: 'Układ',
    images: {
      thumbnail: {
        alt: 'Schematyczna ikona sekcji objętych wspólną ramką',
        url: '/assets/block-thumbnails/section-group.png',
      },
    },
  },
  fields: [
    {
      admin: {
        components: {
          Field: '/components/admin/TabbedLayoutField#SectionGroupTabsField',
        },
      },
      type: 'group',
      fields: [
        ...createContentPresentationFields(),
        {
          name: 'sections',
          type: 'array',
          fields: [
            ...createContentPresentationFields(),
            {
              name: 'blocks',
              type: 'blocks',
              admin: { initCollapsed: false },
              blocks: [...contentLeafBlocks, ColumnLayoutBlock],
              label: 'Bloki sekcji',
              labels: {
                plural: 'Bloki sekcji',
                singular: 'blok sekcji',
              },
              minRows: 1,
              required: true,
            },
          ],
          label: 'Sekcje',
          labels: {
            plural: 'Sekcje',
            singular: 'sekcję',
          },
          maxRows: 8,
          minRows: 1,
          required: true,
        },
      ],
    },
  ],
  interfaceName: 'SectionGroupBlock',
  labels: {
    plural: 'Grupy sekcji',
    singular: 'Grupa sekcji',
  },
}
