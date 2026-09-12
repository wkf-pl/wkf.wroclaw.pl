export const rasterIconSizes = ['small', 'medium'] as const

export type RasterIconSize = (typeof rasterIconSizes)[number]

export type RasterIconCategory =
  | 'action'
  | 'community'
  | 'contact'
  | 'content'
  | 'fantasy'
  | 'games'
  | 'internal'
  | 'worlds'

type RasterIconDefinition = {
  category: RasterIconCategory
  keywords: readonly string[]
  label: string
  name: string
  selectable: boolean
}

type SelectableRasterIconDefinition = Omit<RasterIconDefinition, 'selectable'>

const selectableRasterIconDefinitions = [
  {
    category: 'action',
    keywords: ['komunikat', 'megafon'],
    label: 'Ogłoszenie',
    name: 'announcement',
  },
  {
    category: 'action',
    keywords: ['dalej', 'przejdź'],
    label: 'Strzałka w prawo',
    name: 'arrow-right',
  },
  {
    category: 'action',
    keywords: ['pocisk', 'kierunek', 'łucznictwo'],
    label: 'Strzała',
    name: 'arrow',
  },
  {
    category: 'action',
    keywords: ['wstecz', 'wróć', 'poprzedni'],
    label: 'Strzałka w lewo',
    name: 'arrow-left',
  },
  {
    category: 'action',
    keywords: ['pociski', 'kierunek', 'łucznictwo'],
    label: 'Skrzyżowane strzały',
    name: 'arrows',
  },
  { category: 'action', keywords: ['data', 'termin'], label: 'Kalendarz', name: 'calendar' },
  { category: 'action', keywords: ['plik', 'zapisz'], label: 'Pobieranie', name: 'download' },
  { category: 'action', keywords: ['spotkanie', 'bilet'], label: 'Wydarzenie', name: 'event' },
  {
    category: 'action',
    keywords: ['nowa karta', 'odnośnik'],
    label: 'Link zewnętrzny',
    name: 'external-link',
  },
  { category: 'action', keywords: ['www', 'świat'], label: 'Globus', name: 'globe' },
  { category: 'action', keywords: ['start', 'początek'], label: 'Strona główna', name: 'home' },
  { category: 'action', keywords: ['adres', 'miejsce'], label: 'Lokalizacja', name: 'location' },
  {
    category: 'action',
    keywords: ['kierunek', 'nawigacja', 'mapa'],
    label: 'Kompas',
    name: 'compass',
  },
  {
    category: 'action',
    keywords: ['świętowanie', 'uroczystość', 'sukces'],
    label: 'Konfetti',
    name: 'confetti',
  },
  { category: 'action', keywords: ['wyróżnione', 'ulubione'], label: 'Gwiazda', name: 'star' },
  { category: 'action', keywords: ['godzina', 'zegar'], label: 'Czas', name: 'time' },
  { category: 'content', keywords: ['czytanie', 'literatura'], label: 'Książka', name: 'book' },
  { category: 'content', keywords: ['biblioteka', 'zbiór'], label: 'Kolekcja', name: 'collection' },
  { category: 'content', keywords: ['plik', 'strona'], label: 'Dokument', name: 'document' },
  { category: 'content', keywords: ['zdjęcie', 'media'], label: 'Obraz', name: 'image' },
  { category: 'content', keywords: ['dokument', 'plik'], label: 'PDF', name: 'pdf' },
  { category: 'content', keywords: ['opinia', 'tekst'], label: 'Recenzja', name: 'review' },
  { category: 'content', keywords: ['etykieta', 'temat'], label: 'Tag', name: 'tag' },
  { category: 'games', keywords: ['gra', 'talia'], label: 'Karty', name: 'cards' },
  { category: 'games', keywords: ['rpg', 'k6'], label: 'Kość', name: 'dice' },
  { category: 'games', keywords: ['rpg', 'kość'], label: 'Kość k4', name: 'd4' },
  { category: 'games', keywords: ['rpg', 'kość'], label: 'Kość k6', name: 'd6' },
  { category: 'games', keywords: ['rpg', 'kość'], label: 'Kość k8', name: 'd8' },
  { category: 'games', keywords: ['rpg', 'kość'], label: 'Kość k10', name: 'd10' },
  { category: 'games', keywords: ['rpg', 'kość'], label: 'Kość k12', name: 'd12' },
  { category: 'games', keywords: ['rpg', 'kość'], label: 'Kość k20', name: 'd20' },
  {
    category: 'games',
    keywords: ['dungeons and dragons', 'rpg', 'smok'],
    label: 'D&D 5e',
    name: 'dnd5',
  },
  { category: 'games', keywords: ['planszówka', 'szachy'], label: 'Pionek', name: 'pawn' },
  { category: 'fantasy', keywords: ['larp', 'kostium'], label: 'Maska LARP', name: 'larp-mask' },
  { category: 'fantasy', keywords: ['fantasy', 'broń'], label: 'Miecz', name: 'sword' },
  { category: 'fantasy', keywords: ['broń', 'topór'], label: 'Topór', name: 'axe' },
  { category: 'fantasy', keywords: ['broń', 'łucznictwo'], label: 'Łuk', name: 'bow' },
  { category: 'fantasy', keywords: ['wojownik', 'postać', 'rpg'], label: 'Wojownik', name: 'fighter' },
  {
    category: 'fantasy',
    keywords: ['czar', 'magia', 'pocisk'],
    label: 'Kula ognia',
    name: 'fireball',
  },
  { category: 'fantasy', keywords: ['broń', 'obuch'], label: 'Buława', name: 'mace' },
  { category: 'fantasy', keywords: ['czarodziej', 'magia', 'postać'], label: 'Mag', name: 'mage' },
  { category: 'fantasy', keywords: ['obrona', 'pancerz'], label: 'Tarcza', name: 'shield' },
  { category: 'fantasy', keywords: ['czar', 'magia'], label: 'Różdżka', name: 'wand' },
  {
    category: 'worlds',
    keywords: ['kosmos', 'science fiction', 'postać'],
    label: 'Astronauta',
    name: 'astronaut',
  },
  { category: 'worlds', keywords: ['broń', 'science fiction'], label: 'Karabin', name: 'gun' },
  { category: 'worlds', keywords: ['science fiction', 'kosmos'], label: 'Science fiction', name: 'sf' },
  { category: 'worlds', keywords: ['federacja', 'kosmos'], label: 'Star Trek', name: 'star-trek' },
  {
    category: 'worlds',
    keywords: ['gwiezdne wojny', 'imperium', 'kosmos'],
    label: 'Star Wars: Imperium',
    name: 'star-wars-empire',
  },
  {
    category: 'worlds',
    keywords: ['gwiezdne wojny', 'rebelia', 'kosmos'],
    label: 'Star Wars: Rebelia',
    name: 'star-wars-rebel-alliance',
  },
  {
    category: 'worlds',
    keywords: ['retro', 'technologia', 'fantastyka'],
    label: 'Steampunk',
    name: 'steampunk',
  },
  {
    category: 'worlds',
    keywords: ['gwiezdne wojny', 'imperium', 'postać'],
    label: 'Szturmowiec',
    name: 'stormtrooper',
  },
  {
    category: 'community',
    keywords: ['współpraca', 'uścisk'],
    label: 'Partnerstwo',
    name: 'partner',
  },
  { category: 'community', keywords: ['ludzie', 'grupa'], label: 'Społeczność', name: 'users' },
  { category: 'contact', keywords: ['social', 'sieć'], label: 'Bluesky', name: 'bluesky' },
  { category: 'contact', keywords: ['czat', 'społeczność'], label: 'Discord', name: 'discord' },
  { category: 'contact', keywords: ['social', 'sieć'], label: 'Facebook', name: 'facebook' },
  { category: 'contact', keywords: ['zdjęcia', 'social'], label: 'Instagram', name: 'instagram' },
  { category: 'contact', keywords: ['praca', 'social'], label: 'LinkedIn', name: 'linkedin' },
  { category: 'contact', keywords: ['email', 'kontakt'], label: 'E-mail', name: 'mail' },
  { category: 'contact', keywords: ['wiadomość', 'czat'], label: 'Messenger', name: 'messenger' },
  { category: 'contact', keywords: ['czat', 'zespół'], label: 'Slack', name: 'slack' },
  { category: 'contact', keywords: ['stream', 'wideo'], label: 'Twitch', name: 'twitch' },
  { category: 'contact', keywords: ['film', 'wideo'], label: 'YouTube', name: 'youtube' },
] as const satisfies readonly SelectableRasterIconDefinition[]

