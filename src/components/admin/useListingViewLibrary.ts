'use client'

import { useAuth, useDocumentForm } from '@payloadcms/ui'
import { useEffect, useState, type RefObject } from 'react'

import type { ListingView } from '@/payload-types'

type DocumentFormReference = RefObject<HTMLFormElement>

type LibraryRequest = {
  key: string
  promise: Promise<ListingView[]>
}

type LibraryResult = {
  key: string
  form: DocumentFormReference | undefined
  items?: ListingView[]
}

const libraryByForm = new WeakMap<DocumentFormReference, LibraryRequest>()
const emptyLibrary: ListingView[] = []

function loadLibrary(
  form: DocumentFormReference | undefined,
  key: string,
  libraryURL: string,
): Promise<ListingView[]> {
  const shared = form && libraryByForm.get(form)
  if (shared?.key === key) return shared.promise

  const promise = fetch(
    `${libraryURL}?depth=0&pagination=false&where[_status][equals]=published`,
  ).then(async (response) => {
    if (!response.ok) throw new Error('Could not load listing views')
    const result = (await response.json()) as { docs: ListingView[] }
    return result.docs
  })
  if (form) {
    const request = { key, promise }
    libraryByForm.set(form, request)
    void promise.catch(() => {
      if (libraryByForm.get(form) === request) libraryByForm.delete(form)
    })
  }
  return promise
}

export function useListingViewLibrary(libraryURL: string) {
  const { formRef } = useDocumentForm()
  const { user } = useAuth()
  const key = JSON.stringify([libraryURL, user?.collection, user?.id])
  const [result, setResult] = useState<LibraryResult>()

  useEffect(() => {
    let subscribed = true
    void loadLibrary(formRef, key, libraryURL).then(
      (items) => {
        if (subscribed) setResult({ key, form: formRef, items })
      },
      () => {
        if (subscribed) setResult({ key, form: formRef })
      },
    )
    return () => {
      subscribed = false
    }
  }, [formRef, key, libraryURL])

  const current = result?.key === key && result.form === formRef ? result : undefined
  return {
    library: current?.items ?? emptyLibrary,
    libraryError: Boolean(current && !current.items),
  }
}
