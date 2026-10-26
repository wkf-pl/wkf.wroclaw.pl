import { draftMode, headers } from 'next/headers'
import { cache } from 'react'
import {
  getPayload,
  type GlobalSlug,
  type Payload,
  type TypedGlobal,
  type TypedUser,
} from 'payload'

import config from '@payload-config'

import type { Page, Post } from '@/payload-types'
import type { DraftPreviewGlobal } from './draft-preview'
import {
  findPublishedPageBySlug,
  findPublishedPostBySlug,
  getPublicFooter,
  getPublicHomepageHero,
  getPublicHomepageSections,
  getPublicNavigation,
  getPublicSiteSettings,
} from './public-content'

export type PreviewContentResult<Document> = {
  document: Document | null
  isDraftPreview: boolean
}

type PreviewGlobalResult<Document> = {
  document: Document
  isDraftPreview: boolean
}

export const findPageForRequest = cache(
  async (slug: string): Promise<PreviewContentResult<Page>> => {
    const { isEnabled } = await draftMode()

    if (!isEnabled) {
      return { document: await findPublishedPageBySlug(slug), isDraftPreview: false }
    }

    const payload = await getPayload({ config })
    const user = await authenticatePreviewUser(payload)

    if (!user) {
      return { document: null, isDraftPreview: true }
    }

    const result = await payload.find({
      collection: 'pages',
      depth: 2,
      draft: true,
      limit: 1,
      overrideAccess: false,
      pagination: false,
      user,
      where: { slug: { equals: slug } },
    })

    return { document: result.docs[0] ?? null, isDraftPreview: true }
  },
)

export const findPostForRequest = cache(
  async (slug: string): Promise<PreviewContentResult<Post>> => {
    const { isEnabled } = await draftMode()

    if (!isEnabled) {
      return { document: await findPublishedPostBySlug(slug), isDraftPreview: false }
    }

    const payload = await getPayload({ config })
    const user = await authenticatePreviewUser(payload)

    if (!user) {
      return { document: null, isDraftPreview: true }
    }

    const result = await payload.find({
      collection: 'posts',
      depth: 2,
      draft: true,
      limit: 1,
      overrideAccess: false,
      pagination: false,
      user,
      where: { slug: { equals: slug } },
    })

    return { document: result.docs[0] ?? null, isDraftPreview: true }
  },
)

export const findFooterForRequest = cache(() => findGlobalForRequest('footer', getPublicFooter))

export const findHomepageHeroForRequest = cache(() =>
  findGlobalForRequest('homepage-hero', getPublicHomepageHero),
)

export const findHomepageSectionsForRequest = cache(() =>
  findGlobalForRequest('homepage-sections', getPublicHomepageSections),
)

export const findNavigationForRequest = cache(() =>
  findGlobalForRequest('navigation', getPublicNavigation),
)

export const findSiteSettingsForRequest = cache(() =>
  findGlobalForRequest('site-settings', getPublicSiteSettings),
)

async function findGlobalForRequest<Slug extends DraftPreviewGlobal & GlobalSlug>(
  slug: Slug,
  findPublishedGlobal: () => Promise<TypedGlobal[Slug]>,
): Promise<PreviewGlobalResult<TypedGlobal[Slug]>> {
  const { isEnabled } = await draftMode()

  if (!isEnabled) {
    return { document: await findPublishedGlobal(), isDraftPreview: false }
  }

  const payload = await getPayload({ config })
  const user = await authenticatePreviewUser(payload)

  if (!user) {
    return { document: await findPublishedGlobal(), isDraftPreview: false }
  }

  const document = await payload.findGlobal({
    slug,
    depth: 2,
    draft: true,
    overrideAccess: false,
    user,
  })

  return { document, isDraftPreview: true }
}

const authenticatePreviewUser = cache(async (payload: Payload): Promise<null | TypedUser> => {
  try {
    const authentication = await payload.auth({ headers: await headers() })
    return authentication.user
  } catch {
    return null
  }
})
