import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import './styles.css'

export const metadata: Metadata = {
  description: 'Serwis Wrocławskiego Klubu Fantastyki',
  title: {
    default: 'Wrocławski Klub Fantastyki',
    template: '%s | Wrocławski Klub Fantastyki',
  },
}

type FrontendLayoutProperties = {
  children: ReactNode
}

export default function FrontendLayout({ children }: FrontendLayoutProperties) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  )
}
