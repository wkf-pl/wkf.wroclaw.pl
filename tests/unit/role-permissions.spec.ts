import { describe, expect, it } from 'vitest'

import { publishedPublicAccess } from '@/modules/content/public-access'
import {
  clientUserHasUnrestrictedResourcePermission,
  clientUserHasResourcePermission,
  resolveRolePermission,
  type RoleRecord,
} from '@/modules/membership/permission-resolution'
import { createRolePermissionAccess } from '@/modules/membership/role-access'
import { validateRolePermissions } from '@/modules/membership/role-configuration'
import type { PayloadRequest } from 'payload'

function createRole(permissions: RoleRecord['permissions']): RoleRecord {
  return { id: 1, permissions }
}

describe('role permissions', () => {
  it('denies an operation that is not granted', () => {
    expect(resolveRolePermission([createRole([])], 'posts', 'read', 10)).toBe(false)
  })

  it('returns unrestricted access when one role grants it', () => {
    const ownRole = createRole([{ readAllowed: true, readOwn: true, resource: 'posts' }])
    const unrestrictedRole = createRole([{ readAllowed: true, resource: 'posts' }])

    expect(resolveRolePermission([ownRole, unrestrictedRole], 'posts', 'read', 10)).toBe(true)
  })

  it('combines own and published restrictions from one grant with AND', () => {
    const role = createRole([
      {
        readAllowed: true,
        readOwn: true,
        readPublished: true,
        resource: 'posts',
      },
    ])

    expect(resolveRolePermission([role], 'posts', 'read', 10)).toEqual({
      and: [{ author: { equals: 10 } }, { _status: { equals: 'published' } }],
    })
  })

  it('combines restricted grants from different roles with OR', () => {
    const ownRole = createRole([{ updateAllowed: true, updateOwn: true, resource: 'posts' }])
    const publishedRole = createRole([
      { resource: 'posts', updateAllowed: true, updatePublished: true },
    ])

    expect(resolveRolePermission([ownRole, publishedRole], 'posts', 'update', 10)).toEqual({
      or: [{ author: { equals: 10 } }, { _status: { equals: 'published' } }],
    })
  })

  it('maps own media access to uploadedBy', () => {
    const role = createRole([{ deleteAllowed: true, deleteOwn: true, resource: 'media' }])

    expect(resolveRolePermission([role], 'media', 'delete', 10)).toEqual({
      uploadedBy: { equals: 10 },
    })
  })

  it('uses one resource for every document operation', () => {
    const role = createRole([
      {
        canCreate: true,
        deleteAllowed: true,
        permanentDeleteAllowed: true,
        readAllowed: true,
        resource: 'documents',
        restoreAllowed: true,
        updateAllowed: true,
      },
    ])

    expect(resolveRolePermission([role], 'documents', 'create', 10)).toBe(true)
    expect(resolveRolePermission([role], 'documents', 'read', 10)).toBe(true)
    expect(resolveRolePermission([role], 'documents', 'update', 10)).toBe(true)
    expect(resolveRolePermission([role], 'documents', 'delete', 10)).toBe(true)
    expect(resolveRolePermission([role], 'documents', 'restore', 10)).toBe(true)
    expect(resolveRolePermission([role], 'documents', 'permanentDelete', 10)).toBe(true)
  })

  it('keeps restore and permanent deletion independent from update and delete', () => {
    const role = createRole([
      {
        deleteAllowed: true,
        permanentDeleteAllowed: false,
        resource: 'posts',
        restoreAllowed: true,
        updateAllowed: false,
      },
    ])

    expect(resolveRolePermission([role], 'posts', 'update', 10)).toBe(false)
    expect(resolveRolePermission([role], 'posts', 'delete', 10)).toBe(true)
    expect(resolveRolePermission([role], 'posts', 'restore', 10)).toBe(true)
    expect(resolveRolePermission([role], 'posts', 'permanentDelete', 10)).toBe(false)
  })

  it('rejects duplicate resources in one role', () => {
    expect(validateRolePermissions([{ resource: 'posts' }, { resource: 'posts' }])).toBe(
      'Każdy zasób może wystąpić w roli tylko raz.',
    )
  })

  it('keeps fixed public read access separate from roles', async () => {
    const readPosts = createRolePermissionAccess({
      operation: 'read',
      publicAccess: publishedPublicAccess,
      resource: 'posts',
    })

    const request = {
      context: { publicWebsite: true },
      user: null,
    } as unknown as PayloadRequest
    await expect(readPosts({ req: request })).resolves.toEqual(publishedPublicAccess)

    request.context = {}
    await expect(readPosts({ req: request })).resolves.toBe(false)
  })

  it('always lets a signed-in user read their own account', async () => {
    const readUsers = createRolePermissionAccess({
      operation: 'read',
      resource: 'users',
      selfAccess: true,
    })

    await expect(
      readUsers({
        req: { user: { id: 10, roles: [] } } as unknown as PayloadRequest,
      }),
    ).resolves.toEqual({ id: { equals: 10 } })
  })

  it('uses explicit role read permission for admin navigation visibility', () => {
    const editorRole = createRole([{ readAllowed: true, resource: 'posts' }])
    const user = { id: 10, roles: [editorRole] }

    expect(clientUserHasResourcePermission(user, 'posts', 'read')).toBe(true)
    expect(clientUserHasResourcePermission(user, 'users', 'read')).toBe(false)
  })

  it('distinguishes scoped access from unrestricted admin navigation access', () => {
    const ownProfilesRole = createRole([
      { readAllowed: true, readOwn: true, resource: 'member-profiles' },
    ])
    const allProfilesRole = createRole([{ readAllowed: true, resource: 'member-profiles' }])

    expect(
      clientUserHasResourcePermission(
        { id: 10, roles: [ownProfilesRole] },
        'member-profiles',
        'read',
      ),
    ).toBe(true)
    expect(
      clientUserHasUnrestrictedResourcePermission(
        { id: 10, roles: [ownProfilesRole] },
        'member-profiles',
        'read',
      ),
    ).toBe(false)
    expect(
      clientUserHasUnrestrictedResourcePermission(
        { id: 10, roles: [allProfilesRole] },
        'member-profiles',
        'read',
      ),
    ).toBe(true)
  })
})
