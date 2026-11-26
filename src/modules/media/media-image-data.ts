export type MediaImageVariant = {
  filename: string
  width: number
  height: number
  filesize: number
}

export const optimizedImagePrefix = 'optimized-media/'

export function getOptimizedImageKey(filename: string): string | undefined {
  return /^(?:[a-z0-9-]{1,64}-)?image-[a-f0-9-]{36}(?:-\d+)?\.webp$/.test(filename)
    ? optimizedImagePrefix + filename
    : undefined
}

export function getMediaVariantURL(mediaID: number, filename: string): string {
  return `/api/media/${mediaID}/image/${encodeURIComponent(filename)}`
}

export function getMediaFileURL(filename: string): string {
  return `/api/media/file/${encodeURIComponent(filename)}`
}
