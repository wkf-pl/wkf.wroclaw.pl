import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import sharp from 'sharp'
import { describe, expect, it } from 'vitest'

import { RasterIcon } from '@/components/RasterIcon'
import {
  getRasterIconURL,
  rasterIconDefinitions,
  rasterIconSizes,
  selectableRasterIconNames,
} from '@/modules/icons/icon-registry'

const expectedDimensions = {
  medium: 192,
  small: 96,
} as const

type RasterIconName = Parameters<typeof getRasterIconURL>[0]

async function readVisibleBounds(iconName: RasterIconName, size: (typeof rasterIconSizes)[number]) {
  const iconPath = resolve(process.cwd(), 'public', getRasterIconURL(iconName, size).slice(1))
  const { data, info } = await sharp(iconPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  let left = info.width
  let top = info.height
  let right = -1
  let bottom = -1
  let softPixels = 0
  let solidPixels = 0

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const alpha = data[(y * info.width + x) * info.channels + 3]
      if (alpha > 0 && alpha < 240) softPixels += 1
      if (alpha >= 240) solidPixels += 1
      if (alpha < 128) continue
      left = Math.min(left, x)
      top = Math.min(top, y)
      right = Math.max(right, x)
      bottom = Math.max(bottom, y)
    }
  }

  return {
    bottom,
    canvasHeight: info.height,
    canvasWidth: info.width,
    height: bottom - top + 1,
    left,
    right,
    softPixelRatio: softPixels / (softPixels + solidPixels),
    top,
    width: right - left + 1,
  }
}

function listFilesRecursively(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name)
    return entry.isDirectory() ? listFilesRecursively(path) : [path]
  })
}

describe('raster icon library', () => {
  it('exposes exactly 63 selectable, uniquely named and labelled icons', () => {
    const selectableDefinitions = rasterIconDefinitions.filter(({ selectable }) => selectable)

    expect(selectableRasterIconNames).toHaveLength(63)
    expect(new Set(selectableRasterIconNames)).toHaveLength(63)
    expect(new Set(selectableDefinitions.map(({ label }) => label))).toHaveLength(63)
    expect(rasterIconDefinitions.filter(({ selectable }) => !selectable)).toHaveLength(5)
  })

  it('provides a transparent PNG at the exact source size for every tier', async () => {
    for (const definition of rasterIconDefinitions) {
      for (const size of rasterIconSizes) {
        const relativePath = getRasterIconURL(definition.name, size)
        const metadata = await sharp(
          resolve(process.cwd(), 'public', relativePath.slice(1)),
        ).metadata()

        expect(metadata.format, relativePath).toBe('png')
        expect(metadata.width, relativePath).toBe(expectedDimensions[size])
        expect(metadata.height, relativePath).toBe(expectedDimensions[size])
        expect(metadata.hasAlpha, relativePath).toBe(true)
      }
    }
  })

  it('contains only the two supported tier directories and registered icon files', () => {
    const iconDirectory = resolve(process.cwd(), 'public/assets/icons')
    const registeredFiles = rasterIconDefinitions.map(({ name }) => `${name}.png`).sort()
    const assetTiers = readdirSync(iconDirectory, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort()

    expect(assetTiers).toEqual([...rasterIconSizes].sort())

    for (const tier of assetTiers) {
      expect(readdirSync(resolve(iconDirectory, tier)).sort()).toEqual(registeredFiles)
    }
  })

  it('does not expose retired icon names', () => {
    expect(selectableRasterIconNames).not.toEqual(
      expect.arrayContaining(['controller', 'map', 'mastodon', 'miniature', 'news']),
    )
  })

  it('keeps the left arrow as an exact mirror of the approved right arrow', async () => {
    for (const size of rasterIconSizes) {
      const rightArrowPath = resolve(
        process.cwd(),
        'public',
        getRasterIconURL('arrow-right', size).slice(1),
      )
      const leftArrowPath = resolve(
        process.cwd(),
        'public',
        getRasterIconURL('arrow-left', size).slice(1),
      )
      const mirroredRightArrow = await sharp(rightArrowPath).flop().ensureAlpha().raw().toBuffer()
      const leftArrow = await sharp(leftArrowPath).ensureAlpha().raw().toBuffer()

      expect(leftArrow, size).toEqual(mirroredRightArrow)
    }
  })

  it('matches the dice margin and sharpness while centering every visible glyph', async () => {
    for (const size of rasterIconSizes) {
      const diceBounds = await readVisibleBounds('dice', size)
      const diceMargin = Math.min(
        diceBounds.left,
        diceBounds.canvasWidth - 1 - diceBounds.right,
        diceBounds.top,
        diceBounds.canvasHeight - 1 - diceBounds.bottom,
      )

      for (const definition of rasterIconDefinitions) {
        const bounds = await readVisibleBounds(definition.name, size)
        const closestMargin = Math.min(
          bounds.left,
          bounds.canvasWidth - 1 - bounds.right,
          bounds.top,
          bounds.canvasHeight - 1 - bounds.bottom,
        )

        expect(closestMargin, `${definition.name}/${size} margin`).toBe(diceMargin)
        expect(
          Math.abs(bounds.left + bounds.right - (bounds.canvasWidth - 1)),
          `${definition.name}/${size} horizontal center`,
        ).toBeLessThanOrEqual(1)
        expect(
          Math.abs(bounds.top + bounds.bottom - (bounds.canvasHeight - 1)),
          `${definition.name}/${size} vertical center`,
        ).toBeLessThanOrEqual(1)
        expect(bounds.softPixelRatio, `${definition.name}/${size} sharpness`).toBeLessThanOrEqual(
          diceBounds.softPixelRatio,
        )
      }
    }
  })

  it('selects the requested tier and preserves currentColor through a CSS mask', () => {
    const markup = renderToStaticMarkup(
      createElement(RasterIcon, { name: 'calendar', size: 'small' }),
    )

    expect(markup).toContain('/assets/icons/small/calendar.png')
    expect(markup).toContain('data-icon-size="small"')
    expect(markup).toContain('mask-image:')
    expect(markup).not.toContain('<svg')
  })

  it('contains no application SVG assets, elements or data URIs', () => {
    const publicFiles = listFilesRecursively(resolve(process.cwd(), 'public'))
    const sourceFiles = listFilesRecursively(resolve(process.cwd(), 'src')).filter((path) =>
      /\.(?:css|scss|tsx?|jsx?)$/.test(path),
    )
    const source = sourceFiles.map((path) => readFileSync(path, 'utf8')).join('\n')

    expect(publicFiles.filter((path) => path.endsWith('.svg'))).toEqual([])
    expect(source).not.toContain('<svg')
    expect(source).not.toContain('data:image/svg+xml')
  })
})
