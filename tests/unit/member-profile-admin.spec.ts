import { describe, expect, it } from 'vitest'

import { MemberProfiles } from '@/collections/MemberProfiles'
import type { RoleRecord } from '@/modules/membership/permission-resolution'

function isMemberProfilesCollectionHidden(user: unknown): boolean {
  const hidden = MemberProfiles.admin?.hidden
  if (typeof hidden !== 'function') {
    throw new Error('Member profiles must use dynamic admin navigation visibility')
  }

  return hidden({ user } as Parameters<typeof hidden>[0])
}

function createRole(permissions: RoleRecord['permissions']): RoleRecord {
  return { id: 1, permissions }
}

describe('member profile admin configuration', () => {
  it('places the collection in the club navigation group', () => {
    expect(MemberProfiles.admin?.group).toBe('Klubowe')
  })

  it('renders the existing photo column with a dedicated preview cell', () => {
    const profileTabs = MemberProfiles.fields.find((field) => field.type === 'tabs')
    const photoColumn = profileTabs?.tabs[0].fields.find(
      (field) => 'name' in field && field.name === 'photoChange',
    )

    expect(photoColumn).toMatchObject({
      admin: {
        components: {
          Cell: '/components/admin/MemberProfilePhotoCell#MemberProfilePhotoCell',
        },
      },
      label: 'Zdjęcie',
    })
  })

  it('hides the collection for own-only access and shows it for unrestricted access', () => {
    const memberRole = createRole([
      { readAllowed: true, readOwn: true, resource: 'member-profiles' },
    ])
    const moderatorRole = createRole([{ readAllowed: true, resource: 'member-profiles' }])

    expect(isMemberProfilesCollectionHidden({ id: 10, roles: [memberRole] })).toBe(true)
    expect(isMemberProfilesCollectionHidden({ id: 10, roles: [moderatorRole] })).toBe(false)
  })
})
