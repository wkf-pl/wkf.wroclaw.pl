import type { Block } from 'payload'

import { webRasterImageMimeTypes } from '@/modules/media/media-categories'
import { createPresentedLinkFields, validatePresentedLinkItems } from '@/modules/navigation/fields'

export const CardBlock: Block = {
  slug: 'card',
  admin: {
    components: {
      Label: '/components/admin/ContentBlockLabel#CardBlockLabel',
    },
    disableBlockName: true,
    group: 'Elementy',
    images: {
      thumbnail: {
        alt: 'Schematyczna ikona karty z obrazem i odnośnikami',
        url: '/assets/block-thumbnails/listing.png',
      },
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Tytuł',
      required: true,
    },
    {
      name: 'destinationPage',
      type: 'relationship',
      filterOptions: { _status: { equals: 'published' } },
      label: 'Strona docelowa tytułu',
      relationTo: 'pages',
    },
    {
      name: 'image',
      type: 'upload',
      filterOptions: { mimeType: { in: [...webRasterImageMimeTypes] } },
      label: 'Obraz',
      relationTo: 'media',
    },
    {
      name: 'links',
      type: 'array',
      admin: {
        components: {
          RowLabel: '/components/admin/DynamicRowLabel#PresentedLinkRowLabel',
        },
        initCollapsed: true,
      },
      fields: createPresentedLinkFields({
        compactDatabaseNames: true,
        includeSiteContactEmail: true,
      }),
      label: 'Odnośniki',
      labels: {
        plural: 'Odnośniki',
        singular: 'odnośnik',
      },
      validate: validatePresentedLinkItems,
    },
  ],
  interfaceName: 'CardBlock',
  labels: {
    plural: 'Karty',
    singular: 'Karta',
  },
}
