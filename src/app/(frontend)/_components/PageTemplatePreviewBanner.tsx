import { DraftPreviewBanner } from './DraftPreviewBanner'

export function PageTemplatePreviewBanner({ pathname }: { pathname: string }) {
  return (
    <DraftPreviewBanner
      message="Podglądasz roboczy układ szablonu. Opublikowana strona nadal używa ostatnio opublikowanego trybu renderowania."
      pathname={pathname}
    />
  )
}
