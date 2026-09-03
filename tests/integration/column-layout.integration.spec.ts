import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { getPayload, type Payload } from 'payload'

import config from '@/payload.config'
import type { EventCycle, Page, User } from '@/payload-types'

import { createIntegrationAuthor, deleteIntegrationAuthor } from '../helpers/integration-author'

const pageSlug = 'integration-column-layout-page'
const defaultPageSlug = 'integration-column-layout-default-page'
const cycleSlug = 'integration-column-layout-cycle'

let payload: Payload
let author: User
let page: Page | undefined
let eventCycle: EventCycle | undefined

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

function columnLayout(leftText: string, rightText: string) {
  return [
    {
      blockType: 'columnLayout' as const,
      columns: [
        {
          blocks: [
            { blockType: 'richText' as const, content: richTextContent(leftText) },
            { blockType: 'richText' as const, content: richTextContent(`${leftText} second`) },
          ],
          width: 8,
        },
        {
          blocks: [{ blockType: 'richText' as const, content: richTextContent(rightText) }],
          width: 4,
        },
      ],
    },
  ]
}

async function cleanup(): Promise<void> {
  if (!payload) return
  await payload.delete({
    collection: 'pages',
    overrideAccess: true,
    where: {
      slug: {
        in: [
          pageSlug,
          defaultPageSlug,
          `${pageSlug}-invalid-2-5`,
          `${pageSlug}-invalid-2-6`,
        ],
      },
    },
  })
  await payload.delete({
    collection: 'event-cycles',
    overrideAccess: true,
    where: { slug: { equals: cycleSlug } },
  })
}

beforeAll(async () => {
  payload = await getPayload({ config })
  await cleanup()
  author = await createIntegrationAuthor(payload, 'column-layout')
})

afterAll(async () => {
  await cleanup()
  await deleteIntegrationAuthor(payload, author)
})

describe('column layout integration', () => {
  it('applies the default 6+6 configuration to a new column layout', async () => {
    const defaultPage = await payload.create({
      collection: 'pages',
      data: {
        _status: 'draft',
        author: author.id,
        layout: [{ blockType: 'columnLayout' }] as never,
        slug: defaultPageSlug,
        title: 'Default integration column layout',
      },
      draft: true,
      overrideAccess: true,
    })

    expect(defaultPage.layout[0]).toMatchObject({
      blockType: 'columnLayout',
      columns: [{ width: 6 }, { width: 6 }],
    })
  })

  it.each([
    {
      layout: [
        {
          blockType: 'columnLayout',
          columns: [
            { blocks: [], width: 5 },
            { blocks: [], width: 5 },
          ],
        },
      ],
      name: 'an invalid width sum',
    },
    {
      layout: [
        {
          blockType: 'columnLayout',
          columns: [
            {
              blocks: [{ blockType: 'columnLayout', columns: [] }],
              width: 6,
            },
            { blocks: [], width: 6 },
          ],
        },
      ],
      name: 'a nested column layout',
    },
  ])('rejects $name submitted outside the admin panel', async ({ layout }) => {
    await expect(
      payload.create({
        collection: 'pages',
        data: {
          _status: 'draft',
          author: author.id,
          layout: layout as never,
          slug: `${pageSlug}-invalid-${layout[0]!.columns.length}-${layout[0]!.columns[0]!.width}`,
          title: 'Invalid integration column layout',
        },
        draft: true,
        overrideAccess: true,
      }),
    ).rejects.toThrow()
  })

  it('saves, reads, publishes and versions a Page column layout', async () => {
    page = await payload.create({
      collection: 'pages',
      data: {
        _status: 'draft',
        author: author.id,
        layout: columnLayout('Left draft', 'Right draft'),
        slug: pageSlug,
        title: 'Integration column layout page',
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
      blockType: 'columnLayout',
      columns: [
        { blocks: [{ blockType: 'richText' }, { blockType: 'richText' }], width: 8 },
        { blocks: [{ blockType: 'richText' }], width: 4 },
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
    expect(
      versions.docs.some((version) => version.version.layout[0]?.blockType === 'columnLayout'),
    ).toBe(true)
  })

  it('persists column layouts in Event Cycle default content', async () => {
    eventCycle = await payload.create({
      collection: 'event-cycles',
      data: {
        _status: 'draft',
        author: author.id,
        eventDefaults: {
          capacityMode: 'unlimited',
          excerpt: 'Default Event excerpt',
          layout: columnLayout('Default left', 'Default right'),
          location: { country: 'Polska' },
          participation: 'public',
        },
        excerpt: 'Integration Cycle excerpt',
        layout: columnLayout('Cycle left', 'Cycle right'),
        slug: cycleSlug,
        title: 'Integration column layout Cycle',
      },
      draft: true,
      overrideAccess: true,
    })

    const restored = await payload.findByID({
      collection: 'event-cycles',
      draft: true,
      id: eventCycle.id,
      overrideAccess: true,
    })
    expect(restored.eventDefaults.layout[0]).toMatchObject({
      blockType: 'columnLayout',
      columns: [{ width: 8 }, { width: 4 }],
    })

    const versions = await payload.findVersions({
      collection: 'event-cycles',
      depth: 0,
      limit: 10,
      overrideAccess: true,
      where: { parent: { equals: eventCycle.id } },
    })
    expect(
      versions.docs.some(
        (version) => version.version.eventDefaults.layout[0]?.blockType === 'columnLayout',
      ),
    ).toBe(true)
  })
})
