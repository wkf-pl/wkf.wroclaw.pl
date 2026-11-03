'use client'

import { Button, Gutter, SetStepNav, type StepNavItem } from '@payloadcms/ui'
import { useMemo, useState } from 'react'

import {
  pageTemplateRegistry,
  type PageTemplateDefinition,
  type PageTemplateHeroImageRule,
  type PageTemplateID,
  type PageTemplateRouteKind,
} from '@/modules/page-templates/page-template-registry'

import './PageTemplatesRegistry.scss'

const routeKindLabels: Record<PageTemplateRouteKind, string> = {
  collectionIndex: 'Lista kolekcji',
  collectionItem: 'Element kolekcji',
}

const heroImageRuleLabels: Record<PageTemplateHeroImageRule, string> = {
  configurable: 'Opcjonalny obraz ustawiany w szablonie',
  currentItem: 'Automatycznie z bieżącego elementu',
  none: 'Bez obrazu Hero',
}

const pageTemplateStepNav: StepNavItem[] = [{ label: 'Szablony stron' }]

export function PageTemplatesRegistry() {
  const [query, setQuery] = useState('')
  const [routeKind, setRouteKind] = useState<PageTemplateRouteKind | 'all'>('all')
  const [selectedTemplateID, setSelectedTemplateID] = useState<PageTemplateID>('event-detail')
  const normalizedQuery = query.trim().toLocaleLowerCase('pl')
  const templates = useMemo(
    () =>
      pageTemplateRegistry.filter(
        (template) =>
          (routeKind === 'all' || template.routeKind === routeKind) &&
          (!normalizedQuery ||
            template.label.toLocaleLowerCase('pl').includes(normalizedQuery) ||
            template.route.toLocaleLowerCase('pl').includes(normalizedQuery)),
      ),
    [normalizedQuery, routeKind],
  )
  const selectedTemplate =
    pageTemplateRegistry.find((template) => template.id === selectedTemplateID) ??
    pageTemplateRegistry[0]

  return (
    <>
      <SetStepNav nav={pageTemplateStepNav} />
      <Gutter>
        <main className="page-template-registry">
          <header className="page-template-registry__header">
            <h1>Szablony stron</h1>
            <p>Globalne układy dla stron kolekcji i stron poszczególnych elementów.</p>
          </header>

          <div className="page-template-registry__notice" role="note">
            <strong>Typy szablonów są definiowane przez aplikację.</strong>
            <span>
              Możesz zmieniać ich układ i tryb działania, ale nie możesz dodawać ani usuwać typów
              szablonów.
            </span>
          </div>

          <div className="page-template-registry__toolbar">
            <label className="page-template-registry__search">
              <span className="sr-only">Szukaj szablonów</span>
              <input
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Szukaj po nazwie lub trasie…"
                type="search"
                value={query}
              />
            </label>
            <label>
              <span className="sr-only">Rodzaj trasy</span>
              <select
                onChange={(event) =>
                  setRouteKind(event.target.value as PageTemplateRouteKind | 'all')
                }
                value={routeKind}
              >
                <option value="all">Wszystkie rodzaje</option>
                <option value="collectionIndex">Listy kolekcji</option>
                <option value="collectionItem">Elementy kolekcji</option>
              </select>
            </label>
          </div>

          <div className="page-template-registry__layout">
            <section aria-label="Typy szablonów" className="page-template-registry__table-wrap">
              <table className="page-template-registry__table">
                <thead>
                  <tr>
                    <th>Szablon</th>
                    <th>Rodzaj</th>
                    <th>Tryb</th>
                    <th>Publikacja</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((template) => (
                    <TemplateRow
                      isSelected={template.id === selectedTemplate.id}
                      key={template.id}
                      onSelect={setSelectedTemplateID}
                      template={template}
                    />
                  ))}
                </tbody>
              </table>
              {templates.length === 0 ? (
                <p className="page-template-registry__empty">Nie znaleziono szablonów.</p>
              ) : null}
            </section>

            <TemplateDetails template={selectedTemplate} />
          </div>
        </main>
      </Gutter>
    </>
  )
}

function TemplateRow({
  isSelected,
  onSelect,
  template,
}: {
  isSelected: boolean
  onSelect: (id: PageTemplateID) => void
  template: PageTemplateDefinition
}) {
  return (
    <tr className={isSelected ? 'is-selected' : undefined}>
      <td>
        <button
          aria-pressed={isSelected}
          className="page-template-registry__template-button"
          onClick={() => onSelect(template.id)}
          type="button"
        >
          <strong>{template.label}</strong>
          <code>{template.route}</code>
        </button>
      </td>
      <td>{routeKindLabels[template.routeKind]}</td>
      <td>
        <span className="page-template-registry__badge">Legacy</span>
      </td>
      <td>
        <span className="page-template-registry__badge page-template-registry__badge--muted">
          Nieskonfigurowany
        </span>
      </td>
    </tr>
  )
}

function TemplateDetails({ template }: { template: PageTemplateDefinition }) {
  const availableElementLabels = [
    ...(template.dynamicFields.length ? ['Pola bieżącego elementu'] : []),
    'Elementy statyczne',
    'Listing',
    'Bloki układu i treści',
  ]

  return (
    <aside aria-label="Możliwości szablonu" className="page-template-registry__details">
      <span className="page-template-registry__eyebrow">Możliwości szablonu</span>
      <h2>{template.label}</h2>
      <code>{template.id}</code>

      <dl>
        <div>
          <dt>Bieżący element</dt>
          <dd>{template.currentItemLabel ?? 'Brak'}</dd>
        </div>
        <div>
          <dt>Obraz Hero</dt>
          <dd>{heroImageRuleLabels[template.heroImageRule]}</dd>
        </div>
        <div>
          <dt>Treści bieżącego elementu</dt>
          <dd>
            {template.requiresCurrentItemContent
              ? 'Wymagany dokładnie jeden blok'
              : 'Blok niewymagany'}
          </dd>
        </div>
        <div>
          <dt>Dostępne elementy</dt>
          <dd>
            <ul>
              {availableElementLabels.map((label) => (
                <li key={label}>{label}</li>
              ))}
            </ul>
          </dd>
        </div>
      </dl>

      <div className="page-template-registry__actions">
        <Button buttonStyle="primary" disabled margin={false} size="medium">
          Edytuj układ szablonu
        </Button>
        <p>Edycja układu będzie dostępna w kolejnym etapie.</p>
      </div>
    </aside>
  )
}
