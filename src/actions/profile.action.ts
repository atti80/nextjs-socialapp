"use server";

import { db } from "@/db/db";
import {
  desc,
  eq,
  exists,
  getTableColumns,
  and,
  inArray,
  isNotNull,
} from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getUserID } from "./user.action";
import { Comment, Follow, Like, Post, User } from "@/db/schema";

export async function getProfileByUsername(username: string) {
  try {
    const users = await db
      .select({
        ...getTableColumns(User),
        followerCount: db.$count(Follow, eq(Follow.followingId, User.id)),
        followingCount: db.$count(Follow, eq(Follow.followerId, User.id)),
        postCount: db.$count(Post, eq(Post.authorId, User.id)),
      })
      .from(User)
      .where(eq(User.username, username));

    return users[0];
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw new Error("Failed to fetch profile");
  }
}

export async function getUserPosts(userId: number) {
  try {
    const posts = await db.query.Post.findMany({
      where: eq(Post.authorId, userId),
      with: {
        author: {
          columns: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        comments: {
          with: {
            author: {
              columns: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
          orderBy: [Comment.createdAt],
        },
        likes: {
          columns: {
            userId: true,
          },
        },
      },
      orderBy: [desc(Post.createdAt)],
    });

    return posts;
  } catch (error) {
    console.error("Error fetching user posts:", error);
    throw new Error("Failed to fetch user posts");
  }
}

export async function getUserLikedPosts(userId: number) {
  try {
    const likedPosts = await db.query.Post.findMany({
      where: inArray(
        Post.id,
        db
          .select({ id: Like.postId })
          .from(Like)
          .where(and(eq(Like.userId, userId), isNotNull(Like.postId)))
      ),
      with: {
        author: {
          columns: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        comments: {
          with: {
            author: {
              columns: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
          orderBy: [Comment.createdAt],
        },
        likes: {
          columns: {
            userId: true,
          },
        },
      },
      orderBy: [desc(Post.createdAt)],
    });

    return likedPosts;
  } catch (error) {
    console.error("Error fetching liked posts:", error);
    throw new Error("Failed to fetch liked posts");
  }
}

export async function updateProfile(formData: FormData) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    const name = formData.get("name") as string;
    const bio = formData.get("bio") as string;
    const location = formData.get("location") as string;
    const website = formData.get("website") as string;

    const users = await db
      .update(User)
      .set({
        name,
        bio,
        location,
        website,
      })
      .where(eq(User.clerkId, clerkId))
      .returning();

    if (users.length === 0) throw new Error("Cannot find user");
    const user = users[0];

    revalidatePath("/profile");
    return { success: true, user };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

export async function isFollowing(userId: number) {
  try {
    const currentUserId = await getUserID();
    if (!currentUserId) return false;

    const follow = await db.query.Follow.findFirst({
      where: and(
        eq(Follow.followerId, currentUserId),
        eq(Follow.followingId, userId)
      ),
    });

    return !!follow;
  } catch (error) {
    console.error("Error checking follow status:", error);
    return false;
  }
}
