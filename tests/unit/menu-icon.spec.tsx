import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import type { Media } from '@/payload-types'
import { MenuIcon } from '@/app/(frontend)/_components/MenuIcon'

describe('MenuIcon', () => {
  it('renders a system SVG icon', () => {
    const markup = renderToStaticMarkup(<MenuIcon iconSource="system" systemIcon="dice" />)

    expect(markup).toContain('<svg')
    expect(markup).toContain('aria-hidden="true"')
  })

  it('renders the Slack system icon', () => {
    const markup = renderToStaticMarkup(<MenuIcon iconSource="system" systemIcon="slack" />)

    expect(markup).toContain('<svg')
    expect(markup).toContain('fill="currentColor"')
  })

  it('renders a decorative custom image from populated media', () => {
    const media = { id: 1, url: '/api/media/file/custom-icon.svg' } as Media
    const markup = renderToStaticMarkup(<MenuIcon customIcon={media} iconSource="media" />)

    expect(markup).toContain('src="/api/media/file/custom-icon.svg"')
    expect(markup).toContain('alt=""')
  })
})
