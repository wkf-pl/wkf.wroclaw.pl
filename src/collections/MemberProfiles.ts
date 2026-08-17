import { APIError, type Access, type CollectionConfig, type FieldAccess, type Where } from 'payload'

import {
  type ContactChannelType,
  contactChannelOptions,
  createBaseProfileSlug,
  getRelationshipID,
  isMember,
  normalizeContactAddress,
  validateContactAddress,
  validateGame,
  validateUniqueGames,
} from '@/modules/members/member-profile'
import { combineAccessResults, getUserIdentity } from '@/modules/membership/role-permissions'

const publicProfileConstraint: Where = { _status: { equals: 'published' } }

const readProfiles: Access = ({ req }) =>
  combineAccessResults(publicProfileConstraint, {
    owner: {
      equals: getUserIdentity(req.user) ?? -1,
    },
  })

const createProfiles: Access = ({ req }) => isMember(req)
const updateProfiles: Access = async ({ req }) => {
  if (!(await isMember(req))) {
    return false
  }

  const userID = getUserIdentity(req.user)
  return userID === undefined ? false : { owner: { equals: userID } }
}
const readProfileVersions: Access = ({ req }) => {
  const userID = getUserIdentity(req.user)
  return userID === undefined ? false : { 'version.owner': { equals: userID } }
}

const readOwnedProfileField: FieldAccess = ({ doc, req, siblingData }) =>
  getRelationshipID(doc?.owner ?? siblingData?.owner) === getUserIdentity(req.user)

