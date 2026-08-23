import { getPayload } from 'payload'

import { migrations } from '../migrations'
import config from '../src/payload.config'

const reconcilablePendingMigrations = new Set([
  '20260821_092652_content_listing_index',
  '20260823_001526_simplify_public_access',
])

const payload = await getPayload({ config, disableOnInit: true })

try {
  const migrationRecords = await payload.find({
    collection: 'payload-migrations',
    limit: 0,
    overrideAccess: true,
    sort: 'name',
  })
  const developmentMarkers = migrationRecords.docs.filter((migration) => migration.batch === -1)

  if (developmentMarkers.length === 0) {
    process.exitCode = 0
  } else {
    const appliedMigrationNames = new Set(
      migrationRecords.docs
        .filter((migration) => migration.batch !== -1)
        .map((migration) => migration.name),
    )
    const pendingMigrationNames = migrations
      .map((migration) => migration.name)
      .filter((migrationName) => !appliedMigrationNames.has(migrationName))
    const hasUnsupportedSchemaDrift =
      !pendingMigrationNames.includes('20260821_092652_content_listing_index') ||
      pendingMigrationNames.some(
        (migrationName) => !reconcilablePendingMigrations.has(migrationName),
      )

    if (hasUnsupportedSchemaDrift) {
      throw new Error(
        `Refusing to remove the Payload development schema marker. Pending migrations require manual reconciliation: ${pendingMigrationNames.join(', ') || 'none'}.`,
      )
    }

    for (const developmentMarker of developmentMarkers) {
      await payload.delete({
        collection: 'payload-migrations',
        id: developmentMarker.id,
        overrideAccess: true,
      })
    }

    payload.logger.warn(
      'Removed the legacy development schema marker before running reconciling migrations.',
    )
  }
} finally {
  await payload.destroy()
}

process.exit(0)
