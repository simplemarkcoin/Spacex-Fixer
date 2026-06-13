CREATE TABLE "members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"tier" text DEFAULT 'Explorer' NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"title" text,
	"location" text,
	"member_since" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "members_email_unique" UNIQUE("email")
);
