import { getFormRelationshipId } from '@/lib/relationships'

import {
  contentSurfaceNames,
  normalizeContentPresentation,
  surfaceHorizontalPositions,
  surfaceVerticalPositions,
  type ContentFrameStyle,
  type ContentPresentationData,
  type ContentSurfaceName,
  type ResolvedContentPresentation,
  type SurfaceHorizontalPosition,
  type SurfaceVerticalPosition,
} from './content-presentation'
import type { ListingView } from './listing-view'

export type ListingSpacing = 'none' | 'small' | 'large'
type ListingPadding = ListingSpacing | 'legacyBlock' | 'legacyCarousel'

export type ListingDecoration = {
  frame: ContentFrameStyle
  surface: ContentSurfaceName
  surfaceImage: number | null
  surfaceHorizontalPosition: SurfaceHorizontalPosition
  surfaceVerticalPosition: SurfaceVerticalPosition
  gap: ListingSpacing
  padding: ListingPadding
  itemBorder: ContentFrameStyle
  fill: ContentSurfaceName
  fillImage: number | null
  fillHorizontalPosition: SurfaceHorizontalPosition
  fillVerticalPosition: SurfaceVerticalPosition
  fallback: 'default' | 'custom' | 'none'
  fallbackImage: number | null
}

export type ListingDecorationOverrides = Partial<ListingDecoration>

export type ListingDecorationMedia = {
  surface?: string
  fill?: string
  fallback?: string
}

export function parseListingMediaId(value: unknown): number | null {
  const id = getFormRelationshipId(value)
  const number = typeof id === 'string' && /^[1-9][0-9]*$/.test(id) ? Number(id) : id
  return typeof number === 'number' && Number.isSafeInteger(number) && number > 0 ? number : null
}

export function parseListingDecoration(value: unknown): ListingDecorationOverrides | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined
  const data = value as Record<string, unknown>
  const result: ListingDecorationOverrides = {}
  const spacing = ['none', 'small', 'large'] as const
  const options = {
    frame: ['none', 'outline'],
    surface: contentSurfaceNames,
    surfaceHorizontalPosition: surfaceHorizontalPositions,
    surfaceVerticalPosition: surfaceVerticalPositions,
    gap: spacing,
    padding: [...spacing, 'legacyBlock', 'legacyCarousel'],
    itemBorder: ['none', 'outline'],
    fill: contentSurfaceNames,
    fillHorizontalPosition: surfaceHorizontalPositions,
    fillVerticalPosition: surfaceVerticalPositions,
    fallback: ['default', 'custom', 'none'],
  } as const satisfies Partial<Record<keyof ListingDecoration, readonly string[]>>
  for (const [key, values] of Object.entries(options)) {
    const option = data[key]
    if (typeof option === 'string' && (values as readonly string[]).includes(option)) {
      Object.assign(result, { [key]: option })
    }
  }
  if (data.gap === 'legacyColumns') result.gap = 'small'
  if (data.gap === 'legacyTile') result.gap = 'large'
  if (data.fill === 'legacy') result.fill = 'default'
  for (const key of ['surfaceImage', 'fillImage', 'fallbackImage'] as const) {
    const id = parseListingMediaId(data[key])
    if (data[key] === null || id !== null) result[key] = id
  }
  return result
}

export function getDefaultListingDecoration(view: ListingView): ListingDecoration {
  const row = view.form === 'row'
  const carousel = view.layout === 'carousel'
  const nativeColumns = view.form === 'tile' || view.form === 'vertical' ? 3 : 1
  return {
    frame: carousel ? 'outline' : 'none',
    surface: 'transparent',
    surfaceImage: null,
    surfaceHorizontalPosition: 'center',
    surfaceVerticalPosition: 'middle',
    gap: row && !carousel ? 'none' : carousel || view.columns !== nativeColumns ? 'small' : 'large',
    padding:
      carousel && (view.form !== 'horizontal' || view.columns > 1 || !view.information.image)
        ? 'legacyCarousel'
        : 'none',
    itemBorder:
      !carousel || view.form !== 'horizontal' || view.columns > 1
        ? row
          ? 'none'
          : 'outline'
        : 'none',
    fill: row ? 'transparent' : 'default',
    fillImage: null,
    fillHorizontalPosition: 'center',
    fillVerticalPosition: 'middle',
    fallback: 'default',
    fallbackImage: null,
  }
}

export function getLegacyListingDecoration(
  view: ListingView,
  block: ContentPresentationData,
): ListingDecorationOverrides {
  const { frame, surface } = normalizeContentPresentation(block)
  const row = view.form === 'row' && view.layout === 'static'
  const overrides: ListingDecorationOverrides = {}
  if (frame === 'outline') {
    overrides.frame = frame
    if (row) overrides.itemBorder = 'outline'
  }
  if (!row && (frame === 'outline' || surface !== 'transparent')) {
    overrides.padding = 'legacyBlock'
  }
  if (surface !== 'transparent') {
    Object.assign(
      overrides,
      parseListingDecoration({
        surface,
        surfaceImage: parseListingMediaId(block.surfaceImage),
        surfaceHorizontalPosition: block.surfaceHorizontalPosition,
        surfaceVerticalPosition: block.surfaceVerticalPosition,
      }),
    )
  }
  return overrides
}

export function resolveListingSurface(
  decoration: ListingDecoration,
  type: 'surface' | 'fill',
  imageURL?: string,
): ResolvedContentPresentation {
  const container = type === 'surface'
  return normalizeContentPresentation({
    frame: container ? decoration.frame : 'none',
    surface: decoration[type],
    surfaceImage: imageURL ? { url: imageURL } : undefined,
    surfaceHorizontalPosition: container
      ? decoration.surfaceHorizontalPosition
      : decoration.fillHorizontalPosition,
    surfaceVerticalPosition: container
      ? decoration.surfaceVerticalPosition
      : decoration.fillVerticalPosition,
  })
}
