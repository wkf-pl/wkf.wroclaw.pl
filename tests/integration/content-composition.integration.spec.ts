import sharp from 'sharp'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'
import type { Media, Page, User } from '@/payload-types'

import { createIntegrationAuthor, deleteIntegrationAuthor } from '../helpers/integration-author'

const pageSlug = 'integration-content-composition'
const invalidPageSlug = 'integration-content-composition-pdf'
const imageFilename = 'integration-content-surface.png'
const pdfFilename = 'integration-content-surface.pdf'
const testPDF = Buffer.from(
  '%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\nxref\n0 1\n0000000000 65535 f\n%%EOF\n',
)

let payload: Payload
let author: User
let image: Media
let pdf: Media
let page: Page | undefined

function richText(text: string) {
  return {
    blockType: 'richText' as const,
    content: {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text,
                type: 'text',
                version: 1,
              },
            ],
            direction: null,
            format: '' as const,
            indent: 0,
            textFormat: 0,
            textStyle: '',
            type: 'paragraph' as const,
            version: 1,
          },
        ],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        type: 'root' as const,
        version: 1,
      },
    },
    textStyle: 'lead' as const,
  }
}

async function cleanup(): Promise<void> {
  if (!payload) return
  await payload.delete({
    collection: 'pages',
    overrideAccess: true,
    where: { slug: { in: [pageSlug, invalidPageSlug] } },
  })
  await payload.delete({
    collection: 'media',
    overrideAccess: true,
    where: { filename: { in: [imageFilename, pdfFilename] } },
  })
}

beforeAll(async () => {
  payload = await getPayload({ config })
  await cleanup()
  author = await createIntegrationAuthor(payload, 'content-composition')

  const imageData = await sharp({
    create: { background: '#f7f5ef', channels: 4, height: 32, width: 64 },
  })
    .png()
    .toBuffer()

  image = await payload.create({
    collection: 'media',
    data: { alt: 'Decorative integration surface' },
    file: {
      data: imageData,
      mimetype: 'image/png',
      name: imageFilename,
      size: imageData.length,
    },
    overrideAccess: true,
  })
  pdf = await payload.create({
    collection: 'media',
    data: { alt: 'Integration PDF' },
    file: {
      data: testPDF,
      mimetype: 'application/pdf',
      name: pdfFilename,
      size: testPDF.length,
    },
    overrideAccess: true,
  })
})

afterAll(async () => {
  await cleanup()
  await deleteIntegrationAuthor(payload, author)
})

describe('content composition integration', () => {
  it('saves, expands and versions section surfaces and nested general blocks', async () => {
    page = await payload.create({
      collection: 'pages',
      data: {
        _status: 'published',
        author: author.id,
        layout: [
          {
            blockType: 'sectionGroup',
            frame: 'outline',
            sections: [
              {
                blocks: [
                  {
                    blockType: 'heading',
                    heading: 'Obrazowa sekcja',
                    headingIconName: 'image',
                    headingLevel: 'h2',
                    iconInverted: true,
                  },
                  {
                    blockType: 'columnLayout',
                    columnSeparators: 'between',
                    columns: [
                      {
                        blocks: [
                          {
                            blockType: 'heading',
                            heading: 'Lewa kolumna',
                            headingLevel: 'h3',
                          },
                          {
                            ...richText('Lewa kolumna'),
                            frame: 'outline',
                            surface: 'inverse' as const,
                          },
                        ],
                        frame: 'outline',
                        surface: 'default',
                        width: 7,
                      },
                      { blocks: [richText('Prawa kolumna')], surface: 'subtle', width: 5 },
                    ],
                    surface: 'transparent',
                    verticalAlignment: 'center',
                  },
                ],
                surface: 'image',
                surfaceHorizontalPosition: 'right',
                surfaceImage: image.id,
                surfaceVerticalPosition: 'bottom',
              },
            ],
            surface: 'default',
          },
        ],
        slug: pageSlug,
        title: 'Integration content composition',
      },
      depth: 2,
      overrideAccess: true,
    })

    const restored = await payload.findByID({
      collection: 'pages',
      depth: 2,
      id: page.id,
      overrideAccess: true,
    })
    const sectionGroup = restored.layout[0]
    expect(sectionGroup?.blockType).toBe('sectionGroup')
    if (sectionGroup?.blockType !== 'sectionGroup') throw new Error('Missing section group')

    expect(sectionGroup).toMatchObject({
      frame: 'outline',
      surface: 'default',
    })

    expect(sectionGroup.sections[0]).toMatchObject({
      surface: 'image',
      surfaceHorizontalPosition: 'right',
      surfaceVerticalPosition: 'bottom',
      surfaceImage: { id: image.id, mimeType: 'image/png' },
    })
    expect(sectionGroup.sections[0]?.blocks[0]).toMatchObject({
      blockType: 'heading',
      heading: 'Obrazowa sekcja',
      headingIconName: 'image',
      headingLevel: 'h2',
      iconInverted: true,
    })
    const columnLayout = sectionGroup.sections[0]?.blocks[1]
    expect(columnLayout).toMatchObject({
      blockType: 'columnLayout',
      columnSeparators: 'between',
      surface: 'transparent',
      verticalAlignment: 'center',
    })
    if (columnLayout?.blockType !== 'columnLayout') throw new Error('Missing column layout')
    expect(columnLayout.columns[0]).toMatchObject({
      frame: 'outline',
      surface: 'default',
    })
    const firstColumn = columnLayout.columns[0]
    if (!firstColumn) throw new Error('Missing first column')
    expect(firstColumn.blocks?.[0]).toMatchObject({
      blockType: 'heading',
      heading: 'Lewa kolumna',
      headingLevel: 'h3',
    })
    expect(firstColumn.blocks?.[1]).toMatchObject({
      blockType: 'richText',
      frame: 'outline',
      surface: 'inverse',
    })

    const versions = await payload.findVersions({
      collection: 'pages',
      depth: 2,
      limit: 10,
      overrideAccess: true,
      where: { parent: { equals: page.id } },
    })
    expect(versions.docs[0]?.version.layout[0]).toMatchObject({ blockType: 'sectionGroup' })
  })

  it('rejects a document used as a surface image through Local API', async () => {
    await expect(
      payload.create({
        collection: 'pages',
        data: {
          _status: 'draft',
          author: author.id,
          layout: [
            {
              blockType: 'sectionGroup',
              frame: 'outline',
              sections: [
                {
                  blocks: [richText('Nieprawidłowe tło')],
                  surface: 'image',
                  surfaceHorizontalPosition: 'center',
                  surfaceImage: pdf.id,
                  surfaceVerticalPosition: 'middle',
                },
              ],
              surface: 'default',
            },
          ],
          slug: invalidPageSlug,
          title: 'Invalid content surface',
        },
        draft: true,
        overrideAccess: true,
      }),
    ).rejects.toMatchObject({ status: 400 })
  })
})
