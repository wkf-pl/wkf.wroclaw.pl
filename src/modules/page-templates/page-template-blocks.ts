import {
  BoldFeature,
  FixedToolbarFeature,
  ItalicFeature,
  lexicalEditor,
  ParagraphFeature,
  SubscriptFeature,
  SuperscriptFeature,
  UnderlineFeature,
} from '@payloadcms/richtext-lexical'
import type { Block, BlocksField } from 'payload'

import { createBooleanSwitchAdmin } from '@/components/admin/boolean-switch-config'
import { createRasterIconField } from '@/modules/icons/fields'

import {
  AttachmentsBlock,
  CardBlock,
  ContentCalendarBlock,
  HeadingBlock,
  MediaGalleryBlock,
  PageTemplateActionLinksBlock,
  PageTemplateListingBlock,
  RichTextBlock,
  createColumnLayoutBlock,
  createSectionGroupBlock,
  createTabbedContentBlock,
} from '@/blocks'

import {
  getPageTemplateDefinition,
  isPageTemplateID,
  pageTemplateBadgeVariants,
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
    group: 'Elementy',
    images: {
      thumbnail: {
        alt: 'Pojedyncze pole wyróżnione na karcie',
        url: '/assets/block-thumbnails/current-item-field.png',
      },
    },
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'field',
          type: 'select',
          admin: {
            components: {
              Field: '/components/admin/PageTemplateFields#CurrentItemFieldSelect',
            },
            isClearable: false,
            width: '66.667%',
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
            width: '33.333%',
          },
          label: 'Wygląd',
          options: dynamicFieldVariantOptions,
          required: true,
        },
      ],
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
    group: 'Elementy',
    images: {
      thumbnail: {
        alt: 'Dokument z treścią bieżącego elementu',
        url: '/assets/block-thumbnails/current-item-content.png',
      },
    },
  },
  fields: [],
  interfaceName: 'CurrentItemContentBlock',
  labels: {
    plural: 'Treści bieżącego elementu',
    singular: 'Treści bieżącego elementu',
  },
}

const FieldRowTextBlock: Block = {
  slug: 'fieldRowText',
  admin: {
    components: {
      Label: '/components/admin/PageTemplateFields#FieldRowTextBlockLabel',
    },
    disableBlockName: true,
    group: 'Elementy',
    images: {
      thumbnail: {
        alt: 'Krótki tekst',
        url: '/assets/block-thumbnails/rich-text.png',
      },
    },
  },
  fields: [
    {
      name: 'style',
      type: 'select',
      admin: { isClearable: false },
      defaultValue: 'plain',
      label: 'Styl',
      options: [
        { label: 'Zwykły tekst', value: 'plain' },
        ...pageTemplateBadgeVariants,
        { label: 'Etykieta informacyjna', value: 'informationLabel' },
      ],
    },
    {
      name: 'text',
      type: 'richText',
      editor: lexicalEditor({
        features: () => [
          ParagraphFeature(),
          BoldFeature(),
          ItalicFeature(),
          UnderlineFeature(),
          SuperscriptFeature(),
          SubscriptFeature(),
          FixedToolbarFeature(),
        ],
      }),
      label: 'Tekst',
      required: true,
    },
  ],
  interfaceName: 'FieldRowTextBlock',
  labels: { plural: 'Teksty', singular: 'Tekst' },
}

const PageTemplateIconBlock: Block = {
  slug: 'pageTemplateIcon',
  admin: {
    components: {
      Label: '/components/admin/PageTemplateFields#PageTemplateIconBlockLabel',
    },
    disableBlockName: true,
    group: 'Elementy',
    images: {
      thumbnail: {
        alt: 'Symbol ikony',
        url: '/assets/block-thumbnails/page-template-icon.png',
      },
    },
  },
  fields: [
    {
      type: 'row',
      fields: [
        { ...createRasterIconField({ adminWidth: '75%' }), required: true },
        {
          name: 'iconInverted',
          type: 'checkbox',
          admin: createBooleanSwitchAdmin({ width: '25%' }),
          defaultValue: false,
          label: 'Inwersja',
        },
      ],
    },
    {
      name: 'hanging',
      type: 'checkbox',
      admin: {
        ...createBooleanSwitchAdmin(),
        description:
          'Wyrównuje kolejne bloki w tej samej sekcji lub kolumnie do treści obok ikony.',
      },
      defaultValue: false,
      label: 'Ikona na marginesie',
    },
  ],
  interfaceName: 'PageTemplateIconBlock',
  labels: { plural: 'Ikony', singular: 'Ikona' },
}

export const CurrentItemFieldRowBlock: Block = {
  slug: 'currentItemFieldRow',
  admin: {
    components: {
      Label: '/components/admin/PageTemplateFields#CurrentItemFieldRowBlockLabel',
    },
    disableBlockName: true,
    group: 'Układ',
    images: {
      thumbnail: {
        alt: 'Trzy elementy ustawione w jednym wierszu',
        url: '/assets/block-thumbnails/current-item-field-row.png',
      },
    },
  },
  fields: [
    {
      name: 'items',
      type: 'blocks',
      admin: { initCollapsed: false },
      blocks: [
        CurrentItemFieldBlock,
        FieldRowTextBlock,
        PageTemplateIconBlock,
        PageTemplateActionLinksBlock,
      ],
      label: 'Elementy wiersza',
      labels: { plural: 'Elementy wiersza', singular: 'element wiersza' },
      minRows: 1,
      required: true,
    },
  ],
  interfaceName: 'CurrentItemFieldRowBlock',
  labels: {
    plural: 'Wiersze pól',
    singular: 'Wiersz pól',
  },
}

const informationLeafBlocks = [
  RichTextBlock,
  HeadingBlock,
  PageTemplateActionLinksBlock,
  CurrentItemFieldBlock,
  CurrentItemFieldRowBlock,
  PageTemplateIconBlock,
]
const contentLeafBlocks = [
  RichTextBlock,
  HeadingBlock,
  PageTemplateActionLinksBlock,
  CardBlock,
  PageTemplateListingBlock,
  ContentCalendarBlock,
  MediaGalleryBlock,
  AttachmentsBlock,
  CurrentItemFieldBlock,
  CurrentItemFieldRowBlock,
  CurrentItemContentBlock,
  PageTemplateIconBlock,
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
  hero: [
    RichTextBlock,
    HeadingBlock,
    PageTemplateActionLinksBlock,
    CurrentItemFieldBlock,
    CurrentItemFieldRowBlock,
    PageTemplateIconBlock,
  ],
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
