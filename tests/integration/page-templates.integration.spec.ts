import { sql } from '@payloadcms/db-postgres'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { getPayload, type Payload } from 'payload'

import config from '@/payload.config'
import type { Role, User } from '@/payload-types'
import { pageTemplateIDs } from '@/modules/page-templates/page-template-registry'
import { createLexicalDocument } from '../helpers/lexical-document'

let payload: Payload
let administratorRole: Role
let editorRole: Role

function createAuthenticatedUser(id: number, role: Role): User {
  return {
    collection: 'users',
    createdAt: new Date(0).toISOString(),
    displayName: `Page template test ${id}`,
    email: `page-template-test-${id}@example.invalid`,
    id,
    roles: [role.id],
    updatedAt: new Date(0).toISOString(),
  }
}

async function findRole(key: string): Promise<Role> {
  const result = await payload.find({
    collection: 'roles',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { key: { equals: key } },
  })
  const role = result.docs[0]
  if (!role) throw new Error(`Missing migrated role: ${key}`)
  return role
}

beforeAll(async () => {
  payload = await getPayload({ config })
  ;[administratorRole, editorRole] = await Promise.all([
    findRole('administrator'),
    findRole('editor'),
  ])
})

afterAll(async () => {
  if (!payload || !administratorRole) return

  const result = await payload.find({
    collection: 'page-templates',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { templateKey: { equals: 'event-detail' } },
  })
  const template = result.docs[0]
  if (!template) return

  await payload.update({
    collection: 'page-templates',
    data: {
      _status: 'published',
      content: [],
      hero: [],
      informationPanel: [],
      renderingMode: 'legacy',
    },
    draft: false,
    id: template.id,
    overrideAccess: true,
  })

  await payload.db.drizzle.execute(sql`
    DELETE FROM "_page_templates_v"
    WHERE "parent_id" = ${template.id}
      AND "id" <> (
        SELECT min("id") FROM "_page_templates_v"
        WHERE "parent_id" = ${template.id}
      )
  `)
  await payload.db.drizzle.execute(sql`
    UPDATE "_page_templates_v"
    SET "latest" = true
    WHERE "parent_id" = ${template.id}
  `)
})

