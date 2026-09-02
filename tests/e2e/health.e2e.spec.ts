import { expect, test } from '@playwright/test'

test('exposes readiness and liveness endpoints', async ({ request }) => {
  const readinessResponse = await request.get('/api/health')

  expect(readinessResponse.ok()).toBe(true)
  expect(readinessResponse.headers()['cache-control']).toBe('no-store')
  await expect(readinessResponse.json()).resolves.toEqual({ status: 'ok' })

  const livenessResponse = await request.get('/api/health/live')

  expect(livenessResponse.ok()).toBe(true)
  expect(livenessResponse.headers()['cache-control']).toBe('no-store')
  await expect(livenessResponse.json()).resolves.toEqual({ status: 'live' })
})
