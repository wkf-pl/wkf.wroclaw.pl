import type { ReactNode } from 'react'

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
export type ContentLeafBlock =
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
export type PresentedContentLeafBlock = Exclude<
  ContentLeafBlock,
  | ActionLinksBlock
  | PageTemplateActionLinksBlock
  | CardBlock
  | HeadingBlock
  | FieldRowTextBlock
  | SpacerBlock
  | ListingBlock
  | PageTemplateListingBlock
>
export type SectionContentBlock =
  ColumnLayoutBlock | InformationPanelColumnsBlock | TabbedContentBlock | ContentLeafBlock
export type TabbedContentSectionBlock = ColumnLayoutBlock | ContentLeafBlock
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

type ContentLayoutCustomBlockRenderer = (
  properties: ContentLayoutCustomBlockProperties,
) =>
  | ContentLayoutCustomBlockResolution
  | Promise<ContentLayoutCustomBlockResolution | undefined>
  | undefined

export type ContentRendererProperties = {
  currentTarget?: CurrentListingTarget
  customBlockRenderer?: ContentLayoutCustomBlockRenderer
  document: ContentLayoutDocument
  layout?: ContentLayoutBlock[]
  layoutPath?: string
  pathname: string
  searchParams: Record<string, string | string[] | undefined>
}

export type PositionedRendererProperties = ContentRendererProperties & {
  path: string
}

export type ContentBlockResolution = {
  content: ReactNode
  hasEmptyFilterBlock: boolean
}
