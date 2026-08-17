import { describe, expect, it } from 'vitest'

import { MemberProfileImages } from '@/collections/MemberProfileImages'
import { MemberProfiles } from '@/collections/MemberProfiles'
import {
  createBaseProfileSlug,
  normalizeContactAddress,
  validateContactAddress,
  validateGame,
  validateUniqueGames,
} from '@/modules/members/member-profile'
import { createRichTextDocument, extractMemberProfileText } from '@/modules/members/rich-text'

function findNamedField(fields: typeof MemberProfiles.fields, name: string) {
  for (const field of fields) {
    if (field.type !== 'tabs') continue
    for (const tab of field.tabs) {
      const result = tab.fields.find((tabField) => 'name' in tabField && tabField.name === name)
      if (result) return result
    }
  }

  throw new Error(`Missing member profile field: ${name}`)
}

describe('member profile validation', () => {
  it('uses one required public name with the agreed length limit', () => {
    const field = findNamedField(MemberProfiles.fields, 'publicName')

    expect(field).toMatchObject({ maxLength: 120, required: true, type: 'text' })
  })

  it('creates a safe stable slug base, including a fallback', () => {
    expect(createBaseProfileSlug('Anna „Smoczyca” Kowalska')).toBe('anna-smoczyca-kowalska')
    expect(createBaseProfileSlug('---')).toBe('member')
  })

  it('keeps games optional and requires at least one mode per game', () => {
    const games = findNamedField(MemberProfiles.fields, 'games')

    expect(games).not.toHaveProperty('required', true)
    expect(games).toMatchObject({
      admin: {
        components: {
          RowLabel: '/components/admin/DynamicRowLabel#GameRowLabel',
        },
      },
    })
    expect(validateGame(false, { siblingData: { plays: false, runs: false } } as never)).toBeTypeOf(
      'string',
    )
    expect(validateGame(true, { siblingData: { plays: true, runs: false } } as never)).toBe(true)
  })

  it('uses Rich Text for narrative fields and plain text for interests', () => {
    expect(findNamedField(MemberProfiles.fields, 'about')).toMatchObject({ type: 'richText' })
    expect(findNamedField(MemberProfiles.fields, 'clubActivities')).toMatchObject({
      type: 'richText',
    })
    expect(findNamedField(MemberProfiles.fields, 'interests')).toMatchObject({ type: 'text' })
  })

  it('rejects duplicate games without introducing a shared taxonomy', () => {
    expect(validateUniqueGames([{ title: 'Alien' }, { title: ' alien ' }])).toBeTypeOf('string')
  })

  it('converts plain text to Rich Text and extracts safe card copy', () => {
    const richText = createRichTextDocument(['Pierwszy akapit', 'Drugi akapit'])

    expect(extractMemberProfileText(richText)).toBe('Pierwszy akapit Drugi akapit')
    expect(extractMemberProfileText(richText, 18)).toBe('Pierwszy akapit…')
  })

  it('uses native drafts and retains at most 20 document versions', () => {
    expect(MemberProfiles.versions).toEqual({ drafts: true, maxPerDoc: 20 })
  })

  it('normalizes email and rejects non-HTTPS contact links', () => {
    expect(findNamedField(MemberProfiles.fields, 'contactChannels')).toMatchObject({
      admin: {
        components: {
          RowLabel: '/components/admin/DynamicRowLabel#ContactChannelRowLabel',
        },
      },
    })
    expect(normalizeContactAddress('email', 'Klubowicz@example.com')).toBe(
      'mailto:Klubowicz@example.com',
    )
    expect(validateContactAddress('javascript:alert(1)', { siblingData: { type: 'other' } })).toBe(
      'Link musi używać protokołu HTTPS.',
    )
    expect(
      validateContactAddress('https://example.com/profile', { siblingData: { type: 'other' } }),
    ).toBe(true)
  })

  it('accepts AVIF but excludes SVG and animated image formats', () => {
    const mimeTypes =
      typeof MemberProfileImages.upload === 'object'
        ? MemberProfileImages.upload.mimeTypes
        : undefined

    expect(mimeTypes).toContain('image/avif')
    expect(mimeTypes).not.toContain('image/svg+xml')
    expect(mimeTypes).not.toContain('image/gif')
  })
})
