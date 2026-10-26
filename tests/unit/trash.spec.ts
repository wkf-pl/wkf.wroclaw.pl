import type { Access, PayloadRequest } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import { ClubSections } from '@/collections/ClubSections'
import { DocumentFiles } from '@/collections/DocumentFiles'
import { Documents } from '@/collections/Documents'
import { EventCycles } from '@/collections/EventCycles'
import { Events } from '@/collections/Events'
import { Media } from '@/collections/Media'
import { MemberProfileImages } from '@/collections/MemberProfileImages'
import { MemberProfiles } from '@/collections/MemberProfiles'
import { Pages } from '@/collections/Pages'
import { Partners } from '@/collections/Partners'
import { Posts } from '@/collections/Posts'
import {
  createTrashDeleteAccess,
  createTrashReadAccess,
  createTrashUpdateAccess,
  markTrashMutation,
} from '@/modules/content/trash-access'

const request = {} as PayloadRequest

function createRoleRequest(permissions: Record<string, unknown>[]): PayloadRequest {
  return {
    payload: {
      find: vi.fn().mockResolvedValue({
        docs: [{ id: 1, permissions }],
      }),
    },
    user: { id: 10, roles: [1] },
  } as unknown as PayloadRequest
}

function checkAccess(access: Access, req: PayloadRequest, data?: Record<string, unknown>) {
  return access({ data, req } as Parameters<Access>[0])
}

function markUpdate(req: PayloadRequest, data: Record<string, unknown>): void {
  markTrashMutation({
    args: { data },
    operation: 'update',
    req,
  } as unknown as Parameters<typeof markTrashMutation>[0])
}

describe('trash configuration', () => {
  it.each([
    ['pages', Pages],
    ['posts', Posts],
    ['events', Events],
    ['event-cycles', EventCycles],
    ['documents', Documents],
    ['partners', Partners],
    ['club-sections', ClubSections],
    ['member-profiles', MemberProfiles],
  ])('enables trash for %s', (_slug, collection) => {
    expect(collection.trash).toBe(true)
  })

  it.each([
    ['media', Media],
    ['document-files', DocumentFiles],
    ['member-profile-images', MemberProfileImages],
  ])('does not enable trash for blob-backed %s', (_slug, collection) => {
    expect(collection.trash).not.toBe(true)
  })
})

describe('trash access', () => {
  it('uses regular delete permission when moving a document to trash', async () => {
    const deleteAccess = createTrashDeleteAccess(
      () => true,
      () => false,
    )

    await expect(
      checkAccess(deleteAccess, request, { deletedAt: new Date(0).toISOString() }),
    ).resolves.toBe(true)
  })

  it('uses explicit permanent-delete permission for single and bulk deletion', async () => {
    const allowedDeleteAccess = createTrashDeleteAccess(
      () => false,
      () => true,
    )
    const deniedDeleteAccess = createTrashDeleteAccess(
      () => true,
      () => false,
    )

    await expect(checkAccess(allowedDeleteAccess, request)).resolves.toBe(true)
    await expect(checkAccess(deniedDeleteAccess, request)).resolves.toBe(false)
  })

  it('uses regular delete permission when checking a move to trash', async () => {
    const deleteAccess = createTrashDeleteAccess(
      () => true,
      () => false,
    )

    await expect(
      checkAccess(deleteAccess, request, {
        deletedAt: new Date(0).toISOString(),
        id: 1,
      }),
    ).resolves.toBe(true)
  })

  it('uses permanent-delete permission for the permanent-delete UI check', async () => {
    const deleteAccess = createTrashDeleteAccess(
      () => true,
      () => false,
    )

    await expect(checkAccess(deleteAccess, request, { id: 1 })).resolves.toBe(false)
  })

  it('keeps system pages protected from permanent deletion', async () => {
    const deleteAccess = Pages.access?.delete
    const permanentDeleteRequest = createRoleRequest([
      { permanentDeleteAllowed: true, resource: 'pages' },
    ])

    expect(deleteAccess).toBeTypeOf('function')
    await expect(checkAccess(deleteAccess as Access, permanentDeleteRequest)).resolves.toEqual({
      or: [{ systemKey: { exists: false } }, { systemKey: { not_in: ['blog', 'events'] } }],
    })
  })

  it('does not broaden read access', async () => {
    const readAccess = createTrashReadAccess(() => false)

    await expect(checkAccess(readAccess, request)).resolves.toBe(false)
  })

  it('uses explicit restore permission for a restore request', async () => {
    const allowedUpdateAccess = createTrashUpdateAccess(
      () => false,
      () => true,
    )
    const deniedUpdateAccess = createTrashUpdateAccess(
      () => true,
      () => false,
    )
    const allowedRequest = {} as PayloadRequest
    const deniedRequest = {} as PayloadRequest

    markUpdate(allowedRequest, { deletedAt: null })
    markUpdate(deniedRequest, { deletedAt: null, id: 1 })

    await expect(
      checkAccess(allowedUpdateAccess, allowedRequest, { deletedAt: null }),
    ).resolves.toBe(true)
    await expect(
      checkAccess(deniedUpdateAccess, deniedRequest, { deletedAt: null, id: 1 }),
    ).resolves.toBe(false)
  })

  it('uses restore permission when checking a trashed document', async () => {
    const updateAccess = createTrashUpdateAccess(
      () => true,
      () => false,
    )

    await expect(
      checkAccess(updateAccess, request, {
        deletedAt: new Date(0).toISOString(),
        id: 1,
      }),
    ).resolves.toBe(false)
  })

  it('keeps regular updates and trash moves under update permission', async () => {
    const updateAccess = createTrashUpdateAccess(
      () => true,
      () => false,
    )
    const regularUpdateRequest = {} as PayloadRequest
    const trashRequest = {} as PayloadRequest

    markUpdate(regularUpdateRequest, { title: 'Updated' })
    markUpdate(trashRequest, { deletedAt: new Date(0).toISOString() })

    await expect(
      checkAccess(updateAccess, regularUpdateRequest, { title: 'Updated' }),
    ).resolves.toBe(true)
    await expect(
      checkAccess(updateAccess, trashRequest, { deletedAt: new Date(0).toISOString() }),
    ).resolves.toBe(true)
    await expect(checkAccess(updateAccess, request, { deletedAt: null, id: 1 })).resolves.toBe(true)
  })

  it('combines update and restore permission for collection-level UI checks', async () => {
    const scopedUpdateAccess = { author: { equals: 10 } }
    const scopedRestoreAccess = { _status: { equals: 'published' } }
    const updateAccess = createTrashUpdateAccess(
      () => scopedUpdateAccess,
      () => scopedRestoreAccess,
    )

    await expect(checkAccess(updateAccess, request)).resolves.toEqual({
      or: [scopedUpdateAccess, scopedRestoreAccess],
    })
  })
})
