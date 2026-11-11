import { currentItemFieldSources, type CurrentItemFieldSource } from './current-item-fields'
import { contentBadgeVariants, createTextStyleOptions } from '@/modules/content/text-styles'

export type PageTemplateRegion = 'content' | 'hero' | 'informationPanel'

export type PageTemplateRouteKind = 'collectionIndex' | 'collectionItem'

export type PageTemplateHeroImageRule = 'configurable' | 'currentItem' | 'none'

export type PageTemplateRenderingMode = 'legacy' | 'template'

export type PageTemplatePreviewCollection =
  'categories' | 'event-cycles' | 'events' | 'member-profiles' | 'partners' | 'tags'

export type PageTemplateFieldVariant = {
  label: string
  legacy?: boolean
  value: string
}

export type PageTemplateDynamicField = {
  defaultVariant: string
  inline: boolean
  key: string
  label: string
  regions: readonly PageTemplateRegion[]
  source?: CurrentItemFieldSource
  variants: readonly PageTemplateFieldVariant[]
}

export type PageTemplateContextAction = {
  key: 'eventCalendar' | 'eventCycleCalendar' | 'eventMap'
  label: string
}

export type PageTemplateContextListingRelation = {
  key: 'eventPartners'
  label: string
  source: 'partners'
}

export type PageTemplateBlockCapability = {
  blockType: string
  label: string
  regions: readonly PageTemplateRegion[]
  variants?: readonly string[]
}

export type PageTemplateDefinition = {
  allowedBlocks: readonly PageTemplateBlockCapability[]
  contextActions?: readonly PageTemplateContextAction[]
  contextListingRelations?: readonly PageTemplateContextListingRelation[]
  currentItemLabel: string | null
  dynamicFields: readonly PageTemplateDynamicField[]
  heroImageRule: PageTemplateHeroImageRule
  id: PageTemplateID
  label: string
  previewCollection: PageTemplatePreviewCollection | null
  regions: readonly PageTemplateRegion[]
  rendererAvailable: boolean
  route: string
  routeKind: PageTemplateRouteKind
}

export type PageTemplateID =
  | 'blog-index'
  | 'category-detail'
  | 'event-cycle-detail'
  | 'event-detail'
  | 'events-index'
  | 'member-detail'
  | 'members-index'
  | 'partner-detail'
  | 'tag-detail'

const pageTemplateRegions = ['hero', 'informationPanel', 'content'] as const
const contentRegions = ['informationPanel', 'content'] as const

const headingVariants = [
  { label: 'Nagłówek główny', value: 'primaryHeading' },
  { label: 'Nagłówek sekcji', value: 'sectionHeading' },
  { label: 'Nadtytuł', value: 'eyebrow' },
] as const

const textVariants = createTextStyleOptions({ basic: 'body', compact: 'compact' })

export const pageTemplateBadgeVariants = contentBadgeVariants

const listVariants = [
  { label: 'W jednym wierszu', value: 'inline' },
  { label: 'Lista', value: 'list' },
  { label: 'Pastylki', value: 'pills' },
] as const

const informationVariants = [
  { label: 'Standardowo', legacy: true, value: 'icon' },
  { label: 'Standardowo', value: 'plain' },
  { label: 'Kompaktowo', value: 'compact' },
] as const

const standardContentBlocks: readonly PageTemplateBlockCapability[] = [
  { blockType: 'heading', label: 'Nagłówek', regions: ['hero', 'informationPanel', 'content'] },
  { blockType: 'spacer', label: 'Odstęp', regions: pageTemplateRegions },
  { blockType: 'fieldRowText', label: 'Tekst', regions: pageTemplateRegions },
  { blockType: 'richText', label: 'Treść', regions: ['hero', 'informationPanel', 'content'] },
  {
    blockType: 'actionLinks',
    label: 'Odnośniki akcji',
    regions: ['hero', 'informationPanel', 'content'],
  },
  {
    blockType: 'currentItemFieldRow',
    label: 'Wiersz pól',
    regions: ['hero', 'informationPanel', 'content'],
  },
  { blockType: 'pageTemplateIcon', label: 'Ikona', regions: pageTemplateRegions },
  {
    blockType: 'listing',
    label: 'Listing',
    regions: contentRegions,
    variants: ['tiles', 'cards', 'carousel', 'compact', 'grid'],
  },
  { blockType: 'card', label: 'Karta', regions: contentRegions },
  { blockType: 'contentCalendar', label: 'Kalendarz treści', regions: contentRegions },
  { blockType: 'mediaGallery', label: 'Galeria', regions: contentRegions },
  { blockType: 'attachments', label: 'Załączniki', regions: contentRegions },
  {
    blockType: 'columnLayout',
    label: 'Kolumny',
    regions: contentRegions,
  },
  {
    blockType: 'sectionGroup',
    label: 'Grupa sekcji',
    regions: contentRegions,
  },
  { blockType: 'tabs', label: 'Zakładki', regions: contentRegions },
]

