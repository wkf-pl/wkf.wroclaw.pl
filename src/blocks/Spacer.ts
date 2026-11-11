import type { Block } from 'payload'

export const defaultSpacerSize = '32'

const spacerSizeOptions = [
  { label: 'Bardzo mały', value: '16' },
  { label: 'Mały', value: '24' },
  { label: 'Średni', value: '32' },
  { label: 'Duży', value: '48' },
  { label: 'Bardzo duży', value: '64' },
]

export function getSpacerHeight(size: string | null | undefined): number {
  return Number(spacerSizeOptions.find(({ value }) => value === size)?.value ?? defaultSpacerSize)
}

export const SpacerBlock: Block = {
  slug: 'spacer',
  admin: { disableBlockName: true, group: 'Układ' },
  fields: [
    {
      name: 'size',
      type: 'select',
      defaultValue: defaultSpacerSize,
      label: 'Wielkość',
      options: spacerSizeOptions,
      required: true,
    },
  ],
  interfaceName: 'SpacerBlock',
  labels: { plural: 'Odstępy', singular: 'Odstęp' },
}
