import type { CollectionConfig } from 'payload'

import { editorOrAdmin } from '@/access/editorOrAdmin'
import { publishedOrEditor } from '@/access/publishedOrEditor'
import { createEditorialFields } from '@/modules/content/editorial-fields'
import { setPublishedAt } from '@/modules/content/hooks/set-published-at'

export const Posts: CollectionConfig = {
  slug: 'posts',
  access: {
    create: editorOrAdmin,
    delete: editorOrAdmin,
    read: publishedOrEditor,
    update: editorOrAdmin,
  },
  admin: {
    defaultColumns: ['title', 'slug', '_status', 'publishedAt', 'updatedAt'],
    group: 'Treści',
    listSearchableFields: ['title', 'slug', 'excerpt'],
    useAsTitle: 'title',
  },
  defaultSort: '-publishedAt',
  fields: createEditorialFields({ includeExcerpt: true, includeTaxonomy: true }),
  hooks: {
    beforeChange: [setPublishedAt],
  },
  labels: {
    plural: 'Wpisy',
    singular: 'Wpis',
  },
  versions: {
    drafts: true,
    maxPerDoc: 50,
  },
}
