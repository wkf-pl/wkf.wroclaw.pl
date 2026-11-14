import type { UIFieldServerProps } from 'payload'
import { formatAdminURL } from 'payload/shared'

import { permissionResources } from '@/modules/membership/permission-resources'
import { findUserGroupAssignments } from '@/modules/membership/user-group-assignments'

export async function UserGroupAssignments({ id, req }: UIFieldServerProps) {
  if (id === undefined) return <p>Zapisz grupę, aby zobaczyć przypisane treści.</p>

  const assignments = await findUserGroupAssignments(req, id, 10)
  const { admin: adminRoute } = req.payload.config.routes
  const collectionURL = (collection: string, suffix = '') =>
    formatAdminURL({ adminRoute, path: `/collections/${collection}${suffix}` })

  const filter = new URLSearchParams({
    'where[author.value][equals]': String(id),
    'where[author.relationTo][equals]': 'user-groups',
  })

  if (assignments.every(({ totalDocs }) => totalDocs === 0)) {
    return <p>Brak przypisanych treści dostępnych dla tego konta.</p>
  }

  return (
    <section>
      <h3>Przypisane treści</h3>
      {assignments
        .filter(({ totalDocs }) => totalDocs > 0)
        .map(({ collection, docs, totalDocs }) => (
          <section key={collection}>
            <h4>
              {permissionResources[collection].label} ({totalDocs})
            </h4>
            <ul>
              {docs.map((document) => {
                const inTrash = 'deletedAt' in document && Boolean(document.deletedAt)
                const title =
                  'title' in document
                    ? document.title
                    : 'name' in document
                      ? document.name
                      : document.filename
                return (
                  <li key={document.id}>
                    <a
                      href={collectionURL(collection, `${inTrash ? '/trash' : ''}/${document.id}`)}
                    >
                      {title || `#${document.id}`}
                    </a>
                    {inTrash && ' (w koszu)'}
                  </li>
                )
              })}
            </ul>
            {totalDocs > docs.length && (
              <p>
                <a href={collectionURL(collection, `?${filter}`)}>Zobacz przypisania w kolekcji</a>
                {collection !== 'media' && (
                  <>
                    {' '}
                    ·{' '}
                    <a href={collectionURL(collection, `/trash?${filter}`)}>
                      Zobacz przypisania w koszu
                    </a>
                  </>
                )}
              </p>
            )}
          </section>
        ))}
    </section>
  )
}
