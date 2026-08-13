import type { Metadata } from 'next'
import { Roboto_Slab } from 'next/font/google'
import type { ReactNode } from 'react'

import { getPublicFooter, getPublicNavigation } from '@/modules/content/public-content'

import { SiteFooter } from './_components/SiteFooter'
import { SiteHeader } from './_components/SiteHeader'

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

export default async function FrontendLayout({ children }: FrontendLayoutProperties) {
  const [navigation, footer] = await Promise.all([getPublicNavigation(), getPublicFooter()])

  return (
    <html lang="pl">
      <body className={robotoSlab.variable}>
        <SiteHeader navigation={navigation} />
        {children}
        <SiteFooter footer={footer} navigation={navigation} />
      </body>
    </html>
  )
}
