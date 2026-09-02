import { describe, expect, it } from 'vitest'

import { Pages } from '@/collections/Pages'
import { Posts } from '@/collections/Posts'
import { getSafePreviewExitPath, parseDraftPreviewTarget } from '@/modules/content/draft-preview'

async function generatePreviewURL(
  collection: typeof Pages | typeof Posts,
  document: Record<string, unknown>,
): Promise<null | string> {
  const preview = collection.admin?.preview

  if (!preview) {
    return null
  }

  return preview(document, {} as never)
}

describe('draft preview', () => {
  it('uses the save-before-preview button for pages and posts', () => {
    const previewButton = '/components/admin/DraftPreviewButton#DraftPreviewButton'

    expect(Pages.admin?.components?.edit?.PreviewButton).toBe(previewButton)
    expect(Posts.admin?.components?.edit?.PreviewButton).toBe(previewButton)
  })

  it('configures internal preview URLs for saved pages and posts', async () => {
    await expect(generatePreviewURL(Pages, { id: 1, slug: 'o-nas' })).resolves.toBe(
      '/preview?collection=pages&slug=o-nas',
    )
    await expect(generatePreviewURL(Posts, { id: 2, slug: 'nowy-wpis' })).resolves.toBe(
      '/preview?collection=posts&slug=nowy-wpis',
    )
  })

  it('does not offer preview without a saved document and a valid slug', async () => {
    await expect(generatePreviewURL(Pages, { slug: 'o-nas' })).resolves.toBeNull()
    await expect(generatePreviewURL(Pages, { id: 1, slug: '' })).resolves.toBeNull()
    await expect(generatePreviewURL(Posts, { id: 2 })).resolves.toBeNull()
  })

  it('derives preview paths only from supported collections and valid slugs', () => {
    expect(parseDraftPreviewTarget(new URLSearchParams('collection=pages&slug=blog'))).toEqual({
      collection: 'pages',
      path: '/blog',
      slug: 'blog',
    })
    expect(parseDraftPreviewTarget(new URLSearchParams('collection=posts&slug=nowy-wpis'))).toEqual(
      {
        collection: 'posts',
        path: '/blog/nowy-wpis',
        slug: 'nowy-wpis',
      },
    )
    expect(
      parseDraftPreviewTarget(new URLSearchParams('collection=users&slug=administrator')),
    ).toBeNull()
    expect(
      parseDraftPreviewTarget(new URLSearchParams('collection=pages&slug=../admin')),
    ).toBeNull()
  })

  it('accepts only local paths when leaving preview', () => {
    expect(getSafePreviewExitPath('/blog/nowy-wpis')).toBe('/blog/nowy-wpis')
    expect(getSafePreviewExitPath('//example.com')).toBe('/')
    expect(getSafePreviewExitPath('/\\example.com')).toBe('/')
    expect(getSafePreviewExitPath('https://example.com')).toBe('/')
  })
})
