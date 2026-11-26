import { sql, type MigrateUpArgs } from '@payloadcms/db-postgres'

import { moveAuthorsToOwners } from './lib/separate-content-ownership'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "content_listing_items" ADD COLUMN "search_author_id" integer;
    ALTER TABLE "pages" ADD COLUMN "author_id" integer;
    ALTER TABLE "_pages_v" ADD COLUMN "version_author_id" integer;
    ALTER TABLE "posts" ADD COLUMN "author_id" integer;
    ALTER TABLE "_posts_v" ADD COLUMN "version_author_id" integer;
    ALTER TABLE "events" ADD COLUMN "author_id" integer;
    ALTER TABLE "_events_v" ADD COLUMN "version_author_id" integer;
    ALTER TABLE "event_cycles" ADD COLUMN "author_id" integer;
    ALTER TABLE "_event_cycles_v" ADD COLUMN "version_author_id" integer;
    ALTER TABLE "media" ADD COLUMN "author_id" integer;
    ALTER TABLE "documents_rels" ADD COLUMN "users_id" integer;
    ALTER TABLE "documents_rels" ADD COLUMN "user_groups_id" integer;
    ALTER TABLE "_documents_v_rels" ADD COLUMN "users_id" integer;
    ALTER TABLE "_documents_v_rels" ADD COLUMN "user_groups_id" integer;
    ALTER TABLE "partners" ADD COLUMN "author_id" integer;
    ALTER TABLE "_partners_v" ADD COLUMN "version_author_id" integer;
    ALTER TABLE "content_listing_items" ADD CONSTRAINT "content_listing_items_search_author_id_users_id_fk" FOREIGN KEY ("search_author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "pages" ADD CONSTRAINT "pages_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_author_id_users_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_author_id_users_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "events" ADD CONSTRAINT "events_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_author_id_users_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "event_cycles" ADD CONSTRAINT "event_cycles_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_event_cycles_v" ADD CONSTRAINT "_event_cycles_v_version_author_id_users_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "media" ADD CONSTRAINT "media_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "documents_rels" ADD CONSTRAINT "documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "documents_rels" ADD CONSTRAINT "documents_rels_user_groups_fk" FOREIGN KEY ("user_groups_id") REFERENCES "public"."user_groups"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_documents_v_rels" ADD CONSTRAINT "_documents_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_documents_v_rels" ADD CONSTRAINT "_documents_v_rels_user_groups_fk" FOREIGN KEY ("user_groups_id") REFERENCES "public"."user_groups"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "partners" ADD CONSTRAINT "partners_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_partners_v" ADD CONSTRAINT "_partners_v_version_author_id_users_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
    CREATE INDEX "content_listing_items_search_author_idx" ON "content_listing_items" USING btree ("search_author_id");
    CREATE INDEX "pages_author_idx" ON "pages" USING btree ("author_id");
    CREATE INDEX "_pages_v_version_version_author_idx" ON "_pages_v" USING btree ("version_author_id");
    CREATE INDEX "posts_author_idx" ON "posts" USING btree ("author_id");
    CREATE INDEX "_posts_v_version_version_author_idx" ON "_posts_v" USING btree ("version_author_id");
    CREATE INDEX "events_author_idx" ON "events" USING btree ("author_id");
    CREATE INDEX "_events_v_version_version_author_idx" ON "_events_v" USING btree ("version_author_id");
    CREATE INDEX "event_cycles_author_idx" ON "event_cycles" USING btree ("author_id");
    CREATE INDEX "_event_cycles_v_version_version_author_idx" ON "_event_cycles_v" USING btree ("version_author_id");
    CREATE INDEX "media_author_idx" ON "media" USING btree ("author_id");
    CREATE INDEX "documents_rels_users_id_idx" ON "documents_rels" USING btree ("users_id");
    CREATE INDEX "documents_rels_user_groups_id_idx" ON "documents_rels" USING btree ("user_groups_id");
    CREATE INDEX "_documents_v_rels_users_id_idx" ON "_documents_v_rels" USING btree ("users_id");
    CREATE INDEX "_documents_v_rels_user_groups_id_idx" ON "_documents_v_rels" USING btree ("user_groups_id");
    CREATE INDEX "partners_author_idx" ON "partners" USING btree ("author_id");
    CREATE INDEX "_partners_v_version_version_author_idx" ON "_partners_v" USING btree ("version_author_id");
  `)

  await moveAuthorsToOwners(db)

  await db.execute(sql`
    ALTER TABLE content_listing_items DROP COLUMN search_author_signature, DROP COLUMN search_author_group_id;
    ALTER TABLE pages DROP COLUMN public_author_signature;
    ALTER TABLE _pages_v DROP COLUMN version_public_author_signature;
    ALTER TABLE posts DROP COLUMN public_author_signature;
    ALTER TABLE _posts_v DROP COLUMN version_public_author_signature;
    ALTER TABLE events DROP COLUMN public_author_signature;
    ALTER TABLE _events_v DROP COLUMN version_public_author_signature;
    ALTER TABLE event_cycles DROP COLUMN public_author_signature, DROP COLUMN event_defaults_author_group_id;
    ALTER TABLE _event_cycles_v DROP COLUMN version_public_author_signature, DROP COLUMN version_event_defaults_author_group_id;
    ALTER TABLE documents DROP COLUMN public_author_signature;
    ALTER TABLE _documents_v DROP COLUMN version_public_author_signature;
    ALTER TABLE partners DROP COLUMN public_author_signature;
    ALTER TABLE _partners_v DROP COLUMN version_public_author_signature;

    ALTER INDEX "_event_cycles_v_version_event_defaults_version_event_d_1_idx"
      RENAME TO "_event_cycles_v_version_event_defaults_version_event_def_idx";
    ALTER INDEX "_event_cycles_v_version_event_defaults_version_event_d_2_idx"
      RENAME TO "_event_cycles_v_version_event_defaults_version_event_d_1_idx";
    ALTER INDEX "_event_cycles_v_version_event_defaults_version_event_d_3_idx"
      RENAME TO "_event_cycles_v_version_event_defaults_version_event_d_2_idx";
  `)
}

export async function down(): Promise<void> {
  throw new Error(
    'Restore the database backup to recover previous author signatures and ownership.',
  )
}
