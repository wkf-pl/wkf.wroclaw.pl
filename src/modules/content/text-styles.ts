import type { SelectField } from 'payload'

export const contentBadgeVariants = [
  { label: 'Etykieta', value: 'badge' },
  { label: 'Etykieta wyróżniona', value: 'emphasizedBadge' },
] as const

export function createTextStyleOptions({
  basic,
  compact,
  basicFirst = false,
}: {
  basic: string
  compact: string
  basicFirst?: boolean
}) {
  const leadOption = { label: 'Tekst wprowadzający', value: 'lead' }
  const basicOption = { label: 'Tekst podstawowy', value: basic }
  return [
    ...(basicFirst ? [basicOption, leadOption] : [leadOption, basicOption]),
    { label: 'Tekst kompaktowy', value: compact },
    ...contentBadgeVariants,
  ]
}

type SingleStyleSelectField = Extract<SelectField, { hasMany?: false }>

export function createStyleField(
  field: Omit<SingleStyleSelectField, 'type' | 'label'>,
): SelectField {
  return {
    ...field,
    type: 'select',
    label: 'Styl',
    admin: { ...field.admin, isClearable: false },
  }
}

export function getTextBadgeClassName(style: string | null | undefined): string {
  if (style === 'emphasizedBadge') return ' pageTemplateBadge pageTemplateBadge--emphasizedBadge'
  return style === 'badge' ? ' pageTemplateBadge' : ''
}
