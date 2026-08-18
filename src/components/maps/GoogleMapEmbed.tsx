type GoogleMapEmbedProperties = {
  src: string
  title?: string
}

export function GoogleMapEmbed({
  src,
  title = 'Mapa miejsca wydarzenia',
}: GoogleMapEmbedProperties) {
  return (
    <iframe
      allowFullScreen
      className="googleMapEmbed"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      src={src}
      title={title}
    />
  )
}
