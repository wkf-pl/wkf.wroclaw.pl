import type { FieldHook } from 'payload'

type SlugDocument = {
  id: number | string
  name?: string | null
  slug?: string | null
  title?: string | null
}

const polishCharacters: Record<string, string> = {
  ą: 'a',
  ć: 'c',
  ę: 'e',
  ł: 'l',
  ń: 'n',
  ó: 'o',
  ś: 's',
  ź: 'z',
  ż: 'z',
}

export function formatSlug(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase('pl')
    .replace(/[ąćęłńóśźż]/g, (character) => polishCharacters[character] ?? character)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const populateSlug: FieldHook<SlugDocument, string | null | undefined, SlugDocument> = ({
  context,
  siblingData,
  value,
}) => {
  if (context.skipSlugGeneration === true) return value
  const source = value || siblingData.title

  return typeof source === 'string' ? formatSlug(source) : value
}

export const populateSlugFromName: FieldHook<
  SlugDocument,
  string | null | undefined,
  SlugDocument
> = ({ siblingData, value }) => {
  const source = value || siblingData.name

  return typeof source === 'string' ? formatSlug(source) : value
}

export function validatePageSlug(value: null | string | undefined): string | true {
  if (!value) {
    return true
  }

  if (['admin', 'api', 'category', 'health', 'members', 'tag'].includes(value)) {
    return 'Ten adres jest zarezerwowany przez aplikację.'
  }

  return true
}
