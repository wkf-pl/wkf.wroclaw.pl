import type { Block, Field, Validate } from 'payload'

type MediaSelectionSiblingData = {
  selectionMode?: unknown
}

type ManualMediaItem = {
  media?: unknown
}

export const validateManualMediaItems: Validate<unknown, unknown, MediaSelectionSiblingData> = (
  value,
  { siblingData },
) => {
  if (siblingData.selectionMode !== 'manual') {
    return true
  }

  if (!Array.isArray(value) || value.length === 0) {
    return 'Wybierz co najmniej jeden plik.'
  }

  const mediaIds = value
    .map((item) => {
      if (!item || typeof item !== 'object' || !('media' in item)) {
        return null
      }

      const media = (item as ManualMediaItem).media
      if (typeof media === 'number' || typeof media === 'string') {
        return String(media)
      }

      return media && typeof media === 'object' && 'id' in media
        ? String((media as { id: unknown }).id)
        : null
    })
    .filter((id): id is string => id !== null)

  return new Set(mediaIds).size === mediaIds.length
    ? true
    : 'Każdy plik może zostać wybrany tylko raz.'
}

function createMediaListingFields(
  defaultView: 'cards' | 'grid' | 'list',
  imagesOnly: boolean,
): Field[] {
  return [
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
        condition: (_data, siblingData) => siblingData.selectionMode === 'manual',
        initCollapsed: false,
      },
      fields: [
        {
          name: 'media',
          type: 'upload',
          filterOptions: imagesOnly ? { mimeType: { like: 'image/%' } } : undefined,
          label: 'Plik',
          relationTo: 'media',
          required: true,
        },
      ],
      label: 'Pliki',
      labels: {
        plural: 'Pliki',
        singular: 'Plik',
      },
      validate: validateManualMediaItems,
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
            { label: 'Nazwa A–Z', value: 'nameAscending' },
            { label: 'Nazwa Z–A', value: 'nameDescending' },
          ],
          required: true,
        },
        {
          name: 'view',
          type: 'select',
          admin: { isClearable: false, width: '50%' },
          defaultValue: defaultView,
          label: 'Widok',
          options: [
            { label: 'Karty', value: 'cards' },
            { label: 'Lista', value: 'list' },
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
  ]
}

export const MediaGalleryBlock: Block = {
  slug: 'mediaGallery',
  admin: {
    components: {
      Label: '/components/admin/ContentBlockLabel#MediaGalleryBlockLabel',
    },
    disableBlockName: true,
    images: {
      thumbnail: {
        alt: 'Schematyczna ikona siatki zdjęć',
        url: '/assets/block-thumbnails/media-gallery.png',
      },
    },
  },
  fields: createMediaListingFields('grid', true),
  interfaceName: 'MediaGalleryBlock',
  labels: {
    plural: 'Galerie mediów',
    singular: 'Galeria mediów',
  },
}

export const AttachmentsBlock: Block = {
  slug: 'attachments',
  admin: {
    components: {
      Label: '/components/admin/ContentBlockLabel#AttachmentsBlockLabel',
    },
    disableBlockName: true,
    images: {
      thumbnail: {
        alt: 'Schematyczna ikona dokumentów połączonych spinaczem',
        url: '/assets/block-thumbnails/attachments.png',
      },
    },
  },
  fields: createMediaListingFields('list', false),
  interfaceName: 'AttachmentsBlock',
  labels: {
    plural: 'Załączniki',
    singular: 'Załączniki',
  },
}
