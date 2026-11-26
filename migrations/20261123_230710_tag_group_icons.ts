import { sql, type MigrateUpArgs, type MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_tag_groups_icon_name" AS ENUM('camera', 'astronaut', 'ticket', 'bluesky', 'mace', 'bottle-mana', 'cthulhu', 'time', 'skull', 'dnd5', 'discord', 'document', 'pumpkin-halloween', 'mail', 'facebook', 'guitar', 'globe', 'board-game', 'star', 'instagram', 'calendar', 'hat', 'gun', 'cards', 'playing-cards', 'collection', 'compass', 'confetti', 'dice', 'd10', 'd12', 'd20', 'd4', 'd6', 'd8', 'water-drop', 'crystal-ball', 'book', 'fireball', 'larp', 'external-link', 'linkedin', 'location', 'bow', 'mage', 'pirate-map', 'vendetta', 'messenger', 'sword', 'potion', 'music', 'image', 'announcement', 'eye', 'partner', 'pdf', 'seal', 'pawn', 'quill', 'flame', 'download', 'review', 'wand', 'sf', 'seance', 'arrows', 'slack', 'users', 'star-trek', 'star-wars-empire', 'star-wars-rebel-alliance', 'steampunk', 'home', 'arrow', 'arrow-left', 'arrow-right', 'superhero', 'stormtrooper', 'soundtrack', 'tag', 'shield', 'axe', 'twitch', 'shuttle', 'fighter', 'event', 'filled-star', 'youtube', 'scroll');
  ALTER TABLE "tag_groups" ADD COLUMN "icon_name" "enum_tag_groups_icon_name";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "tag_groups" DROP COLUMN "icon_name";
  DROP TYPE "public"."enum_tag_groups_icon_name";`)
}
