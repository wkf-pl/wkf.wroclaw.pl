import type { Access, CollectionBeforeOperationHook, PayloadRequest } from 'payload'

import { combineAccessResults } from '@/modules/membership/permission-resolution'

type TrashMutation = 'regularUpdate' | 'restore' | 'trash'

const trashMutations = new WeakMap<PayloadRequest, TrashMutation>()

export const markTrashMutation: CollectionBeforeOperationHook = ({ args, operation, req }) => {
  if (operation !== 'update') return

  const data = args.data
  if (!data || typeof data !== 'object' || !('deletedAt' in data)) {
    trashMutations.set(req, 'regularUpdate')
    return
  }

  trashMutations.set(req, data.deletedAt === null ? 'restore' : 'trash')
}

export function createTrashDeleteAccess(
  baseDeleteAccess: Access,
  permanentDeleteAccess: Access,
): Access {
  return async (arguments_) => {
    if (arguments_.data?.deletedAt) {
      return baseDeleteAccess(arguments_)
    }

    return permanentDeleteAccess(arguments_)
  }
}

export function createTrashReadAccess(baseReadAccess: Access): Access {
  return async (arguments_) => baseReadAccess(arguments_)
}

export function createTrashUpdateAccess(baseUpdateAccess: Access, restoreAccess: Access): Access {
  return async (arguments_) => {
    const data = arguments_.data
    const mutation = trashMutations.get(arguments_.req)

    if (mutation === 'restore') {
      return restoreAccess(arguments_)
    }

    if (mutation === 'trash' || mutation === 'regularUpdate') {
      return baseUpdateAccess(arguments_)
    }

    if (!data) {
      return combineAccessResults(
        await baseUpdateAccess(arguments_),
        await restoreAccess(arguments_),
      )
    }

    return data.deletedAt ? restoreAccess(arguments_) : baseUpdateAccess(arguments_)
  }
}
