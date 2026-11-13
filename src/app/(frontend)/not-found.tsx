import { HttpErrorPage } from '@/components/http-errors/HttpErrorPage'

import '@/components/http-errors/http-error.css'

export default function NotFound() {
  return <HttpErrorPage status={404} />
}
