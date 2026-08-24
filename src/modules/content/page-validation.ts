import { APIError, type CollectionBeforeValidateHook } from 'payload'

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

  if (data.systemKey && data.systemKey !== 'blog' && data.systemKey !== 'events') {
    throw new APIError('Nieobsługiwany klucz strony systemowej.', 400)
  }

  if (
    originalSystemKey !== data.systemKey &&
    (data.systemKey === 'blog' || data.systemKey === 'events') &&
    !systemPageMutationAllowed
  ) {
    throw new APIError('Strona systemowa może zostać utworzona tylko przez migrację.', 400)
  }

  if (originalSystemKey === 'blog' || originalSystemKey === 'events') {
    data.systemKey = originalSystemKey
    data.slug = originalSystemKey
  }

  if (data.systemKey === 'blog' || data.systemKey === 'events') {
    data.slug = data.systemKey
  } else if (data.slug === 'blog' || data.slug === 'events') {
    throw new APIError('Ten slug jest zarezerwowany dla strony systemowej.', 400)
  }

  return data
}
