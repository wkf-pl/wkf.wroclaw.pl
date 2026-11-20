import type { PublicContentListItem } from '@/modules/content/content-listing'
import {
  getContentListingPresentation,
  type ContentListingView,
  type ContentListingPresentation,
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

  return <PresentedContentMeta className={className} presentation={presentation} />
}

export function PresentedContentMeta({
  className = 'contentCardMeta',
  presentation,
  variant = 'contentCard',
}: {
  className?: string
  presentation: ContentListingPresentation
  variant?: 'contentCard' | 'contentCarousel'
}) {
  if (
    !presentation.kindLabel &&
    !presentation.metadataText &&
    !presentation.metadataLink &&
    !presentation.metadataDate &&
    !presentation.contextLabel
  )
    return null
  return (
    <p className={className}>
      {presentation.kindLabel ? (
        <span
          className={
            presentation.highlightKindLabel
              ? 'pageTemplateBadge pageTemplateBadge--emphasizedBadge'
              : `${variant}Kind`
          }
        >
          {presentation.kindLabel}
        </span>
      ) : null}
      {presentation.metadataText ? (
        <span className={`${variant}MetaText`}>{presentation.metadataText}</span>
      ) : null}
      {presentation.metadataLink ? (
        <>
          <span className={`${variant}MetaText`}>{presentation.metadataLink.prefix}</span>
          <a className="contentCardMetaLink" href={presentation.metadataLink.href}>
            {presentation.metadataLink.label}
          </a>
        </>
      ) : null}
      {presentation.metadataDate ? (
        <time dateTime={presentation.metadataDate.dateTime}>{presentation.metadataDate.label}</time>
      ) : null}
      {presentation.contextLabel ? (
        <span className={`${variant}MetaText`}>{presentation.contextLabel}</span>
      ) : null}
    </p>
  )
}
