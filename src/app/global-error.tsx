'use client'

import { HttpErrorPage } from '@/components/http-errors/HttpErrorPage'

import '@/components/http-errors/http-error.css'

export default function GlobalError() {
  return (
    <html lang="pl">
      <body className="httpErrorDocument">
        <title>Coś poszło nie tak | Wrocławski Klub Fantastyki</title>
        <HttpErrorPage status={500} onRetry={() => window.location.reload()} />
      </body>
    </html>
  )
}
