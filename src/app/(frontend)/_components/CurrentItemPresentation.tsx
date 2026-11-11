import type { ReactNode } from 'react'

import { getTextBadgeClassName } from '@/modules/content/text-styles'

export function CurrentItemHeading({ text, variant }: { text: string; variant: string }) {
  if (variant === 'eyebrow') return <p className="eyebrow contentHeroEyebrow">{text}</p>
  if (variant === 'sectionHeading') return <h2 className="pageTemplateCurrentHeading">{text}</h2>
  return <h1>{text}</h1>
}

export function getCurrentItemTextClassName(variant: string): string {
  return `pageTemplateText pageTemplateText--${variant}${getTextBadgeClassName(variant)}`
}

export function CurrentItemText({ text, variant }: { text?: string | null; variant: string }) {
  return text?.trim() ? <p className={getCurrentItemTextClassName(variant)}>{text}</p> : null
}

export function CurrentItemList({
  children,
  className,
  variant,
}: {
  children: ReactNode
  className?: string
  variant?: string
}) {
  const classes = [className, variant && `pageTemplateCurrentList pageTemplateList--${variant}`]
    .filter(Boolean)
    .join(' ')
  return <ul className={classes || undefined}>{children}</ul>
}
