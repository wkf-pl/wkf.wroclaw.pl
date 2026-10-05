import type { Field, FieldHook, Validate } from 'payload'

import { createRasterIconField } from '@/modules/icons/fields'
import {
  getSelectableRasterIconLabel,
  isSelectableRasterIconName,
  type SelectableRasterIconName,
} from '@/modules/icons/icon-registry'
import { webRasterImageMimeTypes } from '@/modules/media/media-categories'

export const contentSurfaceNames = ['transparent', 'default', 'subtle', 'inverse', 'image'] as const
export const contentFrameStyles = ['none', 'outline'] as const
export const surfaceHorizontalPositions = ['left', 'center', 'right'] as const
export const surfaceVerticalPositions = ['top', 'middle', 'bottom'] as const

export type ContentSurfaceName = (typeof contentSurfaceNames)[number]
export type ContentFrameStyle = (typeof contentFrameStyles)[number]
export type SurfaceHorizontalPosition = (typeof surfaceHorizontalPositions)[number]
export type SurfaceVerticalPosition = (typeof surfaceVerticalPositions)[number]

export type ContentHeadingData = {
  heading?: unknown
  headingIconName?: unknown
  headingLevel?: unknown
  iconInverted?: unknown
}

export type ContentSurfaceData = {
  surface?: unknown
  surfaceHorizontalPosition?: unknown
  surfaceImage?: unknown
  surfaceVerticalPosition?: unknown
}

export type ContentPresentationData = ContentSurfaceData & {
  frame?: unknown
}

export type ResolvedContentHeading = {
  accessibleName?: string
  iconName?: SelectableRasterIconName
  inverted: boolean
  level: 2 | 3 | 4
  text?: string
}

export type ResolvedContentPresentation = {
  frame: ContentFrameStyle
  imageURL?: string
  objectPosition: string
  surface: ContentSurfaceName
}

type PresentationSiblingData = {
  headingIconName?: unknown
  surface?: unknown
}

function usesImageSurface(_data: unknown, siblingData: PresentationSiblingData): boolean {
  return siblingData.surface === 'image'
}

const normalizeHeading: FieldHook = ({ value }) => {
  if (typeof value !== 'string') {
    return null
  }

  const normalizedValue = value.trim()
  return normalizedValue || null
}

export function validateContentHeading(data: ContentHeadingData): true | string {
  const text = typeof data.heading === 'string' ? data.heading.trim() : ''
  return text || isSelectableRasterIconName(data.headingIconName)
    ? true
    : 'Podaj tekst albo wybierz ikonę nagłówka.'
}

const validateRequiredHeading: Validate<unknown, unknown, PresentationSiblingData> = (
  value,
  { siblingData },
) => validateContentHeading({ heading: value, headingIconName: siblingData.headingIconName })

function createHeadingTextField(requireContent: boolean): Field {
  return {
    name: 'heading',
    type: 'text',
    admin: { width: '75%' },
    hooks: { beforeValidate: [normalizeHeading] },
    label: 'Nagłówek',
    maxLength: 160,
    ...(requireContent ? { validate: validateRequiredHeading } : {}),
  }
}

function createHeadingIconField(compactDatabaseNames: boolean): Field {
  return createRasterIconField<PresentationSiblingData>({
    adminWidth: '75%',
    ...(compactDatabaseNames ? { databaseName: 'hd_icon' } : {}),
    label: 'Ikona',
    name: 'headingIconName',
  })
}

function createFrameField(width: string): Field {
  return {
    name: 'frame',
    type: 'select',
    admin: { isClearable: false, width },
    dbName: 'fr',
    defaultValue: 'none',
    label: 'Ramka',
    options: [
      { label: 'Brak', value: 'none' },
      { label: 'Obrys', value: 'outline' },
    ],
  }
}

