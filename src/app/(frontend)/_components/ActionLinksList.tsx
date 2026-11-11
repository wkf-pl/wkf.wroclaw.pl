import type { ResolvedPresentedLink } from '@/modules/navigation/links'

import { PresentedLink } from './PresentedLink'

type ActionLinksListProperties = {
  alignment?: null | string
  items: ResolvedPresentedLink[]
  layout?: null | string
}

export function ActionLinksList({ alignment, items, layout }: ActionLinksListProperties) {
  if (!items.length) return null

  return (
    <ul
      className={`actionLinks actionLinks--${layout ?? 'inline'} actionLinks--align-${alignment ?? 'start'}`}
    >
      {items.map((item, itemIndex) => (
        <li key={`${item.link.href}-${itemIndex}`}>
          <PresentedLink item={item} />
        </li>
      ))}
    </ul>
  )
}