const itemContentBlock: PageTemplateBlockCapability = {
  blockType: 'currentItemContent',
  label: 'Treści bieżącego elementu',
  regions: contentRegions,
}

const eventInformationFields: readonly PageTemplateDynamicField[] = [
  createDynamicField('eventTime', 'Termin', ['informationPanel'], informationVariants, true),
  createDynamicField('eventLocation', 'Miejsce', ['informationPanel'], informationVariants, true),
  createDynamicField(
    'eventAudience',
    'Publiczność',
    ['informationPanel'],
    informationVariants,
    true,
  ),
  createDynamicField(
    'eventCapacity',
    'Liczba miejsc',
    ['informationPanel'],
    informationVariants,
    true,
  ),
]

const basePageTemplateRegistry: readonly PageTemplateDefinition[] = [
  createIndexTemplate('blog-index', 'Blog', '/blog'),
  createIndexTemplate('events-index', 'Wydarzenia', '/events'),
  createIndexTemplate('members-index', 'Klubowicze', '/members'),
  {
    allowedBlocks: standardContentBlocks,
    currentItemLabel: 'Tag',
    dynamicFields: [
      createDynamicField('name', 'Nazwa', pageTemplateRegions, headingVariants),
      createDynamicField('description', 'Opis', pageTemplateRegions, textVariants),
    ],
    heroImageRule: 'none',
    id: 'tag-detail',
    label: 'Wpisy z tagiem',
    previewCollection: 'tags',
    regions: pageTemplateRegions,
    rendererAvailable: true,
    route: '/tag/[slug]',
    routeKind: 'collectionItem',
  },
  {
    allowedBlocks: standardContentBlocks,
    currentItemLabel: 'Kategoria',
    dynamicFields: [
      createDynamicField('name', 'Nazwa', pageTemplateRegions, headingVariants),
      createDynamicField('description', 'Opis', pageTemplateRegions, textVariants),
      createDynamicField('hierarchy', 'Hierarchia kategorii', pageTemplateRegions, listVariants),
    ],
    heroImageRule: 'none',
    id: 'category-detail',
    label: 'Wpisy z kategorii',
    previewCollection: 'categories',
    regions: pageTemplateRegions,
    rendererAvailable: true,
    route: '/category/[slug]',
    routeKind: 'collectionItem',
  },
  {
    allowedBlocks: [...standardContentBlocks, itemContentBlock],
    contextActions: [
      { key: 'eventCalendar', label: 'Dodaj do kalendarza' },
      { key: 'eventMap', label: 'Otwórz w Mapach' },
      { key: 'eventCycleCalendar', label: 'Subskrybuj cykl' },
    ],
    contextListingRelations: [
      {
        key: 'eventPartners',
        label: 'Partnerzy bieżącego wydarzenia',
        source: 'partners',
      },
    ],
    currentItemLabel: 'Wydarzenie',
    dynamicFields: [
      createDynamicField('eventType', 'Typ wydarzenia', ['hero'], pageTemplateBadgeVariants, true),
      createDynamicField(
        'eventStatus',
        'Status wydarzenia',
        ['hero'],
        pageTemplateBadgeVariants,
        true,
      ),
      createDynamicField('title', 'Tytuł', ['hero'], headingVariants),
      createDynamicField('excerpt', 'Opis', pageTemplateRegions, textVariants),
      createDynamicField('eventCycle', 'Cykl', pageTemplateRegions, listVariants, true),
      createDynamicField('tags', 'Tagi', pageTemplateRegions, listVariants, true),
      ...eventInformationFields,
      createDynamicField('partners', 'Partnerzy', contentRegions, listVariants),
    ],
    heroImageRule: 'currentItem',
    id: 'event-detail',
    label: 'Szczegóły wydarzenia',
    previewCollection: 'events',
    regions: pageTemplateRegions,
    rendererAvailable: true,
    route: '/events/[slug]',
    routeKind: 'collectionItem',
  },
  {
    allowedBlocks: [...standardContentBlocks, itemContentBlock],
    contextActions: [{ key: 'eventCycleCalendar', label: 'Subskrybuj cykl' }],
    contextListingRelations: [
      { key: 'eventPartners', label: 'Partnerzy bieżącego cyklu', source: 'partners' },
    ],
    currentItemLabel: 'Cykl wydarzeń',
    dynamicFields: [
      createDynamicField('title', 'Tytuł', ['hero'], headingVariants),
      createDynamicField('excerpt', 'Opis', pageTemplateRegions, textVariants),
      createDynamicField('organizers', 'Organizatorzy', contentRegions, listVariants),
      createDynamicField('partners', 'Partnerzy', contentRegions, listVariants),
    ],
    heroImageRule: 'currentItem',
    id: 'event-cycle-detail',
    label: 'Szczegóły cyklu wydarzeń',
    previewCollection: 'event-cycles',
    regions: pageTemplateRegions,
    rendererAvailable: true,
    route: '/events/series/[slug]',
    routeKind: 'collectionItem',
  },
  {
    allowedBlocks: [...standardContentBlocks, itemContentBlock],
    currentItemLabel: 'Partner',
    dynamicFields: [
      createDynamicField('name', 'Nazwa', ['hero'], headingVariants),
      createDynamicField('excerpt', 'Opis', pageTemplateRegions, textVariants),
      createDynamicField('website', 'Strona internetowa', pageTemplateRegions, listVariants),
    ],
    heroImageRule: 'currentItem',
    id: 'partner-detail',
    label: 'Szczegóły partnera',
    previewCollection: 'partners',
    regions: pageTemplateRegions,
    rendererAvailable: true,
    route: '/partners/[slug]',
    routeKind: 'collectionItem',
  },
  {
    allowedBlocks: [...standardContentBlocks, itemContentBlock],
    currentItemLabel: 'Wizytówka',
    dynamicFields: [
      createDynamicField('publicName', 'Nazwa publiczna', ['hero'], headingVariants),
      createDynamicField('clubFunction', 'Funkcja w klubie', pageTemplateRegions, textVariants),
      createDynamicField('about', 'O mnie', contentRegions, textVariants),
      createDynamicField('contactChannels', 'Kanały kontaktu', contentRegions, listVariants),
    ],
    heroImageRule: 'currentItem',
    id: 'member-detail',
    label: 'Profil klubowicza',
    previewCollection: 'member-profiles',
    regions: pageTemplateRegions,
    rendererAvailable: true,
    route: '/members/[slug]',
    routeKind: 'collectionItem',
  },
] as const

