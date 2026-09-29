'use client'

import {
  RelationshipField,
  Tooltip,
  useAuth,
  useConfig,
  useField,
  usePayloadAPI,
} from '@payloadcms/ui'
import type { RelationshipFieldClientProps } from 'payload'
import { formatAdminURL } from 'payload/shared'
import type { FocusEvent, MouseEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'

import { getFormRelationshipId } from '@/lib/relationships'

type UserLookup = {
  displayName?: null | string
  email?: null | string
  id?: number | string
}

type UsersResponse = {
  docs?: UserLookup[]
}

const userLabelSelector = [
  '.relationship--single-value__text',
  '.relationship--multi-value-label',
  '.rs__option',
].join(', ')

export function UserRelationshipField(properties: RelationshipFieldClientProps) {
  const [hoveredUser, setHoveredUser] = useState<{
    displayName: string
    id?: number | string
  } | null>(null)
  const { user: authenticatedUser } = useAuth()
  const { setValue, value } = useField<unknown>({ potentiallyStalePath: properties.path })
  const selectedUserID = getFormRelationshipId(value)
  useEffect(() => {
    if (selectedUserID === undefined && value === null && authenticatedUser?.id !== undefined) {
      setValue(authenticatedUser.id)
    }
  }, [authenticatedUser?.id, selectedUserID, setValue, value])

  const {
    config: {
      routes: { api: apiRoute },
      serverURL,
    },
  } = useConfig()
  const usersURL = formatAdminURL({ apiRoute, path: '/users', serverURL })
  const lookupConstraint =
    hoveredUser?.id !== undefined
      ? { id: { equals: hoveredUser.id } }
      : hoveredUser?.displayName
        ? { displayName: { equals: hoveredUser.displayName } }
        : selectedUserID !== undefined
          ? { id: { equals: selectedUserID } }
          : { id: { equals: -1 } }
  const [{ data }] = usePayloadAPI(usersURL, {
    initialParams: {
      depth: 0,
      limit: 1,
      select: { displayName: true, email: true },
      where: lookupConstraint,
    },
  })
  const lookedUpUser = useMemo(() => {
    const response = isRecord(data) ? (data as UsersResponse) : null
    return Array.isArray(response?.docs) ? response.docs[0] : undefined
  }, [data])
  const authenticatedUserID = getFormRelationshipId(authenticatedUser)
  const hoveredEmail =
    hoveredUser &&
    hoveredUser.id !== undefined &&
    String(hoveredUser.id) === String(authenticatedUserID)
      ? getStringProperty(authenticatedUser, 'email')
      : (lookedUpUser?.email ?? null)

  function applyEmailTooltip(event: FocusEvent<HTMLDivElement> | MouseEvent<HTMLDivElement>) {
    const eventTarget = event.target
    if (!(eventTarget instanceof Element)) return

    const labelElement =
      eventTarget.closest<HTMLElement>(userLabelSelector) ??
      event.currentTarget.querySelector<HTMLElement>('.relationship--single-value__text')
    if (!labelElement || !event.currentTarget.contains(labelElement)) return

    const displayName = labelElement.textContent?.trim()
    const userID = labelElement.matches('.relationship--single-value__text')
      ? selectedUserID
      : undefined
    setHoveredUser(displayName ? { displayName, id: userID } : null)
    if (hoveredEmail) labelElement.title = hoveredEmail
  }

  function selectCurrentUser(event: MouseEvent<HTMLDivElement>) {
    const labelElement = event.currentTarget.querySelector<HTMLElement>(
      '.relationship--single-value__text',
    )
    const displayName = labelElement?.textContent?.trim()
    setHoveredUser(displayName ? { displayName, id: selectedUserID } : null)
    if (labelElement && hoveredEmail) labelElement.title = hoveredEmail
  }

  return (
    <div
      className="wkf-user-relationship"
      onBlurCapture={() => setHoveredUser(null)}
      onFocusCapture={applyEmailTooltip}
      onMouseEnter={selectCurrentUser}
      onMouseLeave={() => setHoveredUser(null)}
      onMouseOver={applyEmailTooltip}
    >
      {hoveredEmail ? <Tooltip show>{hoveredEmail}</Tooltip> : null}
      <RelationshipField {...properties} />
    </div>
  )
}

function getStringProperty(value: unknown, key: string): null | string {
  if (!isRecord(value)) return null
  return typeof value[key] === 'string' ? value[key] : null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
