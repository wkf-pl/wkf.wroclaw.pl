import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { findTopicBySlug } from '@/modules/content/public-content'

import { TaxonomyContentPage } from '../../_components/TaxonomyContentPage'

type TopicPageProperties = {
  params: Promise<{ topic: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: TopicPageProperties): Promise<Metadata> {
  const { topic: slug } = await params
  const topic = await findTopicBySlug(slug)

  return topic
    ? {
        description: topic.description || `Treści w temacie ${topic.name}.`,
        title: topic.name,
      }
    : {}
}

export default async function TopicPage({ params, searchParams }: TopicPageProperties) {
  const { topic: slug } = await params
  const [topic, resolvedSearchParams] = await Promise.all([findTopicBySlug(slug), searchParams])

  if (!topic) {
    notFound()
  }

  return <TaxonomyContentPage kind="topic" searchParams={resolvedSearchParams} taxonomy={topic} />
}
