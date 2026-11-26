import { APIError, type FieldHook, type RelationshipField } from 'payload'

import { createRolePermissionAccess, isAdministrator } from '@/modules/membership/role-access'
import { getUserGroupIds } from '@/modules/membership/user-group-membership'

import { contentOwnerKey, getContentOwners } from './content-owners'
import { lockContentOwners, lockOwnerGroup } from './lock-content-owners'

const readUsers = createRolePermissionAccess({
  operation: 'read',
  resource: 'users',
  selfAccess: true,
})

function validateOwnersChange(useEventDefaults: boolean): FieldHook {
  return async ({
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
    const storedOwners = getContentOwners(previousValue)
    const previous = operation === 'update' ? storedOwners : []
    const previousKeys = new Set(previous.map(contentOwnerKey))
    if (
      value != null &&
      (!Array.isArray(value) || value.some((owner) => getContentOwners([owner]).length === 0))
    ) {
      throw new APIError('Wybierz użytkowników lub grupy jako właścicieli.', 400)
    }
    const requestedOwners = value === undefined ? storedOwners : getContentOwners(value)
    const next =
      !useEventDefaults && operation === 'create' && req.user
        ? getContentOwners([{ relationTo: 'users', value: req.user.id }, ...requestedOwners])
        : requestedOwners
    const nextKeys = new Set(next.map(contentOwnerKey))

    if (
      !useEventDefaults &&
      operation === 'update' &&
      collection &&
      originalDoc?.id !== undefined
    ) {
      const current = await lockContentOwners(req, collection.slug, originalDoc.id)
      if (context.isRestoringVersion) return current
      if (
        current.length !== previous.length ||
        current.some((owner) => !previousKeys.has(contentOwnerKey(owner)))
      ) {
        throw new APIError('Właściciele treści się zmienili. Odśwież formularz i ponów zapis.', 409)
      }
    }

    const added = next.filter((owner) => !previousKeys.has(contentOwnerKey(owner)))
    const removed = previous.filter((owner) => !nextKeys.has(contentOwnerKey(owner)))
    if (added.length === 0 && removed.length === 0) return next

    if (
      !overrideAccess &&
      operation === 'update' &&
      data &&
      Object.hasOwn(data, 'deletedAt') &&
      (data.deletedAt ?? null) !== (originalDoc?.deletedAt ?? null)
    ) {
      throw new APIError('Zmień właścicieli osobno od operacji na koszu.', 403)
    }

    if (!overrideAccess && !(await isAdministrator(req))) {
      if (!useEventDefaults && removed.some(({ relationTo }) => relationTo === 'user-groups')) {
        throw new APIError('Usunięcie grupy z właścicieli wymaga uprawnień administratora.', 403)
      }
      const groups = await getUserGroupIds(req)
      for (const owner of added) {
        if (owner.relationTo === 'user-groups') {
          if (!groups.includes(owner.value))
            throw new APIError('Wybierz grupę, do której należysz.', 403)
        } else if (owner.value !== req.user?.id) {
          const user = await req.payload.findByID({
            collection: 'users',
            id: owner.value,
            depth: 0,
            disableErrors: true,
            overrideAccess: false,
            req,
            select: { displayName: true },
          })
          if (!user) throw new APIError('Brak dostępu do wybranego użytkownika.', 403)
        }
      }
    }

    const groupIds = added.flatMap(({ relationTo, value }) =>
      relationTo === 'user-groups' ? [value] : [],
    )
    for (const id of groupIds.sort((left, right) => left - right)) await lockOwnerGroup(req, id)

    if (
      !useEventDefaults &&
      operation === 'update' &&
      collection?.versions &&
      originalDoc?.id !== undefined
    ) {
      // Draft saves and reads of historical versions use ownership on the live row.
      await req.payload.db.updateOne({
        collection: collection.slug,
        id: originalDoc.id,
        data: { owners: next },
        req,
        returning: false,
      })
    }
    return next
  }
}

export function createContentOwnersField({ eventDefaults = false } = {}): RelationshipField {
  return {
    name: 'owners',
    type: 'relationship',
    label: 'Właściciele',
    relationTo: ['users', 'user-groups'],
    hasMany: true,
    ...(eventDefaults
      ? {}
      : { defaultValue: ({ user }) => (user ? [{ relationTo: 'users', value: user.id }] : []) }),
    filterOptions: async ({ relationTo, req }) => {
      if (await isAdministrator(req)) return true
      if (relationTo === 'users') return readUsers({ req })
      return { id: { in: await getUserGroupIds(req) } }
    },
    validate: (value) =>
      value == null || Array.isArray(value) ? true : 'Wybierz właścicieli treści.',
    hooks: { beforeValidate: [validateOwnersChange(eventDefaults)] },
    admin: {
      allowCreate: false,
      allowEdit: false,
      description: eventDefaults
        ? 'Domyślni właściciele wydarzeń tworzonych z tego cyklu.'
        : 'Użytkownicy i grupy objęci uprawnieniami „tylko własne”.',
      ...(eventDefaults ? {} : { position: 'sidebar' }),
    },
  }
}
