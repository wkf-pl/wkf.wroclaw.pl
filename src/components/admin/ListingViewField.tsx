'use client'

import {
  Button,
  FieldLabel,
  ReactSelect,
  useAllFormFields,
  useConfig,
  useField,
  useForm,
} from '@payloadcms/ui'
import type { JSONFieldClientProps } from 'payload'
import { formatAdminURL } from 'payload/shared'
import { useEffect, useId, useState } from 'react'

import { ListingPreviewFrame } from './ListingPreviewFrame'
import type { ResolvedContentPresentation } from '@/modules/content/content-presentation'
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
const dateLabels = { short: 'Krótka data', full: 'Pełna data' }
const informationKeys = (
  Object.keys(listingInformation) as (keyof typeof listingInformation)[]
).filter((key) => key !== 'interests')
const previewFields = [
  'frame',
  'surface',
  'surfaceImage',
  'surfaceHorizontalPosition',
  'surfaceVerticalPosition',
  'selectionMode',
  'contextRelation',
  'conditions',
  'includeInactiveLocations',
  'items',
  'pageSize',
  'sort',
  'sources',
]

type PreviewResponse = {
  items?: ContentListingPresentation[]
  missingContext?: boolean
  presentation?: ResolvedContentPresentation
}

export function ListingViewSelect({
  label,
  options,
  value,
  onChange,
  inherited,
  readOnly,
}: {
  label: string
  options: Record<string, string>
  value?: string | number
  onChange: (value: string) => void
  inherited?: string | number
  readOnly?: boolean
}) {
  const inputId = useId()
  const selectOptions = [
    ...(inherited !== undefined
      ? [{ label: `Z szablonu · ${options[inherited]}`, value: '' }]
      : []),
    ...Object.entries(options).map(([option, text]) => ({ label: text, value: option })),
  ]

  return (
    <div className={`field-type select ${styles.control}`}>
      <FieldLabel htmlFor={inputId} label={label} />
      <ReactSelect
        disabled={readOnly}
        inputId={inputId}
        isClearable={false}
        isSearchable={false}
        options={selectOptions}
        value={selectOptions.find((option) => option.value === String(value ?? ''))}
        onChange={(option) => {
          if (
            readOnly ||
            !option ||
            Array.isArray(option) ||
            typeof option !== 'object' ||
            !('value' in option)
          )
            return
          if (typeof option.value === 'string') onChange(option.value)
        }}
      />
    </div>
  )
}

const columnOptions = { 1: '1', 2: '2', 3: '3', 4: '4' }

