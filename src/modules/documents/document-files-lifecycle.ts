import {
  APIError,
  type CollectionAfterChangeHook,
  type CollectionBeforeDeleteHook,
  type CollectionBeforeValidateHook,
} from 'payload'

import { getRelationshipId, getRelationshipIds } from '@/lib/relationships'

function getSelectedFileIds(data: Record<string, unknown>): (number | string)[] {
  return [
    ...new Map(
      getRelationshipIds([
        data.primaryFile,
        ...(Array.isArray(data.attachments) ? data.attachments : []),
      ]).map((id) => [String(id), id]),
    ).values(),
  ]
}

export const assignDocumentFiles: CollectionAfterChangeHook = async ({ doc, req }) => {
  const selectedFileIds = getSelectedFileIds(doc)
  if (selectedFileIds.length > 0) {
    await req.payload.update({
      collection: 'document-files',
      context: { assigningDocumentFile: true },
      data: { document: doc.id },
      overrideAccess: true,
      req,
      where: { id: { in: selectedFileIds } },
    })
  }
  return doc
}

export const deleteDocumentFiles: CollectionBeforeDeleteHook = async ({ id, req }) => {
  await req.payload.delete({
    collection: 'document-files',
    context: { ...req.context, deletingDocumentId: id },
    overrideAccess: true,
    req,
    where: { document: { equals: id } },
  })
}

export const validateDocumentFiles: CollectionBeforeValidateHook = async ({
  data,
  originalDoc,
  req,
}) => {
  const nextData = { ...originalDoc, ...data }
  const selectedFileIds = getSelectedFileIds(nextData)

  if (selectedFileIds.length > 0) {
    const files = await req.payload.find({
      collection: 'document-files',
      depth: 0,
      limit: selectedFileIds.length,
      overrideAccess: true,
      pagination: false,
      req,
      select: { document: true, id: true },
      where: { id: { in: selectedFileIds } },
    })
    const filesByID = new Map(files.docs.map((file) => [String(file.id), file]))
    const documentId = getRelationshipId(originalDoc?.id)

    for (const fileId of selectedFileIds) {
      const file = filesByID.get(String(fileId))
      if (!file) throw new APIError('Nie znaleziono wybranego pliku dokumentu.', 400)

      const ownerDocumentId = getRelationshipId(file.document)
      if (ownerDocumentId !== undefined && ownerDocumentId !== documentId) {
        throw new APIError('Wybrany plik należy już do innego dokumentu.', 400)
      }
    }
  }

  return nextData
}
