"use server";

import { db } from "@/db/db";
import { Follow, InsertUser, SelectUser, User } from "@/db/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getTableColumns, eq } from "drizzle-orm";

export const syncUser = async () => {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) return;

    const existingUser = await getUserByClerkId(userId);
    if (existingUser) {
      console.log(
        `syncUser(): User already exists ${existingUser.username}, ${existingUser.clerkId}`
      );
      return;
    }

    const dbUser: InsertUser = {
      username:
        user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
      email: user.emailAddresses ? user.emailAddresses[0].emailAddress : "",
      name: `${user.firstName || ""} ${user.lastName || ""}`,
      clerkId: userId,
      image: user.imageUrl,
    };

    const createUserResult = await createUser(dbUser);
    const newUser = createUserResult[0];
    console.log(
      `syncUser(): User created ${newUser.username}, ${newUser.clerkId}`
    );
  } catch (error) {
    console.log(`Error in syncUser(): ${error}`);
  }
};

export async function createUser(data: InsertUser): Promise<Array<SelectUser>> {
  return await db.insert(User).values(data).returning();
}

export async function updateUser(
  id: SelectUser["id"],
  data: Partial<Omit<SelectUser, "id" | "createdAt" | "updatedAt">>
) {
  await db.update(User).set(data).where(eq(User.id, id));
}

export interface UserWithFollowCounts extends SelectUser {
  followerCount: number;
  followingCount: number;
}

export async function getUserByClerkId(
  id: SelectUser["clerkId"]
): Promise<UserWithFollowCounts | null> {
  const users = await db
    .select({
      ...getTableColumns(User),
      followerCount: db.$count(Follow, eq(Follow.followingId, User.id)),
      followingCount: db.$count(Follow, eq(Follow.followerId, User.id)),
    })
    .from(User)
    .where(eq(User.clerkId, id));

  if (users.length === 0) return null;
  return users[0];
}

export const getUserID = async () => {
  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized user!");

  const user = await getUserByClerkId(userId);

  if (!user) throw new Error("User not found!");

  return user.id;
};
