import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_tabs_header_left_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_pages_blocks_tabs_header_right_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_pages_blocks_tabs_footer_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_pages_blocks_tabs_footer_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum__pages_v_blocks_tabs_header_left_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum__pages_v_blocks_tabs_header_right_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum__pages_v_blocks_tabs_footer_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum__pages_v_blocks_tabs_footer_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum_posts_blocks_tabs_header_left_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_posts_blocks_tabs_header_right_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_posts_blocks_tabs_footer_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_posts_blocks_tabs_footer_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum__posts_v_blocks_tabs_header_left_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum__posts_v_blocks_tabs_header_right_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum__posts_v_blocks_tabs_footer_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum__posts_v_blocks_tabs_footer_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum_events_blocks_tabs_header_left_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_events_blocks_tabs_header_right_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_events_blocks_tabs_footer_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_events_blocks_tabs_footer_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum__events_v_blocks_tabs_header_left_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum__events_v_blocks_tabs_header_right_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum__events_v_blocks_tabs_footer_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum__events_v_blocks_tabs_footer_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum_event_cycles_blocks_tabs_header_left_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_event_cycles_blocks_tabs_header_right_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_event_cycles_blocks_tabs_footer_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_event_cycles_blocks_tabs_footer_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_tabs_header_left_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_tabs_header_right_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_tabs_footer_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum__event_cycles_v_blocks_tabs_footer_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum_partners_blocks_tabs_header_left_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_partners_blocks_tabs_header_right_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_partners_blocks_tabs_footer_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_partners_blocks_tabs_footer_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum__partners_v_blocks_tabs_header_left_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum__partners_v_blocks_tabs_header_right_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum__partners_v_blocks_tabs_footer_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum__partners_v_blocks_tabs_footer_alignment" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum_homepage_sections_blocks_tabs_header_left_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_homepage_sections_blocks_tabs_header_right_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_homepage_sections_blocks_tabs_footer_items_icon_name" AS ENUM('astronaut', 'bluesky', 'mace', 'time', 'dnd5', 'discord', 'document', 'mail', 'facebook', 'globe', 'star', 'instagram', 'calendar', 'gun', 'cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'messenger', 'sword', 'image', 'announcement', 'partner', 'pdf', 'pawn', 'download', 'review', 'wand', 'sf', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'stormtrooper', 'tag', 'shield', 'axe', 'twitch', 'fighter', 'event', 'youtube');
  CREATE TYPE "public"."enum_homepage_sections_blocks_tabs_footer_alignment" AS ENUM('start', 'center', 'end');
  ALTER TYPE "public"."enum_navigation_header_items_target_type" ADD VALUE 'siteContactEmail' BEFORE 'category';
  ALTER TYPE "public"."enum_footer_columns_items_target_type" ADD VALUE 'siteContactEmail' BEFORE 'category';
  CREATE TABLE "pages_blocks_tabs_header_left_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum_pages_blocks_tabs_header_left_items_icon_name",
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
  
  CREATE TABLE "pages_blocks_tabs_header_right_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum_pages_blocks_tabs_header_right_items_icon_name",
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
  
  CREATE TABLE "pages_blocks_tabs_footer_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum_pages_blocks_tabs_footer_items_icon_name",
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
  
  CREATE TABLE "pages_blocks_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar
  );
  
  CREATE TABLE "pages_blocks_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"footer_alignment" "enum_pages_blocks_tabs_footer_alignment" DEFAULT 'center',
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_tabs_header_left_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum__pages_v_blocks_tabs_header_left_items_icon_name",
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
  
  CREATE TABLE "_pages_v_blocks_tabs_header_right_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum__pages_v_blocks_tabs_header_right_items_icon_name",
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
  
  CREATE TABLE "_pages_v_blocks_tabs_footer_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum__pages_v_blocks_tabs_footer_items_icon_name",
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
  
  CREATE TABLE "_pages_v_blocks_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"footer_alignment" "enum__pages_v_blocks_tabs_footer_alignment" DEFAULT 'center',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_tabs_header_left_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum_posts_blocks_tabs_header_left_items_icon_name",
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
  
  CREATE TABLE "posts_blocks_tabs_header_right_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum_posts_blocks_tabs_header_right_items_icon_name",
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
  
  CREATE TABLE "posts_blocks_tabs_footer_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum_posts_blocks_tabs_footer_items_icon_name",
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
  
  CREATE TABLE "posts_blocks_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar
  );
  
  CREATE TABLE "posts_blocks_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"footer_alignment" "enum_posts_blocks_tabs_footer_alignment" DEFAULT 'center',
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_tabs_header_left_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum__posts_v_blocks_tabs_header_left_items_icon_name",
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
  
  CREATE TABLE "_posts_v_blocks_tabs_header_right_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum__posts_v_blocks_tabs_header_right_items_icon_name",
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
  
  CREATE TABLE "_posts_v_blocks_tabs_footer_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum__posts_v_blocks_tabs_footer_items_icon_name",
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
  
  CREATE TABLE "_posts_v_blocks_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"footer_alignment" "enum__posts_v_blocks_tabs_footer_alignment" DEFAULT 'center',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "events_blocks_tabs_header_left_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum_events_blocks_tabs_header_left_items_icon_name",
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
  
  CREATE TABLE "events_blocks_tabs_header_right_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum_events_blocks_tabs_header_right_items_icon_name",
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
  
  CREATE TABLE "events_blocks_tabs_footer_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum_events_blocks_tabs_footer_items_icon_name",
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
  
  CREATE TABLE "events_blocks_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar
  );
  
  CREATE TABLE "events_blocks_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"footer_alignment" "enum_events_blocks_tabs_footer_alignment" DEFAULT 'center',
  	"block_name" varchar
  );
  
  CREATE TABLE "_events_v_blocks_tabs_header_left_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum__events_v_blocks_tabs_header_left_items_icon_name",
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
  
  CREATE TABLE "_events_v_blocks_tabs_header_right_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum__events_v_blocks_tabs_header_right_items_icon_name",
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
  
  CREATE TABLE "_events_v_blocks_tabs_footer_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum__events_v_blocks_tabs_footer_items_icon_name",
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
  
  CREATE TABLE "_events_v_blocks_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_events_v_blocks_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"footer_alignment" "enum__events_v_blocks_tabs_footer_alignment" DEFAULT 'center',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "event_cycles_blocks_tabs_header_left_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum_event_cycles_blocks_tabs_header_left_items_icon_name",
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
  
  CREATE TABLE "event_cycles_blocks_tabs_header_right_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum_event_cycles_blocks_tabs_header_right_items_icon_name",
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
  
  CREATE TABLE "event_cycles_blocks_tabs_footer_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum_event_cycles_blocks_tabs_footer_items_icon_name",
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
  
  CREATE TABLE "event_cycles_blocks_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar
  );
  
  CREATE TABLE "event_cycles_blocks_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"footer_alignment" "enum_event_cycles_blocks_tabs_footer_alignment" DEFAULT 'center',
  	"block_name" varchar
  );
  
  CREATE TABLE "_event_cycles_v_blocks_tabs_header_left_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum__event_cycles_v_blocks_tabs_header_left_items_icon_name",
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
  
  CREATE TABLE "_event_cycles_v_blocks_tabs_header_right_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum__event_cycles_v_blocks_tabs_header_right_items_icon_name",
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
  
  CREATE TABLE "_event_cycles_v_blocks_tabs_footer_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum__event_cycles_v_blocks_tabs_footer_items_icon_name",
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
  
  CREATE TABLE "_event_cycles_v_blocks_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_event_cycles_v_blocks_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"footer_alignment" "enum__event_cycles_v_blocks_tabs_footer_alignment" DEFAULT 'center',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "partners_blocks_tabs_header_left_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum_partners_blocks_tabs_header_left_items_icon_name",
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
  
  CREATE TABLE "partners_blocks_tabs_header_right_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum_partners_blocks_tabs_header_right_items_icon_name",
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
  
  CREATE TABLE "partners_blocks_tabs_footer_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum_partners_blocks_tabs_footer_items_icon_name",
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
  
  CREATE TABLE "partners_blocks_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar
  );
  
  CREATE TABLE "partners_blocks_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"footer_alignment" "enum_partners_blocks_tabs_footer_alignment" DEFAULT 'center',
  	"block_name" varchar
  );
  
  CREATE TABLE "_partners_v_blocks_tabs_header_left_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum__partners_v_blocks_tabs_header_left_items_icon_name",
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
  
  CREATE TABLE "_partners_v_blocks_tabs_header_right_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum__partners_v_blocks_tabs_header_right_items_icon_name",
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
  
  CREATE TABLE "_partners_v_blocks_tabs_footer_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link',
  	"icon_name" "enum__partners_v_blocks_tabs_footer_items_icon_name",
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
  
  CREATE TABLE "_partners_v_blocks_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_partners_v_blocks_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"footer_alignment" "enum__partners_v_blocks_tabs_footer_alignment" DEFAULT 'center',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_sections_blocks_tabs_header_left_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link' NOT NULL,
  	"icon_name" "enum_homepage_sections_blocks_tabs_header_left_items_icon_name",
  	"target_type" "target" DEFAULT 'custom' NOT NULL,
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
  
  CREATE TABLE "homepage_sections_blocks_tabs_header_right_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link' NOT NULL,
  	"icon_name" "enum_homepage_sections_blocks_tabs_header_right_items_icon_name",
  	"target_type" "target" DEFAULT 'custom' NOT NULL,
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
  
  CREATE TABLE "homepage_sections_blocks_tabs_footer_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"appearance" "appearance" DEFAULT 'link' NOT NULL,
  	"icon_name" "enum_homepage_sections_blocks_tabs_footer_items_icon_name",
  	"target_type" "target" DEFAULT 'custom' NOT NULL,
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
  
  CREATE TABLE "homepage_sections_blocks_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "homepage_sections_blocks_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"footer_alignment" "enum_homepage_sections_blocks_tabs_footer_alignment" DEFAULT 'center',
  	"block_name" varchar
  );
  
  ALTER TABLE "navigation_header_items" ADD COLUMN "email_subject" varchar;
  ALTER TABLE "navigation_header_items" ADD COLUMN "email_body" varchar;
  ALTER TABLE "footer_columns_items" ADD COLUMN "email_subject" varchar;
  ALTER TABLE "footer_columns_items" ADD COLUMN "email_body" varchar;
  ALTER TABLE "pages_blocks_tabs_header_left_items" ADD CONSTRAINT "pages_blocks_tabs_header_left_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_tabs_header_left_items" ADD CONSTRAINT "pages_blocks_tabs_header_left_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_tabs_header_left_items" ADD CONSTRAINT "pages_blocks_tabs_header_left_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_tabs_header_left_items" ADD CONSTRAINT "pages_blocks_tabs_header_left_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_tabs_header_left_items" ADD CONSTRAINT "pages_blocks_tabs_header_left_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_tabs_header_left_items" ADD CONSTRAINT "pages_blocks_tabs_header_left_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_tabs_header_left_items" ADD CONSTRAINT "pages_blocks_tabs_header_left_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_tabs_header_left_items" ADD CONSTRAINT "pages_blocks_tabs_header_left_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_tabs_header_left_items" ADD CONSTRAINT "pages_blocks_tabs_header_left_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_tabs_header_right_items" ADD CONSTRAINT "pages_blocks_tabs_header_right_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_tabs_header_right_items" ADD CONSTRAINT "pages_blocks_tabs_header_right_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_tabs_header_right_items" ADD CONSTRAINT "pages_blocks_tabs_header_right_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_tabs_header_right_items" ADD CONSTRAINT "pages_blocks_tabs_header_right_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_tabs_header_right_items" ADD CONSTRAINT "pages_blocks_tabs_header_right_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_tabs_header_right_items" ADD CONSTRAINT "pages_blocks_tabs_header_right_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_tabs_header_right_items" ADD CONSTRAINT "pages_blocks_tabs_header_right_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_tabs_header_right_items" ADD CONSTRAINT "pages_blocks_tabs_header_right_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_tabs_header_right_items" ADD CONSTRAINT "pages_blocks_tabs_header_right_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_tabs_footer_items" ADD CONSTRAINT "pages_blocks_tabs_footer_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_tabs_footer_items" ADD CONSTRAINT "pages_blocks_tabs_footer_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_tabs_footer_items" ADD CONSTRAINT "pages_blocks_tabs_footer_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_tabs_footer_items" ADD CONSTRAINT "pages_blocks_tabs_footer_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_tabs_footer_items" ADD CONSTRAINT "pages_blocks_tabs_footer_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_tabs_footer_items" ADD CONSTRAINT "pages_blocks_tabs_footer_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_tabs_footer_items" ADD CONSTRAINT "pages_blocks_tabs_footer_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_tabs_footer_items" ADD CONSTRAINT "pages_blocks_tabs_footer_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_tabs_footer_items" ADD CONSTRAINT "pages_blocks_tabs_footer_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_tabs_tabs" ADD CONSTRAINT "pages_blocks_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_tabs" ADD CONSTRAINT "pages_blocks_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_pages_v_blocks_tabs_header_left_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_pages_v_blocks_tabs_header_left_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_pages_v_blocks_tabs_header_left_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_pages_v_blocks_tabs_header_left_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_pages_v_blocks_tabs_header_left_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_pages_v_blocks_tabs_header_left_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_pages_v_blocks_tabs_header_left_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_pages_v_blocks_tabs_header_left_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_pages_v_blocks_tabs_header_left_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_pages_v_blocks_tabs_header_right_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_pages_v_blocks_tabs_header_right_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_pages_v_blocks_tabs_header_right_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_pages_v_blocks_tabs_header_right_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_pages_v_blocks_tabs_header_right_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_pages_v_blocks_tabs_header_right_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_pages_v_blocks_tabs_header_right_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_pages_v_blocks_tabs_header_right_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_pages_v_blocks_tabs_header_right_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tabs_footer_items" ADD CONSTRAINT "_pages_v_blocks_tabs_footer_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tabs_footer_items" ADD CONSTRAINT "_pages_v_blocks_tabs_footer_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tabs_footer_items" ADD CONSTRAINT "_pages_v_blocks_tabs_footer_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tabs_footer_items" ADD CONSTRAINT "_pages_v_blocks_tabs_footer_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tabs_footer_items" ADD CONSTRAINT "_pages_v_blocks_tabs_footer_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tabs_footer_items" ADD CONSTRAINT "_pages_v_blocks_tabs_footer_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tabs_footer_items" ADD CONSTRAINT "_pages_v_blocks_tabs_footer_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tabs_footer_items" ADD CONSTRAINT "_pages_v_blocks_tabs_footer_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tabs_footer_items" ADD CONSTRAINT "_pages_v_blocks_tabs_footer_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tabs_tabs" ADD CONSTRAINT "_pages_v_blocks_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tabs" ADD CONSTRAINT "_pages_v_blocks_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_tabs_header_left_items" ADD CONSTRAINT "posts_blocks_tabs_header_left_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_tabs_header_left_items" ADD CONSTRAINT "posts_blocks_tabs_header_left_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_tabs_header_left_items" ADD CONSTRAINT "posts_blocks_tabs_header_left_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_tabs_header_left_items" ADD CONSTRAINT "posts_blocks_tabs_header_left_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_tabs_header_left_items" ADD CONSTRAINT "posts_blocks_tabs_header_left_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_tabs_header_left_items" ADD CONSTRAINT "posts_blocks_tabs_header_left_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_tabs_header_left_items" ADD CONSTRAINT "posts_blocks_tabs_header_left_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_tabs_header_left_items" ADD CONSTRAINT "posts_blocks_tabs_header_left_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_tabs_header_left_items" ADD CONSTRAINT "posts_blocks_tabs_header_left_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_tabs_header_right_items" ADD CONSTRAINT "posts_blocks_tabs_header_right_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_tabs_header_right_items" ADD CONSTRAINT "posts_blocks_tabs_header_right_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_tabs_header_right_items" ADD CONSTRAINT "posts_blocks_tabs_header_right_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_tabs_header_right_items" ADD CONSTRAINT "posts_blocks_tabs_header_right_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_tabs_header_right_items" ADD CONSTRAINT "posts_blocks_tabs_header_right_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_tabs_header_right_items" ADD CONSTRAINT "posts_blocks_tabs_header_right_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_tabs_header_right_items" ADD CONSTRAINT "posts_blocks_tabs_header_right_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_tabs_header_right_items" ADD CONSTRAINT "posts_blocks_tabs_header_right_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_tabs_header_right_items" ADD CONSTRAINT "posts_blocks_tabs_header_right_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_tabs_footer_items" ADD CONSTRAINT "posts_blocks_tabs_footer_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_tabs_footer_items" ADD CONSTRAINT "posts_blocks_tabs_footer_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_tabs_footer_items" ADD CONSTRAINT "posts_blocks_tabs_footer_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_tabs_footer_items" ADD CONSTRAINT "posts_blocks_tabs_footer_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_tabs_footer_items" ADD CONSTRAINT "posts_blocks_tabs_footer_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_tabs_footer_items" ADD CONSTRAINT "posts_blocks_tabs_footer_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_tabs_footer_items" ADD CONSTRAINT "posts_blocks_tabs_footer_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_tabs_footer_items" ADD CONSTRAINT "posts_blocks_tabs_footer_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_tabs_footer_items" ADD CONSTRAINT "posts_blocks_tabs_footer_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_tabs_tabs" ADD CONSTRAINT "posts_blocks_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_tabs" ADD CONSTRAINT "posts_blocks_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_posts_v_blocks_tabs_header_left_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_posts_v_blocks_tabs_header_left_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_posts_v_blocks_tabs_header_left_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_posts_v_blocks_tabs_header_left_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_posts_v_blocks_tabs_header_left_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_posts_v_blocks_tabs_header_left_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_posts_v_blocks_tabs_header_left_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_posts_v_blocks_tabs_header_left_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_posts_v_blocks_tabs_header_left_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_posts_v_blocks_tabs_header_right_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_posts_v_blocks_tabs_header_right_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_posts_v_blocks_tabs_header_right_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_posts_v_blocks_tabs_header_right_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_posts_v_blocks_tabs_header_right_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_posts_v_blocks_tabs_header_right_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_posts_v_blocks_tabs_header_right_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_posts_v_blocks_tabs_header_right_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_posts_v_blocks_tabs_header_right_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_tabs_footer_items" ADD CONSTRAINT "_posts_v_blocks_tabs_footer_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_tabs_footer_items" ADD CONSTRAINT "_posts_v_blocks_tabs_footer_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_tabs_footer_items" ADD CONSTRAINT "_posts_v_blocks_tabs_footer_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_tabs_footer_items" ADD CONSTRAINT "_posts_v_blocks_tabs_footer_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_tabs_footer_items" ADD CONSTRAINT "_posts_v_blocks_tabs_footer_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_tabs_footer_items" ADD CONSTRAINT "_posts_v_blocks_tabs_footer_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_tabs_footer_items" ADD CONSTRAINT "_posts_v_blocks_tabs_footer_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_tabs_footer_items" ADD CONSTRAINT "_posts_v_blocks_tabs_footer_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_tabs_footer_items" ADD CONSTRAINT "_posts_v_blocks_tabs_footer_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_tabs_tabs" ADD CONSTRAINT "_posts_v_blocks_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_tabs" ADD CONSTRAINT "_posts_v_blocks_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_blocks_tabs_header_left_items" ADD CONSTRAINT "events_blocks_tabs_header_left_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_tabs_header_left_items" ADD CONSTRAINT "events_blocks_tabs_header_left_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_tabs_header_left_items" ADD CONSTRAINT "events_blocks_tabs_header_left_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_tabs_header_left_items" ADD CONSTRAINT "events_blocks_tabs_header_left_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_tabs_header_left_items" ADD CONSTRAINT "events_blocks_tabs_header_left_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_tabs_header_left_items" ADD CONSTRAINT "events_blocks_tabs_header_left_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_tabs_header_left_items" ADD CONSTRAINT "events_blocks_tabs_header_left_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_tabs_header_left_items" ADD CONSTRAINT "events_blocks_tabs_header_left_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_tabs_header_left_items" ADD CONSTRAINT "events_blocks_tabs_header_left_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_blocks_tabs_header_right_items" ADD CONSTRAINT "events_blocks_tabs_header_right_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_tabs_header_right_items" ADD CONSTRAINT "events_blocks_tabs_header_right_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_tabs_header_right_items" ADD CONSTRAINT "events_blocks_tabs_header_right_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_tabs_header_right_items" ADD CONSTRAINT "events_blocks_tabs_header_right_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_tabs_header_right_items" ADD CONSTRAINT "events_blocks_tabs_header_right_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_tabs_header_right_items" ADD CONSTRAINT "events_blocks_tabs_header_right_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_tabs_header_right_items" ADD CONSTRAINT "events_blocks_tabs_header_right_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_tabs_header_right_items" ADD CONSTRAINT "events_blocks_tabs_header_right_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_tabs_header_right_items" ADD CONSTRAINT "events_blocks_tabs_header_right_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_blocks_tabs_footer_items" ADD CONSTRAINT "events_blocks_tabs_footer_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_tabs_footer_items" ADD CONSTRAINT "events_blocks_tabs_footer_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_tabs_footer_items" ADD CONSTRAINT "events_blocks_tabs_footer_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_tabs_footer_items" ADD CONSTRAINT "events_blocks_tabs_footer_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_tabs_footer_items" ADD CONSTRAINT "events_blocks_tabs_footer_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_tabs_footer_items" ADD CONSTRAINT "events_blocks_tabs_footer_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_tabs_footer_items" ADD CONSTRAINT "events_blocks_tabs_footer_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_tabs_footer_items" ADD CONSTRAINT "events_blocks_tabs_footer_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_blocks_tabs_footer_items" ADD CONSTRAINT "events_blocks_tabs_footer_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_blocks_tabs_tabs" ADD CONSTRAINT "events_blocks_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_blocks_tabs" ADD CONSTRAINT "events_blocks_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_events_v_blocks_tabs_header_left_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_events_v_blocks_tabs_header_left_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_events_v_blocks_tabs_header_left_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_events_v_blocks_tabs_header_left_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_events_v_blocks_tabs_header_left_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_events_v_blocks_tabs_header_left_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_events_v_blocks_tabs_header_left_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_events_v_blocks_tabs_header_left_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_events_v_blocks_tabs_header_left_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_events_v_blocks_tabs_header_right_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_events_v_blocks_tabs_header_right_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_events_v_blocks_tabs_header_right_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_events_v_blocks_tabs_header_right_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_events_v_blocks_tabs_header_right_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_events_v_blocks_tabs_header_right_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_events_v_blocks_tabs_header_right_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_events_v_blocks_tabs_header_right_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_events_v_blocks_tabs_header_right_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_tabs_footer_items" ADD CONSTRAINT "_events_v_blocks_tabs_footer_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_tabs_footer_items" ADD CONSTRAINT "_events_v_blocks_tabs_footer_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_tabs_footer_items" ADD CONSTRAINT "_events_v_blocks_tabs_footer_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_tabs_footer_items" ADD CONSTRAINT "_events_v_blocks_tabs_footer_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_tabs_footer_items" ADD CONSTRAINT "_events_v_blocks_tabs_footer_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_tabs_footer_items" ADD CONSTRAINT "_events_v_blocks_tabs_footer_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_tabs_footer_items" ADD CONSTRAINT "_events_v_blocks_tabs_footer_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_tabs_footer_items" ADD CONSTRAINT "_events_v_blocks_tabs_footer_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_tabs_footer_items" ADD CONSTRAINT "_events_v_blocks_tabs_footer_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_tabs_tabs" ADD CONSTRAINT "_events_v_blocks_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_blocks_tabs" ADD CONSTRAINT "_events_v_blocks_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_tabs_header_left_items" ADD CONSTRAINT "event_cycles_blocks_tabs_header_left_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_tabs_header_left_items" ADD CONSTRAINT "event_cycles_blocks_tabs_header_left_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_tabs_header_left_items" ADD CONSTRAINT "event_cycles_blocks_tabs_header_left_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_tabs_header_left_items" ADD CONSTRAINT "event_cycles_blocks_tabs_header_left_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_tabs_header_left_items" ADD CONSTRAINT "event_cycles_blocks_tabs_header_left_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_tabs_header_left_items" ADD CONSTRAINT "event_cycles_blocks_tabs_header_left_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_tabs_header_left_items" ADD CONSTRAINT "event_cycles_blocks_tabs_header_left_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_tabs_header_left_items" ADD CONSTRAINT "event_cycles_blocks_tabs_header_left_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_tabs_header_left_items" ADD CONSTRAINT "event_cycles_blocks_tabs_header_left_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_cycles_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_tabs_header_right_items" ADD CONSTRAINT "event_cycles_blocks_tabs_header_right_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_tabs_header_right_items" ADD CONSTRAINT "event_cycles_blocks_tabs_header_right_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_tabs_header_right_items" ADD CONSTRAINT "event_cycles_blocks_tabs_header_right_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_tabs_header_right_items" ADD CONSTRAINT "event_cycles_blocks_tabs_header_right_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_tabs_header_right_items" ADD CONSTRAINT "event_cycles_blocks_tabs_header_right_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_tabs_header_right_items" ADD CONSTRAINT "event_cycles_blocks_tabs_header_right_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_tabs_header_right_items" ADD CONSTRAINT "event_cycles_blocks_tabs_header_right_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_tabs_header_right_items" ADD CONSTRAINT "event_cycles_blocks_tabs_header_right_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_tabs_header_right_items" ADD CONSTRAINT "event_cycles_blocks_tabs_header_right_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_cycles_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_tabs_footer_items" ADD CONSTRAINT "event_cycles_blocks_tabs_footer_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_tabs_footer_items" ADD CONSTRAINT "event_cycles_blocks_tabs_footer_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_tabs_footer_items" ADD CONSTRAINT "event_cycles_blocks_tabs_footer_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_tabs_footer_items" ADD CONSTRAINT "event_cycles_blocks_tabs_footer_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_tabs_footer_items" ADD CONSTRAINT "event_cycles_blocks_tabs_footer_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_tabs_footer_items" ADD CONSTRAINT "event_cycles_blocks_tabs_footer_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_tabs_footer_items" ADD CONSTRAINT "event_cycles_blocks_tabs_footer_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_tabs_footer_items" ADD CONSTRAINT "event_cycles_blocks_tabs_footer_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_tabs_footer_items" ADD CONSTRAINT "event_cycles_blocks_tabs_footer_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_cycles_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_tabs_tabs" ADD CONSTRAINT "event_cycles_blocks_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_cycles_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_cycles_blocks_tabs" ADD CONSTRAINT "event_cycles_blocks_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_cycles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_event_cycles_v_blocks_tabs_header_left_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_event_cycles_v_blocks_tabs_header_left_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_event_cycles_v_blocks_tabs_header_left_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_event_cycles_v_blocks_tabs_header_left_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_event_cycles_v_blocks_tabs_header_left_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_event_cycles_v_blocks_tabs_header_left_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_event_cycles_v_blocks_tabs_header_left_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_event_cycles_v_blocks_tabs_header_left_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_event_cycles_v_blocks_tabs_header_left_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_event_cycles_v_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_event_cycles_v_blocks_tabs_header_right_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_event_cycles_v_blocks_tabs_header_right_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_event_cycles_v_blocks_tabs_header_right_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_event_cycles_v_blocks_tabs_header_right_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_event_cycles_v_blocks_tabs_header_right_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_event_cycles_v_blocks_tabs_header_right_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_event_cycles_v_blocks_tabs_header_right_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_event_cycles_v_blocks_tabs_header_right_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_event_cycles_v_blocks_tabs_header_right_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_event_cycles_v_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_tabs_footer_items" ADD CONSTRAINT "_event_cycles_v_blocks_tabs_footer_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_tabs_footer_items" ADD CONSTRAINT "_event_cycles_v_blocks_tabs_footer_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_tabs_footer_items" ADD CONSTRAINT "_event_cycles_v_blocks_tabs_footer_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_tabs_footer_items" ADD CONSTRAINT "_event_cycles_v_blocks_tabs_footer_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_tabs_footer_items" ADD CONSTRAINT "_event_cycles_v_blocks_tabs_footer_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_tabs_footer_items" ADD CONSTRAINT "_event_cycles_v_blocks_tabs_footer_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_tabs_footer_items" ADD CONSTRAINT "_event_cycles_v_blocks_tabs_footer_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_tabs_footer_items" ADD CONSTRAINT "_event_cycles_v_blocks_tabs_footer_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_tabs_footer_items" ADD CONSTRAINT "_event_cycles_v_blocks_tabs_footer_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_event_cycles_v_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_tabs_tabs" ADD CONSTRAINT "_event_cycles_v_blocks_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_event_cycles_v_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_cycles_v_blocks_tabs" ADD CONSTRAINT "_event_cycles_v_blocks_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_event_cycles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_blocks_tabs_header_left_items" ADD CONSTRAINT "partners_blocks_tabs_header_left_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_tabs_header_left_items" ADD CONSTRAINT "partners_blocks_tabs_header_left_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_tabs_header_left_items" ADD CONSTRAINT "partners_blocks_tabs_header_left_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_tabs_header_left_items" ADD CONSTRAINT "partners_blocks_tabs_header_left_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_tabs_header_left_items" ADD CONSTRAINT "partners_blocks_tabs_header_left_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_tabs_header_left_items" ADD CONSTRAINT "partners_blocks_tabs_header_left_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_tabs_header_left_items" ADD CONSTRAINT "partners_blocks_tabs_header_left_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_tabs_header_left_items" ADD CONSTRAINT "partners_blocks_tabs_header_left_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_tabs_header_left_items" ADD CONSTRAINT "partners_blocks_tabs_header_left_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_blocks_tabs_header_right_items" ADD CONSTRAINT "partners_blocks_tabs_header_right_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_tabs_header_right_items" ADD CONSTRAINT "partners_blocks_tabs_header_right_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_tabs_header_right_items" ADD CONSTRAINT "partners_blocks_tabs_header_right_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_tabs_header_right_items" ADD CONSTRAINT "partners_blocks_tabs_header_right_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_tabs_header_right_items" ADD CONSTRAINT "partners_blocks_tabs_header_right_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_tabs_header_right_items" ADD CONSTRAINT "partners_blocks_tabs_header_right_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_tabs_header_right_items" ADD CONSTRAINT "partners_blocks_tabs_header_right_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_tabs_header_right_items" ADD CONSTRAINT "partners_blocks_tabs_header_right_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_tabs_header_right_items" ADD CONSTRAINT "partners_blocks_tabs_header_right_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_blocks_tabs_footer_items" ADD CONSTRAINT "partners_blocks_tabs_footer_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_tabs_footer_items" ADD CONSTRAINT "partners_blocks_tabs_footer_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_tabs_footer_items" ADD CONSTRAINT "partners_blocks_tabs_footer_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_tabs_footer_items" ADD CONSTRAINT "partners_blocks_tabs_footer_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_tabs_footer_items" ADD CONSTRAINT "partners_blocks_tabs_footer_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_tabs_footer_items" ADD CONSTRAINT "partners_blocks_tabs_footer_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_tabs_footer_items" ADD CONSTRAINT "partners_blocks_tabs_footer_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_tabs_footer_items" ADD CONSTRAINT "partners_blocks_tabs_footer_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_blocks_tabs_footer_items" ADD CONSTRAINT "partners_blocks_tabs_footer_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_blocks_tabs_tabs" ADD CONSTRAINT "partners_blocks_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_blocks_tabs" ADD CONSTRAINT "partners_blocks_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_partners_v_blocks_tabs_header_left_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_partners_v_blocks_tabs_header_left_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_partners_v_blocks_tabs_header_left_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_partners_v_blocks_tabs_header_left_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_partners_v_blocks_tabs_header_left_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_partners_v_blocks_tabs_header_left_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_partners_v_blocks_tabs_header_left_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_partners_v_blocks_tabs_header_left_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_tabs_header_left_items" ADD CONSTRAINT "_partners_v_blocks_tabs_header_left_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partners_v_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_partners_v_blocks_tabs_header_right_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_partners_v_blocks_tabs_header_right_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_partners_v_blocks_tabs_header_right_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_partners_v_blocks_tabs_header_right_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_partners_v_blocks_tabs_header_right_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_partners_v_blocks_tabs_header_right_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_partners_v_blocks_tabs_header_right_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_partners_v_blocks_tabs_header_right_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_tabs_header_right_items" ADD CONSTRAINT "_partners_v_blocks_tabs_header_right_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partners_v_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_tabs_footer_items" ADD CONSTRAINT "_partners_v_blocks_tabs_footer_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_tabs_footer_items" ADD CONSTRAINT "_partners_v_blocks_tabs_footer_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_tabs_footer_items" ADD CONSTRAINT "_partners_v_blocks_tabs_footer_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_tabs_footer_items" ADD CONSTRAINT "_partners_v_blocks_tabs_footer_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_tabs_footer_items" ADD CONSTRAINT "_partners_v_blocks_tabs_footer_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_tabs_footer_items" ADD CONSTRAINT "_partners_v_blocks_tabs_footer_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_tabs_footer_items" ADD CONSTRAINT "_partners_v_blocks_tabs_footer_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_tabs_footer_items" ADD CONSTRAINT "_partners_v_blocks_tabs_footer_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_tabs_footer_items" ADD CONSTRAINT "_partners_v_blocks_tabs_footer_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partners_v_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_tabs_tabs" ADD CONSTRAINT "_partners_v_blocks_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partners_v_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v_blocks_tabs" ADD CONSTRAINT "_partners_v_blocks_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partners_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_tabs_header_left_items" ADD CONSTRAINT "homepage_sections_blocks_tabs_header_left_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_tabs_header_left_items" ADD CONSTRAINT "homepage_sections_blocks_tabs_header_left_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_tabs_header_left_items" ADD CONSTRAINT "homepage_sections_blocks_tabs_header_left_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_tabs_header_left_items" ADD CONSTRAINT "homepage_sections_blocks_tabs_header_left_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_tabs_header_left_items" ADD CONSTRAINT "homepage_sections_blocks_tabs_header_left_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_tabs_header_left_items" ADD CONSTRAINT "homepage_sections_blocks_tabs_header_left_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_tabs_header_left_items" ADD CONSTRAINT "homepage_sections_blocks_tabs_header_left_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_tabs_header_left_items" ADD CONSTRAINT "homepage_sections_blocks_tabs_header_left_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_tabs_header_left_items" ADD CONSTRAINT "homepage_sections_blocks_tabs_header_left_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_tabs_header_right_items" ADD CONSTRAINT "homepage_sections_blocks_tabs_header_right_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_tabs_header_right_items" ADD CONSTRAINT "homepage_sections_blocks_tabs_header_right_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_tabs_header_right_items" ADD CONSTRAINT "homepage_sections_blocks_tabs_header_right_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_tabs_header_right_items" ADD CONSTRAINT "homepage_sections_blocks_tabs_header_right_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_tabs_header_right_items" ADD CONSTRAINT "homepage_sections_blocks_tabs_header_right_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_tabs_header_right_items" ADD CONSTRAINT "homepage_sections_blocks_tabs_header_right_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_tabs_header_right_items" ADD CONSTRAINT "homepage_sections_blocks_tabs_header_right_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_tabs_header_right_items" ADD CONSTRAINT "homepage_sections_blocks_tabs_header_right_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_tabs_header_right_items" ADD CONSTRAINT "homepage_sections_blocks_tabs_header_right_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_tabs_footer_items" ADD CONSTRAINT "homepage_sections_blocks_tabs_footer_items_event_cycle_id_event_cycles_id_fk" FOREIGN KEY ("event_cycle_id") REFERENCES "public"."event_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_tabs_footer_items" ADD CONSTRAINT "homepage_sections_blocks_tabs_footer_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_tabs_footer_items" ADD CONSTRAINT "homepage_sections_blocks_tabs_footer_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_tabs_footer_items" ADD CONSTRAINT "homepage_sections_blocks_tabs_footer_items_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_tabs_footer_items" ADD CONSTRAINT "homepage_sections_blocks_tabs_footer_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_tabs_footer_items" ADD CONSTRAINT "homepage_sections_blocks_tabs_footer_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_tabs_footer_items" ADD CONSTRAINT "homepage_sections_blocks_tabs_footer_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_tabs_footer_items" ADD CONSTRAINT "homepage_sections_blocks_tabs_footer_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_tabs_footer_items" ADD CONSTRAINT "homepage_sections_blocks_tabs_footer_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_tabs_tabs" ADD CONSTRAINT "homepage_sections_blocks_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_blocks_tabs" ADD CONSTRAINT "homepage_sections_blocks_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_tabs_header_left_items_order_idx" ON "pages_blocks_tabs_header_left_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_tabs_header_left_items_parent_id_idx" ON "pages_blocks_tabs_header_left_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_tabs_header_left_items_event_cycle_idx" ON "pages_blocks_tabs_header_left_items" USING btree ("event_cycle_id");
  CREATE INDEX "pages_blocks_tabs_header_left_items_document_idx" ON "pages_blocks_tabs_header_left_items" USING btree ("document_id");
  CREATE INDEX "pages_blocks_tabs_header_left_items_category_idx" ON "pages_blocks_tabs_header_left_items" USING btree ("category_id");
  CREATE INDEX "pages_blocks_tabs_header_left_items_partner_idx" ON "pages_blocks_tabs_header_left_items" USING btree ("partner_id");
  CREATE INDEX "pages_blocks_tabs_header_left_items_page_idx" ON "pages_blocks_tabs_header_left_items" USING btree ("page_id");
  CREATE INDEX "pages_blocks_tabs_header_left_items_tag_idx" ON "pages_blocks_tabs_header_left_items" USING btree ("tag_id");
  CREATE INDEX "pages_blocks_tabs_header_left_items_post_idx" ON "pages_blocks_tabs_header_left_items" USING btree ("post_id");
  CREATE INDEX "pages_blocks_tabs_header_left_items_event_idx" ON "pages_blocks_tabs_header_left_items" USING btree ("event_id");
  CREATE INDEX "pages_blocks_tabs_header_right_items_order_idx" ON "pages_blocks_tabs_header_right_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_tabs_header_right_items_parent_id_idx" ON "pages_blocks_tabs_header_right_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_tabs_header_right_items_event_cycle_idx" ON "pages_blocks_tabs_header_right_items" USING btree ("event_cycle_id");
  CREATE INDEX "pages_blocks_tabs_header_right_items_document_idx" ON "pages_blocks_tabs_header_right_items" USING btree ("document_id");
  CREATE INDEX "pages_blocks_tabs_header_right_items_category_idx" ON "pages_blocks_tabs_header_right_items" USING btree ("category_id");
  CREATE INDEX "pages_blocks_tabs_header_right_items_partner_idx" ON "pages_blocks_tabs_header_right_items" USING btree ("partner_id");
  CREATE INDEX "pages_blocks_tabs_header_right_items_page_idx" ON "pages_blocks_tabs_header_right_items" USING btree ("page_id");
  CREATE INDEX "pages_blocks_tabs_header_right_items_tag_idx" ON "pages_blocks_tabs_header_right_items" USING btree ("tag_id");
  CREATE INDEX "pages_blocks_tabs_header_right_items_post_idx" ON "pages_blocks_tabs_header_right_items" USING btree ("post_id");
  CREATE INDEX "pages_blocks_tabs_header_right_items_event_idx" ON "pages_blocks_tabs_header_right_items" USING btree ("event_id");
  CREATE INDEX "pages_blocks_tabs_footer_items_order_idx" ON "pages_blocks_tabs_footer_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_tabs_footer_items_parent_id_idx" ON "pages_blocks_tabs_footer_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_tabs_footer_items_event_cycle_idx" ON "pages_blocks_tabs_footer_items" USING btree ("event_cycle_id");
  CREATE INDEX "pages_blocks_tabs_footer_items_document_idx" ON "pages_blocks_tabs_footer_items" USING btree ("document_id");
  CREATE INDEX "pages_blocks_tabs_footer_items_category_idx" ON "pages_blocks_tabs_footer_items" USING btree ("category_id");
  CREATE INDEX "pages_blocks_tabs_footer_items_partner_idx" ON "pages_blocks_tabs_footer_items" USING btree ("partner_id");
  CREATE INDEX "pages_blocks_tabs_footer_items_page_idx" ON "pages_blocks_tabs_footer_items" USING btree ("page_id");
  CREATE INDEX "pages_blocks_tabs_footer_items_tag_idx" ON "pages_blocks_tabs_footer_items" USING btree ("tag_id");
  CREATE INDEX "pages_blocks_tabs_footer_items_post_idx" ON "pages_blocks_tabs_footer_items" USING btree ("post_id");
  CREATE INDEX "pages_blocks_tabs_footer_items_event_idx" ON "pages_blocks_tabs_footer_items" USING btree ("event_id");
  CREATE INDEX "pages_blocks_tabs_tabs_order_idx" ON "pages_blocks_tabs_tabs" USING btree ("_order");
  CREATE INDEX "pages_blocks_tabs_tabs_parent_id_idx" ON "pages_blocks_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_tabs_order_idx" ON "pages_blocks_tabs" USING btree ("_order");
  CREATE INDEX "pages_blocks_tabs_parent_id_idx" ON "pages_blocks_tabs" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_tabs_path_idx" ON "pages_blocks_tabs" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_tabs_header_left_items_order_idx" ON "_pages_v_blocks_tabs_header_left_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_tabs_header_left_items_parent_id_idx" ON "_pages_v_blocks_tabs_header_left_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_tabs_header_left_items_event_cycle_idx" ON "_pages_v_blocks_tabs_header_left_items" USING btree ("event_cycle_id");
  CREATE INDEX "_pages_v_blocks_tabs_header_left_items_document_idx" ON "_pages_v_blocks_tabs_header_left_items" USING btree ("document_id");
  CREATE INDEX "_pages_v_blocks_tabs_header_left_items_category_idx" ON "_pages_v_blocks_tabs_header_left_items" USING btree ("category_id");
  CREATE INDEX "_pages_v_blocks_tabs_header_left_items_partner_idx" ON "_pages_v_blocks_tabs_header_left_items" USING btree ("partner_id");
  CREATE INDEX "_pages_v_blocks_tabs_header_left_items_page_idx" ON "_pages_v_blocks_tabs_header_left_items" USING btree ("page_id");
  CREATE INDEX "_pages_v_blocks_tabs_header_left_items_tag_idx" ON "_pages_v_blocks_tabs_header_left_items" USING btree ("tag_id");
  CREATE INDEX "_pages_v_blocks_tabs_header_left_items_post_idx" ON "_pages_v_blocks_tabs_header_left_items" USING btree ("post_id");
  CREATE INDEX "_pages_v_blocks_tabs_header_left_items_event_idx" ON "_pages_v_blocks_tabs_header_left_items" USING btree ("event_id");
  CREATE INDEX "_pages_v_blocks_tabs_header_right_items_order_idx" ON "_pages_v_blocks_tabs_header_right_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_tabs_header_right_items_parent_id_idx" ON "_pages_v_blocks_tabs_header_right_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_tabs_header_right_items_event_cycle_idx" ON "_pages_v_blocks_tabs_header_right_items" USING btree ("event_cycle_id");
  CREATE INDEX "_pages_v_blocks_tabs_header_right_items_document_idx" ON "_pages_v_blocks_tabs_header_right_items" USING btree ("document_id");
  CREATE INDEX "_pages_v_blocks_tabs_header_right_items_category_idx" ON "_pages_v_blocks_tabs_header_right_items" USING btree ("category_id");
  CREATE INDEX "_pages_v_blocks_tabs_header_right_items_partner_idx" ON "_pages_v_blocks_tabs_header_right_items" USING btree ("partner_id");
  CREATE INDEX "_pages_v_blocks_tabs_header_right_items_page_idx" ON "_pages_v_blocks_tabs_header_right_items" USING btree ("page_id");
  CREATE INDEX "_pages_v_blocks_tabs_header_right_items_tag_idx" ON "_pages_v_blocks_tabs_header_right_items" USING btree ("tag_id");
  CREATE INDEX "_pages_v_blocks_tabs_header_right_items_post_idx" ON "_pages_v_blocks_tabs_header_right_items" USING btree ("post_id");
  CREATE INDEX "_pages_v_blocks_tabs_header_right_items_event_idx" ON "_pages_v_blocks_tabs_header_right_items" USING btree ("event_id");
  CREATE INDEX "_pages_v_blocks_tabs_footer_items_order_idx" ON "_pages_v_blocks_tabs_footer_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_tabs_footer_items_parent_id_idx" ON "_pages_v_blocks_tabs_footer_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_tabs_footer_items_event_cycle_idx" ON "_pages_v_blocks_tabs_footer_items" USING btree ("event_cycle_id");
  CREATE INDEX "_pages_v_blocks_tabs_footer_items_document_idx" ON "_pages_v_blocks_tabs_footer_items" USING btree ("document_id");
  CREATE INDEX "_pages_v_blocks_tabs_footer_items_category_idx" ON "_pages_v_blocks_tabs_footer_items" USING btree ("category_id");
  CREATE INDEX "_pages_v_blocks_tabs_footer_items_partner_idx" ON "_pages_v_blocks_tabs_footer_items" USING btree ("partner_id");
  CREATE INDEX "_pages_v_blocks_tabs_footer_items_page_idx" ON "_pages_v_blocks_tabs_footer_items" USING btree ("page_id");
  CREATE INDEX "_pages_v_blocks_tabs_footer_items_tag_idx" ON "_pages_v_blocks_tabs_footer_items" USING btree ("tag_id");
  CREATE INDEX "_pages_v_blocks_tabs_footer_items_post_idx" ON "_pages_v_blocks_tabs_footer_items" USING btree ("post_id");
  CREATE INDEX "_pages_v_blocks_tabs_footer_items_event_idx" ON "_pages_v_blocks_tabs_footer_items" USING btree ("event_id");
  CREATE INDEX "_pages_v_blocks_tabs_tabs_order_idx" ON "_pages_v_blocks_tabs_tabs" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_tabs_tabs_parent_id_idx" ON "_pages_v_blocks_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_tabs_order_idx" ON "_pages_v_blocks_tabs" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_tabs_parent_id_idx" ON "_pages_v_blocks_tabs" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_tabs_path_idx" ON "_pages_v_blocks_tabs" USING btree ("_path");
  CREATE INDEX "posts_blocks_tabs_header_left_items_order_idx" ON "posts_blocks_tabs_header_left_items" USING btree ("_order");
  CREATE INDEX "posts_blocks_tabs_header_left_items_parent_id_idx" ON "posts_blocks_tabs_header_left_items" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_tabs_header_left_items_event_cycle_idx" ON "posts_blocks_tabs_header_left_items" USING btree ("event_cycle_id");
  CREATE INDEX "posts_blocks_tabs_header_left_items_document_idx" ON "posts_blocks_tabs_header_left_items" USING btree ("document_id");
  CREATE INDEX "posts_blocks_tabs_header_left_items_category_idx" ON "posts_blocks_tabs_header_left_items" USING btree ("category_id");
  CREATE INDEX "posts_blocks_tabs_header_left_items_partner_idx" ON "posts_blocks_tabs_header_left_items" USING btree ("partner_id");
  CREATE INDEX "posts_blocks_tabs_header_left_items_page_idx" ON "posts_blocks_tabs_header_left_items" USING btree ("page_id");
  CREATE INDEX "posts_blocks_tabs_header_left_items_tag_idx" ON "posts_blocks_tabs_header_left_items" USING btree ("tag_id");
  CREATE INDEX "posts_blocks_tabs_header_left_items_post_idx" ON "posts_blocks_tabs_header_left_items" USING btree ("post_id");
  CREATE INDEX "posts_blocks_tabs_header_left_items_event_idx" ON "posts_blocks_tabs_header_left_items" USING btree ("event_id");
  CREATE INDEX "posts_blocks_tabs_header_right_items_order_idx" ON "posts_blocks_tabs_header_right_items" USING btree ("_order");
  CREATE INDEX "posts_blocks_tabs_header_right_items_parent_id_idx" ON "posts_blocks_tabs_header_right_items" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_tabs_header_right_items_event_cycle_idx" ON "posts_blocks_tabs_header_right_items" USING btree ("event_cycle_id");
  CREATE INDEX "posts_blocks_tabs_header_right_items_document_idx" ON "posts_blocks_tabs_header_right_items" USING btree ("document_id");
  CREATE INDEX "posts_blocks_tabs_header_right_items_category_idx" ON "posts_blocks_tabs_header_right_items" USING btree ("category_id");
  CREATE INDEX "posts_blocks_tabs_header_right_items_partner_idx" ON "posts_blocks_tabs_header_right_items" USING btree ("partner_id");
  CREATE INDEX "posts_blocks_tabs_header_right_items_page_idx" ON "posts_blocks_tabs_header_right_items" USING btree ("page_id");
  CREATE INDEX "posts_blocks_tabs_header_right_items_tag_idx" ON "posts_blocks_tabs_header_right_items" USING btree ("tag_id");
  CREATE INDEX "posts_blocks_tabs_header_right_items_post_idx" ON "posts_blocks_tabs_header_right_items" USING btree ("post_id");
  CREATE INDEX "posts_blocks_tabs_header_right_items_event_idx" ON "posts_blocks_tabs_header_right_items" USING btree ("event_id");
  CREATE INDEX "posts_blocks_tabs_footer_items_order_idx" ON "posts_blocks_tabs_footer_items" USING btree ("_order");
  CREATE INDEX "posts_blocks_tabs_footer_items_parent_id_idx" ON "posts_blocks_tabs_footer_items" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_tabs_footer_items_event_cycle_idx" ON "posts_blocks_tabs_footer_items" USING btree ("event_cycle_id");
  CREATE INDEX "posts_blocks_tabs_footer_items_document_idx" ON "posts_blocks_tabs_footer_items" USING btree ("document_id");
  CREATE INDEX "posts_blocks_tabs_footer_items_category_idx" ON "posts_blocks_tabs_footer_items" USING btree ("category_id");
  CREATE INDEX "posts_blocks_tabs_footer_items_partner_idx" ON "posts_blocks_tabs_footer_items" USING btree ("partner_id");
  CREATE INDEX "posts_blocks_tabs_footer_items_page_idx" ON "posts_blocks_tabs_footer_items" USING btree ("page_id");
  CREATE INDEX "posts_blocks_tabs_footer_items_tag_idx" ON "posts_blocks_tabs_footer_items" USING btree ("tag_id");
  CREATE INDEX "posts_blocks_tabs_footer_items_post_idx" ON "posts_blocks_tabs_footer_items" USING btree ("post_id");
  CREATE INDEX "posts_blocks_tabs_footer_items_event_idx" ON "posts_blocks_tabs_footer_items" USING btree ("event_id");
  CREATE INDEX "posts_blocks_tabs_tabs_order_idx" ON "posts_blocks_tabs_tabs" USING btree ("_order");
  CREATE INDEX "posts_blocks_tabs_tabs_parent_id_idx" ON "posts_blocks_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_tabs_order_idx" ON "posts_blocks_tabs" USING btree ("_order");
  CREATE INDEX "posts_blocks_tabs_parent_id_idx" ON "posts_blocks_tabs" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_tabs_path_idx" ON "posts_blocks_tabs" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_tabs_header_left_items_order_idx" ON "_posts_v_blocks_tabs_header_left_items" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_tabs_header_left_items_parent_id_idx" ON "_posts_v_blocks_tabs_header_left_items" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_tabs_header_left_items_event_cycle_idx" ON "_posts_v_blocks_tabs_header_left_items" USING btree ("event_cycle_id");
  CREATE INDEX "_posts_v_blocks_tabs_header_left_items_document_idx" ON "_posts_v_blocks_tabs_header_left_items" USING btree ("document_id");
  CREATE INDEX "_posts_v_blocks_tabs_header_left_items_category_idx" ON "_posts_v_blocks_tabs_header_left_items" USING btree ("category_id");
  CREATE INDEX "_posts_v_blocks_tabs_header_left_items_partner_idx" ON "_posts_v_blocks_tabs_header_left_items" USING btree ("partner_id");
  CREATE INDEX "_posts_v_blocks_tabs_header_left_items_page_idx" ON "_posts_v_blocks_tabs_header_left_items" USING btree ("page_id");
  CREATE INDEX "_posts_v_blocks_tabs_header_left_items_tag_idx" ON "_posts_v_blocks_tabs_header_left_items" USING btree ("tag_id");
  CREATE INDEX "_posts_v_blocks_tabs_header_left_items_post_idx" ON "_posts_v_blocks_tabs_header_left_items" USING btree ("post_id");
  CREATE INDEX "_posts_v_blocks_tabs_header_left_items_event_idx" ON "_posts_v_blocks_tabs_header_left_items" USING btree ("event_id");
  CREATE INDEX "_posts_v_blocks_tabs_header_right_items_order_idx" ON "_posts_v_blocks_tabs_header_right_items" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_tabs_header_right_items_parent_id_idx" ON "_posts_v_blocks_tabs_header_right_items" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_tabs_header_right_items_event_cycle_idx" ON "_posts_v_blocks_tabs_header_right_items" USING btree ("event_cycle_id");
  CREATE INDEX "_posts_v_blocks_tabs_header_right_items_document_idx" ON "_posts_v_blocks_tabs_header_right_items" USING btree ("document_id");
  CREATE INDEX "_posts_v_blocks_tabs_header_right_items_category_idx" ON "_posts_v_blocks_tabs_header_right_items" USING btree ("category_id");
  CREATE INDEX "_posts_v_blocks_tabs_header_right_items_partner_idx" ON "_posts_v_blocks_tabs_header_right_items" USING btree ("partner_id");
  CREATE INDEX "_posts_v_blocks_tabs_header_right_items_page_idx" ON "_posts_v_blocks_tabs_header_right_items" USING btree ("page_id");
  CREATE INDEX "_posts_v_blocks_tabs_header_right_items_tag_idx" ON "_posts_v_blocks_tabs_header_right_items" USING btree ("tag_id");
  CREATE INDEX "_posts_v_blocks_tabs_header_right_items_post_idx" ON "_posts_v_blocks_tabs_header_right_items" USING btree ("post_id");
  CREATE INDEX "_posts_v_blocks_tabs_header_right_items_event_idx" ON "_posts_v_blocks_tabs_header_right_items" USING btree ("event_id");
  CREATE INDEX "_posts_v_blocks_tabs_footer_items_order_idx" ON "_posts_v_blocks_tabs_footer_items" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_tabs_footer_items_parent_id_idx" ON "_posts_v_blocks_tabs_footer_items" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_tabs_footer_items_event_cycle_idx" ON "_posts_v_blocks_tabs_footer_items" USING btree ("event_cycle_id");
  CREATE INDEX "_posts_v_blocks_tabs_footer_items_document_idx" ON "_posts_v_blocks_tabs_footer_items" USING btree ("document_id");
  CREATE INDEX "_posts_v_blocks_tabs_footer_items_category_idx" ON "_posts_v_blocks_tabs_footer_items" USING btree ("category_id");
  CREATE INDEX "_posts_v_blocks_tabs_footer_items_partner_idx" ON "_posts_v_blocks_tabs_footer_items" USING btree ("partner_id");
  CREATE INDEX "_posts_v_blocks_tabs_footer_items_page_idx" ON "_posts_v_blocks_tabs_footer_items" USING btree ("page_id");
  CREATE INDEX "_posts_v_blocks_tabs_footer_items_tag_idx" ON "_posts_v_blocks_tabs_footer_items" USING btree ("tag_id");
  CREATE INDEX "_posts_v_blocks_tabs_footer_items_post_idx" ON "_posts_v_blocks_tabs_footer_items" USING btree ("post_id");
  CREATE INDEX "_posts_v_blocks_tabs_footer_items_event_idx" ON "_posts_v_blocks_tabs_footer_items" USING btree ("event_id");
  CREATE INDEX "_posts_v_blocks_tabs_tabs_order_idx" ON "_posts_v_blocks_tabs_tabs" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_tabs_tabs_parent_id_idx" ON "_posts_v_blocks_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_tabs_order_idx" ON "_posts_v_blocks_tabs" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_tabs_parent_id_idx" ON "_posts_v_blocks_tabs" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_tabs_path_idx" ON "_posts_v_blocks_tabs" USING btree ("_path");
  CREATE INDEX "events_blocks_tabs_header_left_items_order_idx" ON "events_blocks_tabs_header_left_items" USING btree ("_order");
  CREATE INDEX "events_blocks_tabs_header_left_items_parent_id_idx" ON "events_blocks_tabs_header_left_items" USING btree ("_parent_id");
  CREATE INDEX "events_blocks_tabs_header_left_items_event_cycle_idx" ON "events_blocks_tabs_header_left_items" USING btree ("event_cycle_id");
  CREATE INDEX "events_blocks_tabs_header_left_items_document_idx" ON "events_blocks_tabs_header_left_items" USING btree ("document_id");
  CREATE INDEX "events_blocks_tabs_header_left_items_category_idx" ON "events_blocks_tabs_header_left_items" USING btree ("category_id");
  CREATE INDEX "events_blocks_tabs_header_left_items_partner_idx" ON "events_blocks_tabs_header_left_items" USING btree ("partner_id");
  CREATE INDEX "events_blocks_tabs_header_left_items_page_idx" ON "events_blocks_tabs_header_left_items" USING btree ("page_id");
  CREATE INDEX "events_blocks_tabs_header_left_items_tag_idx" ON "events_blocks_tabs_header_left_items" USING btree ("tag_id");
  CREATE INDEX "events_blocks_tabs_header_left_items_post_idx" ON "events_blocks_tabs_header_left_items" USING btree ("post_id");
  CREATE INDEX "events_blocks_tabs_header_left_items_event_idx" ON "events_blocks_tabs_header_left_items" USING btree ("event_id");
  CREATE INDEX "events_blocks_tabs_header_right_items_order_idx" ON "events_blocks_tabs_header_right_items" USING btree ("_order");
  CREATE INDEX "events_blocks_tabs_header_right_items_parent_id_idx" ON "events_blocks_tabs_header_right_items" USING btree ("_parent_id");
  CREATE INDEX "events_blocks_tabs_header_right_items_event_cycle_idx" ON "events_blocks_tabs_header_right_items" USING btree ("event_cycle_id");
  CREATE INDEX "events_blocks_tabs_header_right_items_document_idx" ON "events_blocks_tabs_header_right_items" USING btree ("document_id");
  CREATE INDEX "events_blocks_tabs_header_right_items_category_idx" ON "events_blocks_tabs_header_right_items" USING btree ("category_id");
  CREATE INDEX "events_blocks_tabs_header_right_items_partner_idx" ON "events_blocks_tabs_header_right_items" USING btree ("partner_id");
  CREATE INDEX "events_blocks_tabs_header_right_items_page_idx" ON "events_blocks_tabs_header_right_items" USING btree ("page_id");
  CREATE INDEX "events_blocks_tabs_header_right_items_tag_idx" ON "events_blocks_tabs_header_right_items" USING btree ("tag_id");
  CREATE INDEX "events_blocks_tabs_header_right_items_post_idx" ON "events_blocks_tabs_header_right_items" USING btree ("post_id");
  CREATE INDEX "events_blocks_tabs_header_right_items_event_idx" ON "events_blocks_tabs_header_right_items" USING btree ("event_id");
  CREATE INDEX "events_blocks_tabs_footer_items_order_idx" ON "events_blocks_tabs_footer_items" USING btree ("_order");
  CREATE INDEX "events_blocks_tabs_footer_items_parent_id_idx" ON "events_blocks_tabs_footer_items" USING btree ("_parent_id");
  CREATE INDEX "events_blocks_tabs_footer_items_event_cycle_idx" ON "events_blocks_tabs_footer_items" USING btree ("event_cycle_id");
  CREATE INDEX "events_blocks_tabs_footer_items_document_idx" ON "events_blocks_tabs_footer_items" USING btree ("document_id");
  CREATE INDEX "events_blocks_tabs_footer_items_category_idx" ON "events_blocks_tabs_footer_items" USING btree ("category_id");
  CREATE INDEX "events_blocks_tabs_footer_items_partner_idx" ON "events_blocks_tabs_footer_items" USING btree ("partner_id");
  CREATE INDEX "events_blocks_tabs_footer_items_page_idx" ON "events_blocks_tabs_footer_items" USING btree ("page_id");
  CREATE INDEX "events_blocks_tabs_footer_items_tag_idx" ON "events_blocks_tabs_footer_items" USING btree ("tag_id");
  CREATE INDEX "events_blocks_tabs_footer_items_post_idx" ON "events_blocks_tabs_footer_items" USING btree ("post_id");
  CREATE INDEX "events_blocks_tabs_footer_items_event_idx" ON "events_blocks_tabs_footer_items" USING btree ("event_id");
  CREATE INDEX "events_blocks_tabs_tabs_order_idx" ON "events_blocks_tabs_tabs" USING btree ("_order");
  CREATE INDEX "events_blocks_tabs_tabs_parent_id_idx" ON "events_blocks_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "events_blocks_tabs_order_idx" ON "events_blocks_tabs" USING btree ("_order");
  CREATE INDEX "events_blocks_tabs_parent_id_idx" ON "events_blocks_tabs" USING btree ("_parent_id");
  CREATE INDEX "events_blocks_tabs_path_idx" ON "events_blocks_tabs" USING btree ("_path");
  CREATE INDEX "_events_v_blocks_tabs_header_left_items_order_idx" ON "_events_v_blocks_tabs_header_left_items" USING btree ("_order");
  CREATE INDEX "_events_v_blocks_tabs_header_left_items_parent_id_idx" ON "_events_v_blocks_tabs_header_left_items" USING btree ("_parent_id");
  CREATE INDEX "_events_v_blocks_tabs_header_left_items_event_cycle_idx" ON "_events_v_blocks_tabs_header_left_items" USING btree ("event_cycle_id");
  CREATE INDEX "_events_v_blocks_tabs_header_left_items_document_idx" ON "_events_v_blocks_tabs_header_left_items" USING btree ("document_id");
  CREATE INDEX "_events_v_blocks_tabs_header_left_items_category_idx" ON "_events_v_blocks_tabs_header_left_items" USING btree ("category_id");
  CREATE INDEX "_events_v_blocks_tabs_header_left_items_partner_idx" ON "_events_v_blocks_tabs_header_left_items" USING btree ("partner_id");
  CREATE INDEX "_events_v_blocks_tabs_header_left_items_page_idx" ON "_events_v_blocks_tabs_header_left_items" USING btree ("page_id");
  CREATE INDEX "_events_v_blocks_tabs_header_left_items_tag_idx" ON "_events_v_blocks_tabs_header_left_items" USING btree ("tag_id");
  CREATE INDEX "_events_v_blocks_tabs_header_left_items_post_idx" ON "_events_v_blocks_tabs_header_left_items" USING btree ("post_id");
  CREATE INDEX "_events_v_blocks_tabs_header_left_items_event_idx" ON "_events_v_blocks_tabs_header_left_items" USING btree ("event_id");
  CREATE INDEX "_events_v_blocks_tabs_header_right_items_order_idx" ON "_events_v_blocks_tabs_header_right_items" USING btree ("_order");
  CREATE INDEX "_events_v_blocks_tabs_header_right_items_parent_id_idx" ON "_events_v_blocks_tabs_header_right_items" USING btree ("_parent_id");
  CREATE INDEX "_events_v_blocks_tabs_header_right_items_event_cycle_idx" ON "_events_v_blocks_tabs_header_right_items" USING btree ("event_cycle_id");
  CREATE INDEX "_events_v_blocks_tabs_header_right_items_document_idx" ON "_events_v_blocks_tabs_header_right_items" USING btree ("document_id");
  CREATE INDEX "_events_v_blocks_tabs_header_right_items_category_idx" ON "_events_v_blocks_tabs_header_right_items" USING btree ("category_id");
  CREATE INDEX "_events_v_blocks_tabs_header_right_items_partner_idx" ON "_events_v_blocks_tabs_header_right_items" USING btree ("partner_id");
  CREATE INDEX "_events_v_blocks_tabs_header_right_items_page_idx" ON "_events_v_blocks_tabs_header_right_items" USING btree ("page_id");
  CREATE INDEX "_events_v_blocks_tabs_header_right_items_tag_idx" ON "_events_v_blocks_tabs_header_right_items" USING btree ("tag_id");
  CREATE INDEX "_events_v_blocks_tabs_header_right_items_post_idx" ON "_events_v_blocks_tabs_header_right_items" USING btree ("post_id");
  CREATE INDEX "_events_v_blocks_tabs_header_right_items_event_idx" ON "_events_v_blocks_tabs_header_right_items" USING btree ("event_id");
  CREATE INDEX "_events_v_blocks_tabs_footer_items_order_idx" ON "_events_v_blocks_tabs_footer_items" USING btree ("_order");
  CREATE INDEX "_events_v_blocks_tabs_footer_items_parent_id_idx" ON "_events_v_blocks_tabs_footer_items" USING btree ("_parent_id");
  CREATE INDEX "_events_v_blocks_tabs_footer_items_event_cycle_idx" ON "_events_v_blocks_tabs_footer_items" USING btree ("event_cycle_id");
  CREATE INDEX "_events_v_blocks_tabs_footer_items_document_idx" ON "_events_v_blocks_tabs_footer_items" USING btree ("document_id");
  CREATE INDEX "_events_v_blocks_tabs_footer_items_category_idx" ON "_events_v_blocks_tabs_footer_items" USING btree ("category_id");
  CREATE INDEX "_events_v_blocks_tabs_footer_items_partner_idx" ON "_events_v_blocks_tabs_footer_items" USING btree ("partner_id");
  CREATE INDEX "_events_v_blocks_tabs_footer_items_page_idx" ON "_events_v_blocks_tabs_footer_items" USING btree ("page_id");
  CREATE INDEX "_events_v_blocks_tabs_footer_items_tag_idx" ON "_events_v_blocks_tabs_footer_items" USING btree ("tag_id");
  CREATE INDEX "_events_v_blocks_tabs_footer_items_post_idx" ON "_events_v_blocks_tabs_footer_items" USING btree ("post_id");
  CREATE INDEX "_events_v_blocks_tabs_footer_items_event_idx" ON "_events_v_blocks_tabs_footer_items" USING btree ("event_id");
  CREATE INDEX "_events_v_blocks_tabs_tabs_order_idx" ON "_events_v_blocks_tabs_tabs" USING btree ("_order");
  CREATE INDEX "_events_v_blocks_tabs_tabs_parent_id_idx" ON "_events_v_blocks_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "_events_v_blocks_tabs_order_idx" ON "_events_v_blocks_tabs" USING btree ("_order");
  CREATE INDEX "_events_v_blocks_tabs_parent_id_idx" ON "_events_v_blocks_tabs" USING btree ("_parent_id");
  CREATE INDEX "_events_v_blocks_tabs_path_idx" ON "_events_v_blocks_tabs" USING btree ("_path");
  CREATE INDEX "event_cycles_blocks_tabs_header_left_items_order_idx" ON "event_cycles_blocks_tabs_header_left_items" USING btree ("_order");
  CREATE INDEX "event_cycles_blocks_tabs_header_left_items_parent_id_idx" ON "event_cycles_blocks_tabs_header_left_items" USING btree ("_parent_id");
  CREATE INDEX "event_cycles_blocks_tabs_header_left_items_event_cycle_idx" ON "event_cycles_blocks_tabs_header_left_items" USING btree ("event_cycle_id");
  CREATE INDEX "event_cycles_blocks_tabs_header_left_items_document_idx" ON "event_cycles_blocks_tabs_header_left_items" USING btree ("document_id");
  CREATE INDEX "event_cycles_blocks_tabs_header_left_items_category_idx" ON "event_cycles_blocks_tabs_header_left_items" USING btree ("category_id");
  CREATE INDEX "event_cycles_blocks_tabs_header_left_items_partner_idx" ON "event_cycles_blocks_tabs_header_left_items" USING btree ("partner_id");
  CREATE INDEX "event_cycles_blocks_tabs_header_left_items_page_idx" ON "event_cycles_blocks_tabs_header_left_items" USING btree ("page_id");
  CREATE INDEX "event_cycles_blocks_tabs_header_left_items_tag_idx" ON "event_cycles_blocks_tabs_header_left_items" USING btree ("tag_id");
  CREATE INDEX "event_cycles_blocks_tabs_header_left_items_post_idx" ON "event_cycles_blocks_tabs_header_left_items" USING btree ("post_id");
  CREATE INDEX "event_cycles_blocks_tabs_header_left_items_event_idx" ON "event_cycles_blocks_tabs_header_left_items" USING btree ("event_id");
  CREATE INDEX "event_cycles_blocks_tabs_header_right_items_order_idx" ON "event_cycles_blocks_tabs_header_right_items" USING btree ("_order");
  CREATE INDEX "event_cycles_blocks_tabs_header_right_items_parent_id_idx" ON "event_cycles_blocks_tabs_header_right_items" USING btree ("_parent_id");
  CREATE INDEX "event_cycles_blocks_tabs_header_right_items_event_cycle_idx" ON "event_cycles_blocks_tabs_header_right_items" USING btree ("event_cycle_id");
  CREATE INDEX "event_cycles_blocks_tabs_header_right_items_document_idx" ON "event_cycles_blocks_tabs_header_right_items" USING btree ("document_id");
  CREATE INDEX "event_cycles_blocks_tabs_header_right_items_category_idx" ON "event_cycles_blocks_tabs_header_right_items" USING btree ("category_id");
  CREATE INDEX "event_cycles_blocks_tabs_header_right_items_partner_idx" ON "event_cycles_blocks_tabs_header_right_items" USING btree ("partner_id");
  CREATE INDEX "event_cycles_blocks_tabs_header_right_items_page_idx" ON "event_cycles_blocks_tabs_header_right_items" USING btree ("page_id");
  CREATE INDEX "event_cycles_blocks_tabs_header_right_items_tag_idx" ON "event_cycles_blocks_tabs_header_right_items" USING btree ("tag_id");
  CREATE INDEX "event_cycles_blocks_tabs_header_right_items_post_idx" ON "event_cycles_blocks_tabs_header_right_items" USING btree ("post_id");
  CREATE INDEX "event_cycles_blocks_tabs_header_right_items_event_idx" ON "event_cycles_blocks_tabs_header_right_items" USING btree ("event_id");
  CREATE INDEX "event_cycles_blocks_tabs_footer_items_order_idx" ON "event_cycles_blocks_tabs_footer_items" USING btree ("_order");
  CREATE INDEX "event_cycles_blocks_tabs_footer_items_parent_id_idx" ON "event_cycles_blocks_tabs_footer_items" USING btree ("_parent_id");
  CREATE INDEX "event_cycles_blocks_tabs_footer_items_event_cycle_idx" ON "event_cycles_blocks_tabs_footer_items" USING btree ("event_cycle_id");
  CREATE INDEX "event_cycles_blocks_tabs_footer_items_document_idx" ON "event_cycles_blocks_tabs_footer_items" USING btree ("document_id");
  CREATE INDEX "event_cycles_blocks_tabs_footer_items_category_idx" ON "event_cycles_blocks_tabs_footer_items" USING btree ("category_id");
  CREATE INDEX "event_cycles_blocks_tabs_footer_items_partner_idx" ON "event_cycles_blocks_tabs_footer_items" USING btree ("partner_id");
  CREATE INDEX "event_cycles_blocks_tabs_footer_items_page_idx" ON "event_cycles_blocks_tabs_footer_items" USING btree ("page_id");
  CREATE INDEX "event_cycles_blocks_tabs_footer_items_tag_idx" ON "event_cycles_blocks_tabs_footer_items" USING btree ("tag_id");
  CREATE INDEX "event_cycles_blocks_tabs_footer_items_post_idx" ON "event_cycles_blocks_tabs_footer_items" USING btree ("post_id");
  CREATE INDEX "event_cycles_blocks_tabs_footer_items_event_idx" ON "event_cycles_blocks_tabs_footer_items" USING btree ("event_id");
  CREATE INDEX "event_cycles_blocks_tabs_tabs_order_idx" ON "event_cycles_blocks_tabs_tabs" USING btree ("_order");
  CREATE INDEX "event_cycles_blocks_tabs_tabs_parent_id_idx" ON "event_cycles_blocks_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "event_cycles_blocks_tabs_order_idx" ON "event_cycles_blocks_tabs" USING btree ("_order");
  CREATE INDEX "event_cycles_blocks_tabs_parent_id_idx" ON "event_cycles_blocks_tabs" USING btree ("_parent_id");
  CREATE INDEX "event_cycles_blocks_tabs_path_idx" ON "event_cycles_blocks_tabs" USING btree ("_path");
  CREATE INDEX "_event_cycles_v_blocks_tabs_header_left_items_order_idx" ON "_event_cycles_v_blocks_tabs_header_left_items" USING btree ("_order");
  CREATE INDEX "_event_cycles_v_blocks_tabs_header_left_items_parent_id_idx" ON "_event_cycles_v_blocks_tabs_header_left_items" USING btree ("_parent_id");
  CREATE INDEX "_event_cycles_v_blocks_tabs_header_left_items_event_cycl_idx" ON "_event_cycles_v_blocks_tabs_header_left_items" USING btree ("event_cycle_id");
  CREATE INDEX "_event_cycles_v_blocks_tabs_header_left_items_document_idx" ON "_event_cycles_v_blocks_tabs_header_left_items" USING btree ("document_id");
  CREATE INDEX "_event_cycles_v_blocks_tabs_header_left_items_category_idx" ON "_event_cycles_v_blocks_tabs_header_left_items" USING btree ("category_id");
  CREATE INDEX "_event_cycles_v_blocks_tabs_header_left_items_partner_idx" ON "_event_cycles_v_blocks_tabs_header_left_items" USING btree ("partner_id");
  CREATE INDEX "_event_cycles_v_blocks_tabs_header_left_items_page_idx" ON "_event_cycles_v_blocks_tabs_header_left_items" USING btree ("page_id");
  CREATE INDEX "_event_cycles_v_blocks_tabs_header_left_items_tag_idx" ON "_event_cycles_v_blocks_tabs_header_left_items" USING btree ("tag_id");
  CREATE INDEX "_event_cycles_v_blocks_tabs_header_left_items_post_idx" ON "_event_cycles_v_blocks_tabs_header_left_items" USING btree ("post_id");
  CREATE INDEX "_event_cycles_v_blocks_tabs_header_left_items_event_idx" ON "_event_cycles_v_blocks_tabs_header_left_items" USING btree ("event_id");
  CREATE INDEX "_event_cycles_v_blocks_tabs_header_right_items_order_idx" ON "_event_cycles_v_blocks_tabs_header_right_items" USING btree ("_order");
  CREATE INDEX "_event_cycles_v_blocks_tabs_header_right_items_parent_id_idx" ON "_event_cycles_v_blocks_tabs_header_right_items" USING btree ("_parent_id");
  CREATE INDEX "_event_cycles_v_blocks_tabs_header_right_items_event_cyc_idx" ON "_event_cycles_v_blocks_tabs_header_right_items" USING btree ("event_cycle_id");
  CREATE INDEX "_event_cycles_v_blocks_tabs_header_right_items_document_idx" ON "_event_cycles_v_blocks_tabs_header_right_items" USING btree ("document_id");
  CREATE INDEX "_event_cycles_v_blocks_tabs_header_right_items_category_idx" ON "_event_cycles_v_blocks_tabs_header_right_items" USING btree ("category_id");
  CREATE INDEX "_event_cycles_v_blocks_tabs_header_right_items_partner_idx" ON "_event_cycles_v_blocks_tabs_header_right_items" USING btree ("partner_id");
  CREATE INDEX "_event_cycles_v_blocks_tabs_header_right_items_page_idx" ON "_event_cycles_v_blocks_tabs_header_right_items" USING btree ("page_id");
  CREATE INDEX "_event_cycles_v_blocks_tabs_header_right_items_tag_idx" ON "_event_cycles_v_blocks_tabs_header_right_items" USING btree ("tag_id");
  CREATE INDEX "_event_cycles_v_blocks_tabs_header_right_items_post_idx" ON "_event_cycles_v_blocks_tabs_header_right_items" USING btree ("post_id");
  CREATE INDEX "_event_cycles_v_blocks_tabs_header_right_items_event_idx" ON "_event_cycles_v_blocks_tabs_header_right_items" USING btree ("event_id");
  CREATE INDEX "_event_cycles_v_blocks_tabs_footer_items_order_idx" ON "_event_cycles_v_blocks_tabs_footer_items" USING btree ("_order");
  CREATE INDEX "_event_cycles_v_blocks_tabs_footer_items_parent_id_idx" ON "_event_cycles_v_blocks_tabs_footer_items" USING btree ("_parent_id");
  CREATE INDEX "_event_cycles_v_blocks_tabs_footer_items_event_cycle_idx" ON "_event_cycles_v_blocks_tabs_footer_items" USING btree ("event_cycle_id");
  CREATE INDEX "_event_cycles_v_blocks_tabs_footer_items_document_idx" ON "_event_cycles_v_blocks_tabs_footer_items" USING btree ("document_id");
  CREATE INDEX "_event_cycles_v_blocks_tabs_footer_items_category_idx" ON "_event_cycles_v_blocks_tabs_footer_items" USING btree ("category_id");
  CREATE INDEX "_event_cycles_v_blocks_tabs_footer_items_partner_idx" ON "_event_cycles_v_blocks_tabs_footer_items" USING btree ("partner_id");
  CREATE INDEX "_event_cycles_v_blocks_tabs_footer_items_page_idx" ON "_event_cycles_v_blocks_tabs_footer_items" USING btree ("page_id");
  CREATE INDEX "_event_cycles_v_blocks_tabs_footer_items_tag_idx" ON "_event_cycles_v_blocks_tabs_footer_items" USING btree ("tag_id");
  CREATE INDEX "_event_cycles_v_blocks_tabs_footer_items_post_idx" ON "_event_cycles_v_blocks_tabs_footer_items" USING btree ("post_id");
  CREATE INDEX "_event_cycles_v_blocks_tabs_footer_items_event_idx" ON "_event_cycles_v_blocks_tabs_footer_items" USING btree ("event_id");
  CREATE INDEX "_event_cycles_v_blocks_tabs_tabs_order_idx" ON "_event_cycles_v_blocks_tabs_tabs" USING btree ("_order");
  CREATE INDEX "_event_cycles_v_blocks_tabs_tabs_parent_id_idx" ON "_event_cycles_v_blocks_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "_event_cycles_v_blocks_tabs_order_idx" ON "_event_cycles_v_blocks_tabs" USING btree ("_order");
  CREATE INDEX "_event_cycles_v_blocks_tabs_parent_id_idx" ON "_event_cycles_v_blocks_tabs" USING btree ("_parent_id");
  CREATE INDEX "_event_cycles_v_blocks_tabs_path_idx" ON "_event_cycles_v_blocks_tabs" USING btree ("_path");
  CREATE INDEX "partners_blocks_tabs_header_left_items_order_idx" ON "partners_blocks_tabs_header_left_items" USING btree ("_order");
  CREATE INDEX "partners_blocks_tabs_header_left_items_parent_id_idx" ON "partners_blocks_tabs_header_left_items" USING btree ("_parent_id");
  CREATE INDEX "partners_blocks_tabs_header_left_items_event_cycle_idx" ON "partners_blocks_tabs_header_left_items" USING btree ("event_cycle_id");
  CREATE INDEX "partners_blocks_tabs_header_left_items_document_idx" ON "partners_blocks_tabs_header_left_items" USING btree ("document_id");
  CREATE INDEX "partners_blocks_tabs_header_left_items_category_idx" ON "partners_blocks_tabs_header_left_items" USING btree ("category_id");
  CREATE INDEX "partners_blocks_tabs_header_left_items_partner_idx" ON "partners_blocks_tabs_header_left_items" USING btree ("partner_id");
  CREATE INDEX "partners_blocks_tabs_header_left_items_page_idx" ON "partners_blocks_tabs_header_left_items" USING btree ("page_id");
  CREATE INDEX "partners_blocks_tabs_header_left_items_tag_idx" ON "partners_blocks_tabs_header_left_items" USING btree ("tag_id");
  CREATE INDEX "partners_blocks_tabs_header_left_items_post_idx" ON "partners_blocks_tabs_header_left_items" USING btree ("post_id");
  CREATE INDEX "partners_blocks_tabs_header_left_items_event_idx" ON "partners_blocks_tabs_header_left_items" USING btree ("event_id");
  CREATE INDEX "partners_blocks_tabs_header_right_items_order_idx" ON "partners_blocks_tabs_header_right_items" USING btree ("_order");
  CREATE INDEX "partners_blocks_tabs_header_right_items_parent_id_idx" ON "partners_blocks_tabs_header_right_items" USING btree ("_parent_id");
  CREATE INDEX "partners_blocks_tabs_header_right_items_event_cycle_idx" ON "partners_blocks_tabs_header_right_items" USING btree ("event_cycle_id");
  CREATE INDEX "partners_blocks_tabs_header_right_items_document_idx" ON "partners_blocks_tabs_header_right_items" USING btree ("document_id");
  CREATE INDEX "partners_blocks_tabs_header_right_items_category_idx" ON "partners_blocks_tabs_header_right_items" USING btree ("category_id");
  CREATE INDEX "partners_blocks_tabs_header_right_items_partner_idx" ON "partners_blocks_tabs_header_right_items" USING btree ("partner_id");
  CREATE INDEX "partners_blocks_tabs_header_right_items_page_idx" ON "partners_blocks_tabs_header_right_items" USING btree ("page_id");
  CREATE INDEX "partners_blocks_tabs_header_right_items_tag_idx" ON "partners_blocks_tabs_header_right_items" USING btree ("tag_id");
  CREATE INDEX "partners_blocks_tabs_header_right_items_post_idx" ON "partners_blocks_tabs_header_right_items" USING btree ("post_id");
  CREATE INDEX "partners_blocks_tabs_header_right_items_event_idx" ON "partners_blocks_tabs_header_right_items" USING btree ("event_id");
  CREATE INDEX "partners_blocks_tabs_footer_items_order_idx" ON "partners_blocks_tabs_footer_items" USING btree ("_order");
  CREATE INDEX "partners_blocks_tabs_footer_items_parent_id_idx" ON "partners_blocks_tabs_footer_items" USING btree ("_parent_id");
  CREATE INDEX "partners_blocks_tabs_footer_items_event_cycle_idx" ON "partners_blocks_tabs_footer_items" USING btree ("event_cycle_id");
  CREATE INDEX "partners_blocks_tabs_footer_items_document_idx" ON "partners_blocks_tabs_footer_items" USING btree ("document_id");
  CREATE INDEX "partners_blocks_tabs_footer_items_category_idx" ON "partners_blocks_tabs_footer_items" USING btree ("category_id");
  CREATE INDEX "partners_blocks_tabs_footer_items_partner_idx" ON "partners_blocks_tabs_footer_items" USING btree ("partner_id");
  CREATE INDEX "partners_blocks_tabs_footer_items_page_idx" ON "partners_blocks_tabs_footer_items" USING btree ("page_id");
  CREATE INDEX "partners_blocks_tabs_footer_items_tag_idx" ON "partners_blocks_tabs_footer_items" USING btree ("tag_id");
  CREATE INDEX "partners_blocks_tabs_footer_items_post_idx" ON "partners_blocks_tabs_footer_items" USING btree ("post_id");
  CREATE INDEX "partners_blocks_tabs_footer_items_event_idx" ON "partners_blocks_tabs_footer_items" USING btree ("event_id");
  CREATE INDEX "partners_blocks_tabs_tabs_order_idx" ON "partners_blocks_tabs_tabs" USING btree ("_order");
  CREATE INDEX "partners_blocks_tabs_tabs_parent_id_idx" ON "partners_blocks_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "partners_blocks_tabs_order_idx" ON "partners_blocks_tabs" USING btree ("_order");
  CREATE INDEX "partners_blocks_tabs_parent_id_idx" ON "partners_blocks_tabs" USING btree ("_parent_id");
  CREATE INDEX "partners_blocks_tabs_path_idx" ON "partners_blocks_tabs" USING btree ("_path");
  CREATE INDEX "_partners_v_blocks_tabs_header_left_items_order_idx" ON "_partners_v_blocks_tabs_header_left_items" USING btree ("_order");
  CREATE INDEX "_partners_v_blocks_tabs_header_left_items_parent_id_idx" ON "_partners_v_blocks_tabs_header_left_items" USING btree ("_parent_id");
  CREATE INDEX "_partners_v_blocks_tabs_header_left_items_event_cycle_idx" ON "_partners_v_blocks_tabs_header_left_items" USING btree ("event_cycle_id");
  CREATE INDEX "_partners_v_blocks_tabs_header_left_items_document_idx" ON "_partners_v_blocks_tabs_header_left_items" USING btree ("document_id");
  CREATE INDEX "_partners_v_blocks_tabs_header_left_items_category_idx" ON "_partners_v_blocks_tabs_header_left_items" USING btree ("category_id");
  CREATE INDEX "_partners_v_blocks_tabs_header_left_items_partner_idx" ON "_partners_v_blocks_tabs_header_left_items" USING btree ("partner_id");
  CREATE INDEX "_partners_v_blocks_tabs_header_left_items_page_idx" ON "_partners_v_blocks_tabs_header_left_items" USING btree ("page_id");
  CREATE INDEX "_partners_v_blocks_tabs_header_left_items_tag_idx" ON "_partners_v_blocks_tabs_header_left_items" USING btree ("tag_id");
  CREATE INDEX "_partners_v_blocks_tabs_header_left_items_post_idx" ON "_partners_v_blocks_tabs_header_left_items" USING btree ("post_id");
  CREATE INDEX "_partners_v_blocks_tabs_header_left_items_event_idx" ON "_partners_v_blocks_tabs_header_left_items" USING btree ("event_id");
  CREATE INDEX "_partners_v_blocks_tabs_header_right_items_order_idx" ON "_partners_v_blocks_tabs_header_right_items" USING btree ("_order");
  CREATE INDEX "_partners_v_blocks_tabs_header_right_items_parent_id_idx" ON "_partners_v_blocks_tabs_header_right_items" USING btree ("_parent_id");
  CREATE INDEX "_partners_v_blocks_tabs_header_right_items_event_cycle_idx" ON "_partners_v_blocks_tabs_header_right_items" USING btree ("event_cycle_id");
  CREATE INDEX "_partners_v_blocks_tabs_header_right_items_document_idx" ON "_partners_v_blocks_tabs_header_right_items" USING btree ("document_id");
  CREATE INDEX "_partners_v_blocks_tabs_header_right_items_category_idx" ON "_partners_v_blocks_tabs_header_right_items" USING btree ("category_id");
  CREATE INDEX "_partners_v_blocks_tabs_header_right_items_partner_idx" ON "_partners_v_blocks_tabs_header_right_items" USING btree ("partner_id");
  CREATE INDEX "_partners_v_blocks_tabs_header_right_items_page_idx" ON "_partners_v_blocks_tabs_header_right_items" USING btree ("page_id");
  CREATE INDEX "_partners_v_blocks_tabs_header_right_items_tag_idx" ON "_partners_v_blocks_tabs_header_right_items" USING btree ("tag_id");
  CREATE INDEX "_partners_v_blocks_tabs_header_right_items_post_idx" ON "_partners_v_blocks_tabs_header_right_items" USING btree ("post_id");
  CREATE INDEX "_partners_v_blocks_tabs_header_right_items_event_idx" ON "_partners_v_blocks_tabs_header_right_items" USING btree ("event_id");
  CREATE INDEX "_partners_v_blocks_tabs_footer_items_order_idx" ON "_partners_v_blocks_tabs_footer_items" USING btree ("_order");
  CREATE INDEX "_partners_v_blocks_tabs_footer_items_parent_id_idx" ON "_partners_v_blocks_tabs_footer_items" USING btree ("_parent_id");
  CREATE INDEX "_partners_v_blocks_tabs_footer_items_event_cycle_idx" ON "_partners_v_blocks_tabs_footer_items" USING btree ("event_cycle_id");
  CREATE INDEX "_partners_v_blocks_tabs_footer_items_document_idx" ON "_partners_v_blocks_tabs_footer_items" USING btree ("document_id");
  CREATE INDEX "_partners_v_blocks_tabs_footer_items_category_idx" ON "_partners_v_blocks_tabs_footer_items" USING btree ("category_id");
  CREATE INDEX "_partners_v_blocks_tabs_footer_items_partner_idx" ON "_partners_v_blocks_tabs_footer_items" USING btree ("partner_id");
  CREATE INDEX "_partners_v_blocks_tabs_footer_items_page_idx" ON "_partners_v_blocks_tabs_footer_items" USING btree ("page_id");
  CREATE INDEX "_partners_v_blocks_tabs_footer_items_tag_idx" ON "_partners_v_blocks_tabs_footer_items" USING btree ("tag_id");
  CREATE INDEX "_partners_v_blocks_tabs_footer_items_post_idx" ON "_partners_v_blocks_tabs_footer_items" USING btree ("post_id");
  CREATE INDEX "_partners_v_blocks_tabs_footer_items_event_idx" ON "_partners_v_blocks_tabs_footer_items" USING btree ("event_id");
  CREATE INDEX "_partners_v_blocks_tabs_tabs_order_idx" ON "_partners_v_blocks_tabs_tabs" USING btree ("_order");
  CREATE INDEX "_partners_v_blocks_tabs_tabs_parent_id_idx" ON "_partners_v_blocks_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "_partners_v_blocks_tabs_order_idx" ON "_partners_v_blocks_tabs" USING btree ("_order");
  CREATE INDEX "_partners_v_blocks_tabs_parent_id_idx" ON "_partners_v_blocks_tabs" USING btree ("_parent_id");
  CREATE INDEX "_partners_v_blocks_tabs_path_idx" ON "_partners_v_blocks_tabs" USING btree ("_path");
  CREATE INDEX "homepage_sections_blocks_tabs_header_left_items_order_idx" ON "homepage_sections_blocks_tabs_header_left_items" USING btree ("_order");
  CREATE INDEX "homepage_sections_blocks_tabs_header_left_items_parent_id_idx" ON "homepage_sections_blocks_tabs_header_left_items" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_blocks_tabs_header_left_items_event_cy_idx" ON "homepage_sections_blocks_tabs_header_left_items" USING btree ("event_cycle_id");
  CREATE INDEX "homepage_sections_blocks_tabs_header_left_items_document_idx" ON "homepage_sections_blocks_tabs_header_left_items" USING btree ("document_id");
  CREATE INDEX "homepage_sections_blocks_tabs_header_left_items_category_idx" ON "homepage_sections_blocks_tabs_header_left_items" USING btree ("category_id");
  CREATE INDEX "homepage_sections_blocks_tabs_header_left_items_partner_idx" ON "homepage_sections_blocks_tabs_header_left_items" USING btree ("partner_id");
  CREATE INDEX "homepage_sections_blocks_tabs_header_left_items_page_idx" ON "homepage_sections_blocks_tabs_header_left_items" USING btree ("page_id");
  CREATE INDEX "homepage_sections_blocks_tabs_header_left_items_tag_idx" ON "homepage_sections_blocks_tabs_header_left_items" USING btree ("tag_id");
  CREATE INDEX "homepage_sections_blocks_tabs_header_left_items_post_idx" ON "homepage_sections_blocks_tabs_header_left_items" USING btree ("post_id");
  CREATE INDEX "homepage_sections_blocks_tabs_header_left_items_event_idx" ON "homepage_sections_blocks_tabs_header_left_items" USING btree ("event_id");
  CREATE INDEX "homepage_sections_blocks_tabs_header_right_items_order_idx" ON "homepage_sections_blocks_tabs_header_right_items" USING btree ("_order");
  CREATE INDEX "homepage_sections_blocks_tabs_header_right_items_parent_id_idx" ON "homepage_sections_blocks_tabs_header_right_items" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_blocks_tabs_header_right_items_event_c_idx" ON "homepage_sections_blocks_tabs_header_right_items" USING btree ("event_cycle_id");
  CREATE INDEX "homepage_sections_blocks_tabs_header_right_items_documen_idx" ON "homepage_sections_blocks_tabs_header_right_items" USING btree ("document_id");
  CREATE INDEX "homepage_sections_blocks_tabs_header_right_items_categor_idx" ON "homepage_sections_blocks_tabs_header_right_items" USING btree ("category_id");
  CREATE INDEX "homepage_sections_blocks_tabs_header_right_items_partner_idx" ON "homepage_sections_blocks_tabs_header_right_items" USING btree ("partner_id");
  CREATE INDEX "homepage_sections_blocks_tabs_header_right_items_page_idx" ON "homepage_sections_blocks_tabs_header_right_items" USING btree ("page_id");
  CREATE INDEX "homepage_sections_blocks_tabs_header_right_items_tag_idx" ON "homepage_sections_blocks_tabs_header_right_items" USING btree ("tag_id");
  CREATE INDEX "homepage_sections_blocks_tabs_header_right_items_post_idx" ON "homepage_sections_blocks_tabs_header_right_items" USING btree ("post_id");
  CREATE INDEX "homepage_sections_blocks_tabs_header_right_items_event_idx" ON "homepage_sections_blocks_tabs_header_right_items" USING btree ("event_id");
  CREATE INDEX "homepage_sections_blocks_tabs_footer_items_order_idx" ON "homepage_sections_blocks_tabs_footer_items" USING btree ("_order");
  CREATE INDEX "homepage_sections_blocks_tabs_footer_items_parent_id_idx" ON "homepage_sections_blocks_tabs_footer_items" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_blocks_tabs_footer_items_event_cycle_idx" ON "homepage_sections_blocks_tabs_footer_items" USING btree ("event_cycle_id");
  CREATE INDEX "homepage_sections_blocks_tabs_footer_items_document_idx" ON "homepage_sections_blocks_tabs_footer_items" USING btree ("document_id");
  CREATE INDEX "homepage_sections_blocks_tabs_footer_items_category_idx" ON "homepage_sections_blocks_tabs_footer_items" USING btree ("category_id");
  CREATE INDEX "homepage_sections_blocks_tabs_footer_items_partner_idx" ON "homepage_sections_blocks_tabs_footer_items" USING btree ("partner_id");
  CREATE INDEX "homepage_sections_blocks_tabs_footer_items_page_idx" ON "homepage_sections_blocks_tabs_footer_items" USING btree ("page_id");
  CREATE INDEX "homepage_sections_blocks_tabs_footer_items_tag_idx" ON "homepage_sections_blocks_tabs_footer_items" USING btree ("tag_id");
  CREATE INDEX "homepage_sections_blocks_tabs_footer_items_post_idx" ON "homepage_sections_blocks_tabs_footer_items" USING btree ("post_id");
  CREATE INDEX "homepage_sections_blocks_tabs_footer_items_event_idx" ON "homepage_sections_blocks_tabs_footer_items" USING btree ("event_id");
  CREATE INDEX "homepage_sections_blocks_tabs_tabs_order_idx" ON "homepage_sections_blocks_tabs_tabs" USING btree ("_order");
  CREATE INDEX "homepage_sections_blocks_tabs_tabs_parent_id_idx" ON "homepage_sections_blocks_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_blocks_tabs_order_idx" ON "homepage_sections_blocks_tabs" USING btree ("_order");
  CREATE INDEX "homepage_sections_blocks_tabs_parent_id_idx" ON "homepage_sections_blocks_tabs" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_blocks_tabs_path_idx" ON "homepage_sections_blocks_tabs" USING btree ("_path");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_tabs_header_left_items" CASCADE;
  DROP TABLE "pages_blocks_tabs_header_right_items" CASCADE;
  DROP TABLE "pages_blocks_tabs_footer_items" CASCADE;
  DROP TABLE "pages_blocks_tabs_tabs" CASCADE;
  DROP TABLE "pages_blocks_tabs" CASCADE;
  DROP TABLE "_pages_v_blocks_tabs_header_left_items" CASCADE;
  DROP TABLE "_pages_v_blocks_tabs_header_right_items" CASCADE;
  DROP TABLE "_pages_v_blocks_tabs_footer_items" CASCADE;
  DROP TABLE "_pages_v_blocks_tabs_tabs" CASCADE;
  DROP TABLE "_pages_v_blocks_tabs" CASCADE;
  DROP TABLE "posts_blocks_tabs_header_left_items" CASCADE;
  DROP TABLE "posts_blocks_tabs_header_right_items" CASCADE;
  DROP TABLE "posts_blocks_tabs_footer_items" CASCADE;
  DROP TABLE "posts_blocks_tabs_tabs" CASCADE;
  DROP TABLE "posts_blocks_tabs" CASCADE;
  DROP TABLE "_posts_v_blocks_tabs_header_left_items" CASCADE;
  DROP TABLE "_posts_v_blocks_tabs_header_right_items" CASCADE;
  DROP TABLE "_posts_v_blocks_tabs_footer_items" CASCADE;
  DROP TABLE "_posts_v_blocks_tabs_tabs" CASCADE;
  DROP TABLE "_posts_v_blocks_tabs" CASCADE;
  DROP TABLE "events_blocks_tabs_header_left_items" CASCADE;
  DROP TABLE "events_blocks_tabs_header_right_items" CASCADE;
  DROP TABLE "events_blocks_tabs_footer_items" CASCADE;
  DROP TABLE "events_blocks_tabs_tabs" CASCADE;
  DROP TABLE "events_blocks_tabs" CASCADE;
  DROP TABLE "_events_v_blocks_tabs_header_left_items" CASCADE;
  DROP TABLE "_events_v_blocks_tabs_header_right_items" CASCADE;
  DROP TABLE "_events_v_blocks_tabs_footer_items" CASCADE;
  DROP TABLE "_events_v_blocks_tabs_tabs" CASCADE;
  DROP TABLE "_events_v_blocks_tabs" CASCADE;
  DROP TABLE "event_cycles_blocks_tabs_header_left_items" CASCADE;
  DROP TABLE "event_cycles_blocks_tabs_header_right_items" CASCADE;
  DROP TABLE "event_cycles_blocks_tabs_footer_items" CASCADE;
  DROP TABLE "event_cycles_blocks_tabs_tabs" CASCADE;
  DROP TABLE "event_cycles_blocks_tabs" CASCADE;
  DROP TABLE "_event_cycles_v_blocks_tabs_header_left_items" CASCADE;
  DROP TABLE "_event_cycles_v_blocks_tabs_header_right_items" CASCADE;
  DROP TABLE "_event_cycles_v_blocks_tabs_footer_items" CASCADE;
  DROP TABLE "_event_cycles_v_blocks_tabs_tabs" CASCADE;
  DROP TABLE "_event_cycles_v_blocks_tabs" CASCADE;
  DROP TABLE "partners_blocks_tabs_header_left_items" CASCADE;
  DROP TABLE "partners_blocks_tabs_header_right_items" CASCADE;
  DROP TABLE "partners_blocks_tabs_footer_items" CASCADE;
  DROP TABLE "partners_blocks_tabs_tabs" CASCADE;
  DROP TABLE "partners_blocks_tabs" CASCADE;
  DROP TABLE "_partners_v_blocks_tabs_header_left_items" CASCADE;
  DROP TABLE "_partners_v_blocks_tabs_header_right_items" CASCADE;
  DROP TABLE "_partners_v_blocks_tabs_footer_items" CASCADE;
  DROP TABLE "_partners_v_blocks_tabs_tabs" CASCADE;
  DROP TABLE "_partners_v_blocks_tabs" CASCADE;
  DROP TABLE "homepage_sections_blocks_tabs_header_left_items" CASCADE;
  DROP TABLE "homepage_sections_blocks_tabs_header_right_items" CASCADE;
  DROP TABLE "homepage_sections_blocks_tabs_footer_items" CASCADE;
  DROP TABLE "homepage_sections_blocks_tabs_tabs" CASCADE;
  DROP TABLE "homepage_sections_blocks_tabs" CASCADE;
  ALTER TABLE "navigation_header_items" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "navigation_header_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  DROP TYPE "public"."enum_navigation_header_items_target_type";
  CREATE TYPE "public"."enum_navigation_header_items_target_type" AS ENUM('eventCycle', 'document', 'category', 'partner', 'page', 'tag', 'custom', 'post', 'event');
  ALTER TABLE "navigation_header_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::"public"."enum_navigation_header_items_target_type";
  ALTER TABLE "navigation_header_items" ALTER COLUMN "target_type" SET DATA TYPE "public"."enum_navigation_header_items_target_type" USING "target_type"::"public"."enum_navigation_header_items_target_type";
  ALTER TABLE "footer_columns_items" ALTER COLUMN "target_type" SET DATA TYPE text;
  ALTER TABLE "footer_columns_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::text;
  DROP TYPE "public"."enum_footer_columns_items_target_type";
  CREATE TYPE "public"."enum_footer_columns_items_target_type" AS ENUM('eventCycle', 'document', 'category', 'partner', 'page', 'tag', 'custom', 'post', 'event');
  ALTER TABLE "footer_columns_items" ALTER COLUMN "target_type" SET DEFAULT 'custom'::"public"."enum_footer_columns_items_target_type";
  ALTER TABLE "footer_columns_items" ALTER COLUMN "target_type" SET DATA TYPE "public"."enum_footer_columns_items_target_type" USING "target_type"::"public"."enum_footer_columns_items_target_type";
  ALTER TABLE "navigation_header_items" DROP COLUMN "email_subject";
  ALTER TABLE "navigation_header_items" DROP COLUMN "email_body";
  ALTER TABLE "footer_columns_items" DROP COLUMN "email_subject";
  ALTER TABLE "footer_columns_items" DROP COLUMN "email_body";
  DROP TYPE "public"."enum_pages_blocks_tabs_header_left_items_icon_name";
  DROP TYPE "public"."enum_pages_blocks_tabs_header_right_items_icon_name";
  DROP TYPE "public"."enum_pages_blocks_tabs_footer_items_icon_name";
  DROP TYPE "public"."enum_pages_blocks_tabs_footer_alignment";
  DROP TYPE "public"."enum__pages_v_blocks_tabs_header_left_items_icon_name";
  DROP TYPE "public"."enum__pages_v_blocks_tabs_header_right_items_icon_name";
  DROP TYPE "public"."enum__pages_v_blocks_tabs_footer_items_icon_name";
  DROP TYPE "public"."enum__pages_v_blocks_tabs_footer_alignment";
  DROP TYPE "public"."enum_posts_blocks_tabs_header_left_items_icon_name";
  DROP TYPE "public"."enum_posts_blocks_tabs_header_right_items_icon_name";
  DROP TYPE "public"."enum_posts_blocks_tabs_footer_items_icon_name";
  DROP TYPE "public"."enum_posts_blocks_tabs_footer_alignment";
  DROP TYPE "public"."enum__posts_v_blocks_tabs_header_left_items_icon_name";
  DROP TYPE "public"."enum__posts_v_blocks_tabs_header_right_items_icon_name";
  DROP TYPE "public"."enum__posts_v_blocks_tabs_footer_items_icon_name";
  DROP TYPE "public"."enum__posts_v_blocks_tabs_footer_alignment";
  DROP TYPE "public"."enum_events_blocks_tabs_header_left_items_icon_name";
  DROP TYPE "public"."enum_events_blocks_tabs_header_right_items_icon_name";
  DROP TYPE "public"."enum_events_blocks_tabs_footer_items_icon_name";
  DROP TYPE "public"."enum_events_blocks_tabs_footer_alignment";
  DROP TYPE "public"."enum__events_v_blocks_tabs_header_left_items_icon_name";
  DROP TYPE "public"."enum__events_v_blocks_tabs_header_right_items_icon_name";
  DROP TYPE "public"."enum__events_v_blocks_tabs_footer_items_icon_name";
  DROP TYPE "public"."enum__events_v_blocks_tabs_footer_alignment";
  DROP TYPE "public"."enum_event_cycles_blocks_tabs_header_left_items_icon_name";
  DROP TYPE "public"."enum_event_cycles_blocks_tabs_header_right_items_icon_name";
  DROP TYPE "public"."enum_event_cycles_blocks_tabs_footer_items_icon_name";
  DROP TYPE "public"."enum_event_cycles_blocks_tabs_footer_alignment";
  DROP TYPE "public"."enum__event_cycles_v_blocks_tabs_header_left_items_icon_name";
  DROP TYPE "public"."enum__event_cycles_v_blocks_tabs_header_right_items_icon_name";
  DROP TYPE "public"."enum__event_cycles_v_blocks_tabs_footer_items_icon_name";
  DROP TYPE "public"."enum__event_cycles_v_blocks_tabs_footer_alignment";
  DROP TYPE "public"."enum_partners_blocks_tabs_header_left_items_icon_name";
  DROP TYPE "public"."enum_partners_blocks_tabs_header_right_items_icon_name";
  DROP TYPE "public"."enum_partners_blocks_tabs_footer_items_icon_name";
  DROP TYPE "public"."enum_partners_blocks_tabs_footer_alignment";
  DROP TYPE "public"."enum__partners_v_blocks_tabs_header_left_items_icon_name";
  DROP TYPE "public"."enum__partners_v_blocks_tabs_header_right_items_icon_name";
  DROP TYPE "public"."enum__partners_v_blocks_tabs_footer_items_icon_name";
  DROP TYPE "public"."enum__partners_v_blocks_tabs_footer_alignment";
  DROP TYPE "public"."enum_homepage_sections_blocks_tabs_header_left_items_icon_name";
  DROP TYPE "public"."enum_homepage_sections_blocks_tabs_header_right_items_icon_name";
  DROP TYPE "public"."enum_homepage_sections_blocks_tabs_footer_items_icon_name";
  DROP TYPE "public"."enum_homepage_sections_blocks_tabs_footer_alignment";`)
}
