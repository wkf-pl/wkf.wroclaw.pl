import type { Metadata } from 'next'

import type { Media, Page, Post } from '@/payload-types'

function getMedia(value: Media | number | null | undefined): Media | null {
  return value && typeof value === 'object' ? value : null
}

export function createContentMetadata(document: Page | Post): Metadata {
  const title = document.seo?.title || document.title
  const description =
    document.seo?.description ||
    ('excerpt' in document ? document.excerpt : document.listingExcerpt || undefined)
  const socialImage = getMedia(document.seo?.image) ?? getMedia(document.heroImage)

  return {
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
