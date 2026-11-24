import { sql } from '@payloadcms/db-postgres'
import { APIError, type PayloadRequest } from 'payload'

import type { ListingView as ListingViewDocument } from '@/payload-types'

import { getTransactionExecutor } from './lock-content-owners'
import { getListingViewReference, parseListingAppearance, resolveListingView } from './listing-view'

const owners = {
  pages: { table: 'pages', title: 'title', trash: true },
  posts: { table: 'posts', title: 'title', trash: true },
  events: { table: 'events', title: 'title', trash: true },
  'event-cycles': { table: 'event_cycles', title: 'title', trash: true },
  partners: { table: 'partners', title: 'name', trash: true },
  'page-templates': { table: 'page_templates', title: 'template_key', trash: false },
  'homepage-sections': { table: 'homepage_sections', title: null, trash: false },
} as const

export type ListingUse = {
  key: string
  collection: keyof typeof owners
  id: number | null
  title: string
  path: string
  pathNames?: Record<number, string>
  status: 'published' | 'draft'
  inTrash: boolean
}

export type ListingViewUsageResult = {
  uses: ListingUse[]
  templates: { id: number; name: string; published: boolean }[]
}

type ViewReference = Pick<ListingViewDocument, 'id' | 'presetKey' | 'settings' | '_status'>

type ListingUseRow = Omit<ListingUse, 'key' | 'pathNames'> & {
  block_id: string
  row_id: string
  version: boolean
  version_id: number
  appearance: unknown
  view: string | null
  frame: string | null
  surface: string | null
  surface_image_id: number | null
  surface_horizontal_position: string | null
  surface_vertical_position: string | null
}

function blockTable(collection: keyof typeof owners, version: boolean) {
  const table = owners[collection].table
  return sql.identifier(`${version ? `_${table}_v` : table}_blocks_listing`)
}

function templatePredicate(template: ViewReference) {
  const preset = template.presetKey
    ? sql`OR COALESCE(block.appearance->>'preset', block.view::text, 'cards') = ${template.presetKey}`
    : sql.empty()
  return sql`(block.appearance->>'preset' = ${`shared:${template.id}`} ${preset})`
}

async function getUsageExecutor(req: PayloadRequest) {
  return (await req.transactionID)
    ? getTransactionExecutor(req)
    : req.payload.db.drizzle.execute.bind(req.payload.db.drizzle)
}

export async function lockListingViewTemplate(
  req: PayloadRequest,
  id: number,
  mode: 'use' | 'delete',
): Promise<ViewReference | undefined> {
  const execute = await getUsageExecutor(req)
  const lock = !(await req.transactionID)
    ? sql.empty()
    : mode === 'delete'
      ? sql`FOR UPDATE`
      : sql`FOR KEY SHARE`
  const { rows } = await execute(sql`
    SELECT id, preset_key AS "presetKey", settings, _status FROM listing_views
    WHERE id = ${id} ${lock}
  `)
  return rows[0] as ViewReference | undefined
}

async function loadUsageRows(
  req: PayloadRequest,
  template: ViewReference,
): Promise<ListingUseRow[]> {
  const execute = await getUsageExecutor(req)
  const queries = Object.entries(owners).flatMap(([collection, config]) =>
    [false, true].map((version) => {
      const isGlobal = collection === 'homepage-sections'
      const ownerTable = sql.identifier(version ? `_${config.table}_v` : config.table)
      const ownerID = isGlobal ? sql`NULL::integer` : version ? sql`owner.parent_id` : sql`owner.id`
      const title = config.title
        ? sql`owner.${sql.identifier(`${version ? 'version_' : ''}${config.title}`)}::text`
        : sql`'Sekcje strony głównej'`
      const status = version ? sql`owner.version__status` : sql`owner._status`
      const original =
        config.trash && version
          ? sql`JOIN ${sql.identifier(config.table)} live ON live.id = owner.parent_id`
          : sql.empty()
      const trash = config.trash
        ? version
          ? sql`live.deleted_at IS NOT NULL`
          : sql`owner.deleted_at IS NOT NULL`
        : sql`false`
      return sql`
        SELECT ${collection}::text AS collection, ${ownerID} AS id,
          COALESCE(${title}, (${ownerID})::text) AS title,
          COALESCE((${status})::text, 'draft') AS status, ${trash} AS "inTrash",
          block._path || '.' || (block._order - 1)::text AS path,
          block.id::text AS row_id,
          ${version ? sql`block._uuid` : sql`block.id`} AS block_id,
          owner.id AS version_id, ${version}::boolean AS version,
          block.appearance, block.view::text, block.frame::text, block.surface::text,
          block.surface_image_id, block.surface_horizontal_position::text, block.surface_vertical_position::text
        FROM ${blockTable(collection as keyof typeof owners, version)} block
        JOIN ${ownerTable} owner ON owner.id = block._parent_id
        ${original}
        WHERE ${templatePredicate(template)}
        ${version ? sql`AND owner.latest` : sql.empty()}
      `
    }),
  )
  const { rows } = await execute(sql`
    ${sql.join(queries, sql` UNION ALL `)}
    ORDER BY title, collection, id, path, status, version
  `)
  return rows as ListingUseRow[]
}

function groupUses(rows: ListingUseRow[]) {
  const groups = new Map<string, { use: ListingUse; rows: ListingUseRow[] }>()
  for (const row of rows) {
    const { collection, id, title, status, inTrash, block_id } = row
    const path = row.version ? row.path.replace(/^version\./, '') : row.path
    const key = JSON.stringify([collection, id, status, block_id || path])
    const use = { key, collection, id, title, status, inTrash, path }
    const group = groups.get(key)
    if (group) {
      group.rows.push(row)
      if (row.version === (status === 'draft')) group.use = use
    } else {
      groups.set(key, { use, rows: [row] })
    }
  }
  return groups
}

