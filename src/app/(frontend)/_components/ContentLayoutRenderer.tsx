import { Fragment, type CSSProperties, type ReactNode } from 'react'

import { getSpacerHeight } from '@/blocks/Spacer'
import { CmsRichText } from '@/components/CmsRichText'
import { getTextBadgeClassName } from '@/modules/content/text-styles'
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
  Category,
  ColumnLayoutBlock,
  ContentCalendarBlock,
  CurrentItemContentBlock,
  CurrentItemFieldBlock,
  CurrentItemFieldRowBlock,
  Event,
  EventCycle,
  FieldRowTextBlock,
  HeadingBlock,
  HomepageSection,
  InformationPanelColumnsBlock,
  InformationPanelGroupBlock,
  ListingBlock,
  MediaGalleryBlock,
  MemberProfile,
  Page,
  PageTemplate,
  PageTemplateActionLinksBlock,
  PageTemplateColumnLayoutBlock,
  PageTemplateIconBlock,
  PageTemplateListingBlock,
  PageTemplateSectionGroupBlock,
  PageTemplateTabbedContentBlock,
  Partner,
  Post,
  RichTextBlock,
  SectionGroupBlock,
  SpacerBlock,
  TabbedContentBlock,
  Tag,
} from '@/payload-types'
import type { CurrentListingTarget } from '@/modules/content/listing-conditions'

import { ActionLinksList } from './ActionLinksList'
import { TextBlockContent } from './TextBlockContent'
import { ContentHeading, ContentPresentation } from './ContentPresentation'
import { CardBlockSection } from './CardBlockSection'
import { ContentCalendarBlockSection } from './ContentCalendarBlockSection'
import { resolveListingBlockSection } from './ListingBlockSection'
import { resolveMediaBlockSection } from './MediaBlockSection'
import { PresentedLink } from './PresentedLink'
import { TabbedContentFrame, type TabbedContentFrameTab } from './TabbedContentFrame'

export type ContentLayoutDocument =
  | Category
  | Event
  | EventCycle
  | HomepageSection
  | MemberProfile
  | Page
  | PageTemplate
  | Partner
  | Post
  | Tag
type ContentLeafBlock =
  | ActionLinksBlock
  | PageTemplateActionLinksBlock
  | AttachmentsBlock
  | CardBlock
  | ContentCalendarBlock
  | HeadingBlock
  | ListingBlock
  | PageTemplateListingBlock
  | MediaGalleryBlock
  | RichTextBlock
  | FieldRowTextBlock
  | SpacerBlock
type PresentedContentLeafBlock = Exclude<
  ContentLeafBlock,
  | ActionLinksBlock
  | PageTemplateActionLinksBlock
  | CardBlock
  | HeadingBlock
  | FieldRowTextBlock
  | SpacerBlock
>
type SectionContentBlock =
  ColumnLayoutBlock | InformationPanelColumnsBlock | TabbedContentBlock | ContentLeafBlock
type TabbedContentSectionBlock = ColumnLayoutBlock | ContentLeafBlock
type PageTemplateLayoutBlock =
  | CurrentItemContentBlock
  | CurrentItemFieldBlock
  | CurrentItemFieldRowBlock
  | FieldRowTextBlock
  | InformationPanelColumnsBlock
  | InformationPanelGroupBlock
  | PageTemplateIconBlock
  | PageTemplateColumnLayoutBlock
  | PageTemplateSectionGroupBlock
  | PageTemplateTabbedContentBlock
export type ContentLayoutBlock =
  | ColumnLayoutBlock
  | SectionGroupBlock
  | TabbedContentBlock
  | ContentLeafBlock
  | PageTemplateLayoutBlock

export type ContentLayoutCustomBlockResolution = {
  content: ReactNode
  hasEmptyFilterBlock?: boolean
}

export type ContentLayoutCustomBlockProperties = {
  block: ContentLayoutBlock
  currentTarget?: CurrentListingTarget
  document: ContentLayoutDocument
  path: string
  pathname: string
  searchParams: Record<string, string | string[] | undefined>
}

export type ContentLayoutCustomBlockRenderer = (
  properties: ContentLayoutCustomBlockProperties,
) =>
  | ContentLayoutCustomBlockResolution
  | Promise<ContentLayoutCustomBlockResolution | undefined>
  | undefined

type ContentRendererProperties = {
  currentTarget?: CurrentListingTarget
  customBlockRenderer?: ContentLayoutCustomBlockRenderer
  document: ContentLayoutDocument
  layout?: ContentLayoutBlock[]
  layoutPath?: string
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
  currentTarget,
  customBlockRenderer,
  document,
  layout: providedLayout,
  layoutPath = 'layout',
  pathname,
  searchParams,
}: ContentRendererProperties) {
  const layout =
    providedLayout ??
    (('layout' in document ? (document.layout ?? []) : []) as ContentLayoutBlock[])

  return (
    <div className="pageBlocks">
      {layout.map((block, blockIndex) => (
        <ContentBlockRenderer
          block={block}
          currentTarget={currentTarget}
          customBlockRenderer={customBlockRenderer}
          document={document}
          key={block.id ?? `layout.${blockIndex}`}
          path={`${layoutPath}.${blockIndex}`}
          pathname={pathname}
          searchParams={searchParams}
        />
      ))}
    </div>
  )
}

