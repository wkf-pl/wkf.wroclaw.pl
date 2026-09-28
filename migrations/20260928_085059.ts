import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE OR REPLACE FUNCTION pg_temp.text_to_lexical(value text)
  RETURNS jsonb
  LANGUAGE sql
  IMMUTABLE
  AS $function$
    SELECT jsonb_build_object(
      'root',
      jsonb_build_object(
        'children',
        COALESCE(
          (
            SELECT jsonb_agg(
              jsonb_build_object(
                'children',
                jsonb_build_array(
                  jsonb_build_object(
                    'detail', 0,
                    'format', 0,
                    'mode', 'normal',
                    'style', '',
                    'text', btrim(line),
                    'type', 'text',
                    'version', 1
                  )
                ),
                'direction', 'ltr',
                'format', '',
                'indent', 0,
                'textFormat', 0,
                'textStyle', '',
                'type', 'paragraph',
                'version', 1
              )
              ORDER BY position
            )
            FROM regexp_split_to_table(
              replace(value, chr(13) || chr(10), chr(10)),
              chr(10)
            ) WITH ORDINALITY AS lines(line, position)
            WHERE btrim(line) <> ''
          ),
          '[]'::jsonb
        ),
        'direction', 'ltr',
        'format', '',
        'indent', 0,
        'type', 'root',
        'version', 1
      )
    );
  $function$;

  ALTER TABLE "events"
    ALTER COLUMN "excerpt" SET DATA TYPE jsonb
    USING pg_temp.text_to_lexical("excerpt");
  ALTER TABLE "_events_v"
    ALTER COLUMN "version_excerpt" SET DATA TYPE jsonb
    USING CASE
      WHEN "version_excerpt" IS NULL THEN NULL
      ELSE pg_temp.text_to_lexical("version_excerpt")
    END;
  ALTER TABLE "event_cycles"
    ALTER COLUMN "excerpt" SET DATA TYPE jsonb
    USING pg_temp.text_to_lexical("excerpt");
  ALTER TABLE "event_cycles"
    ALTER COLUMN "event_defaults_excerpt" SET DATA TYPE jsonb
    USING CASE
      WHEN "event_defaults_excerpt" IS NULL THEN NULL
      ELSE pg_temp.text_to_lexical("event_defaults_excerpt")
    END;
  ALTER TABLE "_event_cycles_v"
    ALTER COLUMN "version_excerpt" SET DATA TYPE jsonb
    USING CASE
      WHEN "version_excerpt" IS NULL THEN NULL
      ELSE pg_temp.text_to_lexical("version_excerpt")
    END;
  ALTER TABLE "_event_cycles_v"
    ALTER COLUMN "version_event_defaults_excerpt" SET DATA TYPE jsonb
    USING CASE
      WHEN "version_event_defaults_excerpt" IS NULL THEN NULL
      ELSE pg_temp.text_to_lexical("version_event_defaults_excerpt")
    END;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  CREATE OR REPLACE FUNCTION pg_temp.lexical_to_text(value jsonb)
  RETURNS text
  LANGUAGE sql
  IMMUTABLE
  AS $function$
    SELECT string_agg(text_node #>> '{}', E'\n\n' ORDER BY position)
    FROM jsonb_path_query(value, '$.root.**.text') WITH ORDINALITY
      AS text_nodes(text_node, position);
  $function$;

  ALTER TABLE "events"
    ALTER COLUMN "excerpt" SET DATA TYPE varchar
    USING pg_temp.lexical_to_text("excerpt");
  ALTER TABLE "_events_v"
    ALTER COLUMN "version_excerpt" SET DATA TYPE varchar
    USING CASE
      WHEN "version_excerpt" IS NULL THEN NULL
      ELSE pg_temp.lexical_to_text("version_excerpt")
    END;
  ALTER TABLE "event_cycles"
    ALTER COLUMN "excerpt" SET DATA TYPE varchar
    USING pg_temp.lexical_to_text("excerpt");
  ALTER TABLE "event_cycles"
    ALTER COLUMN "event_defaults_excerpt" SET DATA TYPE varchar
    USING CASE
      WHEN "event_defaults_excerpt" IS NULL THEN NULL
      ELSE pg_temp.lexical_to_text("event_defaults_excerpt")
    END;
  ALTER TABLE "_event_cycles_v"
    ALTER COLUMN "version_excerpt" SET DATA TYPE varchar
    USING CASE
      WHEN "version_excerpt" IS NULL THEN NULL
      ELSE pg_temp.lexical_to_text("version_excerpt")
    END;
  ALTER TABLE "_event_cycles_v"
    ALTER COLUMN "version_event_defaults_excerpt" SET DATA TYPE varchar
    USING CASE
      WHEN "version_event_defaults_excerpt" IS NULL THEN NULL
      ELSE pg_temp.lexical_to_text("version_event_defaults_excerpt")
    END;`)
}
