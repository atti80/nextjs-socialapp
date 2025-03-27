"use server";

import { eq, desc, getTableColumns, inArray } from "drizzle-orm";
import { db } from "../db/db";
import { Comment, Notification, Post, User } from "../db/schema";
import { getUserID } from "./user.action";

export async function getNotifications() {
  try {
    const userId = await getUserID();
    if (!userId) return [];

    const notifications = await db
      .select({
        ...getTableColumns(Notification),
        creatorId: User.id,
        creatorName: User.name,
        creatorUsername: User.username,
        creatorImage: User.image,
        postId: Post.id,
        postContent: Post.content,
        postImage: Post.image,
        commentId: Comment.id,
        commentContent: Comment.content,
        commentCreatedAt: Comment.createdAt,
      })
      .from(Notification)
      .leftJoin(User, eq(Notification.creatorId, User.id))
      .leftJoin(Post, eq(Notification.postId, Post.id))
      .leftJoin(Comment, eq(Notification.commentId, Comment.id))
      .where(eq(Notification.userId, userId))
      .orderBy(desc(Notification.createdAt));

    return notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw new Error("Failed to fetch notifications");
  }
}

export async function markNotificationsAsRead(notificationIds: number[]) {
  try {
    await db
      .update(Notification)
      .set({ read: true })
      .where(inArray(Notification.id, notificationIds));

    return { success: true };
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return { success: false };
  }
}
