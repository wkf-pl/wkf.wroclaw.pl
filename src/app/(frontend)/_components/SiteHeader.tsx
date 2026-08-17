import Image from 'next/image'
import Link from 'next/link'

import type { Navigation } from '@/payload-types'
import { hasRenderableIcon, resolveLink } from '@/modules/navigation/links'

import { MenuIcon } from './MenuIcon'
import { AccountActions } from './AccountActions'

export function SiteHeader({
  displayName,
  navigation,
}: {
  displayName?: null | string
  navigation: Navigation
}) {
  const items = navigation.headerItems?.flatMap((item) => {
    const link = resolveLink(item)
    return link && (item.appearance !== 'icon' || hasRenderableIcon(item)) ? [{ item, link }] : []
  })

  return (
    <div className="siteHeaderShell">
      <header className="siteHeader">
        <Link
          aria-label="Wrocławski Klub Fantastyki — strona główna"
          className="siteBrand"
          href="/"
        >
          <Image alt="" height={76} priority src="/assets/logo-color.webp" width={76} />
          <span>
            Wrocławski
            <br />
            Klub Fantastyki
          </span>
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
        <AccountActions displayName={displayName} />
      </header>
    </div>
  )
}
