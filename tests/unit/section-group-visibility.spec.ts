import { describe, expect, it } from 'vitest'

import {
  isSectionGroupEmptyAwareBlockType,
  sectionGroupEmptyAwareBlockTypes,
  shouldHideSectionGroup,
} from '@/modules/content/section-group-visibility'

describe('section group visibility', () => {
  it('tracks exactly the filter-capable content blocks that remain in scope', () => {
    expect(sectionGroupEmptyAwareBlockTypes).toEqual(['attachments', 'listing', 'mediaGallery'])
    expect(isSectionGroupEmptyAwareBlockType('documents')).toBe(false)
    expect(isSectionGroupEmptyAwareBlockType('richText')).toBe(false)
  })

  it('hides the group only when the configured behavior sees an empty tracked block', () => {
    expect(shouldHideSectionGroup('show', [true])).toBe(false)
    expect(shouldHideSectionGroup('hideGroup', [false, false])).toBe(false)
    expect(shouldHideSectionGroup('hideGroup', [false, true])).toBe(true)
  })
})
