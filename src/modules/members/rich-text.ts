import { createRichTextDocument, extractRichTextText } from '@/modules/content/rich-text'

export { createRichTextDocument }

export function extractMemberProfileText(value: unknown, maximumLength?: number): string {
  return extractRichTextText(value, maximumLength)
}
