import {
  APIError,
  type CollectionAfterChangeHook,
  type CollectionAfterDeleteHook,
  type CollectionBeforeValidateHook,
} from 'payload'

import { getRelationshipId } from '@/lib/relationships'
import { getUserIdentity } from '@/modules/membership/permission-resolution'

import {
  type ContactChannelType,
  createBaseProfileSlug,
  normalizeContactAddress,
} from './member-profile'

export const reconcileMemberProfileImages: CollectionAfterChangeHook = async ({ doc, req }) => {
  const currentPhotoID = getRelationshipId(doc.photo)
  const ownerID = getRelationshipId(doc.owner)
  const publishedProfiles = await req.payload.find({
    collection: 'member-profiles',
    depth: 0,
    draft: false,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    req,
    where: { and: [{ id: { equals: doc.id } }, { _status: { equals: 'published' } }] },
  })
  const publishedPhotoID = getRelationshipId(publishedProfiles.docs[0]?.photo)

  if (ownerID !== undefined) {
    const images = await req.payload.find({
      collection: 'member-profile-images',
      depth: 0,
      limit: 2,
      overrideAccess: true,
      pagination: false,
      req,
      where: { owner: { equals: ownerID } },
    })

    for (const image of images.docs) {
      const retainedByDraft = image.id === currentPhotoID
      const retainedByPublishedProfile = image.id === publishedPhotoID
      if (!retainedByDraft && !retainedByPublishedProfile) {
        await req.payload.delete({
          collection: 'member-profile-images',
          id: image.id,
          overrideAccess: true,
          req,
        })
      } else {
        await req.payload.update({
          collection: 'member-profile-images',
          id: image.id,
          data: { isPubliclyUsed: retainedByPublishedProfile },
          overrideAccess: true,
          req,
        })
      }
    }
  }

  return doc
}

export const deleteMemberProfileImage: CollectionAfterDeleteHook = async ({ doc, req }) => {
  const photoID = getRelationshipId(doc.photo)
  if (photoID !== undefined) {
    await req.payload.delete({
      collection: 'member-profile-images',
      id: photoID,
      overrideAccess: true,
      req,
    })
  }
  return doc
}

export const prepareMemberProfile: CollectionBeforeValidateHook = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (!data) return data

  const authenticatedUserID = getUserIdentity(req.user)
  if (operation === 'create') {
    if (authenticatedUserID === undefined) {
      throw new APIError('Wizytówka wymaga zalogowanego właściciela.', 401)
    }
    data.owner = authenticatedUserID
  } else {
    data.owner = getRelationshipId(originalDoc?.owner)
  }

  const ownerID = getRelationshipId(data.owner)
  if (ownerID === undefined) throw new APIError('Wizytówka musi mieć właściciela.', 400)

  if (operation === 'create') {
    const existingProfile = await req.payload.find({
      collection: 'member-profiles',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      req,
      where: { owner: { equals: ownerID } },
    })
    if (existingProfile.docs.length > 0) {
      throw new APIError('To konto ma już wizytówkę publiczną.', 400)
    }
  }

  if (Array.isArray(data.contactChannels)) {
    data.contactChannels = data.contactChannels.map((channel) => {
      if (!channel || typeof channel !== 'object') return channel
      const type = channel.type
      const url = channel.url
      return typeof type === 'string' && typeof url === 'string'
        ? { ...channel, url: normalizeContactAddress(type as ContactChannelType, url) }
        : channel
    })
  }

  const photoID = getRelationshipId(data.photo)
  if (photoID !== undefined) {
    const photo = await req.payload.findByID({
      collection: 'member-profile-images',
      depth: 0,
      id: photoID,
      overrideAccess: true,
      req,
    })
    if (getRelationshipId(photo.owner) !== ownerID) {
      throw new APIError('Zdjęcie profilowe musi należeć do właściciela wizytówki.', 400)
    }
  }

  if (operation === 'create') {
    const baseSlug = createBaseProfileSlug(data.publicName)
    let candidateSlug = baseSlug
    let suffix = 2
    while (true) {
      const matches = await req.payload.find({
        collection: 'member-profiles',
        depth: 0,
        limit: 1,
        overrideAccess: true,
        pagination: false,
        req,
        where: { slug: { equals: candidateSlug } },
      })
      if (matches.docs.length === 0) {
        data.slug = candidateSlug
        break
      }
      candidateSlug = `${baseSlug}-${suffix}`
      suffix += 1
    }
  }

  return data
}
