import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { findPublicContent } from '@/modules/content/content-listing'
import { createPageBreadcrumbs } from '@/modules/content/public-hierarchy'
import type { Category, Page } from '@/payload-types'

import {
  createContentTaxonomyFixture,
  type ContentTaxonomyFixture,
} from '../helpers/content-taxonomy-fixture'
import { createLexicalDocument } from '../helpers/lexical-document'

let fixture: ContentTaxonomyFixture

beforeAll(async () => {
  fixture = await createContentTaxonomyFixture('hierarchy')
}, 20_000)

afterAll(async () => {
  await fixture?.cleanup()
})

describe('content hierarchy', () => {
  it('rejects a cycle in persisted page parents', async () => {
    await expect(
      fixture.payload.update({
        collection: 'pages',
        data: { parent: fixture.childPage.id },
        id: fixture.page.id,
        overrideAccess: true,
      }),
    ).rejects.toMatchObject({ status: 400 })
  })

  it('aggregates category descendants, excludes siblings and intersects the subtree with a tag', async () => {
    const categorySlugs = {
      child: 'integration-hierarchy-category-child',
      grandchild: 'integration-hierarchy-category-grandchild',
      root: 'integration-hierarchy-category-root',
      sibling: 'integration-hierarchy-category-sibling',
    }
    const postSlugs = [
      'integration-hierarchy-grandchild-tagged',
      'integration-hierarchy-grandchild-untagged',
      'integration-hierarchy-sibling-tagged',
    ]
    const createdCategories: Category[] = []

    await fixture.payload.delete({
      collection: 'posts',
      overrideAccess: true,
      where: { slug: { in: postSlugs } },
    })
    await deleteCategoriesBySlugs(Object.values(categorySlugs))

    try {
      const root = await fixture.payload.create({
        collection: 'categories',
        data: { name: 'Integration category root', slug: categorySlugs.root },
        overrideAccess: true,
      })
      createdCategories.push(root)
      const child = await fixture.payload.create({
        collection: 'categories',
        data: { name: 'Integration category child', parent: root.id, slug: categorySlugs.child },
        overrideAccess: true,
      })
      createdCategories.push(child)
      const grandchild = await fixture.payload.create({
        collection: 'categories',
        data: {
          name: 'Integration category grandchild',
          parent: child.id,
          slug: categorySlugs.grandchild,
        },
        overrideAccess: true,
      })
      createdCategories.push(grandchild)
      const sibling = await fixture.payload.create({
        collection: 'categories',
        data: {
          name: 'Integration category sibling',
          parent: root.id,
          slug: categorySlugs.sibling,
        },
        overrideAccess: true,
      })
      createdCategories.push(sibling)

      const createPost = (title: string, slug: string, categoryId: number, tags?: number[]) =>
        fixture.payload.create({
          collection: 'posts',
          data: {
            _status: 'published',
            author: fixture.author.id,
            category: categoryId,
            excerpt: title,
            layout: [{ blockType: 'richText', content: createLexicalDocument(title) }],
            publishedAt: '2026-08-20T12:00:00.000Z',
            slug,
            tags,
            title,
          },
          overrideAccess: true,
        })
      const [taggedGrandchildPost, untaggedGrandchildPost] = await Promise.all([
        createPost('Tagged grandchild post', postSlugs[0], grandchild.id, [fixture.tag.id]),
        createPost('Untagged grandchild post', postSlugs[1], grandchild.id),
        createPost('Tagged sibling post', postSlugs[2], sibling.id, [fixture.tag.id]),
      ])

      const subtree = await findPublicContent({
        categoryId: child.id,
        page: 1,
        pageSize: 12,
        pagination: true,
        sort: 'titleAscending',
        sources: ['posts'],
      })
      const taggedSubtree = await findPublicContent({
        categoryId: child.id,
        page: 1,
        pageSize: 12,
        pagination: true,
        sort: 'titleAscending',
        sources: ['posts'],
        tagId: fixture.tag.id,
      })

      expect(subtree.items.map((item) => item.document.id)).toEqual(
        expect.arrayContaining([taggedGrandchildPost.id, untaggedGrandchildPost.id]),
      )
      expect(subtree.items).toHaveLength(2)
      expect(taggedSubtree.items.map((item) => item.document.id)).toEqual([taggedGrandchildPost.id])

      const populatedGrandchild = await fixture.payload.findByID({
        collection: 'categories',
        depth: 0,
        id: grandchild.id,
        joins: { relatedPosts: { limit: 10 } },
        overrideAccess: true,
      })
      expect(populatedGrandchild.fullTitle).toBe(
        'Integration category root › Integration category child › Integration category grandchild',
      )
      expect(populatedGrandchild.breadcrumbs?.map((breadcrumb) => breadcrumb.label)).toEqual([
        'Integration category root',
        'Integration category child',
        'Integration category grandchild',
      ])
      expect(populatedGrandchild.relatedPosts?.docs).toHaveLength(2)
      await expect(
        fixture.payload.delete({ collection: 'categories', id: child.id, overrideAccess: true }),
      ).rejects.toMatchObject({ status: 400 })
    } finally {
      await fixture.payload.delete({
        collection: 'posts',
        overrideAccess: true,
        where: { slug: { in: postSlugs } },
      })
      for (const createdCategory of createdCategories.reverse()) {
        await fixture.payload.delete({
          collection: 'categories',
          id: createdCategory.id,
          overrideAccess: true,
        })
      }
    }
  }, 20_000)

  it('updates descendant page paths and keeps unpublished ancestors as breadcrumb text', async () => {
    await fixture.payload.update({
      collection: 'pages',
      data: { title: 'Renamed integration taxonomy page' },
      id: fixture.page.id,
      overrideAccess: true,
    })
    const updatedChild = await fixture.payload.findByID({
      collection: 'pages',
      depth: 0,
      id: fixture.childPage.id,
      overrideAccess: true,
    })
    expect(updatedChild.fullTitle).toBe(
      'Renamed integration taxonomy page › Integration child page',
    )
    expect(updatedChild.breadcrumbs?.map((breadcrumb) => breadcrumb.label)).toEqual([
      'Renamed integration taxonomy page',
      'Integration child page',
    ])

    await fixture.payload.update({
      collection: 'pages',
      data: { title: fixture.page.title },
      id: fixture.page.id,
      overrideAccess: true,
    })

    const publishedAncestorSlug = 'integration-hierarchy-published-ancestor'
    const draftParentSlug = 'integration-hierarchy-unpublished-parent'
    const publicChildSlug = 'integration-hierarchy-public-child'
    await fixture.payload.delete({
      collection: 'pages',
      overrideAccess: true,
      where: { slug: { in: [publishedAncestorSlug, draftParentSlug, publicChildSlug] } },
    })
    let publishedAncestor: Page | undefined
    let draftParent: Page | undefined
    let publicChild: Page | undefined
    try {
      publishedAncestor = await fixture.payload.create({
        collection: 'pages',
        data: {
          _status: 'published',
          author: fixture.author.id,
          layout: [{ blockType: 'richText', content: createLexicalDocument('Published ancestor') }],
          slug: publishedAncestorSlug,
          title: 'Published ancestor',
        },
        draft: false,
        overrideAccess: true,
      })
      draftParent = await fixture.payload.create({
        collection: 'pages',
        data: {
          _status: 'draft',
          author: fixture.author.id,
          parent: publishedAncestor.id,
          slug: draftParentSlug,
          title: 'Unpublished ancestor',
        },
        draft: true,
        overrideAccess: true,
      })
      publicChild = await fixture.payload.create({
        collection: 'pages',
        data: {
          _status: 'published',
          author: fixture.author.id,
          layout: [
            { blockType: 'richText', content: createLexicalDocument('Published descendant') },
          ],
          parent: draftParent.id,
          slug: publicChildSlug,
          title: 'Published descendant',
        },
        draft: false,
        overrideAccess: true,
      })

      expect(await createPageBreadcrumbs(publicChild)).toEqual([
        { label: 'Strona główna', url: '/' },
        { label: 'Published ancestor', url: `/${publishedAncestorSlug}` },
        { label: 'Unpublished ancestor', url: null },
        { label: 'Published descendant', url: null },
      ])
    } finally {
      if (publicChild) {
        await fixture.payload.delete({
          collection: 'pages',
          id: publicChild.id,
          overrideAccess: true,
        })
      }
      if (draftParent) {
        await fixture.payload.delete({
          collection: 'pages',
          id: draftParent.id,
          overrideAccess: true,
        })
      }
      if (publishedAncestor) {
        await fixture.payload.delete({
          collection: 'pages',
          id: publishedAncestor.id,
          overrideAccess: true,
        })
      }
    }
  }, 20_000)
})

async function deleteCategoriesBySlugs(slugs: string[]): Promise<void> {
  const categories = await fixture.payload.find({
    collection: 'categories',
    depth: 0,
    limit: 100,
    overrideAccess: true,
    pagination: false,
    where: { slug: { in: slugs } },
  })
  const deepestCategoriesFirst = categories.docs.sort(
    (first, second) => (second.breadcrumbs?.length ?? 0) - (first.breadcrumbs?.length ?? 0),
  )
  for (const existingCategory of deepestCategoriesFirst) {
    await fixture.payload.delete({
      collection: 'categories',
      id: existingCategory.id,
      overrideAccess: true,
    })
  }
}
