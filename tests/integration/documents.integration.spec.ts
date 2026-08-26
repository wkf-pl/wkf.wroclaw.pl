import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { getPayload, type Payload } from 'payload'

import config from '@/payload.config'
import type { Category, Document, Role, Tag, User } from '@/payload-types'
import { publicRequestContext } from '@/modules/content/public-access'
import { findDocumentListing } from '@/modules/documents/document-listing'

import { createIntegrationAuthor, deleteIntegrationAuthor } from '../helpers/integration-author'

const testSlugs = ['integration-public-document', 'integration-role-document']
const testCategorySlug = 'integration-documents-category'
const testTagSlug = 'integration-documents-tag'
const testPDF = Buffer.from(
  '%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\nxref\n0 1\n0000000000 65535 f\n%%EOF\n',
)

let payload: Payload
let author: User
let memberRole: Role
let userRole: Role
let publicDocument: Document
let roleDocument: Document
let documentCategory: Category
let documentTag: Tag

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

  await payload.delete({
    collection: 'categories',
    overrideAccess: true,
    where: { slug: { equals: testCategorySlug } },
  })
  await payload.delete({
    collection: 'tags',
    overrideAccess: true,
    where: { slug: { equals: testTagSlug } },
  })

  author = await createIntegrationAuthor(payload, 'documents')
  ;[memberRole, userRole] = await Promise.all([findRole('member'), findRole('user')])
  ;[documentCategory, documentTag] = await Promise.all([
    payload.create({
      collection: 'categories',
      data: { name: 'Integration documents category', slug: testCategorySlug },
      overrideAccess: true,
    }),
    payload.create({
      collection: 'tags',
      data: { name: 'Integration documents tag', slug: testTagSlug },
      overrideAccess: true,
    }),
  ])

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
        category: documentCategory.id,
        documentDate: '2026-08-14T00:00:00.000Z',
        documentNumber: 'INTEGRATION-PUBLIC/2026',
        documentType: 'resolution',
        primaryFile: publicFile.id,
        slug: testSlugs[0],
        summary: 'Public document integration test.',
        tags: [documentTag.id],
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
  await payload.delete({ collection: 'categories', id: documentCategory.id, overrideAccess: true })
  await payload.delete({ collection: 'tags', id: documentTag.id, overrideAccess: true })
  await deleteIntegrationAuthor(payload, author)
})

