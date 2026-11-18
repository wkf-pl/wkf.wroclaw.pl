import type { BaseDatabaseAdapter } from 'payload'
import { expect, it, vi } from 'vitest'

it('reads a version from a retained adapter after the audit module reloads', async () => {
  const originalModule = await import('@/modules/content-audit/version-reference')
  const adapter = {
    createVersion: vi.fn().mockResolvedValue({ id: 152 }),
    createGlobalVersion: vi.fn(),
    updateVersion: vi.fn(),
    updateGlobalVersion: vi.fn(),
  } as unknown as BaseDatabaseAdapter

  originalModule.captureAuditVersions(adapter)
  const wrappedCreateVersion = adapter.createVersion

  vi.resetModules()
  const reloadedModule = await import('@/modules/content-audit/version-reference')
  expect(reloadedModule).not.toBe(originalModule)
  reloadedModule.captureAuditVersions(adapter)
  expect(adapter.createVersion).toBe(wrappedCreateVersion)

  const req = {}
  const now = new Date().toISOString()
  await adapter.createVersion({
    autosave: false,
    collectionSlug: 'pages',
    parent: 1,
    createdAt: now,
    updatedAt: now,
    req,
    versionData: {},
  })
  expect(reloadedModule.takeVersionReference(req, 'pages', '1')).toBe('152')
})
