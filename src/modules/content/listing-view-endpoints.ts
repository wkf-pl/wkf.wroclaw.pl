import type { Endpoint, PaginatedDocs, PayloadRequest, DataFromCollectionSlug } from 'payload'

import { getFormRelationshipId } from '@/lib/relationships'
import { findPublicContent } from '@/modules/content/content-listing'
import { normalizeContentPresentation } from '@/modules/content/content-presentation'
import { presentListingItem } from '@/modules/content/content-listing-presentation'
import {
  isListingSource,
  type CurrentListingTarget,
  type ListingConditionInput,
} from '@/modules/content/listing-conditions'
import {
  getListingViewReference,
  getSharedListingViewId,
  resolveListingView,
} from '@/modules/content/listing-view'
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
      (isListingSource(targetSource) || targetSource === 'categories' || targetSource === 'tags')
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
    const { view } = resolveListingView(block.appearance, block.view, shared?.docs[0]?.settings)
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
      block.surface === 'image' && surfaceImageID !== undefined
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
        presentation: normalizeContentPresentation({ ...block, surfaceImage }),
      },
      {
        headers: { 'Cache-Control': 'private, no-store' },
      },
    )
  },
}

const listingCollections = [
  'pages',
  'posts',
  'events',
  'event-cycles',
  'partners',
  'page-templates',
] as const

type ListingUse = {
  collection: (typeof listingCollections)[number] | 'homepage-sections'
  id?: number
  title: string
  status: 'published' | 'draft'
}

function containsListingView(document: unknown, id: number): boolean {
  if (Array.isArray(document)) return document.some((child) => containsListingView(child, id))
  const block = asRecord(document)
  return (
    (block.blockType === 'listing' && getSharedListingViewId(block.appearance) === id) ||
    Object.values(block).some(
      (child) => typeof child === 'object' && child !== null && containsListingView(child, id),
    )
  )
}

async function findListingUses(req: PayloadRequest, id: number): Promise<ListingUse[]> {
  const statuses = ['published', 'draft'] as const
  const results = await Promise.all(
    listingCollections.flatMap((collection) =>
      statuses.map(async (status) => {
        const uses: ListingUse[] = []
        let page: number | null = 1
        while (page !== null) {
          const result: PaginatedDocs<DataFromCollectionSlug<typeof collection>> =
            await req.payload.find({
              collection,
              depth: 0,
              draft: status === 'draft',
              where: { _status: { equals: status } },
              limit: 100,
              page,
              req,
              disableErrors: true,
              overrideAccess: false,
            })
          for (const document of result.docs) {
            if (!containsListingView(document, id)) continue
            const title =
              'title' in document
                ? document.title
                : 'name' in document
                  ? document.name
                  : document.templateKey
            uses.push({ collection, id: document.id, title: title ?? String(document.id), status })
          }
          page = result.nextPage ?? null
        }
        return uses
      }),
    ),
  )
  const uses = results.flat()
  for (const status of statuses) {
    const global = await req.payload.findGlobal({
      slug: 'homepage-sections',
      draft: status === 'draft',
      depth: 0,
      req,
      disableErrors: true,
      overrideAccess: false,
    })
    if (global?._status === status && containsListingView(global, id)) {
      uses.push({ collection: 'homepage-sections', title: 'Sekcje strony głównej', status })
    }
  }
  return uses
}

export const listingViewUsageEndpoint: Endpoint = {
  path: '/:id/usage',
  method: 'get',
  handler: async (req) => {
    const { isAdministrator } = await import('@/modules/membership/role-access')
    if (!(await isAdministrator(req))) return Response.json(null, { status: 403 })
    const id = Number(req.routeParams?.id)
    if (!Number.isSafeInteger(id) || id < 1) return Response.json(null, { status: 400 })
    return Response.json(await findListingUses(req, id), {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  },
}
