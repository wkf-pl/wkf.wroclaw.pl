import type { MetadataRoute } from 'next'

import { getEnvironmentBoolean, getOptionalEnvironmentVariable } from '@/lib/env'

const productionServerUrl = 'https://wkf.wroclaw.pl'

export const dynamic = 'force-dynamic'

export function createRobotsMetadata(
  serverUrl: string | undefined,
  publicLaunchEnabled = false,
): MetadataRoute.Robots {
  if (!publicLaunchEnabled || serverUrl !== productionServerUrl) {
    return {
      rules: {
        disallow: '/',
        userAgent: '*',
      },
    }
  }

  return {
    rules: {
      allow: '/',
      userAgent: '*',
    },
  }
}

export default function robots(): MetadataRoute.Robots {
  return createRobotsMetadata(
    getOptionalEnvironmentVariable('SERVER_URL'),
    getEnvironmentBoolean('PUBLIC_LAUNCH_ENABLED'),
  )
}
