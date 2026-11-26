import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_admin_notice_startsat_tz" AS ENUM('Europe/Warsaw');
  CREATE TYPE "public"."enum_admin_notice_endsat_tz" AS ENUM('Europe/Warsaw');
  CREATE TABLE "admin_notice" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT false,
  	"message" varchar,
  	"starts_at" timestamp(3) with time zone,
  	"startsat_tz" "enum_admin_notice_startsat_tz" DEFAULT 'Europe/Warsaw' NOT NULL,
  	"ends_at" timestamp(3) with time zone,
  	"endsat_tz" "enum_admin_notice_endsat_tz" DEFAULT 'Europe/Warsaw' NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  INSERT INTO "admin_notice" ("enabled", "updated_at", "created_at") VALUES (false, now(), now());
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "admin_notice" CASCADE;
  DROP TYPE "public"."enum_admin_notice_startsat_tz";
  DROP TYPE "public"."enum_admin_notice_endsat_tz";`)
}
