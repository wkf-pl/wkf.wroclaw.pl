import type {
  Category,
  Document,
  Event,
  EventCycle,
  Page,
  Partner,
  Post,
  Tag,
} from '@/payload-types'
import {
  isSelectableRasterIconName,
  type SelectableRasterIconName,
} from '@/modules/icons/icon-registry'
import { buildCustomTarget, isCustomScheme } from './custom-target'

export type LinkTarget = {
  category?: Category | number | null
  customAddress?: null | string
  customScheme?: null | string
  document?: Document | number | null
  emailBody?: null | string
  emailSubject?: null | string
  event?: Event | number | null
  eventCycle?: EventCycle | number | null
  openInNewTab?: null | boolean
  page?: Page | number | null
  partner?: Partner | number | null
  post?: Post | number | null
  tag?: Tag | number | null
  targetType?: null | string
}

export type PresentedLinkData = LinkTarget & {
  appearance?: null | string
  iconName?: null | string
  id?: null | string
  label?: null | string
}

export type ResolvedLink = {
  href: string
  rel?: 'noopener noreferrer'
  target?: '_blank'
}

export function resolveLink(
  item: LinkTarget,
  { siteContactEmail }: { siteContactEmail?: null | string } = {},
): ResolvedLink | null {
  let href: string | undefined

  if (item.targetType === 'page') {
    const page = getPublishedPage(item.page)
    href = page ? `/${page.slug}` : undefined
  } else if (item.targetType === 'category') {
    const category = getTaxonomyDocument(item.category)
    href = category ? `/category/${category.slug}` : undefined
  } else if (item.targetType === 'tag') {
    const tag = getTaxonomyDocument(item.tag)
    href = tag ? `/tag/${tag.slug}` : undefined
  } else if (item.targetType === 'event') {
    const event = getPublishedDocument(item.event)
    href = event ? `/events/${event.slug}` : undefined
  } else if (item.targetType === 'eventCycle') {
    const cycle = getPublishedDocument(item.eventCycle)
    href = cycle ? `/events/series/${cycle.slug}` : undefined
  } else if (item.targetType === 'partner') {
    const partner = getPublishedDocument(item.partner)
    href = partner ? `/partners/${partner.slug}` : undefined
  } else if (item.targetType === 'document') {
    const document = getPublishedDocument(item.document)
    href = document ? `/dokumenty/${document.slug}` : undefined
  } else if (item.targetType === 'post') {
    const post = getPublishedDocument(item.post)
    href = post ? `/blog/${post.slug}` : undefined
  } else if (item.targetType === 'siteContactEmail') {
    const normalizedEmail = siteContactEmail?.trim()
    if (normalizedEmail) {
      const parameters = new URLSearchParams()
      if (item.emailSubject?.trim()) parameters.set('subject', item.emailSubject.trim())
      if (item.emailBody?.trim()) parameters.set('body', item.emailBody.trim())
      const query = parameters.toString()
      href = `mailto:${normalizedEmail}${query ? `?${query}` : ''}`
    }
  } else {
    href = isCustomScheme(item.customScheme)
      ? (buildCustomTarget(item.customScheme, item.customAddress) ?? undefined)
      : undefined
  }

  if (!href) {
    return null
  }

  return item.targetType !== 'siteContactEmail' && item.openInNewTab
    ? { href, rel: 'noopener noreferrer', target: '_blank' }
    : { href }
}

export type PresentedLinkAppearance = 'link' | 'primaryButton' | 'secondaryButton'

export type ResolvedPresentedLink = {
  accessibleName: string
  appearance: PresentedLinkAppearance
  iconName?: SelectableRasterIconName
  iconOnly: boolean
  id?: null | string
  label: string
  link: ResolvedLink
}

function normalizePresentedLinkAppearance(value: unknown): PresentedLinkAppearance {
  if (value === 'primaryButton' || value === 'secondaryButton') return value
  if (value === 'button') return 'secondaryButton'
  return 'link'
}

