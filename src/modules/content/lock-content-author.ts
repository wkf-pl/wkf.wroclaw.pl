import { sql } from '@payloadcms/db-postgres'
import { APIError, type CollectionSlug, type PayloadRequest } from 'payload'

import { getContentAuthorReference, type ContentAuthorReference } from './content-author'

export async function lockContentAuthor(
  req: PayloadRequest,
  collection: CollectionSlug,
  id: number | string,
): Promise<ContentAuthorReference | undefined> {
  const executeInTransaction = await getTransactionExecutor(req)
  const adapter = req.payload.db
  const table = collection.replaceAll('-', '_')
  await executeInTransaction(
    sql`SELECT id FROM ${sql.identifier(table)} WHERE id = ${id} FOR UPDATE`,
  )
  const doc = await adapter.findOne<{ id: number; author?: unknown }>({
    collection,
    req,
    where: { id: { equals: id } },
  })
  if (!doc) throw new APIError('Dokument został usunięty.', 409)
  return getContentAuthorReference(doc.author)
}

export async function lockAuthorGroup(
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

async function getTransactionExecutor(req: PayloadRequest) {
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
