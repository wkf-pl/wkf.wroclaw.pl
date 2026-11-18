import { createBooleanSwitchAdmin } from '@/components/admin/boolean-switch-config'
import { APIError, type CollectionBeforeChangeHook, type Field } from 'payload'

export function createLegacyLocationFields(): Field[] {
  return [
    {
      name: 'legacyLocation',
      type: 'json',
      label: 'Archiwalne dane miejsca',
      access: { read: ({ req }) => Boolean(req.user) },
      admin: {
        readOnly: true,
        condition: (_data, siblingData) => Boolean(siblingData.legacyLocation),
      },
    },
    {
      name: 'confirmedMissingLocation',
      type: 'checkbox',
      label: 'Pozostaw wydarzenie bez miejsca fizycznego',
      admin: {
        ...createBooleanSwitchAdmin(),
        condition: (_data, siblingData) =>
          Boolean(siblingData.legacyLocation && !siblingData.location),
      },
    },
  ]
}

export const confirmLegacyLocation: CollectionBeforeChangeHook = ({
  collection,
  data,
  originalDoc,
  req,
}) => {
  const group = collection.slug === 'event-cycles' ? data.eventDefaults : data
  const previous = collection.slug === 'event-cycles' ? originalDoc?.eventDefaults : originalDoc
  const merged = { ...previous, ...group }
  if (
    data._status === 'published' &&
    !(req.context.isRestoringVersion && req.query?.draft === 'true') &&
    merged.legacyLocation &&
    !merged.location &&
    !merged.confirmedMissingLocation
  ) {
    throw new APIError(
      'Przywróć wersję jako szkic. Wybierz Miejsce lub potwierdź pozostawienie pustego pola przed publikacją.',
      400,
    )
  }
  return data
}
