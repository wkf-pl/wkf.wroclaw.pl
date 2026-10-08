import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { Field } from 'payload'

import { ContentLeafBlockRenderer } from '@/app/(frontend)/_components/ContentLayoutRenderer'
import { ContentPresentation } from '@/app/(frontend)/_components/ContentPresentation'
import { ActionLinksBlock } from '@/blocks/ActionLinks'
import { CardBlock } from '@/blocks/Card'
import { ContentCalendarBlock } from '@/blocks/ContentCalendar'
import { ColumnLayoutBlock } from '@/blocks/ColumnLayout'
import { DocumentsBlock } from '@/blocks/Documents'
import { HeadingBlock } from '@/blocks/Heading'
import { ListingBlock } from '@/blocks/Listing'
import { AttachmentsBlock, MediaGalleryBlock } from '@/blocks/MediaListing'
import { MemberProfilesBlock } from '@/blocks/MemberProfiles'
import { RichTextBlock } from '@/blocks/RichText'
import { SectionGroupBlock } from '@/blocks/SectionGroup'
import {
  createContentPresentationFields,
  normalizeContentHeading,
  normalizeContentPresentation,
  surfaceHorizontalPositions,
  surfaceVerticalPositions,
  validateContentHeading,
} from '@/modules/content/content-presentation'
import { extractFirstRichTextParagraph } from '@/modules/content/listing-excerpt'
import { walkContentPresentations } from '@/modules/content/walk-content-leaf-blocks'
import { readFrontendStyles } from '../helpers/frontend-styles'
import { createLexicalDocument } from '../helpers/lexical-document'

