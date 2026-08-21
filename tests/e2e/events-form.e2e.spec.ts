import { expect, test } from '@playwright/test'

test('serves the public event index', async ({ request }) => {
  const response = await request.get('/events')

  expect(response.status()).toBe(200)
  await expect(response.text()).resolves.toContain('Wydarzenia')
})
