'use client'

import { FieldLabel, useDocumentInfo, useField, useFormFields } from '@payloadcms/ui'
import Image from 'next/image'
import type { JSONFieldClientComponent } from 'payload'
import { useEffect, useState } from 'react'

import { getMemberProfileImageURL } from '@/modules/members/member-profile-image'
import {
  memberProfilePhotoMimeTypes,
  memberProfilePhotoSizeLimit,
} from '@/modules/members/member-profile-photo-options'
import type { MemberProfile } from '@/payload-types'

export const MemberProfilePhotoField: JSONFieldClientComponent = ({ path, readOnly }) => {
  const { id } = useDocumentInfo()
  const { disabled, setValue, value } = useField<MemberProfile['photoChange']>({ path })
  const published = useFormFields(([fields]) => fields.photo?.value as MemberProfile['photo'])
  const draft = useFormFields(([fields]) => fields.draftPhoto?.value as MemberProfile['draftPhoto'])
  const [error, setError] = useState('')
  const photo = draft && 'removed' in draft ? null : (draft ?? published)
  const src = value?.remove
    ? null
    : value?.data
      ? `data:${value.mimeType};base64,${value.data}`
      : photo && id !== undefined && id !== null
        ? getMemberProfileImageURL({ id: Number(id), photo }, 'card')
        : null

  const [pendingFile, setPendingFile] = useState<File>()
  useEffect(() => {
    if (!pendingFile) return

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const encoded = reader.result.split(',', 2)[1]
        setPendingFile(undefined)
        setValue({ data: encoded, mimeType: pendingFile.type })
      }
    }
    reader.onerror = () => setError('Nie udało się odczytać pliku.')
    reader.readAsDataURL(pendingFile)
    return () => {
      if (reader.readyState === FileReader.LOADING) reader.abort()
    }
  }, [pendingFile, setValue])

  return (
    <div className="field-type">
      <FieldLabel label="Zdjęcie" path={path} />
      {src && <Image alt="Zdjęcie wizytówki" height={96} src={src} unoptimized width={96} />}
      <div>
        <input
          accept={memberProfilePhotoMimeTypes.join(',')}
          disabled={readOnly || disabled}
          id={`field-${path}`}
          onChange={(event) => {
            const file = event.target.files?.[0]
            event.target.value = ''
            if (!file) return
            if (file.size > memberProfilePhotoSizeLimit) {
              setError('Zdjęcie profilowe może mieć najwyżej 5 MiB.')
              return
            }
            setError('')
            setPendingFile(file)
          }}
          type="file"
        />
        {src && !readOnly && !disabled && (
          <button
            type="button"
            onClick={() => {
              setPendingFile(undefined)
              setValue({ remove: true })
            }}
          >
            Usuń zdjęcie
          </button>
        )}
      </div>
      {error && <p role="alert">{error}</p>}
    </div>
  )
}
