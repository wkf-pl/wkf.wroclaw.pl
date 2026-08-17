import type { UIFieldServerProps } from 'payload'

import { findMemberProfileUsages } from '@/modules/members/member-profile-usages'

export async function MemberProfileUsage({ data, id, payload }: UIFieldServerProps) {
  if (id === undefined) {
    return (
      <div className="wkf-profile-usage">
        <p>Zapisz wizytówkę, aby zobaczyć miejsca jej wyświetlania.</p>
      </div>
    )
  }

  const slug = typeof data.slug === 'string' ? data.slug : null
  const isPublic = data._status === 'published'
  const usages = await findMemberProfileUsages({ id, isPublic, payload, slug })

  return (
    <div className="wkf-profile-usage">
      <p className="wkf-profile-usage__description">
        Lista jest wyliczana automatycznie na podstawie publicznych tras i bloków stron.
      </p>
      <ul>
        {usages.map((usage) => (
          <li key={`${usage.type}-${usage.adminPath ?? usage.publicPath}`}>
            {usage.adminPath ? <a href={usage.adminPath}>{usage.label}</a> : usage.label}
            {usage.status ? (
              <span> ({usage.status === 'published' ? 'opublikowana' : 'szkic'})</span>
            ) : null}
            {usage.type === 'profile' && !isPublic ? <span> (obecnie niewidoczny)</span> : null}
            {usage.publicPath ? (
              <>
                {usage.adminPath ? ' · ' : ': '}
                <a href={usage.publicPath} rel="noreferrer" target="_blank">
                  {usage.adminPath ? 'zobacz stronę' : usage.publicPath}
                </a>
              </>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )
}
