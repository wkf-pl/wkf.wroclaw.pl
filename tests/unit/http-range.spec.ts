import { describe, expect, it } from 'vitest'

import { parseHTTPRange } from '@/storage/parse-http-range'

describe('HTTP byte ranges', () => {
  it.each([
    ['bytes=0-99', 1000, { end: 99, start: 0 }],
    ['bytes=100-', 1000, { end: 999, start: 100 }],
    ['bytes=-100', 1000, { end: 999, start: 900 }],
    ['bytes=-2000', 1000, { end: 999, start: 0 }],
    ['bytes=900-1200', 1000, { end: 999, start: 900 }],
    [null, 1000, null],
  ] as const)('parses a satisfiable range %s', (value, fileSize, expected) => {
    expect(parseHTTPRange(value, fileSize)).toEqual(expected)
  })

  it.each(['bytes=-0', 'bytes=-', 'bytes=100-99', 'items=0-10', 'bytes=1000-', 'bytes=0-1,4-5'])(
    'rejects an invalid or unsatisfiable range %s',
    (value) => {
      expect(parseHTTPRange(value, 1000)).toBe(false)
    },
  )
})
