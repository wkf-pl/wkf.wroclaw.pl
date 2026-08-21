type MediaReference = { url?: string | null } | number | null | undefined

export function getMediaURL(media: MediaReference): string | undefined {
  return media && typeof media === 'object' ? media.url || undefined : undefined
}
