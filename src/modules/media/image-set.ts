import sharp, { type Metadata, type ResizeOptions, type SharpOptions } from 'sharp'

import { mediaImageMegapixelLimit, mediaZipMegabyteLimit } from './media-upload-limits'

export type EncodedImage = {
  buffer: Buffer
  width: number
  height: number
}

export class ImageInputError extends Error {}

function isAnimated(source: Buffer, metadata: Metadata): boolean {
  if (metadata.format === 'gif' || (metadata.pages ?? 1) > 1) return true
  if (metadata.format !== 'png') return false

  // Sharp reads the default PNG frame. APNG declares its animation before the first image chunk.
  for (let offset = 8; offset + 12 <= source.length;) {
    const length = source.readUInt32BE(offset)
    if (length > source.length - offset - 12) return false
    const type = source.toString('ascii', offset + 4, offset + 8)
    if (type === 'acTL' && length === 8) return true
    if (type === 'IDAT' || type === 'IEND') return false
    offset += length + 12
  }
  return false
}

async function inspectImage(source: Buffer | string, options?: SharpOptions): Promise<Metadata> {
  try {
    const metadata = await sharp(source, options).metadata()
    if (
      !metadata.width ||
      !metadata.height ||
      !(
        metadata.format === 'jpeg' ||
        metadata.format === 'png' ||
        metadata.format === 'webp' ||
        metadata.format === 'gif' ||
        (metadata.format === 'heif' && metadata.compression === 'av1')
      )
    ) {
      throw new Error('Unsupported image format')
    }
    return metadata
  } catch {
    throw new ImageInputError('Wybierz prawidłowy plik JPEG, PNG, WebP, AVIF lub GIF.')
  }
}

export async function validateMediaImageDimensions(source: Buffer | string): Promise<void> {
  // Inspect headers before Payload or Sharp decodes the pixels.
  const { format, width, height, pageHeight, pages } = await inspectImage(source, {
    animated: true,
    limitInputPixels: false,
  })
  if (format === 'heif') return

  const totalHeight = pageHeight ? pageHeight * (pages ?? 1) : height
  if (width * totalHeight > mediaImageMegapixelLimit * 1_000_000) {
    throw new ImageInputError(
      `Obraz ma zbyt dużo pikseli do przetworzenia (limit ${mediaImageMegapixelLimit} megapikseli). Zmniejsz jego wymiary lub udostępnij go w archiwum ZIP do ${mediaZipMegabyteLimit} MB.`,
    )
  }
}

async function encodeWebP(
  source: Buffer,
  {
    quality,
    lossless,
    resize,
    retainMetadata = false,
  }: {
    quality: number
    lossless: boolean
    resize?: ResizeOptions
    retainMetadata?: boolean
  },
): Promise<EncodedImage> {
  const image = sharp(source).autoOrient()
  if (resize) image.resize(resize)
  if (retainMetadata) image.withMetadata({ orientation: 1 })

  try {
    const { data, info } = await image.webp({ quality, lossless }).toBuffer({
      resolveWithObject: true,
    })
    return { buffer: data, width: info.width, height: info.height }
  } catch {
    throw new ImageInputError('Nie udało się odczytać lub przetworzyć obrazu.')
  }
}

export async function createMediaImageSet(
  source: Buffer,
  removeImageMetadata = true,
): Promise<{ main: EncodedImage; variants: EncodedImage[] } | null> {
  const metadata = await inspectImage(source)
  if (metadata.format === 'heif' || isAnimated(source, metadata)) return null

  const lossless = metadata.format === 'png'
  const main = await encodeWebP(source, {
    quality: 82,
    lossless,
    retainMetadata: !removeImageMetadata,
  })
  const variants: EncodedImage[] = []
  let largerSize = main.buffer.length

  for (const width of [1440, 960, 480]) {
    if (width >= main.width) continue
    const variant = await encodeWebP(source, { quality: 78, lossless, resize: { width } })
    if (variant.buffer.length < largerSize) {
      variants.unshift(variant)
      largerSize = variant.buffer.length
    }
  }

  return { main, variants }
}

export async function createProfileImageSet(
  source: Buffer,
  removeImageMetadata = true,
): Promise<{ card: EncodedImage; profile: EncodedImage }> {
  const metadata = await inspectImage(source)
  if (isAnimated(source, metadata)) {
    throw new ImageInputError('Animowane zdjęcia profilowe nie są obsługiwane.')
  }
  return {
    card: await encodeWebP(source, {
      quality: 82,
      lossless: false,
      resize: { width: 192, height: 192 },
    }),
    profile: await encodeWebP(source, {
      quality: 86,
      lossless: false,
      resize: { width: 512, height: 512 },
      retainMetadata: !removeImageMetadata,
    }),
  }
}
