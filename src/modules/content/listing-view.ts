import type { ContentPresentationData } from './content-presentation'
import {
  getDefaultListingDecoration,
  getLegacyListingDecoration,
  parseListingDecoration,
  type ListingDecoration,
  type ListingDecorationOverrides,
} from './listing-decoration'

export const legacyListingViews = ['cards', 'grid', 'tiles', 'compact', 'carousel'] as const
export type LegacyListingView = (typeof legacyListingViews)[number]

export const listingForms = {
  vertical: 'Karta pionowa',
  horizontal: 'Karta pozioma',
  row: 'Wiersz',
  tile: 'Kafelek',
} as const

export const listingInformation = {
  image: 'Obraz',
  kind: 'Typ treści',
  date: 'Data lub termin',
  venue: 'Miejsce wydarzenia',
  cycle: 'Cykl wydarzenia',
  excerpt: 'Opis',
  taxonomy: 'Tematy i tagi',
  context: 'Pozostałe',
  interests: 'Zainteresowania',
  calendar: 'Dodaj do kalendarza',
} as const

export const listingComponentOptions = {
  kind: { none: 'Brak', label: 'Etykieta', highlighted: 'Etykieta wyróżniona' },
  date: { none: 'Brak', short: 'Krótka', full: 'Długa' },
  venue: { none: 'Brak', name: 'Nazwa', full: 'Pełne' },
  actions: { none: 'Brak', icon: 'Ikony', text: 'Tekst', full: 'Pełne' },
} as const

type ListingComponents = {
  [Key in keyof typeof listingComponentOptions]: keyof (typeof listingComponentOptions)[Key]
} & { title: boolean; other: boolean }

export function getListingComponents(view: ListingView): ListingComponents {
  return {
    title: true,
    other: view.information.context || view.information.cycle,
    kind: view.information.kind ? 'label' : 'none',
    date: view.information.date ? view.dateFormat : 'none',
    venue: view.information.venue ? 'name' : 'none',
    actions: view.information.calendar ? 'full' : 'none',
    ...view.components,
  }
}

export type ListingView = {
  layout: 'static' | 'carousel'
  columns: number
  form: keyof typeof listingForms
  decoration?: ListingDecoration
  components?: Partial<ListingComponents>
  dateFormat: 'short' | 'full'
  information: Record<keyof typeof listingInformation, boolean>
}

export type ListingViewOverrides = Partial<Omit<ListingView, 'information' | 'decoration'>> & {
  decoration?: ListingDecorationOverrides
  information?: Partial<ListingView['information']>
}

export type ListingAppearance = {
  preset?: string
  overrides?: ListingViewOverrides
}

const informationKeys = Object.keys(listingInformation) as (keyof typeof listingInformation)[]

function information(...keys: (keyof typeof listingInformation)[]): ListingView['information'] {
  return Object.fromEntries(
    informationKeys.map((key) => [key, keys.includes(key)]),
  ) as ListingView['information']
}

