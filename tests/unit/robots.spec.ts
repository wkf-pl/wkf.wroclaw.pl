import { describe, expect, it } from 'vitest'

import { createRobotsMetadata } from '@/app/robots'

describe('robots metadata', () => {
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
