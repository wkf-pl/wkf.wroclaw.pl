import type { Metadata } from 'next'

import type { Event, EventCycle, Media, Page, Partner, Post } from '@/payload-types'

function getMedia(value: Media | number | null | undefined): Media | null {
  return value && typeof value === 'object' ? value : null
}

export function createContentMetadata(
  document: Event | EventCycle | Page | Partner | Post,
): Metadata {
  const documentTitle = 'title' in document ? document.title : document.name
  const title = document.seo?.title || documentTitle
  const description =
    document.seo?.description ||
    ('excerpt' in document
      ? document.excerpt
      : 'listingExcerpt' in document
        ? document.listingExcerpt || undefined
        : undefined)
  const socialImage = getMedia(document.seo?.image) ?? getMedia(document.heroImage)
  const canonical =
    'eventStatus' in document
      ? `/events/${document.slug}`
      : 'eventDefaults' in document
        ? `/events/series/${document.slug}`
        : 'name' in document
          ? `/partners/${document.slug}`
          : 'excerpt' in document
            ? `/blog/${document.slug}`
            : `/${document.slug}`

  return {
    alternates: { canonical },
    description: description || undefined,
    openGraph: {
      description: description || undefined,
      images: socialImage?.url
        ? [
            {
              alt: socialImage.alt,
              height: socialImage.height || undefined,
              url: socialImage.url,
              width: socialImage.width || undefined,
            },
          ]
        : undefined,
      title,
      type: 'excerpt' in document ? 'article' : 'website',
    },
    title,
  }
}
