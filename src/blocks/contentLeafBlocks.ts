import type { Block } from 'payload'

import { ContentCalendarBlock } from './ContentCalendar'
import { ListingBlock } from './Listing'
import { AttachmentsBlock, MediaGalleryBlock } from './MediaListing'
import { FieldRowTextBlock } from './Text'
import { RichTextBlock } from './RichText'
import { ActionLinksBlock } from './ActionLinks'
import { CardBlock } from './Card'
import { HeadingBlock } from './Heading'
import { SpacerBlock } from './Spacer'

export const contentLeafBlocks: Block[] = [
  RichTextBlock,
  FieldRowTextBlock,
  HeadingBlock,
  ActionLinksBlock,
  CardBlock,
  ListingBlock,
  ContentCalendarBlock,
  MediaGalleryBlock,
  AttachmentsBlock,
  SpacerBlock,
]
