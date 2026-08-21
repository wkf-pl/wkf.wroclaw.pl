import { describe, expect, it, vi } from 'vitest'

import { DocumentFiles } from '@/collections/DocumentFiles'
import { Documents } from '@/collections/Documents'

function getHook<T>(hook: T | T[] | undefined, name: string): T {
  const candidate = Array.isArray(hook) ? hook[0] : hook
  if (typeof candidate !== 'function') {
    throw new Error(`Missing ${name} hook.`)
  }
  return candidate
}

describe('document file hooks', () => {
  it('validates every selected file with one query', async () => {
    const find = vi.fn().mockResolvedValue({
      docs: [
        { document: null, id: 11 },
        { document: null, id: 12 },
      ],
    })
    const hook = getHook(Documents.hooks?.beforeValidate, 'documents.beforeValidate')

    await hook({
      data: { attachments: [12], primaryFile: 11 },
      operation: 'create',
      req: { payload: { find }, user: null },
    } as never)

    expect(find).toHaveBeenCalledTimes(1)
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'document-files',
        depth: 0,
        pagination: false,
        where: { id: { in: [11, 12] } },
      }),
    )
  })

  it('assigns every selected file with one bulk update', async () => {
    const update = vi.fn().mockResolvedValue({ docs: [] })
    const hook = getHook(Documents.hooks?.afterChange, 'documents.afterChange')

    await hook({
      doc: { attachments: [12], id: 5, primaryFile: 11 },
      req: { payload: { update } },
    } as never)

    expect(update).toHaveBeenCalledTimes(1)
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'document-files',
        data: { document: 5 },
        where: { id: { in: [11, 12] } },
      }),
    )
  })

  it('deletes every owned file with one bulk delete', async () => {
    const find = vi.fn()
    const deleteDocuments = vi.fn().mockResolvedValue({ docs: [] })
    const hook = getHook(Documents.hooks?.beforeDelete, 'documents.beforeDelete')

    await hook({
      id: 5,
      req: { payload: { delete: deleteDocuments, find } },
    } as never)

    expect(find).not.toHaveBeenCalled()
    expect(deleteDocuments).toHaveBeenCalledTimes(1)
    expect(deleteDocuments).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'document-files',
        context: { deletingDocumentId: 5 },
        where: { document: { equals: 5 } },
      }),
    )
  })

  it('skips per-file reference queries during a parent document deletion', async () => {
    const count = vi.fn()
    const findByID = vi.fn()
    const hook = getHook(DocumentFiles.hooks?.beforeDelete, 'document-files.beforeDelete')

    await hook({
      id: 11,
      req: {
        context: { deletingDocumentId: 5 },
        payload: { count, findByID },
      },
    } as never)

    expect(findByID).not.toHaveBeenCalled()
    expect(count).not.toHaveBeenCalled()
  })

  it('checks standalone deletion references without loading the file', async () => {
    const count = vi.fn().mockResolvedValue({ totalDocs: 0 })
    const findByID = vi.fn()
    const hook = getHook(DocumentFiles.hooks?.beforeDelete, 'document-files.beforeDelete')

    await hook({
      id: 11,
      req: { context: {}, payload: { count, findByID } },
    } as never)

    expect(findByID).not.toHaveBeenCalled()
    expect(count).toHaveBeenCalledTimes(1)
  })
})
