import type { Field } from 'payload'

import { createBooleanSwitchAdmin } from '@/components/admin/boolean-switch-config'
import { createLinkFields } from '@/modules/navigation/fields'

import {
  capacityModeOptions,
  eventStatusOptions,
  participationOptions,
  partnerRoleOptions,
  timeModeOptions,
} from './constants'
import { normalizeGoogleMapsEmbedField, validateGoogleMapsEmbed } from './map-embed'
import { resolveEventStatusField } from './event-status'
import { validatePostalCode, validateVenueWebsite } from './validation'

export {
  validateClockTime,
  validateDefaultEndTime,
  validatePostalCode,
  validateVenueWebsite,
} from './validation'

type CapacitySiblingData = { capacity?: unknown; capacityMode?: unknown }
type ScheduleSiblingData = { endAt?: unknown; eventStatus?: unknown; startAt?: unknown }

export function validateCapacity(
  value: unknown,
  { siblingData }: { siblingData: CapacitySiblingData },
): true | string {
  if (siblingData.capacityMode === 'unlimited' || !siblingData.capacityMode) return true
  return typeof value === 'number' && Number.isInteger(value) && value > 0
    ? true
    : 'Podaj dodatnią, całkowitą liczbę miejsc.'
}

export function validateEventEnd(
  value: unknown,
  { siblingData }: { siblingData: ScheduleSiblingData },
): true | string {
  if (!value || !siblingData.startAt) return true
  return new Date(String(value)).getTime() >= new Date(String(siblingData.startAt)).getTime()
    ? true
    : 'Koniec wydarzenia nie może poprzedzać początku.'
}

export function createLocationFields({
  compactAddressRow = false,
  prefix = '',
}: { compactAddressRow?: boolean; prefix?: string } = {}): Field[] {
  return [
    {
      type: 'row',
      fields: [
        {
          name: `${prefix}venueName`,
          type: 'text',
          admin: { width: '50%' },
          label: 'Nazwa miejsca',
        },
        {
          name: `${prefix}venueWebsite`,
          type: 'text',
          admin: {
            components: {
              Field: '/components/admin/BlurValidatedTextField#BlurValidatedTextField',
            },
            custom: { validationKind: 'venueWebsite' },
            width: '50%',
          },
          label: 'Strona WWW miejsca',
          validate: validateVenueWebsite,
        },
      ],
    },
    ...(compactAddressRow
      ? [
          {
            type: 'row' as const,
            fields: [
              {
                name: `${prefix}streetAddress`,
                type: 'text' as const,
                admin: { width: '50%' },
                label: 'Adres',
              },
              {
                name: `${prefix}postalCode`,
                type: 'text' as const,
                admin: {
                  components: {
                    Field: '/components/admin/BlurValidatedTextField#BlurValidatedTextField',
                  },
                  custom: { validationKind: 'postalCode' },
                  width: '25%',
                },
                label: 'Kod pocztowy',
                validate: validatePostalCode,
              },
              {
                name: `${prefix}city`,
                type: 'text' as const,
                admin: { width: '25%' },
                defaultValue: 'Wrocław',
                label: 'Miejscowość',
              },
            ],
          },
        ]
      : [
          {
            name: `${prefix}streetAddress`,
            type: 'text' as const,
            label: 'Ulica i numer',
          },
          {
            type: 'row' as const,
            fields: [
              {
                name: `${prefix}postalCode`,
                type: 'text' as const,
                admin: {
                  components: {
                    Field: '/components/admin/BlurValidatedTextField#BlurValidatedTextField',
                  },
                  custom: { validationKind: 'postalCode' },
                  width: '25%',
                },
                label: 'Kod pocztowy',
                validate: validatePostalCode,
              },
              {
                name: `${prefix}city`,
                type: 'text' as const,
                admin: { width: '75%' },
                defaultValue: 'Wrocław',
                label: 'Miejscowość',
              },
            ],
          },
        ]),
    {
      name: `${prefix}mapEmbedURL`,
      type: 'text',
      admin: {
        components: { Field: '/components/admin/GoogleMapEmbedField#GoogleMapEmbedField' },
        description:
          'W Mapach Google wybierz „Udostępnij → Umieść mapę” i wklej skopiowany kod HTML.',
      },
      hooks: { beforeValidate: [normalizeGoogleMapsEmbedField] },
      label: 'Mapa Google',
      validate: validateGoogleMapsEmbed,
    },
    {
      name: `${prefix}country`,
      type: 'text',
      admin: { hidden: true, readOnly: true },
      defaultValue: 'Polska',
      label: 'Kraj',
      required: true,
    },
  ]
}

