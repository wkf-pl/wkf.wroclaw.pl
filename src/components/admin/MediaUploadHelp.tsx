import { FieldDescription } from '@payloadcms/ui'

import {
  mediaImageMegapixelLimit,
  mediaImageMegabyteLimit,
  mediaZipMegabyteLimit,
} from '@/modules/media/media-upload-limits'

export function MediaUploadHelp() {
  return (
    <FieldDescription
      description={`Preferowane formaty to WebP i AVIF. Obrazy mogą mieć do ${mediaImageMegabyteLimit} MB. Przy konwersji obowiązuje też limit ${mediaImageMegapixelLimit} megapikseli. Większy obraz możesz udostępnić do pobrania w archiwum ZIP do ${mediaZipMegabyteLimit} MB.`}
      path="file"
    />
  )
}
