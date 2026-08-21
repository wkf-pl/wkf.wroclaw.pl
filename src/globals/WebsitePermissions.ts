import type { GlobalConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { invalidateAllPublicDataAfterGlobalChange } from '@/modules/cache/invalidate-public-data'
import { websitePermissionResourceOptions } from '@/modules/membership/permission-resources'
import { validateWebsitePermissions } from '@/modules/membership/role-permissions'

export const WebsitePermissions: GlobalConfig = {
  slug: 'website-permissions',
  access: {
    read: adminOnly,
    update: adminOnly,
  },
  admin: {
    group: 'Administracja',
  },
  fields: [
    {
      name: 'permissions',
      type: 'array',
      admin: {
        components: {
          RowLabel: '/components/admin/PermissionRowLabel#PermissionRowLabel',
        },
        description:
          'Dostęp anonimowy obowiązuje również po zalogowaniu. Role z prawem Odczytu w CMS automatycznie widzą opublikowane treści na WWW.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'resource',
          type: 'select',
          admin: {
            components: {
              Field: '/components/admin/PermissionResourceField#PermissionResourceField',
            },
            isClearable: false,
          },
          label: 'Zasób',
          options: websitePermissionResourceOptions,
          required: true,
        },
        {
          name: 'anonymousAllowed',
          type: 'checkbox',
          defaultValue: false,
          label: 'Dostęp dla osób niezalogowanych',
        },
        {
          name: 'roles',
          type: 'relationship',
          hasMany: true,
          label: 'Dodatkowe role',
          relationTo: 'roles',
        },
      ],
      label: 'Uprawnienia',
      labels: {
        plural: 'Uprawnienia',
        singular: 'uprawnienie',
      },
      maxRows: websitePermissionResourceOptions.length,
      validate: validateWebsitePermissions,
    },
  ],
  hooks: { afterChange: [invalidateAllPublicDataAfterGlobalChange] },
  label: 'Uprawnienia WWW',
}
