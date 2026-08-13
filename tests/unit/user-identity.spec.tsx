import { renderToStaticMarkup } from 'react-dom/server'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@payloadcms/ui', () => ({
  RelationshipField: () => null,
  Tooltip: ({ children }: { children: ReactNode }) => <span data-tooltip>{children}</span>,
  useAuth: () => ({ user: null }),
  useConfig: () => ({}),
  useListRelationships: () => ({}),
  usePayloadAPI: () => [{ data: {} }],
}))

import { UserIdentity } from '@/components/admin/UserIdentity'

describe('UserIdentity', () => {
  it('renders the display name and exposes the email in a tooltip', () => {
    const markup = renderToStaticMarkup(
      <UserIdentity displayName="Forseti" email="marcin.pazdziora@forseti.pl" />,
    )

    expect(markup).toContain('Forseti')
    expect(markup).toContain('marcin.pazdziora@forseti.pl')
    expect(markup).toContain('data-tooltip="true"')
    expect(markup).toContain('</span>Forseti</span>')
  })

  it('uses the email as a fallback when a legacy user has no display name', () => {
    const markup = renderToStaticMarkup(<UserIdentity email="legacy@example.com" />)

    expect(markup).toContain('legacy@example.com')
  })
})
