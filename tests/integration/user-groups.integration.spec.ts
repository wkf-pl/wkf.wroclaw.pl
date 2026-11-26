import { getPayload, type Payload } from 'payload'
import { mergeListSearchAndWhere } from 'payload/shared'
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
  const admin = { ...administrator, collection: 'users' as const }
  const usersByRole = await payload.find({
    collection: 'users',
    depth: 0,
    overrideAccess: false,
    user: admin,
    where: mergeListSearchAndWhere({
      collectionConfig: payload.collections.users.config,
      search: authorRole.name,
    }),
  })
  expect(usersByRole.docs.map(({ id }) => id).sort()).toEqual([gabriela.id, bartosz.id].sort())
  const groupsByMember = await payload.find({
    collection: 'user-groups',
    depth: 0,
    overrideAccess: false,
    user: admin,
    where: mergeListSearchAndWhere({
      collectionConfig: payload.collections['user-groups'].config,
      search: gabriela.displayName,
    }),
  })
  expect(groupsByMember.docs.map(({ id }) => id)).toEqual([group.id])
  const groupOwner = { relationTo: 'user-groups' as const, value: group.id }
  post = await payload.create({
    collection: 'posts',
    depth: 0,
    data: {
      title: 'Group ownership fixture',
      slug,
      excerpt: 'Test excerpt',
      layout: [{ blockType: 'spacer', size: '24' }],
      _status: 'published',
    },
    overrideAccess: false,
    user: gabriela,
  })
  expect(post).toMatchObject({
    author: gabriela.id,
    owners: [{ relationTo: 'users', value: gabriela.id }],
  })
  const {
    docs: [personalVersion],
  } = await payload.findVersions({
    collection: 'posts',
    where: { parent: { equals: post.id } },
  })
  const document = { collection: 'posts' as const, id: post.id, overrideAccess: false }
  await expect(payload.findByID({ ...document, user: bartosz })).rejects.toThrow()
  await payload.update({
    ...document,
    draft: true,
    depth: 0,
    data: { owners: [groupOwner] },
    user: gabriela,
  })
  await expect(
    payload.findByID({ ...document, draft: true, depth: 0, user: bartosz }),
  ).resolves.toMatchObject({ author: gabriela.id, owners: [groupOwner] })
  await expect(
    payload.find({
      collection: 'posts',
      draft: true,
      depth: 0,
      overrideAccess: false,
      user: bartosz,
      where: { owners: { equals: groupOwner } },
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
      data: { owners: [{ relationTo: 'users', value: bartosz.id }] },
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
  ).resolves.toMatchObject({ author: gabriela.id, owners: [groupOwner] })
  await expect(
    payload.update({
      ...document,
      draft: true,
      data: { title: 'Edited by Bartosz' },
      user: bartosz,
    }),
  ).resolves.toMatchObject({ title: 'Edited by Bartosz' })
  await expect(
    payload.update({
      ...document,
      depth: 0,
      draft: true,
      user: bartosz,
      data: { owners: [groupOwner, { relationTo: 'users', value: bartosz.id }] },
    }),
  ).resolves.toMatchObject({
    author: gabriela.id,
    owners: [groupOwner, { relationTo: 'users', value: bartosz.id }],
  })
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
    data: { members: [] },
    overrideAccess: false,
    user: administrator,
  })
  await expect(
    payload.findByID({ ...document, draft: true, trash: true, user: bartosz }),
  ).resolves.toMatchObject({ id: post.id })
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
      data: { owners: [groupOwner], title: 'Denied group owner' },
      overrideAccess: false,
      user: gabriela,
    }),
  ).rejects.toMatchObject({ status: 403 })
  await expect(
    payload.update({ ...document, draft: true, data: { title: 'Denied edit' }, user: gabriela }),
  ).rejects.toThrow()
})
