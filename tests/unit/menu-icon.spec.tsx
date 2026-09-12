import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { MenuIcon } from '@/app/(frontend)/_components/MenuIcon'

describe('MenuIcon', () => {
  it('renders the medium raster variant as a CSS mask', () => {
    const markup = renderToStaticMarkup(<MenuIcon iconName="dice" />)

    expect(markup).not.toContain('<svg')
    expect(markup).toContain('aria-hidden="true"')
    expect(markup).toContain('/assets/icons/medium/dice.png')
    expect(markup).toContain('data-icon-size="medium"')
  })

  it('renders another named icon with the same component contract', () => {
    const markup = renderToStaticMarkup(<MenuIcon iconName="slack" />)

    expect(markup).toContain('/assets/icons/medium/slack.png')
    expect(markup).toContain('data-icon-name="slack"')
  })
})
