import type { Field } from 'payload'

export function createTaxonomyFields(): Field[] {
  return [
    {
      name: 'categories',
      type: 'relationship',
      admin: {
        placeholder: '<brak>',
      },
      hasMany: true,
      label: 'Kategorie',
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

export function createRelatedContentJoinFields(taxonomyField: 'categories' | 'tags'): Field[] {
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
  ]
}
