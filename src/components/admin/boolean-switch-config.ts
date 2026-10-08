import type { CheckboxField } from 'payload'

export const booleanSwitchFieldComponent = '/components/admin/BooleanSwitchField#BooleanSwitchField'

export const defaultBooleanSwitchLabels = {
  falseLabel: 'Nie',
  trueLabel: 'Tak',
} as const

export type BooleanSwitchLabels = {
  falseLabel: string
  trueLabel: string
}

type BooleanSwitchAdminOptions = NonNullable<CheckboxField['admin']> & Partial<BooleanSwitchLabels>

export function createBooleanSwitchAdmin({
  falseLabel = defaultBooleanSwitchLabels.falseLabel,
  trueLabel = defaultBooleanSwitchLabels.trueLabel,
  ...admin
}: BooleanSwitchAdminOptions = {}): NonNullable<CheckboxField['admin']> {
  return {
    ...admin,
    components: {
      ...admin.components,
      Field: booleanSwitchFieldComponent,
    },
    custom: {
      ...admin.custom,
      booleanSwitch: {
        falseLabel,
        trueLabel,
      } satisfies BooleanSwitchLabels,
    },
  }
}
