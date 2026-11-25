import { useMemo } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'

import type { PublicMediaListItem } from '@/modules/media/media-listing'

export default function MediaGalleryLightbox({
  close,
  index,
  items,
  open,
}: {
  close: () => void
  index: number
  items: (PublicMediaListItem & { url: string })[]
  open: boolean
}) {
  const slides = useMemo(
    () =>
      items.map((item) => ({
        alt: item.alt,
        description: item.description ?? undefined,
        height: item.height ?? undefined,
        src: item.url,
        width: item.width ?? undefined,
      })),
    [items],
  )

  return (
    <Lightbox
      close={close}
      controller={{ aria: true, closeOnBackdropClick: true }}
      index={index}
      labels={{
        Close: 'Zamknij',
        Next: 'Następny obraz',
        Previous: 'Poprzedni obraz',
        'Zoom in': 'Powiększ',
        'Zoom out': 'Pomniejsz',
      }}
      open={open}
      plugins={[Captions, Zoom]}
      slides={slides}
    />
  )
}
