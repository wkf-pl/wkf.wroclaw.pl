'use client'

import {
  FieldLabel,
  ReactSelect,
  useConfig,
  useField,
  useForm,
  usePayloadAPI,
} from '@payloadcms/ui'
import type { FormState, RelationshipFieldClientProps } from 'payload'
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
  const { path: parentPagePath, value: parentPageID } = useField<number | string | null>({
    potentiallyStalePath: properties.path,
  })
  const parentFilterPath = getParentFilterPath(parentPagePath)
  const { value: parentFilter } = useField<ParentFilter>({
    path: parentFilterPath,
  })
  const { dispatchFields, getFields, setModified } = useForm()
  const {
    config: {
      routes: { api: apiRoute },
    },
  } = useConfig()
  const pagesURL = formatAdminURL({ apiRoute, path: '/pages' })
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

  function updateParentSelection(
    nextParentFilter: ParentFilter,
    nextParentPageID: null | number | string,
  ) {
    const fields = getFields()
    const formState: FormState = {
      [parentFilterPath]: {
        ...fields[parentFilterPath],
        isModified: true,
        value: nextParentFilter,
      },
      [parentPagePath]: {
        ...fields[parentPagePath],
        isModified: true,
        value: nextParentPageID,
      },
    }

    dispatchFields({ formState, type: 'UPDATE_MANY' })
    setModified(true)
  }

  function handleChange(option: unknown) {
    if (Array.isArray(option) || !option || typeof option !== 'object') {
      return
    }

    const value = 'value' in option && typeof option.value === 'string' ? option.value : ''

    if (value === 'none' || value === 'current') {
      updateParentSelection(value, null)
      return
    }

    const selectedPage = getPages(data).find((page) => String(page.id) === value)

    if (!selectedPage) {
      return
    }

    updateParentSelection('specific', selectedPage.id)
  }

  return (
    <div className="field-type">
      <FieldLabel label={properties.field.label} path={parentPagePath} />
      <ReactSelect
        disabled={properties.readOnly}
        inputId={parentPagePath}
        isLoading={isLoading}
        isSearchable
        onChange={handleChange}
        options={options}
        value={selectedOption}
      />
    </div>
  )
}
