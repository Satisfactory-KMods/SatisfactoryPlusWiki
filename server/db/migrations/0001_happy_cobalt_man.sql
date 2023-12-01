ALTER TABLE "sfp-wiki"."map" ALTER COLUMN "item_path" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sfp-wiki"."map" ADD COLUMN "raw_item_path" text NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sfp-wiki"."map" ADD CONSTRAINT "map_raw_item_path_items_path_fk" FOREIGN KEY ("raw_item_path") REFERENCES "sfp-wiki"."items"("path") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
