'use client'

import { useListQuery } from '@payloadcms/ui'
import { useLayoutEffect } from 'react'

import { getMediaCategoryWhere, type MediaCategory } from '@/modules/media/media-categories'

const mediaCategoryLabels: Record<MediaCategory, string> = {
  documents: 'Dokumenty',
  images: 'Obrazy',
  other: 'Inne',
}

function categoryIsSelected(category: MediaCategory, where: unknown): boolean {
  return JSON.stringify(where) === JSON.stringify(getMediaCategoryWhere(category))
}

export function MediaCategoryTabs() {
  const { handleWhereChange, query } = useListQuery()
  const where = query?.where

  useLayoutEffect(() => {
    if (handleWhereChange && !where) {
      void handleWhereChange(getMediaCategoryWhere('images'))
    }
  }, [handleWhereChange, where])

  if (!handleWhereChange || !query) {
    return null
  }

  return (
    <div className="wkf-media-category-tabs">
      <div className="tabs-field__tabs-wrap">
        <div aria-label="Typ pliku" className="tabs-field__tabs">
          {(['images', 'documents', 'other'] as const).map((category) => {
            const selected =
              category === 'images' && !where ? true : categoryIsSelected(category, where)

            return (
              <button
                className={['tabs-field__tab-button', selected && 'tabs-field__tab-button--active']
                  .filter(Boolean)
                  .join(' ')}
                key={category}
                onClick={() => void handleWhereChange(getMediaCategoryWhere(category))}
                type="button"
              >
                {mediaCategoryLabels[category]}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
