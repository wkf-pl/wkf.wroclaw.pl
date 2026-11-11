import type { ReactNode } from 'react'

import { RasterIcon } from '@/components/RasterIcon'
import type {
  CurrentItemFieldBlock,
  CurrentItemFieldRowBlock,
  PageTemplate,
  PageTemplateActionLinksBlock,
} from '@/payload-types'
import { normalizeContentHeading } from '@/modules/content/content-presentation'
import { getPublicSiteSettings } from '@/modules/content/public-content'
import type { CurrentListingTarget } from '@/modules/content/listing-conditions'
import type { PublicBreadcrumb } from '@/modules/content/public-hierarchy'
import { isSelectableRasterIconName } from '@/modules/icons/icon-registry'
import { getPageTemplateDynamicField } from '@/modules/page-templates/page-template-registry'
import { resolvePageTemplateActionLinks } from '@/modules/page-templates/page-template-context'

import {
  ContentLayoutRenderer,
  type ContentLayoutBlock,
  type ContentLayoutCustomBlockProperties,
  type ContentLayoutCustomBlockResolution,
  type ContentLayoutDocument,
} from './ContentLayoutRenderer'
import { ActionLinksList } from './ActionLinksList'
import { ContentHeading } from './ContentPresentation'
import { ContentHero, type ContentHeroImage } from './ContentHero'
import { CurrentItemValue } from './CurrentItemValue'
import { PageTemplatePreviewBanner } from './PageTemplatePreviewBanner'

type PageTemplateDocumentProperties = {
  breadcrumbs: PublicBreadcrumb[]
  currentItem?: {
    document: Exclude<ContentLayoutDocument, PageTemplate>
    target: CurrentListingTarget
    content?: ReactNode
    afterContent?: ReactNode
    renderField: (
      block: CurrentItemFieldBlock,
      region: 'content' | 'hero' | 'informationPanel',
    ) => ReactNode
  }
  image?: ContentHeroImage
  fallbackTitle?: string
  isDraftPreview?: boolean
  pathname: string
  searchParams: Record<string, string | string[] | undefined>
  template: PageTemplate
}

