import type { RelationshipField } from 'payload'

export function createContentAuthorField(): RelationshipField {
  return {
    name: 'author',
    type: 'relationship',
    label: 'Autor',
    relationTo: 'users',
    defaultValue: ({ user }) => user?.id,
    hooks: { beforeDuplicate: [({ req, value }) => req.user?.id ?? value] },
    admin: {
      allowCreate: false,
      allowEdit: false,
      components: { Field: '/components/admin/UserRelationshipField#UserRelationshipField' },
      description: 'Użytkownik, któremu przypisujesz autorstwo treści.',
      position: 'sidebar',
    },
  }
}