async function ContentBlockRenderer({
  block,
  currentTarget,
  customBlockRenderer,
  document,
  path,
  pathname,
  searchParams,
}: PositionedRendererProperties & { block: ContentLayoutBlock }) {
  const customResolution = await customBlockRenderer?.({
    block,
    currentTarget,
    document,
    path,
    pathname,
    searchParams,
  })
  if (customResolution) return customResolution.content

  if (block.blockType === 'sectionGroup') {
    return (
      <SectionGroupRenderer
        block={block as SectionGroupBlock}
        currentTarget={currentTarget}
        customBlockRenderer={customBlockRenderer}
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
        block={block as ColumnLayoutBlock}
        currentTarget={currentTarget}
        customBlockRenderer={customBlockRenderer}
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
        block={block as TabbedContentBlock}
        currentTarget={currentTarget}
        customBlockRenderer={customBlockRenderer}
        document={document}
        path={path}
        pathname={pathname}
        searchParams={searchParams}
      />
    )
  }

  return (
    <ContentLeafBlockRenderer
      block={block as ContentLeafBlock}
      currentTarget={currentTarget}
      customBlockRenderer={customBlockRenderer}
      document={document}
      path={path}
      pathname={pathname}
      searchParams={searchParams}
    />
  )
}

async function TabbedContentRenderer({
  block,
  currentTarget,
  customBlockRenderer,
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
                currentTarget,
                customBlockRenderer,
                document,
                path: nestedPath,
                pathname,
                searchParams,
              })
            : resolveContentLeafBlock({
                block: nestedBlock,
                currentTarget,
                customBlockRenderer,
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
  currentTarget,
  customBlockRenderer,
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
          if (nestedBlock.blockType === 'columnLayout' || nestedBlock.blockType === 'infoColumns') {
            const isInformationPanelColumn = nestedBlock.blockType === 'infoColumns'
            const resolution = await resolveColumnLayout({
              block: nestedBlock,
              currentTarget,
              customBlockRenderer,
              document,
              path: isInformationPanelColumn ? `${nestedPath}.0` : nestedPath,
              pathname,
              searchParams,
            })

            return isInformationPanelColumn
              ? { ...resolution, content: <div className="pageBlocks">{resolution.content}</div> }
              : resolution
          }

          if (nestedBlock.blockType === 'tabs') {
            return {
              content: await TabbedContentRenderer({
                block: nestedBlock,
                currentTarget,
                customBlockRenderer,
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
            currentTarget,
            customBlockRenderer,
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
  currentTarget,
  customBlockRenderer,
  document,
  path,
  pathname,
  searchParams,
}: PositionedRendererProperties & {
  block: ColumnLayoutBlock | InformationPanelColumnsBlock
}): Promise<ContentBlockResolution> {
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
            currentTarget,
            customBlockRenderer,
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
  block: ContentLayoutBlock
  path: string
  presentationPlacement?: 'block' | 'tab'
}) {
  return (await resolveContentLeafBlock(properties)).content
}

async function resolveContentLeafBlock({
  block,
  currentTarget,
  customBlockRenderer,
  document,
  path,
  pathname,
  presentationPlacement = 'block',
  searchParams,
}: ContentRendererProperties & {
  block: ContentLayoutBlock
  path: string
  presentationPlacement?: 'block' | 'tab'
}): Promise<ContentBlockResolution> {
  const customResolution = await customBlockRenderer?.({
    block,
    currentTarget,
    document,
    path,
    pathname,
    searchParams,
  })
  if (customResolution) {
    return {
      content: customResolution.content,
      hasEmptyFilterBlock: customResolution.hasEmptyFilterBlock ?? false,
    }
  }

  if (block.blockType === 'spacer') {
    return {
      content: (
        <div
          aria-hidden="true"
          className="contentSpacer"
          style={{ blockSize: getSpacerHeight(block.size) }}
        />
      ),
      hasEmptyFilterBlock: false,
    }
  }

  if (block.blockType === 'fieldRowText') {
    return { content: <TextBlockContent block={block} />, hasEmptyFilterBlock: false }
  }

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
    const actionLinksBlock = block as ActionLinksBlock | PageTemplateActionLinksBlock
    const siteSettings = await getPublicSiteSettings()
    const items = resolvePresentedLinks(actionLinksBlock.items ?? [], {
      siteContactEmail: siteSettings.contactEmail,
    })
    return {
      content: (
        <ActionLinksList
          alignment={actionLinksBlock.alignment}
          items={items}
          layout={actionLinksBlock.layout}
        />
      ),
      hasEmptyFilterBlock: false,
    }
  }

  if (block.blockType === 'card') {
    return {
      content: <CardBlockSection block={block as CardBlock} />,
      hasEmptyFilterBlock: false,
    }
  }

  const resolution = await resolvePresentedLeafBlock({
    block: block as PresentedContentLeafBlock,
    currentTarget,
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
  currentTarget,
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
            className={`richText richText--${block.textStyle ?? 'default'}${getTextBadgeClassName(block.textStyle)}`}
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
        currentTarget,
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
