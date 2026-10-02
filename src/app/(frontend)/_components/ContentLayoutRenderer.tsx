import type { CSSProperties } from 'react'

import { CmsRichText } from '@/components/CmsRichText'
import { RasterIcon } from '@/components/RasterIcon'
import { getPublicSiteSettings } from '@/modules/content/public-content'
import { normalizeContentSurface } from '@/modules/content/content-surface'
import { isSelectableRasterIconName } from '@/modules/icons/icon-registry'
import { resolvePresentedLinks } from '@/modules/navigation/links'
import type {
  ActionLinksBlock,
  AttachmentsBlock,
  ColumnLayoutBlock,
  DocumentsBlock,
  Event,
  EventCycle,
  HeadingBlock,
  ListingBlock,
  MediaGalleryBlock,
  MemberProfilesBlock,
  Page,
  Partner,
  Post,
  RichTextBlock,
  SectionGroupBlock,
} from '@/payload-types'

import { ContentSurface } from './ContentSurface'
import { DocumentBlockSection } from './DocumentBlockSection'
import { ListingBlockSection } from './ListingBlockSection'
import { MediaBlockSection } from './MediaBlockSection'
import { MemberProfilesSection } from './MemberProfilesSection'
import { PresentedLink } from './PresentedLink'

type ContentDocument = Event | EventCycle | Page | Partner | Post
type ContentLeafBlock =
  | ActionLinksBlock
  | AttachmentsBlock
  | DocumentsBlock
  | HeadingBlock
  | ListingBlock
  | MediaGalleryBlock
  | MemberProfilesBlock
  | RichTextBlock
type SectionContentBlock = ColumnLayoutBlock | ContentLeafBlock
type ContentLayoutBlock = ColumnLayoutBlock | SectionGroupBlock | ContentLeafBlock

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
      {layout.map((block, blockIndex) => (
        <ContentBlockRenderer
          block={block}
          document={document}
          key={block.id ?? `layout.${blockIndex}`}
          path={`layout.${blockIndex}`}
          pathname={pathname}
          searchParams={searchParams}
        />
      ))}
    </div>
  )
}

async function ContentBlockRenderer({
  block,
  document,
  path,
  pathname,
  searchParams,
}: ContentRendererProperties & { block: ContentLayoutBlock; path: string }) {
  if (block.blockType === 'sectionGroup') {
    return (
      <SectionGroupRenderer
        block={block}
        document={document}
        path={path}
        pathname={pathname}
        searchParams={searchParams}
      />
    )
  }

  if (block.blockType === 'columnLayout') {
    return (
      <ColumnLayoutRenderer
        block={block}
        document={document}
        path={path}
        pathname={pathname}
        searchParams={searchParams}
      />
    )
  }

  return (
    <ContentLeafBlockRenderer
      block={block}
      document={document}
      path={path}
      pathname={pathname}
      searchParams={searchParams}
    />
  )
}

async function SectionGroupRenderer({
  block,
  document,
  path,
  pathname,
  searchParams,
}: ContentRendererProperties & { block: SectionGroupBlock; path: string }) {
  const sections = block.sections ?? []
  if (!sections.length) {
    return null
  }

  return (
    <div className={`sectionGroup sectionGroup--${block.frame ?? 'outline'}`}>
      {sections.map((section, sectionIndex) => {
        const sectionPath = `${path}.sections.${sectionIndex}`
        const blocks = (section.blocks ?? []) as SectionContentBlock[]

        return (
          <ContentSurface
            as="section"
            className="sectionGroupSection"
            key={section.id ?? sectionPath}
            surface={normalizeContentSurface(section)}
          >
            {blocks.map((nestedBlock, nestedBlockIndex) => {
              const nestedPath = `${sectionPath}.blocks.${nestedBlockIndex}`
              return nestedBlock.blockType === 'columnLayout' ? (
                <ColumnLayoutRenderer
                  block={nestedBlock}
                  document={document}
                  key={nestedBlock.id ?? nestedPath}
                  path={nestedPath}
                  pathname={pathname}
                  searchParams={searchParams}
                />
              ) : (
                <ContentLeafBlockRenderer
                  block={nestedBlock}
                  document={document}
                  key={nestedBlock.id ?? nestedPath}
                  path={nestedPath}
                  pathname={pathname}
                  searchParams={searchParams}
                />
              )
            })}
          </ContentSurface>
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

  const classes = [
    'columnLayout',
    `columnLayout--${columns.length}`,
    `columnLayout--align-${block.verticalAlignment ?? 'start'}`,
    block.columnSeparators === 'between' ? 'columnLayout--withSeparators' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section className={classes}>
      <div className="columnLayoutGrid">
        {columns.map((column, columnIndex) => {
          const columnPath = `${path}.columns.${columnIndex}`
          const blocks = (column.blocks ?? []) as ContentLeafBlock[]
          const style = { '--column-width': column.width } as CSSProperties

          return (
            <ContentSurface
              className={`columnLayoutColumn${blocks.length ? '' : ' columnLayoutColumn--empty'}`}
              columnWidth={column.width}
              key={column.id ?? columnPath}
              style={style}
              surface={normalizeContentSurface(column)}
            >
              <div className="columnLayoutColumnContent">
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
            </ContentSurface>
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
      return (
        <CmsRichText
          className={`richText richText--${block.textStyle ?? 'default'}`}
          data={block.content}
        />
      )
    case 'heading': {
      const HeadingElement = block.role === 'item' ? 'h3' : 'h2'
      const iconName = isSelectableRasterIconName(block.iconName) ? block.iconName : undefined
      return (
        <HeadingElement className={`contentHeading contentHeading--${block.role ?? 'section'}`}>
          {iconName ? (
            <span aria-hidden="true" className="contentHeadingIcon">
              <RasterIcon name={iconName} size="medium" />
            </span>
          ) : null}
          <span>{block.text}</span>
        </HeadingElement>
      )
    }
    case 'actionLinks': {
      const siteSettings = await getPublicSiteSettings()
      const items = resolvePresentedLinks(block.items ?? [], {
        siteContactEmail: siteSettings.contactEmail,
      })
      if (!items.length) {
        return null
      }

      return (
        <ul
          className={`actionLinks actionLinks--${block.layout ?? 'inline'} actionLinks--align-${block.alignment ?? 'start'}`}
        >
          {items.map((item, itemIndex) => (
            <li key={`${item.link.href}-${itemIndex}`}>
              <PresentedLink item={item} />
            </li>
          ))}
        </ul>
      )
    }
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
