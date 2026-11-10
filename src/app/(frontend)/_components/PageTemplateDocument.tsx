import { RichText, type JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
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
import type { ContentListingReference } from '@/modules/content/listing-conditions'
import type { PublicBreadcrumb } from '@/modules/content/public-hierarchy'
import { isSelectableRasterIconName } from '@/modules/icons/icon-registry'
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

const fieldRowTextConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  text: defaultConverters.text,
  paragraph: ({ childIndex, node, nodesToJSX }) => (
    <>
      {childIndex > 0 ? ' ' : null}
      {nodesToJSX({ nodes: node.children })}
    </>
  ),
  linebreak: () => ' ',
})

const fieldRowTextStyleClasses = {
  badge: ' pageTemplateBadge',
  emphasizedBadge: ' pageTemplateBadge pageTemplateBadge--emphasizedBadge',
  informationLabel: ' pageTemplateFieldRowText--informationLabel',
  plain: '',
}

type PageTemplateDocumentProperties = {
  breadcrumbs: PublicBreadcrumb[]
  currentItem?: {
    document: Exclude<ContentLayoutDocument, PageTemplate>
    target: ContentListingReference
    renderField: (
      block: CurrentItemFieldBlock,
      region: 'content' | 'hero' | 'informationPanel',
    ) => ReactNode
  }
  image?: ContentHeroImage
  indexTitle?: string
  pathname: string
  searchParams: Record<string, string | string[] | undefined>
  template: PageTemplate
}

export async function PageTemplateDocument({
  breadcrumbs,
  currentItem,
  image,
  indexTitle,
  pathname,
  searchParams,
  template,
}: PageTemplateDocumentProperties) {
  const document = currentItem?.document ?? template
  const currentTarget = currentItem?.target
  const heroTitleIndex = indexTitle
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
      return {
        content: currentItem.renderField(properties.block as CurrentItemFieldBlock, region),
      }
    }

    if (properties.block.blockType === 'currentItemContent') {
      if (!currentItem) return { content: null }
      return {
        content: (
          <ContentLayoutRenderer
            currentTarget={currentTarget}
            document={document}
            pathname={pathname}
            searchParams={searchParams}
          />
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

    if (properties.block.blockType === 'fieldRowText') {
      const { style, text } = properties.block
      return {
        content: (
          <span className={`pageTemplateFieldRowText${fieldRowTextStyleClasses[style ?? 'plain']}`}>
            <RichText converters={fieldRowTextConverters} data={text} disableContainer />
          </span>
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
    <main className="contentHeroPage pageTemplatePage">
      <article className="cmsDocument cmsPageDocument pageTemplateDocument">
        <ContentHero
          breadcrumbs={breadcrumbs}
          customCopy={
            <>
              {indexTitle && heroTitleIndex === -1 ? <h1>{indexTitle}</h1> : null}
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
