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

import type { Page, PageTemplate, Post } from '@/payload-types'
import { shouldRenderPageTemplate, type DraftPreviewGlobal } from './draft-preview'
import type { PageTemplateID } from '@/modules/page-templates/page-template-registry'
import { findPublishedPageTemplate } from '@/modules/page-templates/public-page-templates'
import {
  findPublishedPageBySlug,
  findPublishedPostBySlug,
  getPublicFooter,
  getPublicHomepageHero,
  getPublicHomepageSections,
  getPublicNavigation,
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

export const findPageTemplateForRequest = cache(
  async (templateKey: PageTemplateID): Promise<PreviewContentResult<PageTemplate>> => {
    const { isEnabled } = await draftMode()

    if (!isEnabled) {
      return { document: await findPublishedPageTemplate(templateKey), isDraftPreview: false }
    }

    const payload = await getPayload({ config })
    const user = await authenticatePreviewUser(payload)

    if (!user) {
      return { document: null, isDraftPreview: true }
    }

    const result = await payload.find({
      collection: 'page-templates',
      depth: 3,
      disableErrors: true,
      draft: true,
      limit: 1,
      overrideAccess: false,
      pagination: false,
      user,
      where: { templateKey: { equals: templateKey } },
    })

    return { document: result.docs[0] ?? null, isDraftPreview: true }
  },
)

export async function findRenderablePageTemplateForRequest(
  templateKey: PageTemplateID,
  searchParams: Record<string, string | string[] | undefined>,
): Promise<PreviewContentResult<PageTemplate>> {
  const { document, isDraftPreview } = await findPageTemplateForRequest(templateKey)
  const shouldRender =
    document &&
    shouldRenderPageTemplate({
      isDraftPreview,
      renderingMode: document.renderingMode,
      searchParams,
      templateKey,
    })

  return { document: shouldRender ? document : null, isDraftPreview }
}

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
    disableErrors: true,
    draft: true,
    overrideAccess: false,
    user,
  })

  return document
    ? { document, isDraftPreview: true }
    : { document: await findPublishedGlobal(), isDraftPreview: false }
}

const authenticatePreviewUser = cache(async (payload: Payload): Promise<null | TypedUser> => {
  try {
    const authentication = await payload.auth({ headers: await headers() })
    return authentication.user
  } catch {
    return null
  }
})
