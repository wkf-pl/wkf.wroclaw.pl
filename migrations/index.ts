import * as migration_20260810_194314_cms_content from './20260810_194314_cms_content'
import * as migration_20260811_173414_roles_permissions from './20260811_173414_roles_permissions'

export const migrations = [
  {
    up: migration_20260810_194314_cms_content.up,
    down: migration_20260810_194314_cms_content.down,
    name: '20260810_194314_cms_content',
  },
  {
    up: migration_20260811_173414_roles_permissions.up,
    down: migration_20260811_173414_roles_permissions.down,
    name: '20260811_173414_roles_permissions',
  },
]
