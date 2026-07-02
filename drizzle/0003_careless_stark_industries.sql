CREATE TABLE "organization_invite_channel" (
	"id" text PRIMARY KEY NOT NULL,
	"invite_id" text NOT NULL,
	"channel_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organization_invite" ADD COLUMN "role" text DEFAULT 'member' NOT NULL;--> statement-breakpoint
ALTER TABLE "organization_invite_channel" ADD CONSTRAINT "organization_invite_channel_invite_id_organization_invite_id_fk" FOREIGN KEY ("invite_id") REFERENCES "public"."organization_invite"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_invite_channel" ADD CONSTRAINT "organization_invite_channel_channel_id_organization_channel_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."organization_channel"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "organization_invite_channel_invite_channel_idx" ON "organization_invite_channel" USING btree ("invite_id","channel_id");--> statement-breakpoint
CREATE INDEX "organization_invite_channel_invite_id_idx" ON "organization_invite_channel" USING btree ("invite_id");--> statement-breakpoint
CREATE INDEX "organization_invite_channel_channel_id_idx" ON "organization_invite_channel" USING btree ("channel_id");