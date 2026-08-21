import type { Payload } from 'payload'

import type { User } from '@/payload-types'

export async function createIntegrationAuthor(
  payload: Payload,
  fixtureName: string,
): Promise<User> {
  const email = `integration-${fixtureName}@example.invalid`

  await payload.delete({
    collection: 'users',
    overrideAccess: true,
    where: { email: { equals: email } },
  })

  const roles = await payload.find({
    collection: 'roles',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { key: { equals: 'editor' } },
  })
  const editorRole = roles.docs[0]

  if (!editorRole) {
    throw new Error('Integration test requires the migrated editor role.')
  }

  return payload.create({
    collection: 'users',
    data: {
      displayName: `Integration ${fixtureName} author`,
      email,
      password: 'integration-test-password',
      roles: [editorRole.id],
    },
    depth: 0,
    overrideAccess: true,
  })
}

export async function deleteIntegrationAuthor(
  payload: Payload,
  author: User | undefined,
): Promise<void> {
  if (!author) {
    return
  }

  await payload.delete({
    collection: 'users',
    id: author.id,
    overrideAccess: true,
  })
}
