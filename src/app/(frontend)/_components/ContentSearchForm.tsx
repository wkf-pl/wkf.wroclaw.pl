'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useTransition, type ChangeEvent, type MouseEvent } from 'react'

import { TagLabel } from '@/components/TagLabel'
import type { ContentSearchOptions } from '@/modules/content/content-listing'
import {
  listingSourceLabels,
  type ContentListingSource,
} from '@/modules/content/listing-conditions'
import type {
  ContentSearchParameterNames,
  EnabledContentSearchFilters,
  parseContentSearchFilters,
} from '@/modules/content/content-search-parameters'

type ContentSearchFormProperties = {
  enabled: EnabledContentSearchFilters
  names: ContentSearchParameterNames
  options: ContentSearchOptions
  pathname: string
  pageParameter: string
  preservedParameters: [string, string][]
  selection: ReturnType<typeof parseContentSearchFilters>
  sources: ContentListingSource[]
}

export function ContentSearchForm({
  enabled,
  names,
  options,
  pathname,
  pageParameter,
  preservedParameters,
  selection,
  sources,
}: ContentSearchFormProperties) {
  const { filters, errors } = selection
  const router = useRouter()
  const form = useRef<HTMLFormElement>(null)
  const debounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const [isPending, startTransition] = useTransition()
  const authorValue = filters.authorId === undefined ? filters.author : `id:${filters.authorId}`
  const selectedTags = (filters.tagIds ?? []).map(String)
  const selectedTopics = (filters.topicIds ?? []).map(String)
  const selectedGroupTags = (filters.tagGroups?.flat() ?? []).map(String)
  const ownedNames = useMemo(() => Object.values(names), [names])
  const renderedQuery = searchSignature(
    new URLSearchParams([
      [names.phrase, filters.phrase ?? ''],
      [names.author, authorValue ?? ''],
      [names.branch, filters.branch ?? ''],
      [names.dateFrom, selection.dateFrom ?? ''],
      [names.dateTo, selection.dateTo ?? ''],
      ...selectedTags.map((value): [string, string] => [names.tags, value]),
      ...selectedTopics.map((value): [string, string] => [names.topic, value]),
      ...selectedGroupTags.map((value): [string, string] => [names.tagGroups, value]),
      ...(filters.sources ?? []).map((value): [string, string] => [names.contentType, value]),
    ]),
  )
  const submittedQuery = useRef(renderedQuery)
  const resetQuery = new URLSearchParams(preservedParameters).toString()

  useEffect(() => {
    if (submittedQuery.current === renderedQuery) return
    submittedQuery.current = renderedQuery
    clearTimeout(debounce.current)
    writeSearchFields(form.current, ownedNames, new URLSearchParams(renderedQuery))
  }, [ownedNames, renderedQuery])

  useEffect(() => {
    const cancel = () => clearTimeout(debounce.current)
    window.addEventListener('popstate', cancel)
    return () => {
      cancel()
      window.removeEventListener('popstate', cancel)
    }
  }, [])

  function applySearch(parameters: URLSearchParams, reset = false) {
    const url = new URL(window.location.href)
    const current = new URLSearchParams(
      [...url.searchParams].filter(([name]) => ownedNames.includes(name)),
    )
    const next = searchSignature(parameters)
    if (next === searchSignature(current) && (!reset || !url.searchParams.has(pageParameter)))
      return
    submittedQuery.current = reset ? renderedQuery : next
    for (const name of [...ownedNames, pageParameter]) url.searchParams.delete(name)
    for (const [name, value] of parameters) url.searchParams.append(name, value)

    // Commit the URL first so another Listing can merge its filters during this refresh.
    window.history.replaceState(null, '', url)
    startTransition(() => router.refresh())
  }

  function readForm(current: HTMLFormElement) {
    const parameters = new URLSearchParams()
    for (const [name, raw] of new FormData(current)) {
      if (typeof raw !== 'string' || !ownedNames.includes(name)) continue
      const value = raw.trim()
      if (value && (name !== names.phrase || [...value].length >= 3)) {
        parameters.append(name, value)
      }
    }
    return parameters
  }

  function changeSearch(event: ChangeEvent<HTMLFormElement>) {
    const target = event.target
    const parameters = readForm(event.currentTarget)
    clearTimeout(debounce.current)
    if (target.name === names.phrase && parameters.has(names.phrase)) {
      debounce.current = setTimeout(() => applySearch(parameters), 300)
    } else {
      applySearch(parameters)
    }
  }

  function resetSearch(event: MouseEvent<HTMLAnchorElement>) {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    clearTimeout(debounce.current)
    const parameters = new URLSearchParams()
    writeSearchFields(form.current, ownedNames, parameters)
    applySearch(parameters, true)
  }

  return (
    <form
      action={pathname}
      aria-label="Wyszukiwarka"
      className="contentSearchForm"
      method="get"
      onChange={changeSearch}
      onSubmit={(event) => {
        event.preventDefault()
        clearTimeout(debounce.current)
        applySearch(readForm(event.currentTarget))
      }}
      ref={form}
      role="search"
    >
      {preservedParameters.map(([name, value], index) => (
        <input key={`${name}-${index}`} name={name} type="hidden" value={value} />
      ))}
      {enabled.phrase || enabled.date || enabled.branch || enabled.author ? (
        <div className="contentSearchFields">
          {enabled.phrase ? (
            <SearchInput
              error={errors.phrase}
              label="Fraza w tytule lub zajawce"
              name={names.phrase}
              value={filters.phrase}
            />
          ) : null}
          {enabled.date ? (
            <>
              <SearchInput
                error={errors.dateFrom}
                label="Data od"
                name={names.dateFrom}
                type="date"
                value={selection.dateFrom}
              />
              <SearchInput
                error={errors.dateTo}
                label="Data do"
                name={names.dateTo}
                type="date"
                value={selection.dateTo}
              />
            </>
          ) : null}
          {enabled.branch && (options.branches?.length || errors.branch) ? (
            <div className="contentSearchField">
              <label htmlFor={names.branch}>Dział serwisu</label>
              <select
                id={names.branch}
                name={names.branch}
                defaultValue={filters.branch ?? ''}
                aria-describedby={errors.branch ? `${names.branch}-error` : undefined}
              >
                <option value="">Wszystkie działy</option>
                {options.branches?.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <SearchError name={names.branch} error={errors.branch} />
            </div>
          ) : null}
          {enabled.author ? (
            <div className="contentSearchField">
              <label htmlFor={names.author}>Autor</label>
              <select
                id={names.author}
                name={names.author}
                defaultValue={authorValue ?? ''}
                disabled={!options.authors?.length && !authorValue}
                aria-describedby={errors.author ? `${names.author}-error` : undefined}
                aria-invalid={errors.author ? true : undefined}
              >
                <option value="">Wszyscy autorzy</option>
                {filters.author ? (
                  <option value={filters.author}>Nazwa zawiera „{filters.author}”</option>
                ) : null}
                {options.authors?.map(({ id, label }) => (
                  <option key={id} value={`id:${id}`}>
                    {label}
                  </option>
                ))}
              </select>
              <SearchError name={names.author} error={errors.author} />
            </div>
          ) : null}
        </div>
      ) : null}
      {(enabled.topic && (options.topics.length > 0 || errors.topic)) ||
      (enabled.tags && (options.tags.length > 0 || errors.tags)) ||
      options.tagGroups?.length ? (
        <div className="contentSearchFields">
          {enabled.topic && (options.topics.length > 0 || errors.topic) ? (
            <SearchChoices
              error={errors.topic}
              collapsible
              label="Tematy"
              name={names.topic}
              options={options.topics.map(({ id, label }) => ({ value: String(id), label }))}
              selected={selectedTopics}
            />
          ) : null}
          {options.tagGroups?.map(({ id, label, tags }) => (
            <SearchChoices
              key={id}
              collapsible
              label={label}
              name={names.tagGroups}
              options={tags.map(({ id, label }) => ({ value: String(id), label }))}
              selected={selectedGroupTags}
            />
          ))}
          {enabled.tags && (options.tags.length > 0 || errors.tags) ? (
            <SearchChoices
              error={errors.tags}
              collapsible
              label="Tagi"
              name={names.tags}
              options={options.tags.map(({ id, label, groupIcon }) => ({
                value: String(id),
                label,
                groupIcon,
              }))}
              selected={selectedTags}
            />
          ) : null}
        </div>
      ) : null}
      <SearchError name={names.tagGroups} error={errors.tagGroups} />
      {enabled.contentType && (sources.length > 1 || errors.contentType) ? (
        <SearchChoices
          error={errors.contentType}
          label="Typ treści"
          name={names.contentType}
          options={sources.map((source) => ({
            value: source,
            label: listingSourceLabels[source],
          }))}
          selected={filters.sources ?? []}
        />
      ) : null}
      {selection.hasInput ? (
        <div className="contentSearchActions">
          <a href={resetQuery ? `${pathname}?${resetQuery}` : pathname} onClick={resetSearch}>
            Wyczyść filtry
          </a>
        </div>
      ) : null}
      <span className="contentSearchStatus" role="status">
        {isPending ? 'Wyszukiwanie…' : ''}
      </span>
    </form>
  )
}

function searchSignature(parameters: URLSearchParams) {
  return new URLSearchParams([...parameters].filter(([, value]) => value).sort()).toString()
}

function writeSearchFields(
  form: HTMLFormElement | null,
  ownedNames: string[],
  parameters: URLSearchParams,
) {
  for (const element of form?.elements ?? []) {
    if (element instanceof HTMLInputElement && ownedNames.includes(element.name)) {
      if (element.type === 'checkbox') {
        element.checked = parameters.getAll(element.name).includes(element.value)
      } else {
        element.value = parameters.get(element.name) ?? ''
      }
    } else if (element instanceof HTMLSelectElement && ownedNames.includes(element.name)) {
      element.value = parameters.get(element.name) ?? ''
    }
  }
}

function SearchInput({
  error,
  label,
  name,
  type = 'text',
  value,
}: {
  error?: string
  label: string
  name: string
  type?: 'date' | 'text'
  value?: string
}) {
  return (
    <div className="contentSearchField">
      <label htmlFor={name}>{label}</label>
      <input
        aria-describedby={error ? `${name}-error` : undefined}
        aria-invalid={error ? true : undefined}
        defaultValue={value ?? ''}
        id={name}
        maxLength={type === 'text' ? 160 : undefined}
        name={name}
        type={type}
      />
      <SearchError name={name} error={error} />
    </div>
  )
}

function SearchChoices({
  collapsible,
  error,
  label,
  name,
  options,
  selected,
}: {
  collapsible?: boolean
  error?: string
  label: string
  name: string
  options: { value: string; label: string; groupIcon?: string }[]
  selected: readonly string[]
}) {
  const choices = (
    <fieldset
      aria-describedby={error ? `${name}-error` : undefined}
      className="contentSearchChoices"
    >
      <legend className={collapsible ? 'contentSearchStatus' : undefined}>{label}</legend>
      <div>
        {options.map(({ value, label: optionLabel, groupIcon }) => (
          <label key={value}>
            <input
              defaultChecked={selected.includes(value)}
              name={name}
              type="checkbox"
              value={value}
            />
            {groupIcon ? <TagLabel name={optionLabel} groupIcon={groupIcon} /> : optionLabel}
          </label>
        ))}
      </div>
      <SearchError name={name} error={error} />
    </fieldset>
  )
  if (!collapsible) return choices

  const count = options.filter(({ value }) => selected.includes(value)).length
  return (
    <details
      className="contentSearchSelect"
      onKeyDown={(event) => {
        if (event.key !== 'Escape' || !event.currentTarget.open) return
        event.preventDefault()
        event.currentTarget.open = false
        event.currentTarget.querySelector('summary')?.focus()
      }}
    >
      <summary>
        <span>{label}</span>
        <span>{count ? `Wybrane: ${count}` : 'Dowolne'}</span>
      </summary>
      {choices}
    </details>
  )
}

function SearchError({ error, name }: { error?: string; name: string }) {
  return error ? (
    <p className="contentSearchError" id={`${name}-error`}>
      {error}
    </p>
  ) : null
}
