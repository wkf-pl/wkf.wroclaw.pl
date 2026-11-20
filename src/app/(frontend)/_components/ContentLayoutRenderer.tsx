import { Fragment, type CSSProperties, type ReactNode } from 'react'

import {
  normalizeContentPresentation,
  type ContentPresentationData,
} from '@/modules/content/content-presentation'
import { getPublicSiteSettings } from '@/modules/content/public-content'
import { shouldHideSectionGroup } from '@/modules/content/section-group-visibility'
import { resolvePresentedLinks } from '@/modules/navigation/links'
import type {
  ColumnLayoutBlock,
  InformationPanelColumnsBlock,
  SectionGroupBlock,
  TabbedContentBlock,
} from '@/payload-types'

import { ContentLeafBlockRenderer, resolveContentLeafBlock } from './ContentLeafBlockRenderer'
import { ContentPresentation } from './ContentPresentation'
import { PresentedLink } from './PresentedLink'
import { TabbedContentFrame, type TabbedContentFrameTab } from './TabbedContentFrame'
import type {
  ContentBlockResolution,
  ContentLayoutBlock,
  ContentLeafBlock,
  ContentRendererProperties,
  PositionedRendererProperties,
  SectionContentBlock,
  TabbedContentSectionBlock,
} from './content-layout-types'

export { ContentLeafBlockRenderer } from './ContentLeafBlockRenderer'
export type {
  ContentLayoutBlock,
  ContentLayoutCustomBlockProperties,
  ContentLayoutCustomBlockResolution,
  ContentLayoutDocument,
} from './content-layout-types'

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
      block={block}
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
