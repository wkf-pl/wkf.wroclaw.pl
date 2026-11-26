import type { MigrateUpArgs } from '@payloadcms/db-postgres'

import { rebuildTopicListingIndex } from './lib/topic-listing-data'

export async function up({ db, req }: MigrateUpArgs): Promise<void> {
  // The projection reads Media through the current Payload schema, including the image metadata.
  await rebuildTopicListingIndex({ db, req })
}

export async function down(): Promise<void> {
  // The index is derived from the current documents, with no schema changes to reverse.
}