export async function PageTemplateDocument({
  breadcrumbs,
  currentItem,
  image,
  fallbackTitle,
  isDraftPreview,
  pathname,
  searchParams,
  template,
}: PageTemplateDocumentProperties) {
  const document = currentItem?.document ?? template
  const currentTarget = currentItem?.target
  const hasCurrentItemHeading = template.hero?.some(
    (block) => block.blockType === 'currentItemField' && block.variant === 'primaryHeading',
  )
  const heroTitleIndex =
    fallbackTitle && !hasCurrentItemHeading
      ? (template.hero?.findIndex(
          (block) => block.blockType === 'heading' && block.heading?.trim(),
        ) ?? -1)
      : -1

  const renderCustomBlock = async (
    properties: ContentLayoutCustomBlockProperties,
  ): Promise<ContentLayoutCustomBlockResolution | undefined> => {
    if (properties.block.blockType === 'heading' && properties.path === `hero.${heroTitleIndex}`) {
      return {
        content: <ContentHeading as="h1" heading={normalizeContentHeading(properties.block)} />,
      }
    }

    if (properties.block.blockType === 'currentItemField') {
      const region = getRegionFromPath(properties.path)
      if (!currentItem || !region) return { content: null }
      const block = properties.block as CurrentItemFieldBlock
      const field = getPageTemplateDynamicField(template.templateKey, block.field, region)
      if (!field) return { content: null }

      return {
        content: field.source ? (
          <CurrentItemValue
            currentTarget={currentTarget}
            document={document}
            fieldKey={field.key}
            pathname={pathname}
            searchParams={searchParams}
            source={field.source}
            variant={block.variant}
          />
        ) : (
          currentItem.renderField(block, region)
        ),
      }
    }

    if (properties.block.blockType === 'currentItemContent') {
      if (!currentItem) return { content: null }
      return {
        content: currentItem.content ?? (
          <>
            <ContentLayoutRenderer
              currentTarget={currentTarget}
              document={document}
              pathname={pathname}
              searchParams={searchParams}
            />
            {currentItem.afterContent}
          </>
        ),
      }
    }

    if (properties.block.blockType === 'currentItemFieldRow') {
      const block = properties.block as CurrentItemFieldRowBlock
      const hasHangingIcon = block.items?.some(
        (item) =>
          item.blockType === 'pageTemplateIcon' &&
          item.hanging &&
          isSelectableRasterIconName(item.iconName),
      )
      return {
        content: (
          <div
            className={
              hasHangingIcon
                ? 'pageTemplateFieldRow pageTemplateFieldRow--hanging'
                : 'pageTemplateFieldRow'
            }
          >
            <ContentLayoutRenderer
              currentTarget={currentTarget}
              customBlockRenderer={renderCustomBlock}
              document={document}
              layout={toContentLayoutBlocks(block.items)}
              layoutPath={`${properties.path}.items`}
              pathname={pathname}
              searchParams={searchParams}
            />
          </div>
        ),
      }
    }

    if (properties.block.blockType === 'pageTemplateIcon') {
      const { hanging, iconInverted, iconName } = properties.block
      if (!isSelectableRasterIconName(iconName)) return { content: null }

      const className = hanging ? 'pageTemplateIcon pageTemplateIcon--hanging' : 'pageTemplateIcon'
      return {
        content: iconInverted ? (
          <span className={`${className} contentHeadingIcon contentHeadingIcon--inverted`}>
            <RasterIcon name={iconName} size="medium" />
          </span>
        ) : (
          <RasterIcon className={className} name={iconName} size="medium" />
        ),
      }
    }

    if (properties.block.blockType === 'actionLinks') {
      const block = properties.block as PageTemplateActionLinksBlock
      const needsSiteContactEmail = block.items?.some(
        (item) => item.targetType === 'siteContactEmail',
      )
      const siteSettings = needsSiteContactEmail ? await getPublicSiteSettings() : undefined
      const items = resolvePageTemplateActionLinks(block.items, document, {
        siteContactEmail: siteSettings?.contactEmail,
      })
      return {
        content: (
          <ActionLinksList alignment={block.alignment} items={items} layout={block.layout} />
        ),
      }
    }

    if (properties.block.blockType === 'infoColumns') {
      return {
        content: (
          <ContentLayoutRenderer
            currentTarget={currentTarget}
            customBlockRenderer={renderCustomBlock}
            document={document}
            layout={[
              { ...properties.block, blockType: 'columnLayout' } as unknown as ContentLayoutBlock,
            ]}
            layoutPath={properties.path}
            pathname={pathname}
            searchParams={searchParams}
          />
        ),
      }
    }

    if (properties.block.blockType === 'infoGroup') {
      return {
        content: (
          <ContentLayoutRenderer
            currentTarget={currentTarget}
            customBlockRenderer={renderCustomBlock}
            document={document}
            layout={[
              { ...properties.block, blockType: 'sectionGroup' } as unknown as ContentLayoutBlock,
            ]}
            layoutPath={properties.path}
            pathname={pathname}
            searchParams={searchParams}
          />
        ),
      }
    }

    return undefined
  }

  const hasInformationPanel = Boolean(template.informationPanel?.length)

  return (
    <>
      {isDraftPreview ? <PageTemplatePreviewBanner pathname={pathname} /> : null}
      <main className="contentHeroPage pageTemplatePage">
        <article className="cmsDocument cmsPageDocument pageTemplateDocument">
          <ContentHero
            breadcrumbs={breadcrumbs}
            customCopy={
              <>
                {fallbackTitle && !hasCurrentItemHeading && heroTitleIndex === -1 ? (
                  <h1>{fallbackTitle}</h1>
                ) : null}
                <ContentLayoutRenderer
                  currentTarget={currentTarget}
                  customBlockRenderer={renderCustomBlock}
                  document={document}
                  layout={toContentLayoutBlocks(template.hero)}
                  layoutPath="hero"
                  pathname={pathname}
                  searchParams={searchParams}
                />
              </>
            }
            image={image}
          />

          {hasInformationPanel ? (
            <section aria-label="Panel informacyjny" className="pageTemplateInformationPanel">
              <ContentLayoutRenderer
                currentTarget={currentTarget}
                customBlockRenderer={renderCustomBlock}
                document={document}
                layout={toContentLayoutBlocks(template.informationPanel)}
                layoutPath="informationPanel"
                pathname={pathname}
                searchParams={searchParams}
              />
            </section>
          ) : null}

          <div className="contentShell contentPageBody pageTemplateContent">
            <ContentLayoutRenderer
              currentTarget={currentTarget}
              customBlockRenderer={renderCustomBlock}
              document={document}
              layout={toContentLayoutBlocks(template.content)}
              layoutPath="content"
              pathname={pathname}
              searchParams={searchParams}
            />
          </div>
        </article>
      </main>
    </>
  )
}

function toContentLayoutBlocks(value: unknown): ContentLayoutBlock[] {
  return Array.isArray(value) ? (value as unknown as ContentLayoutBlock[]) : []
}

function getRegionFromPath(path: string): 'content' | 'hero' | 'informationPanel' | undefined {
  const [region] = path.split('.')
  return region === 'hero' || region === 'informationPanel' || region === 'content'
    ? region
    : undefined
}
