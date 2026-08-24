import {
  APIError,
  type CollectionBeforeDeleteHook,
  type CollectionBeforeValidateHook,
  type Field,
} from 'payload'
import { createBreadcrumbsField } from '@payloadcms/plugin-nested-docs'
import type { GenerateLabel, GenerateURL } from '@payloadcms/plugin-nested-docs/types'

import { getRelationshipId, type RelationshipReference } from '@/lib/relationships'

type HierarchyBreadcrumb = {
  label?: unknown
}

type HierarchyDocument = {
  breadcrumbs?: HierarchyBreadcrumb[] | null
  fullTitle?: string | null
  id?: number | string
  name?: string | null
  parent?: RelationshipReference
  title?: string | null
}

export function createHierarchyDisplayFields(collectionSlug: 'categories' | 'pages'): Field[] {
  return [
    createBreadcrumbsField(collectionSlug, {
      admin: { hidden: true, readOnly: true },
    }),
    {
      name: 'hierarchyPath',
      type: 'ui',
      admin: {
        components: {
          Field: '/components/admin/HierarchyPath#HierarchyPath',
        },
        position: 'sidebar',
      },
      label: 'Ścieżka nawigacji',
    },
  ]
}

export const generateHierarchyLabel: GenerateLabel = (_documents, document, collection) => {
  const labelField = collection.slug === 'categories' ? 'name' : 'title'
  const label = document[labelField]
  return typeof label === 'string' ? label : ''
}

export const generateHierarchyURL: GenerateURL = (_documents, document, collection) => {
  const slug = typeof document.slug === 'string' ? document.slug : ''
  return collection.slug === 'categories' ? `/category/${slug}` : `/${slug}`
}

export const populateHierarchyFullTitle = ({ data }: { data: HierarchyDocument }) => {
  const labels = data.breadcrumbs?.flatMap((breadcrumb) =>
    typeof breadcrumb.label === 'string' && breadcrumb.label.trim()
      ? [breadcrumb.label.trim()]
      : [],
  )
  const fallbackTitle = data.title?.trim() || data.name?.trim() || ''

  return {
    ...data,
    fullTitle: labels?.length ? labels.join(' › ') : fallbackTitle,
  }
}

export const validateHierarchy: CollectionBeforeValidateHook = async ({
  collection,
  data,
  originalDoc,
  req,
}) => {
  if (!data) return data

  const currentDocumentId = getRelationshipId(originalDoc?.id)
  let parentId = getRelationshipId(data.parent as RelationshipReference)
  const visitedDocumentIds = new Set<number | string>()

  while (parentId !== undefined) {
    if (parentId === currentDocumentId || visitedDocumentIds.has(parentId)) {
      throw new APIError('Wybrany element nadrzędny tworzyłby cykl w hierarchii.', 400)
    }

    visitedDocumentIds.add(parentId)
    const parentDocument = await req.payload.findByID({
      collection: collection.slug,
      depth: 0,
      id: parentId,
      overrideAccess: true,
      req,
    })
    parentId = getRelationshipId(
      'parent' in parentDocument ? (parentDocument.parent as RelationshipReference) : undefined,
    )
  }

  return data
}

export const preventDeletingCategoryWithChildren: CollectionBeforeDeleteHook = async ({
  id,
  req,
}) => {
  const children = await req.payload.count({
    collection: 'categories',
    overrideAccess: true,
    req,
    where: { parent: { equals: id } },
  })

  if (children.totalDocs > 0) {
    throw new APIError(
      'Nie można usunąć kategorii mającej podkategorie. Najpierw przenieś lub usuń podkategorie.',
      400,
    )
  }
}