export function createParticipationFields({ prefix = '' }: { prefix?: string } = {}): Field[] {
  return [
    {
      type: 'row',
      fields: [
        {
          name: `${prefix}participation`,
          type: 'select',
          admin: { isClearable: false, width: '50%' },
          defaultValue: 'public',
          label: 'Uczestnictwo',
          options: [...participationOptions],
          required: true,
        },
        {
          name: `${prefix}capacityMode`,
          type: 'select',
          admin: { isClearable: false, width: '25%' },
          defaultValue: 'unlimited',
          label: 'Liczba miejsc',
          options: [...capacityModeOptions],
          required: true,
        },
        {
          name: `${prefix}capacity`,
          type: 'number',
          admin: {
            condition: (_data, siblingData) => siblingData[`${prefix}capacityMode`] !== 'unlimited',
            width: '25%',
          },
          label: 'Miejsca',
          min: 1,
          validate: validateCapacity,
        },
      ],
    },
  ]
}

export function createOrganizerField({ name = 'organizers' }: { name?: string } = {}): Field {
  return {
    name,
    type: 'array',
    admin: {
      components: {
        RowLabel: '/components/admin/EventRelationshipRowLabel#EventOrganizerRowLabel',
      },
      initCollapsed: false,
    },
    fields: [
      {
        name: 'profile',
        type: 'relationship',
        filterOptions: { _status: { equals: 'published' } },
        label: 'Wizytówka',
        relationTo: 'member-profiles',
        required: true,
      },
      {
        name: 'role',
        type: 'text',
        label: 'Funkcja',
        maxLength: 160,
      },
      { name: 'responsibilities', type: 'textarea', label: 'Odpowiedzialności', maxLength: 800 },
      { name: 'contactFor', type: 'text', label: 'Kontakt w sprawie', maxLength: 240 },
      {
        name: 'showContactChannels',
        type: 'checkbox',
        admin: createBooleanSwitchAdmin({
          falseLabel: 'Wyłączone',
          trueLabel: 'Włączone',
        }),
        defaultValue: false,
        label: 'Publiczne kanały kontaktu z Wizytówki',
      },
    ],
    label: 'Organizatorzy',
    labels: { plural: 'Organizatorzy', singular: 'Organizatora' },
  }
}

export function createPartnersField({ name = 'partners' }: { name?: string } = {}): Field {
  return {
    name,
    type: 'array',
    admin: {
      components: {
        RowLabel: '/components/admin/EventRelationshipRowLabel#EventPartnerRowLabel',
      },
      initCollapsed: false,
    },
    fields: [
      {
        name: 'partner',
        type: 'relationship',
        filterOptions: { _status: { equals: 'published' } },
        label: 'Partner',
        relationTo: 'partners',
        required: true,
      },
      {
        name: 'roles',
        type: 'select',
        hasMany: true,
        label: 'Role',
        options: [...partnerRoleOptions],
        required: true,
      },
      { name: 'contribution', type: 'textarea', label: 'Opis wkładu', maxLength: 800 },
    ],
    label: 'Partnerzy',
    labels: { plural: 'Partnerzy', singular: 'Partnera' },
  }
}

export function createExternalLinksField({
  name = 'externalLinks',
}: { name?: string } = {}): Field {
  return {
    name,
    type: 'array',
    admin: {
      components: { RowLabel: '/components/admin/DynamicRowLabel#EventLinkRowLabel' },
      initCollapsed: false,
    },
    fields: createLinkFields({ compactDatabaseNames: true }),
    label: 'Linki',
    labels: { plural: 'Linki', singular: 'Link' },
  }
}

export function createScheduleFields(): Field[] {
  return [
    {
      name: 'timeMode',
      type: 'select',
      admin: { hidden: true },
      defaultValue: 'timed',
      label: 'Sposób podania czasu',
      options: [...timeModeOptions],
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'startAt',
          type: 'date',
          admin: {
            date: {
              displayFormat: 'd MMMM yyyy, HH:mm',
              pickerAppearance: 'dayAndTime',
              timeFormat: 'HH:mm',
            },
            width: '33.333%',
          },
          index: true,
          label: 'Początek',
          required: true,
        },
        {
          name: 'endAt',
          type: 'date',
          admin: {
            date: {
              displayFormat: 'd MMMM yyyy, HH:mm',
              pickerAppearance: 'dayAndTime',
              timeFormat: 'HH:mm',
            },
            width: '33.333%',
          },
          index: true,
          label: 'Koniec',
          validate: validateEventEnd,
        },
        {
          name: 'eventStatus',
          type: 'select',
          admin: { isClearable: false, width: '33.333%' },
          defaultValue: 'scheduled',
          hooks: {
            afterRead: [resolveEventStatusField],
            beforeChange: [resolveEventStatusField],
          },
          label: 'Stan wydarzenia',
          options: [...eventStatusOptions],
          required: true,
        },
      ],
    },
  ]
}
