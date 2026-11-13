import type { CollectionConfig } from 'payload'

import { auditActions, auditedCollections, auditedGlobals } from '@/modules/content-audit/targets'
import { createRolePermissionAccess } from '@/modules/membership/role-access'

const targetOptions = Object.entries({ ...auditedCollections, ...auditedGlobals }).map(
  ([value, { label }]) => ({ label, value }),
)

export const ContentAuditLog: CollectionConfig = {
  slug: 'content-audit-log',
  labels: { singular: 'Zmiana treści', plural: 'Rejestr zmian treści' },
  admin: {
    defaultColumns: ['occurredAt', 'actor', 'action', 'saveMode', 'target', 'title'],
    group: 'Administracja',
    listSearchableFields: ['title', 'actor'],
    useAsTitle: 'title',
  },
  forceSelect: { action: true, target: true, targetId: true },
  defaultSort: ['-occurredAt', '-id'],
  disableBulkDelete: true,
  disableBulkEdit: true,
  disableDuplicate: true,
  lockDocuments: false,
  timestamps: false,
  access: {
    create: () => false,
    delete: () => false,
    read: createRolePermissionAccess({ operation: 'read', resource: 'content-audit-log' }),
    update: () => false,
  },
  fields: [
    {
      name: 'occurredAt',
      type: 'date',
      label: 'Data i godzina',
      required: true,
      index: true,
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    { name: 'actor', type: 'text', label: 'Użytkownik', required: true },
    { name: 'actorId', type: 'text', label: 'ID użytkownika', index: true },
    {
      name: 'action',
      type: 'select',
      label: 'Operacja',
      options: Object.entries(auditActions).map(([value, label]) => ({ label, value })),
      required: true,
    },
    {
      name: 'saveMode',
      type: 'select',
      label: 'Sposób zapisu',
      options: [
        { label: 'Zapis szkicu', value: 'draft' },
        { label: 'Publikacja', value: 'publish' },
      ],
    },
    {
      name: 'target',
      type: 'select',
      label: 'Rodzaj treści',
      options: targetOptions,
      required: true,
    },
    { name: 'targetId', type: 'text', label: 'ID treści' },
    {
      name: 'title',
      type: 'text',
      label: 'Tytuł',
      required: true,
      admin: { components: { Cell: '/components/admin/AuditTitleCell#AuditTitleCell' } },
    },
  ],
}
