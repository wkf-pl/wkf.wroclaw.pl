import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { SiteFooter } from '@/app/(frontend)/_components/SiteFooter'
import type { Footer, Navigation, SiteSetting } from '@/payload-types'

describe('SiteFooter', () => {
  it('renders the editable logo, footer text and contact heading', () => {
    const siteSettings = {
      id: 1,
      siteName: 'Nazwa z panelu',
    } satisfies SiteSetting
    const navigation = {
      id: 1,
      logo: {
        alt: 'Logo z panelu',
        createdAt: new Date(0).toISOString(),
        filename: 'logo-z-panelu.webp',
        filesize: 1,
        height: 90,
        id: 2,
        mimeType: 'image/webp',
        updatedAt: new Date(0).toISOString(),
        url: '/media/logo-z-panelu.webp',
        width: 90,
      },
    } satisfies Navigation
    const footer = {
      id: 1,
      contactHeading: 'Znajdź nas',
      copyright: {
        root: {
          children: [createParagraph('© 2026 Nazwa z panelu')],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        },
      },
      content: {
        root: {
          children: [createParagraph('KRS i adres')],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        },
      },
    } satisfies Footer

    const markup = renderToStaticMarkup(
      <SiteFooter footer={footer} navigation={navigation} siteSettings={siteSettings} />,
    )

    expect(markup).toContain('src="/media/logo-z-panelu.webp"')
    expect(markup).toContain('alt="Logo z panelu"')
    expect(markup).toContain('Nazwa z panelu')
    expect(markup).toContain('class="footerCopyright"')
    expect(markup).toContain('<p>© 2026 Nazwa z panelu</p>')
    expect(markup).toContain('class="footerContent"')
    expect(markup).toContain('<p>KRS i adres</p>')
    expect(markup).toContain('Znajdź nas')
  })
})

function createParagraph(text: string, format = 0) {
  return {
    children: [
      {
        detail: 0,
        format,
        mode: 'normal',
        style: '',
        text,
        type: 'text',
        version: 1,
      },
    ],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    textFormat: 0,
    textStyle: '',
    type: 'paragraph',
    version: 1,
  }
}
