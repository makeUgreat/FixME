SET ROLE "fixme_corrections_ddl";
--> statement-breakpoint
CREATE SCHEMA IF NOT EXISTS "corrections";
--> statement-breakpoint
CREATE TABLE "corrections"."corrections" (
	"id" text PRIMARY KEY NOT NULL,
	"original_text" text NOT NULL,
	"corrected_text" text NOT NULL,
	"feedback" jsonb NOT NULL,
	"mistakes" jsonb NOT NULL,
	"metadata_id" text NOT NULL,
	"model" text NOT NULL,
	"provider_metadata" jsonb NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"metadata_created_at" timestamp with time zone NOT NULL,
	"metadata_updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
GRANT USAGE ON SCHEMA "corrections" TO "fixme_corrections_ro";
--> statement-breakpoint
GRANT SELECT ON ALL TABLES IN SCHEMA "corrections" TO "fixme_corrections_ro";
--> statement-breakpoint
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA "corrections" TO "fixme_corrections_rw";
--> statement-breakpoint
ALTER DEFAULT PRIVILEGES FOR ROLE "fixme_corrections_ddl" IN SCHEMA "corrections" GRANT SELECT ON TABLES TO "fixme_corrections_ro";
--> statement-breakpoint
ALTER DEFAULT PRIVILEGES FOR ROLE "fixme_corrections_ddl" IN SCHEMA "corrections" GRANT INSERT, UPDATE, DELETE ON TABLES TO "fixme_corrections_rw";
--> statement-breakpoint
RESET ROLE;
