import type {
  CollectionBeforeOperationHook,
  CollectionSlug,
  PayloadRequest,
  Plugin,
  Where,
} from 'payload'

async function resolveRelationshipSearch(
  where: Where,
  relationships: ReadonlyMap<string, CollectionSlug>,
  req: PayloadRequest,
): Promise<Where> {
  const entries = await Promise.all(
    Object.entries(where).map(async ([path, condition]) => {
      if (Array.isArray(condition)) {
        return [
          path,
          await Promise.all(
            condition.map((part) => resolveRelationshipSearch(part, relationships, req)),
          ),
        ] as const
      }
      const relatedCollection = relationships.get(path)
      if (
        !relatedCollection ||
        typeof condition?.like !== 'string' ||
        Object.keys(condition).length !== 1
      ) {
        return [path, condition] as const
      }

      const title = req.payload.collections[relatedCollection]?.config.admin.useAsTitle
      if (!title) return [path, { in: [] }] as const

      const { docs } = await req.payload.find({
        collection: relatedCollection,
        where: { [title]: { like: condition.like } },
        select: { [title]: true },
        limit: 0,
        pagination: false,
        depth: 0,
        disableErrors: true,
        overrideAccess: false,
        req,
      })
      return [path, { in: docs.map(({ id }) => id) }] as const
    }),
  )
  return Object.fromEntries(entries)
}

const searchRelationshipTitles: CollectionBeforeOperationHook = async ({
  args,
  collection,
  operation,
  req,
}) => {
  const operations = ['read', 'find', 'readDistinct', 'findDistinct', 'count']
  if (!operations.includes(operation) || !('where' in args) || !args.where) return

  const fields = new Set(collection.admin.listSearchableFields)
  const relationships = new Map<string, CollectionSlug>()
  for (const field of collection.flattenedFields) {
    if (
      fields.has(field.name) &&
      field.type === 'relationship' &&
      typeof field.relationTo === 'string'
    ) {
      relationships.set(field.name, field.relationTo)
    }
  }
  if (relationships.size > 0) {
    args.where = await resolveRelationshipSearch(args.where, relationships, req)
  }
}

export const adminRelationshipSearchPlugin: Plugin = (config) => ({
  ...config,
  collections: config.collections?.map((collection) =>
    collection.admin?.listSearchableFields?.length
      ? {
          ...collection,
          hooks: {
            ...collection.hooks,
            beforeOperation: [
              ...(collection.hooks?.beforeOperation ?? []),
              searchRelationshipTitles,
            ],
          },
        }
      : collection,
  ),
})
