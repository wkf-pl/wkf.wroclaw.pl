import sharp from 'sharp'
import type { Access, CollectionConfig } from 'payload'
import { APIError } from 'payload'

import {
  invalidateMemberProfileImagesAfterChange,
  invalidateMemberProfileImagesAfterDelete,
} from '@/modules/cache/invalidate-public-data'
import { getRelationshipID, isMember } from '@/modules/members/member-profile'
import { combineAccessResults, getUserIdentity } from '@/modules/membership/role-permissions'

const publicImageConstraint = { isPubliclyUsed: { equals: true } }

const ownImageConstraint = (userID: number | string | undefined) =>
  userID === undefined ? false : { owner: { equals: userID } }
const readImages: Access = ({ req }) =>
  combineAccessResults(ownImageConstraint(getUserIdentity(req.user)), publicImageConstraint)
const createImages: Access = ({ req }) => isMember(req)
const changeOwnImages: Access = async ({ req }) =>
  (await isMember(req)) ? ownImageConstraint(getUserIdentity(req.user)) : false

export const MemberProfileImages: CollectionConfig = {
  slug: 'member-profile-images',
  access: {
    create: createImages,
    delete: changeOwnImages,
    read: readImages,
    update: changeOwnImages,
  },
  admin: {
    hidden: true,
    useAsTitle: 'filename',
  },
  fields: [
    {
      name: 'owner',
      type: 'relationship',
      access: {
        create: () => false,
        read: ({ doc, req, siblingData }) => {
          const ownerID = getRelationshipID(doc?.owner ?? siblingData?.owner)
          return ownerID === getUserIdentity(req.user)
        },
        update: () => false,
      },
      admin: {
        hidden: true,
        readOnly: true,
      },
      index: true,
      relationTo: 'users',
      required: true,
      unique: true,
    },
    {
      name: 'isPubliclyUsed',
      type: 'checkbox',
      access: {
        create: () => false,
        update: () => false,
      },
      admin: {
        hidden: true,
      },
      defaultValue: false,
      index: true,
    },
  ],
  hooks: {
    afterChange: [invalidateMemberProfileImagesAfterChange],
    afterDelete: [invalidateMemberProfileImagesAfterDelete],
    beforeValidate: [
      async ({ data, operation, originalDoc, req }) => {
        if (!data) {
          return data
        }

        const authenticatedUserID = getUserIdentity(req.user)
        if (operation === 'create' && authenticatedUserID !== undefined) {
          data.owner = authenticatedUserID
        } else if (operation === 'update') {
          data.owner = getRelationshipID(originalDoc?.owner)
        }

        if (req.file && req.file.size > 5 * 1024 * 1024) {
          throw new APIError('Zdjęcie profilowe może mieć najwyżej 5 MiB.', 400)
        }

        if (req.file) {
          const imageSource = req.file.tempFilePath || req.file.data
          const metadata = await sharp(imageSource).metadata()
          if ((metadata.pages ?? 1) > 1) {
            throw new APIError('Animowane zdjęcia profilowe nie są obsługiwane.', 400)
          }
        }

        return data
      },
    ],
  },
  labels: {
    plural: 'Zdjęcia wizytówek',
    singular: 'Zdjęcie wizytówki',
  },
  upload: {
    bulkUpload: false,
    crop: true,
    displayPreview: true,
    focalPoint: true,
    imageSizes: [
      {
        fit: 'cover',
        formatOptions: { format: 'webp', options: { quality: 82 } },
        height: 192,
        name: 'card',
        width: 192,
      },
      {
        fit: 'cover',
        formatOptions: { format: 'webp', options: { quality: 86 } },
        height: 512,
        name: 'profile',
        width: 512,
      },
    ],
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    resizeOptions: {
      fit: 'inside',
      height: 1600,
      width: 1600,
      withoutEnlargement: true,
    },
    withMetadata: false,
  },
}
