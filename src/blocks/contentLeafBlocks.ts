import type { Block } from 'payload'

import { DocumentsBlock } from './Documents'
import { ListingBlock } from './Listing'
import { AttachmentsBlock, MediaGalleryBlock } from './MediaListing'
import { MemberProfilesBlock } from './MemberProfiles'
import { RichTextBlock } from './RichText'

export const contentLeafBlocks: Block[] = [
  RichTextBlock,
  ListingBlock,
  MediaGalleryBlock,
  DocumentsBlock,
  AttachmentsBlock,
  MemberProfilesBlock,
]
