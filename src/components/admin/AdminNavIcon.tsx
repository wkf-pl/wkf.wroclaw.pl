import { RasterIcon } from '@/components/RasterIcon'
import type { RasterIconName } from '@/modules/icons/icon-registry'

const adminIconNames: Record<string, RasterIconName> = {
  account: 'profile',
  'content-audit-log': 'eye',
  topics: 'category',
  'tag-groups': 'tags',
  documents: 'document',
  'event-cycles': 'calendar',
  'event-types': 'event',
  events: 'event',
  footer: 'footer',
  'homepage-hero': 'title',
  'homepage-sections': 'document',
  'listing-views': 'listing-template',
  locations: 'location',
  media: 'image',
  'member-profiles': 'profile-card',
  navigation: 'header',
  'page-templates': 'template',
  pages: 'document',
  partners: 'partner',
  posts: 'blog-post',
  profile: 'profile-card',
  roles: 'roles',
  'site-settings': 'settings',
  tags: 'tag',
  'user-groups': 'user-group',
  users: 'user',
  'url-aliases': 'alias',
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
