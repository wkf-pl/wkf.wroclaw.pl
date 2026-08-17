import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    DECLARE
      footer_row record;
      nested_document jsonb;
      nested_text text;
    BEGIN
      FOR footer_row IN
        SELECT "id", "copyright_text"
        FROM "footer"
        WHERE jsonb_typeof("copyright_text"->'root'->'children') = 'array'
          AND jsonb_array_length("copyright_text"->'root'->'children') = 1
          AND jsonb_typeof("copyright_text"->'root'->'children'->0->'children') = 'array'
          AND jsonb_array_length("copyright_text"->'root'->'children'->0->'children') = 1
          AND "copyright_text"->'root'->'children'->0->'children'->0->>'type' = 'text'
      LOOP
        nested_text := footer_row."copyright_text"
          ->'root'->'children'->0->'children'->0->>'text';

        BEGIN
          nested_document := nested_text::jsonb;
        EXCEPTION WHEN others THEN
          CONTINUE;
        END;

        IF nested_document->'root'->>'type' = 'root'
          AND jsonb_typeof(nested_document->'root'->'children') = 'array'
        THEN
          UPDATE "footer"
          SET "copyright_text" = nested_document,
              "updated_at" = now()
          WHERE "id" = footer_row."id";
        END IF;
      END LOOP;
    END $$;
  `)
}

export async function down({ db: _db }: MigrateDownArgs): Promise<void> {
  // This data repair intentionally does not restore the invalid nested document.
}
