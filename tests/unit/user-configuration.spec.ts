import { describe, expect, it } from 'vitest'

import { Users } from '@/collections/Users'

describe('users collection configuration', () => {
  it('shows identity fields by default and disables bulk editing', () => {
    expect(Users.admin?.defaultColumns).toEqual(['displayName', 'email', 'roles', 'updatedAt'])
    expect(Users.disableBulkEdit).toBe(true)
  })

  it('uses a stable custom link cell for the generated email field', () => {
    const emailField = Users.fields.find((field) => 'name' in field && field.name === 'email')

    expect(emailField).toMatchObject({
      admin: {
        components: {
          Cell: '/components/admin/UserIdentity#UserEmailCell',
        },
      },
      label: 'Adres e-mail',
      type: 'email',
    })
  })
})
