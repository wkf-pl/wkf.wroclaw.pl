import { randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

type JsonRecord = Record<string, unknown>

const applicationURL = process.env.COMPOSE_APP_URL ?? 'http://127.0.0.1:3000'
const mailpitURL = process.env.COMPOSE_MAILPIT_URL ?? 'http://127.0.0.1:8025'
const testEmail = `compose-${randomUUID()}@example.test`
const testPassword = `Compose-${randomUUID()}-Aa1!`

let authenticationToken: string | undefined
let mailpitMessageID: string | undefined
let mediaID: number | string | undefined
let userID: number | string | undefined

function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getRequiredProperty(value: unknown, property: string): unknown {
  if (!isJsonRecord(value) || !(property in value)) {
    throw new Error(`Response is missing the required property: ${property}`)
  }

  return value[property]
}

function getRequiredString(value: unknown, property: string): string {
  const propertyValue = getRequiredProperty(value, property)

  if (typeof propertyValue !== 'string') {
    throw new Error(`Response property ${property} must be a string`)
  }

  return propertyValue
}

async function requestJSON(url: string, init?: RequestInit): Promise<unknown> {
  const response = await fetch(url, init)
  const responseText = await response.text()
  const responseBody = responseText ? (JSON.parse(responseText) as unknown) : undefined

  if (!response.ok) {
    throw new Error(`${init?.method ?? 'GET'} ${url} returned ${response.status}: ${responseText}`)
  }

  return responseBody
}

async function getMailpitMailbox(): Promise<{ count: number; messages: unknown[] }> {
  const response = await requestJSON(`${mailpitURL}/api/v1/messages`)
  const messageCount = getRequiredProperty(response, 'messages_count')
  const messages = getRequiredProperty(response, 'messages')

  if (typeof messageCount !== 'number') {
    throw new Error('Mailpit messages_count must be a number')
  }

  if (!Array.isArray(messages)) {
    throw new Error('Mailpit messages must be an array')
  }

  return { count: messageCount, messages }
}

async function deleteCreatedResources(): Promise<void> {
  if (mailpitMessageID) {
    const response = await fetch(`${mailpitURL}/api/v1/messages`, {
      body: JSON.stringify({ IDs: [mailpitMessageID] }),
      headers: { 'Content-Type': 'application/json' },
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`Could not delete the Mailpit test message: ${response.status}`)
    }
  }

  if (!authenticationToken) {
    return
  }

  const headers = { Authorization: `JWT ${authenticationToken}` }

  if (mediaID !== undefined) {
    await requestJSON(`${applicationURL}/api/media/${mediaID}`, { headers, method: 'DELETE' })
  }

  if (userID !== undefined) {
    await requestJSON(`${applicationURL}/api/users/${userID}`, { headers, method: 'DELETE' })
  }
}

async function verifyComposeStack(): Promise<void> {
  const healthResponse = await requestJSON(`${applicationURL}/api/health`)

  if (getRequiredString(healthResponse, 'status') !== 'ok') {
    throw new Error('Application health endpoint did not return status ok')
  }

  const livenessResponse = await requestJSON(`${applicationURL}/api/health/live`)

  if (getRequiredString(livenessResponse, 'status') !== 'live') {
    throw new Error('Application liveness endpoint did not return status live')
  }

  for (const route of ['/', '/admin']) {
    const response = await fetch(`${applicationURL}${route}`)

    if (!response.ok) {
      throw new Error(`GET ${route} returned ${response.status}`)
    }
  }

  const initializationResponse = await requestJSON(`${applicationURL}/api/users/init`)

  if (getRequiredProperty(initializationResponse, 'initialized') !== false) {
    throw new Error('Bootstrap verification requires an empty users collection')
  }

  const createdUserResponse = await requestJSON(`${applicationURL}/api/users`, {
    body: JSON.stringify({
      displayName: 'Compose verification',
      email: testEmail,
      password: testPassword,
    }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  const createdUser = getRequiredProperty(createdUserResponse, 'doc')
  const createdUserRoles = getRequiredProperty(createdUser, 'roles')
  const createdUserID = getRequiredProperty(createdUser, 'id')

  if (!Array.isArray(createdUserRoles) || !createdUserRoles.includes('administrator')) {
    throw new Error('The first user did not receive the administrator role')
  }

  if (typeof createdUserID !== 'number' && typeof createdUserID !== 'string') {
    throw new Error('Created user ID must be a number or string')
  }

  userID = createdUserID

  const loginResponse = await requestJSON(`${applicationURL}/api/users/login`, {
    body: JSON.stringify({ email: testEmail, password: testPassword }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  authenticationToken = getRequiredString(loginResponse, 'token')

  const image = await readFile(path.resolve('public/assets/favicon-32.png'))
  const mediaForm = new FormData()
  mediaForm.set('_payload', JSON.stringify({ alt: 'Compose verification image' }))
  mediaForm.set('file', new Blob([new Uint8Array(image)], { type: 'image/png' }), 'verify.png')

  const createdMediaResponse = await requestJSON(`${applicationURL}/api/media`, {
    body: mediaForm,
    headers: { Authorization: `JWT ${authenticationToken}` },
    method: 'POST',
  })
  const createdMedia = getRequiredProperty(createdMediaResponse, 'doc')
  const createdMediaID = getRequiredProperty(createdMedia, 'id')

  if (typeof createdMediaID !== 'number' && typeof createdMediaID !== 'string') {
    throw new Error('Created media ID must be a number or string')
  }

  mediaID = createdMediaID

  const mailboxBeforeReset = await getMailpitMailbox()

  await requestJSON(`${applicationURL}/api/users/forgot-password`, {
    body: JSON.stringify({ email: testEmail }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })

  const mailboxAfterReset = await getMailpitMailbox()

  if (mailboxAfterReset.count !== mailboxBeforeReset.count + 1) {
    throw new Error('Mailpit did not receive the password reset message')
  }

  const resetMessage = mailboxAfterReset.messages.find((message) => {
    if (!isJsonRecord(message) || !Array.isArray(message.To)) {
      return false
    }

    return message.To.some(
      (recipient) => isJsonRecord(recipient) && recipient.Address === testEmail,
    )
  })

  mailpitMessageID = getRequiredString(resetMessage, 'ID')
}

try {
  await verifyComposeStack()
  console.info('Compose verification passed: HTTP, bootstrap, PostgreSQL, Azurite and Mailpit')
} finally {
  await deleteCreatedResources()
}
