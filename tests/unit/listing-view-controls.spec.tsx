// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const selectMock = vi.hoisted(() => vi.fn())

vi.mock('@payloadcms/ui', () => ({
  FieldLabel: ({ htmlFor, label }: { htmlFor: string; label: string }) => (
    <label htmlFor={htmlFor}>{label}</label>
  ),
  ReactSelect: selectMock,
  useAllFormFields: vi.fn(),
  useConfig: vi.fn(),
  useField: vi.fn(),
  useForm: vi.fn(),
}))

import { ListingViewSelect } from '@/components/admin/ListingViewSelect'

describe('Listing view controls', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    ;(
      globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
    selectMock.mockReset()
    selectMock.mockImplementation(({ inputId }: { inputId: string }) => <input id={inputId} />)
  })

  afterEach(async () => {
    await act(async () => root.unmount())
    container.remove()
  })

  it('uses the standard panel select with an associated label', async () => {
    await act(async () =>
      root.render(
        <ListingViewSelect
          label="Kolumny"
          options={{ 1: '1', 2: '2' }}
          value={2}
          onChange={vi.fn()}
        />,
      ),
    )
    expect(selectMock).toHaveBeenCalled()
    const properties = selectMock.mock.lastCall![0]
    expect(properties.value).toEqual({ label: '2', value: '2' })
    expect(properties.isClearable).toBe(false)
    expect(container.querySelector('label')?.htmlFor).toBe(properties.inputId)
    expect(container.querySelector('select')).toBeNull()
  })

  it('shows the inherited value as an ordinary option', async () => {
    const onChange = vi.fn()
    await act(async () =>
      root.render(
        <ListingViewSelect
          label="Kolumny"
          options={{ 1: '1', 2: '2' }}
          inherited={2}
          onChange={onChange}
        />,
      ),
    )
    const properties = selectMock.mock.lastCall![0]
    expect(properties.value).toEqual({ label: '2', value: '2' })
    expect(properties.options).toEqual([
      { label: '1', value: '1' },
      { label: '2', value: '2' },
    ])
    properties.onChange({ label: '1', value: '1' })
    properties.onChange({ label: '2', value: '2' })
    expect(onChange.mock.calls).toEqual([['1'], ['2']])
  })

  it('disables the standard select and ignores changes in read-only mode', async () => {
    const onChange = vi.fn()
    await act(async () =>
      root.render(
        <ListingViewSelect
          label="Kolumny"
          options={{ 1: '1' }}
          value={1}
          readOnly
          onChange={onChange}
        />,
      ),
    )
    const properties = selectMock.mock.lastCall![0]
    expect(properties.disabled).toBe(true)
    properties.onChange({ label: '1', value: '1' })
    expect(onChange).not.toHaveBeenCalled()
  })
})
