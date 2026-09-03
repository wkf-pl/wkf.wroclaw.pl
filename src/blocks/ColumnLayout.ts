import { APIError, type ArrayFieldValidation, type Block, type FieldHook } from 'payload'

import { contentLeafBlocks } from './contentLeafBlocks'

const minimumColumnCount = 2
const maximumColumnCount = 4
const minimumColumnWidth = 2
const maximumColumnWidth = 10
const totalColumnWidth = 12

type ColumnCandidate = {
  blocks?: unknown
  width?: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function containsNestedColumnLayout(blocks: unknown): boolean {
  return (
    Array.isArray(blocks) &&
    blocks.some((block) => isRecord(block) && block.blockType === 'columnLayout')
  )
}

export function getColumnLayoutValidationError(value: unknown): string | undefined {
  if (
    !Array.isArray(value) ||
    value.length < minimumColumnCount ||
    value.length > maximumColumnCount
  ) {
    return 'Układ kolumnowy musi zawierać od 2 do 4 kolumn.'
  }

  const columns = value as ColumnCandidate[]

  for (const column of columns) {
    if (
      !Number.isInteger(column?.width) ||
      (column.width as number) < minimumColumnWidth ||
      (column.width as number) > maximumColumnWidth
    ) {
      return 'Szerokość każdej kolumny musi być liczbą całkowitą od 2 do 10.'
    }

    if (containsNestedColumnLayout(column.blocks)) {
      return 'Układu kolumnowego nie można zagnieżdżać.'
    }
  }

  const widthSum = columns.reduce((sum, column) => sum + Number(column.width), 0)
  return widthSum === totalColumnWidth ? undefined : 'Szerokości kolumn muszą sumować się do 12.'
}

export const validateColumnLayoutColumns: ArrayFieldValidation = (value) =>
  getColumnLayoutValidationError(value) ?? true

const enforceColumnLayoutColumns: FieldHook = ({ value }) => {
  const validationError = getColumnLayoutValidationError(value)
  if (validationError) {
    throw new APIError(validationError, 400)
  }
  return value
}

export const ColumnLayoutBlock: Block = {
  slug: 'columnLayout',
  admin: {
    components: {
      Label: '/components/admin/ContentBlockLabel#ColumnLayoutBlockLabel',
    },
    disableBlockName: true,
    group: 'Układ',
    images: {
      thumbnail: {
        alt: 'Schematyczna ikona układu kolumnowego',
        url: '/assets/block-thumbnails/column-layout.png',
      },
    },
  },
  fields: [
    {
      name: 'columns',
      type: 'array',
      admin: {
        components: {
          Field: '/components/admin/ColumnLayoutField#ColumnLayoutField',
        },
      },
      defaultValue: [
        { blocks: [], width: 6 },
        { blocks: [], width: 6 },
      ],
      hooks: {
        beforeValidate: [enforceColumnLayoutColumns],
      },
      fields: [
        {
          name: 'width',
          type: 'number',
          admin: { step: 1 },
          defaultValue: 2,
          label: 'Szerokość',
          max: maximumColumnWidth,
          min: minimumColumnWidth,
          required: true,
        },
        {
          name: 'blocks',
          type: 'blocks',
          admin: { initCollapsed: false },
          blocks: contentLeafBlocks,
          label: 'Bloki w kolumnie',
          labels: {
            plural: 'Bloki w kolumnie',
            singular: 'blok w kolumnie',
          },
        },
      ],
      label: 'Kolumny',
      labels: {
        plural: 'Kolumny',
        singular: 'kolumnę',
      },
      maxRows: maximumColumnCount,
      minRows: minimumColumnCount,
      required: true,
      validate: validateColumnLayoutColumns,
    },
  ],
  interfaceName: 'ColumnLayoutBlock',
  labels: {
    plural: 'Układy kolumnowe',
    singular: 'Układ kolumnowy',
  },
}
