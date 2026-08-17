'use client'

import { Hamburger, useNav } from '@payloadcms/ui'
import React from 'react'

const baseClass = 'nav'

export function AdminNavWrapper({ children }: { children: React.ReactNode }) {
  const { hydrated, navOpen, navRef, shouldAnimate } = useNav()

  return (
    <aside
      className={[
        baseClass,
        navOpen && `${baseClass}--nav-open`,
        shouldAnimate && `${baseClass}--nav-animate`,
        hydrated && `${baseClass}--nav-hydrated`,
      ]
        .filter(Boolean)
        .join(' ')}
      inert={!navOpen ? true : undefined}
    >
      <div className={`${baseClass}__scroll`} ref={navRef}>
        {children}
      </div>
    </aside>
  )
}

export function AdminNavHamburger() {
  const { navOpen, setNavOpen } = useNav()

  return (
    <button
      className={`${baseClass}__mobile-close`}
      onClick={() => setNavOpen(false)}
      tabIndex={!navOpen ? -1 : undefined}
      type="button"
    >
      <Hamburger isActive />
    </button>
  )
}