export function resolvePresentedLink(
  item: PresentedLinkData,
  options: { siteContactEmail?: null | string } = {},
): ResolvedPresentedLink | null {
  const link = resolveLink(item, options)
  if (!link) return null

  const legacyIconOnly = item.appearance === 'icon'
  const label = legacyIconOnly ? '' : item.label?.trim() || ''
  const iconName = hasRenderableIcon(item) ? (item.iconName ?? undefined) : undefined
  const iconOnly = !label
  const accessibleName = iconOnly ? resolveLinkTargetName(item, options) || link.href : label

  if ((iconOnly && !iconName) || !accessibleName) return null

  return {
    accessibleName,
    appearance: normalizePresentedLinkAppearance(item.appearance),
    iconName,
    iconOnly,
    id: item.id,
    label,
    link,
  }
}

export function resolveLinkTargetName(
  item: LinkTarget,
  { siteContactEmail }: { siteContactEmail?: null | string } = {},
): string {
  if (item.targetType === 'page') return getDocumentName(item.page)
  if (item.targetType === 'category') return getDocumentName(item.category)
  if (item.targetType === 'tag') return getDocumentName(item.tag)
  if (item.targetType === 'event') return getDocumentName(item.event)
  if (item.targetType === 'eventCycle') return getDocumentName(item.eventCycle)
  if (item.targetType === 'partner') return getDocumentName(item.partner)
  if (item.targetType === 'document') return getDocumentName(item.document)
  if (item.targetType === 'post') return getDocumentName(item.post)
  if (item.targetType === 'siteContactEmail') return siteContactEmail?.trim() || ''

  return getCustomTargetName(item)
}

export function resolvePresentedLinks(
  items: PresentedLinkData[] | null | undefined,
  options: { siteContactEmail?: null | string } = {},
): ResolvedPresentedLink[] {
  return (items ?? []).flatMap((item) => {
    const resolved = resolvePresentedLink(item, options)
    return resolved ? [resolved] : []
  })
}

function getPublishedDocument<T extends Document | Event | EventCycle | Partner | Post>(
  value: null | number | T | undefined,
): T | null {
  return value && typeof value === 'object' && value._status === 'published' && value.slug
    ? value
    : null
}

function getTaxonomyDocument(
  value: Category | null | number | Tag | undefined,
): Category | Tag | null {
  return value && typeof value === 'object' && value.slug ? value : null
}

function getDocumentName(value: unknown): string {
  if (!value || typeof value !== 'object') return ''

  const document = value as Record<string, unknown>
  for (const fieldName of ['title', 'name', 'fullTitle', 'slug']) {
    const fieldValue = document[fieldName]
    if (typeof fieldValue === 'string' && fieldValue.trim()) {
      return fieldName === 'slug' ? humanizeTargetSegment(fieldValue) : fieldValue.trim()
    }
  }

  return ''
}

function getCustomTargetName(item: LinkTarget): string {
  const address = item.customAddress?.trim()
  if (!address || !isCustomScheme(item.customScheme)) return ''

  if (item.customScheme === 'mailto' || item.customScheme === 'tel') return address
  if (item.customScheme === 'anchor' || item.customScheme === 'path') {
    return humanizeTargetSegment(address)
  }

  const href = buildCustomTarget(item.customScheme, address)
  if (!href) return ''

  try {
    return new URL(href).hostname.replace(/^www\./, '')
  } catch {
    return address
  }
}

function humanizeTargetSegment(value: string): string {
  const normalized = value.replace(/^[/#]+|[/#]+$/g, '')
  if (!normalized) return 'Strona główna'

  const lastSegment = normalized.split('/').filter(Boolean).at(-1) ?? normalized
  let decodedSegment = lastSegment
  try {
    decodedSegment = decodeURIComponent(lastSegment)
  } catch {
    // Keep the original segment when it contains malformed percent encoding.
  }
  const words = decodedSegment.replace(/[-_]+/g, ' ').trim()
  return words ? `${words.charAt(0).toLocaleUpperCase('pl-PL')}${words.slice(1)}` : ''
}

export function resolvePageLink(page: null | number | Page | undefined): ResolvedLink | null {
  const publishedPage = getPublishedPage(page)
  return publishedPage ? { href: `/${publishedPage.slug}` } : null
}

export function hasRenderableIcon(item: {
  iconName?: null | string
}): item is { iconName: SelectableRasterIconName } {
  return isSelectableRasterIconName(item.iconName)
}

function getPublishedPage(page: null | number | Page | undefined): Page | null {
  if (!page || typeof page !== 'object' || page._status !== 'published' || !page.slug) {
    return null
  }

  return page
}
