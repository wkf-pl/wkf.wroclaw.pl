import type { SerializedLinkNode } from '@payloadcms/richtext-lexical'
import type { CollectionSlug, Field, FieldAffectingData } from 'payload'

import { getRelationshipId, type RelationshipID } from '@/lib/relationships'
import {
  buildCustomTarget,
  isCustomScheme,
  parseCustomTarget,
} from '@/modules/navigation/custom-target'
import { createLinkFields } from '@/modules/navigation/fields'

export const richTextInternalLinkCollections = [
  'pages',
  'posts',
  'events',
  'event-cycles',
  'categories',
  'tags',
  'documents',
] as const satisfies CollectionSlug[]

const publicPathPrefixes: Record<(typeof richTextInternalLinkCollections)[number], string> = {
  categories: '/category/',
  documents: '/dokumenty/',
  'event-cycles': '/events/series/',
  events: '/events/',
  pages: '/',
  posts: '/blog/',
  tags: '/tag/',
}

const internalTargetConfiguration = {
  category: { fieldName: 'category', relationTo: 'categories' },
  document: { fieldName: 'document', relationTo: 'documents' },
  event: { fieldName: 'event', relationTo: 'events' },
  eventCycle: { fieldName: 'eventCycle', relationTo: 'event-cycles' },
  page: { fieldName: 'page', relationTo: 'pages' },
  post: { fieldName: 'post', relationTo: 'posts' },
  tag: { fieldName: 'tag', relationTo: 'tags' },
} as const

export type RichTextLinkFormData = {
  [key: string]: unknown
  customAddress?: unknown
  customScheme?: unknown
  newTab?: unknown
  targetType?: unknown
}

export type RichTextLinkTechnicalValues = {
  doc: null | {
    relationTo: (typeof richTextInternalLinkCollections)[number]
    value: RelationshipID
  }
  linkType: 'custom' | 'internal'
  newTab: boolean
  url: string | undefined
}

type RichTextLinkStoredTechnicalValues = {
  doc?: null | {
    relationTo?: unknown
    value?: unknown
  }
  linkType?: unknown
  url?: unknown
}

export function createRichTextLinkFields(
  defaultFields: (Field | FieldAffectingData)[],
): (Field | FieldAffectingData)[] {
  const textFields = defaultFields.filter((field) => 'name' in field && field.name === 'text')

  return [
    ...textFields,
    ...createLinkFields({
      includeLabel: false,
      includePartner: false,
      openInNewTabFieldName: 'newTab',
    }),
    {
      name: 'linkType',
      type: 'select',
      admin: { hidden: true },
      defaultValue: 'custom',
      options: ['custom', 'internal'],
    },
    {
      name: 'doc',
      type: 'relationship',
      admin: { hidden: true },
      maxDepth: 1,
      relationTo: [...richTextInternalLinkCollections],
    },
    {
      name: 'url',
      type: 'text',
      admin: { hidden: true },
      defaultValue: '',
    },
    {
      name: 'richTextLinkSync',
      type: 'ui',
      admin: {
        components: {
          Field: '/components/admin/RichTextLinkSync#RichTextLinkSync',
        },
      },
    },
  ]
}

export function getRichTextLinkTechnicalValues(
  data: RichTextLinkFormData,
): RichTextLinkTechnicalValues {
  if (data.targetType === 'custom') {
    const url =
      isCustomScheme(data.customScheme) && typeof data.customAddress === 'string'
        ? (buildCustomTarget(data.customScheme, data.customAddress) ?? undefined)
        : undefined

    return {
      doc: null,
      linkType: 'custom',
      newTab: data.newTab === true,
      url,
    }
  }

  if (isInternalTarget(data.targetType)) {
    const target = internalTargetConfiguration[data.targetType]
    const value = getRelationshipId(data[target.fieldName])

    return {
      doc: value === undefined ? null : { relationTo: target.relationTo, value },
      linkType: 'internal',
      newTab: data.newTab === true,
      url: undefined,
    }
  }

  return {
    doc: null,
    linkType: 'custom',
    newTab: data.newTab === true,
    url: undefined,
  }
}

export function getRichTextLinkVisibleValues(
  data: RichTextLinkStoredTechnicalValues,
): RichTextLinkFormData | null {
  if (data.linkType === 'internal' && data.doc && typeof data.doc.relationTo === 'string') {
    const targetEntry = Object.entries(internalTargetConfiguration).find(
      ([, configuration]) => configuration.relationTo === data.doc?.relationTo,
    )
    const value = getRelationshipId(data.doc.value)

    if (targetEntry && value !== undefined) {
      const [targetType, configuration] = targetEntry

      return {
        [configuration.fieldName]: value,
        targetType,
      }
    }
  }

  if (data.linkType === 'custom' && typeof data.url === 'string') {
    const parsedTarget = parseCustomTarget(data.url)

    if (parsedTarget) {
      return {
        customAddress: parsedTarget.address,
        customScheme: parsedTarget.scheme,
        targetType: 'custom',
      }
    }
  }

  return null
}

function isInternalTarget(value: unknown): value is keyof typeof internalTargetConfiguration {
  return typeof value === 'string' && value in internalTargetConfiguration
}

export function resolveRichTextInternalLink({
  linkNode,
}: {
  linkNode: SerializedLinkNode
}): string {
  const relationship = linkNode.fields.doc
  const value = relationship?.value

  if (!relationship || !value || typeof value !== 'object') {
    return '#'
  }

  const relationTo = relationship.relationTo
  if (!isRichTextInternalLinkCollection(relationTo) || typeof value.slug !== 'string') {
    return '#'
  }

  return `${publicPathPrefixes[relationTo]}${value.slug}`
}

function isRichTextInternalLinkCollection(
  collection: string,
): collection is (typeof richTextInternalLinkCollections)[number] {
  return richTextInternalLinkCollections.some(
    (enabledCollection) => enabledCollection === collection,
  )
}
