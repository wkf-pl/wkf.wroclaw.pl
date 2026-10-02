import Link from 'next/link'

import type { Navigation, SiteSetting } from '@/payload-types'
import { getMediaURL } from '@/modules/media/media-url'
import { resolvePresentedLinks } from '@/modules/navigation/links'

import { PresentedLink } from './PresentedLink'

export function SiteHeader({
  navigation,
  siteSettings,
}: {
  navigation: Navigation
  siteSettings: SiteSetting
}) {
  const items = resolvePresentedLinks(navigation.headerItems ?? [])
  const logoURL = getMediaURL(navigation.logo) ?? '/assets/logo-color.webp'
  const logoAlternativeText =
    navigation.logo && typeof navigation.logo === 'object' ? navigation.logo.alt : ''

  return (
    <div className="siteHeaderShell">
      <header className="siteHeader">
        <Link
          aria-label={`${siteSettings.siteName} — strona główna`}
          className="siteBrand"
          href="/"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- CMS media can use a runtime-configured Azure host. */}
          <img alt={logoAlternativeText} height="76" src={logoURL} width="76" />
          <span>{siteSettings.siteName}</span>
        </Link>
        {items?.length ? (
          <nav aria-label="Główna nawigacja">
            {items.map((item, itemIndex) => (
              <PresentedLink
                className="headerMenuItem"
                item={item}
                key={`${item.link.href}-${itemIndex}`}
              />
            ))}
          </nav>
        ) : null}
      </header>
    </div>
  )
}