export const MemberProfiles: CollectionConfig = {
  slug: 'member-profiles',
  access: {
    create: createProfiles,
    delete: () => false,
    read: readProfiles,
    readVersions: readProfileVersions,
    update: updateProfiles,
  },
  admin: {
    hidden: true,
    useAsTitle: 'publicName',
  },
  fields: [
    {
      name: 'owner',
      type: 'relationship',
      access: {
        create: () => false,
        read: readOwnedProfileField,
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
      type: 'tabs',
      tabs: [
        {
          label: 'Podstawowe informacje',
          fields: [
            {
              name: 'publicName',
              type: 'text',
              admin: {
                description:
                  'Imię i nazwisko, ksywa albo obie formy — dokładnie tak, jak mają być widoczne publicznie.',
              },
              index: true,
              label: 'Nazwa publiczna',
              maxLength: 120,
              required: true,
            },
            {
              name: 'about',
              type: 'richText',
              label: 'O mnie',
            },
            {
              name: 'photo',
              type: 'upload',
              admin: {
                description:
                  'JPEG, PNG, WebP lub AVIF, maksymalnie 5 MiB. Nowy plik zastępuje poprzedni.',
              },
              displayPreview: true,
              label: 'Zdjęcie',
              relationTo: 'member-profile-images',
            },
            {
              name: 'interests',
              type: 'text',
              label: 'Zainteresowania',
              maxLength: 500,
            },
            {
              name: 'games',
              type: 'array',
              admin: {
                components: {
                  RowLabel: '/components/admin/DynamicRowLabel#GameRowLabel',
                },
                description: 'Pole opcjonalne — wizytówka nie musi dotyczyć grania.',
              },
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  label: 'Gra lub system',
                  maxLength: 120,
                  required: true,
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'plays',
                      type: 'checkbox',
                      label: 'Gram',
                      validate: validateGame,
                    },
                    {
                      name: 'runs',
                      type: 'checkbox',
                      label: 'Prowadzę',
                      validate: validateGame,
                    },
                  ],
                },
              ],
              label: 'Gry',
              labels: {
                plural: 'Gry',
                singular: 'Gra',
              },
              validate: validateUniqueGames,
            },
          ],
        },
        {
          label: 'Działalność klubowa',
          fields: [
            {
              name: 'clubFunction',
              type: 'text',
              label: 'Funkcja',
              maxLength: 160,
            },
            {
              name: 'clubActivities',
              type: 'richText',
              label: 'Aktywności klubowe',
            },
          ],
        },
        {
          label: 'Kontakt',
          fields: [
            {
              name: 'contactTopics',
              type: 'textarea',
              label: 'W jakich sprawach można się ze mną kontaktować?',
              maxLength: 800,
            },
            {
              name: 'contactChannels',
              type: 'array',
              admin: {
                components: {
                  RowLabel: '/components/admin/DynamicRowLabel#ContactChannelRowLabel',
                },
                description: 'Podane adresy będą dostępne publicznie bez logowania.',
              },
              fields: [
                {
                  name: 'type',
                  type: 'select',
                  admin: {
                    isClearable: false,
                  },
                  label: 'Kanał',
                  options: [...contactChannelOptions],
                  required: true,
                },
                {
                  name: 'url',
                  type: 'text',
                  admin: {
                    description:
                      'Dla e-maila podaj adres. Dla pozostałych kanałów podaj pełny link HTTPS.',
                  },
                  label: 'Adres',
                  required: true,
                  validate: validateContactAddress,
                },
              ],
              label: 'Kanały kontaktu',
              labels: {
                plural: 'Kanały kontaktu',
                singular: 'Kanał kontaktu',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'slug',
      type: 'text',
      access: {
        create: () => false,
        update: () => false,
      },
      admin: {
        hidden: true,
        readOnly: true,
      },
      index: true,
      required: true,
      unique: true,
    },
    {
      name: 'profileAddress',
      type: 'ui',
      admin: {
        components: {
          Field: '/components/admin/MemberProfileAddress#MemberProfileAddress',
        },
        position: 'sidebar',
      },
      label: 'Adres profilu',
    },
    {
      name: 'usage',
      type: 'ui',
      admin: {
        components: {
          Field: '/components/admin/MemberProfileUsage#MemberProfileUsage',
        },
        position: 'sidebar',
      },
      label: 'Miejsca wyświetlania',
    },
    {
      name: 'moderatorHidden',
      type: 'checkbox',
      access: {
        create: () => false,
        read: () => false,
        update: () => false,
      },
      admin: {
        hidden: true,
      },
      defaultValue: false,
    },
    {
      name: 'moderationReason',
      type: 'textarea',
      access: {
        create: () => false,
        read: () => false,
        update: () => false,
      },
      admin: {
        hidden: true,
      },
      maxLength: 1000,
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, req }) => {
        const currentPhotoID = getRelationshipID(doc.photo)
        const ownerID = getRelationshipID(doc.owner)
        const publishedProfiles = await req.payload.find({
          collection: 'member-profiles',
          depth: 0,
          draft: false,
          limit: 1,
          overrideAccess: true,
          pagination: false,
          req,
          where: {
            and: [{ id: { equals: doc.id } }, { _status: { equals: 'published' } }],
          },
        })
        const publishedProfile = publishedProfiles.docs[0]
        const publishedPhotoID = getRelationshipID(publishedProfile?.photo)

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
              continue
            }

            await req.payload.update({
              collection: 'member-profile-images',
              id: image.id,
              data: { isPubliclyUsed: retainedByPublishedProfile },
              overrideAccess: true,
              req,
            })
          }
        }

        return doc
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        const photoID = getRelationshipID(doc.photo)
        if (photoID !== undefined) {
          await req.payload.delete({
            collection: 'member-profile-images',
            id: photoID,
            overrideAccess: true,
            req,
          })
        }

        return doc
      },
    ],
    beforeValidate: [
      async ({ data, operation, originalDoc, req }) => {
        if (!data) {
          return data
        }

        const authenticatedUserID = getUserIdentity(req.user)
        if (operation === 'create') {
          if (authenticatedUserID === undefined) {
            throw new APIError('Wizytówka wymaga zalogowanego właściciela.', 401)
          }
          data.owner = authenticatedUserID
        } else {
          data.owner = getRelationshipID(originalDoc?.owner)
        }

        const ownerID = getRelationshipID(data.owner)
        if (ownerID === undefined) {
          throw new APIError('Wizytówka musi mieć właściciela.', 400)
        }

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
            if (!channel || typeof channel !== 'object') {
              return channel
            }

            const type = channel.type
            const url = channel.url
            return typeof type === 'string' && typeof url === 'string'
              ? { ...channel, url: normalizeContactAddress(type as ContactChannelType, url) }
              : channel
          })
        }

        const photoID = getRelationshipID(data.photo)
        if (photoID !== undefined) {
          const photo = await req.payload.findByID({
            collection: 'member-profile-images',
            depth: 0,
            id: photoID,
            overrideAccess: true,
            req,
          })
          if (getRelationshipID(photo.owner) !== ownerID) {
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
      },
    ],
  },
  labels: {
    plural: 'Wizytówki klubowiczów',
    singular: 'Wizytówka publiczna',
  },
  versions: {
    drafts: true,
    maxPerDoc: 20,
  },
}
