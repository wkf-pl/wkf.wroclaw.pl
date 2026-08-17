import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { SiteFooter } from '@/app/(frontend)/_components/SiteFooter'
import type { Navigation, SiteSetting } from '@/payload-types'

describe('SiteFooter', () => {
  it('renders formatted copyright text in multiple paragraphs', () => {
    const siteSettings = {
      id: 1,
      siteName: 'Wrocławski Klub Fantastyki',
      copyrightText: {
        root: {
          children: [createParagraph('Pierwsza linia'), createParagraph('Druga linia', 1)],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        },
      },
    } satisfies SiteSetting
    const navigation = { id: 1 } as Navigation

    const markup = renderToStaticMarkup(
      <SiteFooter navigation={navigation} siteSettings={siteSettings} />,
    )

    expect(markup).toContain('class="footerCopyright"')
    expect(markup).toContain('<p>Pierwsza linia</p>')
    expect(markup).toContain('<strong>Druga linia</strong>')
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
