'use client'

import { Button, useConfig, useField, useFormFields } from '@payloadcms/ui'
import dynamic from 'next/dynamic'
import type { JSONFieldClientProps } from 'payload'
import { formatAdminURL } from 'payload/shared'
import { useState } from 'react'

import { ListingDecorationFields } from './ListingDecorationFields'
import { ListingViewSelect } from './ListingViewSelect'
import { useListingViewLibrary } from './useListingViewLibrary'
import {
  getDefaultListingDecoration,
  getLegacyListingDecoration,
} from '@/modules/content/listing-decoration'
import {
  getListingComponents,
  listingComponentOptions,
  listingForms,
  listingInformation,
  listingPresets,
  parseListingAppearance,
  resolveListingView,
  type ListingView,
  type ListingViewOverrides,
} from '@/modules/content/listing-view'

import styles from './ListingViewField.module.css'

const layoutLabels = { static: 'Statyczne', carousel: 'Karuzela' }
const informationKeys = ['title', 'excerpt', 'taxonomy', 'image', 'other'] as const
const componentLabels = {
  kind: 'Typ treści',
  date: 'Data lub termin',
  venue: 'Miejsce',
  actions: 'Akcje',
} as const
const ListingViewPreview = dynamic(
  () => import('./ListingViewPreview').then((module) => module.ListingViewPreview),
  { loading: () => <p role="status">Ładowanie podglądu…</p> },
)

const columnOptions = { 1: '1', 2: '2', 3: '3', 4: '4' }

