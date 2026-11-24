import { sql } from '@payloadcms/db-postgres'
import { APIError, type CollectionSlug, type PayloadRequest } from 'payload'

import { getContentOwners, type ContentOwner } from './content-owners'

export async function lockContentOwners(
  req: PayloadRequest,
  collection: CollectionSlug,
  id: number | string,
): Promise<ContentOwner[]> {
  const executeInTransaction = await getTransactionExecutor(req)
  const adapter = req.payload.db
  const table = collection.replaceAll('-', '_')
  await executeInTransaction(
    sql`SELECT id FROM ${sql.identifier(table)} WHERE id = ${id} FOR UPDATE`,
  )
  const doc = await adapter.findOne<{ id: number; owners?: unknown }>({
    collection,
    req,
    where: { id: { equals: id } },
  })
  if (!doc) throw new APIError('Dokument został usunięty.', 409)
  return getContentOwners(doc.owners)
}

export async function lockOwnerGroup(
  req: PayloadRequest,
  id: number,
  forDeletion = false,
): Promise<void> {
  const executeInTransaction = await getTransactionExecutor(req)
  await executeInTransaction(
    sql`SELECT id FROM user_groups WHERE id = ${id} ${forDeletion ? sql`FOR UPDATE` : sql`FOR KEY SHARE`}`,
  )
  const group = await req.payload.db.findOne({
    collection: 'user-groups',
    req,
    where: { id: { equals: id } },
  })
  if (!group) throw new APIError('Wybrana grupa nie istnieje.', 404)
}

export async function getTransactionExecutor(req: PayloadRequest) {
  const adapter = req.payload.db
  const transactionId = await req.transactionID
  const transaction = transactionId == null ? undefined : adapter.sessions?.[transactionId]?.db
  if (
    !transaction ||
    typeof transaction !== 'object' ||
    !('execute' in transaction) ||
    typeof transaction.execute !== 'function'
  ) {
    throw new APIError('Zmiana treści wymaga transakcji bazy danych.', 500)
  }
  const execute = transaction.execute.bind(transaction)
  return (statement: ReturnType<typeof sql>) => execute(statement)
}
