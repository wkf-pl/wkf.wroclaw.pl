import sharp from 'sharp'
import { describe, expect, it } from 'vitest'

import { createMediaImageSet, createProfileImageSet } from '@/modules/media/image-set'

describe('image sets', () => {
  it('orients the full-resolution image and removes embedded metadata by default', async () => {
    const source = await sharp({
      create: { width: 810, height: 520, channels: 3, background: '#332435' },
    })
      .jpeg()
      .withMetadata({ orientation: 6 })
      .withExifMerge({
        IFD0: { Artist: 'Example Artist' },
        IFD2: { DateTimeOriginal: '2020:01:02 03:04:05' },
        IFD3: { GPSLatitudeRef: 'N', GPSLatitude: '51/1 6/1 0/1' },
      })
      .toBuffer()

    const image = await createMediaImageSet(source)
    expect(image?.main).toMatchObject({ width: 520, height: 810 })
    const metadata = await sharp(image!.main.buffer).metadata()
    expect(metadata.format).toBe('webp')
    expect(metadata.exif).toBeUndefined()
    expect(metadata.xmp).toBeUndefined()
    expect(metadata.iptc).toBeUndefined()

    const retained = await createMediaImageSet(source, false)
    const retainedMetadata = await sharp(retained!.main.buffer).metadata()
    expect(retainedMetadata.orientation).toBe(1)
    expect(retainedMetadata.exif?.includes('Example Artist')).toBe(true)
    for (const variant of retained!.variants) {
      expect((await sharp(variant.buffer).metadata()).exif).toBeUndefined()
    }
  })

  it('keeps PNG pixels and transparency and skips oversized variants', async () => {
    const source = await sharp({
      create: { width: 32, height: 16, channels: 4, background: '#1257b17f' },
    })
      .png()
      .toBuffer()
    const image = await createMediaImageSet(source)
    expect(image?.variants).toEqual([])
    const originalPixels = await sharp(source).raw().toBuffer()
    expect(await sharp(image!.main.buffer).raw().toBuffer()).toEqual(originalPixels)
  })

  it('keeps the profile dimensions and retains metadata only for the larger photo on request', async () => {
    const source = await sharp({
      create: { width: 540, height: 600, channels: 3, background: '#ae8282' },
    })
      .jpeg()
      .withExif({ IFD0: { Artist: 'Example Artist' } })
      .toBuffer()
    const photo = await createProfileImageSet(source, false)
    expect(photo.card).toMatchObject({ width: 192, height: 192 })
    expect(photo.profile).toMatchObject({ width: 512, height: 512 })
    expect((await sharp(photo.card.buffer).metadata()).exif).toBeUndefined()
    expect((await sharp(photo.profile.buffer).metadata()).exif?.includes('Example Artist')).toBe(
      true,
    )
  })

  it('accepts static WebP inputs', async () => {
    const source = await sharp({
      create: { width: 600, height: 320, channels: 3, background: '#ae8282' },
    })
      .webp()
      .toBuffer()
    const image = await createMediaImageSet(source)
    expect(image?.main).toMatchObject({ width: 600, height: 320 })
    expect((await sharp(image!.main.buffer).metadata()).format).toBe('webp')
  })

  it('keeps AVIF files on the native upload path without WebP variants', async () => {
    const source = await sharp({
      create: { width: 600, height: 320, channels: 3, background: '#ae8282' },
    })
      .avif()
      .toBuffer()
    expect(await createMediaImageSet(source)).toBeNull()
  })

  it('keeps GIF files on the established media path and rejects invalid profile input', async () => {
    const source = await sharp({
      create: { width: 24, height: 24, channels: 3, background: '#e8c008' },
    })
      .gif()
      .toBuffer()
    expect(await createMediaImageSet(source)).toBeNull()
    await expect(createProfileImageSet(source)).rejects.toThrow()
    await expect(createMediaImageSet(Buffer.from('damaged'))).rejects.toThrow()
  })

  it('preserves animated PNG files even when Sharp only reports the default frame', async () => {
    const animatedPNG = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAACGFjVEwAAAACAAAAAPONk3AAAAAaZmNUTAAAAAAAAAACAAAAAgAAAAAAAAAAAGQD6AAAAVWPHQAAABZJREFUeJxj/M/AwMDAwMTAwMDAwAAADR0BA2rCm+kAAAAaZmNUTAAAAAEAAAACAAAAAgAAAAAAAAAAAGQD6AAAmiZlyQAAABpmZEFUAAAAAnicY2Rg+M/AwMDEwMDAwMAAAAsfAQM5oA0PAAAAAElFTkSuQmCC',
      'base64',
    )
    expect(await createMediaImageSet(animatedPNG)).toBeNull()
    await expect(createProfileImageSet(animatedPNG)).rejects.toThrow()
  })
})
