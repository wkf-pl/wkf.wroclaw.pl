import { describe, expect, it } from 'vitest'

import { documentTypeOptions } from '@/modules/documents/document-types'
import { getDocumentPermissionResource } from '@/modules/membership/permission-resources'
import {
  clientUserHasResourcePermission,
  createCollectionRolePermissionAccess,
  createRolePermissionAccess,
  resolveRolePermission,
  validateRolePermissions,
  type RoleRecord,
} from '@/modules/membership/role-permissions'
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

  it.each(documentTypeOptions)(
    'keeps CRUD grants independent for the $label document type',
    ({ value }) => {
      const resource = getDocumentPermissionResource(value)
      const role = createRole([
        {
          canCreate: true,
          deleteAllowed: true,
          readAllowed: true,
          resource,
          updateAllowed: true,
        },
      ])
      const expectedScope = { documentType: { equals: value } }

      expect(resolveRolePermission([role], resource, 'create', 10)).toBe(true)
      expect(resolveRolePermission([role], resource, 'read', 10)).toEqual(expectedScope)
      expect(resolveRolePermission([role], resource, 'update', 10)).toEqual(expectedScope)
      expect(resolveRolePermission([role], resource, 'delete', 10)).toEqual(expectedScope)
    },
  )

  it('rejects duplicate resources in one role', () => {
    expect(validateRolePermissions([{ resource: 'posts' }, { resource: 'posts' }])).toBe(
      'Każdy zasób może wystąpić w roli tylko raz.',
    )
  })

  it('keeps anonymous public read access separate from roles', async () => {
    const readPosts = createRolePermissionAccess({
      anonymousAccess: { _status: { equals: 'published' } },
      operation: 'read',
      resource: 'posts',
    })

    await expect(readPosts({ req: { user: null } as unknown as PayloadRequest })).resolves.toEqual({
      _status: { equals: 'published' },
    })
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

  it('keeps website-only role access separate from CMS read access', async () => {
    const role = createRole([])
    const websiteAccess = createRolePermissionAccess({ operation: 'read', resource: 'posts' })
    const request = {
      context: { website: true },
      payload: {
        find: async () => ({ docs: [role] }),
        findGlobal: async () => ({
          permissions: [
            {
              anonymousAllowed: false,
              resource: 'posts',
              roles: [role.id],
            },
          ],
        }),
      },
      user: { id: 10, roles: [role.id] },
    } as unknown as PayloadRequest

    await expect(websiteAccess({ req: request })).resolves.toEqual({
      _status: { equals: 'published' },
    })

    request.context = {}
    await expect(websiteAccess({ req: request })).resolves.toBe(false)
  })

  it('applies own and published constraints to role read access on the website', async () => {
    const role = createRole([
      {
        readAllowed: true,
        readOwn: true,
        resource: 'documents-resolution',
      },
    ])
    const websiteAccess = createCollectionRolePermissionAccess({
      collection: 'documents',
      operation: 'read',
    })
    const request = {
      context: { website: true },
      payload: {
        find: async () => ({ docs: [role] }),
        findGlobal: async () => ({ permissions: [] }),
      },
      user: { id: 10, roles: [role.id] },
    } as unknown as PayloadRequest

    await expect(websiteAccess({ req: request })).resolves.toEqual({
      and: [
        { documentType: { equals: 'resolution' } },
        { author: { equals: 10 } },
        { _status: { equals: 'published' } },
      ],
    })
  })
})
