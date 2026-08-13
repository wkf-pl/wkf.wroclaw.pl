import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "footer"
   ALTER COLUMN "copyright_text" SET DATA TYPE jsonb
   USING CASE
     WHEN "copyright_text" IS NULL OR btrim("copyright_text") = '' THEN NULL
     ELSE jsonb_build_object(
       'root',
       jsonb_build_object(
         'children',
         jsonb_build_array(
           jsonb_build_object(
             'children',
             jsonb_build_array(
               jsonb_build_object(
                 'detail', 0,
                 'format', 0,
                 'mode', 'normal',
                 'style', '',
                 'text', "copyright_text",
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
         ),
         'direction', 'ltr',
         'format', '',
         'indent', 0,
         'type', 'root',
         'version', 1
       )
     )
   END;`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "footer" ADD COLUMN "copyright_text_plain" varchar;

   UPDATE "footer"
   SET "copyright_text_plain" = (
     SELECT string_agg("block_text", E'\n' ORDER BY "block_order")
     FROM (
       SELECT
         "block"."ordinality" AS "block_order",
         (
           SELECT string_agg("text_node" #>> '{}', '' ORDER BY "text_order")
           FROM jsonb_path_query("block"."value", 'strict $.**.text')
             WITH ORDINALITY AS "texts"("text_node", "text_order")
         ) AS "block_text"
       FROM jsonb_array_elements("footer"."copyright_text"->'root'->'children')
         WITH ORDINALITY AS "block"("value", "ordinality")
     ) AS "blocks"
   );

   ALTER TABLE "footer" DROP COLUMN "copyright_text";
   ALTER TABLE "footer" RENAME COLUMN "copyright_text_plain" TO "copyright_text";`)
}
