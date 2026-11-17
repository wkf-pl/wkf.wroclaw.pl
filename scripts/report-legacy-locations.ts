import 'dotenv/config'

import { getPayload } from 'payload'

import { reportLegacyLocationIssues } from '../migrations/lib/legacy-locations'

process.env.PAYLOAD_MIGRATING = 'true'
const { default: config } = await import('../src/payload.config')
const payload = await getPayload({ config, disableOnInit: true })
try {
  const report = await reportLegacyLocationIssues(payload.db.drizzle)
  console.log(JSON.stringify(report, null, 2))
  if (report.some((entry) => entry.blocksMigration)) process.exitCode = 1
} finally {
  await payload.destroy()
}
