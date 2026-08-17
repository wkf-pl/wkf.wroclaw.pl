'use client'

import { FieldLabel, ReactSelect, useConfig, useField, usePayloadAPI } from '@payloadcms/ui'
import type { RelationshipFieldClientProps } from 'payload'
import { formatAdminURL } from 'payload/shared'
import { useMemo } from 'react'

type ParentFilter = 'current' | 'none' | 'specific'

type PageOption = {
  id: number | string
  slug?: null | string
  title?: null | string
}

type PagesResponse = {
  docs?: PageOption[]
}

type SelectOption = {
  label: string
  value: string
}

function getParentFilterPath(path: string): string {
  return path.replace(/parentPage$/, 'parentFilter')
}

function getSelectedOption(
  options: SelectOption[],
  parentFilter: ParentFilter | null | undefined,
  parentPageID: number | string | null | undefined,
): SelectOption {
  const value =
    parentFilter === 'current'
      ? 'current'
      : parentFilter === 'specific' && parentPageID !== null && parentPageID !== undefined
        ? String(parentPageID)
        : 'none'

  return options.find((option) => option.value === value) ?? options[0]!
}

function getPages(data: unknown): PageOption[] {
  if (!data || typeof data !== 'object' || !('docs' in data)) {
    return []
  }

  const docs = (data as PagesResponse).docs
  return Array.isArray(docs) ? docs : []
}

export function ListingParentPageField(properties: RelationshipFieldClientProps) {
  const parentFilterPath = getParentFilterPath(properties.path)
  const { value: parentPageID, setValue: setParentPageID } = useField<number | string | null>({
    potentiallyStalePath: properties.path,
  })
  const { value: parentFilter, setValue: setParentFilter } = useField<ParentFilter>({
    potentiallyStalePath: parentFilterPath,
  })
  const {
    config: {
      routes: { api: apiRoute },
      serverURL,
    },
  } = useConfig()
  const pagesURL = formatAdminURL({ apiRoute, path: '/pages', serverURL })
  const [{ data, isLoading }] = usePayloadAPI(pagesURL, {
    initialParams: {
      depth: 0,
      limit: 1000,
      select: {
        slug: true,
        title: true,
      },
      sort: 'title',
    },
  })
  const options = useMemo<SelectOption[]>(
    () => [
      { label: '<brak>', value: 'none' },
      { label: '<bieżąca strona>', value: 'current' },
      ...getPages(data).map((page) => ({
        label: page.title?.trim() || page.slug?.trim() || `Strona ${page.id}`,
        value: String(page.id),
      })),
    ],
    [data],
  )
  const selectedOption = getSelectedOption(options, parentFilter, parentPageID)

  function handleChange(option: unknown) {
    if (Array.isArray(option) || !option || typeof option !== 'object') {
      return
    }

    const value = 'value' in option && typeof option.value === 'string' ? option.value : ''

    if (value === 'none' || value === 'current') {
      setParentFilter(value)
      setParentPageID(null)
      return
    }

    const selectedPage = getPages(data).find((page) => String(page.id) === value)

    if (!selectedPage) {
      return
    }

    setParentFilter('specific')
    setParentPageID(selectedPage.id)
  }

  return (
    <div className="field-type">
      <FieldLabel label={properties.field.label} path={properties.path} />
      <ReactSelect
        disabled={properties.readOnly}
        inputId={properties.path}
        isLoading={isLoading}
        isSearchable
        onChange={handleChange}
        options={options}
        value={selectedOption}
      />
    </div>
  )
}
