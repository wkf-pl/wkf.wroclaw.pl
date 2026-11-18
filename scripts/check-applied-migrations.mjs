import { createRequire } from 'node:module'
import { setTimeout as delay } from 'node:timers/promises'
import { pathToFileURL } from 'node:url'

async function checkAppliedMigrations() {
  const requiredMigrations = JSON.parse(process.argv[1])
  const require = createRequire(import.meta.url)
  const driverPath = require.resolve('pg', { paths: [require.resolve('@payloadcms/db-postgres')] })
  const {
    default: { Client },
  } = await import(pathToFileURL(driverPath).href)
  const database = new Client({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5_000,
    statement_timeout: 5_000,
  })

  try {
    await database.connect()
    const history = await database
      .query('SELECT name FROM public.payload_migrations')
      .catch((error) => {
        if (error.code !== '42P01') throw error
        return { rows: [] }
      })
    const appliedMigrations = new Set(history.rows.map(({ name }) => name))
    const missingMigrations = requiredMigrations.filter((name) => !appliedMigrations.has(name))

    if (missingMigrations.length === 0) {
      console.log('Migration verification: WKF_MIGRATION_CHECK complete')
    } else {
      console.log(
        `Migration verification: WKF_MIGRATION_CHECK missing ${missingMigrations.join(' ')}`,
      )
      process.exitCode = 1
    }
  } finally {
    await database.end()
  }
}

checkAppliedMigrations()
  .catch((error) => {
    console.error(`Migration verification: WKF_MIGRATION_CHECK error ${error.code || 'UNKNOWN'}`)
    process.exitCode = 1
  })
  // Give the runner time to read the report from the replica before Azure removes it.
  .finally(() => delay(45_000))
