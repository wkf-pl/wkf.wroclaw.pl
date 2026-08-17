'use client'

import { useConfig, useFormFields, usePayloadAPI, useRowLabel } from '@payloadcms/ui'
import { formatAdminURL } from 'payload/shared'

type MemberProfileEntryData = {
  profile?: unknown
}

type MemberProfileIdentity = {
  id?: number | string
  publicName?: null | string
}

function getProfileIdentity(value: unknown): MemberProfileIdentity | null {
  if (typeof value === 'number' || typeof value === 'string') {
    return { id: value }
  }

  if (!value || typeof value !== 'object') {
    return null
  }

  const profile = value as MemberProfileIdentity
  return typeof profile.id === 'number' || typeof profile.id === 'string' ? profile : null
}

export function MemberProfileEntryRowLabel() {
  const { data, path, rowNumber } = useRowLabel<MemberProfileEntryData>()
  const liveProfileValue = useFormFields(([fields]) => fields[`${path}.profile`]?.value)
  const profileIdentity = getProfileIdentity(liveProfileValue) ?? getProfileIdentity(data.profile)
  const {
    config: {
      routes: { api: apiRoute },
      serverURL,
    },
  } = useConfig()
  const profileURL = profileIdentity?.id
    ? formatAdminURL({
        apiRoute,
        path: `/member-profiles/${profileIdentity.id}`,
        serverURL,
      })
    : ''
  const [{ data: loadedProfile }] = usePayloadAPI(profileURL, {
    initialParams: {
      depth: 0,
      select: { publicName: true },
    },
  })
  const loadedPublicName =
    loadedProfile && typeof loadedProfile === 'object' && 'publicName' in loadedProfile
      ? (loadedProfile as MemberProfileIdentity).publicName
      : null
  const publicName = profileIdentity?.publicName?.trim() || loadedPublicName?.trim()

  return (
    <span>
      <strong>Wizytówka</strong>: {publicName || `Wizytówka ${(rowNumber ?? 0) + 1}`}
    </span>
  )
}
