import type { CSSProperties, ReactNode } from 'react'

import { CmsRichText } from '@/components/CmsRichText'
import {
  normalizeContentHeading,
  normalizeContentPresentation,
  type ContentHeadingData,
  type ContentPresentationData,
} from '@/modules/content/content-presentation'
import { getPublicSiteSettings } from '@/modules/content/public-content'
import { resolvePresentedLinks } from '@/modules/navigation/links'
import type {
  ActionLinksBlock,
  AttachmentsBlock,
  CardBlock,
  CarouselBlock,
  ColumnLayoutBlock,
  ContentCalendarBlock,
  DocumentsBlock,
  Event,
  EventCycle,
  HeadingBlock,
  HomepageSection,
  ListingBlock,
  MediaGalleryBlock,
  MemberProfilesBlock,
  Page,
  Partner,
  Post,
  RichTextBlock,
  SectionGroupBlock,
  TabbedContentBlock,
} from '@/payload-types'

import { ContentHeading, ContentPresentation } from './ContentPresentation'
import { CardBlockSection } from './CardBlockSection'
import { CarouselBlockSection } from './CarouselBlockSection'
import { ContentCalendarBlockSection } from './ContentCalendarBlockSection'
import { DocumentBlockSection } from './DocumentBlockSection'
import { ListingBlockSection } from './ListingBlockSection'
import { MediaBlockSection } from './MediaBlockSection'
import { MemberProfilesSection } from './MemberProfilesSection'
import { PresentedLink } from './PresentedLink'
import { TabbedContentFrame, type TabbedContentFrameTab } from './TabbedContentFrame'

type ContentDocument = Event | EventCycle | HomepageSection | Page | Partner | Post
type ContentLeafBlock =
  | ActionLinksBlock
  | AttachmentsBlock
  | CardBlock
  | CarouselBlock
  | ContentCalendarBlock
  | DocumentsBlock
  | HeadingBlock
  | ListingBlock
  | MediaGalleryBlock
  | MemberProfilesBlock
  | RichTextBlock
type PresentedContentLeafBlock = Exclude<
  ContentLeafBlock,
  ActionLinksBlock | CardBlock | HeadingBlock
>
type SectionContentBlock = ColumnLayoutBlock | ContentLeafBlock
type TabbedContentSectionBlock = ColumnLayoutBlock | ContentLeafBlock
type ContentLayoutBlock =
  ColumnLayoutBlock | SectionGroupBlock | TabbedContentBlock | ContentLeafBlock

type ContentRendererProperties = {
  document: ContentDocument
  pathname: string
  searchParams: Record<string, string | string[] | undefined>
}

type PositionedRendererProperties = ContentRendererProperties & {
  path: string
}

