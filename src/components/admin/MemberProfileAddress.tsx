import type { UIFieldServerProps } from 'payload'

export function MemberProfileAddress({ data }: UIFieldServerProps) {
  const slug = typeof data.slug === 'string' ? data.slug : null

  return (
    <div className="wkf-profile-sidebar-field">
      <p className="field-label">Adres profilu</p>
      {slug ? (
        <a href={`/members/${slug}`} rel="noreferrer" target="_blank">
          /members/{slug}
        </a>
      ) : (
        <p>Adres powstanie przy pierwszym zapisie.</p>
      )}
    </div>
  )
}
