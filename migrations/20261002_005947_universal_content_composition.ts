import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_rich_text_text_style" AS ENUM('default', 'lead', 'note');
  CREATE TYPE "public"."enum_pages_blocks_heading_role" AS ENUM('section', 'item');
  CREATE TYPE "public"."enum_pages_blocks_heading_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."appearance" AS ENUM('link', 'primaryButton', 'secondaryButton');
  CREATE TYPE "public"."enum_pages_blocks_action_links_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_pages_blocks_action_links_layout" AS ENUM('inline', 'stacked');
  CREATE TYPE "public"."enum_pages_blocks_action_links_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."sf" AS ENUM('default', 'subtle', 'inverse', 'image');
  CREATE TYPE "public"."sf_x" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."sf_y" AS ENUM('top', 'middle', 'bottom');
  CREATE TYPE "public"."enum_pages_blocks_column_layout_vertical_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum_pages_blocks_column_layout_column_separators" AS ENUM('none', 'between');
  CREATE TYPE "public"."enum_pages_blocks_section_group_frame" AS ENUM('outline', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_rich_text_text_style" AS ENUM('default', 'lead', 'note');
  CREATE TYPE "public"."enum__pages_v_blocks_heading_role" AS ENUM('section', 'item');
  CREATE TYPE "public"."enum__pages_v_blocks_heading_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum__pages_v_blocks_action_links_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum__pages_v_blocks_action_links_layout" AS ENUM('inline', 'stacked');
  CREATE TYPE "public"."enum__pages_v_blocks_action_links_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum__pages_v_blocks_column_layout_vertical_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum__pages_v_blocks_column_layout_column_separators" AS ENUM('none', 'between');
  CREATE TYPE "public"."enum__pages_v_blocks_section_group_frame" AS ENUM('outline', 'none');
  CREATE TYPE "public"."enum_posts_blocks_rich_text_text_style" AS ENUM('default', 'lead', 'note');
  CREATE TYPE "public"."enum_posts_blocks_heading_role" AS ENUM('section', 'item');
  CREATE TYPE "public"."enum_posts_blocks_heading_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_posts_blocks_action_links_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_posts_blocks_action_links_layout" AS ENUM('inline', 'stacked');
  CREATE TYPE "public"."enum_posts_blocks_action_links_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum_posts_blocks_column_layout_vertical_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum_posts_blocks_column_layout_column_separators" AS ENUM('none', 'between');
  CREATE TYPE "public"."enum_posts_blocks_section_group_frame" AS ENUM('outline', 'none');
  CREATE TYPE "public"."enum__posts_v_blocks_rich_text_text_style" AS ENUM('default', 'lead', 'note');
  CREATE TYPE "public"."enum__posts_v_blocks_heading_role" AS ENUM('section', 'item');
  CREATE TYPE "public"."enum__posts_v_blocks_heading_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum__posts_v_blocks_action_links_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum__posts_v_blocks_action_links_layout" AS ENUM('inline', 'stacked');
  CREATE TYPE "public"."enum__posts_v_blocks_action_links_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum__posts_v_blocks_column_layout_vertical_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum__posts_v_blocks_column_layout_column_separators" AS ENUM('none', 'between');
  CREATE TYPE "public"."enum__posts_v_blocks_section_group_frame" AS ENUM('outline', 'none');
  CREATE TYPE "public"."enum_events_blocks_rich_text_text_style" AS ENUM('default', 'lead', 'note');
  CREATE TYPE "public"."enum_events_blocks_heading_role" AS ENUM('section', 'item');
  CREATE TYPE "public"."enum_events_blocks_heading_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_events_blocks_action_links_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_events_blocks_action_links_layout" AS ENUM('inline', 'stacked');
  CREATE TYPE "public"."enum_events_blocks_action_links_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum_events_blocks_column_layout_vertical_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum_events_blocks_column_layout_column_separators" AS ENUM('none', 'between');
  CREATE TYPE "public"."enum_events_blocks_section_group_frame" AS ENUM('outline', 'none');
  CREATE TYPE "public"."enum__events_v_blocks_rich_text_text_style" AS ENUM('default', 'lead', 'note');
  CREATE TYPE "public"."enum__events_v_blocks_heading_role" AS ENUM('section', 'item');
  CREATE TYPE "public"."enum__events_v_blocks_heading_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum__events_v_blocks_action_links_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum__events_v_blocks_action_links_layout" AS ENUM('inline', 'stacked');
  CREATE TYPE "public"."enum__events_v_blocks_action_links_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum__events_v_blocks_column_layout_vertical_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum__events_v_blocks_column_layout_column_separators" AS ENUM('none', 'between');
  CREATE TYPE "public"."enum__events_v_blocks_section_group_frame" AS ENUM('outline', 'none');
  CREATE TYPE "public"."enum_event_cycles_blocks_rich_text_text_style" AS ENUM('default', 'lead', 'note');
  CREATE TYPE "public"."enum_event_cycles_blocks_heading_role" AS ENUM('section', 'item');
  CREATE TYPE "public"."enum_event_cycles_blocks_heading_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_event_cycles_blocks_action_links_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_event_cycles_blocks_action_links_layout" AS ENUM('inline', 'stacked');
  CREATE TYPE "public"."enum_event_cycles_blocks_action_links_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum_event_cycles_blocks_column_layout_vertical_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum_event_cycles_blocks_column_layout_column_separators" AS ENUM('none', 'between');
  CREATE TYPE "public"."enum_event_cycles_blocks_section_group_frame" AS ENUM('outline', 'none');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_rich_text_text_style" AS ENUM('default', 'lead', 'note');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_heading_role" AS ENUM('section', 'item');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_heading_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_action_links_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_action_links_layout" AS ENUM('inline', 'stacked');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_action_links_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_column_layout_vertical_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_column_layout_column_separators" AS ENUM('none', 'between');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_section_group_frame" AS ENUM('outline', 'none');
  CREATE TYPE "public"."enum_partners_blocks_rich_text_text_style" AS ENUM('default', 'lead', 'note');
  CREATE TYPE "public"."enum_partners_blocks_heading_role" AS ENUM('section', 'item');
  CREATE TYPE "public"."enum_partners_blocks_heading_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_partners_blocks_action_links_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_partners_blocks_action_links_layout" AS ENUM('inline', 'stacked');
  CREATE TYPE "public"."enum_partners_blocks_action_links_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum_partners_blocks_column_layout_vertical_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum_partners_blocks_column_layout_column_separators" AS ENUM('none', 'between');
  CREATE TYPE "public"."enum_partners_blocks_section_group_frame" AS ENUM('outline', 'none');
  CREATE TYPE "public"."enum__partners_v_blocks_rich_text_text_style" AS ENUM('default', 'lead', 'note');
  CREATE TYPE "public"."enum__partners_v_blocks_heading_role" AS ENUM('section', 'item');
  CREATE TYPE "public"."enum__partners_v_blocks_heading_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum__partners_v_blocks_action_links_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum__partners_v_blocks_action_links_layout" AS ENUM('inline', 'stacked');
  CREATE TYPE "public"."enum__partners_v_blocks_action_links_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum__partners_v_blocks_column_layout_vertical_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum__partners_v_blocks_column_layout_column_separators" AS ENUM('none', 'between');
  CREATE TYPE "public"."enum__partners_v_blocks_section_group_frame" AS ENUM('outline', 'none');
  CREATE TYPE "public"."enum_club_sections_menu_items_appearance" AS ENUM('link', 'primaryButton', 'secondaryButton');
  CREATE TYPE "public"."enum__club_sections_v_version_menu_items_appearance" AS ENUM('link', 'primaryButton', 'secondaryButton');
  CREATE TYPE "public"."enum_homepage_hero_items_appearance" AS ENUM('link', 'primaryButton', 'secondaryButton');
  CREATE TYPE "public"."enum_homepage_hero_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_homepage_sections_groups_menu_items_appearance" AS ENUM('link', 'primaryButton', 'secondaryButton');
  CREATE TYPE "public"."enum_footer_social_items_appearance" AS ENUM('link', 'primaryButton', 'secondaryButton');
  CREATE TYPE "public"."enum_footer_columns_items_appearance" AS ENUM('link', 'primaryButton', 'secondaryButton');
  CREATE TYPE "public"."enum_footer_columns_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  ALTER TYPE "public"."target" ADD VALUE 'siteContactEmail' BEFORE 'page';
  CREATE TABLE "pages_blocks_heading" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"role" "enum_pages_blocks_heading_role" DEFAULT 'section',
  	"icon_name" "enum_pages_blocks_heading_icon_name",
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_action_links_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"accessible_label" varchar,
  	"icon_name" "enum_pages_blocks_action_links_items_icon_name",
  	"target_type" "target" DEFAULT 'custom',
  	"event_cycle_id" integer,
  	"document_id" integer,
  	"category_id" integer,
  	"partner_id" integer,
  	"page_id" integer,
  	"tag_id" integer,
  	"post_id" integer,
  	"event_id" integer,
  	"custom_scheme" "scheme" DEFAULT 'https',
  	"custom_address" varchar,
  	"email_subject" varchar,
  	"email_body" varchar,
  	"open_in_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "pages_blocks_action_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"layout" "enum_pages_blocks_action_links_layout" DEFAULT 'inline',
  	"alignment" "enum_pages_blocks_action_links_alignment" DEFAULT 'start',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_section_group_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"surface" "sf" DEFAULT 'default',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle'
  );
  
  CREATE TABLE "pages_blocks_section_group" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"frame" "enum_pages_blocks_section_group_frame" DEFAULT 'outline',
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_heading" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"role" "enum__pages_v_blocks_heading_role" DEFAULT 'section',
  	"icon_name" "enum__pages_v_blocks_heading_icon_name",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_action_links_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"accessible_label" varchar,
  	"icon_name" "enum__pages_v_blocks_action_links_items_icon_name",
  	"target_type" "target" DEFAULT 'custom',
  	"event_cycle_id" integer,
  	"document_id" integer,
  	"category_id" integer,
  	"partner_id" integer,
  	"page_id" integer,
  	"tag_id" integer,
  	"post_id" integer,
  	"event_id" integer,
  	"custom_scheme" "scheme" DEFAULT 'https',
  	"custom_address" varchar,
  	"email_subject" varchar,
  	"email_body" varchar,
  	"open_in_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_action_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"layout" "enum__pages_v_blocks_action_links_layout" DEFAULT 'inline',
  	"alignment" "enum__pages_v_blocks_action_links_alignment" DEFAULT 'start',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_section_group_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"surface" "sf" DEFAULT 'default',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_section_group" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"frame" "enum__pages_v_blocks_section_group_frame" DEFAULT 'outline',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_heading" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"role" "enum_posts_blocks_heading_role" DEFAULT 'section',
  	"icon_name" "enum_posts_blocks_heading_icon_name",
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_action_links_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"accessible_label" varchar,
  	"icon_name" "enum_posts_blocks_action_links_items_icon_name",
  	"target_type" "target" DEFAULT 'custom',
  	"event_cycle_id" integer,
  	"document_id" integer,
  	"category_id" integer,
  	"partner_id" integer,
  	"page_id" integer,
  	"tag_id" integer,
  	"post_id" integer,
  	"event_id" integer,
  	"custom_scheme" "scheme" DEFAULT 'https',
  	"custom_address" varchar,
  	"email_subject" varchar,
  	"email_body" varchar,
  	"open_in_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "posts_blocks_action_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"layout" "enum_posts_blocks_action_links_layout" DEFAULT 'inline',
  	"alignment" "enum_posts_blocks_action_links_alignment" DEFAULT 'start',
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_section_group_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"surface" "sf" DEFAULT 'default',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle'
  );
  
  CREATE TABLE "posts_blocks_section_group" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"frame" "enum_posts_blocks_section_group_frame" DEFAULT 'outline',
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_heading" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"role" "enum__posts_v_blocks_heading_role" DEFAULT 'section',
  	"icon_name" "enum__posts_v_blocks_heading_icon_name",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_action_links_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"accessible_label" varchar,
  	"icon_name" "enum__posts_v_blocks_action_links_items_icon_name",
  	"target_type" "target" DEFAULT 'custom',
  	"event_cycle_id" integer,
  	"document_id" integer,
  	"category_id" integer,
  	"partner_id" integer,
  	"page_id" integer,
  	"tag_id" integer,
  	"post_id" integer,
  	"event_id" integer,
  	"custom_scheme" "scheme" DEFAULT 'https',
  	"custom_address" varchar,
  	"email_subject" varchar,
  	"email_body" varchar,
  	"open_in_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_action_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"layout" "enum__posts_v_blocks_action_links_layout" DEFAULT 'inline',
  	"alignment" "enum__posts_v_blocks_action_links_alignment" DEFAULT 'start',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_section_group_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"surface" "sf" DEFAULT 'default',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_section_group" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"frame" "enum__posts_v_blocks_section_group_frame" DEFAULT 'outline',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "events_blocks_heading" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"role" "enum_events_blocks_heading_role" DEFAULT 'section',
  	"icon_name" "enum_events_blocks_heading_icon_name",
  	"block_name" varchar
  );
  
  CREATE TABLE "events_blocks_action_links_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"accessible_label" varchar,
  	"icon_name" "enum_events_blocks_action_links_items_icon_name",
  	"target_type" "target" DEFAULT 'custom',
  	"event_cycle_id" integer,
  	"document_id" integer,
  	"category_id" integer,
  	"partner_id" integer,
  	"page_id" integer,
  	"tag_id" integer,
  	"post_id" integer,
  	"event_id" integer,
  	"custom_scheme" "scheme" DEFAULT 'https',
  	"custom_address" varchar,
  	"email_subject" varchar,
  	"email_body" varchar,
  	"open_in_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "events_blocks_action_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"layout" "enum_events_blocks_action_links_layout" DEFAULT 'inline',
  	"alignment" "enum_events_blocks_action_links_alignment" DEFAULT 'start',
  	"block_name" varchar
  );
  
  CREATE TABLE "events_blocks_section_group_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"surface" "sf" DEFAULT 'default',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle'
  );
  
  CREATE TABLE "events_blocks_section_group" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"frame" "enum_events_blocks_section_group_frame" DEFAULT 'outline',
  	"block_name" varchar
  );
  
  CREATE TABLE "_events_v_blocks_heading" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"role" "enum__events_v_blocks_heading_role" DEFAULT 'section',
  	"icon_name" "enum__events_v_blocks_heading_icon_name",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_events_v_blocks_action_links_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"accessible_label" varchar,
  	"icon_name" "enum__events_v_blocks_action_links_items_icon_name",
  	"target_type" "target" DEFAULT 'custom',
  	"event_cycle_id" integer,
  	"document_id" integer,
  	"category_id" integer,
  	"partner_id" integer,
  	"page_id" integer,
  	"tag_id" integer,
  	"post_id" integer,
  	"event_id" integer,
  	"custom_scheme" "scheme" DEFAULT 'https',
  	"custom_address" varchar,
  	"email_subject" varchar,
  	"email_body" varchar,
  	"open_in_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_events_v_blocks_action_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"layout" "enum__events_v_blocks_action_links_layout" DEFAULT 'inline',
  	"alignment" "enum__events_v_blocks_action_links_alignment" DEFAULT 'start',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_events_v_blocks_section_group_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"surface" "sf" DEFAULT 'default',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_events_v_blocks_section_group" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"frame" "enum__events_v_blocks_section_group_frame" DEFAULT 'outline',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "event_cycles_blocks_heading" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"role" "enum_event_cycles_blocks_heading_role" DEFAULT 'section',
  	"icon_name" "enum_event_cycles_blocks_heading_icon_name",
  	"block_name" varchar
  );
  
  CREATE TABLE "event_cycles_blocks_action_links_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"accessible_label" varchar,
  	"icon_name" "enum_event_cycles_blocks_action_links_items_icon_name",
  	"target_type" "target" DEFAULT 'custom',
  	"event_cycle_id" integer,
  	"document_id" integer,
  	"category_id" integer,
  	"partner_id" integer,
  	"page_id" integer,
  	"tag_id" integer,
  	"post_id" integer,
  	"event_id" integer,
  	"custom_scheme" "scheme" DEFAULT 'https',
  	"custom_address" varchar,
  	"email_subject" varchar,
  	"email_body" varchar,
  	"open_in_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "event_cycles_blocks_action_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"layout" "enum_event_cycles_blocks_action_links_layout" DEFAULT 'inline',
  	"alignment" "enum_event_cycles_blocks_action_links_alignment" DEFAULT 'start',
  	"block_name" varchar
  );
  
  CREATE TABLE "event_cycles_blocks_section_group_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"surface" "sf" DEFAULT 'default',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle'
  );
  
  CREATE TABLE "event_cycles_blocks_section_group" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"frame" "enum_event_cycles_blocks_section_group_frame" DEFAULT 'outline',
  	"block_name" varchar
  );
  
  CREATE TABLE "_event_cycles_v_blocks_heading" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"role" "enum__event_cycles_v_blocks_heading_role" DEFAULT 'section',
  	"icon_name" "enum__event_cycles_v_blocks_heading_icon_name",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_event_cycles_v_blocks_action_links_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"accessible_label" varchar,
  	"icon_name" "enum__event_cycles_v_blocks_action_links_items_icon_name",
  	"target_type" "target" DEFAULT 'custom',
  	"event_cycle_id" integer,
  	"document_id" integer,
  	"category_id" integer,
  	"partner_id" integer,
  	"page_id" integer,
  	"tag_id" integer,
  	"post_id" integer,
  	"event_id" integer,
  	"custom_scheme" "scheme" DEFAULT 'https',
  	"custom_address" varchar,
  	"email_subject" varchar,
  	"email_body" varchar,
  	"open_in_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_event_cycles_v_blocks_action_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"layout" "enum__event_cycles_v_blocks_action_links_layout" DEFAULT 'inline',
  	"alignment" "enum__event_cycles_v_blocks_action_links_alignment" DEFAULT 'start',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_event_cycles_v_blocks_section_group_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"surface" "sf" DEFAULT 'default',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_event_cycles_v_blocks_section_group" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"frame" "enum__event_cycles_v_blocks_section_group_frame" DEFAULT 'outline',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "partners_blocks_heading" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"role" "enum_partners_blocks_heading_role" DEFAULT 'section',
  	"icon_name" "enum_partners_blocks_heading_icon_name",
  	"block_name" varchar
  );
  
  CREATE TABLE "partners_blocks_action_links_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"accessible_label" varchar,
  	"icon_name" "enum_partners_blocks_action_links_items_icon_name",
  	"target_type" "target" DEFAULT 'custom',
  	"event_cycle_id" integer,
  	"document_id" integer,
  	"category_id" integer,
  	"partner_id" integer,
  	"page_id" integer,
  	"tag_id" integer,
  	"post_id" integer,
  	"event_id" integer,
  	"custom_scheme" "scheme" DEFAULT 'https',
  	"custom_address" varchar,
  	"email_subject" varchar,
  	"email_body" varchar,
  	"open_in_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "partners_blocks_action_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"layout" "enum_partners_blocks_action_links_layout" DEFAULT 'inline',
  	"alignment" "enum_partners_blocks_action_links_alignment" DEFAULT 'start',
  	"block_name" varchar
  );
  
  CREATE TABLE "partners_blocks_section_group_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"surface" "sf" DEFAULT 'default',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle'
  );
  
  CREATE TABLE "partners_blocks_section_group" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"frame" "enum_partners_blocks_section_group_frame" DEFAULT 'outline',
  	"block_name" varchar
  );
  
  CREATE TABLE "_partners_v_blocks_heading" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"role" "enum__partners_v_blocks_heading_role" DEFAULT 'section',
  	"icon_name" "enum__partners_v_blocks_heading_icon_name",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_partners_v_blocks_action_links_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"accessible_label" varchar,
  	"icon_name" "enum__partners_v_blocks_action_links_items_icon_name",
  	"target_type" "target" DEFAULT 'custom',
  	"event_cycle_id" integer,
  	"document_id" integer,
  	"category_id" integer,
  	"partner_id" integer,
  	"page_id" integer,
  	"tag_id" integer,
  	"post_id" integer,
  	"event_id" integer,
  	"custom_scheme" "scheme" DEFAULT 'https',
  	"custom_address" varchar,
  	"email_subject" varchar,
  	"email_body" varchar,
  	"open_in_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_partners_v_blocks_action_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"layout" "enum__partners_v_blocks_action_links_layout" DEFAULT 'inline',
  	"alignment" "enum__partners_v_blocks_action_links_alignment" DEFAULT 'start',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_partners_v_blocks_section_group_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"surface" "sf" DEFAULT 'default',
  	"surface_image_id" integer,
  	"surface_horizontal_position" "sf_x" DEFAULT 'center',
  	"surface_vertical_position" "sf_y" DEFAULT 'middle',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_partners_v_blocks_section_group" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"frame" "enum__partners_v_blocks_section_group_frame" DEFAULT 'outline',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "navigation_header_items" ADD COLUMN "accessible_label" varchar;
  ALTER TABLE "navigation_header_items" ALTER COLUMN "appearance" SET DATA TYPE text;
  ALTER TABLE "navigation_header_items" ALTER COLUMN "appearance" SET DEFAULT 'link'::text;
  UPDATE "navigation_header_items"
  SET
    "accessible_label" = CASE WHEN "appearance" = 'icon' THEN "label" ELSE NULL END,
    "label" = CASE WHEN "appearance" = 'icon' THEN '' ELSE "label" END,
    "appearance" = CASE
      WHEN "appearance" = 'button' THEN 'secondaryButton'
      ELSE 'link'
    END;
  DROP TYPE "public"."enum_navigation_header_items_appearance";
  CREATE TYPE "public"."enum_navigation_header_items_appearance" AS ENUM('link', 'primaryButton', 'secondaryButton');
  ALTER TABLE "navigation_header_items" ALTER COLUMN "appearance" SET DEFAULT 'link'::"public"."enum_navigation_header_items_appearance";
  ALTER TABLE "navigation_header_items" ALTER COLUMN "appearance" SET DATA TYPE "public"."enum_navigation_header_items_appearance" USING "appearance"::"public"."enum_navigation_header_items_appearance";
  ALTER TABLE "navigation_header_items" ALTER COLUMN "label" DROP NOT NULL;
  ALTER TABLE "homepage_hero_items" ALTER COLUMN "label" DROP NOT NULL;
  ALTER TABLE "homepage_sections_groups_menu_items" ALTER COLUMN "label" DROP NOT NULL;
  ALTER TABLE "footer_social_items" ALTER COLUMN "label" DROP NOT NULL;
  ALTER TABLE "footer_columns_items" ALTER COLUMN "label" DROP NOT NULL;
  ALTER TABLE "pages_blocks_rich_text" ADD COLUMN "text_style" "enum_pages_blocks_rich_text_text_style" DEFAULT 'default';
  ALTER TABLE "pages_blocks_column_layout_columns" ADD COLUMN "surface" "sf" DEFAULT 'default';
  ALTER TABLE "pages_blocks_column_layout_columns" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "pages_blocks_column_layout_columns" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "pages_blocks_column_layout_columns" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "pages_blocks_column_layout" ADD COLUMN "vertical_alignment" "enum_pages_blocks_column_layout_vertical_alignment" DEFAULT 'start';
  ALTER TABLE "pages_blocks_column_layout" ADD COLUMN "column_separators" "enum_pages_blocks_column_layout_column_separators" DEFAULT 'none';
  ALTER TABLE "_pages_v_blocks_rich_text" ADD COLUMN "text_style" "enum__pages_v_blocks_rich_text_text_style" DEFAULT 'default';
  ALTER TABLE "_pages_v_blocks_column_layout_columns" ADD COLUMN "surface" "sf" DEFAULT 'default';
  ALTER TABLE "_pages_v_blocks_column_layout_columns" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "_pages_v_blocks_column_layout_columns" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "_pages_v_blocks_column_layout_columns" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "_pages_v_blocks_column_layout" ADD COLUMN "vertical_alignment" "enum__pages_v_blocks_column_layout_vertical_alignment" DEFAULT 'start';
  ALTER TABLE "_pages_v_blocks_column_layout" ADD COLUMN "column_separators" "enum__pages_v_blocks_column_layout_column_separators" DEFAULT 'none';
  ALTER TABLE "posts_blocks_rich_text" ADD COLUMN "text_style" "enum_posts_blocks_rich_text_text_style" DEFAULT 'default';
  ALTER TABLE "posts_blocks_column_layout_columns" ADD COLUMN "surface" "sf" DEFAULT 'default';
  ALTER TABLE "posts_blocks_column_layout_columns" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "posts_blocks_column_layout_columns" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "posts_blocks_column_layout_columns" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "posts_blocks_column_layout" ADD COLUMN "vertical_alignment" "enum_posts_blocks_column_layout_vertical_alignment" DEFAULT 'start';
  ALTER TABLE "posts_blocks_column_layout" ADD COLUMN "column_separators" "enum_posts_blocks_column_layout_column_separators" DEFAULT 'none';
  ALTER TABLE "_posts_v_blocks_rich_text" ADD COLUMN "text_style" "enum__posts_v_blocks_rich_text_text_style" DEFAULT 'default';
  ALTER TABLE "_posts_v_blocks_column_layout_columns" ADD COLUMN "surface" "sf" DEFAULT 'default';
  ALTER TABLE "_posts_v_blocks_column_layout_columns" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "_posts_v_blocks_column_layout_columns" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "_posts_v_blocks_column_layout_columns" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "_posts_v_blocks_column_layout" ADD COLUMN "vertical_alignment" "enum__posts_v_blocks_column_layout_vertical_alignment" DEFAULT 'start';
  ALTER TABLE "_posts_v_blocks_column_layout" ADD COLUMN "column_separators" "enum__posts_v_blocks_column_layout_column_separators" DEFAULT 'none';
  ALTER TABLE "events_blocks_rich_text" ADD COLUMN "text_style" "enum_events_blocks_rich_text_text_style" DEFAULT 'default';
  ALTER TABLE "events_blocks_column_layout_columns" ADD COLUMN "surface" "sf" DEFAULT 'default';
  ALTER TABLE "events_blocks_column_layout_columns" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "events_blocks_column_layout_columns" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "events_blocks_column_layout_columns" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "events_blocks_column_layout" ADD COLUMN "vertical_alignment" "enum_events_blocks_column_layout_vertical_alignment" DEFAULT 'start';
  ALTER TABLE "events_blocks_column_layout" ADD COLUMN "column_separators" "enum_events_blocks_column_layout_column_separators" DEFAULT 'none';
  ALTER TABLE "_events_v_blocks_rich_text" ADD COLUMN "text_style" "enum__events_v_blocks_rich_text_text_style" DEFAULT 'default';
  ALTER TABLE "_events_v_blocks_column_layout_columns" ADD COLUMN "surface" "sf" DEFAULT 'default';
  ALTER TABLE "_events_v_blocks_column_layout_columns" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "_events_v_blocks_column_layout_columns" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "_events_v_blocks_column_layout_columns" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "_events_v_blocks_column_layout" ADD COLUMN "vertical_alignment" "enum__events_v_blocks_column_layout_vertical_alignment" DEFAULT 'start';
  ALTER TABLE "_events_v_blocks_column_layout" ADD COLUMN "column_separators" "enum__events_v_blocks_column_layout_column_separators" DEFAULT 'none';
  ALTER TABLE "event_cycles_blocks_rich_text" ADD COLUMN "text_style" "enum_event_cycles_blocks_rich_text_text_style" DEFAULT 'default';
  ALTER TABLE "event_cycles_blocks_column_layout_columns" ADD COLUMN "surface" "sf" DEFAULT 'default';
  ALTER TABLE "event_cycles_blocks_column_layout_columns" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "event_cycles_blocks_column_layout_columns" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "event_cycles_blocks_column_layout_columns" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "event_cycles_blocks_column_layout" ADD COLUMN "vertical_alignment" "enum_event_cycles_blocks_column_layout_vertical_alignment" DEFAULT 'start';
  ALTER TABLE "event_cycles_blocks_column_layout" ADD COLUMN "column_separators" "enum_event_cycles_blocks_column_layout_column_separators" DEFAULT 'none';
  ALTER TABLE "_event_cycles_v_blocks_rich_text" ADD COLUMN "text_style" "enum__event_cycles_v_blocks_rich_text_text_style" DEFAULT 'default';
  ALTER TABLE "_event_cycles_v_blocks_column_layout_columns" ADD COLUMN "surface" "sf" DEFAULT 'default';
  ALTER TABLE "_event_cycles_v_blocks_column_layout_columns" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "_event_cycles_v_blocks_column_layout_columns" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "_event_cycles_v_blocks_column_layout_columns" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "_event_cycles_v_blocks_column_layout" ADD COLUMN "vertical_alignment" "enum__event_cycles_v_blocks_column_layout_vertical_alignment" DEFAULT 'start';
  ALTER TABLE "_event_cycles_v_blocks_column_layout" ADD COLUMN "column_separators" "enum__event_cycles_v_blocks_column_layout_column_separators" DEFAULT 'none';
  ALTER TABLE "partners_blocks_rich_text" ADD COLUMN "text_style" "enum_partners_blocks_rich_text_text_style" DEFAULT 'default';
  ALTER TABLE "partners_blocks_column_layout_columns" ADD COLUMN "surface" "sf" DEFAULT 'default';
  ALTER TABLE "partners_blocks_column_layout_columns" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "partners_blocks_column_layout_columns" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "partners_blocks_column_layout_columns" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "partners_blocks_column_layout" ADD COLUMN "vertical_alignment" "enum_partners_blocks_column_layout_vertical_alignment" DEFAULT 'start';
  ALTER TABLE "partners_blocks_column_layout" ADD COLUMN "column_separators" "enum_partners_blocks_column_layout_column_separators" DEFAULT 'none';
  ALTER TABLE "_partners_v_blocks_rich_text" ADD COLUMN "text_style" "enum__partners_v_blocks_rich_text_text_style" DEFAULT 'default';
  ALTER TABLE "_partners_v_blocks_column_layout_columns" ADD COLUMN "surface" "sf" DEFAULT 'default';
  ALTER TABLE "_partners_v_blocks_column_layout_columns" ADD COLUMN "surface_image_id" integer;
  ALTER TABLE "_partners_v_blocks_column_layout_columns" ADD COLUMN "surface_horizontal_position" "sf_x" DEFAULT 'center';
  ALTER TABLE "_partners_v_blocks_column_layout_columns" ADD COLUMN "surface_vertical_position" "sf_y" DEFAULT 'middle';
  ALTER TABLE "_partners_v_blocks_column_layout" ADD COLUMN "vertical_alignment" "enum__partners_v_blocks_column_layout_vertical_alignment" DEFAULT 'start';
  ALTER TABLE "_partners_v_blocks_column_layout" ADD COLUMN "column_separators" "enum__partners_v_blocks_column_layout_column_separators" DEFAULT 'none';
  ALTER TABLE "club_sections_menu_items" ADD COLUMN "appearance" "enum_club_sections_menu_items_appearance" DEFAULT 'link';
  ALTER TABLE "club_sections_menu_items" ADD COLUMN "accessible_label" varchar;
  ALTER TABLE "_club_sections_v_version_menu_items" ADD COLUMN "appearance" "enum__club_sections_v_version_menu_items_appearance" DEFAULT 'link';
  ALTER TABLE "_club_sections_v_version_menu_items" ADD COLUMN "accessible_label" varchar;
  ALTER TABLE "homepage_hero_items" ADD COLUMN "appearance" "enum_homepage_hero_items_appearance" DEFAULT 'link' NOT NULL;
  ALTER TABLE "homepage_hero_items" ADD COLUMN "accessible_label" varchar;
  ALTER TABLE "homepage_hero_items" ADD COLUMN "icon_name" "enum_homepage_hero_items_icon_name";
  ALTER TABLE "homepage_sections_groups_menu_items" ADD COLUMN "appearance" "enum_homepage_sections_groups_menu_items_appearance" DEFAULT 'link' NOT NULL;
  ALTER TABLE "homepage_sections_groups_menu_items" ADD COLUMN "accessible_label" varchar;
  ALTER TABLE "footer_social_items" ADD COLUMN "appearance" "enum_footer_social_items_appearance" DEFAULT 'link' NOT NULL;
  ALTER TABLE "footer_social_items" ADD COLUMN "accessible_label" varchar;
  UPDATE "footer_social_items"
  SET "accessible_label" = "label", "label" = '';
  ALTER TABLE "footer_columns_items" ADD COLUMN "appearance" "enum_footer_columns_items_appearance" DEFAULT 'link' NOT NULL;
  ALTER TABLE "footer_columns_items" ADD COLUMN "accessible_label" varchar;
  ALTER TABLE "footer_columns_items" ADD COLUMN "icon_name" "enum_footer_columns_items_icon_name";
  ALTER TABLE "pages_blocks_heading" ADD CONSTRAINT "pages_blocks_heading_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_action_links_items" ADD CONSTRAINT "pages_blocks_action_links_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_action_links_items" ADD CONSTRAINT "pages_blocks_action_links_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_action_links_items" ADD CONSTRAINT "pages_blocks_action_links_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_action_links_items" ADD CONSTRAINT "pages_blocks_action_links_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_action_links_items" ADD CONSTRAINT "pages_blocks_action_links_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_action_links_items" ADD CONSTRAINT "pages_blocks_action_links_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_action_links_items" ADD CONSTRAINT "pages_blocks_action_links_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_action_links_items" ADD CONSTRAINT "pages_blocks_action_links_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_action_links_items" ADD CONSTRAINT "pages_blocks_action_links_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_action_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_action_links" ADD CONSTRAINT "pages_blocks_action_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_section_group_sections" ADD CONSTRAINT "pages_blocks_section_group_sections_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_section_group_sections" ADD CONSTRAINT "pages_blocks_section_group_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_section_group"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_section_group" ADD CONSTRAINT "pages_blocks_section_group_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_heading" ADD CONSTRAINT "_pages_v_blocks_heading_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_action_links_items" ADD CONSTRAINT "_pages_v_blocks_action_links_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_action_links_items" ADD CONSTRAINT "_pages_v_blocks_action_links_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_action_links_items" ADD CONSTRAINT "_pages_v_blocks_action_links_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_action_links_items" ADD CONSTRAINT "_pages_v_blocks_action_links_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_action_links_items" ADD CONSTRAINT "_pages_v_blocks_action_links_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_action_links_items" ADD CONSTRAINT "_pages_v_blocks_action_links_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_action_links_items" ADD CONSTRAINT "_pages_v_blocks_action_links_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_action_links_items" ADD CONSTRAINT "_pages_v_blocks_action_links_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_action_links_items" ADD CONSTRAINT "_pages_v_blocks_action_links_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_action_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_action_links" ADD CONSTRAINT "_pages_v_blocks_action_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_section_group_sections" ADD CONSTRAINT "_pages_v_blocks_section_group_sections_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_section_group_sections" ADD CONSTRAINT "_pages_v_blocks_section_group_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_section_group"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_section_group" ADD CONSTRAINT "_pages_v_blocks_section_group_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_heading" ADD CONSTRAINT "posts_blocks_heading_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_action_links_items" ADD CONSTRAINT "posts_blocks_action_links_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_action_links_items" ADD CONSTRAINT "posts_blocks_action_links_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_action_links_items" ADD CONSTRAINT "posts_blocks_action_links_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_action_links_items" ADD CONSTRAINT "posts_blocks_action_links_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_action_links_items" ADD CONSTRAINT "posts_blocks_action_links_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_action_links_items" ADD CONSTRAINT "posts_blocks_action_links_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_action_links_items" ADD CONSTRAINT "posts_blocks_action_links_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_action_links_items" ADD CONSTRAINT "posts_blocks_action_links_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_action_links_items" ADD CONSTRAINT "posts_blocks_action_links_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_action_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_action_links" ADD CONSTRAINT "posts_blocks_action_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_section_group_sections" ADD CONSTRAINT "posts_blocks_section_group_sections_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_section_group_sections" ADD CONSTRAINT "posts_blocks_section_group_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_section_group"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_section_group" ADD CONSTRAINT "posts_blocks_section_group_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_heading" ADD CONSTRAINT "_posts_v_blocks_heading_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_action_links_items" ADD CONSTRAINT "_posts_v_blocks_action_links_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_action_links_items" ADD CONSTRAINT "_posts_v_blocks_action_links_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_action_links_items" ADD CONSTRAINT "_posts_v_blocks_action_links_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_action_links_items" ADD CONSTRAINT "_posts_v_blocks_action_links_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_action_links_items" ADD CONSTRAINT "_posts_v_blocks_action_links_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_action_links_items" ADD CONSTRAINT "_posts_v_blocks_action_links_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_action_links_items" ADD CONSTRAINT "_posts_v_blocks_action_links_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_action_links_items" ADD CONSTRAINT "_posts_v_blocks_action_links_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_action_links_items" ADD CONSTRAINT "_posts_v_blocks_action_links_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_action_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_action_links" ADD CONSTRAINT "_posts_v_blocks_action_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_section_group_sections" ADD CONSTRAINT "_posts_v_blocks_section_group_sections_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_section_group_sections" ADD CONSTRAINT "_posts_v_blocks_section_group_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_section_group"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_section_group" ADD CONSTRAINT "_posts_v_blocks_section_group_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_blocks_heading" ADD CONSTRAINT "events_blocks_heading_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_blocks_action_links_items" ADD CONSTRAINT "events_blocks_action_links_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_action_links_items" ADD CONSTRAINT "events_blocks_action_links_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_action_links_items" ADD CONSTRAINT "events_blocks_action_links_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_action_links_items" ADD CONSTRAINT "events_blocks_action_links_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_action_links_items" ADD CONSTRAINT "events_blocks_action_links_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_action_links_items" ADD CONSTRAINT "events_blocks_action_links_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_action_links_items" ADD CONSTRAINT "events_blocks_action_links_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_action_links_items" ADD CONSTRAINT "events_blocks_action_links_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_action_links_items" ADD CONSTRAINT "events_blocks_action_links_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events_blocks_action_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_blocks_action_links" ADD CONSTRAINT "events_blocks_action_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_blocks_section_group_sections" ADD CONSTRAINT "events_blocks_section_group_sections_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_section_group_sections" ADD CONSTRAINT "events_blocks_section_group_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events_blocks_section_group"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_blocks_section_group" ADD CONSTRAINT "events_blocks_section_group_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_heading" ADD CONSTRAINT "_events_v_blocks_heading_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_action_links_items" ADD CONSTRAINT "_events_v_blocks_action_links_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_action_links_items" ADD CONSTRAINT "_events_v_blocks_action_links_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_action_links_items" ADD CONSTRAINT "_events_v_blocks_action_links_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_action_links_items" ADD CONSTRAINT "_events_v_blocks_action_links_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_action_links_items" ADD CONSTRAINT "_events_v_blocks_action_links_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_action_links_items" ADD CONSTRAINT "_events_v_blocks_action_links_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_action_links_items" ADD CONSTRAINT "_events_v_blocks_action_links_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_action_links_items" ADD CONSTRAINT "_events_v_blocks_action_links_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_action_links_items" ADD CONSTRAINT "_events_v_blocks_action_links_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v_blocks_action_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_action_links" ADD CONSTRAINT "_events_v_blocks_action_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_section_group_sections" ADD CONSTRAINT "_events_v_blocks_section_group_sections_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_section_group_sections" ADD CONSTRAINT "_events_v_blocks_section_group_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v_blocks_section_group"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_section_group" ADD CONSTRAINT "_events_v_blocks_section_group_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_heading" ADD CONSTRAINT "event_cycles_blocks_heading_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_cycles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_action_links_items" ADD CONSTRAINT "event_cycles_blocks_action_links_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_action_links_items" ADD CONSTRAINT "event_cycles_blocks_action_links_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_action_links_items" ADD CONSTRAINT "event_cycles_blocks_action_links_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_action_links_items" ADD CONSTRAINT "event_cycles_blocks_action_links_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_action_links_items" ADD CONSTRAINT "event_cycles_blocks_action_links_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_action_links_items" ADD CONSTRAINT "event_cycles_blocks_action_links_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_action_links_items" ADD CONSTRAINT "event_cycles_blocks_action_links_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_action_links_items" ADD CONSTRAINT "event_cycles_blocks_action_links_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_action_links_items" ADD CONSTRAINT "event_cycles_blocks_action_links_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_cycles_blocks_action_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_action_links" ADD CONSTRAINT "event_cycles_blocks_action_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_cycles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_section_group_sections" ADD CONSTRAINT "event_cycles_blocks_section_group_sections_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_section_group_sections" ADD CONSTRAINT "event_cycles_blocks_section_group_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_cycles_blocks_section_group"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_section_group" ADD CONSTRAINT "event_cycles_blocks_section_group_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_cycles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_heading" ADD CONSTRAINT "_event_cycles_v_blocks_heading_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_event_cycles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_action_links_items" ADD CONSTRAINT "_event_cycles_v_blocks_action_links_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_action_links_items" ADD CONSTRAINT "_event_cycles_v_blocks_action_links_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_action_links_items" ADD CONSTRAINT "_event_cycles_v_blocks_action_links_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_action_links_items" ADD CONSTRAINT "_event_cycles_v_blocks_action_links_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_action_links_items" ADD CONSTRAINT "_event_cycles_v_blocks_action_links_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_action_links_items" ADD CONSTRAINT "_event_cycles_v_blocks_action_links_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_action_links_items" ADD CONSTRAINT "_event_cycles_v_blocks_action_links_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_action_links_items" ADD CONSTRAINT "_event_cycles_v_blocks_action_links_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_action_links_items" ADD CONSTRAINT "_event_cycles_v_blocks_action_links_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_event_cycles_v_blocks_action_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_action_links" ADD CONSTRAINT "_event_cycles_v_blocks_action_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_event_cycles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_section_group_sections" ADD CONSTRAINT "_event_cycles_v_blocks_section_group_sections_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_section_group_sections" ADD CONSTRAINT "_event_cycles_v_blocks_section_group_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_event_cycles_v_blocks_section_group"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_section_group" ADD CONSTRAINT "_event_cycles_v_blocks_section_group_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_event_cycles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_blocks_heading" ADD CONSTRAINT "partners_blocks_heading_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_blocks_action_links_items" ADD CONSTRAINT "partners_blocks_action_links_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_action_links_items" ADD CONSTRAINT "partners_blocks_action_links_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_action_links_items" ADD CONSTRAINT "partners_blocks_action_links_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_action_links_items" ADD CONSTRAINT "partners_blocks_action_links_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_action_links_items" ADD CONSTRAINT "partners_blocks_action_links_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_action_links_items" ADD CONSTRAINT "partners_blocks_action_links_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_action_links_items" ADD CONSTRAINT "partners_blocks_action_links_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_action_links_items" ADD CONSTRAINT "partners_blocks_action_links_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_action_links_items" ADD CONSTRAINT "partners_blocks_action_links_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners_blocks_action_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_blocks_action_links" ADD CONSTRAINT "partners_blocks_action_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_blocks_section_group_sections" ADD CONSTRAINT "partners_blocks_section_group_sections_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_section_group_sections" ADD CONSTRAINT "partners_blocks_section_group_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners_blocks_section_group"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_blocks_section_group" ADD CONSTRAINT "partners_blocks_section_group_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_heading" ADD CONSTRAINT "_partners_v_blocks_heading_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partners_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_action_links_items" ADD CONSTRAINT "_partners_v_blocks_action_links_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_action_links_items" ADD CONSTRAINT "_partners_v_blocks_action_links_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_action_links_items" ADD CONSTRAINT "_partners_v_blocks_action_links_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_action_links_items" ADD CONSTRAINT "_partners_v_blocks_action_links_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_action_links_items" ADD CONSTRAINT "_partners_v_blocks_action_links_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_action_links_items" ADD CONSTRAINT "_partners_v_blocks_action_links_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_action_links_items" ADD CONSTRAINT "_partners_v_blocks_action_links_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_action_links_items" ADD CONSTRAINT "_partners_v_blocks_action_links_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_action_links_items" ADD CONSTRAINT "_partners_v_blocks_action_links_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partners_v_blocks_action_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_action_links" ADD CONSTRAINT "_partners_v_blocks_action_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partners_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_section_group_sections" ADD CONSTRAINT "_partners_v_blocks_section_group_sections_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_section_group_sections" ADD CONSTRAINT "_partners_v_blocks_section_group_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partners_v_blocks_section_group"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_section_group" ADD CONSTRAINT "_partners_v_blocks_section_group_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partners_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_heading_order_idx" ON "pages_blocks_heading" USING btree ("_order");
  CREATE INDEX "pages_blocks_heading_parent_id_idx" ON "pages_blocks_heading" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_heading_path_idx" ON "pages_blocks_heading" USING btree ("_path");
  CREATE INDEX "pages_blocks_action_links_items_order_idx" ON "pages_blocks_action_links_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_action_links_items_parent_id_idx" ON "pages_blocks_action_links_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_action_links_items_event_cycle_idx" ON "pages_blocks_action_links_items" USING btree ("event_cycle_id");
  CREATE INDEX "pages_blocks_action_links_items_document_idx" ON "pages_blocks_action_links_items" USING btree ("document_id");
  CREATE INDEX "pages_blocks_action_links_items_category_idx" ON "pages_blocks_action_links_items" USING btree ("category_id");
  CREATE INDEX "pages_blocks_action_links_items_partner_idx" ON "pages_blocks_action_links_items" USING btree ("partner_id");
  CREATE INDEX "pages_blocks_action_links_items_page_idx" ON "pages_blocks_action_links_items" USING btree ("page_id");
  CREATE INDEX "pages_blocks_action_links_items_tag_idx" ON "pages_blocks_action_links_items" USING btree ("tag_id");
  CREATE INDEX "pages_blocks_action_links_items_post_idx" ON "pages_blocks_action_links_items" USING btree ("post_id");
  CREATE INDEX "pages_blocks_action_links_items_event_idx" ON "pages_blocks_action_links_items" USING btree ("event_id");
  CREATE INDEX "pages_blocks_action_links_order_idx" ON "pages_blocks_action_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_action_links_parent_id_idx" ON "pages_blocks_action_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_action_links_path_idx" ON "pages_blocks_action_links" USING btree ("_path");
  CREATE INDEX "pages_blocks_section_group_sections_order_idx" ON "pages_blocks_section_group_sections" USING btree ("_order");
  CREATE INDEX "pages_blocks_section_group_sections_parent_id_idx" ON "pages_blocks_section_group_sections" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_section_group_sections_surface_image_idx" ON "pages_blocks_section_group_sections" USING btree ("surface_image_id");
  CREATE INDEX "pages_blocks_section_group_order_idx" ON "pages_blocks_section_group" USING btree ("_order");
  CREATE INDEX "pages_blocks_section_group_parent_id_idx" ON "pages_blocks_section_group" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_section_group_path_idx" ON "pages_blocks_section_group" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_heading_order_idx" ON "_pages_v_blocks_heading" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_heading_parent_id_idx" ON "_pages_v_blocks_heading" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_heading_path_idx" ON "_pages_v_blocks_heading" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_action_links_items_order_idx" ON "_pages_v_blocks_action_links_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_action_links_items_parent_id_idx" ON "_pages_v_blocks_action_links_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_action_links_items_event_cycle_idx" ON "_pages_v_blocks_action_links_items" USING btree ("event_cycle_id");
  CREATE INDEX "_pages_v_blocks_action_links_items_document_idx" ON "_pages_v_blocks_action_links_items" USING btree ("document_id");
  CREATE INDEX "_pages_v_blocks_action_links_items_category_idx" ON "_pages_v_blocks_action_links_items" USING btree ("category_id");
  CREATE INDEX "_pages_v_blocks_action_links_items_partner_idx" ON "_pages_v_blocks_action_links_items" USING btree ("partner_id");
  CREATE INDEX "_pages_v_blocks_action_links_items_page_idx" ON "_pages_v_blocks_action_links_items" USING btree ("page_id");
  CREATE INDEX "_pages_v_blocks_action_links_items_tag_idx" ON "_pages_v_blocks_action_links_items" USING btree ("tag_id");
  CREATE INDEX "_pages_v_blocks_action_links_items_post_idx" ON "_pages_v_blocks_action_links_items" USING btree ("post_id");
  CREATE INDEX "_pages_v_blocks_action_links_items_event_idx" ON "_pages_v_blocks_action_links_items" USING btree ("event_id");
  CREATE INDEX "_pages_v_blocks_action_links_order_idx" ON "_pages_v_blocks_action_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_action_links_parent_id_idx" ON "_pages_v_blocks_action_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_action_links_path_idx" ON "_pages_v_blocks_action_links" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_section_group_sections_order_idx" ON "_pages_v_blocks_section_group_sections" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_section_group_sections_parent_id_idx" ON "_pages_v_blocks_section_group_sections" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_section_group_sections_surface_image_idx" ON "_pages_v_blocks_section_group_sections" USING btree ("surface_image_id");
  CREATE INDEX "_pages_v_blocks_section_group_order_idx" ON "_pages_v_blocks_section_group" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_section_group_parent_id_idx" ON "_pages_v_blocks_section_group" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_section_group_path_idx" ON "_pages_v_blocks_section_group" USING btree ("_path");
  CREATE INDEX "posts_blocks_heading_order_idx" ON "posts_blocks_heading" USING btree ("_order");
  CREATE INDEX "posts_blocks_heading_parent_id_idx" ON "posts_blocks_heading" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_heading_path_idx" ON "posts_blocks_heading" USING btree ("_path");
  CREATE INDEX "posts_blocks_action_links_items_order_idx" ON "posts_blocks_action_links_items" USING btree ("_order");
  CREATE INDEX "posts_blocks_action_links_items_parent_id_idx" ON "posts_blocks_action_links_items" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_action_links_items_event_cycle_idx" ON "posts_blocks_action_links_items" USING btree ("event_cycle_id");
  CREATE INDEX "posts_blocks_action_links_items_document_idx" ON "posts_blocks_action_links_items" USING btree ("document_id");
  CREATE INDEX "posts_blocks_action_links_items_category_idx" ON "posts_blocks_action_links_items" USING btree ("category_id");
  CREATE INDEX "posts_blocks_action_links_items_partner_idx" ON "posts_blocks_action_links_items" USING btree ("partner_id");
  CREATE INDEX "posts_blocks_action_links_items_page_idx" ON "posts_blocks_action_links_items" USING btree ("page_id");
  CREATE INDEX "posts_blocks_action_links_items_tag_idx" ON "posts_blocks_action_links_items" USING btree ("tag_id");
  CREATE INDEX "posts_blocks_action_links_items_post_idx" ON "posts_blocks_action_links_items" USING btree ("post_id");
  CREATE INDEX "posts_blocks_action_links_items_event_idx" ON "posts_blocks_action_links_items" USING btree ("event_id");
  CREATE INDEX "posts_blocks_action_links_order_idx" ON "posts_blocks_action_links" USING btree ("_order");
  CREATE INDEX "posts_blocks_action_links_parent_id_idx" ON "posts_blocks_action_links" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_action_links_path_idx" ON "posts_blocks_action_links" USING btree ("_path");
  CREATE INDEX "posts_blocks_section_group_sections_order_idx" ON "posts_blocks_section_group_sections" USING btree ("_order");
  CREATE INDEX "posts_blocks_section_group_sections_parent_id_idx" ON "posts_blocks_section_group_sections" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_section_group_sections_surface_image_idx" ON "posts_blocks_section_group_sections" USING btree ("surface_image_id");
  CREATE INDEX "posts_blocks_section_group_order_idx" ON "posts_blocks_section_group" USING btree ("_order");
  CREATE INDEX "posts_blocks_section_group_parent_id_idx" ON "posts_blocks_section_group" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_section_group_path_idx" ON "posts_blocks_section_group" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_heading_order_idx" ON "_posts_v_blocks_heading" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_heading_parent_id_idx" ON "_posts_v_blocks_heading" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_heading_path_idx" ON "_posts_v_blocks_heading" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_action_links_items_order_idx" ON "_posts_v_blocks_action_links_items" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_action_links_items_parent_id_idx" ON "_posts_v_blocks_action_links_items" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_action_links_items_event_cycle_idx" ON "_posts_v_blocks_action_links_items" USING btree ("event_cycle_id");
  CREATE INDEX "_posts_v_blocks_action_links_items_document_idx" ON "_posts_v_blocks_action_links_items" USING btree ("document_id");
  CREATE INDEX "_posts_v_blocks_action_links_items_category_idx" ON "_posts_v_blocks_action_links_items" USING btree ("category_id");
  CREATE INDEX "_posts_v_blocks_action_links_items_partner_idx" ON "_posts_v_blocks_action_links_items" USING btree ("partner_id");
  CREATE INDEX "_posts_v_blocks_action_links_items_page_idx" ON "_posts_v_blocks_action_links_items" USING btree ("page_id");
  CREATE INDEX "_posts_v_blocks_action_links_items_tag_idx" ON "_posts_v_blocks_action_links_items" USING btree ("tag_id");
  CREATE INDEX "_posts_v_blocks_action_links_items_post_idx" ON "_posts_v_blocks_action_links_items" USING btree ("post_id");
  CREATE INDEX "_posts_v_blocks_action_links_items_event_idx" ON "_posts_v_blocks_action_links_items" USING btree ("event_id");
  CREATE INDEX "_posts_v_blocks_action_links_order_idx" ON "_posts_v_blocks_action_links" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_action_links_parent_id_idx" ON "_posts_v_blocks_action_links" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_action_links_path_idx" ON "_posts_v_blocks_action_links" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_section_group_sections_order_idx" ON "_posts_v_blocks_section_group_sections" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_section_group_sections_parent_id_idx" ON "_posts_v_blocks_section_group_sections" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_section_group_sections_surface_image_idx" ON "_posts_v_blocks_section_group_sections" USING btree ("surface_image_id");
  CREATE INDEX "_posts_v_blocks_section_group_order_idx" ON "_posts_v_blocks_section_group" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_section_group_parent_id_idx" ON "_posts_v_blocks_section_group" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_section_group_path_idx" ON "_posts_v_blocks_section_group" USING btree ("_path");
  CREATE INDEX "events_blocks_heading_order_idx" ON "events_blocks_heading" USING btree ("_order");
  CREATE INDEX "events_blocks_heading_parent_id_idx" ON "events_blocks_heading" USING btree ("_parent_id");
  CREATE INDEX "events_blocks_heading_path_idx" ON "events_blocks_heading" USING btree ("_path");
  CREATE INDEX "events_blocks_action_links_items_order_idx" ON "events_blocks_action_links_items" USING btree ("_order");
  CREATE INDEX "events_blocks_action_links_items_parent_id_idx" ON "events_blocks_action_links_items" USING btree ("_parent_id");
  CREATE INDEX "events_blocks_action_links_items_event_cycle_idx" ON "events_blocks_action_links_items" USING btree ("event_cycle_id");
  CREATE INDEX "events_blocks_action_links_items_document_idx" ON "events_blocks_action_links_items" USING btree ("document_id");
  CREATE INDEX "events_blocks_action_links_items_category_idx" ON "events_blocks_action_links_items" USING btree ("category_id");
  CREATE INDEX "events_blocks_action_links_items_partner_idx" ON "events_blocks_action_links_items" USING btree ("partner_id");
  CREATE INDEX "events_blocks_action_links_items_page_idx" ON "events_blocks_action_links_items" USING btree ("page_id");
  CREATE INDEX "events_blocks_action_links_items_tag_idx" ON "events_blocks_action_links_items" USING btree ("tag_id");
  CREATE INDEX "events_blocks_action_links_items_post_idx" ON "events_blocks_action_links_items" USING btree ("post_id");
  CREATE INDEX "events_blocks_action_links_items_event_idx" ON "events_blocks_action_links_items" USING btree ("event_id");
  CREATE INDEX "events_blocks_action_links_order_idx" ON "events_blocks_action_links" USING btree ("_order");
  CREATE INDEX "events_blocks_action_links_parent_id_idx" ON "events_blocks_action_links" USING btree ("_parent_id");
  CREATE INDEX "events_blocks_action_links_path_idx" ON "events_blocks_action_links" USING btree ("_path");
  CREATE INDEX "events_blocks_section_group_sections_order_idx" ON "events_blocks_section_group_sections" USING btree ("_order");
  CREATE INDEX "events_blocks_section_group_sections_parent_id_idx" ON "events_blocks_section_group_sections" USING btree ("_parent_id");
  CREATE INDEX "events_blocks_section_group_sections_surface_image_idx" ON "events_blocks_section_group_sections" USING btree ("surface_image_id");
  CREATE INDEX "events_blocks_section_group_order_idx" ON "events_blocks_section_group" USING btree ("_order");
  CREATE INDEX "events_blocks_section_group_parent_id_idx" ON "events_blocks_section_group" USING btree ("_parent_id");
  CREATE INDEX "events_blocks_section_group_path_idx" ON "events_blocks_section_group" USING btree ("_path");
  CREATE INDEX "_events_v_blocks_heading_order_idx" ON "_events_v_blocks_heading" USING btree ("_order");
  CREATE INDEX "_events_v_blocks_heading_parent_id_idx" ON "_events_v_blocks_heading" USING btree ("_parent_id");
  CREATE INDEX "_events_v_blocks_heading_path_idx" ON "_events_v_blocks_heading" USING btree ("_path");
  CREATE INDEX "_events_v_blocks_action_links_items_order_idx" ON "_events_v_blocks_action_links_items" USING btree ("_order");
  CREATE INDEX "_events_v_blocks_action_links_items_parent_id_idx" ON "_events_v_blocks_action_links_items" USING btree ("_parent_id");
  CREATE INDEX "_events_v_blocks_action_links_items_event_cycle_idx" ON "_events_v_blocks_action_links_items" USING btree ("event_cycle_id");
  CREATE INDEX "_events_v_blocks_action_links_items_document_idx" ON "_events_v_blocks_action_links_items" USING btree ("document_id");
  CREATE INDEX "_events_v_blocks_action_links_items_category_idx" ON "_events_v_blocks_action_links_items" USING btree ("category_id");
  CREATE INDEX "_events_v_blocks_action_links_items_partner_idx" ON "_events_v_blocks_action_links_items" USING btree ("partner_id");
  CREATE INDEX "_events_v_blocks_action_links_items_page_idx" ON "_events_v_blocks_action_links_items" USING btree ("page_id");
  CREATE INDEX "_events_v_blocks_action_links_items_tag_idx" ON "_events_v_blocks_action_links_items" USING btree ("tag_id");
  CREATE INDEX "_events_v_blocks_action_links_items_post_idx" ON "_events_v_blocks_action_links_items" USING btree ("post_id");
  CREATE INDEX "_events_v_blocks_action_links_items_event_idx" ON "_events_v_blocks_action_links_items" USING btree ("event_id");
  CREATE INDEX "_events_v_blocks_action_links_order_idx" ON "_events_v_blocks_action_links" USING btree ("_order");
  CREATE INDEX "_events_v_blocks_action_links_parent_id_idx" ON "_events_v_blocks_action_links" USING btree ("_parent_id");
  CREATE INDEX "_events_v_blocks_action_links_path_idx" ON "_events_v_blocks_action_links" USING btree ("_path");
  CREATE INDEX "_events_v_blocks_section_group_sections_order_idx" ON "_events_v_blocks_section_group_sections" USING btree ("_order");
  CREATE INDEX "_events_v_blocks_section_group_sections_parent_id_idx" ON "_events_v_blocks_section_group_sections" USING btree ("_parent_id");
  CREATE INDEX "_events_v_blocks_section_group_sections_surface_image_idx" ON "_events_v_blocks_section_group_sections" USING btree ("surface_image_id");
  CREATE INDEX "_events_v_blocks_section_group_order_idx" ON "_events_v_blocks_section_group" USING btree ("_order");
  CREATE INDEX "_events_v_blocks_section_group_parent_id_idx" ON "_events_v_blocks_section_group" USING btree ("_parent_id");
  CREATE INDEX "_events_v_blocks_section_group_path_idx" ON "_events_v_blocks_section_group" USING btree ("_path");
  CREATE INDEX "event_cycles_blocks_heading_order_idx" ON "event_cycles_blocks_heading" USING btree ("_order");
  CREATE INDEX "event_cycles_blocks_heading_parent_id_idx" ON "event_cycles_blocks_heading" USING btree ("_parent_id");
  CREATE INDEX "event_cycles_blocks_heading_path_idx" ON "event_cycles_blocks_heading" USING btree ("_path");
  CREATE INDEX "event_cycles_blocks_action_links_items_order_idx" ON "event_cycles_blocks_action_links_items" USING btree ("_order");
  CREATE INDEX "event_cycles_blocks_action_links_items_parent_id_idx" ON "event_cycles_blocks_action_links_items" USING btree ("_parent_id");
  CREATE INDEX "event_cycles_blocks_action_links_items_event_cycle_idx" ON "event_cycles_blocks_action_links_items" USING btree ("event_cycle_id");
  CREATE INDEX "event_cycles_blocks_action_links_items_document_idx" ON "event_cycles_blocks_action_links_items" USING btree ("document_id");
  CREATE INDEX "event_cycles_blocks_action_links_items_category_idx" ON "event_cycles_blocks_action_links_items" USING btree ("category_id");
  CREATE INDEX "event_cycles_blocks_action_links_items_partner_idx" ON "event_cycles_blocks_action_links_items" USING btree ("partner_id");
  CREATE INDEX "event_cycles_blocks_action_links_items_page_idx" ON "event_cycles_blocks_action_links_items" USING btree ("page_id");
  CREATE INDEX "event_cycles_blocks_action_links_items_tag_idx" ON "event_cycles_blocks_action_links_items" USING btree ("tag_id");
  CREATE INDEX "event_cycles_blocks_action_links_items_post_idx" ON "event_cycles_blocks_action_links_items" USING btree ("post_id");
  CREATE INDEX "event_cycles_blocks_action_links_items_event_idx" ON "event_cycles_blocks_action_links_items" USING btree ("event_id");
  CREATE INDEX "event_cycles_blocks_action_links_order_idx" ON "event_cycles_blocks_action_links" USING btree ("_order");
  CREATE INDEX "event_cycles_blocks_action_links_parent_id_idx" ON "event_cycles_blocks_action_links" USING btree ("_parent_id");
  CREATE INDEX "event_cycles_blocks_action_links_path_idx" ON "event_cycles_blocks_action_links" USING btree ("_path");
  CREATE INDEX "event_cycles_blocks_section_group_sections_order_idx" ON "event_cycles_blocks_section_group_sections" USING btree ("_order");
  CREATE INDEX "event_cycles_blocks_section_group_sections_parent_id_idx" ON "event_cycles_blocks_section_group_sections" USING btree ("_parent_id");
  CREATE INDEX "event_cycles_blocks_section_group_sections_surface_image_idx" ON "event_cycles_blocks_section_group_sections" USING btree ("surface_image_id");
  CREATE INDEX "event_cycles_blocks_section_group_order_idx" ON "event_cycles_blocks_section_group" USING btree ("_order");
  CREATE INDEX "event_cycles_blocks_section_group_parent_id_idx" ON "event_cycles_blocks_section_group" USING btree ("_parent_id");
  CREATE INDEX "event_cycles_blocks_section_group_path_idx" ON "event_cycles_blocks_section_group" USING btree ("_path");
  CREATE INDEX "_event_cycles_v_blocks_heading_order_idx" ON "_event_cycles_v_blocks_heading" USING btree ("_order");
  CREATE INDEX "_event_cycles_v_blocks_heading_parent_id_idx" ON "_event_cycles_v_blocks_heading" USING btree ("_parent_id");
  CREATE INDEX "_event_cycles_v_blocks_heading_path_idx" ON "_event_cycles_v_blocks_heading" USING btree ("_path");
  CREATE INDEX "_event_cycles_v_blocks_action_links_items_order_idx" ON "_event_cycles_v_blocks_action_links_items" USING btree ("_order");
  CREATE INDEX "_event_cycles_v_blocks_action_links_items_parent_id_idx" ON "_event_cycles_v_blocks_action_links_items" USING btree ("_parent_id");
  CREATE INDEX "_event_cycles_v_blocks_action_links_items_event_cycle_idx" ON "_event_cycles_v_blocks_action_links_items" USING btree ("event_cycle_id");
  CREATE INDEX "_event_cycles_v_blocks_action_links_items_document_idx" ON "_event_cycles_v_blocks_action_links_items" USING btree ("document_id");
  CREATE INDEX "_event_cycles_v_blocks_action_links_items_category_idx" ON "_event_cycles_v_blocks_action_links_items" USING btree ("category_id");
  CREATE INDEX "_event_cycles_v_blocks_action_links_items_partner_idx" ON "_event_cycles_v_blocks_action_links_items" USING btree ("partner_id");
  CREATE INDEX "_event_cycles_v_blocks_action_links_items_page_idx" ON "_event_cycles_v_blocks_action_links_items" USING btree ("page_id");
  CREATE INDEX "_event_cycles_v_blocks_action_links_items_tag_idx" ON "_event_cycles_v_blocks_action_links_items" USING btree ("tag_id");
  CREATE INDEX "_event_cycles_v_blocks_action_links_items_post_idx" ON "_event_cycles_v_blocks_action_links_items" USING btree ("post_id");
  CREATE INDEX "_event_cycles_v_blocks_action_links_items_event_idx" ON "_event_cycles_v_blocks_action_links_items" USING btree ("event_id");
  CREATE INDEX "_event_cycles_v_blocks_action_links_order_idx" ON "_event_cycles_v_blocks_action_links" USING btree ("_order");
  CREATE INDEX "_event_cycles_v_blocks_action_links_parent_id_idx" ON "_event_cycles_v_blocks_action_links" USING btree ("_parent_id");
  CREATE INDEX "_event_cycles_v_blocks_action_links_path_idx" ON "_event_cycles_v_blocks_action_links" USING btree ("_path");
  CREATE INDEX "_event_cycles_v_blocks_section_group_sections_order_idx" ON "_event_cycles_v_blocks_section_group_sections" USING btree ("_order");
  CREATE INDEX "_event_cycles_v_blocks_section_group_sections_parent_id_idx" ON "_event_cycles_v_blocks_section_group_sections" USING btree ("_parent_id");
  CREATE INDEX "_event_cycles_v_blocks_section_group_sections_surface_im_idx" ON "_event_cycles_v_blocks_section_group_sections" USING btree ("surface_image_id");
  CREATE INDEX "_event_cycles_v_blocks_section_group_order_idx" ON "_event_cycles_v_blocks_section_group" USING btree ("_order");
  CREATE INDEX "_event_cycles_v_blocks_section_group_parent_id_idx" ON "_event_cycles_v_blocks_section_group" USING btree ("_parent_id");
  CREATE INDEX "_event_cycles_v_blocks_section_group_path_idx" ON "_event_cycles_v_blocks_section_group" USING btree ("_path");
  CREATE INDEX "partners_blocks_heading_order_idx" ON "partners_blocks_heading" USING btree ("_order");
  CREATE INDEX "partners_blocks_heading_parent_id_idx" ON "partners_blocks_heading" USING btree ("_parent_id");
  CREATE INDEX "partners_blocks_heading_path_idx" ON "partners_blocks_heading" USING btree ("_path");
  CREATE INDEX "partners_blocks_action_links_items_order_idx" ON "partners_blocks_action_links_items" USING btree ("_order");
  CREATE INDEX "partners_blocks_action_links_items_parent_id_idx" ON "partners_blocks_action_links_items" USING btree ("_parent_id");
  CREATE INDEX "partners_blocks_action_links_items_event_cycle_idx" ON "partners_blocks_action_links_items" USING btree ("event_cycle_id");
  CREATE INDEX "partners_blocks_action_links_items_document_idx" ON "partners_blocks_action_links_items" USING btree ("document_id");
  CREATE INDEX "partners_blocks_action_links_items_category_idx" ON "partners_blocks_action_links_items" USING btree ("category_id");
  CREATE INDEX "partners_blocks_action_links_items_partner_idx" ON "partners_blocks_action_links_items" USING btree ("partner_id");
  CREATE INDEX "partners_blocks_action_links_items_page_idx" ON "partners_blocks_action_links_items" USING btree ("page_id");
  CREATE INDEX "partners_blocks_action_links_items_tag_idx" ON "partners_blocks_action_links_items" USING btree ("tag_id");
  CREATE INDEX "partners_blocks_action_links_items_post_idx" ON "partners_blocks_action_links_items" USING btree ("post_id");
  CREATE INDEX "partners_blocks_action_links_items_event_idx" ON "partners_blocks_action_links_items" USING btree ("event_id");
  CREATE INDEX "partners_blocks_action_links_order_idx" ON "partners_blocks_action_links" USING btree ("_order");
  CREATE INDEX "partners_blocks_action_links_parent_id_idx" ON "partners_blocks_action_links" USING btree ("_parent_id");
  CREATE INDEX "partners_blocks_action_links_path_idx" ON "partners_blocks_action_links" USING btree ("_path");
  CREATE INDEX "partners_blocks_section_group_sections_order_idx" ON "partners_blocks_section_group_sections" USING btree ("_order");
  CREATE INDEX "partners_blocks_section_group_sections_parent_id_idx" ON "partners_blocks_section_group_sections" USING btree ("_parent_id");
  CREATE INDEX "partners_blocks_section_group_sections_surface_image_idx" ON "partners_blocks_section_group_sections" USING btree ("surface_image_id");
  CREATE INDEX "partners_blocks_section_group_order_idx" ON "partners_blocks_section_group" USING btree ("_order");
  CREATE INDEX "partners_blocks_section_group_parent_id_idx" ON "partners_blocks_section_group" USING btree ("_parent_id");
  CREATE INDEX "partners_blocks_section_group_path_idx" ON "partners_blocks_section_group" USING btree ("_path");
  CREATE INDEX "_partners_v_blocks_heading_order_idx" ON "_partners_v_blocks_heading" USING btree ("_order");
  CREATE INDEX "_partners_v_blocks_heading_parent_id_idx" ON "_partners_v_blocks_heading" USING btree ("_parent_id");
  CREATE INDEX "_partners_v_blocks_heading_path_idx" ON "_partners_v_blocks_heading" USING btree ("_path");
  CREATE INDEX "_partners_v_blocks_action_links_items_order_idx" ON "_partners_v_blocks_action_links_items" USING btree ("_order");
  CREATE INDEX "_partners_v_blocks_action_links_items_parent_id_idx" ON "_partners_v_blocks_action_links_items" USING btree ("_parent_id");
  CREATE INDEX "_partners_v_blocks_action_links_items_event_cycle_idx" ON "_partners_v_blocks_action_links_items" USING btree ("event_cycle_id");
  CREATE INDEX "_partners_v_blocks_action_links_items_document_idx" ON "_partners_v_blocks_action_links_items" USING btree ("document_id");
  CREATE INDEX "_partners_v_blocks_action_links_items_category_idx" ON "_partners_v_blocks_action_links_items" USING btree ("category_id");
  CREATE INDEX "_partners_v_blocks_action_links_items_partner_idx" ON "_partners_v_blocks_action_links_items" USING btree ("partner_id");
  CREATE INDEX "_partners_v_blocks_action_links_items_page_idx" ON "_partners_v_blocks_action_links_items" USING btree ("page_id");
  CREATE INDEX "_partners_v_blocks_action_links_items_tag_idx" ON "_partners_v_blocks_action_links_items" USING btree ("tag_id");
  CREATE INDEX "_partners_v_blocks_action_links_items_post_idx" ON "_partners_v_blocks_action_links_items" USING btree ("post_id");
  CREATE INDEX "_partners_v_blocks_action_links_items_event_idx" ON "_partners_v_blocks_action_links_items" USING btree ("event_id");
  CREATE INDEX "_partners_v_blocks_action_links_order_idx" ON "_partners_v_blocks_action_links" USING btree ("_order");
  CREATE INDEX "_partners_v_blocks_action_links_parent_id_idx" ON "_partners_v_blocks_action_links" USING btree ("_parent_id");
  CREATE INDEX "_partners_v_blocks_action_links_path_idx" ON "_partners_v_blocks_action_links" USING btree ("_path");
  CREATE INDEX "_partners_v_blocks_section_group_sections_order_idx" ON "_partners_v_blocks_section_group_sections" USING btree ("_order");
  CREATE INDEX "_partners_v_blocks_section_group_sections_parent_id_idx" ON "_partners_v_blocks_section_group_sections" USING btree ("_parent_id");
  CREATE INDEX "_partners_v_blocks_section_group_sections_surface_image_idx" ON "_partners_v_blocks_section_group_sections" USING btree ("surface_image_id");
  CREATE INDEX "_partners_v_blocks_section_group_order_idx" ON "_partners_v_blocks_section_group" USING btree ("_order");
  CREATE INDEX "_partners_v_blocks_section_group_parent_id_idx" ON "_partners_v_blocks_section_group" USING btree ("_parent_id");
  CREATE INDEX "_partners_v_blocks_section_group_path_idx" ON "_partners_v_blocks_section_group" USING btree ("_path");
  ALTER TABLE "pages_blocks_column_layout_columns" ADD CONSTRAINT "pages_blocks_column_layout_columns_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_column_layout_columns" ADD CONSTRAINT "_pages_v_blocks_column_layout_columns_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_column_layout_columns" ADD CONSTRAINT "posts_blocks_column_layout_columns_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_column_layout_columns" ADD CONSTRAINT "_posts_v_blocks_column_layout_columns_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_column_layout_columns" ADD CONSTRAINT "events_blocks_column_layout_columns_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_column_layout_columns" ADD CONSTRAINT "_events_v_blocks_column_layout_columns_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_column_layout_columns" ADD CONSTRAINT "event_cycles_blocks_column_layout_columns_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_column_layout_columns" ADD CONSTRAINT "_event_cycles_v_blocks_column_layout_columns_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_column_layout_columns" ADD CONSTRAINT "partners_blocks_column_layout_columns_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_column_layout_columns" ADD CONSTRAINT "_partners_v_blocks_column_layout_columns_surface_image_id_media_id_fk" FOREIGN KEY ("surface_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_blocks_column_layout_columns_surface_image_idx" ON "pages_blocks_column_layout_columns" USING btree ("surface_image_id");
  CREATE INDEX "_pages_v_blocks_column_layout_columns_surface_image_idx" ON "_pages_v_blocks_column_layout_columns" USING btree ("surface_image_id");
  CREATE INDEX "posts_blocks_column_layout_columns_surface_image_idx" ON "posts_blocks_column_layout_columns" USING btree ("surface_image_id");
  CREATE INDEX "_posts_v_blocks_column_layout_columns_surface_image_idx" ON "_posts_v_blocks_column_layout_columns" USING btree ("surface_image_id");
  CREATE INDEX "events_blocks_column_layout_columns_surface_image_idx" ON "events_blocks_column_layout_columns" USING btree ("surface_image_id");
  CREATE INDEX "_events_v_blocks_column_layout_columns_surface_image_idx" ON "_events_v_blocks_column_layout_columns" USING btree ("surface_image_id");
  CREATE INDEX "event_cycles_blocks_column_layout_columns_surface_image_idx" ON "event_cycles_blocks_column_layout_columns" USING btree ("surface_image_id");
  CREATE INDEX "_event_cycles_v_blocks_column_layout_columns_surface_ima_idx" ON "_event_cycles_v_blocks_column_layout_columns" USING btree ("surface_image_id");
  CREATE INDEX "partners_blocks_column_layout_columns_surface_image_idx" ON "partners_blocks_column_layout_columns" USING btree ("surface_image_id");
  CREATE INDEX "_partners_v_blocks_column_layout_columns_surface_image_idx" ON "_partners_v_blocks_column_layout_columns" USING btree ("surface_image_id");
  DROP TABLE IF EXISTS "pages_blocks_membership_onboarding" CASCADE;
  DROP TABLE IF EXISTS "_pages_v_blocks_membership_onboarding" CASCADE;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_heading" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_action_links_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_action_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_section_group_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_section_group" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_heading" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_action_links_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_action_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_section_group_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_section_group" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_heading" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_action_links_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_action_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_section_group_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_section_group" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_heading" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_action_links_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_action_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_section_group_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_section_group" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_blocks_heading" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_blocks_action_links_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_blocks_action_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_blocks_section_group_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_blocks_section_group" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_v_blocks_heading" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_v_blocks_action_links_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_v_blocks_action_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_v_blocks_section_group_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_v_blocks_section_group" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "event_cycles_blocks_heading" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "event_cycles_blocks_action_links_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "event_cycles_blocks_action_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "event_cycles_blocks_section_group_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "event_cycles_blocks_section_group" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_event_cycles_v_blocks_heading" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_event_cycles_v_blocks_action_links_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_event_cycles_v_blocks_action_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_event_cycles_v_blocks_section_group_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_event_cycles_v_blocks_section_group" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "partners_blocks_heading" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "partners_blocks_action_links_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "partners_blocks_action_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "partners_blocks_section_group_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "partners_blocks_section_group" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_partners_v_blocks_heading" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_partners_v_blocks_action_links_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_partners_v_blocks_action_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_partners_v_blocks_section_group_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_partners_v_blocks_section_group" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_heading" CASCADE;
  DROP TABLE "pages_blocks_action_links_items" CASCADE;
  DROP TABLE "pages_blocks_action_links" CASCADE;
  DROP TABLE "pages_blocks_section_group_sections" CASCADE;
  DROP TABLE "pages_blocks_section_group" CASCADE;
  DROP TABLE "_pages_v_blocks_heading" CASCADE;
  DROP TABLE "_pages_v_blocks_action_links_items" CASCADE;
  DROP TABLE "_pages_v_blocks_action_links" CASCADE;
  DROP TABLE "_pages_v_blocks_section_group_sections" CASCADE;
  DROP TABLE "_pages_v_blocks_section_group" CASCADE;
  DROP TABLE "posts_blocks_heading" CASCADE;
  DROP TABLE "posts_blocks_action_links_items" CASCADE;
  DROP TABLE "posts_blocks_action_links" CASCADE;
  DROP TABLE "posts_blocks_section_group_sections" CASCADE;
  DROP TABLE "posts_blocks_section_group" CASCADE;
  DROP TABLE "_posts_v_blocks_heading" CASCADE;
  DROP TABLE "_posts_v_blocks_action_links_items" CASCADE;
  DROP TABLE "_posts_v_blocks_action_links" CASCADE;
  DROP TABLE "_posts_v_blocks_section_group_sections" CASCADE;
  DROP TABLE "_posts_v_blocks_section_group" CASCADE;
  DROP TABLE "events_blocks_heading" CASCADE;
  DROP TABLE "events_blocks_action_links_items" CASCADE;
  DROP TABLE "events_blocks_action_links" CASCADE;
  DROP TABLE "events_blocks_section_group_sections" CASCADE;
  DROP TABLE "events_blocks_section_group" CASCADE;
  DROP TABLE "_events_v_blocks_heading" CASCADE;
  DROP TABLE "_events_v_blocks_action_links_items" CASCADE;
  DROP TABLE "_events_v_blocks_action_links" CASCADE;
  DROP TABLE "_events_v_blocks_section_group_sections" CASCADE;
  DROP TABLE "_events_v_blocks_section_group" CASCADE;
  DROP TABLE "event_cycles_blocks_heading" CASCADE;
  DROP TABLE "event_cycles_blocks_action_links_items" CASCADE;
  DROP TABLE "event_cycles_blocks_action_links" CASCADE;
  DROP TABLE "event_cycles_blocks_section_group_sections" CASCADE;
  DROP TABLE "event_cycles_blocks_section_group" CASCADE;
  DROP TABLE "_event_cycles_v_blocks_heading" CASCADE;
  DROP TABLE "_event_cycles_v_blocks_action_links_items" CASCADE;
  DROP TABLE "_event_cycles_v_blocks_action_links" CASCADE;
  DROP TABLE "_event_cycles_v_blocks_section_group_sections" CASCADE;
  DROP TABLE "_event_cycles_v_blocks_section_group" CASCADE;
  DROP TABLE "partners_blocks_heading" CASCADE;
  DROP TABLE "partners_blocks_action_links_items" CASCADE;
  DROP TABLE "partners_blocks_action_links" CASCADE;
  DROP TABLE "partners_blocks_section_group_sections" CASCADE;
  DROP TABLE "partners_blocks_section_group" CASCADE;
  DROP TABLE "_partners_v_blocks_heading" CASCADE;
  DROP TABLE "_partners_v_blocks_action_links_items" CASCADE;
  DROP TABLE "_partners_v_blocks_action_links" CASCADE;
  DROP TABLE "_partners_v_blocks_section_group_sections" CASCADE;
  DROP TABLE "_partners_v_blocks_section_group" CASCADE;
  ALTER TABLE "pages_blocks_column_layout_columns" DROP CONSTRAINT "pages_blocks_column_layout_columns_surface_image_id_media_id_fk";
  
  ALTER TABLE "_pages_v_blocks_column_layout_columns" DROP CONSTRAINT "_pages_v_blocks_column_layout_columns_surface_image_id_media_id_fk";
  
  ALTER TABLE "posts_blocks_column_layout_columns" DROP CONSTRAINT "posts_blocks_column_layout_columns_surface_image_id_media_id_fk";
  
  ALTER TABLE "_posts_v_blocks_column_layout_columns" DROP CONSTRAINT "_posts_v_blocks_column_layout_columns_surface_image_id_media_id_fk";
  
  ALTER TABLE "events_blocks_column_layout_columns" DROP CONSTRAINT "events_blocks_column_layout_columns_surface_image_id_media_id_fk";
  
  ALTER TABLE "_events_v_blocks_column_layout_columns" DROP CONSTRAINT "_events_v_blocks_column_layout_columns_surface_image_id_media_id_fk";
  
  ALTER TABLE "event_cycles_blocks_column_layout_columns" DROP CONSTRAINT "event_cycles_blocks_column_layout_columns_surface_image_id_media_id_fk";
  
  ALTER TABLE "_event_cycles_v_blocks_column_layout_columns" DROP CONSTRAINT "_event_cycles_v_blocks_column_layout_columns_surface_image_id_media_id_fk";
  
  ALTER TABLE "partners_blocks_column_layout_columns" DROP CONSTRAINT "partners_blocks_column_layout_columns_surface_image_id_media_id_fk";
  
  ALTER TABLE "_partners_v_blocks_column_layout_columns" DROP CONSTRAINT "_partners_v_blocks_column_layout_columns_surface_image_id_media_id_fk";
  
  ALTER TABLE "events_external_links" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "events_external_links" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  ALTER TABLE "_events_v_version_external_links" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "_events_v_version_external_links" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  ALTER TABLE "event_cycles_event_defaults_external_links" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "event_cycles_event_defaults_external_links" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  DROP TYPE "public"."target";
  CREATE TYPE "public"."target" AS ENUM('custom', 'eventCycle', 'document', 'category', 'partner', 'page', 'tag', 'post', 'event');
  ALTER TABLE "events_external_links" ALTER COLUMN "target_type" SET DEFAULT 'custom'::"public"."target";
  ALTER TABLE "events_external_links" ALTER COLUMN "target_type" SET DATA TYPE "public"."target" USING "target_type"::"public"."target";
  ALTER TABLE "_events_v_version_external_links" ALTER COLUMN "target_type" SET DEFAULT 'custom'::"public"."target";
  ALTER TABLE "_events_v_version_external_links" ALTER COLUMN "target_type" SET DATA TYPE "public"."target" USING "target_type"::"public"."target";
  ALTER TABLE "event_cycles_event_defaults_external_links" ALTER COLUMN "target_type" SET DEFAULT 'custom'::"public"."target";
  ALTER TABLE "event_cycles_event_defaults_external_links" ALTER COLUMN "target_type" SET DATA TYPE "public"."target" USING "target_type"::"public"."target";
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" ALTER COLUMN "target_type" SET DEFAULT 'custom'::"public"."target";
  ALTER TABLE "_event_cycles_v_version_event_defaults_external_links" ALTER COLUMN "target_type" SET DATA TYPE "public"."target" USING "target_type"::"public"."target";
  ALTER TABLE "navigation_header_items" ALTER COLUMN "appearance" SET DATA TYPE text;
  ALTER TABLE "navigation_header_items" ALTER COLUMN "appearance" SET DEFAULT 'link'::text;
  UPDATE "navigation_header_items"
  SET
    "label" = CASE
      WHEN COALESCE("label", '') = '' THEN COALESCE("accessible_label", '')
      ELSE "label"
    END,
    "appearance" = CASE
      WHEN COALESCE("label", '') = '' AND "icon_name" IS NOT NULL THEN 'icon'
      WHEN "appearance" IN ('primaryButton', 'secondaryButton') THEN 'button'
      ELSE 'link'
    END;
  DROP TYPE "public"."enum_navigation_header_items_appearance";
  CREATE TYPE "public"."enum_navigation_header_items_appearance" AS ENUM('link', 'icon', 'button');
  ALTER TABLE "navigation_header_items" ALTER COLUMN "appearance" SET DEFAULT 'link'::"public"."enum_navigation_header_items_appearance";
  ALTER TABLE "navigation_header_items" ALTER COLUMN "appearance" SET DATA TYPE "public"."enum_navigation_header_items_appearance" USING "appearance"::"public"."enum_navigation_header_items_appearance";
  UPDATE "footer_social_items"
  SET "label" = COALESCE(NULLIF("label", ''), "accessible_label", '');
  DROP INDEX "pages_blocks_column_layout_columns_surface_image_idx";
  DROP INDEX "_pages_v_blocks_column_layout_columns_surface_image_idx";
  DROP INDEX "posts_blocks_column_layout_columns_surface_image_idx";
  DROP INDEX "_posts_v_blocks_column_layout_columns_surface_image_idx";
  DROP INDEX "events_blocks_column_layout_columns_surface_image_idx";
  DROP INDEX "_events_v_blocks_column_layout_columns_surface_image_idx";
  DROP INDEX "event_cycles_blocks_column_layout_columns_surface_image_idx";
  DROP INDEX "_event_cycles_v_blocks_column_layout_columns_surface_ima_idx";
  DROP INDEX "partners_blocks_column_layout_columns_surface_image_idx";
  DROP INDEX "_partners_v_blocks_column_layout_columns_surface_image_idx";
  ALTER TABLE "navigation_header_items" ALTER COLUMN "label" SET NOT NULL;
  ALTER TABLE "homepage_hero_items" ALTER COLUMN "label" SET NOT NULL;
  ALTER TABLE "homepage_sections_groups_menu_items" ALTER COLUMN "label" SET NOT NULL;
  ALTER TABLE "footer_social_items" ALTER COLUMN "label" SET NOT NULL;
  ALTER TABLE "footer_columns_items" ALTER COLUMN "label" SET NOT NULL;
  ALTER TABLE "pages_blocks_rich_text" DROP COLUMN "text_style";
  ALTER TABLE "pages_blocks_column_layout_columns" DROP COLUMN "surface";
  ALTER TABLE "pages_blocks_column_layout_columns" DROP COLUMN "surface_image_id";
  ALTER TABLE "pages_blocks_column_layout_columns" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "pages_blocks_column_layout_columns" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "pages_blocks_column_layout" DROP COLUMN "vertical_alignment";
  ALTER TABLE "pages_blocks_column_layout" DROP COLUMN "column_separators";
  ALTER TABLE "_pages_v_blocks_rich_text" DROP COLUMN "text_style";
  ALTER TABLE "_pages_v_blocks_column_layout_columns" DROP COLUMN "surface";
  ALTER TABLE "_pages_v_blocks_column_layout_columns" DROP COLUMN "surface_image_id";
  ALTER TABLE "_pages_v_blocks_column_layout_columns" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "_pages_v_blocks_column_layout_columns" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "_pages_v_blocks_column_layout" DROP COLUMN "vertical_alignment";
  ALTER TABLE "_pages_v_blocks_column_layout" DROP COLUMN "column_separators";
  ALTER TABLE "posts_blocks_rich_text" DROP COLUMN "text_style";
  ALTER TABLE "posts_blocks_column_layout_columns" DROP COLUMN "surface";
  ALTER TABLE "posts_blocks_column_layout_columns" DROP COLUMN "surface_image_id";
  ALTER TABLE "posts_blocks_column_layout_columns" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "posts_blocks_column_layout_columns" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "posts_blocks_column_layout" DROP COLUMN "vertical_alignment";
  ALTER TABLE "posts_blocks_column_layout" DROP COLUMN "column_separators";
  ALTER TABLE "_posts_v_blocks_rich_text" DROP COLUMN "text_style";
  ALTER TABLE "_posts_v_blocks_column_layout_columns" DROP COLUMN "surface";
  ALTER TABLE "_posts_v_blocks_column_layout_columns" DROP COLUMN "surface_image_id";
  ALTER TABLE "_posts_v_blocks_column_layout_columns" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "_posts_v_blocks_column_layout_columns" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "_posts_v_blocks_column_layout" DROP COLUMN "vertical_alignment";
  ALTER TABLE "_posts_v_blocks_column_layout" DROP COLUMN "column_separators";
  ALTER TABLE "events_blocks_rich_text" DROP COLUMN "text_style";
  ALTER TABLE "events_blocks_column_layout_columns" DROP COLUMN "surface";
  ALTER TABLE "events_blocks_column_layout_columns" DROP COLUMN "surface_image_id";
  ALTER TABLE "events_blocks_column_layout_columns" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "events_blocks_column_layout_columns" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "events_blocks_column_layout" DROP COLUMN "vertical_alignment";
  ALTER TABLE "events_blocks_column_layout" DROP COLUMN "column_separators";
  ALTER TABLE "_events_v_blocks_rich_text" DROP COLUMN "text_style";
  ALTER TABLE "_events_v_blocks_column_layout_columns" DROP COLUMN "surface";
  ALTER TABLE "_events_v_blocks_column_layout_columns" DROP COLUMN "surface_image_id";
  ALTER TABLE "_events_v_blocks_column_layout_columns" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "_events_v_blocks_column_layout_columns" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "_events_v_blocks_column_layout" DROP COLUMN "vertical_alignment";
  ALTER TABLE "_events_v_blocks_column_layout" DROP COLUMN "column_separators";
  ALTER TABLE "event_cycles_blocks_rich_text" DROP COLUMN "text_style";
  ALTER TABLE "event_cycles_blocks_column_layout_columns" DROP COLUMN "surface";
  ALTER TABLE "event_cycles_blocks_column_layout_columns" DROP COLUMN "surface_image_id";
  ALTER TABLE "event_cycles_blocks_column_layout_columns" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "event_cycles_blocks_column_layout_columns" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "event_cycles_blocks_column_layout" DROP COLUMN "vertical_alignment";
  ALTER TABLE "event_cycles_blocks_column_layout" DROP COLUMN "column_separators";
  ALTER TABLE "_event_cycles_v_blocks_rich_text" DROP COLUMN "text_style";
  ALTER TABLE "_event_cycles_v_blocks_column_layout_columns" DROP COLUMN "surface";
  ALTER TABLE "_event_cycles_v_blocks_column_layout_columns" DROP COLUMN "surface_image_id";
  ALTER TABLE "_event_cycles_v_blocks_column_layout_columns" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "_event_cycles_v_blocks_column_layout_columns" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "_event_cycles_v_blocks_column_layout" DROP COLUMN "vertical_alignment";
  ALTER TABLE "_event_cycles_v_blocks_column_layout" DROP COLUMN "column_separators";
  ALTER TABLE "partners_blocks_rich_text" DROP COLUMN "text_style";
  ALTER TABLE "partners_blocks_column_layout_columns" DROP COLUMN "surface";
  ALTER TABLE "partners_blocks_column_layout_columns" DROP COLUMN "surface_image_id";
  ALTER TABLE "partners_blocks_column_layout_columns" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "partners_blocks_column_layout_columns" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "partners_blocks_column_layout" DROP COLUMN "vertical_alignment";
  ALTER TABLE "partners_blocks_column_layout" DROP COLUMN "column_separators";
  ALTER TABLE "_partners_v_blocks_rich_text" DROP COLUMN "text_style";
  ALTER TABLE "_partners_v_blocks_column_layout_columns" DROP COLUMN "surface";
  ALTER TABLE "_partners_v_blocks_column_layout_columns" DROP COLUMN "surface_image_id";
  ALTER TABLE "_partners_v_blocks_column_layout_columns" DROP COLUMN "surface_horizontal_position";
  ALTER TABLE "_partners_v_blocks_column_layout_columns" DROP COLUMN "surface_vertical_position";
  ALTER TABLE "_partners_v_blocks_column_layout" DROP COLUMN "vertical_alignment";
  ALTER TABLE "_partners_v_blocks_column_layout" DROP COLUMN "column_separators";
  ALTER TABLE "club_sections_menu_items" DROP COLUMN "appearance";
  ALTER TABLE "club_sections_menu_items" DROP COLUMN "accessible_label";
  ALTER TABLE "_club_sections_v_version_menu_items" DROP COLUMN "appearance";
  ALTER TABLE "_club_sections_v_version_menu_items" DROP COLUMN "accessible_label";
  ALTER TABLE "navigation_header_items" DROP COLUMN "accessible_label";
  ALTER TABLE "homepage_hero_items" DROP COLUMN "appearance";
  ALTER TABLE "homepage_hero_items" DROP COLUMN "accessible_label";
  ALTER TABLE "homepage_hero_items" DROP COLUMN "icon_name";
  ALTER TABLE "homepage_sections_groups_menu_items" DROP COLUMN "appearance";
  ALTER TABLE "homepage_sections_groups_menu_items" DROP COLUMN "accessible_label";
  ALTER TABLE "footer_social_items" DROP COLUMN "appearance";
  ALTER TABLE "footer_social_items" DROP COLUMN "accessible_label";
  ALTER TABLE "footer_columns_items" DROP COLUMN "appearance";
  ALTER TABLE "footer_columns_items" DROP COLUMN "accessible_label";
  ALTER TABLE "footer_columns_items" DROP COLUMN "icon_name";
  DROP TYPE "public"."enum_pages_blocks_rich_text_text_style";
  DROP TYPE "public"."enum_pages_blocks_heading_role";
  DROP TYPE "public"."enum_pages_blocks_heading_icon_name";
  DROP TYPE "public"."appearance";
  DROP TYPE "public"."enum_pages_blocks_action_links_items_icon_name";
  DROP TYPE "public"."enum_pages_blocks_action_links_layout";
  DROP TYPE "public"."enum_pages_blocks_action_links_alignment";
  DROP TYPE "public"."sf";
  DROP TYPE "public"."sf_x";
  DROP TYPE "public"."sf_y";
  DROP TYPE "public"."enum_pages_blocks_column_layout_vertical_alignment";
  DROP TYPE "public"."enum_pages_blocks_column_layout_column_separators";
  DROP TYPE "public"."enum_pages_blocks_section_group_frame";
  DROP TYPE "public"."enum__pages_v_blocks_rich_text_text_style";
  DROP TYPE "public"."enum__pages_v_blocks_heading_role";
  DROP TYPE "public"."enum__pages_v_blocks_heading_icon_name";
  DROP TYPE "public"."enum__pages_v_blocks_action_links_items_icon_name";
  DROP TYPE "public"."enum__pages_v_blocks_action_links_layout";
  DROP TYPE "public"."enum__pages_v_blocks_action_links_alignment";
  DROP TYPE "public"."enum__pages_v_blocks_column_layout_vertical_alignment";
  DROP TYPE "public"."enum__pages_v_blocks_column_layout_column_separators";
  DROP TYPE "public"."enum__pages_v_blocks_section_group_frame";
  DROP TYPE "public"."enum_posts_blocks_rich_text_text_style";
  DROP TYPE "public"."enum_posts_blocks_heading_role";
  DROP TYPE "public"."enum_posts_blocks_heading_icon_name";
  DROP TYPE "public"."enum_posts_blocks_action_links_items_icon_name";
  DROP TYPE "public"."enum_posts_blocks_action_links_layout";
  DROP TYPE "public"."enum_posts_blocks_action_links_alignment";
  DROP TYPE "public"."enum_posts_blocks_column_layout_vertical_alignment";
  DROP TYPE "public"."enum_posts_blocks_column_layout_column_separators";
  DROP TYPE "public"."enum_posts_blocks_section_group_frame";
  DROP TYPE "public"."enum__posts_v_blocks_rich_text_text_style";
  DROP TYPE "public"."enum__posts_v_blocks_heading_role";
  DROP TYPE "public"."enum__posts_v_blocks_heading_icon_name";
  DROP TYPE "public"."enum__posts_v_blocks_action_links_items_icon_name";
  DROP TYPE "public"."enum__posts_v_blocks_action_links_layout";
  DROP TYPE "public"."enum__posts_v_blocks_action_links_alignment";
  DROP TYPE "public"."enum__posts_v_blocks_column_layout_vertical_alignment";
  DROP TYPE "public"."enum__posts_v_blocks_column_layout_column_separators";
  DROP TYPE "public"."enum__posts_v_blocks_section_group_frame";
  DROP TYPE "public"."enum_events_blocks_rich_text_text_style";
  DROP TYPE "public"."enum_events_blocks_heading_role";
  DROP TYPE "public"."enum_events_blocks_heading_icon_name";
  DROP TYPE "public"."enum_events_blocks_action_links_items_icon_name";
  DROP TYPE "public"."enum_events_blocks_action_links_layout";
  DROP TYPE "public"."enum_events_blocks_action_links_alignment";
  DROP TYPE "public"."enum_events_blocks_column_layout_vertical_alignment";
  DROP TYPE "public"."enum_events_blocks_column_layout_column_separators";
  DROP TYPE "public"."enum_events_blocks_section_group_frame";
  DROP TYPE "public"."enum__events_v_blocks_rich_text_text_style";
  DROP TYPE "public"."enum__events_v_blocks_heading_role";
  DROP TYPE "public"."enum__events_v_blocks_heading_icon_name";
  DROP TYPE "public"."enum__events_v_blocks_action_links_items_icon_name";
  DROP TYPE "public"."enum__events_v_blocks_action_links_layout";
  DROP TYPE "public"."enum__events_v_blocks_action_links_alignment";
  DROP TYPE "public"."enum__events_v_blocks_column_layout_vertical_alignment";
  DROP TYPE "public"."enum__events_v_blocks_column_layout_column_separators";
  DROP TYPE "public"."enum__events_v_blocks_section_group_frame";
  DROP TYPE "public"."enum_event_cycles_blocks_rich_text_text_style";
  DROP TYPE "public"."enum_event_cycles_blocks_heading_role";
  DROP TYPE "public"."enum_event_cycles_blocks_heading_icon_name";
  DROP TYPE "public"."enum_event_cycles_blocks_action_links_items_icon_name";
  DROP TYPE "public"."enum_event_cycles_blocks_action_links_layout";
  DROP TYPE "public"."enum_event_cycles_blocks_action_links_alignment";
  DROP TYPE "public"."enum_event_cycles_blocks_column_layout_vertical_alignment";
  DROP TYPE "public"."enum_event_cycles_blocks_column_layout_column_separators";
  DROP TYPE "public"."enum_event_cycles_blocks_section_group_frame";
  DROP TYPE "public"."enum__event_cycles_v_blocks_rich_text_text_style";
  DROP TYPE "public"."enum__event_cycles_v_blocks_heading_role";
  DROP TYPE "public"."enum__event_cycles_v_blocks_heading_icon_name";
  DROP TYPE "public"."enum__event_cycles_v_blocks_action_links_items_icon_name";
  DROP TYPE "public"."enum__event_cycles_v_blocks_action_links_layout";
  DROP TYPE "public"."enum__event_cycles_v_blocks_action_links_alignment";
  DROP TYPE "public"."enum__event_cycles_v_blocks_column_layout_vertical_alignment";
  DROP TYPE "public"."enum__event_cycles_v_blocks_column_layout_column_separators";
  DROP TYPE "public"."enum__event_cycles_v_blocks_section_group_frame";
  DROP TYPE "public"."enum_partners_blocks_rich_text_text_style";
  DROP TYPE "public"."enum_partners_blocks_heading_role";
  DROP TYPE "public"."enum_partners_blocks_heading_icon_name";
  DROP TYPE "public"."enum_partners_blocks_action_links_items_icon_name";
  DROP TYPE "public"."enum_partners_blocks_action_links_layout";
  DROP TYPE "public"."enum_partners_blocks_action_links_alignment";
  DROP TYPE "public"."enum_partners_blocks_column_layout_vertical_alignment";
  DROP TYPE "public"."enum_partners_blocks_column_layout_column_separators";
  DROP TYPE "public"."enum_partners_blocks_section_group_frame";
  DROP TYPE "public"."enum__partners_v_blocks_rich_text_text_style";
  DROP TYPE "public"."enum__partners_v_blocks_heading_role";
  DROP TYPE "public"."enum__partners_v_blocks_heading_icon_name";
  DROP TYPE "public"."enum__partners_v_blocks_action_links_items_icon_name";
  DROP TYPE "public"."enum__partners_v_blocks_action_links_layout";
  DROP TYPE "public"."enum__partners_v_blocks_action_links_alignment";
  DROP TYPE "public"."enum__partners_v_blocks_column_layout_vertical_alignment";
  DROP TYPE "public"."enum__partners_v_blocks_column_layout_column_separators";
  DROP TYPE "public"."enum__partners_v_blocks_section_group_frame";
  DROP TYPE "public"."enum_club_sections_menu_items_appearance";
  DROP TYPE "public"."enum__club_sections_v_version_menu_items_appearance";
  DROP TYPE "public"."enum_homepage_hero_items_appearance";
  DROP TYPE "public"."enum_homepage_hero_items_icon_name";
  DROP TYPE "public"."enum_homepage_sections_groups_menu_items_appearance";
  DROP TYPE "public"."enum_footer_social_items_appearance";
  DROP TYPE "public"."enum_footer_columns_items_appearance";
  DROP TYPE "public"."enum_footer_columns_items_icon_name";`)
}
