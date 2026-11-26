import type { MigrateUpArgs } from '@payloadcms/db-postgres'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { up as migrateContentAttribution } from '../../migrations/20261123_204500_content_attribution_and_owners'
import { up as rebuildAttributedListingIndex } from '../../migrations/20261126_160000_rebuild_attributed_listing_index'
import { rebuildTopicListingIndex } from '../../migrations/lib/topic-listing-data'

vi.mock('../../migrations/lib/topic-listing-data', () => ({
  rebuildTopicListingIndex: vi.fn(),
}))

describe('content attribution migration', () => {
  const args = {
    db: { execute: vi.fn().mockResolvedValue({ rows: [] }) },
    req: {},
  } as unknown as MigrateUpArgs

  beforeEach(() => {
    vi.mocked(rebuildTopicListingIndex).mockReset()
  })

  it('can migrate ownership before the optimized Media schema is installed', async () => {
    vi.mocked(rebuildTopicListingIndex).mockRejectedValueOnce(
      new Error('relation "media_legacy_image_files" does not exist'),
    )

    await expect(migrateContentAttribution(args)).resolves.toBeUndefined()
    expect(rebuildTopicListingIndex).not.toHaveBeenCalled()
  })

  it('rebuilds the listing index in the separate data migration', async () => {
    await rebuildAttributedListingIndex(args)
    expect(rebuildTopicListingIndex).toHaveBeenCalledExactlyOnceWith({ db: args.db, req: args.req })
  })
})