function createSurfaceField(width: string): Field {
  return {
    name: 'surface',
    type: 'select',
    admin: { isClearable: false, width },
    dbName: 'sf',
    defaultValue: 'transparent',
    label: 'Powierzchnia',
    options: [
      { label: 'Przezroczysta', value: 'transparent' },
      { label: 'Domyślna', value: 'default' },
      { label: 'Subtelna', value: 'subtle' },
      { label: 'Odwrócona', value: 'inverse' },
      { label: 'Obraz', value: 'image' },
    ],
  }
}

const validateSurfaceImage: Validate<unknown, unknown, PresentationSiblingData> = (
  value,
  { siblingData },
) =>
  siblingData.surface !== 'image' || value ? true : 'Wybierz obraz tła dla powierzchni „Obraz”.'

function createSurfacePositionValidator(
  allowedValues: readonly string[],
  message: string,
): Validate<unknown, unknown, PresentationSiblingData> {
  return (value, { siblingData }) =>
    siblingData.surface !== 'image' || (typeof value === 'string' && allowedValues.includes(value))
      ? true
      : message
}

export function createContentHeadingFields({
  compactDatabaseNames = false,
  requireContent = false,
}: {
  compactDatabaseNames?: boolean
  requireContent?: boolean
} = {}): Field[] {
  return [
    {
      type: 'row',
      fields: [
        createHeadingTextField(requireContent),
        {
          name: 'headingLevel',
          type: 'select',
          admin: { isClearable: false, width: '25%' },
          defaultValue: 'h2',
          label: 'Poziom',
          options: [
            { label: 'H2', value: 'h2' },
            { label: 'H3', value: 'h3' },
            { label: 'H4', value: 'h4' },
          ],
          required: true,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        createHeadingIconField(compactDatabaseNames),
        {
          name: 'iconInverted',
          type: 'checkbox',
          admin: { width: '25%' },
          defaultValue: false,
          label: 'Inwersja',
        },
      ],
    },
  ]
}

export function createContentPresentationFields({
  leadingField,
}: {
  leadingField?: Field
} = {}): Field[] {
  const presentationFieldWidth = leadingField ? '33.333%' : '50%'

  return [
    {
      type: 'row',
      fields: [
        ...(leadingField ? [leadingField] : []),
        createFrameField(presentationFieldWidth),
        createSurfaceField(presentationFieldWidth),
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'surfaceImage',
          type: 'upload',
          admin: {
            condition: usesImageSurface,
            description:
              'Obraz pełni funkcję dekoracyjnego tła. Ważne informacje umieść w treści, nie na obrazie.',
            width: '50%',
          },
          filterOptions: { mimeType: { in: [...webRasterImageMimeTypes] } },
          label: 'Obraz tła',
          relationTo: 'media',
          validate: validateSurfaceImage,
        },
        {
          name: 'surfaceHorizontalPosition',
          type: 'select',
          admin: {
            condition: usesImageSurface,
            isClearable: false,
            width: '25%',
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
            width: '25%',
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

export function normalizeContentHeading(data: ContentHeadingData): ResolvedContentHeading {
  const text = typeof data.heading === 'string' ? data.heading.trim() || undefined : undefined
  const iconName = isSelectableRasterIconName(data.headingIconName)
    ? data.headingIconName
    : undefined

  return {
    ...(text ? { text } : {}),
    ...(iconName ? { iconName } : {}),
    ...(text ? { accessibleName: text } : {}),
    ...(!text && iconName ? { accessibleName: getSelectableRasterIconLabel(iconName) } : {}),
    inverted: data.iconInverted === true,
    level: data.headingLevel === 'h3' ? 3 : data.headingLevel === 'h4' ? 4 : 2,
  }
}

export function normalizeContentPresentation(
  data: ContentPresentationData,
): ResolvedContentPresentation {
  const surface = isContentSurfaceName(data.surface) ? data.surface : 'transparent'
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
    frame: data.frame === true || data.frame === 'outline' ? 'outline' : 'none',
    imageURL,
    objectPosition: `${horizontalPosition} ${verticalPosition === 'middle' ? 'center' : verticalPosition}`,
    surface,
  }
}
