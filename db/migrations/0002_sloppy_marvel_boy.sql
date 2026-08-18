CREATE TYPE "public"."client_role" AS ENUM('superadmin', 'tenant');--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "role" "client_role" DEFAULT 'tenant' NOT NULL;