import { isSelectableRasterIconName } from '@/modules/icons/icon-registry'

import { RasterIcon } from './RasterIcon'

export function TagLabel({ name, groupIcon }: { name: string; groupIcon?: unknown }) {
  return (
    <span className="wkf-tag-label">
      {isSelectableRasterIconName(groupIcon) ? <RasterIcon name={groupIcon} size="small" /> : null}
      {name}
    </span>
  )
}
