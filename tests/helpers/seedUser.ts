import { getPayload } from 'payload'

import config from '../../src/payload.config.js'

export const administratorTestUser = {
  displayName: 'Codex Admin E2E',
  email: 'codex-admin-e2e@example.invalid',
  password: 'test',
}

export const editorTestUser = {
  displayName: 'Codex Editor E2E',
  email: 'codex-editor-e2e@example.invalid',
  password: 'test',
}

export const readOnlyTestUser = {
  displayName: 'Codex Read Only E2E',
  email: 'codex-read-only-e2e@example.invalid',
  password: 'test',
}

const readOnlyRoleKey = 'codex_read_only_e2e'

const testUsers = [
  { roleKey: 'administrator', user: administratorTestUser },
  { roleKey: 'editor', user: editorTestUser },
  { roleKey: readOnlyRoleKey, user: readOnlyTestUser },
]

/** Seeds isolated users for admin panel access tests. */
export async function seedTestUsers(): Promise<void> {
  const payload = await getPayload({ config })

  await cleanupTestUsers()

  await payload.create({
    collection: 'roles',
    data: {
      description: 'Temporary read-only role used by Playwright.',
      key: readOnlyRoleKey,
      name: 'Codex Read Only E2E',
      permissions: [{ readAllowed: true, resource: 'posts' }],
    },
    overrideAccess: true,
  })

  for (const { roleKey, user } of testUsers) {
    const roles = await payload.find({
      collection: 'roles',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      where: { key: { equals: roleKey } },
    })
    const role = roles.docs[0]

    if (!role) {
      throw new Error(`The ${roleKey} role must exist before seeding an admin user.`)
    }

    await payload.create({
      collection: 'users',
      data: {
        ...user,
        roles: [role.id],
      },
    })
  }
}

/** Cleans up users created by admin panel access tests. */
export async function cleanupTestUsers(): Promise<void> {
  const payload = await getPayload({ config })

  await payload.delete({
    collection: 'users',
    overrideAccess: true,
    where: {
      email: {
        in: testUsers.map(({ user }) => user.email),
      },
    },
  })

  await payload.delete({
    collection: 'roles',
    overrideAccess: true,
    where: {
      key: {
        equals: readOnlyRoleKey,
      },
    },
  })
}
