"use server";

import { Post } from "@/db/schema";
import { db } from "../db/db";
import { getUserID } from "./user.action";
import { revalidatePath } from "next/cache";

export const createPost = async (content: string, imageUrl: string) => {
  try {
    const userId = await getUserID();

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
