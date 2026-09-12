import type { HTMLAttributes } from 'react'

import { RasterIcon } from '@/components/RasterIcon'
import type { RasterIconName } from '@/modules/icons/icon-registry'

type ContactChannelIconProperties = {
  type: string
} & Omit<HTMLAttributes<HTMLSpanElement>, 'children'>

const contactChannelIconNames: Record<string, RasterIconName> = {
  bluesky: 'bluesky',
  discord: 'discord',
  email: 'mail',
  facebook: 'facebook',
  instagram: 'instagram',
  linkedin: 'linkedin',
  mastodon: 'globe',
  messenger: 'messenger',
  twitch: 'twitch',
  website: 'globe',
  youtube: 'youtube',
}

export function ContactChannelIcon({ type, ...properties }: ContactChannelIconProperties) {
  return (
    <RasterIcon name={contactChannelIconNames[type] ?? 'globe'} size="medium" {...properties} />
  )
}