describe('page templates integration', () => {
  it('initializes the closed set as published legacy templates with version history', async () => {
    const result = await payload.find({
      collection: 'page-templates',
      depth: 0,
      limit: 20,
      overrideAccess: false,
      pagination: false,
      user: createAuthenticatedUser(-100, administratorRole),
    })

    expect(result.docs).toHaveLength(9)
    expect(result.docs.map(({ templateKey }) => templateKey).sort()).toEqual(
      [...pageTemplateIDs].sort(),
    )
    expect(result.docs.every(({ _status }) => _status === 'published')).toBe(true)
    expect(result.docs.every(({ renderingMode }) => renderingMode === 'legacy')).toBe(true)

    const versions = await payload.findVersions({
      collection: 'page-templates',
      depth: 0,
      limit: 20,
      overrideAccess: false,
      pagination: false,
      user: createAuthenticatedUser(-101, administratorRole),
    })
    expect(versions.docs).toHaveLength(9)
  })

  it('denies page template access to roles without explicit permissions', async () => {
    await expect(
      payload.find({
        collection: 'page-templates',
        overrideAccess: false,
        user: createAuthenticatedUser(-102, editorRole),
      }),
    ).rejects.toMatchObject({ status: 403 })

    await expect(
      payload.find({
        collection: 'page-templates',
        overrideAccess: false,
      }),
    ).rejects.toMatchObject({ status: 403 })
  })

  it('does not allow administrators to create or delete fixed templates', async () => {
    const administrator = createAuthenticatedUser(-103, administratorRole)
    const existing = await payload.find({
      collection: 'page-templates',
      depth: 0,
      limit: 1,
      overrideAccess: false,
      pagination: false,
      user: administrator,
    })
    const template = existing.docs[0]
    if (!template) throw new Error('Missing migrated page template.')

    await expect(
      payload.create({
        collection: 'page-templates',
        data: { renderingMode: 'legacy', templateKey: 'blog-index' },
        overrideAccess: false,
        user: administrator,
      }),
    ).rejects.toMatchObject({ status: 403 })

    await expect(
      payload.delete({
        collection: 'page-templates',
        id: template.id,
        overrideAccess: false,
        user: administrator,
      }),
    ).rejects.toMatchObject({ status: 403 })
  })

  it('lets an administrator publish the implemented event template without changing its identity', async () => {
    const administrator = createAuthenticatedUser(-104, administratorRole)
    const result = await payload.find({
      collection: 'page-templates',
      depth: 0,
      limit: 1,
      overrideAccess: false,
      pagination: false,
      user: administrator,
      where: { templateKey: { equals: 'event-detail' } },
    })
    const template = result.docs[0]
    if (!template) throw new Error('Missing migrated event page template.')

    const updatedTemplate = await payload.update({
      collection: 'page-templates',
      data: {
        _status: 'published',
        content: [{ blockType: 'currentItemContent' }],
        hero: [
          {
            blockType: 'currentItemField',
            field: 'title',
            variant: 'primaryHeading',
          },
        ],
        renderingMode: 'template',
        templateKey: 'blog-index',
      },
      id: template.id,
      overrideAccess: false,
      user: administrator,
    })

    expect(updatedTemplate).toMatchObject({
      _status: 'published',
      renderingMode: 'template',
      templateKey: 'event-detail',
    })
  })

  it('stores the complete event template composition while legacy rendering remains active', async () => {
    const administrator = createAuthenticatedUser(-106, administratorRole)
    const result = await payload.find({
      collection: 'page-templates',
      depth: 0,
      limit: 1,
      overrideAccess: false,
      pagination: false,
      user: administrator,
      where: { templateKey: { equals: 'event-detail' } },
    })
    const template = result.docs[0]
    if (!template) throw new Error('Missing migrated event page template.')

    const updatedTemplate = await payload.update({
      collection: 'page-templates',
      data: {
        _status: 'draft',
        content: [
          { blockType: 'currentItemContent' },
          {
            blockType: 'listing',
            contextRelation: 'eventPartners',
            hideWhenEmpty: true,
            pageSize: 12,
            pagination: false,
            selectionMode: 'contextRelation',
            sort: 'titleAscending',
            sources: ['partners'],
            view: 'cards',
          },
        ],
        hero: [
          {
            blockType: 'currentItemFieldRow',
            items: [
              { blockType: 'currentItemField', field: 'eventCycle', variant: 'inline' },
              { blockType: 'fieldRowText', style: 'badge', text: createLexicalDocument('—') },
              {
                blockType: 'pageTemplateIcon',
                iconName: 'calendar',
                hanging: true,
                iconInverted: true,
              },
              {
                alignment: 'start',
                blockType: 'actionLinks',
                items: [
                  {
                    actionSource: 'contextAction',
                    appearance: 'link',
                    contextAction: 'eventCycleCalendar',
                    iconName: 'calendar',
                    openInNewTab: false,
                  },
                ],
                layout: 'inline',
              },
            ],
          },
        ],
        informationPanel: [
          {
            alignment: 'start',
            blockType: 'actionLinks',
            items: [
              {
                actionSource: 'contextAction',
                appearance: 'link',
                contextAction: 'eventCalendar',
                label: 'Dodaj do kalendarza',
                openInNewTab: false,
              },
            ],
            layout: 'inline',
          },
          {
            alignment: 'start',
            blockType: 'actionLinks',
            items: [
              {
                actionSource: 'contextAction',
                appearance: 'link',
                contextAction: 'eventMap',
                label: 'Otwórz w Mapach',
                openInNewTab: true,
              },
            ],
            layout: 'inline',
          },
        ],
        renderingMode: 'legacy',
      },
      draft: true,
      id: template.id,
      overrideAccess: false,
      user: administrator,
    })

    expect(updatedTemplate).toMatchObject({
      _status: 'draft',
      content: [
        { blockType: 'currentItemContent' },
        {
          blockType: 'listing',
          contextRelation: 'eventPartners',
          selectionMode: 'contextRelation',
        },
      ],
      hero: [
        {
          blockType: 'currentItemFieldRow',
          items: [
            { blockType: 'currentItemField', field: 'eventCycle' },
            { blockType: 'fieldRowText', style: 'badge', text: createLexicalDocument('—') },
            {
              blockType: 'pageTemplateIcon',
              iconName: 'calendar',
              hanging: true,
              iconInverted: true,
            },
            {
              blockType: 'actionLinks',
              items: [
                {
                  actionSource: 'contextAction',
                  contextAction: 'eventCycleCalendar',
                },
              ],
            },
          ],
        },
      ],
      informationPanel: [
        { blockType: 'actionLinks', items: [{ contextAction: 'eventCalendar' }] },
        { blockType: 'actionLinks', items: [{ contextAction: 'eventMap' }] },
      ],
      renderingMode: 'legacy',
    })
  })

  it('does not allow editors to update a page template', async () => {
    const template = await payload.find({
      collection: 'page-templates',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      where: { templateKey: { equals: 'event-detail' } },
    })
    const eventTemplate = template.docs[0]
    if (!eventTemplate) throw new Error('Missing migrated event page template.')

    await expect(
      payload.update({
        collection: 'page-templates',
        data: { renderingMode: 'legacy' },
        id: eventTemplate.id,
        overrideAccess: false,
        user: createAuthenticatedUser(-105, editorRole),
      }),
    ).rejects.toMatchObject({ status: 403 })
  })
})
