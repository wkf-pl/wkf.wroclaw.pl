import type { Media } from '@/payload-types'

type CmsImageProperties = {
  className?: string
  media: Media | number | null | undefined
}

export function CmsImage({ className, media }: CmsImageProperties) {
  if (!media || typeof media !== 'object' || !media.url) {
    return null
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- CMS media can use a runtime-configured Azure host.
    <img
      alt={media.alt}
      className={className}
      height={media.height || undefined}
      loading="lazy"
      src={media.url}
      width={media.width || undefined}
    />
  )
}
