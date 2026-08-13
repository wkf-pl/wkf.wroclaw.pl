import Link from 'next/link'
import type { CSSProperties } from 'react'

import type { Footer, Navigation } from '@/payload-types'
import { hasRenderableIcon, resolveLink } from '@/modules/navigation/links'

import { MenuIcon } from './MenuIcon'

export function SiteFooter({ footer, navigation }: { footer: Footer; navigation: Navigation }) {
  const socialItems = navigation.socialItems?.flatMap((item) => {
    const link = resolveLink(item)
    return link && hasRenderableIcon(item) ? [{ item, link }] : []
  })
  const columns = navigation.footerColumns?.flatMap((column) => {
    const items = column.items?.flatMap((item) => {
      const link = resolveLink(item)
      return link ? [{ item, link }] : []
    })

    return items?.length ? [{ ...column, items }] : []
  })

  return (
    <div className="siteFooterShell">
      <footer className="siteFooter">
        <div className="footerBrand">
          {/* eslint-disable-next-line @next/next/no-img-element -- Static brand asset needs no image optimization. */}
          <img alt="" height="90" src="/assets/logo-color.webp" width="90" />
          <strong>
            Wrocławski
            <br />
            Klub Fantastyki
          </strong>
          {footer.copyrightText ? <small>{footer.copyrightText}</small> : null}
        </div>
        {socialItems?.length ? (
          <nav aria-label="Media społecznościowe" className="socialLinks">
            {socialItems.map(({ item, link }) => (
              <Link aria-label={item.label} key={item.id} {...link}>
                <MenuIcon
                  customIcon={item.customIcon}
                  iconSource={item.iconSource}
                  systemIcon={item.systemIcon}
                />
              </Link>
            ))}
          </nav>
        ) : null}
        {columns?.length ? (
          <div
            className="footerMenus"
            style={{ '--footer-column-count': columns.length } as CSSProperties}
          >
            {columns.map((column) => (
              <nav aria-label={`${column.title} w stopce`} key={column.id}>
                <strong>{column.title}</strong>
                {column.items.map(({ item, link }) => (
                  <Link key={item.id} {...link}>
                    {item.label}
                  </Link>
                ))}
              </nav>
            ))}
          </div>
        ) : null}
      </footer>
    </div>
  )
}
