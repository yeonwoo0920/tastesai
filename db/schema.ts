import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const userState = sqliteTable("user_state", {
  userId: text("user_id").primaryKey(),
  payload: text("payload").notNull().default("{}"),
  updatedAt: integer("updated_at").notNull(),
});

export const publicPosts = sqliteTable("public_posts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(), authorName: text("author_name").notNull(),
  community: text("community").notNull(), kind: text("kind").notNull().default("잡담"),
  title: text("title").notNull().default("제목 없음"),
  body: text("body").notNull(), images: text("images").notNull().default("[]"),
  tags: text("tags").notNull().default("[]"), createdAt: integer("created_at").notNull(),
});

export const postComments = sqliteTable("post_comments", {
  id: text("id").primaryKey(), postId: text("post_id").notNull(),
  userId: text("user_id").notNull(), authorName: text("author_name").notNull(),
  body: text("body").notNull(), createdAt: integer("created_at").notNull(),
});

export const communities = sqliteTable("communities", {
  id: text("id").primaryKey(),
  ownerUserId: text("owner_user_id").notNull(),
  name: text("name").notNull().unique(),
  work: text("work").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  color: text("color").notNull(),
  accent: text("accent").notNull(),
  coverImage: text("cover_image"),
  createdAt: integer("created_at").notNull(),
});
