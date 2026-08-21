ALTER TABLE "clients" ADD COLUMN "escalation_webhook_url" varchar(255);--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "ai_paused_at" timestamp with time zone;