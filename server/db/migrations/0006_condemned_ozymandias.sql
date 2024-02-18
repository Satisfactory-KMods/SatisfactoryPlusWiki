DROP TABLE IF EXISTS "sfp-wiki"."extra_recipe" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "sfp-wiki"."extra_recipe_input" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "sfp-wiki"."extra_recipe_output" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "sfp-wiki"."extra_recipe_schematics" CASCADE;--> statement-breakpoint
ALTER TABLE "sfp-wiki"."extra_informations" ADD COLUMN "consumed_in" json DEFAULT '[]'::json;--> statement-breakpoint
ALTER TABLE "sfp-wiki"."extra_informations" ADD COLUMN "produced_in" json DEFAULT '[]'::json;