import { RasterIcon } from '@/components/RasterIcon'
import type {
  ContentListingFact,
  ContentListingPresentation,
} from '@/modules/content/content-listing-presentation'

export function ListingFactValue({ fact }: { fact: ContentListingFact }) {
  return (
    <span>
      {fact.dateTime ? (
        <time dateTime={fact.dateTime}>{fact.value}</time>
      ) : fact.href ? (
        <a href={fact.href}>{fact.value}</a>
      ) : (
        fact.value
      )}
      {fact.address ? <span className="listingVenueAddress">{fact.address}</span> : null}
    </span>
  )
}

export function ListingActionContent({
  style,
  icon,
  label,
  iconLast = false,
}: {
  style?: ContentListingPresentation['actionStyle']
  icon: 'calendar' | 'arrow-right'
  label: string
  iconLast?: boolean
}) {
  const graphic = style !== 'text' ? <RasterIcon name={icon} size="small" /> : null
  return (
    <>
      {!iconLast ? graphic : null}
      <span className={style === 'icon' ? 'srOnly' : undefined}>{label}</span>
      {iconLast ? graphic : null}
    </>
  )
}
