import { randomUUID } from 'node:crypto'
import { getPayload, type Where } from 'payload'
import { describe, expect, it } from 'vitest'

import config from '@/payload.config'
import type { Role, User } from '@/payload-types'

function auditUser(role: Role, id: number): User {
  return {
    id,
    collection: 'users',
    displayName: `Audit ${role.key}`,
    email: `audit-${role.key}@example.invalid`,
    roles: [role.id],
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
  }
}

describe('content audit log', () => {
  it('omits every document in a bulk autosave and logs a subsequent manual draft', async () => {
    const payload = await getPayload({ config })
    const token = randomUUID()
    const ids: number[] = []

    try {
      for (const suffix of ['first', 'second']) {
        const post = await payload.create({
          collection: 'posts',
          draft: true,
          data: { title: `Bulk audit ${token} ${suffix}`, slug: `${token}-${suffix}` },
        })
        ids.push(post.id)
      }

      const where = { target: { equals: 'posts' }, targetId: { in: ids.map(String) } }
      const bulk = await payload.update({
        collection: 'posts',
        where: { id: { in: ids } },
        draft: true,
        autosave: true,
        data: { excerpt: 'Bulk preview draft' },
      })
      expect(bulk.errors).toEqual([])
      expect(bulk.docs).toHaveLength(2)
      expect((await payload.find({ collection: 'content-audit-log', where })).totalDocs).toBe(2)

      await payload.update({
        collection: 'posts',
        id: ids[0]!,
        draft: true,
        data: { excerpt: 'Manual draft' },
      })
      const audit = await payload.find({ collection: 'content-audit-log', where })
      expect(audit.totalDocs).toBe(3)
      expect(audit.docs[0]).toMatchObject({ action: 'update', saveMode: 'draft' })
    } finally {
      if (ids.length) {
        await payload.delete({ collection: 'posts', where: { id: { in: ids } } })
        const { docs } = await payload.find({
          collection: 'content-audit-log',
          pagination: false,
          where: { target: { equals: 'posts' }, targetId: { in: ids.map(String) } },
        })
        for (const { id } of docs) await payload.delete({ collection: 'content-audit-log', id })
      }
    }
  })

  it('records the content lifecycle, filters by date and enforces read-only role access', async () => {
    const payload = await getPayload({ config })
    const { docs: roles } = await payload.find({ collection: 'roles', pagination: false })
    const moderator = auditUser(
      roles.find(({ key }) => key === 'moderator')!,
      -502,
    )
    const member = auditUser(
      roles.find(({ key }) => key === 'member')!,
      -503,
    )
    const token = randomUUID()
    const administrator = await payload.create({
      collection: 'users',
      data: {
        displayName: `Audit administrator ${token}`,
        email: `audit-${token}@example.invalid`,
        password: token,
        roles: [roles.find(({ key }) => key === 'administrator')!.id],
      },
    })
    const options = {
      collection: 'posts',
      user: { ...administrator, collection: 'users' },
      depth: 0,
    } as const
    const title = `Content audit ${token}`
    const start = new Date().toISOString()
    let postId: number | undefined

    try {
      const post = await payload.create({
        ...options,
        data: {
          title,
          slug: token,
          author: administrator.id,
          excerpt: 'Content audit fixture',
          layout: [{ blockType: 'spacer', size: '24' }],
          _status: 'published',
        },
      })
      postId = post.id
      const versions = await payload.findVersions({
        collection: 'posts',
        where: { parent: { equals: post.id } },
      })
      await payload.update({ ...options, id: post.id, data: { title: `${title} edited` } })
      const versionQuery = { collection: 'posts' as const, where: { parent: { equals: post.id } } }
      const manualDraft = await payload.update({
        ...options,
        id: post.id,
        draft: true,
        data: { title: `${title} draft` },
      })
      const versionCount = (await payload.findVersions(versionQuery)).totalDocs
      for (const suffix of ['preview one', 'preview two']) {
        await payload.update({
          ...options,
          id: post.id,
          draft: true,
          autosave: true,
          data: { title: `${title} ${suffix}` },
        })
      }
      const afterPreviews = await payload.findVersions(versionQuery)
      expect(afterPreviews.totalDocs).toBe(versionCount + 1)
      expect(afterPreviews.docs[0]?.version.title).toBe(`${title} preview two`)
      await payload.update({
        ...options,
        id: post.id,
        data: { title: manualDraft.title, _status: 'published' },
      })
      await payload.restoreVersion({ ...options, id: versions.docs[0]!.id })
      await payload.update({
        ...options,
        id: post.id,
        data: { deletedAt: new Date().toISOString() },
      })
      await payload.update({ ...options, id: post.id, trash: true, data: { deletedAt: null } })
      await payload.delete({ ...options, id: post.id })

      const where: Where = {
        and: [
          { target: { equals: 'posts' } },
          { targetId: { equals: String(post.id) } },
          { occurredAt: { greater_than_equal: start } },
          { occurredAt: { less_than_equal: new Date().toISOString() } },
        ],
      }
      const query = { collection: 'content-audit-log' as const, overrideAccess: false, where }
      const result = await payload.find({ ...query, user: moderator })
      expect(
        result.docs.map(({ action, title, saveMode }) => ({
          action,
          title,
          saveMode: saveMode ?? undefined,
        })),
      ).toStrictEqual([
        { action: 'delete', title, saveMode: undefined },
        { action: 'restore', title, saveMode: undefined },
        { action: 'trash', title, saveMode: undefined },
        { action: 'restore-version', title, saveMode: undefined },
        { action: 'update', title: `${title} draft`, saveMode: 'publish' },
        { action: 'update', title: `${title} draft`, saveMode: 'draft' },
        { action: 'update', title: `${title} edited`, saveMode: 'publish' },
        { action: 'create', title, saveMode: 'publish' },
      ])
      expect(result.docs.every((entry) => entry.actor === administrator.displayName)).toBe(true)
      await expect(payload.find({ ...query, user: options.user })).rejects.toMatchObject({
        status: 403,
      })
      await expect(payload.find({ ...query, user: member })).rejects.toMatchObject({ status: 403 })
      await expect(payload.find({ ...query, user: null })).rejects.toMatchObject({ status: 403 })
      await expect(
        payload.delete({
          collection: 'content-audit-log',
          id: result.docs[0]!.id,
          overrideAccess: false,
          user: moderator,
        }),
      ).rejects.toMatchObject({ status: 403 })
    } finally {
      if (postId !== undefined) {
        await payload.delete({
          collection: 'posts',
          trash: true,
          where: { id: { equals: postId } },
        })
        const { docs } = await payload.find({
          collection: 'content-audit-log',
          pagination: false,
          where: { target: { equals: 'posts' }, targetId: { equals: String(postId) } },
        })
        for (const { id } of docs) await payload.delete({ collection: 'content-audit-log', id })
      }
      await payload.delete({ collection: 'users', id: administrator.id })
    }
  })
})