describe('content composition', () => {
  const presentationFieldNames = [
    'frame',
    'surface',
    'surfaceImage',
    'surfaceHorizontalPosition',
    'surfaceVerticalPosition',
    'surfacePreview',
  ]

  function getFieldNames(fields: typeof RichTextBlock.fields): string[] {
    return fields.flatMap((field) => {
      if (field.type === 'tabs') {
        return field.tabs.flatMap((tab) => getFieldNames(tab.fields))
      }
      if ('fields' in field && Array.isArray(field.fields)) {
        return getFieldNames(field.fields)
      }

      return 'name' in field ? [field.name] : []
    })
  }

  function findNamedField(fields: Field[], name: string): Field | undefined {
    for (const field of fields) {
      if ('name' in field && field.name === name) return field
      if (field.type === 'tabs') {
        for (const tab of field.tabs) {
          const nestedField = findNamedField(tab.fields, name)
          if (nestedField) return nestedField
        }
      } else if ('fields' in field && Array.isArray(field.fields)) {
        const nestedField = findNamedField(field.fields, name)
        if (nestedField) return nestedField
      }
    }
  }

  it('keeps inverse button hover states legible and gives separators breathing room', () => {
    const frontendStyles = readFrontendStyles()

    expect(frontendStyles).toContain(
      '.contentPresentation--inverse .presentedLink--primaryButton:hover',
    )
    expect(frontendStyles).toContain(
      '.contentPresentation--inverse .presentedLink--secondaryButton:hover',
    )
    expect(frontendStyles).toContain('--column-gap: clamp(1.5rem, 3.5vw, 2.5rem)')
  })

  it('removes top padding from content in subsequent transparent grouped sections', () => {
    const frontendStyles = readFrontendStyles()

    expect(frontendStyles).toMatch(
      /\.sectionGroupSections\s*>\s*\.sectionGroupSection\.contentPresentation--transparent\s*\+\s*\.sectionGroupSection\.contentPresentation--transparent\s*>\s*\.contentPresentationContent\s*{\s*padding-top: 0;\s*}/,
    )
    expect(frontendStyles).not.toContain(
      '.contentPresentationContent + .contentPresentationContent',
    )
    expect(frontendStyles).not.toContain('padding-top: 0 !important')
  })

  it('creates one stable surface-field contract for every consumer', () => {
    const describeFields = () =>
      createContentPresentationFields().map((field) => ({
        defaultValue: 'defaultValue' in field ? field.defaultValue : undefined,
        name: 'name' in field ? field.name : undefined,
        required: 'required' in field ? field.required : undefined,
        type: field.type,
      }))

    expect(describeFields()).toEqual(describeFields())
    expect(describeFields()).toEqual([
      { defaultValue: undefined, name: undefined, required: undefined, type: 'row' },
      { defaultValue: undefined, name: undefined, required: undefined, type: 'row' },
      { defaultValue: undefined, name: 'surfacePreview', required: undefined, type: 'ui' },
    ])
  })

  it('uses the same presentation contract for content blocks and layout records', () => {
    for (const block of [
      RichTextBlock,
      ContentCalendarBlock,
      ListingBlock,
      MediaGalleryBlock,
      AttachmentsBlock,
      DocumentsBlock,
      MemberProfilesBlock,
    ]) {
      expect(
        getFieldNames(block.fields).filter((name) => presentationFieldNames.includes(name)),
      ).toEqual(presentationFieldNames)
      expect(getFieldNames(block.fields)).not.toContain('heading')
      expect(getFieldNames(block.fields)).not.toContain('headingIconName')
    }

    for (const block of [ColumnLayoutBlock, SectionGroupBlock]) {
      const container = block.fields.find((field) => field.type === 'group')
      if (!container || container.type !== 'group') throw new Error('Missing layout container')
      const rootFields = container.fields.filter((field) => field.type !== 'array')
      expect(
        getFieldNames(rootFields).filter((name) => presentationFieldNames.includes(name)),
      ).toEqual(presentationFieldNames)
      expect(getFieldNames(block.fields)).not.toContain('heading')
      expect(getFieldNames(block.fields)).not.toContain('headingIconName')
    }

    const columnsField = findNamedField(ColumnLayoutBlock.fields, 'columns')
    const sectionsField = findNamedField(SectionGroupBlock.fields, 'sections')
    if (!columnsField || columnsField.type !== 'array') throw new Error('Missing columns field')
    if (!sectionsField || sectionsField.type !== 'array') throw new Error('Missing sections field')

    expect(
      getFieldNames(columnsField.fields).filter((name) => presentationFieldNames.includes(name)),
    ).toEqual(presentationFieldNames)
    expect(
      getFieldNames(sectionsField.fields).filter((name) => presentationFieldNames.includes(name)),
    ).toEqual(presentationFieldNames)
    expect(getFieldNames(ActionLinksBlock.fields)).not.toContain('surface')
    expect(getFieldNames(ActionLinksBlock.fields)).not.toContain('frame')
    expect(getFieldNames(CardBlock.fields)).not.toContain('surface')
    expect(getFieldNames(CardBlock.fields)).not.toContain('frame')
    expect(getFieldNames(HeadingBlock.fields)).toEqual(
      expect.arrayContaining(['heading', 'headingLevel', 'headingIconName', 'iconInverted']),
    )
  })

  it('uses flat custom containers for layout presentation and dynamic records', () => {
    const columnContainer = ColumnLayoutBlock.fields.find((field) => field.type === 'group')
    const sectionContainer = SectionGroupBlock.fields.find((field) => field.type === 'group')

    expect(columnContainer).toMatchObject({
      admin: {
        components: {
          Field: '/components/admin/TabbedLayoutField#ColumnLayoutTabsField',
        },
      },
      type: 'group',
    })
    expect(sectionContainer).toMatchObject({
      admin: {
        components: {
          Field: '/components/admin/TabbedLayoutField#SectionGroupTabsField',
        },
      },
      type: 'group',
    })
    expect(columnContainer && 'name' in columnContainer).toBe(false)
    expect(sectionContainer && 'name' in sectionContainer).toBe(false)
  })

  it('places block and layout controls in the requested compact rows', () => {
    const firstRowNames = (fields: Field[]): string[] => {
      const row = fields.find((field) => field.type === 'row')
      if (!row || row.type !== 'row') throw new Error('Missing first row')
      return getFieldNames([row])
    }

    expect(firstRowNames(RichTextBlock.fields)).toEqual(['textStyle', 'frame', 'surface'])
    expect(firstRowNames(MemberProfilesBlock.fields)).toEqual(['view', 'frame', 'surface'])
    expect(firstRowNames(ListingBlock.fields)).toEqual(['view', 'frame', 'surface'])
    for (const block of [
      ContentCalendarBlock,
      MediaGalleryBlock,
      AttachmentsBlock,
      DocumentsBlock,
    ]) {
      expect(firstRowNames(block.fields)).toEqual(['frame', 'surface'])
    }

    const columnContainer = ColumnLayoutBlock.fields.find((field) => field.type === 'group')
    const sectionContainer = SectionGroupBlock.fields.find((field) => field.type === 'group')
    if (!columnContainer || columnContainer.type !== 'group') {
      throw new Error('Missing column layout container')
    }
    if (!sectionContainer || sectionContainer.type !== 'group') {
      throw new Error('Missing section group container')
    }

    const columnRootRows = columnContainer.fields
      .filter((field) => field.type === 'row')
      .map((row) => getFieldNames([row]))
    expect(columnRootRows).toContainEqual(['frame', 'surface'])
    expect(columnRootRows).toContainEqual(['verticalAlignment', 'columnSeparators'])

    const columnsField = findNamedField(ColumnLayoutBlock.fields, 'columns')
    const sectionsField = findNamedField(SectionGroupBlock.fields, 'sections')
    if (!columnsField || columnsField.type !== 'array') throw new Error('Missing columns field')
    if (!sectionsField || sectionsField.type !== 'array') throw new Error('Missing sections field')
    expect(firstRowNames(columnsField.fields)).toEqual(['width', 'frame', 'surface'])
    expect(firstRowNames(sectionContainer.fields)).toEqual(['frame', 'surface'])
    expect(firstRowNames(sectionsField.fields)).toEqual(['frame', 'surface'])
  })

  it('normalizes every surface and all nine image positions', () => {
    for (const surface of ['transparent', 'default', 'subtle', 'inverse', 'image'] as const) {
      expect(normalizeContentPresentation({ surface }).surface).toBe(surface)
    }

    for (const horizontalPosition of surfaceHorizontalPositions) {
      for (const verticalPosition of surfaceVerticalPositions) {
        expect(
          normalizeContentPresentation({
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
      normalizeContentPresentation({
        surface: 'image',
        surfaceHorizontalPosition: 'historic-value',
        surfaceVerticalPosition: 'historic-value',
      }).objectPosition,
    ).toBe('center center')
    expect(normalizeContentPresentation({ frame: 'invalid', surface: 'invalid' })).toMatchObject({
      frame: 'none',
      objectPosition: 'center center',
      surface: 'transparent',
    })
  })

  it('uses a compact presentation row and an extensible frame select', () => {
    const [presentationRow] = createContentPresentationFields()
    if (presentationRow?.type !== 'row') {
      throw new Error('Missing presentation row')
    }

    const frameField = presentationRow.fields.find(
      (field) => 'name' in field && field.name === 'frame',
    )
    const surfaceField = presentationRow.fields.find(
      (field) => 'name' in field && field.name === 'surface',
    )

    expect(frameField).toMatchObject({
      admin: { isClearable: false, width: '50%' },
      defaultValue: 'none',
      options: [
        { label: 'Brak', value: 'none' },
        { label: 'Obrys', value: 'outline' },
      ],
      type: 'select',
    })
    expect(surfaceField?.admin?.width).toBe('50%')

    const richTextPresentationRow = RichTextBlock.fields[0]
    const memberProfilesPresentationRow = MemberProfilesBlock.fields[0]
    if (richTextPresentationRow?.type !== 'row' || memberProfilesPresentationRow?.type !== 'row') {
      throw new Error('Missing content presentation rows')
    }
    expect(getFieldNames([richTextPresentationRow])).toEqual(['textStyle', 'frame', 'surface'])
    expect(getFieldNames([memberProfilesPresentationRow])).toEqual(['view', 'frame', 'surface'])
    expect(richTextPresentationRow.fields.map((field) => field.admin?.width)).toEqual([
      '33.333%',
      '33.333%',
      '33.333%',
    ])

    const [standaloneHeadingRow, standaloneIconRow] = HeadingBlock.fields
    if (standaloneHeadingRow?.type !== 'row' || standaloneIconRow?.type !== 'row') {
      throw new Error('Missing standalone heading rows')
    }
    expect(standaloneHeadingRow.fields.map((field) => field.admin?.width)).toEqual(['75%', '25%'])
    expect(standaloneIconRow.fields.map((field) => field.admin?.width)).toEqual(['75%', '25%'])
  })

  it('requires text or an icon only for the standalone heading contract', () => {
    expect(validateContentHeading({ heading: '  Tytuł  ' })).toBe(true)
    expect(validateContentHeading({ headingIconName: 'mail' })).toBe(true)
    expect(validateContentHeading({ heading: 'Tytuł', headingIconName: 'mail' })).toBe(true)
    expect(validateContentHeading({ heading: '   ' })).toBe(
      'Podaj tekst albo wybierz ikonę nagłówka.',
    )
  })

  it('normalizes the standalone heading level and icon inversion', () => {
    expect(normalizeContentHeading({ heading: 'Tytuł' })).toMatchObject({
      inverted: false,
      level: 2,
      text: 'Tytuł',
    })
    expect(
      normalizeContentHeading({
        headingIconName: 'mail',
        headingLevel: 'h4',
        iconInverted: true,
      }),
    ).toMatchObject({
      accessibleName: 'E-mail',
      iconName: 'mail',
      inverted: true,
      level: 4,
    })
  })

  it('renders a safe dark image surface when expanded media is unavailable', () => {
    const markup = renderToStaticMarkup(
      <ContentPresentation
        placement="block"
        presentation={normalizeContentPresentation({ surface: 'image', surfaceImage: 7 })}
      >
        Treść
      </ContentPresentation>,
    )

    expect(markup).toContain('contentPresentation--missingImage')
    expect(markup).toContain('contentPresentationShade')
    expect(markup).not.toContain('<img')
  })

  it('walks section and column surfaces with stable paths', () => {
    const surfaces = [
      ...walkContentPresentations([
        {
          blockType: 'sectionGroup',
          surface: 'image',
          sections: [
            {
              blocks: [
                {
                  blockType: 'columnLayout',
                  columns: [
                    {
                      blocks: [{ blockType: 'richText', surface: 'default' }],
                      surface: 'image',
                    },
                  ],
                  surface: 'subtle',
                },
              ],
              surface: 'inverse',
            },
          ],
        },
      ]),
    ]

    expect(surfaces.map(({ path }) => path)).toEqual([
      'layout.0',
      'layout.0.sections.0',
      'layout.0.sections.0.blocks.0',
      'layout.0.sections.0.blocks.0.columns.0',
      'layout.0.sections.0.blocks.0.columns.0.blocks.0',
    ])
    expect(surfaces.map(({ presentation }) => presentation.surface)).toEqual([
      'image',
      'inverse',
      'subtle',
      'image',
      'default',
    ])
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
    const styleField = findNamedField(RichTextBlock.fields, 'textStyle')
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
    ['h2', 'h2', 'contentHeading--major'],
    ['h4', 'h4', 'contentHeading--minor'],
  ] as const)(
    'maps heading level %s to its semantic element',
    async (headingLevel, element, className) => {
      const rendered = await ContentLeafBlockRenderer({
        block: {
          blockType: 'heading',
          heading: 'Nagłówek',
          headingIconName: 'mail',
          headingLevel,
          iconInverted: true,
        },
        document: {} as never,
        path: 'layout.0',
        pathname: '/test',
        searchParams: {},
      })
      const markup = renderToStaticMarkup(rendered)

      expect(markup).toContain(`<${element} class="contentHeading ${className}">`)
      expect(markup).toContain('data-icon-name="mail"')
      expect(markup).toContain('contentHeadingIcon--inverted')
    },
  )

  it('gives an icon-only heading an accessible registry label', async () => {
    const rendered = await ContentLeafBlockRenderer({
      block: { blockType: 'heading', headingIconName: 'mail', headingLevel: 'h3' },
      document: {} as never,
      path: 'layout.0',
      pathname: '/test',
      searchParams: {},
    })

    const markup = renderToStaticMarkup(rendered)
    expect(markup).toContain('<span class="srOnly">E-mail</span>')
    expect(markup).toContain('class="contentHeadingIcon"')
    expect(markup).not.toContain('contentHeadingIcon--inverted')
  })

  it('renders homepage headings as section separators with two dice icons', async () => {
    const rendered = await ContentLeafBlockRenderer({
      block: {
        blockType: 'heading',
        heading: 'Wydarzenia',
        headingIconName: 'mail',
        headingLevel: 'h2',
      },
      document: {} as never,
      path: 'layout.0',
      pathname: '/',
      searchParams: {},
    })

    const markup = renderToStaticMarkup(rendered)
    expect(markup).toContain('contentHeading--homeSection')
    expect(markup.match(/contentHeadingSectionLine/g)).toHaveLength(2)
    expect(markup.match(/data-icon-name="dice"/g)).toHaveLength(2)
    expect(markup).not.toContain('data-icon-name="mail"')
  })

  it('does not constrain a content block rendered directly inside a tab', async () => {
    const rendered = await ContentLeafBlockRenderer({
      block: {
        blockType: 'richText',
        content: createLexicalDocument('Treść zakładki'),
      },
      document: {} as never,
      path: 'layout.0.tabs.0.blocks.0',
      pathname: '/test',
      presentationPlacement: 'tab',
      searchParams: {},
    })

    const markup = renderToStaticMarkup(rendered)
    expect(markup).toContain('contentPresentation--tab')
    expect(markup).not.toContain('contentPresentation--block')
  })
})
