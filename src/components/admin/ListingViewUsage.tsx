'use client'

import { useConfig, useDocumentInfo } from '@payloadcms/ui'
import { formatAdminURL } from 'payload/shared'
import { useEffect, useState } from 'react'

type Usage = { collection: string; id?: number; title: string; status: 'published' | 'draft' }

export function ListingViewUsage() {
  const { id } = useDocumentInfo()
  const {
    config: {
      routes: { admin, api },
      serverURL,
    },
  } = useConfig()
  const [state, setState] = useState<{ uses?: Usage[]; error?: boolean }>()
  const endpoint = id
    ? formatAdminURL({ apiRoute: api, path: `/listing-views/${id}/usage`, serverURL })
    : undefined
  useEffect(() => {
    if (!endpoint) return
    const controller = new AbortController()
    fetch(endpoint, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Could not load listing view usage')
        const uses = (await response.json()) as Usage[]
        if (!controller.signal.aborted) setState({ uses })
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ error: true })
      })
    return () => controller.abort()
  }, [endpoint])
  if (!endpoint) return null
  return (
    <section>
      <h3>Użycie szablonu</h3>
      <p>Publikacja zmiany zaktualizuje powiązane listy.</p>
      {state?.error ? (
        <p role="alert">Nie udało się pobrać listy użyć.</p>
      ) : state?.uses ? (
        state.uses.length === 0 ? (
          <p>Brak użyć w dostępnych dokumentach.</p>
        ) : (
          <ul>
            {state.uses.map(({ collection, id: documentID, title, status }) => (
              <li key={`${collection}-${documentID}-${status}`}>
                <a
                  href={formatAdminURL({
                    adminRoute: admin,
                    path: documentID
                      ? `/collections/${collection}/${documentID}`
                      : `/globals/${collection}`,
                  })}
                >
                  {title}
                </a>
                {' · '}
                {status === 'published' ? 'opublikowane' : 'szkic'}
              </li>
            ))}
          </ul>
        )
      ) : (
        <p role="status">Sprawdzanie użycia…</p>
      )}
    </section>
  )
}
