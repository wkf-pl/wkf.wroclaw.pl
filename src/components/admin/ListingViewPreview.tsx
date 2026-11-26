'use client'

import { Button, useFormFields } from '@payloadcms/ui'
import { getDataByPath } from 'payload/shared'
import { useEffect, useRef, useState } from 'react'

import type { ResolvedContentPresentation } from '@/modules/content/content-presentation'
import type { ContentListingPresentation } from '@/modules/content/content-listing-presentation'
import type { ListingDecorationMedia } from '@/modules/content/listing-decoration'
import type { ListingView } from '@/modules/content/listing-view'

import { ListingPreviewFrame } from './ListingPreviewFrame'
import styles from './ListingViewField.module.css'

const previewFields = [
  'frame',
  'surface',
  'surfaceImage',
  'surfaceHorizontalPosition',
  'surfaceVerticalPosition',
  'selectionMode',
  'contextRelation',
  'conditions',
  'includeInactiveLocations',
  'items',
  'pageSize',
  'sort',
  'sources',
]

type PreviewResponse = {
  items?: ContentListingPresentation[]
  missingContext?: boolean
  presentation?: ResolvedContentPresentation
  view?: ListingView
  media?: ListingDecorationMedia
}

export function ListingViewPreview({
  appearance,
  fallback,
  libraryURL,
  blockPath,
  view,
}: {
  appearance: unknown
  fallback: string
  libraryURL: string
  blockPath: string
  view: ListingView
}) {
  const previewBody = useFormFields(([fields]) => {
    const blockData = getDataByPath(fields, blockPath) as Record<string, unknown> | undefined
    const selection = Object.fromEntries(
      previewFields.map((name) => [
        name,
        blockData?.[name] ?? fields[`${blockPath}.${name}`]?.value,
      ]),
    )
    return JSON.stringify({
      block: { ...selection, appearance, view: fallback },
      previewTarget: fields.previewTarget?.value,
    })
  })
  const initialBody = useRef(previewBody)
  const [preview, setPreview] = useState<PreviewResponse & { body: string; error?: boolean }>()
  const [narrow, setNarrow] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    async function loadPreview() {
      try {
        const response = await fetch(`${libraryURL}/preview`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: previewBody,
          signal: controller.signal,
        })
        if (!response.ok) throw new Error('Could not load listing preview')
        const data = (await response.json()) as PreviewResponse
        if (!controller.signal.aborted) setPreview({ ...data, body: previewBody })
      } catch {
        if (!controller.signal.aborted) setPreview({ body: previewBody, error: true })
      }
    }
    const timeout = window.setTimeout(
      () => void loadPreview(),
      previewBody === initialBody.current ? 0 : 300,
    )
    return () => {
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [libraryURL, previewBody])

  return (
    <>
      <div className={styles.previewModes} aria-label="Szerokość podglądu">
        <Button
          buttonStyle={!narrow ? 'primary' : 'secondary'}
          extraButtonProps={{ 'aria-pressed': !narrow }}
          margin={false}
          size="medium"
          type="button"
          onClick={() => setNarrow(false)}
        >
          Szeroki
        </Button>
        <Button
          buttonStyle={narrow ? 'primary' : 'secondary'}
          extraButtonProps={{ 'aria-pressed': narrow }}
          margin={false}
          size="medium"
          type="button"
          onClick={() => setNarrow(true)}
        >
          Wąski
        </Button>
      </div>
      <div
        className={`${styles.previewCanvas} ${narrow ? styles.narrow : ''}`}
        aria-busy={preview?.body !== previewBody}
      >
        {preview?.body !== previewBody ? (
          <p role="status">Ładowanie podglądu…</p>
        ) : preview.error ? (
          <p role="alert">Nie udało się pobrać podglądu. Sprawdź ustawienia treści.</p>
        ) : preview.missingContext ? (
          <p>Wybierz w szablonie strony element do podglądu relacji.</p>
        ) : (
          <ListingPreviewFrame
            items={preview.items ?? []}
            view={preview.view ?? view}
            media={preview.media}
            presentation={preview.presentation}
          />
        )}
      </div>
    </>
  )
}
