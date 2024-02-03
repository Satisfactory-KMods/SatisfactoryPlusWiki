ALTER TABLE "sfp-wiki"."session" ALTER COLUMN "expires" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "sfp-wiki"."user" ALTER COLUMN "emailVerified" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "sfp-wiki"."verificationToken" ALTER COLUMN "expires" SET DATA TYPE timestamp with time zone;