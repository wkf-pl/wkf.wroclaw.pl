export function StructuredData({ value }: { value: object | null }) {
  if (!value) return null
  return (
    <script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(value).replaceAll('<', '\\u003c') }}
      type="application/ld+json"
    />
  )
}
