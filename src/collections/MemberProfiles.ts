import type { Access, CollectionConfig, FieldAccess, Where } from 'payload'

import { createBooleanSwitchAdmin } from '@/components/admin/boolean-switch-config'
import {
  invalidateMemberProfilesAfterChange,
  invalidateMemberProfilesAfterDelete,
} from '@/modules/cache/invalidate-public-data'
import { getRelationshipId } from '@/lib/relationships'
import {
  contactChannelOptions,
  isMember,
  validateContactAddress,
  validateGame,
  validateUniqueGames,
} from '@/modules/members/member-profile'
import {
  deleteMemberProfileImage,
  prepareMemberProfile,
  reconcileMemberProfileImages,
} from '@/modules/members/member-profile-lifecycle'
import { combineAccessResults, getUserIdentity } from '@/modules/membership/permission-resolution'

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
  getRelationshipId(doc?.owner ?? siblingData?.owner) === getUserIdentity(req.user)

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
                      admin: createBooleanSwitchAdmin(),
                      label: 'Gram',
                      validate: validateGame,
                    },
                    {
                      name: 'runs',
                      type: 'checkbox',
                      admin: createBooleanSwitchAdmin(),
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
      admin: createBooleanSwitchAdmin({
        hidden: true,
      }),
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
    afterChange: [reconcileMemberProfileImages, invalidateMemberProfilesAfterChange],
    afterDelete: [deleteMemberProfileImage, invalidateMemberProfilesAfterDelete],
    beforeValidate: [prepareMemberProfile],
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
