'use client'

import { useEffect, useRef, useState } from 'react'

import { ContentPresentation } from '@/app/(frontend)/_components/ContentPresentation'
import type { ResolvedContentPresentation } from '@/modules/content/content-presentation'
import { ConfiguredContentList } from '@/app/(frontend)/_components/ConfiguredContentList'
import type { ContentListingPresentation } from '@/modules/content/content-listing-presentation'
import { resolveListingView } from '@/modules/content/listing-view'

export function ListingPreviewContent() {
  const [preview, setPreview] = useState<{
    items: ContentListingPresentation[]
    view: ReturnType<typeof resolveListingView>['view']
    presentation?: ResolvedContentPresentation
  }>()
  const content = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const receivePreview = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== window.parent ||
        event.data?.type !== 'wkf:listing-preview'
      )
        return
      if (!Array.isArray(event.data.items)) return
      setPreview({
        items: event.data.items,
        view: resolveListingView({ preset: 'custom', overrides: event.data.view }).view,
        presentation: event.data.presentation,
      })
    }
    window.addEventListener('message', receivePreview)
    window.parent.postMessage({ type: 'wkf:listing-preview-ready' }, window.location.origin)
    return () => window.removeEventListener('message', receivePreview)
  }, [])

  useEffect(() => {
    const element = content.current
    if (!element) return
    const reportHeight = () =>
      window.parent.postMessage(
        { type: 'wkf:listing-preview-height', height: element.getBoundingClientRect().height },
        window.location.origin,
      )
    const observer = new ResizeObserver(reportHeight)
    observer.observe(element)
    reportHeight()
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={content} style={{ display: 'flow-root' }}>
      {preview ? (
        <ContentPresentation
          placement="block"
          presentation={
            preview.presentation ?? {
              frame: 'none',
              surface: 'transparent',
              objectPosition: 'center center',
            }
          }
        >
          <div className="listingBlock">
            <ConfiguredContentList items={preview.items} view={preview.view} />
          </div>
        </ContentPresentation>
      ) : (
        <p role="status">Ładowanie podglądu…</p>
      )}
    </div>
  )
}
