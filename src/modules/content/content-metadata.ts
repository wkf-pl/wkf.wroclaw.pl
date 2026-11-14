import type { Metadata } from 'next'

import type { Event, EventCycle, Media, Page, PageTemplate, Partner, Post } from '@/payload-types'
import { extractRichTextText } from '@/modules/content/rich-text'

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
    ('eventStatus' in document || 'eventDefaults' in document
      ? extractRichTextText(document.excerpt)
      : 'excerpt' in document
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

  return createMetadata(canonical, title, description, socialImage, 'excerpt' in document)
}

export function createBlogTemplateMetadata(template: PageTemplate | null): Metadata {
  return createMetadata(
    '/blog',
    template?.seo?.title || 'Blog',
    template?.seo?.description,
    getMedia(template?.seo?.image) ?? getMedia(template?.heroImage),
  )
}

function createMetadata(
  canonical: string,
  title: string,
  description: string | null | undefined,
  socialImage: Media | null,
  isArticle = false,
): Metadata {
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
      type: isArticle ? 'article' : 'website',
    },
    title,
  }
}
