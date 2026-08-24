import Link from 'next/link'

import type { PublicBreadcrumb } from '@/modules/content/public-hierarchy'

export function HierarchyBreadcrumbs({ breadcrumbs }: { breadcrumbs: PublicBreadcrumb[] }) {
  if (breadcrumbs.length < 2) return null

  return (
    <nav aria-label="Okruszki" className="hierarchyBreadcrumbs">
      <ol>
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={`${breadcrumb.label}-${index}`}>
            {breadcrumb.url ? (
              <Link href={breadcrumb.url}>{breadcrumb.label}</Link>
            ) : (
              breadcrumb.label
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
