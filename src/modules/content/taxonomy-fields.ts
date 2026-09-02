import type { Field } from 'payload'

type TaxonomyFieldsOptions = {
  position?: 'main' | 'sidebar'
}

export function createTaxonomyFields({
  position = 'sidebar',
}: TaxonomyFieldsOptions = {}): Field[] {
  const adminPosition = position === 'sidebar' ? { position: 'sidebar' as const } : {}

  return [
    {
      name: 'category',
      type: 'relationship',
      admin: {
        ...adminPosition,
        placeholder: '<brak>',
      },
      label: 'Kategoria',
      relationTo: 'categories',
    },
    {
      name: 'tags',
      type: 'relationship',
      admin: {
        ...adminPosition,
        placeholder: '<brak>',
      },
      hasMany: true,
      label: 'Tagi',
      relationTo: 'tags',
    },
  ]
}

export function createRelatedContentJoinFields(taxonomyField: 'category' | 'tags'): Field[] {
  return [
    {
      name: 'relatedPages',
      type: 'join',
      admin: {
        components: {
          Field: '/components/admin/TaxonomyRelatedContentJoin#TaxonomyRelatedContentJoin',
        },
        defaultColumns: ['fullTitle', 'slug', '_status', 'publishedAt', 'updatedAt'],
      },
      collection: 'pages',
      defaultLimit: 20,
      label: 'Powiązane strony',
      on: taxonomyField,
    },
    {
      name: 'relatedPosts',
      type: 'join',
      admin: {
        components: {
          Field: '/components/admin/TaxonomyRelatedContentJoin#TaxonomyRelatedContentJoin',
        },
        defaultColumns: ['title', 'slug', '_status', 'publishedAt', 'updatedAt'],
      },
      collection: 'posts',
      defaultLimit: 20,
      label: 'Powiązane wpisy',
      on: taxonomyField,
    },
    {
      name: 'relatedEvents',
      type: 'join',
      admin: {
        components: {
          Field: '/components/admin/TaxonomyRelatedContentJoin#TaxonomyRelatedContentJoin',
        },
        defaultColumns: ['title', 'cycle', 'startAt', 'eventStatus', '_status'],
      },
      collection: 'events',
      defaultLimit: 20,
      label: 'Powiązane wydarzenia',
      on: taxonomyField,
    },
    {
      name: 'relatedEventCycles',
      type: 'join',
      admin: {
        components: {
          Field: '/components/admin/TaxonomyRelatedContentJoin#TaxonomyRelatedContentJoin',
        },
        defaultColumns: ['title', 'slug', '_status', 'publishedAt'],
      },
      collection: 'event-cycles',
      defaultLimit: 20,
      label: 'Powiązane cykle wydarzeń',
      on: taxonomyField,
    },
    {
      name: 'relatedDocuments',
      type: 'join',
      admin: {
        components: {
          Field: '/components/admin/TaxonomyRelatedContentJoin#TaxonomyRelatedContentJoin',
        },
        defaultColumns: ['title', 'documentType', 'documentNumber', 'documentDate', '_status'],
      },
      collection: 'documents',
      defaultLimit: 20,
      label: 'Powiązane dokumenty',
      on: taxonomyField,
    },
  ]
}
