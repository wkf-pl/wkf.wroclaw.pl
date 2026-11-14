import { expect, test } from '@playwright/test'
import { getPayload } from 'payload'

import config from '../../src/payload.config.js'

import { login } from '../helpers/login'
import { editorTestUser } from '../helpers/seedUser'

test('shows a user group in the single author selector and lists its assigned post', async ({
  page,
}) => {
  const payload = await getPayload({ config })
  const {
    docs: [editor],
  } = await payload.find({
    collection: 'users',
    where: { email: { equals: editorTestUser.email } },
  })
  const group = await payload.create({
    collection: 'user-groups',
    data: { name: 'Planszówki E2E', members: [editor.id] },
  })
  await login({ page, user: editorTestUser })
  let postId: number | undefined

  try {
    await page.goto('/admin/collections/posts/create')
    const author = page.locator('#field-author')
    await expect(author.getByText(editorTestUser.displayName)).toBeVisible()
    const selector = author.getByRole('combobox')
    await selector.fill('Planszówki E2E')
    await page.getByRole('option', { name: 'Planszówki E2E', exact: true }).click()
    await expect(author.getByText('Planszówki E2E', { exact: true })).toBeVisible()

    const createdPost = await page.request.post('/api/posts?draft=true', {
      headers: { 'Sec-Fetch-Site': 'same-origin' },
      data: {
        title: 'Wpis planszówkowy E2E',
        author: { relationTo: 'user-groups', value: group.id },
      },
    })
    await expect(createdPost).toBeOK()
    const { doc } = (await createdPost.json()) as { doc: { id: number } }
    postId = doc.id

    await page.goto(`/admin/collections/user-groups/${group.id}`)
    await expect(page.getByRole('link', { name: 'Wpis planszówkowy E2E' })).toHaveAttribute(
      'href',
      `/admin/collections/posts/${postId}`,
    )
  } finally {
    if (postId) await payload.delete({ collection: 'posts', id: postId, trash: true })
    await payload.delete({ collection: 'user-groups', id: group.id })
  }
})
