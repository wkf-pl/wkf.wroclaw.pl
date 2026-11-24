import {
  APIError,
  commitTransaction,
  initTransaction,
  killTransaction,
  type Endpoint,
} from 'payload'

import { getFormRelationshipId } from '@/lib/relationships'
import { findPublicContent } from '@/modules/content/content-listing'
import { loadListingDecorationMedia } from '@/modules/content/listing-decoration-media'
import { normalizeContentPresentation } from '@/modules/content/content-presentation'
import { presentListingItem } from '@/modules/content/content-listing-presentation'
import {
  isListingSource,
  type CurrentListingTarget,
  type ListingConditionInput,
} from '@/modules/content/listing-conditions'
import { getListingViewReference, resolveListingView } from '@/modules/content/listing-view'
import { invalidatePublicCacheTags } from '@/modules/cache/invalidate-public-data'
import { publicCacheTags } from '@/modules/cache/public-data-cache'
import { recordContentAuditChange } from '@/modules/content-audit/plugin'
import { isAuditedCollection, isAuditedGlobal } from '@/modules/content-audit/targets'
import { isAdministrator } from '@/modules/membership/role-access'
import {
  findListingViewUses,
  lockListingViewTemplate,
  reassignListingViewUses,
  type ListingViewUsageResult,
} from '@/modules/content/listing-view-usage'
import { resolvePageTemplateListingItems } from '@/modules/page-templates/page-template-context'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

export const listingViewPreviewEndpoint: Endpoint = {
  path: '/preview',
  method: 'post',
  handler: async (req) => {
    if (!req.user) return Response.json(null, { status: 401 })
    const data = asRecord(await req.json?.().catch(() => null))
    const block = asRecord(data.block)
    const target = asRecord(data.previewTarget)
    const targetID = getFormRelationshipId(target.value)
    const targetSource = target.relationTo
    let currentTarget: CurrentListingTarget | undefined
    if (
      targetID !== undefined &&
      (isListingSource(targetSource) || targetSource === 'topics' || targetSource === 'tags')
    ) {
      currentTarget = { relationTo: targetSource, value: targetID }
    }

    let manualItems = Array.isArray(block.items)
      ? block.items.slice(0, 100).flatMap((row) => {
          const item = asRecord(asRecord(row).item)
          const label = asRecord(row).contextLabel
          const value = getFormRelationshipId(item.value)
          return isListingSource(item.relationTo) && value !== undefined
            ? [
                {
                  relationTo: item.relationTo,
                  value,
                  contextLabel: typeof label === 'string' ? label.slice(0, 160) : undefined,
                },
              ]
            : []
        })
      : []

    if (block.selectionMode === 'contextRelation') {
      if (
        targetID === undefined ||
        !currentTarget ||
        (currentTarget.relationTo !== 'events' && currentTarget.relationTo !== 'event-cycles')
      ) {
        return Response.json({ missingContext: true })
      }
      const document = await req.payload.findByID({
        collection: currentTarget.relationTo,
        id: targetID,
        depth: 0,
        req,
        overrideAccess: false,
        disableErrors: true,
      })
      if (!document) return Response.json({ missingContext: true })
      manualItems = resolvePageTemplateListingItems(
        typeof block.contextRelation === 'string' ? block.contextRelation : undefined,
        document,
      ).flatMap((item) => {
        const value = getFormRelationshipId(item.value)
        return value === undefined
          ? []
          : [{ ...item, value, contextLabel: item.contextLabel ?? undefined }]
      })
    }

    const reference = getListingViewReference(block.appearance, block.view)
    const shared = reference
      ? await req.payload.find({
          collection: 'listing-views',
          where: {
            ...('id' in reference
              ? { id: { equals: reference.id } }
              : { presetKey: { equals: reference.presetKey } }),
            _status: { equals: 'published' },
          },
          depth: 0,
          limit: 1,
          req,
          overrideAccess: false,
        })
      : undefined
    const { view } = resolveListingView(
      block.appearance,
      block.view,
      shared?.docs[0]?.settings,
      block,
    )
    const sort = block.sort
    const result = await findPublicContent({
      conditions: Array.isArray(block.conditions)
        ? (block.conditions.slice(0, 50).map(asRecord) as ListingConditionInput[])
        : [],
      currentTarget,
      includeInactiveLocations: block.includeInactiveLocations === true,
      manualItems,
      selectionMode:
        block.selectionMode === 'manual' || block.selectionMode === 'contextRelation'
          ? 'manual'
          : 'filters',
      sort:
        sort === 'oldest' || sort === 'titleAscending' || sort === 'titleDescending'
          ? sort
          : 'newest',
      sources: Array.isArray(block.sources) ? block.sources.filter(isListingSource) : [],
      page: 1,
      pageSize:
        typeof block.pageSize === 'number' && Number.isInteger(block.pageSize)
          ? Math.max(1, Math.min(block.pageSize, 4))
          : 4,
      pagination: false,
    })
    const surfaceImageID = getFormRelationshipId(block.surfaceImage)
    const surfaceImage =
      !view.decoration && block.surface === 'image' && surfaceImageID !== undefined
        ? await req.payload.findByID({
            collection: 'media',
            id: surfaceImageID,
            depth: 0,
            overrideAccess: false,
            req,
            disableErrors: true,
          })
        : undefined
    return Response.json(
      {
        items: result.items.map((item) => presentListingItem(item, view)),
        view,
        media: await loadListingDecorationMedia(req.payload, view.decoration),
        presentation: view.decoration
          ? undefined
          : normalizeContentPresentation({ ...block, surfaceImage }),
      },
      {
        headers: { 'Cache-Control': 'private, no-store' },
      },
    )
  },
}

