import { redirect } from 'next/navigation'

import type { AttachmentsBlock, Media, MediaGalleryBlock } from '@/payload-types'
import { getRelationshipId } from '@/lib/relationships'
import { findPublicMedia, type MediaListingKind } from '@/modules/media/media-listing'

import { AttachmentList } from './AttachmentList'
import { ContentPagination, createPaginatedURL, getRequestedPage } from './ContentPagination'
import { MediaGallery } from './MediaGallery'

type MediaBlockSectionProperties = {
  block: AttachmentsBlock | MediaGalleryBlock
  blockIndex: number
  pathname: string
  searchParams: Record<string, string | string[] | undefined>
}

export async function MediaBlockSection({
  block,
  blockIndex,
  pathname,
  searchParams,
}: MediaBlockSectionProperties) {
  const kind = block.blockType as MediaListingKind
  const parameterSuffix = (block.id ?? String(blockIndex + 1)).replace(/[^a-zA-Z0-9_-]/g, '')
  const parameterName = `${kind}_${parameterSuffix}`
  const requestedPage = block.pagination ? getRequestedPage(searchParams[parameterName]) : 1
  const result = await findPublicMedia({
    categoryId: getRelationshipId(block.category),
    kind,
    manualMedia: getManualMedia(block),
    page: requestedPage,
    pageSize: block.pageSize,
    pagination: Boolean(block.pagination),
    selectionMode: block.selectionMode,
    sort: block.sort ?? 'newest',
    tagId: getRelationshipId(block.tag),
  })

  if (block.pagination && requestedPage > result.totalPages) {
    redirect(createPaginatedURL(pathname, searchParams, parameterName, result.totalPages))
  }

  return (
    <section className={`mediaBlock mediaBlock-${kind}`}>
      {block.heading ? <h2 className="mediaBlockHeading">{block.heading}</h2> : null}
      {result.items.length ? (
        kind === 'mediaGallery' ? (
          <MediaGallery items={result.items} view={block.view} />
        ) : (
          <AttachmentList items={result.items} view={block.view} />
        )
      ) : (
        <p className="emptyState">{block.emptyMessage || getDefaultEmptyMessage(kind)}</p>
      )}
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

function getManualMedia(block: AttachmentsBlock | MediaGalleryBlock): (Media | number)[] {
  return block.items?.map((item) => item.media) ?? []
}

function getDefaultEmptyMessage(kind: MediaListingKind): string {
  return kind === 'mediaGallery' ? 'Galeria nie zawiera jeszcze obrazów.' : 'Nie ma załączników.'
}
