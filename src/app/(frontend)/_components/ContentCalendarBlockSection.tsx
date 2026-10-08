import type { ContentCalendarBlock } from '@/payload-types'
import { getRelationshipId } from '@/lib/relationships'
import { findContentCalendarMonth } from '@/modules/content/content-calendar-data'
import {
  createContentCalendarEndpoint,
  normalizeContentCalendarSources,
  type ContentCalendarSource,
} from '@/modules/content/content-calendar-presentation'
import { getWarsawCalendarMonth } from '@/modules/events/calendar-presentation'

import { ContentCalendar } from './EventCalendar'

export async function ContentCalendarBlockSection({ block }: { block: ContentCalendarBlock }) {
  const sources = normalizeContentCalendarSources(block.sources ?? [])
  const filters = {
    categoryId: getRelationshipId(block.category),
    eventCycleId: getRelationshipId(block.eventCycle),
    sources: sources.length ? sources : (['events', 'posts'] satisfies ContentCalendarSource[]),
    tagId: getRelationshipId(block.tag),
  }
  const initialMonth = getWarsawCalendarMonth()
  const initialData = await findContentCalendarMonth(initialMonth, filters)

  return (
    <ContentCalendar
      endpoint={createContentCalendarEndpoint(filters)}
      fallbackURL={getFallbackURL(filters.sources)}
      initialData={initialData}
      initialMonth={initialMonth}
      subscriptionURL={filters.sources.includes('events') ? '/events/calendar.ics' : undefined}
    />
  )
}

function getFallbackURL(sources: ContentCalendarSource[]): string | undefined {
  if (sources.length !== 1) return undefined
  return sources[0] === 'events' ? '/events' : '/blog'
}
