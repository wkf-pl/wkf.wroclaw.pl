import { Fragment, type CSSProperties, type ReactNode } from 'react'

import { CmsRichText } from '@/components/CmsRichText'
import {
  normalizeContentHeading,
  normalizeContentPresentation,
  type ContentHeadingData,
  type ContentPresentationData,
} from '@/modules/content/content-presentation'
import { getPublicSiteSettings } from '@/modules/content/public-content'
import {
  isSectionGroupEmptyAwareBlockType,
  shouldHideSectionGroup,
} from '@/modules/content/section-group-visibility'
import { resolvePresentedLinks } from '@/modules/navigation/links'
import type {
  ActionLinksBlock,
  AttachmentsBlock,
  CardBlock,
  ColumnLayoutBlock,
  ContentCalendarBlock,
  Event,
  EventCycle,
  HeadingBlock,
  HomepageSection,
  ListingBlock,
  MediaGalleryBlock,
  Page,
  Partner,
  Post,
  RichTextBlock,
  SectionGroupBlock,
  TabbedContentBlock,
} from '@/payload-types'

import { ContentHeading, ContentPresentation } from './ContentPresentation'
import { CardBlockSection } from './CardBlockSection'
import { ContentCalendarBlockSection } from './ContentCalendarBlockSection'
import { resolveListingBlockSection } from './ListingBlockSection'
import { resolveMediaBlockSection } from './MediaBlockSection'
import { PresentedLink } from './PresentedLink'
import { TabbedContentFrame, type TabbedContentFrameTab } from './TabbedContentFrame'

type ContentDocument = Event | EventCycle | HomepageSection | Page | Partner | Post
type ContentLeafBlock =
  | ActionLinksBlock
  | AttachmentsBlock
  | CardBlock
  | ContentCalendarBlock
  | HeadingBlock
  | ListingBlock
  | MediaGalleryBlock
  | RichTextBlock
type PresentedContentLeafBlock = Exclude<
  ContentLeafBlock,
  ActionLinksBlock | CardBlock | HeadingBlock
>
type SectionContentBlock = ColumnLayoutBlock | TabbedContentBlock | ContentLeafBlock
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

