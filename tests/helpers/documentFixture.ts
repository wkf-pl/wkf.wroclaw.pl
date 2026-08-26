import type { Payload } from 'payload'

import type { Document, User } from '@/payload-types'

import { editorTestUser } from './seedUser'

const testPDF = Buffer.from(
  '%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\nxref\n0 1\n0000000000 65535 f\n%%EOF\n',
)

export async function createPublishedDocumentFixture(
  payload: Payload,
  fixtureName: string,
): Promise<Document> {
  await deletePublishedDocumentFixture(payload, fixtureName)

  const users = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { email: { equals: editorTestUser.email } },
  })
  const author = users.docs[0] as User | undefined

  if (!author) {
    throw new Error('Missing E2E editor user.')
  }

  const primaryFile = await payload.create({
    collection: 'document-files',
    data: { label: `PDF ${fixtureName}` },
    file: {
      data: testPDF,
      mimetype: 'application/pdf',
      name: `${fixtureName}.pdf`,
      size: testPDF.length,
    },
    overrideAccess: true,
  })

  try {
    return await payload.create({
      collection: 'documents',
      data: {
        _status: 'published',
        author: author.id,
        documentDate: '2026-08-26T00:00:00.000Z',
        documentType: 'statute',
        primaryFile: primaryFile.id,
        slug: fixtureName,
        summary: 'Dokument używany przez testy E2E.',
        title: `Dokument E2E ${fixtureName}`,
      },
      overrideAccess: true,
    })
  } catch (error) {
    await payload.delete({
      collection: 'document-files',
      id: primaryFile.id,
      overrideAccess: true,
    })
    throw error
  }
}

export async function deletePublishedDocumentFixture(
  payload: Payload,
  fixtureName: string,
): Promise<void> {
  await payload.delete({
    collection: 'documents',
    overrideAccess: true,
    where: { slug: { equals: fixtureName } },
  })
  await payload.delete({
    collection: 'document-files',
    overrideAccess: true,
    where: { filename: { equals: `${fixtureName}.pdf` } },
  })
}
