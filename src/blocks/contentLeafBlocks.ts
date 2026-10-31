import type { Block } from 'payload'

import { ContentCalendarBlock } from './ContentCalendar'
import { ListingBlock } from './Listing'
import { AttachmentsBlock, MediaGalleryBlock } from './MediaListing'
import { RichTextBlock } from './RichText'
import { ActionLinksBlock } from './ActionLinks'
import { CardBlock } from './Card'
import { HeadingBlock } from './Heading'

export const contentLeafBlocks: Block[] = [
  RichTextBlock,
  HeadingBlock,
  ActionLinksBlock,
  CardBlock,
  ListingBlock,
  ContentCalendarBlock,
  MediaGalleryBlock,
  AttachmentsBlock,
]
