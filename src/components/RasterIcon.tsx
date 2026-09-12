import type { CSSProperties, HTMLAttributes } from 'react'

import {
  getRasterIconURL,
  type RasterIconName,
  type RasterIconSize,
} from '@/modules/icons/icon-registry'

type RasterIconProperties = {
  name: RasterIconName
  size: RasterIconSize
} & Omit<HTMLAttributes<HTMLSpanElement>, 'children'>

type RasterIconStyle = CSSProperties & {
  WebkitMaskImage: string
  maskImage: string
}

export function RasterIcon({ className, name, size, style, ...properties }: RasterIconProperties) {
  const iconURL = getRasterIconURL(name, size)
  const maskURL = `url("${iconURL}")`
  const iconStyle: RasterIconStyle = {
    ...style,
    WebkitMaskImage: maskURL,
    maskImage: maskURL,
  }

  return (
    <span
      aria-hidden="true"
      className={['rasterIcon', className].filter(Boolean).join(' ')}
      data-icon-name={name}
      data-icon-size={size}
      style={iconStyle}
      {...properties}
    />
  )
}
