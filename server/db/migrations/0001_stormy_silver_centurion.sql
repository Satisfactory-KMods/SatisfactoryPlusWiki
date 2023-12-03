ALTER TABLE "sfp-wiki"."extra_recipe_output" DROP CONSTRAINT "extra_recipe_output_item_path_items_path_fk";
--> statement-breakpoint
ALTER TABLE "sfp-wiki"."recipes_output" DROP CONSTRAINT "recipes_output_item_path_items_path_fk";
--> statement-breakpoint
ALTER TABLE "sfp-wiki"."buildables" ADD COLUMN "building_path" text NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "building_path_idx" ON "sfp-wiki"."buildables" ("building_path");--> statement-breakpoint
ALTER TABLE "sfp-wiki"."buildables" ADD CONSTRAINT "buildables_building_path_unique" UNIQUE("building_path");