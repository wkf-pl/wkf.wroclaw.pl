import { readFileSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { DocumentPdfPreview } from '@/app/(frontend)/_components/DocumentPdfPreview'
import { getDocumentDisplayLabel } from '@/modules/documents/document-types'

describe('document detail', () => {
  it('formats the document type with an optional number', () => {
    expect(getDocumentDisplayLabel('resolution', '1/2026')).toBe('UCHWAŁA nr 1/2026')
    expect(getDocumentDisplayLabel('statute', null)).toBe('STATUT')
    expect(getDocumentDisplayLabel('report', '   ')).toBe('SPRAWOZDANIE')
  })

  it('renders open and download actions using the protected document file route', () => {
    const href = '/dokumenty/uchwala-testowa/plik/17'
    const markup = renderToStaticMarkup(
      createElement(DocumentPdfPreview, {
        documentTitle: 'Uchwała testowa',
        href,
      }),
    )

    expect(markup).toContain('class="documentPdfPreview"')
    expect(markup).toContain(`src="${href}#page=1&amp;view=FitH&amp;toolbar=0&amp;navpanes=0"`)
    expect(markup).toContain(`href="${href}"`)
    expect(markup).toContain('aria-label="Otwórz główny plik PDF dokumentu: Uchwała testowa"')
    expect(markup).toContain('target="_blank"')
    expect(markup).toContain('data-icon-name="zoom-in"')
    expect(markup).toContain(`href="${href}?download=1"`)
    expect(markup).toContain('aria-label="Pobierz główny plik PDF dokumentu: Uchwała testowa"')
    expect(markup).toContain('data-icon-name="download"')
    expect(markup).not.toContain('tabindex="-1"')
  })

  it('keeps the embedded PDF interactive instead of covering it with the file link', () => {
    const styles = readFileSync('src/app/(frontend)/styles.css', 'utf8')

    expect(styles).toMatch(/\.documentPdfPreview \{[^}]*overflow: hidden;/)
    expect(styles).not.toMatch(/\.documentPdfPreviewFrame \{[^}]*pointer-events: none;/)
    expect(styles).toMatch(
      /\.documentPdfPreviewFrame \{[^}]*width: calc\(100% \+ 1rem\);[^}]*height: 100%;/,
    )
    expect(styles).not.toMatch(/\.documentPdfPreviewAction \{[^}]*inset: 0;/)
    expect(styles).toMatch(
      /\.documentPdfPreviewAction \{[^}]*width: 2\.75rem;[^}]*height: 2\.75rem;/,
    )
  })

  it('overlays the PDF across the hero boundary while reserving the body text column', () => {
    const styles = readFileSync('src/app/(frontend)/styles.css', 'utf8')

    expect(styles).toMatch(
      /\.documentDetail \.contentHeroMedia \{[\s\S]*?position: absolute;[\s\S]*?top: 12\.95rem;/,
    )
    expect(styles).toMatch(
      /\.documentBody \{[\s\S]*?grid-template-columns: minmax\(0, 1fr\) minmax\(20rem, 24rem\);[\s\S]*?min-height: 32rem;/,
    )
    expect(styles).toMatch(
      /@media \(width <= 62rem\)[\s\S]*?\.documentBody \{[\s\S]*?min-height: 22rem;/,
    )
    expect(styles).toMatch(
      /@media \(width <= 48rem\)[\s\S]*?\.documentDetail \.contentHeroInner \{[\s\S]*?grid-template-columns: minmax\(0, 1fr\);[\s\S]*?\.documentBody \{[\s\S]*?min-height: 0;/,
    )
  })
})
