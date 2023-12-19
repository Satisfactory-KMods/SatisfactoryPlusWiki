CREATE TABLE IF NOT EXISTS "sfp-wiki"."mapping" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"data_id" text,
	"type" text NOT NULL,
	CONSTRAINT "mapping_data_id_unique" UNIQUE("data_id")
);
--> statement-breakpoint
DROP INDEX IF EXISTS "name_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "building_path_idx";