import type { Access, PayloadRequest } from 'payload'

import { collectPayloadPages } from '@/lib/payload-pagination'
import { getRelationshipId } from '@/lib/relationships'
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

export async function findPublicDocumentFileIds(req: PayloadRequest): Promise<(number | string)[]> {
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
  if (!isPublicRequest(arguments_.req, arguments_.isReadingStaticFile)) {
    return readDocumentFilesByPermission(arguments_)
  }

  const publicFileIds = await findPublicDocumentFileIds(arguments_.req)
  return publicFileIds.length > 0 ? { id: { in: publicFileIds } } : false
}
