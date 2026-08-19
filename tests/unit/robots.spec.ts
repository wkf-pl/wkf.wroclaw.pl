import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { createRobotsMetadata, dynamic } from '@/app/robots'

describe('robots metadata', () => {
  it('uses the runtime server URL without a static public file overriding the route', () => {
    expect(dynamic).toBe('force-dynamic')
    expect(existsSync(resolve(process.cwd(), 'public/robots.txt'))).toBe(false)
  })

  it('allows indexing on the production website', () => {
    expect(createRobotsMetadata('https://wkf.wroclaw.pl')).toEqual({
      rules: {
        allow: '/',
        userAgent: '*',
      },
    })
  })

  it.each([undefined, 'https://wkf-staging.example.com'])(
    'blocks indexing outside production for %s',
    (serverUrl) => {
      expect(createRobotsMetadata(serverUrl)).toEqual({
        rules: {
          disallow: '/',
          userAgent: '*',
        },
      })
    },
  )
})
