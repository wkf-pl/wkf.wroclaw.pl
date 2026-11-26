import Image from 'next/image'
import type { DefaultServerCellComponentProps } from 'payload'

import { getMemberProfileImageURL } from '@/modules/members/member-profile-image'
import type { MemberProfile } from '@/payload-types'

export function MemberProfilePhotoCell({ rowData }: DefaultServerCellComponentProps) {
  const { id, draftPhoto, photo } = rowData as Pick<MemberProfile, 'id' | 'draftPhoto' | 'photo'>
  const visiblePhoto = draftPhoto && 'removed' in draftPhoto ? null : (draftPhoto ?? photo)

  if (!visiblePhoto) return <span>{'<brak>'}</span>

  return (
    <Image
      alt="Zdjęcie wizytówki"
      height={48}
      src={getMemberProfileImageURL({ id, photo: visiblePhoto }, 'card')}
      unoptimized
      width={48}
    />
  )
}
