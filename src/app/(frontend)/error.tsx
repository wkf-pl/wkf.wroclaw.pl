'use client'

import { HttpErrorPage } from '@/components/http-errors/HttpErrorPage'

import '@/components/http-errors/http-error.css'

export default function ErrorPage({ retry }: { retry: () => void }) {
  return <HttpErrorPage status={500} onRetry={retry} />
}
