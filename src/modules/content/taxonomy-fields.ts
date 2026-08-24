import type { Field } from 'payload'

export function createTaxonomyFields(): Field[] {
  return [
    {
      name: 'category',
      type: 'relationship',
      admin: {
        placeholder: '<brak>',
      },
      label: 'Kategoria',
      relationTo: 'categories',
    },
    {
      name: 'tags',
      type: 'relationship',
      admin: {
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
      },
      collection: 'event-cycles',
      defaultLimit: 20,
      label: 'Powiązane cykle wydarzeń',
      on: taxonomyField,
    },
  ]
}
