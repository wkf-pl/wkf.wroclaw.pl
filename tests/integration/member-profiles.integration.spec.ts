import sharp from 'sharp'
import { sql } from '@payloadcms/db-postgres'
import { createLocalReq, getPayload, handleEndpoints, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { getMemberProfileImageURL } from '@/modules/members/member-profile-image'
import { findMemberProfileUsages } from '@/modules/members/member-profile-usages'
import {
  findPublicMemberProfileBySlug,
  findPublicMemberProfiles,
} from '@/modules/members/public-members'
import { createRichTextDocument } from '@/modules/members/rich-text'
import type { MemberProfile, Page, Role, User } from '@/payload-types'
import config from '@/payload.config'
import { getStorageContainerClient } from '@/storage/get-storage-container-client'
import {
  down as restoreClubActivitiesColumn,
  up as mergeClubActivitiesIntoAbout,
} from '../../migrations/20261110_222548_remove_member_profile_club_activities'

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
  it('merges club activities into the bio of existing profiles and versions', async () => {
    const about = createRichTextDocument(['Oryginalny opis'])
    const activities = createRichTextDocument(['Opis działalności'])
    activities.root.children[0].children[0].format = 1
    const req = await createLocalReq({}, payload)

    await expect(
      payload.db.drizzle.transaction(async (db) => {
        await restoreClubActivitiesColumn({ db, payload, req })
        await db.execute(sql`
          UPDATE "member_profiles"
          SET "about" = ${JSON.stringify(about)}::jsonb,
              "club_activities" = ${JSON.stringify(activities)}::jsonb,
              "club_function" = 'Opiekunka'
          WHERE "id" = ${profile.id};
        `)
        await db.execute(sql`
          UPDATE "_member_profiles_v"
          SET "version_about" = NULL,
              "version_club_activities" = ${JSON.stringify(activities)}::jsonb,
              "version_club_function" = 'Koordynatorka'
          WHERE "parent_id" = ${profile.id};
        `)

        await mergeClubActivitiesIntoAbout({ db, payload, req })

        const profiles = await db.execute(sql`
          SELECT "about", "club_function" FROM "member_profiles" WHERE "id" = ${profile.id};
        `)
        expect(profiles.rows).toEqual([
          {
            about: {
              root: {
                ...about.root,
                children: [...about.root.children, ...activities.root.children],
              },
            },
            club_function: 'Opiekunka',
          },
        ])
        const versions = await db.execute(sql`
          SELECT "version_about", "version_club_function"
          FROM "_member_profiles_v" WHERE "parent_id" = ${profile.id};
        `)
        expect(versions.rows).toEqual([
          { version_about: activities, version_club_function: 'Koordynatorka' },
        ])
        db.rollback()
      }),
    ).rejects.toThrow('Rollback')
  })

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
            blockType: 'columnLayout',
            columnSeparators: 'none',
            columns: [
              {
                blocks: [
                  {
                    blockType: 'listing',
                    hideWhenEmpty: true,
                    items: [
                      {
                        contextLabel: 'Prezes Zarządu',
                        item: { relationTo: 'member-profiles', value: profile.id },
                      },
                    ],
                    pageSize: 100,
                    pagination: false,
                    selectionMode: 'manual',
                    sort: 'titleAscending',
                    view: 'grid',
                  },
                ],
                surface: 'default',
                width: 6,
              },
              { blocks: [], surface: 'default', width: 6 },
            ],
            verticalAlignment: 'start',
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

  it('preserves the public photo until a replacement draft is published', async () => {
    const savePhoto = async (color: string, draft: boolean) => {
      const image = await sharp({
        create: { background: color, channels: 4, height: 640, width: 640 },
      })
        .avif()
        .toBuffer()
      const form = new FormData()
      form.set('file', new File([new Uint8Array(image)], 'photo.avif', { type: 'image/avif' }))
      form.set('_payload', JSON.stringify({ _status: draft ? 'draft' : 'published' }))
      const response = await handleEndpoints({
        config,
        request: new Request(`http://localhost/api/member-profiles/${profile.id}?draft=${draft}`, {
          body: form,
          headers: { Authorization: `JWT ${token}` },
          method: 'PATCH',
        }),
      })
      const result = (await response.json()) as { doc: MemberProfile }
      expect(response.status, JSON.stringify(result)).toBe(200)
      return result.doc
    }

    const fetchPhoto = (photo: MemberProfile['photo'], token?: string) =>
      handleEndpoints({
        config,
        request: new Request(
          `http://localhost${getMemberProfileImageURL({ id: profile.id, photo }, 'card')}`,
          {
            headers: token ? { Authorization: `JWT ${token}` } : undefined,
          },
        ),
      })

    const { token } = await payload.login({
      collection: 'users',
      data: { email: owner.email, password: 'integration-test-password' },
    })

    const published = await savePhoto('#5a376e', false)
    const draft = await savePhoto('#315f48', true)
    expect(draft.photo).toEqual(published.photo)
    expect(draft.draftPhoto).toBeTruthy()
    expect(draft.draftPhoto).not.toEqual(published.photo)

    const publicProfile = await payload.findByID({
      collection: 'member-profiles',
      id: profile.id,
      overrideAccess: false,
      user: null,
    })
    expect(publicProfile.photo).toEqual(published.photo)
    expect(publicProfile.draftPhoto).toBeFalsy()

    const draftPhoto =
      draft.draftPhoto && !('removed' in draft.draftPhoto) ? draft.draftPhoto : null
    const currentResponse = await fetchPhoto(published.photo)
    const draftResponse = await fetchPhoto(draftPhoto, token)
    expect(currentResponse.status).toBe(200)
    expect(draftResponse.status).toBe(200)
    expect(currentResponse.headers.get('content-type')).toBe('image/webp')
    expect(draftResponse.headers.get('cache-control')).toBe('private, no-store')
    const currentBytes = Buffer.from(await currentResponse.arrayBuffer())
    const draftBytes = Buffer.from(await draftResponse.arrayBuffer())
    expect(await sharp(draftBytes).metadata()).toMatchObject({ width: 192, height: 192 })
    expect(draftBytes.equals(currentBytes)).toBe(false)
    expect((await fetchPhoto(draftPhoto)).status).toBe(404)

    profile = await publishProfile()
    expect(profile.photo).toEqual(draft.draftPhoto)
    expect(profile.draftPhoto).toBeNull()
    const { docs: versions } = await payload.findVersions({
      collection: 'member-profiles',
      overrideAccess: false,
      user: owner,
      where: { parent: { equals: profile.id } },
    })
    const originalVersion = versions.find(
      ({ version }) =>
        version.photo?.sizes?.card?.filename === published.photo?.sizes?.card?.filename &&
        version._status === 'published',
    )
    expect(originalVersion).toBeDefined()
    const restoredResponse = await handleEndpoints({
      config,
      request: new Request(
        `http://localhost/api/member-profiles/versions/${originalVersion!.id}?draft=true`,
        { method: 'POST', headers: { Authorization: `JWT ${token}` } },
      ),
    })
    const restoredDraft = (await restoredResponse.json()) as MemberProfile
    expect(restoredResponse.status, JSON.stringify(restoredDraft)).toBe(200)
    expect(restoredDraft.photo).toEqual(profile.photo)
    expect(restoredDraft.draftPhoto).toEqual(published.photo)
    profile = await publishProfile()
    expect(profile.photo).toEqual(published.photo)
  })

  it('keeps the public photo when removal is saved as a draft', async () => {
    const previousPhoto = profile.photo
    const draft = await payload.update({
      collection: 'member-profiles',
      id: profile.id,
      data: { photoChange: { remove: true } },
      draft: true,
      overrideAccess: false,
      user: owner,
    })

    expect(draft.photo).toEqual(previousPhoto)
    expect(draft.draftPhoto).toEqual({ removed: true })
    profile = await publishProfile()
    expect(profile.photo).toBeNull()
    expect(profile.draftPhoto).toBeNull()
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
    expect(storedProfile._status).toBe('draft')
    expect(publicResult.docs).toHaveLength(0)
  })
  it('deletes stored photos from profile history on permanent deletion', async () => {
    const { docs: versions } = await payload.findVersions({
      collection: 'member-profiles',
      where: { parent: { equals: profile.id } },
    })
    const image = versions.find(({ version }) => version.photo)?.version.photo
    const blob = getStorageContainerClient().getBlobClient(
      `${image?.prefix}/${image?.sizes?.card?.filename}`,
    )
    expect(await blob.exists()).toBe(true)

    await payload.delete({ collection: 'member-profiles', id: profile.id })
    expect(await blob.exists()).toBe(false)
  })
})
