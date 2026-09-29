'use client'

import { Link, Tooltip, useConfig, useListRelationships } from '@payloadcms/ui'
import type {
  DefaultCellComponentProps,
  EmailFieldClient,
  RelationshipFieldClient,
  TextFieldClient,
} from 'payload'
import { formatAdminURL } from 'payload/shared'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'

import { getFormRelationshipId } from '@/lib/relationships'
import type { User } from '@/payload-types'

type UserIdentityProperties = {
  displayName?: null | string
  email?: null | string
  id?: number | string
}

export function UserIdentity({ displayName, email }: UserIdentityProperties) {
  const [showTooltip, setShowTooltip] = useState(false)
  const label = displayName?.trim() || email || 'Użytkownik'

  return (
    <span
      aria-label={email ? `${label}, ${email}` : label}
      className="wkf-user-identity"
      onBlur={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      tabIndex={email ? 0 : undefined}
    >
      {email ? <Tooltip show={showTooltip}>{email}</Tooltip> : null}
      {label}
    </span>
  )
}

export function UserDisplayNameCell({
  cellData,
  collectionSlug,
  linkURL,
  rowData,
}: DefaultCellComponentProps<TextFieldClient>) {
  return (
    <UserDocumentLink collectionSlug={collectionSlug} linkURL={linkURL} rowData={rowData}>
      <UserIdentity
        displayName={typeof cellData === 'string' ? cellData : null}
        email={getStringProperty(rowData, 'email')}
      />
    </UserDocumentLink>
  )
}

export function UserEmailCell({
  cellData,
  collectionSlug,
  linkURL,
  rowData,
}: DefaultCellComponentProps<EmailFieldClient>) {
  return (
    <UserDocumentLink collectionSlug={collectionSlug} linkURL={linkURL} rowData={rowData}>
      {typeof cellData === 'string' ? cellData : '—'}
    </UserDocumentLink>
  )
}

function UserDocumentLink({
  children,
  collectionSlug,
  linkURL,
  rowData,
}: {
  children: ReactNode
  collectionSlug: string
  linkURL?: string
  rowData: Record<string, unknown>
}) {
  const {
    config: {
      routes: { admin: adminRoute },
    },
  } = useConfig()

  if (rowData.id === null || rowData.id === undefined) {
    return children
  }

  const userDocumentURL =
    linkURL ??
    formatAdminURL({
      adminRoute,
      path: `/collections/${collectionSlug}/${encodeURIComponent(String(rowData.id))}`,
    })

  return (
    <Link href={userDocumentURL} prefetch={false}>
      {children}
    </Link>
  )
}

export function UserRelationshipCell({
  cellData,
}: DefaultCellComponentProps<RelationshipFieldClient>) {
  const populatedUser = getPopulatedUser(cellData)
  const userID = populatedUser?.id ?? getFormRelationshipId(cellData) ?? null
  const { documents, getRelationships } = useListRelationships()

  useEffect(() => {
    if (userID !== null && !populatedUser && documents.users?.[userID] === undefined) {
      getRelationships([{ relationTo: 'users', value: userID }])
    }
  }, [documents.users, getRelationships, populatedUser, userID])

  const relatedUser =
    populatedUser ?? getUserFromRelationshipDocuments(documents.users?.[userID ?? ''])

  if (!relatedUser) {
    return <span>{userID === null ? '—' : 'Ładowanie…'}</span>
  }

  return <UserIdentity displayName={relatedUser.displayName} email={relatedUser.email} />
}

function getPopulatedUser(
  value: unknown,
): (UserIdentityProperties & { id: number | string }) | null {
  if (!isRecord(value) || typeof value.id === 'undefined') {
    return null
  }

  if (typeof value.id !== 'number' && typeof value.id !== 'string') {
    return null
  }

  return {
    displayName: getStringProperty(value, 'displayName'),
    email: getStringProperty(value, 'email'),
    id: value.id,
  }
}

function getStringProperty(value: unknown, key: string): null | string {
  if (!isRecord(value)) {
    return null
  }

  const property = value[key]
  return typeof property === 'string' ? property : null
}

function getUserFromRelationshipDocuments(value: false | null | object | undefined): User | null {
  return value && 'id' in value ? (value as User) : null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
