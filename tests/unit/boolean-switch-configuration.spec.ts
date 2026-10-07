import type { CheckboxField, CollectionConfig, Field, GlobalConfig } from 'payload'
import { describe, expect, it } from 'vitest'

import {
  booleanSwitchFieldComponent,
  createBooleanSwitchAdmin,
  defaultBooleanSwitchLabels,
} from '@/components/admin/boolean-switch-config'
import {
  Categories,
  ClubSections,
  ContentListingItems,
  DocumentFiles,
  Documents,
  EventCycles,
  EventTypes,
  Events,
  Media,
  MemberProfileImages,
  MemberProfiles,
  Pages,
  Partners,
  Posts,
  Roles,
  Tags,
  Users,
} from '@/collections'
import { Footer, HomepageHero, HomepageSections, Navigation, SiteSettings } from '@/globals'

const collections: CollectionConfig[] = [
  ContentListingItems,
  Pages,
  Posts,
  Events,
  EventCycles,
  EventTypes,
  Categories,
  Tags,
  Media,
  MemberProfileImages,
  MemberProfiles,
  Partners,
  DocumentFiles,
  Documents,
  Roles,
  Users,
  ClubSections,
]

const globals: GlobalConfig[] = [HomepageHero, HomepageSections, Navigation, Footer, SiteSettings]

function flattenFields(fields: Field[]): Field[] {
  return fields.flatMap((field) => {
    const nestedFields: Field[] = [field]

    if (field.type === 'tabs') {
      nestedFields.push(...field.tabs.flatMap((tab) => flattenFields(tab.fields)))
    } else if ('fields' in field && Array.isArray(field.fields)) {
      nestedFields.push(...flattenFields(field.fields))
    }

    if (field.type === 'blocks') {
      const configuredBlocks = [...(field.blocks ?? []), ...(field.blockReferences ?? [])]
      for (const block of configuredBlocks) {
        if (typeof block !== 'string') {
          nestedFields.push(...flattenFields(block.fields))
        }
      }
    }

    return nestedFields
  })
}

function isCheckboxField(field: Field): field is CheckboxField {
  return field.type === 'checkbox'
}

describe('boolean switch configuration', () => {
  it('uses Polish default labels and preserves other admin configuration', () => {
    const condition = () => true
    const admin = createBooleanSwitchAdmin({
      className: 'custom-field',
      condition,
      custom: { existing: 'value' },
      width: '50%',
    })

    expect(admin).toMatchObject({
      className: 'custom-field',
      components: { Field: booleanSwitchFieldComponent },
      condition,
      custom: {
        booleanSwitch: defaultBooleanSwitchLabels,
        existing: 'value',
      },
      width: '50%',
    })
  })

  it('assigns the switch field component to every registered checkbox', () => {
    const checkboxFields = [
      ...collections.flatMap((collection) => flattenFields(collection.fields)),
      ...globals.flatMap((global) => flattenFields(global.fields)),
    ].filter(isCheckboxField)

    expect(checkboxFields.length).toBeGreaterThan(0)
    expect(
      checkboxFields.every(
        (field) => field.admin?.components?.Field === booleanSwitchFieldComponent,
      ),
    ).toBe(true)
  })

  it('uses explicit enabled and disabled labels for public contact channels', () => {
    const checkboxFields = collections
      .flatMap((collection) => flattenFields(collection.fields))
      .filter(isCheckboxField)
    const contactChannelsFields = checkboxFields.filter(
      (field) => field.name === 'showContactChannels',
    )

    expect(contactChannelsFields.length).toBeGreaterThan(0)
    for (const field of contactChannelsFields) {
      expect(field.admin?.custom?.booleanSwitch).toEqual({
        falseLabel: 'Wyłączone',
        trueLabel: 'Włączone',
      })
    }
  })
})
