import { sql } from '@payloadcms/db-postgres'
import { APIError, type CollectionConfig } from 'payload'

import {
  invalidateListingsAfterChange,
  invalidateListingsAfterDelete,
} from '@/modules/cache/invalidate-public-data'
import { getTransactionExecutor } from '@/modules/content/lock-content-author'
import { populateSlugFromName } from '@/modules/content/slug'
import { createRolePermissionAccess } from '@/modules/membership/role-access'

async function tagGroupExecutor(req: import('payload').PayloadRequest) {
  return (await req.transactionID)
    ? getTransactionExecutor(req)
    : req.payload.db.drizzle.execute.bind(req.payload.db.drizzle)
}

const listingOwners = [
  'page_templates',
  'pages',
  'posts',
  'events',
  'event_cycles',
  'partners',
  'homepage_sections',
]

export const TagGroups: CollectionConfig = {
  slug: 'tag-groups',
  access: {
    create: createRolePermissionAccess({ operation: 'create', resource: 'tags' }),
    delete: createRolePermissionAccess({ operation: 'delete', resource: 'tags' }),
    read: createRolePermissionAccess({
      anonymousAccess: true,
      operation: 'read',
      resource: 'tags',
    }),
    update: createRolePermissionAccess({ operation: 'update', resource: 'tags' }),
  },
  admin: { group: 'Treści', useAsTitle: 'name' },
  labels: { singular: 'Grupa tagów', plural: 'Grupy tagów' },
  fields: [
    { name: 'name', type: 'text', label: 'Nazwa', required: true },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug',
      required: true,
      unique: true,
      hooks: { beforeValidate: [populateSlugFromName] },
    },
  ],
  hooks: {
    beforeDelete: [
      async ({ id, req }) => {
        const execute = await tagGroupExecutor(req)
        const usesGroup = sql`tag_groups_id = ${id} AND path ~ '(^|[.])(filterTagGroups|relationshipValue)$'`
        const queries = listingOwners.flatMap((owner) => {
          const versions = sql.identifier(`_${owner}_v`)
          return [
            sql`SELECT 1 FROM ${sql.identifier(`${owner}_rels`)} WHERE ${usesGroup}`,
            sql`SELECT 1 FROM ${sql.identifier(`_${owner}_v_rels`)} relationship
                JOIN ${versions} version ON relationship.parent_id = version.id
                WHERE version.latest AND ${usesGroup}`,
          ]
        })
        const result = await execute(sql`${sql.join(queries, sql` UNION ALL `)} LIMIT 1`)
        if (result.rows.length) {
          throw new APIError('Najpierw usuń odwołania do tej grupy z konfiguracji Listingów.', 400)
        }
        await execute(sql`UPDATE tags SET display_name = name WHERE group_id = ${id}`)
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        if (doc.name !== previousDoc?.name) {
          const execute = await tagGroupExecutor(req)
          await execute(
            sql`UPDATE tags SET display_name = ${doc.name} || ' › ' || name WHERE group_id = ${doc.id}`,
          )
        }
        return doc
      },
      invalidateListingsAfterChange,
    ],
    afterDelete: [invalidateListingsAfterDelete],
  },
}
