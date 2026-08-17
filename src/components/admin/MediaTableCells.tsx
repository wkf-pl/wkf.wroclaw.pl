'use client'

import { useConfig, useListRelationships } from '@payloadcms/ui'
import type { DefaultCellComponentProps, NumberFieldClient, TextFieldClient } from 'payload'
import { formatAdminURL } from 'payload/shared'
import { useEffect } from 'react'

type TaxonomyDocument = {
  id?: number | string
  name?: string
}

function getBytes(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null
}

export function formatFileSize(value: unknown): string {
  const bytes = getBytes(value)
  if (bytes === null) return '—'
  if (bytes < 1024) return `${bytes} B`

  const units = ['kB', 'MB', 'GB']
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length)
  const formattedValue = bytes / 1024 ** unitIndex
  const maximumFractionDigits = formattedValue < 10 ? 1 : 0

  return `${new Intl.NumberFormat('pl-PL', { maximumFractionDigits }).format(formattedValue)} ${units[unitIndex - 1]}`
}

export function FileSizeCell({ cellData }: DefaultCellComponentProps<NumberFieldClient>) {
  return <span style={{ display: 'block', textAlign: 'right' }}>{formatFileSize(cellData)}</span>
}

export function NumberCell({ cellData }: DefaultCellComponentProps<NumberFieldClient>) {
  return <span style={{ display: 'block', textAlign: 'right' }}>{getBytes(cellData) ?? '—'}</span>
}

export function URLCell({ cellData }: DefaultCellComponentProps<TextFieldClient>) {
  const url = typeof cellData === 'string' ? cellData : ''

  return url ? (
    <a href={url} onClick={(event) => event.stopPropagation()} rel="noreferrer" target="_blank">
      {url}
    </a>
  ) : (
    <span>—</span>
  )
}

export function TaxonomyCell({
  cellData,
  field,
}: DefaultCellComponentProps<TextFieldClient>) {
  const relationTo = field.name === 'categories' ? 'categories' : 'tags'
  const relationshipIDs = Array.isArray(cellData)
    ? cellData.flatMap((value) => {
        if (typeof value === 'number' || typeof value === 'string') return [value]
        if (value && typeof value === 'object' && 'id' in value) {
          const id = value.id
          return typeof id === 'number' || typeof id === 'string' ? [id] : []
        }

        return []
      })
    : []
  const { documents, getRelationships } = useListRelationships()
  const relatedDocuments = documents[relationTo] as Record<string, TaxonomyDocument> | undefined
  const missingRelationships = relationshipIDs.filter((id) => relatedDocuments?.[id] === undefined)

  useEffect(() => {
    if (missingRelationships.length) {
      getRelationships(missingRelationships.map((value) => ({ relationTo, value })))
    }
  }, [getRelationships, missingRelationships, relationTo])

  const {
    config: {
      routes: { admin: adminRoute },
      serverURL,
    },
  } = useConfig()

  if (!relationshipIDs.length) return <span>—</span>

  return (
    <span>
      {relationshipIDs.map((id, index) => {
        const document = relatedDocuments?.[id]
        const href = formatAdminURL({ adminRoute, path: `/collections/${relationTo}/${id}`, serverURL })

        return (
          <span key={id}>
            {index ? ', ' : null}
            <a href={href} onClick={(event) => event.stopPropagation()}>{document?.name ?? 'Ładowanie…'}</a>
          </span>
        )
      })}
    </span>
  )
}
