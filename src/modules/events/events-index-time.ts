import type { Where } from 'payload'

import type { ListingEventTimeValue } from '@/modules/content/listing-conditions'

export function createEventTimeWhere(
  period: ListingEventTimeValue,
  now: Date,
  { start = 'startAt', end = 'endAt' } = {},
): Where {
  const comparison = {
    [period === 'upcoming' ? 'greater_than_equal' : 'less_than']: now.toISOString(),
  }

  return {
    or: [{ [end]: comparison }, { and: [{ [end]: { exists: false } }, { [start]: comparison }] }],
  }
}
