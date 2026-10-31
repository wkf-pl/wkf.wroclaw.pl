import type { Access, CollectionConfig } from 'payload'

import { createBooleanSwitchAdmin } from '@/components/admin/boolean-switch-config'
import { isPublicRequest } from '@/modules/content/public-access'
import { allListingSources } from '@/modules/content/listing-conditions'

const readContentListingItems: Access = ({ isReadingStaticFile, req }) =>
  isPublicRequest(req, isReadingStaticFile)

export const ContentListingItems: CollectionConfig = {
  slug: 'content-listing-items',
  access: {
    create: () => false,
    delete: () => false,
    read: readContentListingItems,
    update: () => false,
  },
  admin: { hidden: true },
  endpoints: false,
  fields: [
    {
      name: 'source',
      type: 'select',
      index: true,
      options: allListingSources.map((source) => ({ label: source, value: source })),
      required: true,
    },
    { name: 'sourceDocumentId', type: 'number', index: true, required: true },
    { name: 'sourceUpdatedAt', type: 'date', required: true },
    { name: 'title', type: 'text', index: true, required: true },
    { name: 'normalizedTitle', type: 'text', index: true, required: true },
    { name: 'tagSearchIndex', type: 'text', required: true },
    { name: 'url', type: 'text', required: true },
    { name: 'excerpt', type: 'textarea' },
    {
      name: 'hasSignificantDate',
      type: 'checkbox',
      admin: createBooleanSwitchAdmin(),
      defaultValue: false,
      index: true,
    },
    { name: 'significantDate', type: 'date', index: true },
    { name: 'eventStartAt', type: 'date', index: true },
    { name: 'eventEndAt', type: 'date', index: true },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    { name: 'category', type: 'relationship', relationTo: 'categories' },
    { name: 'tags', type: 'relationship', hasMany: true, relationTo: 'tags' },
    { name: 'parentPage', type: 'relationship', index: true, relationTo: 'pages' },
    { name: 'eventCycle', type: 'relationship', index: true, relationTo: 'event-cycles' },
  ],
  graphQL: false,
  indexes: [
    { fields: ['source', 'sourceDocumentId'], unique: true },
    { fields: ['source', 'significantDate'] },
    { fields: ['source', 'title'] },
  ],
  lockDocuments: false,
  timestamps: false,
}