async function loadListingPathSource(req: PayloadRequest, row: ListingUseRow, root: string) {
  const { db } = req.payload
  const where = { id: { equals: row.version_id } }
  const select = { [root]: true } as const
  if (row.version) {
    const args = { limit: 1, req, select: { version: select }, where, pagination: false }
    const { docs } =
      row.collection === 'homepage-sections'
        ? await db.findGlobalVersions({ ...args, global: row.collection })
        : await db.findVersions({ ...args, collection: row.collection })
    return docs[0]?.version
  }
  return row.collection === 'homepage-sections'
    ? db.findGlobal({ req, select, slug: row.collection, where })
    : db.findOne({ collection: row.collection, req, select, where })
}

function readPathNames(document: unknown, segments: string[]): Record<number, string> {
  const names: Record<number, string> = {}
  let value = document
  for (const [index, segment] of segments.entries()) {
    if (!value || typeof value !== 'object') break
    value = (value as Record<string, unknown>)[segment]
    if (!/^\d+$/.test(segment) || !value || typeof value !== 'object') continue
    const row = value as Record<string, unknown>
    const name = [row.name, row.blockName, row.label].find(
      (candidate): candidate is string => typeof candidate === 'string' && candidate.trim() !== '',
    )
    if (name) names[index] = name.trim()
  }
  return names
}

export async function findListingViewUses(
  req: PayloadRequest,
  template: ViewReference,
): Promise<ListingUse[]> {
  const sources = new Map<string, ReturnType<typeof loadListingPathSource>>()
  const groups = groupUses(await loadUsageRows(req, template))
  return Promise.all(
    [...groups.values()].map(async ({ use, rows }) => {
      const row = rows.find(({ version }) => version === (use.status === 'draft')) ?? rows[0]
      const segments = use.path.split('.')
      const root = segments[0]
      const key = JSON.stringify([row.collection, row.version, row.version_id, root])
      let source = sources.get(key)
      if (!source) {
        source = loadListingPathSource(req, row, root)
        sources.set(key, source)
      }
      return { ...use, pathNames: readPathNames(await source, segments) }
    }),
  )
}

export async function preventDeletingUsedListingView({
  id,
  req,
}: {
  id: number | string
  req: PayloadRequest
}) {
  const template = await lockListingViewTemplate(req, Number(id), 'delete')
  if (template && (await loadUsageRows(req, template)).length) {
    throw new APIError('Szablon jest używany. Zmień lub odłącz go w tabeli „Użycie szablonu”.', 409)
  }
}

export function detachListingView(
  block: Parameters<typeof resolveListingView>[3] & { appearance?: unknown; view?: unknown },
  settings: unknown,
) {
  const { view } = resolveListingView(block.appearance, block.view, settings, block)
  return { preset: 'custom', overrides: view }
}

export async function reassignListingViewUses(
  req: PayloadRequest,
  template: ViewReference,
  keys: string[],
  targetId: number | null,
) {
  const execute = await getTransactionExecutor(req)
  const groups = groupUses(await loadUsageRows(req, template))
  const affectedDocuments = new Map<string, ListingUse>()
  for (const key of new Set(keys)) {
    const group = groups.get(key)
    if (!group) throw new APIError('Lista użyć się zmieniła. Odśwież ją i ponów akcję.', 409)
    for (const row of group.rows) {
      const reference = getListingViewReference(row.appearance, row.view)
      if (
        !reference ||
        ('id' in reference
          ? reference.id !== template.id
          : reference.presetKey !== template.presetKey)
      ) {
        throw new APIError('Lista użyć się zmieniła. Odśwież ją i ponów akcję.', 409)
      }
      const appearance =
        targetId === null
          ? detachListingView(
              {
                appearance: row.appearance,
                view: row.view,
                frame: row.frame,
                surface: row.surface,
                surfaceImage: row.surface_image_id,
                surfaceHorizontalPosition: row.surface_horizontal_position,
                surfaceVerticalPosition: row.surface_vertical_position,
              },
              template._status === 'published' ? template.settings : undefined,
            )
          : { ...parseListingAppearance(row.appearance), preset: `shared:${targetId}` }
      const table = blockTable(row.collection, row.version)
      // Patch the chosen publication or draft without changing which version Payload treats as latest.
      const currentVersion = row.version
        ? sql`AND EXISTS (
            SELECT 1 FROM ${sql.identifier(`_${owners[row.collection].table}_v`)} version
            WHERE version.id = block._parent_id AND version.latest
          )`
        : sql.empty()
      const result = await execute(sql`
        UPDATE ${table} block SET appearance = ${JSON.stringify(appearance)}::jsonb
        WHERE block.id = ${row.row_id} AND block._parent_id = ${row.version_id}
          AND block.appearance IS NOT DISTINCT FROM ${row.appearance == null ? null : JSON.stringify(row.appearance)}::jsonb
          ${currentVersion}
        RETURNING id
      `)
      if (result.rows.length !== 1) {
        throw new APIError('Lista użyć się zmieniła. Odśwież ją i ponów akcję.', 409)
      }
    }
    const { collection, id, status } = group.use
    affectedDocuments.set(JSON.stringify([collection, id, status]), group.use)
  }
  return [...affectedDocuments.values()]
}
