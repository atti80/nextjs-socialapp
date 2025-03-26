"use server";

import { Post, User, Comment, Like, Notification } from "@/db/schema";
import { db } from "../db/db";
import { getUserID } from "./user.action";
import { revalidatePath } from "next/cache";
import { asc, desc, eq, and } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

export const createPost = async (content: string, imageUrl: string) => {
  try {
    const userId = await getUserID();
    if (!userId) return;

    const result = await db
      .insert(Post)
      .values({
        authorId: userId,
        content: content,
        image: imageUrl,
      })
      .returning();

    if (!result || result.length === 0)
      throw new Error("Could not create new post!");

    const newPost = result[0];
    revalidatePath("/");
    return { success: true, post: newPost };
  } catch (error) {
    console.error("Failed to create new post", error);
    return { success: false, error: "Failed to create new post" };
  }
};

export const getPosts = async () => {
  try {
    const CommentAuthor = alias(User, "commentAuthor");

    const posts = await db.query.Post.findMany({
      orderBy: [desc(Post.createdAt)],
      with: {
        comments: {
          with: {
            author: {
              columns: {
                id: true,
                username: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: [asc(Comment.createdAt)],
        },
        author: {
          columns: {
            id: true,
            username: true,
            name: true,
            image: true,
          },
        },
        likes: {
          columns: {
            userId: true,
          },
        },
      },
    });

    return posts;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const toggleLike = async (postId: number) => {
  try {
    const userId = await getUserID();
    if (!userId) return;

    // check if like exists
    const existingLike = await db
      .select()
      .from(Like)
      .where(and(eq(Like.userId, userId), eq(Like.postId, postId)))
      .limit(1);

    const post = await db
      .select({ authorId: Post.authorId })
      .from(Post)
      .where(eq(Post.id, postId))
      .limit(1);

    if (post.length === 0) throw new Error("Post not found");

    if (existingLike.length > 0) {
      // unlike
      await db
        .delete(Like)
        .where(and(eq(Like.userId, userId), eq(Like.postId, postId)));
    } else {
      // like and create notification (only if liking someone else's post)
      await db.transaction(async (tx) => {
        await tx.insert(Like).values({
          userId: userId,
          postId: postId,
        });
        if (post[0].authorId !== userId) {
          await tx.insert(Notification).values({
            userId: post[0].authorId,
            creatorId: userId,
            postId: postId,
            type: "like",
          });
        }
      });
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle like:", error);
    return { success: false, error: "Failed to toggle like" };
  }
};

export const createComment = async (postId: number, content: string) => {
  try {
    const userId = await getUserID();

    if (!userId) return;
    if (!content) throw new Error("Content is required");

    const post = await db
      .select({ authorId: Post.authorId })
      .from(Post)
      .where(eq(Post.id, postId))
      .limit(1);

    if (post.length === 0) throw new Error("Post not found");

    const comment = await db.transaction(async (tx) => {
      // Create comment first
      const newComment = await tx
        .insert(Comment)
        .values({
          content: content,
          authorId: userId,
          postId: postId,
        })
        .returning();

      // Create notification if commenting on someone else's post
      if (post[0].authorId !== userId) {
        await tx.insert(Notification).values({
          type: "comment",
          userId: post[0].authorId,
          creatorId: userId,
          postId: postId,
          commentId: newComment[0].id,
        });
      }

      return newComment;
    });

    revalidatePath(`/`);
    return { success: true, comment };
  } catch (error) {
    console.error("Failed to create comment:", error);
    return { success: false, error: "Failed to create comment" };
  }
};

export const deletePost = async (postId: number) => {
  try {
    const userId = await getUserID();

    const post = await db
      .select({ authorId: Post.authorId })
      .from(Post)
      .where(eq(Post.id, postId))
      .limit(1);

    if (post.length === 0) throw new Error("Post not found");

    if (post[0].authorId !== userId)
      throw new Error("Unauthorized - no delete permission");

    await db.delete(Post).where(eq(Post.id, postId));

    revalidatePath("/"); // purge the cache
    return { success: true };
  } catch (error) {
    console.error("Failed to delete post:", error);
    return { success: false, error: "Failed to delete post" };
  }
};
