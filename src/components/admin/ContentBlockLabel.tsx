import {
  AttachmentsBlockLabelClient,
  ListingBlockLabelClient,
  MediaGalleryBlockLabelClient,
  MemberProfilesBlockLabelClient,
  RichTextBlockLabelClient,
} from './ContentBlockLabelClient'

type BlockLabelServerProps = {
  data?: unknown
  formState?: Record<string, { value?: unknown }>
  path?: string
  rowNumber?: number
  value?: unknown
}

function getValueAtPath(value: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((currentValue, segment) => {
    if (!currentValue || typeof currentValue !== 'object') {
      return undefined
    }

    return (currentValue as Record<string, unknown>)[segment]
  }, value)
}

export function RichTextBlockLabel({
  data,
  formState,
  path = '',
  rowNumber,
  value,
}: BlockLabelServerProps) {
  const rowIndex = typeof rowNumber === 'number' ? rowNumber - 1 : Number(path.split('.').at(-1))
  const rowPath = Number.isInteger(rowIndex) ? `${path}.${rowIndex}` : path
  const contentPath = `${rowPath}.content`
  const contentFromBlocksValue = Number.isInteger(rowIndex)
    ? getValueAtPath(value, `${rowIndex}.content`)
    : undefined
  const initialContent =
    formState?.[contentPath]?.value ?? getValueAtPath(data, contentPath) ?? contentFromBlocksValue

  return <RichTextBlockLabelClient initialContent={initialContent} />
}

export function ListingBlockLabel() {
  return <ListingBlockLabelClient />
}

export function MediaGalleryBlockLabel() {
  return <MediaGalleryBlockLabelClient />
}

export function AttachmentsBlockLabel() {
  return <AttachmentsBlockLabelClient />
}

export function MemberProfilesBlockLabel() {
  return <MemberProfilesBlockLabelClient />
}
