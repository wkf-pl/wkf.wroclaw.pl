import type { Media } from '@/payload-types'
import { getResponsiveMedia } from '@/modules/media/media-url'

type CmsImageProperties = {
  className?: string
  media: Media | number | null | undefined
  sizes?: string
  alt?: string
  priority?: boolean
}

export function CmsImage({
  alt,
  className,
  media,
  priority = false,
  sizes = '(max-width: 720px) 100vw, (max-width: 1040px) 50vw, 480px',
}: CmsImageProperties) {
  if (!media || typeof media !== 'object') return null
  const { src, srcSet, height, width } = getResponsiveMedia(media)
  if (!src) return null

  return (
    // eslint-disable-next-line @next/next/no-img-element -- CMS media can use a runtime-configured Azure host.
    <img
      alt={alt ?? media.alt}
      className={className}
      fetchPriority={priority ? 'high' : undefined}
      height={height}
      loading={priority ? undefined : 'lazy'}
      sizes={srcSet ? sizes : undefined}
      src={src}
      srcSet={srcSet}
      width={width}
    />
  )
}
