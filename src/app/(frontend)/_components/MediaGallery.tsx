'use client'

import dynamic from 'next/dynamic'
import { useMemo, useState } from 'react'

import { getResponsiveMedia } from '@/modules/media/media-url'
import type { MediaListingView, PublicMediaListItem } from '@/modules/media/media-listing'

const MediaGalleryLightbox = dynamic(() => import('./MediaGalleryLightbox'), { ssr: false })

type MediaGalleryProperties = {
  items: PublicMediaListItem[]
  view: MediaListingView
}

export function MediaGallery({ items, view }: MediaGalleryProperties) {
  const [lightbox, setLightbox] = useState<{ index: number; open: boolean } | null>(null)
  const availableItems = useMemo(
    () => items.filter((item): item is PublicMediaListItem & { url: string } => Boolean(item.url)),
    [items],
  )
  return (
    <>
      <div className={`mediaList mediaList-${view} mediaGallery`}>
        {availableItems.map((item, index) => {
          const { src, srcSet } = getResponsiveMedia(item)
          return (
            <figure className="mediaGalleryItem" key={item.id}>
              {item.url ? (
                <button
                  aria-label={`Otwórz obraz: ${item.alt}`}
                  className="mediaGalleryTrigger"
                  onClick={() => setLightbox({ index, open: true })}
                  type="button"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- Media URLs can use a runtime-configured Azure host. */}
                  <img
                    alt={item.alt}
                    height={item.height ?? undefined}
                    loading="lazy"
                    sizes={
                      srcSet
                        ? '(max-width: 600px) 46vw, (max-width: 1080px) 30vw, 340px'
                        : undefined
                    }
                    src={src}
                    srcSet={srcSet}
                    width={item.width ?? undefined}
                  />
                </button>
              ) : null}
              {item.description ? <figcaption>{item.description}</figcaption> : null}
            </figure>
          )
        })}
      </div>

      {lightbox ? (
        <MediaGalleryLightbox
          close={() => setLightbox({ index: lightbox.index, open: false })}
          index={lightbox.index}
          items={availableItems}
          open={lightbox.open}
        />
      ) : null}
    </>
  )
}
