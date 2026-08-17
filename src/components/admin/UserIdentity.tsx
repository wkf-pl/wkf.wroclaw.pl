'use client'

import {
  RelationshipField,
  Tooltip,
  useAuth,
  useConfig,
  useField,
  useListRelationships,
  usePayloadAPI,
} from '@payloadcms/ui'
import type {
  DefaultCellComponentProps,
  RelationshipFieldClient,
  RelationshipFieldClientProps,
  TextFieldClient,
} from 'payload'
import { formatAdminURL } from 'payload/shared'
import type { FocusEvent, MouseEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'

import type { User } from '@/payload-types'

type UserIdentityProperties = {
  displayName?: null | string
  email?: null | string
  id?: number | string
}

type UsersResponse = {
  docs?: UserIdentityProperties[]
}

const userLabelSelector = [
  '.relationship--single-value__text',
  '.relationship--multi-value-label',
  '.rs__option',
].join(', ')

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
  rowData,
}: DefaultCellComponentProps<TextFieldClient>) {
  return (
    <UserIdentity
      displayName={typeof cellData === 'string' ? cellData : null}
      email={getStringProperty(rowData, 'email')}
    />
  )
}

export function UserRelationshipCell({
  cellData,
}: DefaultCellComponentProps<RelationshipFieldClient>) {
  const populatedUser = getPopulatedUser(cellData)
  const userID = populatedUser?.id ?? getRelationshipID(cellData)
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

export function UserRelationshipField(properties: RelationshipFieldClientProps) {
  const [hoveredUser, setHoveredUser] = useState<{
    displayName: string
    id?: number | string
  } | null>(null)
  const { user: authenticatedUser } = useAuth()
  const { setValue, value: selectedUserID } = useField<null | number | string>({
    potentiallyStalePath: properties.path,
  })
  useEffect(() => {
    if (selectedUserID === null && authenticatedUser?.id !== undefined) {
      setValue(authenticatedUser.id)
    }
  }, [authenticatedUser?.id, selectedUserID, setValue])
  const {
    config: {
      routes: { api: apiRoute },
      serverURL,
    },
  } = useConfig()
  const usersURL = formatAdminURL({ apiRoute, path: '/users', serverURL })
  const [{ data }] = usePayloadAPI(usersURL, {
    initialParams: {
      depth: 0,
      limit: 1000,
      select: {
        displayName: true,
        email: true,
      },
      sort: 'displayName',
    },
  })
  const emailLookups = useMemo(
    () => createEmailLookups(data, authenticatedUser),
    [authenticatedUser, data],
  )
  const hoveredEmail = hoveredUser
    ? ((hoveredUser.id !== undefined
        ? emailLookups.byID.get(String(hoveredUser.id))
        : emailLookups.byDisplayName.get(hoveredUser.displayName)) ?? null)
    : null

  function applyEmailTooltip(event: FocusEvent<HTMLDivElement> | MouseEvent<HTMLDivElement>) {
    const eventTarget = event.target

    if (!(eventTarget instanceof Element)) {
      return
    }

    const labelElement =
      eventTarget.closest<HTMLElement>(userLabelSelector) ??
      event.currentTarget.querySelector<HTMLElement>('.relationship--single-value__text')

    if (!labelElement || !event.currentTarget.contains(labelElement)) {
      return
    }

    const displayName = labelElement.textContent?.trim()
    const userID = labelElement.matches('.relationship--single-value__text')
      ? (selectedUserID ?? undefined)
      : undefined
    setHoveredUser(displayName ? { displayName, id: userID } : null)

    const email = displayName
      ? userID !== undefined
        ? emailLookups.byID.get(String(userID))
        : emailLookups.byDisplayName.get(displayName)
      : undefined

    if (email) {
      labelElement.title = email
    }
  }

  function applySelectedUserEmailTooltip(event: MouseEvent<HTMLDivElement>) {
    const labelElement = event.currentTarget.querySelector<HTMLElement>(
      '.relationship--single-value__text',
    )
    const displayName = labelElement?.textContent?.trim()

    setHoveredUser(
      displayName
        ? {
            displayName,
            id: selectedUserID ?? undefined,
          }
        : null,
    )

    const email =
      selectedUserID !== null && selectedUserID !== undefined
        ? emailLookups.byID.get(String(selectedUserID))
        : displayName
          ? emailLookups.byDisplayName.get(displayName)
          : undefined

    if (labelElement && email) {
      labelElement.title = email
    }
  }

  return (
    <div
      className="wkf-user-relationship"
      onBlurCapture={() => setHoveredUser(null)}
      onFocusCapture={applyEmailTooltip}
      onMouseEnter={applySelectedUserEmailTooltip}
      onMouseLeave={() => setHoveredUser(null)}
      onMouseOver={applyEmailTooltip}
    >
      {hoveredEmail ? <Tooltip show>{hoveredEmail}</Tooltip> : null}
      <RelationshipField {...properties} />
    </div>
  )
}

function createEmailLookups(
  data: unknown,
  authenticatedUser?: unknown,
): {
  byDisplayName: Map<string, string>
  byID: Map<string, string>
} {
  const response = isRecord(data) ? (data as UsersResponse) : null
  const users: UserIdentityProperties[] = Array.isArray(response?.docs) ? [...response.docs] : []
  const authenticatedUserIdentity = getUserIdentity(authenticatedUser)

  if (authenticatedUserIdentity) {
    users.push(authenticatedUserIdentity)
  }
  const ambiguousDisplayNames = new Set<string>()
  const emailsByDisplayName = new Map<string, string>()
  const emailsByID = new Map<string, string>()

  for (const user of users) {
    const displayName = user.displayName?.trim()
    const email = user.email?.trim()

    if (!email) {
      continue
    }

    if (user.id !== undefined) {
      emailsByID.set(String(user.id), email)
    }

    if (!displayName || ambiguousDisplayNames.has(displayName)) {
      continue
    }

    const existingEmail = emailsByDisplayName.get(displayName)

    if (existingEmail && existingEmail !== email) {
      emailsByDisplayName.delete(displayName)
      ambiguousDisplayNames.add(displayName)
    } else {
      emailsByDisplayName.set(displayName, email)
    }
  }

  return {
    byDisplayName: emailsByDisplayName,
    byID: emailsByID,
  }
}

function getUserIdentity(value: unknown): UserIdentityProperties | null {
  if (!isRecord(value)) {
    return null
  }

  return {
    displayName: getStringProperty(value, 'displayName'),
    email: getStringProperty(value, 'email'),
    id: getRelationshipID(value) ?? undefined,
  }
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

function getRelationshipID(value: unknown): number | string | null {
  if (typeof value === 'number' || typeof value === 'string') {
    return value
  }

  if (isRecord(value) && (typeof value.value === 'number' || typeof value.value === 'string')) {
    return value.value
  }

  return null
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
