import type { BaseDatabaseAdapter, PayloadRequest } from 'payload'

import { isAuditedCollection, isAuditedGlobal } from './targets'

const versionReferencesKey = Symbol.for('wkf.contentAuditVersionReferences')
const captureInstalledKey = Symbol.for('wkf.contentAuditVersionCaptureInstalled')
type VersionAdapter = BaseDatabaseAdapter & { [captureInstalledKey]?: true }

type VersionRequest = Partial<PayloadRequest> & {
  [versionReferencesKey]?: Map<string, string>
}

function rememberVersion(req: VersionRequest | undefined, key: string, id: unknown): void {
  if (!req || (typeof id !== 'number' && typeof id !== 'string')) return
  const references = (req[versionReferencesKey] ??= new Map())
  references.set(key, String(id))
}

export function takeVersionReference(
  req: VersionRequest,
  target: string,
  parent?: string,
): string | undefined {
  const references = req[versionReferencesKey]
  const key = parent === undefined ? target : `${target}:${parent}`
  const version = references?.get(key)
  references?.delete(key)
  return version
}

export function captureAuditVersions(adapter: VersionAdapter): void {
  if (adapter[captureInstalledKey]) return
  adapter[captureInstalledKey] = true
  // Payload passes the document to afterChange and drops the version row's ID.

  const createVersion = adapter.createVersion.bind(adapter)
  adapter.createVersion = async (args) => {
    if (!args.req || !isAuditedCollection(args.collectionSlug) || args.snapshot) {
      return createVersion(args)
    }

    // Payload skips returning the version when the parent is first created.
    const version = await createVersion(
      args.returning === false ? { ...args, returning: true, select: { id: true } } : args,
    )
    rememberVersion(args.req, `${args.collectionSlug}:${args.parent}`, version?.id)
    return version
  }

  const createGlobalVersion = adapter.createGlobalVersion.bind(adapter)
  adapter.createGlobalVersion = async (args) => {
    const version = await createGlobalVersion(args)
    if (isAuditedGlobal(args.globalSlug) && !args.snapshot) {
      rememberVersion(args.req, args.globalSlug, version?.id)
    }
    return version
  }

  const updateVersion = adapter.updateVersion.bind(adapter)
  adapter.updateVersion = async (args) => {
    const version = await updateVersion(args)
    const parent = args.versionData.parent
    if (isAuditedCollection(args.collection) && parent !== undefined) {
      rememberVersion(args.req, `${args.collection}:${parent}`, version?.id)
    }
    return version
  }

  const updateGlobalVersion = adapter.updateGlobalVersion.bind(adapter)
  adapter.updateGlobalVersion = async (args) => {
    const version = await updateGlobalVersion(args)
    if (isAuditedGlobal(args.global)) {
      rememberVersion(args.req, args.global, version?.id)
    }
    return version
  }
}
