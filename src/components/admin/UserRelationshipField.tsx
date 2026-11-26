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
import { useMemo, useState } from 'react'

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
  const { value } = useField<unknown>({
    potentiallyStalePath: properties.path,
  })
  const isPolymorphic = Array.isArray(properties.field.relationTo)
  const selectedUserID =
    !isPolymorphic || (isRecord(value) && value.relationTo === 'users')
      ? getFormRelationshipId(value)
      : undefined

  const {
    config: {
      routes: { api: apiRoute },
      serverURL,
    },
  } = useConfig()
  const usersURL = formatAdminURL({ apiRoute, path: '/users', serverURL })
  const lookupID = hoveredUser?.id
  const lookupName = hoveredUser?.displayName
  const [{ data }, { setParams }] = usePayloadAPI(hoveredUser ? usersURL : '')
  const lookedUpUser = useMemo(() => {
    const response = isRecord(data) ? (data as UsersResponse) : null
    return Array.isArray(response?.docs) ? response.docs[0] : undefined
  }, [data])
  const authenticatedUserID = getFormRelationshipId(authenticatedUser)
  const emailMatches =
    lookupID === undefined
      ? lookedUpUser?.displayName === lookupName
      : String(lookedUpUser?.id) === String(lookupID)
  const hoveredEmail =
    lookupID !== undefined && String(lookupID) === String(authenticatedUserID)
      ? getStringProperty(authenticatedUser, 'email')
      : hoveredUser && emailMatches
        ? lookedUpUser?.email
        : null

  function lookupUser(displayName: string | undefined, id: number | string | undefined) {
    setHoveredUser(displayName ? { displayName, id } : null)
    if (!displayName) return
    setParams({
      depth: 0,
      limit: 1,
      select: { displayName: true, email: true, id: true },
      where: id === undefined ? { displayName: { equals: displayName } } : { id: { equals: id } },
    })
  }

  function applyEmailTooltip(event: FocusEvent<HTMLDivElement> | MouseEvent<HTMLDivElement>) {
    const eventTarget = event.target
    if (!(eventTarget instanceof Element)) return

    const labelElement =
      eventTarget.closest<HTMLElement>(userLabelSelector) ??
      event.currentTarget.querySelector<HTMLElement>('.relationship--single-value__text')
    if (!labelElement || !event.currentTarget.contains(labelElement)) return
    if (
      isPolymorphic &&
      (!labelElement.matches('.relationship--single-value__text') || selectedUserID === undefined)
    ) {
      setHoveredUser(null)
      return
    }

    const displayName = labelElement.textContent?.trim()
    const userID = labelElement.matches('.relationship--single-value__text')
      ? selectedUserID
      : undefined
    lookupUser(displayName, userID)
    if (hoveredEmail) labelElement.title = hoveredEmail
  }

  function selectCurrentUser(event: MouseEvent<HTMLDivElement>) {
    if (isPolymorphic && selectedUserID === undefined) return
    const labelElement = event.currentTarget.querySelector<HTMLElement>(
      '.relationship--single-value__text',
    )
    const displayName = labelElement?.textContent?.trim()
    lookupUser(displayName, selectedUserID)
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
