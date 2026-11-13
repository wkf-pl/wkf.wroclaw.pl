import type { PayloadRequest, Plugin } from 'payload'

import {
  auditedCollections,
  auditedGlobals,
  isAuditedCollection,
  isAuditedGlobal,
  type AuditAction,
  type AuditTarget,
} from './targets'

type AuditEntry = {
  action: AuditAction
  target: AuditTarget
  targetId?: string
  title: string
  saveMode?: 'draft' | 'publish'
}

async function recordChange(req: PayloadRequest, entry: AuditEntry): Promise<void> {
  const user = req.user
  // Local create clears req.file even when it creates a non-upload document.
  const file = req.file
  try {
    await req.payload.create({
      collection: 'content-audit-log',
      data: {
        ...entry,
        actor: user ? user.displayName?.trim() || user.email : 'System',
        actorId: user ? String(user.id) : undefined,
        occurredAt: new Date().toISOString(),
      },
      overrideAccess: true,
      req,
    })
  } finally {
    req.file = file
  }
}

function getTitle(
  doc: Record<string, unknown>,
  target: keyof typeof auditedCollections,
  id: string,
): string {
  for (const field of auditedCollections[target].titleFields) {
    const value = doc[field]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return `${auditedCollections[target].label} #${id}`
}

type SaveOperation = 'autosave' | 'restore-version'

const saveOperationsKey = Symbol('contentAuditSaveOperations')
type AuditRequest = PayloadRequest & { [saveOperationsKey]?: Map<AuditTarget, SaveOperation> }

function trackSaveOperation(
  req: PayloadRequest,
  target: AuditTarget,
  operation: string,
  args: unknown,
): void {
  if (operation !== 'create' && operation !== 'update' && operation !== 'restoreVersion') return

  const auditRequest: AuditRequest = req
  const operations = (auditRequest[saveOperationsKey] ??= new Map())
  operations.delete(target)
  if (operation === 'restoreVersion') {
    operations.set(target, 'restore-version')
  } else if (
    args &&
    typeof args === 'object' &&
    'autosave' in args &&
    args.autosave === true &&
    'draft' in args &&
    args.draft === true
  ) {
    operations.set(target, 'autosave')
  }
}

function clearSaveOperation(req: AuditRequest, target: AuditTarget): void {
  req[saveOperationsKey]?.delete(target)
}

function getSaveOperation(req: AuditRequest, target: AuditTarget): SaveOperation | undefined {
  return req[saveOperationsKey]?.get(target)
}

function getSaveMode(action: AuditAction, status: unknown): AuditEntry['saveMode'] {
  if (action !== 'create' && action !== 'update') return undefined
  if (status === 'draft') return 'draft'
  if (status === 'published') return 'publish'
  return undefined
}

export const contentAuditPlugin: Plugin = (config) => ({
  ...config,
  collections: config.collections?.map((collection) => {
    const target = collection.slug
    if (!isAuditedCollection(target)) return collection

    return {
      ...collection,
      forceSelect: {
        ...collection.forceSelect,
        ...Object.fromEntries(auditedCollections[target].titleFields.map((field) => [field, true])),
        ...(collection.trash ? { deletedAt: true } : {}),
        ...(typeof collection.versions === 'object' && collection.versions.drafts
          ? { _status: true }
          : {}),
      },
      hooks: {
        ...collection.hooks,
        beforeOperation: [
          ...(collection.hooks?.beforeOperation ?? []),
          ({ args, operation, req }) => trackSaveOperation(req, target, operation, args),
        ],
        afterChange: [
          async ({ data, doc, operation, previousDoc, req }) => {
            const saveOperation = getSaveOperation(req, target)
            let action: AuditAction =
              saveOperation === 'restore-version' ? saveOperation : operation
            if (collection.trash && action === 'update') {
              if (!previousDoc.deletedAt && (doc.deletedAt || data.deletedAt)) action = 'trash'
              if (previousDoc.deletedAt && data.deletedAt === null) action = 'restore'
            }
            if (saveOperation === 'autosave' && action === operation && doc._status === 'draft') {
              return doc
            }

            const targetId = String(doc.id)
            await recordChange(req, {
              action,
              target,
              targetId,
              title: getTitle({ ...previousDoc, ...data, ...doc }, target, targetId),
              saveMode: getSaveMode(action, doc._status ?? data._status),
            })
            return doc
          },
          ...(collection.hooks?.afterChange ?? []),
        ],
        afterOperation: [
          ({ operation, req }) => {
            if (['create', 'update', 'updateByID', 'restoreVersion'].includes(operation)) {
              clearSaveOperation(req, target)
            }
          },
          ...(collection.hooks?.afterOperation ?? []),
        ],
        afterDelete: [
          ...(collection.hooks?.afterDelete ?? []),
          async ({ doc, id, req }) => {
            const targetId = String(id)
            await recordChange(req, {
              action: 'delete',
              target,
              targetId,
              title: getTitle(doc, target, targetId),
            })
            return doc
          },
        ],
      },
    }
  }),
  globals: config.globals?.map((global) => {
    const target = global.slug
    if (!isAuditedGlobal(target)) return global

    return {
      ...global,
      hooks: {
        ...global.hooks,
        beforeOperation: [
          ...(global.hooks?.beforeOperation ?? []),
          ({ args, operation, req }) => trackSaveOperation(req, target, operation, args),
        ],
        afterChange: [
          ...(global.hooks?.afterChange ?? []),
          async ({ doc, req }) => {
            const saveOperation = getSaveOperation(req, target)
            clearSaveOperation(req, target)
            if (saveOperation === 'autosave' && doc._status === 'draft') return doc
            const action = saveOperation === 'restore-version' ? saveOperation : 'update'
            await recordChange(req, {
              action,
              target,
              title: auditedGlobals[target].title,
              saveMode: getSaveMode(action, doc._status),
            })
            return doc
          },
        ],
      },
    }
  }),
})
