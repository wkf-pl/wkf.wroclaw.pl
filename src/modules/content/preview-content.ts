import { draftMode, headers } from 'next/headers'
import { cache } from 'react'
import {
  getPayload,
  type GlobalSlug,
  type Payload,
  type TypedCollection,
  type TypedGlobal,
  type TypedUser,
} from 'payload'

import config from '@payload-config'

import type { PageTemplate } from '@/payload-types'
import {
  findPublishedEventBySlug,
  findPublishedEventCycleBySlug,
} from '@/modules/events/public-events'
import {
  pageTemplatePreviewParameter,
  shouldRenderPageTemplate,
  type DraftPreviewCollection,
  type DraftPreviewGlobal,
} from './draft-preview'
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

export const findPageForRequest = cache((slug: string) =>
  findContentForRequest('pages', slug, findPublishedPageBySlug, 2),
)

export const findPostForRequest = cache((slug: string) =>
  findContentForRequest('posts', slug, findPublishedPostBySlug, 2),
)

export const findEventForRequest = cache((slug: string, isTemplatePreview: boolean) =>
  findContentForRequest('events', slug, findPublishedEventBySlug, 3, isTemplatePreview),
)

export const findEventCycleForRequest = cache((slug: string, isTemplatePreview: boolean) =>
  findContentForRequest('event-cycles', slug, findPublishedEventCycleBySlug, 3, isTemplatePreview),
)

async function findContentForRequest<Collection extends DraftPreviewCollection>(
  collection: Collection,
  slug: string,
  findPublishedContent: (slug: string) => Promise<TypedCollection[Collection] | null>,
  depth: number,
  publishedOnly = false,
): Promise<PreviewContentResult<TypedCollection[Collection]>> {
  if (publishedOnly || !(await draftMode()).isEnabled) {
    return { document: await findPublishedContent(slug), isDraftPreview: false }
  }

  const payload = await getPayload({ config })
  const user = await authenticatePreviewUser(payload)

  if (!user) {
    return { document: null, isDraftPreview: true }
  }

  const result = await payload.find({
    collection,
    depth,
    draft: true,
    limit: 1,
    overrideAccess: false,
    pagination: false,
    user,
    where: { slug: { equals: slug } },
  })

  return { document: result.docs[0] ?? null, isDraftPreview: true }
}

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
  isDocumentDraftPreview = false,
): Promise<PreviewContentResult<PageTemplate>> {
  if (isDocumentDraftPreview && searchParams[pageTemplatePreviewParameter] !== templateKey) {
    const document = await findPublishedPageTemplate(templateKey)
    return {
      document: document?.renderingMode === 'template' ? document : null,
      isDraftPreview: false,
    }
  }

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
