'use client'

import { useAllFormFields, useConfig, useField, useForm } from '@payloadcms/ui'
import type { JSONFieldClientProps } from 'payload'
import { formatAdminURL } from 'payload/shared'
import { useEffect, useId, useState } from 'react'

import { ConfiguredContentList } from '@/app/(frontend)/_components/ConfiguredContentList'
import type { ContentListingPresentation } from '@/modules/content/content-listing-presentation'
import {
  listingForms,
  listingInformation,
  listingPresets,
  parseListingAppearance,
  resolveListingView,
  type ListingView,
  type ListingViewOverrides,
} from '@/modules/content/listing-view'
import type { ListingView as SharedView } from '@/payload-types'

import styles from './ListingViewField.module.css'

const layoutLabels = { static: 'Statyczne', carousel: 'Karuzela' }
const dateLabels = { short: 'Krótka data', full: 'Pełny termin' }
const informationKeys = Object.keys(listingInformation) as (keyof typeof listingInformation)[]
const previewFields = [
  'selectionMode',
  'contextRelation',
  'conditions',
  'includeInactiveLocations',
  'items',
  'pageSize',
  'sort',
  'sources',
]

type PreviewResponse = { items?: ContentListingPresentation[]; missingContext?: boolean }

function ViewSelect({
  label,
  options,
  value,
  onChange,
  inherited,
}: {
  label: string
  options: Record<string, string>
  value?: string | number
  onChange: (value: string) => void
  inherited?: string | number
}) {
  return (
    <label className={styles.control}>
      <span>{label}</span>
      <select
        aria-label={label}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
      >
        {inherited !== undefined ? (
          <option value="">Z szablonu · {options[inherited]}</option>
        ) : null}
        {Object.entries(options).map(([option, text]) => (
          <option key={option} value={option}>
            {text}
          </option>
        ))}
      </select>
    </label>
  )
}

const columnOptions = { 1: '1', 2: '2', 3: '3', 4: '4' }

function ViewDetails({
  base,
  overrides,
  onChange,
  eventFields = true,
}: {
  base?: ListingView
  overrides: ListingViewOverrides
  onChange: (value: ListingViewOverrides) => void
  eventFields?: boolean
}) {
  const view = overrides.form ?? base?.form
  return (
    <div className={styles.controls}>
      <ViewSelect
        label="Rozmieszczenie"
        options={layoutLabels}
        value={overrides.layout}
        inherited={base?.layout}
        onChange={(value) =>
          onChange({ ...overrides, layout: value ? (value as ListingView['layout']) : undefined })
        }
      />
      <ViewSelect
        label="Forma elementu"
        options={listingForms}
        value={overrides.form}
        inherited={base?.form}
        onChange={(value) =>
          onChange({ ...overrides, form: value ? (value as ListingView['form']) : undefined })
        }
      />
      <ViewSelect
        label="Format terminu wydarzenia"
        options={dateLabels}
        value={overrides.dateFormat}
        inherited={base?.dateFormat}
        onChange={(value) =>
          onChange({
            ...overrides,
            dateFormat: value ? (value as ListingView['dateFormat']) : undefined,
          })
        }
      />
      <fieldset className={styles.information}>
        <legend>Informacje na elemencie</legend>
        {informationKeys
          .filter(
            (key) =>
              (view !== 'row' || key !== 'image') &&
              (eventFields || !['venue', 'cycle', 'calendar'].includes(key)),
          )
          .map((key) => {
            const enabled = overrides.information?.[key]
            return (
              <ViewSelect
                key={key}
                label={listingInformation[key]}
                options={{ show: 'Pokaż', hide: 'Ukryj' }}
                value={enabled === undefined ? undefined : enabled ? 'show' : 'hide'}
                inherited={base ? (base.information[key] ? 'show' : 'hide') : undefined}
                onChange={(value) => {
                  const information = { ...overrides.information }
                  if (value) information[key] = value === 'show'
                  else delete information[key]
                  onChange({ ...overrides, information })
                }}
              />
            )
          })}
      </fieldset>
    </div>
  )
}

