import { redirect } from 'next/navigation'

import type { AttachmentsBlock, Media, MediaGalleryBlock } from '@/payload-types'
import { getRelationshipId } from '@/lib/relationships'
import { createPaginatedURL, resolveBlockPagination } from '@/modules/content/pagination'
import { findPublicMedia, type MediaListingKind } from '@/modules/media/media-listing'

import { AttachmentList } from './AttachmentList'
import { ContentPagination } from './ContentPagination'
import { MediaGallery } from './MediaGallery'

type MediaBlockSectionProperties = {
  block: AttachmentsBlock | MediaGalleryBlock
  blockPath: string
  pathname: string
  searchParams: Record<string, string | string[] | undefined>
}

export async function MediaBlockSection({
  block,
  blockPath,
  pathname,
  searchParams,
}: MediaBlockSectionProperties) {
  const kind = block.blockType as MediaListingKind
  const { parameterName, requestedPage } = resolveBlockPagination({
    blockId: block.id,
    blockPath,
    enabled: Boolean(block.pagination),
    parameterPrefix: kind,
    searchParams,
  })
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
    <div className={`mediaBlock mediaBlock-${kind}`}>
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
    </div>
  )
}

function getManualMedia(block: AttachmentsBlock | MediaGalleryBlock): (Media | number)[] {
  return block.items?.map((item) => item.media) ?? []
}

function getDefaultEmptyMessage(kind: MediaListingKind): string {
  return kind === 'mediaGallery' ? 'Galeria nie zawiera jeszcze obrazów.' : 'Nie ma załączników.'
}
