import type { Field, Validate } from 'payload'

import { rasterIconDefinitions, type SelectableRasterIconName } from '@/modules/icons/icon-registry'

export const iconNameOptions: { label: string; value: SelectableRasterIconName }[] =
  rasterIconDefinitions
    .filter((definition) => definition.selectable)
    .map(({ label, name }) => ({ label, value: name }))
    .sort((first, second) => first.label.localeCompare(second.label, 'pl'))

type CreateRasterIconFieldOptions<SiblingData> = {
  adminWidth?: string
  databaseName?: string
  label?: string
  name?: string
  validate?: Validate<unknown, unknown, SiblingData>
}

export function createRasterIconField<SiblingData = Record<string, unknown>>({
  adminWidth,
  databaseName,
  label = 'Ikona',
  name = 'iconName',
  validate,
}: CreateRasterIconFieldOptions<SiblingData> = {}): Field {
  return {
    name,
    type: 'select',
    admin: {
      components: {
        Field: '/components/admin/RasterIconPickerField#RasterIconPickerField',
      },
      ...(adminWidth ? { width: adminWidth } : {}),
    },
    ...(databaseName ? { dbName: databaseName } : {}),
    label,
    options: [...iconNameOptions],
    ...(validate ? { validate } : {}),
  }
}
