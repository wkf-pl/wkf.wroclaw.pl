import { describe, expect, it } from 'vitest'

import { getRelationshipId } from '@/lib/relationships'
import {
  createEditorialFields,
  getEditorialField,
  withFieldWidth,
} from '@/modules/content/editorial-fields'
import { getMediaURL } from '@/modules/media/media-url'
import { combineAccessWithConstraint } from '@/modules/membership/role-permissions'
import { userHasRole } from '@/modules/membership/user-roles'

describe('shared data utilities', () => {
  it('extracts scalar relationship IDs without accepting malformed values', () => {
    expect(getRelationshipId(42)).toBe(42)
    expect(getRelationshipId('role-id')).toBe('role-id')
    expect(getRelationshipId({ id: 7 })).toBe(7)
    expect(getRelationshipId({ id: 'media-id' })).toBe('media-id')
    expect(getRelationshipId({ id: null })).toBeUndefined()
    expect(getRelationshipId({})).toBeUndefined()
    expect(getRelationshipId(null)).toBeUndefined()
  })

  it('detects populated client-side roles by key', () => {
    const user = { roles: [{ key: 'member' }, { key: 'editor' }] }

    expect(userHasRole(user, 'member')).toBe(true)
    expect(userHasRole(user, 'administrator')).toBe(false)
    expect(userHasRole({ roles: [1, { id: 2 }] }, 'member')).toBe(false)
  })

  it('returns URLs only from populated media', () => {
    expect(getMediaURL({ url: 'https://example.test/image.webp' })).toBe(
      'https://example.test/image.webp',
    )
    expect(getMediaURL({ url: null })).toBeUndefined()
    expect(getMediaURL(4)).toBeUndefined()
    expect(getMediaURL(null)).toBeUndefined()
  })

  it('reuses editorial fields without mutating their original administration settings', () => {
    const titleField = getEditorialField(createEditorialFields(), 'title')
    const halfWidthTitleField = withFieldWidth(titleField, '50%')

    expect(halfWidthTitleField.admin?.width).toBe('50%')
    expect(titleField.admin?.width).toBeUndefined()
    expect(() => getEditorialField([], 'title')).toThrow('Missing editorial field: title')
  })

  it('intersects role access with public visibility constraints', () => {
    const visibility = { visibility: { equals: 'public' } }

    expect(combineAccessWithConstraint(false, visibility)).toBe(false)
    expect(combineAccessWithConstraint(true, visibility)).toEqual(visibility)
    expect(combineAccessWithConstraint({ id: { equals: 3 } }, true)).toEqual({ id: { equals: 3 } })
    expect(combineAccessWithConstraint({ id: { equals: 3 } }, visibility)).toEqual({
      and: [{ id: { equals: 3 } }, visibility],
    })
  })
})
