'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function AccountActions({ displayName }: { displayName?: null | string }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!displayName) {
    return (
      <Link className="headerAccountLink" href="/login">
        Zaloguj się
      </Link>
    )
  }

  async function logout() {
    setIsSubmitting(true)
    try {
      await fetch('/api/users/logout', { credentials: 'include', method: 'POST' })
      router.push('/')
      router.refresh()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="headerAccountActions">
      <Link className="headerAccountLink" href="/admin/account">
        {displayName}
      </Link>
      <button disabled={isSubmitting} onClick={logout} type="button">
        {isSubmitting ? 'Wylogowywanie…' : 'Wyloguj'}
      </button>
    </div>
  )
}
