import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { getPayload, type Payload } from 'payload'

import config from '@/payload.config'
import type { Role, Tag, User } from '@/payload-types'
import { publicRequestContext } from '@/modules/content/public-access'
import { findPublicUrlAliasDestination } from '@/modules/url-aliases/public-url-aliases'

import { createIntegrationAuthor, deleteIntegrationAuthor } from '../helpers/integration-author'
import { createLexicalDocument } from '../helpers/lexical-document'

const aliasSlugs = [
  'integration-alias-crud',
  'integration-alias-updated',
  'integration-alias-public',
  'integration-alias-page-first',
  'integration-alias-first',
  'integration-alias-resolver',
]
const pageSlugs = [
  'integration-alias-page-first',
  'integration-alias-first',
  'integration-alias-target',
  'integration-alias-target-updated',
]
const targetTagSlug = 'integration-alias-target-tag'

let payload: Payload
let author: User
let editorRole: Role
let userRole: Role
let targetTag: Tag

function createAuthenticatedUser(id: number, role: Role): User {
  return {
    collection: 'users',
    createdAt: new Date(0).toISOString(),
    displayName: `URL Alias Access Test ${id}`,
    email: `url-alias-access-${id}@example.invalid`,
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

  if (!role) throw new Error(`Missing migrated role: ${key}`)
  return role
}

async function cleanup(): Promise<void> {
  if (!payload) return

  await payload.delete({
    collection: 'url-aliases',
    overrideAccess: true,
    where: { slug: { in: aliasSlugs } },
  })
  await payload.delete({
    collection: 'pages',
    overrideAccess: true,
    where: { slug: { in: pageSlugs } },
  })
  await payload.delete({
    collection: 'tags',
    overrideAccess: true,
    where: { slug: { equals: targetTagSlug } },
  })
}

beforeAll(async () => {
  payload = await getPayload({ config })
  await cleanup()
  author = await createIntegrationAuthor(payload, 'url-aliases')
  ;[editorRole, userRole] = await Promise.all([findRole('editor'), findRole('user')])
  targetTag = await payload.create({
    collection: 'tags',
    data: { name: 'Integration alias target', slug: targetTagSlug },
    overrideAccess: true,
  })
})

afterAll(async () => {
  await cleanup()
  await deleteIntegrationAuthor(payload, author)
})

describe('URL aliases integration', () => {
  it('allows full CRUD for editors and denies creation without a grant', async () => {
    const editor = createAuthenticatedUser(-20, editorRole)
    const alias = await payload.create({
      collection: 'url-aliases',
      data: {
        slug: '/Integration Alias CRUD/',
        target: { relationTo: 'tags', value: targetTag.id },
      },
      overrideAccess: false,
      user: editor,
    })

    expect(alias.slug).toBe('integration-alias-crud')
    await expect(
      payload.findByID({
        collection: 'url-aliases',
        id: alias.id,
        overrideAccess: false,
        user: editor,
      }),
    ).resolves.toMatchObject({ id: alias.id })

    const updatedAlias = await payload.update({
      collection: 'url-aliases',
      id: alias.id,
      data: { slug: 'integration-alias-updated' },
      overrideAccess: false,
      user: editor,
    })
    expect(updatedAlias.slug).toBe('integration-alias-updated')

    await expect(
      payload.delete({
        collection: 'url-aliases',
        id: alias.id,
        overrideAccess: false,
        user: editor,
      }),
    ).resolves.toMatchObject({ id: alias.id })

    await expect(
      payload.create({
        collection: 'url-aliases',
        data: {
          slug: 'integration-alias-crud',
          target: { relationTo: 'tags', value: targetTag.id },
        },
        overrideAccess: false,
        user: createAuthenticatedUser(-21, userRole),
      }),
    ).rejects.toMatchObject({ status: 403 })
  })

  it('allows anonymous reads only in the controlled public request context', async () => {
    await payload.create({
      collection: 'url-aliases',
      data: {
        slug: 'integration-alias-public',
        target: { relationTo: 'tags', value: targetTag.id },
      },
      overrideAccess: true,
    })

    await expect(
      payload.find({
        collection: 'url-aliases',
        overrideAccess: false,
        user: null,
      }),
    ).rejects.toMatchObject({ status: 403 })

    await expect(
      payload.find({
        collection: 'url-aliases',
        context: publicRequestContext,
        overrideAccess: false,
        user: null,
        where: { slug: { equals: 'integration-alias-public' } },
      }),
    ).resolves.toMatchObject({ totalDocs: 1 })
  })

  it('rejects alias and page collisions regardless of creation order', async () => {
    const page = await payload.create({
      collection: 'pages',
      data: {
        _status: 'draft',
        author: author.id,
        slug: 'integration-alias-page-first',
        title: 'Integration page first',
      },
      draft: true,
      overrideAccess: true,
    })

    await expect(
      payload.create({
        collection: 'url-aliases',
        data: {
          slug: 'integration-alias-page-first',
          target: { relationTo: 'tags', value: targetTag.id },
        },
        overrideAccess: true,
      }),
    ).rejects.toMatchObject({ status: 400 })

    await payload.delete({ collection: 'pages', id: page.id, overrideAccess: true })
    await payload.create({
      collection: 'url-aliases',
      data: {
        slug: 'integration-alias-first',
        target: { relationTo: 'tags', value: targetTag.id },
      },
      overrideAccess: true,
    })

    await expect(
      payload.create({
        collection: 'pages',
        data: {
          _status: 'draft',
          author: author.id,
          slug: 'integration-alias-first',
          title: 'Integration alias first',
        },
        draft: true,
        overrideAccess: true,
      }),
    ).rejects.toMatchObject({ status: 400 })
  })

  it('resolves the current published target after its slug changes', async () => {
    const page = await payload.create({
      collection: 'pages',
      data: {
        _status: 'published',
        author: author.id,
        layout: [
          { blockType: 'richText', content: createLexicalDocument('Integration alias target') },
        ],
        slug: 'integration-alias-target',
        title: 'Integration alias target',
      },
      draft: false,
      overrideAccess: true,
    })
    await payload.create({
      collection: 'url-aliases',
      data: {
        slug: 'integration-alias-resolver',
        target: { relationTo: 'pages', value: page.id },
      },
      overrideAccess: true,
    })

    await expect(findPublicUrlAliasDestination('integration-alias-resolver')).resolves.toBe(
      '/integration-alias-target',
    )

    await payload.update({
      collection: 'pages',
      id: page.id,
      data: { slug: 'integration-alias-target-updated' },
      overrideAccess: true,
    })

    await expect(findPublicUrlAliasDestination('integration-alias-resolver')).resolves.toBe(
      '/integration-alias-target-updated',
    )

    await payload.delete({ collection: 'pages', id: page.id, overrideAccess: true })
    await expect(findPublicUrlAliasDestination('integration-alias-resolver')).resolves.toBeNull()
  })
})
