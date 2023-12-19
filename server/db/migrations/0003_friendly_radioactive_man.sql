ALTER TABLE "sfp-wiki"."mapping" ADD COLUMN "short_path" text;--> statement-breakpoint
ALTER TABLE "sfp-wiki"."mapping" ADD CONSTRAINT "mapping_short_path_unique" UNIQUE("short_path");