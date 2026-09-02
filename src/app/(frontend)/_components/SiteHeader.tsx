import Link from 'next/link'

import type { Navigation, SiteSetting } from '@/payload-types'
import { getMediaURL } from '@/modules/media/media-url'
import { hasRenderableIcon, resolveLink } from '@/modules/navigation/links'

import { MenuIcon } from './MenuIcon'

export function SiteHeader({
  navigation,
  siteSettings,
}: {
  navigation: Navigation
  siteSettings: SiteSetting
}) {
  const items = navigation.headerItems?.flatMap((item) => {
    const link = resolveLink(item)
    return link && (item.appearance !== 'icon' || hasRenderableIcon(item)) ? [{ item, link }] : []
  })
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
            {items.map(({ item, link }) => (
              <Link
                aria-label={item.appearance === 'icon' ? item.label : undefined}
                className={`headerMenuItem headerMenuItem-${item.appearance}`}
                key={item.id}
                {...link}
              >
                {item.appearance === 'icon' ? (
                  <MenuIcon
                    customIcon={item.customIcon}
                    iconSource={item.iconSource}
                    systemIcon={item.systemIcon}
                  />
                ) : (
                  item.label
                )}
              </Link>
            ))}
          </nav>
        ) : null}
      </header>
    </div>
  )
}
