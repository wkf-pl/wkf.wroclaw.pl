'use client'

import { useMemo, useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'

import type { MediaListingView, PublicMediaListItem } from '@/modules/media/media-listing'

type MediaGalleryProperties = {
  items: PublicMediaListItem[]
  view: MediaListingView
}

export function MediaGallery({ items, view }: MediaGalleryProperties) {
  const [openIndex, setOpenIndex] = useState<null | number>(null)
  const availableItems = useMemo(
    () => items.filter((item): item is PublicMediaListItem & { url: string } => Boolean(item.url)),
    [items],
  )
  const slides = useMemo(
    () =>
      availableItems.map((item) => ({
        alt: item.alt,
        description: item.description ?? undefined,
        height: item.height ?? undefined,
        src: item.url,
        width: item.width ?? undefined,
      })),
    [availableItems],
  )

  return (
    <>
      <div className={`mediaList mediaList-${view} mediaGallery`}>
        {availableItems.map((item, index) => (
          <figure className="mediaGalleryItem" key={item.id}>
            {item.url ? (
              <button
                aria-label={`Otwórz obraz: ${item.alt}`}
                className="mediaGalleryTrigger"
                onClick={() => setOpenIndex(index)}
                type="button"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- Media URLs can use a runtime-configured Azure host. */}
                <img
                  alt={item.alt}
                  height={item.height ?? undefined}
                  loading="lazy"
                  src={item.url}
                  width={item.width ?? undefined}
                />
              </button>
            ) : null}
            {item.description ? <figcaption>{item.description}</figcaption> : null}
          </figure>
        ))}
      </div>

      <Lightbox
        close={() => setOpenIndex(null)}
        controller={{ aria: true, closeOnBackdropClick: true }}
        index={openIndex ?? 0}
        labels={{
          Close: 'Zamknij',
          Next: 'Następny obraz',
          Previous: 'Poprzedni obraz',
          'Zoom in': 'Powiększ',
          'Zoom out': 'Pomniejsz',
        }}
        open={openIndex !== null}
        plugins={[Captions, Zoom]}
        slides={slides}
      />
    </>
  )
}
