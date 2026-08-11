import type { CollectionBeforeChangeHook } from 'payload'

export const setPublishedAt: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  const status = data._status ?? originalDoc?._status
  const existingPublishedAt = data.publishedAt ?? originalDoc?.publishedAt

  if (status === 'published' && !existingPublishedAt) {
    return {
      ...data,
      publishedAt: new Date().toISOString(),
    }
  }

  return data
}
