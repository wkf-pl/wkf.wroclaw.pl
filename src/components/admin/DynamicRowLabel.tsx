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

function DynamicLabel({ prefix, value }: { prefix: string; value: string }) {
  return (
    <span>
      <strong>{prefix}</strong>
      {value ? `: ${value}` : null}
    </span>
  )
}

function useRowValue(fieldName: string): string {
  const { data, path } = useRowLabel<RowData>()
  const liveValue = useFormFields(([fields]) => fields[`${path}.${fieldName}`]?.value)

  return getText(liveValue) || getText(data[fieldName])
}

export function NavigationItemRowLabel() {
  return <DynamicLabel prefix="Pozycja menu" value={useRowValue('label')} />
}

export function SocialItemRowLabel() {
  return <DynamicLabel prefix="Medium społecznościowe" value={useRowValue('label')} />
}

export function FooterColumnRowLabel() {
  return <DynamicLabel prefix="Kolumna" value={useRowValue('title')} />
}

export function FooterColumnItemRowLabel() {
  return <DynamicLabel prefix="Pozycja" value={useRowValue('label')} />
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
