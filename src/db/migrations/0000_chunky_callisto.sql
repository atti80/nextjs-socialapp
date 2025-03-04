CREATE TYPE "public"."notificationType" AS ENUM('like', 'comment', 'follow');--> statement-breakpoint
CREATE TABLE "commentTable" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text,
	"authorId" integer NOT NULL,
	"postId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "followTable" (
	"followerId" integer NOT NULL,
	"followingId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "followTable_followerId_followingId_unique" UNIQUE("followerId","followingId")
);
--> statement-breakpoint
CREATE TABLE "likeTable" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"postId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notificationTable" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"creatorId" integer NOT NULL,
	"type" "notificationType",
	"read" boolean DEFAULT false,
	"postId" integer,
	"commentId" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "postTable" (
	"id" serial PRIMARY KEY NOT NULL,
	"authorId" integer NOT NULL,
	"content" text,
	"image" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "userTable" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"clerkId" integer NOT NULL,
	"name" text,
	"bio" text,
	"location" text,
	"website" text,
	"image" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	CONSTRAINT "userTable_username_unique" UNIQUE("username"),
	CONSTRAINT "userTable_email_unique" UNIQUE("email"),
	CONSTRAINT "userTable_clerkId_unique" UNIQUE("clerkId")
);
--> statement-breakpoint
ALTER TABLE "commentTable" ADD CONSTRAINT "commentTable_authorId_userTable_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."userTable"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commentTable" ADD CONSTRAINT "commentTable_postId_postTable_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."postTable"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "followTable" ADD CONSTRAINT "followTable_followerId_userTable_id_fk" FOREIGN KEY ("followerId") REFERENCES "public"."userTable"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "followTable" ADD CONSTRAINT "followTable_followingId_userTable_id_fk" FOREIGN KEY ("followingId") REFERENCES "public"."userTable"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likeTable" ADD CONSTRAINT "likeTable_userId_userTable_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."userTable"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likeTable" ADD CONSTRAINT "likeTable_postId_postTable_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."postTable"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notificationTable" ADD CONSTRAINT "notificationTable_userId_userTable_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."userTable"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notificationTable" ADD CONSTRAINT "notificationTable_creatorId_userTable_id_fk" FOREIGN KEY ("creatorId") REFERENCES "public"."userTable"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notificationTable" ADD CONSTRAINT "notificationTable_postId_postTable_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."postTable"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notificationTable" ADD CONSTRAINT "notificationTable_commentId_commentTable_id_fk" FOREIGN KEY ("commentId") REFERENCES "public"."commentTable"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "postTable" ADD CONSTRAINT "postTable_authorId_userTable_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."userTable"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "author_post_Idx" ON "commentTable" USING btree ("authorId","postId");--> statement-breakpoint
CREATE UNIQUE INDEX "user_post_Idx" ON "likeTable" USING btree ("userId","postId");--> statement-breakpoint
CREATE INDEX "userId_createdAt_Idx" ON "notificationTable" USING btree ("userId","createdAt");