function ViewDetails({
  base,
  overrides,
  onChange,
  columnSettings,
  readOnly,
}: {
  readOnly?: boolean
  columnSettings?: { value: number; onChange: (value: string) => void }
  base?: ListingView
  overrides: ListingViewOverrides
  onChange: (value: ListingViewOverrides) => void
}) {
  const view = overrides.form ?? base?.form
  return (
    <div className={styles.controls}>
      <div className={`${styles.detailsRow} ${columnSettings ? styles.templateDetailsRow : ''}`}>
        {columnSettings ? (
          <ListingViewSelect
            readOnly={readOnly}
            label="Kolumny"
            options={columnOptions}
            value={columnSettings.value}
            onChange={columnSettings.onChange}
          />
        ) : null}
        <ListingViewSelect
          readOnly={readOnly}
          label="Rozmieszczenie"
          options={layoutLabels}
          value={overrides.layout}
          inherited={base?.layout}
          onChange={(value) =>
            onChange({ ...overrides, layout: value ? (value as ListingView['layout']) : undefined })
          }
        />
        <ListingViewSelect
          readOnly={readOnly}
          label="Format elementu"
          options={listingForms}
          value={overrides.form}
          inherited={base?.form}
          onChange={(value) =>
            onChange({ ...overrides, form: value ? (value as ListingView['form']) : undefined })
          }
        />
        <ListingViewSelect
          readOnly={readOnly}
          label="Format daty"
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
      </div>
      <fieldset className={styles.information}>
        <legend>Informacje na elemencie</legend>
        {informationKeys.map((key) => {
          const inherited = base?.information[key]
          const disabled = key === 'image' && view === 'row'
          const enabled = !disabled && (overrides.information?.[key] ?? inherited ?? false)
          return (
            <div
              key={key}
              className={`wkf-boolean-switch ${enabled ? 'wkf-boolean-switch--checked' : ''} ${styles.informationSwitch}`}
            >
              <label className={styles.switchLabel}>
                <span>{listingInformation[key]}</span>
                <span className="wkf-boolean-switch__control">
                  <input
                    aria-label={listingInformation[key]}
                    type="checkbox"
                    role="switch"
                    disabled={readOnly || disabled}
                    checked={enabled}
                    onChange={(event) => {
                      const information = { ...overrides.information }
                      if (inherited !== undefined && event.target.checked === inherited)
                        delete information[key]
                      else information[key] = event.target.checked
                      const nextOverrides: ListingViewOverrides = { ...overrides, information }
                      if (Object.keys(information).length === 0) delete nextOverrides.information
                      onChange(nextOverrides)
                    }}
                  />
                  <span aria-hidden="true" className="wkf-boolean-switch__track">
                    <span className="wkf-boolean-switch__thumb" />
                  </span>
                  <span aria-hidden="true" className="wkf-boolean-switch__state">
                    {enabled ? 'Tak' : 'Nie'}
                  </span>
                </span>
              </label>
            </div>
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
    <div className={styles.section}>
      <fieldset className={styles.editor} disabled={readOnly}>
        <legend>Wygląd</legend>
        <ViewDetails
          readOnly={readOnly}
          overrides={view}
          onChange={setValue}
          columnSettings={{
            value: view.columns,
            onChange: (columns) => setValue({ ...view, columns: Number(columns) }),
          }}
        />
      </fieldset>
    </div>
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
  const { preset: storedPreset = fallback, overrides = {} } = parseListingAppearance(value)
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
  const selected = library.find(
    ({ id, presetKey }) => storedPreset === `shared:${id}` || storedPreset === presetKey,
  )
  const preset = selected ? `shared:${selected.id}` : storedPreset
  const { view } = resolveListingView({ preset, overrides }, fallback, selected?.settings)
  const base = resolveListingView({ preset }, fallback, selected?.settings).view
  const detached = preset === 'custom'
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
    ...Object.fromEntries(
      library
        .filter((entry) => entry.active !== false || entry.id === selected?.id)
        .map((entry) => [
          `shared:${entry.id}`,
          entry.active === false ? `${entry.name} (nieaktywny)` : entry.name,
        ]),
    ),
    ...(detached ? { custom: 'Ustawienia własne' } : {}),
    ...(!selected && !detached
      ? {
          [preset]: libraryError ? 'Szablon niedostępny' : 'Ładowanie szablonu…',
        }
      : {}),
  }

  return (
    <section className={styles.section}>
      <div className={styles.workspace}>
        <fieldset className={styles.editor} disabled={readOnly}>
          <legend>Wygląd</legend>
          <div className={styles.templateRow}>
            <ListingViewSelect
              readOnly={readOnly}
              label="Szablon widoku"
              options={presetOptions}
              value={preset}
              onChange={selectPreset}
            />
            <ListingViewSelect
              readOnly={readOnly}
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
          </div>
          {libraryError ? (
            <p role="status">Biblioteka szablonów jest chwilowo niedostępna.</p>
          ) : null}
          {showError ? <p role="alert">{errorMessage}</p> : null}
          <details>
            <summary>
              Dostosuj wygląd{!detached && overrideCount > 0 ? ` · ${overrideCount}` : ''}
            </summary>
            <ViewDetails
              readOnly={readOnly}
              base={detached ? undefined : base}
              overrides={overrides}
              onChange={(settings) => setValue({ preset, overrides: settings })}
            />
            <div className={styles.actions}>
              {!detached && overrideCount > 0 ? (
                <Button
                  buttonStyle="primary"
                  disabled={readOnly}
                  margin={false}
                  size="medium"
                  type="button"
                  onClick={() => setValue({ preset })}
                >
                  Przywróć ustawienia szablonu
                </Button>
              ) : null}
              {!detached ? (
                <Button
                  buttonStyle="primary"
                  disabled={readOnly}
                  margin={false}
                  size="medium"
                  type="button"
                  onClick={() => setValue({ preset: 'custom', overrides: view })}
                >
                  Odłącz od szablonu
                </Button>
              ) : null}
            </div>
          </details>
        </fieldset>
        <section className={styles.preview} aria-labelledby={previewId}>
          <div className={styles.previewHeader}>
            <h4 id={previewId}>Podgląd wyników</h4>
            <div className={styles.previewModes} aria-label="Szerokość podglądu">
              <Button
                buttonStyle={!narrow ? 'primary' : 'secondary'}
                extraButtonProps={{ 'aria-pressed': !narrow }}
                margin={false}
                size="medium"
                type="button"
                onClick={() => setNarrow(false)}
              >
                Szeroki
              </Button>
              <Button
                buttonStyle={narrow ? 'primary' : 'secondary'}
                extraButtonProps={{ 'aria-pressed': narrow }}
                margin={false}
                size="medium"
                type="button"
                onClick={() => setNarrow(true)}
              >
                Wąski
              </Button>
            </div>
          </div>
          <div
            className={`${styles.previewCanvas} ${narrow ? styles.narrow : ''}`}
            aria-busy={preview?.body !== previewBody}
          >
            {preview?.body !== previewBody ? (
              <p role="status">Ładowanie podglądu…</p>
            ) : preview.error ? (
              <p role="alert">Nie udało się pobrać podglądu. Sprawdź ustawienia treści.</p>
            ) : preview.missingContext ? (
              <p>Wybierz w szablonie strony element do podglądu relacji.</p>
            ) : (
              <ListingPreviewFrame
                items={preview.items ?? []}
                view={view}
                presentation={preview.presentation}
              />
            )}
          </div>
        </section>
      </div>
    </section>
  )
}
