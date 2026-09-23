import { RasterIcon } from '@/components/RasterIcon'

type DocumentPdfPreviewProperties = {
  documentTitle: string
  href: string
}

export function DocumentPdfPreview({ documentTitle, href }: DocumentPdfPreviewProperties) {
  return (
    <div className="documentPdfPreview">
      <iframe
        className="documentPdfPreviewFrame"
        src={`${href}#page=1&view=FitH&toolbar=0&navpanes=0`}
        title={`Podgląd głównego pliku PDF dokumentu: ${documentTitle}`}
      />
      <div className="documentPdfPreviewActions">
        <a
          aria-label={`Otwórz główny plik PDF dokumentu: ${documentTitle}`}
          className="documentPdfPreviewAction documentPdfPreviewAction--open"
          href={href}
          rel="noreferrer"
          target="_blank"
        >
          <RasterIcon name="zoom-in" size="small" />
        </a>
        <a
          aria-label={`Pobierz główny plik PDF dokumentu: ${documentTitle}`}
          className="documentPdfPreviewAction"
          download
          href={`${href}?download=1`}
        >
          <RasterIcon name="download" size="small" />
        </a>
      </div>
    </div>
  )
}
