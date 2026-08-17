import type { MediaListingView, PublicMediaListItem } from '@/modules/media/media-listing'

type AttachmentListProperties = {
  items: PublicMediaListItem[]
  view: MediaListingView
}

export function AttachmentList({ items, view }: AttachmentListProperties) {
  return (
    <div className={`mediaList mediaList-${view} attachmentList`}>
      {items.map((item) => {
        const content = (
          <>
            <span className="attachmentPreview">
              {item.isImage && item.url ? (
                // eslint-disable-next-line @next/next/no-img-element -- Media URLs can use a runtime-configured Azure host.
                <img
                  alt=""
                  height={item.height ?? undefined}
                  loading="lazy"
                  src={item.url}
                  width={item.width ?? undefined}
                />
              ) : (
                <span aria-hidden="true" className="attachmentFileType">
                  {getFileType(item)}
                </span>
              )}
            </span>
            <span className="attachmentContent">
              <strong>{item.filename}</strong>
              <span className="attachmentMetadata">
                {[formatMimeType(item.mimeType), formatFileSize(item.filesize)]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
              {item.description ? (
                <span className="attachmentDescription">{item.description}</span>
              ) : null}
            </span>
          </>
        )

        return item.url ? (
          <a
            className="attachmentItem"
            href={item.url}
            key={item.id}
            rel="noopener noreferrer"
            target="_blank"
          >
            {content}
          </a>
        ) : (
          <div className="attachmentItem" key={item.id}>
            {content}
          </div>
        )
      })}
    </div>
  )
}

function getFileType(item: PublicMediaListItem): string {
  const extension = item.filename.includes('.') ? item.filename.split('.').at(-1) : null
  return extension?.slice(0, 5).toUpperCase() || 'PLIK'
}

function formatMimeType(mimeType: null | string): string {
  if (!mimeType) {
    return ''
  }

  return mimeType.split('/').at(-1)?.toUpperCase() || mimeType
}

function formatFileSize(filesize: null | number): string {
  if (!filesize || filesize < 1) {
    return ''
  }

  const units = ['B', 'KiB', 'MiB', 'GiB']
  const unitIndex = Math.min(Math.floor(Math.log(filesize) / Math.log(1024)), units.length - 1)
  const value = filesize / 1024 ** unitIndex
  return `${new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 1 }).format(value)} ${units[unitIndex]}`
}
