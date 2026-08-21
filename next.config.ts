import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const fileName = fileURLToPath(import.meta.url)
const directoryName = path.dirname(fileName)

const nextConfig: NextConfig = {
  allowedDevOrigins: ['localhost', '127.0.0.1', '[::1]'],
  distDir: process.env.NEXT_DIST_DIR || '.next',
  poweredByHeader: false,
  output: 'standalone',
  headers: () => [
    {
      headers: [
        {
          key: 'Access-Control-Allow-Headers',
          value:
            'Origin, X-Requested-With, Content-Type, Accept, Authorization, Content-Encoding, x-apollo-tracing, X-HTTP-Method-Override',
        },
      ],
      source: '/api/:path*',
    },
  ],
  images: {
    localPatterns: [
      {
        pathname: '/assets/**',
      },
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(directoryName),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
