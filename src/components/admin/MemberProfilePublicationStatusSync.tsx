'use client'

import { useDocumentInfo } from '@payloadcms/ui'
import { useEffect } from 'react'

export function MemberProfilePublicationStatusSync() {
  const { data, hasPublishedDoc, setHasPublishedDoc } = useDocumentInfo()

  useEffect(() => {
    if (data?._status === 'published' && !hasPublishedDoc) {
      setHasPublishedDoc(true)
    }
  }, [data?._status, hasPublishedDoc, setHasPublishedDoc])

  return null
}
