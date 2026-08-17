'use client'

import { SelectField, useAuth, useDocumentInfo, useField } from '@payloadcms/ui'
import type { SelectFieldClientProps } from 'payload'
import { useEffect, useMemo } from 'react'

import type { User } from '@/payload-types'
import { documentTypeOptions } from '@/modules/documents/document-types'
import { getDocumentPermissionResource } from '@/modules/membership/permission-resources'
import { clientUserHasResourcePermission } from '@/modules/membership/role-permissions'

export function DocumentTypeField(properties: SelectFieldClientProps) {
  const { user } = useAuth<User>()
  const { isEditing } = useDocumentInfo()
  const { setValue } = useField<string>({ potentiallyStalePath: properties.path })
  const options = useMemo(
    () =>
      documentTypeOptions.filter(
        ({ value }) =>
          (isEditing && value === properties.value) ||
          clientUserHasResourcePermission(user, getDocumentPermissionResource(value), 'create'),
      ),
    [isEditing, properties.value, user],
  )

  useEffect(() => {
    if (
      !isEditing &&
      options.length > 0 &&
      !options.some(({ value }) => value === properties.value)
    ) {
      setValue(options[0]!.value)
    }
  }, [isEditing, options, properties.value, setValue])

  return <SelectField {...properties} field={{ ...properties.field, options: [...options] }} />
}
