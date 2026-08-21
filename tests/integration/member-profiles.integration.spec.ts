import sharp from 'sharp'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { findMemberProfileUsages } from '@/modules/members/member-profile-usages'
import {
  findPublicMemberProfileBySlug,
  findPublicMemberProfiles,
} from '@/modules/members/public-members'
import { createRichTextDocument } from '@/modules/members/rich-text'
import type { MemberProfile, Page, Role, User } from '@/payload-types'
import config from '@/payload.config'

const testEmails = ['member-profile-owner@example.invalid', 'member-profile-other@example.invalid']

let payload: Payload
let memberRole: Role
let userRole: Role
let owner: User
let otherMember: User
let profile: MemberProfile
let usagePage: Page | undefined

async function findRole(key: string): Promise<Role> {
  const result = await payload.find({
    collection: 'roles',
    depth: 1,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { key: { equals: key } },
  })
  const role = result.docs[0]
  if (!role) throw new Error(`Missing role: ${key}`)
  return role
}

async function createTestUser(email: string, displayName: string, role: Role): Promise<User> {
  return payload.create({
    collection: 'users',
    data: {
      displayName,
      email,
      password: 'integration-test-password',
      roles: [role.id],
    },
    depth: 1,
    overrideAccess: true,
  })
}

async function publishProfile(data: Partial<MemberProfile> = {}): Promise<MemberProfile> {
  return payload.update({
    collection: 'member-profiles',
    id: profile.id,
    data: { ...data, _status: 'published' },
    draft: false,
    overrideAccess: false,
    user: owner,
  })
}

beforeAll(async () => {
  payload = await getPayload({ config })

  const existingUsers = await payload.find({
    collection: 'users',
    depth: 0,
    limit: testEmails.length,
    overrideAccess: true,
    pagination: false,
    where: { email: { in: testEmails } },
  })
  for (const existingUser of existingUsers.docs) {
    await payload.delete({ collection: 'users', id: existingUser.id, overrideAccess: true })
  }

  ;[memberRole, userRole] = await Promise.all([findRole('member'), findRole('user')])
  ;[owner, otherMember] = await Promise.all([
    createTestUser(testEmails[0], 'Member Profile Owner', memberRole),
    createTestUser(testEmails[1], 'Member Profile Other', memberRole),
  ])

  profile = await payload.create({
    collection: 'member-profiles',
    data: {
      contactChannels: [
        { type: 'email', url: 'owner@example.invalid' },
        { type: 'website', url: 'https://example.com/member' },
      ],
      owner: owner.id,
      publicName: 'Smoczyca Anna',
      slug: 'generated-by-hook',
    },
    draft: true,
    overrideAccess: false,
    user: owner,
  })
}, 30_000)

afterAll(async () => {
  if (!payload) return
  if (usagePage) {
    await payload.delete({ collection: 'pages', id: usagePage.id, overrideAccess: true })
  }

  for (const email of testEmails) {
    await payload.delete({
      collection: 'users',
      overrideAccess: true,
      where: { email: { equals: email } },
    })
  }
})

