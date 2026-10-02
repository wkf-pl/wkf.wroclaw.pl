import type { Field, Validate } from 'payload'

import { webRasterImageMimeTypes } from '@/modules/media/media-categories'

export const contentSurfaceNames = ['default', 'subtle', 'inverse', 'image'] as const
export const surfaceHorizontalPositions = ['left', 'center', 'right'] as const
export const surfaceVerticalPositions = ['top', 'middle', 'bottom'] as const

export type ContentSurfaceName = (typeof contentSurfaceNames)[number]
export type SurfaceHorizontalPosition = (typeof surfaceHorizontalPositions)[number]
export type SurfaceVerticalPosition = (typeof surfaceVerticalPositions)[number]

export type ContentSurfaceData = {
  surface?: unknown
  surfaceHorizontalPosition?: unknown
  surfaceImage?: unknown
  surfaceVerticalPosition?: unknown
}

export type ResolvedContentSurface = {
  imageURL?: string
  objectPosition: string
  surface: ContentSurfaceName
}

type SurfaceSiblingData = {
  surface?: unknown
}

function usesImageSurface(_data: unknown, siblingData: SurfaceSiblingData): boolean {
  return siblingData.surface === 'image'
}

const validateSurfaceImage: Validate<unknown, unknown, SurfaceSiblingData> = (
  value,
  { siblingData },
) =>
  siblingData.surface !== 'image' || value ? true : 'Wybierz obraz tła dla powierzchni „Obraz”.'

function createSurfacePositionValidator(
  allowedValues: readonly string[],
  message: string,
): Validate<unknown, unknown, SurfaceSiblingData> {
  return (value, { siblingData }) =>
    siblingData.surface !== 'image' || (typeof value === 'string' && allowedValues.includes(value))
      ? true
      : message
}

export function createContentSurfaceFields(): Field[] {
  return [
    {
      name: 'surface',
      type: 'select',
      admin: { isClearable: false },
      dbName: 'sf',
      defaultValue: 'default',
      label: 'Powierzchnia',
      options: [
        { label: 'Domyślna', value: 'default' },
        { label: 'Subtelna', value: 'subtle' },
        { label: 'Odwrócona', value: 'inverse' },
        { label: 'Obraz', value: 'image' },
      ],
      required: true,
    },
    {
      name: 'surfaceImage',
      type: 'upload',
      admin: {
        condition: usesImageSurface,
        description:
          'Obraz pełni funkcję dekoracyjnego tła. Ważne informacje umieść w treści, nie na obrazie.',
      },
      filterOptions: { mimeType: { in: [...webRasterImageMimeTypes] } },
      label: 'Obraz tła',
      relationTo: 'media',
      validate: validateSurfaceImage,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'surfaceHorizontalPosition',
          type: 'select',
          admin: {
            condition: usesImageSurface,
            isClearable: false,
            width: '50%',
          },
          dbName: 'sf_x',
          defaultValue: 'center',
          label: 'Pozycja w poziomie',
          options: [
            { label: 'Lewa', value: 'left' },
            { label: 'Środek', value: 'center' },
            { label: 'Prawa', value: 'right' },
          ],
          validate: createSurfacePositionValidator(
            surfaceHorizontalPositions,
            'Wybierz pozycję obrazu w poziomie.',
          ),
        },
        {
          name: 'surfaceVerticalPosition',
          type: 'select',
          admin: {
            condition: usesImageSurface,
            isClearable: false,
            width: '50%',
          },
          dbName: 'sf_y',
          defaultValue: 'middle',
          label: 'Pozycja w pionie',
          options: [
            { label: 'Góra', value: 'top' },
            { label: 'Środek', value: 'middle' },
            { label: 'Dół', value: 'bottom' },
          ],
          validate: createSurfacePositionValidator(
            surfaceVerticalPositions,
            'Wybierz pozycję obrazu w pionie.',
          ),
        },
      ],
    },
    {
      name: 'surfacePreview',
      type: 'ui',
      admin: {
        condition: usesImageSurface,
        components: {
          Field: '/components/admin/ContentSurfacePreview#ContentSurfacePreview',
        },
      },
    },
  ]
}

export function isContentSurfaceName(value: unknown): value is ContentSurfaceName {
  return typeof value === 'string' && contentSurfaceNames.includes(value as ContentSurfaceName)
}

export function normalizeContentSurface(data: ContentSurfaceData): ResolvedContentSurface {
  const surface = isContentSurfaceName(data.surface) ? data.surface : 'default'
  const horizontalPosition = surfaceHorizontalPositions.includes(
    data.surfaceHorizontalPosition as SurfaceHorizontalPosition,
  )
    ? (data.surfaceHorizontalPosition as SurfaceHorizontalPosition)
    : 'center'
  const verticalPosition = surfaceVerticalPositions.includes(
    data.surfaceVerticalPosition as SurfaceVerticalPosition,
  )
    ? (data.surfaceVerticalPosition as SurfaceVerticalPosition)
    : 'middle'
  const imageURL =
    surface === 'image' &&
    data.surfaceImage &&
    typeof data.surfaceImage === 'object' &&
    'url' in data.surfaceImage &&
    typeof data.surfaceImage.url === 'string'
      ? data.surfaceImage.url
      : undefined

  return {
    imageURL,
    objectPosition: `${horizontalPosition} ${verticalPosition === 'middle' ? 'center' : verticalPosition}`,
    surface,
  }
}
