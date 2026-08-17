import { APIError, type CollectionBeforeValidateHook } from 'payload'

type RelationshipValue = number | string | { id: number | string } | null | undefined

function getRelationshipId(value: RelationshipValue): number | string | null {
  if (typeof value === 'number' || typeof value === 'string') {
    return value
  }

  return value && typeof value === 'object' ? value.id : null
}

export const validatePageStructure: CollectionBeforeValidateHook = async ({
  data,
  originalDoc,
  req,
}) => {
  if (!data) {
    return data
  }

  const originalSystemKey =
    originalDoc && typeof originalDoc === 'object' && 'systemKey' in originalDoc
      ? originalDoc.systemKey
      : null
  const systemPageMutationAllowed = req.context.allowSystemPageMutation === true

  if (data.systemKey && data.systemKey !== 'blog') {
    throw new APIError('Nieobsługiwany klucz strony systemowej.', 400)
  }

  if (originalSystemKey !== 'blog' && data.systemKey === 'blog' && !systemPageMutationAllowed) {
    throw new APIError('Strona systemowa Blog może zostać utworzona tylko przez migrację.', 400)
  }

  if (originalSystemKey === 'blog') {
    data.systemKey = 'blog'
    data.slug = 'blog'
  }

  if (data.systemKey === 'blog') {
    data.slug = 'blog'
  } else if (data.slug === 'blog') {
    throw new APIError('Slug „blog” jest zarezerwowany dla systemowej strony Blog.', 400)
  }

  const currentPageId =
    originalDoc && typeof originalDoc === 'object' && 'id' in originalDoc
      ? (originalDoc.id as number | string)
      : null
  let parentId = getRelationshipId(data.parent as RelationshipValue)
  const visitedPageIds = new Set<number | string>()

  while (parentId !== null) {
    if (parentId === currentPageId || visitedPageIds.has(parentId)) {
      throw new APIError('Strona nadrzędna tworzyłaby cykl w hierarchii stron.', 400)
    }

    visitedPageIds.add(parentId)
    const parentPage = await req.payload.findByID({
      collection: 'pages',
      depth: 0,
      id: parentId,
      overrideAccess: true,
      req,
    })
    parentId = getRelationshipId(parentPage.parent as RelationshipValue)
  }

  return data
}
