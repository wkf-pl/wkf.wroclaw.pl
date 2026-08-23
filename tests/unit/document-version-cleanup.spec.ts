import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

describe('document version cleanup migration', () => {
  it('removes only document versions without a parent document', () => {
    const migration = readFileSync(
      'migrations/20260823_103700_remove_orphan_document_versions.ts',
      'utf8',
    )

    expect(migration).toContain('DELETE FROM "_documents_v" WHERE "parent_id" IS NULL')
    expect(migration).not.toContain('DELETE FROM "documents"')
  })
})
