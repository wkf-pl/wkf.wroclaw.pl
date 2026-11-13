const errorMessages = {
  404: 'Nie znaleziono strony',
  500: 'Coś poszło nie tak',
  502: 'Serwis chwilowo niedostępny',
  503: 'Serwis chwilowo niedostępny',
  504: 'Serwis chwilowo niedostępny',
}

export function HttpErrorPage({
  status,
  onRetry,
}: {
  status: keyof typeof errorMessages
  onRetry?: () => void
}) {
  return (
    <main className="httpError">
      <div className="httpErrorHero">
        <span className="httpErrorCode">{status}</span>
      </div>
      <div className="httpErrorContent">
        <h1>{errorMessages[status]}</h1>
        <div className="httpErrorActions">
          {/* Use document navigation to recover from errors in the app router. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Recovery uses document navigation. */}
          {status === 404 && <a href="/events">Zobacz wydarzenia</a>}
          {onRetry && (
            <button type="button" onClick={onRetry}>
              Spróbuj ponownie
            </button>
          )}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Recovery uses document navigation. */}
          {status < 502 && <a href="/">Wróć na stronę główną</a>}
          {status !== 404 && <a href="mailto:webmaster@wkf.wroclaw.pl">Napisz do webmastera</a>}
        </div>
      </div>
    </main>
  )
}
