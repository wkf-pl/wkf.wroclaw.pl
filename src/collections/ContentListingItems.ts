import type { Access, CollectionConfig } from 'payload'

import { isPublicRequest } from '@/modules/content/public-access'

const sourceResources = ['pages', 'posts', 'events', 'event-cycles'] as const

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
      options: sourceResources.map((source) => ({ label: source, value: source })),
      required: true,
    },
    { name: 'sourceDocumentId', type: 'number', index: true, required: true },
    { name: 'sourceUpdatedAt', type: 'date', required: true },
    { name: 'title', type: 'text', index: true, required: true },
    { name: 'url', type: 'text', required: true },
    { name: 'excerpt', type: 'textarea' },
    { name: 'sortDate', type: 'date', index: true, required: true },
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
    { fields: ['source', 'sortDate'] },
    { fields: ['source', 'title'] },
  ],
  lockDocuments: false,
  timestamps: false,
}