export function ListingViewTemplateField({ path, readOnly }: JSONFieldClientProps) {
  const { value, setValue } = useField<unknown>({ path })
  const { view } = resolveListingView({ overrides: value }, 'upcoming')
  return (
    <fieldset className={styles.editor} disabled={readOnly}>
      <legend>Wygląd</legend>
      <ViewSelect
        label={view.layout === 'carousel' ? 'Widoczne elementy' : 'Kolumny'}
        options={columnOptions}
        value={view.columns}
        onChange={(columns) => setValue({ ...view, columns: Number(columns) })}
      />
      <ViewDetails overrides={view} onChange={setValue} />
    </fieldset>
  )
}

export function ListingViewField({ path, readOnly }: JSONFieldClientProps) {
  const { value, setValue, showError, errorMessage } = useField<unknown>({ path })
  const [fields] = useAllFormFields()
  const { getDataByPath } = useForm()
  const {
    config: {
      routes: { api },
      serverURL,
    },
  } = useConfig()
  const parentPath = path.slice(0, path.lastIndexOf('.') + 1)
  const oldView = fields[parentPath + 'view']?.value
  const fallback =
    typeof oldView === 'string' && Object.hasOwn(listingPresets, oldView) ? oldView : 'cards'
  const { preset = fallback, overrides = {} } = parseListingAppearance(value)
  const libraryURL = formatAdminURL({ apiRoute: api, path: '/listing-views', serverURL })
  const [library, setLibrary] = useState<SharedView[]>([])
  const [libraryError, setLibraryError] = useState(false)
  const [narrow, setNarrow] = useState(false)
  const previewId = useId()
  const selection = Object.fromEntries(
    previewFields.map((name) => [
      name,
      getDataByPath(parentPath + name) ?? fields[parentPath + name]?.value,
    ]),
  )
  const previewBody = JSON.stringify({
    block: { ...selection, appearance: value, view: fallback },
    previewTarget: fields.previewTarget?.value,
  })
  const [preview, setPreview] = useState<PreviewResponse & { body: string; error?: boolean }>()
  const selected = library.find(({ id }) => preset === `shared:${id}`)
  const { view } = resolveListingView({ preset, overrides }, fallback, selected?.settings)
  const base = resolveListingView({ preset }, fallback, selected?.settings).view
  const detached = preset === 'custom'
  const sources: unknown[] = Array.isArray(selection.sources) ? selection.sources : []
  const eventFields =
    selection.selectionMode !== 'filters' || sources.length === 0 || sources.includes('events')
  const overrideCount =
    Object.keys(overrides).filter((key) => key !== 'information').length +
    Object.keys(overrides.information ?? {}).length

  useEffect(() => {
    const controller = new AbortController()
    fetch(`${libraryURL}?depth=0&pagination=false&where[_status][equals]=published`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Could not load listing views')
        const result = (await response.json()) as { docs: SharedView[] }
        setLibrary(result.docs)
      })
      .catch(() => {
        if (!controller.signal.aborted) setLibraryError(true)
      })
    return () => controller.abort()
  }, [libraryURL])

  useEffect(() => {
    const controller = new AbortController()
    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(`${libraryURL}/preview`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: previewBody,
          signal: controller.signal,
        })
        if (!response.ok) throw new Error('Could not load listing preview')
        const data = (await response.json()) as PreviewResponse
        if (!controller.signal.aborted) setPreview({ ...data, body: previewBody })
      } catch {
        if (!controller.signal.aborted) setPreview({ body: previewBody, error: true })
      }
    }, 300)
    return () => {
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [libraryURL, previewBody])

  function selectPreset(next: string) {
    const template = library.find(({ id }) => next === `shared:${id}`)
    const nextView = resolveListingView(
      { preset: next, overrides },
      fallback,
      template?.settings,
    ).view
    const nextOverrides = { ...overrides }
    if (nextView.form === 'row' && nextOverrides.information?.image !== undefined) {
      if (
        !window.confirm(
          'Widok wiersza nie obsługuje obrazu. Zmienić szablon i usunąć lokalne ustawienie obrazu?',
        )
      )
        return
      nextOverrides.information = { ...nextOverrides.information }
      delete nextOverrides.information.image
    }
    setValue({ preset: next, overrides: nextOverrides })
  }

  const presetOptions = {
    ...Object.fromEntries(Object.entries(listingPresets).map(([key, entry]) => [key, entry.label])),
    ...Object.fromEntries(
      library
        .filter((entry) => entry.retired !== true || entry.id === selected?.id)
        .map((entry) => [
          `shared:${entry.id}`,
          entry.retired ? `${entry.name} (wycofany)` : entry.name,
        ]),
    ),
    ...(detached ? { custom: 'Ustawienia własne' } : {}),
    ...(preset.startsWith('shared:') && !selected ? { [preset]: 'Zapisany szablon' } : {}),
  }

  return (
    <section className={styles.section}>
      <div className={styles.workspace}>
        <fieldset className={styles.editor} disabled={readOnly}>
          <legend>Wygląd</legend>
          <ViewSelect
            label="Szablon widoku"
            options={presetOptions}
            value={preset}
            onChange={selectPreset}
          />
          <ViewSelect
            label={view.layout === 'carousel' ? 'Widoczne elementy' : 'Kolumny'}
            options={columnOptions}
            value={overrides.columns}
            inherited={detached ? undefined : base.columns}
            onChange={(columns) =>
              setValue({
                preset,
                overrides: { ...overrides, columns: columns ? Number(columns) : undefined },
              })
            }
          />
          {libraryError ? (
            <p role="status">Biblioteka szablonów jest chwilowo niedostępna.</p>
          ) : null}
          {showError ? <p role="alert">{errorMessage}</p> : null}
          <details>
            <summary>
              Dostosuj wygląd{!detached && overrideCount > 0 ? ` · ${overrideCount}` : ''}
            </summary>
            <ViewDetails
              base={detached ? undefined : base}
              overrides={overrides}
              eventFields={eventFields}
              onChange={(settings) => setValue({ preset, overrides: settings })}
            />
            <div className={styles.actions}>
              {!detached && overrideCount > 0 ? (
                <button type="button" onClick={() => setValue({ preset })}>
                  Przywróć ustawienia szablonu
                </button>
              ) : null}
              {!detached ? (
                <button
                  type="button"
                  onClick={() => setValue({ preset: 'custom', overrides: view })}
                >
                  Odłącz od szablonu
                </button>
              ) : null}
            </div>
          </details>
        </fieldset>
        <section className={styles.preview} aria-labelledby={previewId}>
          <div className={styles.previewHeader}>
            <h4 id={previewId}>Podgląd wyników</h4>
            <div className={styles.actions} aria-label="Szerokość podglądu">
              <button aria-pressed={!narrow} type="button" onClick={() => setNarrow(false)}>
                Szeroki
              </button>
              <button aria-pressed={narrow} type="button" onClick={() => setNarrow(true)}>
                Wąski
              </button>
            </div>
          </div>
          <div
            className={narrow ? styles.narrow : undefined}
            aria-busy={preview?.body !== previewBody}
          >
            {preview?.body !== previewBody ? (
              <p role="status">Ładowanie podglądu…</p>
            ) : preview.error ? (
              <p role="alert">Nie udało się pobrać podglądu. Sprawdź ustawienia treści.</p>
            ) : preview.missingContext ? (
              <p>Wybierz w szablonie strony element do podglądu relacji.</p>
            ) : (
              <ConfiguredContentList items={preview.items ?? []} view={view} />
            )}
          </div>
        </section>
      </div>
    </section>
  )
}
