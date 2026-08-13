import * as migration_20260810_194314_cms_content from './20260810_194314_cms_content'
import * as migration_20260811_173414_roles_permissions from './20260811_173414_roles_permissions'
import * as migration_20260812_152738 from './20260812_152738'
import * as migration_20260813_085107 from './20260813_085107'
import * as migration_20260813_134157_user_display_name_required from './20260813_134157_user_display_name_required'
import * as migration_20260813_141107_unique_user_display_name from './20260813_141107_unique_user_display_name'
import * as migration_20260813_153850_slack_system_icon from './20260813_153850_slack_system_icon'

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
  {
    up: migration_20260812_152738.up,
    down: migration_20260812_152738.down,
    name: '20260812_152738',
  },
  {
    up: migration_20260813_085107.up,
    down: migration_20260813_085107.down,
    name: '20260813_085107',
  },
  {
    up: migration_20260813_134157_user_display_name_required.up,
    down: migration_20260813_134157_user_display_name_required.down,
    name: '20260813_134157_user_display_name_required',
  },
  {
    up: migration_20260813_141107_unique_user_display_name.up,
    down: migration_20260813_141107_unique_user_display_name.down,
    name: '20260813_141107_unique_user_display_name',
  },
  {
    up: migration_20260813_153850_slack_system_icon.up,
    down: migration_20260813_153850_slack_system_icon.down,
    name: '20260813_153850_slack_system_icon',
  },
]
