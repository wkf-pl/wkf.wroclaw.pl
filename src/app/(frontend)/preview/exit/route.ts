import {draftMode} from 'next/headers'
import {redirect} from 'next/navigation'

import {getSafePreviewExitPath} from '@/modules/content/draft-preview'

export async function GET(request: Request): Promise<Response> {
    const requestURL = new URL(request.url)
    const returnPath = getSafePreviewExitPath(requestURL.searchParams.get('path'))
    const preview = await draftMode()
    preview.disable()

    redirect(returnPath)
}
