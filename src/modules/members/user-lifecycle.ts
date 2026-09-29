import {
  APIError,
  type CollectionAfterChangeHook,
  type CollectionBeforeDeleteHook,
  type CollectionBeforeValidateHook,
} from 'payload'

import { getRelationshipIds } from '@/lib/relationships'
import { administratorRoleKey, defaultUserRoleKey } from '@/modules/membership/role-configuration'

export const unpublishProfileWithoutMemberRole: CollectionAfterChangeHook = async ({
  doc,
  req,
}) => {
  const roleIDs = getRelationshipIds(doc.roles)
  const memberRoles = roleIDs.length
    ? await req.payload.find({
        collection: 'roles',
        depth: 0,
        limit: roleIDs.length,
        overrideAccess: true,
        pagination: false,
        req,
        where: { and: [{ id: { in: roleIDs } }, { key: { equals: 'member' } }] },
      })
    : { docs: [] }

  if (memberRoles.docs.length === 0) {
    await req.payload.update({
      collection: 'member-profiles',
      data: { _status: 'draft' },
      overrideAccess: true,
      req,
      unpublishAllLocales: true,
      where: { owner: { equals: doc.id } },
    })
  }
  return doc
}

export const deleteUserMemberData: CollectionBeforeDeleteHook = async ({ id, req }) => {
  await req.payload.delete({
    collection: 'member-profiles',
    overrideAccess: true,
    req,
    where: { owner: { equals: id } },
  })
  await req.payload.delete({
    collection: 'member-profile-images',
    overrideAccess: true,
    req,
    where: { owner: { equals: id } },
  })
}

export const assignDefaultUserRole: CollectionBeforeValidateHook = async ({
  data,
  operation,
  req,
}) => {
  if (operation !== 'create' || (Array.isArray(data?.roles) && data.roles.length > 0)) return data

  const roleKey = req.user ? defaultUserRoleKey : administratorRoleKey
  const roles = await req.payload.find({
    collection: 'roles',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    req,
    where: { key: { equals: roleKey } },
  })
  const role = roles.docs[0]
  if (!role) throw new APIError(`Brakuje wymaganej roli systemowej: ${roleKey}.`, 500)

  return { ...data, roles: [role.id] }
}
