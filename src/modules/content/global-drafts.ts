import type { Access } from 'payload'

export function preventAnonymousDraftRead(readAccess: Access): Access {
  return async (arguments_) => {
    const { req } = arguments_
    const draftRequested = req.query.draft === true || req.query.draft === 'true'

    if (!req.user && draftRequested) return false
    return readAccess(arguments_)
  }
}
