import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { getPayload, type Payload } from 'payload'

import config from '@/payload.config'
import type { ClubSection, Role, User } from '@/payload-types'

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

async function createSection(slug: (typeof testSlugs)[number]): Promise<ClubSection> {
  return payload.create({
    collection: 'club-sections',
    data: {
      _status: 'published',
      displayOrder: 100,
      name: `Trash integration ${slug}`,
      slug,
    },
    overrideAccess: false,
    user: editor,
  })
}

async function moveToTrash(id: ClubSection['id']): Promise<ClubSection> {
  return payload.update({
    collection: 'club-sections',
    data: { deletedAt: new Date().toISOString() },
    id,
    overrideAccess: false,
    user: editor,
  })
}

async function permanentlyRemoveTestSections(): Promise<void> {
  await payload.delete({
    collection: 'club-sections',
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
  await permanentlyRemoveTestSections()
  await deleteTestRole()

  const [administratorRole, editorRole] = await Promise.all([
    findRole('administrator'),
    findRole('editor'),
  ])
  administrator = createAuthenticatedUser(-20, administratorRole)
  editor = createAuthenticatedUser(-21, editorRole)
  permanentDeleteRole = await payload.create({
    collection: 'roles',
    data: {
      key: 'trash_integration_permanent_deleter',
      name: 'Trash integration permanent deleter',
      permissions: [
        {
          permanentDeleteAllowed: true,
          readAllowed: true,
          resource: 'club-sections',
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
    await permanentlyRemoveTestSections()
    await deleteTestRole()
  }
})

describe('content trash integration', () => {
  it('lets an editor move content to trash and restore it', async () => {
    const section = await createSection('trash-editor-restore')
    const trashedSection = await moveToTrash(section.id)

    expect(trashedSection.deletedAt).toBeTypeOf('string')

    const regularResult = await payload.find({
      collection: 'club-sections',
      overrideAccess: false,
      user: editor,
      where: { id: { equals: section.id } },
    })
    expect(regularResult.docs).toHaveLength(0)

    const versions = await payload.findVersions({
      collection: 'club-sections',
      overrideAccess: false,
      trash: true,
      user: editor,
      where: { parent: { equals: section.id } },
    })
    expect(versions.docs.length).toBeGreaterThan(0)
    await expect(
      payload.restoreVersion({
        collection: 'club-sections',
        id: versions.docs[0]!.id,
        overrideAccess: false,
        user: editor,
      }),
    ).rejects.toMatchObject({ status: 403 })

    const restoredSection = await payload.update({
      collection: 'club-sections',
      data: { deletedAt: null },
      id: section.id,
      overrideAccess: false,
      trash: true,
      user: editor,
    })

    expect(restoredSection.deletedAt).toBeNull()
  })

  it('does not grant an administrator unconfigured read or restore access', async () => {
    const section = await createSection('trash-administrator-restore')
    await moveToTrash(section.id)

    await expect(
      payload.findByID({
        collection: 'club-sections',
        id: section.id,
        overrideAccess: false,
        trash: true,
        user: administrator,
      }),
    ).rejects.toBeDefined()

    await expect(
      payload.update({
        collection: 'club-sections',
        data: { deletedAt: null },
        id: section.id,
        overrideAccess: false,
        trash: true,
        user: administrator,
      }),
    ).rejects.toBeDefined()
  })

  it('does not treat regular update permission as restore permission', async () => {
    const section = await createSection('trash-update-without-restore')
    await moveToTrash(section.id)

    await expect(
      payload.update({
        collection: 'club-sections',
        data: { deletedAt: null, id: section.id },
        id: section.id,
        overrideAccess: false,
        trash: true,
        user: permanentDeleter,
      }),
    ).rejects.toMatchObject({ status: 403 })
  })

  it('uses explicit permission for single and bulk permanent deletion', async () => {
    const sections = await Promise.all([
      createSection('trash-bulk-first'),
      createSection('trash-bulk-second'),
    ])
    await Promise.all(sections.map(({ id }) => moveToTrash(id)))

    await expect(
      payload.delete({
        collection: 'club-sections',
        id: sections[0].id,
        overrideAccess: false,
        trash: true,
        user: editor,
      }),
    ).rejects.toBeDefined()

    await expect(
      payload.delete({
        collection: 'club-sections',
        overrideAccess: false,
        trash: true,
        user: editor,
        where: { id: { in: sections.map(({ id }) => id) } },
      }),
    ).rejects.toMatchObject({ status: 403 })

    await expect(
      payload.delete({
        collection: 'club-sections',
        overrideAccess: false,
        trash: true,
        user: administrator,
        where: { id: { in: sections.map(({ id }) => id) } },
      }),
    ).rejects.toMatchObject({ status: 403 })

    const stillTrashed = await payload.find({
      collection: 'club-sections',
      overrideAccess: true,
      trash: true,
      where: { id: { in: sections.map(({ id }) => id) } },
    })
    expect(stillTrashed.docs).toHaveLength(2)

    const permanentDeleteResult = await payload.delete({
      collection: 'club-sections',
      overrideAccess: false,
      trash: true,
      user: permanentDeleter,
      where: { id: { in: sections.map(({ id }) => id) } },
    })
    expect(permanentDeleteResult.docs).toHaveLength(2)

    const permanentlyDeleted = await payload.find({
      collection: 'club-sections',
      overrideAccess: true,
      trash: true,
      where: { id: { in: sections.map(({ id }) => id) } },
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
    const administratorSectionPermission = administratorRole.permissions?.find(
      ({ resource }) => resource === 'club-sections',
    )
    const editorSectionPermission = editorRole.permissions?.find(
      ({ resource }) => resource === 'club-sections',
    )

    expect(administratorSectionPermission).toBeUndefined()
    expect(editorSectionPermission).toMatchObject({
      permanentDeleteAllowed: false,
      restoreAllowed: true,
    })
  })
})
