import type { CollectionConfig } from 'payload'

import { editorOrAdmin } from '@/access/editorOrAdmin'
import { publishedOrEditor } from '@/access/publishedOrEditor'
import { createEditorialFields } from '@/modules/content/editorial-fields'
import { setPublishedAt } from '@/modules/content/hooks/set-published-at'

export const Pages: CollectionConfig = {
  slug: 'pages',
  access: {
    create: editorOrAdmin,
    delete: editorOrAdmin,
    read: publishedOrEditor,
    update: editorOrAdmin,
  },
  admin: {
    defaultColumns: ['title', 'slug', '_status', 'publishedAt', 'updatedAt'],
    group: 'Treści',
    listSearchableFields: ['title', 'slug'],
    useAsTitle: 'title',
  },
  fields: createEditorialFields({ reserveApplicationSlugs: true }),
  hooks: {
    beforeChange: [setPublishedAt],
  },
  labels: {
    plural: 'Strony',
    singular: 'Strona',
  },
  versions: {
    drafts: true,
    maxPerDoc: 50,
  },
}
