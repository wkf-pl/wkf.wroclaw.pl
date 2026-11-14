import { APIError, type CollectionBeforeValidateHook } from 'payload'

import { getRelationshipId } from '@/lib/relationships'
import { getUserIdentity } from '@/modules/membership/permission-resolution'

import {
  type ContactChannelType,
  createBaseProfileSlug,
  normalizeContactAddress,
} from './member-profile'

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
    data.slug = originalDoc?.slug
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
