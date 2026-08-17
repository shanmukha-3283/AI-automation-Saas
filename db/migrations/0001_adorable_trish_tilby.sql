CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"twilio_account_sid" varchar(255),
	"twilio_auth_token" varchar(255),
	"twilio_phone_number" varchar(50),
	"system_prompt" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "clients_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "leads" DROP CONSTRAINT "leads_email_unique";--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "client_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "client_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "client_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_client_id_email_unique" UNIQUE("client_id","email");--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_client_id_phone_unique" UNIQUE("client_id","phone");