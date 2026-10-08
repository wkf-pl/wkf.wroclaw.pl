// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type { CheckboxFieldClientProps } from 'payload'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const useFieldMock = vi.hoisted(() => vi.fn())

vi.mock('@payloadcms/ui', () => ({
  FieldDescription: ({ description }: { description?: string }) => (
    <div data-testid="description">{description}</div>
  ),
  FieldError: () => null,
  FieldLabel: ({ htmlFor, label }: { htmlFor?: string; label?: string }) => (
    <label htmlFor={htmlFor}>{label}</label>
  ),
  RenderCustomComponent: ({ Fallback }: { Fallback: React.ReactNode }) => Fallback,
  fieldBaseClass: 'field-type',
  useField: useFieldMock,
}))

vi.mock('@payloadcms/ui/shared', () => ({
  mergeFieldStyles: () => ({}),
}))

import { BooleanSwitchField } from '@/components/admin/BooleanSwitchField'

describe('BooleanSwitchField', () => {
  let container: HTMLDivElement
  let root: Root
  const setValue = vi.fn()

  beforeEach(() => {
    ;(
      globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
    setValue.mockReset()
    useFieldMock.mockReset()
    useFieldMock.mockReturnValue({
      customComponents: {},
      disabled: false,
      path: 'enabled',
      setValue,
      showError: false,
      value: false,
    })
  })

  afterEach(async () => {
    await act(async () => root.unmount())
    container.remove()
  })

  it('shows the default false label and writes the checked value', async () => {
    const onChange = vi.fn()
    await renderField({ onChange })

    const input = getInput()
    expect(input.getAttribute('role')).toBe('switch')
    expect(container.textContent).toContain('Nie')

    await act(async () => input.click())

    expect(setValue).toHaveBeenCalledWith(true)
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('renders custom labels for both states', async () => {
    useFieldMock.mockReturnValue({
      customComponents: {},
      disabled: false,
      path: 'enabled',
      setValue,
      showError: false,
      value: true,
    })

    await renderField({
      field: {
        admin: {
          custom: {
            booleanSwitch: {
              falseLabel: 'Wyłączone',
              trueLabel: 'Włączone',
            },
          },
        },
        label: 'Widoczność',
        name: 'enabled',
        type: 'checkbox',
      },
    })

    expect(container.textContent).toContain('Włączone')
    expect(container.textContent).not.toContain('Wyłączone')
  })

  it('disables the switch in read-only mode', async () => {
    await renderField({ readOnly: true })

    expect(getInput().disabled).toBe(true)
  })

  async function renderField(overrides: Partial<CheckboxFieldClientProps> = {}): Promise<void> {
    const properties: CheckboxFieldClientProps = {
      field: {
        label: 'Pole logiczne',
        name: 'enabled',
        type: 'checkbox',
      },
      path: 'enabled',
      ...overrides,
    }

    await act(async () => root.render(<BooleanSwitchField {...properties} />))
  }

  function getInput(): HTMLInputElement {
    const input = container.querySelector<HTMLInputElement>('input[type="checkbox"]')
    if (!input) throw new Error('Missing boolean switch input')
    return input
  }
})
