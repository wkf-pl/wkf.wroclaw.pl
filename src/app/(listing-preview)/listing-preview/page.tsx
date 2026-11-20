import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import config from '@payload-config'
import { ListingPreviewContent } from '@/components/admin/ListingPreviewContent'

export const metadata = { robots: { index: false, follow: false }, title: 'Podgląd Listingu' }

export default async function ListingPreviewPage() {
  const requestHeaders = await headers()
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: requestHeaders })
  if (!user) notFound()
  return <ListingPreviewContent />
}
