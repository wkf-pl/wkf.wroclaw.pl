import type { Metadata } from 'next'
import { Roboto_Slab } from 'next/font/google'
import type { ReactNode } from 'react'

import {
  getPublicFooter,
  getPublicNavigation,
  getPublicSiteSettings,
} from '@/modules/content/public-content'

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

const icons: Metadata['icons'] = {
  apple: '/assets/apple-touch-icon.png',
  icon: [
    { sizes: '16x16', type: 'image/png', url: '/assets/favicon-16.png' },
    { sizes: '32x32', type: 'image/png', url: '/assets/favicon-32.png' },
  ],
}

export async function generateMetadata(): Promise<Metadata> {
  const siteSettings = await getPublicSiteSettings()

  return {
    description: siteSettings.siteDescription || undefined,
    icons,
    title: {
      default: siteSettings.siteName,
      template: `%s | ${siteSettings.siteName}`,
    },
  }
}

type FrontendLayoutProperties = {
  children: ReactNode
}

export default async function FrontendLayout({ children }: FrontendLayoutProperties) {
  const [footer, navigation, siteSettings] = await Promise.all([
    getPublicFooter(),
    getPublicNavigation(),
    getPublicSiteSettings(),
  ])

  return (
    <html lang="pl">
      <body className={robotoSlab.variable}>
        <SiteHeader navigation={navigation} siteSettings={siteSettings} />
        {children}
        <SiteFooter footer={footer} navigation={navigation} siteSettings={siteSettings} />
      </body>
    </html>
  )
}
