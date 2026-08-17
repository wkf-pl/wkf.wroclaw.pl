import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { getPayload, type Payload } from 'payload'

import config from '@/payload.config'
import type { Document, Role, User, WebsitePermission } from '@/payload-types'
import { websiteRequestContext } from '@/modules/membership/role-permissions'

const testSlugs = ['integration-public-document', 'integration-role-document']
const testPDF = Buffer.from(
  '%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\nxref\n0 1\n0000000000 65535 f\n%%EOF\n',
)

let payload: Payload
let author: User
let memberRole: Role
let userRole: Role
let publicDocument: Document
let roleDocument: Document
let originalWebsitePermissions: WebsitePermission['permissions']

function createAuthenticatedUser(id: number, role: Role): User {
  return {
    collection: 'users',
    createdAt: new Date(0).toISOString(),
    displayName: `Document Access Test ${id}`,
    email: `document-access-${id}@example.invalid`,
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
  if (!result.docs[0]) throw new Error(`Missing role: ${key}`)
  return result.docs[0]
}

async function cleanupTestDocuments(): Promise<void> {
  const documents = await payload.find({
    collection: 'documents',
    depth: 0,
    limit: testSlugs.length,
    overrideAccess: true,
    pagination: false,
    where: { slug: { in: testSlugs } },
  })

  for (const document of documents.docs) {
    await payload.delete({
      collection: 'documents',
      id: document.id,
      overrideAccess: true,
    })
  }
}

beforeAll(async () => {
  payload = await getPayload({ config })
  await cleanupTestDocuments()

  const users = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
  })
  if (!users.docs[0]) throw new Error('Integration test requires an existing author.')
  author = users.docs[0]
  ;[memberRole, userRole] = await Promise.all([findRole('member'), findRole('user')])

  const websitePermissions = await payload.findGlobal({
    slug: 'website-permissions',
    depth: 0,
    overrideAccess: true,
  })
  originalWebsitePermissions = websitePermissions.permissions
  const retainedPermissions = (websitePermissions.permissions ?? []).filter(
    ({ resource }) => resource !== 'documents-resolution' && resource !== 'documents-statute',
  )
  await payload.updateGlobal({
    slug: 'website-permissions',
    data: {
      permissions: [
        ...retainedPermissions,
        {
          anonymousAllowed: true,
          resource: 'documents-resolution',
          roles: [],
        },
        {
          anonymousAllowed: false,
          resource: 'documents-statute',
          roles: [memberRole.id],
        },
      ],
    },
    overrideAccess: true,
  })

  const [publicFile, roleFile] = await Promise.all([
    payload.create({
      collection: 'document-files',
      data: { label: 'Publiczny PDF' },
      file: {
        data: testPDF,
        mimetype: 'application/pdf',
        name: 'integration-public.pdf',
        size: testPDF.length,
      },
      overrideAccess: true,
    }),
    payload.create({
      collection: 'document-files',
      data: { label: 'PDF dla roli' },
      file: {
        data: testPDF,
        mimetype: 'application/pdf',
        name: 'integration-role.pdf',
        size: testPDF.length,
      },
      overrideAccess: true,
    }),
  ])

  ;[publicDocument, roleDocument] = await Promise.all([
    payload.create({
      collection: 'documents',
      data: {
        _status: 'published',
        author: author.id,
        documentDate: '2026-08-14T00:00:00.000Z',
        documentNumber: 'INTEGRATION-PUBLIC/2026',
        documentType: 'resolution',
        primaryFile: publicFile.id,
        slug: testSlugs[0],
        summary: 'Public document integration test.',
        title: 'Integration public document',
      },
      overrideAccess: true,
    }),
    payload.create({
      collection: 'documents',
      data: {
        _status: 'published',
        author: author.id,
        documentDate: '2026-08-14T00:00:00.000Z',
        documentType: 'statute',
        primaryFile: roleFile.id,
        slug: testSlugs[1],
        summary: 'Role-only document integration test.',
        title: 'Integration role document',
      },
      overrideAccess: true,
    }),
  ])
}, 20_000)

afterAll(async () => {
  if (!payload) return
  await cleanupTestDocuments()
  await payload.updateGlobal({
    slug: 'website-permissions',
    data: { permissions: originalWebsitePermissions },
    overrideAccess: true,
  })
})

describe('document website access integration', () => {
  it('shows anonymous users only document types enabled for anonymous access', async () => {
    const result = await payload.find({
      collection: 'documents',
      context: websiteRequestContext,
      overrideAccess: false,
      user: null,
      where: { slug: { in: testSlugs } },
    })

    expect(result.docs.map(({ id }) => id)).toEqual([publicDocument.id])
  })

  it('adds role-only website access without granting CMS or API read access', async () => {
    const user = createAuthenticatedUser(-10, memberRole)
    const websiteDocuments = await payload.find({
      collection: 'documents',
      context: websiteRequestContext,
      overrideAccess: false,
      user,
      where: { slug: { in: testSlugs } },
    })
    expect(websiteDocuments.docs.map(({ id }) => id).sort()).toEqual(
      [publicDocument.id, roleDocument.id].sort(),
    )
    await expect(
      payload.find({
        collection: 'documents',
        overrideAccess: false,
        user,
        where: { slug: { in: testSlugs } },
      }),
    ).rejects.toMatchObject({ status: 403 })
    await expect(
      payload.find({
        collection: 'document-files',
        overrideAccess: false,
        user,
      }),
    ).rejects.toMatchObject({ status: 403 })
  })

  it('does not reveal role-only documents or inherited files to another role', async () => {
    const user = createAuthenticatedUser(-11, userRole)
    const documents = await payload.find({
      collection: 'documents',
      context: websiteRequestContext,
      overrideAccess: false,
      user,
      where: { slug: { equals: testSlugs[1] } },
    })
    const files = await payload.find({
      collection: 'document-files',
      context: websiteRequestContext,
      overrideAccess: false,
      user,
    })

    expect(documents.docs).toEqual([])
    expect(files.docs.some(({ id }) => id === roleDocument.primaryFile)).toBe(false)
  })
})
