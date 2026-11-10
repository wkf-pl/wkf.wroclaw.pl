type DraftPreviewBannerProperties = {
  message?: string
  pathname: string
}

export function DraftPreviewBanner({
  message = 'Wyświetlasz zapisany szkic.',
  pathname,
}: DraftPreviewBannerProperties) {
  const exitURL = `/preview/exit?${new URLSearchParams({ path: pathname }).toString()}`

  return (
    <aside className="draftPreviewBanner" role="status">
      <span>{message}</span>
      <a href={exitURL}>Wyłącz podgląd</a>
    </aside>
  )
}
