'use client'

import { useConfig, useFormFields, usePayloadAPI, useRowLabel } from '@payloadcms/ui'
import { formatAdminURL } from 'payload/shared'

type DocumentEntryData = {
  document?: unknown
}

type DocumentIdentity = {
  id?: number | string
  title?: null | string
}

function getDocumentIdentity(value: unknown): DocumentIdentity | null {
  if (typeof value === 'number' || typeof value === 'string') {
    return { id: value }
  }

  if (!value || typeof value !== 'object') {
    return null
  }

  const document = value as DocumentIdentity
  return typeof document.id === 'number' || typeof document.id === 'string' ? document : null
}

export function DocumentEntryRowLabel() {
  const { data, path } = useRowLabel<DocumentEntryData>()
  const liveDocumentValue = useFormFields(([fields]) => fields[`${path}.document`]?.value)
  const documentIdentity =
    getDocumentIdentity(liveDocumentValue) ?? getDocumentIdentity(data.document)
  const {
    config: {
      routes: { api: apiRoute },
      serverURL,
    },
  } = useConfig()
  const documentURL = documentIdentity?.id
    ? formatAdminURL({
        apiRoute,
        path: `/documents/${documentIdentity.id}`,
        serverURL,
      })
    : ''
  const [{ data: loadedDocument }] = usePayloadAPI(documentURL, {
    initialParams: {
      depth: 0,
      select: { title: true },
    },
  })
  const loadedTitle =
    loadedDocument && typeof loadedDocument === 'object' && 'title' in loadedDocument
      ? (loadedDocument as DocumentIdentity).title
      : null
  const title = documentIdentity?.title?.trim() || loadedTitle?.trim()

  return (
    <span>
      <strong>Dokument</strong>
      {title ? `: ${title}` : null}
    </span>
  )
}
