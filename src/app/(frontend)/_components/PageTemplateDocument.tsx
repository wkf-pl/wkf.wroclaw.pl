import type { ReactNode } from 'react'

import type { CurrentItemFieldBlock, PageTemplate } from '@/payload-types'
import type { ContentListingReference } from '@/modules/content/listing-conditions'
import type { PublicBreadcrumb } from '@/modules/content/public-hierarchy'

import {
  ContentLayoutRenderer,
  type ContentLayoutBlock,
  type ContentLayoutCustomBlockProperties,
  type ContentLayoutCustomBlockResolution,
  type ContentLayoutDocument,
} from './ContentLayoutRenderer'
import { ContentHero, type ContentHeroImage } from './ContentHero'

type PageTemplateDocumentProperties = {
  breadcrumbs: PublicBreadcrumb[]
  currentTarget: ContentListingReference
  document: ContentLayoutDocument
  image?: ContentHeroImage
  pathname: string
  renderCurrentItemField: (
    block: CurrentItemFieldBlock,
    region: 'content' | 'hero' | 'informationPanel',
  ) => ReactNode
  searchParams: Record<string, string | string[] | undefined>
  template: PageTemplate
}

export async function PageTemplateDocument({
  breadcrumbs,
  currentTarget,
  document,
  image,
  pathname,
  renderCurrentItemField,
  searchParams,
  template,
}: PageTemplateDocumentProperties) {
  const renderCustomBlock = async (
    properties: ContentLayoutCustomBlockProperties,
  ): Promise<ContentLayoutCustomBlockResolution | undefined> => {
    if (properties.block.blockType === 'currentItemField') {
      const region = getRegionFromPath(properties.path)
      if (!region) return { content: null }
      return {
        content: renderCurrentItemField(properties.block as CurrentItemFieldBlock, region),
      }
    }

    if (properties.block.blockType === 'currentItemContent') {
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
            <ContentLayoutRenderer
              currentTarget={currentTarget}
              customBlockRenderer={renderCustomBlock}
              document={document}
              layout={toContentLayoutBlocks(template.hero)}
              layoutPath="hero"
              pathname={pathname}
              searchParams={searchParams}
            />
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
