import { draftMode, headers } from 'next/headers'
import { cache } from 'react'
import { getPayload, type Payload, type TypedUser } from 'payload'

import config from '@payload-config'

import type { Page, Post } from '@/payload-types'
import { findPublishedPageBySlug, findPublishedPostBySlug } from './public-content'

export type PreviewContentResult<Document> = {
  document: Document | null
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

async function authenticatePreviewUser(payload: Payload): Promise<null | TypedUser> {
  try {
    const authentication = await payload.auth({ headers: await headers() })
    return authentication.user
  } catch {
    return null
  }
}
