ALTER TABLE "sfp-wiki"."produced_in" DROP CONSTRAINT "produced_in_building_path_buildables_path_fk";
--> statement-breakpoint
ALTER TABLE "sfp-wiki"."extra_informations" ALTER COLUMN "consumed_in" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sfp-wiki"."extra_informations" ALTER COLUMN "produced_in" SET NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sfp-wiki"."produced_in" ADD CONSTRAINT "produced_in_building_path_buildables_building_path_fk" FOREIGN KEY ("building_path") REFERENCES "sfp-wiki"."buildables"("building_path") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
