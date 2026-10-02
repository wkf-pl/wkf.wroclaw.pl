'use client'

import { useFormFields, useRowLabel } from '@payloadcms/ui'

type RowData = Record<string, unknown>

const contactChannelLabels: Record<string, string> = {
  bluesky: 'Bluesky',
  discord: 'Discord',
  email: 'E-mail',
  facebook: 'Facebook',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  mastodon: 'Mastodon',
  messenger: 'Messenger',
  other: 'Inny link',
  twitch: 'Twitch',
  website: 'Strona WWW',
  youtube: 'YouTube',
}

function getText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function getTargetText(value: unknown): string {
  const directText = getText(value)
  if (directText) return directText
  if (!value || typeof value !== 'object') return ''

  const candidate = value as RowData
  for (const fieldName of ['title', 'name', 'fullTitle', 'label', 'slug', 'value']) {
    const nestedText = getTargetText(candidate[fieldName])
    if (nestedText) return nestedText
  }

  return ''
}

function DynamicLabel({ prefix, value }: { prefix: string; value: string }) {
  return (
    <span>
      <strong>{prefix}</strong>
      {value ? `: ${value}` : null}
    </span>
  )
}

function useRowFieldValue(fieldName: string): unknown {
  const { data, path } = useRowLabel<RowData>()
  const liveValue = useFormFields(([fields]) => fields[`${path}.${fieldName}`]?.value)

  return liveValue ?? data[fieldName]
}

function useRowValue(fieldName: string): string {
  return getText(useRowFieldValue(fieldName))
}

const presentedLinkTargetLabels: Record<string, string> = {
  category: 'Kategoria',
  custom: 'Własny adres',
  document: 'Dokument',
  event: 'Wydarzenie',
  eventCycle: 'Cykl wydarzeń',
  page: 'Strona',
  partner: 'Partner',
  post: 'Wpis',
  siteContactEmail: 'Główny adres serwisu',
  tag: 'Tag',
}

function usePresentedLinkDescription(): string {
  const visibleLabel = useRowValue('label')
  const targetType = useRowValue('targetType')
  const customAddress = useRowValue('customAddress')
  const category = useRowFieldValue('category')
  const document = useRowFieldValue('document')
  const event = useRowFieldValue('event')
  const eventCycle = useRowFieldValue('eventCycle')
  const page = useRowFieldValue('page')
  const partner = useRowFieldValue('partner')
  const post = useRowFieldValue('post')
  const tag = useRowFieldValue('tag')

  if (visibleLabel) return visibleLabel

  const targetValues: Record<string, unknown> = {
    category,
    custom: customAddress,
    document,
    event,
    eventCycle,
    page,
    partner,
    post,
    tag,
  }
  const targetText = getTargetText(targetValues[targetType])
  return targetText || presentedLinkTargetLabels[targetType] || ''
}

export function NavigationItemRowLabel() {
  return <DynamicLabel prefix="Pozycja" value={usePresentedLinkDescription()} />
}

export function PresentedLinkRowLabel() {
  return <DynamicLabel prefix="Odnośnik" value={usePresentedLinkDescription()} />
}

export function HomepageGroupRowLabel() {
  return <DynamicLabel prefix="Grupa" value={useRowValue('name')} />
}

export function SocialItemRowLabel() {
  return <DynamicLabel prefix="Medium społecznościowe" value={usePresentedLinkDescription()} />
}

export function FooterColumnRowLabel() {
  return <DynamicLabel prefix="Kolumna" value={useRowValue('title')} />
}

export function FooterColumnItemRowLabel() {
  return <DynamicLabel prefix="Pozycja" value={usePresentedLinkDescription()} />
}

const surfaceLabels: Record<string, string> = {
  default: 'domyślna',
  image: 'obraz',
  inverse: 'odwrócona',
  subtle: 'subtelna',
}

export function SectionGroupSectionRowLabel() {
  const { data, path, rowNumber } = useRowLabel<RowData>()
  const liveData = useFormFields(([fields]) => {
    const surface = fields[`${path}.surface`]?.value
    const firstHeadingPath = Object.entries(fields)
      .flatMap(([fieldPath, field]) =>
        fieldPath.startsWith(`${path}.blocks.`) &&
        fieldPath.endsWith('.blockType') &&
        field.value === 'heading'
          ? [fieldPath.slice(0, -'.blockType'.length)]
          : [],
      )
      .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }))[0]
    const heading = firstHeadingPath ? fields[`${firstHeadingPath}.text`]?.value : undefined
    return { heading, surface }
  })
  const surface = getText(liveData.surface) || getText(data.surface) || 'default'
  const blocks = Array.isArray(data.blocks) ? data.blocks : []
  const heading = getText(liveData.heading) || findFirstHeadingText(blocks)
  const value = [surfaceLabels[surface] ?? surface, heading].filter(Boolean).join(' · ')

  return <DynamicLabel prefix={`Sekcja ${(rowNumber ?? 0) + 1}`} value={value} />
}

function findFirstHeadingText(blocks: unknown[]): string {
  for (const block of blocks) {
    if (!block || typeof block !== 'object') continue
    const candidate = block as RowData
    if (candidate.blockType === 'heading') return getText(candidate.text)
    if (candidate.blockType !== 'columnLayout' || !Array.isArray(candidate.columns)) continue

    for (const column of candidate.columns) {
      if (!column || typeof column !== 'object') continue
      const nestedBlocks = (column as RowData).blocks
      if (!Array.isArray(nestedBlocks)) continue
      const nestedHeading = findFirstHeadingText(nestedBlocks)
      if (nestedHeading) return nestedHeading
    }
  }

  return ''
}

export function ContactChannelRowLabel() {
  const channelType = useRowValue('type')
  const channelLabel = contactChannelLabels[channelType] || channelType
  const address = useRowValue('url')
  const value = [channelLabel, address].filter(Boolean).join(': ')

  return <DynamicLabel prefix="Kontakt" value={value} />
}

export function GameRowLabel() {
  return <DynamicLabel prefix="Gra" value={useRowValue('title')} />
}

export function EventLinkRowLabel() {
  return <DynamicLabel prefix="Link" value={useRowValue('label')} />
}
