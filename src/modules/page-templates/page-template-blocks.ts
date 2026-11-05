import type { Block, BlocksField } from 'payload'

import {
  ActionLinksBlock,
  AttachmentsBlock,
  CardBlock,
  ContentCalendarBlock,
  HeadingBlock,
  ListingBlock,
  MediaGalleryBlock,
  RichTextBlock,
  createColumnLayoutBlock,
  createSectionGroupBlock,
  createTabbedContentBlock,
} from '@/blocks'

import {
  getPageTemplateDefinition,
  isPageTemplateID,
  pageTemplateRegistry,
  type PageTemplateRegion,
} from './page-template-registry'

const dynamicFieldOptions = uniqueOptions(
  pageTemplateRegistry.flatMap(({ dynamicFields }) =>
    dynamicFields.map(({ key, label }) => ({ label, value: key })),
  ),
)

const dynamicFieldVariantOptions = uniqueOptions(
  pageTemplateRegistry.flatMap(({ dynamicFields }) =>
    dynamicFields.flatMap(({ variants }) => variants),
  ),
)

export const CurrentItemFieldBlock: Block = {
  slug: 'currentItemField',
  admin: {
    components: {
      Label: '/components/admin/PageTemplateFields#CurrentItemFieldBlockLabel',
    },
    disableBlockName: true,
    group: 'Bieżący element',
  },
  fields: [
    {
      name: 'field',
      type: 'select',
      admin: {
        components: {
          Field: '/components/admin/PageTemplateFields#CurrentItemFieldSelect',
        },
        isClearable: false,
      },
      label: 'Pole',
      options: dynamicFieldOptions,
      required: true,
    },
    {
      name: 'variant',
      type: 'select',
      admin: {
        components: {
          Field: '/components/admin/PageTemplateFields#CurrentItemFieldVariantSelect',
        },
        isClearable: false,
      },
      label: 'Wygląd',
      options: dynamicFieldVariantOptions,
      required: true,
    },
  ],
  interfaceName: 'CurrentItemFieldBlock',
  labels: {
    plural: 'Pola bieżącego elementu',
    singular: 'Pole bieżącego elementu',
  },
}

export const CurrentItemContentBlock: Block = {
  slug: 'currentItemContent',
  admin: {
    components: {
      Label: '/components/admin/PageTemplateFields#CurrentItemContentBlockLabel',
    },
    disableBlockName: true,
    group: 'Bieżący element',
  },
  fields: [],
  interfaceName: 'CurrentItemContentBlock',
  labels: {
    plural: 'Treści bieżącego elementu',
    singular: 'Treści bieżącego elementu',
  },
}

const informationLeafBlocks = [RichTextBlock, HeadingBlock, ActionLinksBlock, CurrentItemFieldBlock]
const contentLeafBlocks = [
  RichTextBlock,
  HeadingBlock,
  ActionLinksBlock,
  CardBlock,
  ListingBlock,
  ContentCalendarBlock,
  MediaGalleryBlock,
  AttachmentsBlock,
  CurrentItemFieldBlock,
  CurrentItemContentBlock,
]

const informationLeafFilter = createNestedBlockFilter('informationPanel', informationLeafBlocks)
const contentLeafFilter = createNestedBlockFilter('content', contentLeafBlocks)

export const InformationPanelColumnsBlock = createColumnLayoutBlock({
  blockSlug: 'infoColumns',
  interfaceName: 'InformationPanelColumnsBlock',
  leafBlocks: informationLeafBlocks,
  nestedFilterOptions: informationLeafFilter,
})

export const InformationPanelGroupBlock = createSectionGroupBlock({
  blockSlug: 'infoGroup',
  interfaceName: 'InformationPanelGroupBlock',
  layoutBlocks: [InformationPanelColumnsBlock],
  leafBlocks: informationLeafBlocks,
  nestedFilterOptions: createNestedBlockFilter('informationPanel', [
    ...informationLeafBlocks,
    InformationPanelColumnsBlock,
  ]),
})

