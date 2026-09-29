import type { Block, Field, Validate } from 'payload'

import { createListingPaginationRow, createListingTaxonomyRow } from './listing-fields'
import { validateUniqueRelationshipIds } from '@/modules/content/listing-window'
import { webRasterImageMimeTypes } from '@/modules/media/media-categories'

type MediaSelectionSiblingData = {
  selectionMode?: unknown
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

  return validateUniqueRelationshipIds(value, 'media')
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
          filterOptions: imagesOnly
            ? { mimeType: { in: [...webRasterImageMimeTypes] } }
            : undefined,
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
    createListingTaxonomyRow({ conditional: true }),
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
    createListingPaginationRow(),
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
