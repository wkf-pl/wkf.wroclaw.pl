'use client'

import { ChevronIcon } from '@payloadcms/ui'
import { Fragment, useEffect, useId, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

function SidebarToggle({ container }: { container: HTMLElement }) {
  const [expanded, setExpanded] = useState(true)
  const sidebarID = useId()
  const label = expanded ? 'Zwiń prawy panel' : 'Rozwiń prawy panel'

  useEffect(() => {
    const sidebar = container.querySelector<HTMLElement>(':scope > .document-fields__sidebar')
    if (!sidebar) return
    const originalID = sidebar.id
    sidebar.id = sidebarID

    const revealInvalidFields = () => {
      if (sidebar.querySelector('.field-type.error, [aria-invalid="true"]')) setExpanded(true)
    }
    const observer = new MutationObserver(revealInvalidFields)
    observer.observe(sidebar, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['class', 'aria-invalid'],
    })
    return () => {
      observer.disconnect()
      sidebar.id = originalID
    }
  }, [container, sidebarID])

  return createPortal(
    <button
      aria-controls={sidebarID}
      aria-expanded={expanded}
      aria-label={label}
      className="wkf-document-sidebar-toggle"
      onClick={() => setExpanded(!expanded)}
      title={label}
      type="button"
    >
      <ChevronIcon direction={expanded ? 'right' : 'left'} />
    </button>,
    container,
  )
}

export function DocumentSidebarToggle({ children }: { children?: ReactNode }) {
  const [containers, setContainers] = useState<HTMLElement[]>([])

  useEffect(() => {
    // Payload mounts document fields after navigation and inside document drawers.
    const updateContainers = () => {
      const nextContainers = Array.from(
        document.querySelectorAll<HTMLElement>(
          '.document-fields--has-sidebar:not(.document-fields--force-sidebar-wrap) > .document-fields__sidebar-wrap',
        ),
      ).filter((container) =>
        container.querySelector('.document-fields__sidebar-fields > .render-fields > *'),
      )
      setContainers((previous) =>
        previous.length === nextContainers.length &&
        previous.every((container, i) => container === nextContainers[i])
          ? previous
          : nextContainers,
      )
    }
    updateContainers()
    const observer = new MutationObserver(updateContainers)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return (
    <Fragment>
      {children}
      {containers.map((container, i) => (
        <SidebarToggle container={container} key={i} />
      ))}
    </Fragment>
  )
}
