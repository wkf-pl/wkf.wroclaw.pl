import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'

type RichTextDocument = {
  [key: string]: unknown
  root: {
    children: unknown[]
  }
}

function isRichTextDocument(value: unknown): value is RichTextDocument {
  if (!value || typeof value !== 'object' || !('root' in value)) return false
  const root = value.root
  return Boolean(
    root && typeof root === 'object' && 'children' in root && Array.isArray(root.children),
  )
}

function shortenText(value: string, maximumLength?: number): string {
  if (!maximumLength || value.length <= maximumLength) return value

  const shortenedText = value.slice(0, Math.max(1, maximumLength - 1)).trimEnd()
  const lastWordBoundary = shortenedText.lastIndexOf(' ')
  return `${lastWordBoundary > 0 ? shortenedText.slice(0, lastWordBoundary) : shortenedText}…`
}

export function extractRichTextText(value: unknown, maximumLength?: number): string {
  const plaintext =
    typeof value === 'string'
      ? value
      : isRichTextDocument(value)
        ? convertLexicalToPlaintext({
            data: value as unknown as Parameters<typeof convertLexicalToPlaintext>[0]['data'],
          })
        : ''

  return shortenText(plaintext.replace(/\s+/g, ' ').trim(), maximumLength)
}

export function isRichTextEmpty(value: unknown): boolean {
  return extractRichTextText(value).length === 0
}

export function createRichTextDocument(paragraphs: readonly string[]) {
  return {
    root: {
      children: paragraphs
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .map((paragraph) => ({
          children: [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: paragraph,
              type: 'text',
              version: 1,
            },
          ],
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
          textFormat: 0,
          textStyle: '',
          type: 'paragraph' as const,
          version: 1,
        })),
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      type: 'root' as const,
      version: 1,
    },
  }
}
