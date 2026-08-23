import type { Access, PayloadRequest } from 'payload'

import { getRelationshipId } from '@/lib/relationships'
import { createRolePermissionAccess } from '@/modules/membership/role-permissions'
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

export async function findPublicDocumentFileIds(req: PayloadRequest): Promise<(number | string)[]> {
  const documents = await req.payload.find({
    collection: 'documents',
    context: publicRequestContext,
    depth: 0,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    req,
  })
  const fileIds = new Set<number | string>()

  for (const document of documents.docs) {
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
  if (!isPublicRequest(arguments_.req, arguments_.isReadingStaticFile)) {
    return readDocumentFilesByPermission(arguments_)
  }

  const publicFileIds = await findPublicDocumentFileIds(arguments_.req)
  return publicFileIds.length > 0 ? { id: { in: publicFileIds } } : false
}
