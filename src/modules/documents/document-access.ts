import type { Access, AccessResult, PayloadRequest } from 'payload'

import { getRelationshipId } from '@/lib/relationships'
import {
  combineAccessResults,
  createCollectionRolePermissionAccess,
  createRolePermissionAccess,
  websiteRequestContext,
} from '@/modules/membership/role-permissions'

export const readDocuments = createCollectionRolePermissionAccess({
  collection: 'documents',
  operation: 'read',
})
const readDocumentFilesByPermission = createRolePermissionAccess({
  operation: 'read',
  resource: 'document-files',
})

export async function findAccessibleDocumentFileIds(
  req: PayloadRequest,
): Promise<(number | string)[]> {
  const documents = await req.payload.find({
    collection: 'documents',
    context: websiteRequestContext,
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
  const permissionAccess = await readDocumentFilesByPermission(arguments_)
  if (permissionAccess === true) {
    return true
  }

  const isWebsiteRequest =
    arguments_.req.context?.website === true || arguments_.isReadingStaticFile === true
  if (!isWebsiteRequest) {
    return permissionAccess
  }

  const accessibleFileIds = await findAccessibleDocumentFileIds(arguments_.req)
  const relationshipAccess: AccessResult =
    accessibleFileIds.length > 0 ? { id: { in: accessibleFileIds } } : false

  return combineAccessResults(permissionAccess, relationshipAccess)
}
