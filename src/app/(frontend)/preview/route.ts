import {draftMode} from 'next/headers'
import {redirect} from 'next/navigation'
import {getPayload} from 'payload'

import config from '@payload-config'

import {parseDraftPreviewTarget} from '@/modules/content/draft-preview'

export async function GET(request: Request): Promise<Response> {
    const requestURL = new URL(request.url)
    const target = parseDraftPreviewTarget(requestURL.searchParams)

    if (!target) {
        return new Response('Invalid preview target.', {status: 400})
    }

    const payload = await getPayload({config})
    let authenticatedUser

    try {
        const authentication = await payload.auth({headers: request.headers})
        authenticatedUser = authentication.user
    } catch (err) {
        payload.logger.error({err}, 'Draft preview authentication failed')
        return new Response('Draft preview is not available.', {status: 403})
    }

    if (!authenticatedUser) {
        return new Response('Draft preview is not available.', {status: 403})
    }

    const result = await payload.find({
        collection: target.collection,
        depth: 0,
        draft: true,
        limit: 1,
        overrideAccess: false,
        pagination: false,
        user: authenticatedUser,
        where: {slug: {equals: target.slug}},
    })

    if (!result.docs[0]) {
        return new Response('Preview document was not found.', {status: 404})
    }

    const preview = await draftMode()
    preview.enable()

    redirect(target.path)
}
