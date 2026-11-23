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
  preservedParameters: [string, string][]
  selection: ReturnType<typeof parseContentSearchFilters>
  sources: ContentListingSource[]
}

export function ContentSearchForm({
  enabled,
  names,
  options,
  pathname,
  preservedParameters,
  selection,
  sources,
}: ContentSearchFormProperties) {
  const { filters, errors } = selection
  const resetQuery = new URLSearchParams(preservedParameters).toString()
  return (
    <form
      action={pathname}
      aria-label="Wyszukiwarka"
      className="contentSearchForm"
      method="get"
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
            <SearchInput
              error={errors.author}
              label="Autor"
              name={names.author}
              value={filters.author}
            />
          ) : null}
        </div>
      ) : null}
      {enabled.topic && (options.topics.length > 0 || errors.topic) ? (
        <SearchChoices
          error={errors.topic}
          label="Tematy"
          name={names.topic}
          options={options.topics.map(({ id, label }) => ({ value: String(id), label }))}
          selected={(filters.topicIds ?? []).map(String)}
        />
      ) : null}
      {options.tagGroups?.map(({ id, label, tags }) => (
        <SearchChoices
          key={id}
          label={label}
          name={names.tagGroups}
          options={tags.map(({ id, label }) => ({ value: String(id), label }))}
          selected={(filters.tagGroups?.flat() ?? []).map(String)}
        />
      ))}
      <SearchError name={names.tagGroups} error={errors.tagGroups} />
      {enabled.tags && (options.tags.length > 0 || errors.tags) ? (
        <SearchChoices
          error={errors.tags}
          label="Tagi"
          name={names.tags}
          options={options.tags.map(({ id, label }) => ({ value: String(id), label }))}
          selected={(filters.tagIds ?? []).map(String)}
        />
      ) : null}
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
      <div className="contentSearchActions">
        <button type="submit">Szukaj</button>
        {selection.hasInput ? (
          <a href={resetQuery ? `${pathname}?${resetQuery}` : pathname}>Wyczyść filtry</a>
        ) : null}
      </div>
    </form>
  )
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
  error,
  label,
  name,
  options,
  selected,
}: {
  error?: string
  label: string
  name: string
  options: { value: string; label: string }[]
  selected: readonly string[]
}) {
  return (
    <fieldset
      aria-describedby={error ? `${name}-error` : undefined}
      className="contentSearchChoices"
    >
      <legend>{label}</legend>
      <div>
        {options.map(({ value, label: optionLabel }) => (
          <label key={value}>
            <input
              defaultChecked={selected.includes(value)}
              name={name}
              type="checkbox"
              value={value}
            />
            {optionLabel}
          </label>
        ))}
      </div>
      <SearchError name={name} error={error} />
    </fieldset>
  )
}

function SearchError({ error, name }: { error?: string; name: string }) {
  return error ? (
    <p className="contentSearchError" id={`${name}-error`}>
      {error}
    </p>
  ) : null
}