export const PageTemplateColumnLayoutBlock = createColumnLayoutBlock({
  interfaceName: 'PageTemplateColumnLayoutBlock',
  leafBlocks: contentLeafBlocks,
  nestedFilterOptions: contentLeafFilter,
})

export const PageTemplateTabbedContentBlock = createTabbedContentBlock({
  interfaceName: 'PageTemplateTabbedContentBlock',
  layoutBlocks: [PageTemplateColumnLayoutBlock],
  leafBlocks: contentLeafBlocks,
  nestedFilterOptions: createNestedBlockFilter('content', [
    ...contentLeafBlocks,
    PageTemplateColumnLayoutBlock,
  ]),
})

export const PageTemplateSectionGroupBlock = createSectionGroupBlock({
  interfaceName: 'PageTemplateSectionGroupBlock',
  layoutBlocks: [PageTemplateColumnLayoutBlock, PageTemplateTabbedContentBlock],
  leafBlocks: contentLeafBlocks,
  nestedFilterOptions: createNestedBlockFilter('content', [
    ...contentLeafBlocks,
    PageTemplateColumnLayoutBlock,
    PageTemplateTabbedContentBlock,
  ]),
})

const regionBlocks: Record<PageTemplateRegion, Block[]> = {
  content: [
    ...contentLeafBlocks,
    PageTemplateColumnLayoutBlock,
    PageTemplateSectionGroupBlock,
    PageTemplateTabbedContentBlock,
  ],
  hero: [RichTextBlock, HeadingBlock, ActionLinksBlock, CurrentItemFieldBlock],
  informationPanel: [
    ...informationLeafBlocks,
    InformationPanelColumnsBlock,
    InformationPanelGroupBlock,
  ],
}

export function createPageTemplateRegionField(
  region: PageTemplateRegion,
  label: string,
): BlocksField {
  return {
    name: region,
    type: 'blocks',
    admin: { initCollapsed: false },
    blocks: regionBlocks[region],
    filterOptions: ({ data }) => getAllowedPageTemplateBlockSlugs(data?.templateKey, region),
    label,
    labels: {
      plural: `Bloki: ${label.toLocaleLowerCase('pl-PL')}`,
      singular: 'blok',
    },
  }
}

export function getAllowedPageTemplateBlockSlugs(
  templateKey: unknown,
  region: PageTemplateRegion,
): string[] {
  if (!isPageTemplateID(templateKey)) return []

  const definition = getPageTemplateDefinition(templateKey)
  if (!definition) return []

  const slugs = definition.allowedBlocks
    .filter(({ regions }) => regions.includes(region))
    .map(({ blockType }) => mapCapabilityToRegionBlockSlug(blockType, region))

  if (definition.dynamicFields.some(({ regions }) => regions.includes(region))) {
    slugs.push('currentItemField')
  }

  return [...new Set(slugs)]
}

function mapCapabilityToRegionBlockSlug(blockType: string, region: PageTemplateRegion): string {
  if (region === 'informationPanel' && blockType === 'columnLayout') {
    return 'infoColumns'
  }
  if (region === 'informationPanel' && blockType === 'sectionGroup') {
    return 'infoGroup'
  }
  return blockType
}

function createNestedBlockFilter(
  region: PageTemplateRegion,
  availableBlocks: Block[],
): NonNullable<BlocksField['filterOptions']> {
  const availableSlugs = new Set(availableBlocks.map(({ slug }) => slug))
  return ({ data }) =>
    getAllowedPageTemplateBlockSlugs(data?.templateKey, region).filter((slug) =>
      availableSlugs.has(slug),
    )
}

function uniqueOptions(options: Array<{ label: string; value: string }>) {
  const unique = new Map<string, { label: string; value: string }>()
  for (const option of options) {
    if (!unique.has(option.value)) unique.set(option.value, option)
  }
  return [...unique.values()]
}
