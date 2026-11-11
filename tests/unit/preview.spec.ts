import { describe, expect, it } from 'vitest'

import { Pages } from '@/collections/Pages'
import { Posts } from '@/collections/Posts'
import { PageTemplates } from '@/collections/PageTemplates'
import {
  appendPageTemplatePreviewContext,
  createPageTemplateDraftPreviewURL,
  createGlobalDraftPreviewURL,
  getSafePreviewExitPath,
  shouldRenderPageTemplate,
  parseDraftPreviewTarget,
} from '@/modules/content/draft-preview'

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
  it('uses the save-before-preview button for page templates, pages, and posts', () => {
    const previewButton = '/components/admin/DraftPreviewButton#DraftPreviewButton'

    expect(Pages.admin?.components?.edit?.PreviewButton).toBe(previewButton)
    expect(Posts.admin?.components?.edit?.PreviewButton).toBe(previewButton)
    expect(PageTemplates.admin?.components?.edit?.PreviewButton).toBe(previewButton)
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

  it('derives homepage preview paths only from supported globals', () => {
    expect(createGlobalDraftPreviewURL('navigation')).toBe('/preview?global=navigation')
    expect(parseDraftPreviewTarget(new URLSearchParams('global=homepage-hero'))).toEqual({
      global: 'homepage-hero',
      path: '/',
    })
    expect(parseDraftPreviewTarget(new URLSearchParams('global=users'))).toBeNull()
    expect(
      parseDraftPreviewTarget(new URLSearchParams('global=navigation&collection=pages&slug=o-nas')),
    ).toBeNull()
  })

  it('recognizes fixed page template targets and enables preview for implemented renderers', () => {
    expect(parseDraftPreviewTarget(new URLSearchParams('pageTemplate=event-detail'))).toEqual({
      pageTemplate: 'event-detail',
    })
    expect(parseDraftPreviewTarget(new URLSearchParams('pageTemplate=unknown'))).toBeNull()
    expect(
      parseDraftPreviewTarget(
        new URLSearchParams('pageTemplate=event-detail&collection=events&slug=test'),
      ),
    ).toBeNull()
    expect(createPageTemplateDraftPreviewURL('event-detail')).toBe(
      '/preview?pageTemplate=event-detail',
    )
    expect(createPageTemplateDraftPreviewURL('events-index')).toBe(
      '/preview?pageTemplate=events-index',
    )
    expect(createPageTemplateDraftPreviewURL('blog-index')).toBe('/preview?pageTemplate=blog-index')
    expect(createPageTemplateDraftPreviewURL('members-index')).toBe(
      '/preview?pageTemplate=members-index',
    )
    expect(createPageTemplateDraftPreviewURL('unknown')).toBeNull()
  })

  it('previews a draft template independently from its public rendering mode', () => {
    const previewSearchParameters = {
      pageTemplatePreview: 'event-detail',
    }

    expect(appendPageTemplatePreviewContext('/events/test', 'event-detail')).toBe(
      '/events/test?pageTemplatePreview=event-detail',
    )
    expect(
      shouldRenderPageTemplate({
        isDraftPreview: true,
        renderingMode: 'legacy',
        searchParams: previewSearchParameters,
        templateKey: 'event-detail',
      }),
    ).toBe(true)
    expect(
      shouldRenderPageTemplate({
        isDraftPreview: true,
        renderingMode: 'template',
        searchParams: {},
        templateKey: 'event-detail',
      }),
    ).toBe(false)
    expect(
      shouldRenderPageTemplate({
        isDraftPreview: false,
        renderingMode: 'template',
        searchParams: {},
        templateKey: 'event-detail',
      }),
    ).toBe(true)
    expect(
      shouldRenderPageTemplate({
        isDraftPreview: false,
        renderingMode: 'legacy',
        searchParams: previewSearchParameters,
        templateKey: 'event-detail',
      }),
    ).toBe(false)
  })

  it('accepts only local paths when leaving preview', () => {
    expect(getSafePreviewExitPath('/blog/nowy-wpis')).toBe('/blog/nowy-wpis')
    expect(getSafePreviewExitPath('//example.com')).toBe('/')
    expect(getSafePreviewExitPath('/\\example.com')).toBe('/')
    expect(getSafePreviewExitPath('https://example.com')).toBe('/')
  })
})
