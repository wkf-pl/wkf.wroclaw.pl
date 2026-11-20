import { Roboto_Slab } from 'next/font/google'
import type { ReactNode } from 'react'

import '../(frontend)/styles.css'

const robotoSlab = Roboto_Slab({
  display: 'swap',
  subsets: ['latin', 'latin-ext'],
  variable: '--font-roboto-slab',
})

export default function ListingPreviewLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pl">
      <body className={robotoSlab.variable} style={{ minHeight: 0 }}>
        {children}
      </body>
    </html>
  )
}
