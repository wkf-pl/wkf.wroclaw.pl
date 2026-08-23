import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { getPayload, type Payload } from 'payload'

import config from '@/payload.config'
import type { Role, User } from '@/payload-types'
import { publicRequestContext } from '@/modules/content/public-access'

let payload: Payload
let administratorRole: Role
let editorRole: Role
let userRole: Role

function createAuthenticatedUser(id: number, role: Role): User {
  return {
    collection: 'users',
    createdAt: new Date(0).toISOString(),
    displayName: `Access Test ${id}`,
    email: `access-test-${id}@example.invalid`,
    id,
    roles: [role.id],
    updatedAt: new Date(0).toISOString(),
  }
}

async function findRole(key: string): Promise<Role> {
  const result = await payload.find({
    collection: 'roles',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { key: { equals: key } },
  })
  const role = result.docs[0]

  if (!role) {
    throw new Error(`Missing migrated role: ${key}`)
  }

  return role
}

beforeAll(async () => {
  payload = await getPayload({ config })
  ;[administratorRole, editorRole, userRole] = await Promise.all([
    findRole('administrator'),
    findRole('editor'),
    findRole('user'),
  ])
})

afterAll(async () => {
  if (!payload) {
    return
  }

  await payload.delete({
    collection: 'club-sections',
    overrideAccess: true,
    where: { slug: { in: ['integration-published', 'integration-draft'] } },
  })
})

describe('role access integration', () => {
  it('allows administrators to read all roles and other users to read assigned roles', async () => {
    await expect(
      payload.find({
        collection: 'roles',
        overrideAccess: false,
        user: createAuthenticatedUser(-1, administratorRole),
      }),
    ).resolves.toMatchObject({ totalDocs: 7 })

    const editorRoles = await payload.find({
      collection: 'roles',
      overrideAccess: false,
      user: createAuthenticatedUser(-2, editorRole),
    })

    expect(editorRoles.docs).toHaveLength(1)
    expect(editorRoles.docs[0]).toMatchObject({ id: editorRole.id, name: editorRole.name })
  })

  it('keeps public access independent from signing in without CMS read', async () => {
    await expect(
      payload.find({
        collection: 'posts',
        context: publicRequestContext,
        overrideAccess: false,
        user: null,
      }),
    ).resolves.toHaveProperty('docs')

    await expect(
      payload.find({
        collection: 'posts',
        context: publicRequestContext,
        overrideAccess: false,
        user: createAuthenticatedUser(-3, userRole),
      }),
    ).resolves.toHaveProperty('docs')
  })

  it('gives the migrated editor unrestricted read access to CMS content', async () => {
    await expect(
      payload.find({
        collection: 'posts',
        overrideAccess: false,
        user: createAuthenticatedUser(-4, editorRole),
      }),
    ).resolves.toHaveProperty('docs')
  })

  it('protects the system administrator role from deletion', async () => {
    await expect(
      payload.delete({
        collection: 'roles',
        id: administratorRole.id,
        overrideAccess: false,
        user: createAuthenticatedUser(-5, administratorRole),
      }),
    ).rejects.toMatchObject({ status: 400 })
  })

  it('shows only published club sections to anonymous readers', async () => {
    for (const slug of ['integration-published', 'integration-draft']) {
      await payload.delete({
        collection: 'club-sections',
        overrideAccess: true,
        where: { slug: { equals: slug } },
      })
    }

    await payload.create({
      collection: 'club-sections',
      data: {
        _status: 'published',
        displayOrder: 1,
        name: 'Integration Published',
        slug: 'integration-published',
      },
      overrideAccess: false,
      user: createAuthenticatedUser(-6, editorRole),
    })
    await payload.create({
      collection: 'club-sections',
      data: {
        _status: 'draft',
        displayOrder: 2,
        name: 'Integration Draft',
        slug: 'integration-draft',
      },
      draft: true,
      overrideAccess: false,
      user: createAuthenticatedUser(-6, editorRole),
    })

    const result = await payload.find({
      collection: 'club-sections',
      context: publicRequestContext,
      overrideAccess: false,
      user: null,
      where: { slug: { in: ['integration-published', 'integration-draft'] } },
    })

    expect(result.docs.map(({ slug }) => slug)).toEqual(['integration-published'])
  })

  it('denies club section creation to a role without permission', async () => {
    await expect(
      payload.create({
        collection: 'club-sections',
        data: {
          displayOrder: 3,
          name: 'Denied Section',
          slug: 'integration-denied',
        },
        overrideAccess: false,
        user: createAuthenticatedUser(-7, userRole),
      }),
    ).rejects.toMatchObject({ status: 403 })
  })
})
