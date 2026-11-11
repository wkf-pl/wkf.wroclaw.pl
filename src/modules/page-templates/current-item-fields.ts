import type { ContentListingSource } from '@/modules/content/content-listing'
import {
  capacityModeOptions,
  participationOptions,
  timeModeOptions,
} from '@/modules/events/constants'
import {
  recurrenceTypeOptions,
  recurrenceWeekdayOptions,
} from '@/modules/events/event-cycle-schedule'
import type { PageTemplatePreviewCollection } from './page-template-registry'

type FieldOption = { label: string; value: string }

export type CurrentItemValueKind =
  | 'text'
  | 'date'
  | 'image'
  | 'photo'
  | 'layout'
  | 'richText'
  | 'name'
  | 'author'
  | 'category'
  | 'tags'
  | 'cycle'
  | 'breadcrumbs'
  | 'games'
  | 'organizers'
  | 'links'

export type CurrentItemFieldSource =
  | { kind: CurrentItemValueKind; options?: readonly FieldOption[] }
  | { kind: 'join'; collection: ContentListingSource }

type CurrentItemFieldEntry = {
  key: string
  label: string
  source: CurrentItemFieldSource
}

function field(
  key: string,
  label: string,
  kind: CurrentItemValueKind = 'text',
  options?: readonly FieldOption[],
): CurrentItemFieldEntry {
  return { key, label, source: { kind, options } }
}

const modified = field('updatedAt', 'Data modyfikacji', 'date')
const editorial = [
  field('heroImage', 'Obraz główny', 'image'),
  field('layout', 'Treść', 'layout'),
  field('author', 'Autor', 'author'),
  field('publishedAt', 'Data publikacji', 'date'),
  modified,
]
const taxonomy = [field('category', 'Kategoria', 'category'), field('tags', 'Tagi', 'tags')]
const location = [
  field('location.venueName', 'Nazwa miejsca'),
  field('location.venueWebsite', 'Strona WWW miejsca'),
  field('location.streetAddress', 'Ulica i numer'),
  field('location.postalCode', 'Kod pocztowy'),
  field('location.city', 'Miejscowość'),
  field('location.mapEmbedURL', 'Mapa Google'),
  field('location.country', 'Kraj'),
]
const participation = [
  field('participation', 'Uczestnictwo', 'text', participationOptions),
  field('capacityMode', 'Tryb limitu miejsc', 'text', capacityModeOptions),
  field('capacity', 'Limit miejsc'),
]
const relatedContent = [
  { key: 'relatedPages', label: 'Powiązane strony', source: { kind: 'join', collection: 'pages' } },
  { key: 'relatedPosts', label: 'Powiązane wpisy', source: { kind: 'join', collection: 'posts' } },
  {
    key: 'relatedEvents',
    label: 'Powiązane wydarzenia',
    source: { kind: 'join', collection: 'events' },
  },
  {
    key: 'relatedEventCycles',
    label: 'Powiązane cykle wydarzeń',
    source: { kind: 'join', collection: 'event-cycles' },
  },
  {
    key: 'relatedDocuments',
    label: 'Powiązane dokumenty',
    source: { kind: 'join', collection: 'documents' },
  },
] as const satisfies readonly CurrentItemFieldEntry[]

export const currentItemFieldSources: Record<
  PageTemplatePreviewCollection,
  readonly CurrentItemFieldEntry[]
> = {
  categories: [
    field('parent', 'Kategoria nadrzędna', 'category'),
    field('fullTitle', 'Pełna ścieżka'),
    field('breadcrumbs', 'Ścieżka nawigacji', 'breadcrumbs'),
    ...relatedContent,
    modified,
  ],
  tags: [...relatedContent, modified],
  events: [
    ...editorial,
    taxonomy[0],
    field('timeMode', 'Sposób podania czasu', 'text', timeModeOptions),
    field('startAt', 'Początek', 'date'),
    field('endAt', 'Koniec', 'date'),
    ...location,
    ...participation,
    field('organizers', 'Organizatorzy', 'organizers'),
    field('externalLinks', 'Linki zewnętrzne', 'links'),
    field('defaultsAppliedCycle', 'Cykl użyty do ustawienia danych domyślnych', 'cycle'),
    field('previousStartAt', 'Poprzedni termin rozpoczęcia', 'date'),
    field('publishedStartAt', 'Opublikowany termin rozpoczęcia', 'date'),
    field('calendarUID', 'UID wpisu w kalendarzu'),
    field('calendarRevision', 'Wersja wpisu w kalendarzu'),
    field('calendarFingerprint', 'Sygnatura wpisu w kalendarzu'),
  ],
  'event-cycles': [
    ...editorial,
    ...taxonomy,
    field('calendarFeedKey', 'Klucz subskrypcji kalendarza'),
    ...[
      field('title', 'Tytuł'),
      field('eventType', 'Rodzaj wydarzenia', 'name'),
      editorial[0],
      field('excerpt', 'Streszczenie', 'richText'),
      editorial[1],
      ...taxonomy,
      field('recurrenceType', 'Interwał', 'text', recurrenceTypeOptions),
      field('weekInterval', 'Co ile tygodni'),
      field('monthDay', 'Dzień miesiąca'),
      field('weekOfMonth', 'Tydzień miesiąca'),
      field('recurrenceWeekday', 'Dzień tygodnia', 'text', recurrenceWeekdayOptions),
      field('defaultDayCount', 'Liczba dni'),
      field('defaultStartTime', 'Godzina rozpoczęcia'),
      field('defaultEndTime', 'Godzina zakończenia'),
      ...location,
      ...participation,
      field('externalLinks', 'Linki zewnętrzne', 'links'),
    ].map(({ key, label, source }) => ({
      key: `eventDefaults.${key}`,
      label: `Domyślne dane wydarzenia — ${label}`,
      source,
    })),
  ],
  partners: editorial,
  'member-profiles': [
    field('photo', 'Zdjęcie', 'photo'),
    field('interests', 'Zainteresowania'),
    field('games', 'Gry', 'games'),
    field('contactTopics', 'Tematy kontaktu'),
    modified,
  ],
}
