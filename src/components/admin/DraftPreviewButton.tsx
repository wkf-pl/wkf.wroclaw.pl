'use client'

import {
  Button,
  toast,
  useConfig,
  useDocumentInfo,
  useForm,
  useFormFields,
  useFormProcessing,
  useLocale,
} from '@payloadcms/ui'
import { formatAdminURL } from 'payload/shared'
import { useCallback, useState } from 'react'

import { createDraftPreviewURL } from '@/modules/content/draft-preview'

export function DraftPreviewButton() {
  const {
    config: {
      routes: { api },
    },
  } = useConfig()
  const { collectionSlug, id, setUnpublishedVersionCount, uploadStatus } = useDocumentInfo()
  const { submit } = useForm()
  const slug = useFormFields<unknown>(([fields]) => fields.slug?.value)
  const isFormProcessing = useFormProcessing()
  const { code: locale } = useLocale()
  const [isSaving, setIsSaving] = useState(false)
  const previewURL =
    collectionSlug === 'pages' || collectionSlug === 'posts'
      ? createDraftPreviewURL(collectionSlug, { id, slug })
      : null

  const saveDraftAndOpenPreview = useCallback(async () => {
    if (!collectionSlug || !id || !previewURL || isSaving) {
      return
    }

    const previewWindow = window.open('about:blank', '_blank')
    if (previewWindow) {
      previewWindow.opener = null
    }

    setIsSaving(true)

    try {
      const action = formatAdminURL({
        apiRoute: api,
        path: `/${collectionSlug}/${id}?locale=${locale}&depth=0&fallback-locale=null&draft=true`,
      })
      const result = await submit({
        action,
        method: 'PATCH',
        overrides: { _status: 'draft' },
        skipValidation: true,
      })

      if (!result?.res.ok) {
        previewWindow?.close()
        return
      }

      setUnpublishedVersionCount((count) => count + 1)

      if (previewWindow) {
        previewWindow.location.href = previewURL
      } else {
        toast.error('Przeglądarka zablokowała otwarcie podglądu w nowej karcie.')
      }
    } finally {
      setIsSaving(false)
    }
  }, [api, collectionSlug, id, isSaving, locale, previewURL, setUnpublishedVersionCount, submit])

  if (!previewURL) {
    return null
  }

  return (
    <Button
      aria-label="Podgląd"
      buttonStyle="secondary"
      disabled={isFormProcessing || isSaving || uploadStatus === 'uploading'}
      id="preview-button"
      margin={false}
      onClick={() => void saveDraftAndOpenPreview()}
      size="medium"
    >
      {isSaving ? 'Zapisywanie…' : 'Podgląd'}
    </Button>
  )
}
