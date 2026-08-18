export const WARSAW_TIME_ZONE = 'Europe/Warsaw'

export const eventStatusOptions = [
  { label: 'Zaplanowane', value: 'scheduled' },
  { label: 'Odwołane', value: 'cancelled' },
  { label: 'Przełożone — nowy termin nieznany', value: 'postponed' },
  { label: 'Przeniesione na nowy termin', value: 'rescheduled' },
] as const

export const timeModeOptions = [
  { label: 'Określone godziny', value: 'timed' },
  { label: 'Cały dzień', value: 'allDay' },
] as const

export const participationOptions = [
  { label: 'Publiczne', value: 'public' },
  { label: 'Dla klubowiczów', value: 'members' },
] as const

export const visibilityOptions = [
  { label: 'Publiczna', value: 'public' },
  { label: 'Tylko dla klubowiczów', value: 'members' },
] as const

export const capacityModeOptions = [
  { label: 'Bez limitu', value: 'unlimited' },
  { label: 'Dokładna liczba miejsc', value: 'exact' },
  { label: 'Około', value: 'approximate' },
] as const

export const partnerRoleOptions = [
  { label: 'Współorganizator', value: 'coOrganizer' },
  { label: 'Sponsor', value: 'sponsor' },
  { label: 'Partner', value: 'partner' },
  { label: 'Patron', value: 'patron' },
  { label: 'Gospodarz miejsca', value: 'venueHost' },
  { label: 'Wsparcie', value: 'support' },
] as const

export const externalLinkTypeOptions = [
  { label: 'Strona wydarzenia', value: 'eventPage' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'Inny link', value: 'other' },
] as const
