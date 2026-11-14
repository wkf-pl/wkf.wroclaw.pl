import { APIError, type FieldHook, type RelationshipField } from 'payload'

import { invalidateContentSource } from '@/modules/cache/invalidate-public-data'
import { createRolePermissionAccess, isAdministrator } from '@/modules/membership/role-access'
import { getUserGroupIds } from '@/modules/membership/user-group-membership'

import { getContentAuthorReference, isGroupAuthoredCollection } from './content-author'
import { lockAuthorGroup, lockContentAuthor } from './lock-content-author'

const readUsers = createRolePermissionAccess({
  operation: 'read',
  resource: 'users',
  selfAccess: true,
})

const validateAuthorChange: FieldHook = async ({
  collection,
  context,
  data,
  operation,
  originalDoc,
  overrideAccess,
  previousValue,
  req,
  value,
}) => {
  const previous = getContentAuthorReference(previousValue)
  const author = getContentAuthorReference(
    value ?? (operation === 'create' ? req.user?.id : undefined),
  )
  const unchanged = author?.relationTo === previous?.relationTo && author?.value === previous?.value

  if (operation === 'update' && collection && originalDoc?.id !== undefined) {
    const current = await lockContentAuthor(req, collection.slug, originalDoc.id)
    if (current?.relationTo !== previous?.relationTo || current?.value !== previous?.value) {
      throw new APIError('Autor dokumentu się zmienił. Odśwież dokument i ponów zapis.', 409)
    }
    if (context.isRestoringVersion) return current ?? null
  }

  if (!author) {
    if (value === undefined && !previous && !req.user && overrideAccess) return undefined
    if (value == null && !previous && operation === 'update') return null
    throw new APIError('Wybierz użytkownika lub grupę jako autora.', 400)
  }
  if (operation === 'update' && unchanged) return author
  if (!overrideAccess && operation === 'update' && data && Object.hasOwn(data, 'deletedAt')) {
    const nextDeletedAt = data.deletedAt ?? null
    const previousDeletedAt = originalDoc?.deletedAt ?? null
    if (nextDeletedAt !== previousDeletedAt) {
      throw new APIError('Zmień autora osobno od operacji na koszu.', 403)
    }
  }

  if (author.relationTo === 'user-groups') {
    await lockAuthorGroup(req, author.value)
  }

  if (!overrideAccess && !(await isAdministrator(req))) {
    if (operation === 'update' && previous?.relationTo === 'user-groups') {
      throw new APIError('Zmiana autora treści grupowej wymaga uprawnień administratora.', 403)
    }

    if (author.relationTo === 'user-groups') {
      if (operation === 'update' && previous?.value !== req.user?.id) {
        throw new APIError('Do grupy możesz przekazać własną treść.', 403)
      }
      if (!(await getUserGroupIds(req)).includes(author.value)) {
        throw new APIError('Wybierz grupę, do której należysz.', 403)
      }
    } else if (author.value !== req.user?.id) {
      const user = await req.payload.findByID({
        collection: 'users',
        depth: 0,
        disableErrors: true,
        id: author.value,
        overrideAccess: false,
        req,
        select: { displayName: true },
      })
      if (!user) throw new APIError('Brak dostępu do wybranego użytkownika.', 403)
    }
  }

  if (operation === 'update' && collection && originalDoc?.id !== undefined) {
    // Draft saves write to the versions table. Ownership must also change on the live row.
    if (collection.versions) {
      await req.payload.db.updateOne({
        collection: collection.slug,
        data: { author },
        id: originalDoc.id,
        req,
        returning: false,
      })
    }
    if (isGroupAuthoredCollection(collection.slug) && collection.slug !== 'media') {
      invalidateContentSource(collection.slug)
    }
  }
  return author
}

export function createContentAuthorField({ required = true } = {}): RelationshipField {
  return {
    name: 'author',
    type: 'relationship',
    label: 'Autor',
    relationTo: ['users', 'user-groups'],
    required,
    filterOptions: async ({ relationTo, req }) => {
      if (await isAdministrator(req)) return true
      if (relationTo === 'users') return readUsers({ req })
      return { id: { in: await getUserGroupIds(req) } }
    },
    // The hook also checks drafts and permits an existing author to survive an unrelated edit.
    validate: (value) => (!required || getContentAuthorReference(value) ? true : 'Wybierz autora.'),
    hooks: { beforeValidate: [validateAuthorChange] },
    admin: {
      allowCreate: false,
      allowEdit: false,
      components: { Field: '/components/admin/ContentAuthorField#ContentAuthorField' },
      position: 'sidebar',
    },
  }
}
