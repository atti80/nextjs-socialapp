import {
  index,
  uniqueIndex,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  pgEnum,
  boolean,
  primaryKey,
} from "drizzle-orm/pg-core";

// columns.helpers.ts
const timestamps = {
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().$onUpdate(() => new Date()),
};

export const notificationType = pgEnum("notificationType", [
  "like",
  "comment",
  "follow",
]);

export const User = pgTable("userTable", {
  id: serial().primaryKey(),
  username: text().notNull().unique(),
  email: text().notNull().unique(),
  clerkId: text().notNull().unique(),
  name: text(),
  bio: text(),
  location: text(),
  website: text(),
  image: text(),
  // column1: integer.array()
  // column2: integer.$type<12 | 24>()      <-- can only be 12 or 24
  // column3: integer.$default(() => { ... })   <-- run function on insert  integer.$default(() => { Math.random() })
  ...timestamps,
});

export const Post = pgTable("postTable", {
  id: serial().primaryKey(),
  authorId: integer()
    .notNull()
    .references(() => User.id, { onDelete: "cascade" }),
  content: text(),
  image: text(),
  ...timestamps,
});

export const Comment = pgTable(
  "commentTable",
  {
    id: serial().primaryKey(),
    content: text(),
    authorId: integer()
      .notNull()
      .references(() => User.id, { onDelete: "cascade" }),
    postId: integer()
      .notNull()
      .references(() => Post.id, { onDelete: "cascade" }),
    createdAt: timestamp().defaultNow().notNull(),
  },
  (table) => [index("author_post_Idx").on(table.authorId, table.postId)]
  /* 
  (table) => [
    index("author_post_Idx").on(table.authorId, table.postId),
    uniqueIndex("ui123_idx").on(col1, col2, ...),
    ...
  ]
  }
  */
);

export const Like = pgTable(
  "likeTable",
  {
    id: serial().primaryKey(),
    userId: integer()
      .notNull()
      .references(() => User.id, { onDelete: "cascade" }),
    postId: integer()
      .notNull()
      .references(() => Post.id, { onDelete: "cascade" }),
    createdAt: timestamp().defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("user_post_Idx").on(table.userId, table.postId),
    /*
    -- primary key with 2 columns:
    primaryKey({ columns: [table.userId, table.postId] }),
    */
  ]
);

export const Follow = pgTable(
  "followTable",
  {
    followerId: integer()
      .notNull()
      .references(() => User.id, { onDelete: "cascade" }),
    followingId: integer()
      .notNull()
      .references(() => User.id, { onDelete: "cascade" }),
    createdAt: timestamp().defaultNow().notNull(),
  },
  (table) => [unique().on(table.followerId, table.followingId)]
);

export const Notification = pgTable(
  "notificationTable",
  {
    id: serial().primaryKey(),
    userId: integer()
      .notNull()
      .references(() => User.id, { onDelete: "cascade" }),
    creatorId: integer()
      .notNull()
      .references(() => User.id, { onDelete: "cascade" }),
    type: notificationType(),
    read: boolean().default(false),
    postId: integer().references(() => Post.id, { onDelete: "cascade" }),
    commentId: integer().references(() => Comment.id, { onDelete: "cascade" }),
    createdAt: timestamp().defaultNow().notNull(),
  },
  (t) => [index("userId_createdAt_Idx").on(t.userId, t.createdAt)]
);

export type InsertUser = typeof User.$inferInsert;
export type SelectUser = typeof User.$inferSelect;
