import type { Metadata } from 'next'
import { Roboto_Slab } from 'next/font/google'
import type { ReactNode } from 'react'

import './styles.css'

const robotoSlab = Roboto_Slab({
  display: 'swap',
  subsets: ['latin', 'latin-ext'],
  variable: '--font-roboto-slab',
})

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
      <body className={robotoSlab.variable}>{children}</body>
    </html>
  )
}
