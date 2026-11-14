import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "page_templates" ADD COLUMN "seo_title" varchar;
  ALTER TABLE "page_templates" ADD COLUMN "seo_description" varchar;
  ALTER TABLE "page_templates" ADD COLUMN "seo_image_id" integer;
  ALTER TABLE "_page_templates_v" ADD COLUMN "version_seo_title" varchar;
  ALTER TABLE "_page_templates_v" ADD COLUMN "version_seo_description" varchar;
  ALTER TABLE "_page_templates_v" ADD COLUMN "version_seo_image_id" integer;
  ALTER TABLE "page_templates" ADD CONSTRAINT "page_templates_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_templates_v" ADD CONSTRAINT "_page_templates_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "page_templates_seo_seo_image_idx" ON "page_templates" USING btree ("seo_image_id");
  CREATE INDEX "_page_templates_v_version_seo_version_seo_image_idx" ON "_page_templates_v" USING btree ("version_seo_image_id");

  CREATE TEMP TABLE retired_route_pages ON COMMIT DROP AS
  SELECT id, system_key AS route FROM public.pages WHERE system_key IN ('blog', 'events');

  DO $$
  BEGIN
    IF EXISTS (
      SELECT 1 FROM retired_route_pages AS retired
      WHERE NOT EXISTS (
        SELECT 1 FROM public.page_templates AS template
        WHERE template.template_key::text = retired.route || '-index'
          AND template.rendering_mode = 'template' AND template._status = 'published'
      )
    ) THEN
      RAISE EXCEPTION 'Publish the route templates in template mode before retiring their system pages.';
    END IF;
  END;
  $$;

  UPDATE public.page_templates AS template SET
    seo_title = COALESCE(NULLIF(page.seo_title, ''), page.title),
    seo_description = COALESCE(NULLIF(page.seo_description, ''), page.listing_excerpt),
    seo_image_id = COALESCE(page.seo_image_id, page.hero_image_id)
  FROM public.pages AS page
  WHERE template.template_key = 'blog-index' AND page.system_key = 'blog'
    AND page._status = 'published' AND page.deleted_at IS NULL;

  UPDATE public._page_templates_v AS version SET
    version_seo_title = template.seo_title,
    version_seo_description = template.seo_description,
    version_seo_image_id = template.seo_image_id
  FROM public.page_templates AS template
  WHERE version.parent_id = template.id AND template.template_key = 'blog-index';

  -- Convert links in both current documents and saved versions.
  DO $$
  DECLARE
    link_table record;
  BEGIN
    FOR link_table IN
      SELECT DISTINCT page_column.table_name
      FROM information_schema.columns AS page_column
      JOIN information_schema.columns AS target_column USING (table_schema, table_name)
      JOIN information_schema.columns AS address_column USING (table_schema, table_name)
      JOIN information_schema.columns AS scheme_column USING (table_schema, table_name)
      WHERE page_column.table_schema = 'public' AND page_column.column_name = 'page_id'
        AND target_column.column_name = 'target_type'
        AND address_column.column_name = 'custom_address'
        AND scheme_column.column_name = 'custom_scheme'
    LOOP
      EXECUTE format(
        'UPDATE public.%I AS link
           SET target_type = ''custom'', custom_scheme = ''path'', custom_address = retired.route
           FROM retired_route_pages AS retired
           WHERE link.target_type = ''page'' AND link.page_id = retired.id',
        link_table.table_name
      );
    END LOOP;
  END;
  $$;

  CREATE FUNCTION pg_temp.retire_rich_text_route_links(node jsonb, routes jsonb)
  RETURNS jsonb LANGUAGE plpgsql IMMUTABLE AS $$
  DECLARE
    route text;
    fields jsonb;
  BEGIN
    CASE jsonb_typeof(node)
      WHEN 'array' THEN
        RETURN (SELECT COALESCE(jsonb_agg(pg_temp.retire_rich_text_route_links(value, routes)
                                         ORDER BY position), '[]'::jsonb)
                FROM jsonb_array_elements(node) WITH ORDINALITY AS child(value, position));
      WHEN 'object' THEN
        fields := node->'fields';
        IF node->>'type' IN ('link', 'autolink') THEN
          IF fields->>'linkType' = 'internal' AND fields->'doc'->>'relationTo' = 'pages' THEN
            route := routes->>(fields->'doc'->>'value');
          ELSIF fields->>'targetType' = 'page' THEN
            route := routes->>(fields->>'page');
          END IF;
        END IF;
        IF route IS NOT NULL THEN
          RETURN jsonb_set(node, '{fields}', (fields - 'page' - 'doc') || jsonb_build_object(
            'targetType', 'custom', 'linkType', 'custom', 'customScheme', 'path',
            'customAddress', route, 'url', '/' || route
          ));
        END IF;
        IF node ? 'root' THEN
          RETURN jsonb_set(node, '{root}', pg_temp.retire_rich_text_route_links(node->'root', routes));
        END IF;
        IF jsonb_typeof(node->'children') = 'array' THEN
          RETURN jsonb_set(node, '{children}', pg_temp.retire_rich_text_route_links(node->'children', routes));
        END IF;
        RETURN node;
      ELSE
        RETURN node;
    END CASE;
  END;
  $$;

  DO $$
  DECLARE
    rich_text_column record;
    routes jsonb;
  BEGIN
    SELECT jsonb_object_agg(id, route) INTO routes FROM retired_route_pages;
    IF routes IS NULL THEN RETURN; END IF;
    FOR rich_text_column IN
      SELECT table_name, column_name FROM information_schema.columns
      WHERE table_schema = 'public' AND data_type = 'jsonb'
    LOOP
      EXECUTE format(
        'UPDATE public.%1$I SET %2$I = pg_temp.retire_rich_text_route_links(%2$I, $1)
          WHERE %2$I ? ''root'' AND %2$I IS DISTINCT FROM pg_temp.retire_rich_text_route_links(%2$I, $1)',
        rich_text_column.table_name, rich_text_column.column_name
      ) USING routes;
    END LOOP;
  END;
  $$;

  -- These references cannot be expressed as a custom URL in their existing fields.
  DO $$
  DECLARE
    reference record;
    has_reference boolean;
  BEGIN
    FOR reference IN
      SELECT DISTINCT relation.relname AS table_name, attribute.attname AS column_name
      FROM pg_constraint AS constraint_info
      JOIN pg_class AS relation ON relation.oid = constraint_info.conrelid
      JOIN pg_namespace AS namespace ON namespace.oid = relation.relnamespace
      JOIN pg_attribute AS attribute ON attribute.attrelid = relation.oid
        AND attribute.attnum = constraint_info.conkey[1]
      WHERE constraint_info.contype = 'f' AND namespace.nspname = 'public'
        AND constraint_info.confrelid = 'public.pages'::regclass
        AND cardinality(constraint_info.conkey) = 1
        AND (attribute.attname = 'destination_page_id'
          OR attribute.attname = 'version_destination_page_id'
          OR (relation.relname = 'url_aliases_rels' AND attribute.attname = 'pages_id')
          OR (relation.relname = 'pages' AND attribute.attname = 'parent_id')
          OR (relation.relname = '_pages_v' AND attribute.attname = 'version_parent_id'))
    LOOP
      EXECUTE format(
        'SELECT EXISTS (SELECT 1 FROM public.%I WHERE %I IN (SELECT id FROM retired_route_pages))',
        reference.table_name, reference.column_name
      ) INTO has_reference;
      IF has_reference THEN
        RAISE EXCEPTION 'Replace references to system pages in %.% before retiring them.',
          reference.table_name, reference.column_name;
      END IF;
    END LOOP;
  END;
  $$;

  DELETE FROM public.content_listing_items
  WHERE source = 'pages' AND source_document_id IN (SELECT id FROM retired_route_pages);
  DELETE FROM public._pages_v WHERE parent_id IN (SELECT id FROM retired_route_pages);
  DELETE FROM public.pages WHERE id IN (SELECT id FROM retired_route_pages);

  ALTER TABLE public.pages DROP COLUMN system_key;
  ALTER TABLE public._pages_v DROP COLUMN version_system_key;
  `)
}

export async function down(_arguments: MigrateDownArgs): Promise<void> {
  throw new Error(
    'Retired system pages and their history can only be restored from a database backup.',
  )
}
