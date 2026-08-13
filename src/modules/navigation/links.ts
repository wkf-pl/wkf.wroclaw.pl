import type { Media, Navigation, Page } from '@/payload-types'
import { isSystemIconName } from './icon-names'

export type NavigationItem = NonNullable<Navigation['headerItems']>[number]

type LinkTarget = Pick<NavigationItem, 'openInNewTab' | 'page' | 'targetType' | 'url'>

export type ResolvedLink = {
  href: string
  rel?: 'noopener noreferrer'
  target?: '_blank'
}

export function resolveLink(item: LinkTarget): ResolvedLink | null {
  let href: string | undefined

  if (item.targetType === 'page') {
    const page = getPublishedPage(item.page)
    href = page ? `/${page.slug}` : undefined
  } else {
    href = item.url?.trim() || undefined
  }

  if (!href) {
    return null
  }

  return item.openInNewTab ? { href, rel: 'noopener noreferrer', target: '_blank' } : { href }
}

export function resolvePageLink(page: null | number | Page | undefined): ResolvedLink | null {
  const publishedPage = getPublishedPage(page)
  return publishedPage ? { href: `/${publishedPage.slug}` } : null
}

export function getCustomIconURL(icon: Media | null | number | undefined): string | null {
  return icon && typeof icon === 'object' && icon.url ? icon.url : null
}

export function hasRenderableIcon(item: {
  customIcon?: Media | null | number
  iconSource?: 'media' | 'system' | null
  systemIcon?: null | string
}): boolean {
  return item.iconSource === 'media'
    ? Boolean(getCustomIconURL(item.customIcon))
    : isSystemIconName(item.systemIcon)
}

function getPublishedPage(page: null | number | Page | undefined): Page | null {
  if (!page || typeof page !== 'object' || page._status !== 'published' || !page.slug) {
    return null
  }

  return page
}
