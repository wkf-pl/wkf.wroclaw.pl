import { APIError, type CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import {
  permissionResourceOptions,
  resourceSupportsCreateAndDelete,
  resourceSupportsOwnership,
  resourceSupportsPublishedStatus,
} from '@/modules/membership/permission-resources'
import {
  administratorRoleKey,
  validateRolePermissions,
} from '@/modules/membership/role-permissions'

function createPermissionScopeFields(prefix: 'read' | 'update' | 'delete') {
  const capitalizedLabel = {
    delete: 'Usuwanie',
    read: 'Odczyt',
    update: 'Edycja',
  }[prefix]

  return {
    type: 'row' as const,
    label: capitalizedLabel,
    fields: [
      {
        name: `${prefix}Allowed`,
        type: 'checkbox' as const,
        admin: {
          width: '34%',
        },
        defaultValue: false,
        label: capitalizedLabel,
      },
      {
        name: `${prefix}Own`,
        type: 'checkbox' as const,
        admin: {
          condition: (_data: unknown, siblingData: Record<string, unknown>) =>
            Boolean(siblingData[`${prefix}Allowed`]) &&
            resourceSupportsOwnership(siblingData.resource),
          description: 'Ogranicz operację do dokumentów należących do użytkownika.',
          width: '33%',
        },
        defaultValue: false,
        label: 'Tylko własne',
      },
      {
        name: `${prefix}Published`,
        type: 'checkbox' as const,
        admin: {
          condition: (_data: unknown, siblingData: Record<string, unknown>) =>
            Boolean(siblingData[`${prefix}Allowed`]) &&
            resourceSupportsPublishedStatus(siblingData.resource),
          description: 'Ogranicz operację do dokumentów już opublikowanych.',
          width: '33%',
        },
        defaultValue: false,
        label: 'Tylko opublikowane',
      },
    ],
  }
}

function createRoleKey(name: unknown): string | undefined {
  if (typeof name !== 'string' || !name.trim()) {
    return undefined
  }

  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export const Roles: CollectionConfig = {
  slug: 'roles',
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: adminOnly,
    update: adminOnly,
  },
  admin: {
    defaultColumns: ['name', 'description', 'updatedAt'],
    group: 'Administracja',
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Nazwa',
      required: true,
      unique: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Opis',
    },
    {
      name: 'key',
      type: 'text',
      access: {
        update: () => false,
      },
      admin: {
        hidden: true,
        readOnly: true,
      },
      hooks: {
        beforeValidate: [
          ({ operation, siblingData, value }) =>
            operation === 'create' && !value ? createRoleKey(siblingData.name) : value,
        ],
      },
      index: true,
      required: true,
      unique: true,
    },
    {
      name: 'isSystem',
      type: 'checkbox',
      access: {
        create: () => false,
        update: () => false,
      },
      admin: {
        hidden: true,
      },
      defaultValue: false,
    },
    {
      name: 'permissions',
      type: 'array',
      admin: {
        components: {
          RowLabel: '/components/admin/PermissionRowLabel#PermissionRowLabel',
        },
        description:
          'Uprawnienia wielu ról sumują się. Dwa ograniczenia zaznaczone dla jednej operacji obowiązują jednocześnie.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'resource',
          type: 'select',
          label: 'Zasób',
          options: permissionResourceOptions,
          required: true,
        },
        {
          name: 'canCreate',
          type: 'checkbox',
          admin: {
            condition: (_data, siblingData) =>
              resourceSupportsCreateAndDelete(siblingData.resource),
          },
          defaultValue: false,
          label: 'Tworzenie',
        },
        createPermissionScopeFields('read'),
        createPermissionScopeFields('update'),
        {
          type: 'row',
          admin: {
            condition: (_data: unknown, siblingData: Record<string, unknown>) =>
              resourceSupportsCreateAndDelete(siblingData.resource),
          },
          fields: createPermissionScopeFields('delete').fields,
        },
      ],
      label: 'Uprawnienia',
      validate: validateRolePermissions,
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation, originalDoc }) => {
        if (operation === 'update') {
          data.key = originalDoc.key
          data.isSystem = originalDoc.isSystem
        }

        for (const permission of data.permissions ?? []) {
          if (!resourceSupportsOwnership(permission.resource)) {
            permission.readOwn = false
            permission.updateOwn = false
            permission.deleteOwn = false
          }

          if (!resourceSupportsPublishedStatus(permission.resource)) {
            permission.readPublished = false
            permission.updatePublished = false
            permission.deletePublished = false
          }

          if (!resourceSupportsCreateAndDelete(permission.resource)) {
            permission.canCreate = false
            permission.deleteAllowed = false
            permission.deleteOwn = false
            permission.deletePublished = false
          }
        }

        return data
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        const role = await req.payload.findByID({
          collection: 'roles',
          depth: 0,
          id,
          overrideAccess: true,
        })

        if (role.isSystem || role.key === administratorRoleKey) {
          throw new APIError('Nie można usunąć systemowej roli Administratora.', 400)
        }

        const { totalDocs } = await req.payload.count({
          collection: 'users',
          overrideAccess: true,
          where: {
            roles: {
              contains: id,
            },
          },
        })

        if (totalDocs > 0) {
          throw new APIError('Nie można usunąć roli przypisanej użytkownikom.', 400)
        }
      },
    ],
  },
  labels: {
    plural: 'Role',
    singular: 'Rola',
  },
}
