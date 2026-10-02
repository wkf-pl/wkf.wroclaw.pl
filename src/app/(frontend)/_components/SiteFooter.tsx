import type { CSSProperties } from 'react'

import { CmsRichText } from '@/components/CmsRichText'
import type { Footer, Navigation, SiteSetting } from '@/payload-types'
import { getMediaURL } from '@/modules/media/media-url'
import { resolvePresentedLinks } from '@/modules/navigation/links'

import { PresentedLink } from './PresentedLink'

export function SiteFooter({
  footer,
  navigation,
  siteSettings,
}: {
  footer: Footer
  navigation: Navigation
  siteSettings: SiteSetting
}) {
  const socialItems = resolvePresentedLinks(footer.socialItems ?? [])
  const columns = footer.columns?.flatMap((column) => {
    const items = resolvePresentedLinks(column.items ?? [])

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
                {socialItems.map((item, itemIndex) => (
                  <PresentedLink
                    className="socialLink"
                    item={item}
                    key={`${item.link.href}-${itemIndex}`}
                  />
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
                {column.items.map((item, itemIndex) => (
                  <PresentedLink
                    className="footerMenuItem"
                    item={item}
                    key={`${item.link.href}-${itemIndex}`}
                  />
                ))}
              </nav>
            ))}
          </div>
        ) : null}
      </footer>
    </div>
  )
}
