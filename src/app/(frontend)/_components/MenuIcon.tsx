import type { Media } from '@/payload-types'
import { getCustomIconURL } from '@/modules/navigation/links'
import { isSystemIconName } from '@/modules/navigation/icon-names'

import { Icon } from './Icon'

type MenuIconProperties = {
  customIcon?: Media | null | number
  iconSource?: 'media' | 'system' | null
  systemIcon?: null | string
}

export function MenuIcon({ customIcon, iconSource, systemIcon }: MenuIconProperties) {
  if (iconSource === 'media') {
    const iconURL = getCustomIconURL(customIcon)

    return iconURL ? (
      // eslint-disable-next-line @next/next/no-img-element -- CMS media can use a runtime-configured Azure host.
      <img alt="" src={iconURL} />
    ) : null
  }

  return isSystemIconName(systemIcon) ? <Icon name={systemIcon} /> : null
}
