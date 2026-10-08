import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'
import type { Page, User } from '@/payload-types'

import { createIntegrationAuthor, deleteIntegrationAuthor } from '../helpers/integration-author'

const pageSlug = 'integration-tabbed-content'
const invalidPageSlug = 'integration-tabbed-content-invalid'

let payload: Payload
let author: User
let page: Page | undefined

function richTextContent(text: string) {
  return {
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
  }
}

async function cleanup(): Promise<void> {
  if (!payload) return
  await payload.delete({
    collection: 'pages',
    overrideAccess: true,
    where: { slug: { in: [pageSlug, invalidPageSlug] } },
  })
}

beforeAll(async () => {
  payload = await getPayload({ config })
  await cleanup()
  author = await createIntegrationAuthor(payload, 'tabbed-content')
})

afterAll(async () => {
  await cleanup()
  await deleteIntegrationAuthor(payload, author)
})

describe('tabbed content integration', () => {
  it('saves, publishes and versions tab contents, menus and a nested column layout', async () => {
    page = await payload.create({
      collection: 'pages',
      data: {
        _status: 'draft',
        author: author.id,
        layout: [
          {
            blockType: 'tabs',
            footerAlignment: 'end',
            footerItems: [
              {
                appearance: 'link',
                customAddress: 'wydarzenia',
                customScheme: 'path',
                label: 'Wszystkie wydarzenia',
                targetType: 'custom',
              },
            ],
            headerLeftItems: [
              {
                appearance: 'link',
                emailSubject: 'Pytanie o wydarzenia',
                label: 'Kontakt',
                targetType: 'siteContactEmail',
              },
            ],
            tabs: [
              {
                blocks: [
                  { blockType: 'richText', content: richTextContent('Najbliższe wydarzenia') },
                ],
                label: 'Najbliższe',
              },
              {
                blocks: [
                  {
                    blockType: 'columnLayout',
                    columns: [
                      {
                        blocks: [
                          { blockType: 'richText', content: richTextContent('Lewa kolumna') },
                        ],
                        width: 6,
                      },
                      {
                        blocks: [
                          { blockType: 'richText', content: richTextContent('Prawa kolumna') },
                        ],
                        width: 6,
                      },
                    ],
                  },
                ],
                label: 'Kalendarz',
              },
            ],
          },
        ] as never,
        slug: pageSlug,
        title: 'Integration tabbed content',
      },
      draft: true,
      overrideAccess: true,
    })

    const draft = await payload.findByID({
      collection: 'pages',
      draft: true,
      id: page.id,
      overrideAccess: true,
    })
    expect(draft.layout[0]).toMatchObject({
      blockType: 'tabs',
      footerAlignment: 'end',
      footerItems: [{ label: 'Wszystkie wydarzenia', targetType: 'custom' }],
      headerLeftItems: [
        {
          emailSubject: 'Pytanie o wydarzenia',
          label: 'Kontakt',
          targetType: 'siteContactEmail',
        },
      ],
      tabs: [
        { blocks: [{ blockType: 'richText' }], label: 'Najbliższe' },
        {
          blocks: [
            {
              blockType: 'columnLayout',
              columns: [{ width: 6 }, { width: 6 }],
            },
          ],
          label: 'Kalendarz',
        },
      ],
    })

    page = await payload.update({
      collection: 'pages',
      data: { _status: 'published' },
      draft: false,
      id: page.id,
      overrideAccess: true,
    })
    const published = await payload.findByID({
      collection: 'pages',
      draft: false,
      id: page.id,
      overrideAccess: true,
    })
    expect(published.layout).toEqual(page.layout)

    const versions = await payload.findVersions({
      collection: 'pages',
      depth: 0,
      limit: 10,
      overrideAccess: true,
      where: { parent: { equals: page.id } },
    })
    expect(versions.docs.some((version) => version.version.layout[0]?.blockType === 'tabs')).toBe(
      true,
    )
  })

  it('rejects a tabbed block with fewer than two tabs', async () => {
    await expect(
      payload.create({
        collection: 'pages',
        data: {
          _status: 'draft',
          author: author.id,
          layout: [
            {
              blockType: 'tabs',
              tabs: [{ blocks: [], label: 'Jedyna zakładka' }],
            },
          ] as never,
          slug: invalidPageSlug,
          title: 'Invalid tabbed content',
        },
        draft: true,
        overrideAccess: true,
      }),
    ).rejects.toMatchObject({ status: 400 })
  })
})
