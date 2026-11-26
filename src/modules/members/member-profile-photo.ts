import { randomUUID } from 'node:crypto'
import { readFile, rm } from 'node:fs/promises'
import { Readable } from 'node:stream'
import { isDeepStrictEqual } from 'node:util'

import {
  APIError,
  type CollectionAfterDeleteHook,
  type CollectionBeforeChangeHook,
  type CollectionBeforeDeleteHook,
  type CollectionBeforeOperationHook,
  type Endpoint,
  type FieldAccess,
  type PayloadRequest,
} from 'payload'

import { getRelationshipId } from '@/lib/relationships'
import { createProfileImageSet, ImageInputError } from '@/modules/media/image-set'
import { getUserIdentity } from '@/modules/membership/permission-resolution'
import { createRolePermissionAccess } from '@/modules/membership/role-access'
import type { MemberProfile } from '@/payload-types'
import { getStorageContainerClient } from '@/storage/get-storage-container-client'
import { storeImageSet } from '@/storage/store-image-set'

import {
  memberProfilePhotoMimeTypes,
  memberProfilePhotoSizeLimit,
} from './member-profile-photo-options'

type StoredPhoto = NonNullable<MemberProfile['photo']>

const readProfilesByRole = createRolePermissionAccess({
  operation: 'read',
  resource: 'member-profiles',
})

export const readMemberProfileDraftPhoto: FieldAccess = async ({ doc, siblingData, req }) => {
  const userID = getUserIdentity(req.user)
  if (userID === undefined || req.context?.publicWebsite) return false
  return (
    getRelationshipId(doc?.owner ?? siblingData?.owner) === userID ||
    (await readProfilesByRole({ req })) === true
  )
}

const restorePhotoModeKey = 'memberProfilePhotoRestoreMode'

export const markMemberProfilePhotoRestore: CollectionBeforeOperationHook = ({
  args,
  operation,
  req,
}) => {
  if (operation === 'restoreVersion') {
    req.context[restorePhotoModeKey] = args.draft ? 'draft' : 'restore'
  } else if (operation === 'create' || operation === 'update') {
    delete req.context[restorePhotoModeKey]
  }
}

const photosPendingDeletion = new WeakMap<PayloadRequest, Map<number | string, Set<string>>>()

export const collectMemberProfilePhotosForDeletion: CollectionBeforeDeleteHook = async ({
  id,
  req,
}) => {
  const [profile, { docs: versions }] = await Promise.all([
    req.payload.findByID({
      collection: 'member-profiles',
      id,
      depth: 0,
      req,
      trash: true,
      select: { photo: true, draftPhoto: true },
    }),
    req.payload.findVersions({
      collection: 'member-profiles',
      depth: 0,
      pagination: false,
      req,
      trash: true,
      select: { version: { photo: true, draftPhoto: true } },
      where: { parent: { equals: id } },
    }),
  ])

  const storageKeys = new Set<string>()
  for (const { photo, draftPhoto } of [profile, ...versions.map(({ version }) => version)]) {
    for (const image of [photo, draftPhoto]) {
      if (!image || 'removed' in image) continue
      for (const filename of [
        image.filename,
        image.sizes?.card?.filename,
        image.sizes?.profile?.filename,
      ]) {
        if (filename) storageKeys.add(getPhotoStorageKey(image, filename))
      }
    }
  }

  if (!storageKeys.size) return
  const pending = photosPendingDeletion.get(req) ?? new Map()
  pending.set(id, storageKeys)
  photosPendingDeletion.set(req, pending)
}

export const deleteMemberProfilePhotos: CollectionAfterDeleteHook = async ({ doc, id, req }) => {
  const pending = photosPendingDeletion.get(req)
  const storageKeys = pending?.get(id)
  pending?.delete(id)
  if (!storageKeys?.size) return doc

  const container = getStorageContainerClient()
  const results = await Promise.allSettled(
    [...storageKeys].map((key) => container.getBlobClient(key).deleteIfExists()),
  )
  for (const result of results) {
    if (result.status === 'rejected') {
      req.payload.logger.error({
        err: result.reason,
        msg: 'Could not remove a deleted member profile photo.',
      })
    }
  }
  return doc
}

async function storePhoto(input: Buffer, removeImageMetadata: boolean): Promise<StoredPhoto> {
  if (!input.length || input.length > memberProfilePhotoSizeLimit) {
    throw new APIError('Zdjęcie profilowe może mieć najwyżej 5 MiB.', 400)
  }

  const photoID = randomUUID()
  const filenames = { card: `${photoID}-card.webp`, profile: `${photoID}-profile.webp` }
  try {
    const { card, profile } = await createProfileImageSet(input, removeImageMetadata)
    await storeImageSet([
      { key: `member-profiles/${filenames.card}`, buffer: card.buffer },
      { key: `member-profiles/${filenames.profile}`, buffer: profile.buffer },
    ])
  } catch (error) {
    if (error instanceof ImageInputError) throw new APIError(error.message, 400)
    throw error
  }

  return {
    prefix: 'member-profiles',
    sizes: { card: { filename: filenames.card }, profile: { filename: filenames.profile } },
  }
}

