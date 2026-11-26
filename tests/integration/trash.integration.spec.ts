import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { getPayload, type Payload } from 'payload'

import config from '@/payload.config'
import type { Post, Role, User } from '@/payload-types'

const testSlugs = [
  'trash-editor-restore',
  'trash-administrator-restore',
  'trash-update-without-restore',
  'trash-bulk-first',
  'trash-bulk-second',
] as const

let payload: Payload
let administrator: User
let editor: User
let permanentDeleter: User
let permanentDeleteRole: Role

function createAuthenticatedUser(id: number, role: Role): User {
  return {
    collection: 'users',
    createdAt: new Date(0).toISOString(),
    displayName: `Trash Test ${role.key}`,
    email: `trash-test-${role.key}@example.invalid`,
    id,
    roles: [role.id],
    updatedAt: new Date(0).toISOString(),
  }
}

async function findRole(key: string): Promise<Role> {
  const result = await payload.find({
    collection: 'roles',
    depth: 1,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { key: { equals: key } },
  })
  const role = result.docs[0]

  if (!role) throw new Error(`Missing migrated role: ${key}`)
  return role
}

async function createPost(slug: (typeof testSlugs)[number]): Promise<Post> {
  return payload.create({
    collection: 'posts',
    data: {
      _status: 'published',
      author: editor.id,
      excerpt: 'Trash integration fixture',
      layout: [{ blockType: 'spacer', size: '24' }],
      title: `Trash integration ${slug}`,
      slug,
    },
    overrideAccess: false,
    user: editor,
  })
}

async function moveToTrash(id: Post['id']): Promise<Post> {
  return payload.update({
    collection: 'posts',
    data: { deletedAt: new Date().toISOString() },
    id,
    overrideAccess: false,
    user: editor,
  })
}

async function permanentlyRemoveTestPosts(): Promise<void> {
  await payload.delete({
    collection: 'posts',
    overrideAccess: true,
    trash: true,
    where: { slug: { in: [...testSlugs] } },
  })
}

async function deleteTestRole(): Promise<void> {
  const roles = await payload.find({
    collection: 'roles',
    limit: 0,
    overrideAccess: true,
    pagination: false,
    where: { key: { equals: 'trash_integration_permanent_deleter' } },
  })

  for (const role of roles.docs) {
    await payload.delete({ collection: 'roles', id: role.id, overrideAccess: true })
  }
}

beforeAll(async () => {
  payload = await getPayload({ config })
  await permanentlyRemoveTestPosts()
  await deleteTestRole()

  const [administratorRole, editorRole] = await Promise.all([
    findRole('administrator'),
    findRole('editor'),
  ])
  administrator = createAuthenticatedUser(-20, administratorRole)
  const editorAccount = await payload.create({
    collection: 'users',
    data: {
      displayName: 'Trash integration editor',
      email: 'trash-integration-editor@example.invalid',
      password: 'integration-test-only',
      roles: [editorRole.id],
    },
  })
  editor = { ...editorAccount, collection: 'users' }
  permanentDeleteRole = await payload.create({
    collection: 'roles',
    data: {
      key: 'trash_integration_permanent_deleter',
      name: 'Trash integration permanent deleter',
      permissions: [
        {
          permanentDeleteAllowed: true,
          readAllowed: true,
          resource: 'posts',
          updateAllowed: true,
        },
      ],
    },
    draft: false,
    overrideAccess: true,
  })
  permanentDeleter = createAuthenticatedUser(-22, permanentDeleteRole)
})

afterAll(async () => {
  if (payload) {
    await permanentlyRemoveTestPosts()
    await deleteTestRole()
    if (editor) await payload.delete({ collection: 'users', id: editor.id })
  }
})

