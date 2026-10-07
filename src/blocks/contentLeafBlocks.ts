import type { Block } from 'payload'

import { DocumentsBlock } from './Documents'
import { ListingBlock } from './Listing'
import { AttachmentsBlock, MediaGalleryBlock } from './MediaListing'
import { MemberProfilesBlock } from './MemberProfiles'
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
  MediaGalleryBlock,
  DocumentsBlock,
  AttachmentsBlock,
  MemberProfilesBlock,
]
