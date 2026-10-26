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
  useServerFunctions,
  useTranslation,
} from '@payloadcms/ui'
import { formatAdminURL } from 'payload/shared'
import { useCallback, useRef, useState } from 'react'

import {
  createDraftPreviewURL,
  createGlobalDraftPreviewURL,
  isDraftPreviewGlobal,
} from '@/modules/content/draft-preview'

export function DraftPreviewButton() {
  const {
    config: {
      routes: { api },
    },
  } = useConfig()
  const {
    collectionSlug,
    docPermissions,
    getDocPreferences,
    globalSlug,
    id,
    setUnpublishedVersionCount,
    uploadStatus,
  } = useDocumentInfo()
  const { dispatchFields, getFields, setIsValid, setSubmitted, submit } = useForm()
  const slug = useFormFields<unknown>(([fields]) => fields.slug?.value)
  const isFormProcessing = useFormProcessing()
  const { code: locale } = useLocale()
  const { getFormState } = useServerFunctions()
  const { t } = useTranslation()
  const previousFormState = useRef(getFields())
  const [isSaving, setIsSaving] = useState(false)
  const previewURL =
    collectionSlug === 'pages' || collectionSlug === 'posts'
      ? createDraftPreviewURL(collectionSlug, { id, slug })
      : isDraftPreviewGlobal(globalSlug)
        ? createGlobalDraftPreviewURL(globalSlug)
        : null
  const entitySlug = collectionSlug ?? globalSlug

  const saveDraftAndOpenPreview = useCallback(async () => {
    if (!entitySlug || (collectionSlug && !id) || !previewURL || isSaving) {
      return
    }

    const previewWindow = window.open('about:blank', '_blank')
    if (previewWindow) {
      previewWindow.opener = null
    }

    setIsSaving(true)

    try {
      const currentFormState = getFields()
      previousFormState.current = currentFormState
      const validationResult = await getFormState({
        collectionSlug,
        docPermissions,
        docPreferences: await getDocPreferences(),
        formState: currentFormState,
        globalSlug,
        id,
        locale,
        operation: 'update',
        renderAllFields: false,
        schemaPath: entitySlug,
        skipValidation: false,
      })

      if (!('state' in validationResult) || !validationResult.state) {
        previewWindow?.close()
        toast.error('Nie udało się sprawdzić treści przed otwarciem podglądu.')
        return
      }

      const isValid = Object.values(validationResult.state).every((field) => field.valid !== false)
      if (!isValid) {
        dispatchFields({
          prevStateRef: previousFormState,
          serverState: validationResult.state,
          type: 'MERGE_SERVER_STATE',
        })
        setIsValid(false)
        setSubmitted(true)
        previewWindow?.close()
        toast.error(t('error:correctInvalidFields'))
        return
      }

      const actionPath: `/${string}` = collectionSlug
        ? `/${collectionSlug}/${id}`
        : `/globals/${globalSlug}`
      const actionPathWithQuery: `/${string}` = `${actionPath}?locale=${locale}&depth=0&fallback-locale=null&draft=true`
      const action = formatAdminURL({
        apiRoute: api,
        path: actionPathWithQuery,
      })
      const result = await submit({
        action,
        method: collectionSlug ? 'PATCH' : 'POST',
        overrides: { _status: 'draft' },
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
  }, [
    api,
    collectionSlug,
    dispatchFields,
    docPermissions,
    entitySlug,
    getDocPreferences,
    getFields,
    getFormState,
    globalSlug,
    id,
    isSaving,
    locale,
    previewURL,
    previousFormState,
    setIsValid,
    setSubmitted,
    setUnpublishedVersionCount,
    submit,
    t,
  ])

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
