export const auditedCollections = {
  pages: { label: 'Strona', titleFields: ['title'] },
  posts: { label: 'Wpis', titleFields: ['title'] },
  events: { label: 'Wydarzenie', titleFields: ['title'] },
  'event-cycles': { label: 'Cykl wydarzeń', titleFields: ['title'] },
  'event-types': { label: 'Rodzaj wydarzenia', titleFields: ['name'] },
  categories: { label: 'Kategoria', titleFields: ['name'] },
  tags: { label: 'Tag', titleFields: ['name'] },
  media: { label: 'Media', titleFields: ['filename', 'alt'] },
  partners: { label: 'Partner', titleFields: ['name'] },
  'member-profiles': { label: 'Wizytówka', titleFields: ['publicName'] },
} as const

export const auditedGlobals = {
  'site-settings': { label: 'Ustawienia strony głównej', title: 'Podstawowe' },
  navigation: { label: 'Nagłówek', title: 'Nagłówek' },
  'homepage-hero': { label: 'Hero strony głównej', title: 'Hero' },
  'homepage-sections': { label: 'Treści strony głównej', title: 'Treści' },
  footer: { label: 'Stopka', title: 'Stopka' },
} as const

export const auditActions = {
  create: 'Dodanie',
  update: 'Edycja',
  trash: 'Przeniesienie do kosza',
  restore: 'Przywrócenie z kosza',
  'restore-version': 'Przywrócenie wersji',
  delete: 'Usunięcie',
} as const

export type AuditTarget = keyof typeof auditedCollections | keyof typeof auditedGlobals
export type AuditAction = keyof typeof auditActions

export function isAuditedCollection(slug: string): slug is keyof typeof auditedCollections {
  return Object.hasOwn(auditedCollections, slug)
}

export function isAuditedGlobal(slug: string): slug is keyof typeof auditedGlobals {
  return Object.hasOwn(auditedGlobals, slug)
}
