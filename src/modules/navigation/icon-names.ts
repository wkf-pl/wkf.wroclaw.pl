export const systemIconNames = [
  'book',
  'calendar',
  'collection',
  'dice',
  'discord',
  'facebook',
  'instagram',
  'location',
  'mail',
  'pawn',
  'review',
  'slack',
  'star',
  'time',
  'users',
] as const

export type SystemIconName = (typeof systemIconNames)[number]

export function isSystemIconName(value: unknown): value is SystemIconName {
  return typeof value === 'string' && systemIconNames.some((iconName) => iconName === value)
}
