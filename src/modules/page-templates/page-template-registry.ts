export type PageTemplateRegion = 'content' | 'hero' | 'informationPanel'

export type PageTemplateRouteKind = 'collectionIndex' | 'collectionItem'

export type PageTemplateHeroImageRule = 'configurable' | 'currentItem' | 'none'

export type PageTemplateDynamicField = {
  key: string
  label: string
  regions: readonly PageTemplateRegion[]
}

export type PageTemplateBlockCapability = {
  blockType: string
  label: string
  regions: readonly PageTemplateRegion[]
  variants?: readonly string[]
}

export type PageTemplateDefinition = {
  allowedBlocks: readonly PageTemplateBlockCapability[]
  currentItemLabel: string | null
  dynamicFields: readonly PageTemplateDynamicField[]
  heroImageRule: PageTemplateHeroImageRule
  id: PageTemplateID
  label: string
  regions: readonly PageTemplateRegion[]
  requiresCurrentItemContent: boolean
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

const standardContentBlocks: readonly PageTemplateBlockCapability[] = [
  { blockType: 'heading', label: 'Nagłówek', regions: ['hero', 'content'] },
  { blockType: 'richText', label: 'Tekst', regions: ['hero', 'content'] },
  { blockType: 'actionLinks', label: 'Odnośniki akcji', regions: ['hero', 'content'] },
  {
    blockType: 'listing',
    label: 'Listing',
    regions: ['content'],
    variants: ['tiles', 'cards', 'carousel', 'compact', 'grid'],
  },
  { blockType: 'card', label: 'Karta', regions: ['content'] },
  { blockType: 'contentCalendar', label: 'Kalendarz treści', regions: ['content'] },
  { blockType: 'mediaGallery', label: 'Galeria', regions: ['content'] },
  { blockType: 'attachments', label: 'Załączniki', regions: ['content'] },
  { blockType: 'columnLayout', label: 'Kolumny', regions: ['content'] },
  { blockType: 'sectionGroup', label: 'Grupa sekcji', regions: ['content'] },
  { blockType: 'tabbedContent', label: 'Zakładki', regions: ['content'] },
]

const itemContentBlock: PageTemplateBlockCapability = {
  blockType: 'currentItemContent',
  label: 'Treści bieżącego elementu',
  regions: ['content'],
}

const eventInformationFields: readonly PageTemplateDynamicField[] = [
  { key: 'eventTime', label: 'Termin', regions: ['informationPanel'] },
  { key: 'eventLocation', label: 'Miejsce', regions: ['informationPanel'] },
  { key: 'eventAudience', label: 'Publiczność', regions: ['informationPanel'] },
  { key: 'eventCapacity', label: 'Liczba miejsc', regions: ['informationPanel'] },
  { key: 'eventActions', label: 'Akcje wydarzenia', regions: ['informationPanel'] },
]

export const pageTemplateRegistry: readonly PageTemplateDefinition[] = [
  {
    allowedBlocks: standardContentBlocks,
    currentItemLabel: null,
    dynamicFields: [],
    heroImageRule: 'configurable',
    id: 'blog-index',
    label: 'Blog',
    regions: pageTemplateRegions,
    requiresCurrentItemContent: false,
    route: '/blog',
    routeKind: 'collectionIndex',
  },
  {
    allowedBlocks: standardContentBlocks,
    currentItemLabel: null,
    dynamicFields: [],
    heroImageRule: 'configurable',
    id: 'events-index',
    label: 'Wydarzenia',
    regions: pageTemplateRegions,
    requiresCurrentItemContent: false,
    route: '/events',
    routeKind: 'collectionIndex',
  },
  {
    allowedBlocks: standardContentBlocks,
    currentItemLabel: null,
    dynamicFields: [],
    heroImageRule: 'configurable',
    id: 'members-index',
    label: 'Klubowicze',
    regions: pageTemplateRegions,
    requiresCurrentItemContent: false,
    route: '/members',
    routeKind: 'collectionIndex',
  },
  {
    allowedBlocks: standardContentBlocks,
    currentItemLabel: 'Tag',
    dynamicFields: [
      { key: 'name', label: 'Nazwa', regions: ['hero', 'content'] },
      { key: 'description', label: 'Opis', regions: ['hero', 'content'] },
    ],
    heroImageRule: 'none',
    id: 'tag-detail',
    label: 'Wpisy z tagiem',
    regions: pageTemplateRegions,
    requiresCurrentItemContent: false,
    route: '/tag/[slug]',
    routeKind: 'collectionItem',
  },
  {
    allowedBlocks: standardContentBlocks,
    currentItemLabel: 'Kategoria',
    dynamicFields: [
      { key: 'name', label: 'Nazwa', regions: ['hero', 'content'] },
      { key: 'description', label: 'Opis', regions: ['hero', 'content'] },
      { key: 'hierarchy', label: 'Hierarchia kategorii', regions: ['hero', 'content'] },
    ],
    heroImageRule: 'none',
    id: 'category-detail',
    label: 'Wpisy z kategorii',
    regions: pageTemplateRegions,
    requiresCurrentItemContent: false,
    route: '/category/[slug]',
    routeKind: 'collectionItem',
  },
  {
    allowedBlocks: [
      ...standardContentBlocks,
      itemContentBlock,
      ...eventInformationFields.map<PageTemplateBlockCapability>((field) => ({
        blockType: field.key,
        label: field.label,
        regions: field.regions,
      })),
    ],
    currentItemLabel: 'Wydarzenie',
    dynamicFields: [
      { key: 'eventType', label: 'Typ wydarzenia', regions: ['hero'] },
      { key: 'eventStatus', label: 'Status wydarzenia', regions: ['hero'] },
      { key: 'title', label: 'Tytuł', regions: ['hero'] },
      { key: 'excerpt', label: 'Opis', regions: ['hero', 'content'] },
      { key: 'eventCycle', label: 'Cykl', regions: ['hero', 'content'] },
      { key: 'tags', label: 'Tagi', regions: ['hero', 'content'] },
      ...eventInformationFields,
      { key: 'partners', label: 'Partnerzy', regions: ['content'] },
    ],
    heroImageRule: 'currentItem',
    id: 'event-detail',
    label: 'Szczegóły wydarzenia',
    regions: pageTemplateRegions,
    requiresCurrentItemContent: true,
    route: '/events/[slug]',
    routeKind: 'collectionItem',
  },
  {
    allowedBlocks: [...standardContentBlocks, itemContentBlock],
    currentItemLabel: 'Cykl wydarzeń',
    dynamicFields: [
      { key: 'title', label: 'Tytuł', regions: ['hero'] },
      { key: 'excerpt', label: 'Opis', regions: ['hero', 'content'] },
      { key: 'organizers', label: 'Organizatorzy', regions: ['content'] },
      { key: 'partners', label: 'Partnerzy', regions: ['content'] },
    ],
    heroImageRule: 'currentItem',
    id: 'event-cycle-detail',
    label: 'Szczegóły cyklu wydarzeń',
    regions: pageTemplateRegions,
    requiresCurrentItemContent: true,
    route: '/events/series/[slug]',
    routeKind: 'collectionItem',
  },
  {
    allowedBlocks: [...standardContentBlocks, itemContentBlock],
    currentItemLabel: 'Partner',
    dynamicFields: [
      { key: 'name', label: 'Nazwa', regions: ['hero'] },
      { key: 'excerpt', label: 'Opis', regions: ['hero', 'content'] },
      { key: 'website', label: 'Strona internetowa', regions: ['hero', 'content'] },
    ],
    heroImageRule: 'currentItem',
    id: 'partner-detail',
    label: 'Szczegóły partnera',
    regions: pageTemplateRegions,
    requiresCurrentItemContent: true,
    route: '/partners/[slug]',
    routeKind: 'collectionItem',
  },
  {
    allowedBlocks: [...standardContentBlocks, itemContentBlock],
    currentItemLabel: 'Wizytówka',
    dynamicFields: [
      { key: 'publicName', label: 'Nazwa publiczna', regions: ['hero'] },
      { key: 'clubFunction', label: 'Funkcja w klubie', regions: ['hero', 'content'] },
      { key: 'about', label: 'O mnie', regions: ['content'] },
      { key: 'contactChannels', label: 'Kanały kontaktu', regions: ['content'] },
    ],
    heroImageRule: 'currentItem',
    id: 'member-detail',
    label: 'Profil klubowicza',
    regions: pageTemplateRegions,
    requiresCurrentItemContent: true,
    route: '/members/[slug]',
    routeKind: 'collectionItem',
  },
] as const

export function getPageTemplateDefinition(id: PageTemplateID): PageTemplateDefinition | undefined {
  return pageTemplateRegistry.find((template) => template.id === id)
}