describe('document website access integration', () => {
  it('shows every published document type to anonymous users', async () => {
    const result = await payload.find({
      collection: 'documents',
      context: publicRequestContext,
      overrideAccess: false,
      user: null,
      where: { slug: { in: testSlugs } },
    })

    expect(result.docs.map(({ id }) => id).sort()).toEqual(
      [publicDocument.id, roleDocument.id].sort(),
    )
  })

  it('filters the Documents block by taxonomy and preserves manual order', async () => {
    const filteredResult = await findDocumentListing({
      categoryId: documentCategory.id,
      page: 1,
      pageSize: 10,
      pagination: false,
      selectionMode: 'filters',
      sort: 'newest',
      tagId: documentTag.id,
    })
    expect(filteredResult.items.map(({ id }) => id)).toEqual([publicDocument.id])

    const manualResult = await findDocumentListing({
      manualDocuments: [roleDocument.id, publicDocument.id],
      page: 1,
      pageSize: 10,
      pagination: false,
      selectionMode: 'manual',
      sort: 'newest',
    })
    expect(manualResult.items.map(({ id }) => id)).toEqual([roleDocument.id, publicDocument.id])
  })

  it('keeps public results independent from the signed-in role without granting CMS access', async () => {
    const user = createAuthenticatedUser(-10, memberRole)
    const websiteDocuments = await payload.find({
      collection: 'documents',
      context: publicRequestContext,
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

  it('exposes files inherited from every published document', async () => {
    const user = createAuthenticatedUser(-11, userRole)
    const documents = await payload.find({
      collection: 'documents',
      context: publicRequestContext,
      overrideAccess: false,
      user,
      where: { slug: { in: testSlugs } },
    })
    const files = await payload.find({
      collection: 'document-files',
      context: publicRequestContext,
      overrideAccess: false,
      user,
    })

    const roleFileID =
      typeof roleDocument.primaryFile === 'object'
        ? roleDocument.primaryFile.id
        : roleDocument.primaryFile
    expect(documents.docs).toHaveLength(2)
    expect(files.docs.some(({ id }) => id === roleFileID)).toBe(true)
  })

  it('assigns multiple files and deletes them with their parent document', async () => {
    const fixtureID = Date.now()
    const createdFileIDs: number[] = []
    let createdDocumentID: number | undefined

    try {
      const primaryFile = await payload.create({
        collection: 'document-files',
        data: { label: 'Bulk primary PDF' },
        file: {
          data: testPDF,
          mimetype: 'application/pdf',
          name: `integration-bulk-primary-${fixtureID}.pdf`,
          size: testPDF.length,
        },
        overrideAccess: true,
      })
      const attachment = await payload.create({
        collection: 'document-files',
        data: { label: 'Bulk attachment PDF' },
        file: {
          data: testPDF,
          mimetype: 'application/pdf',
          name: `integration-bulk-attachment-${fixtureID}.pdf`,
          size: testPDF.length,
        },
        overrideAccess: true,
      })
      createdFileIDs.push(primaryFile.id, attachment.id)

      const document = await payload.create({
        collection: 'documents',
        data: {
          _status: 'draft',
          attachments: [attachment.id],
          author: author.id,
          documentDate: '2026-08-21T00:00:00.000Z',
          documentType: 'statute',
          primaryFile: primaryFile.id,
          slug: `integration-bulk-document-${fixtureID}`,
          title: 'Integration bulk document',
        },
        draft: true,
        overrideAccess: true,
      })
      createdDocumentID = document.id

      const assignedFiles = await payload.find({
        collection: 'document-files',
        depth: 0,
        overrideAccess: true,
        pagination: false,
        where: { id: { in: createdFileIDs } },
      })
      expect(assignedFiles.docs).toHaveLength(2)
      expect(
        assignedFiles.docs.map((file) =>
          typeof file.document === 'object' && file.document ? file.document.id : file.document,
        ),
      ).toEqual([document.id, document.id])

      await payload.delete({
        collection: 'documents',
        id: document.id,
        overrideAccess: true,
      })
      createdDocumentID = undefined

      const deletedFiles = await payload.find({
        collection: 'document-files',
        depth: 0,
        overrideAccess: true,
        pagination: false,
        where: { id: { in: createdFileIDs } },
      })
      expect(deletedFiles.docs).toEqual([])
    } finally {
      if (createdDocumentID !== undefined) {
        await payload.delete({
          collection: 'documents',
          id: createdDocumentID,
          overrideAccess: true,
        })
      }
      if (createdFileIDs.length > 0) {
        await payload.delete({
          collection: 'document-files',
          overrideAccess: true,
          where: { id: { in: createdFileIDs } },
        })
      }
    }
  })

  it('does not let another document take an assigned file', async () => {
    const primaryFileID =
      typeof publicDocument.primaryFile === 'object'
        ? publicDocument.primaryFile.id
        : publicDocument.primaryFile

    await expect(
      payload.create({
        collection: 'documents',
        data: {
          _status: 'draft',
          author: author.id,
          documentDate: '2026-08-21T00:00:00.000Z',
          documentType: 'statute',
          primaryFile: primaryFileID,
          slug: `integration-file-takeover-${Date.now()}`,
          title: 'Integration file takeover',
        },
        draft: true,
        overrideAccess: true,
      }),
    ).rejects.toMatchObject({ status: 400 })
  })

  it('does not delete a file while its document still references it', async () => {
    const primaryFileID =
      typeof publicDocument.primaryFile === 'object'
        ? publicDocument.primaryFile.id
        : publicDocument.primaryFile

    await expect(
      payload.delete({
        collection: 'document-files',
        id: primaryFileID,
        overrideAccess: true,
      }),
    ).rejects.toMatchObject({ status: 400 })
  })
})
