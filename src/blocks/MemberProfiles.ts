import type { Block } from 'payload'

export const MemberProfilesBlock: Block = {
  slug: 'memberProfiles',
  admin: {
    components: {
      Label: '/components/admin/ContentBlockLabel#MemberProfilesBlockLabel',
    },
    disableBlockName: true,
    images: {
      thumbnail: {
        alt: 'Schematyczna ikona dwóch kart profili osób',
        url: '/assets/block-thumbnails/member-profiles.png',
      },
    },
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Nagłówek',
      maxLength: 160,
    },
    {
      name: 'view',
      type: 'select',
      admin: { isClearable: false },
      defaultValue: 'grid',
      label: 'Widok',
      options: [
        { label: 'Karta', value: 'card' },
        { label: 'Lista', value: 'list' },
        { label: 'Siatka', value: 'grid' },
      ],
      required: true,
    },
    {
      name: 'entries',
      type: 'array',
      admin: {
        components: {
          RowLabel: '/components/admin/MemberProfileEntryRowLabel#MemberProfileEntryRowLabel',
        },
      },
      fields: [
        {
          name: 'profile',
          type: 'relationship',
          filterOptions: { _status: { equals: 'published' } },
          label: 'Wizytówka',
          relationTo: 'member-profiles',
          required: true,
        },
        {
          name: 'contextLabel',
          type: 'text',
          admin: {
            description: 'Opcjonalna funkcja w kontekście tej strony, np. „Prezes Zarządu”.',
          },
          label: 'Podpis funkcji',
          maxLength: 160,
        },
      ],
      label: 'Wizytówki',
      labels: {
        plural: 'Wizytówki',
        singular: 'Wizytówka',
      },
      minRows: 1,
      required: true,
    },
  ],
  interfaceName: 'MemberProfilesBlock',
  labels: {
    plural: 'Wizytówki',
    singular: 'Wizytówki',
  },
}
