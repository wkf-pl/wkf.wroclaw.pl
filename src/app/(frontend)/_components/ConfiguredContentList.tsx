'use client'

import Link from 'next/link'
import { useId, useRef, type CSSProperties } from 'react'

import { CmsRichText } from '@/components/CmsRichText'
import type { ContentListingPresentation } from '@/modules/content/content-listing-presentation'
import type { ListingView } from '@/modules/content/listing-view'

import { CmsImage } from './CmsImage'
import { TaxonomyLinks } from './TaxonomyLinks'
import styles from './ConfiguredContentList.module.css'

export function ConfiguredContentList({
  items,
  view,
  emptyMessage,
}: {
  items: ContentListingPresentation[]
  view: ListingView
  emptyMessage?: string | null
}) {
  const list = useRef<HTMLUListElement>(null)
  const listId = useId()
  if (!items.length) return <p>{emptyMessage || 'Nie ma opublikowanych treści.'}</p>

  function move(direction: number) {
    const element = list.current
    const item = element?.firstElementChild
    if (!element || !item) return
    element.scrollBy({ left: direction * (item.getBoundingClientRect().width + 16) })
  }

  return (
    <div>
      {view.layout === 'carousel' && items.length > 1 ? (
        <div className={styles.controls}>
          <button aria-controls={listId} type="button" onClick={() => move(-1)}>
            Poprzedni
          </button>
          <button aria-controls={listId} type="button" onClick={() => move(1)}>
            Następny
          </button>
        </div>
      ) : null}
      <ul
        className={styles.items}
        data-form={view.form}
        data-layout={view.layout}
        id={listId}
        ref={list}
        style={{ '--listing-columns': view.columns } as CSSProperties}
      >
        {items.map((item, index) => (
          <li key={`${item.url}-${index}`}>
            <article className={styles.article}>
              {item.image ? (
                <div className={styles.image}>
                  {item.image.kind === 'media' ? (
                    <CmsImage media={item.image.media} />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element -- Profile images can use a runtime-configured host.
                    <img alt={item.image.alt} src={item.image.url} loading="lazy" />
                  )}
                </div>
              ) : null}
              <div className={styles.body}>
                <h2>
                  <Link href={item.url}>{item.title}</Link>
                </h2>
                {item.kindLabel ? <p>{item.kindLabel}</p> : null}
                {item.metadataText || item.metadataDate ? (
                  <p>
                    {item.metadataText}{' '}
                    {item.metadataDate ? (
                      <time dateTime={item.metadataDate.dateTime}>{item.metadataDate.label}</time>
                    ) : null}
                  </p>
                ) : null}
                {item.facts.map((fact) => (
                  <p key={fact.icon}>
                    <span>{fact.label} </span>
                    {fact.dateTime ? (
                      <time dateTime={fact.dateTime}>{fact.value}</time>
                    ) : fact.href ? (
                      <a href={fact.href}>{fact.value}</a>
                    ) : (
                      fact.value
                    )}
                  </p>
                ))}
                {item.metadataLink ? (
                  <p>
                    {item.metadataLink.prefix}{' '}
                    <Link href={item.metadataLink.href}>{item.metadataLink.label}</Link>
                  </p>
                ) : null}
                {item.contextLabel ? <p>{item.contextLabel}</p> : null}
                {item.excerpt?.kind === 'richText' ? (
                  <CmsRichText data={item.excerpt.value} />
                ) : item.excerpt ? (
                  <p>{item.excerpt.value}</p>
                ) : null}
                {item.interests ? <p>{item.interests}</p> : null}
                {item.category || item.tags?.length ? (
                  <TaxonomyLinks category={item.category} tags={item.tags} />
                ) : null}
                {item.secondaryAction ? (
                  <a href={item.secondaryAction.href}>{item.secondaryAction.label}</a>
                ) : null}
              </div>
            </article>
          </li>
        ))}
      </ul>
    </div>
  )
}
