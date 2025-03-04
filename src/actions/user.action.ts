"use server";

import { createUser } from "@/db/queries/insert";
import { getUserByClerkId, getUserById } from "@/db/queries/select";
import { InsertUser } from "@/db/schema";
import { auth, currentUser } from "@clerk/nextjs/server";

export const syncUser = async () => {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) return;

    const existingUser = await getUserByClerkId(userId);
    if (existingUser.length > 0) {
      console.log(
        `syncUser(): User already exists ${existingUser[0].username}, ${existingUser[0].clerkId}`
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
