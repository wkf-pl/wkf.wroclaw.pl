import type { CollectionBeforeChangeHook } from 'payload'

import { walkContentLeafBlocks } from './walk-content-leaf-blocks'

const listingExcerptMaximumLength = 500

function collectText(value: unknown): string {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.map(collectText).filter(Boolean).join(' ')
  if (!value || typeof value !== 'object') return ''

  const record = value as Record<string, unknown>
  const ownText = typeof record.text === 'string' ? record.text : ''
  const childText = collectText(record.children)
  return [ownText, childText].filter(Boolean).join(' ')
}

function truncateAtWord(value: string, maximumLength: number): string {
  if (value.length <= maximumLength) return value

  const truncated = value.slice(0, maximumLength + 1)
  const lastWhitespace = truncated.search(/\s+\S*$/)
  return (
    lastWhitespace > 0 ? truncated.slice(0, lastWhitespace) : value.slice(0, maximumLength)
  ).trim()
}

export function extractFirstRichTextParagraph(layout: unknown): string | null {
  const richTextBlock = [...walkContentLeafBlocks(layout)].find(
    ({ block }) => block.blockType === 'richText',
  )?.block
  if (!richTextBlock) return null

  const content = richTextBlock.content
  if (!content || typeof content !== 'object') return null
  const root = (content as Record<string, unknown>).root
  if (!root || typeof root !== 'object') return null
  const children = (root as Record<string, unknown>).children
  if (!Array.isArray(children)) return null

  for (const child of children) {
    if (!child || typeof child !== 'object' || child.type !== 'paragraph') continue
    const text = collectText(child).replace(/\s+/g, ' ').trim()
    if (text) return truncateAtWord(text, listingExcerptMaximumLength)
  }

  return null
}

export const populateListingExcerptOnPublish: CollectionBeforeChangeHook = ({
  data,
  originalDoc,
}) => {
  const status = data._status ?? originalDoc?._status
  const listingExcerpt = Object.hasOwn(data, 'listingExcerpt')
    ? data.listingExcerpt
    : originalDoc?.listingExcerpt
  if (status !== 'published' || (typeof listingExcerpt === 'string' && listingExcerpt.trim())) {
    return data
  }

  const layout = Object.hasOwn(data, 'layout') ? data.layout : originalDoc?.layout
  const generatedExcerpt = extractFirstRichTextParagraph(layout)
  return generatedExcerpt ? { ...data, listingExcerpt: generatedExcerpt } : data
}
