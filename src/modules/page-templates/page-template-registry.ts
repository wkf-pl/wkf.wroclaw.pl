export type PageTemplateRegion = 'content' | 'hero' | 'informationPanel'

export type PageTemplateRouteKind = 'collectionIndex' | 'collectionItem'

export type PageTemplateHeroImageRule = 'configurable' | 'currentItem' | 'none'

export type PageTemplateRenderingMode = 'legacy' | 'template'

export type PageTemplatePreviewCollection =
  'categories' | 'event-cycles' | 'events' | 'member-profiles' | 'partners' | 'tags'

export type PageTemplateFieldVariant = {
  label: string
  value: string
}

export type PageTemplateDynamicField = {
  defaultVariant: string
  key: string
  label: string
  regions: readonly PageTemplateRegion[]
  variants: readonly PageTemplateFieldVariant[]
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
  previewCollection: PageTemplatePreviewCollection | null
  regions: readonly PageTemplateRegion[]
  rendererAvailable: boolean
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

const headingVariants = [
  { label: 'Nagłówek główny', value: 'primaryHeading' },
  { label: 'Nagłówek sekcji', value: 'sectionHeading' },
  { label: 'Nadtytuł', value: 'eyebrow' },
] as const

const textVariants = [
  { label: 'Tekst wprowadzający', value: 'lead' },
  { label: 'Tekst podstawowy', value: 'body' },
  { label: 'Tekst kompaktowy', value: 'compact' },
] as const

const badgeVariants = [
  { label: 'Etykieta', value: 'badge' },
  { label: 'Etykieta wyróżniona', value: 'emphasizedBadge' },
] as const

const listVariants = [
  { label: 'W jednym wierszu', value: 'inline' },
  { label: 'Lista', value: 'list' },
  { label: 'Pastylki', value: 'pills' },
] as const

const informationVariants = [
  { label: 'Z ikoną', value: 'icon' },
  { label: 'Bez ikony', value: 'plain' },
  { label: 'Kompaktowo', value: 'compact' },
] as const

const standardContentBlocks: readonly PageTemplateBlockCapability[] = [
  { blockType: 'heading', label: 'Nagłówek', regions: ['hero', 'informationPanel', 'content'] },
  { blockType: 'richText', label: 'Tekst', regions: ['hero', 'informationPanel', 'content'] },
  {
    blockType: 'actionLinks',
    label: 'Odnośniki akcji',
    regions: ['hero', 'informationPanel', 'content'],
  },
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
  {
    blockType: 'columnLayout',
    label: 'Kolumny',
    regions: ['informationPanel', 'content'],
  },
  {
    blockType: 'sectionGroup',
    label: 'Grupa sekcji',
    regions: ['informationPanel', 'content'],
  },
  { blockType: 'tabs', label: 'Zakładki', regions: ['content'] },
]

const itemContentBlock: PageTemplateBlockCapability = {
  blockType: 'currentItemContent',
  label: 'Treści bieżącego elementu',
  regions: ['content'],
}

const eventInformationFields: readonly PageTemplateDynamicField[] = [
  createDynamicField('eventTime', 'Termin', ['informationPanel'], informationVariants),
  createDynamicField('eventLocation', 'Miejsce', ['informationPanel'], informationVariants),
  createDynamicField('eventAudience', 'Publiczność', ['informationPanel'], informationVariants),
  createDynamicField('eventCapacity', 'Liczba miejsc', ['informationPanel'], informationVariants),
  createDynamicField('eventActions', 'Akcje wydarzenia', ['informationPanel'], listVariants),
]

export const pageTemplateRegistry: readonly PageTemplateDefinition[] = [
  createIndexTemplate('blog-index', 'Blog', '/blog'),
  createIndexTemplate('events-index', 'Wydarzenia', '/events'),
  createIndexTemplate('members-index', 'Klubowicze', '/members'),
  {
    allowedBlocks: standardContentBlocks,
    currentItemLabel: 'Tag',
    dynamicFields: [
      createDynamicField('name', 'Nazwa', ['hero', 'content'], headingVariants),
      createDynamicField('description', 'Opis', ['hero', 'content'], textVariants),
    ],
    heroImageRule: 'none',
    id: 'tag-detail',
    label: 'Wpisy z tagiem',
    previewCollection: 'tags',
    regions: pageTemplateRegions,
    rendererAvailable: false,
    requiresCurrentItemContent: false,
    route: '/tag/[slug]',
    routeKind: 'collectionItem',
  },
  {
    allowedBlocks: standardContentBlocks,
    currentItemLabel: 'Kategoria',
    dynamicFields: [
      createDynamicField('name', 'Nazwa', ['hero', 'content'], headingVariants),
      createDynamicField('description', 'Opis', ['hero', 'content'], textVariants),
      createDynamicField('hierarchy', 'Hierarchia kategorii', ['hero', 'content'], listVariants),
    ],
    heroImageRule: 'none',
    id: 'category-detail',
    label: 'Wpisy z kategorii',
    previewCollection: 'categories',
    regions: pageTemplateRegions,
    rendererAvailable: false,
    requiresCurrentItemContent: false,
    route: '/category/[slug]',
    routeKind: 'collectionItem',
  },
  {
    allowedBlocks: [...standardContentBlocks, itemContentBlock],
    currentItemLabel: 'Wydarzenie',
    dynamicFields: [
      createDynamicField('eventType', 'Typ wydarzenia', ['hero'], badgeVariants),
      createDynamicField('eventStatus', 'Status wydarzenia', ['hero'], badgeVariants),
      createDynamicField('title', 'Tytuł', ['hero'], headingVariants),
      createDynamicField('excerpt', 'Opis', ['hero', 'content'], textVariants),
      createDynamicField('eventCycle', 'Cykl', ['hero', 'content'], listVariants),
      createDynamicField('tags', 'Tagi', ['hero', 'content'], listVariants),
      ...eventInformationFields,
      createDynamicField('partners', 'Partnerzy', ['content'], listVariants),
    ],
    heroImageRule: 'currentItem',
    id: 'event-detail',
    label: 'Szczegóły wydarzenia',
    previewCollection: 'events',
    regions: pageTemplateRegions,
    rendererAvailable: true,
    requiresCurrentItemContent: true,
    route: '/events/[slug]',
    routeKind: 'collectionItem',
  },
  {
    allowedBlocks: [...standardContentBlocks, itemContentBlock],
    currentItemLabel: 'Cykl wydarzeń',
    dynamicFields: [
      createDynamicField('title', 'Tytuł', ['hero'], headingVariants),
      createDynamicField('excerpt', 'Opis', ['hero', 'content'], textVariants),
      createDynamicField('organizers', 'Organizatorzy', ['content'], listVariants),
      createDynamicField('partners', 'Partnerzy', ['content'], listVariants),
    ],
    heroImageRule: 'currentItem',
    id: 'event-cycle-detail',
    label: 'Szczegóły cyklu wydarzeń',
    previewCollection: 'event-cycles',
    regions: pageTemplateRegions,
    rendererAvailable: false,
    requiresCurrentItemContent: true,
    route: '/events/series/[slug]',
    routeKind: 'collectionItem',
  },
  {
    allowedBlocks: [...standardContentBlocks, itemContentBlock],
    currentItemLabel: 'Partner',
    dynamicFields: [
      createDynamicField('name', 'Nazwa', ['hero'], headingVariants),
      createDynamicField('excerpt', 'Opis', ['hero', 'content'], textVariants),
      createDynamicField('website', 'Strona internetowa', ['hero', 'content'], listVariants),
    ],
    heroImageRule: 'currentItem',
    id: 'partner-detail',
    label: 'Szczegóły partnera',
    previewCollection: 'partners',
    regions: pageTemplateRegions,
    rendererAvailable: false,
    requiresCurrentItemContent: true,
    route: '/partners/[slug]',
    routeKind: 'collectionItem',
  },
  {
    allowedBlocks: [...standardContentBlocks, itemContentBlock],
    currentItemLabel: 'Wizytówka',
    dynamicFields: [
      createDynamicField('publicName', 'Nazwa publiczna', ['hero'], headingVariants),
      createDynamicField('clubFunction', 'Funkcja w klubie', ['hero', 'content'], textVariants),
      createDynamicField('about', 'O mnie', ['content'], textVariants),
      createDynamicField('contactChannels', 'Kanały kontaktu', ['content'], listVariants),
    ],
    heroImageRule: 'currentItem',
    id: 'member-detail',
    label: 'Profil klubowicza',
    previewCollection: 'member-profiles',
    regions: pageTemplateRegions,
    rendererAvailable: false,
    requiresCurrentItemContent: true,
    route: '/members/[slug]',
    routeKind: 'collectionItem',
  },
] as const

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
): PageTemplateDynamicField {
  const defaultVariant = variants[0]?.value
  if (!defaultVariant) throw new Error(`Page template field ${key} requires at least one variant.`)
  return { defaultVariant, key, label, regions, variants }
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
    rendererAvailable: false,
    requiresCurrentItemContent: false,
    route,
    routeKind: 'collectionIndex',
  }
}
