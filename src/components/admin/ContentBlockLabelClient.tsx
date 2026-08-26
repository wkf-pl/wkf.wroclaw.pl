'use client'

import { useFormFields, useRowLabel } from '@payloadcms/ui'

const previewCharacterLimit = 96

type LexicalNode = {
  children?: unknown
  root?: unknown
  text?: unknown
  value?: unknown
}

type RichTextBlockData = {
  content?: unknown
}

type HeadingBlockData = {
  heading?: unknown
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

  return <BlockLabel prefix="Treść" value={contentPreview} />
}

export function ListingBlockLabelClient() {
  const { data } = useRowLabel<HeadingBlockData>()

  return (
    <BlockLabel prefix="Listing" value={typeof data.heading === 'string' ? data.heading : ''} />
  )
}

export function MediaGalleryBlockLabelClient() {
  const { data } = useRowLabel<HeadingBlockData>()

  return (
    <BlockLabel
      prefix="Galeria mediów"
      value={typeof data.heading === 'string' ? data.heading : ''}
    />
  )
}

export function AttachmentsBlockLabelClient() {
  const { data } = useRowLabel<HeadingBlockData>()

  return (
    <BlockLabel prefix="Załączniki" value={typeof data.heading === 'string' ? data.heading : ''} />
  )
}

export function DocumentsBlockLabelClient() {
  const { data } = useRowLabel<HeadingBlockData>()

  return (
    <BlockLabel prefix="Dokumenty" value={typeof data.heading === 'string' ? data.heading : ''} />
  )
}

export function MemberProfilesBlockLabelClient() {
  const { data } = useRowLabel<HeadingBlockData>()

  return (
    <BlockLabel prefix="Wizytówki" value={typeof data.heading === 'string' ? data.heading : ''} />
  )
}
