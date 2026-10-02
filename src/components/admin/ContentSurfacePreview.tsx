'use client'

import { useConfig, useFormFields, usePayloadAPI } from '@payloadcms/ui'
import type { UIFieldClientProps } from 'payload'
import { formatAdminURL } from 'payload/shared'

type MediaPreview = {
  id?: number | string
  thumbnailURL?: null | string
  url?: null | string
}

function getMediaPreview(value: unknown): MediaPreview | null {
  if (typeof value === 'number' || typeof value === 'string') return { id: value }
  if (Array.isArray(value)) return getMediaPreview(value[0])
  if (!value || typeof value !== 'object') return null

  const media = value as MediaPreview
  if (typeof media.id === 'number' || typeof media.id === 'string') return media

  if ('value' in value) return getMediaPreview(value.value)
  if ('doc' in value) return getMediaPreview(value.doc)
  return null
}

export function ContentSurfacePreview(properties: UIFieldClientProps) {
  const siblingPath = (name: string): string =>
    `${properties.path.split('.').slice(0, -1).join('.')}.${name}`
  const imageValue = useFormFields(([fields]) => fields[siblingPath('surfaceImage')]?.value)
  const horizontalPosition = useFormFields(
    ([fields]) => fields[siblingPath('surfaceHorizontalPosition')]?.value,
  )
  const verticalPosition = useFormFields(
    ([fields]) => fields[siblingPath('surfaceVerticalPosition')]?.value,
  )
  const mediaPreview = getMediaPreview(imageValue)
  const {
    config: {
      routes: { api: apiRoute },
      serverURL,
    },
  } = useConfig()
  const mediaURL = mediaPreview?.id
    ? formatAdminURL({ apiRoute, path: `/media/${mediaPreview.id}`, serverURL })
    : ''
  const [{ data: loadedMedia }] = usePayloadAPI(mediaURL, {
    // Payload derives upload URLs from the complete media document. Selecting only
    // the virtual URL fields leaves them null in the REST response.
    initialParams: { depth: 0 },
  })
  const loadedPreview = getMediaPreview(loadedMedia)
  const imageURL =
    mediaPreview?.thumbnailURL ||
    mediaPreview?.url ||
    loadedPreview?.thumbnailURL ||
    loadedPreview?.url

  if (!imageURL) return null

  const horizontal = ['left', 'center', 'right'].includes(String(horizontalPosition))
    ? String(horizontalPosition)
    : 'center'
  const vertical = ['top', 'middle', 'bottom'].includes(String(verticalPosition))
    ? String(verticalPosition) === 'middle'
      ? 'center'
      : String(verticalPosition)
    : 'center'

  return (
    <div className="wkf-surface-preview">
      {/* eslint-disable-next-line @next/next/no-img-element -- Payload media can use a runtime-configured host. */}
      <img alt="" src={imageURL} style={{ objectPosition: `${horizontal} ${vertical}` }} />
      <span aria-hidden="true" />
      <strong>Podgląd kadru i warstwy kontrastowej</strong>
    </div>
  )
}
