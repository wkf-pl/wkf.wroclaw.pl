import type { Block } from 'payload'

import { createContentSurfaceFields } from '@/modules/content/content-surface'

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
      name: 'frame',
      type: 'select',
      admin: { isClearable: false },
      defaultValue: 'outline',
      label: 'Ramka',
      options: [
        { label: 'Obrys', value: 'outline' },
        { label: 'Bez ramki', value: 'none' },
      ],
      required: true,
    },
    {
      name: 'sections',
      type: 'array',
      admin: {
        components: {
          RowLabel: '/components/admin/DynamicRowLabel#SectionGroupSectionRowLabel',
        },
        initCollapsed: true,
      },
      fields: [
        ...createContentSurfaceFields(),
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
  interfaceName: 'SectionGroupBlock',
  labels: {
    plural: 'Grupy sekcji',
    singular: 'Grupa sekcji',
  },
}
