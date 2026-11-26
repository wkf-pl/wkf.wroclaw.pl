import { getPayload, handleEndpoints, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'
import type { AdminNotice, User } from '@/payload-types'

const slug = 'admin-notice'
const settingsPath = '/api/globals/admin-notice'
const message = 'Zaplanowana przerwa serwisowa'
const password = 'admin-notice-integration-test'
const testUsers: User[] = []
let payload: Payload
let administratorToken: string
let userToken: string
let original: AdminNotice

async function createUserToken(roleKey: 'administrator' | 'user'): Promise<string> {
  const { docs } = await payload.find({
    collection: 'roles',
    depth: 0,
    limit: 1,
    where: { key: { equals: roleKey } },
  })
  const role = docs[0]
  if (!role) throw new Error(`Missing migrated role: ${roleKey}`)

  const email = `admin-notice-${roleKey}@example.invalid`
  const user = await payload.create({
    collection: 'users',
    data: { email, password, displayName: `Admin notice test ${roleKey}`, roles: [role.id] },
  })
  testUsers.push(user)
  const { token } = await payload.login({ collection: 'users', data: { email, password } })
  if (!token) throw new Error(`Missing authentication token for ${roleKey}`)
  return token
}

function requestNotice(path: string, token?: string, data?: Partial<AdminNotice>) {
  const headers = new Headers()
  if (token) headers.set('Authorization', `JWT ${token}`)
  if (data) headers.set('Content-Type', 'application/json')
  return handleEndpoints({
    config,
    request: new Request(`http://localhost${path}`, {
      body: data ? JSON.stringify(data) : undefined,
      headers,
      method: data ? 'POST' : 'GET',
    }),
  })
}

beforeAll(async () => {
  payload = await getPayload({ config })
  original = await payload.findGlobal({ slug })
  administratorToken = await createUserToken('administrator')
  userToken = await createUserToken('user')
})

afterAll(async () => {
  if (original) {
    const { enabled, message, startsAt, endsAt } = original
    await payload.updateGlobal({ slug, data: { enabled, message, startsAt, endsAt } })
  }
  for (const user of testUsers) await payload.delete({ collection: 'users', id: user.id })
})

describe('administrative notice API', () => {
  it('starts with one disabled setting after migration', () => {
    expect(original).toMatchObject({
      id: 1,
      enabled: false,
      message: null,
      startsAt: null,
      endsAt: null,
      startsAt_tz: 'Europe/Warsaw',
      endsAt_tz: 'Europe/Warsaw',
    })
  })

  it('restricts reading and updating the full setting to administrators', async () => {
    expect((await requestNotice(settingsPath, administratorToken)).status).toBe(200)
    expect((await requestNotice(settingsPath)).status).toBe(403)
    expect((await requestNotice(settingsPath, userToken)).status).toBe(403)
    expect((await requestNotice(settingsPath, userToken, { enabled: false })).status).toBe(403)
  })

  it('rejects invalid schedules on enabled saves, including partial updates', async () => {
    const now = Date.now()
    const startsAt = new Date(now - 60_000).toISOString()
    const endsAt = new Date(now + 60_000).toISOString()
    const missing = await requestNotice(settingsPath, administratorToken, {
      enabled: true,
      message: '  ',
    })
    expect(missing.status).toBe(400)
    expect(await missing.json()).toMatchObject({
      errors: [
        { data: { errors: [{ path: 'message' }, { path: 'startsAt' }, { path: 'endsAt' }] } },
      ],
    })

    const saved = await requestNotice(settingsPath, administratorToken, {
      enabled: true,
      message: ` ${message} `,
      startsAt,
      endsAt,
    })
    expect(saved.status).toBe(200)
    expect(await payload.findGlobal({ slug })).toMatchObject({ enabled: true, message })

    for (const data of [
      { endsAt: startsAt },
      { startsAt: endsAt },
      { endsAt: null },
      { startsAt: 'invalid' },
    ]) {
      expect((await requestNotice(settingsPath, administratorToken, data)).status).toBe(400)
    }
    expect(await payload.findGlobal({ slug })).toMatchObject({ startsAt, endsAt })
  })

  it('returns only active content to authenticated users and prevents response caching', async () => {
    const activePath = `${settingsPath}/active`
    const now = Date.now()
    const past = new Date(now - 60_000).toISOString()
    const earlier = new Date(now - 120_000).toISOString()
    const future = new Date(now + 60_000).toISOString()
    const later = new Date(now + 120_000).toISOString()

    await payload.updateGlobal({
      slug,
      data: { enabled: true, message, startsAt: past, endsAt: future },
    })
    const anonymousResponse = await requestNotice(activePath)
    expect(anonymousResponse.status).toBe(401)
    expect(anonymousResponse.headers.get('cache-control')).toBe('private, no-store')
    expect(await anonymousResponse.text()).toBe('')

    const response = await requestNotice(activePath, userToken)
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('private, no-store')
    expect(await response.json()).toEqual({
      notice: { message, expiresInMs: expect.any(Number) },
      refreshAfterMs: expect.any(Number),
    })

    for (const data of [
      { enabled: true, startsAt: future, endsAt: later },
      { enabled: true, startsAt: earlier, endsAt: past },
      { enabled: false, startsAt: past, endsAt: future },
    ]) {
      await payload.updateGlobal({ slug, data })
      const inactive = await requestNotice(activePath, userToken)
      expect(inactive.status).toBe(200)
      expect(await inactive.json()).toEqual({ notice: null, refreshAfterMs: expect.any(Number) })
    }
  })
})
