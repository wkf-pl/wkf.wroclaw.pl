import Image from 'next/image'
import Link from 'next/link'

const plannedAreas = [
  'Treści redakcyjne',
  'Kalendarz wydarzeń',
  'Sesje RPG i zapisy',
  'Konta klubowiczów',
]

export default function HomePage() {
  return (
    <main className="pageShell">
      <section className="hero">
        <Image
          alt="Wrocławski Klub Fantastyki"
          className="logo"
          height={180}
          priority
          src="/assets/logo-color.webp"
          width={180}
        />

        <div>
          <p className="eyebrow">WKF Online</p>
          <h1>Nowa aplikacja klubowa jest w budowie</h1>
          <p className="lead">
            Zaplecze aplikacji jest gotowe do wdrażania kolejnych modułów klubowych.
          </p>
          <Link className="adminLink" href="/admin">
            Otwórz panel administracyjny
          </Link>
        </div>
      </section>

      <section aria-labelledby="planned-areas" className="moduleSection">
        <h2 id="planned-areas">Planowane obszary</h2>
        <ul>
          {plannedAreas.map((area) => (
            <li key={area}>{area}</li>
          ))}
        </ul>
      </section>
    </main>
  )
}
