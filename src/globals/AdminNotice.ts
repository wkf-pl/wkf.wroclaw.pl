import { ValidationError, type DateField, type GlobalConfig } from 'payload'

import { createBooleanSwitchAdmin } from '@/components/admin/boolean-switch-config'
import { getActiveAdminNotice, parseNoticeTimestamp } from '@/modules/admin-notice/schedule'
import { WARSAW_TIME_ZONE } from '@/modules/events/constants'
import { clientUserHasRole } from '@/modules/membership/permission-resolution'
import { isAdministrator } from '@/modules/membership/role-access'
import { administratorRoleKey } from '@/modules/membership/role-configuration'

const slug = 'admin-notice'
const responseHeaders = { 'Cache-Control': 'private, no-store' }
const dateAdmin: DateField['admin'] = {
  date: {
    displayFormat: 'd MMMM yyyy, HH:mm',
    pickerAppearance: 'dayAndTime',
    timeFormat: 'HH:mm',
  },
  width: '50%',
}
const timezone: DateField['timezone'] = {
  defaultTimezone: WARSAW_TIME_ZONE,
  required: true,
  supportedTimezones: [{ label: 'Czas polski', value: WARSAW_TIME_ZONE }],
}

export const AdminNotice: GlobalConfig = {
  slug,
  label: 'Powiadomienie administracyjne',
  admin: {
    group: 'Administracja',
    hidden: ({ user }) => !clientUserHasRole(user, administratorRoleKey),
  },
  access: {
    read: ({ req }) => isAdministrator(req),
    update: ({ req }) => isAdministrator(req),
  },
  endpoints: [
    {
      method: 'get',
      path: '/active',
      handler: async (req) => {
        if (!req.user) {
          return new Response(null, { headers: responseHeaders, status: 401 })
        }

        // The full settings are restricted to administrators. Expose only the current notice.
        const settings = await req.payload.findGlobal({
          slug,
          depth: 0,
          overrideAccess: true,
          req,
          select: { enabled: true, message: true, startsAt: true, endsAt: true },
        })
        return Response.json(getActiveAdminNotice(settings, Date.now()), {
          headers: responseHeaders,
        })
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data, originalDoc, req }) => {
        if (typeof data.message === 'string') data.message = data.message.trim()
        if (!(data.enabled ?? originalDoc?.enabled)) return data

        const settings = { ...originalDoc, ...data }
        const startsAt = parseNoticeTimestamp(settings.startsAt)
        const endsAt = parseNoticeTimestamp(settings.endsAt)
        const errors = []
        if (typeof settings.message !== 'string' || !settings.message.trim()) {
          errors.push({ path: 'message', label: 'Treść', message: 'Wpisz treść powiadomienia.' })
        }
        if (!Number.isFinite(startsAt)) {
          errors.push({
            path: 'startsAt',
            label: 'Widoczne od',
            message: 'Podaj poprawną datę i godzinę rozpoczęcia.',
          })
        }
        if (!Number.isFinite(endsAt)) {
          errors.push({
            path: 'endsAt',
            label: 'Widoczne do',
            message: 'Podaj poprawną datę i godzinę zakończenia.',
          })
        } else if (endsAt <= startsAt) {
          errors.push({
            path: 'endsAt',
            label: 'Widoczne do',
            message: 'Zakończenie musi nastąpić po rozpoczęciu.',
          })
        }
        if (errors.length) throw new ValidationError({ global: slug, errors, req }, req.t)
        return data
      },
    ],
  },
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      label: 'Włączone',
      defaultValue: false,
      admin: createBooleanSwitchAdmin(),
    },
    { name: 'message', type: 'textarea', label: 'Treść' },
    {
      type: 'row',
      fields: [
        { name: 'startsAt', type: 'date', label: 'Widoczne od', admin: dateAdmin, timezone },
        { name: 'endsAt', type: 'date', label: 'Widoczne do', admin: dateAdmin, timezone },
      ],
    },
  ],
}
