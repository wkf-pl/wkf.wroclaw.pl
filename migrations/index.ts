import * as migration_20260810_194314_cms_content from './20260810_194314_cms_content'
import * as migration_20260811_173414_roles_permissions from './20260811_173414_roles_permissions'
import * as migration_20260812_152738 from './20260812_152738'
import * as migration_20260813_085107 from './20260813_085107'
import * as migration_20260813_134157_user_display_name_required from './20260813_134157_user_display_name_required'
import * as migration_20260813_141107_unique_user_display_name from './20260813_141107_unique_user_display_name'
import * as migration_20260813_153850_slack_system_icon from './20260813_153850_slack_system_icon'
import * as migration_20260813_203713 from './20260813_203713'
import * as migration_20260814_103530_documents from './20260814_103530_documents'
import * as migration_20260814_213808_member_profiles from './20260814_213808_member_profiles'
import * as migration_20260816_003649 from './20260816_003649'
import * as migration_20260816_010752_repair_footer_rich_text from './20260816_010752_repair_footer_rich_text'
import * as migration_20260816_130137_posts_layout from './20260816_130137_posts_layout'
import * as migration_20260816_150812_media_blocks from './20260816_150812_media_blocks'
import * as migration_20260816_193058_move_footer_settings_to_site_settings from './20260816_193058_move_footer_settings_to_site_settings'
import * as migration_20260816_205033_unified_web_permissions from './20260816_205033_unified_web_permissions'
import * as migration_20260818_151047_events from './20260818_151047_events'
import * as migration_20260818_151505_event_calendar_tracking from './20260818_151505_event_calendar_tracking'
import * as migration_20260818_164834_event_cycle_default_title from './20260818_164834_event_cycle_default_title'
import * as migration_20260818_181938_event_link_targets from './20260818_181938_event_link_targets'
import * as migration_20260821_092652_content_listing_index from './20260821_092652_content_listing_index'
import * as migration_20260823_001526_simplify_public_access from './20260823_001526_simplify_public_access'
import * as migration_20260823_103700_remove_orphan_document_versions from './20260823_103700_remove_orphan_document_versions'
import * as migration_20260823_232129 from './20260823_232129'
import * as migration_20260824_203157 from './20260824_203157'
import * as migration_20260826_101435_member_profile_views from './20260826_101435_member_profile_views'

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
    name: '20260816_205033_unified_web_permissions',
  },
  {
    up: migration_20260818_151047_events.up,
    down: migration_20260818_151047_events.down,
    name: '20260818_151047_events',
  },
  {
    up: migration_20260818_151505_event_calendar_tracking.up,
    down: migration_20260818_151505_event_calendar_tracking.down,
    name: '20260818_151505_event_calendar_tracking',
  },
  {
    up: migration_20260818_164834_event_cycle_default_title.up,
    down: migration_20260818_164834_event_cycle_default_title.down,
    name: '20260818_164834_event_cycle_default_title',
  },
  {
    up: migration_20260818_181938_event_link_targets.up,
    down: migration_20260818_181938_event_link_targets.down,
    name: '20260818_181938_event_link_targets',
  },
  {
    up: migration_20260821_092652_content_listing_index.up,
    down: migration_20260821_092652_content_listing_index.down,
    name: '20260821_092652_content_listing_index',
  },
  {
    up: migration_20260823_001526_simplify_public_access.up,
    down: migration_20260823_001526_simplify_public_access.down,
    name: '20260823_001526_simplify_public_access',
  },
  {
    up: migration_20260823_103700_remove_orphan_document_versions.up,
    down: migration_20260823_103700_remove_orphan_document_versions.down,
    name: '20260823_103700_remove_orphan_document_versions',
  },
  {
    up: migration_20260823_232129.up,
    down: migration_20260823_232129.down,
    name: '20260823_232129',
  },
  {
    up: migration_20260824_203157.up,
    down: migration_20260824_203157.down,
    name: '20260824_203157',
  },
  {
    up: migration_20260826_101435_member_profile_views.up,
    down: migration_20260826_101435_member_profile_views.down,
    name: '20260826_101435_member_profile_views',
  },
]
