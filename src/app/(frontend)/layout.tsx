import type { Metadata } from 'next'
import { Roboto_Slab } from 'next/font/google'
import type { ReactNode } from 'react'

import { getPublicNavigation, getPublicSiteSettings } from '@/modules/content/public-content'

import { SiteFooter } from './_components/SiteFooter'
import { SiteHeader } from './_components/SiteHeader'

import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/captions.css'
import './styles.css'

const robotoSlab = Roboto_Slab({
  display: 'swap',
  subsets: ['latin', 'latin-ext'],
  variable: '--font-roboto-slab',
})

export const metadata: Metadata = {
  description: 'Serwis Wrocławskiego Klubu Fantastyki',
  icons: {
    apple: '/assets/apple-touch-icon.png',
    icon: [
      { sizes: '16x16', type: 'image/png', url: '/assets/favicon-16.png' },
      { sizes: '32x32', type: 'image/png', url: '/assets/favicon-32.png' },
    ],
  },
  title: {
    default: 'Wrocławski Klub Fantastyki',
    template: '%s | Wrocławski Klub Fantastyki',
  },
}

type FrontendLayoutProperties = {
  children: ReactNode
}

export default async function FrontendLayout({ children }: FrontendLayoutProperties) {
  const [navigation, siteSettings] = await Promise.all([
    getPublicNavigation(),
    getPublicSiteSettings(),
  ])

  return (
    <html lang="pl">
      <body className={robotoSlab.variable}>
        <SiteHeader navigation={navigation} />
        {children}
        <SiteFooter navigation={navigation} siteSettings={siteSettings} />
      </body>
    </html>
  )
}
