import Image from 'next/image'

export function AdminLogo() {
  return (
    <div className="wkf-admin-brand">
      <Image
        alt=""
        aria-hidden="true"
        className="wkf-admin-brand__logo"
        height={464}
        priority
        src="/assets/logo-black.webp"
        width={493}
      />
      <div className="wkf-admin-brand__title">Wrocławski Klub Fantastyki</div>
      <div className="wkf-admin-brand__subtitle">Panel administracyjny</div>
    </div>
  )
}
