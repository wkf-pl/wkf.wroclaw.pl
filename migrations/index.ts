import * as migration_20260810_194314_cms_content from './20260810_194314_cms_content';
import * as migration_20260811_173414_roles_permissions from './20260811_173414_roles_permissions';
import * as migration_20260812_152738 from './20260812_152738';
import * as migration_20260813_085107 from './20260813_085107';
import * as migration_20260813_134157_user_display_name_required from './20260813_134157_user_display_name_required';
import * as migration_20260813_141107_unique_user_display_name from './20260813_141107_unique_user_display_name';
import * as migration_20260813_153850_slack_system_icon from './20260813_153850_slack_system_icon';
import * as migration_20260813_203713 from './20260813_203713';
import * as migration_20260814_103530_documents from './20260814_103530_documents';
import * as migration_20260814_213808_member_profiles from './20260814_213808_member_profiles';
import * as migration_20260816_003649 from './20260816_003649';
import * as migration_20260816_010752_repair_footer_rich_text from './20260816_010752_repair_footer_rich_text';
import * as migration_20260816_130137_posts_layout from './20260816_130137_posts_layout';
import * as migration_20260816_150812_media_blocks from './20260816_150812_media_blocks';
import * as migration_20260816_193058_move_footer_settings_to_site_settings from './20260816_193058_move_footer_settings_to_site_settings';
import * as migration_20260816_205033_unified_web_permissions from './20260816_205033_unified_web_permissions';

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
  {
    up: migration_20260813_203713.up,
    down: migration_20260813_203713.down,
    name: '20260813_203713',
  },
  {
    up: migration_20260814_103530_documents.up,
    down: migration_20260814_103530_documents.down,
    name: '20260814_103530_documents',
  },
  {
    up: migration_20260814_213808_member_profiles.up,
    down: migration_20260814_213808_member_profiles.down,
    name: '20260814_213808_member_profiles',
  },
  {
    up: migration_20260816_003649.up,
    down: migration_20260816_003649.down,
    name: '20260816_003649',
  },
  {
    up: migration_20260816_010752_repair_footer_rich_text.up,
    down: migration_20260816_010752_repair_footer_rich_text.down,
    name: '20260816_010752_repair_footer_rich_text',
  },
  {
    up: migration_20260816_130137_posts_layout.up,
    down: migration_20260816_130137_posts_layout.down,
    name: '20260816_130137_posts_layout',
  },
  {
    up: migration_20260816_150812_media_blocks.up,
    down: migration_20260816_150812_media_blocks.down,
    name: '20260816_150812_media_blocks',
  },
  {
    up: migration_20260816_193058_move_footer_settings_to_site_settings.up,
    down: migration_20260816_193058_move_footer_settings_to_site_settings.down,
    name: '20260816_193058_move_footer_settings_to_site_settings',
  },
  {
    up: migration_20260816_205033_unified_web_permissions.up,
    down: migration_20260816_205033_unified_web_permissions.down,
    name: '20260816_205033_unified_web_permissions'
  },
];
