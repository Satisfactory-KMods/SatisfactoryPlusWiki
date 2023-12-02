CREATE TABLE IF NOT EXISTS "sfp-wiki"."extra_recipe_schematics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"extra_recipe" uuid NOT NULL,
	"item_path" text NOT NULL,
	CONSTRAINT "extra_recipe_schematics_extra_recipe_item_path_unique" UNIQUE("extra_recipe","item_path")
);
--> statement-breakpoint
ALTER TABLE "sfp-wiki"."extra_recipe_input" DROP CONSTRAINT "extra_recipe_input_item_path_schematics_path_fk";
--> statement-breakpoint
ALTER TABLE "sfp-wiki"."extra_recipe_input" ADD COLUMN "amount" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "sfp-wiki"."extra_recipe_input" ADD COLUMN "time" numeric NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sfp-wiki"."extra_recipe_input" ADD CONSTRAINT "extra_recipe_input_item_path_items_path_fk" FOREIGN KEY ("item_path") REFERENCES "sfp-wiki"."items"("path") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sfp-wiki"."extra_recipe_schematics" ADD CONSTRAINT "extra_recipe_schematics_extra_recipe_extra_recipe_id_fk" FOREIGN KEY ("extra_recipe") REFERENCES "sfp-wiki"."extra_recipe"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sfp-wiki"."extra_recipe_schematics" ADD CONSTRAINT "extra_recipe_schematics_item_path_schematics_path_fk" FOREIGN KEY ("item_path") REFERENCES "sfp-wiki"."schematics"("path") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
