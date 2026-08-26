import type { Block, Validate } from 'payload'

type DocumentSelectionSiblingData = {
  selectionMode?: unknown
}

type ManualDocumentItem = {
  document?: unknown
}

export const validateManualDocumentItems: Validate<
  unknown,
  unknown,
  DocumentSelectionSiblingData
> = (value, { siblingData }) => {
  if (siblingData.selectionMode !== 'manual') {
    return true
  }

  if (!Array.isArray(value) || value.length === 0) {
    return 'Wybierz co najmniej jeden dokument.'
  }

  const documentIds = value
    .map((item) => {
      if (!item || typeof item !== 'object' || !('document' in item)) {
        return null
      }

      const document = (item as ManualDocumentItem).document
      if (typeof document === 'number' || typeof document === 'string') {
        return String(document)
      }

      return document && typeof document === 'object' && 'id' in document
        ? String((document as { id: unknown }).id)
        : null
    })
    .filter((id): id is string => id !== null)

  return new Set(documentIds).size === documentIds.length
    ? true
    : 'Każdy dokument może zostać wybrany tylko raz.'
}

export const DocumentsBlock: Block = {
  slug: 'documents',
  admin: {
    components: {
      Label: '/components/admin/ContentBlockLabel#DocumentsBlockLabel',
    },
    disableBlockName: true,
    images: {
      thumbnail: {
        alt: 'Schematyczna ikona listy dokumentów',
        url: '/assets/block-thumbnails/documents.png',
      },
    },
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Nagłówek',
    },
    {
      name: 'selectionMode',
      type: 'select',
      admin: { isClearable: false },
      defaultValue: 'filters',
      label: 'Tryb wyboru',
      options: [
        { label: 'Ręczny', value: 'manual' },
        { label: 'Filtry', value: 'filters' },
      ],
      required: true,
    },
    {
      name: 'items',
      type: 'array',
      admin: {
        components: {
          RowLabel: '/components/admin/DocumentEntryRowLabel#DocumentEntryRowLabel',
        },
        condition: (_data, siblingData) => siblingData.selectionMode === 'manual',
        initCollapsed: false,
      },
      fields: [
        {
          name: 'document',
          type: 'relationship',
          filterOptions: { _status: { equals: 'published' } },
          label: 'Dokument',
          relationTo: 'documents',
          required: true,
        },
      ],
      label: 'Dokumenty',
      labels: {
        plural: 'Dokumenty',
        singular: 'Dokument',
      },
      validate: validateManualDocumentItems,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'category',
          type: 'relationship',
          admin: {
            condition: (_data, siblingData) => siblingData.selectionMode === 'filters',
            placeholder: '<brak>',
            width: '50%',
          },
          label: 'Kategoria',
          relationTo: 'categories',
        },
        {
          name: 'tag',
          type: 'relationship',
          admin: {
            condition: (_data, siblingData) => siblingData.selectionMode === 'filters',
            placeholder: '<brak>',
            width: '50%',
          },
          label: 'Tag',
          relationTo: 'tags',
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'sort',
          type: 'select',
          admin: {
            condition: (_data, siblingData) => siblingData.selectionMode === 'filters',
            isClearable: false,
            width: '50%',
          },
          defaultValue: 'newest',
          label: 'Sortowanie',
          options: [
            { label: 'Najnowsze', value: 'newest' },
            { label: 'Najstarsze', value: 'oldest' },
            { label: 'Tytuł A–Z', value: 'titleAscending' },
            { label: 'Tytuł Z–A', value: 'titleDescending' },
          ],
          required: true,
        },
        {
          name: 'view',
          type: 'select',
          admin: { isClearable: false, width: '50%' },
          defaultValue: 'list',
          label: 'Widok',
          options: [
            { label: 'Karty', value: 'cards' },
            { label: 'Lista kompaktowa', value: 'list' },
            { label: 'Siatka', value: 'grid' },
          ],
          required: true,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'pageSize',
          type: 'number',
          admin: { width: '50%' },
          defaultValue: 12,
          label: 'Elementy na stronę',
          max: 100,
          min: 1,
          required: true,
        },
        {
          name: 'pagination',
          type: 'checkbox',
          admin: { width: '50%' },
          defaultValue: true,
          label: 'Włącz paginację',
        },
      ],
    },
    {
      name: 'emptyMessage',
      type: 'text',
      admin: {
        condition: (_data, siblingData) => siblingData.selectionMode === 'filters',
      },
      label: 'Komunikat pustego wyniku',
    },
  ],
  interfaceName: 'DocumentsBlock',
  labels: {
    plural: 'Dokumenty',
    singular: 'Dokumenty',
  },
}
