import Link from 'next/link'

import type { Topic, Tag } from '@/payload-types'

type TaxonomyLinksProperties = {
  topics?: (Topic | number)[] | null
  tags?: (number | Tag)[] | null
}

export function TaxonomyLinks({ topics, tags }: TaxonomyLinksProperties) {
  const populatedTopics = topics?.filter((topic): topic is Topic => typeof topic === 'object')
  const populatedTags = tags?.filter((tag): tag is Tag => typeof tag === 'object')

  if (!populatedTopics?.length && !populatedTags?.length) {
    return null
  }

  return (
    <div className="taxonomyLinks">
      {populatedTopics?.map((topic) => (
        <Link
          className="taxonomyLink taxonomyLink--category"
          key={`topic-${topic.id}`}
          href={`/topic/${topic.slug}`}
        >
          {topic.name}
        </Link>
      ))}
      {populatedTags?.map((tag) => (
        <Link
          className="taxonomyLink taxonomyLink--tag"
          href={`/tag/${tag.slug}`}
          key={`tag-${tag.id}`}
        >
          {tag.name}
        </Link>
      ))}
    </div>
  )
}
