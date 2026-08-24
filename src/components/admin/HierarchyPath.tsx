import type { UIFieldServerProps } from 'payload'

import { getRelationshipId } from '@/lib/relationships'

type StoredBreadcrumb = {
  doc?: unknown
  label?: null | string
}

export function HierarchyPath({ collectionSlug, data }: UIFieldServerProps) {
  const breadcrumbs = Array.isArray(data.breadcrumbs)
    ? (data.breadcrumbs as StoredBreadcrumb[])
    : []
  const labelledBreadcrumbs = breadcrumbs.filter(
    (breadcrumb): breadcrumb is StoredBreadcrumb & { label: string } =>
      typeof breadcrumb.label === 'string' && breadcrumb.label.trim().length > 0,
  )

  return (
    <section className="wkf-hierarchy-path">
      <p className="field-label">Ścieżka nawigacji</p>
      {labelledBreadcrumbs.length ? (
        <nav aria-label="Ścieżka nawigacji dokumentu">
          <ol>
            {labelledBreadcrumbs.map((breadcrumb, index) => {
              const documentID = getRelationshipId(breadcrumb.doc)
              const label = breadcrumb.label.trim()

              return (
                <li key={`${documentID ?? label}-${index}`}>
                  {documentID === undefined ? (
                    label
                  ) : (
                    <a href={`/admin/collections/${collectionSlug}/${documentID}`}>{label}</a>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>
      ) : (
        <p>Ścieżka pojawi się po pierwszym zapisie.</p>
      )}
    </section>
  )
}
