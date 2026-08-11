import Link from 'next/link'

import type { Category, Tag } from '@/payload-types'

type TaxonomyLinksProperties = {
  categories?: (Category | number)[] | null
  tags?: (number | Tag)[] | null
}

export function TaxonomyLinks({ categories, tags }: TaxonomyLinksProperties) {
  const populatedCategories = categories?.filter(
    (category): category is Category => typeof category === 'object',
  )
  const populatedTags = tags?.filter((tag): tag is Tag => typeof tag === 'object')

  if (!populatedCategories?.length && !populatedTags?.length) {
    return null
  }

  return (
    <div className="taxonomyLinks">
      {populatedCategories?.map((category) => (
        <Link href={`/category/${category.slug}`} key={`category-${category.id}`}>
          {category.name}
        </Link>
      ))}
      {populatedTags?.map((tag) => (
        <Link href={`/tag/${tag.slug}`} key={`tag-${tag.id}`}>
          #{tag.name}
        </Link>
      ))}
    </div>
  )
}
