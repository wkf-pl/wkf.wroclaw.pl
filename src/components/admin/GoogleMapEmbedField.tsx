'use client'

import { useField } from '@payloadcms/ui'
import type { TextFieldClientProps } from 'payload'
import { useDeferredValue } from 'react'

import { GoogleMapEmbed } from '@/components/maps/GoogleMapEmbed'
import { normalizeGoogleMapsEmbed, validateGoogleMapsEmbed } from '@/modules/events/map-embed'
import { BlurValidatedTextInput } from './BlurValidatedTextField'

export function GoogleMapEmbedField(properties: TextFieldClientProps) {
  const { value } = useField<null | string>({ potentiallyStalePath: properties.path })
  const deferredValue = useDeferredValue(value)
  const embedSource = normalizeGoogleMapsEmbed(deferredValue)

  return (
    <BlurValidatedTextInput properties={properties} validateValue={validateGoogleMapsEmbed}>
      {embedSource ? (
        <div style={{ aspectRatio: '16 / 9', marginTop: '1rem', maxWidth: '48rem' }}>
          <GoogleMapEmbed src={embedSource} title="Podgląd mapy wydarzenia" />
        </div>
      ) : null}
    </BlurValidatedTextInput>
  )
}
