'use client'

import { Button, useConfig, useDocumentInfo } from '@payloadcms/ui'
import { formatAdminURL } from 'payload/shared'
import { useEffect, useState } from 'react'

import { isListingSource, listingSourceSingularLabels } from '@/modules/content/listing-conditions'
import type { ListingUse, ListingViewUsageResult } from '@/modules/content/listing-view-usage'

import styles from './ListingViewField.module.css'

const regions: Record<string, string> = {
  layout: 'Treść',
  content: 'Treść',
  hero: 'Nagłówek',
  informationPanel: 'Panel informacyjny',
  eventDefaults: 'Domyślne dane wydarzenia',
}
const containers: Record<string, string> = { sections: 'Sekcja', columns: 'Kolumna', tabs: 'Karta' }

function formatBlockLocation({ path, pathNames }: ListingUse): string {
  const segments = path.split('.')
  const parts: string[] = []
  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index]
    if (regions[segment]) parts.push(regions[segment])
    if (/^\d+$/.test(segments[index + 1] ?? '')) {
      const label = containers[segment] ?? (index + 2 === segments.length ? 'Listing' : 'Blok')
      const name = pathNames?.[index + 1]
      parts.push(`${label} ${name ? `"${name}"` : Number(segments[index + 1]) + 1}`)
      index += 1
    }
  }
  return parts.join(' › ')
}

function usageLabel({ collection }: ListingUse) {
  if (isListingSource(collection)) return listingSourceSingularLabels[collection]
  return collection === 'page-templates' ? 'Szablon strony' : 'Strona główna'
}

async function loadUsage(endpoint: string, signal?: AbortSignal): Promise<ListingViewUsageResult> {
  const response = await fetch(endpoint, { signal })
  if (!response.ok) throw new Error('Nie udało się pobrać listy użyć.')
  return (await response.json()) as ListingViewUsageResult
}

export function ListingViewUsage() {
  const { id } = useDocumentInfo()
  const {
    config: {
      routes: { admin, api },
      serverURL,
    },
  } = useConfig()
  const [state, setState] = useState<ListingViewUsageResult>()
  const [selected, setSelected] = useState<string[]>([])
  const [target, setTarget] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string>()
  const [notice, setNotice] = useState<string>()
  const endpoint = id
    ? formatAdminURL({ apiRoute: api, path: `/listing-views/${id}/usage`, serverURL })
    : undefined
  useEffect(() => {
    if (!endpoint) return
    const controller = new AbortController()
    loadUsage(endpoint, controller.signal)
      .then((usage) => {
        if (!controller.signal.aborted) setState(usage)
      })
      .catch(() => {
        if (!controller.signal.aborted) setError('Nie udało się pobrać listy użyć.')
      })
    return () => controller.abort()
  }, [endpoint])

  if (!endpoint) return null
  const uses = state?.uses ?? []
  const allSelected = uses.length > 0 && selected.length === uses.length

  async function submitReassignment() {
    if (!endpoint || pending || !target || !selected.length) return
    setPending(true)
    setError(undefined)
    setNotice(undefined)
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keys: selected,
          target: target === 'detach' ? null : Number(target),
        }),
      })
      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as {
          errors?: { message?: string }[]
        } | null
        throw new Error(result?.errors?.[0]?.message ?? 'Nie udało się zmienić szablonu.')
      }
      setNotice(`Zaktualizowano listingi (${selected.length}).`)
      setSelected([])
      setTarget('')
      setState(await loadUsage(endpoint))
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Nie udało się zmienić szablonu.')
    } finally {
      setPending(false)
    }
  }

  return (
    <section className={styles.usage}>
      <h3>Użycie szablonu</h3>
      {error ? <p role="alert">{error}</p> : null}
      {notice ? <p role="status">{notice}</p> : null}
      {!state && !error ? <p role="status">Sprawdzanie użycia…</p> : null}
      {state && uses.length === 0 ? <p>Brak użyć w treściach i aktualnych szkicach.</p> : null}
      {uses.length > 0 ? (
        <>
          <div className={styles.usageActions}>
            <label>
              Zmień szablon na
              <select
                value={target}
                onChange={({ target }) => setTarget(target.value)}
                disabled={pending}
              >
                <option value="" disabled>
                  Wybierz szablon
                </option>
                <option value="detach">{'<brak>'}</option>
                {state?.templates.map(({ id, name, published }) => (
                  <option key={id} value={id} disabled={!published}>
                    {name}
                    {published ? '' : ' (szkic)'}
                  </option>
                ))}
              </select>
            </label>
            <Button
              type="button"
              size="small"
              margin={false}
              disabled={pending || !selected.length || !target}
              onClick={submitReassignment}
            >
              Zastosuj do zaznaczonych ({selected.length})
            </Button>
          </div>
          {target === 'detach' ? (
            <p>Odłączenie zachowa aktualne ustawienia każdego Listingu.</p>
          ) : null}
          <div className={styles.usageTableWrap}>
            <table className={styles.usageTable} aria-label="Użycie szablonu">
              <thead>
                <tr>
                  <th scope="col">
                    <input
                      type="checkbox"
                      aria-label="Zaznacz wszystkie użycia"
                      checked={allSelected}
                      disabled={pending}
                      ref={(input) => {
                        if (input) input.indeterminate = selected.length > 0 && !allSelected
                      }}
                      onChange={({ target }) =>
                        setSelected(target.checked ? uses.map(({ key }) => key) : [])
                      }
                    />
                  </th>
                  <th scope="col">Typ</th>
                  <th scope="col">Treść</th>
                  <th scope="col">Miejsce w treści</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {uses.map((use) => {
                  const { collection, id: documentID, inTrash, key, title, status } = use
                  const location = formatBlockLocation(use)
                  return (
                    <tr key={key}>
                      <td>
                        <input
                          type="checkbox"
                          aria-label={`Zaznacz: ${title}, ${location}, ${status === 'published' ? 'opublikowano' : 'szkic'}`}
                          checked={selected.includes(key)}
                          disabled={pending}
                          onChange={({ target }) => {
                            const checked = target.checked
                            setSelected((current) =>
                              checked ? [...current, key] : current.filter((id) => id !== key),
                            )
                          }}
                        />
                      </td>
                      <td>{usageLabel(use)}</td>
                      <td>
                        <a
                          href={formatAdminURL({
                            adminRoute: admin,
                            path: documentID
                              ? `/collections/${collection}${inTrash ? '/trash' : ''}/${documentID}`
                              : `/globals/${collection}`,
                          })}
                        >
                          {title}
                        </a>
                      </td>
                      <td>{location}</td>
                      <td>
                        {inTrash ? 'W koszu · ' : ''}
                        {status === 'published' ? 'Opublikowano' : 'Szkic'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </section>
  )
}
