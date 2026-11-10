import type { Event } from '@/payload-types'
import type { ManualContentReference } from '@/modules/content/content-listing'
import { buildGoogleMapsURL } from '@/modules/events/map-embed'
import {
  resolvePresentedLink,
  type PresentedLinkData,
  type ResolvedPresentedLink,
} from '@/modules/navigation/links'

import type { PageTemplateContextAction } from './page-template-registry'

type ContextActionLinkData = PresentedLinkData & {
  actionSource?: null | string
  contextAction?: null | string
}

type PresentedLinkResolutionOptions = {
  siteContactEmail?: null | string
}

export function resolvePageTemplateActionLinks(
  items: ContextActionLinkData[] | null | undefined,
  document: unknown,
  options: PresentedLinkResolutionOptions = {},
): ResolvedPresentedLink[] {
  return (items ?? []).flatMap((item) => {
    if (item.actionSource !== 'contextAction') {
      const resolved = resolvePresentedLink(item, options)
      return resolved ? [resolved] : []
    }

    const action = resolveEventAction(item.contextAction, document)
    if (!action) return []

    const target = toCustomTarget(action.href)
    if (!target) return []

    const resolved = resolvePresentedLink({
      ...item,
      ...target,
      targetType: 'custom',
    })
    if (!resolved) return []

    return [
      {
        ...resolved,
        accessibleName: resolved.iconOnly ? action.label : resolved.accessibleName,
      },
    ]
  })
}

export function resolvePageTemplateListingItems(
  relation: null | string | undefined,
  document: unknown,
): ManualContentReference[] {
  if (relation !== 'eventPartners' || !isEvent(document)) return []

  return (document.partners ?? []).flatMap((item) => {
    if (!item.partner) return []
    return [
      {
        contextLabel: item.contribution?.trim() || null,
        partnerRoles: item.roles,
        relationTo: 'partners' as const,
        value: item.partner,
      },
    ]
  })
}

function resolveEventAction(
  action: null | string | undefined,
  document: unknown,
): { href: string; label: string } | null {
  if (!isEvent(document)) return null

  if (action === 'eventCalendar') {
    return {
      href: `/events/${document.slug}/calendar.ics`,
      label: 'Dodaj do kalendarza',
    }
  }

  if (action === 'eventMap') {
    if (!hasEventLocation(document)) return null
    return {
      href: buildGoogleMapsURL({
        city: document.location.city,
        name: document.location.venueName,
        postalCode: document.location.postalCode,
        streetAddress: document.location.streetAddress,
      }),
      label: 'Otwórz w Mapach',
    }
  }

  if (action === 'eventCycleCalendar') {
    const cycle = document.cycle && typeof document.cycle === 'object' ? document.cycle : null
    if (!cycle?.calendarFeedKey) return null
    return {
      href: `/events/calendar.ics?${new URLSearchParams({
        series: cycle.calendarFeedKey,
      }).toString()}`,
      label: 'Subskrybuj cykl',
    }
  }

  return null
}

function toCustomTarget(
  href: string,
): { customAddress: string; customScheme: 'https' | 'path' } | null {
  if (href.startsWith('/')) {
    return { customAddress: href.slice(1), customScheme: 'path' }
  }

  try {
    const url = new URL(href)
    if (url.protocol !== 'https:') return null
    return {
      customAddress: `${url.host}${url.pathname}${url.search}${url.hash}`,
      customScheme: 'https',
    }
  } catch {
    return null
  }
}

function hasEventLocation(event: Event): boolean {
  return Boolean(
    event.location.venueName?.trim() ||
    event.location.streetAddress?.trim() ||
    event.location.postalCode?.trim() ||
    event.location.city?.trim(),
  )
}

function isEvent(value: unknown): value is Event {
  return Boolean(
    value &&
    typeof value === 'object' &&
    'slug' in value &&
    typeof value.slug === 'string' &&
    'location' in value &&
    value.location &&
    typeof value.location === 'object',
  )
}

export type PageTemplateContextActionKey = PageTemplateContextAction['key']
