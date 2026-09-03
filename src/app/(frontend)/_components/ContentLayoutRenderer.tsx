import type { CSSProperties } from 'react'

import { CmsRichText } from '@/components/CmsRichText'
import type {
  AttachmentsBlock,
  ColumnLayoutBlock,
  DocumentsBlock,
  Event,
  EventCycle,
  ListingBlock,
  MediaGalleryBlock,
  MemberProfilesBlock,
  Page,
  Partner,
  Post,
  RichTextBlock,
} from '@/payload-types'

import { DocumentBlockSection } from './DocumentBlockSection'
import { ListingBlockSection } from './ListingBlockSection'
import { MediaBlockSection } from './MediaBlockSection'
import { MemberProfilesSection } from './MemberProfilesSection'

type ContentDocument = Event | EventCycle | Page | Partner | Post
type ContentLeafBlock =
  | AttachmentsBlock
  | DocumentsBlock
  | ListingBlock
  | MediaGalleryBlock
  | MemberProfilesBlock
  | RichTextBlock
type ContentLayoutBlock = ColumnLayoutBlock | ContentLeafBlock

type ContentRendererProperties = {
  document: ContentDocument
  pathname: string
  searchParams: Record<string, string | string[] | undefined>
}

export async function ContentLayoutRenderer({
  document,
  pathname,
  searchParams,
}: ContentRendererProperties) {
  const layout = document.layout as ContentLayoutBlock[]

  return (
    <div className="pageBlocks">
      {layout.map((block, blockIndex) => {
        const blockPath = `layout.${blockIndex}`
        return block.blockType === 'columnLayout' ? (
          <ColumnLayoutRenderer
            block={block}
            document={document}
            key={block.id ?? blockPath}
            path={blockPath}
            pathname={pathname}
            searchParams={searchParams}
          />
        ) : (
          <ContentLeafBlockRenderer
            block={block}
            document={document}
            key={block.id ?? blockPath}
            path={blockPath}
            pathname={pathname}
            searchParams={searchParams}
          />
        )
      })}
    </div>
  )
}

async function ColumnLayoutRenderer({
  block,
  document,
  path,
  pathname,
  searchParams,
}: ContentRendererProperties & { block: ColumnLayoutBlock; path: string }) {
  const columns = block.columns ?? []
  if (!columns.some((column) => column.blocks?.length)) {
    return null
  }

  return (
    <section className={`columnLayout columnLayout--${columns.length}`}>
      <div className="columnLayoutGrid">
        {columns.map((column, columnIndex) => {
          const columnPath = `${path}.columns.${columnIndex}`
          const blocks = column.blocks ?? []
          const style = { '--column-width': column.width } as CSSProperties

          return (
            <div
              className={`columnLayoutColumn${blocks.length ? '' : ' columnLayoutColumn--empty'}`}
              data-column-width={column.width}
              key={column.id ?? columnPath}
              style={style}
            >
              {blocks.map((nestedBlock, nestedBlockIndex) => {
                const nestedBlockPath = `${columnPath}.blocks.${nestedBlockIndex}`
                return (
                  <ContentLeafBlockRenderer
                    block={nestedBlock}
                    document={document}
                    key={nestedBlock.id ?? nestedBlockPath}
                    path={nestedBlockPath}
                    pathname={pathname}
                    searchParams={searchParams}
                  />
                )
              })}
            </div>
          )
        })}
      </div>
    </section>
  )
}

export async function ContentLeafBlockRenderer({
  block,
  document,
  path,
  pathname,
  searchParams,
}: ContentRendererProperties & { block: ContentLeafBlock; path: string }) {
  switch (block.blockType) {
    case 'richText':
      return <CmsRichText className="richText" data={block.content} />
    case 'memberProfiles':
      return <MemberProfilesSection block={block} />
    case 'mediaGallery':
    case 'attachments':
      return (
        <MediaBlockSection
          block={block}
          blockPath={path}
          pathname={pathname}
          searchParams={searchParams}
        />
      )
    case 'documents':
      return (
        <DocumentBlockSection
          block={block}
          blockPath={path}
          pathname={pathname}
          searchParams={searchParams}
        />
      )
    case 'listing':
      return (
        <ListingBlockSection
          block={block}
          blockPath={path}
          document={document}
          pathname={pathname}
          searchParams={searchParams}
        />
      )
    default:
      return null
  }
}
