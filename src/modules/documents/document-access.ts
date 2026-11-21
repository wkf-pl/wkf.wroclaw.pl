import { sql } from '@payloadcms/db-postgres'
import type { Access, PayloadRequest } from 'payload'

import { collectPayloadPages } from '@/lib/payload-pagination'
import { getRelationshipId, type RelationshipID } from '@/lib/relationships'
import { getTransactionExecutor } from '@/modules/content/lock-content-author'
import { createRolePermissionAccess } from '@/modules/membership/role-access'
import {
  isPublicRequest,
  publicRequestContext,
  publishedPublicAccess,
} from '@/modules/content/public-access'

export const readDocuments = createRolePermissionAccess({
  operation: 'read',
  publicAccess: publishedPublicAccess,
  resource: 'documents',
})
const readDocumentFilesByPermission = createRolePermissionAccess({
  operation: 'read',
  resource: 'documents',
})

async function findPublicDocumentFileId(
  req: PayloadRequest,
  selector: { id: RelationshipID } | { filename: string },
): Promise<number | undefined> {
  const transactionID = await req.transactionID
  const execute =
    transactionID == null
      ? (statement: ReturnType<typeof sql>) => req.payload.db.drizzle.execute(statement)
      : await getTransactionExecutor(req)
  const where =
    'id' in selector ? sql`file.id = ${selector.id}` : sql`file.filename = ${selector.filename}`
  const result: { rows: { id: number }[] } = await execute(sql`
    SELECT file.id
    FROM public.document_files AS file
    WHERE ${where}
      AND (
        EXISTS (
          SELECT 1 FROM public.documents AS document
          WHERE document.primary_file_id = file.id
            AND document._status = 'published'
            AND document.deleted_at IS NULL
        )
        OR EXISTS (
          SELECT 1
          FROM public.documents_rels AS attachment
          JOIN public.documents AS document ON document.id = attachment.parent_id
          WHERE attachment.document_files_id = file.id
            AND attachment.path = 'attachments'
            AND document._status = 'published'
            AND document.deleted_at IS NULL
        )
      )
  `)
  return result.rows[0]?.id
}

async function findPublicDocumentFileIds(req: PayloadRequest): Promise<RelationshipID[]> {
  const documents = await collectPayloadPages((page) =>
    req.payload.find({
      collection: 'documents',
      context: publicRequestContext,
      depth: 0,
      draft: false,
      limit: 100,
      overrideAccess: false,
      page,
      req,
      select: { attachments: true, primaryFile: true },
      user: null,
    }),
  )
  const fileIds = new Set<number | string>()

  for (const document of documents) {
    const primaryFileId = getRelationshipId(document.primaryFile)
    if (primaryFileId !== undefined) {
      fileIds.add(primaryFileId)
    }

    for (const attachment of document.attachments ?? []) {
      const attachmentId = getRelationshipId(attachment)
      if (attachmentId !== undefined) {
        fileIds.add(attachmentId)
      }
    }
  }

  return [...fileIds]
}

export const readDocumentFiles: Access = async (arguments_) => {
  const { data, id, isReadingStaticFile, req } = arguments_
  if (!isPublicRequest(req, isReadingStaticFile)) {
    return readDocumentFilesByPermission(arguments_)
  }

  if (id !== undefined) {
    const numericId = Number(id)
    if (!Number.isInteger(numericId) || numericId < 1 || numericId > 2147483647) return false
    const publicFileId = await findPublicDocumentFileId(req, { id: numericId })
    return publicFileId === undefined ? false : { id: { equals: publicFileId } }
  }

  if (isReadingStaticFile && typeof data?.filename === 'string') {
    const publicFileId = await findPublicDocumentFileId(req, { filename: data.filename })
    return publicFileId === undefined ? false : { id: { equals: publicFileId } }
  }

  const publicFileIds = await findPublicDocumentFileIds(req)
  return publicFileIds.length > 0 ? { id: { in: publicFileIds } } : false
}
