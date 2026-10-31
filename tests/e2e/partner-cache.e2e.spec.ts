import { expect, test } from '@playwright/test'
import { getPayload, type Payload } from 'payload'

import config from '@/payload.config'
import type { Partner, User } from '@/payload-types'

import { editorTestUser } from '../helpers/seedUser'

const partnerSlug = `e2e-partner-cache-${Date.now()}`

let partner: Partner
let payload: Payload

test.beforeAll(async () => {
  payload = await getPayload({ config })
  const users = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { email: { equals: editorTestUser.email } },
  })
  const author = users.docs[0] as User | undefined
  if (!author) throw new Error('Missing E2E editor user.')

  partner = await payload.create({
    collection: 'partners',
    data: {
      _status: 'published',
      author: author.id,
      excerpt: 'Partner używany do sprawdzenia unieważniania cache.',
      layout: [createRichTextBlock('Treść partnera używana w teście cache.')],
      name: 'Partner przed aktualizacją cache',
      slug: partnerSlug,
    },
    draft: false,
    overrideAccess: true,
  })
})

test.afterAll(async () => {
  if (payload && partner) {
    await payload.delete({ collection: 'partners', id: partner.id, overrideAccess: true })
  }
})

test('invalidates the cached partner detail after a Payload update', async ({ page }) => {
  await page.goto(`/partners/${partnerSlug}`)
  await expect(
    page.getByRole('heading', { level: 1, name: 'Partner przed aktualizacją cache' }),
  ).toBeVisible()

  await updatePartnerName(page, 'Partner po aktualizacji cache')

  await page.goto(`/partners/${partnerSlug}`)
  await expect(
    page.getByRole('heading', { level: 1, name: 'Partner po aktualizacji cache' }),
  ).toBeVisible()
})

async function updatePartnerName(
  page: import('@playwright/test').Page,
  name: string,
): Promise<void> {
  const serverURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000'
  const loginResponse = await page.request.post(`${serverURL}/api/users/login`, {
    data: { email: editorTestUser.email, password: editorTestUser.password },
  })
  if (!loginResponse.ok()) {
    throw new Error(`E2E login failed: ${loginResponse.status()} ${await loginResponse.text()}`)
  }

  const loginData = (await loginResponse.json()) as { token?: string }
  if (!loginData.token) throw new Error('E2E login response did not include a JWT token.')

  const updateResponse = await page.request.patch(
    `${serverURL}/api/partners/${partner.id}?draft=false`,
    {
      data: { _status: 'published', name },
      headers: { Authorization: `JWT ${loginData.token}` },
    },
  )
  expect(updateResponse.ok(), await updateResponse.text()).toBe(true)
}

function createRichTextBlock(text: string) {
  return {
    blockType: 'richText' as const,
    content: {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text,
                type: 'text',
                version: 1,
              },
            ],
            direction: null,
            format: '' as const,
            indent: 0,
            textFormat: 0,
            textStyle: '',
            type: 'paragraph' as const,
            version: 1,
          },
        ],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        type: 'root' as const,
        version: 1,
      },
    },
  }
}
