import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, expect, it } from 'vitest'

import config from '@/payload.config'
import type { Post, Role, User, UserGroup } from '@/payload-types'

let payload: Payload
let authorRole: Role
let administrator: User
let gabriela: User
let bartosz: User
let group: UserGroup
let post: Post
const slug = 'integration-group-author'

async function createUser(name: string, role: Role): Promise<User> {
  return payload.create({
    collection: 'users',
    data: {
      displayName: `User group integration ${name}`,
      email: `user-group-${name}@example.invalid`,
      password: 'integration-test-only',
      roles: [role.id],
    },
  })
}

beforeAll(async () => {
  payload = await getPayload({ config })
  const {
    docs: [administratorRole],
  } = await payload.find({
    collection: 'roles',
    where: { key: { equals: 'administrator' } },
  })
  authorRole = await payload.create({
    collection: 'roles',
    data: {
      name: 'User group integration author',
      key: 'user_group_integration_author',
      permissions: [
        {
          resource: 'posts',
          canCreate: true,
          readAllowed: true,
          readOwn: true,
          updateAllowed: true,
          updateOwn: true,
          deleteAllowed: true,
          deleteOwn: true,
        },
      ],
    },
  })
  administrator = await createUser('administrator', administratorRole)
  gabriela = await createUser('gabriela', authorRole)
  bartosz = await createUser('bartosz', authorRole)
})

afterAll(async () => {
  if (post) await payload.delete({ collection: 'posts', id: post.id, trash: true })
  if (group) await payload.delete({ collection: 'user-groups', id: group.id })
  for (const user of [administrator, gabriela, bartosz]) {
    if (user) await payload.delete({ collection: 'users', id: user.id })
  }
  if (authorRole) await payload.delete({ collection: 'roles', id: authorRole.id })
})

it('transfers a published post on a draft save and restricts access to current group members', async () => {
  group = await payload.create({
    collection: 'user-groups',
    data: { name: 'Planszówki', members: [gabriela.id, bartosz.id] },
    overrideAccess: false,
    user: administrator,
  })
  const author = { relationTo: 'user-groups' as const, value: group.id }
  post = await payload.create({
    collection: 'posts',
    data: {
      title: 'Group author fixture',
      author: { relationTo: 'users', value: gabriela.id },
      slug,
      excerpt: 'Test excerpt',
      layout: [{ blockType: 'spacer', size: '24' }],
      _status: 'published',
    },
    overrideAccess: false,
    user: gabriela,
  })
  const {
    docs: [personalVersion],
  } = await payload.findVersions({
    collection: 'posts',
    where: { parent: { equals: post.id } },
  })
  const document = { collection: 'posts' as const, id: post.id, overrideAccess: false }
  await expect(payload.findByID({ ...document, user: bartosz })).rejects.toThrow()
  await payload.update({ ...document, draft: true, depth: 0, data: { author }, user: gabriela })
  await expect(
    payload.findByID({ ...document, draft: true, depth: 0, user: bartosz }),
  ).resolves.toMatchObject({ author })
  await expect(
    payload.find({
      collection: 'posts',
      draft: true,
      depth: 0,
      overrideAccess: false,
      user: bartosz,
      where: { author: { equals: author } },
    }),
  ).resolves.toMatchObject({ totalDocs: 1 })
  await expect(
    payload.findVersionByID({
      collection: 'posts',
      id: personalVersion.id,
      overrideAccess: false,
      user: bartosz,
    }),
  ).resolves.toMatchObject({ id: personalVersion.id })

  await expect(
    payload.update({
      ...document,
      draft: true,
      data: { author: { relationTo: 'users', value: bartosz.id } },
      user: bartosz,
    }),
  ).rejects.toMatchObject({ status: 403 })
  await expect(
    payload.restoreVersion({
      collection: 'posts',
      id: personalVersion.id,
      draft: true,
      depth: 0,
      overrideAccess: false,
      user: bartosz,
    }),
  ).resolves.toMatchObject({ author })
  await expect(
    payload.update({
      ...document,
      draft: true,
      data: { title: 'Edited by Bartosz' },
      user: bartosz,
    }),
  ).resolves.toMatchObject({ title: 'Edited by Bartosz' })
  await payload.update({
    ...document,
    data: { deletedAt: new Date().toISOString() },
    user: bartosz,
  })
  await expect(
    payload.delete({
      collection: 'user-groups',
      id: group.id,
      overrideAccess: false,
      user: administrator,
    }),
  ).rejects.toMatchObject({ status: 409 })

  await payload.update({
    collection: 'user-groups',
    id: group.id,
    data: { members: [bartosz.id] },
    overrideAccess: false,
    user: administrator,
  })
  await expect(
    payload.findByID({ ...document, draft: true, trash: true, user: gabriela }),
  ).rejects.toThrow()
  await expect(
    payload.findVersionByID({
      collection: 'posts',
      id: personalVersion.id,
      overrideAccess: false,
      user: gabriela,
    }),
  ).rejects.toThrow()
  await expect(
    payload.create({
      collection: 'posts',
      draft: true,
      data: { author, title: 'Denied group author' },
      overrideAccess: false,
      user: gabriela,
    }),
  ).rejects.toMatchObject({ status: 403 })
  await expect(
    payload.update({ ...document, draft: true, data: { title: 'Denied edit' }, user: gabriela }),
  ).rejects.toThrow()
})