function ViewDetails({
  base,
  overrides,
  onChange,
  currentView,
  baseDecoration,
  readOnly,
}: {
  readOnly?: boolean
  base?: ListingView
  currentView: ListingView
  baseDecoration?: ListingView['decoration']
  overrides: ListingViewOverrides
  onChange: (value: ListingViewOverrides) => void
}) {
  const components = getListingComponents(currentView)
  const inheritedComponents = base && getListingComponents(base)
  const decoration = currentView.decoration ?? getDefaultListingDecoration(currentView)
  return (
    <div className={styles.controls}>
      <ListingDecorationFields
        base={baseDecoration}
        current={decoration}
        overrides={overrides.decoration}
        imageEnabled={currentView.form !== 'row' && currentView.information.image}
        readOnly={readOnly}
        onChange={(settings) => onChange({ ...overrides, decoration: settings })}
        columnsControl={
          <ListingViewSelect
            readOnly={readOnly}
            label={currentView.layout === 'carousel' ? 'Widoczne elementy' : 'Kolumny'}
            options={columnOptions}
            value={currentView.columns}
            onChange={(columns) =>
              onChange({
                ...overrides,
                columns: Number(columns) === base?.columns ? undefined : Number(columns),
              })
            }
          />
        }
        layoutControl={
          <ListingViewSelect
            readOnly={readOnly}
            label="Rozmieszczenie"
            options={layoutLabels}
            value={currentView.layout}
            inherited={base?.layout}
            onChange={(value) =>
              onChange({
                ...overrides,
                layout: value === base?.layout ? undefined : (value as ListingView['layout']),
              })
            }
          />
        }
        formatControl={
          <ListingViewSelect
            readOnly={readOnly}
            label="Format elementu"
            options={listingForms}
            value={currentView.form}
            inherited={base?.form}
            onChange={(value) =>
              onChange({
                ...overrides,
                form: value === base?.form ? undefined : (value as ListingView['form']),
              })
            }
          />
        }
      />
      <fieldset className={styles.settingsGroup}>
        <legend>Składowe na elemencie</legend>
        <div className={styles.information}>
          {informationKeys.map((key) => {
            const component = key === 'title' || key === 'other'
            const label =
              key === 'title' ? 'Tytuł' : key === 'other' ? 'Pozostałe' : listingInformation[key]
            const inherited = component ? inheritedComponents?.[key] : base?.information[key]
            const disabled = key === 'image' && currentView.form === 'row'
            const enabled =
              !disabled && (component ? components[key] : currentView.information[key])
            return (
              <div
                key={key}
                className={`wkf-boolean-switch ${enabled ? 'wkf-boolean-switch--checked' : ''} ${styles.informationSwitch}${disabled ? ' ' + styles.disabledSwitch : ''}`}
              >
                <label className={styles.switchLabel}>
                  <span>{label}</span>
                  <span className="wkf-boolean-switch__control">
                    <input
                      aria-label={label}
                      type="checkbox"
                      role="switch"
                      disabled={readOnly || disabled}
                      checked={enabled}
                      onChange={(event) => {
                        const checked = event.target.checked
                        if (key === 'title' || key === 'other') {
                          onChange({
                            ...overrides,
                            components: { ...overrides.components, [key]: checked },
                          })
                          return
                        }
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
        </div>
        <div className={styles.componentChoices}>
          {(Object.keys(listingComponentOptions) as (keyof typeof listingComponentOptions)[]).map(
            (key) => (
              <ListingViewSelect
                key={key}
                readOnly={readOnly}
                label={componentLabels[key]}
                options={listingComponentOptions[key]}
                value={components[key]}
                onChange={(value) =>
                  onChange({ ...overrides, components: { ...overrides.components, [key]: value } })
                }
              />
            ),
          )}
        </div>
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
        <ViewDetails readOnly={readOnly} overrides={view} currentView={view} onChange={setValue} />
      </fieldset>
    </div>
  )
}

export function ListingViewField({ path, readOnly }: JSONFieldClientProps) {
  const { value, setValue, showError, errorMessage } = useField<unknown>({ path })
  const {
    config: {
      routes: { api },
      serverURL,
    },
  } = useConfig()
  const parentPath = path.slice(0, path.lastIndexOf('.') + 1)
  const oldView = useFormFields(([fields]) => fields[parentPath + 'view']?.value)
  const frame = useFormFields(([fields]) => fields[parentPath + 'frame']?.value)
  const surface = useFormFields(([fields]) => fields[parentPath + 'surface']?.value)
  const surfaceImage = useFormFields(([fields]) => fields[parentPath + 'surfaceImage']?.value)
  const surfaceHorizontalPosition = useFormFields(
    ([fields]) => fields[parentPath + 'surfaceHorizontalPosition']?.value,
  )
  const surfaceVerticalPosition = useFormFields(
    ([fields]) => fields[parentPath + 'surfaceVerticalPosition']?.value,
  )
  const legacyPresentation = {
    frame,
    surface,
    surfaceImage,
    surfaceHorizontalPosition,
    surfaceVerticalPosition,
  }
  const fallback =
    typeof oldView === 'string' && Object.hasOwn(listingPresets, oldView) ? oldView : 'cards'
  const { preset: storedPreset = fallback, overrides: storedOverrides = {} } =
    parseListingAppearance(value)
  const libraryURL = formatAdminURL({ apiRoute: api, path: '/listing-views', serverURL })
  const { library, libraryError } = useListingViewLibrary(libraryURL)
  const [customizationOpen, setCustomizationOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const selected = library.find(
    ({ id, presetKey }) => storedPreset === `shared:${id}` || storedPreset === presetKey,
  )
  const preset = selected ? `shared:${selected.id}` : storedPreset
  const { view } = resolveListingView(
    { preset, overrides: storedOverrides },
    fallback,
    selected?.settings,
    legacyPresentation,
  )
  const legacyDecoration = getLegacyListingDecoration(view, legacyPresentation)
  const overrides =
    storedOverrides.decoration === undefined && Object.keys(legacyDecoration).length
      ? { ...storedOverrides, decoration: legacyDecoration }
      : storedOverrides
  function saveOverrides(settings: ListingViewOverrides, nextPreset = preset) {
    setValue({ preset: nextPreset, overrides: { decoration: {}, ...settings } })
  }
  const detached = preset === 'custom'
  const base =
    customizationOpen && !detached
      ? resolveListingView({ preset }, fallback, selected?.settings).view
      : undefined
  const baseDecoration =
    customizationOpen && !detached
      ? resolveListingView(
          { preset, overrides: { ...overrides, decoration: {} } },
          fallback,
          selected?.settings,
        ).view.decoration
      : undefined
  const editingView =
    customizationOpen && storedOverrides.decoration === undefined && overrides.decoration
      ? resolveListingView({ preset, overrides }, fallback, selected?.settings).view
      : view
  const overrideCount =
    Object.keys(overrides).filter(
      (key) => key !== 'information' && key !== 'decoration' && key !== 'components',
    ).length +
    Object.keys(overrides.decoration ?? {}).length +
    Object.keys(overrides.information ?? {}).length +
    Object.keys(overrides.components ?? {}).length

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
    saveOverrides(nextOverrides, next)
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
          <ListingViewSelect
            readOnly={readOnly}
            label="Szablon widoku"
            options={presetOptions}
            value={preset}
            onChange={selectPreset}
          />
          {libraryError ? (
            <p role="status">Biblioteka szablonów jest chwilowo niedostępna.</p>
          ) : null}
          {showError ? <p role="alert">{errorMessage}</p> : null}
          <details onToggle={(event) => setCustomizationOpen(event.currentTarget.open)}>
            <summary>
              Dostosuj wygląd{!detached && overrideCount > 0 ? ` · ${overrideCount}` : ''}
            </summary>
            {customizationOpen ? (
              <>
                <ViewDetails
                  readOnly={readOnly}
                  base={detached ? undefined : base}
                  baseDecoration={detached ? undefined : baseDecoration}
                  currentView={editingView}
                  overrides={overrides}
                  onChange={(settings) => saveOverrides(settings)}
                />
                <div className={styles.actions}>
                  {!detached && overrideCount > 0 ? (
                    <Button
                      buttonStyle="primary"
                      disabled={readOnly}
                      margin={false}
                      size="medium"
                      type="button"
                      onClick={() => saveOverrides({})}
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
                      onClick={() =>
                        saveOverrides(
                          {
                            ...view,
                            decoration: view.decoration ?? {
                              ...getDefaultListingDecoration(view),
                              ...legacyDecoration,
                            },
                          },
                          'custom',
                        )
                      }
                    >
                      Odłącz od szablonu
                    </Button>
                  ) : null}
                </div>
              </>
            ) : null}
          </details>
        </fieldset>
        <details
          className={styles.preview}
          onToggle={(event) => setPreviewOpen(event.currentTarget.open)}
        >
          <summary className={styles.previewSummary}>Podgląd wyników</summary>
          {previewOpen ? (
            <ListingViewPreview
              appearance={value}
              blockPath={parentPath.slice(0, -1)}
              fallback={fallback}
              libraryURL={libraryURL}
              view={view}
            />
          ) : null}
        </details>
      </div>
    </section>
  )
}