export const listingPresets: Record<string, { label: string; view: ListingView }> = {
  cards: {
    label: 'Karty',
    view: {
      layout: 'static',
      columns: 1,
      form: 'horizontal',
      dateFormat: 'full',
      information: information(
        'image',
        'kind',
        'date',
        'venue',
        'cycle',
        'excerpt',
        'taxonomy',
        'context',
        'interests',
      ),
    },
  },
  grid: {
    label: 'Siatka',
    view: {
      layout: 'static',
      columns: 3,
      form: 'vertical',
      dateFormat: 'short',
      information: information(
        'image',
        'kind',
        'date',
        'venue',
        'excerpt',
        'taxonomy',
        'context',
        'interests',
      ),
    },
  },
  tiles: {
    label: 'Kafelki',
    view: {
      layout: 'static',
      columns: 3,
      form: 'tile',
      dateFormat: 'short',
      information: information('image', 'kind', 'date', 'context'),
    },
  },
  compact: {
    label: 'Lista kompaktowa',
    view: {
      layout: 'static',
      columns: 1,
      form: 'row',
      dateFormat: 'short',
      information: information('kind', 'date', 'context'),
    },
  },
  carousel: {
    label: 'Karuzela',
    view: {
      layout: 'carousel',
      columns: 1,
      form: 'horizontal',
      dateFormat: 'full',
      information: information(
        'image',
        'kind',
        'date',
        'venue',
        'excerpt',
        'taxonomy',
        'context',
        'calendar',
      ),
    },
  },
  upcoming: {
    label: 'Nadchodzące wydarzenia',
    view: {
      layout: 'static',
      columns: 3,
      form: 'vertical',
      dateFormat: 'full',
      information: information('image', 'date', 'venue', 'excerpt'),
    },
  },
  agenda: {
    label: 'Program — zwarta lista',
    view: {
      layout: 'static',
      columns: 1,
      form: 'row',
      dateFormat: 'short',
      information: information('date', 'venue'),
    },
  },
  featured: {
    label: 'Polecane wydarzenia — karuzela',
    view: {
      layout: 'carousel',
      columns: 2,
      form: 'vertical',
      dateFormat: 'full',
      information: information('image', 'date', 'excerpt'),
    },
  },
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

export function parseListingOverrides(value: unknown): ListingViewOverrides {
  const input = record(value)
  const overrides: ListingViewOverrides = {}
  if (input.layout === 'static' || input.layout === 'carousel') overrides.layout = input.layout
  if (
    typeof input.columns === 'number' &&
    Number.isInteger(input.columns) &&
    input.columns >= 1 &&
    input.columns <= 4
  )
    overrides.columns = input.columns
  if (typeof input.form === 'string' && Object.hasOwn(listingForms, input.form))
    overrides.form = input.form as ListingView['form']
  if (input.dateFormat === 'short' || input.dateFormat === 'full')
    overrides.dateFormat = input.dateFormat
  const decoration = parseListingDecoration(input.decoration)
  if (decoration) overrides.decoration = decoration
  const components = record(input.components)
  const parsedComponents: Partial<ListingComponents> = {}
  for (const [key, options] of Object.entries(listingComponentOptions)) {
    const choice = components[key]
    if (typeof choice === 'string' && Object.hasOwn(options, choice))
      Object.assign(parsedComponents, { [key]: choice })
  }
  for (const key of ['title', 'other'] as const) {
    if (typeof components[key] === 'boolean') parsedComponents[key] = components[key]
  }
  if (Object.keys(parsedComponents).length) overrides.components = parsedComponents

  const fields = record(input.information)
  for (const key of informationKeys) {
    const enabled = fields[key]
    if (typeof enabled === 'boolean') (overrides.information ??= {})[key] = enabled
  }
  return overrides
}

export function parseListingAppearance(value: unknown): ListingAppearance {
  const input = record(value)
  const preset =
    typeof input.preset === 'string' &&
    (Object.hasOwn(listingPresets, input.preset) ||
      /^shared:[1-9][0-9]*$/.test(input.preset) ||
      input.preset === 'custom')
      ? input.preset
      : undefined
  return { preset, overrides: parseListingOverrides(input.overrides) }
}

export function resolveListingView(
  appearance: unknown,
  fallback: unknown = 'cards',
  shared?: unknown,
  legacyPresentation?: ContentPresentationData,
) {
  const { preset, overrides = {} } = parseListingAppearance(appearance)
  const fallbackKey =
    typeof fallback === 'string' && Object.hasOwn(listingPresets, fallback) ? fallback : 'cards'
  const key = preset && Object.hasOwn(listingPresets, preset) ? preset : fallbackKey
  const base = listingPresets[key].view
  const sharedSettings = parseListingOverrides(shared)
  const { decoration: sharedDecoration, ...sharedView } = sharedSettings
  const { decoration: localDecoration, ...localView } = overrides
  const view: ListingView = {
    ...base,
    ...sharedView,
    ...localView,
    information: { ...base.information, ...sharedSettings.information, ...overrides.information },
  }
  if (sharedView.components || localView.components) {
    view.components = { ...sharedView.components, ...localView.components }
  }
  if (view.form === 'row') view.information.image = false
  if (sharedDecoration || localDecoration) {
    view.decoration = {
      ...getDefaultListingDecoration(view),
      ...sharedDecoration,
      ...(localDecoration === undefined && legacyPresentation
        ? getLegacyListingDecoration(view, legacyPresentation)
        : localDecoration),
    }
  }
  const localKeys = Object.keys(overrides)
  const legacy = legacyListingViews.find((candidate) => candidate === key)
  return {
    view,
    legacy:
      !Object.keys(sharedSettings).length &&
      (!localKeys.length ||
        (legacy !== 'carousel' && localKeys.length === 1 && localKeys[0] === 'columns')) &&
      preset !== 'custom'
        ? legacy
        : undefined,
  }
}

export function getSharedListingViewId(appearance: unknown): number | undefined {
  const preset = parseListingAppearance(appearance).preset
  if (!preset?.startsWith('shared:')) return undefined
  const id = Number(preset.slice(7))
  return Number.isSafeInteger(id) ? id : undefined
}

export function getListingViewReference(
  appearance: unknown,
  fallback: unknown = 'cards',
): { id: number } | { presetKey: string } | undefined {
  const { preset } = parseListingAppearance(appearance)
  const id = getSharedListingViewId(appearance)
  if (id) return { id }
  if (preset === 'custom') return undefined
  const key = preset ?? (typeof fallback === 'string' ? fallback : 'cards')
  return Object.hasOwn(listingPresets, key) ? { presetKey: key } : { presetKey: 'cards' }
}