type ContentBlockResolution = {
  content: ReactNode
  hasEmptyFilterBlock: boolean
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
  const renderedTabs: TabbedContentFrameTab[] = await Promise.all(
    tabs.map(async (tab, tabIndex) => {
      const tabPath = `${path}.tabs.${tabIndex}`
      const blocks = (tab.blocks ?? []) as TabbedContentSectionBlock[]
      const resolvedBlocks = await Promise.all(
        blocks.map((nestedBlock, nestedBlockIndex) => {
          const nestedPath = `${tabPath}.blocks.${nestedBlockIndex}`
          return nestedBlock.blockType === 'columnLayout'
            ? resolveColumnLayout({
                block: nestedBlock,
                document,
                path: nestedPath,
                pathname,
                searchParams,
              })
            : resolveContentLeafBlock({
                block: nestedBlock,
                document,
                path: nestedPath,
                pathname,
                presentationPlacement: 'tab',
                searchParams,
              })
        }),
      )

      return {
        content: resolvedBlocks.map(({ content }, nestedBlockIndex) => (
          <Fragment key={blocks[nestedBlockIndex]?.id ?? `${tabPath}.blocks.${nestedBlockIndex}`}>
            {content}
          </Fragment>
        )),
        id: tab.id ?? `tab-${tabIndex}`,
        label: tab.label,
      }
    }),
  )

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

export async function SectionGroupRenderer({
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

  const resolvedSections = await Promise.all(
    sections.map(async (section, sectionIndex) => {
      const sectionPath = `${path}.sections.${sectionIndex}`
      const blocks = (section.blocks ?? []) as SectionContentBlock[]
      const resolvedBlocks = await Promise.all(
        blocks.map(async (nestedBlock, nestedBlockIndex) => {
          const nestedPath = `${sectionPath}.blocks.${nestedBlockIndex}`
          if (nestedBlock.blockType === 'columnLayout') {
            return resolveColumnLayout({
              block: nestedBlock,
              document,
              path: nestedPath,
              pathname,
              searchParams,
            })
          }

          if (nestedBlock.blockType === 'tabs') {
            return {
              content: await TabbedContentRenderer({
                block: nestedBlock,
                document,
                path: nestedPath,
                pathname,
                searchParams,
              }),
              hasEmptyFilterBlock: false,
            }
          }

          return resolveContentLeafBlock({
            block: nestedBlock,
            document,
            path: nestedPath,
            pathname,
            searchParams,
          })
        }),
      )

      return { section, sectionPath, resolvedBlocks }
    }),
  )

  const emptyFilterBlocks = resolvedSections.flatMap(({ resolvedBlocks }) =>
    resolvedBlocks.map(({ hasEmptyFilterBlock }) => hasEmptyFilterBlock),
  )
  if (shouldHideSectionGroup(block.emptyChildBehavior, emptyFilterBlocks)) {
    return null
  }

  return (
    <ContentPresentation
      className="sectionGroup"
      placement="sectionGroup"
      presentation={presentation}
    >
      <div className="sectionGroupSections">
        {resolvedSections.map(({ resolvedBlocks, section, sectionPath }) => {
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
              {resolvedBlocks.map(({ content }, nestedBlockIndex) => (
                <Fragment key={`${sectionPath}.blocks.${nestedBlockIndex}`}>{content}</Fragment>
              ))}
            </ContentPresentation>
          )
        })}
      </div>
    </ContentPresentation>
  )
}

async function ColumnLayoutRenderer({
  ...properties
}: PositionedRendererProperties & { block: ColumnLayoutBlock }) {
  return (await resolveColumnLayout(properties)).content
}

async function resolveColumnLayout({
  block,
  document,
  path,
  pathname,
  searchParams,
}: PositionedRendererProperties & { block: ColumnLayoutBlock }): Promise<ContentBlockResolution> {
  const columns = block.columns ?? []
  const presentation = normalizeContentPresentation(block as ContentPresentationData)
  const hasColumnContent = columns.some((column) => Boolean(column.blocks?.length))
  if (!hasColumnContent) {
    return { content: null, hasEmptyFilterBlock: false }
  }
  const classes = [
    'columnLayout',
    `columnLayout--${columns.length}`,
    `columnLayout--align-${block.verticalAlignment ?? 'start'}`,
    block.columnSeparators === 'between' ? 'columnLayout--withSeparators' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const resolvedColumns = await Promise.all(
    columns.map(async (column, columnIndex) => {
      const columnPath = `${path}.columns.${columnIndex}`
      const blocks = (column.blocks ?? []) as ContentLeafBlock[]
      const resolvedBlocks = await Promise.all(
        blocks.map((nestedBlock, nestedBlockIndex) =>
          resolveContentLeafBlock({
            block: nestedBlock,
            document,
            path: `${columnPath}.blocks.${nestedBlockIndex}`,
            pathname,
            searchParams,
          }),
        ),
      )

      return { blocks, column, columnPath, resolvedBlocks }
    }),
  )

  return {
    content: (
      <ContentPresentation className={classes} placement="layout" presentation={presentation}>
        <div className="columnLayoutGrid">
          {resolvedColumns.map(({ blocks, column, columnPath, resolvedBlocks }) => {
            const style = { '--column-width': column.width } as CSSProperties
            const columnPresentation = normalizeContentPresentation(
              column as ContentPresentationData,
            )

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
                  {resolvedBlocks.map(({ content }, nestedBlockIndex) => (
                    <Fragment key={`${columnPath}.blocks.${nestedBlockIndex}`}>{content}</Fragment>
                  ))}
                </div>
              </ContentPresentation>
            )
          })}
        </div>
      </ContentPresentation>
    ),
    hasEmptyFilterBlock: resolvedColumns.some(({ resolvedBlocks }) =>
      resolvedBlocks.some(({ hasEmptyFilterBlock }) => hasEmptyFilterBlock),
    ),
  }
}

export async function ContentLeafBlockRenderer({
  ...properties
}: ContentRendererProperties & {
  block: ContentLeafBlock
  path: string
  presentationPlacement?: 'block' | 'tab'
}) {
  return (await resolveContentLeafBlock(properties)).content
}

async function resolveContentLeafBlock({
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
}): Promise<ContentBlockResolution> {
  if (block.blockType === 'heading') {
    return {
      content: (
        <ContentHeading
          appearance={pathname === '/' ? 'homeSection' : 'default'}
          heading={normalizeContentHeading(block as ContentHeadingData)}
        />
      ),
      hasEmptyFilterBlock: false,
    }
  }

  if (block.blockType === 'actionLinks') {
    const siteSettings = await getPublicSiteSettings()
    const items = resolvePresentedLinks(block.items ?? [], {
      siteContactEmail: siteSettings.contactEmail,
    })
    if (!items.length) {
      return { content: null, hasEmptyFilterBlock: false }
    }

    return {
      content: (
        <ul
          className={`actionLinks actionLinks--${block.layout ?? 'inline'} actionLinks--align-${block.alignment ?? 'start'}`}
        >
          {items.map((item, itemIndex) => (
            <li key={`${item.link.href}-${itemIndex}`}>
              <PresentedLink item={item} />
            </li>
          ))}
        </ul>
      ),
      hasEmptyFilterBlock: false,
    }
  }

  if (block.blockType === 'card') {
    return {
      content: <CardBlockSection block={block} />,
      hasEmptyFilterBlock: false,
    }
  }

  const resolution = await resolvePresentedLeafBlock({
    block,
    document,
    path,
    pathname,
    searchParams,
  })
  if (!resolution.content) {
    return resolution
  }

  return {
    content: (
      <ContentPresentation
        placement={presentationPlacement}
        presentation={normalizeContentPresentation(block as ContentPresentationData)}
      >
        {resolution.content}
      </ContentPresentation>
    ),
    hasEmptyFilterBlock: resolution.hasEmptyFilterBlock,
  }
}

async function resolvePresentedLeafBlock({
  block,
  document,
  path,
  pathname,
  searchParams,
}: ContentRendererProperties & {
  block: PresentedContentLeafBlock
  path: string
}): Promise<ContentBlockResolution> {
  switch (block.blockType) {
    case 'richText':
      return {
        content: (
          <CmsRichText
            className={`richText richText--${block.textStyle ?? 'default'}`}
            data={block.content}
          />
        ),
        hasEmptyFilterBlock: false,
      }
    case 'mediaGallery':
    case 'attachments': {
      const resolution = await resolveMediaBlockSection({
        block,
        blockPath: path,
        pathname,
        searchParams,
      })
      return createFilterBlockResolution(block.blockType, resolution)
    }
    case 'listing': {
      const resolution = await resolveListingBlockSection({
        block,
        blockPath: path,
        document,
        pathname,
        searchParams,
      })
      return createFilterBlockResolution(block.blockType, resolution)
    }
    case 'contentCalendar':
      return {
        content: await ContentCalendarBlockSection({ block }),
        hasEmptyFilterBlock: false,
      }
  }
}

function createFilterBlockResolution(
  blockType: string,
  resolution: { content: ReactNode; isEmpty: boolean },
): ContentBlockResolution {
  return {
    content: resolution.content,
    hasEmptyFilterBlock: isSectionGroupEmptyAwareBlockType(blockType) && resolution.isEmpty,
  }
}