export const pageTemplateRegistry = basePageTemplateRegistry.map((definition) => {
  if (!definition.previewCollection) return definition

  const fields = currentItemFieldSources[definition.previewCollection]
  return {
    ...definition,
    dynamicFields: [
      ...definition.dynamicFields.map((field) => ({ ...field, regions: definition.regions })),
      ...fields.map(({ key, label, source }) => {
        const isList = ['tags', 'join', 'breadcrumbs', 'games', 'organizers', 'links'].includes(
          source.kind,
        )
        const inline = !isList && !['image', 'photo', 'layout', 'richText'].includes(source.kind)
        return {
          ...createDynamicField(
            key,
            label,
            definition.regions,
            isList
              ? listVariants
              : inline || source.kind === 'richText'
                ? textVariants
                : informationVariants,
            inline,
          ),
          source,
        }
      }),
    ],
  }
})

export const pageTemplateIDs = pageTemplateRegistry.map(({ id }) => id)

export function getPageTemplateDefinition(id: PageTemplateID): PageTemplateDefinition | undefined {
  return pageTemplateRegistry.find((template) => template.id === id)
}

export function isPageTemplateID(value: unknown): value is PageTemplateID {
  return typeof value === 'string' && pageTemplateIDs.some((id) => id === value)
}

export function getPageTemplateDynamicField(
  templateID: PageTemplateID,
  fieldKey: string,
  region: PageTemplateRegion,
): PageTemplateDynamicField | undefined {
  return getPageTemplateDefinition(templateID)?.dynamicFields.find(
    (field) => field.key === fieldKey && field.regions.includes(region),
  )
}

export function getPageTemplateContextAction(
  templateID: PageTemplateID,
  actionKey: string,
): PageTemplateContextAction | undefined {
  return getPageTemplateDefinition(templateID)?.contextActions?.find(
    (action) => action.key === actionKey,
  )
}

export function getPageTemplateContextListingRelation(
  templateID: PageTemplateID,
  relationKey: string,
): PageTemplateContextListingRelation | undefined {
  return getPageTemplateDefinition(templateID)?.contextListingRelations?.find(
    (relation) => relation.key === relationKey,
  )
}

export function getPageTemplateRegionFromPath(path: string): PageTemplateRegion | undefined {
  const rootSegment = path.split('.')[0]
  return rootSegment === 'hero' || rootSegment === 'informationPanel' || rootSegment === 'content'
    ? rootSegment
    : undefined
}

function createDynamicField(
  key: string,
  label: string,
  regions: readonly PageTemplateRegion[],
  variants: readonly PageTemplateFieldVariant[],
  inline = false,
): PageTemplateDynamicField {
  const defaultVariant = variants.find(({ legacy }) => !legacy)?.value
  if (!defaultVariant) throw new Error(`Page template field ${key} requires at least one variant.`)
  return { defaultVariant, inline, key, label, regions, variants }
}

function createIndexTemplate(
  id: Extract<PageTemplateID, `${string}-index`>,
  label: string,
  route: string,
): PageTemplateDefinition {
  return {
    allowedBlocks: standardContentBlocks,
    currentItemLabel: null,
    dynamicFields: [],
    heroImageRule: 'configurable',
    id,
    label,
    previewCollection: null,
    regions: pageTemplateRegions,
    rendererAvailable: true,
    route,
    routeKind: 'collectionIndex',
  }
}
