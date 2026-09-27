export const eventTypeIconColors = [
  { label: 'Bursztynowy', value: 'lantern-glow' },
  { label: 'Srebrny', value: 'mist-silver' },
  { label: 'Kość słoniowa', value: 'parchment-ivory' },
] as const

export type EventTypeIconColor = (typeof eventTypeIconColors)[number]['value']

export function isEventTypeIconColor(value: unknown): value is EventTypeIconColor {
  return eventTypeIconColors.some((option) => option.value === value)
}
