import Image from 'next/image'
import Link from 'next/link'

export function SiteHeader() {
  return (
    <header className="siteHeader">
      <Link aria-label="Wrocławski Klub Fantastyki — strona główna" className="siteBrand" href="/">
        <Image alt="" height={76} priority src="/assets/logo-color.webp" width={76} />
        <span>
          Wrocławski
          <br />
          Klub Fantastyki
        </span>
      </Link>
      <nav aria-label="Główna nawigacja">
        <Link href="/blog">Aktualności</Link>
        <Link href="/o-nas">O nas</Link>
      </nav>
    </header>
  )
}
