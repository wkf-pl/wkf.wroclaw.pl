import { getMediaVariantURL, type MediaImageVariant } from './media-image-data'

type MediaReference = { url?: string | null } | number | null | undefined

export function getMediaURL(media: MediaReference): string | undefined {
  return media && typeof media === 'object' ? media.url || undefined : undefined
}


type ResponsiveMedia = {
  id?: number
  url?: string | null
  width?: number | null
  height?: number | null
  imageVariants?: MediaImageVariant[] | null
}

export function getResponsiveMedia(media: ResponsiveMedia) {
  const { id } = media
  const variants = typeof id === 'number'
    ? (media.imageVariants ?? []).map((variant) => ({
        src: getMediaVariantURL(id, variant.filename),
        width: variant.width,
        height: variant.height,
      }))
    : []
  const selected = variants.at(-1)
  return {
    src: selected?.src ?? media.url ?? undefined,
    srcSet: variants.length
      ? variants.map(({ src, width }) => `${src} ${width}w`).join(', ')
      : undefined,
    sources: variants,
    width: media.width ?? undefined,
    height: media.height ?? undefined,
  }
}
