'use client'

import { TextField, useField } from '@payloadcms/ui'
import type { TextFieldClientProps } from 'payload'
import type { ClipboardEvent } from 'react'

import { parseCustomTarget, type CustomScheme } from '@/modules/navigation/custom-target'

export function CustomAddressField(properties: TextFieldClientProps) {
  const schemePath = properties.path.replace(/customAddress$/, 'customScheme')
  const { setValue: setAddress } = useField<null | string>({
    potentiallyStalePath: properties.path,
  })
  const { setValue: setScheme } = useField<CustomScheme>({
    potentiallyStalePath: schemePath,
  })

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    const parsedTarget = parseCustomTarget(event.clipboardData.getData('text'))
    if (!parsedTarget) {
      return
    }

    event.preventDefault()
    setScheme(parsedTarget.scheme)
    setAddress(parsedTarget.address)
  }

  return (
    <div onPaste={handlePaste}>
      <TextField {...properties} />
    </div>
  )
}
