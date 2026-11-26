'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState, type ComponentProps } from 'react'

import type { ContentCalendar } from './EventCalendar'
import { useTabHasOpened } from './TabbedContentFrame'

const Calendar = dynamic(
  () => import('./EventCalendar').then(({ ContentCalendar }) => ContentCalendar),
  { loading: CalendarLoading },
)

type CalendarProperties = ComponentProps<typeof ContentCalendar>

export function LazyContentCalendar(properties: CalendarProperties) {
  const hasOpened = useTabHasOpened()
  const [renderImmediately] = useState(hasOpened)
  if (!hasOpened) return null

  return renderImmediately ? (
    <Calendar {...properties} />
  ) : (
    <CalendarAfterActivation {...properties} />
  )
}

function CalendarAfterActivation(properties: CalendarProperties) {
  const [loaded, setLoaded] = useState<
    { component: typeof ContentCalendar } | { error: unknown } | null
  >(null)

  useEffect(() => {
    let active = true

    void import('./EventCalendar').then(
      ({ ContentCalendar }) => {
        if (active) setLoaded({ component: ContentCalendar })
      },
      (error: unknown) => {
        if (active) setLoaded({ error })
      },
    )

    return () => {
      active = false
    }
  }, [])

  if (loaded && 'error' in loaded) throw loaded.error
  return loaded ? <loaded.component {...properties} /> : <CalendarLoading />
}

function CalendarLoading() {
  return <p role="status">Wczytywanie kalendarza…</p>
}
