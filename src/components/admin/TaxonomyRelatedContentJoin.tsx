'use client'

import { RelationshipTable, useDocumentInfo, useField } from '@payloadcms/ui'
import type { CollectionSlug, JoinFieldClient, PaginatedDocs, Where } from 'payload'

type TaxonomyRelatedContentJoinProperties = {
  field: JoinFieldClient
  path: string
}

export function TaxonomyRelatedContentJoin({ field, path }: TaxonomyRelatedContentJoinProperties) {
  const { id: documentID, docConfig } = useDocumentInfo()
  const { value } = useField<PaginatedDocs>({ potentiallyStalePath: path })

  if (!docConfig) {
    return null
  }

  const label = typeof field.label === 'string' ? field.label : field.name

  const filterOptions: Where | null =
    documentID === undefined
      ? null
      : {
          [field.on]: {
            equals: documentID,
          },
        }

  return (
    <section className="wkf-taxonomy-related-content">
      <RelationshipTable
        allowCreate={field.admin?.allowCreate === false ? false : true}
        disableTable={filterOptions === null}
        field={field}
        fieldPath={path}
        filterOptions={filterOptions ?? undefined}
        initialData={value ?? { docs: [] }}
        initialDrawerData={
          documentID === undefined
            ? undefined
            : {
                [field.on]: [documentID],
              }
        }
        Label={<h3 className="wkf-taxonomy-related-content__heading">{label}</h3>}
        parent={
          documentID === undefined
            ? undefined
            : {
                collectionSlug: docConfig.slug as CollectionSlug,
                id: documentID,
                joinPath: path,
              }
        }
        relationTo={field.collection}
      />
    </section>
  )
}
