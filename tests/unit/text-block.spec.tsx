import { renderToStaticMarkup } from 'react-dom/server'
import type { Block, Field } from 'payload'
import { describe, expect, it } from 'vitest'

import { ContentLeafBlockRenderer } from '@/app/(frontend)/_components/ContentLayoutRenderer'
import { FieldRowTextBlock } from '@/blocks/Text'
import { createContentLayoutField } from '@/modules/content/layout-field'
import { createPageTemplateRegionField } from '@/modules/page-templates/page-template-blocks'
import { pageTemplateRegistry } from '@/modules/page-templates/page-template-registry'
import { createLexicalDocument } from '../helpers/lexical-document'

function verifyTextAvailability(fields: Field[], templateKey?: string): void {
  for (const field of fields) {
    if (field.type === 'blocks') {
      expect(field.blocks.map(({ slug }) => slug)).toContain('fieldRowText')
      if (typeof field.filterOptions === 'function') {
        const allowed = field.filterOptions({ data: { templateKey } } as never)
        expect(allowed).toContain('fieldRowText')
      }
      for (const block of field.blocks as Block[]) verifyTextAvailability(block.fields, templateKey)
    } else if ('fields' in field) {
      verifyTextAvailability(field.fields, templateKey)
    }
  }
}

describe('text block', () => {
  it('offers the five supported styles', () => {
    expect(FieldRowTextBlock.fields[0]).toMatchObject({
      label: 'Styl',
      defaultValue: 'plain',
      options: [
        { label: 'Tekst wprowadzający', value: 'lead' },
        { label: 'Tekst podstawowy', value: 'plain' },
        { label: 'Tekst kompaktowy', value: 'compact' },
        { label: 'Etykieta', value: 'badge' },
        { label: 'Etykieta wyróżniona', value: 'emphasizedBadge' },
      ],
    })
  })

  it('is available in every content and template block insertion context', () => {
    verifyTextAvailability([createContentLayoutField('Treść')])
    for (const template of pageTemplateRegistry) {
      for (const region of template.regions) {
        verifyTextAvailability([createPageTemplateRegionField(region, region)], template.id)
      }
    }
  })

  it.each([
    ['plain', 'pageTemplateFieldRowText'],
    ['lead', 'richText--lead'],
    ['compact', 'richText--note'],
    ['badge', 'pageTemplateBadge'],
    ['emphasizedBadge', 'pageTemplateBadge--emphasizedBadge'],
  ] as const)('renders %s outside a page template', async (style, className) => {
    const rendered = await ContentLeafBlockRenderer({
      block: { blockType: 'fieldRowText', style, text: createLexicalDocument('Test text') },
      document: {} as never,
      path: 'layout.0',
      pathname: '/test',
      searchParams: {},
    })
    const markup = renderToStaticMarkup(rendered)
    expect(markup).toContain(className)
    expect(markup).toContain('Test text')
    expect(markup).not.toContain('<p')
  })

  it.each(['badge', 'emphasizedBadge'] as const)(
    'renders rich content with the %s style',
    async (textStyle) => {
      const rendered = await ContentLeafBlockRenderer({
        block: { blockType: 'richText', textStyle, content: createLexicalDocument('Label') },
        document: {} as never,
        path: 'layout.0',
        pathname: '/test',
        searchParams: {},
      })
      const markup = renderToStaticMarkup(rendered)
      expect(markup).toContain('pageTemplateBadge')
      expect(markup).toContain('Label')
      expect(markup.includes('pageTemplateBadge--emphasizedBadge')).toBe(
        textStyle === 'emphasizedBadge',
      )
    },
  )
})
