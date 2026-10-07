import Link from 'next/link'

import type { CardBlock } from '@/payload-types'
import { resolvePageLink, resolvePresentedLinks } from '@/modules/navigation/links'

import { CmsImage } from './CmsImage'
import { PresentedLink } from './PresentedLink'

export function CardBlockSection({ block }: { block: CardBlock }) {
  const titleLink = resolvePageLink(block.destinationPage)
  const links = resolvePresentedLinks(block.links ?? [])

  return (
    <article className="cardBlock">
      {block.image && typeof block.image === 'object' ? (
        <CmsImage className="cardBlockImage" media={block.image} />
      ) : (
        <span aria-hidden="true" className="cardBlockImage cardBlockImageFallback" />
      )}
      <span aria-hidden="true" className="cardBlockShade" />
      <div className="cardBlockContent">
        <h3>{titleLink ? <Link {...titleLink}>{block.title}</Link> : block.title}</h3>
        {links.length ? (
          <ul>
            {links.map((item, itemIndex) => (
              <li key={`${item.link.href}-${itemIndex}`}>
                <PresentedLink item={item} trailingIconName="arrow-right" />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  )
}
