#!/usr/bin/env node

import { copyFile, mkdir, mkdtemp, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, extname, join, resolve } from 'node:path'

import sharp from 'sharp'

const tierDefinitions = {
  medium: { blurRadius: 1.25, margin: 12, sourceSuffix: 'm', targetSize: 192 },
  small: { blurRadius: 0.75, margin: 8, sourceSuffix: 's', targetSize: 96 },
}
const supersample = 4

function usage() {
  return `Usage:
  node render-icons.mjs --source <directory> [--output <directory>]
    [--fill-small-holes <comma-separated-names>]

Source naming:
  name-s.png  Small source
  name-m.png  Medium source
  name.png    Shared source for both tiers
`
}

function parseArguments(argumentsList) {
  const options = {
    fillSmallHoles: new Set(),
    output: resolve('public/assets/icons'),
    source: undefined,
  }

  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index]
    if (argument === '--help' || argument === '-h') {
      process.stdout.write(usage())
      process.exit(0)
    }

    const value = argumentsList[index + 1]
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for ${argument}\n\n${usage()}`)
    }

    if (argument === '--source') options.source = resolve(value)
    else if (argument === '--output') options.output = resolve(value)
    else if (argument === '--fill-small-holes') {
      options.fillSmallHoles = new Set(value.split(',').filter(Boolean))
    } else {
      throw new Error(`Unknown argument: ${argument}\n\n${usage()}`)
    }
    index += 1
  }

  if (!options.source) throw new Error(`--source is required\n\n${usage()}`)
  return options
}

function findBounds(data, width, height, threshold) {
  let bottom = -1
  let left = width
  let right = -1
  let top = height

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[y * width + x] < threshold) continue
      bottom = Math.max(bottom, y)
      left = Math.min(left, x)
      right = Math.max(right, x)
      top = Math.min(top, y)
    }
  }

  if (right < left || bottom < top) return undefined
  return { height: bottom - top + 1, left, top, width: right - left + 1 }
}

function cropSingleChannel(data, sourceWidth, bounds) {
  const cropped = Buffer.alloc(bounds.width * bounds.height)
  for (let y = 0; y < bounds.height; y += 1) {
    const sourceStart = (bounds.top + y) * sourceWidth + bounds.left
    data.copy(cropped, y * bounds.width, sourceStart, sourceStart + bounds.width)
  }
  return cropped
}

async function resizeSingleChannel(data, width, height, targetWidth, targetHeight, kernel) {
  const resized = await sharp(data, { raw: { channels: 1, height, width } })
    .resize(targetWidth, targetHeight, { fit: 'fill', kernel })
    .extractChannel(0)
    .raw()
    .toBuffer({ resolveWithObject: true })

  if (resized.info.channels !== 1 || resized.data.length !== targetWidth * targetHeight) {
    throw new Error('Sharp returned an invalid single-channel mask')
  }
  return resized.data
}

function fillSmallEnclosedHoles(alpha, width, height, maximumArea = 64) {
  const result = Buffer.from(alpha)
  const visited = new Uint8Array(width * height)

  for (let start = 0; start < result.length; start += 1) {
    if (visited[start] === 1 || result[start] >= 240) continue

    const component = []
    const queue = [start]
    let queueIndex = 0
    let touchesEdge = false
    visited[start] = 1

    while (queueIndex < queue.length) {
      const index = queue[queueIndex]
      queueIndex += 1
      component.push(index)
      const x = index % width
      const y = Math.floor(index / width)
      if (x === 0 || x === width - 1 || y === 0 || y === height - 1) touchesEdge = true

      for (const [neighborX, neighborY] of [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
      ]) {
        if (neighborX < 0 || neighborX >= width || neighborY < 0 || neighborY >= height) continue
        const neighbor = neighborY * width + neighborX
        if (visited[neighbor] === 1 || result[neighbor] >= 240) continue
        visited[neighbor] = 1
        queue.push(neighbor)
      }
    }

    if (!touchesEdge && component.length <= maximumArea) {
      for (const index of component) result[index] = 255
    }
  }

  return result
}

async function renderIcon(sourcePath, outputPath, tierName, shouldFillSmallHoles) {
  const definition = tierDefinitions[tierName]
  const source = await sharp(sourcePath)
    .flatten({ background: { b: 255, g: 255, r: 255 } })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true })

  if (source.info.channels !== 1) {
    throw new Error(`Expected one grayscale channel in ${sourcePath}`)
  }

  const darkness = Buffer.alloc(source.data.length)
  for (let index = 0; index < source.data.length; index += 1) {
    darkness[index] = 255 - source.data[index]
  }

  const sourceBounds = findBounds(darkness, source.info.width, source.info.height, 24)
  if (!sourceBounds) throw new Error(`No visible pixels in ${sourcePath}`)
  const croppedSource = cropSingleChannel(darkness, source.info.width, sourceBounds)

  const maximumGlyphSize = (definition.targetSize - 2 * definition.margin) * supersample
  const initialScale = Math.min(
    maximumGlyphSize / sourceBounds.width,
    maximumGlyphSize / sourceBounds.height,
  )
  const initialWidth = Math.max(1, Math.round(sourceBounds.width * initialScale))
  const initialHeight = Math.max(1, Math.round(sourceBounds.height * initialScale))

  const smoothedResult = await sharp(croppedSource, {
    raw: { channels: 1, height: sourceBounds.height, width: sourceBounds.width },
  })
    .resize(initialWidth, initialHeight, { fit: 'fill', kernel: sharp.kernel.lanczos3 })
    .blur(definition.blurRadius * supersample)
    .threshold(128)
    .extractChannel(0)
    .raw()
    .toBuffer({ resolveWithObject: true })

  if (smoothedResult.info.channels !== 1) {
    throw new Error(`Sharp returned an invalid smoothed mask for ${sourcePath}`)
  }
  const smoothed = smoothedResult.data
  const smoothedBounds = findBounds(smoothed, initialWidth, initialHeight, 1)
  if (!smoothedBounds) throw new Error(`Smoothing removed every visible pixel in ${sourcePath}`)
  const croppedSmoothed = cropSingleChannel(smoothed, initialWidth, smoothedBounds)

  const finalScale = Math.min(
    maximumGlyphSize / smoothedBounds.width,
    maximumGlyphSize / smoothedBounds.height,
  )
  const finalWidth = Math.max(1, Math.round(smoothedBounds.width * finalScale))
  const finalHeight = Math.max(1, Math.round(smoothedBounds.height * finalScale))
  const finalMask = await resizeSingleChannel(
    croppedSmoothed,
    smoothedBounds.width,
    smoothedBounds.height,
    finalWidth,
    finalHeight,
    sharp.kernel.nearest,
  )

  const supersampledSize = definition.targetSize * supersample
  const canvas = Buffer.alloc(supersampledSize * supersampledSize)
  const left = Math.floor((supersampledSize - finalWidth) / 2)
  const top = Math.floor((supersampledSize - finalHeight) / 2)
  for (let y = 0; y < finalHeight; y += 1) {
    finalMask.copy(
      canvas,
      (top + y) * supersampledSize + left,
      y * finalWidth,
      (y + 1) * finalWidth,
    )
  }

  let alpha = await resizeSingleChannel(
    canvas,
    supersampledSize,
    supersampledSize,
    definition.targetSize,
    definition.targetSize,
    sharp.kernel.lanczos3,
  )
  if (shouldFillSmallHoles) {
    alpha = fillSmallEnclosedHoles(alpha, definition.targetSize, definition.targetSize)
  }

  const rgba = Buffer.alloc(definition.targetSize * definition.targetSize * 4)
  for (let index = 0; index < alpha.length; index += 1) {
    rgba[index * 4 + 3] = alpha[index]
  }

  await sharp(rgba, {
    raw: { channels: 4, height: definition.targetSize, width: definition.targetSize },
  })
    .png()
    .toFile(outputPath)
}

async function discoverSourceSets(sourceDirectory) {
  const entries = await readdir(sourceDirectory, { withFileTypes: true })
  const sourceSets = new Map()

  for (const entry of entries) {
    if (!entry.isFile() || extname(entry.name).toLowerCase() !== '.png') continue
    const stem = basename(entry.name, extname(entry.name))
    const tierMatch = stem.match(/^(.*)-(s|m)$/)
    const iconName = tierMatch ? tierMatch[1] : stem
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(iconName)) {
      throw new Error(
        `Invalid icon name "${iconName}" from ${entry.name}; use lowercase kebab-case`,
      )
    }

    const sourceKind = tierMatch
      ? tierMatch[2] === tierDefinitions.small.sourceSuffix
        ? 'small'
        : 'medium'
      : 'shared'
    const sources = sourceSets.get(iconName) ?? {}
    if (sources[sourceKind]) {
      throw new Error(`Duplicate ${sourceKind} source for ${iconName}`)
    }
    sources[sourceKind] = join(sourceDirectory, entry.name)
    sourceSets.set(iconName, sources)
  }

  if (sourceSets.size === 0) throw new Error(`No PNG sources found in ${sourceDirectory}`)

  for (const [iconName, sources] of sourceSets) {
    for (const tierName of Object.keys(tierDefinitions)) {
      if (!sources[tierName] && !sources.shared) {
        throw new Error(`Missing ${tierName} source for ${iconName}`)
      }
    }
  }

  return new Map([...sourceSets].sort(([first], [second]) => first.localeCompare(second)))
}

async function main() {
  const options = parseArguments(process.argv.slice(2))
  const sourceSets = await discoverSourceSets(options.source)
  for (const iconName of options.fillSmallHoles) {
    if (!sourceSets.has(iconName)) {
      throw new Error(`--fill-small-holes names unknown icon: ${iconName}`)
    }
  }

  const temporaryDirectory = await mkdtemp(join(tmpdir(), 'wkf-raster-icons-'))
  try {
    for (const tierName of Object.keys(tierDefinitions)) {
      await mkdir(join(temporaryDirectory, tierName), { recursive: true })
    }

    for (const [iconName, sources] of sourceSets) {
      for (const tierName of Object.keys(tierDefinitions)) {
        const sourcePath = sources[tierName] ?? sources.shared
        const temporaryPath = join(temporaryDirectory, tierName, `${iconName}.png`)
        await renderIcon(sourcePath, temporaryPath, tierName, options.fillSmallHoles.has(iconName))
      }
    }

    for (const tierName of Object.keys(tierDefinitions)) {
      const outputDirectory = join(options.output, tierName)
      await mkdir(outputDirectory, { recursive: true })
      for (const iconName of sourceSets.keys()) {
        await copyFile(
          join(temporaryDirectory, tierName, `${iconName}.png`),
          join(outputDirectory, `${iconName}.png`),
        )
      }
    }
  } finally {
    await rm(temporaryDirectory, { force: true, recursive: true })
  }

  process.stdout.write(
    `Rendered ${sourceSets.size} icon name(s), ${sourceSets.size * 2} PNG assets.\n`,
  )
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
  process.exitCode = 1
})