describe('content trash integration', () => {
  it('lets an editor move content to trash and restore it', async () => {
    const post = await createPost('trash-editor-restore')
    const trashedPost = await moveToTrash(post.id)

    expect(trashedPost.deletedAt).toBeTypeOf('string')

    const regularResult = await payload.find({
      collection: 'posts',
      overrideAccess: false,
      user: editor,
      where: { id: { equals: post.id } },
    })
    expect(regularResult.docs).toHaveLength(0)

    const versions = await payload.findVersions({
      collection: 'posts',
      overrideAccess: false,
      trash: true,
      user: editor,
      where: { parent: { equals: post.id } },
    })
    expect(versions.docs.length).toBeGreaterThan(0)
    await expect(
      payload.restoreVersion({
        collection: 'posts',
        id: versions.docs[0]!.id,
        overrideAccess: false,
        user: editor,
      }),
    ).rejects.toMatchObject({ status: 403 })

    const restoredPost = await payload.update({
      collection: 'posts',
      data: { deletedAt: null },
      id: post.id,
      overrideAccess: false,
      trash: true,
      user: editor,
    })

    expect(restoredPost.deletedAt).toBeNull()
  })

  it('does not grant an administrator unconfigured read or restore access', async () => {
    const post = await createPost('trash-administrator-restore')
    await moveToTrash(post.id)

    await expect(
      payload.findByID({
        collection: 'posts',
        id: post.id,
        overrideAccess: false,
        trash: true,
        user: administrator,
      }),
    ).rejects.toBeDefined()

    await expect(
      payload.update({
        collection: 'posts',
        data: { deletedAt: null },
        id: post.id,
        overrideAccess: false,
        trash: true,
        user: administrator,
      }),
    ).rejects.toBeDefined()
  })

  it('does not treat regular update permission as restore permission', async () => {
    const post = await createPost('trash-update-without-restore')
    await moveToTrash(post.id)

    await expect(
      payload.update({
        collection: 'posts',
        data: { deletedAt: null, id: post.id },
        id: post.id,
        overrideAccess: false,
        trash: true,
        user: permanentDeleter,
      }),
    ).rejects.toMatchObject({ status: 403 })
  })

  it('uses explicit permission for single and bulk permanent deletion', async () => {
    const posts = await Promise.all([
      createPost('trash-bulk-first'),
      createPost('trash-bulk-second'),
    ])
    await Promise.all(posts.map(({ id }) => moveToTrash(id)))

    await expect(
      payload.delete({
        collection: 'posts',
        id: posts[0].id,
        overrideAccess: false,
        trash: true,
        user: editor,
      }),
    ).rejects.toBeDefined()

    await expect(
      payload.delete({
        collection: 'posts',
        overrideAccess: false,
        trash: true,
        user: editor,
        where: { id: { in: posts.map(({ id }) => id) } },
      }),
    ).rejects.toMatchObject({ status: 403 })

    await expect(
      payload.delete({
        collection: 'posts',
        overrideAccess: false,
        trash: true,
        user: administrator,
        where: { id: { in: posts.map(({ id }) => id) } },
      }),
    ).rejects.toMatchObject({ status: 403 })

    const stillTrashed = await payload.find({
      collection: 'posts',
      overrideAccess: true,
      trash: true,
      where: { id: { in: posts.map(({ id }) => id) } },
    })
    expect(stillTrashed.docs).toHaveLength(2)

    const permanentDeleteResult = await payload.delete({
      collection: 'posts',
      overrideAccess: false,
      trash: true,
      user: permanentDeleter,
      where: { id: { in: posts.map(({ id }) => id) } },
    })
    expect(permanentDeleteResult.docs).toHaveLength(2)

    const permanentlyDeleted = await payload.find({
      collection: 'posts',
      overrideAccess: true,
      trash: true,
      where: { id: { in: posts.map(({ id }) => id) } },
    })
    expect(permanentlyDeleted.docs).toHaveLength(0)
  })

  it('does not grant editors access to the member profile collection', async () => {
    const editorRole = await findRole('editor')
    const permission = editorRole.permissions?.find(
      ({ resource }) => resource === 'member-profiles',
    )

    expect(permission).toBeUndefined()
  })

  it('migrates trash permissions without broadening collection access', async () => {
    const [administratorRole, editorRole] = await Promise.all([
      findRole('administrator'),
      findRole('editor'),
    ])
    const administratorPostPermission = administratorRole.permissions?.find(
      ({ resource }) => resource === 'posts',
    )
    const editorPostPermission = editorRole.permissions?.find(
      ({ resource }) => resource === 'posts',
    )

    expect(administratorPostPermission).toBeUndefined()
    expect(editorPostPermission).toMatchObject({
      permanentDeleteAllowed: false,
      restoreAllowed: true,
    })
  })
})
