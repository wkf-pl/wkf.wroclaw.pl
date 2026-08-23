import type { AccessResult, PayloadRequest } from 'payload'

export const publicRequestContext = { publicWebsite: true } as const

export const publishedPublicAccess: AccessResult = {
  _status: {
    equals: 'published',
  },
}

export function isPublicRequest(req: PayloadRequest, isReadingStaticFile?: boolean): boolean {
  return req.context?.publicWebsite === true || isReadingStaticFile === true
}
