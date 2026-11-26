import type {
  CollectionBeforeOperationHook,
  CollectionSlug,
  PayloadRequest,
  Plugin,
  SelectField,
  Where,
} from 'payload'

import { getTranslation } from '@payloadcms/translations'

function normalizeOptionSearch(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase('pl')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replaceAll('ł', 'l')
}

function findMatchingOptions(field: SelectField, search: string, req: PayloadRequest): string[] {
  const term = normalizeOptionSearch(search)
  return field.options.flatMap((option) => {
    const value = typeof option === 'string' ? option : option.value
    const label = typeof option === 'string' ? option : getTranslation(option.label, req.i18n)
    return normalizeOptionSearch(value).includes(term) ||
      (typeof label === 'string' && normalizeOptionSearch(label).includes(term))
      ? [value]
      : []
  })
}

async function resolveListSearch(
  where: Where,
  relationships: ReadonlyMap<string, CollectionSlug>,
  selects: ReadonlyMap<string, SelectField>,
  req: PayloadRequest,
): Promise<Where> {
  const entries = await Promise.all(
    Object.entries(where).map(async ([path, condition]) => {
      if (Array.isArray(condition)) {
        return [
          path,
          await Promise.all(
            condition.map((part) => resolveListSearch(part, relationships, selects, req)),
          ),
        ] as const
      }
      if (typeof condition?.like !== 'string' || Object.keys(condition).length !== 1) {
        return [path, condition] as const
      }

      const select = selects.get(path)
      if (select) return [path, { in: findMatchingOptions(select, condition.like, req) }] as const

      const relatedCollection = relationships.get(path)
      if (!relatedCollection) return [path, condition] as const

      const title = req.payload.collections[relatedCollection]?.config.admin.useAsTitle
      if (!title) return [path, { in: [] }] as const

      const { docs } = await req.payload.find({
        collection: relatedCollection,
        where: { [title]: { like: condition.like } },
        select: {},
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

const resolveListSearchFields: CollectionBeforeOperationHook = async ({
  args,
  collection,
  operation,
  req,
}) => {
  const operations = ['read', 'find', 'readDistinct', 'findDistinct', 'count']
  if (!operations.includes(operation) || !('where' in args) || !args.where) return

  const fields = new Set(collection.admin.listSearchableFields)
  const relationships = new Map<string, CollectionSlug>()
  const selects = new Map<string, SelectField>()
  for (const field of collection.flattenedFields) {
    if (!fields.has(field.name)) continue

    if (field.type === 'relationship' && typeof field.relationTo === 'string') {
      relationships.set(field.name, field.relationTo)
    }
    if (field.type === 'select' && !field.hasMany) {
      selects.set(field.name, field)
    }
  }
  if (relationships.size > 0 || selects.size > 0) {
    args.where = await resolveListSearch(args.where, relationships, selects, req)
  }
}

export const adminListSearchPlugin: Plugin = (config) => ({
  ...config,
  collections: config.collections?.map((collection) =>
    collection.admin?.listSearchableFields?.length
      ? {
          ...collection,
          hooks: {
            ...collection.hooks,
            beforeOperation: [
              ...(collection.hooks?.beforeOperation ?? []),
              resolveListSearchFields,
            ],
          },
        }
      : collection,
  ),
})
