import Image from 'next/image'
import Link from 'next/link'

export function SiteHeader() {
  return (
    <header className="siteHeader">
      <Link aria-label="Wrocławski Klub Fantastyki — strona główna" className="siteBrand" href="/">
        <Image alt="" height={48} src="/assets/logo-color.webp" width={48} />
        <span>Wrocławski Klub Fantastyki</span>
      </Link>
      <nav aria-label="Główna nawigacja">
        <Link href="/blog">Blog</Link>
      </nav>
    </header>
  )
}
