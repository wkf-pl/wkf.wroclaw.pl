import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { getCurrentUser, normalizeLocalReturnPath } from '@/modules/auth/current-user'

import { LoginForm } from '../_components/LoginForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  robots: { index: false },
  title: 'Logowanie',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [user, resolvedSearchParams] = await Promise.all([getCurrentUser(), searchParams])
  const returnTo = normalizeLocalReturnPath(
    Array.isArray(resolvedSearchParams.returnTo)
      ? resolvedSearchParams.returnTo[0]
      : resolvedSearchParams.returnTo,
  )

  if (user) {
    redirect(returnTo)
  }

  return (
    <main className="contentShell">
      <section className="loginPanel">
        <p className="eyebrow">Konto klubowe</p>
        <h1>Logowanie</h1>
        <p className="contentLead">Zaloguj się, aby zobaczyć treści przeznaczone dla Twoich ról.</p>
        <LoginForm returnTo={returnTo} />
      </section>
    </main>
  )
}
