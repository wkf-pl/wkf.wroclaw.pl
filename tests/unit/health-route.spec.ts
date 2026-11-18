import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { execute } = vi.hoisted(() => ({ execute: vi.fn() }))

vi.mock('payload', () => ({
  getPayload: async () => ({ db: { drizzle: { execute } } }),
}))
vi.mock('@payload-config', () => ({ default: {} }))

import { GET } from '../../src/app/api/health/route'

describe('application readiness', () => {
  beforeEach(() => {
    execute.mockReset()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('responds 200 after PostgreSQL is readable', async () => {
    execute.mockResolvedValue({ rows: [] })

    const response = await GET()

    expect(execute).toHaveBeenCalledOnce()
    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(await response.json()).toEqual({ status: 'ok' })
  })

  it('responds 503 without disclosing database errors', async () => {
    execute.mockRejectedValue(new Error('connection details'))

    const response = await GET()

    expect(response.status).toBe(503)
    expect(await response.json()).toEqual({ status: 'unavailable' })
  })

  it('bounds the response time and shares an outstanding read', async () => {
    vi.useFakeTimers()
    let finishRead!: () => void
    execute.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finishRead = resolve
        }),
    )

    const first = GET()
    const second = GET()
    await vi.advanceTimersByTimeAsync(2_000)

    expect((await first).status).toBe(503)
    expect((await second).status).toBe(503)
    expect(execute).toHaveBeenCalledOnce()

    finishRead()
    await vi.advanceTimersByTimeAsync(0)
    execute.mockResolvedValue({ rows: [] })
    expect((await GET()).status).toBe(200)
  })
})
