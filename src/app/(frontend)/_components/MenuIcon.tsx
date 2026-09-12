import { RasterIcon } from '@/components/RasterIcon'
import { isSelectableRasterIconName } from '@/modules/icons/icon-registry'

type MenuIconProperties = {
  iconName?: null | string
}

export function MenuIcon({ iconName }: MenuIconProperties) {
  return isSelectableRasterIconName(iconName) ? <RasterIcon name={iconName} size="medium" /> : null
}