export const saveMemberProfilePhoto: CollectionBeforeChangeHook<MemberProfile> = async ({
  data,
  originalDoc,
  req,
}) => {
  const { photoChange, _status: status } = data
  delete data.photoChange

  let photo = originalDoc?.photo ?? null
  let draftPhoto = originalDoc?.draftPhoto ?? null
  const restoreMode = req.context[restorePhotoModeKey]
  if (restoreMode) {
    const historicalDraft = data.draftPhoto
    const historicalPhoto =
      historicalDraft && 'removed' in historicalDraft
        ? null
        : (historicalDraft ?? data.photo ?? null)
    if (status === 'published' && restoreMode === 'restore') {
      return { ...data, photo: historicalPhoto, draftPhoto: null }
    }
    draftPhoto = isDeepStrictEqual(historicalPhoto, photo)
      ? null
      : (historicalPhoto ?? { removed: true })
    return { ...data, photo, draftPhoto }
  }

  if (photoChange?.remove === true) {
    draftPhoto = photo ? { removed: true } : null
  } else if (req.file || photoChange?.data) {
    const file = req.file
    if (file && !memberProfilePhotoMimeTypes.some((mimeType) => mimeType === file.mimetype)) {
      throw new APIError('Wybierz prawidłowy plik JPEG, PNG, WebP lub AVIF.', 400)
    }
    if ((file?.size ?? 0) > memberProfilePhotoSizeLimit) {
      throw new APIError('Zdjęcie profilowe może mieć najwyżej 5 MiB.', 400)
    }
    const encoded = photoChange?.data
    if (
      encoded &&
      (typeof encoded !== 'string' ||
        encoded.length > Math.ceil(memberProfilePhotoSizeLimit / 3) * 4)
    ) {
      throw new APIError('Zdjęcie profilowe może mieć najwyżej 5 MiB.', 400)
    }
    const input = file?.tempFilePath
      ? await readFile(file.tempFilePath)
      : (file?.data ?? Buffer.from(encoded ?? '', 'base64'))
    if (file?.tempFilePath) {
      try {
        draftPhoto = await storePhoto(input, photoChange?.removeImageMetadata !== false)
      } finally {
        await rm(file.tempFilePath, { force: true })
        delete req.file
      }
    } else {
      draftPhoto = await storePhoto(input, photoChange?.removeImageMetadata !== false)
    }
  }

  if (status === 'published') {
    if (draftPhoto) photo = 'removed' in draftPhoto ? null : draftPhoto
    draftPhoto = null
  }

  return { ...data, photo, draftPhoto }
}

export const getMemberProfilePhotoEndpoint: Endpoint = {
  path: '/:id/photo/:filename',
  method: 'get',
  handler: async (req) => {
    const { id, filename } = req.routeParams ?? {}
    if (typeof id !== 'string' || !/^\d+$/.test(id) || typeof filename !== 'string') {
      return new Response(null, { status: 404 })
    }

    const publicProfile = await req.payload.find({
      collection: 'member-profiles',
      depth: 0,
      limit: 1,
      overrideAccess: false,
      req,
      where: { and: [{ id: { equals: id } }, { _status: { equals: 'published' } }] },
    })
    const publicPhoto = publicProfile.docs[0]?.photo
    let photo = includesFilename(publicPhoto, filename) ? publicPhoto : null
    const isPublic = Boolean(photo)

    if (!photo && req.user) {
      const { docs } = await req.payload.find({
        collection: 'member-profiles',
        depth: 0,
        draft: true,
        limit: 1,
        overrideAccess: false,
        req,
        where: { id: { equals: id } },
      })
      const profile = docs[0]
      if (
        profile?.draftPhoto &&
        !('removed' in profile.draftPhoto) &&
        includesFilename(profile.draftPhoto, filename)
      ) {
        photo = profile.draftPhoto
      } else if (profile?._status === 'draft' && includesFilename(profile.photo, filename)) {
        photo = profile.photo
      }
    }
    if (!photo) return new Response(null, { status: 404 })

    const key = getPhotoStorageKey(photo, filename)
    const blob = getStorageContainerClient().getBlobClient(key)
    try {
      const result = await blob.download(0, undefined, { abortSignal: req.signal })
      if (!(result.readableStreamBody instanceof Readable))
        return new Response(null, { status: 404 })
      const stream = Readable.toWeb(result.readableStreamBody) as ReadableStream<Uint8Array>
      return new Response(stream, {
        headers: {
          'Cache-Control': isPublic ? 'public, max-age=300' : 'private, no-store',
          'Content-Type': result.contentType ?? 'image/webp',
          'X-Content-Type-Options': 'nosniff',
        },
      })
    } catch (error) {
      if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 404) {
        return new Response(null, { status: 404 })
      }
      throw error
    }
  },
}

function includesFilename(photo: StoredPhoto | null | undefined, filename: string): boolean {
  return Boolean(
    photo &&
    (photo.filename === filename ||
      photo.sizes?.card?.filename === filename ||
      photo.sizes?.profile?.filename === filename),
  )
}

function getPhotoStorageKey(photo: StoredPhoto, filename: string): string {
  return [photo.prefix, photo.objectKey, filename].filter(Boolean).join('/')
}
