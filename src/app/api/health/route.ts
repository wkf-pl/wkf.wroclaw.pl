import { sql } from '@payloadcms/db-postgres'
import { getPayload } from 'payload'

import config from '@payload-config'

export const dynamic = 'force-dynamic'

const databaseReadTimeoutMilliseconds = 2_000
let pendingDatabaseRead: Promise<boolean> | undefined

async function readDatabase(): Promise<void> {
  const payload = await getPayload({ config })
  await payload.db.drizzle.execute(sql`SELECT id FROM pages LIMIT 1`)
}

export async function GET(): Promise<Response> {
  pendingDatabaseRead ??= readDatabase()
    .then(
      () => true,
      () => false,
    )
    .finally(() => {
      pendingDatabaseRead = undefined
    })

  let timeout: ReturnType<typeof setTimeout> | undefined
  const databaseAvailable = await Promise.race([
    pendingDatabaseRead,
    new Promise<false>((resolve) => {
      timeout = setTimeout(() => resolve(false), databaseReadTimeoutMilliseconds)
    }),
  ])
  clearTimeout(timeout)

  return Response.json(
    { status: databaseAvailable ? 'ok' : 'unavailable' },
    {
      status: databaseAvailable ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  )
}
