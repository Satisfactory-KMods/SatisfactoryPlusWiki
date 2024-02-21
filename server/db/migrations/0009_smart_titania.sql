ALTER TABLE "sfp-wiki"."buildables" RENAME COLUMN "subCategory" TO "sub_category";--> statement-breakpoint
ALTER TABLE "sfp-wiki"."items" RENAME COLUMN "subCategory" TO "sub_category";--> statement-breakpoint
ALTER TABLE "sfp-wiki"."account" RENAME COLUMN "providerAccountId" TO "provider_account_id";--> statement-breakpoint
ALTER TABLE "sfp-wiki"."session" RENAME COLUMN "sessionToken" TO "session_token";--> statement-breakpoint
ALTER TABLE "sfp-wiki"."user" RENAME COLUMN "emailVerified" TO "email_verified";--> statement-breakpoint
ALTER TABLE "sfp-wiki"."account" DROP CONSTRAINT "account_provider_providerAccountId_pk";--> statement-breakpoint
ALTER TABLE "sfp-wiki"."account" ADD CONSTRAINT "account_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id");--> statement-breakpoint
ALTER TABLE "sfp-wiki"."items" ADD COLUMN "modified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "sfp-wiki"."items" ADD COLUMN "used_in_schematics" json DEFAULT '[]'::json NOT NULL;