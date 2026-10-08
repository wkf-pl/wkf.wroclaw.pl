import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'

import sharp from 'sharp'
import { describe, expect, it } from 'vitest'

const blockThumbnailDirectory = resolve(process.cwd(), 'public/assets/block-thumbnails')
const referenceThumbnailName = 'rich-text.png'
const maximumMeasuredRunLength = 14
const minimumMeasuredRunLength = 2

async function measureMedianStrokeRun(thumbnailName: string): Promise<number> {
  const { data, info } = await sharp(resolve(blockThumbnailDirectory, thumbnailName))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const strokeRuns: number[] = []

  function collectRuns(primarySize: number, secondarySize: number, horizontal: boolean): void {
    for (let primary = 0; primary < primarySize; primary += 1) {
      let runLength = 0

      for (let secondary = 0; secondary <= secondarySize; secondary += 1) {
        const x = horizontal ? secondary : primary
        const y = horizontal ? primary : secondary
        const alpha = secondary < secondarySize ? data[(y * info.width + x) * info.channels + 3] : 0

        if (alpha >= 128) {
          runLength += 1
          continue
        }

        if (runLength >= minimumMeasuredRunLength && runLength <= maximumMeasuredRunLength) {
          strokeRuns.push(runLength)
        }
        runLength = 0
      }
    }
  }

  collectRuns(info.height, info.width, true)
  collectRuns(info.width, info.height, false)
  strokeRuns.sort((left, right) => left - right)

  if (strokeRuns.length === 0) throw new Error(`No measurable strokes in ${thumbnailName}`)
  return strokeRuns[Math.floor(strokeRuns.length / 2)]
}

describe('block thumbnails', () => {
  it('keeps every line weight within the visual tolerance of the Content thumbnail', async () => {
    const thumbnailNames = readdirSync(blockThumbnailDirectory)
      .filter((name) => name.endsWith('.png'))
      .sort()
    const referenceStrokeRun = await measureMedianStrokeRun(referenceThumbnailName)
    const measurements = await Promise.all(
      thumbnailNames.map(async (name) => ({
        name,
        strokeRun: await measureMedianStrokeRun(name),
      })),
    )
    const outliers = measurements.filter(
      ({ strokeRun }) => strokeRun < referenceStrokeRun - 2 || strokeRun > referenceStrokeRun,
    )

    expect(referenceStrokeRun).toBe(6)
    expect(outliers).toEqual([])
  })
})
