CREATE SCHEMA "sfp-wiki";
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "data_type" AS ENUM('buildable', 'recipe', 'cleaner', 'schematic', 'informations', 'itemDescriptor', 'food', 'resourceMap', 'researchTree');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "desc_type" AS ENUM('0', '1', '2', '3', '4', '5');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "item_form" AS ENUM('0', '1', '2', '3', '4', '5');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "resource_node_type" AS ENUM('deposits', 'resourceWells', 'geysers', 'lootChests', 'pickup', 'resourceNodes');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "schematic_type" AS ENUM('0', '1', '2', '3', '4', '5', '6', '7', '8', '9');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sfp-wiki"."buildables" (
	"path" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"image" text NOT NULL,
	"is_vehicle" boolean NOT NULL,
	"is_cleaner" boolean NOT NULL,
	"is_miner" boolean NOT NULL,
	"is_modul" boolean NOT NULL,
	"is_hatchery" boolean NOT NULL,
	"is_hatchery_modul" boolean NOT NULL,
	"power_consume" numeric NOT NULL,
	"descriptor_type" "desc_type" NOT NULL,
	"gas_color" varchar(8) NOT NULL,
	"fluid_color" varchar(8) NOT NULL,
	"radio" numeric NOT NULL,
	"radio_active" boolean NOT NULL,
	"can_delete" boolean NOT NULL,
	"energy_value" numeric NOT NULL,
	"stack_size" integer NOT NULL,
	"category" text NOT NULL,
	"subCategory" text NOT NULL,
	"form" "item_form" NOT NULL,
	"data_type" "data_type" NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sfp-wiki"."cleaner" (
	"path" text PRIMARY KEY NOT NULL,
	"image" text NOT NULL,
	"name" text NOT NULL,
	"data_type" "data_type" NOT NULL,
	"description" text NOT NULL,
	"schematic" text NOT NULL,
	"in_fluid" text NOT NULL,
	"out_fluid" text,
	"in_amount" integer NOT NULL,
	"out_amount" integer NOT NULL,
	"filter_item" text NOT NULL,
	"filter_need" boolean NOT NULL,
	"filter_time" numeric NOT NULL,
	"filter_amount" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sfp-wiki"."cleaner_bypass" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cleaner_path" text NOT NULL,
	"item_path" text NOT NULL,
	"time" numeric NOT NULL,
	"amount" integer NOT NULL,
	CONSTRAINT "cleaner_bypass_cleaner_path_item_path_unique" UNIQUE("cleaner_path","item_path")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sfp-wiki"."items" (
	"path" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"gas_color" varchar(8) NOT NULL,
	"fluid_color" varchar(8) NOT NULL,
	"can_be_sink" boolean NOT NULL,
	"sink_points" numeric NOT NULL,
	"radio" numeric NOT NULL,
	"radio_active" boolean NOT NULL,
	"descriptor_type" "desc_type" NOT NULL,
	"can_delete" boolean NOT NULL,
	"energy_value" numeric NOT NULL,
	"form" "item_form" NOT NULL,
	"stack_size" integer NOT NULL,
	"item_type_information" json NOT NULL,
	"image" text NOT NULL,
	"category" text NOT NULL,
	"subCategory" text NOT NULL,
	"data_type" "data_type" NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sfp-wiki"."produced_in" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipe_path" text NOT NULL,
	"building_path" text NOT NULL,
	CONSTRAINT "produced_in_recipe_path_building_path_unique" UNIQUE("recipe_path","building_path")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sfp-wiki"."recipes" (
	"path" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"image" text NOT NULL,
	"category" text NOT NULL,
	"duration" numeric NOT NULL,
	"manuel_duration" numeric NOT NULL,
	"is_alternate" boolean NOT NULL,
	"data_type" "data_type" NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sfp-wiki"."recipes_input" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipe_path" text NOT NULL,
	"item_path" text NOT NULL,
	"amount" integer NOT NULL,
	CONSTRAINT "recipes_input_recipe_path_item_path_unique" UNIQUE("recipe_path","item_path")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sfp-wiki"."recipes_output" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipe_path" text NOT NULL,
	"item_path" text NOT NULL,
	"amount" integer NOT NULL,
	CONSTRAINT "recipes_output_recipe_path_item_path_unique" UNIQUE("recipe_path","item_path")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sfp-wiki"."research_tree" (
	"path" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"image" text NOT NULL,
	"tree_unlocks" json NOT NULL,
	"data_type" "data_type" NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sfp-wiki"."research_tree_nodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tree_path" text NOT NULL,
	"schematic_path" text NOT NULL,
	"coordinates" json NOT NULL,
	"unhidden_by" json DEFAULT '[]'::json NOT NULL,
	"nodes_to_unhide" json DEFAULT '[]'::json NOT NULL,
	"parents" json DEFAULT '[]'::json NOT NULL,
	CONSTRAINT "research_tree_nodes_tree_path_schematic_path_unique" UNIQUE("tree_path","schematic_path")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sfp-wiki"."research_tree_schematics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tree_path" text NOT NULL,
	"schematic_path" text NOT NULL,
	CONSTRAINT "research_tree_schematics_tree_path_schematic_path_unique" UNIQUE("tree_path","schematic_path")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sfp-wiki"."recipe_unlocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"schematic_path" text NOT NULL,
	"recipe_path" text NOT NULL,
	CONSTRAINT "recipe_unlocks_schematic_path_recipe_path_unique" UNIQUE("schematic_path","recipe_path")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sfp-wiki"."scanner_unlocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"schematic_path" text NOT NULL,
	"item_path" text NOT NULL,
	CONSTRAINT "scanner_unlocks_schematic_path_item_path_unique" UNIQUE("schematic_path","item_path")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sfp-wiki"."schematics" (
	"path" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"image" text NOT NULL,
	"small_image" text NOT NULL,
	"category" text NOT NULL,
	"sub_category" text NOT NULL,
	"type" "schematic_type" NOT NULL,
	"tier" integer NOT NULL,
	"time" numeric NOT NULL,
	"hand_slots" integer NOT NULL,
	"inventory_slots" integer NOT NULL,
	"data_type" "data_type" NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sfp-wiki"."schematic_costs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"schematic_path" text NOT NULL,
	"item_path" text NOT NULL,
	"amount" integer NOT NULL,
	CONSTRAINT "schematic_costs_schematic_path_item_path_unique" UNIQUE("schematic_path","item_path")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sfp-wiki"."sub_schematics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"schematic_path" text NOT NULL,
	"sub_schematic_path" text NOT NULL,
	CONSTRAINT "sub_schematics_sub_schematic_path_schematic_path_unique" UNIQUE("sub_schematic_path","schematic_path")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sfp-wiki"."account" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT account_provider_providerAccountId_pk PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sfp-wiki"."session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sfp-wiki"."user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"image" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sfp-wiki"."verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT verificationToken_identifier_token_pk PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sfp-wiki"."map" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_path" text NOT NULL,
	"type" "resource_node_type" NOT NULL,
	"x" numeric NOT NULL,
	"y" numeric NOT NULL,
	"z" numeric NOT NULL,
	"purity" integer NOT NULL,
	"item_amounts" json NOT NULL,
	"satelites" json NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sfp-wiki"."cleaner" ADD CONSTRAINT "cleaner_schematic_schematics_path_fk" FOREIGN KEY ("schematic") REFERENCES "sfp-wiki"."schematics"("path") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sfp-wiki"."cleaner" ADD CONSTRAINT "cleaner_in_fluid_items_path_fk" FOREIGN KEY ("in_fluid") REFERENCES "sfp-wiki"."items"("path") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sfp-wiki"."cleaner" ADD CONSTRAINT "cleaner_out_fluid_items_path_fk" FOREIGN KEY ("out_fluid") REFERENCES "sfp-wiki"."items"("path") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sfp-wiki"."cleaner" ADD CONSTRAINT "cleaner_filter_item_items_path_fk" FOREIGN KEY ("filter_item") REFERENCES "sfp-wiki"."items"("path") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sfp-wiki"."cleaner_bypass" ADD CONSTRAINT "cleaner_bypass_cleaner_path_cleaner_path_fk" FOREIGN KEY ("cleaner_path") REFERENCES "sfp-wiki"."cleaner"("path") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sfp-wiki"."cleaner_bypass" ADD CONSTRAINT "cleaner_bypass_item_path_items_path_fk" FOREIGN KEY ("item_path") REFERENCES "sfp-wiki"."items"("path") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sfp-wiki"."produced_in" ADD CONSTRAINT "produced_in_recipe_path_recipes_path_fk" FOREIGN KEY ("recipe_path") REFERENCES "sfp-wiki"."recipes"("path") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sfp-wiki"."produced_in" ADD CONSTRAINT "produced_in_building_path_buildables_path_fk" FOREIGN KEY ("building_path") REFERENCES "sfp-wiki"."buildables"("path") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sfp-wiki"."recipes_input" ADD CONSTRAINT "recipes_input_recipe_path_recipes_path_fk" FOREIGN KEY ("recipe_path") REFERENCES "sfp-wiki"."recipes"("path") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sfp-wiki"."recipes_input" ADD CONSTRAINT "recipes_input_item_path_items_path_fk" FOREIGN KEY ("item_path") REFERENCES "sfp-wiki"."items"("path") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sfp-wiki"."recipes_output" ADD CONSTRAINT "recipes_output_recipe_path_recipes_path_fk" FOREIGN KEY ("recipe_path") REFERENCES "sfp-wiki"."recipes"("path") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sfp-wiki"."recipes_output" ADD CONSTRAINT "recipes_output_item_path_items_path_fk" FOREIGN KEY ("item_path") REFERENCES "sfp-wiki"."items"("path") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sfp-wiki"."research_tree_nodes" ADD CONSTRAINT "research_tree_nodes_tree_path_research_tree_path_fk" FOREIGN KEY ("tree_path") REFERENCES "sfp-wiki"."research_tree"("path") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sfp-wiki"."research_tree_nodes" ADD CONSTRAINT "research_tree_nodes_schematic_path_schematics_path_fk" FOREIGN KEY ("schematic_path") REFERENCES "sfp-wiki"."schematics"("path") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sfp-wiki"."research_tree_schematics" ADD CONSTRAINT "research_tree_schematics_tree_path_research_tree_path_fk" FOREIGN KEY ("tree_path") REFERENCES "sfp-wiki"."research_tree"("path") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sfp-wiki"."research_tree_schematics" ADD CONSTRAINT "research_tree_schematics_schematic_path_schematics_path_fk" FOREIGN KEY ("schematic_path") REFERENCES "sfp-wiki"."schematics"("path") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sfp-wiki"."recipe_unlocks" ADD CONSTRAINT "recipe_unlocks_schematic_path_schematics_path_fk" FOREIGN KEY ("schematic_path") REFERENCES "sfp-wiki"."schematics"("path") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sfp-wiki"."recipe_unlocks" ADD CONSTRAINT "recipe_unlocks_recipe_path_recipes_path_fk" FOREIGN KEY ("recipe_path") REFERENCES "sfp-wiki"."recipes"("path") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sfp-wiki"."scanner_unlocks" ADD CONSTRAINT "scanner_unlocks_schematic_path_schematics_path_fk" FOREIGN KEY ("schematic_path") REFERENCES "sfp-wiki"."schematics"("path") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sfp-wiki"."scanner_unlocks" ADD CONSTRAINT "scanner_unlocks_item_path_items_path_fk" FOREIGN KEY ("item_path") REFERENCES "sfp-wiki"."items"("path") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sfp-wiki"."schematic_costs" ADD CONSTRAINT "schematic_costs_schematic_path_schematics_path_fk" FOREIGN KEY ("schematic_path") REFERENCES "sfp-wiki"."schematics"("path") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sfp-wiki"."schematic_costs" ADD CONSTRAINT "schematic_costs_item_path_items_path_fk" FOREIGN KEY ("item_path") REFERENCES "sfp-wiki"."items"("path") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sfp-wiki"."sub_schematics" ADD CONSTRAINT "sub_schematics_schematic_path_schematics_path_fk" FOREIGN KEY ("schematic_path") REFERENCES "sfp-wiki"."schematics"("path") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sfp-wiki"."sub_schematics" ADD CONSTRAINT "sub_schematics_sub_schematic_path_schematics_path_fk" FOREIGN KEY ("sub_schematic_path") REFERENCES "sfp-wiki"."schematics"("path") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sfp-wiki"."account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "sfp-wiki"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sfp-wiki"."session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "sfp-wiki"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sfp-wiki"."map" ADD CONSTRAINT "map_item_path_items_path_fk" FOREIGN KEY ("item_path") REFERENCES "sfp-wiki"."items"("path") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
