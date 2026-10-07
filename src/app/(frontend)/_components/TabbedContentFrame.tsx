'use client'

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'

export type TabbedContentFrameTab = {
  content: ReactNode
  id: string
  label: string
}

export function TabbedContentFrame({
  footer,
  footerAlignment,
  headerLeft,
  headerRight,
  tabs,
}: {
  footer?: ReactNode
  footerAlignment: 'center' | 'end' | 'start'
  headerLeft?: ReactNode
  headerRight?: ReactNode
  tabs: TabbedContentFrameTab[]
}) {
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const tabButtons = useRef<Array<HTMLButtonElement | null>>([])
  const componentID = useId().replaceAll(':', '')

  if (!tabs.length) return null

  function selectTab(tabIndex: number, focus = false): void {
    setActiveTabIndex(tabIndex)
    if (focus) {
      tabButtons.current[tabIndex]?.focus()
    }
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, tabIndex: number): void {
    let nextTabIndex: number | undefined

    if (event.key === 'ArrowRight') nextTabIndex = (tabIndex + 1) % tabs.length
    if (event.key === 'ArrowLeft') nextTabIndex = (tabIndex - 1 + tabs.length) % tabs.length
    if (event.key === 'Home') nextTabIndex = 0
    if (event.key === 'End') nextTabIndex = tabs.length - 1
    if (nextTabIndex === undefined) return

    event.preventDefault()
    selectTab(nextTabIndex, true)
  }

  return (
    <section className="tabbedContent">
      <header className="tabbedContentHeader">
        {headerLeft ? (
          <nav aria-label="Menu po lewej stronie zakładek" className="tabbedContentHeaderMenu">
            {headerLeft}
          </nav>
        ) : (
          <span aria-hidden="true" className="tabbedContentHeaderSpacer" />
        )}
        <div aria-label="Wybór treści" className="tabbedContentTabs" role="tablist">
          {tabs.map((tab, tabIndex) => {
            const tabID = `${componentID}-${tab.id}-${tabIndex}`
            return (
              <button
                aria-controls={`${tabID}-panel`}
                aria-selected={activeTabIndex === tabIndex}
                id={`${tabID}-tab`}
                key={tab.id || tabIndex}
                onClick={() => selectTab(tabIndex)}
                onKeyDown={(event) => handleTabKeyDown(event, tabIndex)}
                ref={(element) => {
                  tabButtons.current[tabIndex] = element
                }}
                role="tab"
                tabIndex={activeTabIndex === tabIndex ? 0 : -1}
                type="button"
              >
                {tab.label}
              </button>
            )
          })}
        </div>
        {headerRight ? (
          <nav aria-label="Menu po prawej stronie zakładek" className="tabbedContentHeaderMenu">
            {headerRight}
          </nav>
        ) : (
          <span aria-hidden="true" className="tabbedContentHeaderSpacer" />
        )}
      </header>

      <div className="tabbedContentPanels">
        {tabs.map((tab, tabIndex) => {
          const tabID = `${componentID}-${tab.id}-${tabIndex}`
          return (
            <div
              aria-labelledby={`${tabID}-tab`}
              className="tabbedContentPanel"
              hidden={activeTabIndex !== tabIndex}
              id={`${tabID}-panel`}
              key={tab.id || tabIndex}
              role="tabpanel"
              tabIndex={0}
            >
              <div className="tabbedContentPanelInner">{tab.content}</div>
            </div>
          )
        })}
      </div>

      {footer ? (
        <footer className={`tabbedContentFooter tabbedContentFooter--align-${footerAlignment}`}>
          {footer}
        </footer>
      ) : null}
    </section>
  )
}
