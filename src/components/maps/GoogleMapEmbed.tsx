'use client'

import Link from 'next/link'

import { usePrivacyConsent } from '@/components/privacy/PrivacyConsent'

type GoogleMapEmbedProperties = {
  externalMapURL: string
  requireConsent?: boolean
  src: string
  title?: string
}

export function GoogleMapEmbed({
  externalMapURL,
  requireConsent = true,
  src,
  title = 'Mapa miejsca wydarzenia',
}: GoogleMapEmbedProperties) {
  const { openSettings, preferences } = usePrivacyConsent()

  if (requireConsent && !preferences?.functional) {
    return (
      <div className="googleMapPlaceholder">
        <strong>Mapa czeka na Twoją zgodę</strong>
        <p>
          Osadzona mapa łączy się z Google. Możesz zmienić ustawienia prywatności albo otworzyć
          miejsce bezpośrednio w Mapach Google.
        </p>
        <div className="googleMapPlaceholderActions">
          <button onClick={openSettings} type="button">
            Ustawienia prywatności
          </button>
          <a href={externalMapURL}>Otwórz w Mapach Google</a>
        </div>
        <p className="googleMapPlaceholderPolicy">
          <Link href="/dokumenty/polityka-prywatnosci">Jak chronimy Twoją prywatność</Link>
        </p>
      </div>
    )
  }

  return (
    <iframe
      allowFullScreen
      className="googleMapEmbed"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      src={src}
      style={{ border: 0, height: '100%', width: '100%' }}
      title={title}
    />
  )
}
