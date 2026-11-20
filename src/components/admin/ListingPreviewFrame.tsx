'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import type { ResolvedContentPresentation } from '@/modules/content/content-presentation'
import type { ContentListingPresentation } from '@/modules/content/content-listing-presentation'
import type { ListingDecorationMedia } from '@/modules/content/listing-decoration'
import type { ListingView } from '@/modules/content/listing-view'

export function ListingPreviewFrame({
  items,
  view,
  presentation,
  media,
}: {
  items: ContentListingPresentation[]
  view: ListingView
  presentation?: ResolvedContentPresentation
  media?: ListingDecorationMedia
}) {
  const frame = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(240)
  const sendPreview = useCallback(() => {
    frame.current?.contentWindow?.postMessage(
      { type: 'wkf:listing-preview', items, view, presentation, media },
      window.location.origin,
    )
  }, [items, view, presentation, media])

  useEffect(() => {
    const receiveMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow)
        return
      if (event.data?.type === 'wkf:listing-preview-ready') sendPreview()
      if (
        event.data?.type === 'wkf:listing-preview-height' &&
        typeof event.data.height === 'number' &&
        Number.isFinite(event.data.height)
      ) {
        setHeight(Math.max(1, Math.ceil(event.data.height)))
      }
    }
    window.addEventListener('message', receiveMessage)
    sendPreview()
    return () => window.removeEventListener('message', receiveMessage)
  }, [sendPreview])

  return (
    <iframe
      ref={frame}
      title="Podgląd wyników Listingu"
      src="/listing-preview"
      onLoad={sendPreview}
      style={{ display: 'block', width: '100%', height, border: 0 }}
    />
  )
}
