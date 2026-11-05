import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import config from '@payload-config'

import { parseDraftPreviewTarget } from '@/modules/content/draft-preview'
import {
  getPageTemplateDefinition,
  type PageTemplatePreviewCollection,
} from '@/modules/page-templates/page-template-registry'

export async function GET(request: Request): Promise<Response> {
  const requestURL = new URL(request.url)
  const target = parseDraftPreviewTarget(requestURL.searchParams)

  if (!target) {
    return new Response('Invalid preview target.', { status: 400 })
  }

  const payload = await getPayload({ config })
  let authenticatedUser

  try {
    const authentication = await payload.auth({ headers: request.headers })
    authenticatedUser = authentication.user
  } catch (err) {
    payload.logger.error({ err }, 'Draft preview authentication failed')
    return new Response('Draft preview is not available.', { status: 403 })
  }

  if (!authenticatedUser) {
    return new Response('Draft preview is not available.', { status: 403 })
  }

  let previewPath: string

  if ('pageTemplate' in target) {
    const templateResult = await payload.find({
      collection: 'page-templates',
      depth: 0,
      draft: true,
      limit: 1,
      overrideAccess: false,
      pagination: false,
      user: authenticatedUser,
      where: { templateKey: { equals: target.pageTemplate } },
    })
    const template = templateResult.docs[0]
    const definition = getPageTemplateDefinition(target.pageTemplate)

    if (!template || !definition?.rendererAvailable) {
      return new Response('Page template preview is not available.', { status: 404 })
    }
    if (template.renderingMode !== 'template') {
      return new Response('Switch the draft to template rendering mode before previewing it.', {
        status: 400,
      })
    }

    try {
      previewPath = await resolvePageTemplatePreviewPath({
        payload,
        previewCollection: definition.previewCollection,
        previewTarget: template.previewTarget,
        route: definition.route,
        user: authenticatedUser,
      })
    } catch (err) {
      if (err instanceof ResponseError) {
        return new Response(err.message, { status: err.status })
      }
      throw err
    }
  } else if ('collection' in target) {
    const result = await payload.find({
      collection: target.collection,
      depth: 0,
      draft: true,
      limit: 1,
      overrideAccess: false,
      pagination: false,
      user: authenticatedUser,
      where: { slug: { equals: target.slug } },
    })

    if (!result.docs[0]) {
      return new Response('Preview document was not found.', { status: 404 })
    }
    previewPath = target.path
  } else {
    await payload.findGlobal({
      slug: target.global,
      depth: 0,
      draft: true,
      overrideAccess: false,
      user: authenticatedUser,
    })
    previewPath = target.path
  }

  const preview = await draftMode()
  preview.enable()

  redirect(previewPath)
}

type PayloadInstance = Awaited<ReturnType<typeof getPayload>>
type AuthenticatedUser = NonNullable<Awaited<ReturnType<PayloadInstance['auth']>>['user']>

async function resolvePageTemplatePreviewPath({
  payload,
  previewCollection,
  previewTarget,
  route,
  user,
}: {
  payload: PayloadInstance
  previewCollection: PageTemplatePreviewCollection | null
  previewTarget: unknown
  route: string
  user: AuthenticatedUser
}): Promise<string> {
  if (!previewCollection) return route

  if (
    !previewTarget ||
    typeof previewTarget !== 'object' ||
    !('relationTo' in previewTarget) ||
    previewTarget.relationTo !== previewCollection ||
    !('value' in previewTarget)
  ) {
    throw new ResponseError('Choose an element used for page template preview.', 400)
  }

  const targetID =
    typeof previewTarget.value === 'object' && previewTarget.value && 'id' in previewTarget.value
      ? previewTarget.value.id
      : previewTarget.value
  const slug = await findPreviewTargetSlug(payload, previewCollection, targetID, user)

  if (!slug) throw new ResponseError('Page template preview element was not found.', 404)
  return route.replace('[slug]', slug)
}

async function findPreviewTargetSlug(
  payload: PayloadInstance,
  collection: PageTemplatePreviewCollection,
  id: unknown,
  user: AuthenticatedUser,
): Promise<string | null> {
  if (typeof id !== 'string' && typeof id !== 'number') return null

  const document = await payload.findByID({
    collection,
    id,
    depth: 0,
    draft: true,
    overrideAccess: false,
    user,
  })

  return document && 'slug' in document && typeof document.slug === 'string' ? document.slug : null
}

class ResponseError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}
