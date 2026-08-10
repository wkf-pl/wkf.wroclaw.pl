import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Media, Users } from './collections'
import { createEmailAdapter } from './email/create-email-adapter'
import { Footer, Navigation, SiteSettings } from './globals'
import { getOptionalEnvironmentVariable, getRequiredEnvironmentVariable } from './lib/env'
import { createStoragePlugins } from './storage/create-storage-plugins'

const fileName = fileURLToPath(import.meta.url)
const directoryName = path.dirname(fileName)
const serverURL = getOptionalEnvironmentVariable('NEXT_PUBLIC_SERVER_URL')

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(directoryName),
    },
  },
  collections: [Users, Media],
  globals: [SiteSettings, Navigation, Footer],
  cors: serverURL ? [serverURL] : [],
  csrf: serverURL ? [serverURL] : [],
  editor: lexicalEditor(),
  email: createEmailAdapter(),
  secret: getRequiredEnvironmentVariable('PAYLOAD_SECRET'),
  serverURL,
  typescript: {
    outputFile: path.resolve(directoryName, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: getRequiredEnvironmentVariable('DATABASE_URL'),
    },
  }),
  sharp,
  plugins: createStoragePlugins(),
})
