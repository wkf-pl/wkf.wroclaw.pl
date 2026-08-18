import { RichText } from '@payloadcms/richtext-lexical/react'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'

import type { Event, EventCycle, ListingBlock, Page, Partner, Post, User } from '@/payload-types'
import { getCurrentUser } from '@/modules/auth/current-user'
import {
  findPublicContent,
  type TaxonomizableCollectionSlug,
} from '@/modules/content/content-listing'

import { CmsImage } from './CmsImage'
import { ContentList } from './ContentList'
import { ContentPagination, createPaginatedURL, getRequestedPage } from './ContentPagination'
import { MemberProfilesSection } from './MemberProfilesSection'
import { MediaBlockSection } from './MediaBlockSection'
import { TaxonomyLinks } from './TaxonomyLinks'

type CmsPageDocumentProperties = {
  document: Event | EventCycle | Page | Partner | Post
  pathname: string
  searchParams: Record<string, string | string[] | undefined>
  showBlogEyebrow?: boolean
  eyebrow?: string
  afterBlocks?: ReactNode
  beforeBlocks?: ReactNode
}

const dateFormatter = new Intl.DateTimeFormat('pl-PL', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export function CmsPageDocument({
  document,
  pathname,
  searchParams,
  showBlogEyebrow = false,
  eyebrow,
  afterBlocks,
  beforeBlocks,
}: CmsPageDocumentProperties) {
  const authorName = getAuthorName(document.author)
  const categories = 'categories' in document ? document.categories : undefined
  const tags = 'tags' in document ? document.tags : undefined
  const title = 'title' in document ? document.title : document.name
  return (
    <main className="contentShell">
      <article className="cmsDocument cmsPageDocument">
        <header className="cmsDocumentHeader">
          {showBlogEyebrow || eyebrow ? <p className="eyebrow">{eyebrow || 'Blog'}</p> : null}
          <h1>{title}</h1>
          <TaxonomyLinks categories={categories} tags={tags} />
          {document.publishedAt || authorName ? (
            <p className="contentMeta">
              {document.publishedAt ? (
                <time dateTime={document.publishedAt}>
                  {dateFormatter.format(new Date(document.publishedAt))}
                </time>
              ) : null}
              {document.publishedAt && authorName ? ' · ' : null}
              {authorName ? `Autor: ${authorName}` : null}
            </p>
          ) : null}
        </header>

        <CmsImage className="heroImage" media={document.heroImage} />

        {beforeBlocks}

        <div className="pageBlocks">
          {document.layout.map((block, index) => (
            <PageBlock
              block={block}
              blockIndex={index}
              key={block.id ?? `${block.blockType}-${index}`}
              document={document}
              pathname={pathname}
              searchParams={searchParams}
            />
          ))}
        </div>
        {afterBlocks}
      </article>
    </main>
  )
}

async function PageBlock({
  block,
  blockIndex,
  document,
  pathname,
  searchParams,
}: {
  block: Event['layout'][number] | Page['layout'][number] | Post['layout'][number]
  blockIndex: number
  document: Event | EventCycle | Page | Partner | Post
  pathname: string
  searchParams: Record<string, string | string[] | undefined>
}) {
  if (block.blockType === 'richText') {
    return <RichText className="richText" data={block.content} />
  }

  if (block.blockType === 'memberProfiles') {
    return <MemberProfilesSection block={block} />
  }

  if (block.blockType === 'mediaGallery' || block.blockType === 'attachments') {
    return (
      <MediaBlockSection
        block={block}
        blockIndex={blockIndex}
        pathname={pathname}
        searchParams={searchParams}
      />
    )
  }

  return (
    <Listing
      block={block}
      blockIndex={blockIndex}
      document={document}
      pathname={pathname}
      searchParams={searchParams}
    />
  )
}

async function Listing({
  block,
  blockIndex,
  document,
  pathname,
  searchParams,
}: {
  block: ListingBlock
  blockIndex: number
  document: Event | EventCycle | Page | Partner | Post
  pathname: string
  searchParams: Record<string, string | string[] | undefined>
}) {
  const parameterSuffix = (block.id ?? String(blockIndex + 1)).replace(/[^a-zA-Z0-9_-]/g, '')
  const parameterName = `listing_${parameterSuffix}`
  const requestedPage = block.pagination ? getRequestedPage(searchParams[parameterName]) : 1
  const parentId = getListingParentId(block, document)
  const result = await findPublicContent(
    {
      categoryId: getRelationshipId(block.category),
      eventCycleId:
        getRelationshipId(block.eventCycle) ??
        ('calendarFeedKey' in document ? document.id : undefined),
      eventTimeFilter: block.eventTimeFilter ?? 'all',
      page: requestedPage,
      pageSize: block.pageSize,
      pagination: Boolean(block.pagination),
      parentId,
      sort: block.sort,
      sources: block.sources as TaxonomizableCollectionSlug[],
      tagId: getRelationshipId(block.tag),
    },
    await getCurrentUser(),
  )

  if (block.pagination && requestedPage > result.totalPages) {
    redirect(createPaginatedURL(pathname, searchParams, parameterName, result.totalPages))
  }

  return (
    <section className="listingBlock">
      {block.heading ? <h2 className="listingBlockHeading">{block.heading}</h2> : null}
      <ContentList emptyMessage={block.emptyMessage} items={result.items} view={block.view} />
      {block.pagination ? (
        <ContentPagination
          currentPage={result.page}
          parameterName={parameterName}
          pathname={pathname}
          searchParams={searchParams}
          totalPages={result.totalPages}
        />
      ) : null}
    </section>
  )
}

function getListingParentId(
  block: ListingBlock,
  document: Pick<Event | EventCycle | Page | Partner | Post, 'id'>,
): number | undefined {
  if (block.parentFilter === 'current') {
    return document.id
  }

  return block.parentFilter === 'specific' ? getRelationshipId(block.parentPage) : undefined
}

function getRelationshipId(value: null | number | { id: number } | undefined): number | undefined {
  if (typeof value === 'number') {
    return value
  }

  return value && typeof value === 'object' ? value.id : undefined
}

function getAuthorName(author: null | number | User): null | string {
  return author && typeof author === 'object' ? author.displayName || null : null
}
