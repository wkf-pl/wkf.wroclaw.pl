import type { Media } from '@/payload-types'
import { getMediaURL } from '@/modules/media/media-url'

type CmsImageProperties = {
  className?: string
  media: Media | number | null | undefined
}

export function CmsImage({ className, media }: CmsImageProperties) {
  const url = getMediaURL(media)
  if (!url || !media || typeof media !== 'object') {
    return null
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- CMS media can use a runtime-configured Azure host.
    <img
      alt={media.alt}
      className={className}
      height={media.height || undefined}
      loading="lazy"
      src={url}
      width={media.width || undefined}
    />
  )
}
