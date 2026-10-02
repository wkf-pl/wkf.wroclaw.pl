import Link from 'next/link'

import { RasterIcon } from '@/components/RasterIcon'
import type { ResolvedPresentedLink } from '@/modules/navigation/links'

export function PresentedLink({
  className,
  item,
  trailingIconName,
}: {
  className?: string
  item: ResolvedPresentedLink
  trailingIconName?: 'arrow-right'
}) {
  const classes = [
    'presentedLink',
    `presentedLink--${item.appearance}`,
    item.iconOnly ? 'presentedLink--iconOnly' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Link
      aria-label={item.iconOnly ? item.accessibleName : undefined}
      className={classes}
      {...item.link}
    >
      {item.iconName ? (
        <span aria-hidden="true" className="presentedLinkIcon">
          <RasterIcon name={item.iconName} size="medium" />
        </span>
      ) : null}
      {item.label ? <span className="presentedLinkLabel">{item.label}</span> : null}
      {trailingIconName ? (
        <span aria-hidden="true" className="presentedLinkTrailingIcon">
          <RasterIcon name={trailingIconName} size="medium" />
        </span>
      ) : null}
    </Link>
  )
}
