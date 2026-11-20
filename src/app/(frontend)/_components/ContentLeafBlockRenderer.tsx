import type { ReactNode } from 'react'

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
import { isSectionGroupEmptyAwareBlockType } from '@/modules/content/section-group-visibility'
import { resolvePresentedLinks } from '@/modules/navigation/links'

import { ActionLinksList } from './ActionLinksList'
import { CardBlockSection } from './CardBlockSection'
import { ContentCalendarBlockSection } from './ContentCalendarBlockSection'
import { ContentHeading, ContentPresentation } from './ContentPresentation'
import { resolveListingBlockSection } from './ListingBlockSection'
import { resolveMediaBlockSection } from './MediaBlockSection'
import { TextBlockContent } from './TextBlockContent'
import type {
  ContentBlockResolution,
  ContentLayoutBlock,
  PositionedRendererProperties,
  PresentedContentLeafBlock,
} from './content-layout-types'

type LeafRendererProperties = PositionedRendererProperties & {
  block: ContentLayoutBlock
  presentationPlacement?: 'block' | 'tab'
}

export async function ContentLeafBlockRenderer(properties: LeafRendererProperties) {
  return (await resolveContentLeafBlock(properties)).content
}

export async function resolveContentLeafBlock({
  block,
  currentTarget,
  customBlockRenderer,
  document,
  path,
  pathname,
  presentationPlacement = 'block',
  searchParams,
}: LeafRendererProperties): Promise<ContentBlockResolution> {
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
    const actionLinksBlock = block
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
      content: <CardBlockSection block={block} />,
      hasEmptyFilterBlock: false,
    }
  }

  if (block.blockType === 'listing') {
    const resolution = await resolveListingBlockSection({
      block,
      blockPath: path,
      currentTarget,
      document,
      pathname,
      presentationPlacement,
      searchParams,
    })
    return createFilterBlockResolution(block.blockType, resolution)
  }

  const resolution = await resolvePresentedLeafBlock({
    block: block as PresentedContentLeafBlock,
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
  path,
  pathname,
  searchParams,
}: Pick<PositionedRendererProperties, 'path' | 'pathname' | 'searchParams'> & {
  block: PresentedContentLeafBlock
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
