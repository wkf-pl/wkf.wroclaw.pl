import type { NestedDocsPluginConfig } from '@payloadcms/plugin-nested-docs/types'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import type { CollectionAfterChangeHook, PayloadRequest, Plugin } from 'payload'

import { getRelationshipId } from '@/lib/relationships'
import { generateHierarchyLabel, generateHierarchyURL } from './hierarchy'

const hierarchyConfig: NestedDocsPluginConfig = {
  collections: ['pages', 'categories'],
  generateLabel: generateHierarchyLabel,
  generateURL: generateHierarchyURL,
  parentFieldSlug: 'parent',
}

const hierarchyMaintenance = new WeakSet<PayloadRequest>()
const unchangedPathsKey = Symbol('unchangedHierarchyPaths')
type HierarchyRequest = PayloadRequest & { [unchangedPathsKey]?: Set<string> }

function consumeUnchangedPath(req: HierarchyRequest, key: string): boolean {
  return req[unchangedPathsKey]?.delete(key) ?? false
}

export function isHierarchyMaintenance(req: PayloadRequest): boolean {
  return hierarchyMaintenance.has(req)
}

function asHierarchyMaintenance(hook: CollectionAfterChangeHook): CollectionAfterChangeHook {
  return async (args) => {
    const { req } = args
    if (hierarchyMaintenance.has(req)) return hook(args)

    hierarchyMaintenance.add(req)
    try {
      return await hook(args)
    } finally {
      hierarchyMaintenance.delete(req)
    }
  }
}

function pathSignature(breadcrumbs: unknown): string | undefined {
  if (!Array.isArray(breadcrumbs)) return undefined
  return JSON.stringify(
    breadcrumbs.map(({ doc, label, url }) => [getRelationshipId(doc), label, url]),
  )
}

export const contentHierarchyPlugin: Plugin = async (config) => {
  const configured = await nestedDocsPlugin(hierarchyConfig)(config)
  return {
    ...configured,
    collections: configured.collections?.map((collection) => {
      const target = collection.slug
      if (target !== 'pages' && target !== 'categories') return collection

      // These are the two hooks prepended by the nested docs plugin.
      const [resaveChildren, resaveSelf, ...afterChange] = collection.hooks?.afterChange ?? []
      const refreshChildren = asHierarchyMaintenance(resaveChildren)
      return {
        ...collection,
        hooks: {
          ...collection.hooks,
          beforeChange: [
            ...(collection.hooks?.beforeChange ?? []),
            async ({ data, operation, originalDoc, req }) => {
              if (operation !== 'update' || originalDoc?.id == null) return data
              const key = `${target}:${originalDoc.id}`
              const request: HierarchyRequest = req
              const unchanged = (request[unchangedPathsKey] ??= new Set())
              unchanged.delete(key)
              if (target === 'pages' && data._status !== 'published') return data

              // A publication can follow a draft with the same path. Compare to the live row.
              const saved =
                target === 'pages'
                  ? await req.payload.db.findOne({
                      collection: target,
                      req,
                      select: { breadcrumbs: true, _status: true },
                      where: { id: { equals: originalDoc.id } },
                    })
                  : originalDoc
              const nextPath = pathSignature(data.breadcrumbs)
              if (
                saved &&
                (target === 'categories' || saved._status === 'published') &&
                nextPath !== undefined &&
                nextPath === pathSignature(saved.breadcrumbs)
              ) {
                unchanged.add(key)
              }
              return data
            },
          ],
          afterChange: [
            async (args) => {
              const unchanged = consumeUnchangedPath(args.req, `${target}:${args.doc.id}`)
              if (args.operation === 'update' && !unchanged) {
                return refreshChildren(args)
              }
            },
            asHierarchyMaintenance(resaveSelf),
            ...afterChange,
          ],
        },
      }
    }),
  }
}
