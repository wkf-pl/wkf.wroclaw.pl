import type { CollectionConfig } from 'payload'

import { clientUserHasUnrestrictedResourcePermission } from '@/modules/membership/permission-resolution'
import { createRolePermissionAccess } from '@/modules/membership/role-access'
import { createPageTemplateDraftPreviewURL } from '@/modules/content/draft-preview'
import {
  invalidatePageTemplatesAfterChange,
  invalidatePageTemplatesAfterDelete,
} from '@/modules/cache/invalidate-public-data'
import { createPageTemplateRegionField } from '@/modules/page-templates/page-template-blocks'
import {
  getPageTemplateDefinition,
  pageTemplateRegistry,
} from '@/modules/page-templates/page-template-registry'
import {
  preservePageTemplateKey,
  validatePageTemplateData,
} from '@/modules/page-templates/page-template-validation'

const readPageTemplates = createRolePermissionAccess({
  operation: 'read',
  resource: 'page-templates',
})
const readPageTemplateVersions = createRolePermissionAccess({
  operation: 'read',
  resource: 'page-templates',
})
const updatePageTemplates = createRolePermissionAccess({
  operation: 'update',
  resource: 'page-templates',
})

export const PageTemplates: CollectionConfig = {
  slug: 'page-templates',
  access: {
    create: () => false,
    delete: () => false,
    read: readPageTemplates,
    readVersions: readPageTemplateVersions,
    update: updatePageTemplates,
  },
  admin: {
    custom: { wkfPreviewAutosaveOnly: true },
    components: {
      Description: '/components/admin/PageTemplateFields#PageTemplateDescription',
      edit: {
        PreviewButton: '/components/admin/DraftPreviewButton#DraftPreviewButton',
      },
    },
    defaultColumns: ['templateKey', 'renderingMode', '_status', 'updatedAt'],
    description:
      'Globalne układy tras kontrolowane przez aplikację. Typów szablonów nie można dodawać ani usuwać.',
    group: 'Administracja',
    hidden: ({ user }) =>
      !clientUserHasUnrestrictedResourcePermission(user, 'page-templates', 'read'),
    preview: (document) => createPageTemplateDraftPreviewURL(document.templateKey),
    useAsTitle: 'templateKey',
  },
  defaultSort: 'templateKey',
  disableBulkDelete: true,
  disableBulkEdit: true,
  disableDuplicate: true,
  fields: [
    {
      name: 'templateKey',
      type: 'select',
      access: { update: () => false },
      admin: {
        components: {
          Cell: '/components/admin/PageTemplateFields#PageTemplateNameCell',
        },
        hidden: true,
        isClearable: false,
        readOnly: true,
      },
      index: true,
      label: 'Szablon',
      options: pageTemplateRegistry.map(({ id, label }) => ({ label, value: id })),
      required: true,
      unique: true,
    },
    {
      name: 'renderingMode',
      type: 'select',
      admin: {
        components: {
          Field: '/components/admin/PageTemplateFields#PageTemplateRenderingModeField',
        },
        description:
          'Zmiana wpłynie na stronę publiczną dopiero po opublikowaniu tej wersji szablonu.',
        isClearable: false,
      },
      defaultValue: 'legacy',
      label: 'Tryb renderowania',
      options: [
        { label: 'Dotychczasowy układ (legacy)', value: 'legacy' },
        { label: 'Układ z szablonu', value: 'template' },
      ],
      required: true,
    },
    {
      name: 'previewTarget',
      type: 'relationship',
      admin: {
        allowCreate: false,
        components: {
          Field: '/components/admin/PageTemplateFields#PageTemplatePreviewTargetField',
        },
        condition: (data) => {
          const definition = getPageTemplateDefinition(data.templateKey)
          return Boolean(definition?.previewCollection)
        },
        description: 'Element kolekcji używany podczas podglądu wersji roboczej szablonu.',
      },
      filterOptions: ({ relationTo }) =>
        ['events', 'event-cycles', 'partners', 'member-profiles'].includes(relationTo)
          ? { _status: { equals: 'published' } }
          : true,
      label: 'Element używany w podglądzie',
      maxDepth: 1,
      relationTo: ['tags', 'categories', 'events', 'event-cycles', 'partners', 'member-profiles'],
    },
    {
      name: 'heroImage',
      type: 'upload',
      admin: {
        condition: (data) =>
          getPageTemplateDefinition(data.templateKey)?.heroImageRule === 'configurable',
        description:
          'Opcjonalny obraz Hero wspólny dla wszystkich stron korzystających z tej trasy.',
      },
      displayPreview: true,
      label: 'Obraz Hero',
      relationTo: 'media',
    },
    {
      type: 'tabs',
      tabs: [
        { label: 'Hero', fields: [createPageTemplateRegionField('hero', 'Hero')] },
        {
          label: 'Panel informacyjny',
          fields: [createPageTemplateRegionField('informationPanel', 'Panel informacyjny')],
        },
        { label: 'Treść', fields: [createPageTemplateRegionField('content', 'Treść')] },
      ],
    },
  ],
  hooks: {
    afterChange: [invalidatePageTemplatesAfterChange],
    afterDelete: [invalidatePageTemplatesAfterDelete],
    beforeValidate: [
      ({ data, operation, originalDoc }) => {
        if (!data) return data
        const normalizedData = preservePageTemplateKey(data, operation, originalDoc ?? undefined)
        validatePageTemplateData({ ...originalDoc, ...normalizedData })
        return normalizedData
      },
    ],
  },
  labels: {
    plural: 'Szablony stron',
    singular: 'Szablon strony',
  },
  versions: {
    drafts: { autosave: { showSaveDraftButton: true } },
    maxPerDoc: 50,
  },
}
