CREATE SCHEMA "orakel";
--> statement-breakpoint
CREATE TABLE "orakel"."alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"ts" timestamp with time zone NOT NULL,
	"coin" text,
	"kind" text NOT NULL,
	"dedupe_key" text NOT NULL,
	"payload" jsonb NOT NULL,
	"sent_to" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orakel"."runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"finished_at" timestamp with time zone,
	"trigger" text NOT NULL,
	"status" text DEFAULT 'running' NOT NULL,
	"notes" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orakel"."series" (
	"key" text NOT NULL,
	"ts" timestamp with time zone NOT NULL,
	"value" double precision NOT NULL,
	"source" text NOT NULL,
	CONSTRAINT "series_key_ts_pk" PRIMARY KEY("key","ts")
);
--> statement-breakpoint
CREATE TABLE "orakel"."snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"run_id" integer NOT NULL,
	"ts" timestamp with time zone NOT NULL,
	"coin" text NOT NULL,
	"context" jsonb NOT NULL,
	"signals" jsonb NOT NULL,
	"pegel" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orakel"."state" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX "series_key_ts_idx" ON "orakel"."series" USING btree ("key","ts");--> statement-breakpoint
CREATE INDEX "snapshots_coin_ts_idx" ON "orakel"."snapshots" USING btree ("coin","ts");