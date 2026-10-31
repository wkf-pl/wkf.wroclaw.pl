import type { PublicContentListItem } from '@/modules/content/content-listing'
import {
  getContentListingPresentation,
  type ContentListingView,
} from '@/modules/content/content-listing-presentation'

export function ContentListingMeta({
  className = 'contentCardMeta',
  item,
  view = 'compact',
}: {
  className?: string
  item: PublicContentListItem
  view?: ContentListingView
}) {
  const presentation = getContentListingPresentation(item, view)

  return (
    <p className={className}>
      <span className="contentCardKind">{presentation.kindLabel}</span>
      {presentation.metadataText ? (
        <span className="contentCardMetaText">{presentation.metadataText}</span>
      ) : null}
      {presentation.metadataLink ? (
        <>
          <span className="contentCardMetaText">{presentation.metadataLink.prefix}</span>
          <a className="contentCardMetaLink" href={presentation.metadataLink.href}>
            {presentation.metadataLink.label}
          </a>
        </>
      ) : null}
      {presentation.metadataDate ? (
        <time dateTime={presentation.metadataDate.dateTime}>{presentation.metadataDate.label}</time>
      ) : null}
      {presentation.contextLabel ? (
        <span className="contentCardMetaText">{presentation.contextLabel}</span>
      ) : null}
    </p>
  )
}
