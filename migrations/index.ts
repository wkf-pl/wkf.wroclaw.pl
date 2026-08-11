import * as migration_20260810_194314_cms_content from './20260810_194314_cms_content'

export const migrations = [
  {
    up: migration_20260810_194314_cms_content.up,
    down: migration_20260810_194314_cms_content.down,
    name: '20260810_194314_cms_content',
  },
]
