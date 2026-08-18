'use client'

import { useConfig, useFormFields, usePayloadAPI, useRowLabel } from '@payloadcms/ui'
import { formatAdminURL } from 'payload/shared'

type RelationshipIdentity = {
  id?: number | string
  name?: null | string
  publicName?: null | string
}

type RowData = Record<string, unknown>

function getIdentity(value: unknown): RelationshipIdentity | null {
  if (typeof value === 'number' || typeof value === 'string') return { id: value }
  if (!value || typeof value !== 'object') return null

  const identity = value as RelationshipIdentity
  return typeof identity.id === 'number' || typeof identity.id === 'string' ? identity : null
}

function RelationshipRowLabel({
  collection,
  fallback,
  fieldName,
  prefix,
  titleField,
}: {
  collection: 'member-profiles' | 'partners'
  fallback: string
  fieldName: 'partner' | 'profile'
  prefix: string
  titleField: 'name' | 'publicName'
}) {
  const { data, path, rowNumber } = useRowLabel<RowData>()
  const liveValue = useFormFields(([fields]) => fields[`${path}.${fieldName}`]?.value)
  const identity = getIdentity(liveValue) ?? getIdentity(data[fieldName])
  const {
    config: {
      routes: { api: apiRoute },
      serverURL,
    },
  } = useConfig()
  const url = identity?.id
    ? formatAdminURL({ apiRoute, path: `/${collection}/${identity.id}`, serverURL })
    : ''
  const [{ data: loadedDocument }] = usePayloadAPI(url, {
    initialParams: { depth: 0, select: { [titleField]: true } },
  })
  const loadedIdentity =
    loadedDocument && typeof loadedDocument === 'object'
      ? (loadedDocument as RelationshipIdentity)
      : null
  const title = identity?.[titleField]?.trim() || loadedIdentity?.[titleField]?.trim()

  return (
    <span>
      <strong>{prefix}</strong>: {title || `${fallback} ${(rowNumber ?? 0) + 1}`}
    </span>
  )
}

export function EventOrganizerRowLabel() {
  return (
    <RelationshipRowLabel
      collection="member-profiles"
      fallback="Organizator"
      fieldName="profile"
      prefix="Organizator"
      titleField="publicName"
    />
  )
}

export function EventPartnerRowLabel() {
  return (
    <RelationshipRowLabel
      collection="partners"
      fallback="Partner"
      fieldName="partner"
      prefix="Partner"
      titleField="name"
    />
  )
}
