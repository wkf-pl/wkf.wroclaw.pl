import type { CSSProperties, ElementType, ReactNode } from 'react'

import { RasterIcon } from '@/components/RasterIcon'
import type {
  ResolvedContentHeading,
  ResolvedContentPresentation,
} from '@/modules/content/content-presentation'

type ContentPresentationProperties = {
  as?: ElementType
  children: ReactNode
  className?: string
  columnWidth?: number | null
  placement: 'block' | 'column' | 'layout' | 'section' | 'sectionGroup'
  presentation: ResolvedContentPresentation
  style?: CSSProperties
}

export function ContentHeading({ heading }: { heading: ResolvedContentHeading }) {
  if (!heading.text && !heading.iconName) {
    return null
  }

  const HeadingElement = `h${heading.level}` as ElementType

  return (
    <HeadingElement
      className={`contentHeading contentHeading--${heading.level === 2 ? 'major' : 'minor'}`}
    >
      {heading.iconName ? (
        <span
          aria-hidden="true"
          className={`contentHeadingIcon${heading.inverted ? ' contentHeadingIcon--inverted' : ''}`}
        >
          <RasterIcon name={heading.iconName} size="medium" />
        </span>
      ) : null}
      {heading.text ? <span>{heading.text}</span> : null}
      {!heading.text && heading.accessibleName ? (
        <span className="srOnly">{heading.accessibleName}</span>
      ) : null}
    </HeadingElement>
  )
}

export function ContentPresentation({
  as,
  children,
  className,
  columnWidth,
  placement,
  presentation,
  style,
}: ContentPresentationProperties) {
  const Element = as ?? 'div'
  const hasFrame = presentation.frame !== 'none'
  const decorated = hasFrame || presentation.surface !== 'transparent'
  const classes = [
    'contentPresentation',
    `contentPresentation--${placement}`,
    `contentPresentation--${presentation.surface}`,
    hasFrame ? `contentPresentation--frame-${presentation.frame}` : '',
    decorated ? 'contentPresentation--decorated' : '',
    !presentation.imageURL && presentation.surface === 'image'
      ? 'contentPresentation--missingImage'
      : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')
  const imageStyle = { objectPosition: presentation.objectPosition } as CSSProperties

  return (
    <Element
      className={classes}
      data-column-width={columnWidth ?? undefined}
      data-frame={presentation.frame}
      data-surface={presentation.surface}
      style={style}
    >
      {presentation.imageURL ? (
        // eslint-disable-next-line @next/next/no-img-element -- CMS media can use a runtime-configured Azure host.
        <img
          alt=""
          aria-hidden="true"
          className="contentPresentationImage"
          src={presentation.imageURL}
          style={imageStyle}
        />
      ) : null}
      {presentation.surface === 'image' ? (
        <span aria-hidden="true" className="contentPresentationShade" />
      ) : null}
      <div className="contentPresentationContent">
        <div className="contentPresentationBody">{children}</div>
      </div>
    </Element>
  )
}
