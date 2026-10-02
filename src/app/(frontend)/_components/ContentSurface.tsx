import type { CSSProperties, ElementType, ReactNode } from 'react'

import type { ResolvedContentSurface } from '@/modules/content/content-surface'

type ContentSurfaceProperties = {
  as?: ElementType
  children: ReactNode
  className?: string
  columnWidth?: number | null
  style?: CSSProperties
  surface: ResolvedContentSurface
}

export function ContentSurface({
  as: Element = 'div',
  children,
  className,
  columnWidth,
  style,
  surface,
}: ContentSurfaceProperties) {
  const classes = [
    'contentSurface',
    `contentSurface--${surface.surface}`,
    !surface.imageURL && surface.surface === 'image' ? 'contentSurface--missingImage' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')
  const imageStyle = { objectPosition: surface.objectPosition } as CSSProperties

  return (
    <Element
      className={classes}
      data-column-width={columnWidth ?? undefined}
      data-surface={surface.surface}
      style={style}
    >
      {surface.imageURL ? (
        // eslint-disable-next-line @next/next/no-img-element -- CMS media can use a runtime-configured Azure host.
        <img
          alt=""
          aria-hidden="true"
          className="contentSurfaceImage"
          src={surface.imageURL}
          style={imageStyle}
        />
      ) : null}
      {surface.surface === 'image' ? (
        <span aria-hidden="true" className="contentSurfaceShade" />
      ) : null}
      <div className="contentSurfaceContent">{children}</div>
    </Element>
  )
}
