// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const submitMock = vi.hoisted(() => vi.fn())
const getFormStateMock = vi.hoisted(() => vi.fn())
const dispatchFieldsMock = vi.hoisted(() => vi.fn())
const setIsValidMock = vi.hoisted(() => vi.fn())
const setSubmittedMock = vi.hoisted(() => vi.fn())
const toastErrorMock = vi.hoisted(() => vi.fn())
const documentInfoMock = vi.hoisted(() => ({
  collectionSlug: 'pages' as string | undefined,
  docPermissions: {},
  getDocPreferences: vi.fn().mockResolvedValue({ fields: {} }),
  globalSlug: undefined as string | undefined,
  id: 123 as number | undefined,
  setUnpublishedVersionCount: vi.fn(),
  uploadStatus: undefined,
}))

vi.mock('@payloadcms/ui', () => ({
  Button: ({
    buttonStyle: _buttonStyle,
    children,
    margin: _margin,
    onClick,
    size: _size,
    ...properties
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    buttonStyle?: string
    margin?: boolean
    size?: string
  }) => (
    <button {...properties} onClick={onClick}>
      {children}
    </button>
  ),
  toast: { error: toastErrorMock },
  useConfig: () => ({ config: { routes: { api: '/api' } } }),
  useDocumentInfo: () => documentInfoMock,
  useForm: () => ({
    dispatchFields: dispatchFieldsMock,
    getFields: () => ({ title: { valid: true, value: 'Strona testowa' } }),
    setIsValid: setIsValidMock,
    setSubmitted: setSubmittedMock,
    submit: submitMock,
  }),
  useFormFields: (selector: (state: [{ slug: { value: string } }]) => unknown) =>
    selector([{ slug: { value: 'strona-testowa' } }]),
  useFormProcessing: () => false,
  useLocale: () => ({ code: 'pl' }),
  useServerFunctions: () => ({ getFormState: getFormStateMock }),
  useTranslation: () => ({ t: () => 'Popraw nieprawidłowe pola.' }),
}))

vi.mock('payload/shared', () => ({
  formatAdminURL: ({ apiRoute, path }: { apiRoute: string; path: string }) => `${apiRoute}${path}`,
}))

import { DraftPreviewButton } from '@/components/admin/DraftPreviewButton'

describe('DraftPreviewButton', () => {
  let container: HTMLDivElement
  let root: Root
  const previewWindow = {
    close: vi.fn(),
    location: { href: 'about:blank' },
    opener: window,
  }

  beforeEach(() => {
    ;(
      globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
    previewWindow.close.mockReset()
    previewWindow.location.href = 'about:blank'
    previewWindow.opener = window
    dispatchFieldsMock.mockReset()
    getFormStateMock.mockReset()
    getFormStateMock.mockResolvedValue({ state: { title: { valid: true } } })
    setIsValidMock.mockReset()
    setSubmittedMock.mockReset()
    submitMock.mockReset()
    submitMock.mockResolvedValue({ res: { ok: true } })
    toastErrorMock.mockReset()
    documentInfoMock.collectionSlug = 'pages'
    documentInfoMock.globalSlug = undefined
    documentInfoMock.id = 123
    vi.spyOn(window, 'open').mockReturnValue(previewWindow as unknown as Window)
  })

  afterEach(async () => {
    await act(async () => root.unmount())
    container.remove()
    vi.restoreAllMocks()
  })

  it('uses publish-level form validation before saving the preview draft', async () => {
    await act(async () => root.render(<DraftPreviewButton />))

    const button = container.querySelector<HTMLButtonElement>('#preview-button')
    if (!button) throw new Error('Missing preview button')

    await act(async () => button.click())

    expect(getFormStateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        collectionSlug: 'pages',
        id: 123,
        operation: 'update',
        schemaPath: 'pages',
        skipValidation: false,
      }),
    )
    expect(submitMock).toHaveBeenCalledOnce()
    expect(submitMock.mock.calls[0]?.[0]).toMatchObject({
      action: '/api/pages/123?locale=pl&depth=0&fallback-locale=null&draft=true',
      method: 'PATCH',
      overrides: { _status: 'draft' },
    })
    expect(submitMock.mock.calls[0]?.[0]).not.toHaveProperty('skipValidation')
  })

  it('shows server validation errors without saving or opening the preview', async () => {
    getFormStateMock.mockResolvedValue({
      state: {
        layout__0__items: {
          errorMessage: 'Wybierz cel dla każdej treści.',
          valid: false,
        },
      },
    })
    await act(async () => root.render(<DraftPreviewButton />))

    const button = container.querySelector<HTMLButtonElement>('#preview-button')
    if (!button) throw new Error('Missing preview button')

    await act(async () => button.click())

    expect(submitMock).not.toHaveBeenCalled()
    expect(dispatchFieldsMock).toHaveBeenCalledWith({
      prevStateRef: expect.objectContaining({ current: expect.any(Object) }),
      serverState: {
        layout__0__items: {
          errorMessage: 'Wybierz cel dla każdej treści.',
          valid: false,
        },
      },
      type: 'MERGE_SERVER_STATE',
    })
    expect(setIsValidMock).toHaveBeenCalledWith(false)
    expect(setSubmittedMock).toHaveBeenCalledWith(true)
    expect(previewWindow.close).toHaveBeenCalledOnce()
    expect(previewWindow.location.href).toBe('about:blank')
    expect(toastErrorMock).toHaveBeenCalledWith('Popraw nieprawidłowe pola.')
  })

  it('saves a global draft before opening its homepage preview', async () => {
    documentInfoMock.collectionSlug = undefined
    documentInfoMock.globalSlug = 'homepage-hero'
    documentInfoMock.id = undefined

    await act(async () => root.render(<DraftPreviewButton />))

    const button = container.querySelector<HTMLButtonElement>('#preview-button')
    if (!button) throw new Error('Missing preview button')

    await act(async () => button.click())

    expect(getFormStateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        globalSlug: 'homepage-hero',
        operation: 'update',
        schemaPath: 'homepage-hero',
        skipValidation: false,
      }),
    )
    expect(submitMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: '/api/globals/homepage-hero?locale=pl&depth=0&fallback-locale=null&draft=true',
        method: 'POST',
        overrides: { _status: 'draft' },
      }),
    )
    expect(previewWindow.location.href).toBe('/preview?global=homepage-hero')
  })
})
