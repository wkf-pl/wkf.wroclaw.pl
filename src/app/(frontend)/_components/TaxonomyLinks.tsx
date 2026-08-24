import Link from 'next/link'

import type { Category, Tag } from '@/payload-types'

type TaxonomyLinksProperties = {
  category?: Category | number | null
  tags?: (number | Tag)[] | null
}

export function TaxonomyLinks({ category, tags }: TaxonomyLinksProperties) {
  const populatedCategory = typeof category === 'object' ? category : null
  const populatedTags = tags?.filter((tag): tag is Tag => typeof tag === 'object')

  if (!populatedCategory && !populatedTags?.length) {
    return null
  }

  return (
    <div className="taxonomyLinks">
      {populatedCategory ? (
        <Link href={`/category/${populatedCategory.slug}`}>{populatedCategory.name}</Link>
      ) : null}
      {populatedTags?.map((tag) => (
        <Link href={`/tag/${tag.slug}`} key={`tag-${tag.id}`}>
          #{tag.name}
        </Link>
      ))}
    </div>
  )
}
