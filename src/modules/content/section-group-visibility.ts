export const sectionGroupEmptyAwareBlockTypes = ['attachments', 'listing', 'mediaGallery'] as const

type SectionGroupEmptyChildBehavior = 'hideGroup' | 'show' | null | undefined

export function isSectionGroupEmptyAwareBlockType(blockType: string): boolean {
  return sectionGroupEmptyAwareBlockTypes.some((candidate) => candidate === blockType)
}

export function shouldHideSectionGroup(
  behavior: SectionGroupEmptyChildBehavior,
  emptyFilterBlocks: readonly boolean[],
): boolean {
  return behavior === 'hideGroup' && emptyFilterBlocks.some(Boolean)
}
