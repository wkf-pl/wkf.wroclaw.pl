import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createLocalReq, getPayload, type Payload, type PayloadRequest } from 'payload'

import config from '@/payload.config'
import {
  down as downPageTemplateComposition,
  up as upPageTemplateComposition,
} from '../../migrations/20261107_002214_page_template_composition'
import { pageTemplateCompositionSchemaExists } from '../helpers/page-template-composition-migration'

const liveBlockID = 'page-template-event-actions-migration'
const versionBlockUUID = 'page-template-event-actions-migration-version'
const versionIconUUID = 'page-template-icon-migration-version'

let payload: Payload
let migrationRequest: PayloadRequest

function migrationArguments(): MigrateDownArgs & MigrateUpArgs {
  return {
    db: payload.db.drizzle,
    payload,
    req: migrationRequest,
  } as MigrateDownArgs & MigrateUpArgs
}

async function removeFixtures(): Promise<void> {
  if (await pageTemplateCompositionSchemaExists(payload.db.drizzle)) {
    await payload.db.drizzle.execute(sql`
      DELETE FROM "_page_templates_v_blocks_page_template_icon"
      WHERE "_uuid" = ${versionIconUUID}
    `)
    await payload.db.drizzle.execute(sql`
      DELETE FROM "page_templates_blocks_action_links_items"
      WHERE "_parent_id" = ${liveBlockID}
    `)
    await payload.db.drizzle.execute(sql`
      DELETE FROM "page_templates_blocks_action_links"
      WHERE "id" = ${liveBlockID}
    `)
    await payload.db.drizzle.execute(sql`
      DELETE FROM "_page_templates_v_blocks_action_links_items"
      WHERE "_parent_id" IN (
        SELECT "id" FROM "_page_templates_v_blocks_action_links"
        WHERE "_uuid" = ${versionBlockUUID}
      )
    `)
    await payload.db.drizzle.execute(sql`
      DELETE FROM "_page_templates_v_blocks_action_links"
      WHERE "_uuid" = ${versionBlockUUID}
    `)
    return
  }

  await payload.db.drizzle.execute(sql`
    DELETE FROM "page_templates_blocks_current_item_field"
    WHERE "id" = ${liveBlockID}
  `)
  await payload.db.drizzle.execute(sql`
    DELETE FROM "_page_templates_v_blocks_current_item_field"
    WHERE "_uuid" = ${versionBlockUUID}
  `)
}

beforeAll(async () => {
  payload = await getPayload({ config })
  migrationRequest = await createLocalReq(
    { context: { skipPublicCacheInvalidation: true } },
    payload,
  )
})

afterAll(async () => {
  if (!payload) return
  await removeFixtures()
  if (!(await pageTemplateCompositionSchemaExists(payload.db.drizzle))) {
    await upPageTemplateComposition(migrationArguments())
  }
})

describe('page template composition migration', () => {
  it('converts legacy event actions in live and versioned templates and blocks lossy rollback', async () => {
    await removeFixtures()
    await downPageTemplateComposition(migrationArguments())

    await payload.db.drizzle.execute(sql`
      INSERT INTO "page_templates_blocks_current_item_field"
        ("_order", "_parent_id", "_path", "id", "field", "variant")
      SELECT 0, "id", 'informationPanel', ${liveBlockID}, 'eventActions', 'list'
      FROM "page_templates"
      WHERE "template_key" = 'event-detail'
    `)
    await payload.db.drizzle.execute(sql`
      INSERT INTO "_page_templates_v_blocks_current_item_field"
        ("_order", "_parent_id", "_path", "field", "variant", "_uuid")
      SELECT 0, "id", 'version_informationPanel', 'eventActions', 'list', ${versionBlockUUID}
      FROM "_page_templates_v"
      WHERE "version_template_key" = 'event-detail'
      ORDER BY "id" DESC
      LIMIT 1
    `)

    await upPageTemplateComposition(migrationArguments())

    const liveActions = await payload.db.drizzle.execute(sql`
      SELECT item."_order" AS "order", item."context_action"::text AS "contextAction",
        item."label", item."icon_name"::text AS "iconName"
      FROM "page_templates_blocks_action_links_items" item
      WHERE item."_parent_id" = ${liveBlockID}
      ORDER BY item."_order"
    `)
    expect(liveActions.rows).toEqual([
      {
        contextAction: 'eventCalendar',
        iconName: 'calendar',
        label: 'Dodaj do kalendarza',
        order: 0,
      },
      {
        contextAction: 'eventMap',
        iconName: 'location',
        label: 'Otwórz w Mapach',
        order: 1,
      },
    ])

    const versionActions = await payload.db.drizzle.execute(sql`
      SELECT item."_order" AS "order", item."context_action"::text AS "contextAction"
      FROM "_page_templates_v_blocks_action_links_items" item
      INNER JOIN "_page_templates_v_blocks_action_links" block
        ON block."id" = item."_parent_id"
      WHERE block."_uuid" = ${versionBlockUUID}
      ORDER BY item."_order"
    `)
    expect(versionActions.rows).toEqual([
      { contextAction: 'eventCalendar', order: 0 },
      { contextAction: 'eventMap', order: 1 },
    ])

    const legacyRows = await payload.db.drizzle.execute(sql`
      SELECT (
        SELECT count(*)::int FROM "page_templates_blocks_current_item_field"
        WHERE "id" = ${liveBlockID}
      ) + (
        SELECT count(*)::int FROM "_page_templates_v_blocks_current_item_field"
        WHERE "_uuid" = ${versionBlockUUID}
      ) AS "count"
    `)
    expect(legacyRows.rows[0]?.count).toBe(0)

    await expect(downPageTemplateComposition(migrationArguments())).rejects.toMatchObject({
      cause: { message: expect.stringContaining('Cannot roll back page template composition') },
    })

    await removeFixtures()
  })

  it('preserves icons stored only in a template version when rollback is attempted', async () => {
    await payload.db.drizzle.execute(sql`
      INSERT INTO "_page_templates_v_blocks_page_template_icon"
        ("_order", "_parent_id", "_path", "icon_name", "icon_inverted", "_uuid")
      SELECT 0, "id", 'version_hero', 'calendar', true, ${versionIconUUID}
      FROM "_page_templates_v"
      WHERE "version_template_key" = 'event-detail'
      ORDER BY "id" DESC
      LIMIT 1
    `)

    await expect(downPageTemplateComposition(migrationArguments())).rejects.toMatchObject({
      cause: { message: expect.stringContaining('Cannot roll back page template composition') },
    })
    const icons = await payload.db.drizzle.execute(sql`
      SELECT "icon_inverted" FROM "_page_templates_v_blocks_page_template_icon"
      WHERE "_uuid" = ${versionIconUUID}
    `)
    expect(icons.rows).toEqual([{ icon_inverted: true }])
  })
})