export async function ContentLayoutRenderer({
  document,
  pathname,
  searchParams,
}: ContentRendererProperties) {
  const layout = (document.layout ?? []) as ContentLayoutBlock[]

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
}: PositionedRendererProperties & { block: ContentLayoutBlock }) {
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

  if (block.blockType === 'tabs') {
    return (
      <TabbedContentRenderer
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

async function TabbedContentRenderer({
  block,
  document,
  path,
  pathname,
  searchParams,
}: PositionedRendererProperties & { block: TabbedContentBlock }) {
  const tabs = block.tabs ?? []
  if (!tabs.length) return null

  const configuredMenus = [
    ...(block.headerLeftItems ?? []),
    ...(block.headerRightItems ?? []),
    ...(block.footerItems ?? []),
  ]
  const siteSettings = configuredMenus.length ? await getPublicSiteSettings() : undefined
  const resolutionOptions = { siteContactEmail: siteSettings?.contactEmail }
  const headerLeftItems = resolvePresentedLinks(block.headerLeftItems ?? [], resolutionOptions)
  const headerRightItems = resolvePresentedLinks(block.headerRightItems ?? [], resolutionOptions)
  const footerItems = resolvePresentedLinks(block.footerItems ?? [], resolutionOptions)
  const renderedTabs: TabbedContentFrameTab[] = tabs.map((tab, tabIndex) => {
    const tabPath = `${path}.tabs.${tabIndex}`
    const blocks = (tab.blocks ?? []) as TabbedContentSectionBlock[]

    return {
      content: blocks.map((nestedBlock, nestedBlockIndex) => {
        const nestedPath = `${tabPath}.blocks.${nestedBlockIndex}`
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
            presentationPlacement="tab"
            searchParams={searchParams}
          />
        )
      }),
      id: tab.id ?? `tab-${tabIndex}`,
      label: tab.label,
    }
  })

  return (
    <TabbedContentFrame
      footer={renderTabbedContentMenu(footerItems)}
      footerAlignment={block.footerAlignment ?? 'center'}
      headerLeft={renderTabbedContentMenu(headerLeftItems)}
      headerRight={renderTabbedContentMenu(headerRightItems)}
      tabs={renderedTabs}
    />
  )
}

function renderTabbedContentMenu(items: ReturnType<typeof resolvePresentedLinks>): ReactNode {
  if (!items.length) return undefined

  return (
    <ul className="tabbedContentMenuList">
      {items.map((item, itemIndex) => (
        <li key={`${item.link.href}-${itemIndex}`}>
          <PresentedLink item={item} />
        </li>
      ))}
    </ul>
  )
}

async function SectionGroupRenderer({
  block,
  document,
  path,
  pathname,
  searchParams,
}: PositionedRendererProperties & { block: SectionGroupBlock }) {
  const sections = block.sections ?? []
  const presentation = normalizeContentPresentation(block as ContentPresentationData)
  if (!sections.length) {
    return null
  }

  return (
    <ContentPresentation
      className="sectionGroup"
      placement="sectionGroup"
      presentation={presentation}
    >
      <div className="sectionGroupSections">
        {sections.map((section, sectionIndex) => {
          const sectionPath = `${path}.sections.${sectionIndex}`
          const blocks = (section.blocks ?? []) as SectionContentBlock[]
          const sectionPresentation = normalizeContentPresentation(
            section as ContentPresentationData,
          )

          return (
            <ContentPresentation
              className="sectionGroupSection"
              key={section.id ?? sectionPath}
              placement="section"
              presentation={sectionPresentation}
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
            </ContentPresentation>
          )
        })}
      </div>
    </ContentPresentation>
  )
}

async function ColumnLayoutRenderer({
  block,
  document,
  path,
  pathname,
  searchParams,
}: PositionedRendererProperties & { block: ColumnLayoutBlock }) {
  const columns = block.columns ?? []
  const presentation = normalizeContentPresentation(block as ContentPresentationData)
  const hasColumnContent = columns.some((column) => Boolean(column.blocks?.length))
  if (!hasColumnContent) {
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
    <ContentPresentation className={classes} placement="layout" presentation={presentation}>
      <div className="columnLayoutGrid">
        {columns.map((column, columnIndex) => {
          const columnPath = `${path}.columns.${columnIndex}`
          const blocks = (column.blocks ?? []) as ContentLeafBlock[]
          const style = { '--column-width': column.width } as CSSProperties
          const columnPresentation = normalizeContentPresentation(column as ContentPresentationData)

          return (
            <ContentPresentation
              className={`columnLayoutColumn${blocks.length ? '' : ' columnLayoutColumn--empty'}`}
              columnWidth={column.width}
              key={column.id ?? columnPath}
              placement="column"
              presentation={columnPresentation}
              style={style}
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
            </ContentPresentation>
          )
        })}
      </div>
    </ContentPresentation>
  )
}

export async function ContentLeafBlockRenderer({
  block,
  document,
  path,
  pathname,
  presentationPlacement = 'block',
  searchParams,
}: ContentRendererProperties & {
  block: ContentLeafBlock
  path: string
  presentationPlacement?: 'block' | 'tab'
}) {
  if (block.blockType === 'heading') {
    return <ContentHeading heading={normalizeContentHeading(block as ContentHeadingData)} />
  }

  if (block.blockType === 'actionLinks') {
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

  if (block.blockType === 'card') {
    return <CardBlockSection block={block} />
  }

  const content = await renderPresentedLeafBlock({
    block,
    document,
    path,
    pathname,
    searchParams,
  })
  if (!content) {
    return null
  }

  return (
    <ContentPresentation
      placement={presentationPlacement}
      presentation={normalizeContentPresentation(block as ContentPresentationData)}
    >
      {content}
    </ContentPresentation>
  )
}

async function renderPresentedLeafBlock({
  block,
  document,
  path,
  pathname,
  searchParams,
}: ContentRendererProperties & {
  block: PresentedContentLeafBlock
  path: string
}): Promise<ReactNode> {
  switch (block.blockType) {
    case 'richText':
      return (
        <CmsRichText
          className={`richText richText--${block.textStyle ?? 'default'}`}
          data={block.content}
        />
      )
    case 'memberProfiles':
      return MemberProfilesSection({ block })
    case 'mediaGallery':
    case 'attachments':
      return MediaBlockSection({
        block,
        blockPath: path,
        pathname,
        searchParams,
      })
    case 'documents':
      return DocumentBlockSection({
        block,
        blockPath: path,
        pathname,
        searchParams,
      })
    case 'listing':
      return ListingBlockSection({
        block,
        blockPath: path,
        document,
        pathname,
        searchParams,
      })
    case 'carousel':
      return CarouselBlockSection({ block, document })
    case 'contentCalendar':
      return ContentCalendarBlockSection({ block })
  }
}
