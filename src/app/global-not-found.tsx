import type { Metadata } from 'next'

import { HttpErrorPage } from '@/components/http-errors/HttpErrorPage'

import '@/components/http-errors/http-error.css'

export const metadata: Metadata = {
  title: 'Nie znaleziono strony | Wrocławski Klub Fantastyki',
}

export default function GlobalNotFound() {
  return (
    <html lang="pl">
      <body className="httpErrorDocument">
        <HttpErrorPage status={404} />
      </body>
    </html>
  )
}
