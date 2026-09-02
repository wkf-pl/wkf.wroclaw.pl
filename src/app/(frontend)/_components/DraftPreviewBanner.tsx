type DraftPreviewBannerProperties = {
  pathname: string
}

export function DraftPreviewBanner({ pathname }: DraftPreviewBannerProperties) {
  const exitURL = `/preview/exit?${new URLSearchParams({ path: pathname }).toString()}`

  return (
    <aside className="draftPreviewBanner" role="status">
      <span>Wyświetlasz zapisany szkic.</span>
      <a href={exitURL}>Wyłącz podgląd</a>
    </aside>
  )
}
