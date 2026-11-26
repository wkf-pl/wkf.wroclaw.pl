import { REST_GET } from '@payloadcms/next/routes'
import { createPayloadRequest } from 'payload'

import config from '@payload-config'

import { resolveLegacyMediaFile } from '@/modules/media/media-image-endpoints'

const getPayloadMedia = REST_GET(config)

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> },
): Promise<Response> {
  const { filename } = await params
  const response = await getPayloadMedia(request, {
    params: Promise.resolve({ slug: ['media', 'file', filename] }),
  })
  if (response.status !== 403 && response.status !== 404) return response

  const req = await createPayloadRequest({ config, request })
  const redirect = await resolveLegacyMediaFile(req, filename)
  if (redirect) await response.body?.cancel()
  return redirect ?? response
}
