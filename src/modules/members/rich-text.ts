type RichTextNode = {
  children?: RichTextNode[]
  text?: string
  type?: string
}

function isRichTextNode(value: unknown): value is RichTextNode {
  return Boolean(value && typeof value === 'object')
}

function collectText(node: RichTextNode): string {
  if (typeof node.text === 'string') {
    return node.text
  }

  if (!Array.isArray(node.children)) {
    return ''
  }

  const separator = node.type === 'root' ? '\n' : ''
  return node.children.map(collectText).filter(Boolean).join(separator)
}

export function extractMemberProfileText(value: unknown, maximumLength?: number): string {
  if (!isRichTextNode(value) || !('root' in value) || !isRichTextNode(value.root)) {
    return ''
  }

  const text = collectText(value.root)
    .replace(/\s*\n\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!maximumLength || text.length <= maximumLength) {
    return text
  }

  const shortenedText = text.slice(0, Math.max(1, maximumLength - 1)).trimEnd()
  const lastWordBoundary = shortenedText.lastIndexOf(' ')
  return `${lastWordBoundary > 0 ? shortenedText.slice(0, lastWordBoundary) : shortenedText}…`
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
