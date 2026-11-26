import { useMemo } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import Download from 'yet-another-react-lightbox/plugins/download'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'

import { getResponsiveMedia } from '@/modules/media/media-url'
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
      items.map((item) => {
        const { sources, src } = getResponsiveMedia(item)
        return {
          alt: item.alt,
          description: item.description ?? undefined,
          download: { url: item.url, filename: item.filename },
          height: item.height ?? undefined,
          src: src ?? item.url,
          srcSet: sources.length ? sources : undefined,
          width: item.width ?? undefined,
        }
      }),
    [items],
  )

  return (
    <Lightbox
      close={close}
      controller={{ aria: true, closeOnBackdropClick: true }}
      index={index}
      labels={{
        Close: 'Zamknij',
        Download: 'Pobierz',
        Next: 'Następny obraz',
        Previous: 'Poprzedni obraz',
        'Zoom in': 'Powiększ',
        'Zoom out': 'Pomniejsz',
      }}
      open={open}
      plugins={[Captions, Download, Zoom]}
      slides={slides}
    />
  )
}
