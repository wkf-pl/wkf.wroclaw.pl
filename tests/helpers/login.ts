import type { Page } from '@playwright/test'

export interface LoginOptions {
  page: Page
  serverURL?: string
  user: {
    email: string
    password: string
  }
}

/** Authenticates through the API and opens the admin panel. */
export async function login({
  page,
  serverURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000',
  user,
}: LoginOptions): Promise<void> {
  const response = await page.request.post(`${serverURL}/api/users/login`, {
    data: {
      email: user.email,
      password: user.password,
    },
  })

  if (!response.ok()) {
    throw new Error(`E2E login failed with status ${response.status()}: ${await response.text()}`)
  }

  await page.goto(`${serverURL}/admin`)
}
