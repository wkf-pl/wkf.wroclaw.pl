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
    {
      name: 'relatedDocuments',
      type: 'join',
      admin: {
        components: {
          Field: '/components/admin/TaxonomyRelatedContentJoin#TaxonomyRelatedContentJoin',
        },
      },
      collection: 'documents',
      defaultLimit: 20,
      label: 'Powiązane dokumenty',
      on: taxonomyField,
    },
  ]
}
