'use client'

import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'

export function LoginForm({ returnTo }: { returnTo: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    const form = new FormData(event.currentTarget)

    try {
      const response = await fetch('/api/users/login', {
        body: JSON.stringify({ email: form.get('email'), password: form.get('password') }),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })

      if (!response.ok) {
        setError('Nieprawidłowy adres e-mail lub hasło.')
        return
      }

      router.push(returnTo)
      router.refresh()
    } catch {
      setError('Logowanie jest chwilowo niedostępne. Spróbuj ponownie.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="loginForm" onSubmit={submit}>
      <label>
        Adres e-mail
        <input autoComplete="email" name="email" required type="email" />
      </label>
      <label>
        Hasło
        <input autoComplete="current-password" name="password" required type="password" />
      </label>
      {error ? (
        <p className="formError" role="alert">
          {error}
        </p>
      ) : null}
      <button disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Logowanie…' : 'Zaloguj się'}
      </button>
    </form>
  )
}