function parseTemplateId(value: unknown): number | undefined {
  const id = typeof value === 'string' && /^[1-9][0-9]*$/.test(value) ? Number(value) : value
  return typeof id === 'number' && Number.isSafeInteger(id) && id > 0 ? id : undefined
}

export const listingViewUsageEndpoint: Endpoint = {
  path: '/:id/usage',
  method: 'get',
  handler: async (req) => {
    if (!(await isAdministrator(req))) return Response.json(null, { status: 403 })
    const id = parseTemplateId(req.routeParams?.id)
    if (!id) return Response.json(null, { status: 400 })
    const template = await lockListingViewTemplate(req, id, 'use')
    if (!template) return Response.json(null, { status: 404 })
    const [uses, { docs }] = await Promise.all([
      findListingViewUses(req, template),
      req.payload.find({
        collection: 'listing-views',
        req,
        overrideAccess: false,
        depth: 0,
        limit: 0,
        pagination: false,
        sort: 'name',
        select: { name: true, _status: true },
        where: { id: { not_equals: id } },
      }),
    ])
    return Response.json(
      {
        uses,
        templates: docs.map(({ id, name, _status }) => ({
          id,
          name,
          published: _status === 'published',
        })),
      } satisfies ListingViewUsageResult,
      {
        headers: { 'Cache-Control': 'private, no-store' },
      },
    )
  },
}

export const listingViewReassignmentEndpoint: Endpoint = {
  path: '/:id/usage',
  method: 'post',
  handler: async (req) => {
    if (!(await isAdministrator(req))) return Response.json(null, { status: 403 })
    const id = parseTemplateId(req.routeParams?.id)
    const { keys, target } = asRecord(await req.json?.().catch(() => null))
    const targetId = target === null ? null : parseTemplateId(target)
    if (
      !id ||
      targetId === undefined ||
      targetId === id ||
      !Array.isArray(keys) ||
      keys.length < 1 ||
      keys.some((key: unknown) => typeof key !== 'string' || key.length > 1024)
    ) {
      return Response.json(null, { status: 400 })
    }

    const startedTransaction = await initTransaction(req)
    try {
      const template = await lockListingViewTemplate(req, id, 'use')
      if (!template) throw new APIError('Nie znaleziono szablonu.', 404)
      if (targetId !== null) {
        const replacement = await lockListingViewTemplate(req, targetId, 'use')
        if (replacement?._status !== 'published') {
          throw new APIError('Wybierz opublikowany szablon.', 400)
        }
      }
      const changed = await reassignListingViewUses(req, template, keys, targetId)
      for (const { collection, id, status, title } of changed) {
        if (!isAuditedCollection(collection) && !isAuditedGlobal(collection)) continue
        await recordContentAuditChange(req, {
          action: 'update',
          target: collection,
          targetId: id === null ? undefined : String(id),
          title,
          saveMode: status === 'published' ? 'publish' : 'draft',
        })
      }
      if (startedTransaction) await commitTransaction(req)
    } catch (error) {
      if (startedTransaction) await killTransaction(req)
      throw error
    }
    invalidatePublicCacheTags(Object.values(publicCacheTags))
    return Response.json({ updated: new Set(keys).size })
  },
}
