'use client'

import { useField } from '@payloadcms/ui'
import type { TextFieldClientProps } from 'payload'
import { useDeferredValue, useState } from 'react'

import { GoogleMapEmbed } from '@/components/maps/GoogleMapEmbed'
import { useStoredPrivacyConsent } from '@/components/privacy/useStoredPrivacyConsent'
import { normalizeGoogleMapsEmbed, validateGoogleMapsEmbed } from '@/modules/events/map-embed'
import { BlurValidatedTextInput } from './BlurValidatedTextField'

export function GoogleMapEmbedField(properties: TextFieldClientProps) {
  const { value } = useField<null | string>({ potentiallyStalePath: properties.path })
  const deferredValue = useDeferredValue(value)
  const embedSource = normalizeGoogleMapsEmbed(deferredValue)
  const preferences = useStoredPrivacyConsent()
  const [previewRequested, setPreviewRequested] = useState(false)
  const previewEnabled = previewRequested || preferences?.functional === true

  return (
    <BlurValidatedTextInput properties={properties} validateValue={validateGoogleMapsEmbed}>
      {embedSource ? (
        previewEnabled ? (
          <div style={{ aspectRatio: '16 / 9', marginTop: '1rem', width: '100%' }}>
            <GoogleMapEmbed
              externalMapURL={embedSource}
              requireConsent={false}
              src={embedSource}
              title="Podgląd mapy wydarzenia"
            />
          </div>
        ) : (
          <div className="wkf-map-preview-consent">
            <p>
              Podgląd połączy przeglądarkę z Google. Wczytaj go tylko wtedy, gdy chcesz skorzystać z
              tej zewnętrznej usługi.
            </p>
            <button onClick={() => setPreviewRequested(true)} type="button">
              Wczytaj podgląd Map Google
            </button>
          </div>
        )
      ) : null}
    </BlurValidatedTextInput>
  )
}