describe('member profiles integration', () => {
  it('enforces one profile per owner and scopes drafts to their owner', async () => {
    await expect(
      payload.create({
        collection: 'member-profiles',
        data: {
          owner: owner.id,
          publicName: 'Duplicate profile',
          slug: 'generated-by-hook',
        },
        draft: true,
        overrideAccess: false,
        user: owner,
      }),
    ).rejects.toMatchObject({ status: 400 })

    const ownProfiles = await payload.find({
      collection: 'member-profiles',
      draft: true,
      overrideAccess: false,
      user: owner,
      where: { id: { equals: profile.id } },
    })
    const otherProfiles = await payload.find({
      collection: 'member-profiles',
      draft: true,
      overrideAccess: false,
      user: otherMember,
      where: { id: { equals: profile.id } },
    })
    const anonymousProfiles = await payload.find({
      collection: 'member-profiles',
      overrideAccess: false,
      user: null,
      where: { id: { equals: profile.id } },
    })

    expect(profile._status).toBe('draft')
    expect(ownProfiles.docs).toHaveLength(1)
    expect(otherProfiles.docs).toHaveLength(0)
    expect(anonymousProfiles.docs).toHaveLength(0)
  })

  it('publishes through native drafts, normalizes contact data, and keeps the slug stable', async () => {
    const originalSlug = profile.slug
    profile = await publishProfile({
      about: createRichTextDocument([
        'Organizuję spotkania klubowe i pomagam nowym osobom odnaleźć się w naszych aktywnościach.',
      ]),
      publicName: 'Anna Smoczyca',
    })

    const publicResult = await payload.find({
      collection: 'member-profiles',
      overrideAccess: false,
      user: null,
      where: { id: { equals: profile.id } },
    })

    expect(profile._status).toBe('published')
    expect(profile.slug).toBe(originalSlug)
    expect(profile.contactChannels?.[0]?.url).toBe('mailto:owner@example.invalid')
    expect(publicResult.docs).toHaveLength(1)
    expect(publicResult.docs[0]).not.toHaveProperty('owner')
    expect(publicResult.docs[0]).not.toHaveProperty('moderatorHidden')
    expect(publicResult.docs[0]).not.toHaveProperty('moderationReason')

    const [publicProfiles, publicProfile] = await Promise.all([
      findPublicMemberProfiles(),
      findPublicMemberProfileBySlug(profile.slug),
    ])
    expect(publicProfiles.map((item) => item.id)).toContain(profile.id)
    expect(publicProfile?.id).toBe(profile.id)
    expect(publicProfile).not.toHaveProperty('owner')
  })

  it('finds CMS pages that embed the profile block', async () => {
    usagePage = await payload.create({
      collection: 'pages',
      data: {
        _status: 'published',
        author: owner.id,
        layout: [
          {
            blockType: 'memberProfiles',
            entries: [{ contextLabel: 'Prezes Zarządu', profile: profile.id }],
            heading: 'Zarząd',
          },
        ],
        slug: 'integration-member-profile-usage',
        title: 'Integration member profile usage',
      },
      overrideAccess: true,
    })

    const usages = await findMemberProfileUsages({
      id: profile.id,
      isPublic: true,
      payload,
      slug: profile.slug,
    })
    expect(usages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ publicPath: `/members/${profile.slug}`, type: 'profile' }),
        expect.objectContaining({ publicPath: '/members', type: 'catalog' }),
        expect.objectContaining({ adminPath: `/admin/collections/pages/${usagePage.id}` }),
      ]),
    )
  })

  it('ignores retained moderation data when deciding public visibility', async () => {
    profile = await payload.update({
      collection: 'member-profiles',
      id: profile.id,
      data: { moderatorHidden: true, moderationReason: 'Retained legacy value' },
      draft: false,
      overrideAccess: true,
    })

    const publicResult = await payload.find({
      collection: 'member-profiles',
      overrideAccess: false,
      user: null,
      where: { id: { equals: profile.id } },
    })

    expect(profile._status).toBe('published')
    expect(publicResult.docs).toHaveLength(1)
  })

  it('stores one AVIF photo record and generates WebP display sizes', async () => {
    const firstAVIF = await sharp({
      create: { background: '#5a376e', channels: 4, height: 640, width: 640 },
    })
      .avif()
      .toBuffer()
    let image = await payload.create({
      collection: 'member-profile-images',
      data: { owner: owner.id },
      file: {
        data: firstAVIF,
        mimetype: 'image/avif',
        name: 'integration-member-profile.avif',
        size: firstAVIF.length,
      },
      overrideAccess: false,
      user: owner,
    })

    const replacementAVIF = await sharp({
      create: { background: '#315f48', channels: 4, height: 720, width: 720 },
    })
      .avif()
      .toBuffer()
    image = await payload.update({
      collection: 'member-profile-images',
      id: image.id,
      data: { owner: owner.id },
      file: {
        data: replacementAVIF,
        mimetype: 'image/avif',
        name: 'integration-member-profile-replacement.avif',
        size: replacementAVIF.length,
      },
      overrideAccess: false,
      user: owner,
    })

    profile = await publishProfile({ photo: image.id })

    const ownerImages = await payload.find({
      collection: 'member-profile-images',
      overrideAccess: false,
      user: owner,
    })

    expect(ownerImages.docs).toHaveLength(1)
    expect(image.filename).toBe('integration-member-profile-replacement.avif')
    expect(ownerImages.docs[0]?.mimeType).toBe('image/avif')
    expect(ownerImages.docs[0]?.sizes?.card?.mimeType).toBe('image/webp')
    expect(ownerImages.docs[0]?.sizes?.profile?.mimeType).toBe('image/webp')
    expect(ownerImages.docs[0]?.isPubliclyUsed).toBe(true)
  })

  it('keeps the published photo available while a newer text draft is edited', async () => {
    profile = await payload.update({
      collection: 'member-profiles',
      id: profile.id,
      data: { clubFunction: 'Funkcja zapisana tylko w szkicu' },
      draft: true,
      overrideAccess: false,
      user: owner,
    })

    const [ownerImages, publicProfiles] = await Promise.all([
      payload.find({
        collection: 'member-profile-images',
        overrideAccess: true,
        where: { owner: { equals: owner.id } },
      }),
      payload.find({
        collection: 'member-profiles',
        overrideAccess: false,
        user: null,
        where: { id: { equals: profile.id } },
      }),
    ])

    expect(profile._status).toBe('draft')
    expect(ownerImages.docs[0]?.isPubliclyUsed).toBe(true)
    expect(publicProfiles.docs).toHaveLength(1)
  })

  it('withdraws publication without deleting the draft', async () => {
    profile = await payload.update({
      collection: 'member-profiles',
      id: profile.id,
      data: { _status: 'draft' },
      overrideAccess: false,
      unpublishAllLocales: true,
      user: owner,
    })

    const storedProfile = await payload.findByID({
      collection: 'member-profiles',
      draft: true,
      id: profile.id,
      overrideAccess: true,
    })
    const publicResult = await payload.find({
      collection: 'member-profiles',
      overrideAccess: false,
      user: null,
      where: { id: { equals: profile.id } },
    })

    expect(storedProfile._status).toBe('draft')
    expect(publicResult.docs).toHaveLength(0)

    profile = await publishProfile()
  })

  it('unpublishes the profile when its owner loses the member role', async () => {
    owner = await payload.update({
      collection: 'users',
      id: owner.id,
      data: { roles: [userRole.id] },
      depth: 1,
      overrideAccess: true,
    })

    const storedProfile = await payload.findByID({
      collection: 'member-profiles',
      draft: true,
      id: profile.id,
      overrideAccess: true,
    })
    const publicResult = await payload.find({
      collection: 'member-profiles',
      overrideAccess: false,
      user: null,
      where: { id: { equals: profile.id } },
    })
    const ownerImages = await payload.find({
      collection: 'member-profile-images',
      overrideAccess: true,
      where: { owner: { equals: owner.id } },
    })

    expect(storedProfile._status).toBe('draft')
    expect(publicResult.docs).toHaveLength(0)
    expect(ownerImages.docs[0]?.isPubliclyUsed).toBe(false)
  })
})