const internalRasterIconDefinitions = [
  { category: 'internal', keywords: [], label: 'Kategoria', name: 'category', selectable: false },
  { category: 'internal', keywords: [], label: 'Stopka', name: 'footer', selectable: false },
  { category: 'internal', keywords: [], label: 'Profil', name: 'profile', selectable: false },
  { category: 'internal', keywords: [], label: 'Uprawnienia', name: 'roles', selectable: false },
  { category: 'internal', keywords: [], label: 'Ustawienia', name: 'settings', selectable: false },
] as const satisfies readonly RasterIconDefinition[]

export const rasterIconDefinitions = [
  ...selectableRasterIconDefinitions.map((definition) => ({
    ...definition,
    selectable: true as const,
  })),
  ...internalRasterIconDefinitions,
] as const

export type RasterIconName = (typeof rasterIconDefinitions)[number]['name']
export type SelectableRasterIconName = (typeof selectableRasterIconDefinitions)[number]['name']

export const selectableRasterIconNames = selectableRasterIconDefinitions.map(
  ({ name }) => name,
) as SelectableRasterIconName[]

export function isRasterIconName(value: unknown): value is RasterIconName {
  return (
    typeof value === 'string' &&
    rasterIconDefinitions.some((definition) => definition.name === value)
  )
}

export function isSelectableRasterIconName(value: unknown): value is SelectableRasterIconName {
  return (
    typeof value === 'string' &&
    selectableRasterIconDefinitions.some((definition) => definition.name === value)
  )
}

export function getRasterIconURL(name: RasterIconName, size: RasterIconSize): string {
  return `/assets/icons/${name}/${size}.png`
}

export const rasterIconCategoryLabels: Record<Exclude<RasterIconCategory, 'internal'>, string> = {
  action: 'Akcje i informacje',
  content: 'Treści',
  games: 'Gry i kości',
  fantasy: 'Fantasy i przygoda',
  worlds: 'Światy i konwencje',
  community: 'Społeczność',
  contact: 'Kontakt',
}
