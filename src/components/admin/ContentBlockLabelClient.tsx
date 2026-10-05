'use client'

import { useFormFields, useRowLabel } from '@payloadcms/ui'

import {
  getSelectableRasterIconLabel,
  isSelectableRasterIconName,
} from '@/modules/icons/icon-registry'

const previewCharacterLimit = 96

type LexicalNode = {
  children?: unknown
  root?: unknown
  text?: unknown
  value?: unknown
}

type RichTextBlockData = {
  content?: unknown
  frame?: unknown
  surface?: unknown
}

type HeadingBlockData = {
  heading?: unknown
  headingIconName?: unknown
  headingLevel?: unknown
}

type PresentedBlockData = {
  frame?: unknown
  surface?: unknown
}

type CountedBlockData = {
  frame?: unknown
  items?: unknown
  sections?: unknown
  surface?: unknown
}

type ColumnLayoutBlockData = {
  columns?: Array<{ width?: unknown }>
  frame?: unknown
  surface?: unknown
}

const surfaceLabels: Record<string, string> = {
  default: 'domyślna',
  image: 'obraz',
  inverse: 'odwrócona',
  subtle: 'subtelna',
  transparent: 'przezroczysta',
}

function getText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function getPresentationDescription(data: { frame?: unknown; surface?: unknown }): string {
  const surface = getText(data.surface) || 'transparent'
  return [
    surfaceLabels[surface] ?? surface,
    data.frame === true || data.frame === 'outline' ? 'obrys' : 'bez ramki',
  ]
    .filter(Boolean)
    .join(' · ')
}

function getTextFromLexicalValue(value: unknown): string {
  const textParts: string[] = []

  collectLexicalText(value, textParts)

  return textParts.join(' ').replace(/\s+/g, ' ').trim()
}

function collectLexicalText(value: unknown, textParts: string[]): void {
  if (typeof value === 'string') {
    try {
      collectLexicalText(JSON.parse(value), textParts)
    } catch {
      textParts.push(value)
    }

    return
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectLexicalText(item, textParts))
    return
  }

  if (!value || typeof value !== 'object') {
    return
  }

  const node = value as LexicalNode

  if (typeof node.text === 'string') {
    textParts.push(node.text)
  }

  if ('value' in node && node.value !== value) {
    collectLexicalText(node.value, textParts)
  }

  collectLexicalText(node.root, textParts)
  collectLexicalText(node.children, textParts)
}

function truncateAtWordBoundary(value: string): string {
  if (!value) {
    return ''
  }

  if (value.length <= previewCharacterLimit) {
    return `${value}…`
  }

  const words = value.split(' ')
  const previewWords: string[] = []
  let previewLength = 0

  for (const word of words) {
    const nextLength = previewLength + (previewWords.length ? 1 : 0) + word.length

    if (nextLength > previewCharacterLimit) {
      break
    }

    previewWords.push(word)
    previewLength = nextLength
  }

  return `${(previewWords.length ? previewWords : [words[0]]).join(' ')}…`
}

function BlockLabel({ prefix, value }: { prefix: string; value: string }) {
  return (
    <span className="wkf-content-block-label">
      <strong>{prefix}</strong>
      {value ? <span className="wkf-content-block-label__preview">: {value}</span> : null}
    </span>
  )
}

export function RichTextBlockLabelClient({ initialContent }: { initialContent?: unknown }) {
  const { data, path } = useRowLabel<RichTextBlockData>()
  const contentFieldValue = useFormFields(([fields]) => fields[`${path}.content`]?.value)
  const liveContentPreview = getTextFromLexicalValue(contentFieldValue)
  const rowContentPreview = getTextFromLexicalValue(data.content)
  const initialContentPreview = getTextFromLexicalValue(initialContent)
  const contentPreview = truncateAtWordBoundary(
    liveContentPreview || rowContentPreview || initialContentPreview,
  )
  const presentationDescription = getPresentationDescription(data)

  return (
    <BlockLabel
      prefix="Treść"
      value={[presentationDescription, contentPreview].filter(Boolean).join(' — ')}
    />
  )
}

export function ListingBlockLabelClient() {
  const { data } = useRowLabel<PresentedBlockData>()

  return <BlockLabel prefix="Listing" value={getPresentationDescription(data)} />
}

export function MediaGalleryBlockLabelClient() {
  const { data } = useRowLabel<PresentedBlockData>()

  return <BlockLabel prefix="Galeria mediów" value={getPresentationDescription(data)} />
}

export function AttachmentsBlockLabelClient() {
  const { data } = useRowLabel<PresentedBlockData>()

  return <BlockLabel prefix="Załączniki" value={getPresentationDescription(data)} />
}

export function DocumentsBlockLabelClient() {
  const { data } = useRowLabel<PresentedBlockData>()

  return <BlockLabel prefix="Dokumenty" value={getPresentationDescription(data)} />
}

export function MemberProfilesBlockLabelClient() {
  const { data } = useRowLabel<PresentedBlockData>()

  return <BlockLabel prefix="Wizytówki" value={getPresentationDescription(data)} />
}

export function HeadingBlockLabelClient() {
  const { data } = useRowLabel<HeadingBlockData>()

  const heading = getText(data.heading)
  const iconLabel = isSelectableRasterIconName(data.headingIconName)
    ? getSelectableRasterIconLabel(data.headingIconName)
    : ''
  const level = getText(data.headingLevel).toUpperCase()
  return (
    <BlockLabel
      prefix="Nagłówek"
      value={[level, heading || iconLabel].filter(Boolean).join(' · ')}
    />
  )
}

export function ActionLinksBlockLabelClient() {
  const { data } = useRowLabel<CountedBlockData>()
  const count = Array.isArray(data.items) ? data.items.length : 0
  return <BlockLabel prefix="Odnośniki akcji" value={count ? `${count}` : ''} />
}

export function SectionGroupBlockLabelClient() {
  const { data } = useRowLabel<CountedBlockData>()
  const count = Array.isArray(data.sections) ? data.sections.length : 0
  const noun = count === 1 ? 'sekcja' : count >= 2 && count <= 4 ? 'sekcje' : 'sekcji'
  const countLabel = count ? `${count} ${noun}` : ''
  return (
    <BlockLabel
      prefix="Grupa sekcji"
      value={[getPresentationDescription(data), countLabel].filter(Boolean).join(' — ')}
    />
  )
}

export function ColumnLayoutBlockLabelClient() {
  const { data, path } = useRowLabel<ColumnLayoutBlockData>()
  const liveWidthEntries = useFormFields(([fields]) =>
    Object.entries(fields)
      .flatMap(([fieldPath, field]) => {
        const match = fieldPath.match(
          new RegExp(`^${path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.columns\\.(\\d+)\\.width$`),
        )
        return match && typeof field.value === 'number'
          ? [{ index: Number(match[1]), width: field.value }]
          : []
      })
      .sort((left, right) => left.index - right.index)
      .map(({ index, width }) => [index, width] as const),
  )
  const rowWidths = Array.isArray(data.columns)
    ? data.columns.flatMap((column) => (typeof column.width === 'number' ? [column.width] : []))
    : []
  const widths = liveWidthEntries.length ? liveWidthEntries.map(([, width]) => width) : rowWidths
  const widthsLabel = widths.length ? widths.map((width) => `${width}/12`).join(' + ') : ''
  const value = [getPresentationDescription(data), widthsLabel].filter(Boolean).join(' — ')

  return <BlockLabel prefix="Układ kolumnowy" value={value} />
}
