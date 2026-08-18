import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { pl } from '@payloadcms/translations/languages/pl'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { migrations } from '../migrations'

import {
  Categories,
  ClubSections,
  DocumentFiles,
  Documents,
  EventCycles,
  Events,
  Media,
  MemberProfileImages,
  MemberProfiles,
  Pages,
  Partners,
  Posts,
  Roles,
  Tags,
  Users,
} from './collections'
import { createEmailAdapter } from './email/create-email-adapter'
import { Navigation, SiteSettings, WebsitePermissions } from './globals'
import { getOptionalEnvironmentVariable, getRequiredEnvironmentVariable } from './lib/env'
import { createStoragePlugins } from './storage/create-storage-plugins'

const fileName = fileURLToPath(import.meta.url)
const directoryName = path.dirname(fileName)
const serverURL = getOptionalEnvironmentVariable('SERVER_URL')
const trustedOrigins = getTrustedOrigins(serverURL)
const adminDescription = 'Panel administracyjny Wrocławskiego Klubu Fantastyki'
const polishAdminLanguage = {
  ...pl,
  translations: {
    ...pl.translations,
    general: {
      ...pl.translations.general,
      createNew: 'Dodaj',
      createNewLabel: 'Dodaj {{label}}',
      email: 'Adres e-mail',
      emailAddress: 'Adres e-mail',
      payloadSettings: 'Ustawienia panelu',
    },
    fields: {
      ...pl.translations.fields,
      addNew: 'Dodaj',
    },
  },
}

export default buildConfig({
  admin: {
    components: {
      actions: ['/components/admin/UserMenu#UserMenu'],
      Nav: '/components/admin/AdminNav#AdminNav',
      graphics: {
        Logo: '/components/admin/AdminLogo#AdminLogo',
      },
      views: {
        account: {
          Component: '/components/admin/AccountView#AccountView',
        },
        profile: {
          Component: '/components/admin/MemberProfileView#MemberProfileView',
          exact: true,
          path: '/profile',
        },
      },
    },
    dateFormat: 'd MMMM yyyy, HH:mm',
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(directoryName),
    },
    meta: {
      defaultOGImageType: 'off',
      description: adminDescription,
      icons: {
        apple: '/assets/apple-touch-icon.png',
        icon: '/assets/favicon-32.png',
      },
      openGraph: {
        description: adminDescription,
        siteName: 'Wrocławski Klub Fantastyki',
      },
      titleSuffix: '– Wrocławski Klub Fantastyki',
      twitter: {
        card: 'summary',
        description: adminDescription,
      },
    },
  },
  collections: [
    Pages,
    Posts,
    Events,
    EventCycles,
    Categories,
    Tags,
    Media,
    MemberProfileImages,
    MemberProfiles,
    DocumentFiles,
    Documents,
    Partners,
    ClubSections,
    Users,
    Roles,
  ],
  globals: [SiteSettings, Navigation, WebsitePermissions],
  cors: [...trustedOrigins],
  csrf: [...trustedOrigins],
  editor: lexicalEditor(),
  email: createEmailAdapter(),
  i18n: {
    fallbackLanguage: 'pl',
    supportedLanguages: { pl: polishAdminLanguage },
  },
  secret: getRequiredEnvironmentVariable('PAYLOAD_SECRET'),
  serverURL,
  typescript: {
    outputFile: path.resolve(directoryName, 'payload-types.ts'),
  },
  db: postgresAdapter({
    migrationDir: path.resolve(directoryName, '../migrations'),
    pool: {
      connectionString: getRequiredEnvironmentVariable('DATABASE_URL'),
    },
    prodMigrations: migrations,
  }),
  sharp,
  plugins: createStoragePlugins(),
})

function getTrustedOrigins(configuredServerURL: string | undefined): string[] {
  if (!configuredServerURL) {
    return []
  }

  const configuredURL = new URL(configuredServerURL)
  const origins = new Set([configuredURL.origin])
  const localHostnames = ['localhost', '127.0.0.1', '[::1]']

  if (localHostnames.includes(configuredURL.hostname)) {
    for (const hostname of localHostnames) {
      const localURL = new URL(configuredURL)
      localURL.hostname = hostname
      origins.add(localURL.origin)
    }
  }

  return [...origins]
}
