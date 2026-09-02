import Link from 'next/link'
import type { CSSProperties } from 'react'

import { CmsRichText } from '@/components/CmsRichText'
import type { Footer, Navigation, SiteSetting } from '@/payload-types'
import { getMediaURL } from '@/modules/media/media-url'
import { hasRenderableIcon, resolveLink } from '@/modules/navigation/links'

import { MenuIcon } from './MenuIcon'

export function SiteFooter({
  footer,
  navigation,
  siteSettings,
}: {
  footer: Footer
  navigation: Navigation
  siteSettings: SiteSetting
}) {
  const socialItems = footer.socialItems?.flatMap((item) => {
    const link = resolveLink(item)
    return link && hasRenderableIcon(item) ? [{ item, link }] : []
  })
  const columns = footer.columns?.flatMap((column) => {
    const items = column.items?.flatMap((item) => {
      const link = resolveLink(item)
      return link ? [{ item, link }] : []
    })

    return items?.length ? [{ ...column, items }] : []
  })
  const logoURL = getMediaURL(navigation.logo) ?? '/assets/logo-color.webp'
  const logoAlternativeText =
    navigation.logo && typeof navigation.logo === 'object' ? navigation.logo.alt : ''

  return (
    <div className="siteFooterShell">
      <footer className="siteFooter">
        <div className="footerBrand">
          {/* eslint-disable-next-line @next/next/no-img-element -- CMS media can use a runtime-configured Azure host. */}
          <img alt={logoAlternativeText} height="90" src={logoURL} width="90" />
          <strong>{siteSettings.siteName}</strong>
          {footer.copyright ? (
            <CmsRichText className="footerCopyright" data={footer.copyright} />
          ) : null}
          {footer.content ? <CmsRichText className="footerContent" data={footer.content} /> : null}
        </div>
        {footer.contactHeading || socialItems?.length ? (
          <div className="footerContact">
            {footer.contactHeading ? <strong>{footer.contactHeading}</strong> : null}
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
          </div>
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
