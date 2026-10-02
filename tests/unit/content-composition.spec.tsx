import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ContentLeafBlockRenderer } from '@/app/(frontend)/_components/ContentLayoutRenderer'
import { ContentSurface } from '@/app/(frontend)/_components/ContentSurface'
import { RichTextBlock } from '@/blocks/RichText'
import {
  createContentSurfaceFields,
  normalizeContentSurface,
  surfaceHorizontalPositions,
  surfaceVerticalPositions,
} from '@/modules/content/content-surface'
import { extractFirstRichTextParagraph } from '@/modules/content/listing-excerpt'
import { walkContentSurfaces } from '@/modules/content/walk-content-leaf-blocks'

describe('content composition', () => {
  it('creates one stable surface-field contract for every consumer', () => {
    const describeFields = () =>
      createContentSurfaceFields().map((field) => ({
        defaultValue: 'defaultValue' in field ? field.defaultValue : undefined,
        name: 'name' in field ? field.name : undefined,
        required: 'required' in field ? field.required : undefined,
        type: field.type,
      }))

    expect(describeFields()).toEqual(describeFields())
    expect(describeFields()).toEqual([
      { defaultValue: 'default', name: 'surface', required: true, type: 'select' },
      { defaultValue: undefined, name: 'surfaceImage', required: undefined, type: 'upload' },
      { defaultValue: undefined, name: undefined, required: undefined, type: 'row' },
      { defaultValue: undefined, name: 'surfacePreview', required: undefined, type: 'ui' },
    ])
  })

  it('normalizes every surface and all nine image positions', () => {
    for (const surface of ['default', 'subtle', 'inverse', 'image'] as const) {
      expect(normalizeContentSurface({ surface }).surface).toBe(surface)
    }

    for (const horizontalPosition of surfaceHorizontalPositions) {
      for (const verticalPosition of surfaceVerticalPositions) {
        expect(
          normalizeContentSurface({
            surface: 'image',
            surfaceHorizontalPosition: horizontalPosition,
            surfaceVerticalPosition: verticalPosition,
          }).objectPosition,
        ).toBe(
          `${horizontalPosition} ${verticalPosition === 'middle' ? 'center' : verticalPosition}`,
        )
      }
    }

    expect(
      normalizeContentSurface({
        surface: 'image',
        surfaceHorizontalPosition: 'historic-value',
        surfaceVerticalPosition: 'historic-value',
      }).objectPosition,
    ).toBe('center center')
  })

  it('renders a safe dark image surface when expanded media is unavailable', () => {
    const markup = renderToStaticMarkup(
      <ContentSurface surface={normalizeContentSurface({ surface: 'image', surfaceImage: 7 })}>
        Treść
      </ContentSurface>,
    )

    expect(markup).toContain('contentSurface--missingImage')
    expect(markup).toContain('contentSurfaceShade')
    expect(markup).not.toContain('<img')
  })

  it('walks section and column surfaces with stable paths', () => {
    const surfaces = [
      ...walkContentSurfaces([
        {
          blockType: 'sectionGroup',
          sections: [
            {
              blocks: [
                {
                  blockType: 'columnLayout',
                  columns: [{ blocks: [], surface: 'image' }],
                },
              ],
              surface: 'inverse',
            },
          ],
        },
      ]),
    ]

    expect(surfaces.map(({ path }) => path)).toEqual([
      'layout.0.sections.0',
      'layout.0.sections.0.blocks.0.columns.0',
    ])
    expect(surfaces.map(({ surface }) => surface.surface)).toEqual(['inverse', 'image'])
  })

  it('extracts a listing summary from rich text nested in a grouped column', () => {
    expect(
      extractFirstRichTextParagraph([
        {
          blockType: 'sectionGroup',
          sections: [
            {
              blocks: [
                {
                  blockType: 'columnLayout',
                  columns: [
                    {
                      blocks: [
                        {
                          blockType: 'richText',
                          content: {
                            root: {
                              children: [
                                {
                                  children: [{ text: 'Streszczenie z grupy' }],
                                  type: 'paragraph',
                                },
                              ],
                            },
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ]),
    ).toBe('Streszczenie z grupy')
  })

  it('offers only default, lead and note for rich text presentation', () => {
    const styleField = RichTextBlock.fields.find(
      (field) => 'name' in field && field.name === 'textStyle',
    )
    expect(styleField).toMatchObject({
      defaultValue: 'default',
      options: [
        { label: 'Standardowa', value: 'default' },
        { label: 'Wprowadzenie', value: 'lead' },
        { label: 'Notatka', value: 'note' },
      ],
      type: 'select',
    })
  })

  it.each([
    ['section', 'h2', 'contentHeading--section'],
    ['item', 'h3', 'contentHeading--item'],
  ] as const)(
    'maps the %s heading role to its semantic level',
    async (role, element, className) => {
      const rendered = await ContentLeafBlockRenderer({
        block: { blockType: 'heading', iconName: 'mail', role, text: 'Nagłówek' },
        document: {} as never,
        path: 'layout.0',
        pathname: '/test',
        searchParams: {},
      })
      const markup = renderToStaticMarkup(rendered)

      expect(markup).toContain(`<${element} class="contentHeading ${className}">`)
      expect(markup).toContain('data-icon-name="mail"')
    },
  )
})
