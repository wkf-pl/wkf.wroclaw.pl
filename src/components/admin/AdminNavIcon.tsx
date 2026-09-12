import { RasterIcon } from '@/components/RasterIcon'
import type { RasterIconName } from '@/modules/icons/icon-registry'

const adminIconNames: Record<string, RasterIconName> = {
  account: 'profile',
  categories: 'category',
  'club-sections': 'collection',
  documents: 'document',
  'event-cycles': 'calendar',
  events: 'event',
  footer: 'footer',
  'homepage-hero': 'image',
  'homepage-sections': 'home',
  media: 'image',
  navigation: 'globe',
  pages: 'document',
  partners: 'partner',
  posts: 'document',
  profile: 'profile',
  roles: 'roles',
  'site-settings': 'settings',
  tags: 'tag',
  users: 'users',
}

export function AdminNavIcon({ name }: { name: string }) {
  return (
    <RasterIcon
      className="nav__link-icon"
      name={adminIconNames[name] ?? 'collection'}
      size="small"
    />
  )
}
